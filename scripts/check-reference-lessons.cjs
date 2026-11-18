// Run with NODE_PATH pointing to a temporary linkedom install. No HTTP or browser used.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const {window}=parseHTML(html);const document=window.document;
window.HTMLElement.prototype.scrollIntoView=function(){};window.HTMLElement.prototype.focus=function(){};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){const o=this.querySelector('option[selected]')||this.querySelector('option');return o?o.getAttribute('value')||o.textContent:'';},set(v){for(const o of this.querySelectorAll('option')){if((o.getAttribute('value')||o.textContent)===String(v))o.setAttribute('selected','');else o.removeAttribute('selected');}}});
Object.defineProperty(window.HTMLInputElement.prototype,'checked',{get(){return this.hasAttribute('checked');},set(v){if(v)this.setAttribute('checked','');else this.removeAttribute('checked');}});
window.scrollTo=()=>{};const location={hash:'#subservices/DR09.03/0'};window.location=location;
const stored=new Map();
const context=vm.createContext({window,document,location,console,Map,Set,structuredClone,localStorage:{getItem(k){return stored.get(k)||null;},setItem(k,v){stored.set(k,v);}},setTimeout,clearTimeout});
const run=code=>vm.runInContext(code,context);
for(const match of html.matchAll(/<script defer src="([^"?]+)/g)){const filename=match[1];vm.runInContext(fs.readFileSync(path.join(root,filename),'utf8'),context,{filename});}
const services=run('drServiceCatalog.filter(s=>s.code.includes(".")).map(s=>({code:s.code,name:s.name}))');
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
 assert.equal(document.querySelectorAll('#coverageRows tr').length,10);
 assert(document.querySelector('main').textContent.includes('not backend implementation'));
 location.hash='#study-lab/'+code;run('render()');
 assert.equal(document.querySelectorAll('.study-question').length,6);
 assert(!document.querySelector('main').textContent.includes('undefined'));
 studyViews+=2;
}
location.hash='#study/DR09.01';run('render()');
let check=document.querySelector('[data-study-check="methods"]');check.checked=true;check.onchange();
let note=document.querySelector('#studyNotes');note.value='<script>must remain text</script> review scope';note.oninput();
run('render()');assert(document.querySelector('[data-study-check="methods"]').checked);assert.equal(document.querySelector('#studyNotes').value,'<script>must remain text</script> review scope');assert.equal(document.querySelector('#studyProgress').textContent,'1 / 8 topics reviewed');assert.equal(document.querySelectorAll('main script').length,0);
document.querySelector('#studyExport').click();assert(document.querySelector('#studyReport').textContent.includes('[x] 3 · Step through the code'));
let filter=document.querySelector('#coverageSearch');filter.value='cancellation';filter.oninput();assert.equal(document.querySelectorAll('#coverageRows tr').length,1);filter.value='impossible';filter.oninput();assert.equal(document.querySelectorAll('#coverageRows tr').length,0);
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
console.log('Scoped architecture maps, repository/search filters and numbered source deep links passed.');
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

