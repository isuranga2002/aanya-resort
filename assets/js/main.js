/* Aanya Resort — site interactions */
(function () {
  'use strict';

  var WHATSAPP = '94714576474';
  var EMAIL = 'ruvinda02@gmail.com';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  /* ---------- Preloader ---------- */
  var loaded = false;
  function finishLoading() {
    if (loaded) return;
    loaded = true;
    document.body.classList.remove('is-loading');
    // the preloader locks scrolling, so honour deep links like #packages once it is gone
    if (location.hash.length > 1) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }
  window.addEventListener('load', function () { setTimeout(finishLoading, reduceMotion ? 0 : 900); });
  setTimeout(finishLoading, 3500); // never block the page on a slow image

  /* ---------- Year ---------- */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: solid on scroll, hide on scroll down ---------- */
  var header = $('#header');
  var toTop = $('#toTop');
  var lastY = window.pageYOffset;
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    header.classList.toggle('is-scrolled', y > 40);
    var menuOpen = document.body.classList.contains('menu-open');
    header.classList.toggle('is-hidden', !menuOpen && y > 500 && y > lastY + 4);
    if (y < lastY - 4 || y <= 500) header.classList.remove('is-hidden');
    toTop.classList.toggle('is-visible', y > 900);
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); });

  /* ---------- Mobile menu ---------- */
  var burger = $('#burger');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1024) setMenu(false); });

  /* ---------- Active nav link ---------- */
  var navLinks = $$('.nav__link');
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (l) {
      var s = $(l.getAttribute('href'));
      if (s) sectionObserver.observe(s);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        // stagger siblings that enter together
        var siblings = $$('.reveal', el.parentNode);
        var idx = Math.max(0, siblings.indexOf(el));
        el.style.transitionDelay = Math.min(idx, 5) * 90 + 'ms';
        el.classList.add('is-in');
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Hero slideshow ---------- */
  var slides = $$('.hero__slide');
  var dots = $$('.hero__dots button');
  var heroIndex = 0;
  var heroTimer = null;
  function showSlide(i) {
    heroIndex = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) { s.classList.toggle('is-active', n === heroIndex); });
    dots.forEach(function (d, n) {
      d.classList.toggle('is-active', n === heroIndex);
      d.setAttribute('aria-selected', String(n === heroIndex));
    });
  }
  function startHero() {
    clearInterval(heroTimer);
    if (!reduceMotion) heroTimer = setInterval(function () { showSlide(heroIndex + 1); }, 6500);
  }
  dots.forEach(function (d, n) { d.addEventListener('click', function () { showSlide(n); startHero(); }); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearInterval(heroTimer); else startHero();
  });
  showSlide(0);
  startHero();

  /* ---------- Counters ---------- */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var start = null;
    var duration = 1800;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); countObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { countObserver.observe(c); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Swipe helper ---------- */
  function onSwipe(el, cb) {
    var x0 = null, y0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) cb(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }

  /* ---------- Villa image slider ---------- */
  $$('[data-slider]').forEach(function (slider) {
    var track = $('.villa__track', slider);
    var imgs = $$('img', track);
    var current = $('.villa__current', slider);
    var total = $('.villa__total', slider);
    var i = 0;
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    total.textContent = pad(imgs.length);
    function go(n) {
      i = (n + imgs.length) % imgs.length;
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      current.textContent = pad(i + 1);
    }
    $('.villa__nav--prev', slider).addEventListener('click', function () { go(i - 1); });
    $('.villa__nav--next', slider).addEventListener('click', function () { go(i + 1); });
    onSwipe(slider, function (dir) { go(i + dir); });
  });

  /* ---------- Experiences rail ---------- */
  var rail = $('#expRail');
  $$('[data-exp]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = $('.exp-card', rail);
      var step = card ? card.getBoundingClientRect().width + 24 : 300;
      rail.scrollBy({ left: step * parseInt(btn.getAttribute('data-exp'), 10), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Reviews carousel ---------- */
  var carousel = $('#reviewCarousel');
  if (carousel) {
    var revTrack = $('.carousel__track', carousel);
    var reviews = $$('.review', revTrack);
    var dotsWrap = $('#reviewDots');
    var r = 0;
    var revTimer = null;
    reviews.forEach(function (_, n) {
      var b = document.createElement('button');
      b.setAttribute('aria-label', 'Show review ' + (n + 1));
      b.addEventListener('click', function () { goReview(n); restartReviews(); });
      dotsWrap.appendChild(b);
    });
    var revDots = $$('button', dotsWrap);
    function goReview(n) {
      r = (n + reviews.length) % reviews.length;
      revTrack.style.transform = 'translateX(' + (-100 * r) + '%)';
      revDots.forEach(function (d, k) { d.classList.toggle('is-active', k === r); });
    }
    function restartReviews() {
      clearInterval(revTimer);
      if (!reduceMotion) revTimer = setInterval(function () { goReview(r + 1); }, 7000);
    }
    $$('[data-rev]').forEach(function (btn) {
      btn.addEventListener('click', function () { goReview(r + parseInt(btn.getAttribute('data-rev'), 10)); restartReviews(); });
    });
    onSwipe(carousel, function (dir) { goReview(r + dir); restartReviews(); });
    carousel.addEventListener('mouseenter', function () { clearInterval(revTimer); });
    carousel.addEventListener('mouseleave', restartReviews);
    goReview(0);
    restartReviews();
  }

  /* ---------- Gallery filter ---------- */
  var gItems = $$('.g-item');
  $$('.filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      $$('.filter').forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      gItems.forEach(function (item) {
        var show = f === 'all' || item.getAttribute('data-cat').split(' ').indexOf(f) > -1;
        item.classList.toggle('is-hidden', !show);
        if (show) {
          item.classList.remove('is-entering');
          void item.offsetWidth; // restart animation
          item.classList.add('is-entering');
        }
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = $('#lightbox');
  var lbImg = $('img', lb);
  var lbCap = $('figcaption', lb);
  var lbList = [];
  var lbIndex = 0;
  var lastFocus = null;

  function lbShow(n) {
    lbIndex = (n + lbList.length) % lbList.length;
    var img = $('img', lbList[lbIndex]);
    lbImg.style.animation = 'none';
    void lbImg.offsetWidth;
    lbImg.style.animation = '';
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt + '  ·  ' + (lbIndex + 1) + ' / ' + lbList.length;
  }
  function lbOpen(item) {
    lbList = gItems.filter(function (g) { return !g.classList.contains('is-hidden'); });
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.classList.add('lb-open');
    lbShow(lbList.indexOf(item));
    $('.lightbox__close', lb).focus();
  }
  function lbClose() {
    lb.hidden = true;
    document.body.classList.remove('lb-open');
    if (lastFocus) lastFocus.focus();
  }
  gItems.forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('click', function () { lbOpen(item); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lbOpen(item); }
    });
  });
  $('.lightbox__close', lb).addEventListener('click', lbClose);
  $('.lightbox__nav--prev', lb).addEventListener('click', function () { lbShow(lbIndex - 1); });
  $('.lightbox__nav--next', lb).addEventListener('click', function () { lbShow(lbIndex + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lbClose(); });
  onSwipe(lb, function (dir) { lbShow(lbIndex + dir); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbShow(lbIndex - 1);
    if (e.key === 'ArrowRight') lbShow(lbIndex + 1);
  });

  /* ---------- Booking form → WhatsApp ---------- */
  var booking = $('#booking');
  var bForm = $('#bookingForm');
  var bPkg = $('#bkPackage');
  var bIn = $('#bkIn');
  var bOut = $('#bkOut');
  var bInLabel = $('#bkInLabel');
  var bGuests = $('#bkGuests');
  var bErr = $('#bookingError');
  var pkgNote = '';

  function isoDate(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function addDays(iso, n) {
    var p = iso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    d.setDate(d.getDate() + n);
    return isoDate(d);
  }
  function prettyDate(iso) {
    var p = iso.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  }

  var today = isoDate(new Date());
  bIn.min = today;
  bOut.min = addDays(today, 1);
  bIn.value = addDays(today, 7);
  bOut.value = addDays(today, 8);

  function isDayOut() { return bPkg.value === 'Couple Day Out'; }
  function syncPackage() {
    var day = isDayOut();
    booking.classList.toggle('is-day', day);
    bInLabel.textContent = day ? 'Date' : 'Check-in';
    bOut.required = !day;
  }
  bPkg.addEventListener('change', function () { pkgNote = ''; syncPackage(); });
  bIn.addEventListener('change', function () {
    if (!bIn.value) return;
    bOut.min = addDays(bIn.value, 1);
    if (!bOut.value || bOut.value <= bIn.value) bOut.value = addDays(bIn.value, 1);
  });
  syncPackage();

  $$('.stepper button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var v = (parseInt(bGuests.value, 10) || 1) + parseInt(btn.getAttribute('data-step'), 10);
      bGuests.value = Math.min(30, Math.max(1, v));
    });
  });

  // Package buttons pre-select the booking form
  $$('[data-pick]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      bPkg.value = btn.getAttribute('data-pick');
      pkgNote = btn.getAttribute('data-note') || '';
      syncPackage();
    });
  });

  bForm.addEventListener('submit', function (e) {
    e.preventDefault();
    bErr.textContent = '';
    var guests = parseInt(bGuests.value, 10);
    if (!bIn.value) { bErr.textContent = 'Please choose a date.'; bIn.focus(); return; }
    if (bIn.value < today) { bErr.textContent = 'Please choose a date from today onwards.'; bIn.focus(); return; }
    if (!isDayOut()) {
      if (!bOut.value) { bErr.textContent = 'Please choose a check-out date.'; bOut.focus(); return; }
      if (bOut.value <= bIn.value) { bErr.textContent = 'Check-out must be after check-in.'; bOut.focus(); return; }
    }
    if (!guests || guests < 1) { bErr.textContent = 'Please enter the number of guests.'; bGuests.focus(); return; }

    var lines = ['Hello Aanya Resort! I would like to check availability.', ''];
    lines.push('Package: ' + bPkg.value + (pkgNote ? ' (' + pkgNote + ')' : ''));
    if (isDayOut()) {
      lines.push('Date: ' + prettyDate(bIn.value) + ' (10 AM - 4 PM)');
    } else {
      lines.push('Check-in: ' + prettyDate(bIn.value));
      lines.push('Check-out: ' + prettyDate(bOut.value));
    }
    lines.push('Guests: ' + guests);
    lines.push('', 'Please let me know the rates. Thank you!');
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  /* ---------- Contact form → WhatsApp / Email ---------- */
  var cForm = $('#contactForm');
  var cErr = $('#contactError');
  var via = 'whatsapp';
  $$('button[data-via]', cForm).forEach(function (b) {
    b.addEventListener('click', function () { via = b.getAttribute('data-via'); });
  });
  cForm.addEventListener('submit', function (e) {
    e.preventDefault();
    cErr.textContent = '';
    var name = $('#cName'), phone = $('#cPhone'), msg = $('#cMsg');
    var fields = [name, phone, msg];
    fields.forEach(function (f) { f.parentNode.classList.remove('is-invalid'); });
    var bad = fields.filter(function (f) { return !f.value.trim(); });
    if (phone.value.trim() && !/^[+\d][\d\s\-()]{6,}$/.test(phone.value.trim())) bad.push(phone);
    if (bad.length) {
      bad.forEach(function (f) { f.parentNode.classList.add('is-invalid'); });
      cErr.textContent = bad[0] === phone && phone.value.trim() ? 'Please enter a valid phone number.' : 'Please fill in all fields.';
      bad[0].focus();
      return;
    }
    var text = 'Hello Aanya Resort,\n\n' + msg.value.trim() + '\n\nName: ' + name.value.trim() + '\nPhone: ' + phone.value.trim();
    if (via === 'email') {
      window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Enquiry from ' + name.value.trim()) + '&body=' + encodeURIComponent(text);
    } else {
      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    }
  });
})();
