const lifecycleFamilies={
 DR06:{application:700,product:802,registration:902,licence:502,detail:'application_reagent_details',products:'application_reagent_products',snapshot:'reagent_product_license_details',main:'#b-lesson/journey/0',refs:['appSaveTx','save','license','snapshot','replay']},
 DR08:{application:800,product:812,registration:922,licence:522,detail:'application_traditional_medicine_details',products:'application_traditional_medicine_products',snapshot:'traditional_medicine_license_details',main:'#dr08-main/0',refs:['tmSave','tmReplace','tmPayload','tmLoop','tmEntity']},
 DR09:{application:900,product:832,registration:942,licence:542,detail:'application_health_supporting_details',products:'application_health_supporting_product_details',snapshot:'health_supporting_product_license_details',main:'#dr09-main/0',refs:['hsSave','hsReplace','hsPayload','hsHandler','hsEntity']}
};
function lifecycleLesson(code){
 const family=code.split('.')[0];
 if(!code.includes('.'))return lifecycleFamilies[family].main;
 const fixed={'DR06.01':'#dr06-renewal/0','DR06.02':'#dr06-output/fsc/0','DR06.03':'#dr06-change/holder/0','DR06.04':'#dr06-change/manufacturer/0','DR06.05':'#dr06-output/cancel/0','DR08.01':'#dr08-renewal/0','DR08.03':'#dr08-change/name/0','DR08.04':'#dr08-change/packaging/0','DR08.05':'#dr08-party/holder/0','DR08.06':'#dr08-party/manufacturer/0','DR08.07':'#dr08-change/dosage/0'};
 return fixed[code]||'#service-lesson/'+code+'/0';
}
function lifecycleGroup(service){
 if(!service.code.includes('.'))return 'Registration';
 if(service.name==='Renewal')return 'Renewal';
 if(service.name==='Free Sale Certificate')return 'Free Sale Certificate';
 if(service.name==='Cancellation')return 'Cancellation';
 return 'Changes';
}
function lifecycleGap(family,code){
 if(code!==family)return 'Dedicated domain strategy missing in inspected branches. Subservice certificate type, target cardinality, mutation/history and output rules remain unresolved. Declared codes alone do not provide executable wiring.';
 if(family==='DR06')return 'Registration source path exists. Generic profile resolver may choose/create a profile instead of selecting prerequisite 42. Runtime delivery is unverified.';
 if(family==='DR08')return 'Registration exists. Product rows are replaced on save; approval omits source product IDs; DR07 enrichment reads at consumption time; module replay guard/source-pair tracking absent; generic profile resolver gap.';
 return 'Registration exists. Older attachment split conflicts with required per-product scope; replace-on-save and approval source-ID gaps; module replay guard absent; generic profile resolver gap.';
}
function lifecycleRows(family,code,phase){
 const f=lifecycleFamilies[family],isMain=code===family;
 if(isMain){
  const statuses=['No new request row','APPROVED · Application committed before Profile processing in this fixture','APPROVED · remains committed'];
  const result=['Not created','New result pending in Profile transaction','One B result committed'];
  return [
   ['Application · applications '+f.application,statuses[phase]],
   ['Application · '+f.detail,phase===0?'Not created':'Prerequisite 42 · saved with request'],
   ['Application · '+f.products+' · B '+f.product,phase===0?'Not created':'B IMPORT + own fields/files · saved'],
   ['Profile · profiles 99','Illustrative existing identity candidate'+(phase===1?' · enrichment pending':phase===2?' · handler changes committed':'')],
   ['Profile · registration '+f.registration+' / licence '+f.licence,result[phase]],
   ['Profile · '+f.snapshot,result[phase]+(phase===0?'':' · prerequisite 42 · B IMPORT')]
  ];
 }
 return [
  ['Historic Application '+f.application+' / B '+f.product,'Saved registration request retained'],
  ['Profile · existing profile 99','Existing establishment retained'],
  ['Profile · B registration '+f.registration+' / licence '+f.licence,'Existing result, dates and number retained'],
  ['Profile · '+f.snapshot,'Existing approved product snapshot retained'],
  ['Profile · unrelated A result','Existing A rows retained'],
  ['New subservice request / operation',phase===0?'No new request executed in fixture':phase===1?'Unsupported strategy boundary · no domain save reached':'No domain rows created by isolated unsupported-code handling'],
  ['New output / updated product history','Dedicated implementation missing; no successful mutation shown']
 ];
}
function lifecycleData(family){
 const f=lifecycleFamilies[family];
 if(family==='DR06')return {application_id:f.application,source_product_id:f.product,profile_result:{registration_id:f.registration,licence_id:f.licence},link:'Approval carries product 802; snapshot stores unique source pair (700,802).'};
 return {application_id:f.application,example_application_product_row:f.product,approval_product_id:'Omitted by the inspected product map',profile_result:{registration_id:f.registration,licence_id:f.licence},link:family==='DR08'?'DR07 brand_name_license_id 302 travels with B; no DR06-style source pair in snapshot.':'Approved direct product fields travel with B; no DR06-style source pair in snapshot.'};
}
function productLifecycle(family,code,phase){
 const f=lifecycleFamilies[family],service=drServiceCatalog.find(s=>s.code===code),main=code===family;
 const group=lifecycleGroup(service);
 const groups=['Renewal','Changes','Free Sale Certificate','Cancellation'];
 const services=drServiceCatalog.filter(s=>s.family===family&&s.code!==family);
 const phases=main?['Before registration','Application committed / Profile pending','After successful Profile commit']:['Existing registered B','Attempt unsupported operation','After boundary handling'];
 const endpoint='#lifecycle/'+family+'/';
 const cards=groups.map(label=>'<section class="life-branch"><h3>'+label+'</h3><span class="life-connector" aria-hidden="true">↓</span>'+services.filter(s=>lifecycleGroup(s)===label).map(s=>'<a class="life-operation '+(s.code===code?'selected':'')+'" href="'+endpoint+s.code+'/0" '+(s.code===code?'aria-current="step"':'')+'><strong>'+s.code+'</strong><span>'+s.name+'</span></a>').join('')+'</section>').join('');
 const branchEffect=group==='Renewal'?'Requested business effect · continue the selected result’s validity. Date start, renewal number/count and version policy require confirmation.':group==='Changes'?'Requested business effect · apply approved fields to the selected product with before/after history. Exact target, allowed fields, DR07 dependency where relevant and snapshot policy require confirmation.':group==='Free Sale Certificate'?'Requested business effect · issue an associated FSC output from existing product data. Output association, cardinality, number and eligibility require confirmation.':'Requested business effect · cancel the selected registration and record the agreed result/output. Shared termination currently affects the whole profile and its open licences, so product-level scope requires dedicated design.';
 const method=main?(phase===0?'Application controller → registration strategy':phase===1?'Application approval commit → Kafka → Profile mapper/handler → pending saves':'Profile transaction commit → ISSUE operation listener'):(phase===0?'Inspect existing registration and licence':phase===1?'Application strategy factory → unsupported operation code':'Application factory throws; hypothetical Profile unsupported-code delivery is caught/logged and returns');
  const html='<div class="tag">Application + Profile / Product B lifecycle</div><h1>One product, related operations</h1><p class="lead">Choose a family, then select an operation to inspect its rows and implementation boundary. Each family uses its own fictional Product B.</p><nav class="steps" aria-label="Lifecycle families">'+Object.keys(lifecycleFamilies).map(key=>'<a href="#lifecycle/'+key+'/'+key+'/0" '+(family===key?'aria-current="page"':'')+'>'+key+'</a>').join('')+'</nav><p><a class="btn" href="#lifecycle-guide/'+family+'/'+code+'/success/0">Start guided mode →</a></p><section class="life-map" aria-label="Interactive Product B lifecycle"><div class="life-origin"><a class="life-operation '+(main?'selected':'')+'" href="'+endpoint+family+'/0" '+(main?'aria-current="step"':'')+'><strong>'+family+' registration</strong><span>Create B’s registration, licence and snapshot</span><small>Source path exists · known gaps</small></a><span class="life-arrow" aria-hidden="true">→</span><div class="life-product"><strong>Product B</strong><span>Registration '+f.registration+' · licence '+f.licence+'</span><span>Actual profile 99 · selected prerequisite 42</span></div></div><p class="life-caption">From the registered result, inspect any related operation below. Branches represent operation relationships. Subservice branches lack dedicated strategies in the inspected code. Runtime eligibility and combinations remain to be confirmed.</p><div class="life-branches">'+cards+'</div></section><button type="button" class="action" id="lifeShowRows">Inspect selected operation’s rows ↓</button><section class="panel check" id="lifeDetail" aria-live="polite"><div class="tag">'+service.code+'</div><h2>'+service.name+'</h2><nav class="steps" aria-label="Lifecycle row phases">'+phases.map((label,i)=>'<a href="'+endpoint+code+'/'+i+'" '+(i===phase?'aria-current="step"':'')+'>'+label+'</a>').join('')+'</nav><p><code>'+escapeHtml(method)+'</code></p><div class="transaction-box"><strong>'+phases[phase]+'</strong><p>'+ (main?'The registration fixture follows valid data and successful handlers. Application and Profile commit separately. The middle phase starts after Application approval and stops before Profile commit.':branchEffect)+'</p></div>'+bTable(['Row / association','State at this phase'],lifecycleRows(family,code,phase))+'<h3 class="check">Implementation gaps</h3><p>'+lifecycleGap(family,code)+'</p><div class="choices check"><a class="btn" href="'+lifecycleLesson(code)+'">Open '+code+' detailed lesson</a><a class="btn light" href="#services/'+code+'">Inspect master data</a></div><details class="proof"><summary>IDs across Application, Kafka and Profile</summary>'+pre(JSON.stringify(lifecycleData(family),null,2))+'<p>These identities describe the original registration. Dedicated subservice target and operation-message contracts remain missing.</p></details><details class="proof"><summary>Read source evidence for this boundary</summary>'+sources(main?f.refs:['tmRenewAppFactory','tmRenewProfileFactory','consumer',...(group==='Cancellation'?['currentTerminate']:group==='Renewal'?['tmRenewShared']:group==='Changes'?['tmChangeShared']:['freeSaleCodeScope'])])+'</details></section><p class="src">Main-service Type of certificate = Product Number. Subservice masters omit that field, so this map does not select their request cardinality. Source snapshots are recorded in the linked lessons. Row states are source-derived fixtures; live requests, Kafka delivery and deployed schema were not exercised.</p>';
  document.querySelector('main').innerHTML=html;
  document.querySelector('#lifeShowRows').onclick=()=>document.querySelector('#lifeDetail').scrollIntoView({behavior:'smooth',block:'start'});
}
