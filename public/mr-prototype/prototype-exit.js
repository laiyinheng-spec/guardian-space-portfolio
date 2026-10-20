// Loaded before either prototype module: Close/Escape must work even if its
// imports, models, WASM or camera permission are still pending.
(() => {
  const cleanups = new Set();
  const listeners = new AbortController();
  let exited = false;
  let navigating = false;
  let hadFullscreen = false;
  const button = document.getElementById('prototype-close');
  const shell = document.getElementById('prototype-exit-shell');
  const storageKey = 'guardian-prototype-return';
  let saved = null;
  try { saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null'); } catch { /* Direct standalone entry. */ }
  const fallback = new URL('../#mr-prototype-entry', location.href);
  let returnTo = fallback;
  try {
    const candidate = new URL(saved?.url || fallback.href);
    if (candidate.origin === location.origin && !candidate.pathname.includes('/mr-prototype/')) returnTo = candidate;
  } catch { /* Keep the explicit same-origin portfolio address. */ }

  function disposeObject(root) {
    const resources = new Set();
    root?.traverse?.(node => {
      if (node.geometry) resources.add(node.geometry);
      for (const material of [node.material].flat().filter(Boolean)) {
        resources.add(material);
        for (const value of Object.values(material)) if (value?.isTexture) resources.add(value);
      }
      if (node.skeleton) resources.add(node.skeleton);
    });
    resources.forEach(resource => resource.dispose?.());
  }
  function dispose() {
    if (exited) return;
    exited = true;
    listeners.abort();
    for (const cleanup of cleanups) { try { cleanup(); } catch (error) { console.warn('Prototype cleanup:', error); } }
    cleanups.clear();
  }
  function exit() {
    if (navigating) return;
    navigating = true;
    dispose();
    if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage({type:'guardian-prototype-exit',token:saved?.token},location.origin);
        window.opener.focus();
        window.close();
      } catch { /* Standalone/same-tab fallback below. */ }
    }
    // If closing this tab is prohibited, return explicitly without relying on history.
    setTimeout(()=>location.replace(returnTo.href),120);
  }
  window.guardianPrototypeLifecycle = {
    get exited() { return exited; }, dispose, exit, disposeObject,
    register(cleanup) { if (exited) cleanup(); else cleanups.add(cleanup); },
  };
  function raiseClose() {
    // A nonmodal top-layer popover keeps the button above a fullscreen canvas,
    // without taking keyboard focus or blocking the original scene controls.
    if (shell.showPopover) { if(shell.matches(':popover-open')) shell.hidePopover(); shell.showPopover(); }
    else if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
  }
  button.addEventListener('click',exit,{signal:listeners.signal});
  window.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();exit();}
  },{capture:true,signal:listeners.signal});
  document.addEventListener('fullscreenchange',()=>{
    if (document.fullscreenElement) { hadFullscreen=true; raiseClose(); }
    else if(hadFullscreen) exit();
  },{signal:listeners.signal});
  window.addEventListener('pagehide',dispose,{once:true,signal:listeners.signal});
  raiseClose();
})();
