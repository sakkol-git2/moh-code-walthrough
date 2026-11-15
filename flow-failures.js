// Source-based teaching fixtures. This page never sends requests or writes MOH rows.
const flowFailureCases = {
  save: {
    placement: {base:'placement', stop:2, method:'ReagentRegistrationApplicationStrategy.saveApplication → validateAttachmentPlacement',
      input:{method:'PUT',application_id:700,attachments:[{key:'application_form',id:'sample-form-B'}],problem:'Only establishment_decision may be shared'},
      fail:[2,2,'Shared application_form rejected before parent save'],
      handling:[[2,3,'rollback','End Application transaction · no writes reached'],[1,0,'return','Validation failure response · original draft remains']]},
    identity: {base:'identity',stop:5,method:'ReagentRegistrationApplicationStrategy.syncProducts',
      input:{application_id:700,'reagent.products[1].id':999,problem:'ID 999 does not belong to this application'},
      fail:[2,2,'Reject B’s supplied product ID'],
      handling:[[2,3,'rollback','Roll back pending parent and detail edits'],[1,0,'return','Validation failure · A, B and C stay saved']]},
    resolution: {base:'resolution',stop:6,method:'syncProducts → attachmentResolutionService.resolve → resolveMetadata',
      input:{application_id:700,incoming_product_ids:[801,802],omitted_product_id:803,'B.attachments':[ {id:'sample-disappeared-file',key:'application_form'} ],condition:'Earlier ownership check passed; resolution now fails'},
      extra:[[2,3,'write','Delete omitted C 803 · pending'],[2,3,'write','Save edited A 801 · pending'],[2,2,'call','Map B 802 in memory; resolve B’s own files']],
      fail:[2,2,'NotFoundException · B file cannot be resolved'],
      handling:[[2,3,'rollback','ROLLBACK · restore C, A, parent and detail'],[1,0,'return','Failed save · original draft rows remain']]},
    response: {partial:'responseFailure',stop:8,name:'Save succeeds, response mapping fails',method:'ApplicationController.updateApplication → applicationStrategyFactory.mapToResponseDto',
      input:{method:'PUT',application_id:700,condition:'Successful service commit, then injected response-mapping error'},
      extra:[[1,3,'commit','Commit Application save before controller response mapping']],
      fail:[1,1,'Injected response mapping exception after service return'],
      handling:[[1,0,'return','HTTP failure possible · saved draft is still committed']]}
  },
  submit: {
    documents: {name:'Product B is missing its required form',stop:3,method:'buildValidationProcessor → validateProductAttachments → ApplicationCoreHandler.validateSubmitApplication',
      exception:'CustomValidationException → RuntimeException',
      failure:'The saved draft has Product A’s required form but Product B has no application_form. DR06 collects B’s field error, then the shared validator throws.',
      outcome:'The submission transaction rolls back its tracking/context edits. The previously committed draft stays DRAFT, including B’s missing form. No invoice request was reached.',
      condition:'This is an incomplete saved draft, with other fields and prerequisite valid. Draft save permits incomplete required documents. The failed submission does not erase or repair previously committed draft data.',
      refs:['submitEntry','dr06SubmitChecks','coreSubmitValidation','rollbackValidation','runtimeBase','submitGates'],
      rows:[['applications · 700','DRAFT · original tracking','Tracking/context edits pending','DRAFT · original tracking restored'],['application_reagent_details · 700','prerequisite 42 · committed','Read only','prerequisite 42 · committed'],['Product A · 801','Own form present · committed','Read only','Own form present · committed'],['Product B · 802','Own form missing · committed','Per-product validation fails','Own form still missing · draft stays saved'],['Payment invoice for this attempt','Not requested','Invoice code not reached','No request from this attempt']],
      input:{application_id:700,products:[{id:801,application_type:'LOCAL',application_form:'present'},{id:802,application_type:'IMPORT',application_form:'missing'}],error_location:'reagent.products[1].attachments'},
      fail:[1,1,'Throw submission.validation.failed · B’s own file missing'],
      handling:[[1,2,'rollback','Roll back submission edits · keep the existing draft'],[1,0,'return','Validation error · no invoice / no submission event']]},
    invoice: {name:'Invoice reply times out',stop:5,method:'InvoiceServiceImpl.issueInvoice → sendAndReceive(...).get(10, TimeUnit.SECONDS)',
      exception:'TimeoutException wrapped in InternalServerErrorException → BaseException → RuntimeException',
      failure:'Application has pending AWAITING_PAYMENT changes and sends an invoice request. The reply wait times out and a runtime exception escapes submission.',
      outcome:'Application rolls back its pending waiting state and tracking/context edits. The saved DRAFT and both products remain. The timeout does not tell us whether the remote Payment service created an invoice.',
      condition:'All validation passed; payment is required and not waived. This models an invoice reply timeout. A remote service has its own transaction, so its rows cannot be rolled back by Application. Inspect remote state before deciding how to retry.',
      refs:['submitEntry','payment','invoiceCall','invoiceTimeout','invoiceTimeoutRuntime','runtimeBase'],
      rows:[['applications · 700','DRAFT / PENDING · committed','AWAITING_PAYMENT / PENDING · pending','DRAFT / PENDING · prior values restored'],['DR06 detail and A/B products','Saved draft rows','No product writes','Saved draft rows remain'],['Remote Payment invoice','Unknown remote state','Request sent; no reply received','UNKNOWN · may exist; local rollback cannot decide']],
      input:{message:'IssueInvoiceMessage',application_id:700,quantity:2,wait_seconds:10,result:'No reply observed before timeout'},
      extra:[[1,4,'kafka','IssueInvoiceMessage · application 700 · quantity 2']],
      fail:[4,1,'Reply wait times out → InternalServerErrorException'],
      handling:[[1,2,'rollback','Roll back Application transaction only'],[1,0,'return','Failed submit response · remote invoice state unknown']]}
  },
  approve: {
    contract: {base:'profileParse',stop:4,method:'ReagentLicenseRegistrationStrategy.processApprovedMessage → ReagentMapper.toRegisterRequestDto',
      input:{message:'ApplicationApprovedMessage',source_application_id:700,contract_version:3,products:[{id:801,application_type:'LOCAL'},{id:802,application_type:null}],problem:'B origin absent in received message'},
      extra:[[2,3,'kafka','Profile receives ApplicationApprovedMessage · app 700']],
      fail:[3,3,'IllegalArgumentException · reject all products before handle'],
      handling:[[3,4,'read','No registration transaction started · no A/B inserts'],[3,2,'return','Delivery processing fails · Application APPROVED stays saved']]},
    product: {base:'profileLoop',stop:7,method:'BaseRegisterHandler.handle → ReagentRegisterHandler.processLicenses',
      input:{message:'ApplicationApprovedMessage',source_application_id:700,source_product_ids:[801,802],injected_failure:'While processing B after A save calls'},
      extra:[[3,4,'write','Save A registration 901, licence 501 and snapshot · pending'],[3,3,'call','Begin B 802 processing']],
      fail:[3,3,'Injected RuntimeException while processing B'],
      handling:[[3,4,'rollback','Roll back this entire Profile registration transaction'],[3,2,'return','Processing fails · earlier Application approval remains']]},
    afterCommit: {partial:'afterCommit',stop:9,name:'Profile commits, ISSUE send fails',method:'ProfileKafkaProducer.produceProfileLicenseOperationEvent → publishWithOutbox → OutboxServiceImpl.record',
      input:{operation_type:'ISSUE',profile_id:99,licence_ids:[501,502],assumption:'Kafka send throws synchronously; FAILED outbox write succeeds'},
      extra:[[3,4,'commit','Commit Profile registrations, licences and snapshots']],
      fail:[3,2,'Synchronous ISSUE send throws after Profile commit'],
      handling:[[3,4,'write','REQUIRES_NEW · save FAILED outbox record and commit'],[3,3,'return','Rethrow listener error · earlier committed rows survive']]}
  }
};
function failureCase(key,id){
  const raw=flowFailureCases[key][id];
  const c={...(raw.base?rollbackCases[raw.base]:raw.partial?partialSaveCases[raw.partial]:{}),...raw};
  if(key==='approve'){
    const appRow=['Application · applications 700','REVIEW · committed before decision','APPROVED · committed before Profile failure','APPROVED · earlier commit remains'];
    c.rows=[appRow,...c.rows.filter(row=>!row[0].startsWith('Application · applications'))];
    if(id==='afterCommit') c.rows.splice(1,0,
      ['Profile · profiles 99','Existing profile · original values','Handler changes already committed','Profile changes remain saved'],
      ['Profile · A registration/licence/detail','No new A result','Profile transaction committed A rows','A rows remain saved']);
  }
  return c;
}
function failureScenarioPicker(key,selected='success'){
  return '<label class="field">Sequence scenario <select id="failureScenario"><option value="success" '+(selected==='success'?'selected':'')+'>Successful path</option>'+Object.keys(flowFailureCases[key]).map(id=>'<option value="'+id+'" '+(selected===id?'selected':'')+'>'+escapeHtml(failureCase(key,id).name)+'</option>').join('')+'</select></label>';
}
function attachFailurePicker(key){
  const select=main.querySelector('#failureScenario');
  if(select) select.onchange=()=>{location.hash=select.value==='success'?'flow/'+key+'/0':'flow-failure/'+key+'/'+select.value+'/0';};
}
function failureExchanges(key,c,phase){
  if(phase===0) return [];
  const prefix=flowSequences[key].exchanges.filter(([step])=>step<c.stop).map(([,from,to,kind,label])=>[0,from,to,kind,label]);
  if(key==='save') prefix[0][4]='PUT /api/v1/applications/700 · edit existing draft';
  // Do not show a successful return/commit before the injected response error.
  if(key==='save' && c.partial==='responseFailure'){
    const last=prefix.findIndex(e=>e[4].startsWith('Finish strategy'));
    if(last>=0) prefix.splice(last);
  }
  const extra=(c.extra||[]).map(e=>[0,...e]);
  const failure=[1,c.fail[0],c.fail[1],'failure',c.fail[2]];
  return [...prefix,...extra,failure,...(phase===2?c.handling.map(e=>[2,...e]):[])];
}
function failureCanvas(lanes,events,phase){
  const width=lanes.length*170;
  return '<div class="sequence-board" tabindex="0" aria-label="Scrollable failure sequence diagram"><div class="sequence-canvas" style="width:'+width+'px"><div class="sequence-headers" style="grid-template-columns:repeat('+lanes.length+',170px)">'+lanes.map(x=>'<span>'+escapeHtml(x)+'</span>').join('')+'</div><div class="sequence-lifelines" aria-hidden="true">'+lanes.map((_,i)=>'<span style="left:'+((i+.5)*170)+'px"></span>').join('')+'</div>'+(events.length?events.map(([step,from,to,kind,label],n)=>{
    const x1=(from+.5)*170,x2=(to+.5)*170;
    const path=from===to?'M '+x1+' 53 h 36 v 19 h -36':'M '+x1+' 60 H '+x2;
    const color=kind==='failure'?'#a82832':kind==='rollback'?'#925011':kind==='kafka'?'#99471c':'#315c52';
    return '<div class="sequence-exchange '+(step===phase?'selected':'completed')+' branch-'+kind+'"><span class="sequence-label">'+escapeHtml(label)+'</span><span class="sequence-kind">'+kind+'</span><span class="sr-only">'+escapeHtml(lanes[from]+' to '+lanes[to])+'</span><svg viewBox="0 0 '+width+' 88" aria-hidden="true"><defs><marker id="failure-tip-'+n+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="'+color+'"/></marker></defs><path d="'+path+'" fill="none" stroke="'+color+'" stroke-width="2" '+(['kafka','return','rollback'].includes(kind)?'stroke-dasharray="7 5"':'')+' marker-end="url(#failure-tip-'+n+')"/></svg></div>';
  }).join(''):'<p class="sequence-empty">No call executed yet. Review the saved starting rows below.</p>')+'</div></div>';
}
function flowFailure(key,id,phase){
  const c=failureCase(key,id),phases=['Before the attempt','At the failure','After handling'];
  const fixture=key==='save'?'Existing draft 700 with A 801, B 802 and C 803. This is an edit, unlike the successful new-draft example.':key==='approve'?'Journey starts with Application in REVIEW and no new A/B Profile result. At the red failure, Application approval has already committed. This is a first delivery fixture. Actual resolved profile 99 is illustrative; selected prerequisite 42 remains separate.':'Existing draft 700 with A 801 and B 802. Previously saved draft rows are the starting point.';
  const description=c.failure||c.explanation;
  main.innerHTML='<div class="tag">Application + Profile / '+coreFlows[key].name+'</div><h1>Follow a failure branch</h1><p class="lead">A save call is not a commit. Follow the red stopping point, then inspect which transaction can still roll back.</p><div class="choices">'+Object.entries(coreFlows).map(([k,v])=>'<a class="btn light" href="#flow/'+k+'/0">'+v.name+'</a>').join('')+'</div>'+failureScenarioPicker(key,id)+'<section class="panel sequence-section check"><h2>'+escapeHtml(c.name)+'</h2><p>'+fixture+'</p><p><code>'+escapeHtml(c.method)+'</code></p><div class="steps" role="group" aria-label="Failure sequence phases">'+phases.map((name,i)=>'<button class="action" data-failure-phase="'+i+'" aria-pressed="'+(phase===i)+'">'+(i+1)+' · '+name+'</button>').join('')+'</div><div class="failure-status" role="status"><strong>'+phases[phase]+'</strong><p>'+(phase===0?'Nothing in this attempt has executed. Rows below show what was already saved.':phase===1?description:c.outcome)+'</p></div><p class="src">Red = failing call. Amber dashed = rollback. Orange dashed = Kafka. Later successful calls stop at this branch. The row panel shows the state after all arrows in the selected phase.</p>'+failureCanvas(flowSequences[key].lanes,failureExchanges(key,c,phase),phase)+'<div class="below"><section><h3>Request or Kafka data</h3>'+pre(JSON.stringify(c.input,null,2))+'<p class="src">Selected illustrative values, not a complete schema. No live request is sent.</p><h3>Exception / boundary</h3><p><code>'+escapeHtml(c.exception||c.boundary)+'</code></p></section><section><h3>Rows · '+phases[phase]+'</h3><div class="rows"><table><thead><tr><th>Row</th><th>State now</th></tr></thead><tbody>'+c.rows.map(row=>'<tr class="'+(phase===2 && row[1]!==row[3]?'sequence-row-change':'')+'"><th scope="row">'+escapeHtml(row[0])+'</th><td>'+escapeHtml(row[phase+1])+'</td></tr>').join('')+'</tbody></table></div><p class="src">Pending means uncommitted. Rollback restores this transaction’s prior database state; it cannot undo an earlier or remote commit. Allocated IDs may have gaps.</p></section></div><div class="choices"><a class="btn light" href="'+(phase?'#flow-failure/'+key+'/'+id+'/'+(phase-1):'#flow/'+key+'/'+c.stop)+'">'+(phase?'← Previous phase':'Compare successful checkpoint')+'</a>'+(phase<2?'<a class="btn" href="#flow-failure/'+key+'/'+id+'/'+(phase+1)+'">'+(phase===0?'Run to failure →':'Handle the failure →')+'</a>':'<a class="btn" href="#flow/'+key+'/'+c.stop+'">Compare successful checkpoint →</a>')+'</div></section><details class="panel check"><summary>Assumptions and source evidence</summary><p>'+(c.condition||'Source-based prediction for an uncaught runtime exception through normal transaction proxies and the default rollback policy.')+'</p>'+sources(c.refs)+'</details><p class="src">These are source-based boundary simulations. No live MOH request or database rollback was executed. Kafka retry/ack behaviour is outside this diagram; a processing failure alone does not prove a retry or successful delivery.</p>';
  attachFailurePicker(key);
  main.querySelectorAll('[data-failure-phase]').forEach(b=>b.onclick=()=>{location.hash='flow-failure/'+key+'/'+id+'/'+b.dataset.failurePhase;});
  const board=main.querySelector('.sequence-board'),selected=board.querySelector('.selected');
  if(selected) board.scrollTop=Math.max(0,selected.offsetTop-90);
}
