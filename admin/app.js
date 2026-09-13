/* ============================================================
   TG General Contracting — Admin dashboard logic
   ============================================================ */
(function () {
  'use strict';

  const CFG = window.TG_CONFIG;
  if (!window.supabase || !CFG) {
    document.getElementById('bootError').hidden = false;
    document.getElementById('bootError').textContent = '초기화 실패: 스크립트를 불러오지 못했습니다.';
    return;
  }

  const db = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: 'tg-admin-auth' },
  });

  // ---- state ----
  let user = null;
  let role = null;
  let sites = [];
  let currentSiteId = null;
  let contentMap = {};

  // ---- tiny DOM helpers ----
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const isAdmin = () => role === 'admin';

  function toast(msg, kind) {
    const t = $('#toast');
    t.textContent = msg;
    t.className = 'toast' + (kind ? ' toast--' + kind : '');
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.hidden = true; }, 3200);
  }

  function esc(s) { return (s == null ? '' : String(s)); }

  function fmtDate(d) {
    try {
      const dt = new Date(d + (d.length === 10 ? 'T00:00:00' : ''));
      return dt.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
    } catch (e) { return d; }
  }
  function fmtSize(b) {
    if (!b) return '';
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(0) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }
  function kindOf(mime) {
    if (!mime) return 'file';
    if (mime.startsWith('image/')) return 'photo';
    if (mime.startsWith('video/')) return 'video';
    return 'file';
  }

  // ---- modal ----
  function openModal(html) {
    const box = $('#modalBox');
    box.innerHTML = html;
    $('#modal').hidden = false;
    box.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeModal));
  }
  function closeModal() { $('#modal').hidden = true; $('#modalBox').innerHTML = ''; }
  $('#modal').querySelector('.modal__backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  /* ==========================================================
     AUTH
     ========================================================== */
  async function boot() {
    const { data: { session } } = await db.auth.getSession();
    if (session) { await onSignedIn(session); }
    else { await showAuth(); }
  }

  async function showAuth() {
    $('#appScreen').hidden = true;
    $('#authScreen').hidden = false;
    // first-time setup? (no admin yet)
    let setupDone = true;
    try {
      const { data } = await db.from('app_settings').select('value').eq('key', 'setup_done').maybeSingle();
      setupDone = data ? data.value === true : false;
    } catch (e) { setupDone = true; }
    $('#setupWrap').hidden = setupDone;
    $('#loginForm').hidden = !setupDone;
    $('.auth__title').textContent = setupDone ? 'TG 관리자' : '최초 설정';
  }

  function authError(msg) {
    const e = $('#authError');
    if (!msg) { e.hidden = true; return; }
    e.textContent = msg; e.hidden = false;
  }

  $('#loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    authError('');
    const btn = $('#loginBtn'); btn.disabled = true; btn.textContent = '로그인 중…';
    const { data, error } = await db.auth.signInWithPassword({
      email: $('#loginEmail').value.trim(),
      password: $('#loginPassword').value,
    });
    btn.disabled = false; btn.textContent = '로그인';
    if (error) { authError('로그인 실패: ' + translateAuthErr(error.message)); return; }
    await onSignedIn(data.session);
  });

  $('#setupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    authError('');
    const email = $('#setupEmail').value.trim();
    const password = $('#setupPassword').value;
    const full_name = $('#setupName').value.trim();
    const btn = $('#setupBtn'); btn.disabled = true; btn.textContent = '만드는 중…';
    try {
      const res = await fetch(`${CFG.FUNCTIONS_URL}/bootstrap-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': CFG.SUPABASE_KEY },
        body: JSON.stringify({ email, password, full_name }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || '생성 실패');
      // auto-login
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      await onSignedIn(data.session);
    } catch (err) {
      authError('설정 실패: ' + translateAuthErr(err.message));
    } finally { btn.disabled = false; btn.textContent = '관리자 계정 만들기'; }
  });

  function translateAuthErr(m) {
    if (/Invalid login/i.test(m)) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    if (/already registered/i.test(m)) return '이미 등록된 이메일입니다.';
    if (/SIGNUP_DISABLED/i.test(m)) return '자가 가입은 불가능합니다. 사장님에게 계정을 요청하세요.';
    if (/Password should be/i.test(m)) return '비밀번호는 6자 이상이어야 합니다.';
    return m;
  }

  $('#logoutBtn').addEventListener('click', async () => {
    await db.auth.signOut();
    user = null; role = null;
    location.reload();
  });

  async function onSignedIn(session) {
    user = session.user;
    // fetch role
    const { data: prof, error } = await db.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
    if (error || !prof) {
      // profile row not ready yet — retry once
      await new Promise(r => setTimeout(r, 800));
      const retry = await db.from('profiles').select('role, full_name').eq('id', user.id).maybeSingle();
      role = retry.data ? retry.data.role : 'employee';
    } else {
      role = prof.role;
    }

    $('#authScreen').hidden = true;
    $('#appScreen').hidden = false;
    $('#userEmail').textContent = user.email;
    const badge = $('#userRole');
    badge.textContent = isAdmin() ? '사장님' : '직원';
    badge.className = 'badge' + (isAdmin() ? ' badge--admin' : '');

    // gate admin-only UI
    $$('[data-admin]').forEach(el => { el.hidden = !isAdmin(); });

    // default view
    switchView(isAdmin() ? 'sites' : 'sites');
    await loadSites();
    if (isAdmin()) { loadContentValues(); }
  }

  /* ==========================================================
     NAV / VIEWS
     ========================================================== */
  $('#sideNav').addEventListener('click', (e) => {
    const b = e.target.closest('.navlink');
    if (!b) return;
    if (b.hasAttribute('data-admin') && !isAdmin()) return;
    switchView(b.dataset.view);
    $('#sideNav').closest('.side').classList.remove('is-open');
  });
  $('#sideToggle').addEventListener('click', () => $('.side').classList.toggle('is-open'));

  function switchView(name) {
    $$('.navlink').forEach(n => n.classList.toggle('is-active', n.dataset.view === name));
    $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + name));
    if (name === 'website' && isAdmin() && !$('#projectList').dataset.loaded) loadProjects();
    if (name === 'staff' && isAdmin()) loadStaff();
    if (name === 'settings' && isAdmin()) loadSettings();
  }

  // website sub-tabs
  $$('.tab').forEach(t => t.addEventListener('click', () => {
    $$('.tab').forEach(x => x.classList.toggle('is-active', x === t));
    $$('.tabpane').forEach(p => p.classList.toggle('is-active', p.id === 'tab-' + t.dataset.tab));
  }));

  /* ==========================================================
     SITES & RECORDS
     ========================================================== */
  async function loadSites() {
    const { data, error } = await db.from('sites').select('*').order('created_at', { ascending: false });
    if (error) { toast('현장 불러오기 실패', 'err'); return; }
    sites = data || [];
    renderSiteList();
  }

  function renderSiteList() {
    const list = $('#siteList');
    list.innerHTML = '';
    if (!sites.length) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = isAdmin() ? '아직 현장이 없습니다. “+ 새 현장”으로 추가하세요.' : '등록된 현장이 없습니다.';
      list.appendChild(p);
    }
    sites.forEach(s => {
      const b = document.createElement('button');
      b.className = 'site-card' + (s.id === currentSiteId ? ' is-active' : '');
      const name = document.createElement('div'); name.className = 'site-card__name'; name.textContent = s.name;
      const meta = document.createElement('div'); meta.className = 'site-card__meta';
      meta.textContent = [s.client, s.address].filter(Boolean).join(' · ') || '—';
      const st = document.createElement('span');
      st.className = 'site-card__status status--' + s.status;
      st.textContent = s.status === 'completed' ? '완료' : '진행중';
      b.append(name, meta, st);
      b.addEventListener('click', () => selectSite(s.id));
      list.appendChild(b);
    });
  }

  $('#newSiteBtn').addEventListener('click', () => {
    openModal(`
      <h3 class="modal__title">새 현장 추가</h3>
      <div class="form-grid">
        <label class="field full"><span>현장 이름 *</span><input id="m_name" placeholder="예: Kim 주택 리노베이션"></label>
        <label class="field"><span>고객명</span><input id="m_client"></label>
        <label class="field"><span>상태</span><select id="m_status"><option value="active">진행중</option><option value="completed">완료</option></select></label>
        <label class="field full"><span>주소</span><input id="m_address"></label>
        <label class="field full"><span>메모</span><textarea id="m_notes"></textarea></label>
      </div>
      <div class="modal__foot">
        <button class="btn btn--ghost" data-close>취소</button>
        <button class="btn btn--gold" id="m_save">저장</button>
      </div>`);
    $('#m_save').addEventListener('click', async () => {
      const name = $('#m_name').value.trim();
      if (!name) { toast('현장 이름을 입력하세요', 'err'); return; }
      $('#m_save').disabled = true;
      const { error } = await db.from('sites').insert({
        name, client: $('#m_client').value.trim() || null,
        address: $('#m_address').value.trim() || null,
        status: $('#m_status').value, notes: $('#m_notes').value.trim() || null,
        created_by: user.id,
      });
      if (error) { toast('저장 실패: ' + error.message, 'err'); $('#m_save').disabled = false; return; }
      closeModal(); toast('현장이 추가되었습니다', 'ok'); await loadSites();
    });
  });

  async function selectSite(id) {
    currentSiteId = id;
    renderSiteList();
    const site = sites.find(s => s.id === id);
    $('#recordsEmpty').hidden = true;
    const body = $('#recordsBody'); body.hidden = false;
    body.innerHTML = `
      <div class="records-head">
        <div>
          <h3 id="rh_name"></h3>
          <p class="muted" id="rh_meta"></p>
        </div>
        ${isAdmin() ? '<button class="btn btn--ghost btn--sm" id="editSiteBtn">현장 정보 수정</button>' : ''}
      </div>
      <div class="uploader" id="uploader">
        <div class="uploader__row">
          <label class="field"><span>촬영/기록 날짜</span><input type="date" id="up_date"></label>
          <label class="field"><span>메모 (선택)</span><input type="text" id="up_note" placeholder="예: 1층 배관 작업"></label>
        </div>
        <div class="uploader__drop" id="dropZone">
          <b>사진·동영상·파일</b>을 여기로 끌어다 놓거나 <b>클릭</b>해서 선택하세요.<br>
          <small class="muted">여러 개 동시 업로드 가능 · 파일당 최대 100MB</small>
          <input type="file" id="fileInput" multiple hidden>
        </div>
        <div class="uploader__queue" id="queue"></div>
      </div>
      <div id="mediaWrap"></div>`;
    $('#rh_name').textContent = site.name;
    $('#rh_meta').textContent = [site.client, site.address, site.notes].filter(Boolean).join(' · ') || '—';
    $('#up_date').value = new Date().toISOString().slice(0, 10);

    // upload wiring
    const drop = $('#dropZone'), input = $('#fileInput');
    drop.addEventListener('click', () => input.click());
    input.addEventListener('change', () => { handleFiles(input.files); input.value = ''; });
    ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); $('#uploader').classList.add('drag'); }));
    ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); $('#uploader').classList.remove('drag'); }));
    drop.addEventListener('drop', e => { if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); });

    if (isAdmin()) $('#editSiteBtn').addEventListener('click', () => editSite(site));

    await loadMedia(id);
  }

  function editSite(site) {
    openModal(`
      <h3 class="modal__title">현장 정보 수정</h3>
      <div class="form-grid">
        <label class="field full"><span>현장 이름 *</span><input id="m_name" value="${attr(site.name)}"></label>
        <label class="field"><span>고객명</span><input id="m_client" value="${attr(site.client)}"></label>
        <label class="field"><span>상태</span><select id="m_status">
          <option value="active" ${site.status === 'active' ? 'selected' : ''}>진행중</option>
          <option value="completed" ${site.status === 'completed' ? 'selected' : ''}>완료</option></select></label>
        <label class="field full"><span>주소</span><input id="m_address" value="${attr(site.address)}"></label>
        <label class="field full"><span>메모</span><textarea id="m_notes">${esc(site.notes)}</textarea></label>
      </div>
      <div class="modal__foot">
        <button class="btn btn--danger" id="m_del">현장 삭제</button>
        <span style="flex:1"></span>
        <button class="btn btn--ghost" data-close>취소</button>
        <button class="btn btn--gold" id="m_save">저장</button>
      </div>`);
    $('#m_save').addEventListener('click', async () => {
      const { error } = await db.from('sites').update({
        name: $('#m_name').value.trim(), client: $('#m_client').value.trim() || null,
        address: $('#m_address').value.trim() || null, status: $('#m_status').value,
        notes: $('#m_notes').value.trim() || null,
      }).eq('id', site.id);
      if (error) { toast('저장 실패', 'err'); return; }
      closeModal(); toast('저장되었습니다', 'ok'); await loadSites();
      const s = sites.find(x => x.id === site.id); if (s) selectSite(site.id);
    });
    $('#m_del').addEventListener('click', async () => {
      if (!confirm('이 현장과 모든 파일 기록을 삭제합니다. 계속할까요?')) return;
      const { error } = await db.from('sites').delete().eq('id', site.id);
      if (error) { toast('삭제 실패', 'err'); return; }
      closeModal(); currentSiteId = null;
      $('#recordsBody').hidden = true; $('#recordsEmpty').hidden = false;
      toast('삭제되었습니다', 'ok'); await loadSites();
    });
  }

  // ---- upload ----
  async function handleFiles(fileList) {
    const files = Array.from(fileList);
    if (!files.length || !currentSiteId) return;
    const capturedOn = $('#up_date').value || new Date().toISOString().slice(0, 10);
    const note = $('#up_note').value.trim() || null;
    const queue = $('#queue');

    for (const file of files) {
      const item = document.createElement('div');
      item.className = 'qitem';
      const nm = document.createElement('span'); nm.className = 'qitem__name'; nm.textContent = file.name;
      const bar = document.createElement('div'); bar.className = 'qitem__bar'; const fill = document.createElement('i'); bar.appendChild(fill);
      const st = document.createElement('span'); st.textContent = '업로드 중…'; st.style.fontSize = '.75rem'; st.style.color = 'var(--muted)';
      item.append(nm, bar, st); queue.appendChild(item);
      fill.style.width = '35%';

      const safe = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `${currentSiteId}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safe}`;
      const { error: upErr } = await db.storage.from(CFG.BUCKET_MEDIA).upload(path, file, {
        contentType: file.type || 'application/octet-stream', upsert: false,
      });
      if (upErr) { st.textContent = '실패'; st.style.color = 'var(--danger)'; fill.style.background = 'var(--danger)'; continue; }
      fill.style.width = '75%';

      const { error: dbErr } = await db.from('media').insert({
        site_id: currentSiteId, storage_path: path, file_name: file.name,
        mime_type: file.type || null, kind: kindOf(file.type), size_bytes: file.size,
        captured_on: capturedOn, note, uploaded_by: user.id,
      });
      if (dbErr) { st.textContent = '기록 실패'; st.style.color = 'var(--danger)'; continue; }
      fill.style.width = '100%'; st.textContent = '완료'; st.style.color = 'var(--ok)';
      setTimeout(() => item.remove(), 1500);
    }
    await loadMedia(currentSiteId);
  }

  async function loadMedia(siteId) {
    const wrap = $('#mediaWrap');
    wrap.innerHTML = '<p class="muted">불러오는 중…</p>';
    const { data, error } = await db.from('media').select('*')
      .eq('site_id', siteId).order('captured_on', { ascending: false }).order('created_at', { ascending: false });
    if (error) { wrap.innerHTML = '<p class="muted">불러오기 실패</p>'; return; }
    if (!data.length) { wrap.innerHTML = '<div class="empty">아직 올린 파일이 없습니다.</div>'; return; }

    // signed urls (batch)
    const paths = data.map(m => m.storage_path);
    const { data: signed } = await db.storage.from(CFG.BUCKET_MEDIA).createSignedUrls(paths, 3600);
    const urlByPath = {};
    (signed || []).forEach(s => { if (s.path && s.signedUrl) urlByPath[s.path] = s.signedUrl; });

    // group by date
    const groups = {};
    data.forEach(m => { (groups[m.captured_on] = groups[m.captured_on] || []).push(m); });

    wrap.innerHTML = '';
    Object.keys(groups).sort().reverse().forEach(date => {
      const g = document.createElement('div'); g.className = 'date-group';
      const lbl = document.createElement('div'); lbl.className = 'date-group__label';
      lbl.textContent = fmtDate(date) + '  ·  ' + groups[date].length + '개';
      const grid = document.createElement('div'); grid.className = 'media-grid';
      groups[date].forEach(m => grid.appendChild(mediaCard(m, urlByPath[m.storage_path])));
      g.append(lbl, grid); wrap.appendChild(g);
    });
  }

  function mediaCard(m, url) {
    const card = document.createElement('div'); card.className = 'media-card';
    const badge = document.createElement('span'); badge.className = 'media-card__badge';
    badge.textContent = m.kind === 'photo' ? '사진' : m.kind === 'video' ? '영상' : '파일';
    const thumb = document.createElement('div'); thumb.className = 'media-card__thumb';
    if (m.kind === 'photo' && url) {
      const img = document.createElement('img'); img.src = url; img.loading = 'lazy'; thumb.appendChild(img);
    } else if (m.kind === 'video' && url) {
      const v = document.createElement('video'); v.src = url; v.muted = true; thumb.appendChild(v);
    } else {
      const f = document.createElement('div'); f.className = 'media-card__file'; f.textContent = '📄'; thumb.appendChild(f);
    }
    thumb.addEventListener('click', () => { if (url) window.open(url, '_blank', 'noopener'); });
    const cap = document.createElement('div'); cap.className = 'media-card__cap';
    const fn = document.createElement('span'); fn.className = 'fn'; fn.textContent = m.file_name || '(이름 없음)'; fn.title = m.file_name || '';
    cap.appendChild(fn);
    const meta = document.createElement('span'); meta.textContent = [fmtSize(m.size_bytes), m.note].filter(Boolean).join(' · ');
    cap.appendChild(meta);
    card.append(badge, thumb, cap);
    if (isAdmin()) {
      const del = document.createElement('button'); del.className = 'media-card__del'; del.textContent = '×'; del.title = '삭제';
      del.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('이 파일을 삭제할까요?')) return;
        await db.storage.from(CFG.BUCKET_MEDIA).remove([m.storage_path]);
        await db.from('media').delete().eq('id', m.id);
        toast('삭제되었습니다', 'ok'); await loadMedia(currentSiteId);
      });
      card.appendChild(del);
    }
    return card;
  }

  /* ==========================================================
     WEBSITE · PROJECTS
     ========================================================== */
  async function loadProjects() {
    const list = $('#projectList');
    list.innerHTML = '<p class="muted">불러오는 중…</p>';
    const { data, error } = await db.from('projects').select('*').order('sort_order').order('updated_at', { ascending: false });
    if (error) { list.innerHTML = '<p class="muted">불러오기 실패</p>'; return; }
    list.dataset.loaded = '1';
    list.innerHTML = '';
    data.forEach(p => list.appendChild(projectCard(p)));
  }

  function projectCard(p) {
    const c = document.createElement('div'); c.className = 'pcard';
    const img = document.createElement('img'); img.className = 'pcard__img'; img.loading = 'lazy';
    img.src = p.main_image || '';
    img.onerror = () => { img.style.display = 'none'; };
    const body = document.createElement('div'); body.className = 'pcard__body';
    const tag = document.createElement('span'); tag.className = 'pcard__tag';
    tag.textContent = (p.tag || p.category || '') + (p.year ? ' · ' + p.year : '');
    const title = document.createElement('h4'); title.className = 'pcard__title'; title.textContent = p.title;
    const desc = document.createElement('p'); desc.className = 'pcard__desc'; desc.textContent = p.description || '';
    const pub = document.createElement('span'); pub.className = 'pill ' + (p.is_published ? 'pill--on' : 'pill--off');
    pub.textContent = p.is_published ? '공개' : '숨김';
    body.append(tag, title, desc, pub);
    const foot = document.createElement('div'); foot.className = 'pcard__foot';
    const edit = document.createElement('button'); edit.className = 'btn btn--ghost btn--sm'; edit.textContent = '수정';
    edit.addEventListener('click', () => projectForm(p));
    const del = document.createElement('button'); del.className = 'btn btn--danger btn--sm'; del.textContent = '삭제';
    del.addEventListener('click', async () => {
      if (!confirm(`"${p.title}" 프로젝트를 삭제할까요?`)) return;
      const { error } = await db.from('projects').delete().eq('id', p.id);
      if (error) { toast('삭제 실패', 'err'); return; }
      toast('삭제되었습니다', 'ok'); loadProjects();
    });
    foot.append(edit, del); c.append(img, body, foot);
    return c;
  }

  $('#newProjectBtn').addEventListener('click', () => projectForm(null));

  function projectForm(p) {
    const isNew = !p;
    p = p || { category: 'residential', tag: 'Residential', gallery: [], is_published: true, sort_order: 0 };
    let gallery = Array.isArray(p.gallery) ? p.gallery.slice() : [];

    openModal(`
      <h3 class="modal__title">${isNew ? '새 프로젝트' : '프로젝트 수정'}</h3>
      <div class="form-grid">
        <label class="field full"><span>제목 *</span><input id="p_title" value="${attr(p.title)}"></label>
        <label class="field"><span>분류</span><select id="p_cat">
          <option value="residential" ${p.category === 'residential' ? 'selected' : ''}>주거 (Residential)</option>
          <option value="commercial" ${p.category === 'commercial' ? 'selected' : ''}>상업 (Commercial)</option></select></label>
        <label class="field"><span>태그 라벨</span><input id="p_tag" value="${attr(p.tag)}" placeholder="Residential"></label>
        <label class="field full"><span>짧은 설명</span><textarea id="p_desc">${esc(p.description)}</textarea></label>
        <label class="field full"><span>상세 설명 <small>(빈 줄로 문단 구분)</small></span><textarea id="p_detail" style="min-height:120px">${esc(p.detail)}</textarea></label>
        <label class="field"><span>위치</span><input id="p_loc" value="${attr(p.location)}"></label>
        <label class="field"><span>규모</span><input id="p_size" value="${attr(p.size)}"></label>
        <label class="field"><span>기간</span><input id="p_dur" value="${attr(p.duration)}"></label>
        <label class="field"><span>연도</span><input id="p_year" value="${attr(p.year)}"></label>
        <div class="field full"><span>대표 이미지</span>
          <div class="img-input"><input id="p_main" value="${attr(p.main_image)}" placeholder="이미지 URL 또는 업로드">
            <button class="btn btn--ghost btn--sm" id="p_main_up">업로드</button></div>
          <input type="file" id="p_main_file" accept="image/*" hidden>
        </div>
        <div class="field full"><span>갤러리 이미지</span>
          <div class="img-input"><input id="p_gal_url" placeholder="이미지 URL 추가 후 Enter">
            <button class="btn btn--ghost btn--sm" id="p_gal_up">업로드</button></div>
          <input type="file" id="p_gal_file" accept="image/*" multiple hidden>
          <div class="thumb-row" id="p_gal_row"></div>
        </div>
        <label class="field"><span>정렬 순서</span><input type="number" id="p_sort" value="${p.sort_order || 0}"></label>
        <label class="field"><span>공개 여부</span><select id="p_pub">
          <option value="true" ${p.is_published ? 'selected' : ''}>공개</option>
          <option value="false" ${!p.is_published ? 'selected' : ''}>숨김</option></select></label>
      </div>
      <div class="modal__foot">
        <button class="btn btn--ghost" data-close>취소</button>
        <button class="btn btn--gold" id="p_save">${isNew ? '추가' : '저장'}</button>
      </div>`);

    function renderGallery() {
      const row = $('#p_gal_row'); row.innerHTML = '';
      gallery.forEach((url, i) => {
        const chip = document.createElement('div'); chip.className = 'thumb-chip';
        const img = document.createElement('img'); img.src = url; chip.appendChild(img);
        const x = document.createElement('button'); x.textContent = '×';
        x.addEventListener('click', () => { gallery.splice(i, 1); renderGallery(); });
        chip.appendChild(x); row.appendChild(chip);
      });
    }
    renderGallery();

    $('#p_gal_url').addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); const v = e.target.value.trim(); if (v) { gallery.push(v); e.target.value = ''; renderGallery(); } }
    });
    $('#p_main_up').addEventListener('click', () => $('#p_main_file').click());
    $('#p_main_file').addEventListener('change', async e => {
      const f = e.target.files[0]; if (!f) return;
      const url = await uploadImage(f); if (url) { $('#p_main').value = url; toast('이미지 업로드됨', 'ok'); }
    });
    $('#p_gal_up').addEventListener('click', () => $('#p_gal_file').click());
    $('#p_gal_file').addEventListener('change', async e => {
      for (const f of e.target.files) { const url = await uploadImage(f); if (url) gallery.push(url); }
      renderGallery(); toast('갤러리에 추가됨', 'ok');
    });

    $('#p_save').addEventListener('click', async () => {
      const title = $('#p_title').value.trim();
      if (!title) { toast('제목을 입력하세요', 'err'); return; }
      $('#p_save').disabled = true;
      const row = {
        id: isNew ? 'p-' + Date.now().toString(36) : p.id,
        title, category: $('#p_cat').value, tag: $('#p_tag').value.trim() || null,
        description: $('#p_desc').value.trim() || null, detail: $('#p_detail').value.trim() || null,
        main_image: $('#p_main').value.trim() || null, gallery: gallery,
        location: $('#p_loc').value.trim() || null, size: $('#p_size').value.trim() || null,
        duration: $('#p_dur').value.trim() || null, year: $('#p_year').value.trim() || null,
        sort_order: parseInt($('#p_sort').value, 10) || 0,
        is_published: $('#p_pub').value === 'true', updated_at: new Date().toISOString(),
      };
      const { error } = await db.from('projects').upsert(row, { onConflict: 'id' });
      if (error) { toast('저장 실패: ' + error.message, 'err'); $('#p_save').disabled = false; return; }
      closeModal(); toast('저장되었습니다', 'ok'); loadProjects();
    });
  }

  async function uploadImage(file) {
    const safe = file.name.replace(/[^\w.\-]+/g, '_');
    const path = `projects/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safe}`;
    const { error } = await db.storage.from(CFG.BUCKET_IMAGES).upload(path, file, { contentType: file.type, upsert: false });
    if (error) { toast('업로드 실패: ' + error.message, 'err'); return null; }
    const { data } = db.storage.from(CFG.BUCKET_IMAGES).getPublicUrl(path);
    return data.publicUrl;
  }

  /* ==========================================================
     WEBSITE · TEXT CONTENT
     ========================================================== */
  function renderContentEditor() {
    const wrap = $('#contentEditor'); wrap.innerHTML = '';
    window.TG_CONTENT_FIELDS.forEach(group => {
      const g = document.createElement('div'); g.className = 'ce-group';
      const h = document.createElement('h3'); h.textContent = group.group; g.appendChild(h);
      const grid = document.createElement('div'); grid.className = 'ce-grid';
      group.fields.forEach(f => {
        const lab = document.createElement('label'); lab.className = 'field' + (f.type === 'textarea' ? ' full' : '');
        const span = document.createElement('span'); span.textContent = f.label + (f.hint ? ` (${f.hint})` : '');
        const inp = f.type === 'textarea' ? document.createElement('textarea') : document.createElement('input');
        inp.dataset.key = f.key;
        inp.value = contentMap[f.key] != null ? contentMap[f.key] : '';
        lab.append(span, inp); grid.appendChild(lab);
      });
      g.appendChild(grid); wrap.appendChild(g);
    });
  }

  async function loadContentValues() {
    const { data } = await db.from('site_content').select('key, value');
    contentMap = {}; (data || []).forEach(r => { contentMap[r.key] = r.value; });
    renderContentEditor();
  }

  $('#saveContentBtn').addEventListener('click', async () => {
    const rows = [];
    $$('#contentEditor [data-key]').forEach(inp => {
      const key = inp.dataset.key, val = inp.value;
      if ((contentMap[key] || '') !== val) rows.push({ key, value: val, updated_at: new Date().toISOString() });
    });
    if (!rows.length) { toast('변경된 내용이 없습니다'); return; }
    const btn = $('#saveContentBtn'); btn.disabled = true; btn.textContent = '저장 중…';
    const { error } = await db.from('site_content').upsert(rows, { onConflict: 'key' });
    btn.disabled = false; btn.textContent = '모든 텍스트 저장';
    if (error) { toast('저장 실패: ' + error.message, 'err'); return; }
    rows.forEach(r => { contentMap[r.key] = r.value; });
    toast(rows.length + '개 항목이 저장되어 사이트에 반영되었습니다', 'ok');
  });

  /* ==========================================================
     STAFF
     ========================================================== */
  $('#staffForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#staffEmail').value.trim();
    const password = $('#staffPassword').value;
    const full_name = $('#staffName').value.trim();
    const btn = $('#staffBtn'); btn.disabled = true; btn.textContent = '생성 중…';
    try {
      const { data: { session } } = await db.auth.getSession();
      const res = await fetch(`${CFG.FUNCTIONS_URL}/admin-create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': CFG.SUPABASE_KEY,
        },
        body: JSON.stringify({ email, password, full_name }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || '생성 실패');
      toast('직원 계정이 생성되었습니다', 'ok');
      $('#staffForm').reset();
      loadStaff();
    } catch (err) {
      toast('실패: ' + err.message, 'err');
    } finally { btn.disabled = false; btn.textContent = '계정 생성'; }
  });

  async function loadStaff() {
    const list = $('#staffList');
    list.innerHTML = '<p class="muted">불러오는 중…</p>';
    const { data, error } = await db.from('profiles').select('*').eq('role', 'employee').order('created_at');
    if (error) { list.innerHTML = '<p class="muted">불러오기 실패</p>'; return; }
    if (!data.length) { list.innerHTML = '<p class="muted">아직 직원 계정이 없습니다.</p>'; return; }
    list.innerHTML = '';
    data.forEach(s => {
      const row = document.createElement('div'); row.className = 'staff-row';
      const left = document.createElement('div');
      const nm = document.createElement('div'); nm.className = 'staff-row__name'; nm.textContent = s.full_name || '(이름 없음)';
      const em = document.createElement('div'); em.className = 'staff-row__email'; em.textContent = s.email || '';
      left.append(nm, em);
      const badge = document.createElement('span'); badge.className = 'badge'; badge.textContent = '직원';
      row.append(left, badge); list.appendChild(row);
    });
  }

  /* ==========================================================
     SETTINGS
     ========================================================== */
  function loadSettings() {
    const who = $('#pwWhoEmail');
    if (who && user) who.textContent = user.email;
  }

  $('#emailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = $('#emNew').value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast('올바른 이메일을 입력하세요', 'err'); return; }
    if (!confirm(`로그인 아이디를 "${email}" 로 변경합니다. 다음 로그인부터 이 이메일을 사용합니다. 계속할까요?`)) return;
    const btn = $('#emBtn'); btn.disabled = true; btn.textContent = '변경 중…';
    try {
      const { data: { session } } = await db.auth.getSession();
      const res = await fetch(`${CFG.FUNCTIONS_URL}/update-my-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}`, 'apikey': CFG.SUPABASE_KEY },
        body: JSON.stringify({ email }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || '변경 실패');
      await db.auth.refreshSession();
      const { data: { user: u2 } } = await db.auth.getUser();
      if (u2) { user = u2; $('#userEmail').textContent = u2.email; $('#pwWhoEmail').textContent = u2.email; }
      $('#emailForm').reset();
      toast('이메일이 변경되었습니다', 'ok');
    } catch (err) {
      toast('실패: ' + err.message, 'err');
    } finally { btn.disabled = false; btn.textContent = '이메일 변경'; }
  });

  $('#pwForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const n = $('#pwNew').value, c = $('#pwConfirm').value;
    if (n.length < 6) { toast('비밀번호는 6자 이상이어야 합니다', 'err'); return; }
    if (n !== c) { toast('두 비밀번호가 일치하지 않습니다', 'err'); return; }
    const btn = $('#pwBtn'); btn.disabled = true; btn.textContent = '변경 중…';
    const { error } = await db.auth.updateUser({ password: n });
    btn.disabled = false; btn.textContent = '비밀번호 변경';
    if (error) { toast('변경 실패: ' + error.message, 'err'); return; }
    $('#pwForm').reset();
    toast('비밀번호가 변경되었습니다. 다음 로그인부터 적용됩니다.', 'ok');
  });

  // helper: safe attribute value
  function attr(s) { return esc(s).replace(/"/g, '&quot;'); }

  boot();
})();
