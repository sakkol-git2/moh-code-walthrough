// The example follows the seeded PAY_FIRST route with payment already recorded in Review.
const reviewUnits = ['Bureau of Drug Regulation','Department of Drugs and Food','General Department of Technical Services','Secretary of State in charge'];
function transferFrame(unit, i) {
  return {
    lane:'MOH-Review', actor:unit+' reviewer', title:'Hand the application to '+reviewUnits[i+1],
    method:'ApprovalServiceImpl.transferToStep → ApprovalHelper.saveAction',
    text:'The reviewer completes this stage for the whole application. Review appends a history row with the sending and receiving steps and sets the target assignee. The request stays IN_REVIEW.',
    change:{history:'TRANSFER_TO_NEXT_STEP · '+(i+2)+' → '+(i+3),review:'IN_REVIEW · '+reviewUnits[i+1]},
    refs:['review','reviewTransfer','actionWrite']
  };
}
const reviewFrames = [
  {lane:'MOH-Review',actor:'Review submission consumer',title:'Move the paid application into review',method:'ReviewKafkaConsumer.reviewRequestCreatedTopicListener → ReviewApprovalRequestServiceImpl.update',
   text:'Application 700 is SUBMITTED and PAID. In this event order, Review already sees PAID when the submitted message arrives. It updates the existing request, logs submission and automatically transfers it from Payment to the Bureau. The seeded workflow determines the offices. Reviewer assignments depend on the environment.',
   change:{review:'IN_REVIEW · '+reviewUnits[0],history:'SUBMIT_APPLICATION, then SYSTEM_TRANSFER · 1 → 2'},refs:['submitted','reviewSubmit','reviewRoute','review']},
  {lane:'MOH-Review',actor:'Bureau reviewer',title:'Take ownership of the review',method:'ApprovalServiceImpl.startReview → ApprovalHelper.saveAction',
   text:'In this example an authorized reviewer starts the available task. Review records who took it, locks the request to that reviewer and publishes the action update.',
   change:{review:'IN_REVIEW · held by Bureau reviewer',history:'START_REVIEW · step 2'},refs:['reviewStart','actionWrite','actionSend']},
  {lane:'MOH-Application',actor:'Application review-event consumer',title:'Show that a reviewer has started',method:'ReviewEventConsumer.handleApplicationReviewCreated → ApplicationServiceImpl.handleApplicationReviewCreated',
   text:'Application receives the START_REVIEW action. It updates the reviewer and step fields on application 700 and saves status REVIEW. Subsequent handoffs also send reviewer and step updates. The next three frames follow the staff actions in Review.',
   change:{app:'REVIEW · PAID'},refs:['reviewRead','appReview']},
  ...reviewUnits.slice(0,-1).map(transferFrame),
  {lane:'MOH-Review',actor:'Authorized final reviewer · '+reviewUnits[3],title:'Approve the entire application',method:'ApprovalServiceImpl.approveStep → ApprovalHelper.saveAction / updateRequestStatus',
   text:'The final reviewer approves the request containing both A and B. Review appends APPROVE to its action history, sets its request to APPROVED and emits a ReviewRequestCreatedMessage carrying the decision.',
   change:{review:'APPROVED · final decision',history:'APPROVE · step 5'},refs:['finalApproval','actionSend','reviewSend']},
  {lane:'MOH-Application',actor:'Application review-event consumer',title:'Save approval on application 700',method:'ApplicationServiceImpl.handleApplicationReviewCreated',
   text:'Application consumes the decision, records APPROVED, the approver and the approval time, then raises an ApplicationApprovedDomainEvent.',
   change:{app:'APPROVED · PAID'},refs:['reviewRead','approve']},
  {lane:'MOH-Application',actor:'Application event producer',title:'Publish one approval for both products',method:'ApplicationEventProducer.produceApplicationApprovedEvent',
   text:'Application reads the saved rows in position order and builds the form data. It sends one ApplicationApprovedMessage keyed by application number. B’s stable ID 802, origin and document references travel together.',
   change:{},refs:['messageKey','payload','files','publish']},
  {lane:'MOH-Profile',actor:'Profile Kafka listener',title:'Inspect the message at Profile',method:'ProfileKafkaConsumer.handleApplicationApproved',
   text:'Paused at listener entry. Profile reads the service code to select its handler. Processing the message and creating registrations, licences and snapshots come after this checkpoint.',
   change:{},refs:['consumer','payload','files']}
];
function reviewTimeline(index) {
  if(!state.hasForm){paymentTimeline();return;}
  const f=reviewFrames[index], final=index===reviewFrames.length-1;
  const rows={app:'SUBMITTED · PAID',review:'Draft request exists',history:'Draft history exists',product:'Product B · '+state.origin,profile:'Existing profile 42 · no new DR06 registration'};
  reviewFrames.slice(0,index+1).forEach(step=>Object.assign(rows,step.change));
  const names={app:'applications · id 700',review:'review_approval_requests · app_id 700',history:'review_approval_actions · latest action(s)',product:'application_reagent_products · id 802',profile:'Profile · approval result'};
  const board=['MOH-Review','MOH-Application','MOH-Profile'].map(lane=>'<div class="time-lane"><b>'+lane+'</b>'+reviewFrames.map((s,i)=>'<span class="time-cell '+(s.lane===lane?(i===index?'now':i<index?'done':'later'):'')+'">'+(s.lane===lane?i+1:'')+'</span>').join('')+'</div>').join('');
  const rowList=Object.entries(rows).map(([key,value])=>'<div class="time-row '+(key in f.change?'written':'')+'"><strong>'+names[key]+'</strong><span>'+value+'</span>'+(key in f.change?'<small>Written this step</small>':'')+'</div>').join('');
  const data=request();
  const payload={attachments:data.attachments,reagent:{contract_version:3,prerequisite_profile_id:42,products:data.reagent.products.map((p,i)=>({id:801+i,position:i,...p}))}};
  const inspector=final?'<section class="panel check"><div class="tag">Kafka inspector · fictional values</div><h2>ApplicationApprovedMessage</h2><p>Message key <code>DEMO-700</code> (application number) · application ID <code>700</code> · service <code>GDHT-RG-L</code>. Below are selected fields of the decoded form data. Find B at position 1 and compare its files with the shared establishment decision.</p>'+pre(JSON.stringify(payload,null,2))+'</section>':'';
  main.innerHTML='<div class="tag">DR06 / Execution timeline</div><h1>From payment to approval</h1><p class="lead">Follow one paid application through the seeded staff workflow. Each history entry records an action on the same request.</p><div class="timeline-board review-board" aria-label="Service lanes">'+board+'</div><div class="lessonbody"><article class="panel"><div class="tag">Step '+(index+1)+' of '+reviewFrames.length+' · '+(final?'Paused at Profile':f.lane)+'</div><h2>'+f.title+'</h2><p><b>'+f.actor+'</b></p><code>'+f.method+'</code><p>'+f.text+'</p><details class="proof"><summary>Inspect source</summary>'+sources(f.refs)+'</details></article><aside class="side"><h2>Rows at this step</h2>'+rowList+(Object.keys(f.change).length?'':'<p>No write to these rows at this step.</p>')+'</aside></div>'+inspector+'<div class="actions"><a class="btn light" href="'+(index?'#review-timeline/'+(index-1):'#payment-confirmed')+'">← '+(index?'Previous':'Payment confirmation')+'</a><a class="btn" href="#review-timeline/'+(final?0:index+1)+'">'+(final?'Replay from payment confirmation':'Next step →')+'</a></div>';
}
