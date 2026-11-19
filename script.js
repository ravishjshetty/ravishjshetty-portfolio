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

  const contactWords = splitWords(document.querySelector(".contact-footer-section .section-title"));
  const philosophyWords = splitWords(document.querySelector(".philosophy-text"));

  /* ==================================================================
     1. LOADER
  ================================================================== */
  const loader = document.getElementById("loader");
  const loaderSub = document.querySelector(".loader-subtitle");
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
    if (loaderBar) loaderBar.style.animation = "none";

    try {
      gsap.set(loaderSub, { opacity: 0, y: 10 });
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
     3. NAVBAR ENTRANCE (initial state set before paint)
  ================================================================== */
  const navbar = document.querySelector(".navbar");
  const heroSection = document.querySelector(".hero");

  try {
    if (navbar) gsap.set(navbar, { opacity: 0, y: -10 });
  } catch (err) {
    console.error(err);
    gsap.set([navbar].filter(Boolean), { clearProps: "all" });
  }

  function runHero() {
    try {
      if (navbar) gsap.to(navbar, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    } catch (err) {
      console.error(err);
      gsap.set([navbar].filter(Boolean), { clearProps: "all" });
    }
  }

  runLoader(() => {
    runHero();

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
     STORY SECTION — Sticky Notes Float & Reveal
  ================================================================== */
  const notes = gsap.utils.toArray(".sticky-note");

  if (notes.length && hasScrollTrigger) {
    // Reveal notes on scroll
    gsap.from(notes, {
      opacity: 0,
      y: 50,
      rotation: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: ".about-story-section",
        start: "top 60%"
      }
    });

    // Gentle continuous bobbing animation
    notes.forEach((note, i) => {
      gsap.to(note, {
        y: "+=15",
        rotation: i % 2 === 0 ? "+=2" : "-=2",
        duration: 2 + i,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: i * 0.2
      });
    });
  }

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

      document.querySelectorAll(".email-pill, .social-icon").forEach((btn) => {
        btn.addEventListener("mouseenter", () => cursor.classList.add("is-hover-btn"));
        btn.addEventListener("mouseleave", () => cursor.classList.remove("is-hover-btn"));
      });
    } catch (err) {
      console.error(err);
    }
  }
});