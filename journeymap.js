/* ==========================================================================
   03 / CAREER JOURNEY: scroll-driven lily map
   - A sticky stage is scrubbed by scroll position (no pinning library needed).
   - The route is a lily drawn in one stroke: stem -> petals. It is deliberately
     left unfinished (half a flower) because the journey isn't over yet.
   - Edit STOPS / the petal list below to change stops or how much is drawn.
   ========================================================================== */
(function () {
  "use strict";

  const sec = document.getElementById("journey");
  if (!sec) return;
  const stage = document.getElementById("jmStage"),
        svg = document.getElementById("jmMap"),
        world = document.getElementById("jmWorld"),
        pinsEl = document.getElementById("jmPins"),
        navEl = document.getElementById("jmNav"),
        headEl = document.getElementById("jmHead"),
        startBtn = document.getElementById("jmStart"),
        skipBtn = document.getElementById("jmSkip"),
        startLabel = document.getElementById("jmStartL"),
        compass = document.getElementById("jmCompass"),
        needle = document.getElementById("jmNeedle"),
        prog = document.getElementById("jmProg"),
        dotsEl = document.getElementById("jmDots"),
        progL = document.getElementById("jmProgL"),
        cards = Array.from(sec.querySelectorAll(".jm-card"));
  if (!stage || !svg || !world || cards.length === 0) return;

  /* ---------------- CONFIG ---------------- */
  // anchor: where on the lily the stop sits ("start" | "A" | "B" | "end")
  const STOPS = [
    { label: "MITE",          short: "BE", color: "#1fb6a6", when: "2022 \u2013 2026 \u00b7 Degree",       anchor: "start" },
    { label: "Self-driven",   short: "PS", color: "#8b5cf6", when: "2024 \u2013 2025 \u00b7 Specialization", anchor: "A" },
    { label: "Accolade Tech", short: "AT", color: "#ff8a4c", when: "Feb \u2013 May 2026 \u00b7 Intern",      anchor: "B" },
    { label: "You are here",  short: "?",  color: "#9aa0ab", when: "2026 \u00b7 To be continued",            anchor: "end", ghost: true }
  ];
  const UNITS = { intro: 0.6, zin: 0.8, dwell: 0.9, zout: 0.9, outro: 0.5, perPath: 5 }; // scroll "lengths"
  const VH_PER_UNIT = 0.45;                                                          // screens of scroll per unit

  const NS = "http://www.w3.org/2000/svg";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => t * t * (3 - 2 * t);

  /* ---------------- LILY GEOMETRY (world units) ---------------- */
  const P = (x, y) => ({ x, y });
  const CF = P(520, 430);                 // flower centre
  const cubics = [];                      // [p0, p1, p2, p3]
  const add = (c) => cubics.push(c);

  // One tepal: out along one edge to a pointed tip, back along the other.
  // deferReturn: only draw the way out now and hand back the return edge.
  function petal(deg, L, W, deferReturn) {
    const a = (deg * Math.PI) / 180,
          u = P(Math.cos(a), Math.sin(a)),
          n = P(-Math.sin(a), Math.cos(a));
    const at = (su, sn) => P(CF.x + u.x * L * su + n.x * W * sn, CF.y + u.y * L * su + n.y * W * sn);
    const tip = at(1, 0.12);
    add([CF, at(0.35, 0.7), at(0.8, 1.5), tip]);
    const mark = cubics.length;           // route index at the tip
    const ret = [tip, at(0.8, -1.5), at(0.35, -0.7), CF];
    if (deferReturn) return { mark: mark, ret: ret, deg: deg };
    add(ret);
    return { mark: mark, end: cubics.length, deg: deg };
  }

  // short stem (the journey starts here)
  add([P(548, 745), P(520, 650), P(545, 520), CF]);
  // ---- WALKED PART: stem, petal A, petal B, then the way out along petal C ----
  const pA = petal(122, 270, 80), markA = pA.mark;      // 2024 - 25 sits on this tip
  const pB = petal(186, 270, 80), markB = pB.mark;      // 2026 intern sits on this tip
  const pc = petal(250, 270, 80, true);         // "you are here" = tip of this petal
  const markWalk = pc.mark;                      // <- the walk ends here (half the flower)
  // ---- NOT WALKED YET (drawn dotted): rest of petal C + the other three petals ----
  add(pc.ret);
  petal(308, 270, 80);
  petal(356, 270, 80);
  petal(60, 270, 80);

  const dOf = (k) =>
    "M" + cubics[0][0].x + " " + cubics[0][0].y +
    cubics.slice(0, k).map((c) => "C" + c[1].x + " " + c[1].y + " " + c[2].x + " " + c[2].y + " " + c[3].x + " " + c[3].y).join("");
  const restD = () => {                     // from the end of the walk to the end of the flower
    const st = cubics[markWalk][0];
    return "M" + st.x + " " + st.y +
      cubics.slice(markWalk).map((c) => "C" + c[1].x + " " + c[1].y + " " + c[2].x + " " + c[2].y + " " + c[3].x + " " + c[3].y).join("");
  };

  /* ---------------- MAP BACKGROUND + ROUTE ---------------- */
  const FONT = "font-family:'Bricolage Grotesque',Inter,sans-serif;font-weight:700;";
  /* ---- lily petal art (drawn in the petal's own frame: x along the petal, origin at the flower centre) ---- */
  const PL = 270, PW = 80, pp = (a, b) => (a * PL).toFixed(1) + " " + (b * PW).toFixed(1);
  const petalD = "M0 0C" + pp(.35, .7) + "," + pp(.8, 1.5) + "," + pp(1, .12) + "C" + pp(.8, -1.5) + "," + pp(.35, -.7) + ",0 0Z";
  let sd = 11; const rr = () => (sd = (sd * 9301 + 49297) % 233280) / 233280;
  let dots = "";
  for (let i = 0; i < 34; i++) { const x = 18 + rr() * 120, y = (rr() - .5) * x * .55; dots += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (1 + rr() * 1.4).toFixed(1) + '" ry="' + (1.4 + rr() * 1.6).toFixed(1) + '"/>'; }
  const LILY_DEFS =
    '<linearGradient id="jmPg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="' + PL + '" y2="0"><stop offset="0" stop-color="#f5efb8"/><stop offset=".14" stop-color="#ffd9e6"/><stop offset=".45" stop-color="#f59bbd"/><stop offset=".8" stop-color="#e8588f"/><stop offset="1" stop-color="#f58fb4"/></linearGradient>' +
    '<linearGradient id="jmPe" gradientUnits="userSpaceOnUse" x1="0" y1="-90" x2="0" y2="90"><stop offset="0" stop-color="#a81f5e" stop-opacity=".45"/><stop offset=".32" stop-color="#a81f5e" stop-opacity="0"/><stop offset=".68" stop-color="#a81f5e" stop-opacity="0"/><stop offset="1" stop-color="#a81f5e" stop-opacity=".45"/></linearGradient>' +
    '<clipPath id="jmPc"><path d="' + petalD + '"/></clipPath>';
  const PETAL_SVG =
    '<path d="' + petalD + '" fill="url(#jmPg)"/><path d="' + petalD + '" fill="url(#jmPe)"/>' +
    '<g clip-path="url(#jmPc)" fill="none" stroke-linecap="round">' +
      '<path d="M8 0C90 -3 180 2 252 6" stroke="#fff3f8" stroke-width="5" opacity=".5"/><path d="M8 0C90 -3 180 2 252 6" stroke="#c4326f" stroke-width="1" opacity=".55"/>' +
      [-1, 1].map((k) => '<path d="M20 0C100 ' + k * 16 + ' 190 ' + k * 30 + ' 255 ' + k * 8 + '" stroke="#cf3f7c" stroke-width="1.1" opacity=".4"/><path d="M30 0C110 ' + k * 34 + ' 200 ' + k * 52 + ' 248 ' + k * 14 + '" stroke="#cf3f7c" stroke-width="1" opacity=".3"/>').join("") +
      '<g fill="#b01f5a" stroke="none" opacity=".75">' + dots + '</g>' +
    '</g><path d="' + petalD + '" fill="none" stroke="#d0457f" stroke-width="1.4" opacity=".75"/>';
  world.innerHTML =
    '<defs>' + LILY_DEFS +
      '<pattern id="jmMinor" width="44" height="44" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)"><path d="M44 0H0V44" fill="none" stroke="#212329" stroke-width="1.3"/></pattern>' +
      '<pattern id="jmMajor" width="176" height="176" patternUnits="userSpaceOnUse" patternTransform="rotate(-16)"><path d="M176 0H0V176" fill="none" stroke="#2c2f36" stroke-width="3"/></pattern>' +
    '</defs>' +
    '<rect x="-4000" y="-3000" width="8000" height="7000" fill="#16171b"/>' +
    '<rect x="-4000" y="-3000" width="8000" height="7000" fill="url(#jmMinor)"/>' +
    '<rect x="-4000" y="-3000" width="8000" height="7000" fill="url(#jmMajor)"/>' +
    // parks, lake, river
    '<g fill="#173324" opacity=".85"><path d="M90 600c40-40 110-30 130 10s-20 90-80 90-90-60-50-100z"/><path d="M760 640c50-30 120 0 120 50s-60 70-110 50-50-70-10-100z"/><path d="M90 170c30-35 90-30 105 10s-30 70-75 60-60-40-30-70z"/></g>' +
    '<ellipse cx="880" cy="240" rx="100" ry="58" fill="#17283b"/>' +
    '<path d="M-700 720C-250 620 80 790 420 700S920 610 1500 670" fill="none" stroke="#17283b" stroke-width="46" stroke-linecap="round"/>' +
    // arterial roads + amber highway
    '<g fill="none" stroke="#2f323a" stroke-width="7" stroke-linecap="round"><path d="M-600 60C0 120 600 50 1400 130"/><path d="M180 -300C230 300 150 800 230 1400"/><path d="M870 -200C810 400 930 800 850 1400"/><path d="M-500 900C100 860 700 950 1400 870"/></g>' +
    '<path d="M-700 330C-100 280 700 250 1500 300" fill="none" stroke="#5b4a17" stroke-width="10" opacity=".85" stroke-linecap="round"/>' +
    '<path d="M-700 330C-100 280 700 250 1500 300" fill="none" stroke="#8a7424" stroke-width="1.6" stroke-dasharray="14 12" opacity=".7"/>' +
    // district labels
    '<g fill="#30333a" style="' + FONT + 'font-size:24px;letter-spacing:9px"><text x="130" y="835">MANGALURU</text><text x="590" y="835" font-size="20" letter-spacing="7">ENGINEERING QUARTER</text><text x="-60" y="520" font-size="20" letter-spacing="7">DESIGN DISTRICT</text></g>' +
    // stamens (decor, like the reference lily)
    '<g id="jmPetals"></g><g stroke="#e9c98a" stroke-width="2" opacity=".9" stroke-linecap="round" fill="#b5412a">' +
      [292, 303, 314, 325, 336].map(function (dg, k) {
        const r = (dg * Math.PI) / 180, len = 105 + (k % 3) * 22;
        const ex = CF.x + Math.cos(r) * len, ey = CF.y + Math.sin(r) * len;
        return '<line x1="' + CF.x + '" y1="' + CF.y + '" x2="' + ex + '" y2="' + ey + '"/><ellipse cx="' + ex + '" cy="' + ey + '" rx="4" ry="9" transform="rotate(' + (dg + 90) + ' ' + ex + ' ' + ey + ')"/>';
      }).join("") + '</g>' +
    // route: unwalked rest (dotted), faint walked line, glow, bright travelled part
    '<path id="jmRest" class="jm-route-rest" d="' + restD() + '"/>' +
    '<path id="jmBase" class="jm-route-base" d="' + dOf(markWalk) + '"/>' +
    '<path id="jmGlow" class="jm-route-glow" d="' + dOf(markWalk) + '"/>' +
    '<path id="jmBright" class="jm-route-bright" d="' + dOf(markWalk) + '"/>';

  const base = document.getElementById("jmBase"),
        glow = document.getElementById("jmGlow"),
        bright = document.getElementById("jmBright"),
        rest = document.getElementById("jmRest");
  const L = base.getTotalLength();

  function prefixLen(k) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", dOf(k));
    world.appendChild(p);
    const len = p.getTotalLength();
    world.removeChild(p);
    return len;
  }
  const anchorF = { start: 0, A: prefixLen(markA) / L, B: prefixLen(markB) / L, end: 1 };
  const fr = STOPS.map((s) => anchorF[s.anchor]);
  const pts = fr.map((f) => base.getPointAtLength(f * L));
  /* lily look: pink route, green stem, petals fill in once the line has traced them */
  base.style.stroke = "#e58aaa"; glow.style.stroke = "#ff6fa3"; bright.style.stroke = "#ff6fa3"; rest.style.stroke = "#d98aa8";
  const stemLen = prefixLen(1), stem = document.createElementNS(NS, "path");
  stem.setAttribute("d", dOf(1)); stem.style.cssText = "fill:none;stroke:#3f7a3a;stroke-linecap:round;stroke-linejoin:round";
  world.appendChild(stem);
  const lilyPetals = [pA, pB].map((p) => { const g = document.createElementNS(NS, "g"); g.innerHTML = PETAL_SVG; g.style.opacity = 0; document.getElementById("jmPetals").appendChild(g); return { g: g, deg: p.deg, f0: prefixLen(p.end) / L }; });
  const bb = (function () {                 // bounding box of the whole lily
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", dOf(cubics.length));
    world.appendChild(p);
    const b = p.getBBox();
    world.removeChild(p);
    return b;
  })();
  const bbC = P(bb.x + bb.width / 2, bb.y + bb.height / 2);

  /* ---------------- PINS / PROGRESS UI ---------------- */
  STOPS.forEach((s, i) => {
    const el = document.createElement("div");
    el.className = "jm-pin" + (s.ghost ? " ghost" : "");
    el.style.setProperty("--c", s.color);
    el.innerHTML = '<svg viewBox="0 0 40 52"><path d="M20 50C20 50 4 33 4 19a16 16 0 0 1 32 0c0 14-16 31-16 31z"/></svg><b>' + s.short + "</b><span>" + s.label + "</span>";
    pinsEl.appendChild(el);
    s.el = el;
    const d = document.createElement("i");
    d.style.setProperty("--c", s.color);
    dotsEl.appendChild(d);
    s.dot = d;
  });

  /* ---------------- SCROLL TIMELINE ---------------- */
  const phases = [];
  let total = 0;
  const push = (type, len, extra) => { phases.push(Object.assign({ type: type, u0: total, u1: total + len }, extra)); total += len; };
  push("intro", UNITS.intro);
  push("zin", UNITS.zin);
  STOPS.forEach((s, i) => {
    push("dwell", UNITS.dwell, { i: i });
    if (i < STOPS.length - 1) push("travel", Math.max(0.6, (fr[i + 1] - fr[i]) * UNITS.perPath), { i: i });
  });
  push("zout", UNITS.zout);
  push("outro", UNITS.outro);

  const easeTravel = (t) => 0.5 * t + 0.5 * smooth(t);
  function sample(u) {
    u = clamp(u, 0, total - 1e-6);
    for (const ph of phases) {
      if (u >= ph.u1) continue;
      const t = (u - ph.u0) / (ph.u1 - ph.u0);
      switch (ph.type) {
        case "intro":  return { z: 0, f: 0, act: -1 };
        case "zin":    return { z: smooth(t), f: 0, act: -1 };
        case "dwell":  return { z: 1, f: fr[ph.i], act: ph.i };
        case "travel": return { z: 1, f: lerp(fr[ph.i], fr[ph.i + 1], easeTravel(t)), act: -1 };
        case "zout":   return { z: 1 - smooth(t), f: 1, act: -1 };
        default:       return { z: 0, f: 1, act: -1 };
      }
    }
    return { z: 0, f: 1, act: -1 };
  }

  /* ---------------- CAMERA + RENDER ---------------- */
  let completed = false, collapsed = false;   // finished the walk once? / runway removed?
  let W = 0, H = 0, mobile = false, s0 = 0.6, s1 = 2.2, heading = 0, lastAct = -2, lastDots = "";

  function measure() {
    W = stage.clientWidth; H = stage.clientHeight;
    mobile = W < 861;
    const aw = W * (mobile ? 0.8 : 0.8), ah = H * (mobile ? 0.4 : 0.46);
    s0 = Math.min(aw / (bb.width + 70), ah / (bb.height + 90));
    s1 = mobile ? 1.7 : 2.2;
    setHeight();
  }
  // The rest of the page reveals itself with GSAP ScrollTrigger, which measures scroll
  // positions once. Whenever this section changes height those numbers go stale and later
  // sections stay hidden, so ask ScrollTrigger to re-measure after every height change.
  function refreshTriggers() {
    if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === "function") {
      requestAnimationFrame(() => window.ScrollTrigger.refresh());
    }
  }
  function setHeight() {
    sec.style.height = collapsed ? H + "px" : Math.round(H * (1 + total * VH_PER_UNIT)) + "px";
  }

  function render(u) {
    const st = sample(u), z = st.z, f = st.f;
    const len = f * L;
    const here = base.getPointAtLength(len);

    // camera: overview (whole lily) <-> follow (zoomed on the arrow)
    const ov = P(W / 2, H * (mobile ? 0.64 : 0.685));
    const fo = mobile ? P(W / 2, H * 0.3) : P(W * 0.6, H * 0.52);
    const F = P(lerp(ov.x, fo.x, z), lerp(ov.y, fo.y, z));
    const T = P(lerp(bbC.x, here.x, z), lerp(bbC.y, here.y, z));
    const s = Math.exp(lerp(Math.log(s0), Math.log(s1), z));
    world.setAttribute("transform", "translate(" + (F.x - T.x * s) + " " + (F.y - T.y * s) + ") scale(" + s + ")");
    const scr = (p) => ({ x: F.x + (p.x - T.x) * s, y: F.y + (p.y - T.y) * s });

    // route strokes (kept ~constant on screen)
    const wb = lerp(3.4, 4, z) / s, wr = lerp(3.8, 5.5, z) / s;
    base.style.strokeWidth = wb; base.style.opacity = lerp(0.95, 0.34, z);
    glow.style.strokeWidth = wr * 2.6;
    rest.style.strokeWidth = lerp(3.4, 4.2, z) / s;
    rest.style.strokeDasharray = "0.01 " + 10 / s;
    bright.style.strokeWidth = wr;
    const dash = len + " " + (L * 2);
    bright.style.strokeDasharray = dash; glow.style.strokeDasharray = dash;
    bright.style.opacity = glow.style.opacity = len < 0.5 ? 0 : 1;
    stem.style.strokeWidth = wr * 1.15; stem.style.strokeDasharray = Math.min(len, stemLen) + " " + (L * 2); stem.style.opacity = len < 0.5 ? 0 : 1;
    lilyPetals.forEach((p) => { const e = smooth(clamp((f - p.f0) / 0.05, 0, 1)); p.g.style.opacity = e; p.g.setAttribute("transform", "translate(" + CF.x + " " + CF.y + ") rotate(" + p.deg + ") scale(" + (0.8 + 0.2 * e) + ")"); });

    // heading of the arrow (smoothed)
    const a = base.getPointAtLength(clamp(len + 5, 0, L)), b = base.getPointAtLength(clamp(len - 5, 0, L));
    let target = (Math.atan2(a.y - b.y, a.x - b.x) * 180) / Math.PI;
    let d = ((target - heading + 540) % 360) - 180;
    heading += d * 0.22;
    const ap = scr(here);
    navEl.style.opacity = clamp((z - 0.35) * 2.2, 0, 1);
    navEl.style.transform = "translate(" + (ap.x - 17) + "px," + (ap.y - 17) + "px) rotate(" + (heading + 90) + "deg)";
    compass.style.opacity = clamp((z - 0.5) * 2, 0, 1);
    needle.style.transform = "rotate(" + (heading + 90) + "deg)";

    // pins
    const ps = lerp(0.66, 1, z);
    STOPS.forEach((sx, i) => {
      const p = scr(pts[i]);
      sx.el.style.transform = "translate(" + (p.x - 20) + "px," + (p.y - 50) + "px) scale(" + ps + ")";
      sx.el.classList.toggle("is-ahead", z > 0.5 && f < fr[i] - 0.004);
      sx.el.classList.toggle("is-active", st.act === i);
    });

    // cards
    if (st.act !== lastAct) {
      cards.forEach((c, i) => c.classList.toggle("is-on", i === st.act));
      lastAct = st.act;
    }

    // intro / outro heading + buttons
    const ho = clamp(1 - z * 2.4, 0, 1);
    headEl.style.opacity = ho;
    headEl.style.transform = "translateY(" + (1 - ho) * -18 + "px)";
    startBtn.style.opacity = ho; startBtn.style.pointerEvents = ho > 0.5 ? "auto" : "none";
    skipBtn.classList.toggle("show", z > 0.6 && !mobile);

    // progress pill
    prog.style.opacity = clamp((z - 0.5) * 2, 0, 1);
    let reached = -1;
    STOPS.forEach((sx, i) => { if (f >= fr[i] - 0.002 && z > 0.5) reached = i; });
    const key = reached + "|" + mobile;
    if (key !== lastDots) {
      STOPS.forEach((sx, i) => sx.dot.classList.toggle("on", i <= reached));
      progL.textContent = reached >= 0 ? STOPS[reached].when : "";
      lastDots = key;
    }
  }

  /* ---------------- SCROLL LOOP ---------------- */
  let cur = 0, tgt = 0, raf = 0, last = 0;
  function readScroll() {
    if (collapsed) { tgt = total; return; }          // finished once: always show the full map
    const r = sec.getBoundingClientRect();
    const max = Math.max(1, sec.offsetHeight - H);
    tgt = clamp(-r.top / max, 0, 1) * total;
    if (tgt >= total - 0.05) completed = true;       // reached the end of the walk
  }
  // Once the walk was seen to the end AND the visitor has scrolled on past the section,
  // drop the long scroll runway so coming back just shows the finished map (no reverse walk).
  function maybeCollapse() {
    if (!completed || collapsed) return;
    if (sec.getBoundingClientRect().bottom > 0) return;   // still on screen: leave it alone
    const old = sec.offsetHeight, y0 = window.scrollY;   // read BEFORE the page gets shorter
    collapsed = true;
    setHeight();
    const delta = old - sec.offsetHeight;
    window.scrollTo({ top: Math.max(0, y0 - delta), behavior: "instant" });  // keep the page where it was
    cur = tgt = total;
    render(cur);
    setReplayLabel(true);
    refreshTriggers();
  }
  function setReplayLabel(replay) {
    startLabel.textContent = replay ? "Replay the walk" : "Start the walk";
    startBtn.classList.toggle("is-replay", replay);
  }
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    cur += (tgt - cur) * (1 - Math.exp(-dt * 9));
    if (Math.abs(tgt - cur) < 0.0005) cur = tgt;
    render(cur);
    raf = cur !== tgt ? requestAnimationFrame(tick) : 0;
  }
  function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } }

  window.addEventListener("scroll", () => { readScroll(); maybeCollapse(); kick(); }, { passive: true });
  let rz;
  window.addEventListener("resize", () => {
    clearTimeout(rz);
    rz = setTimeout(() => { measure(); readScroll(); cur = tgt; render(cur); refreshTriggers(); }, 120);
  });

  // buttons
  const scrollToU = (u, smoothly) => {
    const max = sec.offsetHeight - H;
    const top = sec.getBoundingClientRect().top + window.scrollY + (u / total) * max;
    window.scrollTo({ top: top, behavior: smoothly ? "smooth" : "auto" });
  };
  startBtn.addEventListener("click", () => {
    if (collapsed) {                       // replay: bring the runway back and start from the beginning
      collapsed = false; completed = false;
      setHeight();
      refreshTriggers();
      setReplayLabel(false);
      cur = tgt = 0; render(0);
    }
    scrollToU(phases[2].u0 + 0.05, true);
  });
  skipBtn.addEventListener("click", () => scrollToU(total, true));

  measure(); readScroll(); cur = tgt; render(cur);
  window.addEventListener("load", () => { measure(); readScroll(); cur = tgt; render(cur); refreshTriggers(); });
})();

