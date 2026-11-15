// Exchanges align with coreFlows checkpoints. Several exchanges may share one checkpoint.
const flowSequences = {
  save: {
    lanes:['Browser','Application entry','DR06 + shared handlers','Application DB','Kafka boundary'],
    fixture:'New-draft example. Application 700 and products 801/802 are fictional IDs assigned during save. Required fields outside the excerpts are assumed valid.',
    exchanges:[
      [0,0,1,'http','POST /api/v1/applications'],
      [1,1,2,'call','Select GDHT-RG-L strategy'],
      [2,2,2,'call','Check product and attachment placement'],
      [3,2,3,'write','Save shared application 700'],
      [4,2,3,'write','Save DR06 detail for application 700'],
      [5,2,3,'read','Read membership and check file ownership'],
      [6,2,3,'write','Save A 801 and B 802 with their files'],
      [7,2,1,'return','Finish strategy; service raises CREATE event'],
      [8,1,3,'commit','Commit the Application save transaction'],
      [8,1,4,'kafka','ApplicationCreatedMessage · new-draft CREATE publish sites'],
      [8,1,3,'read','Read saved detail and ordered products'],
      [8,1,0,'return','Return draft JSON with assigned IDs']
    ],
    records:[
      {label:'applications · 700',updates:[[3,'DRAFT · parent save pending'],[8,'DRAFT · committed']]},
      {label:'application_reagent_details · 700',updates:[[4,'prerequisite_profile_id 42 · pending'],[8,'prerequisite_profile_id 42 · committed']]},
      {label:'Product A · 801',updates:[[6,'LOCAL · position 0 · pending'],[8,'LOCAL · committed']]},
      {label:'Product B · 802',updates:[[6,'IMPORT · position 1 · own files · pending'],[8,'IMPORT · own files · committed']]}
    ]
  },
  submit: {
    lanes:['Browser','Application','Application DB','Profile prerequisite API','Kafka / payment boundary'],
    fixture:'Saved draft 700 contains A and B. Follow a successful non-waived payment, then an OPEN relation gate. Payment completion is a later transaction than the first HTTP response.',
    exchanges:[
      [0,0,1,'http','POST /applications/700/submit'],
      [1,1,2,'read','Load application and validate lifecycle'],
      [2,1,2,'read','Read saved DR06 detail and both products'],
      [2,1,3,'http','Validate prerequisite profile 42'],
      [3,1,1,'call','Check documents, operation and relation rules'],
      [4,1,2,'write','Set AWAITING_PAYMENT / PENDING'],
      [5,1,4,'kafka','IssueInvoiceMessage · app 700 · quantity 2'],
      [5,4,1,'kafka','IssueInvoiceReplyMessage · invoice data'],
      [5,1,2,'commit','Commit the waiting state'],
      [5,1,0,'return','HTTP response · AWAITING_PAYMENT'],
      [6,4,1,'kafka','Later · PaymentCompletedMessage · app 700'],
      [6,1,2,'write','Record paid state and paid date'],
      [7,1,2,'write','OPEN relation gate → SUBMITTED'],
      [8,1,2,'commit','Commit resumed submission'],
      [8,1,4,'kafka','ApplicationSubmittedMessage · application number key']
    ],
    records:[
      {label:'applications · 700',initial:'DRAFT / payment PENDING · committed',updates:[
        [1,'DRAFT · tracking/context work pending'],
        [4,'AWAITING_PAYMENT / PENDING · pending'],
        [5,'AWAITING_PAYMENT / PENDING · committed'],
        [6,'Payment PAID · finalization pending'],
        [7,'SUBMITTED / PAID · pending'],
        [8,'SUBMITTED / PAID · committed']
      ]},
      {label:'application_reagent_details · 700',initial:'Prerequisite 42 · saved draft',updates:[]},
      {label:'Product A · 801',initial:'LOCAL · saved draft',updates:[]},
      {label:'Product B · 802',initial:'IMPORT · own files · saved draft',updates:[]}
    ]
  },
  approve: {
    lanes:['Application','Application DB','Kafka boundary','Profile','Profile DB','Product reader'],
    fixture:'Application 700 starts in REVIEW. For this possible branch outcome, identity lookup reuses existing profile 99 while selected prerequisite_profile_id remains 42. This illustrates the documented rule gap. All processing succeeds.',
    exchanges:[
      [0,2,0,'kafka','ReviewRequestCreatedMessage · APPROVED'],
      [1,0,1,'write','Save APPROVED and approval metadata'],
      [2,0,1,'commit','Commit Application approval'],
      [2,0,1,'read','Build approved form data from saved rows'],
      [3,0,2,'kafka','ApplicationApprovedMessage · products 801/802'],
      [4,2,3,'kafka','Profile receives the approval message'],
      [4,3,3,'call','Parse version 3 and validate all product identities'],
      [5,3,4,'read','Check saved-source replay guard'],
      [6,3,4,'read','Generic resolver reuses profile 99 in this fixture'],
      [7,3,4,'write','Build/save registrations and licences for A and B'],
      [8,3,4,'write','Save product snapshots and registration mirrors'],
      [9,3,4,'commit','Commit Profile registration transaction'],
      [9,3,2,'kafka','Publish ISSUE operation after commit'],
      [10,5,3,'http','GET reagent-products/products/902'],
      [10,3,4,'read','Fetch B detail, registration, licence and profile'],
      [10,3,5,'return','Return B source ID 802 and actual profile ID 99']
    ],
    records:[
      {label:'Application · applications 700',initial:'REVIEW · committed',updates:[
        [1,'APPROVED + approver/date · pending'],
        [2,'APPROVED · committed']
      ]},
      {label:'Profile · profiles 99',initial:'Existing identity candidate · committed',updates:[
        [6,'Resolved profile 99 · enrichment pending'],
        [9,'Profile 99 · handler changes committed']
      ]},
      {label:'Profile · A registration 901 / licence 501',updates:[
        [7,'New A result · LOCAL · pending'],
        [9,'A result committed · certificate PENDING']
      ]},
      {label:'Profile · B registration 902 / licence 502',updates:[
        [7,'New B result · IMPORT · pending'],
        [9,'B result committed · certificate PENDING']
      ]},
      {label:'Profile · A product snapshot',updates:[
        [8,'Source pair (700, 801) · pending'],
        [9,'Source pair (700, 801) · committed']
      ]},
      {label:'Profile · B product snapshot',updates:[
        [8,'Source pair (700, 802), profile 99, prerequisite 42 · pending'],
        [9,'Source (700, 802) · profile 99 · prerequisite 42 · own files committed']
      ]}
    ]
  }
};

