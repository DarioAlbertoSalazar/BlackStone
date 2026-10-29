/* Blackstone — main.js
   Se carga con defer en todas las páginas. Cada módulo comprueba que sus
   elementos existan, así el mismo archivo sirve para index, aviso y 404. */
(() => {
'use strict';
const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
const C = window.BLACKSTONE || {};
const isSet = v => typeof v === 'string' && v.trim() !== '' && !v.includes('{{');
const body = document.body;
const mq = matchMedia('(prefers-reduced-motion: reduce)');
let reduce = mq.matches;
const onMotionPref = e => { reduce = e.matches; resetMotion(); restartAuto(); syncPauseBtn(); };
if (mq.addEventListener) mq.addEventListener('change', onMotionPref); else if (mq.addListener) mq.addListener(onMotionPref);
requestAnimationFrame(() => requestAnimationFrame(() => body.classList.add('loaded')));
$$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ── Google Analytics 4: carga diferida (después de load + tiempo ocioso) ── */
window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
const ga = isSet(C.ga4Id);
if (ga) {
  gtag('js', new Date());
  gtag('config', C.ga4Id);
  const loadGA = () => {
    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.ga4Id);
    document.head.appendChild(s);
  };
  const idle = () => ('requestIdleCallback' in window) ? requestIdleCallback(loadGA, { timeout: 4000 }) : setTimeout(loadGA, 2000);
  if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
}
/* Los eventos se encolan en dataLayer aunque gtag.js aún no termine de cargar. */
const track = (name, params) => { if (ga) gtag('event', name, params || {}); };
/* Conversiones: clic en teléfono, WhatsApp y correo (marcarlas como eventos clave en GA4) */
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href]');
  if (!a) return;
  const h = a.getAttribute('href') || '';
  const loc = (a.closest('[data-loc]') || {}).dataset?.loc || 'pagina';
  if (h.startsWith('tel:')) track('phone_click', { link_location: loc });
  else if (/wa\.me|api\.whatsapp\.com/.test(h)) track('whatsapp_click', { link_location: loc });
  else if (h.startsWith('mailto:')) track('email_click', { link_location: loc });
});

/* ── Navegación y menú móvil ── */
const nav = $('.site-nav'), burger = $('.burger'), menu = $('#menu');
const setMenu = o => {
  if (!burger || !menu) return;
  body.classList.toggle('menu-open', o);
  burger.setAttribute('aria-expanded', o);
  burger.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú');
  menu.setAttribute('aria-hidden', !o);
  menu.inert = !o; /* el menú cerrado no recibe foco con Tab */
  tick();
};
if (burger && menu) {
  menu.inert = true;
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('resize', () => { if (innerWidth >= 1080) setMenu(false); });
}

/* enlace activo */
const navLinks = $$('.nav-links a');
if (navLinks.length) {
  const sio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => sio.observe(s));
}

/* ── Revelado al entrar en pantalla ── */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { rootMargin: '0px 0px -10% 0px', threshold: .01 });
$$('.rv').forEach(el => io.observe(el));
/* Las imágenes .mask arrancan con clip-path: inset(100% …). Chrome (≥ v14x) no
   reporta intersección de un elemento recortado al 100 % por su propio clip-path,
   así que nunca se revelaban. Se observa el contenedor (sin recorte) y se activa
   la máscara: mismo efecto visual, ahora funciona en todos los navegadores. */
const maskOf = new Map();
const mio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { maskOf.get(e.target).classList.add('in'); mio.unobserve(e.target); }
}), { rootMargin: '0px 0px -10% 0px', threshold: .01 });
$$('.mask').forEach(el => { const w = el.parentElement; maskOf.set(w, el); mio.observe(w); });

/* ── Contadores ── */
const fmt = n => Math.round(n).toLocaleString('es-MX');
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  cio.unobserve(e.target);
  const el = e.target, to = +el.dataset.count;
  if (reduce) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), d = 1800;
  const step = t => { const k = Math.min((t - t0) / d, 1); el.textContent = fmt(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
  el.textContent = '0';
  requestAnimationFrame(step);
}), { threshold: .6 });
$$('[data-count]').forEach(el => cio.observe(el));

/* ── Efectos ligados al scroll: estado del nav, zoom del hero, parallax,
      línea del proceso y CTA móvil. Un solo requestAnimationFrame por cuadro;
      primero se LEE el layout y después se ESCRIBEN los transform (sin
      "layout thrashing"). El parallax solo calcula los elementos visibles. ── */