/* ==========================================================================
   Full-size photo lightbox, shared by:
   1) the Journey cards (small .jm-ph photos), and
   2) the "Beyond the Screen" noticeboard (the pinned .bd-polaroid photos).
   prev / next / close, keyboard + swipe. Nothing to edit here.
   ========================================================================== */
(function () {
  "use strict";
  const galleries = Array.from(document.querySelectorAll(".jm-gallery"));
  const board = document.getElementById("bdBoard");
  if (!galleries.length && !board) return;

  const lb = document.createElement("div");
  lb.className = "jm-lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-hidden", "true");
  lb.innerHTML =
    '<div class="jm-lb-head"><small></small><h4></h4></div>' +
    '<button type="button" class="jm-lb-x" aria-label="Close photo">&times;</button>' +
    '<figure class="jm-lb-fig"><div class="jm-lb-img"><img alt="" draggable="false"><div class="jm-lb-ph">Photo coming soon</div></div><figcaption></figcaption></figure>' +
    '<div class="jm-lb-ctl"><button type="button" class="jm-lb-prev" aria-label="Previous photo">&#8249;</button><span class="jm-lb-count"></span><button type="button" class="jm-lb-next" aria-label="Next photo">&#8250;</button></div>';
  document.body.appendChild(lb);

  const q = (s) => lb.querySelector(s);
  const fig = q(".jm-lb-fig"), img = q(".jm-lb-img img"), cap = q("figcaption"),
        sub = q(".jm-lb-head small"), ttl = q(".jm-lb-head h4"), count = q(".jm-lb-count"),
        ctl = q(".jm-lb-ctl"), closeBtn = q(".jm-lb-x"), prevBtn = q(".jm-lb-prev"), nextBtn = q(".jm-lb-next");

  let items = [], idx = 0, opener = null, isOpen = false;   // items: [{src, cap}]

  function paint() {
    const it = items[idx];
    cap.textContent = it.cap;
    count.textContent = (idx + 1) + " / " + items.length;
    ctl.classList.toggle("is-single", items.length < 2);
    if (it.src) {
      fig.classList.remove("no-img");
      img.onerror = () => fig.classList.add("no-img");
      img.src = it.src; img.alt = it.cap;
    } else {
      fig.classList.add("no-img"); img.removeAttribute("src");
    }
  }
  function show(i, animate) {
    idx = (i + items.length) % items.length;
    if (!animate) { paint(); return; }
    fig.classList.add("is-swap");
    setTimeout(() => { paint(); fig.classList.remove("is-swap"); }, 160);
  }
  function openSet(list, i, subText, titleText, openerEl) {
    if (!list.length) return;
    items = list; idx = i;
    sub.textContent = subText || ""; ttl.textContent = titleText || "";
    opener = openerEl || null; isOpen = true;
    paint();
    lb.setAttribute("aria-hidden", "false");
    lb.classList.add("is-open");
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  /* ---- 1) Journey cards ---- */
  galleries.forEach((g) => g.addEventListener("click", (e) => {
    const b = e.target.closest(".jm-ph");
    if (!b) return;
    const card = b.closest(".jm-card"), btns = Array.from(g.querySelectorAll(".jm-ph"));
    openSet(
      btns.map((x) => ({ src: x.querySelector("img") ? x.querySelector("img").getAttribute("src") : "", cap: x.querySelector(".jm-ph-cap").textContent })),
      btns.indexOf(b),
      card && card.querySelector(".jm-card-top small") ? card.querySelector(".jm-card-top small").textContent : "",
      card && card.querySelector("h3") ? card.querySelector("h3").textContent : "",
      b
    );
  }));

  /* ---- 2) Noticeboard photos ----
     The board's own drag code moves these polaroids, so a tap is told apart from a drag
     by how far the pointer travelled (under 6px = a tap = open the photo). */
  if (board) {
    let down = null;
    const polaroidOf = (el) => (el && el.closest ? el.closest(".bd-polaroid") : null);
    document.addEventListener("pointerdown", (e) => {
      const p = polaroidOf(e.target);
      down = p && e.button === 0 ? { p: p, x: e.clientX, y: e.clientY, t: performance.now() } : null;
    }, true);
    document.addEventListener("pointercancel", () => { down = null; }, true);
    document.addEventListener("pointerup", (e) => {
      if (!down) return;
      const d = down; down = null;
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || performance.now() - d.t > 600) return;   // it was a drag
      const all = Array.from(board.querySelectorAll(".bd-polaroid"));
      const list = all.map((f) => {
        const im = f.querySelector("img"), fc = f.querySelector("figcaption");
        return { src: im ? im.getAttribute("src") : "", cap: fc ? fc.textContent : "" };
      });
      setTimeout(() => openSet(list, all.indexOf(d.p), "07 / Beyond", "Beyond the Screen", d.p), 0);
    }, true);
  }

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", () => show(idx - 1, true));
  nextBtn.addEventListener("click", () => show(idx + 1, true));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });   // click the dark backdrop to close

  document.addEventListener("keydown", (e) => {
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); show(idx - 1, true); }
    else if (e.key === "ArrowRight") { e.preventDefault(); show(idx + 1, true); }
    else if (e.key === "Tab") {                                              // keep focus inside the lightbox
      const f = [closeBtn, prevBtn, nextBtn].filter((b) => getComputedStyle(b).visibility !== "hidden");
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    } else if ([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"].indexOf(e.key) > -1) e.preventDefault();  // no page scroll behind it
  });

  // freeze the page scroll behind the lightbox (the journey is scroll-driven, so it must not move)
  const stop = (e) => { if (isOpen) e.preventDefault(); };
  lb.addEventListener("wheel", stop, { passive: false });
  lb.addEventListener("touchmove", stop, { passive: false });

  // swipe left / right on touch screens
  let sx = null;
  lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50 && items.length > 1) show(idx + (dx < 0 ? 1 : -1), true);
  }, { passive: true });
})();