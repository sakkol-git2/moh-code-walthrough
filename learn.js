const learningPath = [
  ['overview','Place each service','Explain which service owns drafts, payment, review, registrations and PDFs.','#overview'],
  ['draft','Trace a saved product','Find Product B’s request field, DTO and stored product row.','#lesson/0'],
  ['java','Follow the shared Java entry point','Locate both the request subtype selection and DR06 strategy selection.','#java-route/0'],
  ['database','Follow the keys','Use application 700 and product 802 to find registration 902 and licence 502.','#database/B'],
  ['payment','Follow Submit and payment','Explain why the browser receives AWAITING_PAYMENT before Application records PAID.','#payment-timeline'],
  ['review','Follow the staff decision','Identify the reviewer, action-history row and final approval message.','#review-timeline/0'],
  ['journey','Finish at the certificate','Explain why B’s licence can exist before B’s PDF is ready.','#journey/4'],
  ['result','Follow the result and download','Compare READY and FAILED, then trace the licence ID through document retrieval.','#certificate-result/0'],
  ['workbench','Connect the service, rows and code','Play one action and follow its effect on the ER diagram.','#workbench/0'],
  ['field','Trace one value across services','Follow origin, product identity and files through six boundaries.','#field/origin/0'],
  ['order','Deliver messages in either order','Compare Review’s rows when payment arrives before or after submission.','#message-order'],
  ['transactions','Locate the commit boundary','Distinguish a save, a transaction commit and a later event.','#transactions/0'],
  ['recovery','Investigate a failure','Explain what already exists and whether repeating a message will process it again.','#recovery/file'],
  ['sources','Search the source','Locate a relevant excerpt, then open its recorded file and line in your editor.','#sources'],
  ['practice','Find the method yourself','Use a symptom to choose the repository, method and next value to inspect.','#practice/0']
];
function learnPage(){
  let completed=[];
  try {const saved=JSON.parse(localStorage.getItem('moh-field-guide-explained')||'[]');if(Array.isArray(saved))completed=saved;}catch{}
  main.innerHTML='<div class="tag">MOH Field Guide / Learning path</div><h1>Understand one request deeply</h1><p class="lead">Work through Product B’s journey in order, or choose a question you want to answer. Mark a lesson when you can explain it in your own words. Your checklist is saved in this browser.</p><ol class="learning-path">'+learningPath.map(([key,title,goal,url])=>'<li class="panel"><div><h2><a href="'+url+'">'+title+'</a></h2><p>'+goal+'</p></div><label><input type="checkbox" data-complete="'+key+'" '+(completed.includes(key)?'checked':'')+'> I can explain this</label></li>').join('')+'</ol><details class="panel check"><summary>How to read the source evidence</summary><p>Each excerpt includes a repository, commit, file path and original line numbers. Open the file in that checkout, search for the method name, then inspect its caller and the repository save. Example records are fictional. The revisions in the guide are source snapshots, and live environment behaviour still needs verification.</p></details>';
  main.querySelectorAll('[data-complete]').forEach(box=>box.onchange=()=>{
    completed=completed.filter(key=>key!==box.dataset.complete);
    if(box.checked)completed.push(box.dataset.complete);
    try{localStorage.setItem('moh-field-guide-explained',JSON.stringify(completed));}catch{}
  });
}
const codeExercises = [
  {
    title:'B’s imported origin disappears after draft save',
    prompt:'The incoming request shows reagent.products[1].application_type = IMPORT. A read of the saved draft shows B’s origin empty. Where would you begin?',
    choices:['Certificate template lookup','Application product mapping and save','Review’s final approval action'],
    correct:1,reason:'Start at the closest boundary where a correct input becomes an incorrect stored or returned value. Follow updateProduct, productRepository.save and the response mapper.',
    hunt:'In MOH-Application, open ReagentRegistrationApplicationStrategy. Find syncProducts. Identify where the DTO becomes an entity, where it is saved, and where mapToResponseDto reloads the product list.',
    refs:['save','mapper','response'],
    task:'Explain how you would distinguish a save problem from a response-mapping problem.',
    answer:'Compare row 802 in application_reagent_products with the returned JSON. A correct row and incorrect response points toward the read/mapping path. An incorrect row calls for checking the incoming DTO, updateProduct and the write path.'
  },
  {
    title:'Approval arrives at Profile with an invalid product',
    prompt:'Application is APPROVED. Profile receives the event, but B’s origin is missing. Which method decides whether this payload can become a registration request?',
    choices:['ReagentMapper.toRegisterRequestDto','ApplicationCoreHandler.saveApplicationEntity','CertificateServiceImpl.resolveTemplate'],
    correct:0,reason:'The Profile strategy parses and validates the approval data before calling the registration handler.',
    hunt:'In MOH-Profile, start at ProfileKafkaConsumer.handleApplicationApproved. Find the service-code strategy, then ReagentLicenseRegistrationStrategy.processApprovedMessage. Follow the mapper call before registerHandler.handle.',
    refs:['consumer','registrationEntry','originContract'],
    task:'What evidence would you collect before assuming Profile lost the origin?',
    answer:'Capture the received B payload and compare it with the producer’s approved form data and Application’s saved B row. Check contract_version and the numeric product ID so you compare the same product at every point.'
  },
  {
    title:'B has a licence but no certificate PDF',
    prompt:'Profile has B’s licence 502. Certificate reported a failed operation. Where should you look for the next explanation?',
    choices:['Create a new application','Use Product A’s certificate','Certificate operation, template and result paths'],
    correct:2,reason:'The licence was already issued. Follow the certificate request for licence 502, the matching template, the processing error and the operation marker.',
    hunt:'In MOH-Certificate, open CertificateKafkaConsumer and CertificateAsyncService. Follow ISSUE to CertificateServiceImpl.create, then template resolution and MapCertificateProcessor.processCreate.',
    refs:['certGuard','issue','template','pdf','certResult'],
    task:'Why can replaying the exact same operation ID fail to start another render?',
    answer:'The consumer inserts the ID in processed_operation before async processing. Another delivery can be skipped by that marker. The shown error path publishes a result without removing the marker. Verify the supported recovery path before issuing an operational retry.'
  }
];
function codePractice(index){
  const e=codeExercises[index];
  main.innerHTML='<div class="tag">DR06 / Independent practice</div><h1>Find the next method</h1><p class="lead">Make a prediction, then open your editor and trace the code. Each hint reveals more of the path.</p><nav class="steps" aria-label="Code exercises">'+codeExercises.map((v,i)=>'<a href="#practice/'+i+'" '+(i===index?'aria-current="step"':'')+'>'+(i+1)+' · '+['Draft save','Profile mapping','Missing PDF'][i]+'</a>').join('')+'</nav><section class="panel check"><h2>'+e.title+'</h2><p>'+e.prompt+'</p><div class="choices">'+e.choices.map((v,i)=>'<button data-exercise-choice="'+i+'">'+v+'</button>').join('')+'</div><p role="status" id="exerciseResult"></p><details class="proof"><summary>Reveal navigation hint</summary><p>'+e.hunt+'</p></details><details class="proof"><summary>Open source excerpts</summary>'+sources(e.refs)+'</details><h3 class="check">'+e.task+'</h3><details class="proof"><summary>Compare your explanation</summary><p>'+e.answer+'</p></details></section><div class="actions"><a class="btn light" href="#learn">Learning path</a><a class="btn" href="#practice/'+((index+1)%3)+'">'+(index===2?'Try again':'Next exercise →')+'</a></div>';
  main.querySelectorAll('[data-exercise-choice]').forEach(b=>b.onclick=()=>{
    main.querySelector('#exerciseResult').textContent=(Number(b.dataset.exerciseChoice)===e.correct?'Correct. ':'Trace the point where the symptom first appears. ')+e.reason;
  });
}