function sequenceData(key,index){
  const files={shared:[{id:'sample-establishment',key:'establishment_decision'}],b:[{id:'sample-form-B',key:'application_form'}]};
  if(key==='save'){
    if(index<=2) return {view:'Selected request fields',data:{
      service_code:'GDHT-RG-L',attachments:files.shared,
      reagent:{prerequisite_profile_id:42,products:[
        {product_name:'Product A',application_type:'LOCAL',attachments:[{id:'sample-form-A',key:'application_form'}]},
        {product_name:'Product B',application_type:'IMPORT',attachments:files.b}
      ]}
    }};
    if(index===3) return {view:'Parent values after save call',data:{id:700,status:'DRAFT',application_name_en:'Product A'}};
    if(index===4) return {view:'DR06 shared row values',data:{application_id:700,prerequisite_profile_id:42}};
    if(index===5) return {view:'Checks for the new product list',data:{existing_product_ids:[],incoming_products:'new products without IDs',public_file_check:'file ID + caller user ID'}};
    if(index===6) return {view:'B after mapping and file resolution',data:{id:802,application_id:700,position:1,application_type:'IMPORT',attachments:files.b}};
    if(index===7) return {view:'Java domain events before commit',data:{core_handler:'CREATE publish site',application_service:'CREATE publish site',listener:'waits for successful transaction commit'}};
    return {view:'Selected draft response fields',data:{id:700,status:'DRAFT',reagent:{products:[{id:801,application_type:'LOCAL'},{id:802,application_type:'IMPORT'}]},post_commit_message:'ApplicationCreatedMessage'}};
  }
  if(key==='submit'){
    if(index<=1) return {view:'HTTP request identifies the saved application',data:{method:'POST',path:'/api/v1/applications/700/submit',controller_argument:'applicationId = 700'}};
    if(index<=3) return {view:'Saved values used for validation',data:{prerequisite_profile_id:42,products:[{id:801,application_type:'LOCAL'},{id:802,application_type:'IMPORT',attachments:files.b}]}};
    if(index===4) return {view:'Pending application state',data:{id:700,status:'AWAITING_PAYMENT',payment_status:'PENDING',payment_context:'SUBMISSION'}};
    if(index===5) return {view:'Selected invoice handoff and HTTP response values',data:{outgoing_kafka:{message:'IssueInvoiceMessage',application_id:700,service_code:'GDHT-RG-L',quantity:2},incoming_kafka:{message:'IssueInvoiceReplyMessage',invoice:'invoice data omitted'},http_response:{data:{status:'AWAITING_PAYMENT'},metadata:{status:'AWAITING_PAYMENT',next_action:'PAY',invoice:'omitted'}}}};
    if(index===6) return {view:'Selected Java getter values on incoming payment message',data:{'payload.getAppId()':700,'payload.getInvoiceStatus()':'PAID'}};
    if(index===7) return {view:'Finalization decision in this fixture',data:{payment_context:'SUBMISSION',relation_gate:'OPEN',application_status:'SUBMITTED'}};
    return {view:'Outgoing submission association',data:{message:'ApplicationSubmittedMessage',application_id:700,kafka_key:'DEMO-700 (application number)'}};
  }
  if(index<=1) return {view:'Selected Java getter values on incoming review decision',data:{'payload.getApplicationId()':700,'payload.getStatus()':'APPROVED'}};
  if(index<=4) return {view:'Selected decoded approval form data',data:{
    attachments:files.shared,reagent:{contract_version:3,prerequisite_profile_id:42,products:[
      {id:801,position:0,application_type:'LOCAL',attachments:[{id:'sample-form-A',key:'application_form'}]},
      {id:802,position:1,application_type:'IMPORT',attachments:files.b}
    ]}
  }};
  if(index===5) return {view:'Replay guard in this successful first delivery',data:{source_application_id:700,existsBySourceApplicationId:false}};
  if(index===6) return {view:'Selected prerequisite and actual resolver result',data:{prerequisite_profile_id:42,identity_candidate_profile_id:99,already_has_DR06:false,resolved_profile_id:99}};
  if(index===7) return {view:'B registration build association',data:{source_product_id:802,registration_id:902,license_id:502,profile_id:99,application_type:'IMPORT'}};
  if(index===8) return {view:'Selected B snapshot fields',data:{registration_id:902,source_application_id:700,source_product_id:802,profile_id:99,prerequisite_profile_id:42,application_type:'IMPORT',attachments:files.b,shared_attachments:files.shared}};
  if(index===9) return {view:'Selected outgoing ISSUE operation values',data:{operation_type:'ISSUE',profile_id:99,licence_ids:[501,502],certificate_status:'PENDING'}};
  return {view:'Selected B product response fields',data:{registration_id:902,source_product_id:802,profile_id:99,prerequisite_profile_id:42,application_type:'IMPORT',attachments:files.b}};
}

