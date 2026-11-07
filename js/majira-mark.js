/* Majira mark: drawn by the same code as the brand guide (majira-brand.html), for the site header, the loading lap and the favicon. */
(() => {

const F = '#1d5a38', R = '#1d91c0', PAPER = '#e3ece6', RD = '#5fb6e0';
const EQS = new URLSearchParams(location.search).get('e'), EA = 17;   // the mark: seen from 17° above the orbit plane
const OBL = 23.5 * Math.PI / 180; let AXIS = EA === 'axis', E = (AXIS ? 90 : EA) * Math.PI / 180;   // the viewing angle above the orbit plane (see 'Orbit shape')
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const doy = d => Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 864e5);
const dateOf = n => { const d = new Date(Date.UTC(2026, 0, n)); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]; };
const wet = n => (n >= 60 && n <= 151) || n >= 274;              // March to May, October to December

// the camera: an elevation E above the orbit plane, or (AXIS) along the Earth's own axis, above the North Pole, where the equator, the
// tropics and the polar caps become concentric circles and the terminator sweeps across them through the year
const AZQ = new URLSearchParams(location.search).get('az'), AZ = 37.5 * Math.PI / 180;   // the camera's place around the orbit: the Earth passes behind the Sun in early February, the quietest weeks
const cam = () => { if (AXIS) return {C: [Math.sin(OBL), 0, Math.cos(OBL)], U: [Math.cos(OBL), 0, -Math.sin(OBL)], V: [0, 1, 0]};
  const c = Math.cos(AZ), s = Math.sin(AZ), ce = Math.cos(E), se = Math.sin(E);
  return {C: [-s * ce, -c * ce, se], U: [c, -s, 0], V: [s * se, c * se, ce]}; };
const orbitRx = () => AXIS ? 23 * Math.cos(OBL) : 23, orbitRy = () => AXIS ? 23 : 23 * Math.sin(E);   // the projected orbit's half-axes
const proj = (X, Y, Z) => { const {U, V} = cam(); return [X * U[0] + Y * U[1] + Z * U[2], -(X * V[0] + Y * V[1] + Z * V[2])]; };

// the half facing screen direction s (deg): SVG arc sweep 1, verified
const litHalf = (x, y, r, s, fill) => { const a0 = (s - 90) * Math.PI / 180, a1 = (s + 90) * Math.PI / 180;
  return `<path d="M${(x + r * Math.cos(a0)).toFixed(2)} ${(y + r * Math.sin(a0)).toFixed(2)}A${r} ${r} 0 0 1 ${(x + r * Math.cos(a1)).toFixed(2)} ${(y + r * Math.sin(a1)).toFixed(2)}z" fill="${fill}"/>`; };
// night side in a deep tone, day side in a bright tone of the same colour, the terminator an ellipse for the true phase
const phase = (x, y, r, s, k, day, night) => {
  // the lit part as ONE path (sunlit limb + terminator), over one night disc: no stacked shapes, so no flickering seams at the terminator
  const a0 = (s - 90) * Math.PI / 180, a1 = (s + 90) * Math.PI / 180, e = Math.max(Math.abs(2 * k - 1) * r, .001);
  const p0 = [x + r * Math.cos(a0), y + r * Math.sin(a0)], p1 = [x + r * Math.cos(a1), y + r * Math.sin(a1)];
  const back = k >= .5 ? 1 : 0;   // gibbous: the terminator bulges into the night side; crescent: into the day side
  const d = `M${p0[0].toFixed(3)} ${p0[1].toFixed(3)}A${r} ${r} 0 0 1 ${p1[0].toFixed(3)} ${p1[1].toFixed(3)}A${e.toFixed(3)} ${r} ${s.toFixed(2)} 0 ${back} ${p0[0].toFixed(3)} ${p0[1].toFixed(3)}z`;
  return `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${(r - .12).toFixed(3)}" fill="${night}"/><path d="${d}" fill="${day}"/>`; };
