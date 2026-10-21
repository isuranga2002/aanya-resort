# Aanya Resort, Avissawella

Website for **Aanya Resort**: private A-frame pool villas on Hewainna Road, Avissawella, Sri Lanka.

Plain HTML, CSS and JavaScript. Nothing to build or install, and it runs on GitHub Pages as it is.

## Structure

```
index.html            Main one-page site
404.html              "Page not found" page
assets/css/style.css  All styles (responsive)
assets/js/main.js     Slideshow, menu, gallery lightbox, booking → WhatsApp, etc.
assets/images/        Resort photos + favicon
.nojekyll             Tells GitHub Pages to serve files as-is
```

## Publish on GitHub Pages

1. Create a new repository on GitHub (for example `aanya-resort`).
2. Upload **everything in this folder** to the repository root, either by drag-and-drop on GitHub or with:
   ```bash
   git init
   git add .
   git commit -m "Aanya Resort website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/aanya-resort.git
   git push -u origin main
   ```
3. On GitHub go to **Settings → Pages**, set **Source: Deploy from a branch**, then **Branch: `main` / `(root)`** and click Save.
4. After a minute the site is live at `https://<your-username>.github.io/aanya-resort/`.

## Editing

- **Phone / WhatsApp number:** change `WHATSAPP` and `EMAIL` at the top of `assets/js/main.js`, then search `index.html` for `94714576474`.
- **Prices:** see the `Packages` section in `index.html`.
- **Photos:** replace files in `assets/images/` and keep the same names, or update the `src` in `index.html`.
- **Colours / fonts:** CSS variables at the top of `assets/css/style.css`.

Booking and contact forms don't need a server. They open WhatsApp, or the visitor's email app, with the message already filled in.
