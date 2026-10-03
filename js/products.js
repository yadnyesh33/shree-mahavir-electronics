/* ==========================================================================
   Shree Mahavir Electronics — product + review data, rendering and filters.

   EDIT HERE to change listings. Everything below marked SAMPLE is placeholder
   content: replace it with the shop's real range / genuine customer reviews.
   Loaded BEFORE main.js so grids exist when animations initialise.
   ========================================================================== */
(() => {
  'use strict';

  const IMG = 'assets/images/';

  /* SAMPLE product listings — generic product types, not specific models. */
  const PRODUCTS = [
    { id: 'tv-4k', cat: 'tv', catLabel: 'Televisions', name: '4K Smart LED Television', img: 'premium-4k-smart-television.svg',
      desc: 'Sharp 4K picture with built-in streaming apps for everyday entertainment.', spec: 'Screen sizes: 43″ – 65″ · 4K Ultra HD' },
    { id: 'tv-qled', cat: 'tv', catLabel: 'Televisions', name: 'QLED / OLED Premium Television', img: 'premium-4k-smart-television.svg',
      desc: 'Richer colour and deeper contrast for a true home-cinema feel.', spec: 'Screen sizes: 55″ – 75″ · HDR support' },
    { id: 'tv-fhd', cat: 'tv', catLabel: 'Televisions', name: 'Full HD Smart Television', img: 'premium-4k-smart-television.svg',
      desc: 'A dependable choice for bedrooms and compact living spaces.', spec: 'Screen sizes: 32″ – 43″ · Full HD' },

    { id: 'fr-double', cat: 'refrigerators', catLabel: 'Refrigerators', name: 'Double-Door Inverter Refrigerator', img: 'double-door-inverter-refrigerator.svg',
      desc: 'Frost-free cooling with generous space for the whole family.', spec: 'Capacity: 250 L – 450 L · Inverter compressor' },
    { id: 'fr-side', cat: 'refrigerators', catLabel: 'Refrigerators', name: 'Side-by-Side Refrigerator', img: 'double-door-inverter-refrigerator.svg',
      desc: 'Wide, organised storage with a statement presence in the kitchen.', spec: 'Capacity: 550 L+ · Dual cooling zones' },
    { id: 'fr-single', cat: 'refrigerators', catLabel: 'Refrigerators', name: 'Single-Door Refrigerator', img: 'double-door-inverter-refrigerator.svg',
      desc: 'Efficient, compact cooling for small households.', spec: 'Capacity: 180 L – 240 L · Energy efficient' },

    { id: 'wm-front', cat: 'washing-machines', catLabel: 'Washing Machines', name: 'Front-Load Washing Machine', img: 'front-load-washing-machine.svg',
      desc: 'Gentle on fabric, thorough on stains, with efficient water use.', spec: 'Capacity: 6 kg – 10 kg · Inverter motor' },
    { id: 'wm-top', cat: 'washing-machines', catLabel: 'Washing Machines', name: 'Top-Load Washing Machine', img: 'front-load-washing-machine.svg',
      desc: 'Quick, convenient washing with easy loading and unloading.', spec: 'Capacity: 6 kg – 9 kg · Multiple wash programs' },
    { id: 'wm-semi', cat: 'washing-machines', catLabel: 'Washing Machines', name: 'Semi-Automatic Washing Machine', img: 'front-load-washing-machine.svg',
      desc: 'Simple, durable and budget-friendly everyday washing.', spec: 'Capacity: 7 kg – 10 kg · Wash + spin tubs' },

    { id: 'ac-split', cat: 'air-conditioners', catLabel: 'Air Conditioners', name: 'Split Inverter Air Conditioner', img: 'split-inverter-air-conditioner.svg',
      desc: 'Quiet, efficient cooling that adapts to the room temperature.', spec: 'Capacity: 1 – 2 ton · Inverter technology' },
    { id: 'ac-window', cat: 'air-conditioners', catLabel: 'Air Conditioners', name: 'Window Air Conditioner', img: 'split-inverter-air-conditioner.svg',
      desc: 'A straightforward cooling solution for single rooms.', spec: 'Capacity: 1 – 1.5 ton · Easy installation' },
    { id: 'ac-cassette', cat: 'air-conditioners', catLabel: 'Air Conditioners', name: 'Cassette / Ductless Systems', img: 'split-inverter-air-conditioner.svg',
      desc: 'Discreet climate solutions for larger or commercial spaces.', spec: 'Enquire for sizing and options' },

    { id: 'ot-micro', cat: 'other', catLabel: 'Other Appliances', name: 'Convection Microwave Oven', img: 'convection-microwave-oven.svg',
      desc: 'Reheat, grill and bake with one versatile kitchen appliance.', spec: 'Capacity: 20 L – 32 L · Auto-cook menus' },
    { id: 'ot-kitchen', cat: 'other', catLabel: 'Other Appliances', name: 'Kitchen & Home Appliances', img: 'convection-microwave-oven.svg',
      desc: 'Ask us about mixers, water purifiers, geysers, fans and more.', spec: 'Availability on enquiry' },
  ];

  /* SAMPLE reviews — NOT genuine. Replace with real customer reviews and set
     verified: true only when the review can actually be verified. */
  const REVIEWS_ARE_SAMPLE = true;
  const REVIEWS = [
    { cat: 'tv', name: 'Sample Customer A', date: '2026-01-12', rating: 5, text: 'Sample review: replace this text with a genuine customer review about a television purchase.', verified: false },
    { cat: 'refrigerator', name: 'Sample Customer B', date: '2026-02-03', rating: 5, text: 'Sample review: replace this text with a genuine customer review about a refrigerator purchase.', verified: false },
    { cat: 'washing-machine', name: 'Sample Customer C', date: '2026-02-19', rating: 4, text: 'Sample review: replace this text with a genuine customer review about a washing machine purchase.', verified: false },
    { cat: 'ac', name: 'Sample Customer D', date: '2026-03-08', rating: 5, text: 'Sample review: replace this text with a genuine customer review about an air conditioner purchase.', verified: false },
    { cat: 'service', name: 'Sample Customer E', date: '2026-03-27', rating: 5, text: 'Sample review: replace this text with a genuine customer review about the shop\u2019s service and guidance.', verified: false },
    { cat: 'tv', name: 'Sample Customer F', date: '2026-04-14', rating: 4, text: 'Sample review: replace this text with a genuine customer review about a television purchase.', verified: false },
    { cat: 'service', name: 'Sample Customer G', date: '2026-05-02', rating: 5, text: 'Sample review: replace this text with a genuine customer review about after-sales support.', verified: false },
    { cat: 'ac', name: 'Sample Customer H', date: '2026-05-21', rating: 4, text: 'Sample review: replace this text with a genuine customer review about an air conditioner installation.', verified: false },
  ];
  const REVIEW_LABELS = { tv: 'TV', refrigerator: 'Refrigerator', 'washing-machine': 'Washing Machine', ac: 'AC', service: 'Service' };

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const arrow = '<svg class="btn__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  const star = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z"/></svg>';
  const stars = (n) => Array.from({ length: 5 }, (_, i) => (i < n ? star : star.replace('fill="currentColor"', 'fill="none" stroke="currentColor" stroke-width="1.2"'))).join('');

  /* Filtering with a short GSAP out/in. Falls back to instant toggle. */
  function applyFilter(items, test, container) {
    const show = items.filter(test);
    const hide = items.filter((i) => !test(i));
    const swap = () => {
      hide.forEach((i) => { i.hidden = true; });
      show.forEach((i) => { i.hidden = false; });
      if (window.gsap && !reduced) {
        gsap.fromTo(show, { autoAlpha: 0, y: 28, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out', overwrite: true });
      }
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    };
    if (window.gsap && !reduced) {
      gsap.to(items.filter((i) => !i.hidden), { autoAlpha: 0, y: -16, duration: 0.22, stagger: 0.02, ease: 'power2.in', onComplete: swap, overwrite: true });
    } else swap();
    const live = container.parentElement.querySelector('[data-live]');
    if (live) live.textContent = `${show.length} result${show.length === 1 ? '' : 's'} shown`;
  }

  function bindFilters(scope, items, getKey, container) {
    const buttons = Array.from(scope.querySelectorAll('[data-filter]'));
    buttons.forEach((btn) => btn.addEventListener('click', () => {
      buttons.forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', b === btn); });
      const f = btn.dataset.filter;
      applyFilter(items, (el) => f === 'all' || getKey(el) === f, container);
    }));
  }

  /* Product grids (products.html + category pages) */
  function renderProducts() {
    const grid = document.querySelector('[data-product-grid]');
    if (!grid) return;
    const only = grid.dataset.category;
    const list = PRODUCTS.filter((p) => !only || p.cat === only);
    grid.innerHTML = list.map((p) => `
      <article class="pcard" data-cat="${esc(p.cat)}" data-cursor="explore">
        <div class="pcard__media"><img src="${IMG}${esc(p.img)}" alt="${esc(p.name)}" width="400" height="400" loading="lazy" decoding="async"></div>
        <div class="pcard__body">
          <span class="pcard__cat">${esc(p.catLabel)}</span>
          <h3 class="pcard__name">${esc(p.name)}</h3>
          <p class="pcard__desc">${esc(p.desc)}</p>
          <p class="pcard__spec">${esc(p.spec)}</p>
          <a class="btn btn--ghost btn--sm pcard__cta" href="contact.html?product=${encodeURIComponent(p.name)}">Enquire Now ${arrow}</a>
        </div>
      </article>`).join('');
    const cards = Array.from(grid.querySelectorAll('.pcard'));
    const filters = document.querySelector('[data-product-filters]');
    if (filters) bindFilters(filters, cards, (el) => el.dataset.cat, grid);
  }

  /* Reviews dashboard */
  function renderReviews() {
    const grid = document.querySelector('[data-review-grid]');
    if (!grid) return;
    const fmt = new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    grid.innerHTML = REVIEWS.map((r) => `
      <article class="rcard" data-cat="${esc(r.cat)}" data-animation="fade-up">
        <div class="rcard__top">
          <span class="stars" role="img" aria-label="${r.rating} out of 5 stars">${stars(r.rating)}</span>
          <span>
            <span class="chip">${esc(REVIEW_LABELS[r.cat] || r.cat)}</span>
            ${r.verified ? '<span class="chip chip--verified">Verified</span>' : ''}
            ${REVIEWS_ARE_SAMPLE ? '<span class="chip chip--sample">Sample</span>' : ''}
          </span>
        </div>
        <p>${esc(r.text)}</p>
        <div class="rcard__foot"><strong>${esc(r.name)}</strong><time datetime="${esc(r.date)}">${fmt.format(new Date(r.date))}</time></div>
      </article>`).join('');

    // Summary — computed from the data above so it stays honest when real reviews are added.
    const total = REVIEWS.length;
    const avg = REVIEWS.reduce((s, r) => s + r.rating, 0) / total;
    const scoreEl = document.querySelector('[data-review-score]');
    if (scoreEl) { scoreEl.dataset.counter = avg.toFixed(1); scoreEl.dataset.decimals = '1'; scoreEl.textContent = avg.toFixed(1); }
    const sStars = document.querySelector('[data-review-stars]');
    if (sStars) { sStars.innerHTML = stars(Math.round(avg)); sStars.setAttribute('aria-label', `${avg.toFixed(1)} out of 5 stars`); }
    const countEl = document.querySelector('[data-review-count]');
    if (countEl) countEl.textContent = `Based on ${total} ${REVIEWS_ARE_SAMPLE ? 'sample ' : ''}review${total === 1 ? '' : 's'}`;
    const dist = document.querySelector('[data-review-dist]');
    if (dist) {
      dist.innerHTML = [5, 4, 3, 2, 1].map((n) => {
        const c = REVIEWS.filter((r) => r.rating === n).length;
        return `<div class="dist__row"><span>${n} ★</span><div class="dist__bar"><span style="width:${(c / total) * 100}%"></span></div><span>${c}</span></div>`;
      }).join('');
    }
    const items = Array.from(grid.querySelectorAll('.rcard'));
    const filters = document.querySelector('[data-review-filters]');
    if (filters) bindFilters(filters, items, (el) => el.dataset.cat, grid);
  }

  renderProducts();
  renderReviews();
  window.SME = Object.assign(window.SME || {}, { PRODUCTS, REVIEWS });
})();
