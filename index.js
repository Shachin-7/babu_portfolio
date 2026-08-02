document.addEventListener('DOMContentLoaded', () => {
  // Respect user preferences for reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    return;
  }

  // Check if browser supports native CSS Scroll-Driven Animations
  const supportsSDA = CSS.supports('(animation-timeline: view()) and (animation-range: entry)');

  // 1. Fallback for Section Scroll Reveals
  if (!supportsSDA) {
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.05
    });

    revealElements.forEach(el => {
      revealObserver.observe(el);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Animated SVG Underline — exact vanilla JS port of AnimatedSVGUnderlink.js
  //    Source: framerusercontent.com/modules/NqmKRglFZyFe2DlGLFEU/…/AnimatedSVGUnderlink.js
  //
  //    Key animation mechanics (matching Framer Motion pathLength / pathOffset):
  //      Draw  : stroke-dashoffset  totalLength → 0      (grows left→right, 0.6 s)
  //      Erase : stroke-dashoffset  0 → -totalLength     (slides off right,  0.45 s)
  //              (this mirrors pathOffset: 0→1 with pathLength:1 in Framer Motion)
  // ─────────────────────────────────────────────────────────────────────────────

  const DEFAULT_UNDERLINE_COLOR = '#e55050'; // fallback if no data-underline-color set
  const STROKE_WIDTH = 6;         // default strokeWidth
  const BASE_W = 310;         // reference width the paths were drawn at
  const BASE_H = 40;          // reference height (for aspect-ratio scaling)
  const DRAW_MS = 600;         // animationTransition.duration: 0.6
  const ERASE_MS = 450;         // erase transition duration: 0.45
  // power2.inOut (quadratic easeInOut) cubic-bezier approximation
  const EASE = 'cubic-bezier(0.455, 0.030, 0.515, 0.955)';

  // 6 hand-drawn scribble path variants (identical to the Framer component's svgVariants array)
  const svgVariants = [
    "M5 20.9999C26.7762 16.2245 49.5532 11.5572 71.7979 14.6666C84.9553 16.5057 97.0392 21.8432 109.987 24.3888C116.413 25.6523 123.012 25.5143 129.042 22.6388C135.981 19.3303 142.586 15.1422 150.092 13.3333C156.799 11.7168 161.702 14.6225 167.887 16.8333C181.562 21.7212 194.975 22.6234 209.252 21.3888C224.678 20.0548 239.912 17.991 255.42 18.3055C272.027 18.6422 288.409 18.867 305 17.9999",
    "M5 24.2592C26.233 20.2879 47.7083 16.9968 69.135 13.8421C98.0469 9.5853 128.407 4.02322 158.059 5.14674C172.583 5.69708 187.686 8.66104 201.598 11.9696C207.232 13.3093 215.437 14.9471 220.137 18.3619C224.401 21.4596 220.737 25.6575 217.184 27.6168C208.309 32.5097 197.199 34.281 186.698 34.8486C183.159 35.0399 147.197 36.2657 155.105 26.5837C158.11 22.9053 162.993 20.6229 167.764 18.7924C178.386 14.7164 190.115 12.1115 201.624 10.3984C218.367 7.90626 235.528 7.06127 252.521 7.49276C258.455 7.64343 264.389 7.92791 270.295 8.41825C280.321 9.25056 296 10.8932 305 13.0242",
    "M5 29.5014C9.61174 24.4515 12.9521 17.9873 20.9532 17.5292C23.7742 17.3676 27.0987 17.7897 29.6575 19.0014C33.2644 20.7093 35.6481 24.0004 39.4178 25.5014C48.3911 29.0744 55.7503 25.7731 63.3048 21.0292C67.9902 18.0869 73.7668 16.1366 79.3721 17.8903C85.1682 19.7036 88.2173 26.2464 94.4121 27.2514C102.584 28.5771 107.023 25.5064 113.276 20.6125C119.927 15.4067 128.83 12.3333 137.249 15.0014C141.418 16.3225 143.116 18.7528 146.581 21.0014C149.621 22.9736 152.78 23.6197 156.284 24.2514C165.142 25.8479 172.315 17.5185 179.144 13.5014C184.459 10.3746 191.785 8.74853 195.868 14.5292C199.252 19.3205 205.597 22.9057 211.621 22.5014C215.553 22.2374 220.183 17.8356 222.979 15.5569C225.4 13.5845 227.457 11.1105 230.742 10.5292C232.718 10.1794 234.784 12.9691 236.164 14.0014C238.543 15.7801 240.717 18.4775 243.356 19.8903C249.488 23.1729 255.706 21.2551 261.079 18.0014C266.571 14.6754 270.439 11.5202 277.146 13.6125C280.725 14.7289 283.221 17.209 286.393 19.0014C292.321 22.3517 298.255 22.5014 305 22.5014",
    "M17.0039 32.6826C32.2307 32.8412 47.4552 32.8277 62.676 32.8118C67.3044 32.807 96.546 33.0555 104.728 32.0775C113.615 31.0152 104.516 28.3028 102.022 27.2826C89.9573 22.3465 77.3751 19.0254 65.0451 15.0552C57.8987 12.7542 37.2813 8.49399 44.2314 6.10216C50.9667 3.78422 64.2873 5.81914 70.4249 5.96641C105.866 6.81677 141.306 7.58809 176.75 8.59886C217.874 9.77162 258.906 11.0553 300 14.4892",
    "M4.99805 20.9998C65.6267 17.4649 126.268 13.845 187.208 12.8887C226.483 12.2723 265.751 13.2796 304.998 13.9998",
    "M5 29.8857C52.3147 26.9322 99.4329 21.6611 146.503 17.1765C151.753 16.6763 157.115 15.9505 162.415 15.6551C163.28 15.6069 165.074 15.4123 164.383 16.4275C161.704 20.3627 157.134 23.7551 153.95 27.4983C153.209 28.3702 148.194 33.4751 150.669 34.6605C153.638 36.0819 163.621 32.6063 165.039 32.2029C178.55 28.3608 191.49 23.5968 204.869 19.5404C231.903 11.3436 259.347 5.83254 288.793 5.12258C294.094 4.99476 299.722 4.82265 305 5.45025"
  ];

  // Global cycling state (matches globalSVGState in the Framer component)
  let globalNextIndex = Math.floor(Math.random() * 6);
  function getNextIndex() {
    const current = globalNextIndex;
    globalNextIndex = (globalNextIndex + 1) % 6;
    return current;
  }

  // Port of scalePathCoordinates — scales X coordinates proportionally to text width
  // (paths are authored at BASE_W = 310px; scaleX = textWidth / 310)
  function scalePathCoordinates(path, scaleX) {
    return path.replace(
      /([ML])\s*([\d.]+)\s+([\d.]+)|([C])\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/g,
      (match, cmd1, x1, y1, cmd2, cx1, cy1, cx2, cy2, x2, y2) => {
        if (cmd1) {
          return `${cmd1}${parseFloat(x1) * scaleX} ${y1}`;
        } else if (cmd2) {
          return `${cmd2}${parseFloat(cx1) * scaleX} ${cy1} ${parseFloat(cx2) * scaleX} ${cy2} ${parseFloat(x2) * scaleX} ${y2}`;
        }
        return match;
      }
    );
  }

  const svgNS = 'http://www.w3.org/2000/svg';

  document.querySelectorAll('header nav a.nav-link').forEach(link => {
    let currentPathEl = null;
    let eraseTimer = null;

    // Each link can have its own underline color via data-underline-color attribute
    const linkColor = link.dataset.underlineColor || DEFAULT_UNDERLINE_COLOR;

    // Pre-assign each link its own starting variant index
    let nextVariantIndex = getNextIndex();

    function getLinkWidth() {
      return link.getBoundingClientRect().width;
    }

    function buildUnderlineSVG(scaledPath, textWidth, svgHeight) {
      // Remove any existing underline from a previous hover
      const existing = link.querySelector('.nav-underline-wrap');
      if (existing) existing.remove();

      const padY = 2; // small vertical padding around the stroke (matches paddedViewBox logic)

      const wrap = document.createElement('div');
      wrap.className = 'nav-underline-wrap';
      wrap.style.cssText = `
        width: ${textWidth}px;
        height: ${svgHeight}px;
      `;

      const svg = document.createElementNS(svgNS, 'svg');
      // viewBox matches paddedViewBox from the Framer component
      svg.setAttribute('viewBox', `0 ${-padY} ${textWidth} ${BASE_H + padY * 2}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('fill', 'none');
      svg.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        overflow: visible;
        pointer-events: none;
        will-change: transform;
      `;

      const pathEl = document.createElementNS(svgNS, 'path');
      pathEl.setAttribute('d', scaledPath);
      pathEl.setAttribute('stroke', linkColor);
      pathEl.setAttribute('stroke-width', STROKE_WIDTH);
      pathEl.setAttribute('stroke-linecap', 'round');
      pathEl.setAttribute('fill', 'none');
      pathEl.setAttribute('vector-effect', 'non-scaling-stroke');
      pathEl.style.willChange = 'stroke-dashoffset';

      svg.appendChild(pathEl);
      wrap.appendChild(svg);
      link.appendChild(wrap);
      return pathEl;
    }

    link.addEventListener('mouseenter', () => {
      clearTimeout(eraseTimer);

      const textWidth = getLinkWidth();
      const scaleX = textWidth / BASE_W;
      // svgHeight mirrors: underlineHeightPx = rect.width * BASE_H / BASE_W
      const svgHeight = textWidth * BASE_H / BASE_W;
      const scaledPath = scalePathCoordinates(svgVariants[nextVariantIndex], scaleX);

      // Advance global variant for next hover (matches handleHoverStart → setNextIndex logic)
      nextVariantIndex = getNextIndex();

      const pathEl = buildUnderlineSVG(scaledPath, textWidth, svgHeight);
      currentPathEl = pathEl;

      // Measure actual path length AFTER inserting into DOM
      const totalLength = pathEl.getTotalLength();

      // ── hidden state (pathLength:0, pathOffset:0 in Framer)
      //    dasharray = totalLength, dashoffset = totalLength → nothing visible
      pathEl.style.strokeDasharray = totalLength;
      pathEl.style.strokeDashoffset = totalLength;
      pathEl.style.transition = 'none';

      // Force layout flush so the browser registers the starting state
      pathEl.getBoundingClientRect();

      // ── visible state (pathLength:1, pathOffset:0 in Framer)
      //    dashoffset → 0 : draws the stroke left to right
      pathEl.style.transition = `stroke-dashoffset ${DRAW_MS}ms ${EASE}`;
      pathEl.style.strokeDashoffset = 0;
    });

    link.addEventListener('mouseleave', () => {
      const pathEl = currentPathEl;
      if (!pathEl) return;

      const totalLength = parseFloat(pathEl.style.strokeDasharray);

      // ── erase state (pathLength:1, pathOffset:1 in Framer)
      //    dashoffset → -totalLength : slides the entire stroke off to the right
      pathEl.style.transition = `stroke-dashoffset ${ERASE_MS}ms ${EASE}`;
      pathEl.style.strokeDashoffset = -totalLength;

      eraseTimer = setTimeout(() => {
        const wrap = link.querySelector('.nav-underline-wrap');
        if (wrap) wrap.remove();
        currentPathEl = null;
      }, ERASE_MS + 50);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Smooth scrolling for nav link clicks
  // ─────────────────────────────────────────────────────────────────────────────
  document.querySelectorAll('header nav a.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
          history.pushState(null, null, targetId);
        }
      }
    });
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// MacBook Scroll & Curvy Wipe Entrance Animation
// Consolidated in a single high-performance rAF loop
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const mbkRoot = document.getElementById('mbk-root');
  const mbkSticky = document.getElementById('mbk-sticky');
  const mbkScreen = document.getElementById('mbk-screen');
  const mbkWrap = document.getElementById('mbk-mac-wrap');
  const mbkFull = document.getElementById('mbk-fullscreen');
  const mbkInfo = document.getElementById('mbk-info-side');

  // Split title text into character spans for scroll-reveal
  const mbkTitle = document.querySelector('.mbk-info-title');
  let mbkChars = [];
  if (mbkTitle) {
    const lines = mbkTitle.innerHTML.split(/<br\s*\/?>/i);
    // Find global text length for center reference
    const totalText = lines.join(' ').trim().replace(/\s+/g, ' ');
    const chars = totalText.split('');
    const centerIndex = Math.floor(chars.length / 2);

    let charGlobalIdx = 0;
    mbkTitle.innerHTML = lines.map(line => {
      const lineText = line.trim().replace(/\s+/g, ' ');
      return lineText.split('').map(char => {
        const isSpace = char === ' ';
        const dist = charGlobalIdx - centerIndex;
        charGlobalIdx++;
        return `<span class="mbk-char ${isSpace ? 'mbk-char-space' : ''}" data-dist="${dist}">${char}</span>`;
      }).join('');
    }).join('<br>');

    mbkChars = [...mbkTitle.querySelectorAll('.mbk-char')];
  }

  // Wipe overlay elements
  const wipeOverlay = document.getElementById('mbkWipeOverlay');
  const wipePath = document.getElementById('mbkWipePath');

  if (!mbkRoot || !mbkScreen) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Curve physics state
  let curAmp = 0;
  let targetAmp = 0;
  let lastY = window.scrollY;
  let lastT = performance.now();

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function mbkMap(v, i0, i1, o0, o1) {
    const t = Math.max(0, Math.min(1, (v - i0) / (i1 - i0)));
    return o0 + (o1 - o0) * t;
  }

  function drawCurve(amp) {
    if (!wipePath) return;
    const a = clamp(amp, 0, 11.5);
    // Top edge at y=0 joins the solid fill above.
    // Curve bulges downward to y=a, creating a smooth trailing edge.
    const d = `M0,0 L0,0 C25,${a} 75,${a} 100,0 L100,0 Z`;
    wipePath.setAttribute('d', d);
  }

  let zoomStartRect = null;
  let smoothP = 0; // smooth interpolated scroll progress

  function tick(now) {
    const dt = Math.max(now - lastT, 1);
    const y = window.scrollY;
    const vel = Math.abs(y - lastY) / dt;
    lastY = y;
    lastT = now;

    // Check visibility to save idle CPU cycles
    const rect = mbkRoot.getBoundingClientRect();
    if (rect.bottom < 0) {
      // Section scrolled past — kill the fullscreen overlay so rest of page is visible
      if (mbkFull) mbkFull.style.opacity = '0';
      if (wipeOverlay) wipeOverlay.style.transform = 'translateY(-115%)';
      smoothP = 1; // snap to end
      requestAnimationFrame(tick);
      return;
    }
    if (rect.top > window.innerHeight) {
      // Section not yet reached — keep wipe covering
      if (wipeOverlay) wipeOverlay.style.transform = 'translateY(0%)';
      if (mbkFull) mbkFull.style.opacity = '0';
      smoothP = 0; // snap to start
      requestAnimationFrame(tick);
      return;
    }

    const total = mbkRoot.offsetHeight - window.innerHeight;
    const rawP = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;

    // Smooth interpolation (lerp) for dampening/delay — lowered to 0.07 for luxurious inertia easing
    smoothP += (rawP - smoothP) * 0.07;

    // 1. Wipe Overlay Transition (0.0 -> 0.15) — tight, no wasted space
    if (wipeOverlay) {
      const travel = mbkMap(smoothP, 0, 0.15, 0, -115);
      wipeOverlay.style.transform = `translateY(${travel}%)`;

      targetAmp = reduced ? 0 : Math.min(vel * 55, 11);
      curAmp += (targetAmp - curAmp) * 0.18;
      const ambient = reduced ? 0 : Math.sin(now / 900) * 0.6 + 0.9;
      drawCurve(curAmp + ambient);
    }

    // 2. MacBook animation
    if (reduced) {
      mbkScreen.style.transform = 'translateY(160px) rotateX(0deg) scaleX(1.5) scaleY(1.5)';
      if (mbkFull) {
        mbkFull.style.opacity = '0';
      }
      if (mbkWrap) {
        mbkWrap.style.opacity = '1';
      }
      if (mbkInfo) {
        mbkInfo.style.opacity = '0';
        mbkInfo.style.transform = 'translate3d(0, 100px, 0)';
      }
    } else {
      // Phase 1: Lid opens (0.08 -> 0.35)
      const sx = mbkMap(smoothP, 0.08, 0.35, 1.2, 1.5);
      const sy = mbkMap(smoothP, 0.08, 0.35, 0.6, 1.5);
      const rx = smoothP <= 0.15 ? -28 : mbkMap(smoothP, 0.15, 0.35, -28, 0);
      const ty = mbkMap(smoothP, 0.08, 0.35, 0, 105);
      mbkScreen.style.transform = `translateY(${ty}px) rotateX(${rx}deg) scaleX(${sx}) scaleY(${sy})`;

      // Character-reveal scrolling animation (smoothP 0.0 -> 0.45)
      if (mbkChars.length > 0) {
        const charProgress = mbkMap(smoothP, 0.0, 0.4, 0, 1);
        mbkChars.forEach(charEl => {
          const dist = parseFloat(charEl.getAttribute('data-dist') || '0');
          // Interpolate horizontal offset from dist * 32 to 0
          const x = dist * 32 * (1 - charProgress);
          // Rise upward from below by 60px as we progress
          const y = 60 * (1 - charProgress);
          // Interpolate 3D tilt from dist * 25 to 0
          const rx = dist * 25 * (1 - charProgress);

          charEl.style.transform = `translateX(${x.toFixed(1)}px) translateY(${y.toFixed(1)}px) rotateX(${rx.toFixed(1)}deg)`;
          charEl.style.opacity = String(Math.max(0, Math.min(1, charProgress * 1.5)));
        });
      }

      // Entire info container exit fade/slide upward (0.45 -> 0.65)
      if (mbkInfo) {
        if (smoothP < 0.45) {
          mbkInfo.style.transform = 'translate3d(0, 0, 0)';
          mbkInfo.style.opacity = '1';
        } else {
          mbkInfo.style.transform = `translate3d(0, ${mbkMap(smoothP, 0.45, 0.65, 0, -60)}px, 0)`;
          mbkInfo.style.opacity = String(mbkMap(smoothP, 0.45, 0.65, 1, 0));
        }
      }

      // Keep MacBook visible and hide fullscreen overlay
      if (mbkFull) {
        mbkFull.style.opacity = '0';
      }
      if (mbkWrap) {
        mbkWrap.style.opacity = '1';
      }
    }

    requestAnimationFrame(tick);
  }


  window.addEventListener('resize', () => {
    zoomStartRect = null;
  });

  requestAnimationFrame(tick);
});


// ─────────────────────────────────────────────────────────────────────────────
// 4. Interactive Experience Slideshow Component
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('exp-slideshow-container');
  const gridView = document.getElementById('exp-grid-view');
  const zoomedView = document.getElementById('exp-zoomed-view');
  const zoomedImg = document.getElementById('exp-zoomed-img');
  const prevBtn = document.getElementById('exp-prev-btn');
  const nextBtn = document.getElementById('exp-next-btn');
  const closeBtn = document.getElementById('exp-close-btn');
  const indicators = document.querySelectorAll('.exp-indicator');
  const cards = document.querySelectorAll('.exp-card');
  const details = document.querySelectorAll('.exp-slide-detail');

  if (!container || !gridView || !zoomedView) return;

  let activeIndex = null;
  let scrollCooldown = false;

  // Hover effect to highlight corresponding letters in the background word "EXPERIENCE"
  const bgLetters = document.querySelectorAll('.exp-bg-text span');
  const indexToSpanMap = {
    0: [0, 1], // Card 0 (E1) -> Spans 0 & 1 (E, X)
    1: [3, 4], // Card 1 (P)  -> Spans 3 & 4 (E, R)
    2: [5, 6], // Card 2 (R)  -> Spans 5 & 6 (I, E)
    3: [8, 9]  // Card 3 (N)  -> Spans 8 & 9 (C, E)
  };

  cards.forEach(card => {
    const idx = parseInt(card.getAttribute('data-index'), 10);
    card.addEventListener('mouseenter', () => {
      const spanIndices = indexToSpanMap[idx];
      if (spanIndices) {
        spanIndices.forEach(spanIdx => {
          if (bgLetters[spanIdx]) bgLetters[spanIdx].classList.add('highlight');
        });
      }
    });
    card.addEventListener('mouseleave', () => {
      const spanIndices = indexToSpanMap[idx];
      if (spanIndices) {
        spanIndices.forEach(spanIdx => {
          if (bgLetters[spanIdx]) bgLetters[spanIdx].classList.remove('highlight');
        });
      }
    });
  });

  function showSlide(index) {
    const leftSlides = document.querySelectorAll('.exp-slide-left');
    const rightSlides = document.querySelectorAll('.exp-slide-right');
    const totalSlides = leftSlides.length || 4;

    if (index < 0 || index >= totalSlides) return;

    activeIndex = index;

    // Update active class on left job details
    leftSlides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update active class on right job details
    rightSlides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Update horizontal slideshow cards
    const trackCards = document.querySelectorAll('.exp-slideshow-card');
    const isMobile = window.innerWidth <= 768;
    const cardWidth = isMobile ? 180 : 250; // base width
    const gap = isMobile ? 16 : 32;       // gap

    trackCards.forEach((card, idx) => {
      card.classList.remove('active', 'inactive');

      const offset = idx - index;
      let scale = 1.0;
      let opacity = 1.0;
      let xOffset = 0;
      let zIndex = 10;

      if (offset === 0) {
        card.classList.add('active');
        scale = 1.15;
        opacity = 1.0;
        zIndex = 20;
      } else {
        card.classList.add('inactive');
        scale = 0.8;
        opacity = 0.15;
        zIndex = 10 - Math.abs(offset);
        xOffset = offset * (cardWidth * scale + gap);
      }

      card.style.transform = `translate(-50%, -50%) translate3d(${xOffset}px, 0, 0) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = zIndex;
    });

    // Update active state on indicator letters
    indicators.forEach((ind, i) => {
      if (i === index) {
        ind.classList.add('active');
      } else {
        ind.classList.remove('active');
      }
    });
  }

  const expRevealRoot = document.getElementById('exp-reveal-root');
  const expRevealSticky = document.getElementById('exp-reveal-sticky');

  function openSlideshow(index) {
    document.body.style.overflow = 'hidden'; // Lock background scrolling
    if (expRevealRoot) expRevealRoot.classList.add('slideshow-open');
    if (expRevealSticky) expRevealSticky.classList.add('slideshow-open');

    gridView.style.opacity = '0';
    gridView.style.transform = 'scale(0.95)';

    setTimeout(() => {
      gridView.style.display = 'none';
      zoomedView.style.display = 'block';
      zoomedView.style.opacity = '0';
      zoomedView.style.transform = 'scale(0.98)';

      // Force repaint
      zoomedView.getBoundingClientRect();

      zoomedView.style.opacity = '1';
      zoomedView.style.transform = 'scale(1)';
      showSlide(index);
    }, 200);
  }

  function closeSlideshow() {
    document.body.style.overflow = ''; // Unlock background scrolling
    zoomedView.style.opacity = '0';
    zoomedView.style.transform = 'scale(0.98)';

    setTimeout(() => {
      zoomedView.style.display = 'none';
      gridView.style.display = 'flex';
      gridView.style.opacity = '0';
      gridView.style.transform = 'scale(0.95)';

      if (expRevealRoot) expRevealRoot.classList.remove('slideshow-open');
      if (expRevealSticky) expRevealSticky.classList.remove('slideshow-open');

      // Force repaint
      gridView.getBoundingClientRect();

      gridView.style.opacity = '1';
      gridView.style.transform = 'scale(1)';
      activeIndex = null;
    }, 200);
  }

  // Click handlers on grid cards
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.index, 10);
      openSlideshow(idx);
    });
  });


  // Click handlers on track cards inside zoomed view
  const trackCards = document.querySelectorAll('.exp-slideshow-card');
  trackCards.forEach(tCard => {
    tCard.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(tCard.getAttribute('data-index'), 10);
      if (idx === activeIndex) {
        closeSlideshow();
      } else {
        showSlide(idx);
      }
    });
  });

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (activeIndex === null) return;
    if (e.key === 'Escape') {
      closeSlideshow();
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
      if (activeIndex < 3) showSlide(activeIndex + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
      if (activeIndex > 0) showSlide(activeIndex - 1);
    }
  });

  // Wheel scroll navigation within zoomed area
  container.addEventListener('wheel', (e) => {
    if (activeIndex === null) return;

    // Prevent default scroll only when inside slideshow active state
    e.preventDefault();

    if (scrollCooldown) return;
    const delta = e.deltaY;
    if (Math.abs(delta) < 15) return; // scroll threshold

    scrollCooldown = true;
    if (delta > 0) {
      if (activeIndex < 3) showSlide(activeIndex + 1);
    } else {
      if (activeIndex > 0) showSlide(activeIndex - 1);
    }

    setTimeout(() => {
      scrollCooldown = false;
    }, 600); // cooldown matches transition
  }, { passive: false });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Redesigned Layout Event Controllers & Transitions
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // --- Landing Page Animations Trigger for Hero Section ---
  const heroContainer = document.getElementById('hero');
  if (heroContainer) {
    setTimeout(() => {
      document.body.classList.add('is-in');
    }, 120);
  }

  // --- 5.1 Growing Navigation Animation & Event Handlers ---
  (function initGrowingNavigation() {
    const scrollIndicator = document.getElementById('scroll-pct-indicator');
    const panel = document.getElementById('growingNavPanel');
    const toggle = document.getElementById('growingNavToggle');
    const backdrop = document.getElementById('growing-nav-backdrop');
    const content = document.getElementById('growingNavContent');
    const navLinks = panel ? panel.querySelectorAll('.growing-nav-link') : [];
    const socialItems = panel ? panel.querySelectorAll('.growing-nav-social-item') : [];
    const socialsContainer = panel ? panel.querySelector('.growing-nav-socials') : null;
    const rightSide = panel ? panel.querySelector('.growing-nav-right') : null;
    const divider = panel ? panel.querySelector('.growing-nav-divider') : null;

    if (!panel || !toggle) return;

    let isOpen = false;

    // Scroll percentage is tracked by the universal scroll percentage module below

    // Determine state sizes
    const getMobileMode = () => window.innerWidth <= 767;
    const collapsedWidth = 140;
    const collapsedHeight = 48;
    const desktopOpenWidth = 480;

    // Open/Close Actions
    const openMenu = () => {
      isOpen = true;
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      backdrop.classList.add('is-active');

      const isMobile = getMobileMode();

      // Lock scroll on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }

      // 1. First, prepare content visibility
      content.style.display = 'flex';

      // 2. Clear GSAP styles from subelements so they start clean
      gsap.killTweensOf([panel, navLinks, rightSide, divider]);

      // 3. Animate Panel Dimensions
      const targetWidth = isMobile ? window.innerWidth : desktopOpenWidth;
      
      // Calculate panel expanded height
      panel.style.width = isMobile ? '100vw' : `${desktopOpenWidth}px`;
      panel.style.height = 'auto';
      panel.style.borderRadius = isMobile ? '0px' : '20px';
      
      const targetHeight = isMobile ? window.innerHeight : panel.scrollHeight;
      
      // Reset width/height for GSAP animation start
      gsap.set(panel, {
        width: isMobile ? '100vw' : `${collapsedWidth}px`,
        height: `${collapsedHeight}px`,
        top: isMobile ? '24px' : '24px',
        left: isMobile ? '50%' : '50%',
        xPercent: -50,
        right: 'auto',
        borderRadius: '24px'
      });

      gsap.to(panel, {
        width: isMobile ? window.innerWidth : desktopOpenWidth,
        height: targetHeight,
        top: isMobile ? 0 : 24,
        left: isMobile ? '0%' : '50%',
        xPercent: isMobile ? 0 : -50,
        borderRadius: isMobile ? 0 : 20,
        duration: 0.5,
        ease: "elastic.out(1, 0.85)", // custom elastic spring ease matching Framer!
        onComplete: () => {
          if (!isMobile) panel.style.height = 'auto'; // allow self-resizing if content wraps
        }
      });

      // 4. Staggered reveal of navigation items (blur-fade in)
      gsap.fromTo(navLinks, 
        { opacity: 0, y: 16, filter: 'blur(8px)' },
        { 
          opacity: 1, 
          y: 0, 
          filter: 'blur(0px)', 
          duration: 0.45, 
          stagger: 0.06, 
          ease: "power2.out", 
          delay: 0.1 
        }
      );

      // 5. Staggered reveal of divider & right side content
      gsap.fromTo([divider, rightSide],
        { opacity: 0, y: 12, filter: 'blur(8px)' },
        { 
          opacity: 1, 
          y: 0, 
          filter: 'blur(0px)', 
          duration: 0.5, 
          stagger: 0.08, 
          ease: "power2.out", 
          delay: 0.25 
        }
      );
    };

    const closeMenu = () => {
      isOpen = false;
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      backdrop.classList.remove('is-active');
      document.body.style.overflow = ''; // Unlock scroll

      const isMobile = getMobileMode();

      gsap.killTweensOf([panel, navLinks, rightSide, divider]);

      // 1. Stagger fade out navigation items
      gsap.to([navLinks, divider, rightSide], {
        opacity: 0,
        y: 12,
        filter: 'blur(6px)',
        duration: 0.2,
        stagger: { each: 0.03, from: "end" },
        ease: "power2.in",
        onComplete: () => {
          content.style.display = 'none';
        }
      });

      // 2. Animate panel back to collapsed size
      gsap.to(panel, {
        width: collapsedWidth,
        height: collapsedHeight,
        top: 24,
        left: '50%',
        xPercent: -50,
        right: 'auto',
        borderRadius: 24,
        duration: 0.4,
        ease: "power3.inOut"
      });
    };

    // Toggle click event
    toggle.addEventListener('click', () => {
      if (isOpen) closeMenu();
      else openMenu();
    });

    // Backdrop click event
    backdrop.addEventListener('click', closeMenu);

    // Close menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        closeMenu();

        if (targetId && targetId.startsWith('#')) {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Escape key closes menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeMenu();
      }
    });

    // Social links interactions: Sibling dimming
    socialItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        socialItems.forEach(el => el.classList.remove('is-hovered'));
        item.classList.add('is-hovered');
        if (socialsContainer) socialsContainer.classList.add('has-hovered-child');
      });

      item.addEventListener('mouseleave', () => {
        item.classList.remove('is-hovered');
        if (socialsContainer) socialsContainer.classList.remove('has-hovered-child');
      });
    });
  })();

  // --- 5.2 Interactive Leadership Attributes Cards (Aceternity inspired) ---
  (function initLeadershipCards() {
    const container = document.getElementById('leadershipCardsContainer');
    if (!container) return;

    const cardsData = [
      {
        title: "Drive Change & Innovation",
        desc: "Drives change, challenges norms, and champions innovation to pioneer industry shifts.",
        colorClass: "bg-orange-500 text-white",
        skeletonClass: "bg-orange-600",
        imageSrc: "assets/747072ce-3e2b-4bb7-9a41-c9e280860e8f.png",
        config: { y: -20, rotate: -15, zIndex: 2 }
      },
      {
        title: "Executive Presence",
        desc: "Communicate confidently with executive presence, translating complex roadmaps for C-level buy-in.",
        colorClass: "bg-stone-200 text-black",
        skeletonClass: "bg-neutral-400",
        imageSrc: "assets/6751c78a-4104-42a2-8a10-224766d8baba.png",
        config: { y: 20, rotate: 8, zIndex: 3 }
      },
      {
        title: "Cross-Functional Sync",
        desc: "Leverages cross-functional teams to solve high-impact problems and deliver margin acceleration.",
        colorClass: "bg-blue-500 text-white",
        skeletonClass: "bg-blue-600",
        imageSrc: "assets/c18fb093-bd45-4d59-9e2b-feeabb1c49d3.png",
        config: { y: -80, rotate: -5, zIndex: 4 }
      },
      {
        title: "Mentorship & Growth",
        desc: "Builds and mentors high-performing teams with a growth mindset, cultivating tomorrow's leaders.",
        colorClass: "bg-purple-500 text-white",
        skeletonClass: "bg-purple-600",
        imageSrc: "assets/8af3acbb-aa4e-4fd0-9cb3-1b5bec74e827.png",
        config: { y: 20, rotate: 12, zIndex: 5 }
      },
      {
        title: "Strategic Execution",
        desc: "Translates high-level corporate roadmap objectives into solid engineering delivery pipelines.",
        colorClass: "bg-neutral-900 text-white",
        skeletonClass: "bg-neutral-950",
        imageSrc: "assets/6b0dd83d-4ca7-4ea2-9ce7-53dd4116391b.png",
        config: { y: 20, rotate: -5, zIndex: 6 }
      }
    ];

    // Render cards inside container
    container.innerHTML = cardsData.map((card, idx) => `
      <button class="leadership-card ${card.colorClass}" data-index="${idx}" style="z-index: ${card.config.zIndex};">
        <div class="card-skeleton ${card.skeletonClass}">
          <img src="${card.imageSrc}" class="card-skeleton-img" alt="${card.title}">
        </div>
        <div class="card-content">
          <h3 class="card-title">${card.title}</h3>
          <p class="card-desc">${card.desc}</p>
        </div>
      </button>
    `).join('');

    const cards = container.querySelectorAll('.leadership-card');
    let activeIndex = null;

    function getSpacing() {
      return window.innerWidth >= 1024 ? 180 : 70; // responsive cardSpacing
    }

    function getScrollProgress() {
      const section = document.getElementById('leadership');
      if (!section) return 1;

      const rect = section.getBoundingClientRect();
      const viewH = window.innerHeight;

      // Start reveal when section top is 100px from viewport bottom
      const start = viewH - 100;
      // Fully revealed when section top is 20% of viewport height from the top
      const end = viewH * 0.20;

      if (rect.top >= start) return 0;
      if (rect.top <= end) return 1;

      return 1 - (rect.top - end) / (start - end);
    }

    function updateCards() {
      const spacing = getSpacing();
      const middle = (cardsData.length - 1) / 2;
      const isAnyActive = activeIndex !== null;
      const scrollProgress = getScrollProgress();

      if (isAnyActive) {
        container.classList.add('any-active');
      } else {
        container.classList.remove('any-active');
      }

      cards.forEach((card, idx) => {
        const config = cardsData[idx].config;
        const offsetX = (idx - middle) * spacing;

        const isActive = activeIndex === idx;

        // Calculate card-specific reveal progress (staggered unfolding)
        const cardStart = idx * 0.11;
        const cardEnd = cardStart + 0.44;
        const p = Math.max(0, Math.min(1, (scrollProgress - cardStart) / (cardEnd - cardStart)));
        // Easing for luxurious motion inertia
        const easeP = p * p * (3 - 2 * p);

        let x = 0;
        let y = 0;
        let rotate = 0;
        let scale = 1;
        let opacity = 1;
        let zIndex = config.zIndex;

        if (isActive) {
          x = 0;
          y = 0;
          rotate = 0;
          scale = 1.15;
          zIndex = 50;
          opacity = 1;
          card.classList.add('active');
        } else {
          card.classList.remove('active');
          if (isAnyActive) {
            x = (offsetX * 0.4) * easeP;
            y = 400 * easeP + 250 * (1 - easeP);
            rotate = (config.rotate * 0.2) * easeP;
            scale = 0.7 * easeP + 0.5 * (1 - easeP);
            opacity = easeP;
          } else {
            x = offsetX * easeP;
            y = 250 * (1 - easeP) + config.y * easeP;
            rotate = config.rotate * easeP;
            scale = 0.65 * (1 - easeP) + 1.0 * easeP;
            opacity = easeP;
          }
        }

        card.style.transform = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
        card.style.opacity = String(opacity);
        card.style.zIndex = zIndex;
        card.style.pointerEvents = opacity > 0.3 ? 'auto' : 'none';
      });
    }

    // Handle click on cards
    cards.forEach((card, idx) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (activeIndex === idx) {
          activeIndex = null; // deactivate if clicked again
        } else {
          activeIndex = idx; // activate clicked card
        }
        updateCards();
      });

      // Hover scale bumps when no cards are active
      card.addEventListener('mouseenter', () => {
        if (activeIndex === null) {
          const scrollProgress = getScrollProgress();
          if (scrollProgress < 0.6) return; // disable hover zoom before reveal
          const config = cardsData[idx].config;
          const middle = (cardsData.length - 1) / 2;
          const spacing = getSpacing();
          const offsetX = (idx - middle) * spacing;
          card.style.transform = `translate(${offsetX}px, ${config.y}px) rotate(${config.rotate}deg) scale(1.05)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        if (activeIndex === null) {
          updateCards();
        }
      });
    });

    // Click outside deactivates active card
    document.addEventListener('click', (e) => {
      if (activeIndex !== null && !container.contains(e.target)) {
        activeIndex = null;
        updateCards();
      }
    });

    // Re-run on resize and scroll
    window.addEventListener('resize', updateCards);
    window.addEventListener('scroll', updateCards, { passive: true });

    // Initial layout positioning
    updateCards();
  }());



  // --- 5.4 NPI Pipeline Phone Screen Scroll Transitions ---
  const pipelineRoot = document.getElementById('pipeline-root');
  const pipelineSteps = document.querySelectorAll('.pipeline-step');
  const phoneScreens = document.querySelectorAll('.phone-screen');

  if (pipelineRoot && pipelineSteps.length && phoneScreens.length) {
    // Monitor scroll coordinates to transition phone screens
    window.addEventListener('scroll', () => {
      const viewportH = window.innerHeight;
      let activeIdx = 0;

      // Find the step closest to the middle of the viewport
      pipelineSteps.forEach((step, idx) => {
        const rect = step.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        if (center > 0 && center < viewportH) {
          activeIdx = idx;
        } else if (rect.top <= 0 && rect.bottom >= viewportH) {
          activeIdx = idx;
        }
      });

      // Update screen active classes
      phoneScreens.forEach((screen, idx) => {
        if (idx === activeIdx) {
          screen.className = 'phone-screen active';
        } else if (idx < activeIdx) {
          screen.className = 'phone-screen prev';
        } else {
          screen.className = 'phone-screen';
        }
      });
    }, { passive: true });
  }

});

