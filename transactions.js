const transactionStops = [
  {
    name:'Draft save', owner:'MOH-Application',
    method:'ApplicationServiceImpl.saveApplication / ReagentRegistrationApplicationStrategy.saveApplication',
    writes:['applications · 700','application_reagent_details · 700','application_reagent_products · A 801 and B 802'],
    after:'On successful completion, the application and its products belong to the saved draft. Submission is a later call.',
    explanation:'The save entry point and strategy are transactional. Several repository saves run inside that operation. A primary key may be assigned before the transaction completes. A call to save is one point in that unit of work.',
    refs:['appSaveTx','draftTx','save']
  },
  {
    name:'Submit',owner:'MOH-Application → MOH-Payment',
    method:'ApplicationServiceImpl.submitApplication → InvoiceServiceImpl.issueInvoice',
    writes:['Application transaction · application 700 awaits payment','Payment operation · pending payment_invoices row for app_id 700'],
    after:'Application waits for the invoice reply, then returns AWAITING_PAYMENT to the browser. Payment owns its invoice in its own database.',
    explanation:'saveAndFlush sends pending SQL to the database while the transaction is still running. The invoice request uses Kafka request/reply during this call. The two services have separate transaction boundaries. This site illustrates the successful path. Failure reconciliation across that boundary needs its own investigation.',
    refs:['payment','invoiceCall','invoiceWrite']
  },
  {
    name:'Payment confirmation',owner:'MOH-Payment',
    method:'PaymentProcessingHelper.markInvoicePaidAndEmit → emitPaymentCompletedEvent',
    writes:['Payment invoice · PAID and paid time'],
    after:'The afterCommit callback sends PaymentCompletedMessage. Application can then receive the event and update its application row in a separate operation.',
    explanation:'This helper explicitly registers the send callback with transaction synchronization. Its fallback sends immediately when synchronization is absent. The timeline’s successful example assumes an active settlement transaction.',
    refs:['markPaid','afterPaid','paidRead']
  },
  {
    name:'Approval',owner:'MOH-Application',
    method:'ApplicationServiceImpl.handleApplicationReviewCreated → ApplicationEventListener.handleApplicationApprovedEvent',
    writes:['Application 700 · APPROVED, approvedBy and approvedDate'],
    after:'A transactional event listener calls the Kafka producer after the successful transaction. The producer serializes saved product data for Profile.',
    explanation:'A domain event is an in-process Java event. The listener converts that event into a Kafka send. Keep those two steps separate when searching for the code responsible for the message.',
    refs:['approvalTx','approve','approvalListener','publish']
  },
  {
    name:'Registration',owner:'MOH-Profile',
    method:'BaseRegisterHandler.handle → ReagentRegisterHandler.processLicenses',
    writes:['B’s registration · 902 and licence · 502','B’s snapshot · source pair (700, 802)','Existing profile 42 and licence certificate status PENDING'],
    after:'The transactional licence-operation listener maps the event into the message for Certificate.',
    explanation:'The generic registration handler is transactional. It processes the product list and publishes domain events inside that unit of work. Registration, licence and snapshot saves are coordinated there. A later Certificate operation has its own outcome.',
    refs:['profileTx','profileTxEnd','license','pending','operationListener']
  },
  {
    name:'Certificate',owner:'MOH-Certificate',
    method:'CertificateKafkaConsumer → CertificateAsyncService → MapCertificateProcessor',
    writes:['processed_operation · marker before the request loop','certificates · initial row, then PDF metadata on success'],
    after:'The async chain publishes an operation result for the licence. A failure can leave a recorded operation ID and an already-issued licence.',
    explanation:'Certificate starts asynchronous work for each request. This code does not wrap rendering, file upload and all service databases in one transaction. Inspect both the operation marker and the async error result when investigating a missing document.',
    refs:['certGuard','certRead','initialCert','pdf','certResult']
  }
];
function transactionLesson(index){
  const t=transactionStops[index];
  main.innerHTML='<div class="tag">DR06 / Transaction boundaries</div><h1>When is a write complete?</h1><p class="lead">Follow the units of work behind the timeline. A successful database commit makes that transaction’s changes durable. Later services still have their own work to do.</p><nav class="steps" aria-label="Transaction stops">'+transactionStops.map((s,i)=>'<a href="#transactions/'+i+'" '+(i===index?'aria-current="step"':'')+'>'+s.name+'</a>').join('')+'</nav><div class="lessonbody"><article class="panel"><div class="tag">'+t.owner+'</div><h2>'+t.name+'</h2><code>'+t.method+'</code><div class="transaction-box"><h3>Writes inside this operation</h3><ul>'+t.writes.map(v=>'<li>'+v+'</li>').join('')+'</ul></div><div class="transaction-after"><h3>What comes next?</h3><p>'+t.after+'</p></div><p>'+t.explanation+'</p></article><aside class="side"><h2>Inspect the boundary</h2>'+sources(t.refs)+'</aside></div><div class="actions"><a class="btn light" href="#transactions/'+Math.max(0,index-1)+'">← Previous</a><a class="btn" href="#transactions/'+((index+1)%transactionStops.length)+'">'+(index===5?'Start again':'Next boundary →')+'</a></div>';
}
