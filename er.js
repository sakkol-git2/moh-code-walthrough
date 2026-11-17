// Coordinates use the same 940 × 645 canvas for the HTML buttons and connector paths.
function renderER(product, id, registration, licence, origin, options = {}) {
  const tables = [
    ['detail', 24, 58, 'application_reagent_details', 'application_id 700 · profile 42', 'Draft detail', 'Application creates the detail when it saves the reagent body. Its application_id is both a primary key and a foreign key to applications.id. prerequisite_profile_id records the existing profile selected by the applicant.', ['draftDetail','detail']],
    ['app', 350, 58, 'applications', 'id 700 · shared by A and B', 'Draft creation', 'The shared application handler saves one application row. Both product rows point back to 700. The establishment decision belongs here.', ['draftParent','http']],
    ['product', 676, 58, 'application_reagent_products', 'Product '+product+' · id '+id+' · '+origin, 'Draft product save', 'syncProducts saves one row for each product. application_id = 700 points to the parent application. This row owns Product '+product+'’s origin and files. Approval sends its stable numeric ID to Profile.', ['save','fk','payload']],
    ['profile', 24, 300, 'profiles', 'id 42 · existing establishment', 'Before this request', 'The applicant selects an existing profile. The intended example uses profile 42 for both products. The inherited resolver can choose or create another profile; inspect the profile-selection gap. The registration, licence and snapshot each have a local profile_id foreign key.', ['license','profileKeys','coreProfileFK','coreLicenceFK']],
    ['registration', 350, 300, 'regulatory_registrations', 'registration_id '+registration, 'Approval in Profile', 'ReagentRegisterHandler saves one registration per product. Its profile_id points to 42 and its unique license_id points to licence '+licence+'.', ['license','licenseJoin','coreProfileFK']],
    ['snapshot', 676, 300, 'reagent_product_license_details', 'source_product_id '+id, 'Approval snapshot', 'Profile copies source_application_id 700 and source_product_id '+id+' from approval data. Their pair is unique. Locally, registration_id '+registration+' references the registration and profile_id 42 references the establishment. The snapshot keeps this product’s files separate from shared files.', ['snapshot','profileKeys','license']],
    ['licence', 350, 421, 'licenses', 'id '+licence+' · profile_id 42', 'Approval in Profile', 'The licence builder constructs the licence for the current product. Profile saves it with that product’s registration. Its profile_id references profiles.id. Profile uses the licence ID when building the certificate request.', ['newLicence','licenseJoin','license','coreLicenceFK','certMatch']],
    ['cert', 350, 553, 'certificates', 'license_id '+licence+' · profile_id 42', 'Certificate issuance', 'Certificate consumes the ISSUE operation and processes each request. After resolving a matching template, it inserts or updates the initial certificate record using the profile and licence IDs. Rendering and upload then fill in the PDF file metadata.', ['certRead','certificateUnique','template','initialCert','pdf','pdfRecord']]
  ];
  const edges = [
    ['detail','app','M264 91 H347'],['product','app','M676 91 H593'],
    ['registration','profile','M350 335 H267'],['snapshot','registration','M676 335 H593'],
    ['snapshot','profile','M796 367 V391 H145 V369'],
    ['registration','licence','M470 367 V418'],
    ['licence','profile','M350 454 H85 V369'],
    ['product','snapshot','M824 125 V297','Approval event'],
    ['licence','cert','M470 488 V550','ISSUE event']
  ];
  const line=(a,b,path,event)=>'<path data-ends="'+a+' '+b+'" class="'+(event?'event-line':'fk-line')+'" d="'+path+'" marker-end="url(#'+(event?'event-tip':'fk-tip')+')"/>';
  const cardinalityBadges=[['detail','app',305,91],['product','app',634,91],['registration','profile',305,335],['snapshot','registration',634,335],['snapshot','profile',600,391],['registration','licence',470,392],['licence','profile',185,454]].map(args=>erdRelationBadge(...args)).join('');
  const bands=[[0,146,'Application database'],[244,253,'Profile database'],[504,140,'Certificate database']];
  const svg='<svg viewBox="0 0 940 645" preserveAspectRatio="none" aria-hidden="true"><defs>'+['fk','event'].map(t=>'<marker id="'+t+'-tip" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path fill="'+(t==='fk'?'#315c52':'#99471c')+'" d="M0 0 L10 5 L0 10z"/></marker>').join('')+'</defs>'+bands.map(([y,h,title])=>'<rect x="1" y="'+(y+1)+'" width="938" height="'+(h-2)+'" rx="12" fill="#f2f5e9" stroke="#c8d3c2"/><text x="24" y="'+(y+28)+'">'+title+'</text>').join('')+edges.map(e=>line(...e)).join('')+cardinalityBadges+
    '<text data-message="approval" class="event-label" x="650" y="184">Kafka · approval</text><text data-message="approval" x="500" y="208">Application 700 · Product '+product+' '+id+' · selected profile 42</text><text data-message="issue" class="event-label" x="485" y="537">Kafka · ISSUE · licence '+licence+' + profile 42</text></svg>';
  const nodes=tables.map(([key,x,y,name,row])=>'<button type="button" class="er-table" data-table="'+key+'" style="left:'+x/9.4+'%;top:'+y+'px" aria-pressed="'+(key==='product')+'"><strong>'+name+'</strong><span>'+row+'</span></button>').join('');
  const relationships = {
    app: {
      count:'One application → zero or more draft products. Submission requires at least one.',
      keys:'applications.id is the parent primary key. Both products use application_id = 700.',
      owner:'Application owns request state and the shared establishment decision.'
    },
    detail: {
      count:'One application → at most one DR06 shared detail row.',
      keys:'application_id is both this row’s primary key and its foreign key. It cannot identify two detail rows.',
      owner:'prerequisite_profile_id identifies the selected existing Profile record across services.'
    },
    product: {
      count:'Each product → exactly one application. One application can contain A and B.',
      keys:'id identifies the product. application_id is a required foreign key. position describes list order.',
      owner:'The product owns its application_type and attachments JSONB.'
    },
    profile: {
      count:'One existing profile → many registrations and licences, including earlier approvals.',
      keys:'profiles.id = 42 is reused. Querying this ID alone can return A and B and other products.',
      owner:'DR06 adds approved product records under the selected establishment.'
    },
    registration: {
      count:'Each registration → one licence. license_id is required and unique.',
      keys:'registration_id identifies the regulatory record. profile_id and license_id are local foreign keys.',
      owner:'The DR06 product snapshot points to this registration.'
    },
    snapshot: {
      count:'Each DR06 approved-product snapshot → one registration.',
      keys:'registration_id is both primary key and foreign key. The source pair (application, product) is unique.',
      owner:'Source product ID 802 is copied from Application. The local schema does not declare a foreign key back to that service.'
    },
    licence: {
      count:'Each licence → one profile and its registration. Certificate records are keyed separately.',
      keys:'licenses.id = '+licence+' is carried to Certificate. The registration’s unique license_id links here locally.',
      owner:'The licence holds the issued number and validity. The PDF file belongs to Certificate.'
    },
    cert: {
      count:'The schema allows one current row per (license_id, template_type).',
      keys:'The pair is unique. A licence can have zero document rows before issuance, or rows for different template types.',
      owner:'This example requests one DR06 certificate for B. The file reference is added after successful rendering and upload.'
    }
  };
  function inspect(key){
    const [, , ,name,row,when,why,refs]=tables.find(t=>t[0]===key);
    const relation=relationships[key];
    return '<div class="tag">'+when+'</div><h3>'+name+'</h3><p><b>'+row+'</b> · '+why+'</p><dl class="relation-facts"><dt>How many?</dt><dd>'+relation.count+'</dd><dt>Which key?</dt><dd>'+relation.keys+'</dd><dt>Who owns it?</dt><dd>'+relation.owner+'</dd></dl><details class="proof"><summary>Inspect the source</summary>'+sources(refs)+'</details>';
  }
  // Each frame describes a business write or handoff, not a separate database commit.
  const frames = [
    {title:'Select the existing establishment', rows:['profile'], text:'Profile 42 is the selected prerequisite in this intended example. The actual resolver may choose another profile for approval.', method:'No row is written at this step.', refs:['license']},
    {title:'Create the application', rows:['app'], text:'Application saves draft 700. A and B share this parent row.', method:'ApplicationCoreHandler.saveApplicationEntity → applicationRepository.save', refs:['draftParent']},
    {title:'Save the selected profile on the draft', rows:['detail'], text:'The DR06 detail has application_id 700 and prerequisite_profile_id 42.', method:'ReagentRegistrationApplicationStrategy.saveDetail → detailRepository.save', refs:['draftDetail']},
    {title:'Save Product '+product, rows:['product'], text:'The strategy saves each product in a loop. This trace shows '+product+'’s row '+id+' with origin '+origin+' and its own files. These draft writes are part of the same save operation.', method:'ReagentRegistrationApplicationStrategy.syncProducts → productRepository.save', refs:['save']},
    {title:'Submit and settle payment', focus:['app'], text:'In the paid example, application 700 moves through AWAITING_PAYMENT to SUBMITTED. PaymentCompletedMessage lets Application match the payment to the application. The same draft and product rows stay on the map.', method:'ApplicationServiceImpl.submitApplication → updatePaymentStatus → finalizeSubmission (after payment)', refs:['payment','paidRead','settle','finalize']},
    {title:'Record the review decision', focus:['app'], text:'Review approves the application as a whole. ReviewRequestCreatedMessage delivers the decision for application 700. Application updates its status to APPROVED.', method:'ApplicationServiceImpl.handleApplicationReviewCreated → applicationRepository.save', refs:['finalApproval','reviewRead','approve']},
    {title:'Send the product ID to Profile', message:'approval', focus:['product'], text:'ApplicationApprovedMessage is keyed by application number. Its data identifies application 700, selected profile 42 and Product '+product+' (ID '+id+'). Profile receives the message before writing the approval results.', method:'ApplicationEventProducer.produceApplicationApprovedEvent → ProfileKafkaConsumer.handleApplicationApproved', refs:['messageKey','payload','publish','consumer']},
    {title:'Save the registration and licence together', rows:['registration','licence'], text:'For Product '+product+', Profile builds registration '+registration+' and licence '+licence+' under the example resolved profile 42. Saving the registration also persists its attached licence through the Java cascade mapping.', method:'ReagentRegisterHandler.processLicenses → regulatoryRegistrationService.save', refs:['newLicence','license','licenseJoin']},
    {title:'Save the approval snapshot', rows:['snapshot'], text:'The snapshot records source application 700 and product '+id+' against registration '+registration+'. This is the local row that connects the original product to its approved result.', method:'ReagentRegisterHandler.processLicenses → detailRepository.save', refs:['snapshot','license','profileKeys']},
    {title:'Send the licence ID to Certificate', message:'issue', focus:['licence'], text:'Profile marks the licences PENDING. ProfileLicenseOperationMessage carries the ISSUE operation. Product '+product+'’s request contains license_id '+licence+' and profile_id 42.', method:'AbstractCertificatePublishStrategy.publishCertificateOperationEvent → licenseRepository.saveAll', refs:['pending','operation','certRead']},
    {title:'Write the initial certificate row', rows:['cert'], text:'With a matching active template, Certificate creates or reuses a record for licence '+licence+'. On first issuance the row can exist before its PDF has been uploaded.', method:'MapCertificateProcessor.createCertificateEntity → certificateRepository.upsertCertificateMinimal', refs:['template','initialCert']},
    {title:'Attach the PDF to the same row', focus:['cert'], text:'After rendering and upload succeed, Certificate saves the file reference and metadata on the existing record. The result message identifies licence '+licence+'.', method:'MapCertificateProcessor.updateCertificateAfterCreate → certificateRepository.save', refs:['pdf','pdfRecord','certResult']}
  ];
  // Delegation on this diagram keeps keyboard focus on the selected native button.
  const attach=()=>{
    const diagram=document.querySelector('#er');
    let step = Number.isInteger(options.step) ? options.step : -1;
    const panel = diagram.querySelector('.er-guide');
    const toggle = diagram.querySelector('[data-mode]');
    const back = diagram.querySelector('[data-back]');
    const next = diagram.querySelector('[data-next]');
    function displayStep(){
      const guided = step >= 0;
      const frame = frames[step];
      const elapsed = frames.slice(0,step+1);
      const visible = new Set(elapsed.flatMap(f=>f.rows || []));
      const messages = new Set(elapsed.map(f=>f.message));
      if (options.onStep && guided) options.onStep(step, frame);
      toggle.textContent = guided ? 'Explore full diagram' : 'Start step-by-step mode';
      panel.hidden = !guided;
      back.disabled = step === 0;
      next.textContent = step === frames.length-1 ? 'Restart' : 'Next step →';
      diagram.querySelectorAll('[data-table]').forEach(node=>{
        const key = node.dataset.table;
        node.hidden = guided && !visible.has(key);
        node.setAttribute('aria-pressed',guided ? (frame.rows || frame.focus).includes(key) : key==='product');
      });
      diagram.querySelectorAll('[data-ends]').forEach(edge=>{
        const ends=edge.dataset.ends.split(' ');
        const message=edge.classList.contains('event-line') && (ends[0]==='product'?'approval':'issue');
        edge.style.visibility = guided && !(message ? messages.has(message) : ends.every(k=>visible.has(k))) ? 'hidden' : '';
        edge.classList.remove('dim');
        edge.classList.toggle('er-current-message',guided && message && frame.message===message);
      });
      diagram.querySelectorAll('g[data-cardinality-ends]').forEach(badge=>{badge.style.visibility=guided&&!badge.dataset.cardinalityEnds.split(' ').every(key=>visible.has(key))?'hidden':'';});
      diagram.querySelectorAll('[data-message]').forEach(label=>{
        label.style.visibility=guided && !messages.has(label.dataset.message) ? 'hidden' : '';
      });
      diagram.querySelector('.er-note').innerHTML=inspect(guided ? (frame.rows || frame.focus)[0] : 'product');
      if(guided) {
        diagram.querySelector('.er-frame').innerHTML='<div class="tag">Step '+(step+1)+' of '+frames.length+'</div><h3>'+frame.title+'</h3><p>'+frame.text+'</p><code>'+frame.method+'</code><details class="proof"><summary>See the Java source</summary>'+sources(frame.refs)+'</details>';
      }
    }
    if (options.step !== undefined) {
      toggle.hidden = true;
      displayStep();
    }
    toggle.addEventListener('click',()=>{step=step<0?0:-1;displayStep();});
    back.addEventListener('click',()=>{step--;displayStep();});
    next.addEventListener('click',()=>{step=(step+1)%frames.length;displayStep();});
    diagram.addEventListener('click',e=>{
      const button=e.target.closest('[data-table]');
      if(!button)return;
      const key=button.dataset.table;
      diagram.querySelectorAll('[data-table]').forEach(node=>node.setAttribute('aria-pressed',node===button));
      diagram.querySelectorAll('[data-ends]').forEach(edge=>edge.classList.toggle('dim',!edge.dataset.ends.split(' ').includes(key)));
      diagram.querySelectorAll('[data-cardinality-ends]').forEach(item=>item.classList.toggle('selected',item.dataset.cardinalityEnds.split(' ').includes(key)));
      diagram.querySelector('.er-note').innerHTML=inspect(key);
    });
  };
  return {attach,html:'<section id="er" class="panel check"><h2>Product '+product+'’s table map</h2><p>Select a table to see when its row is created. Solid arrows point from a foreign key to its parent. Each solid connection has a 1:1 or N:1 badge; the table below spells out both directions. Dashed arrows show IDs copied in a Kafka message. The labels list the IDs relevant to this trace.</p><button type="button" class="btn" data-mode>Start step-by-step mode</button><div class="er-guide" hidden><div class="er-frame" aria-live="polite"></div><div class="choices"><button type="button" data-back>← Previous step</button><button type="button" data-next>Next step →</button></div></div><div class="er-scroll" tabindex="0" aria-label="Scrollable relationship diagram"><div class="er-canvas">'+svg+nodes+'</div></div>'+erdRelationshipLegend(Object.fromEntries(tables.map(t=>[t[0],t[3]])),edges)+'<div class="er-note" aria-live="polite">'+inspect('product')+'</div></section>'};
}