// Leadership section reveal logic
(function leadershipReveal() {
  const section = document.getElementById('leadership');
  if (!section) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          section.classList.add('in-view');
          obs.disconnect();
        }
      });
    },
    { threshold: 0.15 }
  );
  obs.observe(section);
}());




// ─────────────────────────────────────────────────────────────────────────────
// 3D Confidential Folder Click Toggle
// ─────────────────────────────────────────────────────────────────────────────
(function folderToggle() {
  const folder = document.querySelector('.folder-container');
  if (!folder) return;

  let animating = false;

  folder.addEventListener('click', () => {
    if (animating) return;

    if (!folder.classList.contains('is-extracted')) {
      animating = true;

      // Step 1: Cover remains open, sheet slides completely out
      folder.classList.add('state-1');

      setTimeout(() => {
        // Step 2: Cover closes, sheet moves to front and slides back on top
        folder.classList.remove('state-1');
        folder.classList.add('state-2');

        setTimeout(() => {
          // Step 3: Tilts slightly
          folder.classList.remove('state-2');
          folder.classList.add('is-extracted');
          animating = false;
        }, 300);
      }, 300);

    } else {
      animating = true;

      // Step 2: Lay flat
      folder.classList.remove('is-extracted');
      folder.classList.add('state-2');

      setTimeout(() => {
        // Step 1: Slide out
        folder.classList.remove('state-2');
        folder.classList.add('state-1');

        setTimeout(() => {
          // Step 0: Slide inside behind the cover
          folder.classList.remove('state-1');
          animating = false;
        }, 300);
      }, 300);
    }
  });
}());

