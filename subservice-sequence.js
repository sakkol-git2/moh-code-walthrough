// Source-derived boundary walkthroughs. No live request or Kafka delivery is executed.
const subserviceFlowNames={save:'Save draft',submit:'Submit',approve:'Approve application'};
function subserviceFlowFrames(service,flow){
 const family=service.family,prefix='sub'+family;
 const codeRefs=family==='DR06'?['renewCodeScope']:family==='DR08'?['tmRenewCodes','tmProfileCodes']:['hsSubCodes','hsSubProfileCodes'];
 const frame=(title,method,text,from,to,kind,refs,halt=false)=>({title,method,text,from,to,kind,refs,halt});
 if(flow==='approve')return [
  frame('Receive an independent approval fixture','ProfileKafkaConsumer.handleApplicationApproved','Start at Profile with a hypothetical valid approval envelope for an unsupported operation. This message was injected independently; the failed save or submit examples do not produce it.',0,1,'kafka',[prefix+'Consumer']),
  frame('Read the operation code','payload.getService().getCode() → LicenseStrategyFactory.getOperationStrategy','The consumer reads the code, message ID and JSON. It asks the Profile factory for an operation strategy. A declared constant alone does not add a strategy to the map.',1,2,'call',[prefix+'Consumer',...codeRefs]),
  frame('Strategy lookup fails — paused','LicenseStrategyFactory.getOperationStrategy → BaseException','No dedicated operation strategy exists in the inspected module. The isolated lookup throws Unsupported service code. No domain handler or Profile transaction has started.',2,2,'failure',[prefix+'ProfileFactory'],true),
  frame('Inspect the caught exception and saved rows','ProfileKafkaConsumer.handleApplicationApproved → catch (BaseException) → return','The consumer logs the unsupported code and returns before handleWithInbox. This catch does not rethrow. Existing B rows stay saved. A previously committed upstream approval also survives; no new registration, licence or snapshot is created by this call.',1,0,'return',[prefix+'Consumer'],true)
 ];
 const submit=flow==='submit';
 return [
  frame(submit?'Start from a hypothetical saved operation':'Prepare the operation request',submit?'ApplicationServiceImpl.submitApplication':'ApplicationController.createApplication / updateApplication',submit?'Use a hypothetical existing operation draft to inspect the shared submit boundary.':'Prepare a local operation proposal. Its dedicated server request subtype and target contract remain missing.',0,1,'http',submit?[prefix+'Submit']:[prefix+'Save']),
  frame(submit?'Load owned application and assign tracking':'Check availability or load the existing draft',submit?'getApplication → assertOpen → assignTrackingNo':'ApplicationServiceImpl.saveApplication → assertOpen / getApplicationById',submit?'This isolated submit example assumes an owned pre-existing operation application and passing earlier gates. Tracking and optional facility association are changed in memory before strategy lookup. The fixture does not claim a missing strategy can create that draft.':'For a new draft the shared service checks availability. For an update it loads the application and uses its saved service code. Earlier DTO or availability checks can reject a real request. Here we isolate the next factory call.',1,1,'call',[prefix+(submit?'Submit':'Save')]),
  frame('Look up the dedicated strategy','ApplicationStrategyFactory.getStrategy','The factory uses the operation code as a map key. DR06 subservice codes are pending; DR08/DR09 declare some operation constants but dedicated strategy beans are missing. FSC has no dedicated family code. The DR dictionary label is not a runtime service code.',1,2,'call',[prefix+'Factory',...codeRefs]),
  frame('Unsupported strategy — paused','ApplicationStrategyFactory.getStrategy → BaseException','The missing map entry throws Unsupported service type. '+(submit?'validateSubmitApplication, payment continuation and submission publishing are not reached.':'strategy.saveApplication, domain row saves and created-event publishing are not reached.'),2,2,'failure',[prefix+'Factory'],true),
  frame('Inspect the surviving rows','No dedicated domain method reached',submit?'Previously committed operation draft data and existing B results remain saved. Pre-lookup in-memory tracking/facility changes are not evidence of a committed write. No save or flush is reached in this isolated segment; persistence depends on the real caller and transaction boundary.':'No new application/detail/product rows are created by this isolated failed lookup. An existing draft and B’s original registration, licence, snapshot and files stay saved. No subservice approval message is emitted.',1,0,'return',[prefix+(submit?'Submit':'Save')],true)
 ];
}
function subserviceRuntimeLabel(service){
 if(service.family==='DR06')return 'Pending approved runtime code';
 const stem=service.family==='DR08'?'GDHT-TM':'GDHT-HS',n=Number(service.code.split('.')[1]);
 return n===1?stem+'-R':n===2?'No dedicated FSC code':n===(service.family==='DR08'?8:7)?stem+'-T':stem+'-U (section code is separate)';
}
function subserviceSequence(code,flow,index,documentIndex){
 const documents=collectSubserviceDocuments(code);
 const service=drServiceCatalog.find(s=>s.code===code),frames=subserviceFlowFrames(service,flow),step=frames[index],f=lifecycleFamilies[service.family];
 const route=i=>'#subservice-flow/'+code+'/'+flow+'/'+i;
 const lanes=flow==='approve'?['Independent Kafka fixture','Profile consumer','Profile strategy factory']:['Browser / request fixture','Application service','Application strategy factory'];
 const width=lanes.length*220;
 const exchanges=frames.map((s,i)=>{const x=(s.from+.5)*220,y=(s.to+.5)*220;return '<button class="sequence-exchange '+(i===index?'selected':i<index?'completed':'future')+(s.kind==='failure'?' branch-failure':'')+'" data-sub-step="'+i+'" aria-current="'+(i===index?'step':'false')+'" aria-label="Checkpoint '+(i+1)+': '+escapeHtml(s.title)+'"><span class="sequence-label">'+(i+1)+' · '+s.title+'</span><span class="sequence-kind">'+s.kind+'</span><svg preserveAspectRatio="none" viewBox="0 0 '+width+' 88" aria-hidden="true"><defs><marker id="sub-tip-'+i+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#315c52"/></marker></defs><path class="'+(s.kind==='kafka'?'sequence-kafka':s.kind==='return'?'sequence-return':'sequence-call')+'" d="'+(s.from===s.to?'M '+x+' 53 h 36 v 19 h -36':'M '+x+' 60 H '+y)+'" marker-end="url(#sub-tip-'+i+')"/></svg></button>';}).join('');
 const data={dictionary_code:code,runtime_code:subserviceRuntimeLabel(service),target_contract:'Missing dedicated DTO / approved target cardinality',example_existing_B:{registration_id:f.registration,license_id:f.licence},checkpoint_input:flow==='approve'?'Hypothetical independent approval; selected fields only':flow==='submit'?'Hypothetical existing owned operation draft':'Proposal only; complete request subtype not implemented',kafka:flow==='approve'?'Independent input only; no new outgoing operation':'No approval emitted by this attempt'};
 const rows=[['B registration · '+f.registration,'Previously committed; unchanged'],['B licence · '+f.licence,'Previously committed; unchanged'],['B snapshot · '+f.snapshot,'Original fields and files retained'],['Existing profile · 99','Previously committed; unchanged'],['New subservice domain rows',step.halt?'None created by isolated unsupported lookup':'No domain writes reached'],['Operation application',flow==='approve'?'Upstream APPROVED, if precommitted, survives independently':flow==='submit'?'Hypothetical previously saved draft remains; no commit demonstrated':'New: absent. Update: existing draft retained']];
 main.innerHTML='<div class="tag">'+code+' / Core flow checkpoints</div><h1>'+escapeHtml(service.name)+'</h1><p class="lead">Read the explanation first, then inspect its checkpoint diagram, Java method and saved rows. Choose the core flow you want to understand.</p><label class="field">Core flow model <select id="subserviceModel">'+Object.entries(subserviceFlowNames).map(([k,v])=>'<option value="'+k+'" '+(flow===k?'selected':'')+'>'+v+'</option>').join('')+'</select></label><p><strong>Runtime code:</strong> '+subserviceRuntimeLabel(service)+'. Example IDs are fictional. These are separate entry-point simulations using pinned source, not successful subservice execution.</p><section class="panel check" id="subserviceDocument" aria-label="Documents for this checkpoint"></section><section class="panel check sequence-section" id="subserviceSequence"><div class="spread"><h2>Interactive sequence</h2><span class="tag">Checkpoint '+(index+1)+' of '+frames.length+'</span></div><div class="choices">'+(index?'<a class="btn light" href="'+route(index-1)+'">← Previous checkpoint</a>':'<a class="btn light" href="#services/'+code+'">← Service explorer</a>')+(index<frames.length-1?'<a class="btn" href="'+route(index+1)+'">'+(step.halt?'Inspect saved rows →':'Next checkpoint →')+'</a>':'<a class="btn" href="'+route(0)+'">Restart flow</a>')+'</div><p class="src">Click an exchange to select its checkpoint. Orange dashed arrows show Kafka input. Green dashed arrows show returns. Scroll inside the diagram on a narrow screen.</p><div class="sequence-board" tabindex="0" aria-label="Subservice sequence diagram"><div class="sequence-canvas" style="width:max(100%,'+width+'px)"><div class="sequence-headers" style="grid-template-columns:repeat(3,1fr)">'+lanes.map(l=>'<span>'+l+'</span>').join('')+'</div><div class="sequence-lifelines" aria-hidden="true">'+lanes.map((_,i)=>'<span style="left:'+((i+.5)*100/3)+'%"></span>').join('')+'</div>'+exchanges+'</div></div></section><div class="lessonbody"><article class="panel"><div class="tag">'+(step.halt?'Paused at implementation boundary':'Step '+(index+1))+'</div><h2>'+step.title+'</h2><p><code>'+escapeHtml(step.method)+'</code></p><p>'+step.text+'</p><div class="transaction-box"><h3>Transaction and failure boundary</h3><p>'+ (flow==='approve'?'The unsupported-code catch returns before a domain handler starts. Existing committed rows remain.':'The factory rejects before the dedicated save or validation method. This sequence does not invent a successful commit or claim a rollback from the exception type alone.')+'</p></div></article><aside class="side"><h2>Rows after this checkpoint</h2>'+bTable(['Row','Current state'],rows)+'</aside></div><section class="panel implementation-panel"><details><summary>Inspect the implementation</summary>'+sources(step.refs)+'</details></section><section class="panel check"><h2>Request / Kafka and IDs</h2>'+pre(JSON.stringify(data,null,2))+'<p>These selected learning fields are not a request or Kafka schema. Exact new-operation IDs, mutation fields and output contracts remain unimplemented.</p></section><details class="proof"><summary>Related views (optional)</summary><div class="choices check"><a class="btn light" href="#lifecycle-guide/'+service.family+'/'+code+'/success/0">Inspect lifecycle and ER</a><a class="btn light" href="#flow/'+flow+'/0">Compare main-registration '+subserviceFlowNames[flow]+'</a></div></details><div class="actions">'+(index?'<a class="btn light" href="'+route(index-1)+'">← Previous checkpoint</a>':'')+(index<frames.length-1?'<a class="btn" href="'+route(index+1)+'">'+(step.halt?'Inspect saved rows →':'Next checkpoint →')+'</a>':'<a class="btn" href="#services/'+code+'">Finish lesson</a>')+'</div>';
 mountSubserviceDocuments(documents,flow,index,code,documentIndex);
 main.querySelector('#subserviceModel').onchange=e=>{location.hash='subservice-flow/'+code+'/'+e.target.value+'/0';};
 main.querySelectorAll('[data-sub-step]').forEach(b=>{b.onclick=()=>{location.hash=route(Number(b.dataset.subStep));};});
 const board=main.querySelector('.sequence-board');board.scrollTop=Math.max(0,board.querySelector('.selected').offsetTop-80);
}
function addSubserviceSequenceEntry(code){
 if(!code||!code.includes('.'))return;
 const detail=main.querySelector('#serviceDetail');
 if(detail){
  const button=detail.querySelector('a.btn');
  button.href='#subservice-flow/'+code+'/save/0';
  button.textContent='Start lesson · checkpoints + documents →';
  button.classList.add('subservice-lesson-start');
  detail.querySelector('h2').insertAdjacentElement('afterend',button);
  return;
 }
 const lead=main.querySelector('.lead');
 if(lead)lead.insertAdjacentHTML('afterend','<div class="choices check subservice-sequence-entry"><a class="btn" href="#subservice-flow/'+code+'/save/0">Open lesson · checkpoints + documents →</a></div>');
}

// Reuse the audited documents and their live input handlers inside the checkpoint lesson.
function subserviceDocumentSpec(code){
 const fixed={
  'DR06.01':{render:reagentRenewal,count:8,map:{save:[0,1,2,2,7],submit:[1,3,2,2,6],approve:[0,4,4,5]}},
  'DR06.02':{render:i=>dr06FinalService('fsc',i),count:6},
  'DR06.03':{render:i=>dr06Amendment('holder',i),count:6},
  'DR06.04':{render:i=>dr06Amendment('manufacturer',i),count:6},
  'DR06.05':{render:i=>dr06FinalService('cancel',i),count:6},
  'DR08.01':{render:dr08Renewal,count:8,map:{save:[0,1,2,2,7],submit:[1,3,2,2,6],approve:[0,4,4,5]}},
  'DR08.03':{render:i=>dr08Change('name',i),count:7},
  'DR08.04':{render:i=>dr08Change('packaging',i),count:7},
  'DR08.05':{render:i=>dr08PartyChange('holder',i),count:6},
  'DR08.06':{render:i=>dr08PartyChange('manufacturer',i),count:6},
  'DR08.07':{render:i=>dr08Change('dosage',i),count:7}
 };
 return fixed[code]||{render:i=>remainingService(code,i),count:6};
}
function collectSubserviceDocuments(code){
 const spec=subserviceDocumentSpec(code),chapters=[],titles=[];
 for(let i=0;i<spec.count;i++){
  spec.render(i);
  const chapter=main.querySelector('section.panel.check');
  titles.push(chapter.querySelector('h2').textContent);
  chapter.classList.remove('panel','check');chapter.classList.add('subservice-document-chapter');
  chapter.dataset.documentChapter=i;chapters.push(chapter);
 }
 const scope=main.querySelector('details.panel.check');
 return {spec,chapters,titles,scope};
}
function mountSubserviceDocuments(documents,flow,index,code,documentIndex){
 const {spec,chapters,titles,scope}=documents;
 const defaults={save:[0,1,2,2,spec.count===7?6:5],submit:[1,2,2,2,4],approve:[0,3,3,4]};
 const selected=documentIndex ?? (spec.map||defaults)[flow][index];
 const slot=main.querySelector('#subserviceDocument');
 slot.innerHTML='<div class="tag">Read first</div><h2>Understand this step</h2><p class="src">Read the business explanation and try the examples below before inspecting the flow. The document topic follows your selected checkpoint.</p><label class="field">Document topic <select id="subserviceDocumentTopic">'+titles.map((title,i)=>'<option value="'+i+'" '+(i===selected?'selected':'')+'>'+escapeHtml(title)+'</option>').join('')+'</select></label>';
 chapters.forEach((chapter,i)=>{chapter.hidden=i!==selected;slot.append(chapter);});
 if(scope){scope.classList.remove('panel','check');slot.append(scope);}
 const inspect=document.createElement('button');inspect.className='btn';inspect.textContent='Inspect this checkpoint ↓';inspect.onclick=()=>main.querySelector('#subserviceSequence').scrollIntoView({block:'start',behavior:'smooth'});slot.append(inspect);
 main.querySelector('#subserviceDocumentTopic').onchange=e=>{subserviceSequence(code,flow,index,Number(e.target.value));main.querySelector('#subserviceDocument').scrollIntoView({block:'start'});};
}
