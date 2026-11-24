/* Voyage — aplicação: rotas, páginas, transições e animações. */
(() => {
  'use strict';
  const { CATS, TYPES, AMEN, DESTS, QUOTES, EXPERIENCES, ORIGINS } = window.VOYAGE;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const canVT = !!document.startViewTransition && !reduce;
  const app = $('#app');
  const Ph = window.PHOTOS;
  Ph.assign(DESTS);

  const destById = {}, stayById = {}, attrById = {};
  DESTS.forEach(d => { destById[d.id] = d; d.stays.forEach(s => { stayById[s.id] = s; }); d.attractions.forEach(a => { attrById[a.id] = a; }); });
  const ALL_STAYS = DESTS.flatMap(d => d.stays);
  const ALL_ATTRS = DESTS.flatMap(d => d.attractions);

  /* ---------- utilidades ---------- */
  const pad = n => String(n).padStart(2, '0');
  const money = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
  const rating = r => r.toFixed(Math.round(r * 100) % 10 ? 2 : 1).replace('.', ',');
  const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const km = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) * a.dest.map.km;
  const fmtKm = k => k < 1 ? `${Math.max(50, Math.round(k * 20) * 50)} m` : `${k < 10 && !Number.isInteger(k) ? k.toFixed(1).replace('.', ',') : Math.round(k)} km`;
  function travel(k, a) {
    if (a && a.boat) return { mode: 'boat', text: `${Math.round((k / 30) * 60 + 10)} min de barco` };
    if (k <= 1.8) return { mode: 'walk', text: `${Math.max(3, Math.round((k / 4.8) * 60))} min a pé` };
    const m = Math.round((k / 38) * 60 + 4);
    return { mode: 'car', text: m < 90 ? `${m} min de carro` : `${(m / 60).toFixed(1).replace('.', ',')} h de carro` };
  }
  const nearby = s => s.dest.attractions.map(a => ({ a, k: km(s, a) })).sort((x, y) => x.k - y.k);
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

  /* ---------- pacotes: cálculo do preço (valores ilustrativos) ---------- */
  const r10 = v => Math.round(v / 10) * 10;
  const intl = d => d.tab === 'mundo';
  const ORIGIN = Object.fromEntries(ORIGINS.map(o => [o.code, o]));
  function geoKm(a, b) {
    const R = 6371, rad = x => (x * Math.PI) / 180, dLa = rad(b.lat - a.lat), dLo = rad(b.lon - a.lon);
    const h = Math.sin(dLa / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLo / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  // passagem ida e volta por adulto
  function flightPrice(d, code) {
    const o = ORIGIN[code];
    if (intl(d)) return r10(d.air.base + geoKm(o, ORIGIN.GRU) * 0.3);
    const km = geoKm(o, d.air);
    if (km < 200) return 0;
    return r10((380 + km * 0.38) * (d.air.mult || 1));
  }
  function tourPrice(a) {
    const base = { natureza: 240, praia: 210, cultura: 160, gastronomia: 220, mirante: 140 }[a.cat] || 180;
    return r10(base * (intl(a.dest) ? 1.35 : 1) + (a.boat ? 60 : 0));
  }
  const nightsOf = d => d.days - 1;
  function pkgDefaults(d) {
    const hotel = d.stays.find(s => s.type === 'Hotel') || d.stays[0];
    return { origin: 'GRU', adults: 2, kids: 0, stay: hotel.id, tours: d.attractions.slice(0, 3).map(a => a.id), insurance: true, date: iso(addDays(new Date(), 45)) };
  }
  function quote(d, c) {
    const pax = c.adults + c.kids, eq = c.adults + c.kids * 0.75, n = nightsOf(d), s = stayById[c.stay];
    const flightPP = flightPrice(d, c.origin);
    const rooms = Math.ceil(pax / s.guests);
    const tours = c.tours.map(id => attrById[id]);
    const rows = {
      flight: flightPP * eq,
      hotel: s.price * n * rooms,
      transfer: (intl(d) ? 320 : flightPP ? 180 : 260) * pax,
      tours: tours.reduce((t, a) => t + tourPrice(a), 0) * eq,
      insurance: c.insurance || intl(d) ? (intl(d) ? 38 : 14) * d.days * pax : 0,
      fee: d.fee ? d.fee.perDay * d.days * pax : 0,
    };
    const total = Object.values(rows).reduce((a, b) => a + b, 0);
    return { rows, total, pp: total / pax, pax, rooms, nights: n, flightPP, stay: s, tours };
  }
  // menor preço por pessoa: 2 adultos saindo de São Paulo, hospedagem mais barata, 3 passeios
  function pkgFrom(d) {
    const c = pkgDefaults(d);
    c.stay = d.stays.slice().sort((a, b) => a.price - b.price)[0].id;
    return r10(quote(d, c).pp);
  }
  DESTS.forEach(d => { d.from = pkgFrom(d); d.price = d.from.toLocaleString('pt-BR'); });
  const inst = v => `10x de ${money(Math.ceil(v / 10))} sem juros`;

  /* ---------- ícones ---------- */
  const ico = (inner, sw = 1.4) => `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const I = {
    arrow: ico('<path d="M3 8h10M9 4l4 4-4 4"/>', 1.6),
    back: ico('<path d="M13 8H3M7 4L3 8l4 4"/>', 1.6),
    close: ico('<path d="M4 4l8 8M12 4l-8 8"/>', 1.6),
    prev: ico('<path d="M10 3L5 8l5 5"/>', 1.6),
    next: ico('<path d="M6 3l5 5-5 5"/>', 1.6),
    star: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.6l1.9 4 4.3.5-3.2 3 .9 4.3L8 11.3l-3.9 2.1.9-4.3-3.2-3 4.3-.5z"/></svg>',
    pin: ico('<path d="M8 14.5s5-4.4 5-8.4A5 5 0 0 0 3 6.1c0 4 5 8.4 5 8.4z"/><circle cx="8" cy="6.2" r="1.8"/>'),
    clock: ico('<circle cx="8" cy="8" r="6"/><path d="M8 4.8V8l2.2 1.4"/>'),
    ticket: ico('<path d="M2 5V3.5h12V5a1.8 1.8 0 0 0 0 3.6v1.5H2V8.6A1.8 1.8 0 0 0 2 5z" transform="translate(0 1.2)"/><path d="M10 4.8v6.6" stroke-dasharray="1 1.6"/>'),
    Hotel: ico('<path d="M1.5 13V4M1.5 9.5h13V13M14.5 9.5V8.5a2 2 0 0 0-2-2H7v3"/><circle cx="4.2" cy="7.6" r="1.3"/>'),
    Resort: ico('<path d="M8 14.5V7.2M8 7.2C6.4 4.6 3.6 4.4 2 6.2M8 7.2c1.6-2.6 4.4-2.8 6-1M8 7.2C7.2 4.2 8.4 2.2 10.6 1.8M8 7.2C8.6 4.4 7.6 2.4 5.4 2"/><path d="M4 14.5h8"/>'),
    Casa: ico('<path d="M2 7.6L8 2.8l6 4.8V14H2z"/><path d="M6.4 14v-3.8h3.2V14"/>'),
    search: ico('<circle cx="7" cy="7" r="4.6"/><path d="M10.4 10.4L14 14"/>', 1.6),
    users: ico('<circle cx="6" cy="5.4" r="2.3"/><path d="M1.8 13.4c0-2.3 1.9-3.7 4.2-3.7s4.2 1.4 4.2 3.7M11 3.4a2.1 2.1 0 0 1 0 4.1M12 9.8c1.3.5 2.2 1.6 2.2 3.6"/>'),
    bath: ico('<path d="M1.8 8h12.4v1.4A3.6 3.6 0 0 1 10.6 13H5.4a3.6 3.6 0 0 1-3.6-3.6z"/><path d="M4 8V3.6a1.6 1.6 0 0 1 3.1-.5M4.5 13l-.7 1.5M11.5 13l.7 1.5"/>'),
    walk: ico('<circle cx="9" cy="2.8" r="1.3"/><path d="M6 14.5l1.6-4.2 2 2.1v2.1M7.6 10.3l.8-4.4 2.6 2.3 2 .4M8.4 5.9L5.6 7.2 5 9.6"/>'),
    car: ico('<path d="M2.4 10.8V8.2L4 4.8h8l1.6 3.4v2.6z"/><path d="M2.4 10.8v1.6h2v-1.6M11.6 10.8v1.6h2v-1.6"/><circle cx="5" cy="8.6" r=".6"/><circle cx="11" cy="8.6" r=".6"/>'),
    boat: ico('<path d="M1.6 10.2h12.8l-2.2 3.2H3.8zM8 10.2V2.6l4.4 5.4H8"/>'),
    globe: ico('<circle cx="8" cy="8" r="6.2"/><path d="M1.8 8h12.4M8 1.8c2 2 2 10.4 0 12.4M8 1.8c-2 2-2 10.4 0 12.4"/>'),
    plane: ico('<path d="M14.2 2.2c-.6-.6-1.6-.5-2.2.1L9.4 4.9 3 3.2 1.8 4.4l5.1 3.1-2.4 2.4-2-.3-1 1 2.4 1.4 1.4 2.4 1-1-.3-2 2.4-2.4 3.1 5.1 1.2-1.2-1.7-6.4L14.1 4.4c.6-.6.7-1.6.1-2.2z"/>'),
    shield: ico('<path d="M8 1.6l5.4 2v4.1c0 3.4-2.3 5.6-5.4 6.7-3.1-1.1-5.4-3.3-5.4-6.7V3.6z"/><path d="M5.6 8.1l1.7 1.7 3.2-3.3"/>'),
    support: ico('<path d="M2.6 9.4V8a5.4 5.4 0 0 1 10.8 0v1.4"/><rect x="1.8" y="8.6" width="2.6" height="4" rx="1.1"/><rect x="11.6" y="8.6" width="2.6" height="4" rx="1.1"/><path d="M12.9 12.6c0 1.1-1.5 1.8-3.6 1.8"/>'),
    check: ico('<path d="M3.2 8.4l3 3 6.6-6.8"/>', 1.9),
    minus: ico('<path d="M3.5 8h9"/>', 1.8),
    plus: ico('<path d="M8 3.5v9M3.5 8h9"/>', 1.8),
    calendar: ico('<rect x="2" y="3" width="12" height="11" rx="2"/><path d="M2 6.6h12M5.2 1.8v2.4M10.8 1.8v2.4"/>'),
    bag: ico('<rect x="2.2" y="5" width="11.6" height="8.8" rx="1.8"/><path d="M5.6 5V3.4a1.2 1.2 0 0 1 1.2-1.2h2.4a1.2 1.2 0 0 1 1.2 1.2V5M2.2 9h11.6"/>'),
  };
  // o que todo pacote inclui
  const INCLUDES = [
    ['plane', 'Passagem aérea', 'Ida e volta saindo da sua cidade'],
    ['Hotel', 'Hospedagem', 'Hotel, resort ou casa, você escolhe'],
    ['car', 'Transfers', 'Aeroporto ↔ hospedagem'],
    ['ticket', 'Passeios guiados', 'Com guia local e ingressos'],
    ['shield', 'Seguro viagem', 'Cobertura médica e de bagagem'],
    ['support', 'Suporte 24 h', 'Em português, durante toda a viagem'],
  ];
  const incList = (cls = '') => `<ul class="inc ${cls}">${INCLUDES.map(([ic, t, s], i) => `<li style="--i:${i}"><i>${I[ic]}</i><span><b>${t}</b><small>${s}</small></span></li>`).join('')}</ul>`;
  const AI = {
    wifi: ico('<path d="M1.8 6.2a9 9 0 0 1 12.4 0M4 8.6a5.8 5.8 0 0 1 8 0M6.2 11a2.8 2.8 0 0 1 3.6 0"/><circle cx="8" cy="13.2" r=".7" fill="currentColor"/>'),
    pool: ico('<path d="M5 10V3.2a1.4 1.4 0 0 1 2.8 0M10.2 10V3.2a1.4 1.4 0 0 1 2.8 0M5 5.6h5.2M5 8h5.2M1.6 12.4c1.6 0 1.6 1 3.2 1s1.6-1 3.2-1 1.6 1 3.2 1 1.6-1 3.2-1"/>'),
    spa: ico('<path d="M8 13.4c-3 0-5.6-2-6.2-5.2 2.6 0 4.6 1.1 6.2 3.2 1.6-2.1 3.6-3.2 6.2-3.2-.6 3.2-3.2 5.2-6.2 5.2z"/><path d="M8 11.2C6.8 9.6 6.6 6.8 8 3.6c1.4 3.2 1.2 6 0 7.6"/>'),
    breakfast: ico('<path d="M2.6 6.2h8.4v4a3.2 3.2 0 0 1-3.2 3.2H5.8a3.2 3.2 0 0 1-3.2-3.2z"/><path d="M11 7.2h1a2 2 0 0 1 0 4h-1M5.6 2.4c0 1 1 1 1 2M8.6 2.4c0 1 1 1 1 2"/>'),
    ac: ico('<path d="M8 1.6v12.8M2.4 4.8l11.2 6.4M2.4 11.2l11.2-6.4M6.4 2.6L8 4.2l1.6-1.6M6.4 13.4L8 11.8l1.6 1.6"/>'),
    kitchen: ico('<path d="M3.6 1.8v4.4a1.8 1.8 0 0 0 3.6 0V1.8M5.4 1.8v12.4M11.6 14.2V1.8c1.9 1 2.6 3.2 2.6 6.4h-2.6"/>'),
    view: ico('<path d="M1.2 13.4l4.6-6.2 3 4 2.2-2.6 3.8 4.8z"/><circle cx="11.6" cy="4.4" r="1.6"/>'),
    parking: ico('<rect x="2.2" y="2.2" width="11.6" height="11.6" rx="2.4"/><path d="M6.4 11.2V4.8h2.4a1.9 1.9 0 0 1 0 3.8H6.4"/>'),
    beach: ico('<path d="M2.2 8a5.8 5.8 0 0 1 11.6 0z"/><path d="M8 8v5.8M4.6 14.2h6.8"/>'),
    fire: ico('<path d="M8 14.4c-2.9 0-4.6-1.9-4.6-4.3 0-2.7 2.6-3.9 2.9-7 1.6 1 2.8 2.7 2.8 4.4.6-.4 1-1.1 1.1-2 1.4 1.1 2.4 2.7 2.4 4.6 0 2.4-1.7 4.3-4.6 4.3z"/>'),
    bike: ico('<circle cx="3.8" cy="10.8" r="2.6"/><circle cx="12.2" cy="10.8" r="2.6"/><path d="M3.8 10.8L6.4 5.6h3.8l2 5.2M6.4 5.6l1.8 5.2H3.8M9 3.6h2"/>'),
    onsen: ico('<path d="M2.4 11h11.2M3 13.6h10M5.4 8.6c-1-1 1-2 0-3.6M8 8.6c-1-1 1-2 0-3.6M10.6 8.6c-1-1 1-2 0-3.6"/>'),
    gym: ico('<path d="M1.6 8h12.8M4 4.8v6.4M12 4.8v6.4M2.2 6.2v3.6M13.8 6.2v3.6"/>'),
    pet: ico('<ellipse cx="8" cy="10.6" rx="2.8" ry="2.4"/><circle cx="4.2" cy="7" r="1.1"/><circle cx="6.4" cy="4.4" r="1.1"/><circle cx="9.6" cy="4.4" r="1.1"/><circle cx="11.8" cy="7" r="1.1"/>'),
  };
  const STEP_ICO = [
    '<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle pathLength="1" cx="40" cy="40" r="28"/><ellipse pathLength="1" cx="40" cy="40" rx="12" ry="28"/><path pathLength="1" d="M12 40h56M16 26h48M16 54h48"/></svg>',
    '<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="M8 20l20-8 24 8 20-8v48l-20 8-24-8-20 8z"/><path pathLength="1" d="M28 12v48M52 20v48"/><path pathLength="1" d="M16 52c8-10 18-4 22-14s14-10 18-16" stroke-dasharray=".04 .03"/><circle pathLength="1" cx="58" cy="20" r="4"/></svg>',
    '<svg viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="M6 66V36M6 54h68v12M74 54v-8a8 8 0 0 0-8-8H34v16"/><circle pathLength="1" cx="18" cy="45" r="5"/><path pathLength="1" d="M60 26c0-7-5-12-11-12s-11 5-11 12c0 8 11 16 11 16s11-8 11-16z"/><circle pathLength="1" cx="49" cy="26" r="3.5"/></svg>',
  ];
  const ROOM_LABEL = { facade: 'Fachada', living: 'Sala de estar', bedroom: 'Quarto', bath: 'Banheiro', kitchen: 'Cozinha', pool: 'Piscina', view: 'Vista da varanda' };

  const roomImg = (s, room, o = {}) => Ph.img(s.photos[room], `${ROOM_LABEL[room]} · ${s.name}`, o);
  const CARD_SIZES = '(max-width: 760px) 100vw, (max-width: 1100px) 50vw, 400px';
  const XPH = { praia: 'railay', cultura: 'fushimi', natureza: 'caracol', gastronomia: 'santo', mirante: 'oia' };
  const HERO = ['noronha', 'kyoto', 'santorini', 'lencois', 'amalfi'];
  function markLoaded(root) {
    $$('img.ph', root).forEach(i => { if (i.complete && i.naturalWidth) i.classList.add('is-loaded'); });
  }
  document.addEventListener('load', e => { if (e.target.classList && e.target.classList.contains('ph')) e.target.classList.add('is-loaded'); }, true);
  document.addEventListener('error', e => { if (e.target.classList && e.target.classList.contains('ph')) e.target.classList.add('is-broken'); }, true);

  /* ---------- estado ---------- */
  const state = { key: null, base: '#/', morph: false, prefType: null, pendingAttr: null, pendingGoto: null, pendingStay: null };
  let cleanups = [];
  const onCleanup = fn => cleanups.push(fn);
  const scroller = { hero: null, heroLayers: [], dhero: null, hs: null, plan: null, subnav: null, marquee: null, foot: null };

  /* ================================================================
     TEMPLATES
     ================================================================ */
  function stayCard(s, i = 0) {
    const d = s.dest, near = nearby(s)[0];
    return `<a class="scard" href="#/destino/${d.id}/estadia/${s.id}" data-stay="${s.id}" data-id="${s.id}" data-type="${s.type}" data-dest="${d.id}" data-cursor="Ver por dentro" data-reveal style="--d:${(i % 3) * 90}ms">
      <div class="scard__media" data-tilt>
        ${roomImg(s, s.rooms[0], { sizes: CARD_SIZES, max: 1200 })}${roomImg(s, s.rooms[1], { sizes: CARD_SIZES, max: 1200 })}
        <span class="badge">${I[s.type]}${TYPES[s.type]}</span>
        <span class="scard__hint">${I.arrow} ${ROOM_LABEL[s.rooms[1]]}</span>
      </div>
      <div class="scard__body">
        <p class="scard__loc">${d.name}, ${d.country}<span>${I.star} ${rating(s.rating)}</span></p>
        <h3>${s.name}</h3>
        <p class="scard__near">${I.pin} ${fmtKm(near.k)} de ${near.a.name}</p>
        <p class="scard__price"><strong>${money(s.price)}</strong> / noite</p>
      </div>
    </a>`;
  }

  function accPanel(d, i) {
    return `<article class="acc__p${i === 0 ? ' is-open' : ''}" style="--i:${i}" data-morph-src>
      ${Ph.img(Ph.D[d.id], d.name, { sizes: '(max-width: 760px) 100vw, 70vw', max: 1800 })}
      <button class="acc__btn" type="button" aria-expanded="${i === 0}"><span class="acc__n">${pad(i + 1)}</span><span class="acc__v">${d.name}</span></button>
      <div class="acc__info">
        <ul class="acc__meta"><li>${d.tab === 'brasil' ? d.region : d.country}</li><li>${d.days} dias</li><li>a partir de R$ ${d.price}</li></ul>
        <h3>${d.name}</h3>
        <p>${d.tagline} ${d.attractions.length} pontos turísticos e ${d.stays.length} hospedagens no mapa.</p>
        <a class="acc__cta" href="#/destino/${d.id}" data-morph data-cursor="Explorar">Explorar destino ${I.arrow}</a>
      </div>
    </article>`;
  }

  function viewHome() {
    const feat = ['andaman', 'hinoki', 'azzurra', 'palha', 'sueste', 'pinheiro'].map(id => stayById[id]);
    const names = DESTS.map((d, i) => `<span class="${i % 2 ? 'o' : ''}">${d.name}</span><i>✦</i>`).join('');
    const avg = ALL_STAYS.reduce((a, s) => a + s.rating, 0) / ALL_STAYS.length;
    const exp = EXPERIENCES.map((x, i) => {
      const list = ALL_ATTRS.filter(a => a.cat === x.cat);
      const seen = new Set(), ex = list.filter(a => !seen.has(a.dest.id) && seen.add(a.dest.id)).slice(0, 3);
      return `<article class="xcard" style="--c:${CATS[x.cat].color}">
        ${Ph.img(Ph.A[XPH[x.cat]], x.title, { sizes: '(max-width: 760px) 82vw, 460px', max: 1200 })}
        <span class="xcard__n">${pad(i + 1)}</span>
        <div class="xcard__body">
          <p class="xcard__count">${list.length} lugares</p>
          <h3>${x.title}</h3>
          <p>${x.text}</p>
          <ul>${ex.map(a => `<li><a href="#/destino/${a.dest.id}" data-attr="${a.id}">${a.name}<small>${a.dest.name}</small>${I.arrow}</a></li>`).join('')}</ul>
        </div>
      </article>`;
    }).join('');

    return `
    <section class="hero" data-hero>
      <div class="hero__art"><div class="hero__slides" data-depth=".35">${HERO.map((id, i) => `<div class="hero__slide${i === 0 ? ' is-on' : ''}">${Ph.img(Ph.D[id], destById[id].name, { eager: i === 0, max: 2400 })}</div>`).join('')}</div></div>
      <a class="hero__now" href="#/destino/${HERO[0]}" data-hero-now><small>Em destaque</small><b>${destById[HERO[0]].name}</b><i>${I.arrow}</i><span class="hero__dots">${HERO.map((_, i) => `<span${i === 0 ? ' class="is-on"' : ''}></span>`).join('')}</span></a>
      <div class="wrap hero__inner">
        <p class="eyebrow" data-reveal>Agência de viagens · hotéis · resorts · casas</p>
        <h1 class="hero__t" data-split>O mundo inteiro,<br> <em>a um passo</em> da sua porta.</h1>
        <p class="hero__lead" data-reveal style="--d:250ms">Escolha o destino, descubra tudo o que dá para fazer por lá e durma perto de cada ponto turístico. Roteiro, guia e hospedagem num lugar só.</p>
        <form class="search" data-reveal style="--d:400ms" autocomplete="off" role="search">
          <label class="search__field">${I.search}<span><small>Para onde você quer ir?</small><input type="text" name="q" placeholder="Japão, Noronha, uma praia…" aria-label="Buscar destino"></span></label>
          <button class="btn btn--ink magnetic" type="submit">Explorar ${I.arrow}</button>
          <div class="search__drop" tabindex="-1" hidden></div>
        </form>
      </div>
      <a class="hero__scroll" href="#/" data-goto="destinos"><span>Role para explorar</span><i></i></a>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee__track">${names}${names}</div></div>

    <section class="sec" id="destinos">
      <div class="wrap">
        <div class="sec-head">
          <div><p class="eyebrow" data-reveal>Roteiros 2026</p><h2 class="h2" data-split>Para onde vamos <em>agora?</em></h2></div>
          <div class="sec-head__side">
            <p class="lead" data-reveal data-tab-lead>Cinco destinos pelo mundo com roteiro desenhado à mão, hospedagem escolhida a dedo e guia local.</p>
            <div class="tabs" role="tablist" aria-label="Região" data-reveal style="--d:120ms">
              <button role="tab" aria-selected="true" data-tab="mundo">${I.globe} Mundo</button><button role="tab" aria-selected="false" data-tab="brasil">Brasil</button><span class="tabs__ink"></span>
            </div>
          </div>
        </div>
        <div class="acc" data-auto="1"><div class="acc__row">${DESTS.filter(d => d.tab === 'mundo').map(accPanel).join('')}</div></div>
      </div>
    </section>

    <section class="sec sec--pk" id="pacotes">
      <div class="wrap">
        <div class="sec-head">
          <div><p class="eyebrow" data-reveal>Pacotes com tudo incluído</p><h2 class="h2" data-split>Só falta fazer <em>a mala.</em></h2></div>
          <div class="sec-head__side">
            <p class="lead" data-reveal>Passagem saindo da sua cidade, hospedagem, transfers, passeios guiados e seguro viagem, num preço só e em até 10x.</p>
            <a class="btn btn--ink magnetic" href="#/pacotes" data-reveal style="--d:120ms">Ver todos os pacotes ${I.arrow}</a>
          </div>
        </div>
        <div class="sec--pk__inc" data-reveal>${incList('inc--row')}</div>
        <div class="pkgrid">${['noronha', 'kyoto', 'santorini'].map((id, i) => pkCard(destById[id], i)).join('')}</div>
      </div>
    </section>

    <section class="sec sec--how">
      <div class="wrap">
        <div class="sec-head">
          <div><p class="eyebrow" data-reveal>Como funciona</p><h2 class="h2" data-split>Três passos e <em>você já está lá.</em></h2></div>
          <p class="lead" data-reveal>A gente organiza a viagem pelo que você quer fazer — e só depois escolhe onde dormir, o mais perto possível de tudo isso.</p>
        </div>
        <ol class="steps">
          <li class="step" data-reveal><span class="step__n">01</span><div class="step__ico">${STEP_ICO[0]}</div><h3>Escolha o destino</h3><p>Praia, montanha, cidade histórica ou deserto. Veja quantos dias pedir e quanto custa ir.</p></li>
          <li class="step" data-reveal style="--d:120ms"><span class="step__n">02</span><div class="step__ico">${STEP_ICO[1]}</div><h3>Monte o roteiro</h3><p>Cada destino tem um guia completo dos pontos turísticos, com tempo de visita, preço e melhor horário.</p></li>
          <li class="step" data-reveal style="--d:240ms"><span class="step__n">03</span><div class="step__ico">${STEP_ICO[2]}</div><h3>Durma perto de tudo</h3><p>Hotéis, resorts e casas no mapa, com fotos por dentro e a distância a pé ou de carro até cada atração.</p></li>
        </ol>
      </div>
    </section>

    <section class="hs" id="experiencias">
      <div class="hs__sticky">
        <div class="wrap hs__head">
          <div><p class="eyebrow">Experiências</p><h2 class="h2" data-split>Do jeito que você <em>gosta de viajar.</em></h2></div>
          <div class="hs__bar" aria-hidden="true"><span></span></div>
        </div>
        <div class="hs__track">${exp}</div>
      </div>
    </section>

    <section class="sec" id="estadias-destaque">
      <div class="wrap">
        <div class="sec-head">
          <div><p class="eyebrow" data-reveal>Hotéis · resorts · casas</p><h2 class="h2" data-split>Hospedagem com vista <em>para o roteiro.</em></h2></div>
          <a class="btn btn--ghost magnetic" href="#/estadias" data-reveal>Ver todas as ${ALL_STAYS.length} estadias ${I.arrow}</a>
        </div>
        <div class="grid-stays">${feat.map(stayCard).join('')}</div>
      </div>
    </section>

    <section class="stats">
      <div class="wrap stats__grid">
        <div class="stat" data-reveal><b data-count="${DESTS.length}">0</b><span>destinos com guia completo</span></div>
        <div class="stat" data-reveal style="--d:100ms"><b data-count="${ALL_ATTRS.length}">0</b><span>pontos turísticos mapeados</span></div>
        <div class="stat" data-reveal style="--d:200ms"><b data-count="${ALL_STAYS.length}">0</b><span>hotéis, resorts e casas</span></div>
        <div class="stat" data-reveal style="--d:300ms"><b data-count="${avg.toFixed(1)}" data-dec="1">0</b><span>nota média dos hóspedes</span></div>
      </div>
    </section>

    <section class="sec quotes">
      <div class="wrap quotes__wrap">
        <p class="eyebrow" data-reveal>Quem já foi</p>
        <div class="quotes__stage" data-reveal>
          ${QUOTES.map((q, i) => `<figure class="quote${i === 0 ? ' is-on' : ''}"><blockquote>“${q.q}”</blockquote><figcaption><b>${q.who}</b> · ${q.where}</figcaption></figure>`).join('')}
        </div>
        <div class="quotes__dots" role="tablist" aria-label="Depoimentos">${QUOTES.map((q, i) => `<button role="tab" aria-selected="${i === 0}" aria-label="Depoimento ${i + 1}"${i === 0 ? ' class="is-on"' : ''}><span></span></button>`).join('')}</div>
      </div>
    </section>`;
  }

  /* ---------- página do destino ---------- */
  const dayLi = it => `<li class="day" data-reveal>
    <small>${it.t}</small>
    <h3>${it.h}</h3>
    <p>${it.p}</p>
    ${it.a ? `<span class="tag tag--inline" style="--c:${CATS[it.a.cat].color}">${CATS[it.a.cat].label} · ${it.a.time}</span>` : ''}
  </li>`;

  function planItems(d) {
    const A = d.attractions, items = [];
    items.push({ t: 'Dia 1 · Chegada', h: 'Check-in e primeiro passeio', p: `Transfer do aeroporto, check-in e um fim de tarde sem pressa em ${A[0].name}.`, a: A[0] });
    for (let i = 1; i < d.days - 1; i++) {
      if (i < A.length) items.push({ t: `Dia ${i + 1}`, h: A[i].name, p: A[i].desc, a: A[i] });
      else items.push({ t: `Dia ${i + 1}`, h: 'Dia livre', p: 'Tempo para voltar ao lugar favorito, fazer compras e aproveitar a hospedagem.' });
    }
    items.push({ t: `Dia ${d.days} · Retorno`, h: 'Último café e volta para casa', p: 'Check-out tranquilo, uma última volta pela região e transfer para o aeroporto.' });
    return items;
  }

  function viewDest(d) {
    const cats = [...new Set(d.attractions.map(a => a.cat))];
    const next = DESTS[(d.index + 1) % DESTS.length];
    const unit = [0.5, 1, 2, 5, 10, 20, 50].reduce((b, u) => (u / d.map.km <= 22 ? u : b), 0.5);
    const pins = d.attractions.map((a, i) => `<button class="pin pin--a" type="button" style="left:${a.x}%;top:${(a.y / 0.7).toFixed(2)}%;--c:${CATS[a.cat].color};--i:${i}" data-attr-pin="${a.id}" aria-label="${a.name}"><b>${i + 1}</b><span class="pin__label">${a.name}</span></button>`).join('')
      + d.stays.map((s, i) => `<button class="pin pin--s" type="button" style="left:${s.x}%;top:${(s.y / 0.7).toFixed(2)}%;--i:${i + d.attractions.length}" data-stay-pin="${s.id}" aria-label="${s.name}">${I[s.type]}<span class="pin__label">${s.name} · ${money(s.price)}</span></button>`).join('');
    const plan = planItems(d);

    return `
    <section class="dhero" data-dhero>
      <div class="dhero__art"${state.morph ? ' style="view-transition-name:dest-hero"' : ''}>${Ph.img(Ph.D[d.id], d.name, { eager: true, max: 2400 })}</div>
      <div class="wrap dhero__inner">
        <a class="back" href="#/" data-goto="destinos">${I.back} Todos os destinos</a>
        <p class="eyebrow eyebrow--light" data-reveal>${d.country} · ${d.region}</p>
        <h1 class="dhero__t" data-split-chars>${d.name}</h1>
        <p class="dhero__tag" data-reveal style="--d:300ms">${d.tagline}</p>
        <ul class="chips" data-reveal style="--d:420ms"><li>${d.days} dias</li><li>Melhor época: ${d.best}</li></ul>
        <a class="dhero__pk" href="#/pacote/${d.id}" data-reveal style="--d:520ms"><span><small>Pacote com passagem</small><b>a partir de ${money(d.from)} por pessoa</b></span><i>${I.arrow}</i></a>
      </div>
      <div class="dhero__scroll" aria-hidden="true"><i></i></div>
    </section>

    <nav class="subnav" aria-label="Seções do destino">
      <a href="#visao" data-sub="visao">Visão geral</a><a href="#guia" data-sub="guia">O que fazer</a><a href="#onde-ficar" data-sub="onde-ficar">Onde ficar</a><a href="#roteiro" data-sub="roteiro">Roteiro</a><a href="#pacote" data-sub="pacote">Pacote</a>
    </nav>

    <section class="sec sec--intro" id="visao">
      <div class="wrap intro">
        <div>
          <p class="eyebrow" data-reveal>Visão geral</p>
          <p class="intro__text" data-split>${d.desc}</p>
        </div>
        <dl class="facts" data-reveal>
          <div class="fact"><dt>Melhor época</dt><dd>${d.best}</dd></div>
          <div class="fact"><dt>Moeda</dt><dd>${d.currency}</dd></div>
          <div class="fact"><dt>Idioma</dt><dd>${d.lang}</dd></div>
          <div class="fact"><dt>Fuso</dt><dd>${d.tz}</dd></div>
          <div class="fact"><dt>Como chegar</dt><dd>${d.flight}</dd></div>
          <div class="fact"><dt>Roteiro sugerido</dt><dd>${d.days} dias</dd></div>
        </dl>
      </div>
    </section>

    <section class="sec sec--guide" id="guia">
      <div class="wrap">
        <div class="sec-head">
          <div><p class="eyebrow" data-reveal>Guia completo</p><h2 class="h2" data-split>O que fazer em <em>${d.name}</em></h2></div>
          <div class="filters" role="group" aria-label="Filtrar por categoria" data-reveal>
            <button class="chip is-on" type="button" data-cat="all">Tudo <small>${d.attractions.length}</small></button>
            ${cats.map(c => `<button class="chip" type="button" data-cat="${c}" style="--c:${CATS[c].color}"><i></i>${CATS[c].label}</button>`).join('')}
          </div>
        </div>
        <div class="agrid">
          ${d.attractions.map((a, i) => `<article class="acard" id="a-${a.id}" data-cat="${a.cat}" data-reveal style="--d:${(i % 3) * 90}ms">
            <div class="acard__media">${Ph.img(Ph.A[a.id], a.name, { sizes: CARD_SIZES, max: 1200 })}<span class="tag" style="--c:${CATS[a.cat].color}">${CATS[a.cat].label}</span><span class="acard__n">${pad(i + 1)}</span></div>
            <div class="acard__body">
              <h3>${a.name}</h3>
              <p>${a.desc}</p>
              <ul class="meta"><li>${I.clock} ${a.time}</li><li>${I.ticket} ${a.price}</li></ul>
              <button class="link" type="button" data-focus-attr="${a.id}">Hospedagens perto daqui ${I.arrow}</button>
            </div>
          </article>`).join('')}
        </div>
      </div>
    </section>

    <section class="where" id="onde-ficar">
      <div class="wrap">
        <div class="sec-head">
          <div><p class="eyebrow eyebrow--light" data-reveal>Onde ficar</p><h2 class="h2" data-split>Durma perto <em>de tudo.</em></h2></div>
          <p class="lead" data-reveal>Passe o mouse numa hospedagem para ver a distância até cada ponto turístico, ou escolha um ponto e veja quem está mais perto.</p>
        </div>
        <div class="where__grid">
          <div class="where__mapcol" data-reveal>
            <div class="map" data-map>
              ${Art.map(d)}
              <svg class="map__lines" viewBox="0 0 100 70" preserveAspectRatio="none" aria-hidden="true"></svg>
              <div class="map__labels" aria-hidden="true"></div>
              ${pins}
              <span class="map__compass" aria-hidden="true">N</span>
              <span class="map__scale" aria-hidden="true" style="width:${(unit / d.map.km).toFixed(1)}%"><i></i>${fmtKm(unit)}</span>
            </div>
            <div class="map__legend">
              ${cats.map(c => `<span style="--c:${CATS[c].color}"><i></i>${CATS[c].label}</span>`).join('')}
              <span class="is-stay"><i></i>Hospedagem</span>
            </div>
          </div>
          <div class="where__list">
            <div class="where__ctrl">
              <div class="chips-row" role="group" aria-label="Tipo de hospedagem">
                ${['all', 'Hotel', 'Resort', 'Casa'].map(t => `<button class="chip chip--dark${t === 'all' ? ' is-on' : ''}" type="button" data-stype="${t}">${t === 'all' ? 'Todas' : TYPES[t]}</button>`).join('')}
              </div>
              <label class="select select--dark"><span>Perto de</span>
                <select data-near><option value="">Qualquer ponto turístico</option>${d.attractions.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}</select>
              </label>
            </div>
            <div class="where__items">
              ${d.stays.map(s => `<article class="srow" data-id="${s.id}" data-type="${s.type}">
                <button class="srow__media" type="button" data-stay="${s.id}" aria-label="Ver ${s.name} por dentro" data-cursor="Ver por dentro">${roomImg(s, s.rooms[0], { sizes: '160px', max: 480 })}${roomImg(s, s.rooms[1], { sizes: '160px', max: 480 })}</button>
                <div class="srow__body">
                  <p class="srow__type">${I[s.type]} ${TYPES[s.type]} <span>${I.star} ${rating(s.rating)}</span></p>
                  <h3>${s.name}</h3>
                  <p class="srow__near" data-neartext></p>
                  <div class="srow__foot"><span><b>${money(s.price)}</b> / noite</span><button class="btn btn--sm btn--light" type="button" data-stay="${s.id}">Ver por dentro ${I.arrow}</button></div>
                </div>
              </article>`).join('')}
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="sec" id="roteiro">
      <div class="wrap plan">
        <div class="plan__head">
          <p class="eyebrow" data-reveal>Roteiro sugerido</p>
          <h2 class="h2" data-split>${d.days} dias em <em>${d.name}</em></h2>
          <p class="lead" data-reveal>Um ponto de partida para montar a sua viagem. A gente ajusta ritmo, dias e hospedagem do seu jeito.</p>
          <a class="btn btn--ink magnetic" href="#/pacote/${d.id}" data-reveal>Quero esse roteiro ${I.arrow}</a>
        </div>
        <ol class="plan__list">
          <span class="plan__line" aria-hidden="true"><span></span></span>
          ${plan.map(dayLi).join('')}
        </ol>
      </div>
    </section>

    <section class="pkband" id="pacote">
      <div class="wrap">
        <div class="pkband__in" data-reveal>
          ${Ph.img(Ph.D2[d.id] || Ph.D[d.id], '', { max: 1800 })}
          <div class="pkband__txt">
            <p class="eyebrow eyebrow--light">Pacote completo</p>
            <h2 class="h2">Leve esse roteiro <em>pronto.</em></h2>
            <p>Passagem saindo da sua cidade, ${nightsOf(d)} noites de hospedagem, transfers, passeios guiados e seguro viagem, num preço só.</p>
            ${incList('inc--light')}
          </div>
          <div class="pkband__price">
            <small>a partir de</small><b>${money(d.from)}</b><small>por pessoa · ${inst(d.from)}</small>
            <a class="btn magnetic" href="#/pacote/${d.id}" data-cursor="Montar">Montar meu pacote ${I.arrow}</a>
          </div>
        </div>
      </div>
    </section>

    <a class="next" href="#/destino/${next.id}" data-morph data-morph-src data-cursor="Próximo">
      ${Ph.img(Ph.D[next.id], next.name, { max: 2400 })}
      <div class="next__inner">
        <p class="eyebrow eyebrow--light">Próximo destino · ${next.country}</p>
        <div class="next__t"><span>${next.name}</span><i class="next__arrow">${I.arrow}</i></div>
      </div>
    </a>`;
  }

  /* ---------- página de estadias ---------- */
  function viewStays() {
    return `
    <section class="phead">
      <div class="wrap">
        <p class="eyebrow" data-reveal>Hotéis · resorts · casas inteiras</p>
        <h1 class="phead__t" data-split>Onde você quer <em>acordar?</em></h1>
        <p class="lead" data-reveal style="--d:200ms">Todas as hospedagens da Voyage, com fotos por dentro e a distância até o ponto turístico mais próximo.</p>
        <div class="phead__bar" data-reveal style="--d:300ms">
          <div class="chips-row" role="group" aria-label="Tipo">
            ${['all', 'Hotel', 'Resort', 'Casa'].map(t => `<button class="chip${t === 'all' ? ' is-on' : ''}" type="button" data-ftype="${t}">${t === 'all' ? 'Todas' : TYPES[t]}</button>`).join('')}
          </div>
          <label class="select"><span>Destino</span><select data-fdest><option value="">Todos os destinos</option>${DESTS.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}</select></label>
          <label class="select"><span>Ordenar</span><select data-fsort><option value="rec">Recomendadas</option><option value="low">Menor preço</option><option value="high">Maior preço</option><option value="rate">Melhor avaliação</option></select></label>
          <p class="phead__count" aria-live="polite"><b>${ALL_STAYS.length}</b> estadias</p>
        </div>
      </div>
    </section>
    <section class="sec sec--list"><div class="wrap"><div class="grid-stays" data-grid>${ALL_STAYS.map(stayCard).join('')}</div></div></section>`;
  }

  /* ---------- pacotes ---------- */
  function pkCard(d, i = 0) {
    return `<a class="pkcard" href="#/pacote/${d.id}" data-id="${d.id}" data-tab="${d.tab}" data-tags="${d.tags.join('|')}" data-morph data-morph-src data-cursor="Ver pacote" data-reveal style="--d:${(i % 3) * 90}ms">
      <div class="pkcard__media">
        ${Ph.img(Ph.D[d.id], d.name, { sizes: CARD_SIZES, max: 1200 })}
        <span class="badge">${I.calendar}${d.days} dias · ${nightsOf(d)} noites</span>
        <ul class="pkcard__tags">${d.tags.map(t => `<li>${t}</li>`).join('')}</ul>
      </div>
      <div class="pkcard__body">
        <p class="pkcard__loc">${d.tab === 'brasil' ? `${d.region}, Brasil` : d.country}</p>
        <h3>${d.name}</h3>
        <ul class="pkcard__inc" aria-label="Inclui">${['plane', 'Hotel', 'car', 'ticket', 'shield'].map(k => `<li>${I[k]}</li>`).join('')}<li class="pkcard__inc-txt">Aéreo, hotel, transfer, passeios e seguro</li></ul>
        <div class="pkcard__foot">
          <p><small>a partir de</small><b>${money(d.from)}</b><small>por pessoa · ${inst(d.from)}</small></p>
          <span class="pkcard__go">${I.arrow}</span>
        </div>
      </div>
    </a>`;
  }

  function viewPackages() {
    const themes = [...new Set(DESTS.flatMap(d => d.tags))];
    return `
    <section class="phead">
      <div class="wrap">
        <p class="eyebrow" data-reveal>Pacotes com tudo incluído</p>
        <h1 class="phead__t" data-split>A viagem inteira, <em>num lugar só.</em></h1>
        <p class="lead" data-reveal style="--d:200ms">Você escolhe o destino e de onde sai. A gente cuida da passagem, da hospedagem, dos transfers, dos passeios e do seguro, e você ajusta tudo do seu jeito.</p>
        <div class="phead__inc" data-reveal style="--d:300ms">${incList('inc--row')}</div>
        <div class="phead__bar" data-reveal style="--d:400ms">
          <div class="chips-row" role="group" aria-label="Região">${[['all', 'Todos'], ['mundo', 'Mundo'], ['brasil', 'Brasil']].map(([v, l]) => `<button class="chip${v === 'all' ? ' is-on' : ''}" type="button" data-pregion="${v}">${l}</button>`).join('')}</div>
          <span class="phead__sep" aria-hidden="true"></span>
          <div class="chips-row" role="group" aria-label="Estilo de viagem">${themes.map(t => `<button class="chip chip--soft" type="button" data-ptheme="${t}">${t}</button>`).join('')}</div>
          <label class="select"><span>Ordenar</span><select data-psort><option value="rec">Recomendados</option><option value="low">Menor preço</option><option value="high">Maior preço</option><option value="days">Mais dias</option></select></label>
          <p class="phead__count" aria-live="polite"><b>${DESTS.length}</b> pacotes</p>
        </div>
      </div>
    </section>
    <section class="sec sec--list"><div class="wrap"><div class="pkgrid" data-grid>${DESTS.map(pkCard).join('')}</div></div></section>`;
  }

  function viewPackage(d) {
    const c = pkgDefaults(d), n = nightsOf(d);
    const step = (num, title, text, body) => `<div class="pk-step" data-reveal>
      <header><span class="pk-step__n">${num}</span><div><h2>${title}</h2><p>${text}</p></div></header>${body}</div>`;
    const stepper = (k, label, sub, v) => `<div class="field"><span>${label}${sub ? ` <small>${sub}</small>` : ''}</span><div class="stepper"><button type="button" data-pax="${k}" data-d="-1" aria-label="Menos ${label.toLowerCase()}">${I.minus}</button><b data-count-${k}>${v}</b><button type="button" data-pax="${k}" data-d="1" aria-label="Mais ${label.toLowerCase()}">${I.plus}</button></div></div>`;
    return `
    <section class="dhero dhero--pk" data-dhero>
      <div class="dhero__art"${state.morph ? ' style="view-transition-name:dest-hero"' : ''}>${Ph.img(Ph.D[d.id], d.name, { eager: true, max: 2400 })}</div>
      <div class="wrap dhero__inner">
        <a class="back" href="#/destino/${d.id}">${I.back} Conhecer ${d.name}</a>
        <p class="eyebrow eyebrow--light" data-reveal>Pacote completo · ${d.tab === 'brasil' ? d.region : d.country}</p>
        <h1 class="dhero__t" data-split-chars>${d.name}</h1>
        <p class="dhero__tag" data-reveal style="--d:300ms">${d.days} dias e ${n} noites com passagem, hospedagem, transfers, passeios guiados e seguro viagem.</p>
        <ul class="chips" data-reveal style="--d:420ms"><li>${I.plane} Saindo de ${ORIGINS.length} capitais</li><li>a partir de ${money(d.from)} por pessoa</li><li>${inst(d.from)}</li></ul>
      </div>
    </section>

    <section class="sec pk-sec">
      <div class="wrap">
        <div class="pk-inc" data-reveal>${incList('inc--row')}</div>
        <div class="pk">
          <div class="pk__main">
            ${step(1, 'De onde e quando', 'O preço muda conforme a cidade de saída e quantas pessoas vão.', `
              <div class="pk-fields">
                <label class="field"><span>Saindo de</span><select data-origin>${ORIGINS.map(o => `<option value="${o.code}"${o.code === c.origin ? ' selected' : ''}>${o.city} (${o.code})</option>`).join('')}</select></label>
                <label class="field"><span>Data de ida</span><input type="date" data-date value="${c.date}" min="${iso(addDays(new Date(), 7))}"></label>
                ${stepper('adults', 'Adultos', '', c.adults)}
                ${stepper('kids', 'Crianças', 'até 11 anos', c.kids)}
              </div>
              <div class="pk-route" data-route></div>`)}
            ${step(2, 'Onde você vai ficar', `${n} noites. Escolha entre hotel, resort ou casa, e veja cada um por dentro.`, `
              <div class="pk-stays">${d.stays.map(s => { const near = nearby(s)[0]; return `<label class="pk-opt pk-stay">
                <input type="radio" name="pk-stay" value="${s.id}"${s.id === c.stay ? ' checked' : ''}>
                <span class="pk-opt__media">${roomImg(s, s.rooms[0], { sizes: '(max-width: 760px) 100vw, 280px', max: 800 })}</span>
                <span class="pk-opt__body"><small>${I[s.type]} ${TYPES[s.type]} · ${I.star} ${rating(s.rating)}</small><b>${s.name}</b><small>${I.pin} ${fmtKm(near.k)} de ${near.a.name}</small><span class="pk-opt__price" data-stay-price="${s.id}"></span></span>
                <i class="pk-tick">${I.check}</i>
                <button type="button" class="pk-peek" data-stay="${s.id}">Ver por dentro</button>
              </label>`; }).join('')}</div>`)}
            ${step(3, 'Passeios guiados', 'Os três primeiros já vêm marcados. Adicione ou tire o que quiser.', `
              <div class="pk-tours">${d.attractions.map(a => `<label class="pk-opt pk-tour">
                <input type="checkbox" value="${a.id}"${c.tours.includes(a.id) ? ' checked' : ''}>
                <span class="pk-opt__media">${Ph.img(Ph.A[a.id], a.name, { sizes: '120px', max: 480 })}</span>
                <span class="pk-opt__body"><small style="--c:${CATS[a.cat].color}"><i class="dot"></i>${CATS[a.cat].label} · ${a.time}</small><b>${a.name}</b><span class="pk-opt__price">${money(tourPrice(a))} por pessoa</span></span>
                <i class="pk-tick">${I.check}</i>
              </label>`).join('')}</div>`)}
            ${step(4, 'Proteção', intl(d) ? 'Obrigatório em viagens internacionais, já incluído no pacote.' : 'Recomendado: cobre despesas médicas, bagagem e cancelamento.', `
              <label class="pk-opt pk-ins${intl(d) ? ' is-locked' : ''}">
                <input type="checkbox" data-ins checked${intl(d) ? ' disabled' : ''}>
                <i class="pk-ins__ic">${I.shield}</i>
                <span class="pk-opt__body"><b>Seguro viagem ${intl(d) ? 'internacional' : 'nacional'}</b><small>Cobertura médica de até ${intl(d) ? 'US$ 60 mil' : 'R$ 30 mil'}, bagagem e assistência 24 h</small><span class="pk-opt__price">${money(intl(d) ? 38 : 14)} por pessoa, por dia</span></span>
                <i class="pk-tick">${I.check}</i>
              </label>`)}
            <div class="pk-plan">
              <p class="eyebrow" data-reveal>Roteiro do pacote</p>
              <h2 class="h2" data-split>${d.days} dias em <em>${d.name}</em></h2>
              <ol class="plan__list"><span class="plan__line" aria-hidden="true"><span></span></span>${planItems(d).map(dayLi).join('')}</ol>
            </div>
          </div>
          <aside class="pk__sum">
            <div class="pk-sum">
              <div class="pk-sum__head"><span class="pk-sum__thumb">${Ph.img(Ph.D[d.id], '', { sizes: '64px', max: 480 })}</span><div><small>Seu pacote</small><b>${d.name} · ${d.days} dias</b><small data-sum-sub></small></div></div>
              <dl class="pk-sum__rows">
                <div data-row="flight"><dt>${I.plane}<span data-lbl="flight">Passagem aérea</span></dt><dd></dd></div>
                <div data-row="hotel"><dt>${I.Hotel}<span data-lbl="hotel">Hospedagem</span></dt><dd></dd></div>
                <div data-row="transfer"><dt>${I.car}<span>Transfers</span></dt><dd></dd></div>
                <div data-row="tours"><dt>${I.ticket}<span data-lbl="tours">Passeios</span></dt><dd></dd></div>
                <div data-row="insurance"><dt>${I.shield}<span>Seguro viagem</span></dt><dd></dd></div>
                ${d.fee ? `<div data-row="fee"><dt>${I.bag}<span>${d.fee.label}</span></dt><dd></dd></div>` : ''}
              </dl>
              <div class="pk-sum__total"><span>Total</span><b data-total></b></div>
              <p class="pk-sum__pp"><b data-pp></b> por pessoa<br><span data-inst></span></p>
              <button class="btn btn--ink btn--block" type="button" data-pk-book>Reservar pacote ${I.arrow}</button>
              <a class="btn btn--ghost btn--block" href="#/" data-goto="contato">Falar com um especialista</a>
              <p class="book__small">Preços ilustrativos. Um especialista confirma voos e disponibilidade antes de qualquer cobrança.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
    <div class="pk-bar"><span><small>Total do pacote</small><b data-bar-total></b></span><button class="btn btn--ink btn--sm" type="button" data-pk-sum>Ver resumo ${I.arrow}</button></div>`;
  }

  /* ---------- painel da hospedagem ---------- */
  function sheetHTML(s) {
    const d = s.dest, near = nearby(s), maxK = near[near.length - 1].k || 1;
    const tIcon = m => (m === 'walk' ? I.walk : m === 'boat' ? I.boat : I.car);
    return `<div class="sheet__scrim" data-close></div>
    <article class="sheet__panel" role="dialog" aria-modal="true" aria-labelledby="sh-title">
      <header class="sheet__top">
        <button class="iconbtn" type="button" data-close aria-label="Fechar">${I.close}</button>
        <p class="sheet__crumb">${d.name} <span>/</span> ${TYPES[s.type]}</p>
        <button class="btn btn--sm btn--ghost" type="button" data-showmap="${s.id}">${I.pin} Ver no mapa</button>
      </header>
      <div class="sheet__body">
        <div class="sh-head sh-anim" style="--i:0">
          <div><p class="eyebrow">${TYPES[s.type]} · ${d.name}, ${d.country}</p><h2 class="sh-title" id="sh-title">${s.name}</h2></div>
          <p class="sh-rating"><span>${I.star} ${rating(s.rating)}</span>${s.reviews} avaliações</p>
        </div>
        <div class="gal sh-anim" style="--i:1">
          <div class="gal__stage">
            ${s.rooms.map((r, i) => `<div class="gal__s${i === 0 ? ' is-on' : ''}">${roomImg(s, r, { sizes: '(max-width: 1120px) 100vw, 1060px', max: 2400, eager: i === 0 })}<span class="gal__label">${ROOM_LABEL[r]}</span></div>`).join('')}
            <span class="gal__count"><b>01</b> / ${pad(s.rooms.length)}</span>
            <div class="gal__nav"><button class="iconbtn" type="button" data-gal="-1" aria-label="Foto anterior">${I.prev}</button><button class="iconbtn" type="button" data-gal="1" aria-label="Próxima foto">${I.next}</button></div>
            <span class="gal__bar"><i></i></span>
          </div>
          <div class="gal__thumbs">${s.rooms.map((r, i) => `<button class="gal__t${i === 0 ? ' is-on' : ''}" type="button" data-thumb="${i}"><div>${roomImg(s, r, { sizes: '128px', max: 480 })}</div><span>${ROOM_LABEL[r]}</span></button>`).join('')}</div>
        </div>
        <div class="sh-grid">
          <div class="sh-main sh-anim" style="--i:2">
            <p class="sh-desc">${s.desc}</p>
            <ul class="sh-facts"><li>${I.users} Até ${s.guests} hóspedes</li><li>${I.Hotel} ${s.beds} ${s.beds > 1 ? 'quartos' : 'quarto'}</li><li>${I.bath} ${s.baths} ${s.baths > 1 ? 'banheiros' : 'banheiro'}</li></ul>
            <h3 class="sh-h">O que tem aqui</h3>
            <ul class="amen">${s.amen.map(k => `<li>${AI[k] || ''}${AMEN[k]}</li>`).join('')}</ul>
            <h3 class="sh-h">Pontos turísticos por perto</h3>
            <ul class="near">${near.map(({ a, k }, i) => { const t = travel(k, a); return `<li style="--c:${CATS[a.cat].color}">
              <div><b>${a.name}</b><small><i></i>${CATS[a.cat].label}</small></div>
              <div class="near__d"><b>${fmtKm(k)}</b><small>${tIcon(t.mode)} ${t.text}</small></div>
              <div class="near__bar"><span style="--w:${Math.max(6, 100 - (k / maxK) * 90).toFixed(0)}%;--d:${500 + i * 90}ms"></span></div>
            </li>`; }).join('')}</ul>
          </div>
          <aside class="book sh-anim" style="--i:3">
            <p class="book__price"><strong>${money(s.price)}</strong> / noite</p>
            <p class="book__note">${I.star} ${rating(s.rating)} · cancelamento grátis até 7 dias antes</p>
            <div class="book__fields">
              <label>Check-in<input type="date" data-ci></label>
              <label>Check-out<input type="date" data-co></label>
              <label>Hóspedes<select data-g>${Array.from({ length: s.guests }, (_, i) => `<option${i === Math.min(1, s.guests - 1) ? ' selected' : ''} value="${i + 1}">${i + 1} ${i ? 'hóspedes' : 'hóspede'}</option>`).join('')}</select></label>
            </div>
            <button class="btn btn--ink btn--block" type="button" data-book>Solicitar reserva ${I.arrow}</button>
            <dl class="book__sum">
              <div><dt data-nights></dt><dd data-sub></dd></div>
              <div><dt>${s.type === 'Casa' ? 'Taxa de limpeza' : 'Taxas e serviço'}</dt><dd data-fee></dd></div>
              <div class="is-total"><dt>Total</dt><dd data-total></dd></div>
            </dl>
            <p class="book__small">Você ainda não será cobrado. Um especialista confirma a disponibilidade.</p>
          </aside>
        </div>
      </div>
    </article>`;
  }

  /* ================================================================
     ROTAS E TRANSIÇÕES
     ================================================================ */
  function parse() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    let stay = null;
    const si = parts.indexOf('estadia');
    if (si > -1) { stay = parts[si + 1] || null; parts.splice(si); }
    let r = { view: 'home' };
    if (parts[0] === 'destino' && destById[parts[1]]) r = { view: 'dest', id: parts[1] };
    else if (parts[0] === 'pacote' && destById[parts[1]]) r = { view: 'package', id: parts[1] };
    else if (parts[0] === 'pacotes') r = { view: 'packages' };
    else if (parts[0] === 'estadias') r = { view: 'stays' };
    r.key = r.view + ':' + (r.id || '');
    r.base = '#/' + ({ dest: `destino/${r.id}`, package: `pacote/${r.id}`, packages: 'pacotes', stays: 'estadias' }[r.view] || '');
    r.stay = stay && stayById[stay] ? stay : null;
    return r;
  }

  function route() {
    const r = parse();
    state.base = r.base;
    if (r.key !== state.key) {
      const first = state.key === null;
      state.key = r.key;
      if (sheet.el) closeStay(true);
      if (first) { mount(r); afterSwap(); }
      else swap(() => mount(r), afterSwap);
    }
    if (r.stay) openStay(r.stay); else closeStay();
  }

  function mount(r) {
    cleanups.forEach(fn => { try { fn(); } catch (e) { /* noop */ } });
    cleanups = [];
    let html, title;
    if (r.view === 'dest') { const d = destById[r.id]; html = viewDest(d); title = `${d.name} · Voyage`; }
    else if (r.view === 'stays') { html = viewStays(); title = 'Estadias · Voyage'; }
    else if (r.view === 'packages') { html = viewPackages(); title = 'Pacotes · Voyage'; }
    else if (r.view === 'package') { const d = destById[r.id]; html = viewPackage(d); title = `Pacote ${d.name} · Voyage`; }
    else { html = viewHome(); title = 'Voyage · Agência de viagens'; }
    app.innerHTML = html;
    document.title = title;
    document.body.dataset.view = r.view;
    state.morph = false;
    const activeHref = { stays: '#/estadias', packages: '#/pacotes', package: '#/pacotes' }[r.view];
    $$('.nav__links a').forEach(a => a.classList.toggle('is-active', !!activeHref && a.getAttribute('href') === activeHref));
    enhance(app, r);
  }

  function afterSwap() {
    if (state.pendingGoto) { const id = state.pendingGoto; state.pendingGoto = null; setTimeout(() => scrollToId(id), 120); }
    if (state.pendingAttr && attrById[state.pendingAttr]) {
      const id = state.pendingAttr; state.pendingAttr = null;
      setTimeout(() => { const card = $('#a-' + id); if (card) { scrollToEl(card, 120); card.classList.add('is-flash'); setTimeout(() => card.classList.remove('is-flash'), 2200); } }, 150);
    }
    if (state.pendingStay) {
      const id = state.pendingStay; state.pendingStay = null;
      setTimeout(() => { const w = $('#onde-ficar'); if (w) { scrollToEl($('.where__grid', w) || w, 90); w._hl && w._hl(id); } }, 200);
    }
  }

  let morphSrc = null;
  function swap(update, done) {
    const fin = () => {
      const h = $('.dhero__art'); if (h) h.style.viewTransitionName = '';
      if (morphSrc) { morphSrc.style.viewTransitionName = ''; morphSrc = null; }
      done && done();
    };
    if (canVT) {
      // garante um único elemento com o nome do morph
      $$('.dhero__art').forEach(h => { if (h !== morphSrc) h.style.viewTransitionName = ''; });
      const t = document.startViewTransition(() => { update(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      t.finished.then(fin, fin);
    } else if (!reduce) {
      const c = $('#curtain');
      c.classList.remove('is-out'); c.classList.add('is-in');
      setTimeout(() => {
        update(); window.scrollTo({ top: 0, behavior: 'instant' });
        c.classList.add('is-out');
        setTimeout(() => { c.classList.remove('is-in', 'is-out'); fin(); }, 750);
      }, 620);
    } else { update(); window.scrollTo(0, 0); fin(); }
  }

  function scrollToEl(el, offset = 80) {
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }
  function scrollToId(id) { const el = document.getElementById(id); if (el) scrollToEl(el, id === 'contato' ? 0 : 70); }
  function goto(id) {
    const el = document.getElementById(id);
    if (sheet.el) location.hash = state.base;
    if (el && (state.key === 'home:' || el.closest('.foot'))) scrollToId(id);
    else { state.pendingGoto = id; location.hash = '#/'; }
  }

  /* ================================================================
     COMPORTAMENTOS
     ================================================================ */
  let io;
  function enhance(root, r) {
    $$('[data-split]', root).forEach(el => split(el, false));
    $$('[data-split-chars]', root).forEach(el => split(el, true));
    io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      io.unobserve(en.target);
      if (en.target.dataset.count) countUp(en.target);
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal], .split, [data-count], .step', root).forEach(el => io.observe(el));
    const localIO = io;
    onCleanup(() => localIO.disconnect());

    $$('.magnetic', root).forEach(magnetic);
    if (fine) $$('[data-tilt]', root).forEach(tilt);

    scroller.hero = $('[data-hero]', root);
    scroller.heroLayers = $$('[data-depth]', root);
    scroller.dhero = $('[data-dhero]', root);
    scroller.hs = $('.hs', root);
    scroller.plan = $('.plan__list', root);
    scroller.subnav = $('.subnav', root);
    scroller.marquee = $('.marquee__track', root);
    $('#nav').classList.toggle('is-light', r.view !== 'stays' && r.view !== 'packages');
    markLoaded(root);
    if (scroller.hero) initHeroSlides(scroller.hero);

    const acc = $('.acc', root); if (acc) initAcc(acc);
    const form = $('.search', root); if (form) initSearch(form);
    const q = $('.quotes', root); if (q) initQuotes(q);
    if (scroller.hs) sizeHS();
    if (r.view === 'dest') { initGuide(root); initWhere(root, destById[r.id]); initDestHero(root); initSubnav(root); }
    if (r.view === 'stays') initStaysPage(root);
    if (r.view === 'packages') initPackagesPage(root);
    if (r.view === 'package') { initPackage(root, destById[r.id]); initDestHero(root); }
  }

  function split(el, chars) {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = '1';
    if (chars) el.setAttribute('aria-label', el.textContent.trim());
    let i = 0;
    const walk = node => {
      Array.from(node.childNodes).forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            if (chars) {
              w.setAttribute('aria-hidden', 'true');
              Array.from(part).forEach(ch => { const c = document.createElement('span'); c.textContent = ch; c.style.setProperty('--i', i++); w.appendChild(c); });
            } else {
              const s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++); w.appendChild(s);
            }
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    el.classList.add('split');
    if (chars) el.classList.add('split--chars');
  }

  function countUp(el) {
    const end = parseFloat(el.dataset.count), dec = +el.dataset.dec || 0, dur = 1600, t0 = performance.now();
    if (reduce) { el.textContent = end.toFixed(dec).replace('.', ','); return; }
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function magnetic(el) {
    if (!fine || reduce || el.dataset.mag) return;
    el.dataset.mag = '1';
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }

  function tilt(el) {
    if (reduce) return;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }

  function flip(els, mutate) {
    const first = new Map(els.filter(e => !e.hidden).map(e => [e, e.getBoundingClientRect()]));
    mutate();
    if (reduce) return;
    els.forEach(e => {
      if (e.hidden) return;
      e.classList.add('is-in');
      const l = e.getBoundingClientRect(), f = first.get(e);
      if (f) {
        const dx = f.left - l.left, dy = f.top - l.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) e.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,.7,.2,1)' });
      } else {
        e.animate([{ opacity: 0, transform: 'translateY(24px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 650, delay: 120, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
      }
    });
  }

  /* ---------- galeria acordeão ---------- */
  function initAcc(root) {
    const row = $('.acc__row', root), tabs = $('.tabs'), ink = $('.tabs__ink'), lead = $('[data-tab-lead]');
    let panels = [], cur = 0, timer = 0, hover = false, focusIn = false, visible = false, enterT = 0, openT = 0;
    const hold = 4200, auto = root.dataset.auto !== '0' && !reduce;

    function open(i) {
      cur = (i + panels.length) % panels.length;
      panels.forEach((p, k) => {
        const on = k === cur;
        p.classList.toggle('is-open', on);
        const b = $('.acc__btn', p); b.setAttribute('aria-expanded', on ? 'true' : 'false');
        $('.acc__cta', p).tabIndex = on ? 0 : -1;
        if (!on) { p.style.removeProperty('--mx'); p.style.removeProperty('--my'); }
      });
    }
    function schedule() { clearTimeout(timer); if (auto && visible && !hover && !focusIn && !sheet.el) timer = setTimeout(() => { open(cur + 1); schedule(); }, hold); }
    function bind() {
      panels = $$('.acc__p', row);
      panels.forEach((p, i) => {
        const b = $('.acc__btn', p);
        p.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; clearTimeout(enterT); enterT = setTimeout(() => open(i), 90); });
        p.addEventListener('pointerleave', () => clearTimeout(enterT));
        p.addEventListener('pointermove', e => {
          if (!p.classList.contains('is-open') || reduce) return;
          const r = p.getBoundingClientRect();
          p.style.setProperty('--mx', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
          p.style.setProperty('--my', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
        });
        b.addEventListener('click', () => {
          clearTimeout(openT);
          if (p.classList.contains('is-open')) {
            $('.acc__cta', p).click();
            return;
          }
          open(i);
          openT = setTimeout(() => $('.acc__cta', p).click(), reduce ? 0 : 850);
        });
        b.addEventListener('focus', () => open(i));
        b.addEventListener('keydown', e => {
          const k = e.key, dd = k === 'ArrowRight' || k === 'ArrowDown' ? 1 : k === 'ArrowLeft' || k === 'ArrowUp' ? -1 : 0;
          if (!dd) return; e.preventDefault(); $('.acc__btn', panels[(i + dd + panels.length) % panels.length]).focus();
        });
      });
      open(0);
    }
    function moveInk() {
      const sel = $('[aria-selected="true"]', tabs); if (!sel || !ink) return;
      ink.style.width = sel.offsetWidth + 'px'; ink.style.transform = `translateX(${sel.offsetLeft - 4}px)`;
    }
    $$('[role="tab"]', tabs).forEach(t => t.addEventListener('click', () => {
      if (t.getAttribute('aria-selected') === 'true') return;
      $$('[role="tab"]', tabs).forEach(x => x.setAttribute('aria-selected', x === t ? 'true' : 'false'));
      moveInk();
      const tab = t.dataset.tab;
      lead.textContent = tab === 'brasil' ? 'Cinco destinos brasileiros com roteiro desenhado à mão, hospedagem escolhida a dedo e guia local.' : 'Cinco destinos pelo mundo com roteiro desenhado à mão, hospedagem escolhida a dedo e guia local.';
      row.classList.add('is-out');
      setTimeout(() => {
        row.innerHTML = DESTS.filter(d => d.tab === tab).map(accPanel).join('');
        markLoaded(row);
        row.classList.remove('is-out');
        bind(); schedule();
      }, reduce ? 0 : 420);
    }));
    root.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; clearTimeout(timer); } });
    root.addEventListener('pointerleave', () => { hover = false; schedule(); });
    root.addEventListener('focusin', () => { focusIn = true; clearTimeout(timer); });
    root.addEventListener('focusout', e => { if (!root.contains(e.relatedTarget)) { focusIn = false; schedule(); } });
    const vio = new IntersectionObserver(es => { visible = es[0].isIntersecting; root.classList.toggle('is-near', visible); if (visible) { row.classList.add('is-in'); schedule(); } else clearTimeout(timer); }, { threshold: 0.2 });
    vio.observe(root);
    onCleanup(() => { vio.disconnect(); clearTimeout(timer); clearTimeout(enterT); clearTimeout(openT); });
    bind();
    requestAnimationFrame(moveInk);
    addEventListener('resize', moveInk);
    onCleanup(() => removeEventListener('resize', moveInk));
    root._pause = () => clearTimeout(timer);
    root._resume = schedule;
  }

  /* ---------- busca da capa ---------- */
  /* Busca da capa: a pessoa só escolhe o destino. As hospedagens aparecem depois, na página do destino. */
  function initSearch(form) {
    const input = $('input', form), drop = $('.search__drop', form);
    let results = [], active = 0;
    const thumb = id => `<span class="drop-item__thumb">${Ph.img(id, '', { sizes: '48px', max: 480 })}</span>`;

    // etapa 1: destinos (a busca também acha pelo país, região ou por um ponto turístico)
    function destResults() {
      const q = norm(input.value.trim()), terms = q.split(/\s+/).filter(Boolean);
      return DESTS.map(d => {
        if (!terms.length) return { d };
        if (terms.every(t => norm(`${d.name} ${d.country} ${d.region} ${d.tagline} ${d.tab}`).includes(t))) return { d };
        const a = d.attractions.find(x => terms.every(t => norm(`${x.name} ${CATS[x.cat].label}`).includes(t)));
        return a ? { d, a } : null;
      }).filter(Boolean);
    }
    function paintDests() {
      results = destResults();
      active = Math.min(active, Math.max(0, results.length - 1));
      drop.innerHTML = `<p class="drop-head"><span>${input.value.trim() ? 'Destinos encontrados' : 'Escolha o destino'}</span><small>${results.length} ${results.length === 1 ? 'destino' : 'destinos'}</small></p>`
        + (results.length
          ? `<div class="drop-grid">${results.map(({ d, a }, i) => `<button type="button" class="drop-item${i === active ? ' is-active' : ''}" data-pick-dest="${d.id}" style="--i:${i}">${thumb(Ph.D[d.id])}<span class="drop-item__txt"><b>${d.name}</b><small>${a ? `Tem ${a.name}` : `${d.tab === 'brasil' ? d.region : d.country} · ${d.attractions.length} pontos turísticos`}</small></span>${I.arrow}</button>`).join('')}</div>`
          : '<p class="drop-empty">Nenhum destino com esse nome. Tente “praia”, “Japão” ou “cachoeira”.</p>');
    }

    const paint = () => { drop.hidden = false; paintDests(); };
    const hide = () => { drop.hidden = true; };

    // escolheu o destino: abre a página dele (sobre o lugar, o que fazer e, depois, onde ficar)
    function goDest(d) {
      hide(); input.blur(); input.value = '';
      location.hash = `#/destino/${d.id}`;
    }

    input.addEventListener('focus', paint);
    input.addEventListener('input', () => { active = 0; paint(); });
    form.addEventListener('focusout', e => { if (!form.contains(e.relatedTarget)) setTimeout(() => { if (!form.contains(document.activeElement)) hide(); }, 150); });
    const outside = e => { if (!form.contains(e.target)) hide(); };
    document.addEventListener('pointerdown', outside);
    onCleanup(() => document.removeEventListener('pointerdown', outside));
    form.addEventListener('keydown', e => {
      if (e.key === 'Escape') { hide(); return; }
      if (drop.hidden || !results.length) return;
      const cols = innerWidth > 760 ? 2 : 1;
      const mv = { ArrowDown: cols, ArrowUp: -cols }[e.key];
      if (mv) { e.preventDefault(); active = (active + mv + results.length) % results.length; paint(); }
    });
    drop.addEventListener('mousedown', e => e.preventDefault());
    drop.addEventListener('click', e => {
      const dd = e.target.closest('[data-pick-dest]');
      if (dd) goDest(destById[dd.dataset.pickDest]);
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const r = destResults();
      if (r.length && (input.value.trim() || !drop.hidden)) goDest(r[Math.min(active, r.length - 1)].d);
      else { input.focus(); paint(); }
    });
  }

  /* ---------- capa: fotos que se alternam ---------- */
  function initHeroSlides(hero) {
    const slides = $$('.hero__slide', hero), now = $('[data-hero-now]', hero), dots = $$('.hero__dots span', hero);
    let i = 0, t = 0;
    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((s, k) => s.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-on', k === i));
      const d = destById[HERO[i]];
      now.classList.add('is-swap');
      setTimeout(() => { now.href = `#/destino/${d.id}`; $('b', now).textContent = d.name; now.classList.remove('is-swap'); }, 350);
      t = setTimeout(() => go(i + 1), 6500);
    };
    if (!reduce) t = setTimeout(() => go(1), 6500);
    onCleanup(() => clearTimeout(t));
  }

  /* ---------- depoimentos ---------- */
  function initQuotes(root) {
    const qs = $$('.quote', root), dots = $$('.quotes__dots button', root);
    let i = 0, t = 0;
    const go = n => {
      i = (n + qs.length) % qs.length;
      qs.forEach((q, k) => q.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => { d.classList.toggle('is-on', k === i); d.setAttribute('aria-selected', k === i); });
      clearTimeout(t); if (!reduce) t = setTimeout(() => go(i + 1), 6500);
    };
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    go(0);
    onCleanup(() => clearTimeout(t));
  }

  /* ---------- rolagem horizontal fixa ---------- */
  function sizeHS() {
    const hs = scroller.hs; if (!hs) return;
    const track = $('.hs__track', hs);
    if (innerWidth <= 760) { hs.style.height = ''; track.style.transform = ''; return; }
    hs.style.height = `${track.scrollWidth - innerWidth + innerHeight + 40}px`;
  }

  /* ---------- destino: capa ---------- */
  function initDestHero(root) {
    const h = $('[data-dhero]', root);
    if (!h || reduce || !fine) return;
    h.addEventListener('pointermove', e => {
      h.style.setProperty('--mx', ((e.clientX / innerWidth - 0.5) * 2).toFixed(3));
      h.style.setProperty('--my', ((e.clientY / innerHeight - 0.5) * 2).toFixed(3));
    });
  }

  function initSubnav(root) {
    const links = $$('.subnav a', root);
    const sio = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-on', a.dataset.sub === en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(a => { const s = document.getElementById(a.dataset.sub); if (s) sio.observe(s); });
    links.forEach(a => a.addEventListener('click', e => { e.preventDefault(); scrollToId(a.dataset.sub); }));
    onCleanup(() => sio.disconnect());
  }

  /* ---------- destino: guia com filtro ---------- */
  function initGuide(root) {
    const cards = $$('.acard', root), chips = $$('[data-cat]', $('.filters', root));
    chips.forEach(c => c.addEventListener('click', () => {
      chips.forEach(x => x.classList.toggle('is-on', x === c));
      const cat = c.dataset.cat;
      flip(cards, () => cards.forEach(card => { card.hidden = cat !== 'all' && card.dataset.cat !== cat; }));
    }));
  }

  /* ---------- destino: mapa + hospedagens ---------- */
  function initWhere(root, d) {
    const w = $('#onde-ficar', root); if (!w) return;
    const map = $('[data-map]', w), lines = $('.map__lines', w), labels = $('.map__labels', w), items = $('.where__items', w), sel = $('[data-near]', w);
    const rows = $$('.srow', items), chips = $$('[data-stype]', w);
    const st = { type: state.prefType || 'all', near: '', hl: null };
    state.prefType = null;
    const visible = () => d.stays.filter(s => st.type === 'all' || s.type === st.type);

    function nearText(s) {
      if (st.near) {
        const a = attrById[st.near], k = km(s, a), t = travel(k, a);
        return `<b>${fmtKm(k)}</b> de ${a.name} · ${t.text}`;
      }
      const n = nearby(s).slice(0, 2);
      return `Mais perto: <b>${n[0].a.name}</b> (${fmtKm(n[0].k)}) e ${n[1].a.name} (${fmtKm(n[1].k)})`;
    }
    function update() {
      let list = d.stays.slice();
      if (st.near) { const a = attrById[st.near]; list.sort((x, y) => km(x, a) - km(y, a)); }
      flip(rows, () => {
        list.forEach(s => {
          const r = rows.find(x => x.dataset.id === s.id);
          r.hidden = !(st.type === 'all' || s.type === st.type);
          $('[data-neartext]', r).innerHTML = nearText(s);
          items.appendChild(r);
        });
      });
      chips.forEach(c => c.classList.toggle('is-on', c.dataset.stype === st.type));
      $$('.pin--s', map).forEach(p => { const s = stayById[p.dataset.stayPin]; p.classList.toggle('is-dim', !(st.type === 'all' || s.type === st.type)); });
      $$('.pin--a', map).forEach(p => { p.classList.toggle('is-sel', p.dataset.attrPin === st.near); p.classList.toggle('is-dim', !!st.near && p.dataset.attrPin !== st.near); });
      sel.value = st.near;
      draw();
    }
    function draw() {
      let pairs = [];
      const hs = st.hl && stayById[st.hl];
      if (hs) pairs = (st.near ? [attrById[st.near]] : d.attractions).map(a => [hs, a]);
      else if (st.near) pairs = visible().map(s => [s, attrById[st.near]]);
      lines.innerHTML = pairs.map(([s, a], i) => `<line x1="${s.x}" y1="${s.y}" x2="${a.x}" y2="${a.y}" pathLength="1" stroke="${CATS[a.cat].color}" style="animation-delay:${i * 50}ms"/>`).join('');
      labels.innerHTML = pairs.map(([s, a], i) => `<span class="mlabel" style="left:${(s.x + a.x) / 2}%;top:${((s.y + a.y) / 2 / 0.7).toFixed(2)}%;animation-delay:${250 + i * 50}ms">${fmtKm(km(s, a))}</span>`).join('');
      $$('.pin--s', map).forEach(p => p.classList.toggle('is-hl', p.dataset.stayPin === st.hl));
      rows.forEach(r => r.classList.toggle('is-hl', r.dataset.id === st.hl));
    }
    const setHl = id => { if (st.hl === id) return; st.hl = id; draw(); };

    chips.forEach(c => c.addEventListener('click', () => { st.type = c.dataset.stype; update(); }));
    sel.addEventListener('change', () => { st.near = sel.value; update(); });
    $$('.pin--a', map).forEach(p => p.addEventListener('click', () => { st.near = st.near === p.dataset.attrPin ? '' : p.dataset.attrPin; update(); }));
    $$('.pin--s', map).forEach(p => {
      p.addEventListener('pointerenter', () => setHl(p.dataset.stayPin));
      p.addEventListener('pointerleave', () => setHl(null));
      p.addEventListener('focus', () => setHl(p.dataset.stayPin));
      p.addEventListener('blur', () => setHl(null));
      p.addEventListener('click', () => openStayRoute(p.dataset.stayPin));
    });
    rows.forEach(r => {
      r.addEventListener('pointerenter', () => setHl(r.dataset.id));
      r.addEventListener('pointerleave', () => setHl(null));
      r.addEventListener('focusin', () => setHl(r.dataset.id));
    });
    $$('[data-focus-attr]', root).forEach(b => b.addEventListener('click', () => {
      st.near = b.dataset.focusAttr; update();
      scrollToEl($('.where__grid', w), 90);
    }));
    w._hl = id => { setHl(id); setTimeout(() => setHl(null), 4000); };
    const mio = new IntersectionObserver(es => { if (es[0].isIntersecting) { map.classList.add('is-in'); mio.disconnect(); } }, { threshold: 0.3 });
    mio.observe(map);
    onCleanup(() => mio.disconnect());
    // primeira pintura, sem animação de troca
    rows.forEach(r => { const s = stayById[r.dataset.id]; r.hidden = !(st.type === 'all' || s.type === st.type); $('[data-neartext]', r).innerHTML = nearText(s); });
    chips.forEach(c => c.classList.toggle('is-on', c.dataset.stype === st.type));
    $$('.pin--s', map).forEach(p => { const s = stayById[p.dataset.stayPin]; p.classList.toggle('is-dim', !(st.type === 'all' || s.type === st.type)); });
  }

  /* ---------- página de estadias ---------- */
  function initStaysPage(root) {
    const grid = $('[data-grid]', root), cards = $$('.scard', grid), count = $('.phead__count b', root);
    const f = { type: 'all', dest: '', sort: 'rec' };
    const chips = $$('[data-ftype]', root);
    function apply() {
      const list = ALL_STAYS.slice();
      if (f.sort === 'low') list.sort((a, b) => a.price - b.price);
      if (f.sort === 'high') list.sort((a, b) => b.price - a.price);
      if (f.sort === 'rate') list.sort((a, b) => b.rating - a.rating);
      let n = 0;
      flip(cards, () => list.forEach(s => {
        const c = cards.find(x => x.dataset.id === s.id);
        c.hidden = !((f.type === 'all' || s.type === f.type) && (!f.dest || s.dest.id === f.dest));
        if (!c.hidden) n++;
        grid.appendChild(c);
      }));
      count.textContent = n;
    }
    chips.forEach(c => c.addEventListener('click', () => { f.type = c.dataset.ftype; chips.forEach(x => x.classList.toggle('is-on', x === c)); apply(); }));
    $('[data-fdest]', root).addEventListener('change', e => { f.dest = e.target.value; apply(); });
    $('[data-fsort]', root).addEventListener('change', e => { f.sort = e.target.value; apply(); });
  }

  /* ---------- página de pacotes: filtros ---------- */
  function initPackagesPage(root) {
    const grid = $('[data-grid]', root), cards = $$('.pkcard', grid), count = $('.phead__count b', root);
    const f = { region: 'all', theme: '', sort: 'rec' };
    const regions = $$('[data-pregion]', root), themes = $$('[data-ptheme]', root);
    function apply() {
      const list = DESTS.slice();
      if (f.sort === 'low') list.sort((a, b) => a.from - b.from);
      if (f.sort === 'high') list.sort((a, b) => b.from - a.from);
      if (f.sort === 'days') list.sort((a, b) => b.days - a.days);
      let n = 0;
      flip(cards, () => list.forEach(d => {
        const c = cards.find(x => x.dataset.id === d.id);
        c.hidden = !((f.region === 'all' || d.tab === f.region) && (!f.theme || d.tags.includes(f.theme)));
        if (!c.hidden) n++;
        grid.appendChild(c);
      }));
      count.textContent = n;
      regions.forEach(b => b.classList.toggle('is-on', b.dataset.pregion === f.region));
      themes.forEach(b => b.classList.toggle('is-on', b.dataset.ptheme === f.theme));
    }
    regions.forEach(b => b.addEventListener('click', () => { f.region = b.dataset.pregion; apply(); }));
    themes.forEach(b => b.addEventListener('click', () => { f.theme = f.theme === b.dataset.ptheme ? '' : b.dataset.ptheme; apply(); }));
    $('[data-psort]', root).addEventListener('change', e => { f.sort = e.target.value; apply(); });
  }

  /* ---------- página do pacote: montar e calcular o preço ---------- */
  function tween(el, to) {
    if (!el) return;
    const from = el._v == null ? to : el._v;
    el._v = to;
    cancelAnimationFrame(el._raf);
    if (reduce || from === to) { el.textContent = money(to); return; }
    const t0 = performance.now(), dur = 650;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = money(from + (to - from) * e);
      if (p < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }
  function initPackage(root, d) {
    const c = pkgDefaults(d), q$ = s => $(s, root);
    const fmtDate = v => new Date(v + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
    function update() {
      const q = quote(d, c), o = ORIGIN[c.origin];
      $$('[data-row]', root).forEach(row => {
        const k = row.dataset.row, v = q.rows[k], dd = $('dd', row);
        row.classList.toggle('is-zero', !v);
        if (v) tween(dd, v); else { dd._v = 0; dd.textContent = k === 'flight' ? 'Não precisa' : 'Não incluído'; }
      });
      q$('[data-lbl="flight"]').textContent = q.flightPP ? `Passagem aérea · ${q.pax} ${q.pax > 1 ? 'pessoas' : 'pessoa'}` : 'Passagem aérea';
      q$('[data-lbl="hotel"]').textContent = `${q.stay.name} · ${q.nights} noites${q.rooms > 1 ? ` · ${q.rooms} quartos` : ''}`;
      q$('[data-lbl="tours"]').textContent = `${q.tours.length} ${q.tours.length === 1 ? 'passeio guiado' : 'passeios guiados'}`;
      tween(q$('[data-total]'), q.total); tween(q$('[data-pp]'), q.pp); tween(q$('[data-bar-total]'), q.total);
      q$('[data-inst]').textContent = `ou ${inst(q.total)}`;
      q$('[data-sum-sub]').textContent = `Ida ${fmtDate(c.date)} · ${c.adults} ${c.adults > 1 ? 'adultos' : 'adulto'}${c.kids ? ` + ${c.kids} ${c.kids > 1 ? 'crianças' : 'criança'}` : ''}`;
      q$('[data-route]').innerHTML = q.flightPP
        ? `<span class="pk-route__line"><b>${o.city}</b><i>${o.code}</i><span class="pk-route__plane">${I.plane}</span><i>${d.air.code}</i><b>${d.air.city}</b></span><small>Ida e volta · ${money(q.flightPP)} por adulto · ${d.flight}. ${d.note}</small>`
        : `<span class="pk-route__line"><b>${o.city}</b><span class="pk-route__plane">${I.car}</span><b>${d.name}</b></span><small>Saindo de ${o.city} você não precisa de voo. ${d.note}</small>`;
      // diferença de preço de cada hospedagem em relação à escolhida
      d.stays.forEach(s => {
        const el = q$(`[data-stay-price="${s.id}"]`);
        if (s.id === c.stay) { el.innerHTML = `<b>Incluída</b> · ${money(s.price)}/noite`; return; }
        const diff = quote(d, { ...c, stay: s.id }).total - q.total;
        el.innerHTML = `${diff > 0 ? '+' : '−'} ${money(Math.abs(diff))} <small>no total</small>`;
      });
      $$('[data-pax]', root).forEach(b => {
        const k = b.dataset.pax, min = k === 'adults' ? 1 : 0, max = k === 'adults' ? 8 : 6;
        b.disabled = (+b.dataset.d < 0 && c[k] <= min) || (+b.dataset.d > 0 && c[k] >= max);
      });
      q$('[data-count-adults]').textContent = c.adults;
      q$('[data-count-kids]').textContent = c.kids;
    }
    q$('[data-origin]').addEventListener('change', e => { c.origin = e.target.value; update(); });
    q$('[data-date]').addEventListener('change', e => { if (e.target.value) { c.date = e.target.value; update(); } });
    $$('[data-pax]', root).forEach(b => b.addEventListener('click', () => {
      c[b.dataset.pax] += +b.dataset.d;
      const n = q$(`[data-count-${b.dataset.pax}]`);
      n.classList.remove('bump'); void n.offsetWidth; n.classList.add('bump');
      update();
    }));
    $$('input[name="pk-stay"]', root).forEach(r => r.addEventListener('change', () => { c.stay = r.value; update(); }));
    $$('.pk-tour input', root).forEach(x => x.addEventListener('change', () => { c.tours = $$('.pk-tour input:checked', root).map(i => i.value); update(); }));
    const ins = q$('[data-ins]'); ins.addEventListener('change', () => { c.insurance = ins.checked; update(); });
    q$('[data-pk-book]').addEventListener('click', () => {
      const q = quote(d, c);
      toast(`Pedido enviado! Pacote ${d.name} para ${q.pax} ${q.pax > 1 ? 'pessoas' : 'pessoa'}, saindo de ${ORIGIN[c.origin].city}, total de ${money(q.total)}. Um especialista confirma em até 2 horas. (demonstração)`);
    });
    // barra fixa no celular: some quando o resumo está visível
    const bar = $('.pk-bar', root), sum = q$('.pk-sum');
    q$('[data-pk-sum]').addEventListener('click', () => scrollToEl(sum, 90));
    const bio = new IntersectionObserver(es => bar.classList.toggle('is-hidden', es[0].isIntersecting), { threshold: 0.15 });
    bio.observe(sum);
    const hero = q$('[data-dhero]');
    const hio = new IntersectionObserver(es => bar.classList.toggle('is-away', es[0].isIntersecting), { threshold: 0.4 });
    hio.observe(hero);
    onCleanup(() => { bio.disconnect(); hio.disconnect(); });
    update();
  }

  /* ================================================================
     PAINEL DA HOSPEDAGEM
     ================================================================ */
  const sheet = { el: null, id: null, onKey: null, timer: 0 };
  function openStayRoute(id) { location.hash = (state.base === '#/' ? '#' : state.base) + '/estadia/' + id; }

  function openStay(id) {
    if (sheet.id === id) return;
    if (sheet.el) closeStay(true);
    const s = stayById[id];
    const el = document.createElement('div');
    el.className = 'sheet';
    el.innerHTML = sheetHTML(s);
    document.body.appendChild(el);
    sheet.el = el; sheet.id = id;
    lock(true);
    $$('.acc').forEach(a => a._pause && a._pause());
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-open')));
    setTimeout(() => { const b = $('.iconbtn', el); b && b.focus({ preventScroll: true }); }, 400);
    markLoaded(el);
    initGallery(el, s);
    initBooking(el, s);
    $$('.magnetic', el).forEach(magnetic);
    sheet.onKey = e => {
      if (e.key === 'Escape') location.hash = state.base;
      if (e.key === 'ArrowRight' && el._gal && !/INPUT|SELECT/.test(document.activeElement.tagName)) el._gal(1);
      if (e.key === 'ArrowLeft' && el._gal && !/INPUT|SELECT/.test(document.activeElement.tagName)) el._gal(-1);
      if (e.key === 'Tab') { // mantém o foco dentro do painel
        const f = $$('button, a[href], input, select', $('.sheet__panel', el)).filter(x => !x.disabled && x.offsetParent);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', sheet.onKey);
  }

  function closeStay(instant) {
    if (!sheet.el) return;
    const el = sheet.el;
    clearInterval(el._auto);
    document.removeEventListener('keydown', sheet.onKey);
    sheet.el = null; sheet.id = null;
    $$('.acc').forEach(a => a._resume && a._resume());
    if (instant || reduce) { el.remove(); lock(false); return; }
    el.classList.remove('is-open'); el.classList.add('is-closing');
    setTimeout(() => { el.remove(); if (!sheet.el) lock(false); }, 720);
  }

  function lock(on) {
    const de = document.documentElement;
    if (on) { de.style.setProperty('--sbw', (innerWidth - de.clientWidth) + 'px'); de.classList.add('is-locked'); }
    else { de.classList.remove('is-locked'); de.style.removeProperty('--sbw'); }
  }

  function initGallery(el, s) {
    const slides = $$('.gal__s', el), thumbs = $$('.gal__t', el), count = $('.gal__count b', el), bar = $('.gal__bar i', el), stage = $('.gal__stage', el);
    let i = 0;
    const go = n => {
      i = (n + slides.length) % slides.length;
      slides.forEach((x, k) => x.classList.toggle('is-on', k === i));
      thumbs.forEach((x, k) => x.classList.toggle('is-on', k === i));
      count.textContent = pad(i + 1);
      bar.style.transform = `scaleX(${(i + 1) / slides.length})`;
      const t = thumbs[i], strip = t.parentElement;
      strip.scrollTo({ left: t.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' });
    };
    const user = n => { clearInterval(el._auto); go(n); };
    el._gal = d => user(i + d);
    $$('[data-gal]', el).forEach(b => b.addEventListener('click', () => user(i + +b.dataset.gal)));
    thumbs.forEach((t, k) => t.addEventListener('click', () => user(k)));
    let x0 = null;
    stage.addEventListener('pointerdown', e => { x0 = e.clientX; });
    stage.addEventListener('pointerup', e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) user(i + (dx < 0 ? 1 : -1)); });
    go(0);
    if (!reduce) el._auto = setInterval(() => go(i + 1), 4800);
  }

  function initBooking(el, s) {
    const ci = $('[data-ci]', el), co = $('[data-co]', el), g = $('[data-g]', el);
    const today = new Date(), start = addDays(today, 30);
    ci.min = iso(addDays(today, 1)); ci.value = iso(start); co.value = iso(addDays(start, 3)); co.min = iso(addDays(start, 1));
    const calc = () => {
      const a = new Date(ci.value + 'T12:00'), b = new Date(co.value + 'T12:00');
      let nights = Math.round((b - a) / 864e5);
      if (!(nights > 0)) { nights = 1; co.value = iso(addDays(a, 1)); }
      co.min = iso(addDays(a, 1));
      const sub = nights * s.price, fee = s.type === 'Casa' ? 180 + nights * 20 : Math.round(sub * 0.08);
      $('[data-nights]', el).textContent = `${nights} ${nights > 1 ? 'noites' : 'noite'} × ${money(s.price)}`;
      $('[data-sub]', el).textContent = money(sub);
      $('[data-fee]', el).textContent = money(fee);
      const tot = $('[data-total]', el); tot.textContent = money(sub + fee);
      tot.classList.remove('bump'); void tot.offsetWidth; tot.classList.add('bump');
    };
    [ci, co, g].forEach(x => x.addEventListener('change', calc));
    calc();
    $('[data-book]', el).addEventListener('click', () => {
      toast(`Pedido enviado! Um especialista Voyage confirma ${s.name} para ${g.value} ${+g.value > 1 ? 'pessoas' : 'pessoa'} em até 2 horas. (demonstração)`);
    });
  }

  /* ================================================================
     GLOBAL: cliques, cursor, rolagem, menu, loader
     ================================================================ */
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('is-on'), 4200);
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a, button');
    if (!a) return;
    if (a.hasAttribute('data-goto')) { e.preventDefault(); closeMenu(); goto(a.dataset.goto); return; }
    if (a.hasAttribute('data-stay')) { e.preventDefault(); openStayRoute(a.dataset.stay); return; }
    if (a.hasAttribute('data-close')) { e.preventDefault(); location.hash = state.base; return; }
    if (a.hasAttribute('data-showmap')) {
      e.preventDefault();
      const s = stayById[a.dataset.showmap];
      state.pendingStay = s.id;
      if (state.key === 'dest:' + s.dest.id) { location.hash = state.base; setTimeout(afterSwap, 500); }
      else location.hash = '#/destino/' + s.dest.id;
      return;
    }
    if (a.hasAttribute('data-attr')) state.pendingAttr = a.dataset.attr;
    if (a.hasAttribute('data-morph') && canVT) {
      const src = a.closest('[data-morph-src]'), art = src && $('.art', src);
      if (art) { art.style.viewTransitionName = 'dest-hero'; morphSrc = art; state.morph = true; }
    }
    if (a.matches('.menu a')) closeMenu();
  });

  // Menu do celular
  const burger = $('.nav__burger'), menu = $('#menu');
  function closeMenu() { if (!menu.classList.contains('is-open')) return; menu.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); }
  burger.addEventListener('click', () => {
    const on = !menu.classList.contains('is-open');
    menu.classList.toggle('is-open', on); burger.setAttribute('aria-expanded', on); document.body.classList.toggle('menu-open', on);
  });

  // Newsletter / contato
  $('#contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    toast(`Obrigado, ${f.elements.nome.value.split(' ')[0] || 'viajante'}! Um especialista Voyage vai te chamar. (demonstração)`);
    f.reset();
  });

  // Cursor personalizado
  if (fine && !reduce) {
    const cur = $('#cursor'), dot = $('.cursor__dot', cur), ring = $('.cursor__ring', cur), label = $('.cursor__ring span', cur);
    let mx = -100, my = -100, rx = -100, ry = -100;
    document.body.classList.add('has-cursor');
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; cur.classList.remove('is-hidden'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
    document.addEventListener('pointerover', e => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, [role="tab"], select, label, input');
      cur.classList.toggle('is-label', !!lab);
      cur.classList.toggle('is-link', !lab && !!link);
      if (lab) label.textContent = lab.dataset.cursor;
    });
    document.addEventListener('pointerdown', () => cur.classList.add('is-down'));
    document.addEventListener('pointerup', () => cur.classList.remove('is-down'));
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      requestAnimationFrame(loop);
    })();
  }

  // Loop de rolagem: barra de progresso, menu, parallax, marquee, seção horizontal, roteiro
  const nav = $('#nav'), progress = $('#progress');
  let lastY = scrollY, vel = 0, mqX = 0, mqDir = 1, navHidden = false;
  function frame() {
    const y = scrollY, dy = y - lastY;
    lastY = y; vel = vel * 0.86 + dy * 0.14;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle('is-scrolled', y > 40);
    if (!sheet.el && !document.body.classList.contains('menu-open')) {
      if (dy > 4 && y > 320 && !navHidden) { navHidden = true; nav.classList.add('is-hidden'); document.body.classList.add('nav-hidden'); }
      else if (dy < -4 && navHidden) { navHidden = false; nav.classList.remove('is-hidden'); document.body.classList.remove('nav-hidden'); }
    }
    if (!reduce) {
      if (scroller.hero && y < innerHeight * 1.3) scroller.heroLayers.forEach(l => { l.style.transform = `translate3d(0, ${(y * +l.dataset.depth).toFixed(1)}px, 0)`; });
      if (scroller.dhero && y < innerHeight * 1.2) {
        const art = $('.dhero__art', scroller.dhero), inner = $('.dhero__inner', scroller.dhero);
        art.style.transform = `translate3d(0, ${(y * 0.35).toFixed(1)}px, 0) scale(${1 + y / 4000})`;
        inner.style.opacity = clamp(1 - y / (innerHeight * 0.6), 0, 1);
        inner.style.transform = `translate3d(0, ${(y * 0.15).toFixed(1)}px, 0)`;
      }
      if (scroller.marquee) {
        if (Math.abs(vel) > 0.5) mqDir = vel > 0 ? 1 : -1;
        mqX -= (0.6 + Math.min(Math.abs(vel) * 0.35, 14)) * mqDir;
        const half = scroller.marquee.scrollWidth / 2;
        if (mqX <= -half) mqX += half; if (mqX > 0) mqX -= half;
        scroller.marquee.style.transform = `translate3d(${mqX.toFixed(1)}px, 0, 0) skewX(${clamp(-vel * 0.4, -10, 10).toFixed(2)}deg)`;
      }
    }
    if (scroller.hs && innerWidth > 760) {
      const r = scroller.hs.getBoundingClientRect(), track = $('.hs__track', scroller.hs);
      const p = clamp(-r.top / (r.height - innerHeight), 0, 1), dist = track.scrollWidth - innerWidth;
      track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
      $('.hs__bar span', scroller.hs).style.transform = `scaleX(${p})`;
    }
    if (scroller.plan) {
      const r = scroller.plan.getBoundingClientRect(), mark = innerHeight * 0.62;
      scroller.plan.style.setProperty('--p', clamp((mark - r.top) / r.height, 0, 1).toFixed(3));
      $$('.day', scroller.plan).forEach(dd => dd.classList.toggle('is-on', dd.getBoundingClientRect().top < mark));
    }
    if (scroller.subnav) {
      const h = scroller.dhero ? scroller.dhero.offsetHeight : 0;
      scroller.subnav.classList.toggle('is-on', y > h - 120);
    }
    const top = scroller.dhero || scroller.hero;
    nav.classList.toggle('is-light', !!top && y < top.offsetHeight - 80);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  addEventListener('resize', () => sizeHS());

  // Rodapé: palavra gigante
  (function () {
    const word = $('.foot__word');
    split(word, true);
    const fio = new IntersectionObserver(es => { if (es[0].isIntersecting) { word.classList.add('is-in'); fio.disconnect(); } }, { threshold: 0.3 });
    fio.observe(word);
    $$('.foot [data-reveal]').forEach(el => new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { el.classList.add('is-in'); o.disconnect(); } }, { threshold: 0.2 }).observe(el));
    $$('.magnetic', document.querySelector('.foot')).forEach(magnetic);
    $$('.nav .magnetic').forEach(magnetic);
  })();

  // Loader de entrada
  const loader = $('#loader');
  function startApp() {
    route();
    addEventListener('hashchange', route);
  }
  if (reduce || sessionStorageGet('voyage-seen')) { loader.remove(); startApp(); }
  else {
    const count = $('.loader__count', loader), bar = $('.loader__bar', loader), t0 = performance.now(), dur = 1500;
    startApp();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      count.textContent = pad(Math.round(e * 100)) + '%'; bar.style.transform = `scaleX(${e})`;
      if (p < 1) requestAnimationFrame(tick);
      else { loader.classList.add('is-done'); sessionStorageSet('voyage-seen', '1'); setTimeout(() => loader.remove(), 1300); }
    })(t0);
  }
  function sessionStorageGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function sessionStorageSet(k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* noop */ } }
})();
