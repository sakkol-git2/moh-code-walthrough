// Run with NODE_PATH pointing to a temporary linkedom install. No HTTP or browser used.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const {parseHTML}=require('linkedom');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const {window}=parseHTML(html);const document=window.document;
window.HTMLElement.prototype.scrollIntoView=function(){};window.HTMLElement.prototype.focus=function(){};
Object.defineProperty(window.HTMLSelectElement.prototype,'value',{get(){const o=this.querySelector('option[selected]')||this.querySelector('option');return o?o.getAttribute('value')||o.textContent:'';},set(v){for(const o of this.querySelectorAll('option')){if((o.getAttribute('value')||o.textContent)===String(v))o.setAttribute('selected','');else o.removeAttribute('selected');}}});
window.scrollTo=()=>{};const location={hash:'#services/DR06.01'};window.location=location;
const context=vm.createContext({window,document,location,console,Map,Set,structuredClone,localStorage:{getItem(){return null;},setItem(){}},setTimeout,clearTimeout});
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
