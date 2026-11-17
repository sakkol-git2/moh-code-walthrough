// Run with NODE_PATH pointing to a temporary linkedom install. No HTTP or browser used.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const {window}=parseHTML(html);const document=window.document;
window.HTMLElement.prototype.scrollIntoView=function(){};window.HTMLElement.prototype.focus=function(){};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){const o=this.querySelector('option[selected]')||this.querySelector('option');return o?o.getAttribute('value')||o.textContent:'';},set(v){for(const o of this.querySelectorAll('option')){if((o.getAttribute('value')||o.textContent)===String(v))o.setAttribute('selected','');else o.removeAttribute('selected');}}});
Object.defineProperty(window.HTMLInputElement.prototype,'checked',{get(){return this.hasAttribute('checked');},set(v){if(v)this.setAttribute('checked','');else this.removeAttribute('checked');}});
window.scrollTo=()=>{};const location={hash:'#services/DR06.01'};window.location=location;
const stored=new Map();
const context=vm.createContext({window,document,location,console,Map,Set,structuredClone,localStorage:{getItem(k){return stored.get(k)||null;},setItem(k,v){stored.set(k,v);}},setTimeout,clearTimeout});
const run=code=>vm.runInContext(code,context);
for(const match of html.matchAll(/<script defer src="([^"?]+)/g)){const filename=match[1];vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),context,{filename});}
const services=run('drServiceCatalog.filter(s=>s.code.includes(".")).map(s=>({code:s.code,name:s.name}))');
let views=0;
for(const service of services){for(const reference of ['DR07','DR01','target']){for(const flow of ['save','submit','approve']){
 const n=run(`subserviceFlowFrames(drServiceCatalog.find(s=>s.code===${JSON.stringify(service.code)}),${JSON.stringify(flow)},${JSON.stringify(reference)}).length`);
 for(let i=0;i<n;i++){
  location.hash=`#subservice-flow/${service.code}/${flow}/${i}/${reference}`;run('render()');
  assert(document.querySelector('#subserviceReference'),location.hash);
  assert.equal(document.querySelector('#subserviceReference').value,reference);
  assert.equal(document.querySelectorAll('.subservice-document-chapter:not([hidden])').length,1,location.hash);
  assert.equal(document.querySelector('.sequence-exchange.selected').dataset.subStep,String(i));
  assert(document.querySelector('#subserviceDocument').nextElementSibling.id==='subserviceSequence');
  assert(!document.querySelector('main').textContent.includes('undefined'),location.hash);
  assert(document.querySelectorAll('.implementation-panel pre').length>0,location.hash);
  for(const a of document.querySelectorAll('#subserviceSequence a[href^="#subservice-flow"]'))assert(a.getAttribute('href').endsWith('/'+reference));
  views++;
 }
}}}
// Check reference selection persists in navigation and source references exist.
for(const service of services){location.hash=`#subservice-flow/${service.code}/save/0`;run('render()');assert.equal(document.querySelector('#subserviceReference').value,service.name==='Renewal'?'DR07':'DR01');location.hash=`#services/${service.code}`;run('render()');assert.equal(document.querySelector('#serviceDetail h2 + a').getAttribute('href'),`#subservice-flow/${service.code}/save/0`);}
run(`for(const ref of ['DR07','DR01'])for(const flow of ['save','submit','approve'])for(const step of referenceFlowFrames(drServiceCatalog[1],flow,ref)){if(!step.failure||!step.stage)throw Error('Missing explanation');for(const key of step.refs)if(!evidence[key])throw Error('Missing evidence '+key);}`);
// Preserve proposal state and refresh comparison chapters in the combined lesson.
location.hash='#subservice-flow/DR08.03/save/1/DR01';run('render()');
let input=document.querySelector('#tmChangeValue');input.value='Reference QA proposal';input.oninput();
let topic=document.querySelector('#subserviceDocumentTopic');topic.value='4';topic.onchange({target:topic});assert(document.querySelector('.subservice-document-chapter:not([hidden])').textContent.includes('Reference QA proposal'));
console.log(`${views} reference/target checkpoint views; 20 defaults and explorer links; evidence bindings and editable-document synchronization passed.`);
// Verify that the lesson presents separate identities and transaction outcomes.
run(`{
 const service=drServiceCatalog.find(s=>s.code==='DR08.01');
 const renewal=referenceFlowFrames(service,'approve','DR07');
 const before=Object.fromEntries(referenceLedger('approve','DR07',renewal,5));
 const pending=Object.fromEntries(referenceLedger('approve','DR07',renewal,6));
 const committed=Object.fromEntries(referenceLedger('approve','DR07',renewal,8));
 if(!before.license.includes('count 0')||!pending.license.includes('pending')||!committed.license.includes('committed'))throw Error('Renewal ledger does not distinguish pending/commit');
 if(!renewal[4].text.includes('does not filter by request licenseIds'))throw Error('Profile-wide renewal selection gap hidden');
 const cn=referenceFlowFrames(service,'save','DR01');
 if(!cn[3].data.null_or_empty_list.includes('deleted'))throw Error('DR01 replacement semantics hidden');
 const initial=Object.fromEntries(referenceLedger('save','DR01',cn,-1));
 const saved=Object.fromEntries(referenceLedger('save','DR01',cn,5));
 if(!initial.product.includes('No new')||!saved.product.includes('1182')||!saved.child.includes('1182'))throw Error('Reference product/ingredient identity mismatch');
}`);
// Switching the implementation selector resets the step while preserving service/flow.
location.hash='#subservice-flow/DR09.07/approve/8/DR01';run('render()');
let reference=document.querySelector('#subserviceReference');reference.value='target';reference.onchange({target:reference});assert.equal(location.hash,'subservice-flow/DR09.07/approve/0/target');
console.log('Renewal scope, commit states, DR01 replacement/FKs and reference-switch navigation checks passed.');

