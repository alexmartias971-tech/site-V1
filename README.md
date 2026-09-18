# Karaya Conciergerie — site web

Site vitrine d'une page, en HTML / CSS / JavaScript pur. Aucune compilation, aucune
dépendance à installer : on dépose le dossier sur GitHub, on le branche à Vercel, c'est en ligne.

---

## 1. Mettre en ligne

**GitHub**

```bash
cd karaya-conciergerie
git init
git add .
git commit -m "Site Karaya Conciergerie"
git branch -M main
git remote add origin https://github.com/VOTRE-COMPTE/karaya-conciergerie.git
git push -u origin main
```

**Vercel**

1. vercel.com → *Add New* → *Project* → *Import Git Repository*
2. Choisir le dépôt. **Framework Preset : Other**, *Build Command* vide, *Output Directory* vide.
3. *Deploy*. L'aperçu arrive en une minute sur `votre-projet.vercel.app`.
4. Domaine : *Settings* → *Domains* → ajouter `karaya-conciergerie.com`, puis créer chez le
   registrar un `A` vers `76.76.21.21` et un `CNAME` `www` vers `cname.vercel-dns.com`.

Pour tester en local, un serveur statique suffit (les chemins commencent par `/`, ouvrir
le fichier en double-cliquant ne marchera pas) :

```bash
python3 -m http.server 8000     # puis http://localhost:8000
```

---

## 2. Les 6 choses à changer avant de communiquer

| Quoi | Où |
|---|---|
| Photos des maisons | `assets/img/` (voir §3) |
| Noms, communes et équipements des maisons | `index.html`, section `<!-- MAISONS -->` |
| Numéro WhatsApp | `index.html`, `https://wa.me/590690000000` → votre numéro au format international sans `+` ni espace |
| Lien Instagram | `index.html`, `https://www.instagram.com/` |
| Formulaire de contact | voir §4 |
| Taux de commission de l'estimateur | `index.html`, section `<!-- ESTIMATION -->`, valeurs `18` / `22` / `28` |

---

## 3. Remplacer les images

Les visuels livrés sont des **plaques d'ambiance abstraites**, générées pour que le site
soit présentable tout de suite. Ce sont des bouche-trous : à échanger contre de vraies photos.

Gardez les mêmes noms de fichiers, rien d'autre à toucher :

| Fichier | Usage | Format conseillé |
|---|---|---|
| `m-01.jpg` … `m-06.jpg` | les six maisons | portrait 4/5, 1400 × 1750 px |
| `w-01.jpg` | grande image de la section « Karukera » | paysage, 1800 × 1100 px |
| `s-01.jpg` … `s-08.jpg` | services et expériences | portrait, 760 × 950 px |
| `og.jpg` | vignette de partage WhatsApp / réseaux | 1200 × 630 px |
| `assets/favicon.svg` | icône d'onglet | — |

Conseils de prise de vue, vu le parti pris graphique : lumière de fin de journée, cadrages
serrés sur les matières (bois, chaux, eau), pas de grand-angle immobilier. Compressez en JPEG
qualité 80 (sur squoosh.app par exemple) : sous 300 ko par image, le site reste rapide.

Les deux mêmes fichiers `s-XX.jpg` servent parfois à deux endroits ; si vous voulez des visuels
distincts partout, ajoutez `s-09.jpg`, `s-10.jpg` et mettez à jour les `src` correspondants.

---

## 4. Faire fonctionner le formulaire

En l'état, le bouton **Envoyer** ouvre la messagerie du visiteur avec un message pré-rempli.
Ça marche, mais c'est moins confortable qu'un vrai envoi. Pour recevoir les demandes par mail :

1. Créer un compte gratuit sur [formspree.io](https://formspree.io), puis un formulaire.
2. Copier l'identifiant fourni (du type `xyzabcd`).
3. Dans `index.html`, remplacer :

```html
<form class="form" action="https://formspree.io/f/VOTRE_ID" method="POST" data-form>
```

par votre identifiant. Le script détecte le changement et bascule tout seul sur l'envoi
en arrière-plan, avec message de confirmation.

---

## 5. Comment c'est fait

```
index.html                 toute la page
assets/css/main.css        styles, variables de couleur en haut du fichier
assets/css/fonts.css       déclarations des polices
assets/js/water.js         fond animé du hero (WebGL)
assets/js/main.js          navigation, révélations, rail, carrousel 3D, estimateur
assets/fonts/              Bodoni Moda + Archivo, auto-hébergées (licence OFL incluse)
assets/img/                images
vercel.json                URLs propres + cache des fichiers statiques
```

**Direction artistique.** Fond vert marine très sombre, ivoire, lagon pâle, sable.
Bodoni Moda pour les titres (forte opposition pleins / déliés, c'est ce qui donne le côté
maison de luxe), Archivo en léger pour le texte courant. Les couleurs sont regroupées dans
les variables `:root` au début de `main.css` : en changer une suffit à repeindre tout le site.

**Animations.**

- *Hero* : surface d'eau calculée en direct par la carte graphique — bruit fractal replié sur
  lui-même pour les nervures de caustiques, halo qui suit le curseur, ondulation au clic.
  Si le navigateur ne gère pas WebGL, un dégradé équivalent prend le relais.
- *Logotype* : les lettres montent une par une derrière un masque.
- *Maisons* : la molette fait défiler la galerie horizontalement, avec inertie. Sur téléphone,
  retour à un glissement au doigt classique avec aimantation.
- *Conciergerie* : au survol d'une ligne, les autres s'effacent et une image suit le curseur.
- *Expériences* : un anneau de huit cartes en perspective, qu'on fait tourner à la souris ou
  au doigt. Il dérive lentement tout seul pour donner envie d'y toucher.
- *Estimateur* : les montants se mettent à jour en continu pendant qu'on déplace les curseurs.

Tout est désactivé si le visiteur a demandé de réduire les animations dans son système
(`prefers-reduced-motion`), et le site reste entièrement navigable au clavier.

**Performances.** Environ 2,5 Mo au total, dont l'essentiel en images ; aucune requête vers
un serveur tiers, donc rien à déclarer côté cookies ou consentement.

---

## 6. Idées pour la suite

- Une page par maison (le lien existe déjà dans la carte, il suffit de le brancher).
- Section propriétaire : contrat type, grille tarifaire détaillée, relevés.
- Avis voyageurs, à récupérer depuis Airbnb.
- Version anglaise : dupliquer `index.html` en `/en/index.html` et traduire.
