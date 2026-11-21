(function () {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const monthYear = d => { const x = new Date(d + 'T12:00:00'); return isNaN(x) ? esc(d) : x.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };
    const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '#';
    const norm = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const ICON = {
      video: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
      article: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" fill="none" stroke-width="2" stroke-linejoin="round"/><path d="M9 12h7M9 16h7M9 8h4" fill="none" stroke-width="2" stroke-linecap="round"/></svg>'
    };

    // ---- render the reviews (Worth your time) ----
    const reviews = (typeof REVIEWS !== 'undefined' ? REVIEWS : []).slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    document.getElementById('review-list').innerHTML = reviews.map(r => {
      const video = r.type === 'video';
      return '<div class="role review" data-type="' + (video ? 'video' : 'article') + '">' +
        '<div class="role-top"><h3><a href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener">' + esc(r.title) + '</a></h3>' +
          '<span class="when review-kind">' + (ICON[video ? 'video' : 'article']) + (video ? 'Video' : 'Article') +
            (r.source ? ' · ' + esc(r.source) : '') + (r.date ? ' · ' + monthYear(r.date) : '') + '</span></div>' +
        (r.review ? '<p class="disc-body">' + esc(r.review) + '</p>' : '') +
        (r.takeaway ? '<p class="takeaway"><b>takeaway</b>' + esc(r.takeaway) + '</p>' : '') +
        '<div class="review-foot">' +
          ((r.tags || []).length ? '<div class="tags">' + r.tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' : '') +
          '<a class="review-open" href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener">' + (video ? 'Watch' : 'Read') + ' →</a>' +
        '</div></div>';
    }).join('');

    // ---- index every entry on both tabs (notes are static HTML) ----
    const LABEL = new Map();   // tag key -> how it's written, e.g. "llms" -> "LLMs"
    const PANELS = {
      'panel-notes': { noun: ['note', 'notes'], empty: 'No notes yet.' },
      'panel-reviews': { noun: ['item', 'items'], empty: 'Nothing here yet. Check back soon.' }
    };
    Object.keys(PANELS).forEach(id => {
      const panel = document.getElementById(id);
      const P = PANELS[id];
      P.el = panel;
      P.items = [...panel.querySelectorAll('.role')].map(node => {
        // Tags become buttons, so clicking one filters by it.
        const tags = [...node.querySelectorAll('.tag')].map(t => {
          const name = t.textContent.trim();
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'tag'; b.textContent = name; b.dataset.tag = name.toLowerCase();
          b.setAttribute('aria-label', 'Show everything tagged ' + name);
          t.replaceWith(b);
          if (!LABEL.has(name.toLowerCase())) LABEL.set(name.toLowerCase(), name);
          return name.toLowerCase();
        });
        return { node, tags, type: node.dataset.type || '', text: norm(node.textContent) };
      });
      P.none = document.createElement('p');
      P.none.className = 'empty'; P.none.hidden = true;
      (panel.querySelector('#review-list') || panel).appendChild(P.none);
    });

    // ---- controls ----
    const search = document.getElementById('disc-search');
    const tagBox = document.getElementById('disc-tagbar');
    const typeBox = document.getElementById('review-filter');
    const countEl = document.getElementById('disc-count');
    const state = { panel: 'panel-notes', q: '', tag: '', type: '' };

    function tagsFor(P) {
      const n = new Map();
      P.items.forEach(i => i.tags.forEach(t => n.set(t, (n.get(t) || 0) + 1)));
      return [...n].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }
    function drawTags() {
      const tags = tagsFor(PANELS[state.panel]);
      tagBox.hidden = !tags.length;
      tagBox.innerHTML = '<span class="disc-tools-label">tags</span>' + tags.map(([t, n]) =>
        '<button type="button" class="tag" data-tag="' + esc(t) + '" aria-pressed="' + (t === state.tag) + '">' +
        esc(LABEL.get(t) || t) + ' <span>' + n + '</span></button>').join('');
    }
    function drawTypes() {
      const items = PANELS['panel-reviews'].items;
      const count = t => items.filter(i => !t || i.type === t).length;
      const opts = [['', 'All'], ['article', 'Articles'], ['video', 'Videos']].filter(([t]) => !t || count(t));
      typeBox.hidden = opts.length < 3;
      typeBox.innerHTML = opts.map(([t, label]) => '<button type="button" class="filter-chip" data-type="' + t + '" aria-pressed="' +
        (t === state.type) + '">' + label + ' <span>' + count(t) + '</span></button>').join('');
    }

    function apply() {
      const P = PANELS[state.panel];
      const words = norm(state.q).split(/\s+/).filter(Boolean);
      let shown = 0, first = true;
      P.items.forEach(i => {
        const ok = words.every(w => i.text.includes(w)) &&
          (!state.tag || i.tags.includes(state.tag)) &&
          (state.panel !== 'panel-reviews' || !state.type || i.type === state.type);
        i.node.hidden = !ok;
        i.node.classList.toggle('first', ok && first);
        if (ok) { shown++; first = false; }
        i.node.querySelectorAll('.tag').forEach(b => b.classList.toggle('on', b.dataset.tag === state.tag));
      });
      const filtering = words.length || state.tag || (state.panel === 'panel-reviews' && state.type);
      P.none.hidden = shown > 0;
      P.none.innerHTML = !P.items.length ? P.empty :
        'No matches' + (state.q ? ' for “' + esc(state.q.trim()) + '”' : '') + (state.tag ? ' tagged ' + esc(LABEL.get(state.tag) || state.tag) : '') +
        '. <button type="button" class="disc-clear">Clear filters</button>';
      countEl.innerHTML = filtering && P.items.length
        ? 'Showing ' + shown + ' of ' + P.items.length + ' ' + P.noun[P.items.length === 1 ? 0 : 1] +
          ' · <button type="button" class="disc-clear">Clear</button>' : '';
      tagBox.querySelectorAll('.tag').forEach(b => b.setAttribute('aria-pressed', b.dataset.tag === state.tag));
      typeBox.querySelectorAll('.filter-chip').forEach(b => b.setAttribute('aria-pressed', b.dataset.type === state.type));
    }
    function clear() { state.q = ''; state.tag = ''; state.type = ''; search.value = ''; apply(); }

    search.addEventListener('input', () => { state.q = search.value; apply(); });
    search.addEventListener('keydown', e => { if (e.key === 'Escape') { search.value = ''; state.q = ''; apply(); } });
    document.addEventListener('click', e => {
      if (e.target.closest('.disc-clear')) { clear(); search.focus(); return; }
      const tag = e.target.closest('button.tag');
      if (tag && tag.closest('#disc-tagbar, #panel-notes, #panel-reviews')) {
        state.tag = state.tag === tag.dataset.tag ? '' : tag.dataset.tag;
        apply();
        if (!tag.closest('#disc-tagbar')) document.getElementById('disc-tools').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        return;
      }
      const chip = e.target.closest('#review-filter .filter-chip');
      if (chip) { state.type = chip.dataset.type; apply(); }
    });
    // Press "/" to jump to search, like many sites.
    document.addEventListener('keydown', e => {
      if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); }
    });

    // ---- tabs: My notes / Worth your time ----
    const tabs = [...document.querySelectorAll('#disc-tabs .tab')];
    function show(id, focus) {
      state.panel = id;
      tabs.forEach(t => {
        const on = t.dataset.panel === id;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.dataset.panel).hidden = !on;
        if (on && focus) t.focus();
      });
      // Keep the search words, but drop a tag the other tab doesn't use.
      if (state.tag && !PANELS[id].items.some(i => i.tags.includes(state.tag))) state.tag = '';
      search.placeholder = id === 'panel-notes' ? 'Search my notes' : 'Search articles and videos';
      document.getElementById('disc-tools').hidden = !PANELS[id].items.length;
      drawTags(); apply();
      if (history.replaceState) history.replaceState(null, '', id === 'panel-notes' ? location.pathname : '#worth-your-time');
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(t.dataset.panel));
      t.addEventListener('keydown', e => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        show(tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length].dataset.panel, true);
      });
    });

    drawTypes();
    show(location.hash === '#worth-your-time' ? 'panel-reviews' : 'panel-notes');
  })();
