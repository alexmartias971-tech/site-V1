# Drift House — site vitrine

Site statique (HTML / CSS / JavaScript, sans dépendance ni build) pour le complexe
**Drift House** à Roujol, Petit-Bourg, Guadeloupe : karting drift, billard et food truck.

## Mise en ligne

### 1. GitHub
```bash
git init
git add .
git commit -m "Site Drift House"
git branch -M main
git remote add origin https://github.com/<ton-compte>/drift-house.git
git push -u origin main
```

### 2. Vercel
1. vercel.com → **Add New… → Project** → importer le dépôt.
2. Framework Preset : **Other**. Build Command : *vide*. Output Directory : *vide* (racine).
3. **Deploy**. L'aperçu est en ligne en quelques secondes.

Aucune configuration n'est nécessaire : `index.html` est à la racine.

### Test en local
```bash
python3 -m http.server 8000   # puis http://localhost:8000
```

## Ce qu'il y a dans le site

| Section | Contenu |
|---|---|
| Accueil | Trajectoire de drift qui se dessine au chargement, kart qui la suit, traînée de gomme au passage de la souris |
| Le drift | Le principe de la barre de glisse en trois étapes |
| Le complexe | Plan interactif cliquable : piste, billard, food truck, zone d'apprentissage, accueil |
| Tarifs | 15 € la session + simulateur de budget de groupe (devis WhatsApp pré-rempli à partir de 8 pilotes) |
| Horaires | Semaine complète, **badge « ouvert / fermé » calculé en direct** à l'heure de la Guadeloupe, jour du jour mis en avant |
| Accès | Adresse, Google Maps, téléphone, WhatsApp, Instagram |

Autres points : données structurées `SportsActivityLocation` pour Google, `robots.txt`,
`sitemap.xml`, image de partage (`assets/og.png`), navigation clavier, contraste,
`prefers-reduced-motion` respecté, barre d'appel fixe sur mobile.

## Ce qu'il faut modifier

**`script.js`, tout en haut :**
```js
const VACANCES = false;   // passer à true pendant les vacances scolaires (15 h – 23 h tous les jours)
const PRIX_SESSION = 15;  // tarif d'une session
const HORAIRES = [...];   // horaires de la semaine, dimanche en premier
```
Le badge « Ouvert jusqu'à… » et la mise en avant du jour se recalculent automatiquement.
Si les horaires changent, modifie aussi la liste visible dans `index.html` (`<ul class="week">`)
et les `openingHoursSpecification` du bloc de données structurées.

**À vérifier avant publication** (contenu rédigé à partir du site actuel, à confirmer) :
- le billard : nombre de tables, accès libre ou payant ;
- le food truck : carte, horaires d'ouverture réels ;
- les paliers exacts du tarif groupe au-delà de 8 pilotes.

**Ajouter des photos.** Dépose les images dans `assets/`, puis insère-les dans la
section concernée, par exemple :
```html
<img src="assets/piste.jpg" alt="La piste de drift vue depuis l'accueil" loading="lazy">
```

## Fichiers

```
index.html      la page
styles.css      styles, animations, responsive
script.js       horaires en direct, plan interactif, simulateur
assets/         favicon.svg, og.png
robots.txt      sitemap.xml
```

## Couleurs et typographie

`#120E24` nuit · `#1C1736` bitume · `#0A0716` gomme · `#FFB224` ambre · `#35E0D0` turquoise · `#EFEAFB` craie
Typographie : Archivo (Google Fonts, variable).
