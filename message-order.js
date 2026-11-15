// This simulation models two inspected Review branches, with an existing draft request.
function messageOrder(){
  let delivered=[];
  main.innerHTML='<div class="tag">DR06 / Message order</div><h1>Which message arrives first?</h1><p class="lead">Application 700 has been paid and submitted. Review has its existing draft request. Review consumes payment and submission messages independently. Choose their arrival order in this local simulation.</p><div class="choices check"><button class="btn" id="deliverPaid">Deliver PaymentCompletedMessage</button><button class="btn light" id="deliverSubmit">Deliver ApplicationSubmittedMessage</button><button class="action" id="resetOrder">Reset example</button></div><div id="orderState" aria-live="polite"></div><details class="panel check"><summary>Inspect the two handlers</summary>'+sources(['reviewPaymentBefore','reviewPaymentAfter','reviewRoute','reviewSubmit'])+'</details><p class="check">Assumptions here include an existing request, the seeded PAY_FIRST workflow, successful handlers and an available next reviewer step. Live broker configuration, assignment and retry timing have not been executed.</p>';
  const paid=main.querySelector('#deliverPaid');
  const submit=main.querySelector('#deliverSubmit');
  function draw(){
    const hasPaid=delivered.includes('paid');
    const hasSubmit=delivered.includes('submit');
    const complete=hasPaid&&hasSubmit;
    const paymentFirst=delivered[0]==='paid';
    const status=complete?'IN_REVIEW':hasSubmit?'SUBMITTED':'DRAFT';
    const step=complete?'2 · Bureau of Drug Regulation':'1 · Payment';
    const history=complete?(paymentFirst?'SUBMIT_APPLICATION → SYSTEM_TRANSFER':'SUBMIT_APPLICATION → PAYMENT_PAID'):hasSubmit?'SUBMIT_APPLICATION':'CREATE_APPLICATION already exists';
    const last=delivered.at(-1);
    const method=last==='paid'?'ReviewKafkaConsumer.handlePaymentCompleted':last==='submit'?'ReviewApprovalRequestServiceImpl.update':'No handler has run in this example.';
    const explanation=complete
      ? paymentFirst?'Payment was recorded while the request was still DRAFT. The submission handler then saw PAID and skipped the Payment step.':'Submission arrived while Review still saw PENDING. When payment arrived, the payment handler moved the request from Payment to the Bureau.'
      : hasPaid?'Review records PAID on the DRAFT request and waits for submission before moving to the next workflow step.'
      : hasSubmit?'Review records submission and stays at Payment because its own request still shows PENDING.'
      :'Both messages are available to deliver. The applicant’s payment has happened, but Review has not consumed either message in this example.';
    main.querySelector('#orderState').innerHTML='<div class="below"><section class="panel"><div class="tag">Delivery history</div><h2>'+(!delivered.length?'Choose the first message':complete?'Both paths reach the Bureau':'One message remains')+'</h2><ol>'+delivered.map(k=>'<li>'+(k==='paid'?'PaymentCompletedMessage':'ApplicationSubmittedMessage')+'</li>').join('')+'</ol><code>'+method+'</code><p>'+explanation+'</p></section><aside class="side"><h2>Review’s request row</h2><div class="time-row '+(last?'written':'')+'"><strong>review_approval_requests · app_id 700</strong><span>status · '+status+'</span><span>payment_status · '+(hasPaid?'PAID':'PENDING')+'</span></div><div class="time-row"><strong>Current step from action history</strong><span>'+step+'</span></div><div class="time-row '+(last==='submit'||complete?'written':'')+'"><strong>review_approval_actions</strong><span>'+history+'</span></div></aside></div>';
    paid.disabled=hasPaid;
    submit.disabled=hasSubmit;
  }
  paid.onclick=()=>{delivered.push('paid');draw();};
  submit.onclick=()=>{delivered.push('submit');draw();};
  main.querySelector('#resetOrder').onclick=()=>{delivered=[];draw();};
  draw();
}
