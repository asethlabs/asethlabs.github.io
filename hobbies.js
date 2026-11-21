(function () {
    const tabsEl = document.getElementById('hobby-tabs');
    const panel = document.getElementById('hobby-panel');
    const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    const fmt = d => { const x = new Date(d + 'T12:00:00'); return isNaN(x) ? esc(d) : x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };

    HOBBIES.forEach((h, i) => {
      const b = document.createElement('button');
      b.className = 'tab'; b.type = 'button';
      b.id = 'tab-' + h.id; b.setAttribute('role', 'tab');
      b.setAttribute('aria-controls', 'hobby-panel');
      b.innerHTML = h.icon + '<span>' + esc(h.name) + '</span>';
      b.addEventListener('click', () => select(i, true));
      b.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const n = (i + (e.key === 'ArrowRight' ? 1 : -1) + HOBBIES.length) % HOBBIES.length;
          select(n, true); tabsEl.children[n].focus();
        }
      });
      tabsEl.appendChild(b);
    });

    function select(i, user) {
      const h = HOBBIES[i];
      [...tabsEl.children].forEach((t, j) => {
        t.setAttribute('aria-selected', j === i);
        t.tabIndex = j === i ? 0 : -1;
      });
      panel.setAttribute('aria-labelledby', 'tab-' + h.id);
      const ups = (h.updates || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      panel.innerHTML =
        '<div class="panel-head">' + h.icon + '<div><h3>' + esc(h.name) + '</h3>' +
          (h.since ? '<div class="since">' + esc(h.since) + '</div>' : '') + '</div></div>' +
        '<p class="about">' + esc(h.about) + '</p>' +
        (h.now ? '<div class="now"><b>CURRENTLY</b>' + esc(h.now) + '</div>' : '') +
        '<div class="updates-title">// updates</div>' +
        (ups.length
          ? '<ul class="updates">' + ups.map(u =>
              '<li><time>' + fmt(u.date) + '</time>' +
              (u.title ? '<span class="t">' + esc(u.title) + '</span><br>' : '') +
              esc(u.text || '') + '</li>').join('') + '</ul>'
          : '<p class="empty">No updates yet. Check back soon.</p>');
      panel.style.animation = 'none'; panel.offsetHeight; panel.style.animation = '';
      if (user) { try { localStorage.setItem('hobby-tab', h.id); } catch (e) {} }
    }

    let start = 0;
    try { const saved = localStorage.getItem('hobby-tab'); const k = HOBBIES.findIndex(h => h.id === saved); if (k >= 0) start = k; } catch (e) {}
    select(start, false);
  })();
