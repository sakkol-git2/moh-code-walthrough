// These cases compare inspected branches. They do not execute any MOH operation.
const recoveryCases = {
  file: {
    name:'Missing B’s form',when:'Before submit completes',
    before:['Draft 700 contains A and B','Both products have their required files','Application can continue to invoice creation'],
    after:['Draft 700 and product 802 still exist','B fails reagent.products[1].attachments','Invoice creation is not reached in this submit attempt'],
    question:'Can A’s application form satisfy B’s document check?',
    choices:['Yes, they share application 700','No, validate B’s own files'],
    correct:1,reason:'The strategy loops over saved products and validates each one. The shared establishment_decision is checked separately.',
    inspect:'Find validateProductAttachments, then inspect the document keys in B’s saved attachments. Correct B’s draft and submit again.',
    refs:['validate','missing','docs']
  },
  origin: {
    name:'Approval missing B’s origin',when:'Profile parses approval',
    before:['Approval carries B’s ID and IMPORT','Profile validates the product contract','The registration handler can proceed'],
    after:['The application may already be APPROVED','Profile rejects the incomplete product contract','The DR06 registration handler has not run'],
    question:'Should Profile take the origin from Product A?',
    choices:['Use A’s origin for the batch','Reject the incomplete product data'],
    correct:1,reason:'toRegisterRequestDto checks every product. A null origin throws before registerHandler.handle is called. Existing records from earlier processing are a separate case.',
    inspect:'Inspect form_data.reagent.products for ID 802 and compare with Application’s saved row. Check the producer and mapper that built this payload. Delivery retry settings require separate verification.',
    refs:['originContract','registrationEntry','payload']
  },
  replay: {
    name:'Approval delivered twice',when:'After successful DR06 registration',
    before:['B has registration 902 and licence 502','Source pair (700, 802) has a snapshot','The first approval has completed'],
    after:['The replay guard finds details for application 700','The DR06 handler exits','This replay publishes no new certificate operation'],
    question:'Which mechanism performs this DR06 replay check?',
    choices:['The active generic inbox','The reagent handler’s saved-source check'],
    correct:1,reason:'The generic handleWithInbox currently invokes the processor directly. DR06 checks existsBySourceApplicationId, backed by unique source pairs. This example assumes the first approval completed.',
    inspect:'Start in ReagentRegisterHandler.handle. Follow its early return and the database constraints. A class or method name alone does not prove that its advertised mechanism is enabled.',
    refs:['inboxBypass','replay','profileKeys']
  },
  template: {
    name:'No certificate template',when:'Certificate starts ISSUE processing',
    before:['B already has a registration and licence','An ISSUE request contains licence 502','With an active matching template, PDF processing can continue'],
    after:['B’s registration and licence still exist','Template lookup fails before initial certificate-row creation','The async chain publishes error code 500 for licence 502'],
    question:'Does this error remove B’s approved licence?',
    choices:['Yes, all services roll back together','No, these are separate service operations'],
    correct:1,reason:'The failure happens while Certificate processes an already-issued licence. Its async error path publishes a failure result. This is independent of the completed Profile transaction.',
    inspect:'Compare service_code and certificate_type with the active template lookup. Verify the template in the target environment before deciding how to reissue the operation.',
    refs:['license','template','initialCert','certResult']
  },
  certReplay: {
    name:'Repeat a failed certificate operation',when:'Same operation ID is delivered again',
    before:['Certificate inserts the operation ID before processing','A later PDF operation can fail','The error is converted to a result message'],
    after:['The repeated operation ID conflicts in processed_operation','tryInsert returns false','The consumer exits before processing the certificate requests again'],
    question:'Does repeating the same operation ID guarantee another render?',
    choices:['Yes, any failure clears the guard','No, the recorded ID causes the consumer to skip it'],
    correct:1,reason:'The inspected code inserts the operation marker first. The async failure handler publishes a result and does not remove that marker. Profile has a regeneration service path that creates a new operation ID for eligible licences. Its runtime permissions and success require verification.',
    inspect:'Read CertificateKafkaConsumer before assuming Kafka redelivery will retry the render. Then follow CertificateAsyncService.onErrorReturn and the operation repository. The Certificate result lesson also traces the regeneration service path. A live recovery procedure still needs verification.',
    refs:['certGuard','guardInsert','certRead','certResult']
  }
};
function recoveryLab(key) {
  const c=recoveryCases[key];
  main.innerHTML='<div class="tag">DR06 / Failure comparison</div><h1>What already exists?</h1><p class="lead">Change one condition and compare the records. Predict the outcome before revealing the source explanation. These scenarios illustrate the inspected code.</p><nav class="steps" aria-label="Failure scenarios">'+Object.entries(recoveryCases).map(([k,v])=>'<a href="#recovery/'+k+'" '+(key===k?'aria-current="page"':'')+'>'+v.name+'</a>').join('')+'</nav><div class="tag check">'+c.when+'</div><div class="below"><section class="panel"><h2>Starting condition</h2><ol>'+c.before.map(s=>'<li>'+s+'</li>').join('')+'</ol></section><section class="panel"><h2>Changed outcome</h2><ol>'+c.after.map(s=>'<li>'+s+'</li>').join('')+'</ol></section></div><section class="panel check"><h2>'+c.question+'</h2><div class="choices">'+c.choices.map((choice,i)=>'<button type="button" data-recovery-answer="'+i+'">'+choice+'</button>').join('')+'</div><p id="recoveryAnswer" role="status"></p><details class="proof"><summary>Where would I investigate?</summary><p>'+c.inspect+'</p></details>'+sources(c.refs)+'</section>';
  main.querySelectorAll('[data-recovery-answer]').forEach(button=>button.onclick=()=>{
    main.querySelector('#recoveryAnswer').textContent=(Number(button.dataset.recoveryAnswer)===c.correct?'Correct. ':'Compare the changed outcome. ')+c.reason;
  });
}
