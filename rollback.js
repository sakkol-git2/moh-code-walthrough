// These are transaction-boundary simulations. No database writes are performed by this page.
const rollbackCases = {
  placement: {
    name:'Application · wrong attachment placement',
    exception:'CustomValidationException → BadRequestException → BaseException → RuntimeException',
    failure:'DR06 save rejects the attachment scope before the parent save.',
    outcome:'The exception escapes the transactional save. The existing draft rows keep their original values.',
    refs:['draftTx','attachmentPlacement','rollbackValidation','runtimeBase'],
    actions:['Begin Application save transaction','Check shared/product attachment placement','Throw CustomValidationException','Roll back the transaction'],
    rows:[
      ['applications · 700','Original draft','No change attempted','Original draft'],
      ['application_reagent_details · 700','prerequisite 42','No change attempted','prerequisite 42'],
      ['application_reagent_products · 801, 802, 803','A, B and C','No product write reached','A, B and C']
    ]
  },
  identity: {
    name:'Application · invalid B product ID',
    exception:'CustomValidationException → RuntimeException',
    failure:'syncProducts rejects a product ID after the parent and DR06 detail have been saved inside the transaction.',
    outcome:'The parent and detail saves belong to this same transaction. Their pending edits roll back. Product membership was never changed.',
    refs:['appSaveTx','strategySave','draftDetail','syncRules','rollbackValidation','runtimeBase'],
    actions:['Begin Application save transaction','Save edited parent application','Save edited prerequisite detail','Validate supplied product IDs','Throw before delete/save product loop','Roll back parent and detail edits'],
    rows:[
      ['applications · 700','Original draft','Edited parent · pending','Original draft'],
      ['application_reagent_details · 700','prerequisite 42','prerequisite 99 · pending','prerequisite 42'],
      ['application_reagent_products · 801, 802, 803','A, B and C','ID error before membership changes','A, B and C']
    ]
  },
  resolution: {
    name:'Application · B attachment resolution fails late',
    exception:'NotFoundException → BaseException → RuntimeException',
    failure:'The example reaches the resolver for B after removing C and saving A. The resolver cannot find B’s uploaded file.',
    outcome:'All those changes share the Application save transaction. C is restored, A keeps its old values, and B’s in-memory mapped changes are discarded. The parent/detail edits also roll back.',
    refs:['appSaveTx','draftTx','syncRemove','resolveMetadata','rollbackNotFound','runtimeBase'],
    actions:['Begin Application save transaction','Save parent and detail edits','Validate IDs and file ownership','Delete omitted product C · pending','Map and save A edits · pending','Map B fields before resolving its files','Throw NotFoundException in B’s resolver','Roll back the entire transaction'],
    rows:[
      ['applications · 700','Original draft','Edited parent · pending','Original draft'],
      ['application_reagent_details · 700','prerequisite 42','prerequisite 99 · pending','prerequisite 42'],
      ['application_reagent_products · A 801','Product A','A edited and save called · pending','Product A'],
      ['application_reagent_products · B 802','Product B','B mapped in memory; save not reached','Product B'],
      ['application_reagent_products · C 803','Product C','Delete requested · pending','Product C']
    ],
    condition:'This isolates a resolver failure after the earlier checks passed, such as a file disappearing between checks. A public caller’s already-unknown file normally fails the earlier ownership check. This is a boundary simulation, not a reproduced database race.'
  },
  profileParse: {
    name:'Profile · invalid approval before registration',
    exception:'IllegalArgumentException',
    failure:'Profile’s mapper rejects B’s missing origin before registerHandler.handle is invoked.',
    outcome:'Application 700 was approved in an earlier transaction and stays APPROVED. The Profile registration handler has not started, so it creates no A/B registration, licence or snapshot for this delivery.',
    refs:['approve','registrationEntry','profileContract'],
    actions:['Application approval has already committed','Deliver ApplicationApprovedMessage to Profile','Parse and validate all products','Reject B’s missing origin','No registration-handler transaction started'],
    rows:[
      ['Application · applications 700','APPROVED · previously committed','Profile cannot change this transaction','APPROVED'],
      ['Application · products 801 and 802','Saved approved product data','No local Application write','Saved approved product data'],
      ['Profile · A/B registrations and licences','None for this example delivery','Handler not reached','None created'],
      ['Profile · reagent_product_license_details','None for source application 700','Mapper rejects before handle','None created']
    ]
  },
  profileLoop: {
    name:'Profile · runtime failure while processing B',
    exception:'Injected RuntimeException inside BaseRegisterHandler.handle',
    failure:'The exercise injects a runtime failure after A’s registration, licence and snapshot saves, while B is still being processed.',
    outcome:'The Profile handler transaction rolls back its new rows and profile changes for this approval. Application’s earlier APPROVED state remains committed. Existing unrelated Profile records remain.',
    refs:['profileTx','profileTxEnd','license','snapshot'],
    actions:['Application approval has already committed','Begin BaseRegisterHandler transaction','Resolve the profile','Save A registration, licence and detail · pending','Start B processing and inject a runtime exception','Roll back this Profile handler transaction'],
    rows:[
      ['Application · applications 700','APPROVED','No write by Profile','APPROVED'],
      ['Profile · existing profile','Existing profile before delivery','Possible field edits · pending','Existing values restored'],
      ['Profile · A registration/licence/detail','No new A result yet','Save calls reached · pending','No new A result committed'],
      ['Profile · B registration/licence/detail','No new B result yet','Failure during processing','No new B result committed']
    ],
    condition:'This is an explicitly injected failure to explain the shared Profile transaction. It is not a claim that this exception occurs in a normal DR06 approval. If the generic resolver created a new profile in this transaction, that insert would roll back too.'
  }
};

