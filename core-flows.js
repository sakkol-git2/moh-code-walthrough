// These walkthroughs follow the pinned DR06 source. Example IDs are fictional.
const coreFlows = {
  save: {
    name:'Save draft',entry:'POST /api/v1/applications or PUT /api/v1/applications/700',
    summary:'Save editable request data. Draft completeness is different from submission eligibility.',
    result:'One application, one DR06 shared detail and individual product rows. A successful service transaction commits before response mapping.',
    steps:[
      {
        title:'Deserialize the DR06 request',
        method:'ApplicationController.createApplication / updateApplication',
        does:'JSON service_code GDHT-RG-L chooses ReagentRegistrationRequestDto. The reagent body holds the prerequisite profile ID and products. Each product carries its own application_type and attachments. The generic application operation remains separate from product origin.',
        rows:['Incoming DTO only at this point.','For a new product, omit id. For an existing product, send its saved numeric id.'],
        boundary:'Controller entry before the transactional service call.',
        failure:'Malformed JSON or request validation can stop before the service runs.',
        refs:['http','controllerUpdate','jsonSelector','subtype','dtoList','dto']
      },
      {
        title:'Load the application and choose its strategy',
        method:'ApplicationServiceImpl.saveApplication → ApplicationStrategyFactory.getStrategy',
        does:'New drafts use the requested service code and pass the availability gate. An update loads the existing application and uses its saved service code. The factory selects the DR06 strategy bean.',
        rows:['Read existing applications row 700 for PUT.','POST starts with no application row.'],
        boundary:'Application save transaction begins at the service proxy.',
        failure:'A missing application, unavailable new service or unsupported strategy stops this path.',
        refs:['dispatch','applicationOwnerLookup','strategyFactory','strategyBean']
      },
      {
        title:'Validate attachment placement before parent writes',
        method:'ReagentRegistrationApplicationStrategy.saveApplication',
        does:'Only establishment_decision may be shared. All other document keys belong to their product. The strategy also rejects null entries in the product list before delegating the parent save.',
        rows:['No DR06 parent/detail/product save has been reached in this strategy yet.'],
        boundary:'Inside the same Application save transaction.',
        failure:'CustomValidationException escapes and rolls back this transaction.',
        refs:['draftChecks','attachmentPlacement','rollbackValidation']
      },
      {
        title:'Initialize and save shared application data',
        method:'ApplicationRegisterHandler.saveApplication → ApplicationCoreHandler.saveApplication',
        does:'New applications get DRAFT status, service and user context. Existing applications must be editable. Shared registration handling maps company, licensee and applicant data. DR06 uses the first product name for the application display name. The core handler assigns an application number if needed, saves the parent and raises its CREATE notification on a new draft. The listener waits for commit.',
        rows:['applications · example id 700.','Shared parties and the application-level establishment decision are handled by common logic.'],
        boundary:'Parent save is pending inside the overall draft transaction.',
        failure:'An approved, rejected or noneditable application is rejected. Shared field/file resolution can also throw.',
        refs:['initializeDraft','sharedRegistration','coreSave','strategySave']
      },
      {
        title:'Save the DR06 shared detail',
        method:'ReagentRegistrationApplicationStrategy.saveDetail',
        does:'The strategy finds or creates the shared DR06 detail and sets prerequisite_profile_id from the DTO. This records the applicant’s selected prerequisite. Approval’s actual profile resolution is a later, separate code path.',
        rows:['application_reagent_details · application_id 700.','prerequisite_profile_id · example 42.'],
        boundary:'Same draft transaction as the parent row.',
        failure:'This setter does not imply omitted fields are merged with old values. A later failure can roll back this pending edit.',
        refs:['draftDetail','detail']
      },
      {
        title:'Validate product membership and file ownership',
        method:'ReagentRegistrationApplicationStrategy.syncProducts',
        does:'An omitted product list keeps saved products. A supplied list replaces membership. Existing numeric IDs must belong to this application and cannot repeat. For a public user, each referenced product file must belong to that user.',
        rows:['Read saved products 801 and 802 for application 700.','Validation runs before product deletion or the product save loop.'],
        boundary:'Same draft transaction; parent/detail writes may already be pending.',
        failure:'Unknown or duplicate product IDs and unowned files throw before product mutations.',
        refs:['syncRules','fileOwnership']
      },
      {
        title:'Delete omitted products, then map and save each product',
        method:'syncProducts → reagentMapper.updateProduct → attachmentResolutionService.resolve → productRepository.save',
        does:'Products left out of the supplied list are removed. Existing products keep their IDs. New products receive IDs. The loop sets position, copies editable fields, resolves uploaded file metadata and stores each product’s own attachment list.',
        rows:['application_reagent_products · A 801, B 802.','Each product stores its own LOCAL or IMPORT value and attachments JSONB.'],
        boundary:'All product operations join the draft transaction. save is earlier than commit.',
        failure:'A late resolver runtime exception rolls back earlier changes in this transaction, including product deletions. A partial product DTO can overwrite fields with nulls.',
        refs:['syncRemove','mapper','resolveMetadata','rows']
      },
      {
        title:'Complete save and understand the created-event boundary',
        method:'ApplicationCoreHandler.sendNotifications / ApplicationServiceImpl.saveApplication',
        does:'The inspected new-draft path contains a CREATE event publish in the shared core and another in the application service. UPDATE is a different branch. Both publish sites are visible in the pinned source; this guide does not promise exactly-once event delivery.',
        rows:['No new DR06 product table is created by publishing the Java domain event.','Post-commit listeners handle the corresponding event work separately.'],
        boundary:'Domain events are raised during save; transactional listeners run after successful commit.',
        failure:'Distinguish a committed draft from later event-delivery success. Inspect both publish sites when diagnosing duplicates.',
        refs:['coreSave','draftNotifications','saveEventTail','createdListener']
      },
      {
        title:'Commit, then build the draft response',
        method:'ApplicationController → applicationStrategyFactory.mapToResponseDto',
        does:'After successful service completion, the controller maps the saved application. DR06 reads the shared detail and product rows ordered by position and ID. The response gives the IDs the client must send back on updates.',
        rows:['Saved applications, application_reagent_details and application_reagent_products.','No product registration or licence is issued by this draft save.'],
        boundary:'The service transaction has completed before controller response mapping.',
        failure:'A response-mapping failure can occur after commit and leave the draft saved.',
        refs:['response','http','controllerUpdate']
      }
    ]
  },
  submit: {
    name:'Submit',entry:'POST /api/v1/applications/700/submit',
    summary:'Validate saved data and advance the application through the submission gates.',
    result:'For this paid-service example, an unsettled application can return AWAITING_PAYMENT. With payment settled and relations open, it becomes SUBMITTED.',
    steps:[
      {
        title:'Submit the saved application ID',
        method:'ApplicationController.submitApplication → ApplicationServiceImpl.submitApplication',
        does:'The submit endpoint takes the application ID. It is not the product-edit endpoint. The service loads the application for the caller and uses its saved service code.',
        rows:['Read applications · 700.','The products are read from the saved draft.'],
        boundary:'A new Application transaction handles submission.',
        failure:'If the prior draft edit failed or was never saved, submit sees the earlier persisted values.',
        refs:['submit','submitEntry','applicationOwnerLookup']
      },
      {
        title:'Check availability, tracking and saved-field validation',
        method:'ApplicationServiceImpl.submitApplication → strategy.validateSubmitApplication',
        does:'A first DRAFT submission passes the availability check. The service assigns or preserves tracking information, selects the strategy and invokes submit validation. The core validator checks lifecycle restrictions and common SubmitValidation fields.',
        rows:['applications · tracking data may be pending.','No registration is created here.'],
        boundary:'All these changes are within the submission transaction.',
        failure:'An escaping runtime validation error rolls back pending submission changes.',
        refs:['submitEntry','coreSubmitValidation']
      },
      {
        title:'Validate the prerequisite and every saved product',
        method:'ReagentRegistrationApplicationStrategy.buildValidationProcessor',
        does:'DR06 loads its shared detail and checks the selected prerequisite profile for an active permitted licence and caller ownership. It then loads products, requires at least one and validates each product DTO and its own documents independently.',
        rows:['Read application_reagent_details for application 700.','Read products 801 and 802, including B’s origin and files.'],
        boundary:'Validation reads the saved draft; product origins are never taken from a shared batch field.',
        failure:'B’s missing field or file produces a product-specific error. A’s documents cannot satisfy B’s checklist.',
        refs:['dr06SubmitChecks','prerequisiteCheck','missing']
      },
      {
        title:'Finish the common checklist and submission gates',
        method:'ApplicationCoreHandler.validateSubmitApplication → operationGate / applicationRelationService',
        does:'DR06 checks products individually before merging their file references into the temporary common checklist. The common validator collects remaining field/document errors. The service then runs operation eligibility and submission relation linking.',
        rows:['Validation’s combined attachment DTO is a temporary checklist.','It does not move B’s persisted files onto the shared application row.'],
        boundary:'Still inside submission; failure prevents this attempt from advancing.',
        failure:'A common validation or gate error aborts this submission. Relation waiting is handled later by finalizeSubmission.',
        refs:['dr06SubmitChecks','coreSubmitValidation','submitGates']
      },
      {
        title:'Choose the payment branch',
        method:'ApplicationServiceImpl.submitApplication',
        does:'If payment is already settled, the service calls finalizeSubmission. Otherwise it checks awaiting-payment state, forcePaymentFirst or the configured Review payment step. On the payment-required branch it counts saved products, sets AWAITING_PAYMENT, PENDING and context SUBMISSION, then saves and flushes.',
        rows:['applications · 700 → AWAITING_PAYMENT / PENDING.','Invoice quantity is the saved product count: two in this fixture.'],
        boundary:'saveAndFlush can issue SQL before the Application transaction commits.',
        failure:'An empty product count is rejected. Invoice issuance failure can abort this Application attempt; the remote invoice operation has its own boundary.',
        refs:['payment','quantity','submitGates']
      },
      {
        title:'Return the invoice while the application waits',
        method:'InvoiceServiceImpl.issueInvoice → SubmitApplicationResponseDto.of',
        does:'Application requests the invoice with Kafka request/reply and waits for the response. For the non-waived unpaid branch, it returns metadata.status AWAITING_PAYMENT, next_action PAY and the invoice. Submission readiness has been checked, but review processing has not been completed.',
        rows:['applications · 700 remains waiting for payment.','Product rows 801 and 802 remain the saved draft data.'],
        boundary:'The browser’s Submit call can finish before the later payment confirmation arrives.',
        failure:'This fixture assumes a successful non-waived invoice. Free or waived invoices take a different branch in the source.',
        refs:['invoiceCall','payment','submitReply']
      },
      {
        title:'Resume submission after payment confirmation',
        method:'PaymentEventConsumer.handlePaymentCompleted → ApplicationServiceImpl.handleApplicationPaid',
        does:'Application consumes the completion message, looks up the application ID, records the paid state and time, and resolves its payment context. Context SUBMISSION leads to finalizeSubmission. This is a later transaction than the original submit HTTP call.',
        rows:['applications · 700 gets payment fields updated.','Product B remains id 802.'],
        boundary:'Application payment-handler transaction. Its caught-exception behaviour is covered in the separate-transaction lab.',
        failure:'A logged finalization error needs its own transaction trace. It does not automatically prove every changed field rolled back.',
        refs:['paidRead','matchPaid','settle','paymentCatch']
      },
      {
        title:'Finalize through the relation gate',
        method:'ApplicationServiceImpl.finalizeSubmission',
        does:'The method sets submitted dates, then evaluates dependencies. WAITING sets WAITING_RELATION and emits a status event. RELATED_REJECTED follows the return path. With the gate open it stores SUBMITTED, or RE_SUBMITTED for a returned application, and sends submission notifications/events.',
        rows:['applications · 700 → SUBMITTED for the open-gate fixture.','WAITING_RELATION is a separate valid outcome.'],
        boundary:'The state transition belongs to the current submission/finalization transaction.',
        failure:'A returned result wrapper alone does not prove application.status is SUBMITTED. Read the application state and the relation branch.',
        refs:['finalizeAll','draftNotifications']
      },
      {
        title:'Publish the saved submission state after commit',
        method:'ApplicationEventListener.handleApplicationSubmittedEvent → ApplicationEventProducer.produceApplicationSubmittedEvent',
        does:'The transactional listener sends ApplicationSubmittedMessage keyed by application number. A submitted application can now enter the review workflow. This core lesson stops at Application’s outgoing handoff.',
        rows:['Application’s submitted state is already committed.','Profile registrations and licences are still created only on the later approval path.'],
        boundary:'Post-commit message handoff, separate from Profile approval processing.',
        failure:'Message delivery and the database commit are different outcomes. The listener logs thrown producer errors.',
        refs:['submittedListener','submittedProducer']
      }
    ]
  },
  approve: {
    name:'Approve application',entry:'Incoming review decision → Application → ApplicationApprovedMessage → Profile',
    summary:'Record the application-level decision, then build one registration and licence per approved product.',
    result:'Application APPROVED and Profile product registration are separate transaction outcomes. The selected-profile rule and the branch resolver gap must be checked independently.',
    steps:[
      {
        title:'Receive the decision and check the application',
        method:'ReviewEventConsumer.handleApplicationReviewCreated → ApplicationServiceImpl.handleApplicationReviewCreated',
        does:'The incoming decision identifies application 700. Application loads it and returns if it is missing or already final. It updates reviewer/department/step context before branching on the decision status.',
        rows:['Read applications · 700.','B is still product 802 within the application.'],
        boundary:'Application review-update transaction.',
        failure:'An already-final application is ignored on this path. This guard is separate from Profile’s replay guard.',
        refs:['reviewRead','approvalEntry']
      },
      {
        title:'Save APPROVED and approval metadata',
        method:'ApplicationServiceImpl.handleApplicationReviewCreated · APPROVED branch',
        does:'Application sets APPROVED, the approving user and approval time, saves the row and raises status, approval and pushback domain events. Dependent applications are processed after the event calls in this branch.',
        rows:['applications · 700 → APPROVED, approvedBy, approvedDate.','This does not itself insert Profile product registrations.'],
        boundary:'Approval row and domain-event publication occur inside this Application transaction.',
        failure:'If this transaction rolls back, its after-commit approval listener does not perform the normal successful-commit send.',
        refs:['approvalTx','approve']
      },
      {
        title:'Build the approved form data from saved rows',
        method:'ApplicationEventListener.handleApplicationApprovedEvent → ReagentRegistrationApplicationStrategy.buildApprovedFormData',
        does:'After commit, the producer asks the strategy for form data. DR06 includes contract_version 3, prerequisite_profile_id and the ordered products. Each product carries its numeric ID, position, origin, details and own attachments. Shared establishment evidence stays separately at root.',
        rows:['Read Application parent, shared detail and product rows.','B’s source identity remains 802.'],
        boundary:'Post-commit serialization and outgoing message preparation.',
        failure:'A malformed or incomplete approval contract can be rejected later by Profile. Inspect the saved data and emitted payload together.',
        refs:['approvalListener','approvedForm','payload','files']
      },
      {
        title:'Send one approval message for the batch',
        method:'ApplicationEventProducer.produceApplicationApprovedEvent',
        does:'The producer maps ApplicationApprovedMessage and sends it with the application number as the Kafka key. One application decision carries both A and B. Profile can receive this message after Application is already APPROVED.',
        rows:['No Profile rows are written by the Application producer.','Message data associates application 700 with products 801 and 802.'],
        boundary:'Cross-service message handoff.',
        failure:'A failed Profile delivery cannot roll back the already-committed Application approval.',
        refs:['messageKey','publish']
      },
      {
        title:'Choose the Profile strategy and validate the contract',
        method:'ProfileKafkaConsumer.handleApplicationApproved → ReagentLicenseRegistrationStrategy.processApprovedMessage → ReagentMapper.toRegisterRequestDto',
        does:'Profile chooses the strategy by service code. The mapper requires the supported contract version, valid application identity, a nonempty product list, unique positive product IDs, unique nonnegative positions and an origin on every product. It also checks attachment scope.',
        rows:['No DR06 registration-handler write has happened before mapping succeeds.'],
        boundary:'Contract parsing precedes BaseRegisterHandler.handle.',
        failure:'Missing B origin, repeated IDs or invalid document placement throws before registration processing.',
        refs:['consumer','registrationEntry','profileContract','approvalFileScope']
      },
      {
        title:'Check replay before starting the registration handler',
        method:'ReagentRegisterHandler.handle',
        does:'If this source application already has DR06 details, the handler exits. The product-detail schema also has a unique source application/product pair. The generic consumer inbox wrapper currently invokes the processor directly; the DR06 guard is a distinct check.',
        rows:['Read reagent_product_license_details by source_application_id 700.','A completed approval should not produce another set of DR06 results on replay.'],
        boundary:'The module guard runs before entering the generic transactional handler.',
        failure:'This example assumes a previously completed approval. Concurrent failures and retries require the database constraint and transaction boundary too.',
        refs:['replay','profileKeys','inboxBypass']
      },
      {
        title:'Resolve the profile and identify the rule gap',
        method:'BaseRegisterHandler.handle → RegisterHandlerHooks.resolveProfile → getOrCreateNewProfile',
        does:'The mandatory rule requires the selected existing profile. This branch inherits a generic company/licensee resolver, which can reuse another profile or create one. It does not select by prerequisite_profile_id. Use P for the actual resolved profile in the following steps.',
        rows:['Resolve Profile P; selected prerequisite ID 42 is stored separately.','A newly created P is saved inside the handler transaction.'],
        boundary:'Profile registration transaction begins at BaseRegisterHandler.handle.',
        failure:'The earlier profile-42 fixture is intended behaviour, not proof that the resolver enforces it.',
        refs:['profileTx','profileHook','genericResolver']
      },
      {
        title:'Build and save each product’s registration and licence',
        method:'ReagentRegisterHandler.processLicenses → licenseBuilder.buildNew → regulatoryRegistrationService.save',
        does:'The handler sorts products by position and loops through each. For each product it constructs the registration and licence on P, using that product’s own origin for numbering. The registration save cascades to its licence.',
        rows:['A → example registration 901, licence 501.','B → example registration 902, licence 502.','Both use resolved profile P. IDs are illustrative.'],
        boundary:'All products in this handler share the Profile transaction.',
        failure:'A runtime failure while processing B can roll back A’s pending new registration and licence too.',
        refs:['license','newLicence','licenseJoin','origin']
      },
      {
        title:'Save each approved product detail and synchronize mirrors',
        method:'ReagentMapper.toDetail → detailRepository.save → RegulatoryRegistrationServiceImpl.syncAll',
        does:'Each detail stores its registration, actual profile, source application/product IDs, selected prerequisite ID, origin and copied documents. The generic handler flushes the profile and synchronizes registration mirror fields from the licences, including number, effective dates, status and user.',
        rows:['reagent_product_license_details · registration 902, source pair (700, 802).','regulatory_registrations mirrors its licence fields.'],
        boundary:'These writes still belong to the Profile handler transaction.',
        failure:'A called save or flush is not the final commit. An escaping runtime failure can undo the pending batch.',
        refs:['snapshot','profileTxEnd','syncMirrors','entityIdentity']
      },
      {
        title:'Commit Profile results and handle post-commit work',
        method:'ReagentRegisterHandler.publishEvents → ProfileKafkaProducer.produceProfileLicenseOperationEvent',
        does:'The handler requests issuance for the changed licences and sets their certificate status PENDING. Transactional listeners publish after commit. After strategy completion, the consumer also attempts document-history recording and catches errors in that history step.',
        rows:['Committed Profile registration, licence and detail rows for A and B.','A failed post-commit handoff does not undo those committed rows.'],
        boundary:'Profile commit is the boundary between product registration and later work.',
        failure:'The post-commit listener and non-fatal document recorder have separate failure paths. Their success is not implied by Application APPROVED.',
        refs:['cert','pending','operationListener','recordApprovedDocs']
      },
      {
        title:'Read B through its Profile registration',
        method:'ReagentProductController.getProduct → ReagentProductServiceImpl.getProduct → ReagentMapper.toProductResponseDto',
        does:'The product endpoint expects registration 902. The repository fetches the detail with its registration, licence and actual profile, applies the owner check and maps a response. That response can expose B’s source ID 802, actual profile ID and prerequisite profile ID separately.',
        rows:['Read B’s approved snapshot and licence information.','Application product ID, registration ID and licence ID remain different keys.'],
        boundary:'Profile read transaction; this is a separate request after approval processing.',
        failure:'Searching with product ID 802 where registrationId is expected can target the wrong key. A public owner mismatch returns not found.',
        refs:['productEndpoint','profileRead','productJoin','profileResponse','profileOwner']
      }
    ]
  }
};

