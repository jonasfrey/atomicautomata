export function setupAssemblyUI(root, { record, snapshot, pause }) {
  const style = document.createElement('style');
  style.textContent = `
    html,body { margin:0; overflow:hidden; background:#101418; }
    .assembly-toolbar { position:fixed; top:12px; left:50%; transform:translateX(-50%); display:flex; gap:6px; padding:8px; background:#17212be8; border-radius:12px; z-index:10000; max-width:calc(100vw - 32px); flex-wrap:wrap; }
    .assembly-toolbar button,.assembly-header button { min-width:40px; min-height:40px; color:white; background:#293947; border:1px solid #526575; border-radius:7px; font-size:20px; cursor:pointer; }
    button:focus-visible { outline:3px solid #6bcfff; }
    .assembly-toolbar button[aria-pressed=true] { background:#226a8c; }
    .assembly-panel { position:fixed; width: min(720px,calc(100vw - 24px)); height:min(540px,calc(100vh - 100px)); min-width:min(260px,calc(100vw - 24px)); min-height:140px; resize:both; overflow:auto; background:#18212bf2; color:#eef3f7; border:1px solid #607486; border-radius:10px; box-sizing:border-box; }
    .assembly-panel[hidden] { display:none; }
    .assembly-header { position:sticky; top:0; display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:#273746; cursor:move; touch-action:none; z-index:2; }
    .assembly-content { padding:12px; overflow:auto; }
    .assembly-content pre { white-space:pre-wrap; }
    .assembly-resize { position:sticky; bottom:0; float:right; width:32px; height:32px; padding:0; cursor:nwse-resize; touch-action:none; background:#293947; color:white; border:0; }
  `;
  document.head.append(style);
  const toolbar = document.createElement('nav');
  toolbar.className = 'assembly-toolbar';
  toolbar.setAttribute('aria-label', 'Assembly controls');
  document.body.append(toolbar);
  function button(icon, label, action) {
    const el = document.createElement('button');
    el.type = 'button'; el.textContent = icon; el.title = label; el.setAttribute('aria-label', label);
    el.onclick = action; toolbar.append(el); return el;
  }
  const play = button('Ⅱ', 'Pause simulation', () => {
    setPaused(pause());
  });
  function setPaused(paused) {
    play.textContent = paused ? '▶' : 'Ⅱ';
    play.title = paused ? 'Resume simulation' : 'Pause simulation'; play.setAttribute('aria-label', play.title);
    play.setAttribute('aria-pressed', String(paused));
  }
  const recording = button('●', 'Record video', () => {
    try {
      const active = record(); recording.textContent = active ? '■' : '●';
      recording.title = active ? 'Stop recording and download' : 'Record video';
      recording.setAttribute('aria-label', recording.title); recording.setAttribute('aria-pressed', String(active));
    } catch (error) { alert(`Recording unavailable: ${error.message}`); }
  });
  button('▣', 'Save snapshot', snapshot);
  const fullscreen = button('⛶', 'Enter fullscreen', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
    catch (error) { alert(`Fullscreen unavailable: ${error.message}`); }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreen.title = document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen';
    fullscreen.setAttribute('aria-label', fullscreen.title);
    fullscreen.setAttribute('aria-pressed', String(!!document.fullscreenElement));
  });
  // Keep the existing reactive controls mounted so panel geometry survives edits.
  const controls = root.children[2];
  root.children[0].hidden = true; root.children[1].hidden = true;
  const channels = [...controls.children].slice(0, 3);
  const settings = document.createElement('div');
  [...controls.children].slice(3).forEach(el => settings.append(el));
  let layer = 10;
  const panels = [];
  const toggles = [];
  function constrain(panel) {
    panel.style.maxWidth = `${Math.max(1, innerWidth - 24)}px`;
    panel.style.maxHeight = `${Math.max(1, innerHeight - 24)}px`;
    const rect = panel.getBoundingClientRect();
    panel.style.left = `${Math.max(0, Math.min(rect.left, innerWidth - rect.width))}px`;
    panel.style.top = `${Math.max(0, Math.min(rect.top, innerHeight - Math.min(rect.height, 48)))}px`;
  }
  [...channels, settings].forEach((content, index) => {
    const label = ['Red channel', 'Green channel', 'Blue channel', 'Assembly settings'][index];
    const panel = document.createElement('section'); panel.className = 'assembly-panel';
    panel.setAttribute('aria-label', label); panel.hidden = true;
    panel.style.left = `${12 + index * 24}px`; panel.style.top = `${84 + index * 24}px`;
    const header = document.createElement('header'); header.className = 'assembly-header';
    const title = document.createElement('span'); title.textContent = label; header.append(title);
    const toggle = button(['🔴', '🟢', '🔵', '⚙'][index], label, () => {
      panel.hidden = !panel.hidden; toggle.setAttribute('aria-pressed', String(!panel.hidden));
      if (!panel.hidden) { panel.style.zIndex = ++layer; constrain(panel); }
    });
    toggle.setAttribute('aria-pressed', 'false');
    toggles.push(toggle);
    const close = document.createElement('button'); close.textContent = '×'; close.title = `Close ${label}`;
    close.setAttribute('aria-label', close.title); close.onclick = () => { panel.hidden = true; toggle.setAttribute('aria-pressed', 'false'); };
    header.append(close); content.classList.add('assembly-content'); panel.append(header, content); document.body.append(panel); panels.push(panel);
    const grip = document.createElement('button'); grip.className = 'assembly-resize'; grip.textContent = '◢';
    grip.title = `Resize ${label}`; grip.setAttribute('aria-label', grip.title); panel.append(grip);
    grip.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault(); const rect = panel.getBoundingClientRect();
      const x = event.clientX, y = event.clientY; grip.setPointerCapture(event.pointerId);
      const move = e => { panel.style.width = `${Math.max(260, rect.width + e.clientX - x)}px`; panel.style.height = `${Math.max(140, rect.height + e.clientY - y)}px`; constrain(panel); };
      const finish = () => { grip.removeEventListener('pointermove', move); grip.removeEventListener('pointerup', finish); grip.removeEventListener('pointercancel', finish); };
      grip.addEventListener('pointermove', move); grip.addEventListener('pointerup', finish); grip.addEventListener('pointercancel', finish);
    });
    grip.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault(); const rect = panel.getBoundingClientRect();
      panel.style.width = `${Math.max(260, rect.width + (event.key === 'ArrowRight' ? 20 : event.key === 'ArrowLeft' ? -20 : 0))}px`;
      panel.style.height = `${Math.max(140, rect.height + (event.key === 'ArrowDown' ? 20 : event.key === 'ArrowUp' ? -20 : 0))}px`; constrain(panel);
    });
    panel.addEventListener('pointerdown', () => { panel.style.zIndex = ++layer; });
    header.addEventListener('pointerdown', event => {
      if (event.target.closest('button,input,select') || event.button !== 0) return;
      event.preventDefault(); const rect = panel.getBoundingClientRect();
      const dx = event.clientX - rect.left, dy = event.clientY - rect.top;
      header.setPointerCapture(event.pointerId);
      const move = e => { panel.style.left = `${e.clientX - dx}px`; panel.style.top = `${e.clientY - dy}px`; constrain(panel); };
      const finish = () => { header.removeEventListener('pointermove', move); header.removeEventListener('pointerup', finish); header.removeEventListener('pointercancel', finish); };
      header.addEventListener('pointermove', move); header.addEventListener('pointerup', finish); header.addEventListener('pointercancel', finish);
    });
    new ResizeObserver(() => { if (!panel.hidden) constrain(panel); }).observe(panel);
  });
  addEventListener('resize', () => panels.forEach(panel => { if (!panel.hidden) constrain(panel); }));
  addEventListener('keydown', event => { if (event.key === 'Escape') panels.forEach((panel, index) => { panel.hidden = true; toggles[index].setAttribute('aria-pressed', 'false'); }); });
  // UI interaction must not paint into the microscope/simulation image.
  for (const el of [toolbar, ...panels]) {
    for (const type of ['mousedown', 'mousemove', 'pointerdown', 'pointermove']) el.addEventListener(type, event => event.stopPropagation());
  }
  return { setPaused };
}