// ─────────────────────────────────────────────────────────────────────────────
// 6. Crowd Simulator Footer Canvas Animation
// ─────────────────────────────────────────────────────────────────────────────
(function initCrowdCanvas() {
  const canvas = document.getElementById('crowd-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const config = {
    src: 'assets/open-peeps-sheet.png',
    rows: 15,
    cols: 7
  };

  // Helper ranges and randomizers
  const randomRange = (min, max) => min + Math.random() * (max - min);
  const randomIndex = (array) => randomRange(0, array.length) | 0;
  const removeFromArray = (array, i) => array.splice(i, 1)[0];
  const removeItemFromArray = (array, item) => {
    const idx = array.indexOf(item);
    if (idx > -1) removeFromArray(array, idx);
  };
  const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array));
  const getRandomFromArray = (array) => array[randomIndex(array)];

  const peepScale = 0.52; // Scale factor to prevent cartoon peeps from exceeding dimension

  // Tween reset state for peeps
  const resetPeep = ({ stage, peep }) => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    // vertical scattering for depth — shift down slightly (+35) to clip sprites and cover transparent bottom padding
    const offsetY = -40 * gsap.parseEase("power2.in")(Math.random());
    const startY = stage.height - peep.height * peepScale + offsetY + 30; // account for scaling and shift to bottom
    let startX, endX;

    if (direction === 1) {
      startX = -peep.width * peepScale;
      endX = stage.width;
      peep.scaleX = peepScale; // scale factor
    } else {
      startX = stage.width + peep.width * peepScale;
      endX = -peep.width * peepScale;
      peep.scaleX = -peepScale;
    }

    peep.x = startX;
    peep.y = startY;
    peep.anchorY = startY;

    return { startX, startY, endX };
  };

  // Walk timeline using GSAP
  const normalWalk = ({ peep, props }) => {
    const { startX, startY, endX } = props;
    const xDuration = randomRange(12, 22); // Walk speed (not too fast, not too slow)
    const yDuration = randomRange(0.2, 0.35); // Bobbing speed

    const tl = gsap.timeline();
    tl.to(peep, {
      duration: xDuration,
      x: endX,
      ease: "none"
    }, 0);

    // Bobbing bounce height
    const bounceHeight = randomRange(4, 9);
    tl.to(peep, {
      duration: yDuration,
      repeat: Math.ceil(xDuration / yDuration),
      yoyo: true,
      y: startY - bounceHeight,
      ease: "sine.inOut"
    }, 0);

    return tl;
  };

  const walks = [normalWalk];

  // Peep factory
  const createPeep = ({ image, rect }) => {
    const peep = {
      image,
      rect,
      width: rect[2],
      height: rect[3],
      x: 0,
      y: 0,
      anchorY: 0,
      scaleX: peepScale,
      walk: null,
      render: (ctx) => {
        ctx.save();
        ctx.translate(peep.x, peep.y);
        ctx.scale(peep.scaleX, peepScale); // Scale width and height uniformly
        ctx.drawImage(
          peep.image,
          peep.rect[0],
          peep.rect[1],
          peep.rect[2],
          peep.rect[3],
          0,
          0,
          peep.width,
          peep.height
        );
        ctx.restore();
      }
    };
    return peep;
  };

  const img = new Image();
  const stage = { width: 0, height: 0 };
  const allPeeps = [];
  const availablePeeps = [];
  const crowd = [];

  const createPeeps = () => {
    const { rows, cols } = config;
    const { naturalWidth: width, naturalHeight: height } = img;
    const rectWidth = width / rows;
    const rectHeight = height / cols;
    const total = rows * cols;

    for (let i = 0; i < total; i++) {
      allPeeps.push(
        createPeep({
          image: img,
          rect: [
            (i % rows) * rectWidth,
            ((i / rows) | 0) * rectHeight,
            rectWidth,
            rectHeight
          ]
        })
      );
    }
  };

  const addPeepToCrowd = () => {
    if (!availablePeeps.length) return;
    const peep = removeRandomFromArray(availablePeeps);
    const props = resetPeep({ stage, peep });

    const walk = getRandomFromArray(walks)({ peep, props });
    walk.eventCallback("onComplete", () => {
      removePeepFromCrowd(peep);
      addPeepToCrowd();
    });

    peep.walk = walk;
    crowd.push(peep);
    crowd.sort((a, b) => a.anchorY - b.anchorY);
    return peep;
  };

  const removePeepFromCrowd = (peep) => {
    removeItemFromArray(crowd, peep);
    availablePeeps.push(peep);
  };

  const initCrowd = () => {
    // Fill crowd
    const crowdSize = Math.min(100, allPeeps.length); // large, dense crowd
    for (let i = 0; i < crowdSize; i++) {
      const peep = addPeepToCrowd();
      if (peep && peep.walk) {
        peep.walk.progress(Math.random());
      }
    }
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(devicePixelRatio, devicePixelRatio);
    crowd.forEach((peep) => peep.render(ctx));
    ctx.restore();
  };

  const resize = () => {
    stage.width = canvas.clientWidth;
    stage.height = canvas.clientHeight;
    canvas.width = stage.width * devicePixelRatio;
    canvas.height = stage.height * devicePixelRatio;

    crowd.forEach((peep) => {
      if (peep.walk) peep.walk.kill();
    });
    crowd.length = 0;
    availablePeeps.length = 0;
    availablePeeps.push(...allPeeps);

    initCrowd();
  };

  const init = () => {
    createPeeps();
    resize();
    gsap.ticker.add(render);
  };

  img.onload = init;
  img.src = config.src;

  window.addEventListener('resize', () => {
    resize();
  });
})();





