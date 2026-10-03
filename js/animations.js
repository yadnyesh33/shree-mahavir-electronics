/* ==========================================================================
   Shree Mahavir Electronics — GSAP animation system
   Reusable, data-attribute driven. Loaded after gsap + ScrollTrigger.

   Data attributes
     data-animation="fade-up | fade-in | reveal | scale | parallax | image-reveal"
     data-split="chars | words"      (with reveal)
     data-delay="0.2"                (seconds)
     data-speed="0.15"               (parallax strength)
     data-counter="15" data-suffix="+" data-decimals="1"
     data-tilt                       (3D tilt card; child [data-tilt-img] floats)
   ========================================================================== */
(() => {
  'use strict';

  const SME = (window.SME = window.SME || {});
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  SME.reduced = reduced;
  SME.canHover = canHover;

  if (!window.gsap) return; // main.js removes the .js class so content stays visible
  gsap.registerPlugin(ScrollTrigger);
  gsap.defaults({ ease: 'power3.out' });
  ScrollTrigger.config({ ignoreMobileResize: true });

  const delayOf = (el) => parseFloat(el.dataset.delay || 0);

  /* ---------------------------------------------------------------------
     Lightweight SplitText replacement. Wraps words (and optionally chars)
     in masks so they can slide up from behind a clipping edge.
     Preserves <br> and inline elements such as <em>.
     --------------------------------------------------------------------- */
  function splitText(el, mode = 'words') {
    if (el._split) return el._split;
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', label);
    const targets = [];

    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const word = document.createElement('span');
            word.className = 'split__word';
            word.setAttribute('aria-hidden', 'true');
            const inner = document.createElement('span');
            inner.className = 'split__inner';
            if (mode === 'chars') {
              Array.from(part).forEach((ch) => {
                const c = document.createElement('span');
                c.className = 'split__char';
                c.textContent = ch;
                inner.appendChild(c);
                targets.push(c);
              });
            } else {
              inner.textContent = part;
              targets.push(inner);
            }
            word.appendChild(inner);
            frag.appendChild(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    };
    walk(el);
    el._split = targets;
    return targets;
  }

  /* ---------------------------------------------------------------------
     Reusable effects
     --------------------------------------------------------------------- */
  function revealText(el, opts = {}) {
    const targets = splitText(el, el.dataset.split || opts.mode || 'words');
    gsap.set(el, { autoAlpha: 1 });
    const vars = {
      yPercent: 115, duration: 1.1, ease: 'power4.out',
      stagger: targets.length > 40 ? 0.012 : 0.05, delay: delayOf(el),
    };
    if (opts.trigger === false) return gsap.from(targets, vars);
    return gsap.from(targets, { ...vars, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  }

  function revealImage(el) {
    // el = wrapper; first <img>/<svg> inside gets a counter-scale
    const media = el.querySelector('img, svg');
    gsap.set(el, { autoAlpha: 1 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true }, delay: delayOf(el) });
    tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out' });
    if (media) tl.fromTo(media, { scale: 1.3 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0);
    return tl;
  }

  function fadeUp(els, opts = {}) {
    return ScrollTrigger.batch(els, {
      start: opts.start || 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', overwrite: true }),
    });
  }

  function fadeIn(els) {
    return ScrollTrigger.batch(els, {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, duration: 1.2, stagger: 0.1, ease: 'power2.out', overwrite: true }),
    });
  }

  function scaleReveal(el) {
    gsap.set(el, { autoAlpha: 0, scale: 0.88 });
    return gsap.to(el, {
      autoAlpha: 1, scale: 1, duration: 1.4, ease: 'expo.out', delay: delayOf(el),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  }

  function parallaxImage(el) {
    const speed = parseFloat(el.dataset.speed || 0.15);
    gsap.set(el, { autoAlpha: 1 });
    return gsap.fromTo(el, { yPercent: -speed * 100 }, {
      yPercent: speed * 100, ease: 'none',
      scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  /* 3D tilt toward the cursor. Skipped for touch + reduced motion. */
  function cardTilt(card, { max = 9, lift = 18 } = {}) {
    if (!canHover || reduced) return;
    const img = card.querySelector('[data-tilt-img]');
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
    const ix = img && gsap.quickTo(img, 'x', { duration: 0.7, ease: 'power3.out' });
    const iy = img && gsap.quickTo(img, 'y', { duration: 0.7, ease: 'power3.out' });
    gsap.set(card, { transformPerspective: 1000 });

    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * max); ry(px * max);
      if (img) { ix(px * lift * 1.4); iy(py * lift); } // product drifts toward cursor
      card.style.setProperty('--mx', `${(px + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(py + 0.5) * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      rx(0); ry(0);
      if (img) { ix(0); iy(0); }
    });
  }

  /* Horizontal pinned scroll. Returns true if the pinned layout was activated. */
  function horizontalScroll(section) {
    const track = section.querySelector('.hscroll__track');
    const panels = $$('.hpanel', section);
    const bar = section.querySelector('.features__bar span');
    if (!track || !panels.length) return false;

    section.classList.add('is-pinned');
    panels[0].classList.add('is-active');
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 40);

    gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: section, pin: true, scrub: 0.6, start: 'top top',
        end: () => `+=${dist() + window.innerHeight * 0.4}`,
        invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => {
          if (bar) gsap.set(bar, { scaleX: self.progress });
          const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length * 0.999));
          panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
        },
      },
    });
    return true;
  }

  /* Cinematic pinned sequence: TV → Refrigerator → Washer → AC */
  function cinematicSequence(section) {
    const items = $$('.cinema__item', section);
    if (items.length < 2) return false;
    const nameEl = section.querySelector('[data-cinema-name]');
    const countEl = section.querySelector('[data-cinema-count]');
    const bar = section.querySelector('.cinema__progress span');

    section.classList.add('is-pinned');
    const captions = items.map((it) => it.querySelector('.cinema__caption'));
    gsap.set(items, { autoAlpha: 0 });
    gsap.set(items[0], { autoAlpha: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: section, pin: true, scrub: 0.8, start: 'top top',
        end: () => `+=${items.length * 90}%`, anticipatePin: 1,
        onUpdate: (self) => {
          const idx = Math.min(items.length - 1, Math.floor(self.progress * items.length * 0.999));
          if (section._idx !== idx) {
            section._idx = idx;
            if (nameEl) nameEl.textContent = items[idx].dataset.name;
            if (countEl) countEl.textContent = `0${idx + 1} / 0${items.length}`;
          }
          if (bar) gsap.set(bar, { scaleX: self.progress });
        },
      },
    });

    items.forEach((item, i) => {
      const img = item.querySelector('img');
      const cap = captions[i];
      if (i === 0) {
        tl.fromTo(cap, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.4 }, 0);
      } else {
        // entrance: scale, x, rotation, blur, mask
        tl.fromTo(item, { autoAlpha: 0, scale: 0.82, xPercent: 14, rotateY: -22, filter: 'blur(14px)' },
          { autoAlpha: 1, scale: 1, xPercent: 0, rotateY: 0, filter: 'blur(0px)', duration: 1 }, '>-0.1');
        tl.fromTo(cap, { clipPath: 'inset(0 0 100% 0)', y: 24 }, { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.6 }, '<0.3');
      }
      if (img) tl.fromTo(img, { yPercent: 6 }, { yPercent: -4, duration: 1.4, ease: 'none' }, '<');
      tl.to({}, { duration: 0.5 }); // hold
      if (i < items.length - 1) {
        tl.to(item, { autoAlpha: 0, scale: 1.12, xPercent: -14, rotateY: 22, filter: 'blur(14px)', duration: 1 });
      }
    });
    return true;
  }

  function counterAnimation(el) {
    const target = parseFloat(el.dataset.counter);
    const decimals = parseInt(el.dataset.decimals || 0, 10);
    const suffix = el.dataset.suffix || '';
    const render = (v) => { el.textContent = v.toFixed(decimals) + suffix; };
    if (reduced) { render(target); return; }
    const state = { v: 0 };
    render(0);
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(state, { v: target, duration: 2.2, ease: 'power3.out', onUpdate: () => render(state.v) }),
    });
  }

  /* Page transition — dark overlay with clip-path reveal. Fast, keeps native
     behaviour for modifier-clicks, new tabs, hashes and external links. */
  function pageTransition() {
    const overlay = document.querySelector('.pt');
    if (!overlay) return { enter: () => {} };
    const mark = overlay.querySelector('.pt__mark');
    const enter = () => {
      if (reduced) return;
      gsap.set(overlay, { clipPath: 'inset(0% 0 0 0)' });
      gsap.to(overlay, { clipPath: 'inset(0% 0 100% 0)', duration: 0.7, ease: 'expo.inOut', delay: 0.05 });
    };
    const leave = (href) => {
      if (reduced) { window.location.href = href; return; }
      gsap.set(overlay, { clipPath: 'inset(100% 0 0 0)', pointerEvents: 'all' });
      gsap.timeline({ onComplete: () => { window.location.href = href; } })
        .to(overlay, { clipPath: 'inset(0% 0 0 0)', duration: 0.55, ease: 'expo.inOut' })
        .to(mark, { opacity: 1, duration: 0.2 }, '-=0.2');
    };
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download') || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      e.preventDefault();
      leave(url.href);
    });
    // Back/forward cache: make sure the overlay never sticks.
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) gsap.set(overlay, { clipPath: 'inset(100% 0 0 0)', pointerEvents: 'none' });
    });
    return { enter };
  }

  /* Hero intro timeline (home). Called once the preloader has finished. */
  function heroIntro() {
    const hero = document.querySelector('.hero');
    if (!hero) return null;
    const title = hero.querySelector('.hero__title');
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    gsap.set($$('[data-hero]', hero).filter((n) => n !== title), { autoAlpha: 0, y: 30 });
    gsap.set(title, { autoAlpha: 1 });
    const chars = splitText(title, 'chars');

    tl.from('.hero__bg', { autoAlpha: 0, duration: 1.4, ease: 'power2.out' }, 0)
      .from('.nav', { yPercent: -100, autoAlpha: 0, duration: 1, ease: 'expo.out' }, 0.1)
      .to('[data-hero="eyebrow"]', { autoAlpha: 1, y: 0, duration: 0.9 }, 0.3)
      .from(chars, { yPercent: 120, duration: 1.2, stagger: 0.022, ease: 'expo.out' }, 0.35)
      .fromTo('.hero__tv', { scale: 0.85, rotateY: 18, rotateX: 6, autoAlpha: 0 }, { scale: 1, rotateY: -8, rotateX: 2, autoAlpha: 1, duration: 1.8, ease: 'expo.out' }, 0.4)
      .fromTo('.hero__float', { autoAlpha: 0, y: 60, scale: 0.8 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1.4, stagger: 0.14, ease: 'expo.out' }, 0.9)
      .to('[data-hero="lead"]', { autoAlpha: 1, y: 0, duration: 1 }, 0.9)
      .to('[data-hero="cta"]', { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 1.1)
      .to('[data-hero="scroll"]', { autoAlpha: 1, duration: 0.8 }, 1.5);

    if (!reduced) {
      // slow drifting light + floating product elements (ambient, subtle)
      gsap.to('.hero__glow', { xPercent: -12, yPercent: 10, duration: 9, ease: 'sine.inOut', repeat: -1, yoyo: true });
      $$('.hero__float').forEach((f, i) => gsap.to(f, { y: i % 2 ? -14 : 14, duration: 3.6 + i * 0.6, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 2 }));
      if (canHover) {
        const tv = hero.querySelector('.hero__tv');
        const rY = gsap.quickTo(tv, 'rotationY', { duration: 1.2, ease: 'power3.out' });
        const rX = gsap.quickTo(tv, 'rotationX', { duration: 1.2, ease: 'power3.out' });
        hero.addEventListener('pointermove', (e) => {
          const px = e.clientX / window.innerWidth - 0.5;
          const py = e.clientY / window.innerHeight - 0.5;
          rY(-8 + px * 10); rX(2 - py * 6);
        });
      }
    }
    return tl;
  }

  /* ---------------------------------------------------------------------
     Auto-init: scan the DOM for data-animation attributes.
     Safe to call again after dynamic content (e.g. product grids) renders.
     --------------------------------------------------------------------- */
  function initAnimations(root = document) {
    const nodes = $$('[data-animation]', root).filter((n) => !n._animated);
    nodes.forEach((n) => { n._animated = true; });

    if (reduced) {
      nodes.forEach((n) => { n.style.visibility = 'visible'; });
      $$('[data-counter]', root).forEach(counterAnimation);
      return;
    }

    const by = (type) => nodes.filter((n) => n.dataset.animation === type);
    const fu = by('fade-up'); gsap.set(fu, { y: 44 }); if (fu.length) fadeUp(fu);
    const fi = by('fade-in'); if (fi.length) fadeIn(fi);
    by('reveal').forEach((n) => { if (!n.closest('.hero')) revealText(n); });
    by('scale').forEach(scaleReveal);
    by('parallax').forEach(parallaxImage);
    by('image-reveal').forEach(revealImage);
    $$('[data-counter]', root).forEach(counterAnimation);
    $$('[data-tilt]', root).forEach((c) => cardTilt(c));
  }

  /* Pinned/cinematic sections are only enabled on large screens without
     reduced motion; smaller screens get a clean stacked layout instead. */
  function initPinned() {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 993px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)', () => {
      const cinema = document.querySelector('.cinema');
      const feats = document.querySelector('.features');
      if (cinema) cinematicSequence(cinema);
      if (feats) horizontalScroll(feats);
      return () => {
        [cinema, feats].forEach((s) => s && s.classList.remove('is-pinned'));
        $$('.cinema__item, .cinema__caption, .cinema__item img, .hscroll__track').forEach((n) => gsap.set(n, { clearProps: 'all' }));
      };
    });
    // Mobile / reduced motion: features still highlight as they scroll past
    mm.add('(max-width: 992px), (prefers-reduced-motion: reduce)', () => {
      $$('.hpanel').forEach((p) => ScrollTrigger.create({ trigger: p, start: 'top 60%', end: 'bottom 40%', toggleClass: { targets: p, className: 'is-active' } }));
    });
    // Parallax on About/Home imagery inside the pinned-free sections is handled by data-animation
  }

  /* Progressive timeline line (About page) */
  function initTimeline() {
    const line = document.querySelector('.timeline__line');
    if (!line || reduced) { if (line) gsap.set(line, { scaleY: 1 }); return; }
    gsap.to(line, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 60%', scrub: true } });
  }

  Object.assign(SME, {
    gsap, splitText, revealText, revealImage, fadeUp, fadeIn, scaleReveal,
    parallaxImage, cardTilt, horizontalScroll, counterAnimation,
    pageTransition, heroIntro, initAnimations, initPinned, initTimeline,
  });
})();
