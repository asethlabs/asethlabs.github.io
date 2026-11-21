(function () {
    const tabsEl = document.getElementById('hobby-tabs');
    const panel = document.getElementById('hobby-panel');
    const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const fmt = d => { const x = new Date(d + 'T12:00:00'); return isNaN(x) ? esc(d) : x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
    const isVideo = src => /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src);

    // "All" is a feed of every hobby's updates, newest first.
    const ALL = {
      id: 'all', name: 'All',
      icon: '<svg viewBox="0 0 48 48"><rect x="6" y="6" width="15" height="15" rx="3"/><rect x="27" y="6" width="15" height="15" rx="3"/><rect x="6" y="27" width="15" height="15" rx="3"/><rect x="27" y="27" width="15" height="15" rx="3"/></svg>',
      about: 'Every update from every hobby, newest first.'
    };
    const TABS = [ALL].concat(HOBBIES);
    const byDate = (a, b) => (b.u.date || '').localeCompare(a.u.date || '');
    const postsFor = h => (h === ALL
      ? HOBBIES.flatMap(x => (x.updates || []).map(u => ({ u, h: x })))
      : (h.updates || []).map(u => ({ u, h }))
    ).sort(byDate);

    // A hobby gets a map when any update (or extra visit) names a place.
    const hasMap = h => h !== ALL && typeof window.renderTravelMap === 'function' &&
      (h.updates || []).concat(h.visits || []).some(u => u.places || u.place);

    // Reading shows a shelf of books, A to Z by title, instead of a dated feed.
    const sortTitle = t => String(t || '').replace(/^(the|a|an)\s+/i, '').toLowerCase();
    function booksHtml(books) {
      const list = books.slice().sort((a, b) => sortTitle(a.title).localeCompare(sortTitle(b.title)));
      return '<div class="updates-title">// books</div>' + (list.length
        ? '<ul class="books">' + list.map(b => {
            const reading = b.status === 'reading';
            return '<li><div class="book-head"><span class="book-title">' + esc(b.title) + '</span>' +
              '<span class="book-status' + (reading ? ' reading' : '') + '">' + (reading ? 'In progress' : 'Finished') + '</span></div>' +
              (b.author ? '<div class="book-author">' + esc(b.author) + '</div>' : '') +
              (b.review ? '<p class="book-review">' + esc(b.review) + '</p>'
                : '<p class="book-review empty">' + (reading ? 'Review once I finish.' : 'No review yet.') + '</p>') +
              '</li>';
          }).join('') + '</ul>'
        : '<p class="empty">No books yet. Check back soon.</p>');
    }

    // A song on a post: Spotify's official player (30-second preview, or the
    // full song for listeners logged into Spotify), or a YouTube clip from a start time.
    function songHtml(song) {
      if (!song) return '';
      const label = esc([song.title, song.artist].filter(Boolean).join(' by ') || 'Song');
      const id = String(song.spotify || song.youtube || '').replace(/[^A-Za-z0-9_-]/g, '');
      if (!id) return '';
      const src = song.spotify
        ? 'https://open.spotify.com/embed/track/' + id + '?utm_source=generator'
        : 'https://www.youtube-nocookie.com/embed/' + id + '?start=' + (parseInt(song.start, 10) || 0) +
          (song.end ? '&end=' + (parseInt(song.end, 10) || 0) : '');
      const link = song.spotify ? 'https://open.spotify.com/track/' + id : 'https://www.youtube.com/watch?v=' + id;
      return '<div class="song' + (song.spotify ? '' : ' video') + '">' +
        '<iframe src="' + src + '" title="' + label + '" loading="lazy" ' +
          'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>' +
        '<a class="song-link" href="' + link + '" target="_blank" rel="noopener">♪ ' + label + ' ↗</a></div>';
    }

    function mediaHtml(list) {
      const items = (list || []).map(m => typeof m === 'string' ? { src: m } : m).filter(m => m && m.src);
      if (!items.length) return '';
      const one = items.length === 1;
      return '<div class="media' + (one ? ' one' : '') + '">' + items.map(m => {
        const src = esc(m.src), alt = esc(m.alt || '');
        const el = isVideo(m.src)
          ? '<video src="' + src + (m.poster ? '' : '#t=0.1') + '" controls playsinline preload="metadata"' +
              (m.poster ? ' poster="' + esc(m.poster) + '"' : '') + (alt ? ' aria-label="' + alt + '"' : '') + '></video>'
          : '<button type="button" class="zoom" aria-label="Open photo' + (alt ? ': ' + alt : '') + '">' +
              '<img src="' + src + '" alt="' + alt + '" loading="lazy"></button>';
        return '<figure>' + el + (m.caption ? '<figcaption>' + esc(m.caption) + '</figcaption>' : '') + '</figure>';
      }).join('') + '</div>' +
      (one ? '' : '<div class="media-count">' + items.length + ' items · swipe →</div>');
    }

    TABS.forEach((h, i) => {
      const b = document.createElement('button');
      b.className = 'tab'; b.type = 'button';
      b.id = 'tab-' + h.id; b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'hobby-panel');
      b.innerHTML = h.icon + '<span>' + esc(h.name) + '</span>';
      b.addEventListener('click', () => select(i, true));
      b.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length;
          select(n, true); tabsEl.children[n].focus();
        }
      });
      tabsEl.appendChild(b);
    });

    function select(i, user) {
      const h = TABS[i];
      [...tabsEl.children].forEach((t, j) => {
        t.setAttribute('aria-selected', j === i);
        t.tabIndex = j === i ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', 'tab-' + h.id);
      const posts = postsFor(h);
      panel.innerHTML =
        '<div class="panel-head">' + h.icon + '<div><h3>' + esc(h === ALL ? 'Everything' : h.name) + '</h3>' +
          (h.since ? '<div class="since">' + esc(h.since) + '</div>' : '') + '</div></div>' +
        '<p class="about">' + esc(h.about) + '</p>' +
        (h.now ? '<div class="now"><b>CURRENTLY</b>' + esc(h.now) + '</div>' : '') +
        (hasMap(h) ? '<div class="updates-title">// where I\'ve been</div><div class="tmap"></div>' : '') +
        (h.books ? booksHtml(h.books) :
        '<div class="updates-title">// ' + (h === ALL ? 'feed' : 'updates') + '</div>' +
        (posts.length
          ? '<ul class="updates">' + posts.map(({ u, h: src }) =>
              '<li' + (window.travelPostKey ? ' data-post="' + esc(window.travelPostKey(src, u)) + '"' : '') +
                '><div class="post-meta"><time>' + fmt(u.date) + '</time>' +
                (h === ALL ? '<span class="post-hobby">' + src.icon + esc(src.name) + '</span>' : '') + '</div>' +
              (u.title ? '<span class="t">' + esc(u.title) + '</span><br>' : '') +
              esc(u.text || '') + songHtml(u.song) + mediaHtml(u.media) + '</li>').join('') + '</ul>'
          : '<p class="empty">No updates yet. Check back soon.</p>'));
      if (hasMap(h)) window.renderTravelMap(panel.querySelector('.tmap'), h, typeof PLACES !== 'undefined' ? PLACES : {});
      panel.style.animation = 'none'; panel.offsetHeight; panel.style.animation = '';
      if (user) { try { localStorage.setItem('hobby-tab', h.id); } catch (e) {} }
    }

    // Tap a photo to see it full screen.
    const box = document.createElement('dialog');
    box.className = 'lightbox';
    box.innerHTML = '<img alt=""><button type="button" class="lb-close" aria-label="Close">×</button>';
    document.body.appendChild(box);
    const boxImg = box.querySelector('img');
    panel.addEventListener('click', e => {
      const z = e.target.closest('.zoom');
      if (!z || typeof box.showModal !== 'function') return;
      const img = z.querySelector('img');
      boxImg.src = img.currentSrc || img.src; boxImg.alt = img.alt;
      box.showModal();
    });
    box.addEventListener('click', () => box.close());

    let start = 0;
    try { const saved = localStorage.getItem('hobby-tab'); const k = TABS.findIndex(h => h.id === saved); if (k >= 0) start = k; } catch (e) {}
    select(start, false);
  })();