function rollbackLab(key='resolution', phase=0) {
  const c=rollbackCases[key];
  history.replaceState(null, '', '#rollback-lab/'+key+'/'+phase);
  const column=phase===0?1:phase===1?2:3;
  const titles=['Before the action','At the failure point','After failure handling'];
  const values=c.rows.map(row=>'<tr><th scope="row">'+row[0]+'</th><td>'+row[column]+'</td></tr>').join('');
  const inside=phase===1?'These are pending changes or reached code paths. A repository save call can precede commit. SQL may be flushed before failure, while the transaction can still roll back.':phase===2?c.outcome:'Existing saved rows form the starting fixture. The late-failure examples include C (803) so you can observe an attempted deletion being rolled back.';
  main.innerHTML='<div class="tag">Application + Profile / Rollback laboratory</div><h1>Which rows survive this failure?</h1><p class="lead">Choose where the error occurs, then compare the starting rows, pending work and final database outcome. The examples assume normal calls through Spring transaction proxies, an escaping exception and the inspected default rollback policy.</p><label class="field">Failure case <select id="rollbackCase">'+Object.entries(rollbackCases).map(([k,v])=>'<option value="'+k+'" '+(k===key?'selected':'')+'>'+v.name+'</option>').join('')+'</select></label><div class="steps" role="group" aria-label="Failure phases">'+titles.map((name,i)=>'<button class="action" data-rollback-phase="'+i+'" aria-pressed="'+(phase===i)+'">'+(i+1)+' · '+name+'</button>').join('')+'</div><div class="lessonbody"><article class="panel" aria-live="polite"><div class="tag">'+titles[phase]+'</div><h2>'+c.name+'</h2><p>'+c.failure+'</p><div class="rows"><table><thead><tr><th>Table / row</th><th>State in this phase</th></tr></thead><tbody>'+values+'</tbody></table></div><p>'+inside+'</p>'+(c.condition?'<details class="proof"><summary>Conditions for this example</summary><p>'+c.condition+'</p></details>':'')+'</article><aside class="side"><h2>Read the execution order</h2><ol>'+c.actions.map(action=>'<li>'+action+'</li>').join('')+'</ol><h3>Exception path</h3><p><code>'+c.exception+'</code></p><details class="proof"><summary>Inspect the source</summary>'+sources(c.refs)+'</details></aside></div><details class="panel check"><summary>How was the rollback rule checked?</summary><p>'+rollbackObservation.description+'</p>'+pre(rollbackObservation.output)+'<p>The check exercises the default rule with installed classes. It does not execute a real service request or observe a database rollback. The row outcomes are source-based predictions for the stated transaction boundaries. Database sequence values can have gaps after a rollback.</p>'+sources(['rollbackValidation','runtimeBase','rollbackNotFound'])+'</details><p class="check"><a href="#partial-save">Explore caught exceptions and separate transactions →</a></p><details class="panel check"><summary>Why can a failed response still leave earlier work saved?</summary><p>Transactions have boundaries. A Profile failure cannot roll back an Application approval that already committed. Within one uncaught-runtime-failure transaction, the earlier repository saves roll back together. A caught exception or a separate transaction would need its own trace before predicting the outcome.</p></details>';
  main.querySelector('#rollbackCase').onchange=event=>rollbackLab(event.target.value,0);
  main.querySelectorAll('[data-rollback-phase]').forEach(button=>button.onclick=()=>rollbackLab(key,Number(button.dataset.rollbackPhase)));
}
