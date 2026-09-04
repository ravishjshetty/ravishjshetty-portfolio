/* ==========================================================================
   RAVISH J SHETTY — PORTFOLIO MOTION SYSTEM
   Built on the existing GSAP setup. Adds ScrollTrigger for scroll-linked
   motion. Every block below is self-contained and wrapped defensively so
   a failure in one section never leaves other content stuck invisible.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  

  /* If GSAP failed to load for any reason, just make sure the loader
     doesn't block the page forever, and leave everything else exactly
     as authored (no hidden states were ever applied). */
  if (typeof gsap === "undefined") {
    const loader = document.getElementById("loader");
    if (loader) {
      loader.style.transition = "opacity .5s ease";
      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";
    }
    return;
  }

  const hasScrollTrigger = typeof ScrollTrigger !== "undefined";
  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

  /* ------------------------------------------------------------------
     Utility: wrap each word of an element's text in a masked span so
     it can rise up from behind a clipping mask. Content/text is fully
     preserved — only markup structure changes.
  ------------------------------------------------------------------ */
  function splitWords(el) {
    if (!el || el.dataset.split === "true") return [];
    const words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map((w) => `<span class="mask-word"><span class="mask-inner">${w}</span></span>`)
      .join(" ");
    el.dataset.split = "true";
    return Array.from(el.querySelectorAll(".mask-inner"));
  }

  const heroWords = splitWords(document.querySelector(".hero-left h1"));
  const contactWords = splitWords(document.querySelector(".contact-footer-section .section-title"));
  const philosophyWords = splitWords(document.querySelector(".philosophy-text"));

  /* ==================================================================
     1. LOADER
  ================================================================== */
  const loader = document.getElementById("loader");
  const loaderSub = document.querySelector(".loader-subtitle");
  const loaderTitle = document.querySelector(".loader-title");
  const loaderBar = document.querySelector(".loader-progress-bar");

  function runLoader(onComplete) {
    if (!loader) { onComplete(); return; }

    if (prefersReducedMotion) {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.4,
        delay: 0.2,
        ease: "power1.out",
        onComplete: () => {
          loader.style.pointerEvents = "none";
          onComplete();
        }
      });
      return;
    }

    // Hand full timing control to GSAP instead of the CSS keyframes.
    if (loaderTitle) loaderTitle.style.animation = "none";
    if (loaderBar) loaderBar.style.animation = "none";

    try {
      gsap.set(loaderSub, { opacity: 0, y: 10 });
      gsap.set(loaderTitle, { opacity: 0, y: 24 });
      gsap.set(loaderBar, { width: "0%" });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.to(loader, {
            opacity: 0,
            scale: 0.98,
            duration: 0.35,
            ease: "power2.inOut",
            onComplete: () => {
              loader.style.pointerEvents = "none";
              onComplete();
            }
          });
        }
      });

      tl.to(loaderSub, { opacity: 1, y: 0, duration: 0.35 }, 0.1)
        .to(loaderTitle, { opacity: 1, y: 0, duration: 0.45 }, 0.2)
        .to(loaderBar, { width: "100%", duration: 0.8, ease: "power2.inOut" }, 0.2)
        .to({}, { duration: 0.15 }, 1.0); // brief settle before fade out
    } catch (err) {
      console.error(err);
      loader.style.opacity = "0";
      loader.style.pointerEvents = "none";
      onComplete();
    }
  }

  /* ==================================================================
     3. HERO — signature entrance (initial states set before paint)
  ================================================================== */
  const navbar = document.querySelector(".navbar");
  
  // Mobile navigation
const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
const mobileNavLinks = document.querySelectorAll(".nav-links a");