const heroImg = $('.hero-media img'), heroInner = $('.hero-inner');
const par = $$('[data-parallax]').map(el => ({ el, img: el.querySelector('img'), vis: false }));
if (par.length) {
  const pio = new IntersectionObserver(es => es.forEach(e => {
    const p = par.find(x => x.el === e.target);
    if (p) p.vis = e.isIntersecting;
  }), { rootMargin: '80px 0px' });
  par.forEach(p => pio.observe(p.el));
}
const steps = $('.steps'), stepEls = $$('.step'), fill = $('.track');
const mcta = $('.mcta'), cita = $('#cita');
let citaVis = false;
if (cita) new IntersectionObserver(es => { citaVis = es[0].isIntersecting; tick(); }, { rootMargin: '0px 0px -20% 0px' }).observe(cita);
function resetMotion() {
  if (!reduce) return;
  if (heroImg) heroImg.style.transform = '';
  if (heroInner) { heroInner.style.transform = ''; heroInner.style.opacity = ''; }
  par.forEach(p => { if (p.img) p.img.style.transform = ''; });
  tick();
}
let raf = 0;
function tick() { if (!raf) raf = requestAnimationFrame(frame); }
function frame() {
  raf = 0;
  const y = scrollY, vh = innerHeight, wide = innerWidth >= 1080;
  /* lecturas */
  const rects = reduce ? [] : par.filter(p => p.vis && p.img).map(p => [p, p.el.getBoundingClientRect()]);
  const s = steps ? steps.getBoundingClientRect() : null;
  const tops = steps && !wide ? stepEls.map(st => st.offsetTop) : null;
  /* escrituras */
  if (nav) nav.classList.toggle('scrolled', y > 24);
  if (!reduce) {
    if (heroImg && heroInner && y < vh * 1.3) {
      const p = Math.min(y / vh, 1.3);
      heroImg.style.transform = `translate3d(0,${(p * vh * .28).toFixed(1)}px,0) scale(${(1 + p * .16).toFixed(4)})`;
      heroInner.style.transform = `translate3d(0,${(-p * 70).toFixed(1)}px,0)`;
      heroInner.style.opacity = Math.max(0, 1 - p * 1.1).toFixed(3);
    }
    for (const [p, r] of rects) {
      const k = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      p.img.style.transform = `translate3d(0,${(k * r.height * .085).toFixed(1)}px,0)`;
    }
  }
  if (s && fill) {
    let pr = wide ? (vh * .85 - s.top) / (vh * .5) : (vh * .7 - s.top) / s.height;
    pr = Math.max(0, Math.min(1, pr));
    if (reduce && s.top < vh) pr = 1;
    fill.style.setProperty('--p', pr.toFixed(3));
    stepEls.forEach((st, i) => st.classList.toggle('on', wide ? pr >= i / stepEls.length + .02 : tops[i] / s.height <= pr + .02));
  }
  if (mcta) mcta.classList.toggle('show', y > vh * .7 && !citaVis && !body.classList.contains('menu-open'));
}
addEventListener('scroll', tick, { passive: true });
addEventListener('resize', tick);
frame();

