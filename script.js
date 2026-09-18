/* =========================================================
   Drift House — interactions
   -----------------------------------------------------
   À MODIFIER ICI :
   · VACANCES        → true pendant les vacances scolaires
   · HORAIRES        → les horaires de la semaine
   · PRIX_SESSION    → le tarif d'une session
   ========================================================= */

const VACANCES = false;              // vacances scolaires : tous les jours 15 h – 23 h
const PRIX_SESSION = 15;             // euros
const DUREE_SESSION = 10;            // minutes
const SEUIL_GROUPE = 8;              // pilotes à partir desquels le tarif dégressif s'applique
const TEL_WHATSAPP = '590690525083'; // numéro international, sans le +

// [ouverture, fermeture] en minutes depuis minuit. 25 h = 1 h du matin le lendemain.
// null = fermé. Index 0 = dimanche.
const HORAIRES = [
  [10 * 60, 20 * 60],  // dimanche
  null,                // lundi
  null,                // mardi
  [14 * 60, 20 * 60],  // mercredi
  null,                // jeudi
  [14 * 60, 25 * 60],  // vendredi (nocturne)
  [10 * 60, 25 * 60],  // samedi (nocturne)
];
const HORAIRES_VACANCES = [15 * 60, 23 * 60];

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   1. Titre : décalage lettre par lettre
   --------------------------------------------------------- */
document.querySelectorAll('.hero-h1 .word').forEach((word) => {
  [...word.children].forEach((letter, j) => letter.style.setProperty('--j', j));
});

/* ---------------------------------------------------------
   2. Le kart suit la trace de gomme
   --------------------------------------------------------- */
(function kartSurLaTrace() {
  const kart = document.getElementById('kart');
  const trace = document.getElementById('trace');
  if (!kart || !trace || calme) return;

  const ns = 'http://www.w3.org/2000/svg';
  const motion = document.createElementNS(ns, 'animateMotion');
  motion.setAttribute('dur', '2.45s');
  motion.setAttribute('begin', '0.15s');
  motion.setAttribute('fill', 'freeze');
  motion.setAttribute('rotate', 'auto');
  motion.setAttribute('calcMode', 'spline');
  motion.setAttribute('keyTimes', '0;1');
  motion.setAttribute('keySplines', '.16 .84 .30 1');
  const mpath = document.createElementNS(ns, 'mpath');
  mpath.setAttribute('href', '#trace');
  motion.appendChild(mpath);
  kart.appendChild(motion);
})();

/* ---------------------------------------------------------
   3. Traînée de gomme au passage de la souris (desktop)
   --------------------------------------------------------- */
(function traineeDeGomme() {
  const hero = document.querySelector('.hero');
  if (!hero || calme || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let dernier = 0;
  hero.addEventListener('mousemove', (e) => {
    const t = performance.now();
    if (t - dernier < 45) return;
    dernier = t;

    const r = hero.getBoundingClientRect();
    const trace = document.createElement('span');
    trace.className = 'skidmark';
    trace.style.left = e.clientX - r.left + 'px';
    trace.style.top = e.clientY - r.top + 'px';
    trace.style.rotate = (Math.random() * 30 - 15) + 'deg';
    hero.appendChild(trace);
    setTimeout(() => trace.remove(), 780);
  });
})();

/* ---------------------------------------------------------
   4. Apparition au scroll + header collé
   --------------------------------------------------------- */
(function apparitions() {
  const cibles = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    cibles.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
  cibles.forEach((el) => obs.observe(el));
})();

(function headerCollé() {
  const head = document.getElementById('head');
  if (!head) return;
  const majOmbre = () => head.classList.toggle('is-stuck', window.scrollY > 12);
  majOmbre();
  window.addEventListener('scroll', majOmbre, { passive: true });
})();

/* ---------------------------------------------------------
   5. Plan interactif du complexe
   --------------------------------------------------------- */
(function planComplexe() {
  const plan = document.querySelector('.plan');
  const onglets = document.querySelectorAll('.tabs [role="tab"]');
  if (!plan || !onglets.length) return;

  const zones = plan.querySelectorAll('.zone');
  const liste = [...onglets];

  function choisir(zone, focus) {
    liste.forEach((tab) => {
      const actif = tab.dataset.zone === zone;
      tab.setAttribute('aria-selected', actif ? 'true' : 'false');
      const panneau = document.getElementById(tab.getAttribute('aria-controls'));
      if (panneau) panneau.hidden = !actif;
      if (actif && focus) tab.focus();
    });
    zones.forEach((z) => z.classList.toggle('is-sel', z.dataset.zone === zone));
    plan.classList.add('has-sel');
  }

  liste.forEach((tab, i) => {
    tab.addEventListener('click', () => choisir(tab.dataset.zone, false));
    tab.addEventListener('keydown', (e) => {
      const pas = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!pas) return;
      e.preventDefault();
      const suivant = liste[(i + pas + liste.length) % liste.length];
      choisir(suivant.dataset.zone, true);
    });
  });

  // les zones du plan sont cliquables elles aussi
  zones.forEach((z) => {
    z.style.cursor = 'pointer';
    z.addEventListener('click', () => choisir(z.dataset.zone, false));
  });

  choisir('piste', false);
})();