const TONES = { light: {wet: ['#5ab8e8', '#0d4f70'], dry: ['#d9a95a', '#6b4a17']},   // rainy season blue, dry season ochre (climate-map convention)
                dark:  {wet: ['#8fd3f3', '#1d5f80'], dry: ['#e8c07e', '#7a5520']},
                tile:  {wet: ['#a8def7', '#3a7fa8'], dry: ['#f2d29b', '#9a6a2a']} };
const ORBIT = {light: '#9aa3a0', dark: '#e3ece6', tile: '#ffffff'};
let SUN = '#f0b429';
// the logo's colours: one colour, no yellow Sun. On light backgrounds forest only; on dark or forest backgrounds white
let MONO = true;
const MONO_T = {light: ['#8fbf9f', '#1d5a38'], dark: ['#ffffff', '#5c5c5c'], tile: ['#ffffff', '#4f8a66']};   // dark = the black-and-white version
const MONO_C = {light: '#1d5a38', dark: '#ffffff', tile: '#ffffff'};   // Sun and orbit

let SCHEME = null;   // final page uses FINAL below
// colour schemes to compare: [day, night] tones for the rainy and the dry season, on light and on the forest app tile, plus the orbit colour


const DQ = new URLSearchParams(location.search), SRQ = '11', EARTH_TRUE = false, LINES = true;   // open decisions: ?sr= Sun size, ?lines=0 plain Earth   // the Sun's radius: 11 (about half the ring's width)
window.SUN_R = +SRQ;
const RING3D = true, SUNPOP = true;   // the orbit as a ring in depth; the Sun crossing it, visible above and below
const RQ = new URLSearchParams(location.search).get('r'), ROLL = -28;   // the picture turned so the ring falls to the right
const PALX = window.MAJIRA_PAL;   // palette preview: forest and white map to the palette's ink and paper
if (PALX) { MONO_T.light = [PALX.day, PALX.ink]; MONO_C.light = PALX.ink; MONO_T.tile = [PALX.bright, PALX.nightSide]; MONO_C.tile = PALX.bright; MONO_T.dark = ['#ffffff', '#5c5c5c']; }
const palBg = bg => !PALX ? bg : bg === '#ffffff' ? PALX.paper : bg === F ? PALX.ink : bg;
function mark(n, k, bg, small = false) { bg = palBg(bg); return ROLL ? `<g transform="rotate(${-ROLL} 30 31)">${markRaw(n, k, bg, small)}</g>` : markRaw(n, k, bg, small); }
function markRaw(n, k, bg, small = false) {
  const D = 23, cx = 30, cy = 31, r = EARTH_TRUE ? (window.SUN_R || 8.9) / 109 : RING3D ? ((window.EARTH_R || 5.5) + (small ? 0.7 : 0)) : (small ? 6.6 : 5.8), sun = RING3D ? (small ? 7.6 : 7.2) : (small ? 5 : 4.6), sw = small ? 3.2 : 2.4;   // 3D ring: the Sun clearly the larger body
  const th = (90 + (n - 79) * 360 / 365.25) * Math.PI / 180;     // as NASA/NOAA draw it: March equinox at the back, June solstice LEFT, September front, December right; counter-clockwise seen from the north
  const X = D * Math.cos(th), Y = D * Math.sin(th);
  const [sx, sy] = proj(X, Y, 0), x = cx + sx, y = cy + sy;
  const A = [Math.sin(OBL), 0, Math.cos(OBL)];                    // axis: north pole tipped towards +X, i.e. towards the Sun at the June solstice (left-hand point): it leans right
  const [ax, ay] = proj(...A), L = Math.hypot(ax, ay);
  const toSun = [-X / D, -Y / D, 0], toView = cam().C;
  const frac = (1 + toSun[0] * toView[0] + toSun[1] * toView[1] + toSun[2] * toView[2]) / 2;
  const sdir = Math.atan2(-sy, -sx) * 180 / Math.PI, mode = k === F ? 'light' : k === PAPER ? 'dark' : 'tile', [day, night] = MONO ? MONO_T[mode] : ((SCHEME && SCHEME[mode]) || TONES[mode])[wet(n) ? 'wet' : 'dry'];
  // the tilt, as in the reference diagram: the equator and both tropics drawn on the globe, computed in 3D round the tilted axis
  // (the axis keeps one direction in space all year) and projected for the viewing angle; only the half facing the viewer is drawn
  const id = 'e' + (++uid), U = [Math.cos(OBL), 0, -Math.sin(OBL)], V = [0, 1, 0], view = cam().C;
  let lat = '';
  for (const [phi, w] of [[0, 1], [23.44, 1], [-23.44, 1]]) {   // the equator and the tropics of Cancer and Capricorn, one thin even line each
    const ph = phi * Math.PI / 180; let d = '', pen = false;
    for (let i = 0; i <= 120; i++) { const l = i / 120 * 2 * Math.PI;
      const P = [0, 1, 2].map(j => Math.cos(ph) * Math.cos(l) * U[j] + Math.cos(ph) * Math.sin(l) * V[j] + Math.sin(ph) * A[j]);
      const vis = P[0] * view[0] + P[1] * view[1] + P[2] * view[2] > 0; const [qx, qy] = proj(...P);
      if (vis) { d += (pen ? 'L' : 'M') + (x + qx * r).toFixed(2) + ' ' + (y + qy * r).toFixed(2); pen = true; } else pen = false; }
    lat += `<path d="${d}" fill="none" stroke="${day === '#ffffff' ? bg : '#ffffff'}" stroke-opacity="${day === '#ffffff' ? .9 : .75}" stroke-width="${(sw * .11 * w).toFixed(2)}" stroke-linecap="round"${phi ? ` stroke-dasharray="${(r * .08).toFixed(2)} ${(r * .08).toFixed(2)}"` : ''}/>`;   // equator solid, tropics dashed, as on a school globe
  }
  // pole tips: two short stubs along the tilted axis, just poking out of the globe; the north one a little longer, so north and south can be told apart
  const ux = ax / L, uy = ay / L, tip = (k1, k2, w) => `<path d="M${(x + ux * r * k1).toFixed(2)} ${(y + uy * r * k1).toFixed(2)}L${(x + ux * r * k2).toFixed(2)} ${(y + uy * r * k2).toFixed(2)}" stroke="${night}" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
  // poles as notches: small round bites out of the globe's edge where the tilted axis meets it; nothing sticks out (north the larger bite)
  const notch = (sgn, k) => `<circle cx="${(x + sgn * ux * r).toFixed(2)}" cy="${(y + sgn * uy * r).toFixed(2)}" r="${(r * k).toFixed(2)}" fill="${bg}"/>`;
  const poles = '', notches = showPoles ? poleMark(poleStyle, {x, y, r, ux, uy, ax, ay, A, bg, day, night, sw, id, notch, sv: [-X / D, -Y / D, 0]}) : '';
  const earth = `<circle cx="${x}" cy="${y}" r="${r + (RING3D ? (small ? 1.3 : 1.0) : sw)}" fill="${bg}"/>` + poles + phase(x, y, r, sdir, frac, day, night)
    + notches + `<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><g clip-path="url(#${id})">${showEquator ? lat : ''}</g>`;
  const ORC = MONO ? MONO_C[mode] : ORBIT[mode], orx = orbitRx() * D / 23, ory = orbitRy() * D / 23;
  const sunEl = `<circle cx="${cx}" cy="${cy}" r="${sun}" fill="${MONO ? MONO_C[mode] : SUN}"/>`, far = X * cam().C[0] + Y * cam().C[1] < 0;
  if (!RING3D || !showOrbit) {
    let o = showOrbit ? `<ellipse cx="${cx}" cy="${cy}" rx="${orx.toFixed(2)}" ry="${ory.toFixed(2)}" fill="none" stroke="${ORC}" stroke-width="${(small ? sw * .7 : sw * .45).toFixed(2)}" opacity="${small ? .8 : .5}"/>` : '';
    return o + (far ? earth + sunEl : sunEl + earth); }                      // behind the Sun on the far side of the orbit
  // the orbit as a ring seen in depth: wide on the near side, thin on the far side; its far half passes behind the Sun, its near half in front
  const tf = small ? 1.8 : 1.3, tb = small ? 0.7 : 0.4, ts = (tf + tb) / 2, sh = (tf - tb) / 4, sv = (tf + tb) / 4;
  const ell = (y0, rx, ry) => `M${(cx - rx).toFixed(2)} ${y0.toFixed(2)}A${rx.toFixed(2)} ${ry.toFixed(2)} 0 1 0 ${(cx + rx).toFixed(2)} ${y0.toFixed(2)}A${rx.toFixed(2)} ${ry.toFixed(2)} 0 1 0 ${(cx - rx).toFixed(2)} ${y0.toFixed(2)}z`;
  const ring = ell(cy + sh, orx + ts / 2, ory + sv) + ell(cy - sh, orx - ts / 2, ory - sv), rid = 'r' + (++uid);
  // the Sun fits inside the ring: no larger than the gap to the ring's inner edge (nearest at the bottom), less a small margin
  // inside: the Sun fits in the ring's gap; crossing: the Sun rises above the ring's far side and the near side passes in front of its lower half
  const sunR = SUNPOP ? (window.SUN_R ? window.SUN_R + (small ? 0.4 : 0) : (small ? 9.3 : 8.9)) : Math.max(2.2, Math.min(sun, ory - sv - sh - (small ? 0.8 : 0.7))), sunIn = `<circle cx="${cx}" cy="${cy}" r="${sunR.toFixed(2)}" fill="${MONO ? MONO_C[mode] : SUN}" stroke="${bg}" stroke-width="${small ? 1.5 : 1.2}" paint-order="stroke"/>`;   // a hairline of background keeps the Sun apart from the Earth behind it
  // the ring: its far half behind the Sun, its near half in front. The Earth sits on the ring (the orbit runs through its centre), so it is
  // always drawn above the ring, its thin gap cutting the ring round it; only the Sun covers it, when it is on the far side behind the Sun
  const earthFar = y < cy, gap = small ? 1.2 : 0.9;
  const half = top => `<path d="${ring}" fill-rule="evenodd" fill="${ORC}"${top ? '' : ` stroke="${bg}" stroke-width="${gap}" paint-order="stroke"`} clip-path="url(#${rid}${top ? 'b' : 'f'})"/>`;
  return `<defs><clipPath id="${rid}b"><rect x="-40" y="-60" width="140" height="${cy + 60}"/></clipPath><clipPath id="${rid}f"><rect x="-40" y="${cy}" width="140" height="160"/></clipPath>`
    + `<mask id="${rid}m" maskUnits="userSpaceOnUse" x="-40" y="-60" width="140" height="220"><rect x="-40" y="-60" width="140" height="220" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="${(sunR + (small ? 0.75 : 0.6)).toFixed(2)}" fill="#000"/></mask></defs>`
    + half(true) + sunIn + half(false) + (earthFar ? `<g mask="url(#${rid}m)">${earth}</g>` : earth);
  return o;
}
let uid = 0, showOrbit = true, showEquator = LINES, showPoles = LINES, poleStyle = 'capmer';
// simple ways to mark the poles and the tilt on the globe; each is drawn on top of the lit globe
const POLES = {
  capmer: ['Caps and meridian', 'The two polar caps, joined by one thin meridian from pole to pole over the near side.'],
  notch:  ['Small notches', 'Two small round bites in the edge where the axis meets it; north larger.'],
  edgedot:['Edge dots', 'A small light dot sitting on the edge at each pole; north larger.'],
  indot:  ['Inner dots', 'Small light dots just inside the edge at the poles.'],
  truepole:['True pole point', 'One small ring where the North Pole really is on the globe, seen from this angle.'],
  tick:   ['Inner ticks', 'Short strokes from the edge inwards along the axis, like a compass card.'],
  nub:    ['Tiny nubs', 'The axis shows only as the smallest bumps on the outline.'],
  rimarc: ['Rim arcs', 'A short thicker arc of the outline at each pole, as if the cap catches the light.'],
  cap:    ['Polar caps', 'The two ice caps as small light segments of the globe, cut at the polar circles.'],
  meridian:['One meridian', 'A thin line from pole to pole over the near side: the tilt as a longitude line.'],
  axisdash:['Dashed axis inside', 'The axis as a fine dashed line inside the globe only, never beyond it.'],
  chevron:['North chevron', 'A tiny chevron on the north edge pointing out along the axis; no south mark.'],
  nletter:['N and S', 'Tiny N and S letters just outside the edge on the axis.'],
  greenwich:['Greenwich meridian', 'The real prime meridian, pole to pole, turned to where it is right now: facing the Sun at 12:00 UTC, on the night side at midnight. It turns with the clock.'],
};
function poleMark(style, o) {
  const {x, y, r, ux, uy, ax, ay, A, bg, day, night, sw, notch} = o, L_ = (k, sg = 1) => [x + sg * ux * r * k, y + sg * uy * r * k];
  const light = o.day === '#ffffff' ? o.bg : '#ffffff', f = v => v.toFixed(2);   // caps and meridian: background colour where the day side is white
  switch (style) {
    case 'capmer': return poleMark('cap', o) + poleMark('meridian', o);
    case 'notch': return notch(1, .12) + notch(-1, .09);
    case 'edgedot': { const [a1, b1] = L_(.97), [a2, b2] = L_(.97, -1); return `<circle cx="${f(a1)}" cy="${f(b1)}" r="${f(r * .11)}" fill="${light}" stroke="${night}" stroke-width="${f(sw * .25)}"/><circle cx="${f(a2)}" cy="${f(b2)}" r="${f(r * .08)}" fill="${light}" stroke="${night}" stroke-width="${f(sw * .25)}"/>`; }
    case 'indot': { const [a1, b1] = L_(.78), [a2, b2] = L_(.8, -1); return `<circle cx="${f(a1)}" cy="${f(b1)}" r="${f(r * .1)}" fill="${light}" opacity=".9"/><circle cx="${f(a2)}" cy="${f(b2)}" r="${f(r * .07)}" fill="${light}" opacity=".9"/>`; }
    case 'truepole': return `<circle cx="${f(x + ax * r)}" cy="${f(y + ay * r)}" r="${f(r * .1)}" fill="none" stroke="${light}" stroke-width="${f(sw * .3)}"/><circle cx="${f(x + ax * r)}" cy="${f(y + ay * r)}" r="${f(r * .035)}" fill="${light}"/>`;
    case 'tick': { const t = (k1, k2, sg, w) => { const [a1, b1] = L_(k1, sg), [a2, b2] = L_(k2, sg); return `<path d="M${f(a1)} ${f(b1)}L${f(a2)} ${f(b2)}" stroke="${light}" stroke-width="${f(w)}" stroke-linecap="round"/>`; }; return t(.98, .72, 1, sw * .32) + t(.98, .8, -1, sw * .26); }
    case 'nub': { const t = (k2, sg, w) => { const [a1, b1] = L_(.9, sg), [a2, b2] = L_(k2, sg); return `<path d="M${f(a1)} ${f(b1)}L${f(a2)} ${f(b2)}" stroke="${night}" stroke-width="${f(w)}" stroke-linecap="round"/>`; }; return t(1.04, 1, sw * .45) + t(1.02, -1, sw * .36); }
    case 'rimarc': { const arc = (sg, span, w) => { const c = Math.atan2(sg * uy, sg * ux), a0 = c - span, a1 = c + span; return `<path d="M${f(x + r * Math.cos(a0))} ${f(y + r * Math.sin(a0))}A${r} ${r} 0 0 1 ${f(x + r * Math.cos(a1))} ${f(y + r * Math.sin(a1))}" fill="none" stroke="${night}" stroke-width="${f(sw * .55)}" stroke-linecap="round"/>`; }; return arc(1, .32, 0) + arc(-1, .22, 0); }
    case 'cap': { const id2 = o.id + 'c'; let out = `<clipPath id="${id2}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath><g clip-path="url(#${id2})">`;
      for (const sg of [1, -1]) { const k = sg > 0 ? .78 : .84, [cx2, cy2] = L_(1.0 + (1 - k) * 1.6, sg); out += `<circle cx="${f(cx2)}" cy="${f(cy2)}" r="${f(r * (1 - k) * 2.2)}" fill="${light}" opacity=".85"/>`; }
      return out + '</g>'; }
    case 'meridian': { const view = cam().C, dv = A[0] * view[0] + A[1] * view[1] + A[2] * view[2];
      let W = view.map((v, j) => v - dv * A[j]); const wl = Math.hypot(...W); W = W.map(v => v / wl); let d = '';
      for (let i = 0; i <= 60; i++) { const t = -Math.PI / 2 + Math.PI * i / 60, P = A.map((a, j) => Math.sin(t) * a + Math.cos(t) * W[j]), [qx, qy] = proj(...P); d += (i ? 'L' : 'M') + f(x + qx * r) + ' ' + f(y + qy * r); }
      return `<path d="${d}" fill="none" stroke="${light}" stroke-opacity=".8" stroke-width="${f(sw * .14)}"/>`; }
    case 'axisdash': { const [a1, b1] = L_(.94), [a2, b2] = L_(.94, -1); return `<path d="M${f(a1)} ${f(b1)}L${f(a2)} ${f(b2)}" stroke="${light}" stroke-opacity=".8" stroke-width="${f(sw * .16)}" stroke-dasharray="${f(r * .08)} ${f(r * .08)}"/>`; }
    case 'chevron': { const [a1, b1] = L_(1.0), nx = -uy, ny = ux, h = r * .16; return `<path d="M${f(a1 - ux * h * .2 + nx * h)} ${f(b1 - uy * h * .2 + ny * h)}L${f(a1 + ux * h * .8)} ${f(b1 + uy * h * .8)}L${f(a1 - ux * h * .2 - nx * h)} ${f(b1 - uy * h * .2 - ny * h)}" fill="none" stroke="${night}" stroke-width="${f(sw * .3)}" stroke-linecap="round" stroke-linejoin="round"/>`; }
    case 'greenwich': {   // Greenwich faces the Sun at 12:00 UTC; the Earth turns eastward (counter-clockwise seen from the north) 15 degrees an hour
      const dot = (u, v) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2], sa = dot(o.sv, A); let Sp = o.sv.map((v, j) => v - sa * A[j]); const sl = Math.hypot(...Sp); Sp = Sp.map(v => v / sl);
      const Bv = [A[1] * Sp[2] - A[2] * Sp[1], A[2] * Sp[0] - A[0] * Sp[2], A[0] * Sp[1] - A[1] * Sp[0]];   // A x S': 90 degrees east of the Sun-facing meridian
      const now = new Date(), h = now.getUTCHours() + now.getUTCMinutes() / 60, g = (h - 12) * 15 * Math.PI / 180;
      const G = Sp.map((v, j) => Math.cos(g) * v + Math.sin(g) * Bv[j]), view = cam().C;
      let d = '', pen = false;
      for (let i = 0; i <= 80; i++) { const t = -Math.PI / 2 + Math.PI * i / 80, P = A.map((a, j) => Math.sin(t) * a + Math.cos(t) * G[j]);
        if (dot(P, view) > 0) { const [qx, qy] = proj(...P); d += (pen ? 'L' : 'M') + f(x + qx * r) + ' ' + f(y + qy * r); pen = true; } else pen = false; }
      return d ? `<path d="${d}" fill="none" stroke="${light}" stroke-opacity=".85" stroke-width="${f(sw * .16)}" stroke-linecap="round"/>` : ''; }
    case 'nletter': { const [a1, b1] = L_(1.28), [a2, b2] = L_(1.26, -1); return `<text x="${f(a1)}" y="${f(b1)}" font-family="Sora" font-weight="600" font-size="${f(r * .34)}" fill="${night}" text-anchor="middle" dominant-baseline="central">N</text><text x="${f(a2)}" y="${f(b2)}" font-family="Sora" font-weight="600" font-size="${f(r * .3)}" fill="${night}" text-anchor="middle" dominant-baseline="central">S</text>`; }
  }
  return '';
}


