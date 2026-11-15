const dr06Amendments = {
  holder:{code:'DR06.03',title:'Holder name / address change',nameField:'mah_name',addressField:'mah_address',javaName:'mahName',javaAddress:'mahAddress',originalName:'Example B Holder Ltd',originalAddress:'Example old holder address',newName:'Example B Holder Updated Ltd',newAddress:'Example new holder address',licenceItems:'7 and 8'},
  manufacturer:{code:'DR06.04',title:'Manufacturer name / address change',nameField:'manufacturer_name',addressField:'manufacturer_address',javaName:'manufacturerName',javaAddress:'manufacturerAddress',originalName:'Example B Manufacturer Ltd',originalAddress:'Example old manufacturer address',newName:'Example B Manufacturer Updated Ltd',newAddress:'Example new manufacturer address',licenceItems:'5 and 6'}
};
const amendmentDrafts={};
const amendmentPhases=['Existing Product B','Propose changed fields','Check Application routing','Inspect approval handling','Compare surviving rows','Find implementation gaps'];
function amendmentDraft(kind){
  const c=dr06Amendments[kind];
  if(!amendmentDrafts[kind])amendmentDrafts[kind]={scope:'both',name:c.newName,address:c.newAddress};
  return amendmentDrafts[kind];
}
function amendmentProposal(kind){
  const c=dr06Amendments[kind],draft=amendmentDraft(kind);
  return {[c.nameField]:draft.scope==='address'?c.originalName:draft.name,[c.addressField]:draft.scope==='name'?c.originalAddress:draft.address};
}
function amendmentComparison(kind){
  const c=dr06Amendments[kind],proposal=amendmentProposal(kind);
  return bTable(['Existing Profile field','Before request','Proposed value','After unsupported-code handling'],[
    [c.nameField,c.originalName,proposal[c.nameField],c.originalName],
    [c.addressField,c.originalAddress,proposal[c.addressField],c.originalAddress],
    ['registration_id','902','Target association requires approved DTO','902'],
    ['licence ID','502','Mutation / version policy unresolved','502 · existing values'],
    ['Snapshot source pair','(700,802)','Amendment request provenance unresolved','(700,802)'],
    ['New amendment rows','None in fixture','Dedicated persistence contract required','None created by isolated factory rejection']
  ]);
}
function dr06Amendment(kind,index){
  const c=dr06Amendments[kind],draft=amendmentDraft(kind);
  let body,refs;
  if(index===0){
    body='<p>Begin with B’s existing registration 902, licence 502 and reagent_product_license_details snapshot. The snapshot retains source application 700 and source product 802 from registration. Example values below are fictional.</p>'+amendmentComparison(kind)+'<p><code>'+c.javaName+'</code> and <code>'+c.javaAddress+'</code> map to the named SQL columns in both the Application product and Profile product snapshot. These product values describe '+(kind==='holder'?'the registration holder':'the manufacturer')+'. Their presence does not establish an update to the owning establishment profile.</p>';
    refs=['amendmentAppFields','amendmentProfileFields','snapshot','profileKeys','productEndpoint'];
  }else if(index===1){
    body='<p>The draft combined form allows a name change, address change or both. Current values are read-only. Use this proposal exercise to inspect exactly which fields would differ.</p><label class="field">Change scope <select id="amendScope"><option value="both">Name and address</option><option value="name">Name only</option><option value="address">Address only</option></select></label><label class="field">Proposed name <input id="amendName" maxlength="150" value="'+escapeHtml(draft.name)+'"></label><label class="field">Proposed address <input id="amendAddress" maxlength="250" value="'+escapeHtml(draft.address)+'"></label><section id="amendComparison">'+amendmentComparison(kind)+'</section><p class="src">Values stay in this page’s memory while navigating these lessons. This is a proposed business-data comparison. The dedicated amendment request DTO has not been implemented.</p><p>The draft form asks for the application and a confirmation letter from the manufacturer or holder owner, and places the changed values at licence content items '+c.licenceItems+'. Its CamDigiKey input and combined-operation choices remain unconfirmed. Attachment ownership and required flags need an approved subservice contract.</p>';
    refs=['amendmentAppFields','amendmentProfileFields'];
  }else if(index===2){
    body='<p>The inspected Application branch registers only GDHT-RG-L for DR06 registration. Its ServiceCode comment leaves .01–.05 codes pending approval. A lookup for an unregistered amendment code reaches the factory’s Unsupported service type exception. Earlier DTO/service validation can reject a real request before this isolated factory boundary.</p><div class="transaction-box">ApplicationServiceImpl.saveApplication → ApplicationStrategyFactory.getStrategy → BaseException</div>'+bTable(['Row','At this isolated failure'],[['New amendment application/detail','No domain save reached'],['Historic registration Application product 802','No amendment write reached'],['Profile B snapshot 902','Existing holder/manufacturer values survive']])+'<p>A dedicated amendment DTO, strategy, target/owner checks, document rules, saved detail and approved-data builder are missing. Registration’s editable draft mapper does not establish permission to amend an approved result.</p>';
    refs=['renewCodeScope','renewAppFactory','dispatch','amendmentAppStrategy'];
  }else if(index===3){
    body='<p>Inspect a hypothetical received approval with an unregistered amendment service code. ProfileKafkaConsumer asks LicenseStrategyFactory for that code. The factory throws BaseException, then the consumer catches it, logs Unsupported service code and returns. The product mutation handler is never reached in this source path.</p><div class="transaction-box">Profile consumer → strategy factory → unsupported-code catch → return</div>'+bTable(['State','Result'],[['Existing B snapshot / registration / licence','Existing rows remain saved'],['New amendment snapshot / history','No dedicated amendment handler reached'],['Upstream Application APPROVED','If already committed, survives Profile handling']])+'<p>The available ReagentLicenseRegistrationStrategy maps approval data to ReagentRegisterHandler, which builds new registrations. A successful change-in-place or versioned amendment path requires its own verified strategy and mutation rules.</p>';
    refs=['consumer','renewProfileFactory','amendmentRegistrationStrategy','license','replay'];
  }else if(index===4){
    body='<p>Compare the proposal with the final state after the isolated unsupported-code boundary. The proposed values have no committed amendment path in the inspected code.</p>'+amendmentComparison(kind)+'<p>For future approved behaviour, the draft business form expects the new '+(kind==='holder'?'holder':'manufacturer')+' values on the licence. Whether Profile updates the existing snapshot, creates an operation/version snapshot, replaces a licence or preserves number/history must be confirmed and implemented. The master-data validity text is “ដូចវីញ្ញាបនបត្រដើម” (same as the original certificate).</p>';
    refs=['amendmentProfileFields','snapshot','renewCodeScope'];
  }else{
    body='<p>Both subservice master files omit Type of certificate. The parent’s exact value is Product Number. Before defining target cardinality or a request model, resolve the subservice classification and whether one request targets one or several existing registrations.</p>'+bTable(['Required decision / implementation','Current evidence'],[['Approved service code and operation','Subservice codes pending in constants'],['Product target and ownership','Dedicated selection contract missing'],['Name/address validation and conditional files','Combined form is draft / unconfirmed'],['Renewal + holder + manufacturer combination','Proposed by draft form; routing/fee semantics unresolved'],['Application saves, response and approval data','Dedicated amendment strategy missing'],['Profile row mutation, history and licence outcome','Dedicated amendment strategy/hooks missing'],['Duplicate approval and rollback','Must be verified for the eventual mutation path'],['CamDigiKey integration','Meaning of supplied party data unresolved']])+'<p>Master data records fee 300000, 20 days and validity matching the original certificate for each change service. These source values do not establish a runtime fee seed, workflow or eligibility rule.</p>';
    refs=['renewCodeScope','renewAppFactory','renewProfileFactory'];
  }
  const master=drServiceCatalog.find(s=>s.code===c.code);
  main.innerHTML='<div class="tag">Application + Profile / '+c.code+'</div><h1>'+c.title+'</h1><p class="lead">Inspect B’s saved fields, propose changes, and follow the verified routing boundaries. Dedicated DR06 amendment implementation is pending in the inspected branches.</p><div class="choices"><a class="btn light" href="#dr06-change/holder/0">Holder change</a><a class="btn light" href="#dr06-change/manufacturer/0">Manufacturer change</a></div><nav class="steps" aria-label="Amendment checkpoints">'+amendmentPhases.map((title,i)=>'<a href="#dr06-change/'+kind+'/'+i+'" '+(i===index?'aria-current="step"':'')+'>'+title+'</a>').join('')+'</nav><section class="panel check"><h2>'+amendmentPhases[index]+'</h2>'+body+'<details class="proof"><summary>Inspect real Application / Profile source</summary>'+sources(refs)+'</details></section><div class="choices check">'+(index?'<a class="btn light" href="#dr06-change/'+kind+'/'+(index-1)+'">Previous checkpoint</a>':'<a class="btn light" href="#services/'+c.code+'">Service explorer</a>')+(index<5?'<a class="btn" href="#dr06-change/'+kind+'/'+(index+1)+'">Next checkpoint</a>':'<a class="btn" href="#services/DR06">Explore DR06</a>')+'</div><details class="panel check"><summary>Business source and verification scope</summary><p>'+escapeHtml(master.master)+'</p><p>Shared draft form extraction · DR06.01/input-form/fields.md, sections Change MAH and Change manufacturer. The file marks the form draft and records copied-code issues. Application 3bd064ea and Profile c4dacbe were inspected. These lessons use fictional rows and isolated source-derived failures. A successful live amendment remains unverified.</p></details>';
  if(index===1){
    main.querySelector('#amendScope').value=draft.scope;
    const update=()=>{draft.scope=main.querySelector('#amendScope').value;draft.name=main.querySelector('#amendName').value;draft.address=main.querySelector('#amendAddress').value;main.querySelector('#amendName').disabled=draft.scope==='address';main.querySelector('#amendAddress').disabled=draft.scope==='name';main.querySelector('#amendComparison').innerHTML=amendmentComparison(kind);};
    main.querySelector('#amendScope').onchange=update;main.querySelector('#amendName').oninput=update;main.querySelector('#amendAddress').oninput=update;update();
  }
}
