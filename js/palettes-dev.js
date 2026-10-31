/* Majira palettes (trial period): one shared list for the brand guide and the site. Choose in the header's colour menu (or ?pal=<n>);
   the choice is remembered in this browser. Each palette: ink, paper, night (dark-mode ground), Earth day/night tones. */
window.MAJIRA_PALS = [
 {name: '1 · Pine and paper', note: 'forest belt, growth', accent: '#b8893a', ink: '#17462f', day: '#8cb59b', paper: '#f5f2ea', night: '#0f2a1d', nightSide: '#1f4a35'},
 {name: '2 · Kilimanjaro night', note: 'sky before dawn over Kibo', accent: '#d08a2e', ink: '#1c2c4c', day: '#8ea3c4', paper: '#f4f6f9', night: '#0f1828', nightSide: '#2a3c5e'},
 {name: '3 · Rain season teal', note: 'rain-heavy air', accent: '#d9775c', ink: '#0f4c55', day: '#86b4b6', paper: '#f1f6f5', night: '#0a2a2f', nightSide: '#1d5a62'},
 {name: '10 · Glacier ice', note: "Kibo's ice cap", accent: '#c9a46a', ink: '#2f6f8f', day: '#a8cfe0', paper: '#f2f8fb', night: '#0d2230', nightSide: '#1f4f68'},
 {name: '13 · Kanga coral', note: 'printed kanga cloth', accent: '#2a7f7a', ink: '#c2463a', day: '#efb0a6', paper: '#fff5f2', night: '#2e0f0c', nightSide: '#7a2a22'},
 {name: '14 · Banana leaf', note: 'fresh green of the rains', accent: '#c99a2e', ink: '#2e7d32', day: '#a5d6a7', paper: '#f3faf3', night: '#0e2a10', nightSide: '#1f5a22'},
 {name: '17 · Plum dusk', note: 'evening sky after rain', accent: '#8aa07a', ink: '#5e2a4c', day: '#c49ab6', paper: '#faf3f7', night: '#200d19', nightSide: '#43203a'},
 {name: '18 · Acacia gold on black', note: 'dark first, bright ink', accent: '#3aa39a', ink: '#e2b23c', day: '#f1d488', paper: '#141414', night: '#0a0a0a', nightSide: '#6b5418'},
 {name: '20 · Lime on charcoal', note: 'dark first, electric', accent: '#8a7ad8', ink: '#9ccc3b', day: '#cbe68f', paper: '#16191a', night: '#0b0d0d', nightSide: '#4a6618'},
 {name: '23 · Material Baseline', note: "Material's baseline theme", accent: '#03dac6', ink: '#6200ee', day: '#b080f6', paper: '#ffffff', night: '#121212', nightSide: '#3e088b'},
 {name: '24 · Material Crane', note: 'case study: travel', accent: '#e30425', ink: '#5d1049', day: '#ae88a4', paper: '#ffffff', night: '#121212', nightSide: '#3b1130'},
 {name: '26 · Material Owl', note: 'case study: education', accent: '#0336ff', ink: '#ffde03', day: '#ffee81', paper: '#ffffff', night: '#121212', nightSide: '#94820a'},
 {name: '27 · Material Basil', note: 'case study: recipes', accent: '#fd5523', ink: '#356859', day: '#9ab4ac', paper: '#fffbe6', night: '#121212', nightSide: '#254139'},
 {name: '29 · Material Rally', note: 'case study: finance (dark)', accent: '#ff6859', ink: '#1eb980', day: '#8edcc0', paper: '#ffffff', night: '#33333d', nightSide: '#277d62'}
];
(function () {
  const P = window.MAJIRA_PALS, q = new URLSearchParams(location.search); let id = q.get('pal');
  try { if (id !== null) localStorage.setItem('wk-pal', id); else id = localStorage.getItem('wk-pal'); } catch (e) {}
  const num = p => +p.name.split(' ')[0], pal = id && id !== '0' ? (P.find(p => num(p) === +id) || null) : null; window.MAJIRA_PAL = pal;
  const lum = h => { const n = parseInt(h.slice(1), 16); return 0.2126 * (n >> 16) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255); };
  if (pal) { pal.bright = lum(pal.paper) > lum(pal.ink) ? pal.paper : pal.ink; pal.onInk = lum(pal.ink) > 150 ? '#141414' : '#ffffff'; pal.lightPaper = lum(pal.paper) > 150 ? pal.paper : '#f6f5f1'; pal.lightBrand = lum(pal.ink) > 150 ? pal.night : pal.ink; }
  // the picker: a colour menu in the site's header for everyone; the pill bar on the brand guide
  const isBrand = /majira-brand/.test(location.pathname);
  const choose = n => { try { localStorage.setItem('wk-pal', String(n)); } catch (x) {} const u = new URLSearchParams(location.search); if (u.has('pal')) { u.delete('pal'); location.search = u.toString(); } else location.reload(); };
  const sw4 = p => `<span class="pm-sw"><i style="background:${p.ink}"></i><i style="background:${p.accent || p.ink}"></i><i style="background:${p.paper}"></i><i style="background:${p.night}"></i></span>`;
  if (!isBrand) document.addEventListener('DOMContentLoaded', () => {
    const theme = document.querySelector('.top .tools .icon-btn[onclick="toggleTheme()"]'); if (!theme) return;
    const base = {name: '0 · Forest (today)', ink: '#1d5a38', accent: '#a0702a', paper: '#ffffff', night: '#0b140f'}, list = [base].concat(P), curN = pal ? num(pal) : 0;
    const st = document.createElement('style'); st.textContent = '.pm-btn{display:inline-flex;align-items:center;justify-content:center;padding:0}.pm-sw{display:inline-flex;width:18px;height:18px;border-radius:999px;overflow:hidden;box-shadow:0 0 0 1.5px #ffffffcc}.pm-sw i{flex:1}'
      + '.pm-menu{position:fixed;z-index:1000;top:72px;right:24px;width:290px;max-height:min(70vh,560px);overflow:auto;background:#fff;color:#12211a;border:1px solid #d8e2db;border-radius:16px;box-shadow:0 16px 40px rgba(0,0,0,.28);padding:6px;display:none;font:14px var(--f-body,system-ui)}'
      + '.pm-menu.open{display:block}.pm-h{font:600 11.5px var(--f-body,system-ui);letter-spacing:.06em;text-transform:uppercase;color:#4e6056;padding:8px 10px 6px}'
      + '.pm-menu button{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;background:none;color:inherit;font:inherit;padding:8px 10px;border-radius:10px;cursor:pointer}.pm-menu button:hover{background:#eef3f0}.pm-menu button.on{background:#12211a;color:#fff}'
      + '.pm-menu button .pm-sw{width:44px;height:16px;border-radius:5px;box-shadow:0 0 0 1px #0002}.pm-menu .pm-n{font-variant-numeric:tabular-nums;opacity:.6;width:18px}';
    document.head.appendChild(st);
    const menu = document.createElement('div'); menu.className = 'pm-menu'; menu.setAttribute('role', 'listbox');
    menu.innerHTML = `<div class="pm-h"><span data-en>Colours (trial)</span></div>` + list.map(p => { const n = num(p), nm = p.name.split(' · ')[1]; return `<button type="button" role="option" data-pm="${n}" class="${n === curN ? 'on' : ''}" aria-selected="${n === curN}"><span class="pm-n">${n}</span>${sw4(p)}<span>${nm}</span></button>`; }).join('');
    document.body.appendChild(menu);
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'icon-btn pm-btn'; btn.setAttribute('aria-label', 'Colours'); btn.setAttribute('aria-haspopup', 'listbox'); btn.innerHTML = sw4(pal || base);
    theme.parentNode.insertBefore(btn, theme);
    const open = (v, at) => { menu.classList.toggle('open', v); btn.setAttribute('aria-expanded', v); if (v) { const r = (at || btn).getBoundingClientRect(); menu.style.top = (r.bottom + 10) + 'px'; menu.style.right = Math.max(12, innerWidth - r.right) + 'px'; } };
    btn.addEventListener('click', e => { e.stopPropagation(); open(!menu.classList.contains('open')); });
    menu.addEventListener('click', e => { const b = e.target.closest('[data-pm]'); if (b) choose(+b.dataset.pm); });
    document.addEventListener('click', e => { if (!menu.contains(e.target)) open(false); }); document.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });
    // the phone menu gets the same entry
    const mx = document.querySelector('.mainnav .mx'); if (mx) { const m = document.createElement('button'); m.type = 'button'; m.innerHTML = sw4(pal || base); m.setAttribute('aria-label', 'Colours'); m.addEventListener('click', e => { e.stopPropagation(); open(true, m); }); mx.appendChild(m); }
  });
  document.addEventListener('DOMContentLoaded', () => {
    if (!isBrand) return;
    // pills: one click per palette; colour swatch (ink, paper, night) and number, the full name on hover and beside the row
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:50%;bottom:12px;transform:translateX(-50%);z-index:99999;max-width:calc(100vw - 24px);display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.96);color:#141414;border:1px solid #ccc;border-radius:999px;padding:6px 10px;font:600 12px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    const sw = p => `<span style="display:inline-flex;width:22px;height:14px;border-radius:7px;overflow:hidden;border:1px solid #0002"><i style="flex:1;background:${p.ink}"></i><i style="flex:1;background:${p.paper}"></i><i style="flex:1;background:${p.night}"></i><i style="flex:1;background:${p.accent || '#a0702a'}"></i></span>`;
    const cur = {name: '0 · current (forest)', ink: '#1d5a38', paper: '#ffffff', night: '#0b140f'};
    const all = [cur].concat(P), on = pal ? P.indexOf(pal) + 1 : 0, nOf = i => i === 0 ? 0 : num(all[i]);
    box.innerHTML = `<b style="white-space:nowrap;min-width:150px">${all[on].name}</b><div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none">`
      + all.map((p, i) => `<button type="button" data-pal="${nOf(i)}" title="${p.name}" style="display:inline-flex;align-items:center;gap:4px;border:1px solid ${i === on ? '#141414' : '#ddd'};background:${i === on ? '#141414' : '#fff'};color:${i === on ? '#fff' : '#141414'};border-radius:999px;padding:3px 7px 3px 4px;font:600 11.5px system-ui;cursor:pointer;flex:none">${sw(p)}${nOf(i)}</button>`).join('') + '</div>';
    box.addEventListener('click', e => { const b = e.target.closest('[data-pal]'); if (!b) return; const u = new URLSearchParams(location.search); u.set('pal', b.dataset.pal); location.search = u.toString(); });
    document.body.appendChild(box);
  });
  try { localStorage.removeItem('wk-charts'); } catch (e) {}
  const mixC = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), c = k => Math.round(((A >> k) & 255) * (1 - t) + ((B >> k) & 255) * t);
    return '#' + [16, 8, 0].map(k => c(k).toString(16).padStart(2, '0')).join(''); };
  // one hue for amounts, two shades of it for pairs, brand against a neutral grey for comparisons; text names every series
  // the primary carries amounts (rain, humidity) and the cool pole; the secondary carries the opposite pole (drier, warmth, radiation)
  const dataFrom = (B, bg, ink, A) => { const Ax = A || mixC(ink, bg, 0.55);
    return {rain: B, near: mixC(ink, bg, 0.7), wet: B, dry: Ax, warm: Ax, cool: B, humidity: mixC(B, bg, 0.3), solar: Ax, veg: lum(bg) > 128 ? mixC(B, '#000000', 0.25) : mixC(B, '#ffffff', 0.25)}; };
  window.MAJIRA_DATA_COLOURS = (L, D) => ({light: dataFrom(L.mark || L.brand, L.bg, L.ink, L.accentMark || L.accent), dark: dataFrom(D.mark || D.brand, D.bg, D.ink, D.accentMark || D.accent)});
  const applyCharts = (L, D) => { if (isBrand) return; const dc = window.MAJIRA_DATA_COLOURS(L, D);
    const st = document.createElement('style'); const v = o => Object.entries(o).map(([k, c]) => `--${k}:${c}`).join(';');
    const lum = h => { const n = parseInt(h.slice(1), 16), c = k => { let x = ((n >> k) & 255) / 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }; return .2126 * c(16) + .7152 * c(8) + .0722 * c(0); };
    const ok = (c, g) => { const x = lum(c), y = lum(g); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05) >= 4.5; };
    const tx = (d, T) => { const g = T.panel || T.bg, t = k => ok(d[k], g) ? d[k] : T.ink; return `.c-rain{color:${t('rain')}}.c-wet,.day .r{color:${t('wet')}}.c-dry{color:${t('dry')}}.c-warm,.day .t b{color:${t('warm')}}.day .t i{color:${t('cool')}}`; };
    const td = tx(dc.dark, D).replace(/(^|})([^{]+)\{/g, (m, a, sel) => a + sel.split(',').map(x => ':root[data-theme=dark] ' + x).join(',') + '{');
    st.textContent = `:root{${v(dc.light)}}:root[data-theme=dark]{${v(dc.dark)}}@media (prefers-color-scheme:dark){:root:not([data-theme=light]){${v(dc.dark)}}}${tx(dc.light, L)}${td}`; document.head.appendChild(st);
    document.addEventListener('DOMContentLoaded', () => { try { Object.assign(PAL.light, dc.light); Object.assign(PAL.dark, dc.dark); if (typeof renderAll === 'function') renderAll(); } catch (e) {} }); };
  if (!pal) { applyCharts({brand: '#1d5a38', bg: '#f3f7f4', ink: '#12211a', accent: '#a0702a'}, {brand: '#63c08a', bg: '#0b140f', ink: '#e3ece6', accent: '#d9a95a'}); return; }
  if (isBrand) return;
  // the site: recolour header, brand colour, page and panels
  // the full token set, derived from the palette for both modes: page, cards, text, secondary text, lines, highlight, brand
  const mix = (a, b, t) => { const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16), c = k => Math.round(((A >> k) & 255) * (1 - t) + ((B >> k) & 255) * t);
    return '#' + [16, 8, 0].map(k => c(k).toString(16).padStart(2, '0')).join(''); };
  const rl = h => { const n = parseInt(h.slice(1), 16), c = k => { let v = ((n >> k) & 255) / 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * c(16) + .7152 * c(8) + .0722 * c(0); };
  const cr = (a, b) => { const x = rl(a), y = rl(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const ensure = (c, bg, toward, min = 4.5) => { let t = 0, out = c; while (cr(out, bg) < min && t < 0.9) { t += 0.05; out = mix(c, toward, t); } return out; };
  // Material 3 tonal palettes: every role is a tone (lightness) of the primary's or secondary's hue, so dark mode keeps its colour.
  // Light: page tone 98 tinted, cards white, header = primary (tone 40), text tone 10. Dark: page tone 6, cards tone 12, lines tone 24,
  // header = primary container (tone 28), accents tone 80, text tone 92 tinted.
  const hsl = h => { let [r, g, b] = [16, 8, 0].map(k => ((parseInt(h.slice(1), 16) >> k) & 255) / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l]; const d = mx - mn, sat = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    const hue = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [hue * 60, sat, l]; };
  const hex = (H, S, Lt) => { const a = S * Math.min(Lt, 1 - Lt), f = n => { const k = (n + H / 30) % 12; return Lt - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return '#' + [0, 8, 4].map(n => Math.round(f(n) * 255).toString(16).padStart(2, '0')).join(''); };
  const [pH, pS] = hsl(pal.ink), [sH, sS] = hsl(pal.accent), tone = (H, S, t, c = 1) => hex(H, Math.min(1, S * c), t / 100);
  const on = c => cr('#ffffff', c) >= cr('#141414', c) ? '#ffffff' : '#141414';
  const M = {primary: pal.ink, primary80: tone(pH, pS, 80, .9), primaryContainerDark: tone(pH, pS, 28, .8), secondary: pal.accent, secondary80: tone(sH, sS, 78, .9)};
  window.MAJIRA_M3 = M;
  const L = {bg: tone(pH, pS, 98, .35), panel: '#ffffff', ink: tone(pH, pS, 10, .3), muted: tone(pH, pS, 38, .2), line: tone(pH, pS, 88, .25),
             brand: M.primary, soft: tone(pH, pS, 92, .5), accent: M.secondary};
  L.brand = cr(M.primary, L.bg) >= 4.5 ? M.primary : L.ink; L.accent = cr(M.secondary, L.bg) >= 4.5 ? M.secondary : L.ink;   // text in the brand colour only when the unchanged primary is readable
  const D = {bg: tone(pH, pS, 6, .45), panel: tone(pH, pS, 11, .45), ink: tone(pH, pS, 92, .3), muted: tone(pH, pS, 70, .25), line: tone(pH, pS, 22, .4),
             brand: M.primary, soft: tone(pH, pS, 22, .7), accent: M.secondary};
  D.brand = cr(M.primary, D.bg) >= 4.5 ? M.primary : D.ink; D.accent = cr(M.secondary, D.bg) >= 4.5 ? M.secondary : D.ink;
  const onP = on(M.primary), barDark = tone(pH, pS, 13, .5), onBarDark = D.ink;
  pal.onInk = onP; pal.bright = M.primary80; pal.nightSide = tone(pH, pS, 20, .6);
  L.fill = pal.ink; L.onFill = on(pal.ink); L.mark = pal.ink; L.accentMark = pal.accent;   // surfaces and chart marks: the unchanged primary and secondary
  D.fill = pal.ink; D.onFill = on(pal.ink); D.mark = pal.ink; D.accentMark = pal.accent;
  const vars = T => `--bg:${T.bg};--panel:${T.panel};--ink:${T.ink};--muted:${T.muted};--line:${T.line};--brand:${T.fill};--brand-ink:${T.onFill};--brand-text:${T.brand};--soft:${T.soft}`;
  const lightBar = onP === '#141414' ? `:root:not([data-theme=dark]) .top .brand i{color:#141414cc!important;border-left-color:#14141455!important}:root:not([data-theme=dark]) .top .wp-btn,:root:not([data-theme=dark]) .top .icon-btn,:root:not([data-theme=dark]) .top .seg-btn{color:#141414!important;border-color:#14141440!important;background:#ffffff40!important}:root:not([data-theme=dark]) .top .wp-btn svg,:root:not([data-theme=dark]) .top .wp-btn .wp-l,:root:not([data-theme=dark]) .top .wp-btn .caret,:root:not([data-theme=dark]) .top .seg-btn button{color:#141414!important}:root:not([data-theme=dark]) .top .seg-btn button.on{background:#141414!important;color:#fff!important}:root:not([data-theme=dark]) .top .mainnav a.on{background:#14141418!important}` : '';
  const css = `:root{${vars(L)}}:root[data-theme=dark]{${vars(D)}}@media (prefers-color-scheme:dark){:root:not([data-theme=light]){${vars(D)}}}body{background:var(--bg);color:var(--ink)}
:root:not([data-theme=dark]) .top .wrap{background:${M.primary}!important;color:${onP}}:root:not([data-theme=dark]) .top .brand b,:root:not([data-theme=dark]) .top .mainnav a{color:${onP}!important}${lightBar}
:root[data-theme=dark] .top .wrap{background:${barDark}!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;box-shadow:inset 0 0 0 1px ${M.primary},0 6px 18px rgba(0,0,0,.45)!important;color:${onBarDark}}
:root[data-theme=dark] .top .brand b{color:${onBarDark}!important}:root[data-theme=dark] .top .brand i{border-left-color:${onBarDark}55!important}:root[data-theme=dark] .top .mainnav a{color:${onBarDark}!important}:root[data-theme=dark] .top .mainnav a.on{background:${D.soft}!important;color:${D.ink}!important}:root[data-theme=dark] .top .brand i{color:${onBarDark}bb!important}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  applyCharts(L, D);
})();
