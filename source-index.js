function sourceIndex(selected, coreOnly = false) {
  const keys=Object.keys(evidence).filter(key=>!coreOnly || ['MOH-Application','MOH-Profile'].includes(evidence[key].repo));
  main.innerHTML='<div class="tag">DR06 / Source index</div><h1>Find the code behind the view</h1><p class="lead">Search the inspected excerpts by method, table, field or repository. Every result includes its recorded commit and original line numbers. This index searches the guide’s excerpts.</p><label class="field" for="sourceSearch">Search source excerpts</label><input type="search" id="sourceSearch" placeholder="Try application_type, syncProducts or tryInsert" class="source-search"><p id="sourceCount" class="check" role="status"></p><div class="source-layout"><nav id="sourceResults" aria-label="Source results"></nav><section id="selectedSource" class="panel"></section></div>';
  const input=main.querySelector('#sourceSearch');
  const results=main.querySelector('#sourceResults');
  const detail=main.querySelector('#selectedSource');
  function show(key) {
    const s=evidence[key];
    const checkout=s.repo==='MOH-Application'?'.worktrees/dr06-application':s.repo==='MOH-Profile'?'.worktrees/dr06-profile':s.repo;
    detail.innerHTML='<div class="tag">'+s.repo+' · '+s.rev+'</div><h2>'+escapeHtml(s.path.split('/').pop())+'</h2><p>Open this file in the recorded checkout and go to line '+s.line+'. Revisions and paths can differ from another branch.</p><label class="field" for="sourcePath">Local file path</label><input id="sourcePath" class="source-search" readonly value="'+escapeHtml('/Users/apple/Documents/TSC-MOH/'+checkout+'/'+s.path)+'">'+sources([key]);
    detail.querySelector('details').open=true;
    detail.querySelector('#sourcePath').onfocus=event=>event.target.select();
    results.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',button.dataset.source===key));
  }
  function search() {
    const query=input.value.trim().toLowerCase();
    const matches=keys.filter(key=>{
      const s=evidence[key];
      return (s.repo+' '+s.path+' '+s.code).toLowerCase().includes(query);
    });
    main.querySelector('#sourceCount').textContent=matches.length+' matching excerpts';
    results.innerHTML=matches.map(key=>{
      const s=evidence[key];
      return '<button class="source-result" data-source="'+key+'" aria-pressed="'+(key===selected)+'"><strong>'+escapeHtml(s.path.split('/').pop())+'</strong><span>'+s.repo+' · line '+s.line+'</span></button>';
    }).join('') || '<p>No excerpt matches. Try a field name or a shorter method name.</p>';
    results.querySelectorAll('button').forEach(button=>button.onclick=()=>{
      selected=button.dataset.source;
      history.replaceState(null,'', (coreOnly?'#core-source/':'#source/')+selected);
      show(selected);
    });
  }
  input.oninput=search;
  search();
  show(selected||'save');
}
