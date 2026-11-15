// One worked example, told at six boundaries. Controls only change the local example.
const journeySteps = [
  {
    name: 'Submit', title: 'Ask to submit application 700',
    handoff: ['Applicant','HTTP request','Application'],
    text: 'The applicant sends POST /api/v1/applications/700/submit. Application reads the two saved products, checks the selected profile and validates the documents for each product. Assume all fields and files outside the exercise are complete.',
    question: 'Does clicking Submit immediately send B to a reviewer?',
    answer: 'For this payment-first example, the immediate response contains the invoice and AWAITING_PAYMENT. A and B still belong to the same application.',
    sources: ['submit','validate','quantity','payment']
  },
  {
    name: 'Payment', title: 'One invoice covers both products',
    handoff: ['Payment','PaymentCompletedMessage','Application'],
    text: 'DR06 counts saved products for the invoice quantity. At the master-data fee of 400,000 riel per product, two products give a worked total of 800,000 riel before any waiver. This example follows a paid, non-waived invoice.',
    question: 'How does Application learn that the applicant paid?',
    answer: 'Payment publishes a completion message. Application consumes it and finalizes this submission. With its prerequisite checks clear, application 700 becomes SUBMITTED. Review consumes the submitted message and updates the review request.',
    sources: ['quantity','payment','paidSend','paidRead','settle','finalize','submitted']
  },
  {
    name: 'Review', title: 'Staff review one application',
    handoff: ['Review staff','Workflow decision','Review'],
    text: 'The seeded workflow puts Payment first. Staff then handle the application in the order below. Product B still has its own documents, while the final decision covers application 700 and both products.',
    question: 'What changes when the final reviewer approves?',
    answer: 'Review records the approval action, marks the review request APPROVED and sends a review update. Application receives the update, saves APPROVED and raises an approval event. Product registrations are created later in Profile.',
    sources: ['review','finalApproval','reviewSend','reviewRead','approve']
  },
  {
    name: 'Kafka', title: 'Read the approval message',
    handoff: ['Application','ApplicationApprovedMessage','Profile'],
    text: 'A producer writes a message to a Kafka topic. A consumer reads it later. Here Application is the producer, the application number is the message key, and Profile is the consumer. Profile uses the service code GDHT-RG-L to choose its DR06 handler.',
    question: 'Which value lets Profile recognize Product B after the handoff?',
    answer: 'B’s saved product ID is 802. Application includes that ID, B’s own origin and B’s own attachments in form_data. The establishment decision travels separately at application level.',
    sources: ['messageKey','payload','files','publish','consumer']
  },
  {
    name: 'Registration', title: 'Give B its own registration and licence',
    handoff: ['Approval data','One iteration per product','Profile records'],
    text: 'Profile processes A and B in turn. For each product it builds a registration and licence on the resolved profile. The intended fixture uses profile 42; inspect the documented resolver gap for branch behaviour. The numbering code asks the current product for its origin. The saved detail links the originating application and product to this registration.',
    question: 'If Kafka delivers the same approval again, will B receive another licence?',
    answer: 'After successful processing, the handler finds details already stored for application 700 and exits. B keeps its registration and licence. Its detail snapshot stores its own attachments and the shared attachments separately.',
    sources: ['license','snapshot','origin','replay']
  },
  {
    name: 'Certificate', title: 'Turn B’s licence data into a PDF',
    handoff: ['Profile','Licence operation · ISSUE','Certificate'],
    text: 'Profile matches product details by licence ID and builds one certificate request per licence. It marks the licences PENDING and publishes a licence-operation message. Certificate loops through the requests. Each request carries the licence ID and that product’s certificate data.',
    question: 'What does Certificate need before it can render B’s PDF?',
    answer: 'Certificate looks up an active template for the service code and certificate type. On success it renders the data, uploads the PDF, stores the file reference, and publishes a result for B’s licence. Template availability and actual DR06 delivery have not been checked in a running environment.',
    sources: ['certMatch','certData','pending','operation','certRead','issue','template','pdf','pdfRecord','certResult']
  }
];
const journeyView = {templateAvailable:true};
function journeyExample(i) {
  switch (i) {
    case 0:
      return state.hasForm
        ? '<p><b>Validation example</b> · A and B each have an application form. The shared establishment decision belongs to the application.</p>'
        : '<p role="status"><b>B is missing its form.</b> Submit stops at <code>reagent.products[1].attachments</code> before invoice creation. Restore the sample file to follow the successful path.</p><button class="action" id="restoreForm">Restore B’s sample form</button>';
    case 1:
      return '<div class="mini"><span class="chip">2 products</span> × <span class="chip">400,000 KHR</span></div><h3>800,000 KHR</h3><p>One invoice for application 700. A payment completion event advances the submission after the HTTP response.</p>';
    case 2:
      return '<ol class="workflow"><li>Bureau of Drug Regulation</li><li>Department of Drugs and Food</li><li>General Department of Technical Services</li><li>Secretary of State in charge · final decision</li></ol><details class="proof"><summary>Compare with master data</summary><p>SW_C → PAY → DR_V → DDF_R1 → DGH_R2 → SS_A. The Review seed contains five steps including Payment. It flags the mapping for SW_C and DR_V as unresolved.</p></details>';
    case 3: {
      const products = request().reagent.products.map((p,i)=>({id:801+i,application_type:p.application_type,attachments:p.attachments}));
      return '<div class="tag">Decoded form_data · selected fields and fictional IDs</div>'+pre(JSON.stringify({attachments:request().attachments,reagent:{prerequisite_profile_id:42,products}},null,2));
    }
    case 4:
      return '<div class="rows"><table><caption>Example records on profile 42</caption><thead><tr><th>Source product</th><th>Origin</th><th>Registration ID</th><th>Licence ID</th></tr></thead><tbody><tr><td>A · 801</td><td>LOCAL</td><td>901</td><td>501</td></tr><tr class="focus"><td>B · 802</td><td>'+state.origin+'</td><td>902</td><td>502</td></tr></tbody></table></div><p>802 came from Application. Profile assigned 902 and 502 in this example. A licence ID identifies the record used for the next lookup.</p><button class="action" id="replayApproval">Deliver the approval again</button><p id="replayResult" role="status"></p>';
    case 5:
      return '<div class="tag">Selected certificate request fields · Product B</div>'+pre(JSON.stringify({license_id:502,profile_id:42,certificate_data:{applicationType:state.origin,productName:'Product B'}},null,2))+
      '<label class="field"><input id="templateCase" type="checkbox" '+(journeyView.templateAvailable?'checked':'')+'> Assume an active matching template in this example</label><p id="templateResult" role="status">'+templateOutcome()+'</p>';
  }
}
function templateOutcome() {
  return journeyView.templateAvailable
    ? 'Simulated success path, assuming rendering and storage succeed. B’s PDF file reference is recorded and the result identifies licence 502.'
    : 'Simulated missing template. Lookup fails before rendering. The async handler publishes failure for licence 502. The registration has already been created.';
}
function journey(i) {
  const step=journeySteps[i];
  const blocked=!state.hasForm && i>0;
  const trace='<div class="mini handoff">'+step.handoff.map((v,n)=>'<span class="chip '+(n===1?'accent':'')+'">'+v+'</span>').join('<span aria-hidden="true">→</span>')+'</div>';
  const links=journeySteps.map((s,n)=>'<a href="#journey/'+n+'" '+(i===n?'aria-current="step"':'')+'>'+(n+1)+' · '+s.name+'</a>').join('');
  const explanation='<details class="proof"><summary>'+step.question+'</summary><p>'+step.answer+'</p></details>';
  const body=blocked
    ? '<p>The example draft is missing B’s application form. <a href="#journey/0">Go to Submit to restore it.</a></p>'
    : trace+'<p>'+step.text+'</p>'+journeyExample(i)+(i===0&&!state.hasForm?'':explanation);
  main.innerHTML='<div class="tag">Guided walkthrough / DR06 · Lesson 2</div><h1>From submit to certificate</h1><p class="lead">Follow Product B · ID 802 · '+state.origin+' through application 700. Each stop uses fictional records and source excerpts.</p><nav class="steps" aria-label="Journey steps">'+links+'</nav><div class="lessonbody"><article class="panel"><div class="tag">Step '+(i+1)+' of 6</div><h2>'+step.title+'</h2>'+body+'</article><aside class="side"><div class="tag">Source reader</div><h2>Inspect the code</h2><p>Open an excerpt to find the repository, revision and original lines.</p>'+sources(step.sources)+'</aside></div><div class="actions"><a class="btn light" href="'+(i?'#journey/'+(i-1):'#lesson/5')+'">← '+(i?'Previous':'Draft lesson')+'</a><a class="btn" href="'+(i===5?'#overview':'#journey/'+(i+1))+'">'+(i===5?'Finish · Overview':'Next · '+journeySteps[i+1].name)+' →</a></div>';
}