function coreFlowsHome(){
  main.innerHTML='<div class="tag">Application + Profile / Three core flows</div><h1>Save, submit, approve</h1><p class="lead">Learn these three operations as one lifecycle. Save writes an editable draft. Submit validates saved data and advances the request. Approval records a decision, then Profile creates the product results in another transaction.</p><div class="rows"><table><thead><tr><th>Flow</th><th>Starts from</th><th>Main result</th></tr></thead><tbody><tr><td>Save draft</td><td>Request DTO</td><td>Application and product rows saved</td></tr><tr><td>Submit</td><td>Saved application ID</td><td>Payment wait, relation wait or submitted state</td></tr><tr><td>Approve</td><td>Incoming decision</td><td>Application APPROVED; Profile processes a later approval message</td></tr></tbody></table></div><ol class="learning-path">'+Object.entries(coreFlows).map(([key,f])=>'<li class="panel"><div><h2><a href="#flow/'+key+'/0">'+f.name+'</a></h2><p>'+f.summary+'</p><p><code>'+f.entry+'</code></p></div></li>').join('')+'</ol><section class="panel"><h2>Use the same example throughout</h2><p>Application 700 contains A (801, LOCAL) and B (802, IMPORT). Selected prerequisite profile 42 is an input. Approval’s actual resolved profile is labelled P because this branch has the documented profile-selection gap. All IDs and records in these walkthroughs are fictional.</p></section>';
}
function coreFlow(key,index){
  const flow=coreFlows[key], step=flow.steps[index];
  const owner=key==="approve" && index>=4 ? "MOH-Profile" : "MOH-Application";
  main.innerHTML='<div class="tag">Three core flows / '+flow.name+'</div><h1>'+flow.name+'</h1><p class="lead">'+flow.summary+'</p><nav class="steps" aria-label="Core flows">'+Object.entries(coreFlows).map(([k,f])=>'<a href="#flow/'+k+'/0" '+(key===k?'aria-current="page"':'')+'>'+f.name+'</a>').join('')+'</nav><label class="field">Follow a call <select id="flowStep">'+flow.steps.map((s,i)=>'<option value="'+i+'" '+(i===index?'selected':'')+'>'+(i+1)+' · '+s.title+'</option>').join('')+'</select></label><div class="workbench-lanes" aria-label="Active service">'+['MOH-Application','MOH-Profile'].map(name=>'<span class="'+(owner===name?'active':'')+'">'+name+'</span>').join('')+'</div>'+flowSequence(key,index)+'<div class="lessonbody"><article class="panel"><div class="tag">Step '+(index+1)+' of '+flow.steps.length+'</div><h2>'+step.title+'</h2><code>'+step.method+'</code><p>'+step.does+'</p><div class="transaction-box"><h3>Transaction boundary</h3><p>'+step.boundary+'</p></div><details class="proof"><summary>What can fail here?</summary><p>'+step.failure+'</p></details></article><aside class="side"><h2>Rows and IDs at this step</h2><ul>'+step.rows.map(row=>'<li>'+row+'</li>').join('')+'</ul><details class="proof"><summary>Inspect the implementation</summary>'+sources(step.refs)+'</details></aside></div>'+coreFlowPayload(key)+coreFlowOutcomes(key)+'<details class="panel check"><summary>What should I be able to explain after this flow?</summary><p>'+flow.result+'</p></details><div class="actions"><a class="btn light" href="'+(index?'#flow/'+key+'/'+(index-1):'#core-flows')+'">← '+(index?'Previous':'Three flows')+'</a><a class="btn" href="'+(index===flow.steps.length-1?'#core-flows':'#flow/'+key+'/'+(index+1))+'">'+(index===flow.steps.length-1?'Compare all three flows':'Next call →')+'</a></div>';
  const journeyIndex=productBStops.findIndex(stop=>stop[1]===key && stop[2]===index);
  if(journeyIndex>=0) main.insertAdjacentHTML('afterbegin','<p><a href="#b-lesson/journey/'+journeyIndex+'">← Return to Product B at this checkpoint</a></p>');
  attachFlowSequence(key,index);
  main.querySelector('#flowStep').onchange=event=>{location.hash='flow/'+key+'/'+event.target.value;};
}

