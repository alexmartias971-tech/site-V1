/* =============================================================
   Karaya — interactions
   ============================================================= */

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* ---- boucle d'animation partagée --------------------------------- */
  var jobs = [];
  function addJob(fn) { jobs.push(fn); }
  (function loop() {
    for (var i = 0; i < jobs.length; i++) jobs[i]();
    requestAnimationFrame(loop);
  })();

  /* ================================================================
     Ouverture
     ================================================================ */
  (function intro() {
    var el = $("#intro");
    if (!el) return;
    if (reduce) { el.remove(); document.body.classList.add("is-ready"); return; }
    setTimeout(function () { el.classList.add("is-done"); }, 1450);
    setTimeout(function () { el.remove(); }, 2800);
  })();

  /* ================================================================
     Wordmark : décalage lettre par lettre
     ================================================================ */
  $$(".wordmark .l").forEach(function (l, i) { l.style.setProperty("--d", i); });

  /* ================================================================
     Navigation
     ================================================================ */
  (function nav() {
    var nav = $("#nav");
    var burger = $("#burger");
    var menu = $("#menu");
    var last = 0;

    window.addEventListener("scroll", function () {
      var y = window.scrollY;
      nav.classList.toggle("is-stuck", y > 40);
      if (!menu.classList.contains("is-open")) {
        nav.classList.toggle("is-hidden", y > last && y > 420);
      }
      last = y;
    }, { passive: true });

    $$("#menu nav a").forEach(function (a, i) { a.style.setProperty("--i", i); });

    function close() {
      menu.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
      setTimeout(function () { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 700);
    }

    burger.addEventListener("click", function () {
      var open = menu.classList.contains("is-open");
      if (open) { close(); return; }
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("is-open"); });
      burger.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-locked");
    });

    $$("#menu a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) close();
    });
  })();

  /* ================================================================
     Découpe des titres en lignes masquées
     ================================================================ */
  $$("[data-split]").forEach(function (el) {
    $$(":scope > span", el).forEach(function (line) {
      var txt = line.textContent;
      line.textContent = "";
      line.className = (line.className ? line.className + " " : "") + "lineWrap";
      var inner = document.createElement("span");
      inner.className = "lineInner";
      inner.textContent = txt;
      line.appendChild(inner);
    });
  });

  /* ================================================================
     Révélations au scroll
     ================================================================ */
  (function reveals() {
    var els = $$("[data-fade], [data-split], [data-reveal]");
    if (!("IntersectionObserver" in window) || reduce) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ================================================================
     Boutons magnétiques
     ================================================================ */
  if (fine && !reduce) {
    $$("[data-magnet]").forEach(function (el) {
      var tx = 0, ty = 0, cx = 0, cy = 0, active = false;
      el.addEventListener("pointerenter", function () { active = true; });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.3;
      });
      el.addEventListener("pointerleave", function () { active = false; tx = 0; ty = 0; });
      addJob(function () {
        if (!active && Math.abs(cx) < 0.05 && Math.abs(cy) < 0.05) return;
        cx += (tx - cx) * 0.14;
        cy += (ty - cy) * 0.14;
        el.style.transform = "translate3d(" + cx.toFixed(2) + "px," + cy.toFixed(2) + "px,0)";
      });
    });
  }

  /* ================================================================
     Maisons : défilement horizontal piloté par la molette
     ================================================================ */
  (function rail() {
    var rail = $("[data-rail]");
    var track = $("[data-track]");
    if (!rail || !track) return;

    var dist = 0, cur = 0, wide = false;

    function layout() {
      wide = window.innerWidth > 860 && !reduce;
      if (!wide) {
        rail.style.height = "";
        track.style.transform = "";
        return;
      }
      dist = Math.max(0, track.scrollWidth - window.innerWidth);
      rail.style.height = window.innerHeight + dist + "px";
    }

    addJob(function () {
      if (!wide || !dist) return;
      var r = rail.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      var total = rail.offsetHeight - window.innerHeight;
      var p = total > 0 ? clamp(-r.top / total, 0, 1) : 0;
      var goal = -p * dist;
      cur += (goal - cur) * 0.11;
      track.style.transform = "translate3d(" + cur.toFixed(2) + "px,0,0)";
    });

    window.addEventListener("resize", layout);
    window.addEventListener("load", layout);
    layout();
  })();

  /* ================================================================
     Inclinaison légère des cartes maison
     ================================================================ */
  if (fine && !reduce) {
    $$("[data-tilt]").forEach(function (card) {
      var media = $(".house__media", card);
      if (!media) return;
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        media.style.transform =
          "rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () { media.style.transform = ""; });
    });
  }

  /* ================================================================
     Liste conciergerie : image qui suit le curseur
     ================================================================ */
  (function hoverList() {
    var list = $("[data-hoverlist]");
    var box = $("[data-floatimg]");
    if (!list || !box || !fine) { if (box) box.remove(); return; }

    var img = $("img", box);
    var tx = 0, ty = 0, cx = 0, cy = 0, on = false;

    $$("li", list).forEach(function (li) {
      li.addEventListener("pointerenter", function () {
        list.classList.add("is-hovering");
        $$("li", list).forEach(function (o) { o.classList.remove("is-active"); });
        li.classList.add("is-active");
        var src = li.getAttribute("data-img");
        if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);
        on = true;
        box.classList.add("is-on");
      });
    });

    list.addEventListener("pointerleave", function () {
      list.classList.remove("is-hovering");
      $$("li", list).forEach(function (o) { o.classList.remove("is-active"); });
      on = false;
      box.classList.remove("is-on");
    });

    window.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });

    addJob(function () {
      if (!on && !box.classList.contains("is-on")) return;
      cx += (tx - cx) * 0.11;
      cy += (ty - cy) * 0.11;
      box.style.left = cx.toFixed(1) + "px";
      box.style.top = cy.toFixed(1) + "px";
    });
  })();

  /* ================================================================
     Expériences : anneau 3D
     ================================================================ */
  (function carousel() {
    var stage = $("[data-carousel]");
    var ring = $("[data-ring]");
    if (!stage || !ring) return;

    var cards = $$(".card", ring);
    var n = cards.length;
    if (!n) return;

    var texts = [
      "Le véhicule attend devant la maison, clés dans la boîte, plein fait.",
      "Les Saintes, Petite-Terre ou la Rivière Salée, avec un marin du coin.",
      "Vol de nuit, chambre gardée jusqu'au soir : personne ne court.",
      "Un menu créole ou un dîner de fête, servi sur la terrasse.",
      "Accueil à la sortie des bagages au Raizet, siège bébé si besoin.",
      "Table installée face au jardin, en fin d'après-midi.",
      "Le frigo est plein, le rhum est au frais, le pain arrive le matin.",
      "Lit parapluie, chaise haute, baignoire : tout est prêt à l'arrivée."
    ];

    var titleEl = $("[data-xp-title]");
    var textEl = $("[data-xp-text]");
    var capEl = $(".xp__caption");

    var step = 360 / n;
    var radius = 320;
    var rot = 0, target = 0, front = -1;
    var dragging = false, lastX = 0, idle = 0, moved = 0;

    function layout() {
      var w = cards[0].getBoundingClientRect().width;
      radius = Math.round((w / 2) / Math.tan(Math.PI / n) * 1.35);
      cards.forEach(function (c, i) {
        c.style.transform =
          "translate(-50%,-50%) rotateY(" + i * step + "deg) translateZ(" + radius + "px)";
      });
    }

    function setFront(i) {
      if (i === front) return;
      front = i;
      cards.forEach(function (c, k) { c.classList.toggle("is-front", k === i); });
      if (!titleEl) return;
      capEl.classList.add("is-swapping");
      setTimeout(function () {
        var cap = $("figcaption", cards[i]);
        titleEl.textContent = cap ? cap.textContent : "";
        textEl.textContent = texts[i] || "";
        capEl.classList.remove("is-swapping");
      }, reduce ? 0 : 220);
    }

    /* --- glisser --- */
    stage.addEventListener("pointerdown", function (e) {
      dragging = true; moved = 0; lastX = e.clientX; idle = 0;
      stage.classList.add("is-grabbing");
      stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      target += dx * 0.28;
    });
    function release() {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove("is-grabbing");
      target = Math.round(target / step) * step;   // on cale sur une carte
      idle = 0;
    }
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);
    stage.addEventListener("pointerleave", release);

    var prev = $("[data-prev]"), next = $("[data-next]");
    if (prev) prev.addEventListener("click", function () { target += step; idle = -140; });
    if (next) next.addEventListener("click", function () { target -= step; idle = -140; });

    stage.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { target += step; idle = -140; }
      if (e.key === "ArrowRight") { target -= step; idle = -140; }
    });

    var inView = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: 0.05 })
        .observe(stage);
    }
    var hovering = false;
    stage.addEventListener("pointerenter", function () { hovering = true; });
    stage.addEventListener("pointerleave", function () { hovering = false; });

    addJob(function () {
      if (!inView) return;
      if (!dragging && !hovering && !reduce) {
        idle++;
        if (idle > 90) target -= 0.09;          // dérive très lente, invitation au geste
      }
      rot += (target - rot) * 0.085;
      ring.style.transform = "translateZ(" + -radius + "px) rotateY(" + rot.toFixed(3) + "deg)";

      var i = ((Math.round(-rot / step) % n) + n) % n;
      setFront(i);
    });

    window.addEventListener("resize", layout);
    window.addEventListener("load", layout);
    layout();
    setFront(0);
  })();

  /* ================================================================
     Estimation de revenus
     ================================================================ */
  (function calc() {
    var price = $("#price");
    var nights = $("#nights");
    if (!price || !nights) return;

    var outPrice = $("[data-out='price']");
    var outNights = $("[data-out='nights']");
    var outNet = $("[data-out='net']");
    var outGross = $("[data-out='gross']");
    var outFee = $("[data-out='fee']");

    var nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });
    var shown = 0, goal = 0;

    function rate() {
      var r = document.querySelector("input[name='plan']:checked");
      return r ? parseFloat(r.value) / 100 : 0.2;
    }

    function update() {
      var p = +price.value, nn = +nights.value, rt = rate();
      var gross = p * nn * 12;
      var fee = gross * rt;
      goal = gross - fee;

      outPrice.textContent = nf.format(p) + " €";
      outNights.textContent = nn;
      outGross.textContent = nf.format(gross) + " €";
      outFee.textContent = nf.format(fee) + " €";
      if (reduce) { shown = goal; outNet.textContent = nf.format(goal); }
    }

    addJob(function () {
      if (Math.abs(goal - shown) < 1) return;
      shown += (goal - shown) * 0.16;
      outNet.textContent = nf.format(Math.round(shown));
    });

    [price, nights].forEach(function (el) { el.addEventListener("input", update); });
    $$("input[name='plan']").forEach(function (el) { el.addEventListener("change", update); });
    update();
  })();

  /* ================================================================
     Formulaire
     ================================================================ */
  (function form() {
    var form = $("[data-form]");
    if (!form) return;
    var status = $("[data-status]", form);

    form.addEventListener("submit", function (e) {
      var action = form.getAttribute("action") || "";

      // Tant que l'identifiant Formspree n'est pas renseigné, on bascule sur l'e-mail.
      if (action.indexOf("VOTRE_ID") !== -1) {
        e.preventDefault();
        var d = new FormData(form);
        var body =
          "Nom : " + (d.get("nom") || "") + "\n" +
          "E-mail : " + (d.get("email") || "") + "\n" +
          "Commune : " + (d.get("commune") || "") + "\n\n" +
          (d.get("message") || "");
        window.location.href =
          "mailto:contact@karaya-conciergerie.com?subject=" +
          encodeURIComponent("Ma maison en gestion") +
          "&body=" + encodeURIComponent(body);
        status.textContent = "Votre logiciel de messagerie s'ouvre.";
        return;
      }

      e.preventDefault();
      status.textContent = "Envoi…";
      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.reset();
          status.textContent = "Message reçu. Nous revenons vers vous sous 24 h.";
        })
        .catch(function () {
          status.textContent = "L'envoi a échoué. Écrivez-nous à contact@karaya-conciergerie.com.";
        });
    });
  })();

})();
