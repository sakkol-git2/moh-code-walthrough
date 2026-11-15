// Manual redelivery simulations reuse the inspected DR06 guards and transaction boundaries.
const approvalRetryCases = {
  rollback: {
    title:'Retry after Profile rolls back',
    condition:'Inject a RuntimeException while processing B after A save calls. On the next delivery the transient failure is removed. Both attempts use valid version 3 approval data.',
    refs:['profileContract','profileTx','profileTxEnd','replay','license','snapshot'],
    frames:[
      ['First delivery','ReagentMapper.toRegisterRequestDto → ReagentRegisterHandler.handle','Absent','Absent','false','Registration transaction starts','Application 700 is already APPROVED. No Profile result for source application 700 exists.'],
      ['Failure while processing B','BaseRegisterHandler.handle → processLicenses','Pending registration, licence and snapshot','Processing fails · uncommitted','Not checked again inside this attempt','No after-commit ISSUE from this failed transaction','A save call has happened, but the shared Profile transaction is still open.'],
      ['After rollback','Profile transaction interceptor','Absent · pending A inserts rolled back','Absent · no committed B result','false on next delivery','No registration commit','Existing unrelated Profile rows survive. If this transaction inserted a new profile, that insert rolls back too.'],
      ['Redeliver successfully','ReagentRegisterHandler.handle → BaseRegisterHandler.handle','One committed result','One committed result','false before this attempt','Profile commits; ISSUE listener runs','The retry can create both products because no source snapshots survived. IDs may differ from the first attempt and sequences may have gaps.'],
      ['Deliver once more','ReagentRegisterHandler.handle','Same committed result','Same committed result','true → return','No new registration or ISSUE publish hook','The completed batch is skipped by source application ID 700.']
    ]
  },
  contract: {
    title:'Retry an invalid approval message',
    condition:'B application_type is missing from the received form data. The repaired delivery is an explicit teaching action replacing the bad payload with valid per-product IMPORT. An unchanged Kafka redelivery carries the same invalid data.',
    refs:['registrationEntry','profileContract','replay','profileTx'],
    frames:[
      ['Receive malformed data','ReagentMapper.toRegisterRequestDto','Absent','Absent','Not reached','B application_type = null','Application APPROVED is already committed. Mapper validates the product contract before handle.'],
      ['Reject the first delivery','ReagentMapper.toRegisterRequestDto','Absent','Absent','Not reached','IllegalArgumentException escapes','The Profile registration handler has not started.'],
      ['Redeliver unchanged','ReagentMapper.toRegisterRequestDto','Absent','Absent','Not reached','Same contract rejection','Retry alone does not supply B’s missing IMPORT value.'],
      ['Deliver corrected fixture','Mapper → ReagentRegisterHandler.handle','One committed result','One committed result','false → process','Version 3 · B IMPORT · source ID 802','Assume the corrected message and all later processing succeed. This action models payload correction separately from unchanged redelivery.']
    ]
  },
  duplicate: {
    title:'Duplicate after a successful commit',
    condition:'The complete A/B batch has committed. A later valid approval carries the same application ID and product IDs. The example changes a Kafka delivery label to show that DR06 checks business source identity.',
    refs:['consumer','inboxBypass','replay','profileKeys'],
    frames:[
      ['Existing committed batch','Previous BaseRegisterHandler.handle','One committed result','One committed result','Would return true','Source pairs (700,801) and (700,802)','B has one registration, one licence and one snapshot. Example registration 902 and licence 502 are local result IDs.'],
      ['Duplicate reaches Profile','ProfileKafkaConsumer.handleApplicationApproved → mapper','Same committed result','Same committed result','Not reached yet','Delivery label changes; application ID remains 700','The generic inbox is bypassed. The valid payload still reaches the DR06 handler.'],
      ['Business replay guard','ReagentRegisterHandler.handle → existsBySourceApplicationId(700)','Same committed result','Same committed result','true → return','No new registration or ISSUE publish hook','The guard uses source application ID, independently of Kafka offset, message key or this illustrative delivery label.'],
      ['After duplicate handling','ProfileKafkaConsumer.recordDocuments','Same committed result','Same committed result','Registration skipped','Document-history recording may still run','The consumer calls recordDocuments after the strategy returns. Skipping registration does not skip every consumer side effect. Document-history counts are outside this simulation.']
    ]
  },
  afterCommit: {
    title:'Retry after ISSUE send fails after commit',
    condition:'Kafka send throws synchronously after Profile commit. FAILED outbox recording in REQUIRES_NEW succeeds. Async future failure and configured Kafka retries are separate paths.',
    refs:['profileTxEnd','operationListener','profilePublishOutbox','independentOutbox','replay'],
    frames:[
      ['Profile commit succeeds','BaseRegisterHandler.handle','One committed result','One committed result','Would return true','B certificate status PENDING','The result rows have already committed before the transactional ISSUE listener runs.'],
      ['Post-commit send fails','ProfileKafkaProducer.publishWithOutbox','Same committed result','Same committed result','Not rechecked here','Synchronous send error; FAILED outbox row committed','The independent failure record survives along with the already committed registration rows.'],
      ['Manually redeliver approval','ReagentRegisterHandler.handle','Same committed result','Same committed result','true → return','FAILED outbox row remains; ISSUE hook skipped','Approval replay does not rerun publishEvents. This redelivery does not repair the failed ISSUE handoff.'],
      ['Inspect remaining work','Registration guard returned before handler','Same committed result','Same committed result','Already skipped','Licence stays PENDING in this fixture','Existing registration and outstanding downstream work are different states. This lesson makes no claim that an automatic outbox dispatcher repairs this failure.']
    ]
  },
  concurrent: {
    title:'Two overlapping approval attempts',
    condition:'Conditional database race simulation. Both deliveries pass validation and read the guard before either commits. Both reach snapshot insertion. Assume no earlier lock or eligibility failure stops them, and attempt 1 commits first.',
    refs:['replay','profileKeys','profileTx','profileTxEnd'],
    frames:[
      ['Both read before commit','Attempt 1 and 2 · existsBySourceApplicationId(700)','Absent','Absent','Both read false','Two open Profile transactions','A read-before-write guard alone cannot exclude this interleaving.'],
      ['Both attempt inserts','processLicenses → detailRepository.save','Attempt-local pending rows','Attempt-local pending rows','Both already passed','Competing source pairs (700,801), (700,802)','These writes have not both committed. Unique source application/position can also conflict.'],
      ['First commits, second conflicts','Database unique constraint → losing transaction rollback','One winning committed result','One winning committed result','Winner now exists','Losing pending registration, licence and snapshot rows roll back','Conflict can surface at insert, flush or commit. The losing transaction does not leave its earlier save calls committed.'],
      ['Redeliver losing attempt','ReagentRegisterHandler.handle','Same winning result','Same winning result','true → return','No duplicate product registrations','A later delivery sees the winning source snapshots. This is a predicted constraint outcome, not a concurrency integration test.']
    ]
  },
  partial: {
    title:'Existing A snapshot but B is missing',
    condition:'Diagnostic starting fixture with a previously committed A snapshot only, such as legacy or manually inconsistent data. The inspected atomic A/B registration transaction would roll back both on an escaping runtime failure.',
    refs:['replay','profileKeys','profileTx'],
    frames:[
      ['Inspect inconsistent starting rows','reagent_product_license_details','One committed result','Absent','Would return true','Only source pair (700,801) exists','A missing B row requires checking batch completeness.'],
      ['Redeliver the complete approval','Mapper → ReagentRegisterHandler.handle','Same committed result','Absent','true → return','A snapshot makes the application-level guard pass','existsBySourceApplicationId asks whether any snapshot exists. It does not compare the expected product list.'],
      ['Observe the remaining gap','Handler returns before product loop','Same committed result','Still absent','Registration skipped','B is not filled in by approval replay','The unique product-pair constraint prevents duplicate pairs. It does not create missing B or establish complete batch processing.']
    ]
  }
};
function approvalRetry(key,index){
  const scenario=approvalRetryCases[key],frame=scenario.frames[index];
  main.innerHTML='<div class="tag">Application + Profile / Kafka approval</div><h1>Retry and duplicate deliveries</h1><p class="lead">Follow each delivery alongside committed rows. Product B keeps source identity (application 700, product 802) across attempts.</p><label class="field">Approval case <select id="retryCase">'+Object.entries(approvalRetryCases).map(([id,c])=>'<option value="'+id+'" '+(key===id?'selected':'')+'>'+c.title+'</option>').join('')+'</select></label><nav class="steps" aria-label="Approval retry checkpoints">'+scenario.frames.map((f,i)=>'<a href="#approval-retry/'+key+'/'+i+'" '+(i===index?'aria-current="step"':'')+'>'+f[0]+'</a>').join('')+'</nav><section class="panel check"><h2>'+frame[0]+'</h2><p><code>'+escapeHtml(frame[1])+'</code></p><p>'+frame[6]+'</p><div class="transaction-box"><strong>Application 700 · APPROVED · already committed</strong></div>'+bTable(['State to inspect','At this checkpoint'],[['A · source pair (700,801)',frame[2]],['B · source pair (700,802)',frame[3]],['existsBySourceApplicationId(700)',frame[4]],['Event / delivery outcome',frame[5]]])+'<div class="b-relations check"><div class="b-record"><strong>Selected decoded approval fields</strong>'+pre(JSON.stringify({application_id:700,service_code:'GDHT-RG-L',form_data:{reagent:{contract_version:3,products:[{id:801,application_type:'LOCAL'},{id:802,application_type:key==='contract'&&index<3?null:'IMPORT'}]}}},null,2))+'</div><div class="b-record focus"><strong>Product B identity</strong><p>source_application_id 700 + source_product_id 802</p><p>On successful creation, the snapshot references one local registration and its licence. Example IDs 902 and 502 illustrate the first successful result. New attempts may allocate other IDs.</p><p>Per-product origin and attachments stay with B. Selected prerequisite 42 and actual resolved profile 99 follow the existing illustrated resolver-gap fixture.</p></div></div><div class="choices check">'+(index?'<a class="btn light" href="#approval-retry/'+key+'/'+(index-1)+'">Previous checkpoint</a>':'')+(index<scenario.frames.length-1?'<a class="btn" href="#approval-retry/'+key+'/'+(index+1)+'">'+(scenario.frames[index+1][0].includes('deliver')?'Simulate next delivery':'Next checkpoint')+'</a>':'<a class="btn" href="#approval-retry/'+key+'/0">Reset this case</a>')+'</div></section><details class="panel check"><summary>Case assumptions and Java / SQL evidence</summary><p>'+scenario.condition+'</p>'+sources(scenario.refs)+'</details><p class="src">Redelivery is triggered manually in this local lesson. Broker retry count, backoff, acknowledgement, dead-letter routing and deployed constraints were not exercised. The row states are source-based simulations using fictional IDs.</p><p><a href="#b-lesson/journey/6">Return to Product B approval →</a></p>';
  main.querySelector('#retryCase').onchange=e=>{location.hash='approval-retry/'+e.target.value+'/0';};
}