/* ── Testimonios: avance automático con pausa (hover, foco o botón) ── */
const tst = $('.tst'), slides = $$('.t-slide'), barsB = $$('.t-bars button'), cnt = $('.t-count b');
const stage = $('.t-stage'), pauseBtn = $('.t-pause');
const DUR = 7000;
let ti = 0, timer = 0, hoverP = false, focusP = false, userP = false;
const isPaused = () => hoverP || focusP || userP;
function show(i, byUser) {
  if (!slides.length) return;
  ti = (i + slides.length) % slides.length;
  /* solo se anuncia en lectores de pantalla cuando la persona cambia de testimonio */
  if (stage) stage.setAttribute('aria-live', byUser ? 'polite' : 'off');
  slides.forEach((s, k) => { s.classList.toggle('on', k === ti); s.setAttribute('aria-hidden', k !== ti); });
  barsB.forEach((b, k) => { b.classList.remove('on'); b.classList.toggle('done', k < ti); b.setAttribute('aria-current', k === ti ? 'true' : 'false'); void b.offsetWidth; if (k === ti) b.classList.add('on'); });
  if (cnt) cnt.textContent = String(ti + 1).padStart(2, '0');
  restartAuto();
}
function restartAuto() {
  clearTimeout(timer);
  if (!tst || reduce || isPaused()) return;
  timer = setTimeout(() => show(ti + 1), DUR);
}
function syncPause() {
  if (!tst) return;
  const p = isPaused();
  tst.classList.toggle('paused', p);
  if (p) clearTimeout(timer);
  else if (barsB[ti]) { barsB[ti].classList.remove('on'); void barsB[ti].offsetWidth; barsB[ti].classList.add('on'); restartAuto(); }
}
function syncPauseBtn() {
  if (!pauseBtn) return;
  pauseBtn.hidden = reduce;
  pauseBtn.setAttribute('aria-pressed', userP);
  pauseBtn.setAttribute('aria-label', userP ? 'Reanudar testimonios' : 'Pausar testimonios');
  const u = pauseBtn.querySelector('use');
  if (u) u.setAttribute('href', userP ? '#i-play' : '#i-pause');
}
if (tst && slides.length) {
  tst.style.setProperty('--dur', DUR + 'ms');
  $('.t-prev').addEventListener('click', () => show(ti - 1, true));
  $('.t-next').addEventListener('click', () => show(ti + 1, true));
  barsB.forEach((b, k) => b.addEventListener('click', () => show(k, true)));
  if (pauseBtn) pauseBtn.addEventListener('click', () => { userP = !userP; syncPauseBtn(); syncPause(); });
  tst.addEventListener('mouseenter', () => { hoverP = true; syncPause(); });
  tst.addEventListener('mouseleave', () => { hoverP = false; syncPause(); });
  tst.addEventListener('focusin', () => { focusP = true; syncPause(); });
  tst.addEventListener('focusout', e => { if (!tst.contains(e.relatedTarget)) { focusP = false; syncPause(); } });
  tst.addEventListener('keydown', e => { if (e.key === 'ArrowRight') show(ti + 1, true); if (e.key === 'ArrowLeft') show(ti - 1, true); });
  let sx = null;
  tst.addEventListener('pointerdown', e => { sx = e.clientX; });
  tst.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) show(ti + (dx < 0 ? 1 : -1), true); });
  new IntersectionObserver(es => { if (es[0].isIntersecting && !timer) show(ti); }, { threshold: .3 }).observe(tst);
  syncPauseBtn();
}

/* ── Calendario y horarios ── */
const calGrid = $('.cal-grid');
let sel = null, selT = null, renderCal = () => {}, renderSlots = () => {}, renderSum = () => {};
const longD = d => { const s = d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }); return s[0].toUpperCase() + s.slice(1); };
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
if (calGrid) {
  const calTitle = $('.cal-title'), prevM = $('.cal-prev'), nextM = $('.cal-next'), slotsEl = $('.slots'), sum = $('.when-sum');
  const fFecha = $('#f-fecha'), fHora = $('#f-hora');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const minD = new Date(today); minD.setDate(minD.getDate() + 1);
  const maxD = new Date(today); maxD.setMonth(maxD.getMonth() + 3);
  let view = new Date(minD.getFullYear(), minD.getMonth(), 1);
  const WEEK = ['09:00', '10:30', '12:00', '13:30', '16:00', '17:30'], SAT = ['10:00', '11:30'];
  const DEF = 'Lunes a viernes de 9:00 a 18:00 h · sábados de 10:00 a 13:00 h.';
  renderCal = () => {
    calTitle.textContent = view.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
    const parts = ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => `<span class="cal-dow" aria-hidden="true">${d}</span>`);
    const off = (view.getDay() + 6) % 7, days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let i = 0; i < off; i++) parts.push('<span></span>');
    for (let d = 1; d <= days; d++) {
      const dt = new Date(view.getFullYear(), view.getMonth(), d);
      const dis = dt < minD || dt > maxD || dt.getDay() === 0;
      const on = sel && iso(sel) === iso(dt);
      parts.push(`<button type="button" data-d="${iso(dt)}" ${dis ? 'disabled' : ''} aria-pressed="${!!on}" class="${iso(dt) === iso(today) ? 'today' : ''}" aria-label="${longD(dt)}${dis ? ', no disponible' : ''}">${d}</button>`);
    }
    calGrid.innerHTML = parts.join('');
    prevM.disabled = view <= new Date(minD.getFullYear(), minD.getMonth(), 1);
    nextM.disabled = view >= new Date(maxD.getFullYear(), maxD.getMonth(), 1);
  };
  renderSlots = () => {
    if (!sel) { slotsEl.innerHTML = '<p class="hint">Elija primero una fecha.</p>' + WEEK.map(t => `<button type="button" disabled>${t}</button>`).join(''); return; }
    const list = sel.getDay() === 6 ? SAT : WEEK;
    if (selT && !list.includes(selT)) { selT = null; fHora.value = ''; }
    slotsEl.innerHTML = list.map(t => `<button type="button" data-t="${t}" aria-pressed="${t === selT}">${t} h</button>`).join('');
  };
  renderSum = () => { sum.innerHTML = sel ? `<b>${longD(sel)}</b>${selT ? ` · <b>${selT} h</b>` : ' · elija un horario'}` : DEF; };
  calGrid.addEventListener('click', e => {
    const b = e.target.closest('button[data-d]'); if (!b || b.disabled) return;
    const [y, m, d] = b.dataset.d.split('-').map(Number);
    sel = new Date(y, m - 1, d); fFecha.value = b.dataset.d;
    renderCal(); renderSlots(); renderSum();
    calGrid.querySelector(`[data-d="${b.dataset.d}"]`).focus();
    revalidate('fecha'); revalidate('hora');
  });
  slotsEl.addEventListener('click', e => {
    const b = e.target.closest('button[data-t]'); if (!b) return;
    selT = b.dataset.t; fHora.value = selT;
    renderSlots(); renderSum();
    slotsEl.querySelector(`[data-t="${selT}"]`).focus();
    revalidate('hora');
  });
  prevM.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); });
  nextM.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); });
  renderCal(); renderSlots();
}