// DR09-only subservice catalog and registration links; removed routes lead to the model.
assert.equal(services.length,7);
assert(services.every(s=>s.code.startsWith('DR09.')));
for(const hash of ['#services/DR06.01','#subservices/DR08.04/0','#study/DR08.01','#dr06-renewal/0','#dr08-change/name/0','#lifecycle-guide/DR08/DR08.01/success/0']){
 location.hash=hash;run('render()');assert.equal(document.querySelector('#conciseService').value,'DR09.03',hash);
}
location.hash='#services/DR09';run('render()');let family=document.querySelector('#serviceFamily');family.value='all';family.onchange();assert.equal(document.querySelectorAll('#serviceCards a').length,10);
for(const el of document.querySelectorAll('#serviceCards a'))assert(!/DR(?:06|08)\./.test(el.textContent));
location.hash='#core';run('render()');for(const a of document.querySelectorAll('main a'))assert(!/^#dr(?:06|08)-(renewal|change|party|output)/.test(a.getAttribute('href')));
let lessonViews=0;
for(const service of services){
 for(const scenario of service.code==='DR09.02'?['success']:['success','stale','rollback','duplicate']){
  const count=run(`dr09LessonFrames(studyService('${service.code}'),'${scenario}').length`);
  for(let index=0;index<count;index++){
   location.hash=`#subservices/${service.code}/${index}/${scenario}`;run('render()');
   assert.equal(document.querySelector('#conciseService').value,service.code);
   assert.equal(document.querySelector('#conciseCheckpoint').value,String(index));
   assert.equal(document.querySelectorAll('#dr09Sequence [aria-current="step"]').length,1);
   assert.equal(document.querySelectorAll('.concise-stages [aria-current="step"]').length,1);
   assert(document.querySelector('#conciseDocuments').compareDocumentPosition(document.querySelector('#dr09Sequence'))&4);
   assert(document.querySelector('#conciseImplementation pre'));
   assert(!document.querySelector('main').textContent.includes('undefined'),location.hash);
   assert.equal(document.querySelectorAll('#conciseService option').length,7);
   if(service.code!=='DR09.02'){
    assert.equal(document.querySelectorAll('.dr09-er-node').length,8);
    assert.equal(document.querySelectorAll('.dr09-er-edge').length,6);
    const scenarioSelect=document.querySelector('#dr09Scenario');assert.equal(scenarioSelect.value,scenario);
    for(const button of document.querySelectorAll('[data-d9-choice]')){
     button.click();assert.equal(document.querySelector(`[data-d9-node="${button.dataset.d9Choice}"]`).getAttribute('aria-pressed'),'true');
     assert(document.querySelector('#dr09RowInspector h3'));
     assert(document.querySelector('#conciseImplementation .method-select'));
    }
    for(const button of document.querySelectorAll('[data-d9-link]')){button.click();assert.equal(document.querySelectorAll('.dr09-er-edge.selected').length,1);}
   }
   lessonViews++;
  }
 }
}
// Observable row-state transitions: no new Profile results on save; atomic rollback and replay.
run(`{
 for(const [code,op] of Object.entries(currentDr09Operations)){
  const service=studyService(code),frames=dr09LessonFrames(service),by=id=>frames.find(f=>f.id===id);
  if(frames.length!==22)throw Error('Expected 22 detailed checkpoints');
  if(frames.filter(f=>f.stage===0).length!==6||frames.filter(f=>f.stage===1).length!==6||frames.filter(f=>f.stage===2).length!==10)throw Error('Incomplete core stage');
  for(const frame of frames)for(const ref of frame.refs)if(!evidence[ref])throw Error('Unknown proof '+ref);
  const initial=dr09Rows(service,by('request')),pending=dr09Rows(service,by('persist')),draft=dr09Rows(service,by('draftCommit')),mutation=dr09Rows(service,by('mutate')),receipt=dr09Rows(service,by('receipt')),final=dr09Rows(service,by('commit'));
  if(initial.app.data!==null||initial.receipt.data!==null)throw Error('Rows appeared too early');
  if(!pending.app.state.includes('Pending')||!draft.app.state.includes('Committed'))throw Error('Draft commit boundary hidden');
  if(draft.licence.data.id!==2502||draft.registration.data.registration_id!==2402||draft.snapshot.data.product_name!=='Product B')throw Error('Draft changed Profile');
  if(mutation.receipt.data!==null||receipt.receipt.data.application_id!==2900||!receipt.receipt.state.includes('Pending')||final.receipt.state!=='Committed')throw Error('Receipt atomic state wrong');
  if(final.other.data.status!=='ACTIVE'||final.profile.data.status!=='ACTIVE')throw Error('Unselected A or profile terminated');
  if(op.type==='RENEW'&&(final.licence.data.renewed_count!==1||final.licence.data.expiry_date!=='2029-12-01T00:00:00Z'))throw Error('Renewal result wrong');
  if(op.type==='UPDATE')for(const [key,value]of Object.entries(op.change))if(final.snapshot.data[key]!==value)throw Error('Change not reflected in inspector');
  if(op.type==='TERMINATE'&&final.licence.data.status!=='TERMINATED')throw Error('Cancellation result wrong');
  const rollback=dr09LessonFrames(service,'rollback').at(-1),restored=dr09Rows(service,rollback);
  if(restored.app.data.status!=='APPROVED'||restored.receipt.data!==null||restored.licence.data.status!=='ACTIVE'||restored.licence.data.renewed_count!==0||restored.snapshot.data.product_name!=='Product B')throw Error('Rollback retained pending work');
  const duplicate=dr09LessonFrames(service,'duplicate').map(f=>dr09Rows(service,f));if(duplicate.some(rows=>JSON.stringify(rows)!==JSON.stringify(final)))throw Error('Duplicate mutated committed result');
  const stale=dr09Rows(service,dr09LessonFrames(service,'stale').at(-1));if(stale.app.data.status!=='DRAFT'||stale.section.data.data.source_product.pack_size!=='Box 10'||stale.snapshot.data.pack_size!=='Box 12 from another operation')throw Error('Stale source overwrote frozen snapshot');
 }
}`);
// Sequence navigation preserves scenario; table selection synchronizes Kafka highlights and source.
location.hash='#subservices/DR09.03/13';run('render()');document.querySelector('[data-d9-choice="section"]').click();assert(document.querySelectorAll('#dr09CheckpointData .dr09-field-hit').length>0);assert(document.querySelector('.method-detail').textContent.includes('ApplicationSection.java'));
let scenario=document.querySelector('#dr09Scenario');scenario.value='rollback';scenario.onchange({target:scenario});assert.equal(location.hash,'#subservices/DR09.03/0/rollback');
location.hash='#subservices/DR09.03/0/rollback';run('render()');assert([...document.querySelectorAll('#dr09Sequence a')].every(a=>a.getAttribute('href').endsWith('/rollback')));
let checkpoint=document.querySelector('#conciseCheckpoint');checkpoint.value='2';checkpoint.onchange({target:checkpoint});assert.equal(location.hash,'#subservices/DR09.03/2/rollback');
// ER cardinality badges fit between nodes; Kafka path has no FK cardinality or fabricated receipt edge.
run(`{const nodes=dr09ErNodes();for(const edge of dr09ErEdges)for(const node of nodes){if(edge.x+25>node.x&&edge.x-25<node.x+220&&edge.y+12>node.y&&edge.y-12<node.y+110)throw Error('Badge overlaps '+node.id);}if(dr09ErEdges.some(e=>e.from==='receipt'||e.to==='receipt'))throw Error('Receipt cross-database FK fabricated');}`);
console.log(`${lessonViews} DR09 core/scenario views: interactive sequences, ER relations/selection, exact row transitions, rollback/replay isolation, source/Kafka synchronization and removal navigation passed.`);
// Field tracing remains synchronized when switching the selected source file.
location.hash='#subservices/DR09.03/13';run('render()');document.querySelector('[data-d9-choice="section"]').click();document.querySelector('[data-d9-field="data"]').click();
let sourceChoice=document.querySelector('#conciseImplementation .method-select');sourceChoice.value='d9Draft';sourceChoice.onchange({target:sourceChoice});assert(document.querySelectorAll('#conciseImplementation .method-detail .dr09-field-hit').length>0);
document.querySelector('[data-d9-choice="licence"]').click();document.querySelector('[data-d9-field="expiry_date"]').click();assert(document.querySelectorAll('#conciseImplementation .method-detail .dr09-field-hit').length>0);
assert.equal(document.querySelector('#serviceNav').getAttribute('href'),'#subservices/DR09.03/0');
console.log('Row-field-to-Java tracing, source-switch highlighting and direct header navigation passed.');
