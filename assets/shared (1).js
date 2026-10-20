// ===== FIX: resolve relative url() inside inline CSS variables =====
// CSS vars are resolved relative to assets/shared.css, so 'assets/x.jpg'
// would become 'assets/assets/x.jpg'. Convert them to absolute URLs first.
(function absolutizeVarUrls() {
  document.querySelectorAll('[style*="url("]').forEach(el => {
    const style = el.getAttribute('style');
    const fixed = style.replace(/(--[\w-]+\s*:\s*url\(\s*['"]?)([^'")]+)(['"]?\s*\))/g, (m, pre, path, post) => {
      if (/^(https?:|data:|blob:|\/\/)/i.test(path)) return m;
      return pre + new URL(path, document.baseURI).href + post;
    });
    if (fixed !== style) el.setAttribute('style', fixed);
  });
})();

// HERO ROTATING WORD
  const rotateWords = document.querySelectorAll('.rotate-slot .word');
  if (rotateWords.length > 1) {
    let rIdx = 0;
    function nextWord() {
      const prev = rIdx;
      rIdx = (rIdx + 1) % rotateWords.length;
      rotateWords[prev].classList.remove('active');
      rotateWords[prev].classList.add('exit');
      rotateWords[rIdx].classList.add('active');
      setTimeout(() => rotateWords[prev].classList.remove('exit'), 600);
    }
    setInterval(nextWord, 2400);
  }


  // YOUTUBE MODAL
  const ytModal = document.getElementById('ytModal');
  const ytFrame = document.getElementById('ytFrame');
  const ytClose = document.getElementById('ytClose');
  function extractYouTubeId(url) {
    if (!url) return null;
    const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{6,})/);
    return m ? m[1] : null;
  }
  function openYt(id) {
    ytFrame.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    ytModal.classList.add('open');
    ytModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('yt-open');
  }
  function closeYt() {
    ytFrame.src = '';
    ytModal.classList.remove('open');
    ytModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('yt-open');
  }
  document.querySelectorAll('.testi-video').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      const id = extractYouTubeId(href);
      if (!id) return;
      e.preventDefault();
      openYt(id);
    });

    // auto-fetch YouTube thumbnail
    const href = link.getAttribute('href') || '';
    const id = extractYouTubeId(href);
    if (id) {
      const thumb = link.querySelector('.testi-thumb');
      if (thumb) {
        const maxres = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
        const hq = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
        const probe = new Image();
        probe.onload = function() {
          // maxres placeholder (video without HD) returns 120x90
          const url = this.naturalWidth >= 480 ? maxres : hq;
          thumb.style.setProperty('--testi-bg', `url('${url}')`);
        };
        probe.onerror = () => thumb.style.setProperty('--testi-bg', `url('${hq}')`);
        probe.src = maxres;
      }
    }
  });
  if (ytClose) ytClose.addEventListener('click', closeYt);
  if (ytModal) ytModal.addEventListener('click', (e) => { if (e.target === ytModal) closeYt(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && ytModal && ytModal.classList.contains('open')) closeYt();
  });

  // NAV SCROLL STATE
  const navWrap = document.getElementById('navWrap');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        navWrap.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  });

  // DESKTOP DROPDOWN
  document.querySelectorAll('.nav-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const li = btn.parentElement;
      const isOpen = li.classList.contains('open');
      document.querySelectorAll('.nav-menu li').forEach(x => x.classList.remove('open'));
      if (!isOpen) li.classList.add('open');
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.nav-menu li').forEach(x => x.classList.remove('open'));
  });

  // MOBILE MENU
  const burger = document.getElementById('burgerBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileOverlay = document.getElementById('mobileMenuOverlay');
  const mobileClose = document.getElementById('mobileCloseBtn');
  function openMobile() {
    mobileMenu.classList.add('open');
    document.body.classList.add('menu-open');
  }
  function closeMobile() {
    mobileMenu.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  burger.addEventListener('click', openMobile);
  mobileClose.addEventListener('click', closeMobile);
  mobileOverlay.addEventListener('click', closeMobile);
  // close on link click
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobile));
  // mobile submenu toggle
  document.querySelectorAll('.mobile-sub-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.parentElement.classList.toggle('mobile-open');
    });
  });

  // REVEAL — toggles on both scroll directions
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        entry.target.classList.remove('in-view');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // COUNT UP
  function animateCountUp(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(target * eased);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.main[data-target]').forEach(animateCountUp);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  document.querySelectorAll('#statsGrid').forEach(el => countObserver.observe(el));

  // SLIDER
  const track = document.getElementById('sliderTrack');
  const cards = Array.from(track.querySelectorAll('.achievement-card'));
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dots = Array.from(document.querySelectorAll('.slider-dot'));
  let current = 0;
  const total = cards.length;

  function goTo(idx) {
    current = Math.max(0, Math.min(total - 1, idx));
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    cards.forEach((c, i) => c.classList.toggle('is-active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
  }
  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  dots.forEach(dot => dot.addEventListener('click', () => goTo(parseInt(dot.dataset.dot))));
  document.addEventListener('keydown', (e) => {
    if (mobileMenu.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // drag/touch
  let isDragging = false, startX = 0, dragDelta = 0, cardWidth = 0, pointerId = null, didDrag = false;
  function onPointerDown(e) {
    if (e.target.closest('.slider-arrow') || e.target.closest('a') || e.target.closest('button')) return;
    isDragging = true; didDrag = false;
    startX = e.clientX; dragDelta = 0;
    cardWidth = cards[0].getBoundingClientRect().width;
    pointerId = e.pointerId;
    track.classList.add('dragging');
    try { track.setPointerCapture(e.pointerId); } catch(_){}
  }
  function onPointerMove(e) {
    if (!isDragging) return;
    dragDelta = e.clientX - startX;
    if (Math.abs(dragDelta) > 5) didDrag = true;
    let d = dragDelta;
    const maxD = cardWidth * 0.4;
    if (current === 0 && d > 0) d = Math.min(d, maxD) * 0.4;
    if (current === total - 1 && d < 0) d = Math.max(d, -maxD) * 0.4;
    track.style.transform = `translateX(calc(-${current * 100}% + ${d}px))`;
  }
  function onPointerUp() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    try { if (pointerId !== null) track.releasePointerCapture(pointerId); } catch(_){}
    pointerId = null;
    const threshold = cardWidth * 0.18;
    if (dragDelta < -threshold && current < total - 1) goTo(current + 1);
    else if (dragDelta > threshold && current > 0) goTo(current - 1);
    else goTo(current);
    dragDelta = 0;
  }
  track.addEventListener('pointerdown', onPointerDown);
  track.addEventListener('pointermove', onPointerMove);
  track.addEventListener('pointerup', onPointerUp);
  track.addEventListener('pointercancel', onPointerUp);
  track.addEventListener('pointerleave', onPointerUp);
  track.addEventListener('click', (e) => {
    if (didDrag) { e.preventDefault(); e.stopPropagation(); didDrag = false; }
  }, true);
  track.addEventListener('dragstart', (e) => e.preventDefault());
  goTo(0);

  // FAQ ACCORDION (smooth)
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.parentElement;
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(other => {
        if (other !== item) other.classList.remove('open');
      });
      item.classList.toggle('open', !wasOpen);
    });
  });

  // SUBTLE MOUSE PARALLAX ON HERO BLOBS
  const hero = document.querySelector('.hero');
  const blob3 = document.querySelector('.hero-blob-3');
  if (hero && blob3 && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      blob3.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
    });
    hero.addEventListener('mouseleave', () => {
      blob3.style.transform = '';
    });
  }

  // ===== CUSTOM CURSOR =====
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (cursorDot && cursorRing && !isTouch) {
    let mx = -50, my = -50, rx = -50, ry = -50;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
    });
    function tick() {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      cursorRing.style.transform = `translate3d(${rx - 18}px, ${ry - 18}px, 0)`;
      requestAnimationFrame(tick);
    }
    tick();

    // hover states for interactive elements
    const hoverSel = 'a, button, [role="button"], input, textarea, label, .slider-arrow, .catalog-arrow, .slider-dot, .team-card, .service-card, .testimonial-card, .works-item, .faq-q, summary';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverSel)) {
        cursorDot.classList.add('hovering');
        cursorRing.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverSel)) {
        cursorDot.classList.remove('hovering');
        cursorRing.classList.remove('hovering');
      }
    });

    // dark section detection (testimonials, footer, bg-dark)
    const darkSel = '.testimonials, .footer, .lightbox';
    document.addEventListener('mousemove', (e) => {
      const dark = e.target.closest(darkSel);
      cursorDot.classList.toggle('dark', !!dark);
      cursorRing.classList.toggle('dark', !!dark);
    });

    // click ripple
    document.addEventListener('mousedown', () => {
      cursorRing.style.transition = 'transform .15s var(--ease), width .2s var(--ease), height .2s var(--ease)';
      cursorRing.style.width = '28px';
      cursorRing.style.height = '28px';
    });
    document.addEventListener('mouseup', () => {
      cursorRing.style.width = '';
      cursorRing.style.height = '';
      setTimeout(() => cursorRing.style.transition = '', 200);
    });
  }

  // ===== OUR WORKS: JS-driven marquee with drag + always running =====
  const worksItems = Array.from(document.querySelectorAll('.works-item'));
  // auto-hydrate background from data-src → --work-bg CSS var (image items only)
  worksItems.forEach(item => {
    const src = item.getAttribute('data-src');
    if (src && !item.classList.contains('works-item-video')) {
      item.style.setProperty('--work-bg', `url('${new URL(src, document.baseURI).href}')`);
    }
  });

  // Auto play/pause videos in works based on viewport visibility
  const worksVideos = document.querySelectorAll('.works-item-video video');
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const v = entry.target;
      if (entry.isIntersecting) {
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.15 });
  worksVideos.forEach(v => videoObserver.observe(v));
  document.querySelectorAll('.works-marquee').forEach(mq => {
    const track = mq.querySelector('.works-track');
    if (!track) return;
    const dir = track.classList.contains('dir-right') ? 1 : -1;
    const speed = 0.3; // px per frame, slower feel
    let offset = 0;
    let isDown = false;
    let startX = 0;
    let startOffset = 0;
    let dragged = false;
    let pid = null;

    // remove CSS animation, use JS
    track.style.animation = 'none';

    // half of scrollWidth = one loop cycle
    let cycle = 0;
    function measure() { cycle = track.scrollWidth / 2 || 1; }
    measure();
    window.addEventListener('resize', measure);

    // initial offset for right direction (start scrolled)
    if (dir === 1) offset = -cycle;

    function tick() {
      if (!isDown) offset += speed * dir;
      // wrap
      if (offset <= -cycle) offset += cycle;
      if (offset > 0) offset -= cycle;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      requestAnimationFrame(tick);
    }
    tick();

    mq.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a, button')) return;
      isDown = true;
      dragged = false;
      startX = e.clientX;
      startOffset = offset;
      pid = e.pointerId;
      try { mq.setPointerCapture(pid); } catch(_) {}
      mq.classList.add('grabbing');
      e.preventDefault();
    });
    mq.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const delta = e.clientX - startX;
      if (Math.abs(delta) > 5) dragged = true;
      offset = startOffset + delta;
    });
    const endDrag = () => {
      if (!isDown) return;
      isDown = false;
      try { if (pid !== null) mq.releasePointerCapture(pid); } catch(_) {}
      pid = null;
      mq.classList.remove('grabbing');
    };
    mq.addEventListener('pointerup', endDrag);
    mq.addEventListener('pointercancel', endDrag);
    mq.addEventListener('pointerleave', endDrag);

    // prevent click after drag
    mq.addEventListener('click', (e) => {
      if (dragged) {
        e.preventDefault();
        e.stopPropagation();
        dragged = false;
      }
    }, true);
    mq.addEventListener('dragstart', (e) => e.preventDefault());
  });

  // ===== LIGHTBOX =====
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxLabel = document.getElementById('lightboxLabel');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const lightboxVideo = document.getElementById('lightboxVideo');
  const lightboxFrame = document.querySelector('.lightbox-frame');
  // dedup - only unique 20 items (first half)
  const uniqueWorks = worksItems.slice(0, 20);
  let lightboxIdx = 0;

  function openLightbox(idx) {
    lightboxIdx = idx;
    const item = uniqueWorks[idx];
    const src = item.dataset.src || '';
    const label = item.dataset.label || 'work';
    const isVideo = item.classList.contains('works-item-video') || /\.(mp4|webm|mov)$/i.test(src);

    if (isVideo) {
      lightboxFrame.classList.add('is-video');
      lightboxVideo.src = src;
      lightboxVideo.currentTime = 0;
      const p = lightboxVideo.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      lightboxFrame.classList.remove('is-video');
      lightboxImg.style.setProperty('--lightbox-src', `url('${new URL(src, document.baseURI).href}')`);
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }

    lightboxLabel.textContent = label;
    lightboxCounter.textContent = `${String(idx + 1).padStart(2, '0')} / ${String(uniqueWorks.length).padStart(2, '0')}`;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lightboxVideo.pause();
    lightboxVideo.src = '';
    lightboxFrame.classList.remove('is-video');
  }
  function navLightbox(delta) {
    const next = (lightboxIdx + delta + uniqueWorks.length) % uniqueWorks.length;
    openLightbox(next);
  }

  uniqueWorks.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });
  // duplicated items (2nd half) → find matching label
  worksItems.slice(20).forEach(item => {
    item.addEventListener('click', () => {
      const idx = uniqueWorks.findIndex(u => u.dataset.label === item.dataset.label);
      if (idx >= 0) openLightbox(idx);
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navLightbox(-1));
  lightboxNext.addEventListener('click', () => navLightbox(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navLightbox(-1);
    if (e.key === 'ArrowRight') navLightbox(1);
  });

  // ===== FLOATING TOOLTIP (follows cursor) =====
  const tt = document.createElement('div');
  tt.className = 'floating-tt';
  document.body.appendChild(tt);
  let ttTarget = null;
  const TT_OFFSET_X = 18;
  const TT_OFFSET_Y = 20;

  function placeTt(x, y) {
    const rect = tt.getBoundingClientRect();
    let px = x + TT_OFFSET_X;
    let py = y + TT_OFFSET_Y;
    // keep inside viewport
    if (px + rect.width > window.innerWidth - 8) px = x - rect.width - 12;
    if (py + rect.height > window.innerHeight - 8) py = y - rect.height - 12;
    tt.style.transform = `translate3d(${px}px, ${py}px, 0)`;
  }

  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-tt]');
    if (target && target !== ttTarget) {
      ttTarget = target;
      tt.textContent = target.dataset.tt;
      placeTt(e.clientX, e.clientY);
      tt.classList.add('visible');
    }
  });
  document.addEventListener('mousemove', (e) => {
    if (ttTarget) placeTt(e.clientX, e.clientY);
  });
  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-tt]');
    if (target && !target.contains(e.relatedTarget)) {
      ttTarget = null;
      tt.classList.remove('visible');
    }
  });
  // hide on scroll (target may have moved)
  window.addEventListener('scroll', () => {
    if (ttTarget) {
      ttTarget = null;
      tt.classList.remove('visible');
    }
  }, { passive: true });