// Each frame gives the active service, the write (if any), and the state after it.
const paymentFrames = [
  {lane:0,title:'The applicant clicks Submit',method:'Portal · applicationRepository.submitApplicationById (TypeScript)',text:'The browser sends POST /api/v1/applications/700/submit. The saved draft already contains Product A and Product B. The browser waits for its HTTP response.',refs:['portal','submit']},
  {lane:1,title:'Application checks the saved draft',method:'ApplicationController.submitApplication → ApplicationServiceImpl.submitApplication → ReagentRegistrationApplicationStrategy.validateSubmitApplication',text:'Application checks the selected profile, both products and each product’s required files. The saved product count supplies an invoice quantity of two.',refs:['submit','validate','quantity']},
  {lane:1,title:'Application records the payment wait',method:'ApplicationServiceImpl.submitApplication → applicationRepository.saveAndFlush',text:'Within the submit transaction, Application writes AWAITING_PAYMENT, PENDING and the SUBMISSION payment context on application 700. B’s own row still holds its product details.',write:'app',app:'AWAITING_PAYMENT · PENDING',refs:['payment']},
  {lane:1,title:'Application asks Payment for an invoice',method:'MOH-Application · InvoiceServiceImpl.issueInvoice',text:'IssueInvoiceMessage carries app ID 700 and quantity two. Application uses Kafka request/reply and waits for IssueInvoiceReplyMessage. The browser is still waiting too.',refs:['invoiceCall']},
  {lane:2,title:'Payment creates the invoice and replies',method:'MOH-Payment · InvoiceServiceImpl.handleIssueInvoice → invoiceRepository.save',text:'In this first-submit example, Payment creates one pending invoice for application 700, prices both products and sends the invoice reply to Application. app_id links the invoice back to the application across services.',write:'invoice',invoice:'PENDING · quantity 2',refs:['invoiceWrite','invoiceReply']},
  {lane:0,title:'The browser receives AWAITING_PAYMENT',method:'Server response · ApplicationController.submitApplication → SubmitApplicationResponseDto.of',text:'The submit HTTP call has finished. Its response includes metadata.status = AWAITING_PAYMENT, next_action = PAY and the invoice. The applicant can now pay. B has a saved draft row and no licence yet.',checkpoint:true,refs:['payment','submit','submitReply']},
  {lane:2,title:'Payment confirms settlement',method:'PaymentProcessingHelper.markInvoicePaidAndEmit → invoiceRepo.markPaidIfNotSettled',text:'Assume the applicant pays successfully. Payment marks its invoice PAID and records the payment time. Application still shows its previous state until it receives confirmation.',write:'invoice',invoice:'PAID · quantity 2',refs:['markPaid']},
  {lane:2,title:'Payment publishes confirmation',method:'PaymentProcessingHelper.emitPaymentCompletedEvent → PaymentKafkaProducer.sendPaymentCompletedMessage',text:'After the settlement transaction commits, Payment sends PaymentCompletedMessage. The application ID 700 and paid invoice status tell Application which row to update. This is a later event, separate from the submit response.',refs:['afterPaid','paidSend','matchPaid']},
  {lane:1,title:'Application applies the confirmation',method:'PaymentEventConsumer.handlePaymentCompleted → ApplicationServiceImpl.handleApplicationPaid → updatePaymentStatus → finalizeSubmission',text:'Application looks up 700, records PAID and the paid date, then finalizes the submission. With the relation gate clear, status becomes SUBMITTED. B remains product 802 on the same application.',write:'app',app:'SUBMITTED · PAID',refs:['paidRead','matchPaid','settle','finalize']}
];

function paymentTimeline(){
  if(!state.hasForm){
    main.innerHTML='<h1>Product B’s payment timeline</h1><p>The sample draft is missing B’s required application form. <a href="#journey/0">Restore it at Submit</a> to trace a successful payment.</p>';
    return;
  }
  const lanes=['Browser','MOH-Application','MOH-Payment'];
  let index=location.hash==='#payment-confirmed'?paymentFrames.length-1:0;
  main.innerHTML='<div class="tag">DR06 / Execution timeline</div><h1>From Submit to payment</h1><p class="lead">Follow application 700 and Product B (802) through one successful, non-waived payment. Each column is one step. All records are local examples.</p><div id="paymentTrace"></div><div class="choices check"><button class="action" id="timeBack">← Previous</button><button class="btn" id="timeNext">Next step →</button></div>';
  const back=main.querySelector('#timeBack');
  const next=main.querySelector('#timeNext');
  function draw(){
    const f=paymentFrames[index];
    const past=paymentFrames.slice(0,index+1);
    const latest=(field,initial)=>past.reduce((v,s)=>s[field]||v,initial);
    const board=lanes.map((name,lane)=>'<div class="time-lane"><b>'+name+'</b>'+paymentFrames.map((s,i)=>'<span class="time-cell '+(s.lane===lane?(i===index?'now':i<index?'done':'later'):'')+'">'+(s.lane===lane?i+1:'')+'</span>').join('')+'</div>').join('');
    const row=(key,title,body)=>'<div class="time-row '+(key===f.write?'written':'')+'"><strong>'+title+'</strong><span>'+body+'</span>'+(key===f.write?'<small>Written this step</small>':'')+'</div>';
    const review=f.checkpoint?'<details class="proof"><summary>Checkpoint: which row will change first when payment succeeds?</summary><p>Payment updates its invoice first. Application 700 changes after it consumes the confirmation. B’s product details stay on row 802.</p></details>':'';
    main.querySelector('#paymentTrace').innerHTML='<div class="timeline-board" aria-label="Service lanes">'+board+'</div><div class="lessonbody"><article class="panel" aria-live="polite"><div class="tag">Step '+(index+1)+' of '+paymentFrames.length+' · '+lanes[f.lane]+(f.checkpoint?' · Paused for review':'')+'</div><h2>'+f.title+'</h2><code>'+f.method+'</code><p>'+f.text+'</p>'+review+'<details class="proof"><summary>Inspect source</summary>'+sources(f.refs)+'</details></article><aside class="side"><h2>Rows at this step</h2>'+row('app','applications · id 700',latest('app','DRAFT'))+row('product','application_reagent_products · id 802','application_id 700 · '+state.origin)+row('invoice','payment_invoices · app_id 700',latest('invoice','No invoice yet'))+(!f.write?'<p>No write to these rows at this step.</p>':'')+'</aside></div>';
    back.disabled=index===0;
    next.textContent=f.checkpoint?'Continue after payment →':index===paymentFrames.length-1?'Continue to review →':'Next step →';
  }
  back.onclick=()=>{index--;draw();};
  next.onclick=()=>{if(index===paymentFrames.length-1){location.hash='review-timeline/0';return;}index++;draw();};
  draw();
}
