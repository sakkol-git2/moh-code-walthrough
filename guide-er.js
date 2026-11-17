const guideERSelections = {};
function guideERState(family,code,scenario,index){
 const states={app:'Not created',detail:'Not created',product:'Not created',profile:'Existing profile 99',registration:'Not created',licence:'Not created',snapshot:'Not created'};
 let active=[];
 if(code!==family){Object.keys(states).forEach(key=>states[key]='Existing committed row retained');return {states,active:index?[]:['registration'],action:index?'Missing strategy · no domain writes':'Read existing target'};}
 if(scenario==='validation'){
  states.app=index===1?'Tracking/context edits pending':'DRAFT · committed original values';states.detail='Saved prerequisite 42';states.product=family==='DR06'?'Saved B · missing own form':'Saved B · missing origin';
  return {states,active:index===1?['app','product']:['product'],action:index===2?'Rollback submission edits · existing draft survives':index===1?'Validation failure · no invoice reached':'Inspect incomplete saved draft'};
 }
 if(scenario==='rollback'){
  states.app='APPROVED · earlier commit';states.detail='Saved prerequisite 42';states.product='Saved approved B';
  states.profile=index===1?'Enrichment pending':index===2?'Existing values restored':'Existing profile 99';
  ['registration','licence','snapshot'].forEach(key=>states[key]=index===1?'B processing incomplete · no committed result':index===2?'No new B row · rollback':'Not created');
  return {states,active:index?['profile','registration','licence','snapshot']:['app'],action:index===1?'Injected B failure · A saves pending in same transaction':index===2?'Profile rollback · earlier Application approval survives':'Before Profile attempt'};
 }
 if(family==='DR06'){
  if(index<9){
   const committed=index===8;
   states.app=index>=3?(committed?'DRAFT committed':'DRAFT save pending'):'Not created';states.detail=index>=4?(committed?'Prerequisite 42 committed':'Detail save pending'):'Not created';states.product=index>=6?(committed?'B IMPORT and own files committed':'B save pending'):'Not created';
   active=[[],[],['product'],['app'],['detail'],['product'],['product'],['app'],['app','detail','product']][index];
  }else if(index<18){states.app=index<13?'DRAFT committed':index===13?'AWAITING_PAYMENT pending':index===14?'AWAITING_PAYMENT committed':index===15?'PAID pending':index===16?'SUBMITTED pending':'SUBMITTED / PAID committed';states.detail='Prerequisite 42 committed';states.product='B IMPORT + own files committed';active=index===11||index===12?['detail','product']:['app'];}
  else{const i=index-18;states.app=i===0?'REVIEW committed':i===1?'APPROVED pending':'APPROVED committed';states.detail='Prerequisite 42 committed';states.product='B IMPORT + own files committed';states.profile=i<6?'Existing profile 99':i<9?'Profile enrichment pending':'Handler changes committed';states.registration=states.licence=i<7?'Not created':i<9?'B save pending':'B result committed';states.snapshot=i<8?'Not created':i<9?'B snapshot pending':'Source pair (700,802) committed';active=[['app'],['app'],['app','detail','product'],['product'],['snapshot'],['snapshot'],['profile'],['registration','licence'],['snapshot'],['profile','registration','licence','snapshot'],['snapshot','registration','licence','profile']][i];}
 }else{
  states.app=index===0?'Not created':index===1?'DRAFT save pending':index<=3?'DRAFT committed':index===4?'SUBMITTED / PAID committed':'APPROVED committed';states.detail=index===0?'Not created':index===1?'Prerequisite 42 pending':'Prerequisite 42 committed';states.product=index===0?'Not created':index===1?'B save pending':'B IMPORT + files committed';
  ['registration','licence','snapshot'].forEach(key=>states[key]=index<7?'Not created':index===7?'B save pending':'B result committed');states.profile=index<7?'Existing profile 99':index===7?'Enrichment pending':'Handler changes committed';
  active=[[],['app','detail','product'],['app','detail','product'],['detail','product'],['app'],['app','product'],[],['profile','registration','licence','snapshot'],['profile','registration','licence','snapshot'],[]][index];
 }
 return {states,active,action:'Highlighted nodes are accessed or committed at this checkpoint. Read each row state for pending versus saved work.'};
}
function guideERModel(family,code,scenario,index){
 const f=lifecycleFamilies[family],state=guideERState(family,code,scenario,index);
 const snapshotRefs=family==='DR06'?['snapshot','profileKeys']:family==='DR08'?['tmSnapshot','tmEntity']:['hsMapper','hsEntity'];
 const requestRefs=family==='DR06'?['save','detail','fk']:family==='DR08'?['tmSave','tmReplace']:['hsSave','hsReplace'];
 const nodes=[
  {id:'app',name:'applications',key:'id '+f.application,x:20,y:70,refs:requestRefs,fields:['application_id','appId','getAppId']},
  {id:'detail',name:f.detail,key:'application_id '+f.application+' · prerequisite 42',x:20,y:280,refs:requestRefs,fields:['prerequisite_profile_id']},
  {id:'product',name:f.products,key:'B '+f.product+' · application_id '+f.application,x:20,y:490,refs:requestRefs,fields:['products','application_type','source_product_id']},
  {id:'profile',name:'profiles',key:'actual id 99 · selected prerequisite 42 is separate',x:650,y:70,refs:['tmHook','tmResolver'],fields:['profile_id','prerequisite_profile_id']},
  {id:'registration',name:'regulatory_registrations',key:'registration_id '+f.registration+' · license_id '+f.licence,x:650,y:280,refs:['coreProfileFK',...snapshotRefs],fields:['registration_id']},
  {id:'licence',name:'licenses',key:'id '+f.licence+' · profile_id 99',x:650,y:490,refs:['coreLicenceFK',...snapshotRefs],fields:['licence_ids','license_id','licence_id']},
  {id:'snapshot',name:f.snapshot,key:'registration_id '+f.registration+' · profile_id 99',x:1040,y:280,refs:snapshotRefs,fields:['source_application_id','source_product_id','registration_id']}
 ];
 const edges=[
  ['detail','app','M140 280 V190',140,235],['product','app','M260 550 H330 V130 H260',330,420],
  ['registration','profile','M770 280 V190',770,235],['registration','licence','M770 400 V490',770,445],
  ['licence','profile','M890 550 H960 V130 H890',960,445],['snapshot','registration','M1040 340 H890',1015,340],['snapshot','profile','M1160 280 V45 H770 V70',1080,45]
 ];
 const messageActive=code===family && scenario==='success' && (family==='DR06'?(index===21||index===22):(index===5||index===6));
 return {...state,nodes,edges,f,messageActive};
}
function guideERPanel(family,code,scenario,index){
 const model=guideERModel(family,code,scenario,index);
 const edges=model.edges.map(([from,to,path],i)=>'<path data-er-edge="'+from+' '+to+'" d="'+path+'" class="guide-fk" marker-end="url(#guide-fk-tip)"/>').join('');
 const badges=model.edges.map(([from,to,path,x,y])=>erdRelationBadge(from,to,x,y)).join('');
 const nodes=model.nodes.map(node=>'<button type="button" class="guide-er-node '+(model.active.includes(node.id)?'accessed':'')+'" data-guide-table="'+node.id+'" style="left:'+node.x+'px;top:'+node.y+'px" aria-pressed="false"><strong>'+node.name+'</strong><span>'+node.key+'</span><small>'+model.states[node.id]+'</small></button>').join('');
 return '<section class="panel check guide-er"><h2>Synchronized Product B ER diagram</h2><p>'+model.action+'</p><p class="src">Green border = accessed at this step. Filled selection = inspected table. Solid arrows are local foreign keys from child to parent, labelled 1:1 or N:1. The relationship table below names both directions. Orange dashed arrows are the Kafka handoff across databases. Nodes show schema relationships even before their rows exist.</p><div class="guide-er-board" tabindex="0" aria-label="Scrollable Product B ER diagram"><div class="guide-er-canvas"><svg viewBox="0 0 1320 640" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="guide-fk-tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#315c52"/></marker><marker id="guide-message-tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="#99471c"/></marker></defs><rect x="5" y="10" width="355" height="615" rx="12" fill="#f2f5e9" stroke="#aab9a0"/><rect x="635" y="10" width="680" height="615" rx="12" fill="#f2f5e9" stroke="#aab9a0"/><text x="25" y="35">Application database</text><text x="660" y="35">Profile database</text>'+edges+badges+'<path class="guide-message '+(model.messageActive?'active':'')+'" d="M260 550 H460 V340 H650" marker-end="url(#guide-message-tip)"/><text x="385" y="270">'+(model.messageActive?'Approval checkpoint':'Approval schema link')+'</text><text x="385" y="300">'+(family==='DR06'?'Source pair (700,802)':'Product source ID omitted')+'</text><text x="380" y="390">Reference field only</text><text x="375" y="415">prerequisite_profile_id = 42</text></svg>'+nodes+'</div></div>'+erdRelationshipLegend(Object.fromEntries(model.nodes.map(n=>[n.id,n.name])),model.edges)+'<section id="guideFieldTrace" class="check"></section><section id="guideRowInspector" class="check"></section><div id="guideERSelection" class="transaction-box" aria-live="polite"></div><div class="choices"><button class="action" id="guideERJava">Show linked Java</button><button class="action" id="guideERKafka">Show matching data fields</button></div><details class="proof" id="guideERSource"><summary>Selected table / field mapping evidence</summary><div id="guideERSourceBody"></div></details><p class="src">Cross-service IDs and prerequisite references are not drawn as database foreign keys. DR08/09 snapshots have no DR06-style source pair. B failure cases leave A’s pending saves in the same transaction; the row ledger describes their rollback.</p></section>';
}
function attachGuideER(family,code,scenario,index,frame){
 const model=guideERModel(family,code,scenario,index);
 const selectionKey=family+'/'+code+'/'+scenario;
 let selected=guideERSelections[selectionKey]||model.active.at(-1)||'product';
 const choose=id=>{guideERSelections[selectionKey]=id;select(id);};
 const select=id=>{
  selected=id;
  main.querySelector('#guideRowInspector').innerHTML=rowInspectorHTML(family,code,scenario,index,id);
  main.querySelector('#inspectorTable').onchange=event=>choose(event.target.value);
  const node=model.nodes.find(item=>item.id===id);
  main.querySelectorAll('[data-guide-table]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.guideTable===id));
  main.querySelectorAll('[data-cardinality-ends]').forEach(item=>item.classList.toggle('selected',item.dataset.cardinalityEnds.split(' ').includes(id)));
  main.querySelectorAll('[data-er-edge]').forEach(edge=>edge.classList.toggle('selected',edge.dataset.erEdge.split(' ').includes(id)));
  main.querySelector('#guideERSelection').innerHTML='<strong>'+escapeHtml(node.name)+'</strong><p>'+escapeHtml(model.states[id])+'</p><p>'+model.edges.filter(([from,to])=>from===id||to===id).map(([from,to])=>{const r=erdRelationshipTypes[from+' '+to];const a=model.nodes.find(n=>n.id===from).name,b=model.nodes.find(n=>n.id===to).name;return escapeHtml(a+' → '+b+' · '+r.type+' ('+r.ratio+'). Reverse: '+r.reverse+'. '+r.fk);}).join('<br>')+'</p><p>Checkpoint method · <code>'+escapeHtml(frame.method)+'</code></p><p>Related data keys · '+node.fields.map(escapeHtml).join(', ')+'</p>';
  main.querySelector('#guideERSourceBody').innerHTML=sources(node.refs);
  const rowMatches={
   app:label=>/applications|^Application \d/.test(label),
   detail:label=>label.includes(model.f.detail)||label.includes('application_reagent_details'),
   product:label=>label.includes(model.f.products)||/Product B|^B \d/.test(label),
   profile:label=>/profiles|^Profile 99|existing profile|existing values/i.test(label),
   registration:label=>/registration/i.test(label)&&!label.includes('_details'),
   licence:label=>/licence|license/i.test(label)&&!label.includes('_details'),
   snapshot:label=>label.includes(model.f.snapshot)||/snapshot/i.test(label)
  };
  main.querySelectorAll('#guideRowsLedger tbody tr').forEach(row=>row.classList.toggle('guide-linked-row',rowMatches[id](row.querySelector('th').textContent)));
  const json=JSON.stringify(frame.data.data,null,2);
  main.querySelector('#guideKafkaData').innerHTML='<pre tabindex="0"><code>'+json.split('\n').map(line=>'<span class="guide-json-line '+(node.fields.some(key=>line.includes(key))?'matched':'')+'">'+escapeHtml(line)+'</span>').join('\n')+'</code></pre>';
  main.querySelector('#guideKafkaSelection').textContent='Selected table · '+node.name+'. Matching keys are highlighted when present. Missing fields remain absent in this checkpoint’s partial data.';
  renderInspectorTrace(family,code,scenario,index,id,frame,choose);
 };
 main.querySelectorAll('[data-guide-table]').forEach(button=>button.onclick=()=>choose(button.dataset.guideTable));
 main.querySelector('#guideERJava').onclick=()=>{const details=main.querySelector('#guideERSource');details.open=true;details.querySelectorAll('details').forEach(item=>item.open=true);details.scrollIntoView({block:'start'});};
 main.querySelector('#guideERKafka').onclick=()=>main.querySelector('#guideKafkaPanel').scrollIntoView({block:'start'});
 select(selected);
}
