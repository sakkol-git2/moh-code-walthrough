// Guided views reuse the inspected lessons. Nothing here calls a live MOH API.
const lifecycleGuideScenarios = {
 success:'Follow the inspected registration path',
 validation:'Pause at submit validation failure',
 rollback:'Pause at Profile transaction rollback'
};
function guideRequestData(family,index){
 if(index>=8){const f=lifecycleFamilies[family];return {message:'Profile licence operation',operation_type:'ISSUE',profile_id:99,licence_ids:[f.licence-1,f.licence],note:family==='DR08'?'DR08 selects all registrations on the resolved profile; fixture assumes only new A and B.':'DR09 selects changed registrations for this operation.'};}
 if(family==='DR09')return dr09Data('legacy',index);
 return {service_code:'GDHT-TM-L',selected_decoded_fields:{traditional_medicine:{prerequisite_profile_id:42,products:[{application_type:'LOCAL',brand_name_license_id:301},{application_type:'IMPORT',brand_name_license_id:302}]}},note:'Product IDs omitted in DR08 approval product map. Other required fields/files omitted here.'};
}
function guideMainRows(family,index){
 const f=lifecycleFamilies[family];
 const parent=index===0?'Not created':index===1?'DRAFT · save pending':index<=3?'DRAFT · committed':index===4?'SUBMITTED / PAID · committed in successful payment + OPEN gate fixture':'APPROVED · committed';
 const product=index===0?'Not created':index===1?'New product save pending':'Saved B IMPORT, fields and own attachments';
 const result=index<7?'Not created':index===7?'New registration/licence/snapshot pending':'Registration, licence and snapshot committed';
 return [['Application '+f.application,parent],[f.detail,index===0?'Not created':index===1?'Prerequisite 42 pending':'Prerequisite 42 saved'],[f.products+' · B '+f.product,product],['Profile '+f.registration+' / licence '+f.licence,result],[f.snapshot,result],['Profile 99',index<7?'Illustrative existing identity candidate':index===7?'Handler enrichment pending':'Handler changes committed']];
}
function guideRegistrationFrames(family){
 if(family==='DR06'){
  return ['save','submit','approve'].flatMap(flow=>coreFlows[flow].steps.map((step,index)=>{
   const records=flowSequences[flow].records.map(record=>{
    const update=record.updates.filter(([checkpoint])=>checkpoint<=index).at(-1);
    return [record.label,update?update[1]:record.initial||'Not created yet'];
   });
   return {title:step.title,method:step.method,text:step.does,rows:records,data:sequenceData(flow,index),refs:step.refs,
    gap:flow==='approve'&&index===6,source:'#flow/'+flow+'/'+index,
    note:flow==='approve'&&index===0?'Review decision is an external input to Application. This segment assumes the request has reached REVIEW after submission.':''};
  }));
 }
 const steps=family==='DR08'?dr08Steps:dr09Steps;
 return steps.map((step,index)=>({title:step.title,method:step.method,text:step.text,rows:guideMainRows(family,index),data:{view:index<5?'Selected request fields':'Selected approval fields',data:guideRequestData(family,index)},refs:step.refs,gap:index===7,source:(family==='DR08'?'#dr08-main/':'#dr09-main/')+index,note:index===4?'This checkpoint summarizes the successful shared payment continuation. Application first commits AWAITING_PAYMENT; later confirmation resumes submission.':index===5?'Review approval is assumed as the next external decision; Application commits before Profile processes it.':''}));
}
function guideFailureFrames(family,scenario){
 if(family==='DR06'){
  const flow=scenario==='validation'?'submit':'approve';
  const id=scenario==='validation'?'documents':'product';
  const c=failureCase(flow,id);
  return ['Before failure','Failure reached — paused','Inspect the rollback outcome'].map((title,phase)=>({
   title,method:c.method,text:phase===2?c.outcome:c.failure,
   rows:c.rows.map(row=>[row[0],row[phase+1]]),data:{view:'Selected failing request/message values',data:c.input},refs:c.refs,
   halt:phase>0,source:'#flow-failure/'+flow+'/'+id+'/'+phase,note:c.condition||''
  }));
 }
 const f=lifecycleFamilies[family],validation=scenario==='validation';
 const code=family==='DR08'?'TraditionalMedicine':'HealthSupporting';
 const before=validation?[['Application '+f.application,'DRAFT · previously committed'],['B '+f.product,'Missing application_type · saved incomplete draft'],['Profile results','None for this request']]:[['Application '+f.application,'APPROVED · previously committed'],['A and B Profile results','None for this request']];
 const pending=validation?[['Application '+f.application,'Tracking/context changes pending'],['B '+f.product,'Missing application_type · validator rejects saved product'],['Profile results','None']]:[['Application '+f.application,'APPROVED remains committed'],['A result','Registration/licence/snapshot save calls reached · pending'],['B result','Injected RuntimeException while processing B · pending work']];
 const after=validation?[['Application '+f.application,'DRAFT · original tracking restored'],['B '+f.product,'Previously saved missing origin remains'],['Invoice request','Not reached by this attempt'],['Profile results','None']]:[['Application '+f.application,'APPROVED · earlier commit survives'],['A and B Profile result rows','No new committed rows from this attempt'],['Profile existing values','Pending handler changes rolled back']];
 const refs=validation?[family==='DR08'?'tmValidate':'hsValidate',family==='DR08'?'tmRequest':'hsRequest','coreSubmitValidation','runtimeBase']:['tmTx',family==='DR08'?'tmLoop':'hsHandler','runtimeBase'];
 return [before,pending,after].map((rows,index)=>({
  title:['Before the failing attempt','Failure reached — paused','Inspect the rollback outcome'][index],
  method:validation?code+'RegistrationApplicationStrategy.buildValidationProcessor → ApplicationCoreHandler.validateSubmitApplication':'BaseRegisterHandler.handle → '+code+'RegisterHandler.processLicenses',
  text:validation?'Saved B lacks required per-product origin. Submit collects the error and the common validator throws. Its pending transaction edits roll back; the previously saved incomplete draft remains.':'Injected runtime failure inside Profile while B is processed after A save calls. Both products share the BaseRegisterHandler transaction; its pending work rolls back. Earlier Application approval remains committed.',
  rows,data:{view:'Failure fixture',data:validation?{application_id:f.application,products:[{application_type:'LOCAL'},{application_type:null}]}:{application_id:f.application,source:'valid approval fixture',injected_error:'RuntimeException inside B processing'}},refs,halt:index>0,
  source:(family==='DR08'?'#dr08-main/':'#dr09-main/')+(validation?3:7),note:'Explicit source-based boundary simulation through normal transaction proxies. No live request or database rollback was executed.'
 }));
}
function guideMissingFrames(family,code){
 const service=drServiceCatalog.find(s=>s.code===code);
 const rows=lifecycleRows(family,code,2);
 return [
  {title:'Start from existing Product B',method:'Inspect saved registration and licence',text:service.name+' needs an approved target and request contract. Existing rows below form the starting fixture.',rows:lifecycleRows(family,code,0),refs:lifecycleFamilies[family].refs},
  {title:'Missing strategy — paused',method:'ApplicationStrategyFactory.getStrategy → BaseException',text:lifecycleGap(family,code)+' This isolated Application factory lookup reaches no domain writes. Earlier request validation may reject a real request first.',rows,data:{view:'Unsupported operation boundary',data:{service:code,request_dto:'Dedicated contract missing',kafka_approval:'Not emitted by this failed Application attempt'}},refs:['tmRenewAppFactory'],halt:true},
  {title:'Inspect saved rows after the boundary',method:'Application factory failure handling',text:'Existing rows remain saved. A separately injected approval with an unsupported code would make Profile’s factory throw, then the consumer catch/log and return. That is a separate entry point, not a message emitted by this failed request.',rows,data:{view:'Independent Profile boundary',data:{scenario:'hypothetical approval injected separately',result:'unsupported-code catch returns',new_profile_rows:'none from that call'}},refs:['tmRenewProfileFactory','consumer'],halt:true}
 ].map(frame=>({...frame,source:lifecycleLesson(code),data:frame.data||{view:'Existing B identity',data:lifecycleData(family)}}));
}
function lifecycleGuideFrames(family,code,scenario){
 if(code!==family)return guideMissingFrames(family,code);
 return scenario==='success'?guideRegistrationFrames(family):guideFailureFrames(family,scenario);
}
function lifecycleGuide(family,code,scenario,index){
 const frames=lifecycleGuideFrames(family,code,scenario),frame=frames[index],isMain=family===code;
 const path='#lifecycle-guide/'+family+'/'+code+'/'+scenario+'/';
 const previous=index?frames[index-1].rows:[];
 const rows=frame.rows.map(([label,value])=>{
  const before=previous.find(row=>row[0]===label)?.[1];
  return '<tr class="'+(before!==value?'sequence-row-change':'')+'"><th scope="row">'+escapeHtml(label)+'</th><td>'+escapeHtml(value)+(before!==value?'<small>'+(index?'Changed or newly shown at this checkpoint':'Starting fixture')+'</small>':'')+'</td></tr>';
 }).join('');
 const nav='<div class="choices check">'+(index?'<a class="btn light" href="'+path+(index-1)+'">Previous checkpoint</a>':'<a class="btn light" href="#lifecycle/'+family+'/'+code+'/0">Lifecycle map</a>')+(index<frames.length-1?'<a class="btn" href="'+path+(index+1)+'">'+(frame.halt?'Inspect saved-row outcome':frame.gap?'Continue with the shown resolver gap':'Next checkpoint')+'</a>':'<a class="btn light" href="'+path+'0">Restart this scenario</a>')+'</div>';
 main.innerHTML='<div class="tag">Product B / Guided lifecycle</div><h1>Follow one checkpoint at a time</h1><nav class="steps" aria-label="Guide families">'+Object.keys(lifecycleFamilies).map(key=>'<a href="#lifecycle-guide/'+key+'/'+key+'/success/0" '+(key===family?'aria-current="page"':'')+'>'+key+'</a>').join('')+'</nav><label class="field">Operation <select id="guideOperation">'+drServiceCatalog.filter(s=>s.family===family).map(s=>'<option value="'+s.code+'" '+(s.code===code?'selected':'')+'>'+s.code+' · '+s.name+'</option>').join('')+'</select></label>'+(isMain?'<label class="field">Scenario <select id="guideScenario">'+Object.entries(lifecycleGuideScenarios).map(([key,label])=>'<option value="'+key+'" '+(scenario===key?'selected':'')+'>'+label+'</option>').join('')+'</select></label>':'')+'<p><a href="#lifecycle/'+family+'/'+code+'/0">View this operation on the lifecycle map →</a></p>'+nav+'<section class="panel check guide-current" aria-live="polite"><div class="spread"><span>'+code+' · checkpoint '+(index+1)+' of '+frames.length+'</span><strong>'+(frame.halt?'Paused at failure / missing implementation':frame.gap?'Pause to inspect resolver gap':'Manual step')+'</strong></div><h2>'+frame.title+'</h2><p><code>'+escapeHtml(frame.method)+'</code></p><p>'+frame.text+'</p>'+(frame.note?'<p class="src">'+frame.note+'</p>':'')+guideERPanel(family,code,scenario,index)+'<div class="below"><section><h3>Rows at this checkpoint</h3><div class="rows" id="guideRowsLedger"><table><thead><tr><th>Row</th><th>Current state</th></tr></thead><tbody>'+rows+'</tbody></table></div><p class="src">Pending saves can still roll back. Different table labels may introduce a newly shown row. Application and Profile use separate transactions.</p></section><section id="guideKafkaPanel"><h3>'+frame.data.view+'</h3><p id="guideKafkaSelection" class="src"></p><div id="guideKafkaData">'+pre(JSON.stringify(frame.data.data,null,2))+'</div>'+'<p class="src">Selected illustrative request or decoded message fields, with fictional IDs. No Kafka send is performed by this page.</p></section></div><details class="proof"><summary>Inspect Java / SQL evidence</summary>'+sources(frame.refs)+'</details><p><a href="'+frame.source+'">Open this checkpoint’s detailed lesson →</a></p></section>'+nav+'<p class="src">There is no automatic playback. Failure scenarios stop at row inspection; choose the successful scenario explicitly to explore successful processing. Missing subservice wiring has no successful continuation. Main master type Product Number; subservice certificate/cardinality decisions remain unresolved.</p>';
 attachGuideER(family,code,scenario,index,frame);
 main.querySelector('#guideOperation').onchange=e=>{location.hash='lifecycle-guide/'+family+'/'+e.target.value+'/success/0';};
 if(isMain)main.querySelector('#guideScenario').onchange=e=>{location.hash='lifecycle-guide/'+family+'/'+code+'/'+e.target.value+'/0';};
}
