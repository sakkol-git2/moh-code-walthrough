// The IDs match the fictional records in the two walkthroughs.
function database(product) {
  const isB = product === 'B';
  const id = isB ? 802 : 801;
  const registration = isB ? 902 : 901;
  const licence = isB ? 502 : 501;
  const origin = isB ? state.origin : 'LOCAL';
  const er = renderER(product, id, registration, licence, origin);
  const panels = [
    ['Application database','One request, several products',
      'applications.id = 700\n├── application_reagent_details.application_id = 700\n│   └── prerequisite_profile_id = 42\n└── application_reagent_products.application_id = 700\n    ├── id = 801   Product A   LOCAL\n    └── id = 802   Product B   '+state.origin,
      'The detail row holds the shared profile selection. Its application_id is both its primary key and a foreign key, so the application can have at most one such row. Each product has a separate primary key. A draft can have zero products. Submit requires at least one. The product row holds its own origin and files. Only establishment_decision belongs in applications.attachments.',
      ['detail','rows','fk']],
    ['Profile database','One approved product, one registration and licence',
      'reagent_product_license_details\n  source_application_id = 700\n  source_product_id = '+id+'   ← ID from the approval event\n  registration_id = '+registration+'     → regulatory_registrations.registration_id\n  profile_id = 42           → profiles.id\n\nregulatory_registrations.registration_id = '+registration+'\n  license_id = '+licence+'          → licenses.id',
      'Approval creates a snapshot of Product '+product+' with origin '+origin+'. The registration ID is both the snapshot’s primary key and a local foreign key. The snapshot keeps product files and shared files separately. The intended example assumes both products resolve to existing profile 42. The inspected resolver does not enforce that selection. The unique pair (source_application_id, source_product_id) prevents a second snapshot for the same source product.',
      ['profileKeys','licenseJoin','snapshot']],
    ['Certificate database','Find the document for a licence',
      'Profile: licenses.id = '+licence+'\n        ↓ licence ID carried by the ISSUE message\nCertificate: certificates.license_id = '+licence,
      'Certificate owns the document record. Its licence ID comes from Profile through a message. For this example, issuance can create a PDF for Product '+product+' once a matching active template is available and processing succeeds. A licence can already exist while the PDF is still pending.',
      ['operation','certificateKey','pdfRecord']]
  ];
  main.innerHTML='<div class="tag">DR06 / Database relationships</div><h1>Follow the IDs</h1><p class="lead">A primary key (PK) identifies one row. A foreign key (FK) requires a matching parent row. Between services, follow the ID copied into a message and look it up in the receiving database.</p>'+
    '<nav class="steps" aria-label="Product trace">'+['A','B'].map(letter=>'<a href="#database/'+letter+'" '+(letter===product?'aria-current="page"':'')+'>Trace Product '+letter+'</a>').join('')+'</nav>'+
    er.html+panels.map(([label,title,diagram,description,keys])=>'<section class="panel check"><div class="tag">'+label+'</div><h2>'+title+'</h2>'+pre(diagram)+'<p>'+description+'</p><details class="proof"><summary>Show source evidence</summary>'+sources(keys)+'</details></section>').join('')+
    '<section class="panel check"><h2>Try tracing the rows</h2><p>In the Application database, find Product '+product+' under application 700. Carry those two IDs to Profile. Then use the returned licence ID in Certificate. These are read-only examples using fictional IDs.</p>'+
    pre('-- Application database\nSELECT id, application_type FROM application_reagent_products\nWHERE application_id = 700 AND id = '+id+';\n\n-- Profile database\nSELECT d.profile_id, d.registration_id, r.license_id\nFROM reagent_product_license_details d\nJOIN regulatory_registrations r ON r.registration_id = d.registration_id\nWHERE d.source_application_id = 700 AND d.source_product_id = '+id+';\n\n-- Certificate database\nSELECT license_id, template_type FROM certificates\nWHERE license_id = '+licence+';')+
    '<details class="proof"><summary>Why would searching by profile 42 alone be insufficient?</summary><p>A and B both belong to profile 42. The pair (700, '+id+') selects the approved snapshot for Product '+product+'. Its registration leads to licence '+licence+'.</p></details></section>';
  er.attach();
}
