const workbenchStages = [
  ['Profile','Existing establishment','Select prerequisite profile 42 before creating the draft. The inherited approval resolver can choose another profile.'],
  ['Application','Draft write','The parent application starts the draft.'],
  ['Application','Draft write','The shared DR06 detail records the profile selection.'],
  ['Application','Draft write','A separate row stores Product B’s values.'],
  ['Application / Payment','Submit and payment','This combined stage is expanded in the Payment timeline.'],
  ['Review / Application','Review decision','The Review timeline expands staff actions and the decision event.'],
  ['Application → Profile','Kafka approval','Product ID 802 is carried to Profile with its own origin and files.'],
  ['Profile','Registration write','The registration save cascades to its attached licence.'],
  ['Profile','Snapshot write','The source pair (700, 802) associates the snapshot with B.'],
  ['Profile → Certificate','Kafka ISSUE','The request now identifies licence 502 and profile 42.'],
  ['Certificate','Initial document row','This stage assumes an active matching template.'],
  ['Certificate','PDF metadata write','This stage assumes rendering and upload succeed.']
];
function workbench(initialStep) {
  const update = (step, frame) => {
    const [service,phase,note]=workbenchStages[step];
    const lanes=['Application','Payment','Review','Profile','Certificate'];
    const active=service.split(/\s*[/→]\s*/);
    main.querySelector('#workbenchStatus').innerHTML='<div class="tag">'+phase+'</div><p>'+note+'</p><div class="workbench-lanes">'+lanes.map(name=>'<span class="'+(active.includes(name)?'active':'')+'">'+name+'</span>').join('')+'</div>';
    const navigation=main.querySelector('#workbenchJump');
    navigation.value=String(step);
    history.replaceState(null, '', '#workbench/'+step);
    main.querySelector('#workbenchSummary').textContent='Current action · '+frame.title;
  };
  const er=renderER('B',802,902,502,state.origin,{step:initialStep,onStep:update});
  main.innerHTML='<div class="tag">DR06 / Connected workbench</div><h1>One action, its rows and code</h1><p class="lead">Follow B’s successful journey. Each step selects the service, reveals the rows and shows the responsible Java method. The row sequence illustrates business actions within their transaction boundaries.</p><label class="field">Jump to a stage <select id="workbenchJump">'+workbenchStages.map(([,phase],i)=>'<option value="'+i+'">'+(i+1)+' · '+phase+'</option>').join('')+'</select></label><section class="side" aria-live="polite" id="workbenchStatus"></section><p id="workbenchSummary" class="check"></p><div class="workbench">'+er.html+'</div><p class="check">Expand the detailed <a href="#payment-timeline">payment timeline</a>, <a href="#review-timeline/0">review timeline</a> or <a href="#transactions/0">transaction boundaries</a> when you want to inspect one stage more closely.</p>';
  er.attach();
  main.querySelector('#workbenchJump').onchange=event=>{
    location.hash='workbench/'+event.target.value;
  };
}