/* ── Formulario de citas: validación, anti-spam y envío a FORM_ENDPOINT (config.js) ── */
const form = $('#form');
const touched = new Set();
let revalidate = () => {};
if (form) {
  const confirmEl = $('#confirm'), alertEl = $('.form-alert'), hp = $('#f-web');
  const ALERT_DEF = 'Revise los campos marcados para continuar.';
  const t0 = Date.now();
  const v = id => ($('#f-' + id).value || '').trim();
  const rules = {
    nombre: () => v('nombre').length >= 3 && /\s/.test(v('nombre')),
    correo: () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('correo')),
    telefono: () => { const d = v('telefono').replace(/\D/g, ''); return d.length === 10 || (d.length === 12 && d.startsWith('52')); },
    tipo: () => !!v('tipo'),
    ubicacion: () => v('ubicacion').length >= 3,
    superficie: () => { const n = +v('superficie'); return n >= 10 && n <= 1e6; },
    presupuesto: () => !!v('presupuesto'),
    fecha: () => !!v('fecha'),
    hora: () => !!v('hora'),
    privacidad: () => $('#f-privacidad').checked
  };
  const check = k => {
    const ok = rules[k]();
    const f = $(`[data-f="${k}"]`), e = $('#e-' + k), inp = $('#f-' + k);
    f.classList.toggle('bad', !ok); e.classList.toggle('show', !ok);
    if (inp && inp.type !== 'hidden') inp.setAttribute('aria-invalid', !ok);
    return ok;
  };
  revalidate = k => { if (touched.has(k)) { check(k); if (!$$('.bad', form).length) alertEl.hidden = true; } };
  Object.keys(rules).forEach(k => {
    const inp = $('#f-' + k);
    if (!inp || inp.type === 'hidden') return;
    inp.addEventListener('blur', () => { if (inp.value !== '' || touched.has(k)) { touched.add(k); check(k); } });
    const ev = inp.tagName === 'SELECT' || inp.type === 'checkbox' ? 'change' : 'input';
    inp.addEventListener(ev, () => { if (ev === 'change') touched.add(k); revalidate(k); });
  });
  const btn = form.querySelector('[type=submit]');
  const busy = on => {
    if (on) btn.setAttribute('aria-busy', 'true'); else btn.removeAttribute('aria-busy');
    btn.querySelector('.lbl-t').textContent = on ? 'Enviando…' : 'Solicitar cita';
  };
  const showConfirm = () => {
    const out = {
      nombre: v('nombre').split(/\s+/)[0], correo: v('correo'), fecha: sel ? longD(sel) : '', hora: selT ? selT + ' h' : '',
      tipo: v('tipo'), ubicacion: v('ubicacion'), superficie: (+v('superficie')).toLocaleString('es-MX') + ' m²'
    };
    $$('[data-out]', confirmEl).forEach(el => { el.textContent = out[el.dataset.out]; });
    form.hidden = true; confirmEl.hidden = false;
    confirmEl.classList.remove('in'); confirmEl.classList.add('rv');
    requestAnimationFrame(() => requestAnimationFrame(() => confirmEl.classList.add('in')));
    const panel = $('.cita-panel');
    window.scrollTo({ top: panel.getBoundingClientRect().top + scrollY - 110, behavior: reduce ? 'auto' : 'smooth' });
    confirmEl.focus({ preventScroll: true });
  };
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let first = null;
    Object.keys(rules).forEach(k => { touched.add(k); if (!check(k) && !first) first = k; });
    if (first) {
      alertEl.textContent = ALERT_DEF; alertEl.hidden = false;
      const t = first === 'fecha' ? calGrid.querySelector('button:not(:disabled)') : first === 'hora' ? $('.slots button') : $('#f-' + first);
      const f = $(`[data-f="${first}"]`);
      window.scrollTo({ top: f.getBoundingClientRect().top + scrollY - 120, behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(() => t && t.focus({ preventScroll: true }), reduce ? 0 : 400);
      return;
    }
    alertEl.hidden = true;
    /* Anti-spam: campo trampa lleno o envío en menos de 3 s => bot. Se finge éxito y no se envía nada. */
    if ((hp && hp.value) || Date.now() - t0 < 3000) { showConfirm(); return; }
    busy(true);
    const fd = new FormData(form);
    fd.set('fecha_legible', longD(sel));
    fd.set('privacidad', 'Aceptó el aviso de privacidad');
    fd.set('_replyto', v('correo'));
    fd.set('_subject', 'Nueva solicitud de cita: ' + v('nombre'));
    const endpoint = isSet(C.formEndpoint) ? C.formEndpoint : form.getAttribute('action');
    try {
      if (!isSet(endpoint)) {
        console.warn('[Blackstone] FORM_ENDPOINT sin configurar: el envío se simuló y no se mandó ningún dato.');
        await new Promise(r => setTimeout(r, 900));
      } else {
        const res = await fetch(endpoint, { method: 'POST', body: fd, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        /* Conversión principal. Sin datos personales: GA4 no permite enviar PII. */
        track('generate_lead', { form_name: 'cita', project_type: v('tipo'), budget_range: v('presupuesto') });
      }
      showConfirm();
    } catch (err) {
      console.error('[Blackstone] Error al enviar el formulario:', err);
      alertEl.textContent = 'No se pudo enviar su solicitud. Intente de nuevo en unos minutos' +
        (isSet(C.correo) ? ' o escríbanos a ' + C.correo + '.' : '.');
      alertEl.hidden = false;
    } finally {
      busy(false);
    }
  });
  $('#again').addEventListener('click', () => {
    form.reset(); sel = null; selT = null; $('#f-fecha').value = ''; $('#f-hora').value = ''; touched.clear();
    $$('.bad', form).forEach(f => f.classList.remove('bad'));
    $$('.err.show', form).forEach(f => f.classList.remove('show'));
    $$('[aria-invalid]', form).forEach(f => f.removeAttribute('aria-invalid'));
    renderCal(); renderSlots(); renderSum();
    confirmEl.hidden = true; form.hidden = false; $('#f-nombre').focus();
  });
}

/* ── Aviso de privacidad simplificado (diálogo) ── */
const dlg = $('#privacidad');
let lastFocus = null;
if (dlg) {
  const openD = e => { if (e) e.preventDefault(); lastFocus = document.activeElement; dlg.hidden = false; dlg.querySelector('[data-close]').focus(); };
  const closeD = () => { dlg.hidden = true; if (lastFocus) lastFocus.focus(); };
  $$('[data-privacy]').forEach(b => b.addEventListener('click', openD));
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) closeD(); });
  /* mantiene el foco dentro del diálogo mientras está abierto */
  dlg.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = $$('a[href],button:not([disabled])', dlg);
    const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !dlg.hidden) closeD(); });
}
addEventListener('keydown', e => {
  if (e.key === 'Escape' && body.classList.contains('menu-open') && (!dlg || dlg.hidden)) { setMenu(false); burger.focus(); }
});
})();
