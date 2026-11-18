// Simulated row states, derived from pinned methods; all values and IDs are teaching fixtures.
function dr09Result(operation){
 const snapshot={registration_id:2402,profile_id:209,prerequisite_profile_id:42,application_type:'IMPORT',product_name:'Product B',pack_size:'Box 10',mah_name:'Holder B',mah_address:'Holder address B',manufacturer_name:'Manufacturer B',manufacturer_address:'Factory address B'};
 const licence={id:2502,profile_id:209,status:'ACTIVE',expiry_date:'2026-12-01T00:00:00Z',renewed_count:0};
 if(operation.type==='UPDATE')Object.assign(snapshot,operation.change);
 if(operation.type==='RENEW')Object.assign(licence,{expiry_date:'2029-12-01T00:00:00Z',renewed_count:1,issue_date:'2026-11-18T08:00:00Z'});
 if(operation.type==='TERMINATE')licence.status='TERMINATED';
 return {snapshot,licence};
}
function dr09Rows(service,frame){
 const op=currentDr09Operations[service.code];
 const order=currentDr09Steps(service,op).findIndex(s=>s.id===frame.id);
 const special=frame.id.startsWith('stale')?'stale':frame.id.startsWith('rollback')?'rollback':frame.id.startsWith('duplicate')?'duplicate':'';
 const position=special==='stale'?6:special==='rollback'?(frame.id==='rollbackAfter'?14:frame.id==='rollbackBefore'?18:20):special==='duplicate'?21:order;
 const result=dr09Result(op),initial=dr09Result({...op,type:'INITIAL'});
 const sourceProduct=Object.fromEntries(Object.entries(initial.snapshot).filter(([key])=>!['registration_id','profile_id'].includes(key)));
 const approvedPayload={contract_version:1,profile_id:209,products:[{license_id:2502,source_expiry_date:'2026-12-01T00:00:00Z',source_product:structuredClone(sourceProduct),...(op.option?{changes:[{service_code:op.option,values:op.change}]}:op.type==='TERMINATE'?{cancellation_reason:'Applicant requests withdrawal'}:{changed_documents:['product_photo']})}],_user_id:'sample-owner',_application_no:'DEMO-2900',_approved_date:'2026-11-18T08:00:00Z'};
 const mutated=position>=18&&!(special==='rollback'&&frame.id==='rollbackAfter');
 const rows={
 app:{data:position<4?null:{id:2900,profile_id:209,status:position<10?'DRAFT':position===10?'AWAITING_PAYMENT':position===11?'SUBMITTED':'APPROVED',license_ids:[2502]},state:position<4?'Absent':position===4?'Pending draft write':'Committed'},
 section:{data:position<4?null:{id:2912,application_id:2900,profile_id:209,type:'DR09_PRODUCT',data:{license_id:2502,source_expiry_date:'2026-12-01T00:00:00Z',source_product:structuredClone(sourceProduct),...(op.option?{changes:[{service_code:op.option,values:op.change}]}:op.type==='TERMINATE'?{cancellation_reason:'Applicant requests withdrawal'}:{changed_documents:['product_photo']})}},state:position<4?'Absent':position===4?'Pending draft write':'Committed frozen source'},
 profile:{data:{id:209,status:'ACTIVE',user_id:'sample-owner'},state:position>=19&&position<21?'Pending audit update':'Previously committed'},
 registration:{data:{registration_id:2402,profile_id:209,license_id:2502,service_code:'GDHT-HS-L'},state:position>=19&&position<21?'Pending synchronization':'Previously committed'},
 licence:{data:mutated?result.licence:initial.licence,state:mutated?(position<21?'Pending operation':'Committed result'):'Previously committed'},
 snapshot:{data:mutated?result.snapshot:initial.snapshot,state:mutated?(position<21?'Pending operation':'Committed result'):'Previously committed'},
 receipt:{data:position<19?null:{application_id:2900,service_code:op.runtime,approved_payload:approvedPayload},state:position<19?'Absent':position<21?'Pending insert / flush':'Committed'},
 other:{data:{id:2501,profile_id:209,status:'ACTIVE'},state:'Committed and unchanged'}
 };
 if(special==='stale'){rows.snapshot.data.pack_size='Box 12 from another operation';rows.snapshot.state='Other operation already committed';rows.app.data.status='DRAFT';rows.app.state='Earlier draft remains committed';}
 if(special==='rollback'&&frame.id==='rollbackAfter'){rows.receipt={data:null,state:'Absent after rollback'};rows.app.data.status='APPROVED';rows.app.state='Earlier approval remains committed';}
 return rows;
}
function dr09ErNodes(){return [
 {id:'app',name:'applications',label:'Operation application',key:'id 2900',x:20,y:80,refs:['d9Draft'],fields:['application_id','status']},
 {id:'section',name:'application_sections',label:'B’s draft section',key:'id 2912 · application_id 2900',x:20,y:360,refs:['d9Section','d9SectionSchema','d9SectionFk','d9Draft'],fields:['license_id','source_product','source_expiry_date','changes','attachments']},
 {id:'profile',name:'profiles',label:'Existing selected profile',key:'id 209',x:550,y:80,refs:['d9Approval'],fields:['profile_id']},
 {id:'registration',name:'regulatory_registrations',label:'B’s registration',key:'registration_id 2402',x:550,y:300,refs:['studyRegistrationsSchema','studyRegistrationFks','d9Approval'],fields:['registration_id','license_id']},
 {id:'licence',name:'licenses',label:'B’s existing licence',key:'id 2502 · profile_id 209',x:550,y:520,refs:['studyLicensesSchema','studyLicenseProfileFk','d9Approval'],fields:['license_id','source_expiry_date','expiry_date','renewed_count']},
 {id:'snapshot',name:'health_supporting_product_license_details',label:'B’s approved product facts',key:'registration_id 2402',x:960,y:300,refs:['d9SnapshotEntity','d9SnapshotSchema','d9UpdateHandler'],fields:['product_name','pack_size','application_type','mah_name','mah_address','manufacturer_name','manufacturer_address']},
 {id:'receipt',name:'health_supporting_operation_receipts',label:'Operation replay receipt',key:'application_id 2900 · PK',x:960,y:80,refs:['d9Receipt','d9ReceiptSchema','d9Approval'],fields:['application_id','contract_version']},
 {id:'other',name:'licenses · unselected A',label:'A stays unchanged',key:'id 2501 · not selected',x:960,y:520,refs:['d9Approval'],fields:[]}
 ];}
