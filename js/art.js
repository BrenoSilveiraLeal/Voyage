/* Voyage — ilustrações em SVG geradas por código.
   Cenas dos destinos (pôster 400x600, em camadas para o parallax), interiores das hospedagens (400x300),
   vinhetas das categorias, ilustração da capa e mapas estilizados.
   Para usar FOTO no lugar: troque o retorno de Art.scene/Art.room por `<img class="art" src="..." alt="">`. */
window.Art = (() => {
  let n = 0;
  const uid = p => `v${p}${(++n).toString(36)}`;
  const stops = s => s.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('');
  const lin = (id, s, h) => `<linearGradient id="${id}" x1="0" y1="0" x2="${h ? 1 : 0}" y2="${h ? 0 : 1}">${stops(s)}</linearGradient>`;
  const rad = (id, s) => `<radialGradient id="${id}">${stops(s)}</radialGradient>`;
  const svg = (vb, body, cls = 'art') => `<svg class="${cls}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${body}</svg>`;
  function rng(seed) {
    let t = seed >>> 0;
    return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
  }
  const hash = s => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

  /* ---------- peças reutilizáveis ---------- */
  function palm(x, y, h, c, flip = 1, s = 1) {
    const tx = x + 24 * flip * s, ty = y - h;
    let o = `<path d="M${x} ${y} Q${x + 6 * flip * s} ${y - h * 0.55} ${tx} ${ty}" stroke="${c}" stroke-width="${8 * s}" fill="none" stroke-linecap="round"/>`;
    [[-70, 10], [-50, -22], [-12, -34], [30, -26], [64, 4], [44, 24], [-40, 26]].forEach(([dx, dy]) => {
      dx *= s; dy *= s;
      o += `<path d="M${tx} ${ty} Q${tx + dx * 0.5} ${ty + dy - 18 * s} ${tx + dx} ${ty + dy} Q${tx + dx * 0.55} ${ty + dy * 0.4 - 4 * s} ${tx} ${ty}Z" fill="${c}"/>`;
    });
    return o;
  }
  function pagoda(cx, base, c, tiers = 5, sc = 1) {
    let o = '';
    for (let i = 0; i < tiers; i++) {
      const w = (104 - i * 14) * sc, y = base - i * 40 * sc;
      o += `<rect x="${cx - w * 0.32}" y="${y - 28 * sc}" width="${w * 0.64}" height="${28 * sc}" fill="${c}"/>`;
      o += `<path d="M${cx - w / 2 - 8 * sc} ${y - 26 * sc} Q${cx} ${y - 34 * sc} ${cx + w / 2 + 8 * sc} ${y - 26 * sc} Q${cx + w * 0.36} ${y - 40 * sc} ${cx} ${y - 44 * sc} Q${cx - w * 0.36} ${y - 40 * sc} ${cx - w / 2 - 8 * sc} ${y - 26 * sc}Z" fill="${c}"/>`;
    }
    const top = base - tiers * 40 * sc;
    return o + `<rect x="${cx - 1.5 * sc}" y="${top - 40 * sc}" width="${3 * sc}" height="${44 * sc}" fill="${c}"/>`;
  }
  function torii(cx, g, c) {
    return `<rect x="${cx - 58}" y="${g - 170}" width="13" height="170" fill="${c}"/><rect x="${cx + 45}" y="${g - 170}" width="13" height="170" fill="${c}"/>
      <rect x="${cx - 70}" y="${g - 148}" width="140" height="10" fill="${c}"/>
      <path d="M${cx - 88} ${g - 186} Q${cx} ${g - 168} ${cx + 88} ${g - 186} L${cx + 80} ${g - 170} Q${cx} ${g - 156} ${cx - 80} ${g - 170}Z" fill="${c}"/>
      <rect x="${cx - 74}" y="${g - 168}" width="148" height="6" fill="#2a1a1f"/>`;
  }
  function plant(x, y, s = 1) {
    let o = '';
    [-62, -32, 0, 30, 58].forEach((a, i) => { o += `<ellipse cx="${x}" cy="${y - 62 * s}" rx="${9 * s}" ry="${28 * s}" fill="${i % 2 ? '#6f955f' : '#4f7543'}" transform="rotate(${a} ${x} ${y - 34 * s})"/>`; });
    return o + `<path d="M${x - 16 * s} ${y - 34 * s} H${x + 16 * s} L${x + 12 * s} ${y} H${x - 12 * s}Z" fill="#c8a07a"/>`;
  }
  const birds = (x, y, c = '#1d1a16', o = 0.45) => `<g fill="none" stroke="${c}" stroke-opacity="${o}" stroke-width="1.6" stroke-linecap="round"><path d="M${x} ${y} q5 -5 10 0 q5 -5 10 0"/><path d="M${x + 26} ${y - 10} q4 -4 8 0 q4 -4 8 0"/></g>`;
  const cloud = (x, y, s = 1, o = 0.85) => `<g opacity="${o}" fill="#fff"><ellipse cx="${x}" cy="${y}" rx="${40 * s}" ry="${12 * s}"/><ellipse cx="${x - 14 * s}" cy="${y - 8 * s}" rx="${18 * s}" ry="${12 * s}"/><ellipse cx="${x + 12 * s}" cy="${y - 12 * s}" rx="${22 * s}" ry="${15 * s}"/></g>`;

  /* ---------- cenas dos destinos (400 x 600) ---------- */
  const SCENES = {
    dunes() {
      const g = uid('g');
      return `<defs>${lin(g, [[0, '#8ec5e6'], [0.55, '#f6d6b8'], [1, '#f3c79b']])}</defs>
        <rect width="400" height="600" fill="url(#${g})"/>
        <g class="drift">${cloud(90, 120, 0.9)}${cloud(330, 80, 0.6, 0.7)}</g>
        <circle class="is-d1" cx="292" cy="190" r="44" fill="#fff4dc"/>
        <path class="is-d1" d="M-40 360 C40 320 120 330 190 350 S330 320 440 340 V600 H-40Z" fill="#f7ecdc"/>
        <path class="is-d2" d="M-40 410 C60 380 150 400 230 420 S360 390 440 410 V600 H-40Z" fill="#fbf4e8"/>
        <ellipse class="is-d2" cx="120" cy="452" rx="78" ry="14" fill="#3fb3c4"/><ellipse class="is-d2" cx="300" cy="438" rx="52" ry="10" fill="#57c4cf"/>
        <path class="is-d3" d="M-40 480 C80 450 170 470 260 500 S380 470 440 480 V600 H-40Z" fill="#fffaf2"/>
        <ellipse class="is-d3" cx="230" cy="540" rx="120" ry="20" fill="#2a9fb4"/>`;
    },
    mesas() {
      const g = uid('g');
      return `<defs>${lin(g, [[0, '#f08a4b'], [0.6, '#f7c27a'], [1, '#f3d9a6']])}</defs>
        <rect width="400" height="600" fill="url(#${g})"/>
        <circle class="is-d1" cx="120" cy="250" r="54" fill="#ffe7b8" opacity=".9"/>
        ${birds(250, 180, '#6e3220', 0.5)}
        <path class="is-d1" d="M-40 330 H70 L90 300 H210 L230 330 H300 L316 290 H440 V600 H-40Z" fill="#c56a3d"/>
        <path class="is-d2" d="M-40 400 H40 L60 360 H170 L190 400 H260 L280 372 H440 V600 H-40Z" fill="#9c4a2a"/>
        <path class="is-d3" d="M-40 470 H120 L140 440 H300 L320 470 H440 V600 H-40Z" fill="#6e3220"/>
        <path class="is-d3" d="M150 600 C170 540 230 520 250 470 L262 470 C250 530 200 560 196 600Z" fill="#7cc0c8" opacity=".85"/>`;
    },
    island() {
      const g = uid('g');
      return `<defs>${lin(g, [[0, '#ffb38a'], [0.5, '#ffd9b3'], [0.52, '#2f8f9d'], [1, '#0f4c5c']])}</defs>
        <rect width="400" height="600" fill="url(#${g})"/>
        ${birds(70, 200, '#7a3b2c', 0.45)}
        <circle class="is-d1" cx="300" cy="276" r="40" fill="#fff0d6"/>
        <path class="is-d2" d="M90 314 C110 230 130 196 150 196 C168 196 176 250 190 314Z" fill="#2c4a3e"/>
        <path class="is-d2" d="M176 314 C188 250 206 214 226 214 C244 214 254 260 268 314Z" fill="#355c4c"/>
        <path class="is-d3 wave" d="M-40 380 Q60 366 160 380 T360 380 T560 378" fill="none" stroke="#bfe6e8" stroke-width="2" opacity=".6"/>
        <path class="is-d3 wave" d="M-40 430 Q60 416 160 430 T360 430 T560 428" fill="none" stroke="#bfe6e8" stroke-width="2" opacity=".45"/>
        <path class="is-d3 wave" d="M-40 490 Q60 476 160 490 T360 490 T560 488" fill="none" stroke="#bfe6e8" stroke-width="2" opacity=".3"/>`;
    },
    vineyard() {
      const g = uid('g');
      return `<defs>${lin(g, [[0, '#cfdcd2'], [1, '#eef0e2']])}</defs>
        <rect width="400" height="600" fill="url(#${g})"/>
        <g class="drift">${cloud(110, 160, 1.1, 0.7)}${cloud(320, 220, 0.8, 0.6)}</g>
        <path class="is-d1" d="M-40 330 C60 280 140 300 220 320 S360 290 440 300 V600 H-40Z" fill="#9db58f"/>
        <path class="is-d2" d="M-40 400 C80 350 180 370 260 390 S380 360 440 370 V600 H-40Z" fill="#6f955f"/>
        <g class="is-d2" stroke="#4f7543" stroke-width="2" opacity=".6"><path d="M20 430 L120 400 M20 450 L140 412 M20 470 L160 424 M200 420 L320 392 M210 440 L340 404"/></g>
        <path class="is-d3" d="M-40 480 C90 440 200 450 300 470 S400 450 440 455 V600 H-40Z" fill="#4c6f3f"/>
        <path class="is-d3" d="M318 470 C312 420 316 380 324 350 C332 380 336 420 330 470Z" fill="#2f4a2a"/>
        <path class="is-d3" d="M346 472 C342 432 344 404 350 384 C356 404 358 432 354 472Z" fill="#2f4a2a"/>`;
    },
    night() {
      const g = uid('g');
      let stars = '';
      const r = rng(7);
      for (let i = 0; i < 46; i++) stars += `<circle class="twinkle" style="--i:${i % 9}" cx="${(r() * 400).toFixed(1)}" cy="${(r() * 300).toFixed(1)}" r="${(0.6 + r() * 1.2).toFixed(2)}"/>`;
      return `<defs>${lin(g, [[0, '#140f2e'], [0.6, '#3b2a63'], [1, '#8a5a7c']])}</defs>
        <rect width="400" height="600" fill="url(#${g})"/>
        <g class="is-d1" fill="#fff">${stars}</g>
        <path class="is-d1" d="M-20 260 C80 200 220 120 420 60" stroke="#fff" stroke-opacity=".06" stroke-width="40" fill="none"/>
        <circle class="is-d1" cx="300" cy="120" r="22" fill="#f5ead2"/><circle class="is-d1" cx="309" cy="114" r="20" fill="#24194a"/>
        <path class="is-d2" d="M-40 390 L60 300 L130 360 L210 270 L300 350 L360 310 L440 360 V600 H-40Z" fill="#5c3f6e"/>
        <path class="is-d3" d="M-40 470 C60 440 140 450 220 460 S360 430 440 446 V600 H-40Z" fill="#c78a6a"/>
        <path class="is-d3" d="M-40 520 C80 500 200 512 280 520 S400 504 440 508 V600 H-40Z" fill="#a8684f"/>`;
    },
    kyoto() {
      const g = uid('g');
      let petals = '';
      const r = rng(3);
      for (let i = 0; i < 14; i++) petals += `<ellipse class="petal" style="--i:${i}" cx="${(r() * 400).toFixed(0)}" cy="${(r() * 300).toFixed(0)}" rx="3" ry="2" fill="#f7b8c6"/>`;
      return `<defs>${lin(g, [[0, '#f3b7a6'], [0.6, '#f9d9c0'], [1, '#f6e4cf']])}</defs>
        <rect width="400" height="600" fill="url(#${g})"/>
        <circle class="is-d1" cx="282" cy="200" r="58" fill="#e4553b"/>
        <path class="is-d1" d="M-40 380 C40 330 90 340 140 320 S240 290 300 320 S400 300 440 330 V600 H-40Z" fill="#cfa4a6" opacity=".75"/>
        <path class="is-d2" d="M-40 432 C60 392 160 412 240 402 S380 382 440 402 V600 H-40Z" fill="#8e5d6a"/>
        <g class="is-d2">${pagoda(110, 440, '#3b2730')}</g>
        <path class="is-d3" d="M-40 500 C80 480 200 490 300 500 S400 488 440 494 V600 H-40Z" fill="#2c1d24"/>
        <g class="is-d3">${torii(318, 576, '#c8402e')}</g>
        <g class="is-d3"><path d="M-10 70 C40 80 90 60 150 74" stroke="#3b2730" stroke-width="4" fill="none" stroke-linecap="round"/>
          <g fill="#f4a3b5"><circle cx="20" cy="66" r="16"/><circle cx="52" cy="78" r="14"/><circle cx="86" cy="64" r="15"/><circle cx="120" cy="76" r="12"/><circle cx="146" cy="68" r="10"/></g>
          <g fill="#f9c8d3"><circle cx="34" cy="60" r="9"/><circle cx="70" cy="70" r="8"/><circle cx="104" cy="60" r="8"/></g></g>
        <g>${petals}</g>`;
    },
    karst() {
      const g = uid('g'), s = uid('g');
      return `<defs>${lin(g, [[0, '#6fc3d0'], [1, '#fde7c2']])}${lin(s, [[0, '#2bb3b6'], [1, '#0b5d6b']])}</defs>
        <rect width="400" height="345" fill="url(#${g})"/>
        <rect y="344" width="400" height="256" fill="url(#${s})"/>
        <circle class="is-d1" cx="292" cy="248" r="40" fill="#fff3d6"/>
        ${birds(70, 150, '#0b5d6b', 0.4)}
        <g class="is-d1" fill="#8fbfae" opacity=".85"><path d="M180 345 C182 310 192 292 204 292 C216 292 220 316 222 345Z"/><path d="M350 345 C350 318 358 300 370 300 C384 300 388 322 390 345Z"/></g>
        <g class="is-d2"><path d="M30 346 C28 262 44 190 80 186 C116 182 124 250 126 346Z" fill="#2f6b52"/>
          <path d="M108 346 C112 292 124 252 146 250 C168 248 172 300 176 346Z" fill="#3e8463"/>
          <path d="M258 346 C254 282 270 220 300 216 C330 212 340 270 344 346Z" fill="#2f6b52"/>
          <path d="M44 230 C60 214 90 214 112 232" stroke="#4e9a6f" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/>
          <g opacity=".22" fill="#0b3d3a"><path d="M30 348 H126 L116 400 H40Z"/><path d="M258 348 H344 L334 392 H268Z"/></g></g>
        <path class="is-d3 wave" d="M-40 420 Q60 406 160 420 T360 420 T560 418" fill="none" stroke="#bfe6e8" stroke-width="2" opacity=".5"/>
        <path class="is-d3 wave" d="M-40 540 Q60 526 160 540 T360 540 T560 538" fill="none" stroke="#bfe6e8" stroke-width="2" opacity=".3"/>
        <g class="is-d3 bob"><path d="M140 476 Q230 500 304 470 L296 486 Q228 508 150 490Z" fill="#7a4a2a"/>
          <rect x="196" y="452" width="58" height="24" rx="3" fill="#f2e2c4"/><rect x="194" y="448" width="62" height="6" fill="#c8553a"/>
          <path d="M304 470 L322 452 L316 474Z" fill="#e4553b"/><path d="M150 486 L128 500" stroke="#3a2a1a" stroke-width="3"/></g>`;
    },
    santorini() {
      const g = uid('g'), s = uid('g');
      const houses = [[18, 328, 46, 44, 0], [60, 314, 40, 58, 1], [104, 334, 52, 38, 0], [150, 308, 38, 62, 0], [186, 324, 50, 48, 1], [240, 316, 44, 52, 0], [282, 332, 56, 34, 0], [330, 310, 42, 60, 1], [368, 328, 50, 44, 0],
        [0, 372, 60, 34, 0], [70, 368, 50, 38, 0], [128, 374, 70, 32, 0], [208, 366, 54, 40, 0], [270, 372, 60, 34, 0], [338, 368, 60, 38, 0]];
      let hs = '';
      houses.forEach(([x, y, w, h, dome]) => {
        hs += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fbfaf6"/><rect x="${x + w - 8}" y="${y}" width="8" height="${h}" fill="#e6e1d6"/>`;
        hs += `<rect x="${x + w * 0.3}" y="${y + h * 0.35}" width="7" height="10" rx="3" fill="#2b6cc4"/>`;
        if (dome) hs += `<path d="M${x + 4} ${y} A${w / 2 - 4} ${w / 2 - 4} 0 0 1 ${x + w - 4} ${y}Z" fill="#2b6cc4"/><rect x="${x + w / 2 - 1}" y="${y - w / 2 - 6}" width="2" height="8" fill="#fbfaf6"/>`;
      });
      return `<defs>${lin(g, [[0, '#8fcaf0'], [1, '#fbe8d0']])}${lin(s, [[0, '#3a86d1'], [1, '#16508f']])}</defs>
        <rect width="400" height="600" fill="url(#${g})"/>
        <g class="drift">${cloud(300, 110, 0.8, 0.8)}</g>
        <circle class="is-d1" cx="90" cy="236" r="34" fill="#fff3d6"/>
        <rect class="is-d1" y="270" width="400" height="330" fill="url(#${s})"/>
        <path class="is-d1" d="M-40 272 Q100 268 200 272 T440 272" stroke="#cfe6f5" stroke-width="2" fill="none" opacity=".6"/>
        <path class="is-d2" d="M-40 600 V380 C40 370 80 350 120 360 C170 372 200 340 250 352 C300 364 360 340 440 350 V600Z" fill="#a8634a"/>
        <path class="is-d2" d="M-40 600 V440 C60 430 140 450 220 436 S360 446 440 430 V600Z" fill="#8a4c39"/>
        <g class="is-d2">${hs}</g>
        <g class="is-d3"><path d="M-40 600 V508 H210 V486 H440 V600Z" fill="#fbfaf6"/>
          <path d="M276 486 A56 56 0 0 1 388 486Z" fill="#2b6cc4"/><rect x="330" y="420" width="4" height="14" fill="#fbfaf6"/><rect x="326" y="424" width="12" height="3" fill="#fbfaf6"/>
          <g fill="#d6408f"><circle cx="30" cy="500" r="10"/><circle cx="48" cy="494" r="8"/><circle cx="16" cy="492" r="7"/><circle cx="60" cy="502" r="6"/></g>
          <g fill="#3f6b35"><circle cx="38" cy="508" r="5"/><circle cx="68" cy="510" r="4"/></g></g>`;
    },
    amalfi() {
      const g = uid('g'), s = uid('g'), r = rng(11);
      const cols = ['#f6d37a', '#f2a38a', '#fbe9d0', '#e9b8c4', '#f7c27a', '#fff6e8', '#f4b26b'];
      let hs = '';
      for (let row = 0; row < 7; row++) {
        const y = 286 + row * 34, max = 150 + row * 44;
        for (let x = -10; x < max; x += 30 + r() * 14) {
          const w = 28 + r() * 14, h = 26 + r() * 10, c = cols[Math.floor(r() * cols.length)];
          hs += `<rect x="${x.toFixed(0)}" y="${(y - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 8).toFixed(0)}" fill="${c}"/>`;
          hs += `<rect x="${(x + w * 0.3).toFixed(0)}" y="${(y - h * 0.6).toFixed(0)}" width="5" height="7" fill="#5a4636" opacity=".7"/>`;
        }
      }
      return `<defs>${lin(g, [[0, '#f6b98a'], [0.6, '#fde6c4']])}${lin(s, [[0, '#3aa0bf'], [1, '#1b6f8f']])}</defs>
        <rect width="400" height="600" fill="url(#${g})"/>
        <circle class="is-d1" cx="300" cy="170" r="46" fill="#fff0d0"/>
        ${birds(220, 120, '#7a4f2e', 0.4)}
        <rect class="is-d1" y="380" width="400" height="220" fill="url(#${s})"/>
        <path class="is-d1 wave" d="M200 420 Q260 412 320 420 T440 420 T560 420" stroke="#d6f0f5" stroke-width="2" fill="none" opacity=".5"/>
        <path class="is-d2" d="M-40 600 V300 C40 250 120 230 200 262 C260 286 300 322 350 336 C380 346 410 372 440 392 V600Z" fill="#6f8d4f"/>
        <g class="is-d2">${hs}</g>
        <g class="is-d3"><path d="M330 470 Q350 452 372 468 Q350 484 330 470Z" fill="#fbfaf6"/><rect x="348" y="440" width="2" height="30" fill="#fbfaf6"/><path d="M350 442 L370 462 H350Z" fill="#fff" opacity=".9"/></g>
        <g class="is-d3"><path d="M-20 560 C40 540 90 560 140 540" stroke="#3f6b35" stroke-width="5" fill="none" stroke-linecap="round"/>
          <g fill="#3f6b35"><ellipse cx="30" cy="534" rx="18" ry="7" transform="rotate(-24 30 534)"/><ellipse cx="96" cy="538" rx="18" ry="7" transform="rotate(20 96 538)"/><ellipse cx="124" cy="560" rx="16" ry="6" transform="rotate(-30 124 560)"/></g>
          <g fill="#f5d13b"><ellipse cx="54" cy="572" rx="16" ry="20"/><ellipse cx="110" cy="572" rx="14" ry="18"/></g>
          <g fill="#fff3a6" opacity=".6"><ellipse cx="49" cy="564" rx="4" ry="6"/><ellipse cx="106" cy="565" rx="3.5" ry="5"/></g></g>`;
    },
    andes() {
      const g = uid('g');
      let terr = '';
      for (let i = 0; i < 6; i++) {
        const y = 470 + i * 24, c = i % 2 ? '#5e8a44' : '#6f9a52';
        terr += `<path d="M-40 ${y} H${40 + i * 18} L${52 + i * 18} ${y - 6} H${260 - i * 10} L${272 - i * 10} ${y} H440 V600 H-40Z" fill="${c}"/>`;
      }
      return `<defs>${lin(g, [[0, '#9ec3de'], [1, '#eef0e4']])}</defs>
        <rect width="400" height="600" fill="url(#${g})"/>
        <g class="drift">${cloud(80, 140, 1, 0.8)}${cloud(320, 210, 1.2, 0.7)}</g>
        <path class="is-d1" d="M-40 360 L40 260 L90 300 L160 200 L230 290 L290 230 L360 300 L440 250 V600 H-40Z" fill="#8aa0b4"/>
        <g class="is-d1" fill="#fbfdff"><path d="M138 228 L160 200 L182 230 L168 224 L160 234 L150 226Z"/><path d="M272 252 L290 230 L308 254 L296 250 L290 258Z"/><path d="M26 278 L40 260 L54 280 L44 276Z"/></g>
        <path class="is-d2" d="M-40 470 C40 430 100 420 170 466Z" fill="#557d45"/>
        <path class="is-d2" d="M150 472 C160 380 190 300 230 290 C262 284 282 360 304 472Z" fill="#3f6a3a"/>
        <path class="is-d2" d="M206 330 C214 312 236 306 248 318" stroke="#5e8a44" stroke-width="6" fill="none" opacity=".6"/>
        <g class="is-d3">${terr}<g fill="#b8b1a3"><rect x="60" y="474" width="34" height="14"/><rect x="104" y="468" width="22" height="20"/><rect x="40" y="498" width="44" height="12"/><rect x="230" y="496" width="30" height="14"/><path d="M104 468 L115 458 L126 468Z" fill="#8a6a4a"/></g></g>`;
    },
  };
  function scene(name, cls = 'art') { return svg('0 0 400 600', (SCENES[name] || SCENES.dunes)(), cls); }

  /* ---------- capa (1600 x 900) ---------- */
  function hero() {
    const sky = uid('s'), sea = uid('s'), sun = uid('r'), trail = uid('t');
    let sparks = '';
    const r = rng(5);
    for (let i = 0; i < 26; i++) sparks += `<rect class="spark" style="--i:${i % 7}" x="${(r() * 1600).toFixed(0)}" y="${(650 + r() * 90).toFixed(0)}" width="${(10 + r() * 30).toFixed(0)}" height="2" rx="1" fill="#e9fbfb"/>`;
    return `<svg class="hero-svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>${lin(sky, [[0, '#f5d4bb'], [0.5, '#f8e5d2'], [1, '#efe7da']])}${lin(sea, [[0, '#6fb9bd'], [1, '#2f7f8a']])}${rad(sun, [[0, '#fff3dc'], [0.55, '#ffe2bd', 0.8], [1, '#ffd9a8', 0]])}</defs>
      <rect width="1600" height="900" fill="url(#${sky})"/>
      <g data-depth=".5"><circle cx="1190" cy="350" r="230" fill="url(#${sun})"/><circle cx="1190" cy="350" r="96" fill="#ffe7c4"/></g>
      <g data-depth=".45" class="drift-slow">${cloud(240, 190, 2.4, 0.75)}${cloud(860, 130, 1.6, 0.6)}${cloud(1450, 210, 2, 0.7)}</g>
      <path id="${trail}" d="M-120 470 C260 380 620 430 980 300 S1460 140 1760 170" fill="none"/>
      <g data-depth=".4"><use href="#${trail}" stroke="#1d1a16" stroke-opacity=".22" stroke-width="2" stroke-dasharray="2 12" stroke-linecap="round" class="trail"/>
        <g><path d="M-16 0 L10 -2.4 L18 0 L10 2.4Z M-2 -1.6 L-10 -14 L-5 -14 L7 -1.6Z M-2 1.6 L-10 14 L-5 14 L7 1.6Z M-13 -1 L-18 -7 L-15 -7 L-9 -1Z M-13 1 L-18 7 L-15 7 L-9 1Z" fill="#1d1a16" transform="scale(1.7)"/>
          <animateMotion dur="26s" repeatCount="indefinite" rotate="auto"><mpath href="#${trail}"/></animateMotion></g></g>
      <g transform="translate(0 70)"><g data-depth=".32"><path d="M0 590 C90 560 150 520 240 520 S380 470 470 500 S600 440 700 470 S860 520 960 500 S1110 430 1220 470 S1420 520 1600 480 V900 H0Z" fill="#e7c2a6"/></g>
      <g data-depth=".24"><path d="M0 630 C140 590 260 600 380 570 S600 590 720 620 S980 560 1120 590 S1420 620 1600 580 V900 H0Z" fill="#d39f86"/>
        <path d="M980 640 C1040 560 1090 520 1120 520 C1150 520 1180 580 1220 640Z" fill="#b98270"/></g>
      <g data-depth=".15"><rect y="646" width="1600" height="260" fill="url(#${sea})"/><rect y="646" width="1600" height="4" fill="#e9fbfb" opacity=".6"/>${sparks}
        <g class="bob"><path d="M520 712 Q560 724 604 708 L598 718 Q560 732 526 720Z" fill="#fbfaf6"/><rect x="560" y="676" width="2.5" height="34" fill="#fbfaf6"/><path d="M563 678 L590 704 H563Z" fill="#fff"/></g></g>
      <g data-depth=".06"><path d="M0 790 C200 730 380 750 560 790 S900 850 1100 800 S1450 750 1600 780 V900 H0Z" fill="#2f4a3e"/>
        ${palm(30, 810, 150, '#24392f', 1, 0.95)}${palm(1440, 790, 230, '#24392f', -1, 1.3)}${palm(1530, 800, 160, '#2f4a3e', -1, 1)}
        <path d="M0 860 C300 830 700 850 1000 860 S1400 840 1600 850 V900 H0Z" fill="#1f3329"/></g></g>
    </svg>`;
  }

  /* ---------- vinhetas das categorias (300 x 200) ---------- */
  const pine = (x, y, h, c) => `<path d="M${x} ${y - h} L${x + h * 0.32} ${y} H${x - h * 0.32}Z" fill="${c}"/>`;
  const CAT_ART = {
    praia(r) {
      const g = uid('g'), sx = 50 + r() * 120;
      return `<defs>${lin(g, [[0, '#9fd6e4'], [1, '#fde9cf']])}</defs><rect width="300" height="200" fill="url(#${g})"/>
        <circle cx="${sx}" cy="64" r="22" fill="#fff4dc"/>${birds(200, 50, '#1d1a16', 0.35)}
        <rect y="104" width="300" height="50" fill="#38a6b6"/><rect y="104" width="300" height="3" fill="#c9eef0" opacity=".7"/>
        <path class="wave" d="M-20 124 Q20 118 60 124 T140 124 T220 124 T300 124 T380 124" stroke="#c9eef0" stroke-width="2" fill="none" opacity=".6"/>
        <path d="M0 152 C70 140 150 148 300 136 V200 H0Z" fill="#f4dfba"/><path d="M0 152 C70 140 150 148 300 136" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>
        <line x1="210" y1="184" x2="222" y2="120" stroke="#6b4529" stroke-width="3"/>
        <path d="M180 130 Q222 94 264 118Z" fill="#e4553b"/><path d="M208 114 Q222 100 238 108 L222 122Z" fill="#fff" opacity=".85"/>
        <rect x="112" y="168" width="44" height="14" rx="2" fill="#2b6cc4" transform="rotate(-6 134 175)"/>`;
    },
    cultura(r, v) {
      const g = uid('g');
      if (v === 'pagoda') return `<defs>${lin(g, [[0, '#f3b7a6'], [1, '#f9e0c8']])}</defs><rect width="300" height="200" fill="url(#${g})"/>
        <circle cx="${190 + r() * 50}" cy="70" r="30" fill="#e4553b"/>${birds(40, 50, '#3b2730')}
        <path d="M0 150 C60 130 140 140 300 128 V200 H0Z" fill="#8e5d6a"/>${pagoda(90, 170, '#3b2730', 4, 0.45)}
        <rect y="168" width="300" height="32" fill="#2c1d24"/>
        <g transform="translate(-30 -6) scale(.55)" fill="#c8402e"><rect x="432" y="190" width="10" height="130"/><rect x="510" y="190" width="10" height="130"/><rect x="420" y="208" width="112" height="8"/><path d="M406 180 Q476 194 546 180 L540 192 Q476 204 412 192Z"/></g>`;
      if (v === 'church') return `<defs>${lin(g, [[0, '#a9d4e6'], [1, '#f6e6cf']])}</defs><rect width="300" height="200" fill="url(#${g})"/>
        ${cloud(70, 50, 0.8, 0.8)}${birds(210, 40)}
        <rect y="168" width="300" height="32" fill="#b9a27e"/>
        <rect x="96" y="96" width="108" height="76" fill="#fbf6ec"/><path d="M90 98 L150 64 L210 98Z" fill="#fbf6ec"/><path d="M90 98 L150 64 L210 98" stroke="#d8c7a8" stroke-width="3" fill="none"/>
        <rect x="134" y="26" width="32" height="74" fill="#fbf6ec"/><path d="M130 28 L150 8 L170 28Z" fill="#c8553a"/><rect x="148" y="0" width="4" height="10" fill="#7a4f2e"/>
        <path d="M142 58 a8 8 0 0 1 16 0 v14 h-16z" fill="#7a4f2e"/><path d="M136 172 V138 a14 14 0 0 1 28 0 V172Z" fill="#2b6cc4"/>
        <circle cx="150" cy="114" r="7" fill="none" stroke="#d8c7a8" stroke-width="3"/>
        <rect x="108" y="128" width="12" height="20" rx="6" fill="#2b6cc4"/><rect x="180" y="128" width="12" height="20" rx="6" fill="#2b6cc4"/>
        <ellipse cx="60" cy="168" rx="34" ry="14" fill="#5e8a44"/><ellipse cx="250" cy="168" rx="30" ry="12" fill="#4f7a45"/>`;
      if (v === 'ruins') {
        let t = '';
        for (let i = 0; i < 4; i++) t += `<path d="M0 ${130 + i * 18} H${70 + i * 20} L${78 + i * 20} ${126 + i * 18} H300 V200 H0Z" fill="${i % 2 ? '#5e8a44' : '#6f9a52'}"/>`;
        return `<defs>${lin(g, [[0, '#9ec3de'], [1, '#eef0e4']])}</defs><rect width="300" height="200" fill="url(#${g})"/>
          ${cloud(240, 40, 0.7, 0.85)}
          <path d="M0 120 L50 80 L80 100 L120 60 L160 100 L210 70 L300 110 V200 H0Z" fill="#8aa0b4"/>
          <path d="M150 140 C158 90 176 60 196 58 C214 56 226 96 236 140Z" fill="#3f6a3a"/>${t}
          <g fill="#b8b1a3"><rect x="40" y="132" width="26" height="12"/><rect x="72" y="126" width="18" height="18"/><rect x="100" y="148" width="34" height="12"/><rect x="200" y="152" width="24" height="12"/><path d="M72 126 L81 118 L90 126Z" fill="#8a6a4a"/></g>`;
      }
      let cols = '';
      for (let i = 0; i < 6; i++) { const x = 80 + i * 28; cols += `<rect x="${x}" y="84" width="12" height="56" fill="#fbf3e6"/><rect x="${x + 8}" y="84" width="4" height="56" fill="#e2cdb0"/>`; }
      return `<defs>${lin(g, [[0, '#f3c2a3'], [1, '#f8e5d0']])}</defs><rect width="300" height="200" fill="url(#${g})"/>
        <circle cx="${200 + r() * 60}" cy="56" r="24" fill="#fff0d8"/>${birds(40, 46)}
        <rect y="160" width="300" height="40" fill="#c98a66"/>
        <rect x="58" y="150" width="184" height="12" fill="#efe1cc"/><rect x="68" y="140" width="164" height="12" fill="#f6ead8"/>
        ${cols}<rect x="70" y="72" width="160" height="12" fill="#f6ead8"/>
        <path d="M64 72 L150 38 L236 72Z" fill="#fbf3e6"/><path d="M88 68 L150 45 L212 68Z" fill="#ead8bf"/>`;
    },
    natureza(r) {
      const g = uid('g');
      return `<defs>${lin(g, [[0, '#cfe5d6'], [1, '#f2f1e0']])}</defs><rect width="300" height="200" fill="url(#${g})"/>
        <circle cx="${60 + r() * 60}" cy="50" r="18" fill="#fffbe8"/>
        <path d="M0 120 L50 70 L90 100 L140 50 L190 96 L240 64 L300 110 V200 H0Z" fill="#a7c6a2"/>
        <path d="M146 200 V98 L170 88 L180 200Z" fill="#7a9a6e"/><rect class="fall" x="160" y="92" width="9" height="108" fill="#eaf8f8"/>
        <path d="M0 150 C60 130 120 142 160 152 S250 130 300 140 V200 H0Z" fill="#6f9a62"/>
        <ellipse cx="166" cy="190" rx="44" ry="8" fill="#9bd4d6"/>
        ${pine(30, 170, 60, '#2f4a2a')}${pine(58, 176, 44, '#3f5f36')}${pine(240, 172, 56, '#2f4a2a')}${pine(268, 180, 40, '#3f5f36')}${pine(212, 182, 34, '#3f5f36')}`;
    },
    gastronomia() {
      const g = uid('g');
      return `<defs>${lin(g, [[0, '#f6d3a0'], [1, '#e99a66']])}</defs><rect width="300" height="200" fill="url(#${g})"/>
        <ellipse cx="150" cy="214" rx="230" ry="72" fill="#7a4a2a"/><ellipse cx="150" cy="212" rx="230" ry="70" fill="none" stroke="#9a6440" stroke-width="2"/>
        <ellipse cx="128" cy="152" rx="62" ry="22" fill="#fffaf2"/><ellipse cx="128" cy="150" rx="44" ry="14" fill="#f2e6d2"/>
        <circle cx="114" cy="146" r="8" fill="#e4553b"/><circle cx="132" cy="142" r="7" fill="#6f955f"/><circle cx="146" cy="150" r="8" fill="#f5c542"/><circle cx="122" cy="154" r="5" fill="#8a4a2a"/>
        <g stroke="#fff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"><path class="steam" d="M118 122 c-6 -8 6 -14 0 -24"/><path class="steam" style="--i:2" d="M138 118 c-6 -8 6 -14 0 -24"/></g>
        <path d="M222 92 h30 c0 22 -6 34 -15 34 s-15 -12 -15 -34z" fill="#8a1f2d" opacity=".92"/><path d="M222 92 h30" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>
        <rect x="235.5" y="126" width="3" height="26" fill="#fff" opacity=".85"/><ellipse cx="237" cy="153" rx="14" ry="3.5" fill="#fff" opacity=".85"/>`;
    },
    mirante(r) {
      const g = uid('g');
      let posts = '';
      for (let x = 6; x < 300; x += 30) posts += `<rect x="${x}" y="170" width="3" height="30" fill="#1d1a16"/>`;
      return `<defs>${lin(g, [[0, '#8f7bc4'], [1, '#f5b892']])}</defs><rect width="300" height="200" fill="url(#${g})"/>
        <circle cx="${70 + r() * 150}" cy="126" r="30" fill="#ffe0b0"/>${birds(60, 50, '#2a2040', 0.5)}
        <path d="M0 130 L40 110 L80 124 L130 96 L180 122 L230 104 L300 128 V200 H0Z" fill="#6c5a94"/>
        <path d="M0 158 C60 140 120 150 180 140 S260 150 300 144 V200 H0Z" fill="#43366a"/>
        <rect y="168" width="300" height="4" fill="#1d1a16"/>${posts}
        <g fill="#1d1a16"><rect x="204" y="138" width="36" height="16" rx="6"/><rect x="219" y="154" width="5" height="16"/><circle cx="208" cy="146" r="6"/></g>`;
    },
  };
  const CULTURE = { kyoto: 'pagoda', karst: 'pagoda', andes: 'ruins', santorini: 'temple' };
  function cat(name, seed = 1, scene) { return svg('0 0 300 200', (CAT_ART[name] || CAT_ART.natureza)(rng(hash(name) + seed * 97), CULTURE[scene] || 'church')); }

  /* ---------- interiores (400 x 300) ---------- */
  function horizon(st, x, y, w, h) {
    const g = uid('g'), [s1, s2] = st.dest.roomSky || st.dest.sky, hy = y + h * 0.62;
    let o = `<defs>${lin(g, [[0, s1], [1, s2]])}</defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${g})"/>`;
    o += `<circle cx="${x + w * 0.72}" cy="${y + h * 0.3}" r="${Math.min(w, h) * 0.09}" fill="#fff4dc" opacity=".95"/>`;
    switch (st.vista) {
      case 'sea':
        o += `<rect x="${x}" y="${hy}" width="${w}" height="${y + h - hy}" fill="#2f8fb0"/><rect x="${x}" y="${hy}" width="${w}" height="3" fill="#bfe6e8" opacity=".6"/>
          <path d="M${x} ${hy + h * 0.14} q${w * 0.1} -4 ${w * 0.2} 0 t${w * 0.2} 0 t${w * 0.2} 0 t${w * 0.2} 0 t${w * 0.2} 0" stroke="#bfe6e8" stroke-width="1.5" fill="none" opacity=".45"/>`;
        break;
      case 'hills':
        o += `<path d="M${x} ${hy} C${x + w * 0.3} ${hy - h * 0.2} ${x + w * 0.6} ${hy - h * 0.04} ${x + w} ${hy - h * 0.16} V${y + h} H${x}Z" fill="#9db58f"/><path d="M${x} ${hy + h * 0.12} C${x + w * 0.4} ${hy} ${x + w * 0.7} ${hy + h * 0.1} ${x + w} ${hy + h * 0.04} V${y + h} H${x}Z" fill="#6f955f"/>`;
        break;
      case 'mountain': {
        const px = x + w * 0.62, py = hy - h * 0.42;
        o += `<path d="M${x} ${hy} L${x + w * 0.24} ${hy - h * 0.3} L${x + w * 0.42} ${hy - h * 0.12} L${px} ${py} L${x + w} ${hy - h * 0.06} V${y + h} H${x}Z" fill="#8aa0b4"/>
          <path d="M${px - w * 0.07} ${py + h * 0.1} L${px} ${py} L${px + w * 0.07} ${py + h * 0.1} L${px + w * 0.02} ${py + h * 0.08}Z" fill="#fff"/>
          <path d="M${x} ${hy + h * 0.1} C${x + w * 0.4} ${hy} ${x + w * 0.7} ${hy + h * 0.12} ${x + w} ${hy + h * 0.06} V${y + h} H${x}Z" fill="#5e8a44"/>`;
        break;
      }
      case 'dunes':
        o += `<path d="M${x} ${hy} C${x + w * 0.3} ${hy - h * 0.12} ${x + w * 0.6} ${hy} ${x + w} ${hy - h * 0.08} V${y + h} H${x}Z" fill="#f7ecdc"/>
          <ellipse cx="${x + w * 0.4}" cy="${hy + h * 0.16}" rx="${w * 0.22}" ry="${h * 0.04}" fill="#3fb3c4"/>
          <path d="M${x} ${hy + h * 0.24} C${x + w * 0.4} ${hy + h * 0.16} ${x + w * 0.7} ${hy + h * 0.26} ${x + w} ${hy + h * 0.2} V${y + h} H${x}Z" fill="#fbf4e8"/>`;
        break;
      case 'city': {
        let b = '';
        const r = rng(hash(st.id));
        for (let bx = x - 4; bx < x + w; bx += w * 0.12) { const bh = h * (0.12 + r() * 0.2); b += `<rect x="${bx}" y="${hy - bh}" width="${w * 0.1}" height="${bh + h}" fill="#7a6266" opacity=".85"/><path d="M${bx - 3} ${hy - bh} L${bx + w * 0.05} ${hy - bh - 7} L${bx + w * 0.1 + 3} ${hy - bh}Z" fill="#5a4448"/>`; }
        o += b + `<rect x="${x}" y="${hy + h * 0.1}" width="${w}" height="${h}" fill="#6f955f"/>`;
        break;
      }
      case 'mesa':
        o += `<path d="M${x} ${hy} H${x + w * 0.1} L${x + w * 0.16} ${hy - h * 0.22} H${x + w * 0.48} L${x + w * 0.54} ${hy} H${x + w * 0.62} L${x + w * 0.68} ${hy - h * 0.14} H${x + w} V${y + h} H${x}Z" fill="#c56a3d"/>
          <path d="M${x} ${hy + h * 0.12} C${x + w * 0.4} ${hy + h * 0.04} ${x + w * 0.7} ${hy + h * 0.14} ${x + w} ${hy + h * 0.08} V${y + h} H${x}Z" fill="#7d8f4f"/>`;
        break;
    }
    return o;
  }
  function win(st, x, y, w, h, frame = '#fff') {
    const c = uid('c');
    return `<defs><clipPath id="${c}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath></defs>
      <g clip-path="url(#${c})">${horizon(st, x, y, w, h)}</g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${frame}" stroke-width="6"/>
      <line x1="${x + w / 2}" x2="${x + w / 2}" y1="${y}" y2="${y + h}" stroke="${frame}" stroke-width="4"/>`;
  }
  function boards(y, p) {
    let o = `<rect y="${y}" width="400" height="${300 - y}" fill="${p.floor}"/>`;
    for (let i = 1; i < 6; i++) { const yy = y + (i * (300 - y)) / 6 + i * i * 0.6; o += `<line x1="0" x2="400" y1="${yy}" y2="${yy}" stroke="#000" stroke-opacity=".07"/>`; }
    return o;
  }
  const lamp = (x, p) => `<line x1="${x}" y1="0" x2="${x}" y2="54" stroke="${p.wood}" stroke-width="1.5"/><path d="M${x - 18} 70 Q${x} 44 ${x + 18} 70Z" fill="${p.wood}"/><ellipse class="glow" cx="${x}" cy="76" rx="30" ry="8" fill="#ffe9b0" opacity=".5"/>`;

  const ROOMS = {
    living(st) {
      const p = st.pal;
      return `<rect width="400" height="300" fill="${p.wall}"/>${boards(214, p)}<rect y="208" width="400" height="6" fill="${p.wood}" opacity=".5"/>
        ${win(st, 226, 34, 146, 132)}
        <rect x="44" y="52" width="74" height="54" fill="#fff" opacity=".7"/><rect x="50" y="58" width="62" height="42" fill="${p.accent}" opacity=".85"/><circle cx="92" cy="72" r="8" fill="#fff4dc"/><path d="M50 100 L70 80 L84 92 L96 84 L112 100Z" fill="#000" opacity=".2"/>
        ${lamp(170, p)}
        <ellipse cx="160" cy="270" rx="140" ry="20" fill="${p.fabric}" opacity=".9"/>
        <rect x="30" y="150" width="200" height="56" rx="16" fill="${p.accent}"/><rect x="22" y="182" width="216" height="44" rx="12" fill="${p.accent}"/><rect x="22" y="182" width="216" height="44" rx="12" fill="#000" opacity=".12"/>
        <rect x="44" y="160" width="58" height="34" rx="10" fill="${p.fabric}"/><rect x="152" y="160" width="58" height="34" rx="10" fill="${p.fabric}" opacity=".9"/>
        <rect x="34" y="224" width="5" height="14" fill="${p.wood}"/><rect x="221" y="224" width="5" height="14" fill="${p.wood}"/>
        <ellipse cx="206" cy="252" rx="52" ry="9" fill="${p.wood}"/><rect x="202" y="254" width="8" height="18" fill="${p.wood}"/><rect x="190" y="238" width="18" height="10" fill="#fff" opacity=".85"/><circle cx="222" cy="244" r="5" fill="${p.accent}"/>
        ${plant(352, 240)}`;
    },
    bedroom(st) {
      const p = st.pal;
      return `<rect width="400" height="300" fill="${p.wall}"/>${boards(220, p)}
        ${win(st, 28, 40, 104, 124)}<rect x="14" y="30" width="20" height="160" fill="${p.fabric}" opacity=".95"/><rect x="126" y="30" width="20" height="160" fill="${p.fabric}" opacity=".95"/><rect x="10" y="26" width="140" height="5" fill="${p.wood}"/>
        <rect x="206" y="44" width="40" height="40" fill="#fff" opacity=".7"/><rect x="210" y="48" width="32" height="32" fill="${p.accent}" opacity=".6"/><rect x="256" y="40" width="54" height="44" fill="#fff" opacity=".7"/><rect x="260" y="44" width="46" height="36" fill="${p.wood}" opacity=".5"/><rect x="320" y="48" width="36" height="36" fill="#fff" opacity=".7"/><circle cx="338" cy="66" r="12" fill="${p.accent}" opacity=".7"/>
        <rect x="186" y="104" width="190" height="86" rx="10" fill="${p.wood}"/>
        <rect x="176" y="176" width="210" height="52" rx="6" fill="${p.fabric}"/>
        <rect x="176" y="196" width="210" height="36" rx="4" fill="${p.accent}"/><rect x="176" y="192" width="210" height="8" fill="${p.fabric}" opacity=".7"/>
        <rect x="200" y="156" width="66" height="28" rx="10" fill="#fff"/><rect x="292" y="156" width="66" height="28" rx="10" fill="#fff"/>
        <rect x="182" y="230" width="6" height="12" fill="${p.wood}"/><rect x="374" y="230" width="6" height="12" fill="${p.wood}"/>
        <rect x="146" y="186" width="28" height="44" fill="${p.wood}"/><rect x="146" y="200" width="28" height="2" fill="#000" opacity=".2"/>
        <path d="M150 154 H170 L166 172 H154Z" fill="${p.fabric}"/><rect x="159" y="172" width="2" height="14" fill="${p.wood}"/><ellipse class="glow" cx="160" cy="166" rx="22" ry="14" fill="#ffe9b0" opacity=".35"/>
        <ellipse cx="270" cy="276" rx="120" ry="14" fill="${p.fabric}" opacity=".6"/>`;
    },
    bath(st) {
      const p = st.pal, t = uid('p');
      return `<defs><pattern id="${t}" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${p.wall}"/><path d="M24 0V24H0" fill="none" stroke="#000" stroke-opacity=".07"/></pattern></defs>
        <rect width="400" height="300" fill="url(#${t})"/><rect y="226" width="400" height="74" fill="${p.floor}"/><path d="M0 250 H400 M0 276 H400 M80 226 L60 300 M200 226 V300 M320 226 L340 300" stroke="#000" stroke-opacity=".07"/>
        ${win(st, 40, 30, 110, 92)}
        <circle cx="306" cy="92" r="44" fill="#e6eff0" stroke="${p.wood}" stroke-width="4"/><path d="M282 76 L300 60 M286 96 L318 66" stroke="#fff" stroke-width="4" opacity=".8" stroke-linecap="round"/>
        <rect x="252" y="160" width="108" height="52" fill="${p.wood}"/><rect x="252" y="160" width="108" height="6" fill="#000" opacity=".1"/><ellipse cx="306" cy="160" rx="32" ry="7" fill="#fff"/><path d="M306 154 V140 H316" stroke="#9a9a9a" stroke-width="3" fill="none"/>
        <path d="M30 184 Q30 238 86 240 H198 Q246 238 246 184Z" fill="#fff"/><rect x="24" y="178" width="228" height="12" rx="6" fill="#fff"/><path d="M30 184 Q30 238 86 240 H198 Q246 238 246 184Z" fill="#000" opacity=".04"/>
        <rect x="62" y="238" width="10" height="10" rx="3" fill="#c9b8a0"/><rect x="204" y="238" width="10" height="10" rx="3" fill="#c9b8a0"/>
        <path d="M56 178 V146 Q56 136 66 136 H78" stroke="#9a9a9a" stroke-width="4" fill="none"/>
        <rect x="364" y="120" width="5" height="70" fill="${p.wood}"/><rect x="354" y="128" width="26" height="46" rx="3" fill="${p.accent}" opacity=".8"/>
        ${plant(372, 290, 0.8)}`;
    },
    kitchen(st) {
      const p = st.pal;
      let cab = '';
      for (let x = 50; x < 400; x += 50) cab += `<line x1="${x}" y1="160" x2="${x}" y2="224" stroke="#000" stroke-opacity=".12"/><rect x="${x - 30}" y="186" width="10" height="3" rx="1.5" fill="#fff" opacity=".6"/>`;
      return `<rect width="400" height="300" fill="${p.wall}"/>${boards(232, p)}
        ${win(st, 142, 24, 116, 92)}
        <rect x="16" y="70" width="100" height="4" fill="${p.wood}"/><rect x="24" y="48" width="14" height="22" rx="3" fill="${p.accent}" opacity=".7"/><rect x="44" y="54" width="12" height="16" rx="3" fill="#fff" opacity=".8"/><rect x="62" y="44" width="16" height="26" rx="3" fill="${p.wood}" opacity=".6"/><circle cx="96" cy="60" r="10" fill="#fff" opacity=".8"/>
        <rect x="284" y="70" width="100" height="4" fill="${p.wood}"/><circle cx="302" cy="58" r="12" fill="#fff" opacity=".85"/><circle cx="330" cy="58" r="12" fill="${p.accent}" opacity=".6"/><rect x="352" y="46" width="18" height="24" rx="3" fill="#fff" opacity=".8"/>
        <rect y="152" width="400" height="74" fill="${p.wood}"/>${cab}<rect y="146" width="400" height="8" fill="#f3efe6"/>
        ${[130, 200, 270].map(x => `<line x1="${x}" y1="0" x2="${x}" y2="90" stroke="#333" stroke-opacity=".4"/><path d="M${x - 12} 100 Q${x} 82 ${x + 12} 100Z" fill="${p.accent}"/><ellipse class="glow" cx="${x}" cy="104" rx="16" ry="5" fill="#ffe9b0" opacity=".5"/>`).join('')}
        <rect x="92" y="198" width="216" height="58" fill="${p.accent}"/><rect x="92" y="198" width="216" height="58" fill="#000" opacity=".1"/><rect x="84" y="190" width="232" height="10" rx="2" fill="#f3efe6"/>
        <ellipse cx="200" cy="188" rx="26" ry="7" fill="${p.wood}"/><circle cx="192" cy="182" r="7" fill="#f5a524"/><circle cx="204" cy="180" r="7" fill="#e4553b"/><circle cx="212" cy="185" r="6" fill="#9bbf5a"/>
        ${[130, 200, 270].map(x => `<rect x="${x - 15}" y="254" width="30" height="7" rx="3" fill="${p.wood}"/><path d="M${x - 10} 261 L${x - 14} 298 M${x + 10} 261 L${x + 14} 298" stroke="${p.wood}" stroke-width="3"/>`).join('')}`;
    },
    pool(st) {
      const p = st.pal;
      let pl = '';
      for (let x = -200; x <= 600; x += 50) pl += `<line x1="${200 + (x - 200) * 0.35}" y1="172" x2="${x}" y2="300" stroke="#000" stroke-opacity=".08"/>`;
      return `${horizon(st, 0, 0, 400, 200)}
        <rect y="170" width="400" height="130" fill="${p.floor}"/>${pl}
        <path d="M34 184 H366 L392 252 H8Z" fill="#44bccb"/><path d="M34 184 H366 L392 252 H8Z" fill="none" stroke="#fff" stroke-width="4"/>
        <g class="ripple" stroke="#fff" stroke-width="2" fill="none" opacity=".55"><path d="M40 204 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/><path d="M20 228 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0"/></g>
        ${[50, 236].map(x => `<path d="M${x} 288 L${x + 76} 288 L${x + 100} 266 L${x + 90} 262 L${x + 70} 280 L${x} 280Z" fill="#fff"/><path d="M${x + 6} 288 v8 M${x + 70} 288 v8" stroke="${p.wood}" stroke-width="3"/><rect x="${x + 8}" y="276" width="22" height="6" rx="3" fill="${p.accent}"/>`).join('')}
        <line x1="200" y1="298" x2="200" y2="196" stroke="${p.wood}" stroke-width="3"/><path d="M150 204 Q200 166 250 204Z" fill="${p.accent}"/><path d="M175 196 Q200 172 225 196" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>
        ${palm(372, 300, 150, '#2f4a2a', -1, 0.9)}`;
    },
    facade(st) {
      const p = st.pal, sandy = st.vista === 'sea' || st.vista === 'dunes';
      let roof = '';
      switch (p.roof) {
        case 'curved': roof = `<path d="M70 128 Q140 120 160 88 H240 Q260 120 330 128 L322 136 H78Z" fill="#3b3330"/><rect x="156" y="80" width="88" height="8" fill="#2a2320"/>`; break;
        case 'tile': roof = `<path d="M84 124 L200 60 L316 124Z" fill="#b8543a"/><path d="M84 124 L200 60 L316 124" stroke="#8a3a28" stroke-width="5" fill="none"/>`; break;
        case 'flat': roof = `<rect x="92" y="108" width="216" height="14" fill="${p.wood}"/><path d="M100 108 V92 H300 V108 M120 92 V108 M150 92 V108 M180 92 V108 M210 92 V108 M240 92 V108 M270 92 V108" stroke="${p.wood}" stroke-width="3" fill="none"/>${plant(296, 108, 0.45)}`; break;
        case 'dome': roof = `<rect x="94" y="112" width="212" height="10" fill="#fbfaf6"/><path d="M216 114 A34 34 0 0 1 284 114Z" fill="${p.accent}"/><rect x="248" y="70" width="4" height="12" fill="${p.accent}"/>`; break;
        case 'thatch': roof = `<path d="M74 132 Q200 36 326 132Z" fill="#c9a15e"/><path d="M110 112 Q200 52 290 112 M140 96 Q200 62 260 96" stroke="#a8823f" stroke-width="3" fill="none"/>`; break;
        default: roof = `<path d="M84 124 L200 54 L316 124Z" fill="${p.wood}"/><rect x="250" y="64" width="18" height="38" fill="${p.wood}"/>`;
      }
      let w = '';
      [[120, 140], [234, 140], [120, 186], [234, 186], [177, 140]].forEach(([x, y]) => { w += `<rect x="${x}" y="${y}" width="46" height="30" fill="#ffd98a" stroke="${p.wood}" stroke-width="3"/><line x1="${x + 23}" y1="${y}" x2="${x + 23}" y2="${y + 30}" stroke="${p.wood}" stroke-width="2"/>`; });
      const body = p.roof === 'dome' ? '#fbfaf6' : p.wall;
      return `${horizon(st, 0, 0, 400, 300)}
        <rect y="236" width="400" height="64" fill="${sandy ? '#ecdcbc' : '#7d9a62'}"/>
        <rect x="100" y="120" width="200" height="120" fill="${body}"/><rect x="270" y="120" width="30" height="120" fill="#000" opacity=".06"/>
        ${roof}${w}
        <path d="M184 240 V210 Q200 194 216 210 V240Z" fill="${p.wood}"/><circle cx="210" cy="224" r="1.8" fill="#ffd98a"/>
        <ellipse class="glow" cx="200" cy="200" rx="40" ry="12" fill="#ffe9b0" opacity=".3"/>
        <path d="M188 240 H212 L244 300 H156Z" fill="#efe4cf"/>
        <ellipse cx="104" cy="240" rx="26" ry="14" fill="#4f7543"/><ellipse cx="300" cy="240" rx="26" ry="14" fill="#4f7543"/><ellipse cx="124" cy="244" rx="16" ry="10" fill="#6f955f"/>
        ${sandy ? palm(52, 280, 170, '#2f4a2a', 1, 0.9) : `<rect x="44" y="160" width="8" height="100" fill="#5a3a24"/><circle cx="48" cy="150" r="36" fill="#3f6b35"/><circle cx="66" cy="168" r="24" fill="#4f7a45"/>`}`;
    },
    view(st) {
      const p = st.pal, rail = p.roof === 'dome' ? '#fbfaf6' : p.wood;
      let bal = '';
      for (let x = 6; x < 400; x += 22) bal += `<rect x="${x}" y="158" width="4" height="44" fill="${rail}"/>`;
      let bulbs = '';
      for (let t = 0.05; t < 1; t += 0.1) { const bx = 2 * (1 - t) * t * 200 + t * t * 400, by = (1 - t) * (1 - t) * 18 + 2 * (1 - t) * t * 70 + t * t * 18; bulbs += `<circle class="twinkle" style="--i:${Math.round(t * 10)}" cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="3.4" fill="#ffe08a"/>`; }
      return `${horizon(st, 0, 0, 400, 214)}
        <rect y="200" width="400" height="100" fill="${p.floor}"/><path d="M0 230 H400 M0 264 H400 M100 200 L70 300 M200 200 V300 M300 200 L330 300" stroke="#000" stroke-opacity=".08"/>
        <rect y="150" width="400" height="8" fill="${rail}"/>${bal}<rect y="200" width="400" height="5" fill="${rail}"/>
        <path d="M0 18 Q200 122 400 18" stroke="#333" stroke-opacity=".45" fill="none"/>${bulbs}
        <ellipse cx="200" cy="246" rx="56" ry="12" fill="${p.roof === 'dome' ? '#fff' : p.wood}"/><rect x="196" y="250" width="8" height="40" fill="${p.wood}"/><ellipse cx="200" cy="290" rx="20" ry="4" fill="${p.wood}"/>
        <path d="M180 236 h10 c0 8 -2 12 -5 12 s-5 -4 -5 -12z M210 236 h10 c0 8 -2 12 -5 12 s-5 -4 -5 -12z" fill="#8a1f2d" opacity=".85"/>
        <rect x="88" y="222" width="54" height="10" rx="4" fill="${p.accent}"/><path d="M92 232 L86 290 M138 232 L144 290 M92 222 L84 186" stroke="${p.accent}" stroke-width="5" stroke-linecap="round"/>
        <rect x="258" y="222" width="54" height="10" rx="4" fill="${p.accent}"/><path d="M262 232 L256 290 M308 232 L314 290 M308 222 L316 186" stroke="${p.accent}" stroke-width="5" stroke-linecap="round"/>
        ${plant(30, 300, 0.9)}`;
    },
  };
  function room(type, st) { return svg('0 0 400 300', (ROOMS[type] || ROOMS.living)(st)); }

  /* ---------- mapa estilizado (100 x 70) ---------- */
  function map(d) {
    const m = d.map, W = '#a9d7dc', L = m.ground || '#ece4d2';
    let o = '';
    if (m.style === 'sea') {
      o += `<rect width="100" height="70" fill="${W}"/>`;
      for (let i = 0; i < 70; i += 7) o += `<path d="M0 ${i + 3} q5 -1 10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0 t10 0" stroke="#fff" stroke-opacity=".18" stroke-width=".25" fill="none"/>`;
      o += `<path d="${m.land}" fill="none" stroke="#c7e7ea" stroke-width="3.4" stroke-linejoin="round"/><path d="${m.land}" fill="${L}"/>`;
      (m.blobs || []).forEach(([x, y, r]) => { o += `<circle cx="${x}" cy="${y}" r="${r + 1.4}" fill="#c7e7ea"/><circle cx="${x}" cy="${y}" r="${r}" fill="${L}"/>`; });
    } else {
      o += `<rect width="100" height="70" fill="${L}"/>`;
      (m.rivers || []).forEach(p => { o += `<path d="${p}" fill="none" stroke="${W}" stroke-width="1.8" stroke-linecap="round"/>`; });
      (m.blobs || []).forEach(([x, y, r]) => { o += `<ellipse cx="${x}" cy="${y}" rx="${r * 1.3}" ry="${r}" fill="${W}"/>`; });
    }
    (m.hills || []).forEach(([x, y, r]) => [1, 0.72, 0.45].forEach(k => { o += `<ellipse cx="${x}" cy="${y}" rx="${r * k * 1.3}" ry="${r * k}" fill="none" stroke="#000" stroke-opacity=".1" stroke-width=".25"/>`; }));
    for (let i = 10; i < 100; i += 10) o += `<line x1="${i}" x2="${i}" y1="0" y2="70" stroke="#000" stroke-opacity=".045" stroke-width=".15"/>`;
    for (let i = 10; i < 70; i += 10) o += `<line y1="${i}" y2="${i}" x1="0" x2="100" stroke="#000" stroke-opacity=".045" stroke-width=".15"/>`;
    return `<svg class="map__svg" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true" focusable="false">${o}</svg>`;
  }

  return { scene, hero, cat, room, map };
})();