// ER diagrams: every local FK has a type badge and a bidirectional explanation.
let erViews=0;
for(const product of ['A','B']){
 location.hash='#database/'+product;run('render()');
 assert.equal(document.querySelectorAll('#er .fk-line').length,7);
 assert.equal(document.querySelectorAll('#er .erd-cardinality-badge').length,7);
 assert.equal(document.querySelectorAll('#er .erd-relationship-legend tbody tr').length,7);
 assert.equal(document.querySelectorAll('#er .event-line .erd-cardinality-badge').length,0);
 document.querySelector('#er [data-table="product"]').click();
 assert(document.querySelector('#er tr[data-cardinality-ends="product app"]').classList.contains('selected'));
 document.querySelector('#er [data-mode]').click();
 assert.equal(document.querySelector('#er g[data-cardinality-ends="product app"]').style.visibility,'hidden');
 erViews++;
}
for(const family of ['DR06','DR08','DR09']){
 for(const scenario of ['success','validation','rollback']){
  const count=run(`lifecycleGuideFrames('${family}','${family}','${scenario}').length`);
  for(let i=0;i<count;i++){
   location.hash=`#lifecycle-guide/${family}/${family}/${scenario}/${i}`;run('render()');
   assert.equal(document.querySelectorAll('.guide-er .guide-fk').length,7);
   assert.equal(document.querySelectorAll('.guide-er .erd-cardinality-badge').length,7);
   assert.equal(document.querySelectorAll('.guide-er .erd-relationship-legend tbody tr').length,7);
   document.querySelector('[data-guide-table="registration"]').onclick();
   assert(document.querySelector('#guideERSelection').textContent.includes('One-to-one (1:1)'));
   assert(document.querySelector('#guideERSelection').textContent.includes('Many-to-one (N:1)'));
   erViews++;
  }
 }
}
// Badges must occupy the gaps between boxes, not overlap their 240 x 120 nodes.
run(`{const model=guideERModel('DR06','DR06','success',0);for(const [from,to,path,x,y] of model.edges)for(const node of model.nodes){if(x+23>node.x&&x-23<node.x+240&&y+11>node.y&&y-11<node.y+120)throw Error('Cardinality badge overlaps '+node.id);}}`);
console.log(`${erViews} database/guided ER views: FK labels, reverse relations, optional-row explanations, selection and badge geometry passed.`);

