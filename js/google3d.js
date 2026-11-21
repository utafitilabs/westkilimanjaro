const DEV = (() => { try { return new URLSearchParams(location.search).get('dev') === '1' || !document.title.startsWith('majira'); } catch (e) { return false; } })();   // design tools (edit, pos, cam) only on design pages or with ?dev=1
window.majiraWait3d = true;   // the logo loader waits for the first 3D view on this page
// Google Photorealistic 3D Tiles hero, rendered with CesiumJS. The tiles are streamed from Google (Map Tiles API) and never stored;
// Google's logo and data credits stay visible. The observer stands at a fixed point; drag turns the view, Ctrl + scroll zooms the lens.
(() => {
  const el = document.getElementById('g3d'); if (!el) return;
  const key = (document.querySelector('meta[name="g3d-key"]') || {}).content;
  const hero = el.closest('.hero');
  if (!key || !window.Cesium) { el.innerHTML = '<div class="g3d-missing">The photorealistic view needs a Google Map Tiles API key (google.key next to make.py).</div>'; return; }
  const C = window.Cesium, rad = C.Math.toRadians, deg = C.Math.toDegrees;
  let [lon, lat, alt, h0, t0, vfov0] = el.dataset.cam.split(',').map(Number);
  if (DEV) try { const p = (new URL(location.href).searchParams.get('pos') || '').split(',').map(Number); if (p.length === 3 && p.every(isFinite)) [lon, lat, alt] = p; } catch (e) {}   // experiments: &pos=lon,lat,height   // Google Earth notation: heading, tilt from vertical, vertical field of view
  C.GoogleMaps.defaultApiKey = key;
  const credits = document.createElement('div'); credits.className = 'g3d-credits'; hero.appendChild(credits);
  const viewer = new C.Viewer(el, {baseLayer: false, baseLayerPicker: false, geocoder: false, homeButton: false, sceneModePicker: false, navigationHelpButton: false,
    animation: false, timeline: false, fullscreenButton: false, infoBox: false, selectionIndicator: false, creditContainer: credits, requestRenderMode: true, maximumRenderTimeChange: Infinity, useBrowserRecommendedResolution: false, msaaSamples: 4, });
  const sc = viewer.scene; sc.screenSpaceCameraController.enableInputs = false;
  // re-measure whenever the map area changes size (phones: the map is only the top of the hero); in on-demand mode Cesium would not notice
  new ResizeObserver(() => { viewer.resize(); sc.requestRender(); try { look(goal || view); } catch (e) {} }).observe(el);   // look() also re-applies the fov for the new shape
  // Google's mesh alone; at screen resolution and the finer tile level its horizon is clean; no added haze (clear days show the mountain's foot clearly)
  sc.globe.show = false; sc.highDynamicRange = false;
  sc.skyBox.show = false; sc.sun.show = false; sc.moon.show = false;   // the star field showed through the daytime sky as false cloud   // Cesium's star field showed through the daytime sky as false cloud
  viewer.clock.currentTime = C.JulianDate.fromIso8601(new Date().toISOString().slice(0, 10) + 'T07:30:00Z');   // late morning light in East Africa
  C.createGooglePhotorealistic3DTileset().then(ts => { ts.maximumScreenSpaceError = 8; sc.primitives.add(ts); window.majiraWait3d = true; const done = () => window.dispatchEvent(new Event('majira:3d-ready')); if (ts.initialTilesLoaded) ts.initialTilesLoaded.addEventListener(done); else setTimeout(done, 3000); const ev = ts.loadProgress || ts.tileLoadProgressEvent; if (ev) ev.addEventListener(() => sc.requestRender()); sc.requestRender(); })
    .catch(e => { console.warn('google tiles', e); el.insertAdjacentHTML('beforeend', '<div class="g3d-missing">Google 3D Tiles could not be loaded (check the key, the Map Tiles API and billing).</div>'); });
  const home = C.Cartesian3.fromDegrees(lon, lat, alt); let pos = home;
  let view = null, goal = null, raf = 0, drag = null;
  const EDIT = (() => { try { return DEV && new URL(location.href).searchParams.get('edit') === '1'; } catch (e) { return false; } })();
  const urlCam = () => { if (!DEV) return null; try { const c = (new URL(location.href).searchParams.get('cam') || '').split(',').map(Number); return c.length === 3 && c.every(isFinite) ? {h: c[0], t: EDIT ? c[1] : t0, fov: c[2]} : null; } catch (e) { return null; } };
  const def = {h: h0, t: t0, fov: vfov0};
  const look = v => { const W = el.clientWidth, H = el.clientHeight; view = v;
    const tl = hero.querySelector('[data-tilt]'); if (tl) tl.textContent = `heading ${v.h.toFixed(1)}° · tilt ${v.t.toFixed(1)}° · lens ${v.fov.toFixed(1)}°`;
    const hf = Math.max(2 * Math.atan(Math.tan(rad(v.fov) / 2) * W / H), 2 * Math.atan(Math.tan(rad(v.fov) / 2) * 1.9));   // at least the horizontal angle of the desktop view, so narrow screens keep the wards in frame
    viewer.camera.frustum.fov = W >= H ? hf : 2 * Math.atan(Math.tan(hf / 2) * H / W);   // Cesium's fov runs along the wider side
    viewer.camera.setView({destination: pos, orientation: {heading: rad(v.h), pitch: rad(v.t - 90), roll: 0}});
    // the horizon on screen, for the aerial haze: the dip of the horizon at the observer's height, against the view axis
    const hgt = C.Cartographic.fromCartesian(pos).height, dip = Math.acos(6371000 / (6371000 + Math.max(0, hgt))), f = (H / 2) / Math.tan(rad(v.fov) / 2);
    hero.style.setProperty('--hz', (H / 2 - f * Math.tan(rad(90 - v.t) - dip)).toFixed(1) + 'px'); place(); sc.requestRender(); };
  // ward labels at each ward's main village
  const box = hero.querySelector('.glabels'), toWin = C.SceneTransforms.worldToWindowCoordinates || C.SceneTransforms.wgs84ToWindowCoordinates;
  box.innerHTML = Object.keys(WK.places).map(n => `<div class="wlbl" data-wl="${n}"><span>${n}</span><em></em><i></i></div>`).join('');
  box.addEventListener('click', ev => { const c = ev.target.closest('[data-wl]'); if (c) { select(c.dataset.wl); faceKibo(c.dataset.wl); } });
  // clicking a ward rotates the scene about Kibo: the observer keeps the default height, distance, tilt and lens, and swings round
  // the mountain until the ward lies between them and the summit, with Uhuru Peak square in the centre of the screen
  const KIBO = [37.3533, -3.0758], kmx = Math.cos(rad(lat)) * 111320, kmy = 110574;
  const R = Math.hypot((lon - KIBO[0]) * kmx, (lat - KIBO[1]) * kmy);   // the default observer's distance from Kibo
  const azOf = (x, y) => Math.atan2((x - KIBO[0]) * kmx, (y - KIBO[1]) * kmy);   // direction from Kibo, radians clockwise from north
  let az = azOf(lon, lat), spin = 0;
  const at = a => { const clon = KIBO[0] + R * Math.sin(a) / kmx, clat = KIBO[1] + R * Math.cos(a) / kmy;
    return {p: C.Cartesian3.fromDegrees(clon, clat, alt), h: (deg(a) + 180 + 360) % 360}; };
  const faceKibo = (n, instant) => { const q = WK.places[n]; if (!q) return; cancelAnimationFrame(spin); goal = null;
    const tilt = (view || def).t, a0 = az, a1 = a0 + ((azOf(q.lon, q.lat) - a0 + 3 * Math.PI) % (2 * Math.PI) - Math.PI), t0s = performance.now(), dur = instant ? 0 : 1800, fov = (view || def).fov;
    const frame = now => { const k = dur ? Math.min(1, (now - t0s) / dur) : 1, e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      az = a0 + (a1 - a0) * e; const c = at(az); pos = c.p; look({h: c.h, t: tilt, fov});
      if (k < 1) spin = requestAnimationFrame(frame);
      else try { const u = new URL(location.href); u.searchParams.set('at', q.slug); u.searchParams.set('cam', camStr()); history.replaceState(null, '', u); } catch (e) {} };
    instant ? frame(performance.now()) : (spin = requestAnimationFrame(frame)); };
  const place = () => { const W = el.clientWidth, H = el.clientHeight, cur = document.documentElement.dataset.w || '', fwd = viewer.camera.directionWC;
    const shown = [];
    for (const [n, q] of Object.entries(WK.places)) { const p = C.Cartesian3.fromDegrees(q.lon, q.lat, q.elev + 15), e = box.querySelector(`[data-wl="${n}"]`);
      const d = C.Cartesian3.subtract(p, viewer.camera.positionWC, new C.Cartesian3()), front = C.Cartesian3.dot(d, fwd) > 0, s = front && toWin(sc, p);
      const inside = s && s.x > 40 && s.x < W - 40 && s.y > H * 0.2 && s.y < H - 6 && !lblBlocked(hero, s.x, s.y); e.style.display = inside ? '' : 'none'; e.classList.toggle('on', n === window.place);
      if (inside) { e.style.left = s.x + 'px'; e.style.top = s.y + 'px'; shown.push(e); } }
    shown.sort((a, b) => parseFloat(a.style.left) - parseFloat(b.style.left)); const placed = [];
    const LH = 20;   // a label's height above its dot
    for (const e of shown) { const x = parseFloat(e.style.left), y = parseFloat(e.style.top), w = e.querySelector('span').offsetWidth + 10; let lift = 0;
      const hits = l => placed.some(p => Math.abs(p.x - x) < (p.w + w) / 2 && Math.abs((p.y - p.lift) - (y - l)) < LH);
      while (hits(lift) && lift < 200) lift += 22; e.style.setProperty('--lift', lift + 'px'); placed.push({x, y, w, lift}); } };
  window.edgeWards = place;
  // eased look-around, as in the MapLibre hero
  const step = () => { raf = 0; if (!goal) return; const k = 0.22, d = {h: goal.h - view.h, t: goal.t - view.t, fov: goal.fov - view.fov};
    const done = Math.abs(d.h) < 0.01 && Math.abs(d.t) < 0.01 && Math.abs(d.fov) < 0.01; look(done ? goal : {h: view.h + d.h * k, t: view.t + d.t * k, fov: view.fov + d.fov * k}); if (!done) raf = requestAnimationFrame(step); };
  const queue = v => { goal = v; if (!raf) raf = requestAnimationFrame(step); };
  const camStr = () => { const v = goal || view; return [v.h.toFixed(2), v.t.toFixed(2), v.fov.toFixed(2)].join(','); };
  const keep = () => { try { const u = new URL(location.href); u.searchParams.set('cam', camStr()); history.replaceState(null, '', u); } catch (e) {} };
  el.addEventListener('pointerdown', ev => { if (ev.button !== 0) return; drag = {x: ev.clientX, y: ev.clientY, v: Object.assign({}, goal || view)}; el.setPointerCapture(ev.pointerId); el.classList.add('dragging'); });
  el.addEventListener('pointermove', ev => { if (!drag) return; const k = drag.v.fov / el.clientHeight * 0.8;
    queue({h: drag.v.h - (ev.clientX - drag.x) * k, t: EDIT ? Math.max(45, Math.min(95, drag.v.t + (ev.clientY - drag.y) * k)) : drag.v.t, fov: drag.v.fov}); });   // the tilt is fixed unless ?edit=1
  const end = () => { if (!drag) return; drag = null; el.classList.remove('dragging'); keep(); };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  // a plain wheel scrolls the page: stop it before it reaches Cesium's canvas, which would swallow it; Ctrl + wheel zooms the view
  const tip = document.createElement('div'); tip.className = 'g3d-tip'; tip.setAttribute('role', 'status'); hero.appendChild(tip); let tipT = 0;
  const sw = () => document.documentElement.dataset.lang === 'sw';
  const showTip = (en, swt, ms) => { tip.textContent = sw() ? swt : en; tip.classList.add('on'); clearTimeout(tipT); tipT = setTimeout(() => tip.classList.remove('on'), ms); };
  if (matchMedia('(hover: hover)').matches) el.addEventListener('pointerenter', () => { let seen = false; try { seen = localStorage.getItem('wk-maphint') === '1'; localStorage.setItem('wk-maphint', '1'); } catch (e) {}
    if (!seen) showTip('Drag to look around · Ctrl + scroll to zoom', 'Buruta kuzungusha mwonekano · Ctrl + gurudumu kukuza', 4200); }, {once: true});
  let lastWheelTip = 0;
  el.addEventListener('wheel', ev => { if (!ev.ctrlKey && Date.now() - lastWheelTip > 4000) { lastWheelTip = Date.now(); showTip('Hold Ctrl and scroll to zoom', 'Shikilia Ctrl na tumia gurudumu kukuza', 1600); } }, {passive: true});
  el.addEventListener('wheel', ev => { if (!ev.ctrlKey) ev.stopPropagation(); }, {capture: true});
  let wt = 0; el.addEventListener('wheel', ev => { if (!ev.ctrlKey) return; ev.preventDefault(); const g = goal || view;
    queue({h: g.h, t: g.t, fov: Math.max(10, Math.min(60, g.fov * Math.exp(Math.max(-60, Math.min(60, ev.deltaY)) * 0.003)))}); clearTimeout(wt); wt = setTimeout(keep, 300); }, {passive: false});
  const vc = document.createElement('div'); vc.className = 'viewctl';
  vc.innerHTML = (EDIT ? '<span data-tilt></span><span>Drag to turn and tilt</span>' : '') + '<button data-vc="out" aria-label="Zoom out">−</button><button data-vc="in" aria-label="Zoom in">+</button><button data-vc="reset">Reset view</button><button data-vc="copy">Copy view</button>'; hero.appendChild(vc);
  vc.addEventListener('click', ev => { const b = ev.target.closest('[data-vc]'); if (!b) return;
    if (b.dataset.vc === 'in' || b.dataset.vc === 'out') { const g = goal || view; queue({h: g.h, t: g.t, fov: Math.max(10, Math.min(60, g.fov * (b.dataset.vc === 'in' ? 0.8 : 1.25)))}); clearTimeout(wt); wt = setTimeout(keep, 500); return; }
    if (b.dataset.vc === 'reset') { try { const u = new URL(location.href); u.searchParams.delete('cam'); u.searchParams.delete('at'); history.replaceState(null, '', u); } catch (e) {} goal = null; cancelAnimationFrame(spin); az = azOf(lon, lat); pos = home; look(def); }
    else { const s = 'cam=' + camStr(); (navigator.clipboard ? navigator.clipboard.writeText(s) : Promise.reject()).then(() => { b.textContent = '✓ ' + s; setTimeout(() => b.textContent = 'Copy view', 2500); }, () => { b.textContent = s; }); } });
  // weather states dim and cool the scene as the map hero does
  // weather as haze in the air over West Kilimanjaro, with Cesium's own fog: it thickens with distance on the tiles themselves and takes the
  // colour of the same atmosphere that draws the sky, so ground and sky meet without a border; none on a clear day
  const SKY = {sun: [0, 0, 0], cloud: [-0.5, -0.05, 0], rain: [-0.9, -0.06, 0], storm: [-0.95, -0.16, 0], night: [-0.9, -0.85, 0], ncloud: [-0.95, -0.9, 0], nrain: [-0.98, -0.92, 0], nstorm: [-1, -0.94, 0]};
  const FOG = {sun: 0, cloud: 1.2e-4, rain: 3.2e-4, storm: 4.2e-4, night: 1.0e-4, ncloud: 1.4e-4, nrain: 3.2e-4, nstorm: 4.2e-4};
  // rain curtains as seen from the plains: smooth grey veils with broad, slightly slanted bands of heavier and lighter rain, soft at the sides,
  // each hung at a real place between the cloud base and the ground, so it keeps its place and size as the view turns
  const CURTAINS = {storm: [[36.90, -3.00, 10000, 0.9], [37.04, -2.84, 9000, 0.8], [36.97, -3.18, 8000, 0.75], [37.12, -3.10, 6500, 0.65], [36.84, -2.76, 7500, 0.7],
                           [36.96, -2.72, 8000, 0.75], [37.06, -3.02, 11000, 0.9], [37.07, -2.95, 10000, 0.85],
                           [36.90, -3.11, 9000, 0.8], [36.79, -3.095, 4500, 0.7]]};   // lon, lat, width (m), density; then Sinya (two cells), Ndumeti, which gets much rain (Matadi and the ward centre), Ngabobo, and a near cell on the way to Ngabobo, ~15 km from the observer
  CURTAINS.nstorm = CURTAINS.storm;
  CURTAINS.rain = CURTAINS.storm.map(([lo, la, w, d]) => [lo, la, w, d * 0.9]);
  const NDUMETI = (lo, la) => Math.abs(lo - 37.065) < 0.02 && la > -3.04 && la < -2.93;
  setTimeout(() => { CURTAINS.ncloud = CURTAINS.cloud; CURTAINS.nrain = CURTAINS.rain; }, 0);
  CURTAINS.cloud = CURTAINS.storm.map(([lo, la, w, d]) => [lo, la, w, NDUMETI(lo, la) ? 0.5 : 0.95])
    .concat([[36.86, -2.92, 8000, 0.85], [37.00, -3.25, 9000, 0.85],
             [37.098, -2.817, 10000, 0.95], [37.073, -2.78, 10000, 0.9],    // left of Olmolog, as seen from the observer
             [37.011, -3.127, 8000, 0.95], [37.013, -3.096, 8000, 0.9]]);   // left of Gararagua; overcast: the same cloud masses, light grey and lower, no rain beneath; lighter over Ndumeti   // overcast: the same cloud masses, lighter, a little lower than rain clouds, with no rain beneath   // rain falls from the same cells, a touch lighter; storm adds the lightning and the darker fog
  // each ward's own sky: its live weather decides what is drawn around its main village (clear: nothing; partly cloudy: a light cloud
  // mass; overcast or fog: denser cloud; rain: curtains; thunderstorm: heavier curtains, with lightning there). WARD = {ward: {s, code}}
  let WARD = null;
  const OFF = [[0, 0], [0.032, -0.022], [-0.03, -0.026], [0.022, 0.03]];
  const wardCells = () => { const out = [];
    for (const [w, x] of Object.entries(WARD)) { const q = WK.places[w]; if (!q) continue; const s = x.s.replace(/^n(?=cloud|rain|storm)/, ''), c = x.code;
      const put = (n, wm, den, mode, storm) => OFF.slice(0, n).forEach(([dl, da], i) => out.push([q.lon + dl, q.lat + da, wm * (1 - i * 0.08), den * (1 - i * 0.06), mode, storm]));
      if (s === 'storm') put(3, 10000, 0.9, 'rain', true);
      else if (s === 'rain') put(c >= 61 && c !== 80 ? 3 : 2, 8500, c >= 63 ? 0.85 : 0.7, 'rain', false);
      else if (s === 'cloud') c === 3 || c >= 45 ? put(3, 9000, 0.85, 'cloud') : put(c >= 2 ? 2 : 1, 7000, c >= 2 ? 0.6 : 0.42, 'cloud'); }
    return out; };
  window.g3dWards = m => { WARD = m; drawCurtains(); sc.requestRender(); };
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const BASE = 8800;   // the cloud the rain falls from sits high in the sky as seen from the observer (m above sea level)
  const veil = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 512; const g = c.getContext('2d'), r = rng(11);
    const img = g.createImageData(256, 512), d = img.data, bands = Array.from({length: 360}, () => r());
    const smooth = x => { let a = 0; for (let k = -12; k <= 12; k++) a += bands[(x + k + 360) % 360]; return a / 25; };
    for (let y = 0; y < 512; y++) for (let x = 0; x < 256; x++) {
      const yf = y / 511, xf = x / 255, side = Math.exp(-Math.pow((xf - 0.5) / 0.36, 4)), hang = Math.min(1, yf / 0.1), foot = 1 - Math.pow(Math.max(0, yf - 0.95) / 0.05, 2);   // straight sides, even from the cloud to the ground
      const band = 0.8 + 0.4 * (smooth(Math.floor(x + yf * 6)) - 0.5) * 2, a = Math.max(0, side * hang * foot * band) * 0.85, i = (y * 256 + x) * 4;
      d[i] = 92; d[i + 1] = 100; d[i + 2] = 110; d[i + 3] = Math.round(a * 255); }
    g.putImageData(img, 0, 0); return c; })();
  const cloudTex = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 220; const g = c.getContext('2d'), r = rng(23); g.filter = 'blur(14px)';
    for (let k = 0; k < 26; k++) { const x = 150 + r() * 212, y = 80 + r() * 60, rad = 36 + r() * 46, gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const v = Math.round(58 + r() * 26); gr.addColorStop(0, `rgba(${v},${v + 6},${v + 14},.55)`); gr.addColorStop(1, `rgba(${v},${v + 6},${v + 14},0)`); g.fillStyle = gr; g.fillRect(0, 0, 512, 220); }
    return c; })();
  const cloudTexLight = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 220; const g = c.getContext('2d'), r = rng(23); g.filter = 'blur(14px)';
    for (let k = 0; k < 26; k++) { const x = 150 + r() * 212, y = 80 + r() * 60, rad = 36 + r() * 46, gr = g.createRadialGradient(x, y, 0, x, y, rad);
      const v = Math.round(150 + r() * 40); gr.addColorStop(0, `rgba(${v},${v + 4},${v + 10},.75)`); gr.addColorStop(1, `rgba(${v},${v + 4},${v + 10},0)`); g.fillStyle = gr; g.fillRect(0, 0, 512, 220); }
    return c; })();
  const cv = document.createElement('canvas'); cv.className = 'g3d-curtains'; el.after(cv);
  let wxState = 'cloud', flash = null;
  window.addEventListener('majira:flash', e => { flash = {x: e.detail.x, t: performance.now()};   // lightning lights up the rain near it for half a second
    const run = () => { drawCurtains(); if (performance.now() - flash.t < 520) requestAnimationFrame(run); }; requestAnimationFrame(run); });
  const drawCurtains = () => { const W = el.clientWidth, H = el.clientHeight, dpr = devicePixelRatio || 1; if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.filter = 'none'; g.globalAlpha = 1; g.clearRect(0, 0, W, H); 
    const NIGHTS = ['night', 'ncloud', 'nrain', 'nstorm'];   // every night has its stars; overcast nights put dark cloud masses in front of them
    if (NIGHTS.includes(wxState)) { const hz1 = parseFloat(hero.style.getPropertyValue('--hz')) || H * 0.4, r = rng(7); g.fillStyle = '#fff';
      for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * hz1 * 0.95, m = r(); g.globalAlpha = 0.25 + 0.65 * m * (1 - y / hz1 * 0.6); g.beginPath(); g.arc(x, y, m > 0.93 ? 1.3 : 0.7, 0, 7); g.fill(); }
      g.globalAlpha = 1; if (wxState === 'night' && !WARD) return;
      // overcast nights: dark cloud masses over most of the sky, stars only in the gaps; lightning lights the clouds near it
      const fl = flash ? Math.max(0, 1 - (performance.now() - flash.t) / 500) : 0, rc = rng(31), cover = WARD ? 0.85 * Object.values(WARD).filter(x => !/^(night|sun)$/.test(x.s)).length / Math.max(1, Object.keys(WARD).length) : {ncloud: 0.62, nrain: 0.78, nstorm: 0.85}[wxState], cw = W / 4.2;
      for (let row = 0; row < 5; row++) for (let x = -cw * 0.6 * (row % 2); x < W + cw; x += cw * 0.7) { const keep = rc() < cover, j = rc(), k = rc(); if (!keep) continue;
        const near = fl * Math.max(0, 1 - Math.abs((x + cw * 0.6) / W - (flash ? flash.x : 0)) / 0.18);
        g.filter = `brightness(${0.1 + 0.9 * near}) saturate(.3)`; g.globalAlpha = 0.97;
        g.drawImage(j < 0.5 ? cloudTex : cloudTexLight, x + (k - 0.5) * cw * 0.3, hz1 * (row * 0.2 - 0.06) + (j - 0.5) * cw * 0.1, cw * 1.3, cw * 0.5); }
      g.filter = 'none'; g.globalAlpha = 1; }
    const night = NIGHTS.includes(wxState), list = WARD ? wardCells() : (CURTAINS[wxState] || []).map(c => c.concat([/cloud/.test(wxState) ? 'cloud' : 'rain', /storm/.test(wxState)]));
    const stormX = []; window.stormX = stormX; if (!list.length) return;
    g.filter = night ? 'brightness(.1) saturate(.3)' : 'none';   // night clouds: darker than the clear night sky, not lit grey   // night clouds: darker than the clear night sky, not lit grey
    const hz = parseFloat(hero.style.getPropertyValue('--hz')) || H * 0.4;
    const fwd = viewer.camera.directionWC;
    for (const [lo_, la_, wm, den, mode, storm] of list) { const nightRain = night && mode === 'rain'; const bot = C.Cartesian3.fromDegrees(lo_, la_, 1100), top = C.Cartesian3.fromDegrees(lo_, la_, BASE);
      if (C.Cartesian3.dot(C.Cartesian3.subtract(bot, viewer.camera.positionWC, new C.Cartesian3()), fwd) <= 0) continue;
      const b = toWin(sc, bot), t = toWin(sc, top); if (!b || !t) continue;
      const wpx = (b.y - t.y) * wm / (BASE - 1100); if (wpx < 6) continue;
      // the cloud sits where the cell's top projects; a far cell would put it just above the skyline, so it is lifted into the high sky
      if (storm) stormX.push(b.x / W);
      if (mode === 'cloud') {                                         // overcast: the cloud alone, lower in the sky but always above the ground
        const lo = toWin(sc, C.Cartesian3.fromDegrees(lo_, la_, 6200)); const cyl = Math.min(lo ? lo.y : hz * 0.7, hz - wpx * 0.3);
        const ks = toWin(sc, C.Cartesian3.fromDegrees(37.3533, -3.0758, 5600)), x0 = b.x - wpx * 1.1, y0 = cyl - wpx * 0.42;
        const overSummit = ks && ks.x > x0 + wpx * 0.3 && ks.x < x0 + wpx * 1.9 && ks.y > y0 + wpx * 0.15 && ks.y < y0 + wpx * 0.8;
        const a0 = night ? Math.min(1, den * 1.5) : den;   // at night the cloud deck is heavier and nearly unbroken
        g.globalAlpha = overSummit ? a0 * 0.3 : a0; g.drawImage(night ? cloudTex : cloudTexLight, x0, y0, wpx * 2.2, wpx * 0.95);
        continue; }
      const cy = Math.min(t.y, hz * 0.42), vt = cy;
      // at night the curtains are almost invisible, except for a moment where lightning lights them up
      let fl = 0; if (nightRain && flash) { const age = (performance.now() - flash.t) / 500; if (age < 1) fl = (1 - age) * (1 - age) * Math.max(0, 1 - Math.abs(b.x / W - flash.x) / 0.16); }
      if (nightRain) g.filter = `brightness(${0.09 + 0.8 * fl}) saturate(.3)`;
      g.globalAlpha = nightRain ? Math.min(1, den * 1.2) : den * 0.8; g.drawImage(cloudTex, b.x - wpx * 1.1, cy - wpx * 0.42, wpx * 2.2, wpx * 0.95);   // the cloud it falls from, high in the sky
      g.globalAlpha = den * (nightRain ? 0.1 + 0.9 * fl : 1); g.drawImage(veil, b.x - wpx / 2, vt, wpx, b.y - vt); }                       // straight down to the ground
    g.globalAlpha = 1; };
  sc.postRender.addEventListener(() => { if (WARD || CURTAINS[wxState] || wxState === 'night') drawCurtains(); });
  const setWeather = state => { wxState = state; drawCurtains(); const d = FOG[state] ?? FOG.cloud; sc.fog.enabled = d > 0; sc.fog.density = d; sc.fog.minimumBrightness = ({night: 0.06, ncloud: 0.03, nrain: 0.02, nstorm: 0.015})[state] ?? 1.0;
    sc.skyBox.show = state === 'night'; sc.requestRender(); };
  window.g3dWeather = (w, state) => { const a = SKY[state] || SKY.cloud; sc.skyAtmosphere.show = true; sc.skyAtmosphere.saturationShift = a[0]; sc.skyAtmosphere.brightnessShift = a[1]; setWeather(state);
    const k = w.b < 0.5 ? 1 : w.b < 0.8 ? 0.6 : w.b < 0.88 ? 0.25 : 0.5; el.style.filter = `brightness(${1 - (1 - w.b) * k}) saturate(${1 + w.s * k}) contrast(${1 + w.c * k})`; };   // ground tint; night keeps its full darkening
  look(urlCam() || def); window.addEventListener('resize', () => look(view));
  try { const at = new URL(location.href).searchParams.get('at'), n = at && Object.keys(WK.places).find(k => WK.places[k].slug === at); if (n) { const c = urlCam(); faceKibo(n, true); if (c) look(Object.assign({}, view, {h: c.h, fov: c.fov})); } } catch (e) {}
  window.g3d = viewer;
  try { if (typeof renderWidget === 'function') renderWidget(); } catch (e) {}   // draw each ward's sky now that the map can
})();