const dr09ErEdges=[
 {from:'section',to:'app',ratio:'N:1',key:'application_sections.application_id → applications.id',note:'Many-to-one; reverse one-to-many. Nullable FK in the schema. A draft can have zero or many sections.',path:'M130 360 V190',x:130,y:275,refs:['d9SectionSchema','d9SectionFk']},
 {from:'registration',to:'profile',ratio:'N:1',key:'regulatory_registrations.profile_id → profiles.id',note:'Many-to-one; reverse one-to-many. This schema permits a null profile_id; the DR09 handler requires the selected profile.',path:'M660 300 V190',x:660,y:245,refs:['studyRegistrationsSchema','studyRegistrationFks']},
 {from:'registration',to:'licence',ratio:'1:1',key:'regulatory_registrations.license_id → licenses.id',note:'One-to-one through a required UNIQUE FK. Each licence has at most one registration.',path:'M660 410 V520',x:660,y:465,refs:['studyRegistrationsSchema','studyRegistrationFks']},
 {from:'licence',to:'profile',ratio:'N:1',key:'licenses.profile_id → profiles.id',note:'Many-to-one; reverse one-to-many. The licence profile FK is required. A profile can have many licences.',path:'M550 575 H490 V135 H550',x:490,y:465,refs:['studyLicensesSchema','studyLicenseProfileFk']},
 {from:'snapshot',to:'registration',ratio:'1:1',key:'detail.registration_id → regulatory_registrations.registration_id',note:'One-to-one through the detail PK/FK. A registration can have zero or one detail in this domain table.',path:'M960 355 H770',x:865,y:355,refs:['d9SnapshotSchema','d9SnapshotEntity']},
 {from:'snapshot',to:'profile',ratio:'N:1',key:'detail.profile_id → profiles.id',note:'Many-to-one; reverse one-to-many. Separate nullable FK to the profile; it is not the detail’s primary key.',path:'M1070 300 V40 H660 V80',x:870,y:40,refs:['d9SnapshotSchema']}
];
function mountDr09ER(service,frames,index,scenario){
 const frame=frames[index],nodes=dr09ErNodes(),rows=dr09Rows(service,frame),before=index?dr09Rows(service,frames[index-1]):dr09Rows(service,{id:scenario==='duplicate'?'duplicateBefore':scenario==='rollback'?'review':scenario==='stale'?'recheck':'request'});
 const host=main.querySelector('#dr09ErPanel');let selected=(frame.access||[]).at(-1)||'app';
 const changed=id=>JSON.stringify(before[id])!==JSON.stringify(rows[id]);
 host.innerHTML='<div class="spread"><h2>Product B’s database at this checkpoint</h2><span class="tag">Synchronized ER + row inspector</span></div><p>Click a table or relation. Highlighted tables are accessed here; a green corner marks changed example values. Each row says whether it is pending or committed. Existing Profile rows are present before the operation starts. A is another row in licenses; its same profile FK is not drawn twice.</p><div class="dr09-er-board" tabindex="0"><svg viewBox="0 0 1230 680" role="group" aria-label="DR09 checkpoint database relationships"><defs><marker id="d9-er-tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#315c52"/></marker></defs><rect class="er-db-region" x="5" y="10" width="270" height="655" rx="15"/><rect class="er-db-region" x="460" y="10" width="760" height="655" rx="15"/><text x="20" y="34">Application database</text><text x="480" y="34">Profile database</text><path class="dr09-message-link" d="M240 410 H390 V620 H460"/><text class="dr09-message-label" x="285" y="560">JSON IDs / Kafka</text><text class="dr09-message-label" x="285" y="582">No cross-database FK</text>'+dr09ErEdges.map((e,i)=>'<g class="dr09-er-edge" data-d9-edge="'+i+'"><path d="'+e.path+'" marker-end="url(#d9-er-tip)"/><rect x="'+(e.x-25)+'" y="'+(e.y-12)+'" width="50" height="24" rx="6"/><text x="'+e.x+'" y="'+(e.y+5)+'" text-anchor="middle">'+e.ratio+'</text></g>').join('')+nodes.map(n=>'<g role="button" tabindex="0" class="dr09-er-node '+((frame.access||[]).includes(n.id)?'accessed':'')+' '+(changed(n.id)?'changed':'')+'" data-d9-node="'+n.id+'" aria-label="Inspect '+n.name+'"><rect x="'+n.x+'" y="'+n.y+'" width="220" height="110" rx="10"/><text x="'+(n.x+12)+'" y="'+(n.y+25)+'">'+n.label+'</text><text class="dr09-key" x="'+(n.x+12)+'" y="'+(n.y+49)+'">'+n.key+'</text><text class="dr09-state" x="'+(n.x+12)+'" y="'+(n.y+77)+'">'+rows[n.id].state+'</text>'+(changed(n.id)?'<circle cx="'+(n.x+205)+'" cy="'+(n.y+10)+'" r="6"/>':'')+'</g>').join('')+'</svg></div><div class="choices check">'+nodes.map(n=>'<button class="btn light" data-d9-choice="'+n.id+'">'+n.label+'</button>').join('')+'</div><section id="dr09RowInspector" class="dr09-row-inspector" aria-live="polite"></section><details class="proof"><summary>Foreign-key types and message ID boundaries</summary><div class="rows"><table><thead><tr><th>Child → parent</th><th>Cardinality</th><th>Meaning</th></tr></thead><tbody>'+dr09ErEdges.map((e,i)=>'<tr data-d9-relation="'+i+'"><th><button class="relation-select" data-d9-link="'+i+'">'+e.key+'</button></th><td>'+e.ratio+'</td><td>'+e.note+'</td></tr>').join('')+'</tbody></table></div><p>The receipt application_id is a Profile PK copied from Application; its schema declares no FK. application_sections.profile_id and its JSON license_id/source IDs are also copied cross-service references. Neither matching numbers nor a Kafka message create an SQL FK. No many-to-many relationship is shown here.</p></details>';
 function select(id,edgeIndex){
  selected=id;const node=nodes.find(n=>n.id===id),edge=edgeIndex===undefined?null:dr09ErEdges[edgeIndex];
  host.querySelectorAll('[data-d9-node],[data-d9-choice]').forEach(el=>el.setAttribute('aria-pressed',String((el.dataset.d9Node||el.dataset.d9Choice)===id)));
  host.querySelectorAll('[data-d9-edge],[data-d9-relation]').forEach(el=>{const i=Number(el.dataset.d9Edge??el.dataset.d9Relation),e=dr09ErEdges[i];el.classList.toggle('selected',edge?i===edgeIndex:e.from===id||e.to===id);});
  const prev=before[id].data,after=rows[id].data,keys=[...new Set([...Object.keys(prev||{}),...Object.keys(after||{})])];
  host.querySelector('#dr09RowInspector').innerHTML='<h3>'+node.name+'</h3><p><strong>'+rows[id].state+'</strong> · '+node.key+'. All IDs and field values are fictional teaching examples.</p>'+(edge?'<p><strong>'+edge.ratio+' · '+edge.key+'</strong><br>'+edge.note+'</p>':'')+'<div class="rows"><table><thead><tr><th>Field</th><th>Before this checkpoint</th><th>After this checkpoint</th></tr></thead><tbody>'+(keys.length?keys.map(key=>'<tr class="'+(JSON.stringify(prev?.[key])!==JSON.stringify(after?.[key])?'sequence-row-change':'')+'"><th><button class="relation-select" data-d9-field="'+key+'">'+key+'</button></th><td>'+escapeHtml(JSON.stringify(prev?.[key])??'No row / value')+'</td><td>'+escapeHtml(JSON.stringify(after?.[key])??'No row / value')+'</td></tr>').join(''):'<tr><td colspan="3">No row exists at this checkpoint.</td></tr>')+'</tbody></table></div><p class="src">'+(id==='other'?'A is deliberately unselected and unchanged in every scenario.':id==='receipt'?'Receipt and mutations share the Profile handler transaction. application_id is the replay identity, not a local relationship to Application.':'Selecting this table also selects its source evidence below. The checkpoint’s request/message panel is highlighted for related field names.')+'</p>';
  const refs=[...new Set([...(edge?edge.refs:node.refs),...frame.refs])];
  mountMethodInspector(main.querySelector('#conciseImplementation'),{...frame,refs});
  const traceStatus=document.createElement('p');traceStatus.className='src';traceStatus.setAttribute('role','status');host.querySelector('#dr09RowInspector').append(traceStatus);
  let fields=node.fields;
  function highlight(){
   const dataPanel=main.querySelector('#dr09CheckpointData');dataPanel.innerHTML=pre(JSON.stringify(frame.data,null,2));
   const dataCode=dataPanel.querySelector('code')||dataPanel.querySelector('pre');
   const messageFields=fields.flatMap(field=>field==='expiry_date'?['expiry_date','source_expiry_date']:field==='data'?['products']:field==='id'&&id==='licence'?['license_id']:[field]);
   dataCode.innerHTML=dataCode.textContent.split('\n').map(line=>'<span class="'+(messageFields.some(field=>line.includes('"'+field+'"'))?'dr09-field-hit':'')+'">'+escapeHtml(line)+'</span>').join('\n');
   traceStatus.textContent='Tracing '+fields.join(', ')+'. '+(dataPanel.querySelector('.dr09-field-hit')?'Related fields are highlighted in the selected request/message excerpt.':'These field names are absent from this selected request/message excerpt; no mapping is inferred.');
   const sourceCode=main.querySelector('#conciseImplementation .method-detail pre code')||main.querySelector('#conciseImplementation .method-detail pre');
   const tokens=fields.flatMap(field=>[field,field.replace(/_([a-z])/g,(_,letter)=>letter.toUpperCase())]).map(field=>field.toLowerCase());
   sourceCode.innerHTML=sourceCode.textContent.split('\n').map(line=>'<span class="'+(tokens.some(token=>line.toLowerCase().includes(token))?'dr09-field-hit':'')+'">'+escapeHtml(line)+'</span>').join('\n');
  }
  highlight();
  const sourceSelect=main.querySelector('#conciseImplementation .method-select'),showSource=sourceSelect.onchange;
  sourceSelect.onchange=event=>{showSource(event);highlight();};
  host.querySelectorAll('[data-d9-field]').forEach(button=>button.onclick=()=>{fields=[button.dataset.d9Field];highlight();});
 }
 host.querySelectorAll('[data-d9-choice]').forEach(el=>el.onclick=()=>select(el.dataset.d9Choice));
 host.querySelectorAll('[data-d9-node]').forEach(el=>{el.onclick=()=>select(el.dataset.d9Node);el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(el.dataset.d9Node);}};});
 host.querySelectorAll('[data-d9-link]').forEach(el=>el.onclick=()=>{const i=Number(el.dataset.d9Link);select(dr09ErEdges[i].from,i);});
 select(selected);
}
