/* =========================================================
   MACSURPLUS — comportements
   Aucune donnée n'est envoyée nulle part. Tout est local.
   ========================================================= */
(function () {
  'use strict';

  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------
     1. Le compte à rebours qui ne finit jamais
     ---------------------------------------------------- */
  var mm = document.querySelector('[data-mm]');
  var ss = document.querySelector('[data-ss]');
  var cs = document.querySelector('[data-cs]');

  if (mm && ss && cs) {
    var reste = 15 * 60 * 1000; // 15 minutes, remises à zéro à chaque visite
    var deux = function (n) { return String(n).padStart(2, '0'); };

    setInterval(function () {
      reste -= 50;
      if (reste <= 0) { reste = 15 * 60 * 1000; } // et ça repart, évidemment
      var t = Math.floor(reste / 1000);
      mm.textContent = deux(Math.floor(t / 60));
      ss.textContent = deux(t % 60);
      cs.textContent = deux(Math.floor((reste % 1000) / 10));
    }, 50);
  }

  /* ----------------------------------------------------
     2. Stock et visiteurs qui bougent tout seuls
     ---------------------------------------------------- */
  var stock = document.querySelector('[data-stock]');
  var vus = document.querySelector('[data-viewers]');

  if (stock) {
    var n = 3;
    setInterval(function () {
      n = n > 1 ? n - 1 : 3;
      stock.textContent = n;
    }, 21000);
  }

  if (vus) {
    setInterval(function () {
      vus.textContent = 14 + Math.floor(Math.random() * 12);
    }, 4200);
  }

  /* ----------------------------------------------------
     3. Le MacBook suit la souris
     ---------------------------------------------------- */
  var flot = document.querySelector('[data-float]');

  if (flot && !calme && window.matchMedia('(pointer: fine)').matches) {
    var cx = 0, cy = 0, x = 0, y = 0;

    window.addEventListener('mousemove', function (e) {
      cx = (e.clientX / window.innerWidth - 0.5) * 22;
      cy = (e.clientY / window.innerHeight - 0.5) * 14;
    });

    (function boucle() {
      x += (cx - x) * 0.06;
      y += (cy - y) * 0.06;
      flot.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) rotate(' + (x * 0.12).toFixed(2) + 'deg)';
      requestAnimationFrame(boucle);
    })();
  }

  /* ----------------------------------------------------
     4. Apparition des sections au défilement
     ---------------------------------------------------- */
  var cibles = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window && !calme) {
    var oeil = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e, i) {
        if (!e.isIntersecting) { return; }
        setTimeout(function () { e.target.classList.add('is-in'); }, i * 90);
        oeil.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    cibles.forEach(function (c) { oeil.observe(c); });
  } else {
    cibles.forEach(function (c) { c.classList.add('is-in'); });
  }

  /* ----------------------------------------------------
     5. Le piège
     ---------------------------------------------------- */
  var bust = document.querySelector('[data-bust]');
  var compteur = document.querySelector('[data-order]');
  var essais = 0;

  function ouvrir() {
    if (!bust) { return; }
    essais += 1;
    if (compteur) {
      compteur.textContent = String(4470 + essais);
    }
    bust.hidden = false;
    document.body.classList.add('is-locked');
    bust.scrollTop = 0;
    var sortie = bust.querySelector('[data-close]');
    if (sortie) { sortie.focus({ preventScroll: true }); }
  }

  function fermer() {
    if (!bust) { return; }
    bust.hidden = true;
    document.body.classList.remove('is-locked');
  }

  document.querySelectorAll('[data-trap]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      ouvrir();
    });
  });

  var btnClose = document.querySelector('[data-close]');
  if (btnClose) { btnClose.addEventListener('click', fermer); }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bust && !bust.hidden) { fermer(); }
  });

})();
