// SPITE — petty grudge tracker. local-only.
(() => {
  'use strict';

  // ============================================================
  // CONFIG — replace these two values to go live with real Gumroad
  // ============================================================
  // 1) Your Gumroad product permalink. Example: if your buy URL is
  //    https://your-name.gumroad.com/l/spitepro , the permalink is "spitepro".
  //    The buy button below uses this to open the Gumroad overlay/checkout.
  const GUMROAD_PERMALINK = 'spitepro';
  const GUMROAD_BUY_URL = 'https://gumroad.com/l/' + GUMROAD_PERMALINK + '?wanted=true';

  // 2) Your Gumroad PRODUCT ID (uppercase letters/numbers, ~24 chars).
  //    Find it in Gumroad → Products → your product → "Advanced".
  //    Leave EMPTY ('') to run in DEMO mode (accepts SPITE-XXXX-XXXX-XXXX).
  //    Set it to the real product id to verify keys live against Gumroad.
  const GUMROAD_PRODUCT_ID = '';
  // ============================================================

  const STORAGE_KEY = 'spite.v1.grudges';
  const PRO_KEY = 'spite.v1.pro';
  const PRO_LICENSE_KEY = 'spite.v1.license';
  const FREE_LIMIT = 5;

  const CATEGORIES = {
    ex: { label: 'ex', accent: '#ff3b3b' },
    coworker: { label: 'coworker', accent: '#ff7a59' },
    family: { label: 'family', accent: '#d8b676' },
    friend: { label: 'friend', accent: '#9bd07a' },
    stranger: { label: 'stranger', accent: '#7ad0c8' },
    self: { label: 'self', accent: '#a78bfa' },
    institution: { label: 'institution', accent: '#cdcdcd' },
  };

  const SEV_LABELS = {
    1: 'petty', 2: 'annoyed', 3: 'mildly bothered', 4: 'seething', 5: 'nuclear'
  };

  const TOAST_MS = 2200;

  /** State */
  const state = {
    grudges: load(),
    isPro: localStorage.getItem(PRO_KEY) === '1',
    filter: 'all',
    sort: 'streak-desc',
    editingId: null,
    pendingImageDataUrl: null,
    pendingImportData: null,
    lastFocus: null, // element to return focus to when a modal closes
  };

  /** DOM */
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  const grid = $('#grid');
  const empty = $('#empty');
  const stats = $('#stats');

  /** Init */
  function init(){
    $('#yr').textContent = new Date().getFullYear();
    bindEvents();
    if (state.isPro) document.body.classList.add('is-pro');
    render();
    initHeroDeck();
    // Re-verify a stored license against Gumroad on boot, so refunded
    // / disputed purchases revoke Pro the next time the user is online.
    // Silent and non-blocking; offline users keep their cached Pro state.
    revalidateStoredLicense();

    // PWA shortcut: open the new-grudge modal directly when launched
    // from the manifest "New grudge" shortcut (?action=new).
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('action') === 'new') {
        // Defer so the rest of the app finishes mounting first.
        setTimeout(() => openEdit(null), 50);
      }
    } catch { /* ignore */ }
  }

  /** Storage */
  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch { return []; }
  }
  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.grudges));
  }

  /** Helpers */
  function uid(){ return Math.random().toString(36).slice(2, 10); }
  function todayISO(){
    const d = new Date(); d.setHours(0,0,0,0);
    return d.toISOString().slice(0,10);
  }
  function daysSince(iso){
    if (!iso) return 0;
    const start = new Date(iso + 'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    const ms = now - start;
    return Math.max(0, Math.floor(ms / 86400000));
  }
  function formatDate(iso){
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  function escape(s){
    return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function toast(msg){
    const t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { t.hidden = true; }, TOAST_MS);
  }

  /** Filters / sorting */
  function visibleGrudges(){
    const list = state.grudges.filter(g => state.filter === 'all' || g.category === state.filter);
    const cmp = {
      'streak-desc': (a,b) => daysSince(b.since) - daysSince(a.since),
      'streak-asc':  (a,b) => daysSince(a.since) - daysSince(b.since),
      'severity-desc': (a,b) => (b.severity||0) - (a.severity||0) || daysSince(b.since)-daysSince(a.since),
      'created-desc': (a,b) => (b.createdAt||0) - (a.createdAt||0),
    }[state.sort];
    return list.sort(cmp);
  }

  /** Render */
  function render(){
    const visible = visibleGrudges();
    grid.innerHTML = '';
    if (state.grudges.length === 0){
      empty.hidden = false;
      grid.hidden = true;
      stats.hidden = true;
      return;
    }
    empty.hidden = true;
    grid.hidden = false;
    stats.hidden = false;

    visible.forEach(g => grid.appendChild(renderCard(g)));

    const all = state.grudges;
    $('#statTotal').textContent = all.length;
    $('#statDays').textContent = all.reduce((s,g) => s + daysSince(g.since), 0);
    const longest = all.reduce((m,g) => Math.max(m, daysSince(g.since)), 0);
    $('#statLongest').textContent = longest;
    const heinous = [...all].sort((a,b) => (b.severity||0)-(a.severity||0) || daysSince(b.since)-daysSince(a.since))[0];
    $('#statHeinous').textContent = heinous ? truncate(heinous.title, 26) : '—';
  }

  function truncate(s, n){
    s = String(s||''); return s.length > n ? s.slice(0, n-1) + '…' : s;
  }

  function renderCard(g){
    const el = document.createElement('article');
    el.className = 'card';
    el.dataset.id = g.id;
    const days = daysSince(g.since);
    const cat = CATEGORIES[g.category] || CATEGORIES.stranger;
    const sevPips = [1,2,3,4,5].map(n => `<i class="${n <= (g.severity||0) ? 'on' : ''}"></i>`).join('');
    el.innerHTML = `
      <div class="cat"><span class="pip" style="background:${cat.accent}"></span> ${escape(cat.label)}</div>
      <h3>${escape(g.title)}</h3>
      <div class="count">${days}<small>day${days===1?'':'s'}</small></div>
      <div class="since">since ${escape(formatDate(g.since))} · <span class="sev" title="severity: ${SEV_LABELS[g.severity]||''}">${sevPips}</span></div>
      <div class="actions">
        <button class="edit" type="button">edit</button>
        <button class="share" type="button">make receipt →</button>
      </div>
    `;
    el.addEventListener('click', (e) => {
      const t = e.target;
      if (t.matches('.share')) { e.stopPropagation(); openShare(g.id); return; }
      if (t.matches('.edit'))  { e.stopPropagation(); openEdit(g.id); return; }
      openEdit(g.id);
    });
    return el;
  }

  /** Edit modal */
  function openEdit(id){
    state.editingId = id;
    state.pendingImageDataUrl = null;
    const isNew = !id;
    const g = isNew ? null : state.grudges.find(x => x.id === id);
    if (!isNew && !g) return;

    $('#editTitle').textContent = isNew ? 'new grudge' : 'edit grudge';
    $('#fTitle').value = g?.title || '';
    $('#fCategory').value = g?.category || 'coworker';
    $('#fSince').value = g?.since || todayISO();
    $('#fSince').max = todayISO();
    $('#fSeverity').value = g?.severity || 3;
    $('#fNotes').value = g?.notes || '';
    updateSevHint();
    updateNameWarn();
    const prev = $('#imgPreview');
    if (g?.image){ prev.hidden = false; prev.innerHTML = `<img src="${g.image}" alt="screenshot" />`; }
    else { prev.hidden = true; prev.innerHTML = ''; }
    $('#fImage').value = '';
    $('#deleteBtn').hidden = isNew;

    if (isNew && state.grudges.length >= FREE_LIMIT && !state.isPro){
      closeAll();
      openPro('you have hit the free limit (5 grudges). therapy starts at $200/hr; this is $9 once.');
      return;
    }

    show('#editModal');
    setTimeout(() => $('#fTitle').focus(), 30);
  }

  function updateSevHint(){
    const v = +$('#fSeverity').value;
    $('#sevHint').textContent = `${v} — ${SEV_LABELS[v]}`;
  }

  // Common false-positive capitalized tokens we should NOT flag as a name.
  const NAME_STOPWORDS = new Set([
    'I','I\'m','I\'ve','I\'ll','I\'d',
    'I\u2019m','I\u2019ve','I\u2019ll','I\u2019d',
    'Mom','Mum','Mama','Dad','Pa','Papa','Mother','Father','Sister','Brother','Aunt','Uncle','Cousin','Grandma','Grandpa','Nana',
    'HR','VP','CEO','CFO','CTO','CMO','COO','SVP','EVP','PM','PR','IT','OK','TBH','WTF','LOL','NYC','LA','SF','UK','US','USA','EU','BFF','POV','AITA',
    'God','Jesus',
  ]);
  // Detects an @handle, OR two consecutive capitalized words, OR a single
  // standalone capitalized word that isn't a stopword/sentence-start. Used
  // to nudge users away from putting real names in headlines.
  function looksLikeName(s){
    if (!s) return false;
    const txt = String(s);
    if (/(^|\s)@[A-Za-z0-9_]{2,}/.test(txt)) return true;
    const words = txt.split(/[^A-Za-z'\u2019]+/).filter(Boolean);
    let prevWasCap = false, anyLowerSeenBefore = false;
    for (let i = 0; i < words.length; i++){
      const w = words[i];
      const isCap = /^[A-Z][a-z\u2019']+$/.test(w);
      if (isCap && !NAME_STOPWORDS.has(w)){
        // two capitalized in a row (likely first+last)
        if (prevWasCap) return true;
        // single capitalized word mid-sentence (not the first token)
        if (i > 0 && anyLowerSeenBefore) return true;
      }
      prevWasCap = isCap && !NAME_STOPWORDS.has(w);
      if (/^[a-z]/.test(w)) anyLowerSeenBefore = true;
    }
    return false;
  }
  function updateNameWarn(){
    const w = $('#nameWarn');
    if (!w) return;
    w.hidden = !looksLikeName($('#fTitle').value);
  }

  function saveFromForm(e){
    e.preventDefault();
    const data = {
      title: $('#fTitle').value.trim(),
      category: $('#fCategory').value,
      since: $('#fSince').value,
      severity: +$('#fSeverity').value,
      notes: $('#fNotes').value.trim(),
    };
    if (!data.title) return;
    if (!data.since) data.since = todayISO();

    let g;
    if (state.editingId){
      g = state.grudges.find(x => x.id === state.editingId);
      if (!g) return;
      Object.assign(g, data);
    } else {
      g = { id: uid(), createdAt: Date.now(), ...data };
      state.grudges.unshift(g);
    }
    if (state.pendingImageDataUrl) g.image = state.pendingImageDataUrl;
    save();
    render();
    hide('#editModal');
    toast(state.editingId ? 'grudge updated.' : 'grudge filed.');
    state.editingId = null;
    state.pendingImageDataUrl = null;
  }

  function deleteCurrent(){
    if (!state.editingId) return;
    if (!confirm('forgive and delete? this cannot be undone.')) return;
    state.grudges = state.grudges.filter(x => x.id !== state.editingId);
    save();
    render();
    hide('#editModal');
    toast('grudge released.');
    state.editingId = null;
  }

  /** Share / receipt canvas */
  function openShare(id){
    const g = state.grudges.find(x => x.id === id);
    if (!g) return;
    drawReceipt($('#shareCanvas'), g, { full: true });
    show('#shareModal');
    const url = $('#shareCanvas').toDataURL('image/png');
    $('#downloadShare').href = url;
    $('#downloadShare').download = `spite-${slug(g.title)}.png`;
  }

  function slug(s){
    return String(s||'grudge').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
  }

  /**
   * Draw a receipt card onto a canvas.
   * Used both by the share modal (full=true) and the hero deck preview (full=false).
   */
  function drawReceipt(c, g, opts = {}){
    const { full = true } = opts;
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    const cat = CATEGORIES[g.category] || CATEGORIES.stranger;
    const days = daysSince(g.since);
    const scale = W / 1080;
    const F = (n) => Math.round(n * scale); // font scale
    const X = (n) => Math.round(n * scale); // x/y scale

    // background
    const grad = ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0, '#0a0a0a'); grad.addColorStop(1, '#161616');
    ctx.fillStyle = grad; ctx.fillRect(0,0,W,H);

    // accent bar
    ctx.fillStyle = cat.accent;
    ctx.fillRect(0,0,W,X(18));

    // grain dots
    ctx.globalAlpha = 0.05;
    const dotCount = Math.round(600 * (W*H)/(1080*1350));
    for (let i = 0; i < dotCount; i++){
      ctx.fillStyle = '#fff';
      ctx.fillRect(Math.random()*W, Math.random()*H, 1, 1);
    }
    ctx.globalAlpha = 1;

    // brand
    ctx.fillStyle = '#ff3b3b';
    ctx.font = `bold ${F(30)}px ui-monospace, monospace`;
    ctx.fillText('▮', X(60), X(100));
    ctx.fillStyle = '#f4f1ea';
    ctx.font = `italic 700 ${F(44)}px Times`;
    ctx.fillText('SPITE', X(100), X(102));
    ctx.fillStyle = '#8e8a82';
    ctx.font = `${F(14)}px ui-monospace, monospace`;
    ctx.fillText('a petty tracker · spite.lol', X(100), X(128));

    // category label
    ctx.fillStyle = cat.accent;
    ctx.font = `bold ${F(18)}px ui-monospace, monospace`;
    ctx.fillText(cat.label.toUpperCase(), X(60), X(200));
    ctx.strokeStyle = cat.accent;
    ctx.lineWidth = Math.max(1, X(2));
    const labelWidth = ctx.measureText(cat.label.toUpperCase()).width;
    ctx.beginPath(); ctx.moveTo(X(60), X(210)); ctx.lineTo(X(60) + labelWidth, X(210)); ctx.stroke();

    // title (wrap)
    ctx.fillStyle = '#f4f1ea';
    ctx.font = `700 ${F(56)}px Times`;
    wrapText(ctx, g.title, X(60), X(280), W - X(120), F(64), 4);

    // big number
    ctx.fillStyle = '#ff3b3b';
    ctx.font = `700 ${F(360)}px Times`;
    const n = String(days);
    const nw = ctx.measureText(n).width;
    ctx.fillText(n, (W - nw)/2, X(920));

    // "days since"
    ctx.fillStyle = '#8e8a82';
    ctx.font = `700 ${F(28)}px ui-monospace, monospace`;
    const lbl = `DAY${days===1?'':'S'} SINCE ${formatDate(g.since).toUpperCase()}`;
    const lw = ctx.measureText(lbl).width;
    ctx.fillText(lbl, (W - lw)/2, X(970));

    // severity row
    const sevX = X(60), sevY = X(1080);
    ctx.fillStyle = '#8e8a82';
    ctx.font = `${F(14)}px ui-monospace, monospace`;
    ctx.fillText('SEVERITY', sevX, sevY);
    for (let i = 1; i <= 5; i++){
      ctx.fillStyle = i <= (g.severity||0) ? '#ff3b3b' : '#2c2c2c';
      ctx.fillRect(sevX + X(130) + (i-1)*X(22), sevY-X(14), X(16), X(18));
    }
    ctx.fillStyle = '#f4f1ea';
    ctx.font = `${F(14)}px ui-monospace, monospace`;
    ctx.fillText((SEV_LABELS[g.severity]||'').toUpperCase(), sevX + X(250), sevY);

    // dotted line
    ctx.strokeStyle = '#2c2c2c';
    ctx.setLineDash([X(6), X(6)]);
    ctx.beginPath(); ctx.moveTo(X(60), X(1130)); ctx.lineTo(W-X(60), X(1130)); ctx.stroke();
    ctx.setLineDash([]);

    // pull quote
    ctx.fillStyle = '#cfcac0';
    ctx.font = `italic ${F(22)}px Times`;
    const quote = pickQuote(days, g.severity);
    wrapText(ctx, quote, X(60), X(1180), W - X(120), F(30), 3);

    // watermark / footer
    if (full){
      ctx.fillStyle = state.isPro ? '#8e8a82' : '#666';
      ctx.font = `${F(13)}px ui-monospace, monospace`;
      if (!state.isPro) ctx.fillText('made with SPITE · spite.lol · unlock pro to remove watermark', X(60), H - X(36));
      else            ctx.fillText('SPITE · pro', X(60), H - X(36));

      // serial number
      ctx.fillStyle = '#444';
      ctx.font = `${F(13)}px ui-monospace, monospace`;
      const serial = `#${(g.id||'').toUpperCase().padStart(8,'0').slice(0,8)}  ·  ${new Date().toISOString().slice(0,10)}`;
      const sw = ctx.measureText(serial).width;
      ctx.fillText(serial, W - sw - X(60), H - X(36));
    }
  }

  function wrapText(ctx, text, x, y, maxW, lineH, maxLines){
    const words = String(text||'').split(/\s+/);
    let line = '';
    const lines = [];
    for (const w of words){
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line){
        lines.push(line);
        line = w;
        if (lines.length === maxLines - 1) break;
      } else {
        line = test;
      }
    }
    if (line && lines.length < maxLines) lines.push(line);
    const used = lines.join(' ').length;
    if (used < (text||'').length && lines.length){
      let last = lines[lines.length-1];
      while (ctx.measureText(last + '…').width > maxW && last.length){
        last = last.slice(0,-1);
      }
      lines[lines.length-1] = last + '…';
    }
    lines.forEach((l, i) => ctx.fillText(l, x, y + i*lineH));
    return lines.length;
  }

  function pickQuote(days, severity){
    const buckets = [
      [0, "still warm. fresh from the oven of disappointment."],
      [1, "twenty-four hours. you're holding up beautifully."],
      [3, "three days. the body keeps the score."],
      [7, "a week. they have not apologized. neither have you."],
      [30, "a month. an artifact, now."],
      [100, "triple digits. this isn't a grudge, it's a hobby."],
      [365, "a full revolution of the sun, spent unforgiving."],
      [1000, "a millennium of pettiness. canonized."],
    ];
    let pick = buckets[0][1];
    for (const [d, q] of buckets) if (days >= d) pick = q;
    if ((severity||0) >= 5) pick = "nuclear option logged. " + pick;
    return pick;
  }

  /** Modals
   *
   * `show` records the currently focused element so we can restore focus on
   * close (a11y), then sets up a focus-trap inside the modal until it closes.
   */
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let trapHandler = null;

  function show(sel){
    const el = $(sel);
    if (!el) return;
    state.lastFocus = document.activeElement;
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    installFocusTrap(el);
  }

  function hide(sel){
    const el = $(sel);
    if (!el) return;
    el.hidden = true;
    // Only release the body lock if no modals remain open.
    const anyOpen = $$('.modal').some(m => !m.hidden);
    if (!anyOpen) {
      document.body.style.overflow = '';
      removeFocusTrap();
      // Return focus to whatever opened the modal.
      if (state.lastFocus && typeof state.lastFocus.focus === 'function') {
        try { state.lastFocus.focus(); } catch { /* ignore */ }
      }
      state.lastFocus = null;
    } else {
      // Re-arm the trap on whichever modal is still open.
      const stillOpen = $$('.modal').find(m => !m.hidden);
      if (stillOpen) installFocusTrap(stillOpen);
    }
  }

  function closeAll(){ ['#editModal','#shareModal','#proModal','#aboutModal','#keyModal','#importModal'].forEach(hide); }

  function installFocusTrap(modal){
    removeFocusTrap();
    const focusables = $$(FOCUSABLE, modal).filter(el => !el.hasAttribute('hidden') && el.offsetParent !== null);
    if (focusables.length){
      // Focus the first focusable shortly after the modal mounts.
      setTimeout(() => { try { focusables[0].focus({ preventScroll: true }); } catch { /* ignore */ } }, 30);
    }
    trapHandler = (e) => {
      if (e.key !== 'Tab') return;
      const els = $$(FOCUSABLE, modal).filter(el => !el.hasAttribute('hidden') && el.offsetParent !== null);
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', trapHandler);
  }

  function removeFocusTrap(){
    if (trapHandler){ document.removeEventListener('keydown', trapHandler); trapHandler = null; }
  }

  function openPro(){ show('#proModal'); }
  function openKey(){
    $('#fKey').value = '';
    const st = $('#keyStatus');
    st.hidden = true; st.className = 'key-status'; st.textContent = '';
    show('#keyModal');
    setTimeout(() => $('#fKey').focus(), 30);
  }

  /** Image attach */
  function readImage(file){
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  /** ===========================================================
   * Pro unlock — Gumroad license verification
   *
   * If GUMROAD_PRODUCT_ID is set, verifies the license against
   * Gumroad's public verify endpoint:
   *   POST https://api.gumroad.com/v2/licenses/verify
   *   body: product_id=<id>&license_key=<key>&increment_uses_count=false
   * (Gumroad's verify endpoint supports CORS from the browser.)
   *
   * If not set, falls back to a format check so you can ship the UI
   * before you've created the product on Gumroad.
   * =========================================================== */
  async function verifyLicenseKey(rawKey){
    const key = (rawKey || '').trim();
    if (!key) return { ok: false, error: 'no key' };

    // DEMO MODE: format check only
    if (!GUMROAD_PRODUCT_ID){
      const ok = /^SPITE-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i.test(key)
              || key.toUpperCase() === 'SPITE-DEMO-1234-5678';
      return ok
        ? { ok: true, demo: true }
        : { ok: false, error: 'demo: format SPITE-XXXX-XXXX-XXXX (or SPITE-DEMO-1234-5678)' };
    }

    // LIVE MODE: real Gumroad verification
    try {
      const body = new URLSearchParams();
      body.set('product_id', GUMROAD_PRODUCT_ID);
      body.set('license_key', key);
      body.set('increment_uses_count', 'false');
      const res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (data && data.success){
        const refunded = !!(data.purchase && (data.purchase.refunded || data.purchase.disputed || data.purchase.chargebacked));
        if (refunded) return { ok: false, error: 'this purchase was refunded.' };
        return { ok: true, purchase: data.purchase };
      }
      return { ok: false, error: data?.message || 'invalid key.' };
    } catch (e) {
      return { ok: false, error: 'network error verifying key. try again.' };
    }
  }

  function applyPro(licenseKey){
    localStorage.setItem(PRO_KEY, '1');
    if (licenseKey) localStorage.setItem(PRO_LICENSE_KEY, licenseKey);
    state.isPro = true;
    document.body.classList.add('is-pro');
  }

  function revokePro(){
    localStorage.removeItem(PRO_KEY);
    localStorage.removeItem(PRO_LICENSE_KEY);
    state.isPro = false;
    document.body.classList.remove('is-pro');
  }

  /**
   * Re-verify a previously-stored license key against Gumroad. Runs on boot.
   * - If we're in DEMO mode (no GUMROAD_PRODUCT_ID), do nothing.
   * - If the key is still valid: keep Pro on.
   * - If Gumroad reports refunded / disputed / chargebacked: revoke Pro.
   * - On network failure: keep cached Pro state (offline-friendly).
   */
  async function revalidateStoredLicense(){
    if (!GUMROAD_PRODUCT_ID) return;
    if (!state.isPro) return;
    const stored = localStorage.getItem(PRO_LICENSE_KEY);
    if (!stored) return;
    try {
      const body = new URLSearchParams();
      body.set('product_id', GUMROAD_PRODUCT_ID);
      body.set('license_key', stored);
      body.set('increment_uses_count', 'false');
      const res = await fetch('https://api.gumroad.com/v2/licenses/verify', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));
      if (data && data.success){
        const refunded = !!(data.purchase && (data.purchase.refunded || data.purchase.disputed || data.purchase.chargebacked));
        if (refunded){ revokePro(); toast('pro license revoked (refunded).'); }
      } else if (data && data.success === false) {
        // Hard "no" from Gumroad (e.g., key revoked) — revoke locally.
        revokePro();
        toast('pro license could not be verified.');
      }
      // any other shape (network error, unexpected payload): keep cached state.
    } catch { /* offline / network error: keep cached Pro state */ }
  }

  async function submitKeyForm(e){
    e.preventDefault();
    const btn = $('#submitKey');
    const st = $('#keyStatus');
    btn.disabled = true; btn.textContent = 'verifying…';
    const result = await verifyLicenseKey($('#fKey').value);
    btn.disabled = false; btn.textContent = 'unlock';
    if (result.ok){
      applyPro($('#fKey').value.trim());
      st.hidden = false; st.className = 'key-status ok';
      st.textContent = result.demo ? 'demo key accepted. pro unlocked on this device.' : 'verified. pro unlocked, forever.';
      hide('#proModal');
      setTimeout(() => { hide('#keyModal'); toast('pro unlocked. petty forever.'); }, 700);
    } else {
      st.hidden = false; st.className = 'key-status err';
      st.textContent = result.error || 'invalid key.';
    }
  }

  /** Buy button — opens Gumroad in the same flow on every entry point. */
  function openCheckout(){
    window.open(GUMROAD_BUY_URL, '_blank', 'noopener');
    toast('opening checkout…');
  }

  /** Export / import */
  function exportAll(){
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), pro: state.isPro, grudges: state.grudges }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `spite-export-${todayISO()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('exported.');
  }

  /** Coerce an unknown value into a valid grudge, or return null. */
  function normaliseGrudge(g){
    if (!g || typeof g !== 'object') return null;
    const title = String(g.title || '').trim();
    if (!title) return null;
    const category = CATEGORIES[g.category] ? g.category : 'stranger';
    const since = (typeof g.since === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(g.since)) ? g.since : todayISO();
    let severity = parseInt(g.severity, 10);
    if (!Number.isFinite(severity) || severity < 1 || severity > 5) severity = 3;
    const notes = String(g.notes || '');
    const id = (typeof g.id === 'string' && g.id) ? g.id : uid();
    const createdAt = Number.isFinite(g.createdAt) ? g.createdAt : Date.now();
    const out = { id, createdAt, title: title.slice(0, 200), category, since, severity, notes: notes.slice(0, 4000) };
    if (typeof g.image === 'string' && g.image.startsWith('data:image/')) out.image = g.image;
    return out;
  }

  function parseImportPayload(raw){
    let data;
    try { data = JSON.parse(raw); }
    catch { return { ok: false, error: 'not valid json.' }; }

    let arr;
    if (Array.isArray(data)) arr = data;
    else if (Array.isArray(data?.grudges)) arr = data.grudges;
    else return { ok: false, error: "json must be an array or an object with a 'grudges' array." };

    const grudges = arr.map(normaliseGrudge).filter(Boolean);
    if (!grudges.length) return { ok: false, error: 'no valid grudges found in that file.' };
    return { ok: true, grudges };
  }

  function readImportFile(file){
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result || ''));
      r.onerror = () => rej(new Error('could not read file'));
      r.readAsText(file);
    });
  }

  function showImportStatus(msg, kind){
    const st = $('#importStatus');
    if (!st) return;
    st.hidden = false;
    st.className = 'key-status' + (kind ? ' ' + kind : '');
    st.textContent = msg;
  }

  async function submitImportForm(e){
    e.preventDefault();
    let raw = $('#fImportJson').value.trim();
    if (!raw){
      const file = $('#fImportFile').files?.[0];
      if (file) raw = await readImportFile(file).catch(() => '');
    }
    if (!raw){ showImportStatus('paste json or pick a file first.', 'err'); return; }

    const parsed = parseImportPayload(raw);
    if (!parsed.ok){ showImportStatus(parsed.error, 'err'); return; }

    const mode = (document.querySelector('input[name="importMode"]:checked')?.value) || 'merge';
    if (mode === 'replace'){
      if (state.grudges.length && !confirm(`replace ${state.grudges.length} existing grudge(s) with ${parsed.grudges.length} from the file?`)) return;
      state.grudges = parsed.grudges;
    } else {
      // merge: by id, otherwise append.
      const byId = new Map(state.grudges.map(g => [g.id, g]));
      for (const g of parsed.grudges){
        if (byId.has(g.id)) Object.assign(byId.get(g.id), g);
        else { state.grudges.unshift(g); byId.set(g.id, g); }
      }
    }

    // Free-tier cap is enforced at *new entry* time; if the user imports past
    // the cap, we keep the data but visibly hint they need Pro to add more.
    save();
    render();
    hide('#importModal');
    toast(`imported ${parsed.grudges.length} grudge${parsed.grudges.length===1?'':'s'}.`);
    if (!state.isPro && state.grudges.length > FREE_LIMIT){
      setTimeout(() => openPro('imported past the free limit. unlock pro to keep adding.'), 600);
    }
  }

  function openImport(){
    $('#fImportJson').value = '';
    $('#fImportFile').value = '';
    showImportStatus('', '');
    $('#importStatus').hidden = true;
    show('#importModal');
  }

  /** Demo seed */
  function seedDemo(){
    const today = new Date();
    const ago = (d) => { const x = new Date(today); x.setDate(today.getDate() - d); return x.toISOString().slice(0,10); };
    const samples = [
      { title: "that one coworker keeps stealing my labeled yogurt", category: 'coworker', since: ago(12), severity: 4, notes: "It said MINE in sharpie. They knew." },
      { title: "my parent called my career a 'phase' at the holidays", category: 'family', since: ago(149), severity: 3, notes: "I have been doing this for 11 years." },
      { title: "the ex unfollowed me but still watches every story", category: 'ex', since: ago(34), severity: 5, notes: "weird flex but ok" },
      { title: "landlord ignored 3 emails about the radiator", category: 'institution', since: ago(21), severity: 4, notes: "47°F in the kitchen." },
      { title: "said 'you too' to the waiter who said 'enjoy your meal'", category: 'self', since: ago(5), severity: 2, notes: "" },
    ];
    state.grudges = samples.map(s => ({ id: uid(), createdAt: Date.now() - Math.random()*1e8, ...s }));
    save(); render();
    toast('demo grudges loaded.');
  }

  /** =========================================================
   *  Hero receipt deck — rotates 3 sample receipts on the landing page.
   *  Pure illustrative previews; not real grudges.
   * ========================================================= */
  const HERO_SAMPLES = [
    { id: 'a1b2c3d4', title: "that one coworker keeps stealing my labeled yogurt", category: 'coworker', since: 12, severity: 4 },
    { id: 'e5f6g7h8', title: "the ex unfollowed me but still watches every story", category: 'ex', since: 34, severity: 5 },
    { id: 'i9j0k1l2', title: "my parent called my career a 'phase' at the holidays", category: 'family', since: 149, severity: 3 },
    { id: 'm3n4o5p6', title: "group chat planned brunch and 'forgot' to add me", category: 'friend', since: 8, severity: 4 },
    { id: 'q7r8s9t0', title: "landlord ignored three emails about the radiator", category: 'institution', since: 21, severity: 4 },
  ];

  function sampleToGrudge(s){
    const today = new Date();
    const d = new Date(today); d.setDate(today.getDate() - s.since);
    return { id: s.id, title: s.title, category: s.category, since: d.toISOString().slice(0,10), severity: s.severity };
  }

  function initHeroDeck(){
    const canvases = $$('.receipt-mini');
    if (!canvases.length) return;

    // initial draw — front, back-1, back-2
    let order = [0, 1, 2]; // indices into HERO_SAMPLES
    const slots = canvases.sort((a,b) => +a.dataset.mini - +b.dataset.mini);
    // slots[0] is front, slots[1] back-1, slots[2] back-2
    const drawAll = () => {
      slots.forEach((c, idx) => drawReceipt(c, sampleToGrudge(HERO_SAMPLES[order[idx]]), { full: false }));
    };
    drawAll();

    // rotate every 3.2s — front shifts to back-2, back-1 → front, back-2 → back-1
    let next = 3;
    setInterval(() => {
      const newFront = next % HERO_SAMPLES.length;
      next++;
      // visually: animate front out, bring next in
      const front = slots[0];
      const back1 = slots[1];
      front.style.transition = 'transform .35s ease, opacity .35s ease';
      back1.style.transition = 'transform .35s ease, opacity .35s ease';
      front.style.transform = 'rotate(-18deg) translate(-40px, 30px) scale(.96)';
      front.style.opacity = '0';
      setTimeout(() => {
        // shift order
        order = [newFront, order[0], order[1]];
        drawAll();
        // reset transforms (CSS rules will reapply via class)
        front.style.transition = ''; front.style.transform = ''; front.style.opacity = '';
        back1.style.transition = ''; back1.style.transform = '';
      }, 360);
    }, 3400);
  }

  /** Bind */
  function bindEvents(){
    $('#addBtn').addEventListener('click', () => openEdit(null));
    document.addEventListener('click', (e) => {
      if (e.target.id === 'addBtn2') openEdit(null);
      if (e.target.id === 'seedBtn') seedDemo();
      if (e.target.id === 'seedFromHero') { seedDemo(); document.getElementById('tracker')?.scrollIntoView({behavior:'smooth'}); }
      if (e.target.id === 'proLink'){ e.preventDefault(); openPro(); }
    });

    $$('.chip').forEach(b => b.addEventListener('click', () => {
      $$('.chip').forEach(x => x.classList.remove('chip-active'));
      b.classList.add('chip-active');
      state.filter = b.dataset.filter;
      render();
    }));
    $('#sortSel').addEventListener('change', e => { state.sort = e.target.value; render(); });

    $('#editForm').addEventListener('submit', saveFromForm);
    $('#cancelEdit').addEventListener('click', () => hide('#editModal'));
    $('#closeEdit').addEventListener('click', () => hide('#editModal'));
    $('#deleteBtn').addEventListener('click', deleteCurrent);
    $('#fSeverity').addEventListener('input', updateSevHint);
    $('#fTitle').addEventListener('input', updateNameWarn);
    $('#fImage').addEventListener('change', async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const url = await readImage(f);
      state.pendingImageDataUrl = url;
      const prev = $('#imgPreview'); prev.hidden = false; prev.innerHTML = `<img src="${url}" alt="" />`;
    });

    $('#closeShare').addEventListener('click', () => hide('#shareModal'));
    $('#copyShare').addEventListener('click', async () => {
      try{
        const c = $('#shareCanvas');
        c.toBlob(async (blob) => {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          toast('image copied.');
        });
      } catch { toast('copy not supported. use download.'); }
    });

    // Pro / checkout / license
    $('#proBtn').addEventListener('click', () => openPro());
    $('#closePro').addEventListener('click', () => hide('#proModal'));
    $('#buyProBtn').addEventListener('click', openCheckout);
    $('#havekeyBtn').addEventListener('click', () => { hide('#proModal'); openKey(); });
    $('#buyProBtnHero').addEventListener('click', openCheckout);
    $('#havekeyBtnHero').addEventListener('click', openKey);
    $('#closeKey').addEventListener('click', () => hide('#keyModal'));
    $('#cancelKey').addEventListener('click', () => hide('#keyModal'));
    $('#keyForm').addEventListener('submit', submitKeyForm);

    $('#aboutBtn').addEventListener('click', () => show('#aboutModal'));
    $('#closeAbout').addEventListener('click', () => hide('#aboutModal'));
    $('#exportBtn').addEventListener('click', exportAll);

    // Import
    const importLink = $('#importLink');
    if (importLink) importLink.addEventListener('click', (e) => { e.preventDefault(); openImport(); });
    $('#closeImport')?.addEventListener('click', () => hide('#importModal'));
    $('#cancelImport')?.addEventListener('click', () => hide('#importModal'));
    $('#importForm')?.addEventListener('submit', submitImportForm);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAll();
      if (e.key === 'n' && !$('input:focus, textarea:focus, select:focus') && !document.querySelector('.modal:not([hidden])')) {
        openEdit(null);
      }
    });

    document.addEventListener('click', (e) => {
      const m = e.target.closest('.modal');
      if (m && e.target === m) closeAll();
    });
  }

  init();
})();