// ─────────────────────────────────────────────────────────────────────────────
// Production Impact Comparison Chart Animation module
// ─────────────────────────────────────────────────────────────────────────────
(function initProductionImpact() {
  const section = document.getElementById('production-impact');
  if (!section) return;

  const barNumbers = section.querySelectorAll('.bar-number');

  // Animation duration matches the 1.8s CSS transitions on .bar-fill
  const DURATION = 1800;

  function animateCounters() {
    barNumbers.forEach(el => {
      const parentFill = el.closest('.bar-fill');

      if (!parentFill) return;

      const targetStr = parentFill.getAttribute('data-target-height') || '0%';
      const targetVal = parseInt(targetStr, 10);

      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);

        // easeOutExpo curve matches custom cubic-bezier feel
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentVal = Math.round(ease * targetVal);

        el.textContent = `${currentVal}%`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = `${targetVal}%`;
        }
      }

      requestAnimationFrame(step);
    });
  }

  // Setup Intersection Observer — fire early so animation plays while user scrolls
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        animateCounters();
        observer.unobserve(entry.target); // run only once
      }
    });
  }, {
    threshold: 0.05,            // trigger when just 5% of section is visible
    rootMargin: '0px 0px -50px 0px' // start 50px before full viewport crossing
  });

  observer.observe(section);
}());

// ─────────────────────────────────────────────────────────────────────────────
// EXPERIENCE — Centripetal letter reveal (same pattern as MacBook title)
// Letters fan out from center, collapse in + rise up as user scrolls into section.
// After letters land, experience cards fade in.
// ─────────────────────────────────────────────────────────────────────────────
(function initExpReveal() {
  const expRevealRoot = document.getElementById('exp-reveal-root');
  const expBgText   = document.getElementById('exp-bg-text');
  const expCardsGrid = document.getElementById('exp-cards-grid');

  if (!expRevealRoot || !expBgText || !expCardsGrid) return;

  const expChars = [...expBgText.querySelectorAll('span')];
  if (!expChars.length) return;

  function expMap(v, i0, i1, o0, o1) {
    const t = Math.max(0, Math.min(1, (v - i0) / (i1 - i0)));
    return o0 + (o1 - o0) * t;
  }

  let smoothP = 0;

  function tick() {
    const rect = expRevealRoot.getBoundingClientRect();

    if (rect.bottom < 0) {
      smoothP = 1;
    } else if (rect.top > window.innerHeight) {
      smoothP = 0;
    } else {
      const total = expRevealRoot.offsetHeight - window.innerHeight;
      const rawP = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
      smoothP += (rawP - smoothP) * 0.07;
    }

    // ── Phase 1: Centripetal EXPERIENCE character reveal (0.0 -> 0.45) ─────
    const charProgress = expMap(smoothP, 0.0, 0.45, 0, 1);
    expChars.forEach(charEl => {
      const dist = parseFloat(charEl.getAttribute('data-dist') || '0');
      const x = dist * 32 * (1 - charProgress);
      const y = 60 * (1 - charProgress);
      const rx = dist * 25 * (1 - charProgress);

      charEl.style.transform = `translateX(${x.toFixed(1)}px) translateY(${y.toFixed(1)}px) rotateX(${rx.toFixed(1)}deg)`;
      charEl.style.opacity = String(Math.max(0, Math.min(1, charProgress * 1.5)));
    });

    // ── Phase 2: Cards Grid Fade-in (0.45 -> 0.75) ──────────────────────────
    const cardsProgress = expMap(smoothP, 0.45, 0.75, 0, 1);
    expCardsGrid.style.opacity = String(cardsProgress.toFixed(3));
    expCardsGrid.style.transform = `translateY(${(30 * (1 - cardsProgress)).toFixed(1)}px)`;

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}());


// ─────────────────────────────────────────────────────────────────────────────
// PSCROLL — Sticky phone scroll section driver
// ─────────────────────────────────────────────────────────────────────────────
(function initPscroll() {
  const section = document.querySelector('.pscroll-section');
  if (!section) return;

  const slides = [...section.querySelectorAll('.pscroll-slide')];
  const screens = [...section.querySelectorAll('.pscroll-screen')];
  const pips = [...section.querySelectorAll('.pscroll-pip')];
  const cards = [...section.querySelectorAll('.pscroll-card')];
  const TOTAL = slides.length; // 4

  // Disable CSS transitions on these elements to allow direct scroll tracking
  const animatedElements = [...slides, ...screens, ...cards];
  animatedElements.forEach(el => {
    el.style.transition = 'none';
  });

  function updateWithProgress(progress) {
    // Determine closest active slide index for pips highlight
    const activeIdx = Math.min(Math.floor(progress * TOTAL), TOTAL - 1);
    pips.forEach((pip, idx) => {
      pip.classList.toggle('active', idx === activeIdx);
    });

    for (let i = 0; i < TOTAL; i++) {
      const center = i / (TOTAL - 1);
      const dist = progress - center;

      // Calculate opacity: 1 when directly on center, fades to 0 when distance is >= 0.25
      const opacity = Math.max(0, 1 - Math.abs(dist) * 4);

      // Calculate translateY: maps [-0.25, 0.25] progress offset to vertical translation
      const clampedDist = Math.max(-0.25, Math.min(0.25, dist));
      const translateY = clampedDist * -140;

      // Apply to left text slide
      const slide = slides[i];
      if (slide) {
        slide.style.opacity = opacity.toFixed(3);
        slide.style.transform = `translateY(calc(-50% + ${translateY.toFixed(1)}px))`;
        slide.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      }

      // Apply to center phone screen
      const screen = screens[i];
      if (screen) {
        screen.style.opacity = opacity.toFixed(3);
        screen.style.transform = `translateY(${translateY.toFixed(1)}px)`;
        screen.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      }

      // Apply to right-side context card
      const card = cards[i];
      if (card) {
        card.style.opacity = opacity.toFixed(3);
        card.style.transform = `translateY(${translateY.toFixed(1)}px)`;
        card.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
      }
    }
  }

  let rafPending = false;
  function onPscroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      const progress = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;
      updateWithProgress(progress);
      rafPending = false;
    });
  }

  // 3D Tilt Card Hover Effect on phone mockup (GSAP-powered for buttery smooth physics)
  const phone = section.querySelector('.pscroll-phone');
  if (phone) {
    const rotateAmplitude = 12;
    const scaleOnHover = 1.05;

    // Initialize 3D perspective variables via GSAP
    gsap.set(phone, { transformPerspective: 1000, transformOrigin: "center center" });

    phone.addEventListener('mousemove', (e) => {
      const rect = phone.getBoundingClientRect();
      const offsetX = e.clientX - rect.left - rect.width / 2;
      const offsetY = e.clientY - rect.top - rect.height / 2;

      const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude;
      const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude;

      gsap.to(phone, {
        rotateX: rotationX,
        rotateY: rotationY,
        scale: scaleOnHover,
        duration: 0.45,
        ease: "power2.out",
        overwrite: "auto"
      });
    });

    phone.addEventListener('mouseleave', () => {
      gsap.to(phone, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.7,
        ease: "power3.out",
        overwrite: "auto"
      });
    });
  }

  // Bind scroll event
  window.addEventListener('scroll', onPscroll, { passive: true });
  window.addEventListener('resize', onPscroll, { passive: true });
  onPscroll();
}());


