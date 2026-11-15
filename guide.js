// Each stop ties an explanation to one or more excerpts in evidence.js.
const stops = [
  ['01 / INTERFACE','Public portal','Where the applicant starts','The portal has a shared client for creating, updating and submitting applications. I could verify those calls on the development checkout. The DR06 product editor in this lesson is an illustration. A dedicated DR06 screen was not established there.',['portal']],
  ['02 / HTTP','Gateway','Where the request goes','The public gateway matches /api/v1/applications/**, checks authorization and forwards the HTTP request to MOH-Application. HTTP is the call for which the browser waits for a response.',['gateway']],
  ['03 / DRAFT','Application','Where Product B becomes a row','The controller accepts a draft. The service selects the strategy for GDHT-RG-L. That strategy updates each product and saves it separately. The draft response reads those saved products back in position order.',['http','dispatch','save','response']],
  ['04 / WORKFLOW','Pay & review','Who handles the submitted application','On submit, Application validates the saved products. For a payment-first submission it issues an invoice and can return AWAITING_PAYMENT. The Review seed defines Payment → Bureau of Drug Regulation → Department of Drugs and Food → General Department of Technical Services → Secretary of State in charge. The workflow covers the application as a whole.',['validate','payment','review']],
  ['05 / EVENT','Kafka','How approval reaches another service','On an approved review update, Application records APPROVED and raises a domain event. Its producer sends an ApplicationApprovedMessage keyed by application number. The form data carries each saved product ID, origin and attachments. Kafka carries this message to Profile separately from the applicant’s HTTP call.',['approve','payload','files','publish','consumer']],
  ['06 / RESULT','Profile','What one approval creates','Profile selects the strategy by service code. For each product the handler builds and saves a registration and licence under the resolved profile, then saves a detail snapshot. The rule requires the selected existing profile; this branch has a documented resolver gap. The numbering context reads that product’s origin. Profile also requests certificate issuance for the changed licences. Actual certificate delivery was not exercised.',['consumer','license','origin','cert']],
  ['07 / OUTPUT','Certificate','How B’s PDF is produced','Certificate consumes the licence-operation message, selects an active matching template and renders each product’s certificate request. Inspect the second lesson to follow the PDF upload and licence-specific result.',['certRead','template','pdf','certResult']]
];
const steps = [
  ['Scenario','Choose Product B’s origin','One applicant has selected establishment profile 42. Both example products belong to the same draft. The controls change local sample data.',['batch','docs']],
  ['HTTP','Read the draft request','The portal client serializes the form as JSON. Product B is the second array element, so its index is 1. The application’s registration operation and a product’s LOCAL or IMPORT origin are separate fields.',['portal','gateway','http','subtype']],
  ['Java','Follow the value into Java','Jackson reads application_type into applicationType on one ReagentProductRequestDto. A DTO is the Java object that holds incoming fields. The controller delegates to the application service, which chooses the DR06 strategy using the service code.',['dto','dispatch','save','mapper','entity']],
  ['Rows','Find the two saved rows','A foreign key is a column that points to another table’s row. Both product rows reference applications.id = 700. The separate application_reagent_details row for application 700 holds prerequisite_profile_id = 42. One parent can therefore have two products with different origins.',['detail','rows','fk','response']],
  ['Validation','Remove one required file','Drafts can be incomplete. Submit checks each saved product’s required fields and documents. The shared establishment_decision stays on the application. All other required files are assumed present for this exercise.',['docs','validate','missing']],
  ['Practice','Trace a field on your own','Start in ReagentProductRequestDto and follow Product B’s origin to a stored row. Use the file names below to navigate your checkout. Try answering before opening the excerpts.',['dto','mapper','save','rows']]
];
const main = document.querySelector('main');
const state = {origin:'IMPORT',hasForm:true,node:2,prediction:'',predictionDone:false,feedback:'',practice:''};
const escapeHtml = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function sources(keys) {
  return keys.map(key => {
    const s=evidence[key];
    return '<details class="proof"><summary>'+escapeHtml(s.path.split('/').pop())+' · L'+s.line+'</summary><p class="src">'+escapeHtml(s.repo+' @ '+s.rev+' / '+s.path)+'</p><pre tabindex="0"><code>'+s.code.split('\n').map((line,i)=>'<span class="code-line"><span class="line-number" aria-hidden="true">'+(s.line+i)+'</span>'+escapeHtml(line)+'</span>').join('')+'</code></pre></details>';
  }).join('');
}
function overview(){
  const nodes=stops.map(([label,name],i)=>(i?'<span class="arrow" aria-hidden="true">→</span>':'')+'<button class="node" data-node="'+i+'" aria-pressed="'+(state.node===i)+'"><span>'+label+'</span>'+name+'</button>').join('');
  main.innerHTML='<section class="intro"><div><div class="tag">System overview / DR06</div><h1>Inside reagent registration</h1><p class="lead">Follow one application from the applicant’s screen to registrations on a resolved establishment profile. The intended selected-profile behaviour is compared with the inspected branch.</p></div><a class="btn" href="#lesson/0">Start Product B lesson <b>→</b></a></section>'+
  '<section class="map" aria-label="Interactive system map"><div class="maptop"><h2 class="maptitle">The registration journey</h2><small>GDHT-RG-L</small></div><div class="route">'+nodes+'</div><p class="mapnote">Select a stop to inspect its role and source. Arrows show journey order. The approval handoff uses Kafka.</p></section>'+
  '<div class="below"><section class="panel" id="stopDetail" aria-live="polite"></section><aside class="side"><div class="tag">First lesson</div><h2>Where does IMPORT go?</h2><div class="mini"><span class="chip">A · LOCAL</span><span class="chip accent">B · IMPORT</span></div><p>Change one product, inspect its request, then find the same value in Java and SQL.</p><a href="#lesson/0">Open draft lesson →</a><hr><div class="tag">Second lesson</div><h2>From submit to certificate</h2><p>Follow B through payment, review, approval and issuance.</p><a href="#journey/0">Continue Product B’s journey →</a></aside></div>'+
  '<details class="legend"><summary>Scope, source revisions and workflow differences</summary><p>The master data lists Type of certificate = Product Number and SW_C → PAY → DR_V → DDF_R1 → DGH_R2 → SS_A. The Review seed has five named steps and flags SW_C and DR_V as unresolved mappings. The map shows the seeded workflow. Runtime routing and environment assignments were not tested.</p><p class="src">Master data: next-phase-work/DR06-ការចុះបញ្ជិកាប្រតិករ/master-data.md · Confirmed rules: next-phase-work/README.md</p><p>Application 3bd064ea and Profile c4dacbe are on refactor/dr06-reagent-registration, descendants of the original feature branches. Portal development 71509533, Gateway dev 32a85fb and Review refactor/dr08-traditional-medicine-registration 5effb54 were inspected independently. This is a source trace across local revisions. All example IDs and rows are fictional.</p></details>';
  showStop();
}
function showStop(){
  const [label,,title,body,keys]=stops[state.node];
  document.querySelector('#stopDetail').innerHTML='<div class="tag">'+label+'</div><h2>'+title+'</h2><p>'+body+'</p>'+sources(keys);
  document.querySelectorAll('[data-node]').forEach(el=>el.setAttribute('aria-pressed',Number(el.dataset.node)===state.node));
}
function sampleProduct(name,origin,hasForm){
  return {product_name:'Product '+name,application_type:origin,attachments:hasForm?[{key:'application_form',id:'sample-form-'+name}]:[]};
}
function request(){
  return {service_code:'GDHT-RG-L',attachments:[{key:'establishment_decision',id:'sample-establishment'}],reagent:{prerequisite_profile_id:42,products:[sampleProduct('A','LOCAL',true),sampleProduct('B',state.origin,state.hasForm)]}};
}
const pre=value=>'<pre tabindex="0"><code>'+escapeHtml(value)+'</code></pre>';
function example(i){
  switch(i){
    case 0: return '<div class="mini"><span class="chip">Product A · LOCAL</span></div><label class="field">Product B origin <select id="origin"><option '+(state.origin==='IMPORT'?'selected':'')+'>IMPORT</option><option '+(state.origin==='LOCAL'?'selected':'')+'>LOCAL</option></select></label><h3>If you change B’s origin, which part of the request changes?</h3><div class="choices"><button data-predict="all">Both products</button><button data-predict="b">Only Product B</button><button data-predict="root">The establishment</button></div><p class="feedback" role="status">'+state.prediction+'</p>';
    case 1: return '<div class="tag">POST /api/v1/applications</div><p>Selected request fields from a new draft. File IDs are fictional. Each product owns its application form.</p>'+pre(JSON.stringify(request(),null,2))+'<p>The draft response contains the saved products and their assigned IDs. Editing the draft uses PUT /api/v1/applications/{id} and sends those IDs back. Position 1 tells you where B appears in this array. Its ID identifies the saved product across edits.</p>';
    case 2: return '<div class="tag">Product B · field trace</div>'+pre('reagent.products[1].application_type = '+state.origin+'\n                ↓ Jackson\nReagentProductRequestDto.applicationType\n                ↓ reagentMapper.updateProduct(dto, product)\nApplicationReagentProduct.applicationType\n                ↓ productRepository.save(product)\napplication_reagent_products.application_type')+'<p>The mapper copies matching fields. The strategy sets position and resolves the attachments separately for each product.</p>';
    case 3: return '<div class="tag">Example rows after draft save</div><p class="mono">application_reagent_products</p><div class="rows"><table><thead><tr><th>id</th><th>application_id</th><th>position</th><th>product_name</th><th>application_type</th></tr></thead><tbody><tr><td>801</td><td>700</td><td>0</td><td>Product A</td><td>LOCAL</td></tr><tr class="focus"><td>802</td><td>700</td><td>1</td><td>Product B</td><td>'+state.origin+'</td></tr></tbody></table></div><p>The draft response reloads both rows ordered by position, then ID. Later, the approval event carries B’s saved ID to Profile. That cross-service link travels in a message.</p>';
    case 4: return '<div class="tag">Simulated submit check</div><p>Product A has its application_form. Predict what happens if B loses its copy.</p><label class="field"><input id="formPresent" type="checkbox" '+(state.hasForm?'checked':'')+'> Product B has its application_form</label><button class="action" id="validate">Check this document</button><p role="status" class="feedback">'+state.feedback+'</p><p>After the individual checks, the strategy combines the files for a common checklist. A missing document error already belongs to the specific product.</p>';
    case 5: return '<h3>Which column identifies Product B if the applicant reorders the list?</h3><div class="choices"><button data-answer="position">position</button><button data-answer="id">id</button><button data-answer="parent">application_id</button></div><p class="feedback" role="status">'+state.practice+'</p><details class="proof"><summary>Check your explanation</summary><p>B has the example ID 802. Position can change, and application ID 700 belongs to both products. To find its origin, open the product DTO, follow updateProduct and productRepository.save in syncProducts, then inspect application_type in the product table.</p></details>';
  }
}
function stepNumber(){
  const match=/^#lesson\/([0-5])$/.exec(location.hash);
  return match?Number(match[1]):-1;
}
function lesson(i){
  const [label,title,description,keys]=steps[i];
  main.innerHTML='<div class="tag">Guided walkthrough / DR06</div><h1>Follow Product B</h1><p class="lead">Trace one field from a two-product application into the saved draft.</p><nav class="steps" aria-label="Lesson steps">'+steps.map(([name],n)=>'<a href="#lesson/'+n+'" '+(n===i?'aria-current="step"':'')+'>'+(n+1)+' · '+name+'</a>').join('')+'</nav>'+
  '<div class="lessonbody"><article class="panel"><div class="tag">Step '+(i+1)+' of 6 · '+label+'</div><h2>'+title+'</h2><p>'+description+'</p><div class="stepcontent">'+example(i)+'</div></article><aside class="side"><div class="tag">Source reader</div><h2>Inspect the code</h2><p>Expand a file to see the original lines, repository path and commit.</p>'+sources(keys)+'</aside></div><div class="actions"><a class="btn light" href="'+(i?'#lesson/'+(i-1):'#overview')+'">← '+(i?'Previous':'Overview')+'</a><a class="btn" href="'+(i===5?'#journey/0':'#lesson/'+(i+1))+'">'+(i===5?'Continue · Submit':'Next · '+steps[i+1][0])+' →</a></div>';
}
function render(){
  const failureRoute=/^#flow-failure\/(save|submit|approve)\/([a-zA-Z]+)\/([0-2])$/.exec(location.hash);
  const validFailure=failureRoute && Object.hasOwn(flowFailureCases[failureRoute[1]],failureRoute[2]);
  const bRoute=/^#b-lesson\/(journey|compare|payment|message|practice)\/([0-8])$/.exec(location.hash);
  const bLimits={journey:9,compare:3,payment:1,message:5,practice:3};
  const validB=bRoute && Number(bRoute[2])<bLimits[bRoute[1]];
  const retryRoute=/^#approval-retry\/(rollback|contract|duplicate|afterCommit|concurrent|partial)\/([0-4])$/.exec(location.hash);
  const validRetry=retryRoute && Number(retryRoute[2])<approvalRetryCases[retryRoute[1]].frames.length;
  const serviceRoute=/^#services\/(DR(?:06|08|09)(?:\.[0-9]{2})?)$/.exec(location.hash);
  const validService=serviceRoute && drServiceCatalog.some(s=>s.code===serviceRoute[1]);
  const renewalRoute=/^#dr06-renewal\/([0-7])$/.exec(location.hash);
  const changeRoute=/^#dr06-change\/(holder|manufacturer)\/([0-5])$/.exec(location.hash);
  const outputRoute=/^#dr06-output\/(fsc|cancel)\/([0-5])$/.exec(location.hash);
  const tmRoute=/^#dr08-main\/([0-9])$/.exec(location.hash);
  const hsRoute=/^#dr09-main\/([0-9])$/.exec(location.hash);
  const tmRenewRoute=/^#dr08-renewal\/([0-7])$/.exec(location.hash);
  const tmChangeRoute=/^#dr08-change\/(name|packaging|dosage)\/([0-6])$/.exec(location.hash);
  const tmPartyRoute=/^#dr08-party\/(holder|manufacturer)\/([0-5])$/.exec(location.hash);
  const remainingRoute=/^#service-lesson\/(DR(?:08|09)\.[0-9]{2})\/([0-5])$/.exec(location.hash);
  const validRemaining=remainingRoute && Object.hasOwn(remainingServiceLessons,remainingRoute[1]);
  const lifeRoute=/^#lifecycle\/(DR06|DR08|DR09)\/(DR(?:06|08|09)(?:\.[0-9]{2})?)\/([0-2])$/.exec(location.hash);
  const validLife=lifeRoute && drServiceCatalog.some(s=>s.code===lifeRoute[2]&&s.family===lifeRoute[1]);
  const guidedRoute=/^#lifecycle-guide\/(DR06|DR08|DR09)\/(DR(?:06|08|09)(?:\.[0-9]{2})?)\/(success|validation|rollback)\/([0-9]{1,2})$/.exec(location.hash);
  const validGuided=guidedRoute && drServiceCatalog.some(s=>s.code===guidedRoute[2]&&s.family===guidedRoute[1]) && (guidedRoute[2]===guidedRoute[1]||guidedRoute[3]==='success') && Number(guidedRoute[4])<lifecycleGuideFrames(guidedRoute[1],guidedRoute[2],guidedRoute[3]).length;
  const flowHome=location.hash==="#core-flows";
  const flow=/^#flow\/(save|submit|approve)\/([0-9]+)$/.exec(location.hash);
  const validFlow=flow && Number(flow[2]) < coreFlows[flow[1]].steps.length;
  const partial=/^#partial-save(?:\/(localCatch|joined|independentCommit|independentFailure|responseFailure|afterCommit)\/([0-2]))?$/.exec(location.hash);
  const rollback=/^#rollback-lab(?:\/(placement|identity|resolution|profileParse|profileLoop)\/([0-2]))?$/.exec(location.hash);
  const attachment=location.hash==="#attachment-lab";
  const nulls=location.hash==="#mapper-nulls";
  const snapshot=location.hash==="#snapshot-lab";
  const identity=location.hash==="#identity-map";
  const owner=location.hash==="#owner-lab";
  const resolver=location.hash==="#profile-resolver";
  const gates=location.hash==="#validation-gates";
  const corePage=location.hash==="" || location.hash==="#core";
  const draft=location.hash==="#draft-lab";
  const contract=location.hash==="#contract-lab";
  const gap=location.hash==="#profile-gap";
  const read=location.hash==="#profile-read";
  const coreSource=/^#core-source\/([a-zA-Z]+)$/.exec(location.hash);
  const coreSources=location.hash==="#core-sources" || (coreSource && evidence[coreSource[1]]);
  const i=stepNumber();
  const result=/^#certificate-result\/([0-4])$/.exec(location.hash);
  const java=/^#java-route\/([0-6])$/.exec(location.hash);
  const order=location.hash==="#message-order";
  const source=/^#source\/([a-zA-Z]+)$/.exec(location.hash);
  const sourcePage=location.hash==="#sources" || (source && evidence[source[1]]);
  const work=/^#workbench\/([0-9]|1[01])$/.exec(location.hash);
  const learn=location.hash==="#learn";
  const practice=/^#practice\/([0-2])$/.exec(location.hash);
  const tx=/^#transactions\/([0-5])$/.exec(location.hash);
  const recovery=/^#recovery\/(file|origin|replay|template|certReplay)$/.exec(location.hash);
  const field=/^#field\/(origin|identity|attachments)\/([0-5])$/.exec(location.hash);
  const review=/^#review-timeline\/([0-9])$/.exec(location.hash);
  const timeline=location.hash==="#payment-timeline" || location.hash==="#payment-confirmed";
  const db=/^#database\/([AB])$/.exec(location.hash);
  const next=/^#journey\/([0-5])$/.exec(location.hash);
  document.querySelectorAll('header nav a').forEach(a=>a.removeAttribute('aria-current'));
  document.getElementById((corePage||draft||contract||gap||read||coreSources||resolver||gates||identity||owner||snapshot||nulls||attachment||rollback||partial||flowHome||validFlow||validFailure||validB||validRetry||validService||renewalRoute||changeRoute||outputRoute||tmRoute||hsRoute||tmRenewRoute||tmChangeRoute||tmPartyRoute||validRemaining||validLife||validGuided)?'coreNav':result?'resultNav':java?'javaNav':order?'orderNav':sourcePage?'sourceNav':work?'workbenchNav':learn?'learnNav':practice?'practiceNav':tx?'transactionNav':recovery?'recoveryNav':field?'fieldNav':review?'reviewNav':timeline?'timelineNav':db?'databaseNav':next?'journeyNav':i<0?'overviewNav':'lessonNav').setAttribute('aria-current','page');
  if(validGuided) lifecycleGuide(guidedRoute[1],guidedRoute[2],guidedRoute[3],Number(guidedRoute[4])); else if(validLife) productLifecycle(lifeRoute[1],lifeRoute[2],Number(lifeRoute[3])); else if(validRemaining) remainingService(remainingRoute[1],Number(remainingRoute[2])); else if(tmPartyRoute) dr08PartyChange(tmPartyRoute[1],Number(tmPartyRoute[2])); else if(tmChangeRoute) dr08Change(tmChangeRoute[1],Number(tmChangeRoute[2])); else if(tmRenewRoute) dr08Renewal(Number(tmRenewRoute[1])); else if(hsRoute) dr09Main(Number(hsRoute[1])); else if(tmRoute) dr08Main(Number(tmRoute[1])); else if(outputRoute) dr06FinalService(outputRoute[1],Number(outputRoute[2])); else if(changeRoute) dr06Amendment(changeRoute[1],Number(changeRoute[2])); else if(validService) serviceExplorer(serviceRoute[1]); else if(renewalRoute) reagentRenewal(Number(renewalRoute[1])); else if(validRetry) approvalRetry(retryRoute[1],Number(retryRoute[2])); else if(validB) productBLesson(bRoute[1],Number(bRoute[2])); else if(validFailure) flowFailure(failureRoute[1],failureRoute[2],Number(failureRoute[3])); else if(flowHome) coreFlowsHome(); else if(validFlow) coreFlow(flow[1],Number(flow[2])); else if(partial) partialSaveLab(partial[1]||"responseFailure",Number(partial[2]||0)); else if(rollback) rollbackLab(rollback[1]||"resolution",Number(rollback[2]||0)); else if(attachment) attachmentLab(); else if(nulls) mapperNullLab(); else if(snapshot) snapshotLab(); else if(identity) identityMap(); else if(owner) ownerLab(); else if(resolver) profileResolution(); else if(gates) validationGates(); else if(corePage) coreHome(); else if(draft) draftLab(); else if(contract) contractLab(); else if(gap) profileGap(); else if(read) profileRead(); else if(coreSources) sourceIndex(coreSource?coreSource[1]:null,true); else if(result) certificateResult(Number(result[1])); else if(java) javaRoute(Number(java[1])); else if(order) messageOrder(); else if(sourcePage) sourceIndex(source?source[1]:null); else if(work) workbench(Number(work[1])); else if(learn) learnPage(); else if(practice) codePractice(Number(practice[1])); else if(tx) transactionLesson(Number(tx[1])); else if(recovery) recoveryLab(recovery[1]); else if(field) fieldTrace(field[1],Number(field[2])); else if(review) reviewTimeline(Number(review[1])); else if(timeline) paymentTimeline(); else if(db) database(db[1]); else if(next) journey(Number(next[1])); else if(i<0) overview(); else lesson(i);
}
main.addEventListener('change',event=>{
  if(event.target.id==='templateCase'){
    journeyView.templateAvailable=event.target.checked;
    document.querySelector('#templateResult').textContent=templateOutcome();
  }
  if(event.target.id==='origin') state.origin=event.target.value;
  if(event.target.id==='formPresent'){
    state.hasForm=event.target.checked;
    state.feedback='';
    main.querySelector('.feedback').textContent='';
  }
});
main.addEventListener('click',event=>{
  const b=event.target.closest('button');
  if(!b) return;
  if(b.id==='restoreForm'){state.hasForm=true;state.feedback='';render();main.focus();return;}
  if(b.id==='replayApproval'){document.querySelector('#replayResult').textContent='Replay ignored. Application 700 already has DR06 details. Profile still has the same two registrations and licences for this application.';return;}
  if(b.dataset.node!==undefined){state.node=Number(b.dataset.node);showStop();return;}
  if(b.dataset.predict) state.prediction=b.dataset.predict==='b'?'Correct. Only reagent.products[1].application_type changes.':'Look at the owner of the field. The establishment and Product A keep their values. Try again.';
  if(b.id==='validate') state.feedback=state.hasForm?'Both products pass this application_form check.':'Product B fails at reagent.products[1].attachments. Its application_form is missing. Product A’s form satisfies A only.';
  if(b.dataset.answer) state.practice=b.dataset.answer==='id'?'Correct. The saved ID stays with B when its position changes.':'Try again. Both products share the parent ID, and a reorder can change position.';
  const message=main.querySelector('.feedback');
  if(message) message.textContent=b.dataset.predict?state.prediction:b.dataset.answer?state.practice:state.feedback;
});
window.addEventListener('hashchange',event=>{
  const previousFlow=/^#flow(?:-failure)?\/(save|submit|approve)\//.exec(new URL(event.oldURL).hash);
  const currentFlow=/^#flow(?:-failure)?\/(save|submit|approve)\//.exec(location.hash);
  const sameFlow=previousFlow && currentFlow && previousFlow[1]===currentFlow[1];
  const previousScroll=window.scrollY;
  const menu=document.querySelector('.lesson-menu');
  if(menu) menu.open=false;
  render();
  main.focus({preventScroll:true});
  window.scrollTo(0,sameFlow?previousScroll:0);
});
render();
