const tmPartyChanges = {
  holder: {
    code:'DR08.05', title:'Holder name / address change', section:'GDHT-TM-UM',
    nameField:'mah_name', addressField:'mah_address',
    oldName:'Example B Holder Ltd', oldAddress:'Example holder address',
    newName:'Example B Holder Updated Ltd', newAddress:'Example updated holder address',
    source:'Direct product request → approved product data → Profile snapshot',
    explanation:'TraditionalMedicineProductRequestDto accepts mahName and mahAddress. buildProductFormData carries those saved values into approval data, then TraditionalMedicineMapper.toDetail copies them into B’s snapshot. Holder text is product data. The reviewed plan calls for explicit authorization and no implicit profile/account ownership transfer.',
    refs:['tmRequest','tmPayload','tmSnapshot']
  },
  manufacturer: {
    code:'DR08.06', title:'Manufacturer name / address change', section:'GDHT-TM-UMF',
    nameField:'manufacturer_name', addressField:'manufacturer_address',
    oldName:'Example B Manufacturer Ltd', oldAddress:'Example manufacturer address',
    newName:'Example B Manufacturer Updated Ltd', newAddress:'Example updated manufacturer address',
    source:'DR07 brand-name licence 302 → first brand-name entry → Profile snapshot',
    explanation:'The current DR08 request DTO omits manufacturer fields. Before BaseRegisterHandler starts, fillFromBrandNameLicences copies manufacturerEn and a formatted DR07 address into each product DTO. toDetail copies those enriched values into the snapshot. Missing lookup retains incoming legacy values. A dedicated amendment must define whether a new DR07 approval is required and which value takes precedence.',
    refs:['tmRequest','tmPayload','tmHandler','tmSnapshot']
  }
};
const tmPartyDrafts = {};
const tmPartyPhases = ['Existing rows and field source','Propose name / address','Application routing','Profile approval boundary','Compare before and after','Inspect implementation gaps'];
function tmPartyDraft(kind){
  const c=tmPartyChanges[kind];
  if(!tmPartyDrafts[kind])tmPartyDrafts[kind]={scope:'both',name:c.newName,address:c.newAddress};
  return tmPartyDrafts[kind];
}
function tmPartyRows(kind){
  const c=tmPartyChanges[kind],draft=tmPartyDraft(kind);
  const name=draft.scope==='address'?c.oldName:draft.name;
  const address=draft.scope==='name'?c.oldAddress:draft.address;
  return bTable(['Existing row / field','Before request','Proposal / pending decision','After unsupported-code boundary'],[
    ['B snapshot · '+c.nameField,c.oldName,name,c.oldName],
    ['B snapshot · '+c.addressField,c.oldAddress,address,c.oldAddress],
    ['B registration / licence','922 / 522','Approved target association required','922 / 522 retained'],
    ['A registration / licence','921 / 521','Proposal concerns fictional B','Existing A rows retained'],
    ['Profile 99','Existing establishment and account associations','Product-party changes require explicit scope','Existing profile retained'],
    ['B licence number / validity','Previously saved values','Mutation/history policy pending','Previously saved values'],
    ['DR07 licence 302','Existing source snapshot association',kind==='manufacturer'?'Authority / refresh policy unresolved':'Holder fields come from DR08 request','No DR07 write reached'],
    ['Amendment request / history','None in fixture','Dedicated persistence contract missing','No domain rows created by factory rejection']
  ]);
}
function dr08PartyChange(kind,index){
  const c=tmPartyChanges[kind],draft=tmPartyDraft(kind);
  let body,refs;
  if(index===0){
    body='<p>Use the main DR08 lesson’s fictional B registration 922, licence 522 and traditional_medicine_license_details row. Actual resolved profile 99 and selected prerequisite 42 remain separate. B’s referenced DR07 brand-name licence is 302.</p><div class="transaction-box"><strong>'+c.source+'</strong><p>'+c.explanation+'</p></div>'+tmPartyRows(kind);
    refs=[...c.refs,'tmEntity'];
  }else if(index===1){
    body='<p>The draft combined form permits changing a name, address or both. Existing values are read-only. Edit the proposal to see precisely which field differs.</p><label class="field">Change scope <select id="tmPartyScope"><option value="both">Name and address</option><option value="name">Name only</option><option value="address">Address only</option></select></label><label class="field">Existing name <input class="tm-party-input" readonly value="'+escapeHtml(c.oldName)+'"></label><label class="field">Existing address <input class="tm-party-input" readonly value="'+escapeHtml(c.oldAddress)+'"></label><label class="field">Proposed name <input class="tm-party-input" id="tmPartyName" maxlength="255" value="'+escapeHtml(draft.name)+'"></label><label class="field">Proposed address <textarea class="tm-party-input" id="tmPartyAddress" maxlength="1000">'+escapeHtml(draft.address)+'</textarea></label><section id="tmPartyRows">'+tmPartyRows(kind)+'</section><p>These proposals stay in page memory during navigation. Dedicated amendment DTOs, validation and persistence are missing. The draft form lists an application and a manufacturer’s confirmation letter, with CamDigiKey/new-entry choices still requiring confirmation.</p>';
    refs=c.refs;
  }else if(index===2){
    body='<p>Application constants declare update container GDHT-TM-U and section '+c.section+'. The inspected source contains these section codes only in constants. No dedicated DR08 update strategy was found. At an isolated factory lookup for an unregistered update code, getStrategy throws BaseException before domain saves. Request subtype or service validation can reject a real call earlier.</p><div class="transaction-box">ApplicationStrategyFactory.getStrategy → Unsupported service type</div><p>Whether the section belongs in a combined request must be confirmed. Missing implementation includes explicit registration selection, ownership, source version, allowed-field validation, evidence scope, stored before/after proposal, pricing and approved Kafka mapping.</p>';
    refs=['tmRenewCodes','tmRenewAppFactory'];
  }else if(index===3){
    body='<p>Profile exposes DR08 registration and comments about future GDHT-TM-U routing. No dedicated DR08 update strategy or mutation handler was found. For an unsupported update approval code, the strategy factory throws BaseException, then ProfileKafkaConsumer catches, logs and returns. It reaches no product amendment writes. Any earlier Application APPROVED commit survives.</p><div class="transaction-box">Profile approval → missing operation strategy → logged return</div><p>'+c.explanation+'</p><p>The current registration handler builds new registrations. Its field-copying behaviour alone does not establish the approved amendment path.</p>';
    refs=['tmProfileCodes','tmRenewProfileFactory','consumer',...c.refs,'tmLoop'];
  }else if(index===4){
    body='<p>The final column shows rows after isolated unsupported-code handling. Proposed values have no successful amendment path in the inspected modules.</p>'+tmPartyRows(kind)+'<p>The reviewed roadmap proposes changes limited to the selected registration, preservation of unrelated products, original validity and original approved snapshots, with before/after history. Dedicated update hooks must implement the approved snapshot/version and revised-output policy.</p><p>'+c.explanation+'</p>';
    refs=['tmEntity','tmSnapshot','tmRenewAppFactory','tmRenewProfileFactory'];
  }else{
    body=bTable(['Decision / implementation','Current evidence'],[
      ['Subservice Type of certificate','Absent in both masters; parent Product Number'],
      ['Target cardinality and combinations','Unresolved; no request model chosen here'],
      ['Declared section code',c.section+' exists in Application constants'],
      ['Dedicated strategies / DTOs / approved data','Missing in inspected modules'],
      ['Field authority',kind==='holder'?'MAH from approved DR08 product input':'Manufacturer enriched from DR07 at registration consumption'],
      ['Target owner / profile / source version','Dedicated validation contract missing'],
      ['Document and CamDigiKey semantics','Combined-form extraction is draft'],
      ['Mutation / history / number / certificate','Dedicated approved policy and implementation required'],
      ['Rollback / duplicate handling','Must verify actual amendment transaction and guard'],
      ['Shared update helper','ACTIVE rejection and caller transaction need review before reuse']
    ])+'<p>Both masters record fee 300000, duration 20 days and validity matching the original certificate. These values do not establish the runtime billing unit, workflow or validity mutation. The shared BaseUpdateHandler resolves a profile and rejects ACTIVE in its base condition; it neither supplies a B-specific target nor guarantees a transaction on its own.</p><p><a href="#dr08-change/name/5">Inspect the shared update-helper status example →</a></p>';
    refs=['tmRenewCodes','tmProfileCodes','tmChangeShared'];
  }
  const master=drServiceCatalog.find(s=>s.code===c.code);
  main.innerHTML='<div class="tag">Application + Profile / '+c.code+'</div><h1>'+c.title+'</h1><p class="lead">Inspect current Product B values, propose changes and follow the verified source boundaries. Dedicated DR08 amendment wiring remains missing.</p><div class="choices"><a class="btn light" href="#dr08-party/holder/0">Holder change</a><a class="btn light" href="#dr08-party/manufacturer/0">Manufacturer change</a></div><nav class="steps" aria-label="DR08 party change checkpoints">'+tmPartyPhases.map((title,i)=>'<a href="#dr08-party/'+kind+'/'+i+'" '+(index===i?'aria-current="step"':'')+'>'+title+'</a>').join('')+'</nav><section class="panel check"><h2>'+tmPartyPhases[index]+'</h2>'+body+'<details class="proof"><summary>Inspect real Application / Profile code</summary>'+sources(refs)+'</details></section><div class="choices check">'+(index?'<a class="btn light" href="#dr08-party/'+kind+'/'+(index-1)+'">Previous checkpoint</a>':'<a class="btn light" href="#services/'+c.code+'">Service explorer</a>')+(index<5?'<a class="btn" href="#dr08-party/'+kind+'/'+(index+1)+'">Next checkpoint</a>':'<a class="btn" href="#dr08-main/6">Review DR08 registration enrichment</a>')+'</div><details class="panel check"><summary>Business sources and verification scope</summary><p>'+escapeHtml(master.master)+'</p><p>Draft form · DR08.01/input-form/fields.md, MAH and manufacturer rows. Reviewed implementation contract · next-phase-work/roadmap/dr08-sub-service/'+(kind==='holder'?'DR08.05-mah-change':'DR08.06-manufacturer-change')+'/implementation-contract.md.</p><p>Application f89d2061 · Profile a9caf9a. Current module files match these commits. IDs and values are fictional; isolated failure outcomes are source-derived. Successful amendment requests, deployed schema and Kafka delivery remain unexecuted.</p></details>';
  if(index===1){
    main.querySelector('#tmPartyScope').value=draft.scope;
    const update=()=>{draft.scope=main.querySelector('#tmPartyScope').value;draft.name=main.querySelector('#tmPartyName').value;draft.address=main.querySelector('#tmPartyAddress').value;main.querySelector('#tmPartyName').disabled=draft.scope==='address';main.querySelector('#tmPartyAddress').disabled=draft.scope==='name';main.querySelector('#tmPartyRows').innerHTML=tmPartyRows(kind);};
    main.querySelector('#tmPartyScope').onchange=update;main.querySelector('#tmPartyName').oninput=update;main.querySelector('#tmPartyAddress').oninput=update;update();
  }
}
