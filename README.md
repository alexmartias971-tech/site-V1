# Macsurplus — fausse boutique piège

Site statique, une seule page. C'est une **blague**, pas une boutique : dès qu'on clique
sur n'importe quel bouton « Commander », l'écran bascule sur une page qui explique
que c'est faux et liste les neuf signaux d'arnaque semés dans la page.

Aucun formulaire, aucun champ de paiement, aucune donnée envoyée où que ce soit.
Tout le JavaScript tourne dans le navigateur.

## Contenu

```
index.html          la page
css/style.css       les styles
js/app.js           compte à rebours, stock qui bouge, parallaxe, révélation
img/                les deux visuels produit
```

## Lancer en local

Double-clic sur `index.html` suffit. Ou, pour être propre :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

## Mettre en ligne (GitHub → Vercel)

1. Dézipper le dossier.
2. Créer un dépôt sur GitHub, puis :

```bash
cd macsurplus
git init
git add .
git commit -m "Macsurplus"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/macsurplus.git
git push -u origin main
```

3. Sur vercel.com → **Add New Project** → importer le dépôt.
4. Framework Preset : **Other**. Build Command : vide. Output Directory : vide.
5. **Deploy**. L'URL est prête en une vingtaine de secondes.

Rien à configurer de plus : Vercel sert le dossier tel quel.

## Bon à savoir

Le `<meta name="robots" content="noindex, nofollow">` dans l'en-tête évite que la page
soit indexée par les moteurs de recherche. Garde-le. Envoie le lien directement à ton
pote plutôt que de le diffuser : une vitrine à 80 € qui traîne en ligne peut tromper
quelqu'un qui n'est pas dans la blague.

## Personnaliser

- Le prénom de la cible : dans `index.html`, bloc `.bust__sub`.
- La liste des signaux : bloc `.bust__list`.
- Les prix et modèles : section `.catalog`.
- Les couleurs : variables en haut de `css/style.css`.
