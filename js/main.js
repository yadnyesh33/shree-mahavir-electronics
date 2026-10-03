/* ==========================================================================
   Shree Mahavir Electronics — core behaviour
   Preloader · navigation · mobile menu · cursor · testimonials · contact form
   Depends on: gsap, ScrollTrigger, (Swiper on home), animations.js, products.js
   ========================================================================== */
(() => {
  'use strict';

  const root = document.documentElement;
  const SME = (window.SME = window.SME || {});
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---- Contact details: single source of truth (PLACEHOLDERS — replace) ---- */
  const CONTACT = {
    whatsappNumber: '910000000000', // PLACEHOLDER: digits only, with country code
    email: 'info@your-domain.example', // PLACEHOLDER
  };

  /* Safety net: if GSAP failed to load (offline / blocked CDN), show everything. */
  if (!window.gsap || !SME.initAnimations) {
    root.classList.remove('js');
    const pre = $('.preloader');
    if (pre) pre.remove();
    bindBasics();
    return;
  }

  const { gsap } = window;

  /* ------------------------------------------------------------------ Preloader */
  function runPreloader() {
    const pre = $('.preloader');
    if (!pre) return Promise.resolve();
    // Show once per session so repeat visits stay fast.
    let seen = false;
    try { seen = sessionStorage.getItem('sme-preloaded') === '1'; } catch (e) { /* storage blocked */ }
    if (seen || reduced) { pre.remove(); return Promise.resolve(); }

    return new Promise((resolve) => {
      const brand = $('.preloader__brand', pre);
      const sub = $('.preloader__sub', pre);
      const bar = $('.preloader__bar span', pre);
      const count = $('.preloader__count', pre);
      const state = { n: 0 };
      document.body.classList.add('is-locked');
      gsap.set([brand, sub], { yPercent: 110 });
      gsap.timeline({
        onComplete: () => {
          try { sessionStorage.setItem('sme-preloaded', '1'); } catch (e) { /* ignore */ }
          pre.remove();
          document.body.classList.remove('is-locked');
          resolve();
        },
      })
        .to(brand, { yPercent: 0, duration: 0.9, ease: 'expo.out' })
        .to(sub, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, '-=0.65')
        .to(bar, { scaleX: 1, duration: 1.3, ease: 'power2.inOut' }, 0.2)
        .to(state, { n: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { count.textContent = String(Math.round(state.n)).padStart(3, '0'); } }, 0.2)
        .to([brand, sub, '.preloader__bar', count], { autoAlpha: 0, y: -20, duration: 0.5, stagger: 0.05, ease: 'power2.in' }, '+=0.15')
        .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'expo.inOut' }, '-=0.15');
    });
  }

  /* ------------------------------------------------------------------ Navigation */
  function initNav() {
    const nav = $('.nav');
    if (!nav) return;
    ScrollTrigger.create({
      start: 20, end: 'max',
      onUpdate: (self) => nav.classList.toggle('is-scrolled', self.scroll() > 20),
    });
    nav.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  /* Full-screen mobile menu with staggered items */
  function initMenu() {
    const toggle = $('.nav__toggle');
    const menu = $('.menu');
    if (!toggle || !menu) return;
    const items = $$('.menu__item', menu);
    const extras = $$('.menu__foot > *', menu);
    let open = false;

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });
    tl.set(menu, { visibility: 'visible' })
      .to(menu, { clipPath: 'circle(150% at calc(100% - 44px) 42px)', duration: reduced ? 0.01 : 1 })
      .from($$('.menu__link', menu), { yPercent: 110, duration: reduced ? 0.01 : 0.9, stagger: 0.07 }, 0.25)
      .from(extras, { autoAlpha: 0, y: 20, duration: reduced ? 0.01 : 0.7, stagger: 0.08 }, 0.6);
    tl.eventCallback('onReverseComplete', () => { gsap.set(menu, { visibility: 'hidden' }); });

    const setOpen = (v) => {
      open = v;
      toggle.setAttribute('aria-expanded', String(v));
      toggle.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('is-locked', v);
      menu.setAttribute('aria-hidden', String(!v));
      if (v) { tl.timeScale(1).play(); const first = $('a', menu); if (first) setTimeout(() => first.focus({ preventScroll: true }), 400); }
      else { tl.timeScale(1.4).reverse(); toggle.focus({ preventScroll: true }); }
    };
    toggle.addEventListener('click', () => setOpen(!open));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) setOpen(false); });
    // Close when a menu link is used (page transition handles navigation)
    $$('a', menu).forEach((a) => a.addEventListener('click', () => { if (open) document.body.classList.remove('is-locked'); }));
    window.matchMedia('(min-width: 993px)').addEventListener('change', (m) => { if (m.matches && open) setOpen(false); });
    void items;
  }

  /* ------------------------------------------------------------------ Cursor */
  function initCursor() {
    const cursor = $('.cursor');
    if (!cursor || !canHover || reduced || window.innerWidth < 993) return;
    root.classList.add('has-cursor');
    const label = $('.cursor__label', cursor);
    const x = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3.out' });
    const y = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3.out' });
    window.addEventListener('pointermove', (e) => { x(e.clientX); y(e.clientY); }, { passive: true });

    const state = (size, text, bg) => {
      label.textContent = text || '';
      gsap.to(cursor, { width: size, height: size, margin: -size / 2, backgroundColor: bg || 'transparent', duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
      gsap.to(label, { opacity: text ? 1 : 0, duration: 0.25 });
    };
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('[data-cursor], .btn, .tilt-card, .cat, .nav__link, .pcard, a, button');
      if (!t) return state(14);
      const kind = t.dataset.cursor;
      if (kind === 'explore' || t.matches('.tilt-card, .cat, .pcard')) return state(92, 'EXPLORE', '#fff');
      if (kind === 'view' || t.matches('.btn')) return state(78, 'VIEW', '#fff');
      if (t.matches('.nav__link')) return state(34);
      return state(34);
    });
    document.addEventListener('pointerleave', () => state(14));
  }

  /* ------------------------------------------------------------------ Testimonials */
  function initTestimonials() {
    const el = $('.testi__swiper');
    if (!el || !window.Swiper) return;
    const swiper = new Swiper(el, {
      slidesPerView: 1, spaceBetween: 20, speed: 800, grabCursor: true,
      autoplay: reduced ? false : { delay: 5200, disableOnInteraction: false, pauseOnMouseEnter: true },
      navigation: { prevEl: '.testi__prev', nextEl: '.testi__next' },
      pagination: { el: '.testi__pagination', clickable: true },
      a11y: { enabled: true },
      breakpoints: { 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } },
    });
    // Hover pause is built in; also pause when the section is off-screen.
    if (!reduced) {
      ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? swiper.autoplay.start() : swiper.autoplay.stop()) });
    }
  }

  /* ------------------------------------------------------------------ Contact form */
  function initForm() {
    const form = $('#enquiry-form');
    if (!form) return;
    const status = $('.form__status', form);
    const product = $('#f-product', form);
    const message = $('#f-message', form);
    const qp = new URLSearchParams(window.location.search).get('product');
    if (qp) {
      const match = $$('option', product).find((o) => o.value.toLowerCase() === qp.toLowerCase());
      if (match) product.value = match.value;
      else if (message && !message.value) message.value = `I would like to enquire about: ${qp}`;
    }

    const rules = {
      name: (v) => (v.trim().length >= 2 ? '' : 'Please enter your name.'),
      phone: (v) => (/^[+\d][\d\s-]{7,16}$/.test(v.trim()) ? '' : 'Please enter a valid phone number.'),
      email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.'),
    };
    const check = (input) => {
      const rule = rules[input.name]; if (!rule) return true;
      const msg = rule(input.value);
      const err = $(`#${input.id}-error`, form);
      if (err) err.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    $$('input', form).forEach((i) => i.addEventListener('blur', () => check(i)));

    const text = () => {
      const d = new FormData(form);
      return [
        'Enquiry — Shree Mahavir Electronics',
        `Name: ${d.get('name')}`, `Phone: ${d.get('phone')}`,
        d.get('email') ? `Email: ${d.get('email')}` : null,
        `Interested in: ${d.get('product') || 'Not specified'}`,
        d.get('message') ? `Message: ${d.get('message')}` : null,
      ].filter(Boolean).join('\n');
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = $$('input[name]', form).map(check).every(Boolean);
      if (!ok) { status.textContent = 'Please correct the highlighted fields.'; $('[aria-invalid="true"]', form)?.focus(); return; }
      /* No backend is bundled. Until a form endpoint is connected, the enquiry is
         sent through the visitor's email app. Swap this for fetch() to a form service. */
      const href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Website enquiry')}&body=${encodeURIComponent(text())}`;
      status.textContent = 'Opening your email app with the enquiry ready to send…';
      window.location.href = href;
    });

    const wa = $('[data-whatsapp-form]', form);
    if (wa) wa.addEventListener('click', (e) => {
      e.preventDefault();
      window.open(`https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text())}`, '_blank', 'noopener');
    });
  }

  /* Basic behaviours that never depend on GSAP */
  function bindBasics() {
    $$('[data-year]').forEach((n) => { n.textContent = new Date().getFullYear(); });
    const toggle = $('.nav__toggle'); const menu = $('.menu');
    if (toggle && menu && !window.gsap) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!open));
        menu.style.visibility = open ? 'hidden' : 'visible';
        menu.style.clipPath = open ? 'circle(0 at 100% 0)' : 'none';
      });
    }
  }

  /* ------------------------------------------------------------------ Boot */
  async function boot() {
    bindBasics();
    const transition = SME.pageTransition();
    const isHome = !!$('.hero');

    initNav();
    initMenu();
    initCursor();
    initTestimonials();
    initForm();

    if (isHome) await runPreloader(); else transition.enter();

    SME.initAnimations();
    SME.initPinned();
    SME.initTimeline();
    if (isHome) SME.heroIntro();

    // Layout shifts from lazy images / fonts: refresh trigger positions once settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  // Last-resort failsafe: never leave content invisible.
  window.setTimeout(() => {
    if (!SME.initAnimations) root.classList.remove('js');
  }, 5000);
})();