// ─────────────────────────────────────────────────────────────────────────────
// 6. Interactive Growth Chart (Compounding Impact) Component
// ─────────────────────────────────────────────────────────────────────────────
(function initGrowthChart() {
  const zone = document.getElementById('growth-zone');
  const sticky = document.getElementById('growth-sticky');
  const camera = document.getElementById('growth-camera');
  const svg = document.getElementById('growth-svg');
  const axisEl = document.getElementById('growth-axis');
  const lineEl = document.getElementById('growth-line');
  const dotsG = document.getElementById('growth-dots');
  const tipwrap = document.getElementById('growth-tipwrap');
  const stillwrap = document.getElementById('growth-stillwrap');
  const tagsWrap = document.getElementById('growth-tags');
  const numval = document.getElementById('growth-numval');
  const bar = document.getElementById('growth-bar');

  if (!zone || !sticky || !camera || !svg || !lineEl) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const NODES = [
    { 
      nx: 0.00, ny: 0.05, yr: '1999', lb: 'TVS Cherry',
      title: 'Development Engineer',
      company: 'TVS Cherry Pvt. Ltd • India',
      role: 'Development Engineer',
      years: '5 years (1999 – 2004)',
      desc: 'Managed precision design-for-manufacturability, component engineering, and production optimization.'
    },
    { 
      nx: 0.15, ny: 0.16, yr: '2004', lb: 'GE',
      title: 'Senior Lead Systems Engineer',
      company: 'GE Industrial Solutions • CT',
      role: 'Senior Lead Systems Engineer',
      years: '11 years (2004 – 2015)',
      desc: 'Engineered system architectures, technical roadmaps, and feasibility benchmarking, bridging complex capabilities directly to market demands.'
    },
    { 
      nx: 0.30, ny: 0.30, yr: '2010', lb: 'MS · RPI',
      title: 'Master of Science (MS)',
      company: 'Rensselaer Polytechnic Institute • NY',
      role: 'Graduate Scholar',
      years: '2 years (2010 – 2012)',
      desc: 'Advanced research in electrical control systems, power electronics, and engineering leadership at a premier research university.'
    },
    { 
      nx: 0.45, ny: 0.42, yr: '2015', lb: 'GE Global',
      title: 'Global Product Marketing Leader',
      company: 'GE Industrial Solutions • CT',
      role: 'Global Product Marketing Leader',
      years: '3 years (2015 – 2018)',
      desc: 'Directed global commercialization, competitive value positioning, and sales alignment across utility and cloud data center segments.'
    },
    { 
      nx: 0.60, ny: 0.55, yr: '2018', lb: 'ABB',
      title: 'Product Marketing Manager',
      company: 'ABB • Bloomfield, CT',
      role: 'Product Marketing Manager',
      years: '6 years (2018 – Present)',
      desc: 'Leads commercial strategy, price realization, and market execution for digital power solutions in mission-critical segments.'
    },
    { 
      nx: 0.74, ny: 0.66, yr: '2020', lb: 'NPI launch',
      title: 'Automatic Transfer Switches NPI',
      company: 'ABB • Bloomfield, CT',
      role: 'Strategic Launch Director',
      years: 'Commercialization Phase',
      desc: 'Successfully launched high-performance digital ATS panels, securing leading market shares in North American enterprise cloud centers.'
    },
    { 
      nx: 0.87, ny: 0.78, yr: '2022', lb: 'Scale-up',
      title: 'Hyperscale Partner Acceleration',
      company: 'ABB & Partners • USA',
      role: 'Director of Product & Commercial Strategy',
      years: 'Market Scale-up Phase',
      desc: 'Optimized product architectures and partner alignment for hyper-scale projects, establishing key performance benchmarks.'
    },
    { 
      nx: 1.00, ny: 0.95, yr: 'Now',  lb: '5× growth',
      title: 'Compounding Revenue Leader',
      company: 'ABB & Segment Portfolio',
      role: 'Commercial Execution Leader',
      years: 'Current Phase',
      desc: 'Achieved a 5x revenue multiplication in critical data center power delivery segments through targeted digital portfolio integration.'
    }
  ];

  let W = 0, H = 0, pts = [], baseY = 0, chartCenter = { x: 0, y: 0 }, pathLen = 0;

  // Dynamically create/inject custom tooltip card inside camera so it animates with viewport zoom
  let tooltipCard = document.getElementById('growthTooltipCard');
  if (!tooltipCard) {
    tooltipCard = document.createElement('div');
    tooltipCard.id = 'growthTooltipCard';
    tooltipCard.className = 'growth-tooltip-card';
    tooltipCard.innerHTML = `
      <button class="gt-close" id="growthTooltipClose" aria-label="Close card">&times;</button>
      <div class="gt-header">
        <span class="gt-year"></span>
        <span class="gt-company"></span>
      </div>
      <h3 class="gt-title"></h3>
      <div class="gt-role"></div>
      <p class="gt-desc"></p>
    `;
    camera.appendChild(tooltipCard);

    tooltipCard.querySelector('#growthTooltipClose').addEventListener('click', (e) => {
      e.stopPropagation();
      hideTooltip(true);
    });

    tooltipCard.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  let pinned = false;
  let activeNode = null;

  function showTooltip(nodeData, tagEl, pin = false) {
    if (pinned && !pin) return; // ignore hover when another node is pinned open
    if (pin) pinned = true;

    activeNode = nodeData;

    tooltipCard.querySelector('.gt-year').textContent = nodeData.yr;
    tooltipCard.querySelector('.gt-company').textContent = nodeData.company;
    tooltipCard.querySelector('.gt-title').textContent = nodeData.title;
    tooltipCard.querySelector('.gt-role').textContent = `Role: ${nodeData.role} (${nodeData.years})`;
    tooltipCard.querySelector('.gt-desc').textContent = nodeData.desc;

    tooltipCard.style.left = nodeData.x + 'px';
    // Offset Y above the tag (tag top edge is around nodeData.y - 59px, so we place bottom at nodeData.y - 65px)
    tooltipCard.style.top = (nodeData.y - 65) + 'px';
    tooltipCard.classList.add('active');
  }

  function hideTooltip(force = false) {
    if (pinned && !force) return;
    pinned = false;
    activeNode = null;
    tooltipCard.classList.remove('active');
  }

  window.addEventListener('click', () => {
    hideTooltip(true);
  });

  function easeInOut(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  // Custom smooth spline through points (Catmull-Rom formulation)
  // Bends slightly down and up between nodes for a dynamic organic path
  function getCatmullRomBezierPath(points) {
    if (points.length < 2) return '';
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    const tension = 0.18; // smooth tension to create visual wave
    
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;
      
      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }

  function build() {
    W = sticky.clientWidth;
    H = sticky.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

    const mL = W * 0.11, mR = W * 0.11;
    baseY = H * 0.84;
    const chartH = H * 0.62;
    const spanW = W - mL - mR;

    pts = NODES.map(n => ({ 
      x: mL + n.nx * spanW, 
      y: baseY - n.ny * chartH, 
      yr: n.yr, 
      lb: n.lb,
      title: n.title,
      company: n.company,
      role: n.role,
      years: n.years,
      desc: n.desc
    }));

    chartCenter = { x: (pts[0].x + pts[pts.length - 1].x) / 2, y: baseY - chartH * 0.52 };

    axisEl.setAttribute('x1', mL * 0.5); axisEl.setAttribute('y1', baseY);
    axisEl.setAttribute('x2', W - mR * 0.5); axisEl.setAttribute('y2', baseY);

    const dPath = getCatmullRomBezierPath(pts);
    lineEl.setAttribute('d', dPath);
    pathLen = lineEl.getTotalLength();
    lineEl.style.strokeDasharray = pathLen;
    lineEl.style.strokeDashoffset = pathLen;

    // Dots G
    dotsG.innerHTML = '';
    window.__growthDots = pts.map((p, i) => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('class', 'growth-dot');
      c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 0);
      
      // Hover and click listeners on the SVG dots themselves
      c.addEventListener('mouseenter', () => showTooltip(p, c));
      c.addEventListener('mouseleave', (e) => {
        if (e.relatedTarget && e.relatedTarget.closest('.growth-tooltip-card')) return;
        hideTooltip();
      });
      c.addEventListener('click', (e) => {
        e.stopPropagation();
        showTooltip(p, c, true); // Pin open on click
      });

      dotsG.appendChild(c);
      const fraction = i / (pts.length - 1);
      return { el: c, f: fraction };
    });

    // Tags
    tagsWrap.innerHTML = '';
    window.__growthTags = pts.map((p, i) => {
      const el = document.createElement('div');
      el.className = 'growth-tag';
      el.style.left = p.x + 'px'; el.style.top = p.y + 'px';
      el.innerHTML = `<div class="growth-yr">${p.yr}</div><div class="growth-lb">${p.lb}</div>`;
      tagsWrap.appendChild(el);
      const fraction = i / (pts.length - 1);

      // Mouse interactive hooks for Tooltip Card
      el.addEventListener('mouseenter', () => showTooltip(p, el));
      el.addEventListener('mouseleave', (e) => {
        if (e.relatedTarget && e.relatedTarget.closest('.growth-tooltip-card')) return;
        hideTooltip();
      });
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        showTooltip(p, el, true); // Pin open on click
      });

      return { el, f: fraction };
    });
  }

  function pointAt(dist, wantDir) {
    const p = lineEl.getPointAtLength(clamp(dist, 0, pathLen));
    if (wantDir) {
      const step = 1;
      const pAhead = lineEl.getPointAtLength(clamp(dist + step, 0, pathLen));
      const pBehind = lineEl.getPointAtLength(clamp(dist - step, 0, pathLen));
      const dx = pAhead.x - pBehind.x;
      const dy = pAhead.y - pBehind.y;
      const len = Math.hypot(dx, dy) || 1;
      return { x: p.x, y: p.y, dx: dx / len, dy: dy / len };
    }
    return { x: p.x, y: p.y };
  }

  let targetP = 0, p = 0;
  function measure() {
    const rect = zone.getBoundingClientRect();
    const range = zone.offsetHeight - window.innerHeight;
    targetP = range > 0 ? clamp(-rect.top / range, 0, 1) : 0;
  }

  window.addEventListener('scroll', measure, { passive: true });
  window.addEventListener('resize', () => { build(); measure(); });

  const REVEAL = 0.82;
  const ZOOM = 2.35;

  function render() {
    p += (targetP - p) * (reduced ? 1 : 0.08); // high-performance lerp

    const drawP = clamp(p / REVEAL, 0, 1);
    const dist = drawP * pathLen;

    lineEl.style.strokeDashoffset = pathLen * (1 - drawP);

    for (const dt of window.__growthDots || []) {
      const a = clamp((drawP - dt.f) / 0.025, 0, 1);
      dt.el.setAttribute('r', 8.5 * easeOut(a));
    }
    for (const tg of window.__growthTags || []) {
      const a = clamp((drawP - tg.f) / 0.03, 0, 1);
      tg.el.style.opacity = a;
      tg.el.style.transform = `translate(-50%, ${-195 + (1 - a) * 20}%)`;
    }

    const tip = pointAt(dist);
    const prevDist = Math.max(0, dist - 2);
    const prevTip = pointAt(prevDist);
    const dx = tip.x - prevTip.x;
    const dy = tip.y - prevTip.y;
    const angleRad = (dx === 0 && dy === 0) ? 0 : Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);

    tipwrap.style.transform = `translate(${tip.x}px, ${tip.y}px) rotate(${angleDeg.toFixed(1)}deg)`;
    tipwrap.style.opacity = drawP > 0.01 ? 1 : 0;

    const stillA = clamp((drawP - 0.9) / 0.1, 0, 1);
    stillwrap.style.transform = `translate(${tip.x}px, ${tip.y}px)`;
    stillwrap.style.opacity = stillA;

    // camera zooming
    let scale, fx, fy;
    if (p < REVEAL) {
      scale = ZOOM; fx = tip.x; fy = tip.y;
    } else {
      const t = easeInOut((p - REVEAL) / (1 - REVEAL));
      scale = lerp(ZOOM, 1, t);
      fx = lerp(tip.x, chartCenter.x, t);
      fy = lerp(tip.y, chartCenter.y, t);
    }
    const cx = W / 2, cy = H / 2;
    camera.style.transform = `translate(${cx - fx * scale}px, ${cy - fy * scale}px) scale(${scale})`;
    camera.style.setProperty('--sc', scale);

    numval.textContent = (drawP * 5).toFixed(1);
    bar.style.width = (p * 100) + '%';

    requestAnimationFrame(render);
  }

  build();
  measure();
  if (reduced) { p = targetP = 1; }
  render();
}());