/* ---------------------------------------------------------
   6. Simulateur de budget
   --------------------------------------------------------- */
(function simulateur() {
  const pilotes = document.getElementById('pilots');
  const sessions = document.getElementById('sessions');
  if (!pilotes || !sessions) return;

  const sortiePilotes = document.getElementById('pilots-out');
  const sortieSessions = document.getElementById('sessions-out');
  const total = document.getElementById('total');
  const detail = document.getElementById('detail');
  const temps = document.getElementById('time');
  const tribu = document.getElementById('tribu');
  const devis = document.getElementById('quote');

  function maj() {
    const p = +pilotes.value;
    const s = +sessions.value;
    const montant = p * s * PRIX_SESSION;

    sortiePilotes.value = p;
    sortieSessions.value = s;
    total.textContent = montant.toLocaleString('fr-FR');
    detail.textContent = `${p} pilote${p > 1 ? 's' : ''} × ${s} session${s > 1 ? 's' : ''} × ${PRIX_SESSION} €`;
    temps.textContent = `${p * s * DUREE_SESSION} minutes de piste au total`;

    const groupe = p >= SEUIL_GROUPE;
    tribu.hidden = !groupe;
    if (groupe) {
      const texte = `Bonjour Drift House, nous serions ${p} pilotes pour ${s} session${s > 1 ? 's' : ''} chacun. Pouvez-vous me faire un devis groupe ?`;
      devis.href = `https://wa.me/${TEL_WHATSAPP}?text=${encodeURIComponent(texte)}`;
      devis.target = '_blank';
      devis.rel = 'noopener';
    }
  }

  pilotes.addEventListener('input', maj);
  sessions.addEventListener('input', maj);
  maj();
})();

/* ---------------------------------------------------------
   7. Ouvert ou fermé, en direct (heure de Guadeloupe)
   --------------------------------------------------------- */
function heureLocale() {
  // On lit l'heure à Petit-Bourg, quel que soit le fuseau du visiteur.
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Guadeloupe',
    weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date());

  const get = (t) => parts.find((p) => p.type === t)?.value ?? '0';
  const jours = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const h = parseInt(get('hour'), 10) % 24;
  return { jour: jours[get('weekday')] ?? 0, minutes: h * 60 + parseInt(get('minute'), 10) };
}

function creneau(jour) {
  return VACANCES ? HORAIRES_VACANCES : HORAIRES[jour];
}

function formateHeure(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm ? `${h} h ${String(mm).padStart(2, '0')}` : `${h} h`;
}

function etatComplexe() {
  const { jour, minutes } = heureLocale();

  // session de la veille qui se prolonge après minuit (nocturnes)
  const hier = creneau((jour + 6) % 7);
  if (hier && hier[1] > 1440 && minutes < hier[1] - 1440) {
    return { ouvert: true, fermeture: hier[1] - 1440, jour };
  }

  const aujourdhui = creneau(jour);
  if (aujourdhui && minutes >= aujourdhui[0] && minutes < aujourdhui[1]) {
    return { ouvert: true, fermeture: aujourdhui[1], jour };
  }
  if (aujourdhui && minutes < aujourdhui[0]) {
    return { ouvert: false, prochain: { jour, heure: aujourdhui[0], aujourdhui: true }, jour };
  }

  for (let i = 1; i <= 7; i++) {
    const j = (jour + i) % 7;
    const c = creneau(j);
    if (c) return { ouvert: false, prochain: { jour: j, heure: c[0], demain: i === 1 }, jour };
  }
  return { ouvert: false, jour };
}

(function statutEnDirect() {
  const pastille = document.getElementById('status');
  const texte = document.getElementById('status-txt');
  const bandeau = document.getElementById('hours-live');

  function maj() {
    const e = etatComplexe();
    let court, long;

    if (e.ouvert) {
      court = `Ouvert jusqu'à ${formateHeure(e.fermeture)}`;
      long = `C'est ouvert en ce moment, jusqu'à ${formateHeure(e.fermeture)}.`;
    } else if (e.prochain) {
      const quand = e.prochain.aujourdhui ? "aujourd'hui"
        : e.prochain.demain ? 'demain'
        : JOURS[e.prochain.jour];
      court = `Fermé — ouvre ${quand} à ${formateHeure(e.prochain.heure)}`;
      long = `C'est fermé. Prochaine ouverture ${quand} à ${formateHeure(e.prochain.heure)}.`;
    } else {
      court = 'Horaires sur demande';
      long = 'Horaires sur demande, appelez le 0690 52 50 83.';
    }

    if (texte) texte.textContent = court;
    if (pastille) pastille.classList.toggle('is-open', e.ouvert);
    if (bandeau) {
      bandeau.textContent = long;
      bandeau.classList.toggle('is-open', e.ouvert);
    }

    document.querySelectorAll('#week li').forEach((li) => {
      li.classList.toggle('is-today', +li.dataset.day === e.jour);
    });
  }

  maj();
  setInterval(maj, 60000);
})();

/* ---------------------------------------------------------
   8. Année du footer
   --------------------------------------------------------- */
const annee = document.getElementById('year');
if (annee) annee.textContent = new Date().getFullYear();
