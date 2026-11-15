const inspectorTraceSelections={};
const inspectorTraceTypes={
 origin:{label:'Origin',node:'product',keys:['application_type'],tokens:['applicationType','ApplicationType','application_type','productOrigin']},
 attachments:{label:'B attachments',node:'product',keys:['attachments'],tokens:['attachments','Attachments','resolve(']},
 product:{label:'Source product ID',node:'product',keys:['id','source_product_id'],tokens:['sourceProductId','source_product_id','product.getId()','buildProductFormData','saveProducts','syncProducts']},
 application:{label:'Application ID',node:'app',keys:['id','application_id','source_application_id'],tokens:['applicationId','ApplicationId','application_id','sourceApplicationId']},
 registration:{label:'Registration ID',node:'registration',keys:['registration_id'],tokens:['registrationId','RegistrationId','registration_id','setRegistration','save(registration)']},
 licence:{label:'Licence ID',node:'licence',keys:['id','license_id','licence_id','licence_ids'],tokens:['licenseId','LicenseId','license_id','getLicense','buildNew']},
 profile:{label:'Actual profile ID',node:'profile',keys:['id','profile_id'],tokens:['profileId','profile_id','getOrCreateNewProfile','resolveProfile','setProfile']},
 prerequisite:{label:'Selected prerequisite ID',node:'detail',keys:['prerequisite_profile_id'],tokens:['prerequisiteProfileId','PrerequisiteProfileId','prerequisite_profile_id']}
};
function inspectorFieldTrace(node,key){
 if(key==='application_type')return 'origin';
 if(key==='attachments')return 'attachments';
 if(key==='source_product_id'||(key==='id'&&node==='product'))return 'product';
 if(key==='application_id'||key==='source_application_id'||(key==='id'&&node==='app'))return 'application';
 if(key==='registration_id')return 'registration';
 if(key==='license_id'||(key==='id'&&node==='licence'))return 'licence';
 if(key==='profile_id'||(key==='id'&&node==='profile'))return 'profile';
 if(key==='prerequisite_profile_id')return 'prerequisite';
 return null;
}
function inspectorTraceModel(family,type){
 const f=lifecycleFamilies[family],root=family==='DR06'?'reagent':family==='DR08'?'traditional_medicine':'health_supporting_product';
 const appProduct=f.products,snapshot=f.snapshot;
 const productPath=root+'.products[1]';
 const commonRefs=family==='DR06'?['dto','mapper','save','payload','snapshot']:family==='DR08'?['tmRequest','tmProductMap','tmReplace','tmPayload','tmSnapshot']:['hsRequest','hsProductMap','hsReplace','hsPayload','hsMapper'];
 const mapper=family==='DR06'?'ApplicationReagentMapper.updateProduct':family==='DR08'?'ApplicationTraditionalMedicineDetailMapper.toProduct':'ApplicationHealthSupportingProductDetailMapper.toEntity';
 const rows={
  origin:[productPath+'.application_type = IMPORT','Product DTO.applicationType → '+mapper+' → productRepository.save',root+'.products[1].application_type',snapshot+'.application_type',family==='DR08'?'DR08 Profile also accepts a legacy shared-origin fallback. The confirmed rule requires origin per product.':'The current product’s own origin travels to its snapshot and number-generation context.'],
  attachments:[productPath+'.attachments · own product files','attachmentResolutionService.resolve → saved product attachments → approved-data builder',root+'.products[1].attachments',snapshot+'.attachments','establishment_decision remains shared. DR09’s older per-product document subset is a documented validation gap.'],
  product:[family==='DR06'?'Omit id on create; send products[1].id on later edits':'No numeric product id in this request DTO','Server assigns example B row '+f.product+(family==='DR06'?' · syncProducts preserves existing IDs':' · saveProducts replaces the list and may assign new IDs'),family==='DR06'?'reagent.products[1].id = '+f.product:'OMITTED from approval product map',family==='DR06'?snapshot+'.source_product_id = '+f.product:'No source_product_id column in '+snapshot,family==='DR06'?'Unique source pair ('+f.application+','+f.product+') supports the module replay guard.':'This path has a source-identity gap. A generated registration ID does not recover the omitted Application product ID.'],
  application:['New request gets example application id '+f.application+'; later routes identify it','Application service saves parent; approved message identifies that application','ApplicationApprovedMessage application identity = '+f.application,family==='DR06'?snapshot+'.source_application_id = '+f.application:'No source_application_id column in '+snapshot,'Application and Profile use independent databases. This message association is not a cross-database foreign key.'],
  registration:['Generated in Profile; not supplied by original registration request','Registration builder → regulatoryRegistrationService.save → snapshot.setRegistration','Not an input ID in the Application approval; allocated in Profile',snapshot+'.registration_id PK/FK = '+f.registration,'B’s read endpoint uses registration ID '+f.registration+'. It differs from Application product ID '+f.product+'.'],
  licence:['Generated in Profile; not supplied by original registration request','licenseBuilder.buildNew → registration.license association','Later ISSUE operation carries licence '+f.licence,'regulatory_registrations.license_id → licenses.id = '+f.licence,'Licence ID identifies the issued result, not the source Application product row.'],
  profile:['Selected prerequisite 42 is a separate request field','Inherited resolveProfile → getOrCreateNewProfile → illustrative actual profile 99','Approved party identity reaches resolver; later ISSUE uses resolved profile 99','Registration, licence and snapshot profile_id = 99','Known rule gap: resolver can choose/create another profile instead of using the selected existing prerequisite.'],
  prerequisite:[root+'.prerequisite_profile_id = 42','Shared detail mapper saves prerequisite; approved builder and snapshot mapper copy it',root+'.prerequisite_profile_id = 42',snapshot+'.prerequisite_profile_id = 42','This preserves the selected input. It does not prove the actual profile resolver chose profile 42.']
 };
 const refs=type==='profile'?['tmHook','tmResolver',...(family==='DR06'?['snapshot']:[family==='DR08'?'tmSnapshot':'hsMapper'])]:type==='registration'||type==='licence'?['coreProfileFK','coreLicenceFK',...(family==='DR06'?['license','snapshot']:[family==='DR08'?'tmLoop':'hsHandler',family==='DR08'?'tmEntity':'hsEntity'])]:[...commonRefs,...(type==='product'||type==='application'?[family==='DR06'?'profileKeys':family==='DR08'?'tmEntity':'hsEntity']:[])];
 return {stages:rows[type],refs,root,appProduct,snapshot};
}
function traceDataMatch(type,path,value,family,rootData){
 const key=String(path.at(-1)),spec=inspectorTraceTypes[type],f=lifecycleFamilies[family];
 const productList=path.findIndex(part=>part==='products');
 if(productList>=0&&typeof path[productList+1]==='number'&&path[productList+1]!==1)return false;
 if(type==='attachments')return (key==='attachments'||path.includes('attachments'))&&(productList>=0||((rootData.id===f.product||rootData.source_product_id===f.product)&&path[0]==='attachments'));
 if(type==='licence'&&path.includes('licence_ids')&&value===f.licence)return true;
 if(!spec.keys.includes(key))return false;
 if(key==='id'){
  if(type==='product')return value===f.product;
  if(type==='application')return value===f.application;
  if(type==='licence')return value===f.licence;
  if(type==='profile')return value===99;
 }
 return true;
}
function traceJSONHTML(data,type,family){
 const lines=[];
 const write=(value,path,depth,prefix='',comma=false)=>{
  const object=value!==null&&typeof value==='object';
  const array=Array.isArray(value);
  const text='  '.repeat(depth)+prefix+(object?(array?'[':'{'):JSON.stringify(value));
  const matched=traceDataMatch(type,path,value,family,data);
  lines.push('<span class="guide-json-line '+(matched?'matched':'')+'">'+escapeHtml(text+(object?'':comma?',':''))+'</span>');
  if(object){const entries=Object.entries(value);entries.forEach(([key,child],i)=>write(child,[...path,array?Number(key):key],depth+1,array?'':JSON.stringify(key)+': ',i<entries.length-1));lines.push('<span class="guide-json-line">'+escapeHtml('  '.repeat(depth)+(array?']':'}')+(comma?',':''))+'</span>');}
 };
 write(data,[],0);
 return '<pre tabindex="0"><code>'+lines.join('\n')+'</code></pre>';
}
function renderInspectorTrace(family,code,scenario,index,node,frame,choose){
 const selectionKey=family+'/'+code+'/'+scenario,type=inspectorTraceSelections[selectionKey];
 const controls='<div class="choices" role="group" aria-label="Product B field traces">'+Object.entries(inspectorTraceTypes).map(([key,item])=>'<button class="action" type="button" data-inspector-trace="'+key+'" aria-pressed="'+(key===type)+'">'+item.label+'</button>').join('')+'<button class="action" type="button" id="clearInspectorTrace">Clear field trace</button></div>';
 let content='<p>Click a field name in the row inspector, or choose a trace. The four stages show the field’s lifecycle reference; the current checkpoint may stop before later stages.</p>';
 if(type){
  const trace=inspectorTraceModel(family,type),labels=['Request / input identity','Java mapping / save','Kafka association','Profile row'];
  content='<p><strong>Tracing '+inspectorTraceTypes[type].label+'</strong></p><div class="field-trace-route">'+labels.map((label,i)=>'<section><h4>'+label+'</h4><p>'+escapeHtml(trace.stages[i])+'</p><button type="button" class="action" data-trace-stage="'+i+'">Inspect '+label+'</button></section>').join('')+'</div><p>'+trace.stages[4]+'</p><p class="src">Lifecycle reference, not proof of delivery at this checkpoint. Current row values and failure outcomes remain in the inspector. Subservice operation contracts are missing; this reference traces the original main registration.</p>';
  main.querySelector('#guideERSourceBody').innerHTML=sources(trace.refs);
  main.querySelectorAll('#guideERSourceBody .code-line').forEach(line=>line.classList.toggle('trace-java-match',inspectorTraceTypes[type].tokens.some(token=>line.textContent.includes(token))));
  main.querySelector('#guideKafkaData').innerHTML=traceJSONHTML(frame.data.data,type,family);
  main.querySelector('#guideKafkaSelection').textContent='Field trace · '+inspectorTraceTypes[type].label+'. Matching Product B keys are highlighted where present; omitted fields are documented in the trace.';
 }
 main.querySelector('#guideFieldTrace').innerHTML='<h3>Follow a field through the lifecycle</h3>'+controls+content;
 main.querySelectorAll('[data-guide-table]').forEach(button=>{
  const related=type&&(['origin','attachments','product','application'].includes(type)?['app','product','snapshot']:type==='registration'?['registration','snapshot']:type==='licence'?['registration','licence']:type==='profile'?['profile','registration','licence','snapshot']:['detail','snapshot']);
  button.classList.toggle('trace-related',Boolean(related&&related.includes(button.dataset.guideTable)));
 });
 main.querySelectorAll('[data-row-field]').forEach(row=>row.classList.toggle('trace-field-match',Boolean(type&&inspectorFieldTrace(node,row.dataset.rowField)===type)));
 const activate=(key,target)=>{inspectorTraceSelections[selectionKey]=key;choose(target||inspectorTraceTypes[key].node);main.querySelector('[data-inspector-trace="'+key+'"]').focus({preventScroll:true});};
 main.querySelectorAll('[data-inspector-trace]').forEach(button=>button.onclick=()=>activate(button.dataset.inspectorTrace));
 main.querySelectorAll('[data-row-trace]').forEach(button=>button.onclick=()=>activate(button.dataset.rowTrace,node));
 main.querySelectorAll('[data-trace-stage]').forEach(button=>button.onclick=()=>{
  const stage=Number(button.dataset.traceStage);
  if(stage===1){main.querySelector('#guideERJava').click();return;}
  if(stage===3){choose(['registration','licence','profile'].includes(type)?type:'snapshot');main.querySelector('#guideRowInspector').scrollIntoView({block:'start'});return;}
  main.querySelector('#guideKafkaPanel').scrollIntoView({block:'start'});
 });
 main.querySelector('#clearInspectorTrace').onclick=()=>{delete inspectorTraceSelections[selectionKey];choose(node);};
}
