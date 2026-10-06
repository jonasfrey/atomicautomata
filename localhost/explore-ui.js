export function setupExplorer({ preset, restart, speed, resume, snapshot }) {
  const style = document.createElement('style');
  style.textContent = `
    .explorer { position:fixed; bottom:16px; left:50%; transform:translateX(-50%); z-index:9000; width:min(620px,calc(100vw - 32px)); box-sizing:border-box; padding:12px; border-radius:14px; background:#17212bf2; color:#eef3f7; font:15px system-ui; box-shadow:0 6px 30px #0006; }
    .explorer-row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .explorer button { cursor:pointer; padding:9px 12px; border:1px solid #607486; border-radius:8px; background:#293947; color:white; font:inherit; }
    .explorer button[aria-pressed=true] { background:#226a8c; border-color:#6bcfff; }
    .explorer p { margin:8px 0; line-height:1.4; }
    .explorer input { flex:1; min-width:80px; width:auto; }
    .explorer details { margin-top:8px; }
    .explorer summary { cursor:pointer; }
    .explorer [hidden] { display:none; }
    .explorer-status { color:#9adfff; min-height:1.4em; }
    @media(max-height:500px) { .explorer { bottom:4px; padding:8px; max-height:45vh; overflow:auto; } }
  `;
  document.head.append(style);
  const box = document.createElement('section'); box.className = 'explorer'; box.setAttribute('aria-label', 'Explore automata');
  box.innerHTML = `
    <div class="explorer-row"><strong>Try a pattern</strong><button type="button" data-action="collapse" aria-expanded="true">⌄</button></div>
    <div data-body>
      <p>Pick a look. Drag on the image to add color and watch it evolve.</p>
      <div class="explorer-row" data-presets></div>
      <p class="explorer-status" role="status" aria-live="polite"></p>
      <div class="explorer-row"><button type="button" data-action="restart" title="Start the current pattern with fresh pixels">↻ New seed</button><label for="explorer-speed">Speed</label><input id="explorer-speed" type="range" min="1" max="60" value="30"><output for="explorer-speed">30 fps</output></div>
      <details><summary>How to use · Try a guided experiment</summary>
        <p>Each pixel changes according to its neighbors. Presets change those rules. Add color by dragging on the image; pause to inspect it, or save a snapshot. The colored toolbar buttons open fine adjustments.</p>
        <button type="button" data-action="learn">▶ Show me</button>
        <p data-lesson hidden></p><button type="button" data-action="next" hidden>Next experiment →</button>
      </details>
    </div>`;
  document.body.append(box);
  const status = box.querySelector('[role=status]');
  const lesson = box.querySelector('[data-lesson]');
  const next = box.querySelector('[data-action=next]');
  let stage = -1, current = 'waves';
  const presets = [
    ['waves', '≈ Waves', 'Ripples grow from neighboring pixels.'],
    ['worms', '〰 Worms', 'Small marks grow into winding textures.'],
    ['pulse', '✦ Pulse', 'Color flips as neighboring pixels cross a threshold.'],
  ];
  const buttons = [];
  function choose(id) {
    current = id; preset(id); resume();
    buttons.forEach((el, index) => el.setAttribute('aria-pressed', String(presets[index][0] === id)));
    status.textContent = presets.find(item => item[0] === id)[2];
    if (stage === 0) advance(1);
  }
  presets.forEach(([id, label, description]) => {
    const el = document.createElement('button'); el.type = 'button'; el.textContent = label;
    el.title = description; el.setAttribute('aria-pressed', 'false'); el.onclick = () => choose(id);
    box.querySelector('[data-presets]').append(el); buttons.push(el);
  });
  const steps = [
    '1 / 3 · Pick Waves, Worms, or Pulse above. The same image follows a different rule.',
    '2 / 3 · Drag across the image outside this card. You are adding the pixels that feed the pattern.',
    '3 / 3 · Move Speed to compare slow and fast evolution. Save your experiment when you like the result.',
  ];
  function advance(value) {
    stage = value; lesson.hidden = false; lesson.textContent = steps[stage];
    next.hidden = false; next.textContent = stage === 2 ? '▣ Save my experiment' : 'Next experiment →';
  }
  box.querySelector('[data-action=learn]').onclick = () => advance(0);
  next.onclick = () => {
    if (stage < 2) advance(stage + 1);
    else { snapshot(); status.textContent = 'Snapshot saved. Try another pattern or open a color channel to experiment further.'; next.hidden = true; }
  };
  addEventListener('pointerdown', event => {
    if (stage === 1 && !event.target.closest('.explorer,.assembly-toolbar,.assembly-panel')) {
      resume(); status.textContent = 'You added color. Keep dragging to grow your pattern.'; advance(2);
    }
  });
  box.querySelector('[data-action=restart]').onclick = () => { restart(); resume(); status.textContent = `Fresh seed · ${presets.find(item => item[0] === current)[1].slice(2)}`; };
  box.querySelector('input').oninput = event => { speed(Number(event.target.value)); box.querySelector('output').textContent = `${event.target.value} fps`; };
  box.querySelector('[data-action=collapse]').onclick = event => {
    const body = box.querySelector('[data-body]'); body.hidden = !body.hidden;
    event.target.textContent = body.hidden ? '⌃' : '⌄'; event.target.setAttribute('aria-expanded', String(!body.hidden));
  };
  box.querySelector('[data-action=collapse]').setAttribute('aria-label', 'Toggle exploration controls');
  for (const type of ['pointerdown', 'pointermove', 'mousedown', 'mousemove']) box.addEventListener(type, event => event.stopPropagation());
  choose('waves');
}