// half-height of the mark for the header crop: the turned orbit, or the Sun where it reaches higher, plus the Earth riding on top
const onBar = (n, light, bg) => { const p = window.MAJIRA_PAL; if (!light || !p) return mark(n, light ? F : '#ffffff', bg, true);
  const keep = [MONO_T.light, MONO_C.light]; MONO_T.light = [p.nightSide, p.night]; MONO_C.light = p.night;
  try { return mark(n, F, bg, true); } finally { [MONO_T.light, MONO_C.light] = keep; } };
const HHS = () => Math.max(Math.hypot(orbitRx() * Math.sin(ROLL * Math.PI / 180), orbitRy() * Math.cos(ROLL * Math.PI / 180)) + 7.5, 13);
const today = doy(new Date());
// tones for the forest header band: the 'tile' palette (mark drawn with white ink on forest)
window.majiraMark = (n = today, k = '#ffffff', bg = F, small = false) => mark(n, k, bg, small);
document.addEventListener('DOMContentLoaded', () => {
  // the smart logo: once the page has fully loaded, the Earth makes one calm lap round the orbit through all four seasons and
  // comes back to rest on today's position; skipped for visitors who ask for reduced motion
  const fav = document.querySelector('link[rel=icon]') || Object.assign(document.head.appendChild(document.createElement('link')), {rel: 'icon'});
  fav.href = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 64 64"><rect x="-2" y="-2" width="64" height="64" rx="14" fill="${F}"/>${mark(today, '#ffffff', F, true)}</svg>`);
  const els = [...document.querySelectorAll('[data-majira-mark]')];
  // the ring around the Earth that hides the orbit behind it takes the colour of what the mark sits on (the header, which is
  // darker in dark mode), so it never shows as an outline
  const bgOf = el => { let e = el; while (e) { const cs = getComputedStyle(e), g = cs.backgroundImage.match(/rgba?\([^)]*\)/), c = cs.backgroundColor;
    if (g) return g[0]; if (c && c !== 'transparent' && !c.startsWith('rgba(0, 0, 0, 0')) return c; e = e.parentElement; } return F; };   // a gradient: its first colour, the one behind the logo
  let lastN = today;
  const draw = n => { lastN = n; els.forEach(el => { const bg = bgOf(el), rgb = (bg.match(/[\d.]+/g) || [0, 0, 0]).map(Number), light = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 150;   // on a light header: the light-background mark
      el.innerHTML = `<svg viewBox="-2 ${(31 - HHS()).toFixed(1)} 64 ${(2 * HHS()).toFixed(1)}" aria-hidden="true">${onBar(n, light, bg)}</svg>`; }); };   // crop fitted to the orbit's height
  new MutationObserver(() => draw(lastN)).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => draw(lastN));
  if (!els.length) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(today); return; }
  // the logo is the page loader: the Earth circles the Sun at a calm, steady pace while the page loads (and, on the 3D hero,
  // until the first view of the terrain is in), then slows without a jerk and comes to rest on today's position
  const V = 365 / 3600;                          // days per ms: one lap in 3.6 s
  let n = today - 120, last = performance.now(), landing = null;
  const step = now => { const dt = Math.min(now - last, 50); last = now;
    if (!landing) n += V * dt;
    else { const k = Math.min(1, (now - landing.t0) / landing.T), m0 = V * landing.T;
      n = landing.from + (k * k * k - 2 * k * k + k) * m0 + (3 * k * k - 2 * k * k * k) * landing.d;;   // Hermite: leaves at cruising speed, arrives at rest
      if (k === 1) { draw(today); return; } }
    draw(((n - 1) % 365 + 365) % 365 + 1); requestAnimationFrame(step); };
  const land = () => { if (landing) return; let d = ((today - n) % 365 + 365) % 365; if (d < 90) d += 365;   // always a gentle final stretch
    landing = {t0: performance.now(), from: n, d, T: Math.min(4200, Math.max(2600, 1.6 * d / V))}; };   // 2.6-4.2 s to settle
  requestAnimationFrame(step);
  const pageLoaded = new Promise(r => document.readyState === 'complete' ? r() : window.addEventListener('load', r, {once: true}));
  const terrain = new Promise(r => { window.addEventListener('majira:3d-ready', r, {once: true}); setTimeout(() => { if (!window.majiraWait3d) r(); }, 600); setTimeout(r, 15000); });
  Promise.all([pageLoaded, terrain]).then(land);
});
})();