function flowSequence(key,index){
  const model=flowSequences[key];
  const width=model.lanes.length*170;
  const headers=model.lanes.map(name=>'<span>'+name+'</span>').join('');
  const lines=model.lanes.map((_,i)=>'<span style="left:'+((i+.5)*170)+'px"></span>').join('');
  const exchanges=model.exchanges.map(([step,from,to,kind,label],n)=>{
    const x1=(from+.5)*170, x2=(to+.5)*170;
    const path=from===to?'M '+x1+' 53 h 36 v 19 h -36':'M '+x1+' 60 H '+x2;
    return '<button type="button" class="sequence-exchange '+(step===index?'selected':step<index?'completed':'future')+'" data-sequence-step="'+step+'" aria-current="'+(step===index?'step':'false')+'" aria-label="Checkpoint '+(step+1)+', '+model.lanes[from]+' to '+model.lanes[to]+', '+label+'"><span class="sequence-label">'+(step+1)+' · '+escapeHtml(label)+'</span><span class="sequence-kind">'+kind+'</span><svg viewBox="0 0 '+width+' 88" aria-hidden="true"><defs><marker id="sequence-tip-'+n+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="'+(kind==='kafka'?'#99471c':'#315c52')+'"/></marker></defs><path class="'+(kind==='kafka'?'sequence-kafka':kind==='return'?'sequence-return':'sequence-call')+'" d="'+path+'" marker-end="url(#sequence-tip-'+n+')"/></svg></button>';
  }).join('');
  const recordRows=model.records.map(record=>{
    const update=record.updates.filter(([step])=>step<=index).at(-1);
    const text=update?update[1]:record.initial||'Not created yet';
    const changed=update && update[0]===index;
    return '<tr class="'+(changed?'sequence-row-change':'')+'"><th scope="row">'+record.label+'</th><td>'+text+(changed?'<small>Changed at this checkpoint</small>':'')+'</td></tr>';
  }).join('');
  const data=sequenceData(key,index);
  return '<section class="panel check sequence-section"><div class="spread"><h2>Interactive sequence</h2><span class="tag">Checkpoint '+(index+1)+' of '+coreFlows[key].steps.length+'</span></div>'+failureScenarioPicker(key)+'<p class="sequence-method"><code>'+escapeHtml(coreFlows[key].steps[index].method)+'</code></p><p>'+model.fixture+'</p><p class="src">Click an exchange or use the step controls. Solid lines show calls and database work. Orange dashed lines show Kafka handoffs. Green dashed lines show returns. Each checkpoint groups the methods explained below. Scroll sideways to see all participants on a narrow screen.</p><div class="choices"><a class="btn light" href="'+(index?'#flow/'+key+'/'+(index-1):'#core-flows')+'">← '+(index?'Previous checkpoint':'Flow overview')+'</a><a class="btn" href="'+(index===coreFlows[key].steps.length-1?'#core-flows':'#flow/'+key+'/'+(index+1))+'">'+(index===coreFlows[key].steps.length-1?'Compare flows →':'Next checkpoint →')+'</a></div><div class="sequence-board" tabindex="0" aria-label="Scrollable '+coreFlows[key].name+' sequence diagram"><div class="sequence-canvas" style="width:'+width+'px"><div class="sequence-headers" style="grid-template-columns:repeat('+model.lanes.length+',170px)">'+headers+'</div><div class="sequence-lifelines" aria-hidden="true">'+lines+'</div>'+exchanges+'</div></div><div class="below"><section><h3>'+data.view+'</h3>'+pre(JSON.stringify(data.data,null,2))+'<p class="src">Illustrative selected values. This panel is not a complete API or Avro schema.</p></section><section><h3>Rows after this checkpoint</h3><div class="rows"><table><thead><tr><th>Row</th><th>Current state</th></tr></thead><tbody>'+recordRows+'</tbody></table></div><p class="src">Pending changes belong to the open transaction. Committed states assume the successful path. Choose a failure in Sequence scenario above to compare rollback and saved rows.</p></section></div></section>';
}

function attachFlowSequence(key,index){
  attachFailurePicker(key);
  main.querySelectorAll('[data-sequence-step]').forEach(button=>{
    button.onclick=()=>{location.hash='flow/'+key+'/'+button.dataset.sequenceStep;};
  });
  const board=main.querySelector('.sequence-board');
  const selected=board.querySelector('.sequence-exchange.selected');
  board.scrollTop=Math.max(0,selected.offsetTop-90);
}
