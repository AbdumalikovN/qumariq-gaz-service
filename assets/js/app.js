/* Qumariq Gas Service — interactions and motion. GSAP + ScrollTrigger (vendored); everything degrades without them. */
(function () {
  'use strict';
  var h = document.documentElement;
  var motion = h.classList.contains('motion');
  var hasGsap = typeof window.gsap !== 'undefined';
  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* header */
  var hd = $('[data-header]');
  function onScroll() { hd.classList.toggle('is-solid', window.scrollY > 24 || mnav.classList.contains('is-open')); }
  var burger = $('[data-burger]'), mnav = $('[data-mnav]');
  burger.addEventListener('click', function () {
    var open = !mnav.classList.contains('is-open');
    mnav.classList.toggle('is-open', open); burger.setAttribute('aria-expanded', String(open)); onScroll();
  });
  $$('a', mnav).forEach(function (a) { a.addEventListener('click', function () { mnav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }); });
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ticker: duplicate once so the loop is seamless */
  var tk = $('[data-ticker]');
  if (tk) tk.innerHTML += tk.innerHTML;

  /* hero intro */
  var heroEls = { lines: $$('.hero-h .line > span'), p: $('[data-hero-p]'), cta: $('[data-hero-cta]'), tags: $('[data-hero-tags]'), fig: $('[data-hero-fig]'), chip: $('[data-hero-chip]') };
  if (motion && hasGsap) {
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.fromTo(heroEls.lines, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.1, stagger: .09 }, .1)
      .fromTo(heroEls.p, { y: 18, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .9 }, '-=.7')
      .fromTo(heroEls.cta, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, '-=.65')
      .fromTo(heroEls.tags, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, '-=.6')
      .fromTo(heroEls.fig, { opacity: 0, y: 40, rotate: 2, scale: .96 }, { opacity: 1, y: 0, rotate: 0, scale: 1, duration: 1.3, clearProps: 'transform' }, .25)
      .fromTo(heroEls.chip, { y: 20, opacity: 0, scale: .9 }, { y: 0, opacity: 1, scale: 1, duration: .7, ease: 'back.out(1.6)' }, '-=.5');
    if (window.ScrollTrigger) {
      gsap.to('[data-parallax]', { yPercent: -14, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: .6 } });
      gsap.to('.hero-copy', { yPercent: 10, opacity: .35, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: .8 } });
    }
  } else {
    [].concat(heroEls.lines, [heroEls.p, heroEls.cta, heroEls.tags, heroEls.fig]).forEach(function (el) { if (el) el.style.opacity = 1; });
  }

  /* reveals (IntersectionObserver; stagger siblings slightly) */
  var reveals = $$('[data-reveal]');
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, sibs = $$('[data-reveal]', el.parentElement), i = sibs.indexOf(el);
        el.style.transitionDelay = (Math.min(i, 6) * 70) + 'ms';
        el.classList.add('is-in'); io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add('is-in'); });

  /* counters */
  $$('[data-count]').forEach(function (el) {
    var target = +el.getAttribute('data-count');
    if (!motion || !hasGsap) { el.textContent = target; return; }
    var o = { v: 0 };
    gsap.to(o, { v: target, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: function () { el.textContent = Math.round(o.v); } });
  });

  /* gas-flow line through the process steps */
  var flow = $('[data-flow]');
  if (flow && motion && hasGsap && window.ScrollTrigger) {
    gsap.to(flow, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '[data-steps]', start: 'top 80%', end: 'bottom 55%', scrub: .5 } });
  }

  /* gallery strip + lightbox */
  var strip = $('[data-gal-strip]'), items = $$('.gal-item');
  function stepStrip(dir) { strip.scrollBy({ left: dir * Math.round(strip.clientWidth * .8), behavior: motion ? 'smooth' : 'auto' }); }
  $('[data-gal-prev]').addEventListener('click', function () { stepStrip(-1); });
  $('[data-gal-next]').addEventListener('click', function () { stepStrip(1); });
  var lb = $('[data-lb-root]'), lbImg = $('[data-lb-img]'), lbSrc = $('[data-lb-src]'), lbCap = $('[data-lb-cap]'), cur = -1, lastFocus = null;
  function showLb(i) {
    cur = (i + items.length) % items.length;
    var b = items[cur], base = b.getAttribute('data-lb');
    lbSrc.setAttribute('srcset', base + '.webp'); lbImg.src = base + '.jpg'; lbImg.alt = $('img', b).alt; lbCap.textContent = b.getAttribute('data-cap') || '';
    if (lb.hidden) { lastFocus = document.activeElement; lb.hidden = false; document.body.style.overflow = 'hidden'; $('[data-lb-close]').focus(); }
    if (motion && hasGsap) gsap.fromTo('.lb-fig', { opacity: 0, scale: .96 }, { opacity: 1, scale: 1, duration: .45, ease: 'expo.out' });
  }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  items.forEach(function (b, i) { b.addEventListener('click', function () { showLb(i); }); });
  $('[data-lb-close]').addEventListener('click', closeLb);
  $('[data-lb-prev]').addEventListener('click', function () { showLb(cur - 1); });
  $('[data-lb-next]').addEventListener('click', function () { showLb(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb(); else if (e.key === 'ArrowRight') showLb(cur + 1); else if (e.key === 'ArrowLeft') showLb(cur - 1);
  });
  var tx = 0;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) showLb(cur + (dx < 0 ? 1 : -1)); }, { passive: true });

  /* example calculator: nothing is assumed, only what the visitor types */
  var calc = $('[data-calc]');
  if (calc) {
    var f = $('form', calc), out = { b: $('[data-out="b"]', calc), g: $('[data-out="g"]', calc), d: $('[data-out="d"]', calc) }, diffBox = $('.calc-diff', calc);
    function num(n) { return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n); }
    function recalc() {
      var v = {}; ['km', 'bl', 'bp', 'gl', 'gp'].forEach(function (k) { v[k] = parseFloat(f.elements[k].value); });
      var ok = Object.keys(v).every(function (k) { return isFinite(v[k]) && v[k] > 0; });
      var unit = ' ' + (window.QG_I18N ? window.QG_I18N.t('calc.unit') : 'so‘m');
      if (!ok) { out.b.textContent = out.g.textContent = out.d.textContent = '—'; diffBox.classList.remove('is-neg'); return; }
      var b = v.km / 100 * v.bl * v.bp, g = v.km / 100 * v.gl * v.gp, d = b - g;
      out.b.textContent = num(b) + unit; out.g.textContent = num(g) + unit;
      out.d.textContent = (d >= 0 ? '−' : '+') + num(Math.abs(d)) + unit; diffBox.classList.toggle('is-neg', d < 0);
    }
    f.addEventListener('input', recalc); document.addEventListener('qg:lang', recalc);
  }

  /* floating bar: hide while the contacts block is on screen (its own buttons are there) */
  var fab = $('[data-fab]'), ct = $('#contacts');
  if (fab && ct && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { fab.style.transform = en[0].isIntersecting ? 'translateY(140%)' : ''; fab.style.transition = 'transform .4s cubic-bezier(.2,.7,.2,1)'; }, { threshold: .25 }).observe(ct);
  }

  /* smooth anchor offset for fixed header */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1), t = id && document.getElementById(id); if (!t) return;
      e.preventDefault(); var y = t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: id === 'top' ? 0 : y, behavior: motion ? 'smooth' : 'auto' });
    });
  });
})();