// Interactive modal for professional experience cards (Motion Tiles)
// Interactive modal and stack for professional experience (RoleExperience)
document.addEventListener('DOMContentLoaded', () => {
  const stackContainer = document.getElementById('role-exp-grid');
  const modalOverlay = document.getElementById('role-exp-overlay');
  const modalClose = document.getElementById('role-exp-close');
  const modalContent = document.getElementById('role-exp-modal-content');
  const modalPrev = document.getElementById('role-exp-prev');
  const modalNext = document.getElementById('role-exp-next');
  const modalDots = document.getElementById('role-exp-dots');

  if (!stackContainer) return; // Only execute on pages with this section

  const ROLES = [
    {
      id: "abb-pmm",
      company: "ABB",
      location: "Bloomfield, CT",
      years: "2018 – Present",
      title: "Product Marketing Manager",
      visual: "graph",
      summary:
        "Lead commercial strategy for Automatic Transfer Switches (ATS), energy management systems, and digital power solutions supporting mission-critical applications across North America.",
      bullets: [
        {
          label: "Strategic & Portfolio Leadership",
          text: "Develop segment-specific strategies aligned to price realization, market share growth, and profitability."
        },
        {
          label: "Product Marketing",
          text: "Support long-term product lifecycle strategy and customer segment alignment."
        },
        {
          label: "Impact",
          text: "Positioned portfolio to achieve 3x revenue growth vs. 2025 baseline."
        }
      ],
      tags: ["PORTFOLIO STRATEGY", "PRICING", "REVENUE GROWTH"]
    },
    {
      id: "abb-npi",
      company: "ABB",
      location: "Bloomfield, CT",
      years: "2018 – Present",
      title: "NPI Commercialization Lead",
      visual: "chat",
      summary:
        "Drive New Product Introduction (NPI) life cycles, launch planning, and sales readiness to accelerate technology adoption across the distribution portfolio.",
      bullets: [
        {
          label: "NPI Execution",
          text: "Own cross-functional launch readiness from concept gate through general availability."
        },
        {
          label: "Launch Planning",
          text: "Build go-to-market timelines and readiness checklists for new platform releases."
        },
        {
          label: "Sales Enablement",
          text: "Equip field and channel teams with positioning, training, and launch collateral."
        }
      ],
      tags: ["NPI EXECUTION", "LAUNCH PLANNING", "SALES ENABLEMENT"]
    },
    {
      id: "abb-hyperscale",
      company: "ABB",
      location: "Bloomfield, CT",
      years: "2018 – Present",
      title: "Hyperscale Partner Acceleration",
      visual: "nodes",
      summary:
        "Accelerating strategic partnerships and modular power distribution packages for hyperscale cloud data center segments.",
      bullets: [
        {
          label: "Hyperscale Partners",
          text: "Engage with cloud data center operators and engineering consultants to specify custom electrical distribution packages."
        },
        {
          label: "Modular Strategy",
          text: "Push design-in of modular power skids to shrink lead times and lower field construction costs."
        },
        {
          label: "Cloud Acceleration",
          text: "Direct segment initiatives for hyperscale accounts across global engineering clusters."
        }
      ],
      tags: ["HYPERSCALE PARTNERS", "CLOUD ACCELERATION", "STRATEGIC ACCOUNTS"]
    },
    {
      id: "ge-global-pm",
      company: "GE Industrial Solutions",
      location: "Plainville, CT",
      years: "2015 – 2018",
      title: "Global Product Marketing Leader",
      visual: "funnel",
      summary:
        "Directed global commercialization strategy and competitive value differentiation for critical power distribution systems.",
      bullets: [
        {
          label: "GTM Strategy",
          text: "Set global go-to-market direction across regional product marketing teams."
        },
        {
          label: "Launch Execution",
          text: "Ran launch execution end to end for new distribution platforms."
        },
        {
          label: "Pricing Analysis",
          text: "Led competitive pricing analysis to defend and grow share."
        }
      ],
      tags: ["GTM STRATEGY", "LAUNCH EXECUTION", "PRICING ANALYSIS"]
    },
    {
      id: "ge-systems-engineer",
      company: "GE Industrial Solutions",
      location: "India & Plainville, CT",
      years: "2004 – 2015",
      title: "Senior Lead Systems Engineer",
      visual: "circuit",
      summary:
        "Developed multi-generation product plans, technical-commercial roadmaps, and systems architectures for utilities.",
      bullets: [
        {
          label: "Product Strategy & Technical Leadership",
          text: "Developed multi-generation product plans integrating market demand forecasting and profitability analysis."
        },
        {
          label: "NPI Support",
          text: "Supported new product launches with technical-commercial alignment."
        },
        {
          label: "Client Facing",
          text: "Presented technical and commercial solutions to utilities, industrial customers, and engineering consultants."
        }
      ],
      tags: ["PRODUCT STRATEGY", "TECHNICAL LEADERSHIP", "SYSTEMS DESIGN"]
    },
    {
      id: "tvs-cherry",
      company: "TVS Cherry",
      location: "India",
      years: "1999 – 2004",
      title: "Development Engineer",
      visual: "blueprint",
      summary:
        "Led NPI engineering design-for-manufacturability and production efficiency for high-reliability electrical components.",
      bullets: [
        {
          label: "Product Development",
          text: "Led mechanical and electromechanical development of switches and sensors."
        },
        {
          label: "NPI Design",
          text: "Created robust product specs and validation protocols under TVS Cherry joint venture."
        },
        {
          label: "Process Optimization",
          text: "Improved manufacturability and production efficiency across the product line."
        }
      ],
      tags: ["PRODUCT DEVELOPMENT", "NPI DESIGN", "PROCESS OPTIMIZATION"]
    }
  ];

  let activeIndex = 0;
  let modalIndex = null; // null = closed

  function getVisualHtml(type) {
    if (type === "graph") {
      return `
        <div class="card-visual graph-visual">
          <span class="card-visual-badge">GROWTH</span>
          <div class="graph-container">
            <div class="graph-line"></div>
            <div class="graph-bar" style="height: 55%;"></div>
            <div class="graph-bar" style="height: 35%;"></div>
            <div class="graph-bar active" style="height: 85%;"></div>
            <div class="graph-bar" style="height: 65%;"></div>
          </div>
        </div>
      `;
    }
    if (type === "chat") {
      return `
        <div class="card-visual chat-visual">
          <span class="card-visual-badge">LAUNCH</span>
          <div class="chat-container">
            <div class="chat-bubble bubble-1">
              <div class="chat-avatar orange-avatar">✦</div>
              <div class="chat-text">
                <span class="chat-user">User 12</span>
                <p>Hey, can we enable the NPI platform?</p>
              </div>
            </div>
            <div class="chat-bubble bubble-2">
              <div class="chat-avatar text-avatar">MJ</div>
              <div class="chat-text">
                <span class="chat-user">Mallory Jen <span class="online-dot"></span></span>
                <p>Checklists are complete, launching Monday!</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    if (type === "nodes") {
      return `
        <div class="card-visual nodes-visual">
          <span class="card-visual-badge">CLOUD</span>
          <div class="nodes-container">
            <svg class="nodes-svg" viewBox="0 0 200 100">
              <line x1="30" y1="50" x2="100" y2="25" stroke="rgba(21, 21, 20, 0.15)" stroke-width="1.5" />
              <line x1="30" y1="50" x2="100" y2="75" stroke="rgba(21, 21, 20, 0.15)" stroke-width="1.5" />
              <line x1="100" y1="25" x2="170" y2="50" stroke="rgba(21, 21, 20, 0.15)" stroke-width="1.5" />
              <line x1="100" y1="75" x2="170" y2="50" stroke="rgba(21, 21, 20, 0.15)" stroke-width="1.5" />
              <line x1="100" y1="25" x2="100" y2="75" stroke="rgba(21, 21, 20, 0.15)" stroke-width="1.5" />
              <circle cx="30" cy="50" r="6" fill="#151514" />
              <circle cx="100" cy="25" r="6" fill="#ebff00" class="glow-node" />
              <circle cx="100" cy="75" r="6" fill="#151514" />
              <circle cx="170" cy="50" r="6" fill="#151514" />
            </svg>
          </div>
        </div>
      `;
    }
    if (type === "funnel") {
      return `
        <div class="card-visual funnel-visual">
          <span class="card-visual-badge">GTM</span>
          <div class="funnel-container">
            <div class="funnel-tier tier-1">Strategy</div>
            <div class="funnel-tier tier-2">Pricing</div>
            <div class="funnel-tier tier-3">Growth</div>
          </div>
        </div>
      `;
    }
    if (type === "circuit") {
      return `
        <div class="card-visual circuit-visual">
          <span class="card-visual-badge">SYSTEMS</span>
          <div class="circuit-container">
            <div class="circuit-block">IN</div>
            <div class="circuit-line"><span class="pulse"></span></div>
            <div class="circuit-gate">&amp;</div>
            <div class="circuit-line"></div>
            <div class="circuit-block active">OUT</div>
          </div>
        </div>
      `;
    }
    if (type === "blueprint") {
      return `
        <div class="card-visual blueprint-visual">
          <span class="card-visual-badge">NPI</span>
          <div class="blueprint-container">
            <div class="blueprint-ring"></div>
            <div class="blueprint-crosshair"></div>
            <div class="blueprint-line h"></div>
            <div class="blueprint-line v"></div>
          </div>
        </div>
      `;
    }
    return '';
  }

  // Render Stack Cards in Rows of 2
  function renderStack() {
    let html = '';
    for (let r = 0; r < ROLES.length; r += 2) {
      const pair = ROLES.slice(r, r + 2);
      const rowHtml = pair.map((role, p) => {
        const globalIdx = r + p;
        const isActive = globalIdx === activeIndex;
        const tagsHtml = role.tags.slice(0, 2).map(t => `<span class="role-exp-tag">${t}</span>`).join('');
        const visualHtml = getVisualHtml(role.visual);
        return `
          <button
            type="button"
            class="role-exp-card${isActive ? ' is-active' : ''}"
            data-index="${globalIdx}"
            aria-label="${role.company} — ${role.title}"
          >
            <div class="role-exp-card-content-wrap">
              <div class="role-exp-card-top">
                <span class="role-exp-company">${role.company}</span>
                <span class="role-exp-years">${role.years}</span>
              </div>

              <div class="role-exp-card-body">
                <p class="role-exp-summary">${role.summary}</p>
                <div class="role-exp-tags">
                  ${tagsHtml}
                </div>
              </div>

              <div class="role-exp-card-bottom">
                <span class="role-exp-eyebrow">${role.company} | ${role.title.toUpperCase()}</span>
                <h3 class="role-exp-title">${role.title}</h3>
              </div>
            </div>
            <div class="card-visual-wrapper">
              ${visualHtml}
            </div>
          </button>
        `;
      }).join('');

      html += `<div class="role-exp-row">${rowHtml}</div>`;
    }
    
    stackContainer.innerHTML = html;

    // Attach event listeners to newly rendered cards
    const cards = stackContainer.querySelectorAll('.role-exp-card');
    cards.forEach(card => {
      const idx = parseInt(card.getAttribute('data-index'), 10);
      
      card.addEventListener('mouseenter', () => {
        if (activeIndex !== idx) {
          activeIndex = idx;
          updateCardActiveStates();
        }
      });

      card.addEventListener('focus', () => {
        if (activeIndex !== idx) {
          activeIndex = idx;
          updateCardActiveStates();
        }
      });

      card.addEventListener('click', () => {
        openModal(idx);
      });
    });
  }

  // Update card active states
  function updateCardActiveStates() {
    const cards = stackContainer.querySelectorAll('.role-exp-card');
    cards.forEach((card, i) => {
      const isActive = i === activeIndex;
      if (isActive) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });
  }

  // Render Modal Content
  function renderModalContent() {
    if (modalIndex === null) return;
    const role = ROLES[modalIndex];
    const bulletsHtml = role.bullets.map(b => `
      <li><strong>${b.label}:</strong> ${b.text}</li>
    `).join('');

    modalContent.innerHTML = `
      <span class="role-exp-modal-years">${role.years.toUpperCase()}</span>
      <h2 class="role-exp-modal-title">${role.title.toUpperCase()}</h2>
      <p class="role-exp-modal-meta">${role.company}${role.location ? ` | ${role.location}` : ""}</p>
      <hr class="role-exp-divider" />
      <p class="role-exp-modal-summary">${role.summary}</p>
      <ul class="role-exp-bullets">
        ${bulletsHtml}
      </ul>
    `;

    // Render Dots
    if (modalDots) {
      modalDots.innerHTML = ROLES.map((_, i) => `
        <span class="role-exp-dot${i === modalIndex ? ' is-active' : ''}" data-dot-index="${i}"></span>
      `).join('');

      modalDots.querySelectorAll('.role-exp-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const idx = parseInt(dot.getAttribute('data-dot-index'), 10);
          setModalIndex(idx);
        });
      });
    }
  }

  function openModal(idx) {
    modalIndex = idx;
    renderModalContent();
    if (modalOverlay) {
      modalOverlay.style.display = 'flex';
      // Trigger a reflow for CSS transition to fire
      modalOverlay.offsetHeight;
      modalOverlay.classList.add('active');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalIndex = null;
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      setTimeout(() => {
        if (modalIndex === null) {
          modalOverlay.style.display = 'none';
        }
      }, 400); // match transition duration
    }
    document.body.style.overflow = '';
  }

  function setModalIndex(idx) {
    modalIndex = idx;
    renderModalContent();
  }

  function goPrev() {
    if (modalIndex !== null) {
      setModalIndex((modalIndex - 1 + ROLES.length) % ROLES.length);
    }
  }

  function goNext() {
    if (modalIndex !== null) {
      setModalIndex((modalIndex + 1) % ROLES.length);
    }
  }

  // Modal navigation controls
  if (modalPrev) modalPrev.addEventListener('click', (e) => { e.stopPropagation(); goPrev(); });
  if (modalNext) modalNext.addEventListener('click', (e) => { e.stopPropagation(); goNext(); });
  if (modalClose) modalClose.addEventListener('click', (e) => { e.stopPropagation(); closeModal(); });
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      // Close only if clicked overlay background, not the modal itself
      const modalBox = modalOverlay.querySelector('.role-exp-modal');
      if (modalBox && !modalBox.contains(e.target)) {
        closeModal();
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (modalIndex === null) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  });

  // Slide modal switching via wheel scroll
  let lastScrollTime = 0;
  const scrollCooldown = 700;

  if (modalOverlay) {
    modalOverlay.addEventListener('wheel', (e) => {
      if (modalIndex === null) return;
      const now = Date.now();
      const modalBox = modalOverlay.querySelector('.role-exp-modal');
      if (!modalBox) return;

      // Handle cooldown
      if (now - lastScrollTime < scrollCooldown) {
        e.preventDefault();
        return;
      }

      const threshold = 30;
      const isScrollable = modalBox.scrollHeight > modalBox.clientHeight;

      if (Math.abs(e.deltaY) > threshold) {
        if (e.deltaY > 0) {
          // Scroll down -> Next
          if (isScrollable) {
            const isAtBottom = modalBox.scrollHeight - modalBox.scrollTop <= modalBox.clientHeight + 4;
            if (isAtBottom) {
              e.preventDefault();
              goNext();
              lastScrollTime = now;
            }
          } else {
            e.preventDefault();
            goNext();
            lastScrollTime = now;
          }
        } else {
          // Scroll up -> Prev
          if (isScrollable) {
            const isAtTop = modalBox.scrollTop <= 4;
            if (isAtTop) {
              e.preventDefault();
              goPrev();
              lastScrollTime = now;
            }
          } else {
            e.preventDefault();
            goPrev();
            lastScrollTime = now;
          }
        }
      } else if (Math.abs(e.deltaX) > threshold) {
        e.preventDefault();
        if (e.deltaX > 0) {
          goNext();
          lastScrollTime = now;
        } else {
          goPrev();
          lastScrollTime = now;
        }
      }
    }, { passive: false });
  }

  // Initial render
  renderStack();
});


(() => {
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = () => matchMedia('(max-width:960px)').matches;

const stage   = document.getElementById('hero');
const side    = document.getElementById('side');
const figureBg= document.getElementById('figureBg');
const figure  = document.getElementById('figure');
const headline= document.getElementById('headline');
const attrs   = document.getElementById('attrs');
const cornerL = document.getElementById('cornerL');
const btnAbout= document.getElementById('btnAbout');
const giant   = document.getElementById('giant');

/* Sidebar cards for staggered animation */
const sideCards = side ? [...side.querySelectorAll('.hh-scard, .hh-scta')] : [];

const flyers = [...document.querySelectorAll('[data-fly]')].map(el => ({
  el, slot: document.getElementById(el.dataset.to), dx:0, dy:0, sc:1
}));

function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function lerp(a,b,t){return a+(b-a)*t}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function smooth(t){t=clamp(t,0,1);return t*t*(3-2*t)}

/* ---------- FLIP measurement: clear transforms, measure both ends ---------- */
function measure(){
  if (isMobile()) return;
  // force natural positions
  flyers.forEach(f => { f.el.style.transform=''; f.el.style.opacity=''; });
  const prev = { o: side.style.opacity, t: side.style.transform, v: side.style.visibility };
  side.style.transition='none'; side.style.opacity='0'; side.style.transform='none'; side.style.visibility='hidden';
  side.style.display='flex';
  // reflow, then measure
  void side.offsetWidth;
  flyers.forEach(f => {
    if (!f.slot) return;
    const s = f.el.getBoundingClientRect();
    const t = f.slot.getBoundingClientRect();
    f.dx = (t.left + t.width/2) - (s.left + s.width/2);
    f.dy = (t.top  + t.height/2) - (s.top  + s.height/2);
    f.sc = clamp(t.width / Math.max(s.width,1), .02, 3);
  });
  side.style.visibility = prev.v || '';
  side.style.opacity = prev.o || '0';
  side.style.transform = prev.t || 'translateX(-34px)';
  side.style.transition = '';
}

/* ---------- scroll scrub ---------- */
let target=0, p=0, docked=false;
function onScroll(){
  const rect = stage.getBoundingClientRect();
  const range = stage.offsetHeight - innerHeight;
  target = clamp(-rect.top / Math.max(range,1), 0, 1);
}
addEventListener('scroll', onScroll, {passive:true});
addEventListener('resize', () => { measure(); onScroll(); });

function render(){
  p += (target - p) * (reduced ? 1 : .14);

  if (!isMobile()){
    const fly  = ease(clamp(p / .8, 0, 1));
    const fadeHero = smooth((p - .74) / .18);
    const sideIn   = smooth((p - .5) / .32);

    flyers.forEach(f => {
      if (!f.slot) return;
      if (reduced){
        f.el.style.opacity = String(1 - smooth((p-.4)/.3));
        return;
      }
      f.el.style.transform = `translate(${f.dx*fly}px, ${f.dy*fly}px) scale(${lerp(1, f.sc, fly)})`;
      f.el.style.opacity = String(1 - fadeHero);
    });

    /* Portrait blur — applies to the fixed background layer.
       Blurs from 0→30px over the hero scroll, stays at max blur after. */
    const blurAmount = clamp(p * 35, 0, 30);
    const figureOpacity = clamp(1 - p * 0.35, 0.35, 1);
    if (figure) {
      figure.style.filter = `blur(${blurAmount}px) saturate(${1 - p*.45})`;
      figure.style.opacity = String(figureOpacity);
      figure.style.transform = `translateX(-50%) scale(${1 + p*.06})`;
    }

    if (headline) headline.style.opacity = String(1 - smooth(p/.35));
    const hhTitle = document.getElementById('hhTitle');
    if (hhTitle) hhTitle.style.opacity = String(1 - smooth(p/.3));
    attrs.style.opacity    = String(1 - smooth(p/.4));
    cornerL.style.opacity  = String(1 - smooth(p/.35));
    btnAbout.style.opacity = String(1 - smooth(p/.4));
    giant.style.opacity    = String(1 - fadeHero);

    /* Sidebar container fade + slide in */
    side.style.opacity = String(sideIn);
    side.style.transform = `translateX(${lerp(-34, 0, sideIn)}px)`;

    /* Staggered sidebar card scale animation */
    sideCards.forEach((card, i) => {
      const staggerDelay = i * 0.06;
      const cardProgress = smooth((sideIn - staggerDelay) / (1 - staggerDelay));
      const cardScale = lerp(0.5, 1, cardProgress);
      const cardOpacity = cardProgress;
      card.style.transform = `scale(${cardScale})`;
      card.style.opacity = String(cardOpacity);
    });

    const nowDocked = p > .96;
    if (nowDocked !== docked){
      docked = nowDocked;
      document.body.classList.toggle('hh-docked', docked);
    }
  }
  requestAnimationFrame(render);
}

/* copy email */
const scopyBtn = document.getElementById('scopy');
const semailText = document.getElementById('semail');
if (scopyBtn && semailText) {
  scopyBtn.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(semailText.textContent.trim());
      scopyBtn.textContent='✓'; setTimeout(()=>scopyBtn.textContent='⧉',1300);
    }catch(e){}
  });
}

/* boot: wait for fonts so FLIP measurements are exact */
function boot(){
  if (side && side.parentElement !== document.body) document.body.appendChild(side);
  const need = {stage, side, figure, headline, attrs, cornerL, btnAbout, giant};
  for (const k in need) if (!need[k]) console.warn('[hh-hero] missing node:', k);
  if (!stage || !side || !figure) return;
  measure(); onScroll(); render();
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
else addEventListener('load', boot);
})();

document.addEventListener('DOMContentLoaded', () => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => matchMedia('(max-width:960px)').matches;

  const tl    = document.getElementById('about');
  const svg   = document.getElementById('tsvg');
  const path  = document.getElementById('tpath');
  const nodesG= document.getElementById('tnodes');
  if (!tl || !svg || !path) return;

  let L = 0, circles = [], cardAts = [], nodeAt = [];
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  /* ── build: single wavy curvy line down the centre gap ── */
  function build(){
    if (isMobile()){ path.removeAttribute('d'); nodesG.innerHTML = ''; L = 0; return; }

    const tlRect = tl.getBoundingClientRect();
    const W = tlRect.width;
    const H = tlRect.height;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width',   W);
    svg.setAttribute('height',  H);

    const cx = W / 2;   // center x

    const cards = [...tl.querySelectorAll('.jr-tcard')];
    // Anchor at the bottom-left corner of each card
    const pts = cards.map(c => {
      const r = c.getBoundingClientRect();
      const left = c.classList.contains('jr-left');
      return {
        x: r.left - tlRect.left,
        y: r.bottom - tlRect.top,
        left
      };
    });
    if (!pts.length) return;

    // Generate spline points list
    const splinePoints = [];

    const cardDotIndices = [];

    for (let i = 0; i < pts.length; i++) {
      cardDotIndices.push(splinePoints.length);
      splinePoints.push(pts[i]);

      if (i < pts.length - 1) {
        const a = pts[i];
        const b = pts[i + 1];
        // If leaving left card, loop left, else loop right
        const loopX = a.left ? W * 0.02 : W * 0.92;
        const midY = a.y + (b.y - a.y) * 0.5;
        splinePoints.push({ x: loopX, y: midY });
      }
    }

    // Interpolate points using Catmull-Rom converted to Bezier
    let d = `M ${splinePoints[0].x} ${splinePoints[0].y}`;
    nodeAt = [{ p: splinePoints[0], at: 0 }];
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    for (let i = 0; i < splinePoints.length - 1; i++) {
      const p0 = splinePoints[i === 0 ? 0 : i - 1];
      const p1 = splinePoints[i];
      const p2 = splinePoints[i + 1];
      const p3 = splinePoints[i + 2 >= splinePoints.length ? splinePoints.length - 1 : i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;

      const cardIdx = cardDotIndices.indexOf(i + 1);
      if (cardIdx !== -1) {
        probe.setAttribute('d', d);
        nodeAt.push({ p: splinePoints[i + 1], at: probe.getTotalLength() });
      }
    }

    path.setAttribute('d', d);
    L = path.getTotalLength();
    path.style.strokeDasharray  = L;
    path.style.strokeDashoffset = reduced ? 0 : L;

    // Dots sit exactly at the timeline card centers on the wavy line
    nodesG.innerHTML = '';
    circles = nodeAt.map(n => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', n.p.x);
      c.setAttribute('cy', n.p.y);
      c.setAttribute('r',  8);
      if (reduced) c.classList.add('on');
      nodesG.appendChild(c);
      return { el: c, at: n.at };
    });

    // Reveal thresholds aligned to path distance
    cardAts = cards.map((el, i) => ({
      el,
      at: nodeAt[i] ? nodeAt[i].at : 0
    }));
  }

  /* ── scroll scrub ── */
  let target = 0, p = 0;
  function onScroll(){
    const r = tl.getBoundingClientRect();
    if (!L || !nodeAt.length) return;

    // Viewport trigger line (0.72 = triggers when card/dot enters lower-middle viewport)
    const triggerLineY = (window.innerHeight * 0.72) - r.top;
    let targetDrawn = 0;

    const firstY = nodeAt[0].p.y;
    const lastY = nodeAt[nodeAt.length - 1].p.y;

    if (triggerLineY <= firstY) {
      targetDrawn = 0;
    } else if (triggerLineY >= lastY) {
      const fraction = Math.min(1, (triggerLineY - lastY) / Math.max(1, r.height - lastY));
      const startAt = nodeAt[nodeAt.length - 1].at;
      targetDrawn = startAt + fraction * (L - startAt);
    } else {
      for (let i = 0; i < nodeAt.length - 1; i++) {
        const aY = nodeAt[i].p.y;
        const bY = nodeAt[i+1].p.y;
        if (triggerLineY >= aY && triggerLineY <= bY) {
          const fraction = (triggerLineY - aY) / (bY - aY);
          const startAt = nodeAt[i].at;
          const endAt = nodeAt[i+1].at;
          targetDrawn = startAt + fraction * (endAt - startAt);
          break;
        }
      }
    }

    target = clamp(targetDrawn / L, 0, 1);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => {
      build(); onScroll();
      if (isMobile()) document.querySelectorAll('.jr-tcard').forEach(c => c.classList.add('jr-in'));
    }, 150);
  });

  function updateWhatIBringRotation() {
    const el = document.getElementById('what-i-bring');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewH = window.innerHeight;
    
    const start = viewH;
    const end = -rect.height;
    const progress = clamp((rect.top - start) / (end - start), 0, 1);
    
    const baseRotation = progress * 240; 
    
    const pills = el.querySelectorAll('.tbring-orbit-pill');
    if (!pills.length) return;
    
    const winW = window.innerWidth;
    const isSmall = winW <= 768;
    const radiusX = isSmall ? (winW * 0.40) : Math.min(winW * 0.34, 470);
    const radiusY = isSmall ? (winW * 0.40) : Math.min(window.innerHeight * 0.27, 250);
    
    pills.forEach(pill => {
      const startAngle = parseFloat(pill.dataset.angle || 0);
      const currentAngle = (startAngle + baseRotation) * (Math.PI / 180);
      const x = Math.cos(currentAngle) * radiusX;
      const y = Math.sin(currentAngle) * radiusY;
      
      pill.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
    });
  }

  /* ── rAF render loop ── */
  function render(){
    updateWhatIBringRotation();
    if (!reduced && !isMobile() && L){
      p += (target - p) * 0.070;            // responsive, fluid easing to match scroll speed in both directions
      const drawn = L * p;
      path.style.strokeDashoffset = L - drawn;

      /* dots pop when line reaches them */
      circles.forEach((c, idx) => {
        const on = idx === 0 ? (drawn >= 10) : (drawn >= c.at - 1);
        c.el.classList.toggle('on', on);
      });

      /* cards appear strictly as the curvy line draws past their dot,
         and disappear if you scroll back up for a dynamic feel */
      cardAts.forEach((cm, idx) => {
        // Card 0 appears only when scroll begins (drawn >= 10px). Other cards reveal 150px before.
        const visible = idx === 0 ? (drawn >= 10) : (drawn >= cm.at - 150);
        if (visible && !cm.el.classList.contains('jr-in')) {
          cm.el.classList.add('jr-in');
        } else if (!visible && cm.el.classList.contains('jr-in')) {
          cm.el.classList.remove('jr-in');
        }
      });
    }
    requestAnimationFrame(render);
  }

  function boot(){
    build(); onScroll(); render();
    if (isMobile() || reduced) {
      document.querySelectorAll('.jr-tcard').forEach(c => c.classList.add('jr-in'));
    }
    if (window.ResizeObserver){
      let t;
      new ResizeObserver(() => {
        clearTimeout(t);
        t = setTimeout(() => { build(); onScroll(); }, 120);
      }).observe(tl);
    }
  }

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot);
  else if (document.readyState === 'complete') boot();
  else window.addEventListener('load', boot);
  window.addEventListener('load', () => { build(); onScroll(); });
});


// ─────────────────────────────────────────────────────────────────────────────

// 7. Standalone Modules for Multi-page support (Hello Loader, Mobile Menu, Scroll Indicator)
// ─────────────────────────────────────────────────────────────────────────────


document.addEventListener('DOMContentLoaded', () => {
  // --- 7.1 Multilingual Hello Loader ---
  const loader = document.getElementById('helloLoader');
  const panel = document.getElementById('helloPanel');
  const curvePath = document.getElementById('helloCurvePath');
  const greetDiv = document.getElementById('helloGreet');

  if (loader && panel && curvePath && greetDiv) {
    if (sessionStorage.getItem('hello-loader-seen')) {
      loader.style.display = 'none';
    } else {
      const GREETINGS = ["Hello","Hola","Bonjour","Ciao","Hallo","Olá","Привет","नमस्ते","こんにちは","你好","Merhaba","안녕하세요","Habari"];
      let index = 0;
      let currentSpan = null;

      // Set initial curve path
      curvePath.setAttribute('d', 'M0,100 C22,8 78,8 100,100 L100,100 L0,100 Z');

      function showGreeting(text) {
        if (currentSpan) {
          currentSpan.className = 'hg-out';
          const oldSpan = currentSpan;
          setTimeout(() => oldSpan.remove(), 260);
        }
        const newSpan = document.createElement('span');
        newSpan.textContent = text;
        newSpan.className = 'hg-in';
        greetDiv.appendChild(newSpan);
        currentSpan = newSpan;
      }

      function peelOff() {
        if (currentSpan) {
          currentSpan.className = 'hg-out';
        }

        if (window.gsap) {
          const tl = window.gsap.timeline({
            onComplete: () => {
              loader.style.display = 'none';
              sessionStorage.setItem('hello-loader-seen', 'true');
            }
          });

          tl.to(panel, {
            y: -window.innerHeight,
            duration: 1.38,
            ease: "power3.inOut"
          }, 0);

          const curveObj = { w: 92 };
          tl.to(curveObj, {
            w: 0,
            duration: 0.9,
            ease: "power2.inOut",
            onUpdate: () => {
              const w = curveObj.w;
              const d = w <= 0 
                ? "M0,100 L100,100 L100,100 L0,100 Z" 
                : `M0,100 C22,${100 - w} 78,${100 - w} 100,100 L100,100 L0,100 Z`;
              curvePath.setAttribute('d', d);
            }
          }, 0);
        } else {
          // Fallback if GSAP is not present
          loader.style.transition = 'opacity 0.5s ease';
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.style.display = 'none';
            sessionStorage.setItem('hello-loader-seen', 'true');
          }, 500);
        }
      }

      function cycle() {
        if (index < GREETINGS.length) {
          showGreeting(GREETINGS[index]);
          index++;
          setTimeout(cycle, index === 1 ? 580 : 210);
        } else {
          setTimeout(peelOff, 380);
        }
      }

      cycle();
    }
  }

  // --- 7.2 Header Dropdown Menu (experience.html) ---
  const menuTrigger = document.getElementById('menu-trigger');
  const menuOverlay = document.getElementById('menu-overlay');

  if (menuTrigger && menuOverlay) {
    menuTrigger.addEventListener('click', () => {
      const active = menuOverlay.classList.toggle('active');
      menuTrigger.setAttribute('aria-expanded', active);
      menuOverlay.setAttribute('aria-hidden', !active);
      menuTrigger.textContent = active ? 'Close' : 'Menu';
      document.body.style.overflow = active ? 'hidden' : '';
    });

    menuOverlay.querySelectorAll('.menu-overlay-link').forEach(link => {
      link.addEventListener('click', () => {
        menuOverlay.classList.remove('active');
        menuTrigger.setAttribute('aria-expanded', 'false');
        menuOverlay.setAttribute('aria-hidden', 'true');
        menuTrigger.textContent = 'Menu';
        document.body.style.overflow = '';
      });
    });
  }

  // --- 7.3 Page-Independent Scroll Indicator ---
  const scrollIndicator = document.getElementById('scroll-pct-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
      scrollIndicator.textContent = `${pct}%`;
    }, { passive: true });
  }

  // --- 7.4 Hero Parallax Grid Animation (experience.html) ---
  const parallaxContainer = document.getElementById('hero');
  const parallaxGrid = document.getElementById('parallaxGrid');
  const parallaxRow1 = document.getElementById('parallaxRow1');
  const parallaxRow2 = document.getElementById('parallaxRow2');
  const parallaxRow3 = document.getElementById('parallaxRow3');
  const expHeroHeading = document.querySelector('.exp-hero-heading');

  if (parallaxContainer && parallaxGrid && parallaxRow1 && parallaxRow2 && parallaxRow3) {
    const CARDS = [
      { title: "Revenue Growth Analytics", thumb: "assets/db_revenue_growth.png" },
      { title: "Executive KPI Overview", thumb: "assets/db_kpi_executive.png" },
      { title: "Financial Performance", thumb: "assets/db_financial_performance.png" },
      { title: "Sales Performance", thumb: "assets/db_sales_performance.png" },
      { title: "GTM Strategy Metrics", thumb: "assets/db_gtm_funnel.png" },
      { title: "Strategic Scorecard", thumb: "assets/db_strategic_scorecard.png" },
      { title: "Competitive Positioning", thumb: "assets/db_competitive_analysis.png" },
      { title: "Market Intelligence", thumb: "assets/db_market_intelligence.png" },
      { title: "Product Roadmap 2024", thumb: "assets/db_product_roadmap.png" },
      { title: "Product Analytics", thumb: "assets/db_product_analytics.png" },
      { title: "Customer Success Analytics", thumb: "assets/db_customer_success.png" },
      { title: "Energy Grid Management", thumb: "assets/db_energy_grid.png" },
      { title: "Global Supply Chain", thumb: "assets/db_supply_chain.png" },
      { title: "Infrastructure Operations", thumb: "assets/db_infrastructure_ops.png" },
      { title: "Revenue Growth Analytics", thumb: "assets/db_revenue_growth.png" }
    ];

    const createCardHtml = card => `
      <div class="parallax-card">
        <div class="parallax-card-img-wrap">
          <img src="${card.thumb}" alt="${card.title}" loading="lazy">
        </div>
        <p class="parallax-card-title">${card.title}</p>
      </div>
    `;

    // Render cards
    parallaxRow1.innerHTML = CARDS.slice(0, 5).map(createCardHtml).join('');
    parallaxRow2.innerHTML = CARDS.slice(5, 10).map(createCardHtml).join('');
    parallaxRow3.innerHTML = CARDS.slice(10, 15).map(createCardHtml).join('');

    let currentScroll = window.scrollY;

    function renderParallax() {
      currentScroll += (window.scrollY - currentScroll) * 0.1;

      const rect = parallaxContainer.getBoundingClientRect();
      const topOffset = rect.top + window.scrollY;
      const progressRange = parallaxContainer.offsetHeight - window.innerHeight;
      const progress = progressRange > 0 ? Math.max(0, Math.min(1, (currentScroll - topOffset) / progressRange)) : 0;

      const translation1 = 0 - progress * 700;
      const translation2 = 0 + progress * 700;
      const rotateX = 15 - progress * 15;
      const rotateZ = -20 + progress * 20;
      const skewX = 10 - progress * 10;
      const translateY = 150 - progress * 300;

      parallaxRow1.style.transform = `translateX(${translation1}px)`;
      parallaxRow2.style.transform = `translateX(${translation2}px)`;
      parallaxRow3.style.transform = `translateX(${translation1}px)`;
      parallaxGrid.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) skewX(${skewX}deg) translateY(${translateY}px) scale(1.25)`;

      if (expHeroHeading) {
        const opacity = Math.max(0, 1 - progress * 3);
        const headingY = -progress * 200;
        expHeroHeading.style.opacity = opacity;
        expHeroHeading.style.transform = `translateY(${headingY}px)`;
      }

      requestAnimationFrame(renderParallax);
    }

    // Start render loop
    requestAnimationFrame(renderParallax);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 7.4 Sidebar Navigation Scroll Spy & Smooth Scroll
  // ─────────────────────────────────────────────────────────────────────────────
  const sections = [
    { id: 'hero',       linkId: 'slot-home' },
    { id: 'about',      linkId: 'slot-about' },
    { id: 'what-i-bring', linkId: 'slot-get' },
    { id: 'leadership', linkId: 'slot-lead' },
    { id: 'experience', linkId: 'slot-exp' },
    { id: 'pipeline',   linkId: 'slot-pipe' },
    { id: 'contact',    linkId: 'slot-contact' }
  ];

  function updateActiveLink() {
    let activeId = 'hero';
    const threshold = window.innerHeight * 0.40;

    for (const sec of sections) {
      const el = document.getElementById(sec.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          activeId = sec.id;
        }
      }
    }

    sections.forEach(sec => {
      const link = document.getElementById(sec.linkId);
      if (link) {
        link.classList.toggle('on', sec.id === activeId);
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink(); // Initial call on load

  // Enable smooth scroll for sidebar links
  document.querySelectorAll('.hh-spill').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const hashIndex = href.indexOf('#');
      if (hashIndex !== -1) {
        const hash = href.slice(hashIndex);
        const targetEl = document.querySelector(hash);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, null, hash);
        }
      } else if (href === 'index.html') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        history.pushState(null, null, ' ');
      }
    });
  });
});