// Study desk: all catalogued services, honest coverage and interactive learning state.
let studyViews=0;
const catalog=run('drServiceCatalog.map(s=>s.code)');
for(const code of catalog){
 location.hash='#study/'+code;run('render()');
 assert.equal(document.querySelector('#studyService').value,code);
 assert.equal(document.querySelectorAll('[data-study-check]').length,8);
 assert.equal(document.querySelectorAll('#coverageRows tr').length,23);
 assert(document.querySelector('main').textContent.includes('not backend implementation'));
 location.hash='#study-lab/'+code;run('render()');
 assert.equal(document.querySelectorAll('.study-question').length,6);
 assert(!document.querySelector('main').textContent.includes('undefined'));
 studyViews+=2;
}
location.hash='#study/DR08.01';run('render()');
let check=document.querySelector('[data-study-check="methods"]');check.checked=true;check.onchange();
let note=document.querySelector('#studyNotes');note.value='<script>must remain text</script> review scope';note.oninput();
run('render()');assert(document.querySelector('[data-study-check="methods"]').checked);assert.equal(document.querySelector('#studyNotes').value,'<script>must remain text</script> review scope');assert.equal(document.querySelector('#studyProgress').textContent,'1 / 8 topics reviewed');assert.equal(document.querySelectorAll('main script').length,0);
document.querySelector('#studyExport').click();assert(document.querySelector('#studyReport').textContent.includes('[x] 3 · Step through the code'));
let filter=document.querySelector('#coverageSearch');filter.value='cancellation';filter.oninput();assert.equal(document.querySelectorAll('#coverageRows tr').length,3);filter.value='impossible';filter.oninput();assert.equal(document.querySelectorAll('#coverageRows tr').length,0);
location.hash='#study/DR06';run('render()');assert.equal(document.querySelector('#studyProgress').textContent,'0 / 8 topics reviewed');
// Graceful localStorage denial preserves this tab's work and reports the limitation.
run(`localStorage.setItem=()=>{throw Error('blocked');};localStorage.getItem=()=>{throw Error('blocked');};`);
note=document.querySelector('#studyNotes');note.value='Storage-denied note';note.oninput();assert(document.querySelector('#studySaved').textContent.includes('unavailable'));run('render()');assert.equal(document.querySelector('#studyNotes').value,'Storage-denied note');
run(`localStorage.getItem=k=>null;localStorage.setItem=(k,v)=>{};`);
let deepViews=0;
for(const scope of [...catalog,'DR07','DR01'])for(const flow of ['save','submit','approve']){
 const count=run(`studyFrames(${JSON.stringify(scope)},${JSON.stringify(flow)}).length`);
 for(let i=0;i<count;i++){
  location.hash=`#deep/${scope}/${flow}/${i}`;run('render()');
  assert.equal(document.querySelector('#deepScope').value,scope);
  assert(document.querySelector('#deepMethod pre'));
  assert(!document.querySelector('main').textContent.includes('undefined'),location.hash);
  assert.equal(document.querySelectorAll('.study-checkpoints [aria-current="step"]').length,1);
  const select=document.querySelector('.method-select');const options=[...select.querySelectorAll('option')];
  for(const option of options){select.value=option.value;select.onchange({target:select});assert(document.querySelector('.method-detail').textContent.includes(run(`evidence[${JSON.stringify(option.value)}].rev`)));}
  deepViews++;
 }
}
location.hash='#deep/DR07/approve/999';run('render()');assert(document.querySelector('.study-checkpoints [aria-current="step"]').textContent.includes('9'));
location.hash='#study-lab/DR06';run('render()');document.querySelector('#studyGrade').click();assert(document.querySelector('#studyScore').textContent.includes('0 answered'));
const answers=run('studyQuestions.map(q=>q[2])');answers.forEach((v,i)=>document.querySelector(`input[name="study-q-${i}"][value="${v}"]`).checked=true);document.querySelector('#studyGrade').click();assert(document.querySelector('#studyScore').textContent.includes('6 correct'));
// Reference ER: all nodes/edges are navigable; every proof points to actual evidence.
for(const ref of ['DR07','DR01']){
 location.hash='#reference-db/'+ref;run('render()');
 const model=run(`referenceErModel('${ref}')`);
 assert.equal(document.querySelectorAll('.reference-edge').length,ref==='DR07'?8:10);
 for(const node of model.nodes){
  document.querySelector(`[data-reference-choice="${node.id}"]`).click();
  assert.equal(document.querySelector(`[data-reference-node="${node.id}"]`).getAttribute('aria-pressed'),'true');
  assert(document.querySelector('#referenceInspector').textContent.includes(node.table));
  assert(document.querySelector('#referenceProof pre'));
  const [flow,index]=node.read.split('/');assert(Number(index)<run(`studyFrames('${ref}','${flow}').length`));
 }
 for(let i=0;i<model.edges.length;i++){
  document.querySelector(`[data-reference-link="${i}"]`).click();assert.equal(document.querySelectorAll('.reference-edge.selected').length,1);
  assert(document.querySelector('#referenceInspector').textContent.includes(model.edges[i][3]));
 }
 assert(!document.querySelector('main').textContent.includes('undefined'));
 assert(model.edges.every(e=>e[5].every(k=>run(`Boolean(evidence[${JSON.stringify(k)}])`))));
}
console.log(`${studyViews} study/worksheet pages; ${deepViews} source checkpoints; per-service progress, notes, safe export, blocked storage, quiz scoring, and both reference ER interaction models passed.`);
// Architecture maps stay scoped, filter both repository and source text, and handle no results.
for(const scope of [...catalog,'DR07','DR01']){
 location.hash='#architecture/'+scope;run('render()');assert(document.querySelector('#architectureSource pre'));
 const search=document.querySelector('#architectureSearch'),repo=document.querySelector('#architectureRepo');
 repo.value='MOH-Profile';repo.onchange();
 for(const el of document.querySelectorAll('[data-architecture-source]'))assert(el.textContent.includes('MOH-Profile'));
 search.value='no-such-inspected-method';search.oninput();assert.equal(document.querySelectorAll('[data-architecture-source]').length,0);
 assert(document.querySelector('#architectureFiles').textContent.includes('not proof'));
}
// Source links including numerical reference IDs must survive page reload routing.
location.hash='#core-source/r7saveApplication';run('render()');assert(document.querySelector('#selectedSource').textContent.includes('PharmacyBrandNameRenewalStrategy.java'));
console.log('25 scoped architecture maps, repository/search filters and numbered source deep links passed.');
location.hash='';run('render()');assert(document.querySelector('#studyService'));assert(document.querySelector('.implementation-notice').hidden);
location.hash='#flow/save/0';run('render()');assert(!document.querySelector('.implementation-notice').hidden);assert(document.querySelector('.method-select'));
for(const ref of ['DR07','DR01']){location.hash='#reference-db/'+ref;run('render()');for(const el of document.querySelectorAll('[data-reference-choice]')){el.click();assert(document.querySelector('#referenceInspector pre').textContent.startsWith('SELECT * FROM '));}}
console.log('Root study-desk entry, original flow source inspector and read-only ER lookup examples passed.');
// New ER badges and nodes must not obscure each other, including the long party-role edge.
for(const ref of ['DR07','DR01']){
 location.hash='#reference-db/'+ref;run('render()');const nodes=run(`referenceErModel('${ref}').nodes`);
 for(const badge of document.querySelectorAll('.reference-edge rect')){const x=Number(badge.getAttribute('x')),y=Number(badge.getAttribute('y')),w=Number(badge.getAttribute('width')),h=Number(badge.getAttribute('height'));for(const n of nodes)assert(!(x<n.x+100&&x+w>n.x-100&&y<n.y+80&&y+h>n.y),ref+' badge overlaps '+n.id);}
}
console.log('Reference ER badge/node geometry passed.');
