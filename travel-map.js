/* Travel map: draws every place in a hobby's updates (and its extra
   `visits`) on an SVG map, with hotter spots for places visited more.
   Zoom with the buttons, drag, pinch or double-click; jump to a region;
   tap a spot or a place in the list to see its trips.
   Map code and outlines live in vendor/map and load only when needed. */
(function () {
  const BASE = 'vendor/map/';
  const NS = 'http://www.w3.org/2000/svg';
  const SHOW = 5;          // places listed before "Show all"
  const MAX_ZOOM = 14;
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
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const visits = n => n + (n === 1 ? ' visit' : ' visits');
  // Shared with hobbies.js so a map spot can find its post in the feed.
  const postKey = window.travelPostKey = (hobby, u) => hobby.id + '|' + (u.date || '') + '|' + (u.title || '');

  // One entry per place: how many trips included it, when, and which posts.
  function tally(hobby, coords) {
    const by = new Map();
    const add = (t, post) => placesOf(t).forEach(name => {
      const c = coords[name];
      if (!c) { console.warn('travel map: no coordinates for "' + name + '" in PLACES'); return; }
      if (!by.has(name)) by.set(name, { name, lat: c[0], lng: c[1], count: 0, trips: [] });
      const p = by.get(name); p.count++;
      p.trips.push({ date: t.date || '', title: post ? t.title || '' : '', key: post ? postKey(hobby, t) : null });
    });
    (hobby.updates || []).forEach(u => add(u, true));
    (hobby.visits || []).forEach(v => add(v, false));
    return [...by.values()].map(p => (p.trips.sort((a, b) => b.date.localeCompare(a.date)), p))
      .sort((a, b) => b.count - a.count || (b.trips[0].date).localeCompare(a.trips[0].date));
  }

  // Rough regions for the jump-to buttons; only regions with places show.
  const REGIONS = [
    ['North America', p => p.lng < -50 && p.lat > 7],
    ['South America', p => p.lng < -30 && p.lat <= 7],
    ['Europe', p => p.lng >= -30 && p.lng < 45 && p.lat >= 35],
    ['Africa', p => p.lng >= -30 && p.lng < 55 && p.lat < 35],
    ['Asia', p => p.lng >= 45 && p.lat >= -10],
    ['Oceania', p => p.lng >= 100 && p.lat < -10]
  ];

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

  window.renderTravelMap = function (container, hobby, coords) {
    const places = tally(hobby, coords || {});
    if (!places.length) { container.remove(); return; }
    const trips = (hobby.updates || []).concat(hobby.visits || []).filter(t => placesOf(t).length).length;
    const max = Math.max(...places.map(p => p.count));
    const regions = REGIONS.map(([name, test]) => ({ name, places: places.filter(test) })).filter(r => r.places.length);

    container.innerHTML =
      '<div class="tmap-stats"><b>' + places.length + '</b> ' + (places.length === 1 ? 'place' : 'places') +
        ' · <b>' + trips + '</b> ' + (trips === 1 ? 'trip' : 'trips') + '</div>' +
      (regions.length > 1 ? '<div class="tmap-regions" role="group" aria-label="Jump to a region">' +
        '<button type="button" class="tmap-chip" data-region="" aria-pressed="true">World</button>' +
        regions.map((r, i) => '<button type="button" class="tmap-chip" data-region="' + i + '" aria-pressed="false">' + esc(r.name) + '</button>').join('') +
        '</div>' : '') +
      '<div class="tmap-canvas"><p class="tmap-loading">Loading map…</p>' +
        '<div class="tmap-zoom" hidden>' +
          '<button type="button" data-zoom="in" aria-label="Zoom in">+</button>' +
          '<button type="button" data-zoom="out" aria-label="Zoom out">−</button>' +
          '<button type="button" data-zoom="reset" aria-label="Reset map">⟲</button>' +
        '</div></div>' +
      '<div class="tmap-legend"><span>fewer visits</span><i aria-hidden="true"></i><span>more</span>' +
        '<span class="tmap-hint">Drag to move · tap a spot</span></div>' +
      '<div class="tmap-info" aria-live="polite" hidden></div>' +
      '<ul class="tmap-list">' + places.map((p, i) =>
        '<li' + (i >= SHOW ? ' class="tmap-more" hidden' : '') + '><button type="button" class="tmap-row" data-place="' + i + '">' +
        '<span class="tmap-dot" style="--heat:' + (0.35 + 0.65 * p.count / max).toFixed(2) + '"></span>' +
        '<span class="tmap-name">' + esc(p.name) + '</span>' +
        '<span class="tmap-meta">' + visits(p.count) + ' · ' + esc(monthYear(p.trips[0].date)) + '</span></button></li>').join('') +
      '</ul>' +
      (places.length > SHOW ? '<button type="button" class="tmap-toggle" aria-expanded="false">Show all ' + places.length + ' places</button>' : '');

    const canvas = container.querySelector('.tmap-canvas');
    const info = container.querySelector('.tmap-info');
    const toggle = container.querySelector('.tmap-toggle');
    if (toggle) toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      container.querySelectorAll('.tmap-more').forEach(li => { li.hidden = !open; });
      toggle.setAttribute('aria-expanded', open);
      toggle.textContent = open ? 'Show fewer' : 'Show all ' + places.length + ' places';
    });

    // Taller map on narrow screens so it doesn't get tiny.
    const W = 800, H = container.clientWidth < 520 ? 620 : 500;
    canvas.style.aspectRatio = W + ' / ' + H;

    loadLibs().then(geo => {
      if (!container.isConnected) return;
      const box = frame(places);
      const proj = d3.geoMercator().fitExtent([[16, 16], [W - 16, H - 16]], box);
      const lngSpan = box.coordinates[1][0] - box.coordinates[0][0];
      const fit = Math.min(1, Math.max(0.65, 70 / lngSpan));   // smaller glow when the start view is wide
      const path = d3.geoPath(proj);
      places.forEach(p => { [p.x, p.y] = proj([p.lng, p.lat]); });

      const svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'group',
        'aria-label': 'Map of places I have traveled. Use the zoom buttons, or select a place to see its trips.' });
      const defs = el('defs', {}, svg);
      const g = el('radialGradient', { id: 'tmap-heat' }, defs);
      [[0, .95], [.35, .6], [.7, .2], [1, 0]].forEach(([o, a]) =>
        el('stop', { offset: o, style: 'stop-color: var(--accent); stop-opacity:' + a }, g));

      // Panning past the start view is allowed as far as the land goes.
      const [[lx0, ly0], [lx1, ly1]] = path.bounds(geo.land);
      const lim = { x0: Math.min(0, lx0), y0: Math.min(0, ly0), x1: Math.max(W, lx1), y1: Math.max(H, ly1) };
      const minW = W / MAX_ZOOM, maxW = Math.min(lim.x1 - lim.x0, (lim.y1 - lim.y0) * W / H, W * 2.2);

      el('rect', { class: 'tmap-water', x: lim.x0 - W, y: lim.y0 - H, width: lim.x1 - lim.x0 + 2 * W, height: lim.y1 - lim.y0 + 2 * H }, svg);
      el('path', { class: 'tmap-land', d: path(geo.land), 'vector-effect': 'non-scaling-stroke' }, svg);
      el('path', { class: 'tmap-states', d: path(geo.states), 'vector-effect': 'non-scaling-stroke' }, svg);
      const heat = el('g', { class: 'tmap-heat' }, svg);
      const dots = el('g', {}, svg);

      places.slice().reverse().forEach(p => {
        const t = p.count / max;
        p.r0 = 34 * fit * (0.75 + 0.85 * Math.sqrt(t));
        p.glow = el('circle', { cx: p.x, cy: p.y, fill: 'url(#tmap-heat)', 'fill-opacity': (0.45 + 0.55 * t).toFixed(2) }, heat);
        p.pin = el('circle', { class: 'tmap-pin', cx: p.x, cy: p.y, tabindex: 0, role: 'button',
          'aria-label': p.name + ', ' + visits(p.count) }, dots);
        el('title', {}, p.pin).textContent = p.name + ' · ' + visits(p.count);
      });

      // ---- view (the SVG viewBox) ----
      let vb = { x: 0, y: 0, w: W, h: H }, anim = 0;
      const clamp = v => {
        const w = Math.min(maxW, Math.max(minW, v.w)), h = w * H / W;
        const cx = Math.min(lim.x1 - w / 2, Math.max(lim.x0 + w / 2, v.x + v.w / 2));
        const cy = Math.min(lim.y1 - h / 2, Math.max(lim.y0 + h / 2, v.y + v.h / 2));
        return { x: cx - w / 2, y: cy - h / 2, w, h };
      };
      function apply(v) {
        vb = v;
        svg.setAttribute('viewBox', [v.x, v.y, v.w, v.h].map(n => n.toFixed(2)).join(' '));
        const k = W / v.w;                       // zoom level
        const glowK = Math.pow(k, 0.75), pinK = Math.pow(k, 0.9);
        places.forEach(p => {
          p.glow.setAttribute('r', (p.r0 / glowK).toFixed(2));
          p.pin.setAttribute('r', ((2.5 + 1.5 * fit) * (p === selected ? 1.6 : 1) / pinK).toFixed(2));
          p.pin.style.strokeWidth = (1.5 / pinK).toFixed(2);
        });
        // Let the page scroll over the map until you zoom in.
        svg.style.touchAction = k > 1.05 ? 'none' : 'pan-y';
      }
      function go(target, ms = 380) {
        target = clamp(target);
        cancelAnimationFrame(anim);
        if (!ms || matchMedia('(prefers-reduced-motion: reduce)').matches) return apply(target);
        const from = vb, t0 = performance.now();
        const step = now => {
          const t = Math.min(1, (now - t0) / ms), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          apply({ x: from.x + (target.x - from.x) * e, y: from.y + (target.y - from.y) * e,
                  w: from.w + (target.w - from.w) * e, h: from.h + (target.h - from.h) * e });
          if (t < 1) anim = requestAnimationFrame(step);
        };
        anim = requestAnimationFrame(step);
      }
      const zoomAt = (f, cx, cy, ms) => {
        const w = vb.w / f, h = vb.h / f;
        go({ x: cx - (cx - vb.x) / f, y: cy - (cy - vb.y) / f, w, h }, ms);
      };
      // Fit a set of places, never closer than a small region.
      function fitPlaces(list, minPx) {
        let x0 = Math.min(...list.map(p => p.x)), x1 = Math.max(...list.map(p => p.x));
        let y0 = Math.min(...list.map(p => p.y)), y1 = Math.max(...list.map(p => p.y));
        let w = Math.max((x1 - x0) * 1.5, minPx), h = Math.max((y1 - y0) * 1.5, minPx * H / W);
        if (w / h > W / H) h = w * H / W; else w = h * W / H;
        return { x: (x0 + x1) / 2 - w / 2, y: (y0 + y1) / 2 - h / 2, w, h };
      }
      const home = { x: 0, y: 0, w: W, h: H };

      // ---- selecting a place ----
      let selected = null;
      function select(p, zoom) {
        selected = p;
        places.forEach(q => q.pin.classList.toggle('on', q === p));
        container.querySelectorAll('.tmap-row').forEach(r => r.classList.toggle('on', places[+r.dataset.place] === p));
        if (!p) { info.hidden = true; apply(vb); return; }
        info.innerHTML =
          '<div class="tmap-info-head"><b>' + esc(p.name) + '</b><span>' + visits(p.count) + '</span>' +
          '<button type="button" class="tmap-close" aria-label="Close">×</button></div>' +
          '<ul>' + p.trips.map(t => '<li><time>' + esc(monthYear(t.date)) + '</time>' +
            (t.key ? '<button type="button" class="tmap-post" data-key="' + esc(t.key) + '">' + esc(t.title || 'See post') + ' →</button>' : '') +
            '</li>').join('') + '</ul>';
        info.hidden = false;
        if (zoom) { go(fitPlaces([p], W / 5)); setChip(null); } else apply(vb);
      }
      info.addEventListener('click', e => {
        if (e.target.closest('.tmap-close')) return select(null);
        const b = e.target.closest('.tmap-post');
        if (!b) return;
        const post = [...document.querySelectorAll('[data-post]')].find(n => n.dataset.post === b.dataset.key);
        if (post) {
          post.scrollIntoView({ behavior: 'smooth', block: 'start' });
          post.classList.remove('flash'); void post.offsetWidth; post.classList.add('flash');
        }
      });
      places.forEach(p => {
        p.pin.addEventListener('click', e => { e.stopPropagation(); if (!moved) select(p, false); });
        p.pin.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p, true); } });
      });
      container.querySelectorAll('.tmap-row').forEach(r => r.addEventListener('click', () => {
        select(places[+r.dataset.place], true);
        canvas.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }));

      // ---- buttons ----
      const zoomBox = canvas.querySelector('.tmap-zoom');
      zoomBox.hidden = false;
      zoomBox.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
        if (b.dataset.zoom === 'in') zoomAt(1.8, cx, cy);
        else if (b.dataset.zoom === 'out') zoomAt(1 / 1.8, cx, cy);
        else { go(home); select(null); setChip(''); }
      });
      const chips = [...container.querySelectorAll('.tmap-chip')];
      const setChip = id => chips.forEach(c => c.setAttribute('aria-pressed', c.dataset.region === id));
      chips.forEach(c => c.addEventListener('click', () => {
        setChip(c.dataset.region);
        go(c.dataset.region === '' ? home : fitPlaces(regions[+c.dataset.region].places, W / 3.2), 520);
      }));

      // ---- drag, pinch, wheel, double-click ----
      const toMap = (cx, cy) => {
        const r = svg.getBoundingClientRect();
        return [vb.x + (cx - r.left) / r.width * vb.w, vb.y + (cy - r.top) / r.height * vb.h];
      };
      const pts = new Map(); let moved = false, start = null;
      svg.addEventListener('pointerdown', e => {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pts.size === 1) { moved = false; start = { x: e.clientX, y: e.clientY }; }
        cancelAnimationFrame(anim);
      });
      svg.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId)) return;
        const prev = pts.get(e.pointerId), r = svg.getBoundingClientRect(), s = vb.w / r.width;
        if (pts.size === 1) {
          if (!moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 4) return;
          if (!moved) { moved = true; svg.setPointerCapture(e.pointerId); svg.classList.add('dragging'); }
          apply(clamp({ ...vb, x: vb.x - (e.clientX - prev.x) * s, y: vb.y - (e.clientY - prev.y) * s })); setChip(null);
        } else if (pts.size === 2) {
          moved = true;
          const [a, b] = [...pts.entries()].map(([id, p]) => id === e.pointerId ? { x: e.clientX, y: e.clientY } : p);
          const [oa, ob] = [...pts.values()];
          const f = Math.hypot(a.x - b.x, a.y - b.y) / (Math.hypot(oa.x - ob.x, oa.y - ob.y) || 1);
          const [mx, my] = toMap((a.x + b.x) / 2, (a.y + b.y) / 2);
          const w = vb.w / f, h = vb.h / f;
          apply(clamp({ x: mx - (mx - vb.x) / f, y: my - (my - vb.y) / f, w, h }));
        }
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      });
      const end = e => { pts.delete(e.pointerId); if (!pts.size) svg.classList.remove('dragging'); };
      svg.addEventListener('pointerup', end);
      svg.addEventListener('pointercancel', end);
      svg.addEventListener('click', () => { if (!moved) select(null); });
      svg.addEventListener('dblclick', e => { e.preventDefault(); const [x, y] = toMap(e.clientX, e.clientY); zoomAt(2, x, y); });
      // Scroll-wheel zoom only with Ctrl/⌘ (or a trackpad pinch), so the page still scrolls normally.
      svg.addEventListener('wheel', e => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        const [x, y] = toMap(e.clientX, e.clientY);
        zoomAt(Math.exp(-e.deltaY * 0.01), x, y, 0);
      }, { passive: false });

      canvas.querySelector('.tmap-loading').remove();
      canvas.prepend(svg);
      apply(vb);
    }).catch(() => {
      canvas.innerHTML = '<p class="tmap-loading">The map couldn\'t load. Places are listed below.</p>';
    });
  };
})();