/* ============================================================
   SCROLL TEXT REVEAL ANIMATIONS — staggered translateY + opacity
   Applies to all headings, paragraphs, and cards in content sections.
   ============================================================ */
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  /* Selectors for content sections that should get scroll reveals */
  const contentSections = [
    '#about', '#what-i-bring', '#leadership', '#experience',
    '#pipeline', '#contact', '.hh-after', 'footer'
  ];

  const selector = contentSections
    .map(s => `${s} h2, ${s} h3, ${s} p, ${s} .tbring-card, ${s} .leadership-card, ${s} .sec-label`)
    .join(', ');

  const elements = document.querySelectorAll(selector);

  /* Group elements by their parent section so we can stagger within each */
  const sectionMap = new Map();
  elements.forEach(el => {
    /* Skip elements that already have their own animation system */
    if (el.closest('.hh-pin') || el.closest('.hh-side') || el.closest('#exp-bg-text')) return;
    
    /* Find the closest content section */
    const section = el.closest(contentSections.join(', '));
    if (!section) return;

    if (!sectionMap.has(section)) sectionMap.set(section, []);
    sectionMap.get(section).push(el);
  });

  /* Apply the scroll-text-reveal class and set stagger delays */
  sectionMap.forEach((els, section) => {
    els.forEach((el, i) => {
      el.classList.add('scroll-text-reveal');
      el.style.transitionDelay = `${i * 0.08}s`;
    });
  });

  /* IntersectionObserver to trigger reveals */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.05
  });

  document.querySelectorAll('.scroll-text-reveal').forEach(el => {
    observer.observe(el);
  });
})();