if (mobileMenuBtn && navbar) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = navbar.classList.toggle("menu-open");

    mobileMenuBtn.setAttribute("aria-expanded", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("menu-open");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");
    });
  });
}
  const heroStatus = document.querySelector(".status");
  const heroDesc = document.querySelector(".hero-right p");
  const heroBtn = document.querySelector(".hero-btn");
  const heroImage = document.querySelector(".hero-image");
  const heroSection = document.querySelector(".hero");

  const heroHiddenTargets = [navbar, heroStatus, heroDesc, heroBtn, heroImage, ...heroWords].filter(Boolean);

  try {
    if (navbar) gsap.set(navbar, { opacity: 0, y: -10 });
    if (heroStatus) gsap.set(heroStatus, { opacity: 0, y: 16 });
    if (heroWords.length) gsap.set(heroWords, { opacity: 0, y: 40 });
    if (heroDesc) gsap.set(heroDesc, { opacity: 0, y: 20 });
    if (heroBtn) gsap.set(heroBtn, { opacity: 0, y: 20 });
    if (heroImage) gsap.set(heroImage, { opacity: 0, y: 24, scale: 1.04 });
  } catch (err) {
    console.error(err);
    gsap.set(heroHiddenTargets, { clearProps: "all" });
  }

  function runHero() {
    try {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      if (navbar) tl.to(navbar, { opacity: 1, y: 0, duration: 0.6 }, 0);
      if (heroStatus) tl.to(heroStatus, { opacity: 1, y: 0, duration: 0.5 }, 0.15);
      if (heroWords.length) tl.to(heroWords, { opacity: 1, y: 0, duration: 0.7, stagger: 0.045 }, 0.30);
      if (heroDesc) tl.to(heroDesc, { opacity: 1, y: 0, duration: 0.6 }, 0.70);
      if (heroBtn) tl.to(heroBtn, { opacity: 1, y: 0, duration: 0.55 }, 0.85);
      if (heroImage) tl.to(heroImage, { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power2.out" }, 1.0);
    } catch (err) {
      console.error(err);
      gsap.set(heroHiddenTargets, { clearProps: "all" });
    }
  }

runLoader(() => {
  runHero();
  if (orbitBubbles) orbitBubbles.burst();

  // If coming from a case study, return directly to the Work section
  if (window.location.hash === "#work") {
    setTimeout(() => {
      const workSection = document.getElementById("work");

      if (workSection) {
        workSection.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    }, 100);
  }
});

  /* Cursor-tracking 3D tilt + pupil gaze on the avatar — desktop only
     (mirrors the "look toward cursor" motion from the reference video:
      the head turns in perspective 3D, and the pupils shift a few px
      independently within the eyes for a more human "looking at you"
      feel, rather than the whole head being a single rigid object). */
  const avatarTilt = document.getElementById("avatarTilt");
  const avatarScene = document.getElementById("avatarScene");
  const eyeLeft = document.getElementById("eyeLeft");
  const eyeRight = document.getElementById("eyeRight");

  if (!isCoarsePointer && !prefersReducedMotion && avatarTilt && avatarScene) {
    const MAX_TILT = 20; // degrees, head yaw/pitch

    const rotateXTo = gsap.quickTo(avatarTilt, "rotationX", { duration: 0.45, ease: "power3.out" });
    const rotateYTo = gsap.quickTo(avatarTilt, "rotationY", { duration: 0.45, ease: "power3.out" });

    let eyeXTo, eyeYTo, eyeXTo2, eyeYTo2;
    if (eyeLeft && eyeRight) {
      gsap.set([eyeLeft, eyeRight], { xPercent: -50, yPercent: -50 });
      eyeXTo  = gsap.quickTo(eyeLeft,  "x", { duration: 0.3, ease: "power3.out" });
      eyeYTo  = gsap.quickTo(eyeLeft,  "y", { duration: 0.3, ease: "power3.out" });
      eyeXTo2 = gsap.quickTo(eyeRight, "x", { duration: 0.3, ease: "power3.out" });
      eyeYTo2 = gsap.quickTo(eyeRight, "y", { duration: 0.3, ease: "power3.out" });
    }

    const MAX_EYE_SHIFT = 3.2; // px — small so it reads as a gaze, not a bulge

    // React to the cursor across the whole hero, not just the avatar box,
    // so it feels like the character is aware of you anywhere on screen.
    heroSection.addEventListener("mousemove", (e) => {
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;

      rotateYTo(relX * MAX_TILT * 2);   // turn left/right
      rotateXTo(-relY * MAX_TILT);      // tilt up/down (inverted for natural feel)

      if (eyeXTo) {
        eyeXTo(relX * MAX_EYE_SHIFT * 2);
        eyeYTo(relY * MAX_EYE_SHIFT);
        eyeXTo2(relX * MAX_EYE_SHIFT * 2);
        eyeYTo2(relY * MAX_EYE_SHIFT);
      }
    });

    heroSection.addEventListener("mouseleave", () => {
      rotateXTo(0);
      rotateYTo(0);
      if (eyeXTo) {
        eyeXTo(0); eyeYTo(0);
        eyeXTo2(0); eyeYTo2(0);
      }
    });
  }

  /* ==================================================================
     FLOATING APP BUBBLES — a fixed, asymmetric scatter around the
     avatar's head & shoulders (matching the reference layout), each
     bubble a different size and sitting at its own fixed spot. On
     load they start collapsed at the avatar's center and burst
     outward into place with a springy overshoot (Apple Memoji
     watch-face style), then settle into a gentle continuous bob.
     Position (dx/dy) and size are expressed as a fraction of the
     avatar's rendered width, so the whole cluster scales responsively
     without extra breakpoints.
  ================================================================== */
  const orbitBubbles = (function initOrbitBubbles() {
    const orbitField = document.getElementById("orbitField");
    const avatarScene = document.getElementById("avatarScene");
    if (!orbitField || !avatarScene) return null;

    const bubbleEls = Array.from(orbitField.querySelectorAll(".orbit-bubble"));
    if (!bubbleEls.length) return null;

    // One config entry per bubble, in DOM order:
    // Figma, About, Get in touch, LinkedIn, GitHub, Instagram, Resume
    // dx/dy: fixed offset from avatar center (× avatarWidth) that each
    // bubble settles into after the reveal — this also defines its own
    // fixed orbital radius/angle for the idle rotation that follows.
    // size: bubble diameter (× avatarWidth) — deliberately uneven,
    // like the reference image.
    // bobAmp/bobSpeed/phase: tiny per-bubble float/scale wobble used
    // only in the idle phase, once everything has already stopped.
    // NOTE: dx/dy/size were tuned by measuring the reference "keep
    // inside this box" screenshot against the avatar's actual rendered
    // scale.
    const configs = [
      { dx: -0.435, dy: -0.166, size: 0.235, bobAmp: 4, bobSpeed: 1.3 }, // Figma      — upper-left (shrunk to marked size)
      { dx:  0.555, dy:  0.049, size: 0.212, bobAmp: 4, bobSpeed: 1.1 }, // About      — shrunk to marked size
      { dx:  0.200, dy:  0.516, size: 0.205, bobAmp: 3, bobSpeed: 1.9 }, // Get in touch — lower-center-right
      { dx:  0.534, dy: -0.160, size: 0.160, bobAmp: 3, bobSpeed: 1.6 }, // LinkedIn   — small, upper-right
      { dx: -0.514, dy:  0.067, size: 0.120, bobAmp: 3, bobSpeed: 1.2 }, // GitHub     — small, left
      { dx: -0.477, dy:  0.400, size: 0.170, bobAmp: 4, bobSpeed: 1.5 }, // Instagram  — lower-left (shrunk to marked size)
      { dx:  0.037, dy: -0.346, size: 0.184, bobAmp: 3, bobSpeed: 1.4 }  // Resume     — top-center (shrunk to marked size)
    ];

    const bubbles = bubbleEls.map((el, i) => {
      const cfg = configs[i] || { dx: 0, dy: 0, size: 0.3, bobAmp: 4, bobSpeed: 1.4 };
      return Object.assign({ el, phase: Math.random() * Math.PI * 2 }, cfg);
    });

    let avatarWidth = avatarScene.getBoundingClientRect().width || 340;

    function sizeBubbles() {
      bubbles.forEach((b) => {
        const sizePx = avatarWidth * b.size;
        b.el.style.setProperty("--bsize", `${sizePx}px`);
        b.el.style.setProperty("--isize", `${sizePx * 0.42}px`);
      });
    }
    sizeBubbles();

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        avatarWidth = avatarScene.getBoundingClientRect().width || avatarWidth;
        sizeBubbles();
      }, 150);
    });

    // ---- IDLE PHASE (only starts after the reveal has fully stopped) ----
    // Each bubble keeps its own fixed distance from the avatar (set by
    // dx/dy above) and slowly sweeps around it, plus a small independent
    // float/scale wobble layered on top — subtle enough to read as
    // gentle drifting in 3D space, not a visible spin.
    const ORBIT_DEG_PER_SEC = 2; // ~180s per full revolution — barely perceptible

    function place(t) {
      const angleStep = prefersReducedMotion ? 0 : t * ORBIT_DEG_PER_SEC * (Math.PI / 180);
      bubbles.forEach((b) => {
        const finalX = avatarWidth * b.dx;
        const finalY = avatarWidth * b.dy;
        const r = Math.hypot(finalX, finalY);
        const baseAngle = Math.atan2(finalY, finalX);
        const angle = baseAngle + angleStep;
        const floatBob = prefersReducedMotion ? 0 : Math.sin(t * b.bobSpeed + b.phase) * b.bobAmp;
        const scaleWobble = prefersReducedMotion ? 1 : 1 + Math.sin(t * b.bobSpeed * 0.6 + b.phase) * 0.025;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle) + floatBob;
        b.el.style.transform = `translate(${x}px, ${y}px) scale(${scaleWobble})`;
      });
    }

    function startIdle() {
      let start = null;
      function tick(ts) {
        if (start === null) start = ts;
        place((ts - start) / 1000);
        requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (prefersReducedMotion) {
      place(0);
      return { burst: () => {} };
    }

    // Collapse every bubble down to a dot at the avatar's center before
    // the reveal plays, so there's something to emerge from.
    bubbles.forEach((b) => {
      b.el.style.opacity = "0";
      b.el.style.transform = "translate(0px, 0px) scale(0.15)";
    });

    let hasBurst = false;
    function burst() {
      if (hasBurst) return;
      hasBurst = true;

      if (typeof gsap === "undefined") {
        // No GSAP available — just reveal bubbles in place and idle.
        place(0);
        bubbles.forEach((b) => { b.el.style.opacity = "1"; });
        startIdle();
        return;
      }

      // Reveal phase only: scale up + move straight outward from behind
      // the avatar to each bubble's final position, then STOP. No
      // rotation or orbiting happens here — that's reserved entirely
      // for the idle phase, which only begins once every bubble has
      // arrived and this timeline has fully completed.
      const master = gsap.timeline({ onComplete: startIdle });
      const STAGGER = 0.08;

      bubbles.forEach((b, i) => {
        const finalX = avatarWidth * b.dx;
        const finalY = avatarWidth * b.dy;

        master.to(b.el, {
          x: finalX,
          y: finalY,
          scale: 1,
          opacity: 1,
          duration: 0.75,
          ease: "power3.out" // smooth deceleration straight into place, no orbit, no overshoot
        }, i * STAGGER);
      });
    }

    return { burst };
  })();



  /* ==================================================================
     ABOUT POPUP — triggered from the orbiting "About" bubble
  ================================================================== */
  (function initAboutPopup() {
    const trigger = document.getElementById("aboutBubbleBtn");
    const popup = document.getElementById("aboutPopup");
    const backdrop = document.getElementById("aboutPopupBackdrop");
    const closeBtn = document.getElementById("aboutPopupClose");
    if (!trigger || !popup || !backdrop) return;

    function openPopup() {
      popup.classList.add("is-open");
      backdrop.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
    }
    function closePopup() {
      popup.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      popup.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      popup.classList.contains("is-open") ? closePopup() : openPopup();
    });
    closeBtn.addEventListener("click", closePopup);
    backdrop.addEventListener("click", closePopup);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePopup();
    });
  })();


  /* ==================================================================
     GET IN TOUCH POPUP — triggered from the orbiting "Get in touch" bubble
  ================================================================== */
  (function initConnectPopup() {
    const trigger = document.getElementById("connectBubbleBtn");
    const popup = document.getElementById("connectPopup");
    const backdrop = document.getElementById("connectPopupBackdrop");
    const closeBtn = document.getElementById("connectPopupClose");
    if (!trigger || !popup || !backdrop) return;

    function openPopup() {
      popup.classList.add("is-open");
      backdrop.classList.add("is-open");
      popup.setAttribute("aria-hidden", "false");
      trigger.setAttribute("aria-expanded", "true");
    }
    function closePopup() {
      popup.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      popup.setAttribute("aria-hidden", "true");
      trigger.setAttribute("aria-expanded", "false");
    }

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      popup.classList.contains("is-open") ? closePopup() : openPopup();
    });
    closeBtn.addEventListener("click", closePopup);
    backdrop.addEventListener("click", closePopup);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closePopup();
    });
  })();


  /* ==================================================================
   2. NAVBAR — HERO / NON-HERO STATE
================================================================== */

