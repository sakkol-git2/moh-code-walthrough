// Paths are displayed as JSON, Java, or SQL according to the selected boundary.
const fieldTraces = {
  origin: {
    name:'Origin', question:'B’s certificate shows the wrong origin. What would you compare first?',
    answer:'Compare B’s stored Profile snapshot with B’s certificate_data.applicationType. If the snapshot is already wrong, work backward to B’s approval payload and saved Application row.',
    stops:[
      ['Request','reagent.products[1].application_type','IMPORT','The field belongs to Product B. A can still be LOCAL.',['dto','batch']],
      ['Java','ReagentProductRequestDto.applicationType','IMPORT','Jackson converts the snake_case JSON name. MapStruct copies the matching Java field into the product entity.',['dto','mapper','entity']],
      ['Application row','application_reagent_products.application_type','IMPORT','syncProducts saves the product entity. Its ID, origin and files stay on the same row.',['save','rows']],
      ['Approval payload','form_data.reagent.products[1].application_type','IMPORT','The event builder reads each saved product and serializes its own origin.',['payload','files']],
      ['Profile snapshot','reagent_product_license_details.application_type','IMPORT','toDetail copies the current product origin. Licence numbering asks that same product for its origin.',['snapshot','origin']],
      ['Certificate request','certificate_data.applicationType','IMPORT','Certificate data is built from the detail matched to the licence ID. The actual PDF depends on the template.',['certMatch','certData','template']]
    ]
  },
  identity: {
    name:'Product ID', question:'The products are reordered. Which value should you use to find B’s approved record?',
    answer:'Use source_application_id = 700 and source_product_id = 802 in Profile. Position describes order. registration_id then leads to the licence.',
    stops:[
      ['New request','reagent.products[1].id','Omitted','The server assigns a new product’s numeric ID. Updates send the saved ID back.',['identityDto']],
      ['Application row','application_reagent_products.id','802','The product primary key identifies B across draft edits. Position 1 can change after a reorder.',['save','rows']],
      ['Approval payload','form_data.reagent.products[1].id','802','Approval carries the saved numeric ID together with the product values.',['payload']],
      ['Profile snapshot','source_application_id + source_product_id','700 + 802','These source IDs preserve the cross-service association. The unique pair prevents a second snapshot for this source product.',['snapshot','profileKeys']],
      ['Registration','registration_id → license_id','902 → 502','Profile assigns new registration and licence IDs. The snapshot’s registration_id is a local foreign key.',['license','licenseJoin']],
      ['Certificate request','license_id','502','Certificate receives the licence ID in an ISSUE request and uses it to associate the document record.',['operation','certificateKey','initialCert']]
    ]
  },
  attachments: {
    name:'Product files',question:'A has an application form and B is missing its form. Where does submit fail?',
    answer:'At reagent.products[1].attachments. Each product’s own required documents are checked before the common checklist. The shared establishment decision does not replace a product form.',
    stops:[
      ['Request','reagent.products[1].attachments','sample-form-B','The sample ID represents an uploaded file. Only establishment_decision is shared at the application root.',['docs','attachmentDto']],
      ['Draft save','syncProducts → attachmentResolutionService.resolve','B’s resolved file references','The resolver checks uploaded files and copies their stored metadata. The strategy saves the resolved list on this product.',['save']],
      ['Application row','application_reagent_products.attachments','JSONB on row 802','This is a JSON value in the product row. Each entry references a file. This diagram does not model the upload-storage tables.',['rows']],
      ['Submit validation','validateProductAttachments(product, …)','B’s own required files','The strategy checks each product independently and records a product-specific error.',['validate','missing']],
      ['Approval payload','form_data.reagent.products[1].attachments','B’s document references','Shared root attachments travel separately from the product array.',['files','payload']],
      ['Profile snapshot','attachments / shared_attachments','B’s files / establishment decision','The mapper copies the product and shared lists into separate snapshot fields. They remain distinguishable on later reads.',['snapshot']]
    ]
  }
};
function fieldTrace(field, step){
  const trace=fieldTraces[field], [boundary,path,value,why,refs]=trace.stops[step];
  const actual=field==='origin'?state.origin:value;
  main.innerHTML='<div class="tag">DR06 / Field lineage</div><h1>Follow one value</h1><p class="lead">Select a field, then follow it across each boundary. These are fictional values tied to the inspected source revisions.</p><nav class="steps" aria-label="Fields">'+Object.entries(fieldTraces).map(([key,t])=>'<a href="#field/'+key+'/0" '+(key===field?'aria-current="page"':'')+'>'+t.name+'</a>').join('')+'</nav><nav class="steps" aria-label="Field boundaries">'+trace.stops.map(([label],i)=>'<a href="#field/'+field+'/'+i+'" '+(i===step?'aria-current="step"':'')+'>'+(i+1)+' · '+label+'</a>').join('')+'</nav><div class="lessonbody"><article class="panel"><div class="tag">'+boundary+' · Product B</div><h2>'+trace.name+'</h2>'+pre(path+'\n    ↓\n'+actual)+'<p>'+why+'</p><details class="proof"><summary>'+trace.question+'</summary><p>'+trace.answer+'</p></details></article><aside class="side"><h2>Find the implementation</h2><p>Read the incoming value, locate the copy or save, then check the outgoing value.</p>'+sources(refs)+'</aside></div><div class="actions"><a class="btn light" href="#field/'+field+'/'+Math.max(0,step-1)+'">← Previous</a><a class="btn" href="#field/'+field+'/'+((step+1)%trace.stops.length)+'">'+(step===trace.stops.length-1?'Trace again':'Next boundary →')+'</a></div>';
}
