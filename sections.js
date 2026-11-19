/* Interactions for: Design Process (bus route), Skills & Tools (Figma canvas), Achievements (trophy shelf). */
(function () {
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  /* ---------------- 04 DESIGN PROCESS: bus route ---------------- */
  (function () {
    const stage = document.getElementById("routeStage");
    if (!stage) return;
    const STEPS = [
      { n: "Discover", d: "User interviews, market audit, and mapping real audience needs.", c: ["User interviews", "Market audit", "Audience needs"] },
      { n: "Structure", d: "Information architecture, wireframes, and frictionless user flows.", c: ["Information architecture", "Wireframes", "User flows"] },
      { n: "Design", d: "High-fidelity UI, design tokens, responsive layouts, and interactive prototypes.", c: ["High-fidelity UI", "Design tokens", "Responsive layouts", "Prototypes"] },
      { n: "Deliver", d: "Usability validation testing and seamless developer handoff specs.", c: ["Usability testing", "Developer handoff specs"] }
    ];
    const stops = document.getElementById("routeStops"), bus = document.getElementById("routeBus"),
          fill = document.getElementById("routeFill"), ticket = document.getElementById("ticket");
    stops.innerHTML = STEPS.map((s, i) => `<li><button type="button" class="stop" data-i="${i}" aria-label="Stop ${i + 1}: ${esc(s.n)}"><b>${i + 1}</b><span>${esc(s.n)}</span></button></li>`).join("");
    const btns = [...stops.querySelectorAll(".stop")];
    let cur = -1, lastScroll = -1;
    function set(i) {
      if (i === cur) return; cur = i;
      bus.style.left = `calc(12.5% + 75% * ${i} / 3)`;
      fill.style.width = `${(i / 3) * 100}%`;
      btns.forEach((b, k) => { b.classList.toggle("on", k === i); b.classList.toggle("done", k < i); b.setAttribute("aria-current", k === i ? "step" : "false"); });
      const s = STEPS[i];
      ticket.innerHTML = `<div class="ticket-main"><small>STOP ${i + 1} OF 4 · THE DESIGN LINE</small><h3>${esc(s.n)}</h3><p>${esc(s.d)}</p><div class="chips">${s.c.map((c) => `<span>${esc(c)}</span>`).join("")}</div></div>
        <div class="ticket-stub"><small>STOP</small><strong>0${i + 1}</strong><div class="barcode"></div><small>RAVISH · UX</small></div>`;
    }
    stops.addEventListener("click", (e) => { const b = e.target.closest(".stop"); if (b) set(+b.dataset.i); });
    function onScroll() {
      const r = stage.getBoundingClientRect(), vh = window.innerHeight;
      const t = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (vh * 0.55)));
      const i = Math.min(3, Math.floor(t * 4));
      if (i !== lastScroll) { lastScroll = i; set(i); }
    }
    set(0); addEventListener("scroll", onScroll, { passive: true }); onScroll();
  })();

  /* ---------------- 05 SKILLS: Figma canvas ---------------- */
  (function () {
    const canvas = document.getElementById("fgCanvas"), list = document.getElementById("fgLayers");
    if (!canvas || !list) return;
    const frames = [...canvas.querySelectorAll(".fg-frame")];
    frames.forEach((f) => {
      f.insertAdjacentHTML("beforeend", '<i class="fg-h a"></i><i class="fg-h b"></i><i class="fg-h c"></i><i class="fg-h d"></i><span class="fg-size"></span>');
    });
    list.innerHTML = frames.map((f, i) => {
      const kids = [...f.querySelectorAll(".tool-name, .tool-tag")].map((k) => `<li>${esc(k.textContent.trim())}</li>`).join("");
      return `<li class="grp collapsed"><button type="button" class="lyr" data-i="${i}">${esc(f.dataset.name)}</button><button type="button" class="tgl" data-i="${i}" aria-expanded="false" aria-label="Toggle ${esc(f.dataset.name)} layers"></button><ul class="kids">${kids}</ul></li>`;
    }).join("");
    const lyrs = [...list.querySelectorAll(".lyr")];
    const groups = [...list.querySelectorAll(".grp")];
    function setOpen(i, open) {
      const g = groups[i]; if (!g) return;
      g.classList.toggle("collapsed", !open);
      g.querySelector(".tgl").setAttribute("aria-expanded", open ? "true" : "false");
    }
    function select(i) {
      frames.forEach((f, k) => {
        f.classList.toggle("sel", k === i);
        if (k === i) f.querySelector(".fg-size").textContent = `${Math.round(f.offsetWidth)} × ${Math.round(f.offsetHeight)}`;
      });
      lyrs.forEach((l, k) => l.classList.toggle("sel", k === i));
      setOpen(i, true);
    }
    list.addEventListener("click", (e) => {
      const t = e.target.closest(".tgl");
      if (t) { const i = +t.dataset.i; setOpen(i, groups[i].classList.contains("collapsed")); return; }
      const b = e.target.closest(".lyr"); if (b) select(+b.dataset.i);
    });
    const mq = matchMedia("(min-width: 861px)");
    frames.forEach((f, i) => {
      let dx = 0, dy = 0;
      f.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(i); } });
      f.addEventListener("pointerdown", (e) => {
        select(i);
        if (!mq.matches || (e.button && e.button > 0)) return;
        const sx = e.clientX, sy = e.clientY, bx = dx, by = dy; let moved = false;
        try { f.setPointerCapture(e.pointerId); } catch (err) {}
        const mv = (ev) => {
          if (Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 3) moved = true;
          if (!moved) return; f.classList.add("drag");
          dx = bx + ev.clientX - sx; dy = by + ev.clientY - sy; f.style.transform = `translate(${dx}px, ${dy}px)`;
        };
        const up = () => { f.classList.remove("drag"); f.removeEventListener("pointermove", mv); f.removeEventListener("pointerup", up); f.removeEventListener("pointercancel", up); };
        f.addEventListener("pointermove", mv); f.addEventListener("pointerup", up); f.addEventListener("pointercancel", up);
      });
    });
    canvas.addEventListener("pointerdown", (e) => { if (e.target === canvas) { frames.forEach((f) => f.classList.remove("sel")); lyrs.forEach((l) => l.classList.remove("sel")); } });
    select(0);
  })();

  /* ---------------- 06 ACHIEVEMENTS: trophy shelf ---------------- */
  (function () {
    const shelf = document.getElementById("shelf"), card = document.getElementById("placard");
    if (!shelf || !card) return;
    const A = [
      { t: "Commitment to Excellence", o: "Accolade Tech Solutions Pvt. Ltd.", p: "Awarded the memento in recognition of dedication, consistent performance, and key contributions during my UI/UX Design Internship." },
      { t: "First Prize Winner", o: "Circuit Symphony Expo", p: "Secured First Prize in the expo organized by the Dept. of Information Science & Engineering for technical innovation and problem-solving." },
      { t: "Certifications", o: "Continuous Learning", l: ["Accenture – Data Analytics & Visualization", "Oracle SQL Bootcamp", "Postman API Student Program"] }
    ];
    const items = [...shelf.querySelectorAll(".trophy")];
    function show(i) {
      items.forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-pressed", k === i); });
      const a = A[i];
      card.style.animation = "none"; void card.offsetWidth; card.style.animation = "";
      card.innerHTML = `<small>${esc(a.o)}</small><h3>${esc(a.t)}</h3>` + (a.l ? `<ul>${a.l.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p>${esc(a.p)}</p>`);
    }
    items.forEach((b, i) => b.addEventListener("click", () => show(i)));
    show(0);
  })();
})();