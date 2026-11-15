// Selected field values are explicit teaching fixtures, not database observations.
function inspectorFixture(family,node){
 const f=lifecycleFamilies[family];
 const files=[{id:family==='DR06'?'sample-form-B':'example-B-form',key:'application_form'}];
 const product={id:f.product,application_id:f.application,application_type:'IMPORT',attachments:files};
 if(family==='DR08')product.brand_name_license_id=302;
 if(family==='DR09')product.product_name='Example B';
 const snapshot={registration_id:f.registration,profile_id:99,prerequisite_profile_id:42,application_type:'IMPORT',attachments:files};
 if(family==='DR06'){snapshot.source_application_id=f.application;snapshot.source_product_id=f.product;}
 if(family==='DR08')snapshot.brand_name_license_id=302;
 const values={app:{id:f.application,status:'DRAFT',payment_status:'PENDING'},detail:{application_id:f.application,prerequisite_profile_id:42},product,profile:{id:99,status:'ACTIVE'},registration:{registration_id:f.registration,profile_id:99,license_id:f.licence},licence:{id:f.licence,profile_id:99},snapshot};
 return structuredClone(values[node]);
}
function inspectorSuccessState(family,node,index){
 const row=inspectorFixture(family,node);
 if(node==='profile')return {stored:row,working:row,note:'Only id/status are modelled here. Other enrichment values are outside this fixture.'};
 if(family==='DR06'){
  if(index<9){
   const writes={app:3,detail:4,product:6};const first=writes[node];
   if(first===undefined)return {stored:null,working:null};
   return {stored:index>=8?row:null,working:index>=first?row:null};
  }
  if(['app','detail','product'].includes(node)){
   if(node!=='app')return {stored:row,working:row};
   if(index<18){
    const stored={...row,status:index<14?'DRAFT':index<17?'AWAITING_PAYMENT':'SUBMITTED',payment_status:index<17?'PENDING':'PAID'};
    const working={...stored};
    if(index>=13&&index<15)working.status='AWAITING_PAYMENT';
    if(index>=15)working.payment_status='PAID';
    if(index>=16)working.status='SUBMITTED';
    return {stored,working};
   }
   const stored={...row,status:index<20?'REVIEW':'APPROVED',payment_status:'PAID'};
   return {stored,working:index===19?{...stored,status:'APPROVED'}:stored,note:'REVIEW is the starting precondition for the approval segment after external review.'};
  }
  const first=node==='snapshot'?26:25;
  return {stored:index>=27?row:null,working:index>=first?row:null};
 }
 if(['app','detail','product'].includes(node)){
  if(index===0)return {stored:null,working:null};
  if(node==='app'){
   if(index>=4){row.status=index===4?'SUBMITTED':'APPROVED';row.payment_status='PAID';}
  }
  return {stored:index>=2?row:null,working:row,note:index===4?'This summary checkpoint includes waiting-state commit and a later payment transaction. The detailed lesson expands those boundaries.':''};
 }
 return {stored:index>=8?row:null,working:index>=7?row:null};
}
function rowInspectorState(family,code,scenario,index,node){
 const baseline=inspectorFixture(family,node);
 if(code!==family){
  if(node==='app'){baseline.status='APPROVED';baseline.payment_status='PAID';}
  return {before:baseline,working:baseline,after:baseline,result:'Existing row retained',note:'This is the original registration row. Unsupported subservice routing creates no new operation row.'};
 }
 if(scenario==='validation'){
  if(['registration','licence','snapshot'].includes(node))return {before:null,working:null,after:null,result:'No Profile result reached'};
  if(node==='product'){
   if(family==='DR06')baseline.attachments=[];else baseline.application_type=null;
  }
  if(node==='app')baseline.tracking_no=null;
  const pending=structuredClone(baseline);
  if(node==='app')pending.tracking_no='DEMO-TRACK-NEW';
  return {before:baseline,working:index===0?baseline:pending,after:baseline,result:index===0?'Existing incomplete draft':index===1?'Uncommitted work at validation failure':'Pending changes rolled back',note:index===2?'The transaction view column shows the discarded proposal. The saved incomplete B row remains incomplete.':'Tracking token is an illustrative value for a newly assigned tracking number. Other required values are assumed valid.'};
 }
 if(scenario==='rollback'){
  if(node==='app'){baseline.status='APPROVED';baseline.payment_status='PAID';}
  if(['registration','licence','snapshot'].includes(node))return {before:null,working:null,after:null,result:index===0?'B result not created':index===1?'B processing failed; assignments unspecified':'No B result committed',note:'The injected failure occurs during B processing after A save calls. Exact B field assignment order is unspecified. A pending registration/licence/snapshot rolls back with this transaction.'};
  return {before:baseline,working:baseline,after:baseline,result:node==='app'?'Earlier Application commit survives':index===2?'Existing row retained after Profile rollback':'Existing selected fields retained',note:node==='profile'?'Profile enrichment may touch fields outside this id/status fixture. Those pending changes roll back.':''};
 }
 const current=inspectorSuccessState(family,node,index);
 const previous=family==='DR06'&&node==='app'&&index===18?current:index?inspectorSuccessState(family,node,index-1):{stored:node==='profile'?baseline:null};
 return {before:previous.stored,working:current.working,after:current.stored,result:JSON.stringify(previous.stored)!==JSON.stringify(current.stored)?'Stored row changed / committed':JSON.stringify(current.working)!==JSON.stringify(current.stored)?'Pending values · commit not reached':'Stored values unchanged',note:current.note||''};
}
function inspectorValue(row,key){
 if(row===null)return 'ROW ABSENT';
 if(!Object.hasOwn(row,key))return 'FIELD OUTSIDE FIXTURE';
 return JSON.stringify(row[key]);
}
function rowInspectorHTML(family,code,scenario,index,node){
 const state=rowInspectorState(family,code,scenario,index,node);
 const model=guideERModel(family,code,scenario,index),selected=model.nodes.find(item=>item.id===node);
 const keys=[...new Set([state.before,state.working,state.after].filter(Boolean).flatMap(Object.keys))];
 const rows=keys.map(key=>{
  const before=inspectorValue(state.before,key),working=inspectorValue(state.working,key),after=inspectorValue(state.after,key);
  const trace=inspectorFieldTrace(node,key);
  const label=trace?'<button type="button" class="row-trace-button" data-row-trace="'+trace+'">'+escapeHtml(key)+'</button>':escapeHtml(key);
  return '<tr data-row-field="'+key+'" class="'+(before!==working||before!==after?'sequence-row-change':'')+'"><th scope="row">'+label+'</th><td>'+escapeHtml(before)+'</td><td>'+escapeHtml(working)+'</td><td>'+escapeHtml(after)+'</td></tr>';
 }).join('');
 return '<h3>Before-and-after field inspector</h3><label class="field">Selected table <select id="inspectorTable">'+model.nodes.map(item=>'<option value="'+item.id+'" '+(item.id===node?'selected':'')+'>'+item.name+'</option>').join('')+'</select></label><p><strong>'+escapeHtml(selected.name)+' · '+escapeHtml(state.result)+'</strong></p><div class="rows"><table><thead><tr><th>Field</th><th>Stored before checkpoint</th><th>Transaction view / discarded work</th><th>Stored at checkpoint end</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+(keys.length?'':'<p>No row for this selected table exists at this checkpoint. The scenario note explains any unspecified failure assignments.</p>')+(state.note?'<p>'+state.note+'</p>':'')+'<p class="src">Selected values within a fictional field subset. Attachment arrays contain illustrative document entries; they are not a complete checklist. ROW ABSENT differs from SQL null. FIELD OUTSIDE FIXTURE means no value is modelled. Generated IDs and file IDs are illustrative. No database query is performed.</p><p><code>'+escapeHtml(lifecycleGuideFrames(family,code,scenario)[index].method)+'</code></p>';
}
