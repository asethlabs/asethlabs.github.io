(function () {
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const monthYear = d => { const x = new Date(d + 'T12:00:00'); return isNaN(x) ? esc(d) : x.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); };
    const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '#';
    const ICON = {
      video: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
      article: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z" fill="none" stroke-width="2" stroke-linejoin="round"/><path d="M9 12h7M9 16h7M9 8h4" fill="none" stroke-width="2" stroke-linecap="round"/></svg>'
    };

    // ---- tabs: My notes / Worth your time ----
    const tabs = [...document.querySelectorAll('#disc-tabs .tab')];
    function show(id, focus) {
      tabs.forEach(t => {
        const on = t.dataset.panel === id;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        document.getElementById(t.dataset.panel).hidden = !on;
        if (on && focus) t.focus();
      });
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
    if (location.hash === '#worth-your-time') show('panel-reviews');

    // ---- reviews list ----
    const list = document.getElementById('review-list');
    const filters = document.getElementById('review-filter');
    const items = (typeof REVIEWS !== 'undefined' ? REVIEWS : []).slice()
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const count = t => items.filter(r => !t || r.type === t).length;

    function render(type) {
      const shown = items.filter(r => !type || r.type === type);
      list.innerHTML = shown.length ? shown.map(r => {
        const video = r.type === 'video';
        return '<div class="role review">' +
          '<div class="role-top"><h3><a href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener">' + esc(r.title) + '</a></h3>' +
            '<span class="when review-kind">' + (ICON[r.type] || '') + (video ? 'Video' : 'Article') +
              (r.source ? ' · ' + esc(r.source) : '') + (r.date ? ' · ' + monthYear(r.date) : '') + '</span></div>' +
          (r.review ? '<p class="disc-body">' + esc(r.review) + '</p>' : '') +
          (r.takeaway ? '<p class="takeaway"><b>takeaway</b>' + esc(r.takeaway) + '</p>' : '') +
          '<div class="review-foot">' +
            ((r.tags || []).length ? '<div class="tags">' + r.tags.map(t => '<span class="tag">' + esc(t) + '</span>').join('') + '</div>' : '') +
            '<a class="review-open" href="' + esc(safeUrl(r.url)) + '" target="_blank" rel="noopener">' + (video ? 'Watch' : 'Read') + ' →</a>' +
          '</div></div>';
      }).join('') : '<p class="empty">' + (items.length ? 'Nothing of this type yet.' : 'Nothing here yet. Check back soon.') + '</p>';
    }

    if (items.length) {
      filters.innerHTML = [['', 'All'], ['article', 'Articles'], ['video', 'Videos']]
        .filter(([t]) => !t || count(t))
        .map(([t, label], i) => '<button type="button" class="filter-chip" data-type="' + t + '" aria-pressed="' + (i === 0) + '">' +
          label + ' <span>' + count(t) + '</span></button>').join('');
      if (filters.children.length < 3) filters.hidden = true;   // no point filtering a single type
      filters.addEventListener('click', e => {
        const b = e.target.closest('.filter-chip'); if (!b) return;
        [...filters.children].forEach(c => c.setAttribute('aria-pressed', c === b));
        render(b.dataset.type);
      });
    } else filters.hidden = true;
    render('');
  })();
