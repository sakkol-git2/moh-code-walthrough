// The teaching cases are explicitly separated from inspected MOH call paths.
const partialSaveCases = {
  localCatch: {
    name:'Caught locally · transaction can commit',kind:'Source-backed boundary with an injected helper failure',
    boundary:'Application transaction · same-bean helper → local catch → normal return',
    method:'ApplicationServiceImpl.updatePaymentStatus → catch (BaseException)',
    explanation:'The code sets paymentStatus and paidDate before finalization, then catches BaseException. In this example the error is thrown directly inside the same transaction and no participant has marked rollback-only. The catch logs the error and the method returns normally. Managed entity changes can be flushed at commit.',
    outcome:'The injected finalization work failed, but the transaction can commit the payment fields. This source path handles a payment event; a logged error does not imply an HTTP failure response.',
    condition:'The error must be caught before a transactional participant marks rollback-only. A repository or proxied REQUIRED method can change that outcome. This is a source-based prediction for the stated failure location.',
    refs:['caughtPayment','paymentCatch','paymentEntry'],
    rows:[
      ['applications · 700','Payment pending','paymentStatus=PAID, paidDate set · pending','Payment fields can commit'],
      ['application status','AWAITING_PAYMENT','Finalization fails before status advances','May remain AWAITING_PAYMENT'],
      ['Product B · 802','Saved draft product','No product change','Saved draft product']
    ],
    events:['Begin Application payment-handler transaction','Change managed payment fields','Inject a direct helper error','Catch and log it inside the transaction','Return normally; commit if not rollback-only']
  },
  joined: {
    name:'Caught REQUIRED failure · outer rollback',kind:'Framework teaching example',
    boundary:'Outer REQUIRED transaction → joined REQUIRED participant → catch → outer commit attempt',
    method:'A proxied REQUIRED participant throws; its transaction interceptor marks the shared transaction rollback-only',
    explanation:'The outer caller catches the exception, but the participant has already marked the shared transaction rollback-only. Catching the Java exception does not clear that marker.',
    outcome:'The outer commit attempt rolls back the shared work and raises UnexpectedRollbackException. None of this transaction’s rows commit.',
    condition:'This is a teaching example of REQUIRED participation, not a claim that DR06’s save method catches its strategy failure. The inspected DR06 save normally lets that failure propagate.',
    refs:['appSaveTx','draftTx','strategySave'],
    rows:[
      ['Outer application edits','Original values','Edits pending in shared transaction','Original values restored'],
      ['Joined product edits','Original products','Edits pending in same transaction','Original products restored'],
      ['Shared rollback-only flag','false','true after participant failure','Transaction rolled back']
    ],
    events:['Begin outer transaction','Enter proxied REQUIRED participant','Participant throws a runtime exception','Interceptor marks shared transaction rollback-only','Outer catches and returns','Commit attempt throws UnexpectedRollbackException']
  },
  independentCommit: {
    name:'REQUIRES_NEW commits · outer later fails',kind:'Framework teaching example',
    boundary:'Outer transaction suspended → independent transaction commits → outer resumes and rolls back',
    method:'REQUIRES_NEW participant invoked through its transaction proxy',
    explanation:'The inner transaction has its own commit. A later failure of the outer transaction does not undo that completed inner commit. Profile’s OutboxServiceImpl.record declares REQUIRES_NEW, but its actual licence-operation call happens after Profile commit, as shown in the last case.',
    outcome:'The failed outer request can leave the independent row saved. The outer transaction’s edits roll back.',
    condition:'The inner write succeeds and commits before the outer failure. This example models propagation, not an additional outbox call inside the current DR06 registration loop.',
    refs:['independentOutbox','profilePublishOutbox'],
    rows:[
      ['Outer business row','Original value','Edited · outer transaction pending','Original value restored'],
      ['Independent record','No row','Inner transaction committed','Row remains saved'],
      ['Transaction relationship','One outer transaction','Outer suspended during inner work','Inner commit survives outer rollback']
    ],
    events:['Start outer transaction','Suspend outer; begin REQUIRES_NEW','Save and commit independent record','Resume outer transaction','Outer throws runtime exception','Roll back only outer transaction']
  },
  independentFailure: {
    name:'REQUIRES_NEW fails · outer catches and commits',kind:'Framework teaching example',
    boundary:'Independent inner rollback → outer catch → outer commit',
    method:'Outer caller catches an exception escaping a REQUIRES_NEW participant',
    explanation:'The independent inner transaction rolls back its own work. The resumed outer transaction can still commit if it is not rollback-only and returns normally.',
    outcome:'The outer row can stay saved while the independent operation has no committed row.',
    condition:'This assumes the outer caller handles the error and does not rethrow or mark itself rollback-only. It describes propagation rather than the specific catch blocks inside OutboxServiceImpl.',
    refs:['independentOutbox'],
    rows:[
      ['Outer business row','Original value','Edited · outer transaction pending','Edited value committed'],
      ['Independent record','No row','Inner write attempted, then rolled back','No committed row'],
      ['Outer rollback-only flag','false','Still false after catching independent failure','Outer commits']
    ],
    events:['Start outer transaction','Suspend outer; begin REQUIRES_NEW','Inner throws and rolls back','Resume outer and catch exception','Outer returns normally','Commit outer work']
  },
  responseFailure: {
    name:'Response mapping fails · saved draft remains',kind:'Inspected Application controller order with injected response failure',
    boundary:'Application service commits → controller maps response → mapping fails',
    method:'ApplicationController.createApplication / updateApplication after applicationService.saveApplication returns',
    explanation:'The controller calls the transactional service before mapping and decorating the response. In this example the service succeeds and commits, then response mapping throws. The controller has no surrounding transaction annotation in the inspected class.',
    outcome:'The HTTP request can fail after the draft was saved. Its application, detail and product rows remain committed. Before retrying a create request, check whether it already created a draft.',
    condition:'This injects a response-mapping error after a successful service return. It does not assert that the mapper currently fails or that retrying creates an identical result.',
    refs:['http','controllerUpdate','appSaveTx'],
    rows:[
      ['applications · 700','Original draft or no new draft','Service transaction committed new values','Saved draft remains'],
      ['DR06 detail and products','Prior state','Service transaction committed new values','Saved detail/products remain'],
      ['HTTP response','Not sent','Response mapping throws','Failure response is possible']
    ],
    events:['Controller calls transactional save service','Service saves parent, detail and products','Service transaction commits','Controller starts response mapping','Inject response failure','Earlier service commit stays saved']
  },
  afterCommit: {
    name:'Profile post-commit failure · rows remain',kind:'Inspected Profile listener order with synchronous send failure',
    boundary:'Profile commit → transactional event listener → REQUIRES_NEW outbox record',
    method:'ProfileKafkaProducer.produceProfileLicenseOperationEvent → publishWithOutbox → OutboxServiceImpl.record',
    explanation:'Profile publishes the licence-operation event inside registration processing. The transactional listener runs after commit. If the Kafka send throws synchronously, publishWithOutbox attempts a FAILED outbox record in a new transaction, then rethrows the error.',
    outcome:'Profile’s registrations, licences and snapshots are already committed. If the FAILED outbox write succeeds, that record also remains. The listener error cannot roll back the earlier Profile commit.',
    condition:'This case assumes a synchronous send error and a successful outbox record. A future that completes exceptionally after send returns follows a different path: the shown code does not await that future. The result is a failed processing path, not necessarily an HTTP request.',
    refs:['profileTxEnd','operationListener','profilePublishOutbox','independentOutbox'],
    rows:[
      ['B registration/licence/detail','None for this approval','Profile transaction committed them','Rows remain saved'],
      ['B licence certificate status','Not assigned yet','PENDING committed before listener','PENDING remains until a result updates it'],
      ['FAILED outbox record','No failure record','REQUIRES_NEW write succeeds','Failure record remains saved']
    ],
    events:['Process Profile registration transaction','Commit registrations, licences and details','Run licence-operation listener after commit','Synchronous Kafka send throws','Record FAILED in REQUIRES_NEW, assuming success','Rethrow listener error after the earlier commit']
  }
};

