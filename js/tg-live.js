/* ============================================================
   TG General Contracting — live content from Supabase
   Overrides static content with the owner's dashboard edits.
   Fails silently (keeps static HTML) if the network is down.
   ============================================================ */
(function () {
  'use strict';

  var URL = 'https://riyatnyffsjyxmpsnzmr.supabase.co';
  var KEY = 'sb_publishable_BiamQN3rxMdnUT-Y58hFIA_p6jqHVZo';

  function rest(path) {
    return fetch(URL + '/rest/v1/' + path, {
      headers: { apikey: KEY, Authorization: 'Bearer ' + KEY },
    }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); });
  }

  var page = document.body.getAttribute('data-page') || '';
  var isPortfolio = !!document.getElementById('commercialGrid');
  var isDetail = !!document.querySelector('.pj-detail');

  /* ---------- 1) text content ---------- */
  rest('site_content?select=key,value').then(function (rows) {
    var map = {};
    rows.forEach(function (r) { map[r.key] = r.value; });
    document.querySelectorAll('[data-editable]').forEach(function (el) {
      var k = el.getAttribute('data-editable');
      // project card titles/descs are handled by the projects sync below
      if (/^pf-[cr]\d+(-d)?$/.test(k)) return;
      if (map[k] != null && map[k] !== '') el.textContent = map[k];
    });
  }).catch(function () {});

  /* ---------- 2) projects (portfolio grid + detail) ---------- */
  if (isPortfolio || isDetail) {
    rest('projects?select=*&order=sort_order').then(function (rows) {
      var byId = {};
      rows.forEach(function (p) { byId[p.id] = p; });

      if (isPortfolio) syncPortfolio(rows, byId);
      if (isDetail) syncDetail(byId);
    }).catch(function () {});
  }

  function syncPortfolio(rows, byId) {
    // update / remove existing static cards
    document.querySelectorAll('[data-project-id]').forEach(function (card) {
      var id = card.getAttribute('data-project-id');
      var p = byId[id];
      if (!p || p.is_published === false) { card.remove(); return; }
      updateCard(card, p);
      card.setAttribute('data-synced', '1');
    });
    // append projects that have no static card yet
    var cGrid = document.getElementById('commercialGrid');
    var rGrid = document.getElementById('residentialGrid');
    rows.forEach(function (p) {
      if (p.is_published === false) return;
      if (document.querySelector('[data-project-id="' + cssEsc(p.id) + '"]')) return;
      var grid = p.category === 'commercial' ? cGrid : rGrid;
      if (grid) grid.appendChild(buildCard(p));
    });
  }

  function updateCard(card, p) {
    var t = card.querySelector('.pf-card__title');
    var d = card.querySelector('.pf-card__desc');
    var img = card.querySelector('.pf-card__image img');
    var tag = card.querySelector('.pf-card__tag');
    if (t && p.title) t.textContent = p.title;
    if (d) d.textContent = p.description || '';
    if (tag && p.tag) tag.textContent = p.tag;
    if (img && p.main_image) { img.src = p.main_image; img.alt = p.title || ''; }
  }

  function buildCard(p) {
    var a = document.createElement('a');
    a.href = 'project.html?id=' + encodeURIComponent(p.id);
    a.className = 'pf-card';
    a.setAttribute('data-category', p.category || 'residential');
    a.setAttribute('data-project-id', p.id);
    var imgWrap = document.createElement('div'); imgWrap.className = 'pf-card__image';
    var img = document.createElement('img'); img.loading = 'lazy';
    img.src = p.main_image || ''; img.alt = p.title || '';
    imgWrap.appendChild(img);
    var ov = document.createElement('div'); ov.className = 'pf-card__overlay';
    var tag = document.createElement('span'); tag.className = 'pf-card__tag'; tag.textContent = p.tag || p.category || '';
    var h = document.createElement('h3'); h.className = 'pf-card__title'; h.textContent = p.title || '';
    var desc = document.createElement('p'); desc.className = 'pf-card__desc'; desc.textContent = p.description || '';
    ov.append(tag, h, desc);
    a.append(imgWrap, ov);
    return a;
  }

  function syncDetail(byId) {
    var params = new URLSearchParams(location.search);
    var p = byId[params.get('id')];
    if (!p) return; // leave whatever main.js rendered

    document.title = p.title + ' — TG General Contracting Ltd.';
    setText('pjTag', p.tag);
    setText('pjTitle', p.title);
    var hero = document.getElementById('pjHeroImg');
    if (hero && p.main_image) { hero.src = p.main_image; hero.alt = p.title || ''; }

    var descEl = document.getElementById('pjDesc');
    if (descEl) {
      descEl.innerHTML = '';
      (p.detail || p.description || '').split('\n\n').forEach(function (para) {
        if (!para.trim()) return;
        var el = document.createElement('p'); el.textContent = para.trim(); descEl.appendChild(el);
      });
    }
    var specs = [['pjLocation', 'specLocation', p.location], ['pjSize', 'specSize', p.size],
                 ['pjDuration', 'specDuration', p.duration], ['pjYear', 'specYear', p.year]];
    specs.forEach(function (s) {
      var v = document.getElementById(s[0]); var w = document.getElementById(s[1]);
      if (v && s[2]) { v.textContent = s[2]; if (w) w.style.display = ''; }
      else if (w) { w.style.display = 'none'; }
    });
    var gal = document.getElementById('pjGallery');
    if (gal) {
      gal.innerHTML = '';
      var imgs = (p.gallery && p.gallery.length) ? p.gallery : [p.main_image];
      imgs.forEach(function (u, i) {
        if (!u) return;
        var item = document.createElement('div');
        item.className = 'pj-gallery__item' + (i === 0 ? ' pj-gallery__item--large' : '');
        var im = document.createElement('img'); im.src = u; im.loading = 'lazy'; im.alt = (p.title || '') + ' ' + (i + 1);
        item.appendChild(im); gal.appendChild(item);
      });
    }
  }

  function setText(id, v) { var e = document.getElementById(id); if (e && v != null) e.textContent = v; }
  function cssEsc(s) { return String(s).replace(/"/g, '\\"'); }

  /* ---------- 3) route the old "Are you admin?" button to the dashboard ---------- */
  var trigger = document.getElementById('adminTrigger');
  if (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      location.href = 'admin/';
    }, true);
  }
})();
