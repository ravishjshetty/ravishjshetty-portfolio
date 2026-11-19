/* Sketchbook flipbook for "Beyond the Screen". Reads image paths from #sbStage[data-sketches]. */
(function () {
  const stage = document.getElementById("sbStage");
  if (!stage) return;
  const wrap = document.getElementById("sbWrap"), book = document.getElementById("sbBook"),
        stat = document.getElementById("sbStat"), prev = document.getElementById("sbPrev"),
        next = document.getElementById("sbNext"), play = document.getElementById("sbPlay");

  const rnd = (n) => { let x = n * 9301 + 49297; return () => (x = (x * 9301 + 49297) % 233280) / 233280; };
  function doodle(n) {
    const r = rnd(n), c = ["#c4163a", "#1f9a9a", "#222"]; let g = "";
    for (let i = 0; i < 7; i++) {
      const x = 20 + r() * 160, y = 20 + r() * 220, k = c[Math.floor(r() * 3)], t = r();
      if (t < 0.4) g += `<ellipse cx="${x}" cy="${y}" rx="${14 + r() * 22}" ry="${18 + r() * 26}" fill="none" stroke="${k}" stroke-width="2.4"/><circle cx="${x - 6}" cy="${y - 4}" r="2.4" fill="${k}"/><circle cx="${x + 7}" cy="${y - 4}" r="2.4" fill="${k}"/><path d="M${x - 7} ${y + 8} q7 6 14 0" fill="none" stroke="${k}" stroke-width="2"/>`;
      else if (t < 0.75) g += `<path d="M${x} ${y} q${r() * 60 - 30} ${r() * 60 - 30} ${r() * 80 - 40} ${r() * 60}" fill="none" stroke="${k}" stroke-width="2.6" stroke-linecap="round"/>`;
      else g += `<rect x="${x}" y="${y}" width="${20 + r() * 40}" height="${20 + r() * 40}" fill="${k}" opacity=".18" transform="rotate(${r() * 40 - 20} ${x} ${y})"/>`;
    }
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 270">${g}</svg>`)}")`;
  }

  const paths = (stage.dataset.sketches || "").split(",").map((s) => s.trim()).filter(Boolean);
  const pages = paths.length ? paths : Array.from({ length: 8 }, () => "placeholder");
  const faces = ["cover", ...pages];
  if (faces.length % 2) faces.push("blank");
  const N = faces.length / 2, leaves = [];
  let idx = 0, timer = null;

  function face(f, side, n) {
    const d = document.createElement("div");
    d.className = "sb-f sb-" + side;
    if (f === "cover") {
      d.classList.add("sb-cover");
      d.innerHTML = '<div><svg viewBox="0 0 120 80" aria-hidden="true"><path d="M20 70 C20 30 40 14 62 14 C82 14 92 26 100 40 C92 38 84 44 86 56 C80 52 74 56 72 70" fill="none" stroke="#7fe3df" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>Ravish’s<br>sketchbook</div>';
    } else if (f === "placeholder") {
      d.style.backgroundImage = doodle(n);
    } else if (f !== "blank") {
      d.style.backgroundImage = doodle(n);
      const im = new Image();
      im.onload = () => { d.style.backgroundImage = `url("${f}")`; };
      im.src = f;
    }
    return d;
  }

  const base = document.createElement("div");
  base.className = "sb-base"; base.style.zIndex = 0;
  const bye = face("blank", "front"); bye.classList.add("sb-bye"); bye.textContent = "that’s all for now :)";
  base.appendChild(bye); book.appendChild(base);

  for (let i = 0; i < N; i++) {
    const leaf = document.createElement("div");
    leaf.className = "sb-leaf";
    leaf.append(face(faces[2 * i], "front", 2 * i + 3), face(faces[2 * i + 1], "back", 2 * i + 4));
    book.appendChild(leaf); leaves.push(leaf);
  }

  function settle() { leaves.forEach((l, i) => { l.style.zIndex = i < idx ? i + 1 : N - i + 1; }); }
  function apply(moving) {
    leaves.forEach((l, i) => {
      const fl = i < idx;
      l.style.transform = `rotateY(${fl ? -180 : 0}deg) translateX(${fl ? -i * 1.5 : 0}px)`;
      l.style.zIndex = i === moving ? 60 : (fl ? i + 1 : N - i + 1);
    });
    book.classList.toggle("open", idx > 0);
    stat.textContent = idx === 0 ? "Tap the book" : idx >= N ? "Tap to close" : `Spread ${idx} of ${N - 1}`;
    prev.disabled = idx === 0;
    const end = idx >= N;
    next.textContent = end ? "Close" : "\u2192";
    next.setAttribute("aria-label", end ? "Close the book" : "Next page");
    if (moving !== undefined) setTimeout(settle, 450);
  }
  function go(d) {
    const n = Math.max(0, Math.min(N, idx + d));
    if (n === idx) return false;
    const mv = d > 0 ? idx : n; idx = n; apply(mv); return true;
  }
  function close() {
    if (idx === 0) return;
    leaves.forEach((l, i) => { l.style.transitionDelay = (N - 1 - i) * 70 + "ms"; });
    idx = 0; apply();
    setTimeout(() => leaves.forEach((l) => { l.style.transitionDelay = ""; }), N * 70 + 1000);
  }
  function stop() { clearInterval(timer); timer = null; play.textContent = "Play"; }

  wrap.addEventListener("click", (e) => {
    const r = wrap.getBoundingClientRect();
    stop();
    if (idx >= N) { close(); return; }
    if (idx > 0 && e.clientX < r.left + r.width / 2) go(-1); else go(1);
  });
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); stop(); if (idx >= N) close(); else go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); stop(); go(-1); }
  });
  prev.addEventListener("click", () => { stop(); go(-1); });
  next.addEventListener("click", () => { stop(); if (idx >= N) close(); else go(1); });
  play.addEventListener("click", () => {
    if (timer) { stop(); return; }
    if (idx >= N) close();
    play.textContent = "Pause";
    timer = setInterval(() => { if (!go(1)) { close(); stop(); } }, 1700);
  });
  apply();
})();


/* Beyond the Screen: draggable corkboard items (desktop only) */
(function () {
  const board = document.getElementById("bdBoard");
  if (!board) return;
  const mq = window.matchMedia("(min-width: 861px)");
  let z = 10;
  board.querySelectorAll(".bd-item").forEach((it) => {
    it.addEventListener("pointerdown", (e) => {
      if (!mq.matches || (e.button && e.button > 0) || e.target.closest(".sb-wrap, .sb-btn, a, button")) return;
      const br = board.getBoundingClientRect(), r = it.getBoundingClientRect();
      const ox = e.clientX - r.left, oy = e.clientY - r.top;
      const w = it.offsetWidth, hgt = it.offsetHeight;
      try { it.setPointerCapture(e.pointerId); } catch (err) {}
      it.style.zIndex = ++z; it.classList.add("drag");
      const move = (ev) => {
        const x = Math.max(0, Math.min(br.width - w, ev.clientX - br.left - ox));
        const y = Math.max(0, Math.min(br.height - hgt, ev.clientY - br.top - oy));
        it.style.left = x + "px"; it.style.top = y + "px";
      };
      const up = () => {
        it.classList.remove("drag");
        it.removeEventListener("pointermove", move);
        it.removeEventListener("pointerup", up);
        it.removeEventListener("pointercancel", up);
      };
      it.addEventListener("pointermove", move);
      it.addEventListener("pointerup", up);
      it.addEventListener("pointercancel", up);
      e.preventDefault();
    });
  });
})();