function partialSaveLab(key='responseFailure', phase=0) {
  const c=partialSaveCases[key];
  history.replaceState(null,'','#partial-save/'+key+'/'+phase);
  const phases=['Before the action','At the failure boundary','After handling finishes'];
  main.innerHTML='<div class="tag">Application + Profile / Catches and separate transactions</div><h1>Can a failure leave rows saved?</h1><p class="lead">Follow the transaction boundary as well as the exception. Each case states whether it follows an inspected call path or demonstrates framework propagation.</p><label class="field">Boundary case <select id="partialCase">'+Object.entries(partialSaveCases).map(([k,v])=>'<option value="'+k+'" '+(key===k?'selected':'')+'>'+v.name+'</option>').join('')+'</select></label><div class="steps" role="group" aria-label="Transaction phases">'+phases.map((name,i)=>'<button class="action" data-partial-phase="'+i+'" aria-pressed="'+(phase===i)+'">'+(i+1)+' · '+name+'</button>').join('')+'</div><div class="transaction-box"><div class="tag">'+c.kind+'</div><p>'+c.boundary+'</p></div><div class="lessonbody"><article class="panel" aria-live="polite"><div class="tag">'+phases[phase]+'</div><h2>'+c.name+'</h2><code>'+c.method+'</code><div class="rows"><table><thead><tr><th>Row / state</th><th>'+phases[phase]+'</th></tr></thead><tbody>'+c.rows.map(row=>'<tr><th scope="row">'+row[0]+'</th><td>'+row[phase+1]+'</td></tr>').join('')+'</tbody></table></div><p>'+(phase===2?c.outcome:c.explanation)+'</p><details class="proof"><summary>Conditions that determine this outcome</summary><p>'+c.condition+'</p></details></article><aside class="side"><h2>Execution order</h2><ol>'+c.events.map(event=>'<li>'+event+'</li>').join('')+'</ol><details class="proof"><summary>Inspect related source</summary>'+sources(c.refs)+'</details></aside></div><details class="panel check"><summary>What did the local framework diagnostic verify?</summary><p>'+propagationObservation.description+'</p>'+pre(propagationObservation.output)+'<p>The row tables illustrate the stated conditions. No live MOH request or database write was executed.</p></details><p class="check"><a href="#rollback-lab">Compare uncaught failure inside one transaction →</a></p>';
  main.querySelector('#partialCase').onchange=event=>partialSaveLab(event.target.value,0);
  main.querySelectorAll('[data-partial-phase]').forEach(button=>button.onclick=()=>partialSaveLab(key,Number(button.dataset.partialPhase)));
}
