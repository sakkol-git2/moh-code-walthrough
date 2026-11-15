// Learning fixtures reuse the pinned core-flow models and their source references.
const productBStops = [
  ['Save the draft','save',6,'B becomes product row 802. Its application_id points to parent 700. IMPORT and B’s attachments belong to this row.','Application save transaction · pending until commit'],
  ['Commit the draft','save',8,'Parent, DR06 detail and both product rows are committed. The controller then builds its response.','Application save transaction committed'],
  ['Validate saved B','submit',2,'Submit identifies application 700. DR06 loads B 802 and checks its own required fields and files.','New Application submission transaction'],
  ['Pause for payment','submit',5,'The browser receives AWAITING_PAYMENT after the waiting state commits. B 802 remains saved.','First submission transaction committed'],
  ['Receive payment','submit',6,'A later payment message identifies application 700. Application changes payment fields in a later transaction.','Application payment-handler transaction'],
  ['Finish submission','submit',8,'With payment settled and relations OPEN, Application commits SUBMITTED and emits its submission event.','Payment continuation commits'],
  ['Commit approval','approve',3,'Application commits APPROVED, builds approved form data and sends the batch message containing B’s ID 802.','Application approval committed'],
  ['Create Profile results','approve',8,'Profile validates the whole batch, resolves a profile and saves B’s registration, licence and snapshot.','Profile registration transaction · pending'],
  ['Commit and read B','approve',10,'B is read by registration ID 902. Its snapshot retains source application 700 and source product 802.','Profile results committed']
];
const productBSections = {journey:'Follow Product B',compare:'Compare rollback',payment:'Pause for payment',message:'Inspect approval data',practice:'Debug the three flows'};
function bLink(section,index=0){ return '#b-lesson/'+section+'/'+index; }
function bTable(headers,rows){
  return '<div class="rows"><table><thead><tr>'+headers.map(x=>'<th>'+escapeHtml(x)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map((x,i)=>'<'+(i?'td':'th scope="row"')+'>'+escapeHtml(x)+'</'+(i?'td':'th')+'>').join('')+'</tr>').join('')+'</tbody></table></div>';
}
function bNavigation(section){
  return '<nav class="steps" aria-label="Product B lessons">'+Object.entries(productBSections).map(([key,title])=>'<a href="'+bLink(key)+'" '+(section===key?'aria-current="page"':'')+'>'+title+'</a>').join('')+'</nav>';
}
function bRelations(key,index){
  const records=flowSequences[key].records;
  return '<div class="b-relations" aria-label="Product B row relationships">'+records.map(record=>{
    const update=record.updates.filter(([step])=>step<=index).at(-1);
    return '<div class="b-record '+(record.label.includes('B')?'focus':'')+'"><strong>'+escapeHtml(record.label)+'</strong><p>'+escapeHtml(update?update[1]:record.initial||'Not created yet')+'</p></div>';
  }).join('')+'</div><p>Application FK · product.application_id → applications.id. Profile FKs · snapshot.registration_id → regulatory_registrations.registration_id → license_id → licenses.id. Registration, licence and snapshot reference their local profile. Source pair (700, 802) travels through Kafka between the databases.</p>';
}
function bJourney(index){
  const [title,key,checkpoint,description,boundary]=productBStops[index];
  const step=coreFlows[key].steps[checkpoint],data=sequenceData(key,checkpoint);
  return '<h2>'+title+'</h2><p>'+description+'</p><div class="transaction-box">'+boundary+'</div><label class="field">Journey checkpoint <select id="bStop">'+productBStops.map((stop,i)=>'<option value="'+i+'" '+(i===index?'selected':'')+'>'+stop[0]+'</option>').join('')+'</select></label><p><code>'+escapeHtml(step.method)+'</code></p><div class="choices"><button class="action" data-b-panel="source">Java source</button><button class="action" data-b-panel="data">Request / Kafka data</button><button class="action" data-b-panel="rows">ER rows</button></div><section id="b-source" class="panel check" hidden><h3>Java at this checkpoint</h3>'+sources(step.refs)+'</section><section id="b-data" class="panel check" hidden><h3>'+data.view+'</h3>'+pre(JSON.stringify(data.data,null,2))+'</section><section id="b-rows" class="panel check" hidden><h3>Connected rows</h3>'+bRelations(key,checkpoint)+'</section><p><a href="#flow/'+key+'/'+checkpoint+'">Open the full sequence at this checkpoint →</a></p><p class="src">Approval uses the illustrative actual profile 99 and selected prerequisite 42. Other required values are assumed valid. The payment path assumes non-waived payment and OPEN relations.</p>';
}
function bComparison(index){
  const phases=['Before editing','At B’s resolver','After transaction completes'];
  const c=rollbackCases.resolution;
  const good=[
    ['applications · 700','Original draft','Parent edits pending','Edited draft committed'],
    ['application_reagent_details · 700','prerequisite 42','prerequisite 99 pending','prerequisite 99 committed'],
    ['Product A · 801','Original A','Edited A pending','Edited A committed'],
    ['Product B · 802','Original B','B mapped; resolving own files','Edited B and resolved files committed'],
    ['Product C · 803','Original C','Deletion pending','C removed by committed deletion']
  ];
  const calls=index===0?['Existing draft with A, B and C']:['PUT application 700','Save parent and detail · pending','Validate product IDs and file ownership','Delete omitted C · pending','Save edited A · pending','Resolve B’s attachment'];
  return '<h2>One edit, two outcomes</h2><p>Both paths begin with draft 700 containing A 801, B 802 and C 803. The edit keeps A and B, changes the prerequisite from 42 to 99, and omits C.</p>'+bPhaseLinks('compare',phases,index)+'<ol>'+calls.map(x=>'<li>'+x+'</li>').join('')+'</ol><div class="below"><section class="panel"><h3>Resolution succeeds</h3><p>'+(index===0?'No edit executed.':index===1?'B’s file resolves. Its save can proceed.':'B saves and the shared Application transaction commits.')+'</p>'+bTable(['Row',phases[index]],good.map(row=>[row[0],row[index+1]]))+'</section><section class="panel"><h3>Resolution fails</h3><p>'+(index===0?'Same starting draft.':index===1?'First divergence · resolveMetadata throws NotFoundException for B.':'The escaping runtime exception rolls back the entire save transaction.')+'</p>'+bTable(['Row',phases[index]],c.rows.map(row=>[row[0],row[index+1]]))+'</section></div><p>'+c.condition+'</p><details class="panel check"><summary>Inspect resolver and transaction code</summary>'+sources(c.refs)+'</details>';
}
function bPhaseLinks(section,names,index){
  return '<nav class="steps" aria-label="Lesson checkpoints">'+names.map((name,i)=>'<a href="'+bLink(section,i)+'" '+(i===index?'aria-current="step"':'')+'>'+name+'</a>').join('')+'</nav>';
}
function bPayment(index){
  const answers=[
    ['Only the original DRAFT is saved','The successful waiting branch commits AWAITING_PAYMENT before the response.'],
    ['AWAITING_PAYMENT and B’s existing row are saved','Correct. The first transaction committed. The later payment message resumes Application processing.'],
    ['SUBMITTED is already saved','This fixture pauses before payment confirmation. It still waits for payment.']
  ];
  return '<h2>Stop at AWAITING_PAYMENT</h2><p>The invoice reply succeeded. The browser has received the waiting response. Predict the saved state before continuing.</p>'+pre(JSON.stringify(sequenceData('submit',5).data.http_response,null,2))+'<fieldset><legend>What is committed at this pause?</legend>'+answers.map(([label,feedback],i)=>'<p><label><input type="radio" name="b-payment" value="'+i+'"> '+label+'</label></p>').join('')+'</fieldset><p id="bFeedback" role="status"></p><div id="bPaymentReveal" hidden><h3>The first commit</h3>'+bTable(['Row','Saved at the pause'],[['applications 700','AWAITING_PAYMENT / payment PENDING'],['Product B 802','IMPORT and own files remain saved'],['DR06 detail 700','Prerequisite 42 remains saved']])+'<p>PaymentCompletedMessage later identifies application 700. PaymentEventConsumer.handlePaymentCompleted calls ApplicationServiceImpl.handleApplicationPaid. The continuation updates payment fields, then finalizes submission through the relation gate.</p>'+pre(JSON.stringify(sequenceData('submit',6).data,null,2))+'<p><a href="'+bLink('journey',4)+'">Follow the next transaction →</a></p><details><summary>What if the invoice reply timed out?</summary><p>The pending waiting state rolls back in Application. Payment may have committed an invoice before its reply was lost or delayed. Remote invoice state requires inspection.</p><a href="#flow-failure/submit/invoice/2">Inspect the timeout diagram →</a></details>'+sources(['payment','invoiceCall','invoiceTimeout','paymentEntry'])+'</div>';
}
const bMessageFields=[
  ['source_product_id',802,'application_reagent_products.id','reagent.products[1].id','reagent_product_license_details.source_product_id','Stable source identity across the Kafka handoff.'],
  ['application_type','IMPORT','application_reagent_products.application_type','reagent.products[1].application_type','Product B registration/licence build and snapshot','Only B’s own type determines its result. A remains LOCAL.'],
  ['attachments','B’s own files','application_reagent_products.attachments','reagent.products[1].attachments','reagent_product_license_details.attachments','establishment_decision travels separately as shared attachments.'],
  ['registration_id',902,'Created in Profile','Generated during registration processing','regulatory_registrations.registration_id and snapshot.registration_id','Use 902 when reading B through the product endpoint.'],
  ['profile_id',99,'Generic Profile identity resolver','Prerequisite 42 is a separate field','Profile registration, licence and snapshot profile_id','This possible resolver outcome exposes the selected-profile rule gap. The required business behaviour uses the selected existing profile.']
];
function bMessage(index){
  const f=bMessageFields[index];
  return '<p><a href="#approval-retry/rollback/0">Explore retry and duplicate approval cases →</a></p><h2>Follow an approval field into Profile</h2><p>Application 700 is already APPROVED. Profile decodes version 3 form data for A 801 and B 802. All IDs shown are fictional.</p><label class="field">Select B’s field <select id="bMessageField">'+bMessageFields.map((x,i)=>'<option value="'+i+'" '+(index===i?'selected':'')+'>'+x[0]+'</option>').join('')+'</select></label><div class="transaction-box"><strong>'+f[0]+' = '+f[1]+'</strong><p>'+f[5]+'</p></div>'+bTable(['Trace','Location'],[['Application / origin',f[2]],['Kafka / processing',f[3]],['Profile row',f[4]]])+'<div class="below"><section class="panel"><h3>Selected decoded approval data</h3>'+pre(JSON.stringify(sequenceData('approve',4).data,null,2))+'</section><section class="panel"><h3>B after Profile commit</h3>'+bTable(['Row','Association'],[['regulatory_registrations','902 → licence 502 → profile 99'],['licenses','502 → profile 99 · B IMPORT'],['reagent_product_license_details','registration 902 · source pair (700,802) · prerequisite 42']])+'<p><a href="'+bLink('journey',8)+'">Return to B’s committed result →</a></p></section></div><details class="panel check"><summary>Inspect mapping, saves and profile resolution</summary>'+sources(['profileContract','license','snapshot','genericResolver','profileHook','productEndpoint'])+'</details>';
}
const bDebugCases=[
  {title:'C still exists after a failed draft edit',question:'The request omitted C, edited A, then B’s file resolution failed. Where would you inspect first?',choices:['syncProducts and the Application save transaction','Profile product read endpoint','Certificate download'],correct:0,answer:'syncProducts deletes C and saves A inside the same Application save transaction. B’s escaping NotFoundException causes rollback. C and A retain their original saved values.',refs:['syncRemove','resolveMetadata','appSaveTx'],route:'#flow-failure/save/resolution/2'},
  {title:'Submit rejects B although A has a form',question:'Which saved data and validation method would you inspect?',choices:['Only the merged application checklist','B’s own attachments and validateProductAttachments','The licence number generator'],correct:1,answer:'Read B 802 and its own attachments. DR06 validates each saved product independently, accumulates the field error and the common validator throws. A’s form satisfies A only.',refs:['dr06SubmitChecks','coreSubmitValidation'],route:'#flow-failure/submit/documents/2'},
  {title:'APPROVED application has no Profile result',question:'B’s origin is missing from the received approval data. Where would you inspect first?',choices:['Application DRAFT initializer','Payment invoice response mapper','Profile approval mapper before the registration handler'],correct:2,answer:'ReagentMapper.toRegisterRequestDto rejects the contract before BaseRegisterHandler.handle starts. Application APPROVED was committed earlier. This delivery creates no A/B Profile registration rows.',refs:['registrationEntry','profileContract','approvalListener'],route:'#flow-failure/approve/contract/2'}
];
function bPractice(index){
  const c=bDebugCases[index];
  return '<h2>'+c.title+'</h2>'+bPhaseLinks('practice',bDebugCases.map(x=>x.title),index)+'<p>'+c.question+'</p><fieldset><legend>Choose the first inspection</legend>'+c.choices.map((choice,i)=>'<p><label><input type="radio" name="b-debug" value="'+i+'"> '+choice+'</label></p>').join('')+'</fieldset><p id="bFeedback" role="status"></p><button class="action check" id="bShowAnswer">Reveal explanation and Java</button><section id="bAnswer" class="panel check" hidden><p>'+c.answer+'</p>'+sources(c.refs)+'<p><a href="'+c.route+'">Open the failure sequence →</a></p></section>';
}
function productBLesson(section,index){
  const renderers={journey:bJourney,compare:bComparison,payment:bPayment,message:bMessage,practice:bPractice};
  main.innerHTML='<div class="tag">Application + Profile / Product B</div><h1>Trace the code and saved rows</h1>'+bNavigation(section)+'<p class="src">DR06 · Type of certificate = Product Number. These source-based learning fixtures use pinned Application and Profile revisions.</p>'+renderers[section](index);
  if(section==='journey'){
    main.querySelector('#bStop').onchange=e=>{location.hash=bLink('journey',e.target.value);};
    main.querySelectorAll('[data-b-panel]').forEach(button=>button.onclick=()=>{const panel=main.querySelector('#b-'+button.dataset.bPanel);panel.hidden=!panel.hidden;if(button.dataset.bPanel==="source" && !panel.hidden)panel.querySelectorAll("details").forEach(detail=>detail.open=true);button.setAttribute('aria-expanded',!panel.hidden);});
    main.insertAdjacentHTML('beforeend','<div class="choices check">'+(index?'<a class="btn light" href="'+bLink('journey',index-1)+'">Previous checkpoint</a>':'')+(index<8?'<a class="btn" href="'+bLink('journey',index+1)+'">Next checkpoint</a>':'<a class="btn" href="'+bLink('practice')+'">Try debugging</a>')+'</div>');
  }
  if(section==='message')main.querySelector('#bMessageField').onchange=e=>{location.hash=bLink('message',e.target.value);};
  if(section==='payment')main.querySelectorAll('[name="b-payment"]').forEach(input=>input.onchange=()=>{
    const messages=['The waiting branch commits AWAITING_PAYMENT before returning.','Correct. AWAITING_PAYMENT and B’s saved product row are committed.','Payment confirmation has not arrived at this pause.'];
    main.querySelector('#bFeedback').textContent=messages[Number(input.value)];
    main.querySelector('#bPaymentReveal').hidden=false;
  });
  if(section==='practice'){
    main.querySelectorAll('[name="b-debug"]').forEach(input=>input.onchange=()=>{main.querySelector('#bFeedback').textContent=Number(input.value)===bDebugCases[index].correct?'Correct. Open the explanation to follow the saved rows.':'Follow the failure location and its transaction boundary. Try another inspection or reveal the Java.';});
    main.querySelector('#bShowAnswer').onclick=()=>{main.querySelector('#bAnswer').hidden=false;};
  }
}