function coreFlowPayload(key){
  const product=(id,name,origin,position)=>({
    id,position,product_name:'Product '+name,application_type:origin,
    attachments:[{id:'sample-form-'+name,key:'application_form'}]
  });
  const products=[product(801,'A','LOCAL',0),product(802,'B','IMPORT',1)];
  let title, body, note;
  if(key==='save'){
    title='Selected draft-update fields';
    const editable=products.map(({position,...p})=>p);
    body={service_code:'GDHT-RG-L',attachments:[{id:'sample-establishment',key:'establishment_decision'}],reagent:{prerequisite_profile_id:42,products:editable}};
    note='PUT sends existing numeric IDs. On create, omit each new product ID. This excerpt leaves out the remaining required or editable fields and uses fictional file IDs.';
  }else if(key==='submit'){
    title='Submit call and selected waiting response';
    body={request:'POST /api/v1/applications/700/submit',response:{data:{status:'AWAITING_PAYMENT'},metadata:{status:'AWAITING_PAYMENT',next_action:'PAY',invoice:'invoice response omitted'}}};
    note='This route identifies the saved application in the URL. It does not receive the product list in its controller method. The waiting response is the non-waived, payment-required branch.';
  }else{
    title='Decoded approval form data · selected fields';
    body={attachments:[{id:'sample-establishment',key:'establishment_decision'}],reagent:{contract_version:3,prerequisite_profile_id:42,products}};
    note='ApplicationApprovedMessage carries application ID 700 and service GDHT-RG-L. Its form data is serialized JSON. This panel shows selected decoded fields. Profile reads the product IDs and origins from that data.';
  }
  return '<details class="panel check"><summary>'+title+'</summary>'+pre(JSON.stringify(body,null,2))+'<p>'+note+'</p></details>';
}