(function initNavbarHeroState() {

    if (!navbar || !heroSection) return;

    let ticking = false;

    function updateNavbar() {

        const heroBottom = heroSection.getBoundingClientRect().bottom;

        if (heroBottom <= 100) {
            navbar.classList.add("navbar--compact");
        } else {
            navbar.classList.remove("navbar--compact");
        }

        ticking = false;
    }

    function requestUpdate() {

        if (!ticking) {
            window.requestAnimationFrame(updateNavbar);
            ticking = true;
        }

    }

    window.addEventListener(
        "scroll",
        requestUpdate,
        { passive: true }
    );

    window.addEventListener(
        "resize",
        requestUpdate
    );

    updateNavbar();

})();

  /* ==================================================================
   2b. NAVBAR — sliding hover pill between links
================================================================== */

(function initNavIndicator() {

    const navLinksEl = document.querySelector(".navbar.top-nav .nav-links");
    if (!navLinksEl || isCoarsePointer) return;

    const links = Array.from(navLinksEl.querySelectorAll("a"));
    if (!links.length) return;

    const indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    navLinksEl.prepend(indicator);

    function moveIndicatorTo(link) {
        const linkBox = link.getBoundingClientRect();
        const containerBox = navLinksEl.getBoundingClientRect();

        indicator.style.width = `${linkBox.width}px`;
        indicator.style.transform = `translate(${linkBox.left - containerBox.left}px, -50%)`;
        indicator.style.opacity = "1";
    }

    links.forEach((link) => {
        link.addEventListener("mouseenter", () => moveIndicatorTo(link));
    });

    navLinksEl.addEventListener("mouseleave", () => {
        indicator.style.opacity = "0";
    });

    // Keep the indicator glued to its link if the navbar resizes
    // (e.g. expand/compact transition, or viewport resize)
    window.addEventListener("resize", () => {
        const hovered = navLinksEl.querySelector("a:hover");
        if (hovered) moveIndicatorTo(hovered);
    });

})();

  /* ==================================================================
     4. SELECTED WORK — stagger entrance + cursor highlight
  ================================================================== */
  const workCards = gsap.utils.toArray(".work-card");

  if (workCards.length) {
    try {
      if (hasScrollTrigger) {
        gsap.set(workCards, { opacity: 0, y: 40 });
        gsap.to(workCards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".work-grid", start: "top 82%", once: true }
        });
      }
    } catch (err) {
      console.error(err);
      gsap.set(workCards, { clearProps: "all" });
    }
  }

  if (!isCoarsePointer) {
    workCards.forEach((card) => {
      const wrap = card.querySelector(".card-image-wrapper");
      if (!wrap) return;
      card.addEventListener("mousemove", (e) => {
        const rect = wrap.getBoundingClientRect();
        wrap.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width) * 100 + "%");
        wrap.style.setProperty("--my", ((e.clientY - rect.top) / rect.height) * 100 + "%");
      });
    });
  }

  /* ==================================================================
     5. PROJECT → CASE STUDY TRANSITION
  ================================================================== */
  const transitionOverlay = document.createElement("div");
  transitionOverlay.className = "page-transition-overlay";
  document.body.appendChild(transitionOverlay);
  gsap.set(transitionOverlay, { yPercent: 101 });
  window.addEventListener("pageshow", () => {
  gsap.killTweensOf(transitionOverlay);
  gsap.set(transitionOverlay, { yPercent: 101 });
});
  workCards.forEach((card) => {
    const href = card.getAttribute("href");
    if (!href || href.startsWith("#")) return; // preserves in-page anchors (e.g. "Currently Designing")

    card.addEventListener("click", (e) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();

      if (prefersReducedMotion) {
        window.location.href = href;
        return;
      }

      const img = card.querySelector(".card-img");
      const tl = gsap.timeline({ onComplete: () => { window.location.href = href; } });
      if (img) tl.to(img, { scale: 1.08, duration: 0.5, ease: "power2.out" }, 0);
      tl.to(transitionOverlay, { yPercent: 0, duration: 0.5, ease: "power3.inOut" }, 0.05);
    });
  });

  /* ==================================================================
     6. PHILOSOPHY — scroll-scrubbed reveal
  ================================================================== */
  if (philosophyWords.length && hasScrollTrigger) {
    try {
      gsap.set(philosophyWords, { opacity: 0.25 });
      gsap.to(philosophyWords, {
        opacity: 1,
        stagger: 0.05,
        ease: "none",
        scrollTrigger: {
          trigger: ".philosophy-text",
          start: "top 80%",
          end: "bottom 45%",
          scrub: 0.4
        }
      });
    } catch (err) {
      console.error(err);
      gsap.set(philosophyWords, { clearProps: "all" });
    }
  }

  /* ==================================================================
     7. CAREER JOURNEY — timeline draw
  ================================================================== */
  const timelineEl = document.querySelector(".timeline");
  if (timelineEl && hasScrollTrigger) {
    try {
      const progressLine = document.createElement("div");
      progressLine.className = "tl-progress-line";
      timelineEl.appendChild(progressLine);
      gsap.set(progressLine, { scaleY: 0 });

      gsap.to(progressLine, {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: timelineEl,
          start: "top 75%",
          end: "bottom 60%",
          scrub: 0.4
        }
      });

      gsap.utils.toArray(".timeline-item", timelineEl).forEach((item) => {
        item.classList.add("tl-enhanced");
        const dot = document.createElement("span");
        dot.className = "tl-dot";
        item.appendChild(dot);

        gsap.set(item, { opacity: 0, y: 20 });
        gsap.set(dot, { scale: 0.8, opacity: 0 });

        const itemTl = gsap.timeline({
          scrollTrigger: { trigger: item, start: "top 80%", once: true }
        });
        itemTl
          .to(item, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
          .to(dot, { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }, "-=0.3");
      });
    } catch (err) {
      console.error(err);
      gsap.set(".timeline-item, .tl-dot, .tl-progress-line", { clearProps: "all" });
    }
  }

  /* ==================================================================
     8. DESIGN PROCESS — animated progress path
  ================================================================== */
  const processGrid = document.querySelector(".process-grid");
  if (processGrid && hasScrollTrigger) {
    try {
      const track = document.createElement("div");
      track.className = "process-progress-track";
      const fill = document.createElement("div");
      fill.className = "process-progress-fill";
      track.appendChild(fill);
      processGrid.parentNode.insertBefore(track, processGrid);

      gsap.to(fill, {
        width: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: processGrid,
          start: "top 75%",
          end: "bottom 55%",
          scrub: 0.4
        }
      });

      const steps = gsap.utils.toArray(".process-step", processGrid);
      gsap.set(steps, { opacity: 0, y: 24 });

      steps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top 82%",
          once: true,
          onEnter: () => {
            gsap.to(step, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
            step.classList.add("active");
          }
        });
      });
    } catch (err) {
      console.error(err);
      gsap.set(".process-step, .process-progress-fill", { clearProps: "all" });
    }
  }

  /* ==================================================================
     9. SKILLS & TOOLS — stagger entrance
  ================================================================== */
  const toolCards = gsap.utils.toArray(".tool-card");
  const toolTags = gsap.utils.toArray(".tool-tag");

  if (hasScrollTrigger) {
    try {
      if (toolCards.length) {
        gsap.set(toolCards, { opacity: 0, y: 20, scale: 0.94 });
        gsap.to(toolCards, {
          opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.06, ease: "power3.out",
          scrollTrigger: { trigger: ".tools-grid", start: "top 85%", once: true }
        });
      }
      if (toolTags.length) {
        gsap.set(toolTags, { opacity: 0, scale: 0.92 });
        gsap.to(toolTags, {
          opacity: 1, scale: 1, duration: 0.4, stagger: 0.04, ease: "power3.out",
          scrollTrigger: { trigger: ".skills-pill-wrapper", start: "top 85%", once: true }
        });
      }
    } catch (err) {
      console.error(err);
      gsap.set([...toolCards, ...toolTags], { clearProps: "all" });
    }
  }

  /* ==================================================================
     10. ACHIEVEMENTS — stagger + delayed icon activation
  ================================================================== */
  const badgeCards = gsap.utils.toArray(".badge-card");
  if (badgeCards.length && hasScrollTrigger) {
    try {
      gsap.set(badgeCards, { opacity: 0, y: 30 });
      badgeCards.forEach((card) => {
        const icon = card.querySelector(".badge-icon-wrapper");
        if (icon) gsap.set(icon, { scale: 0.9 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: card, start: "top 85%", once: true }
        });
        tl.to(card, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
        if (icon) tl.to(icon, { scale: 1, duration: 0.4, ease: "power2.out" }, "-=0.2");
      });
    } catch (err) {
      console.error(err);
      gsap.set(".badge-card, .badge-icon-wrapper", { clearProps: "all" });
    }
  }

  /* ==================================================================
     14. GLOBAL SCROLL REVEAL — shared section headers
  ================================================================== */
  if (hasScrollTrigger) {
    try {
      const headers = [
        ...document.querySelectorAll(".section-header"),
        document.querySelector(".work-header"),
        document.querySelector(".beyond-header")
      ].filter(Boolean);

      headers.forEach((header) => {
        gsap.set(header, { opacity: 0, y: 24 });
        gsap.to(header, {
          opacity: 1, y: 0, duration: 0.6, ease: "power3.out",
          scrollTrigger: { trigger: header, start: "top 85%", once: true }
        });
      });
    } catch (err) {
      console.error(err);
      gsap.set(".section-header, .work-header, .beyond-header", { clearProps: "all" });
    }
  }

  /* ==================================================================
     12. CONTACT / FINAL CTA
  ================================================================== */
  const emailPill = document.querySelector(".email-pill");
  const socialIcons = gsap.utils.toArray(".social-icon");

  if (hasScrollTrigger) {
    try {
      if (contactWords.length) gsap.set(contactWords, { opacity: 0, y: 24 });
      if (emailPill) gsap.set(emailPill, { opacity: 0, y: 16 });
      if (socialIcons.length) gsap.set(socialIcons, { opacity: 0, scale: 0.9 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ".contact-footer-section", start: "top 70%", once: true }
      });
      if (contactWords.length) tl.to(contactWords, { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power3.out" }, 0);
      if (emailPill) tl.to(emailPill, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.3);
      if (socialIcons.length) tl.to(socialIcons, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.06, ease: "power2.out" }, 0.4);
    } catch (err) {
      console.error(err);
      gsap.set([contactWords, emailPill, socialIcons].flat().filter(Boolean), { clearProps: "all" });
    }
  }

  /* ==================================================================
     13. CUSTOM CURSOR — desktop only, optional
  ================================================================== */
  if (!isCoarsePointer && !prefersReducedMotion) {
    try {
      const cursor = document.createElement("div");
      cursor.className = "custom-cursor";
      document.body.appendChild(cursor);
      document.body.classList.add("has-custom-cursor");

      const cxTo = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3.out" });
      const cyTo = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3.out" });

      window.addEventListener("mousemove", (e) => {
        cxTo(e.clientX);
        cyTo(e.clientY);
        cursor.classList.add("is-active");
      });

      workCards.forEach((card) => {
        card.addEventListener("mouseenter", () => {
          cursor.classList.add("is-hover-project");
          cursor.textContent = "VIEW";
        });
        card.addEventListener("mouseleave", () => {
          cursor.classList.remove("is-hover-project");
          cursor.textContent = "";
        });
      });

      document.querySelectorAll(".hero-btn, .email-pill, .nav-cta, .social-icon").forEach((btn) => {
        btn.addEventListener("mouseenter", () => cursor.classList.add("is-hover-btn"));
        btn.addEventListener("mouseleave", () => cursor.classList.remove("is-hover-btn"));
      });
    } catch (err) {
      console.error(err);
    }
  }
});