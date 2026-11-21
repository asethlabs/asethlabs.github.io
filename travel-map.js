/* Travel map: draws every place in a hobby's updates (and its extra
   `visits`) on an SVG map, with hotter spots for places visited more.
   Map code and outlines live in vendor/map and load only when needed. */
(function () {
  const BASE = 'vendor/map/';
  const NS = 'http://www.w3.org/2000/svg';
  const W = 800, H = 500;
  let ready = null;

  function loadScript(src) {
    return new Promise((ok, fail) => {
      const s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = () => fail(new Error('Could not load ' + src));
      document.head.appendChild(s);
    });
  }
  function loadLibs() {
    if (!ready) {
      ready = loadScript(BASE + 'd3-array.min.js')
        .then(() => loadScript(BASE + 'd3-geo.min.js'))
        .then(() => loadScript(BASE + 'topojson-client.min.js'))
        .then(() => Promise.all(['countries-110m.json', 'states-10m.json']
          .map(f => fetch(BASE + f).then(r => { if (!r.ok) throw new Error(f); return r.json(); }))))
        .then(([world, us]) => ({
          land: topojson.feature(world, world.objects.countries),
          states: topojson.mesh(us, us.objects.states, (a, b) => a !== b)
        }));
      ready.catch(() => { ready = null; });
    }
    return ready;
  }

  const placesOf = x => [].concat(x.places || x.place || []);
  const monthYear = d => { const x = new Date(d + 'T12:00:00'); return isNaN(x) ? d : x.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };

  // One entry per place: how many trips included it, and when.
  function tally(hobby, coords) {
    const by = new Map();
    const trips = (hobby.updates || []).concat(hobby.visits || []);
    trips.forEach(t => placesOf(t).forEach(name => {
      const c = coords[name];
      if (!c) { console.warn('travel map: no coordinates for "' + name + '" in PLACES'); return; }
      if (!by.has(name)) by.set(name, { name, lat: c[0], lng: c[1], count: 0, dates: [] });
      const p = by.get(name); p.count++; if (t.date) p.dates.push(t.date);
    }));
    return [...by.values()].map(p => (p.dates.sort().reverse(), p))
      .sort((a, b) => b.count - a.count || (b.dates[0] || '').localeCompare(a.dates[0] || ''));
  }

  // Frame the visited places, but never zoom in tighter than a region.
  function frame(places) {
    let x0 = Math.min(...places.map(p => p.lng)), x1 = Math.max(...places.map(p => p.lng));
    let y0 = Math.min(...places.map(p => p.lat)), y1 = Math.max(...places.map(p => p.lat));
    const grow = (a, b, min) => { const m = (a + b) / 2, h = Math.max((b - a) / 2, min / 2); return [m - h, m + h]; };
    [x0, x1] = grow(x0, x1, 30); [y0, y1] = grow(y0, y1, 14);
    const px = (x1 - x0) * 0.2, py = (y1 - y0) * 0.22;
    x0 = Math.max(x0 - px, -180); x1 = Math.min(x1 + px, 180);
    y0 = Math.max(y0 - py, -60); y1 = Math.min(y1 + py, 80);
    return { type: 'MultiPoint', coordinates: [[x0, y0], [x1, y0], [x0, y1], [x1, y1], [(x0 + x1) / 2, y0], [(x0 + x1) / 2, y1]] };
  }

  function el(name, attrs, parent) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  window.renderTravelMap = function (container, hobby, coords) {
    const places = tally(hobby, coords || {});
    if (!places.length) { container.remove(); return; }
    const trips = (hobby.updates || []).concat(hobby.visits || []).filter(t => placesOf(t).length).length;
    const max = Math.max(...places.map(p => p.count));

    container.innerHTML =
      '<div class="tmap-stats"><b>' + places.length + '</b> ' + (places.length === 1 ? 'place' : 'places') +
        ' · <b>' + trips + '</b> ' + (trips === 1 ? 'trip' : 'trips') + '</div>' +
      '<div class="tmap-canvas"><p class="tmap-loading">Loading map…</p></div>' +
      '<div class="tmap-legend" aria-hidden="true"><span>fewer visits</span><i></i><span>more</span></div>' +
      '<ul class="tmap-list">' + places.map(p =>
        '<li><span class="tmap-dot" style="--heat:' + (0.35 + 0.65 * p.count / max).toFixed(2) + '"></span>' +
        '<span class="tmap-name">' + esc(p.name) + '</span>' +
        '<span class="tmap-meta">' + p.count + (p.count === 1 ? ' visit' : ' visits') +
          (p.dates[0] ? ' · ' + esc(monthYear(p.dates[0])) : '') + '</span></li>').join('') +
      '</ul>';
    const canvas = container.querySelector('.tmap-canvas');

    loadLibs().then(geo => {
      if (!container.isConnected) return;
      const proj = d3.geoMercator().fitExtent([[16, 16], [W - 16, H - 16]], frame(places));
      const path = d3.geoPath(proj);
      const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img',
        'aria-label': 'Map of places I have traveled: ' + places.map(p => p.name + ' (' + p.count + ')').join(', ') });
      const defs = el('defs', {}, svg);
      const g = el('radialGradient', { id: 'tmap-heat' }, defs);
      [[0, .95], [.35, .6], [.7, .2], [1, 0]].forEach(([o, a]) =>
        el('stop', { offset: o, style: 'stop-color: var(--accent); stop-opacity:' + a }, g));

      el('rect', { class: 'tmap-water', width: W, height: H }, svg);
      el('path', { class: 'tmap-land', d: path(geo.land) }, svg);
      el('path', { class: 'tmap-states', d: path(geo.states) }, svg);

      const heat = el('g', { class: 'tmap-heat' }, svg);
      const dots = el('g', {}, svg);
      const base = 34;
      places.slice().reverse().forEach(p => {
        const [x, y] = proj([p.lng, p.lat]);
        const t = p.count / max;
        el('circle', { cx: x, cy: y, r: base * (0.75 + 0.85 * Math.sqrt(t)), fill: 'url(#tmap-heat)',
          'fill-opacity': (0.45 + 0.55 * t).toFixed(2) }, heat);
        const d = el('circle', { class: 'tmap-pin', cx: x, cy: y, r: 4 }, dots);
        el('title', {}, d).textContent = p.name + ' · ' + p.count + (p.count === 1 ? ' visit' : ' visits');
      });
      canvas.replaceChildren(svg);
    }).catch(() => {
      canvas.innerHTML = '<p class="tmap-loading">The map couldn\'t load. Places are listed below.</p>';
    });
  };
})();