function coreFlowOutcomes(key){
  if(key==='submit'){
    return '<details class="panel check"><summary>Compare submit outcomes and response fields</summary><p>The result wrapper and persisted application status answer different questions. These branches assume the earlier validation/gates pass.</p><div class="rows"><table><thead><tr><th>Condition</th><th>Application status</th><th>metadata.status</th><th>next_action</th></tr></thead><tbody><tr><td>Payment required, not settled, invoice not waived</td><td>AWAITING_PAYMENT</td><td>AWAITING_PAYMENT</td><td>PAY</td></tr><tr><td>Settled payment, relations OPEN</td><td>SUBMITTED</td><td>SUBMITTED</td><td>SUBMIT</td></tr><tr><td>Returned application, settled payment, relations OPEN</td><td>RE_SUBMITTED</td><td>SUBMITTED</td><td>SUBMIT</td></tr><tr><td>Settled payment, relation WAITING</td><td>WAITING_RELATION</td><td>SUBMITTED</td><td>SUBMIT</td></tr><tr><td>Settled payment, relation RELATED_REJECTED</td><td>RETURNED</td><td>SUBMITTED</td><td>SUBMIT</td></tr></tbody></table></div><p>The open relation branch emits the submission event. The waiting branch emits a status update and holds the application. Read data.status alongside metadata before explaining what the request actually reached.</p>'+sources(['submitResultType','submitReply','finalizeAll','relationRejected'])+'</details>';
  }
  if(key==='save'){
    return '<details class="panel check"><summary>Compare successful save with a failed response</summary><div class="rows"><table><thead><tr><th>Situation</th><th>Stored outcome</th></tr></thead><tbody><tr><td>Successful new application save</td><td>DRAFT parent and its product rows commit</td></tr><tr><td>Successful editable draft update</td><td>Existing application is updated; the core initializer preserves its existing editable status</td></tr><tr><td>Uncaught runtime failure before commit</td><td>Pending changes in this save transaction roll back</td></tr><tr><td>Response mapping throws after successful service commit</td><td>Saved rows remain even if the request fails afterward</td></tr></tbody></table></div>'+sources(['initializeDraft','appSaveTx','http'])+'</details>';
  }
  return '<details class="panel check"><summary>Compare Application approval with Profile completion</summary><div class="rows"><table><thead><tr><th>Point reached</th><th>Application</th><th>Profile result for this attempt</th></tr></thead><tbody><tr><td>Approval committed; message not yet processed</td><td>APPROVED</td><td>Registration processing still pending</td></tr><tr><td>Profile rejects the contract</td><td>APPROVED stays committed</td><td>Handler has not created the product rows</td></tr><tr><td>Profile handler rolls back on runtime failure</td><td>APPROVED stays committed</td><td>New rows in that Profile transaction roll back</td></tr><tr><td>Profile commit succeeds</td><td>APPROVED</td><td>One detail, registration and licence per product under resolved profile P</td></tr><tr><td>Post-commit listener then fails</td><td>APPROVED</td><td>Previously committed registration rows remain</td></tr></tbody></table></div>'+sources(['approve','profileTx','profileTxEnd','operationListener'])+'</details>';
}
