# Gamma Files: The Lost Update — Website

Official website for the Gamma Files: The Lost Update Minecraft modpack.

Hosted on GitHub Pages at: `https://<your-username>.github.io/<repo-name>/`

## Structure

```
/
├── index.html          ← Home page
├── credits.html        ← Credits
├── community.html      ← Community links
├── store.html          ← Store / download links
├── help.html           ← Help & FAQ
├── game/
│   ├── index.html      ← What is Gamma Files?
│   └── howtoplay.html  ← Installation & getting started
├── css/
│   └── style.css       ← Main stylesheet
├── js/
│   ├── nav.js          ← Shared header/footer injector
│   └── downloads.js    ← Live download counter (Modrinth + CurseForge)
└── images/
    ├── logo.png         ← Minecraft logo (placeholder)
    ├── bg_top.png       ← Header background tile
    ├── bg_main.png      ← Body background tile
    └── animals.png      ← Right sidebar image (placeholder)
```

## Adding pages

1. Create a new `.html` file in the root (or a subfolder for grouped pages).
2. Copy the boilerplate from any existing page.
3. Add the page to `js/nav.js` in the `NAV_ITEMS` array.
4. Call `initNav('your-page-id')` at the bottom of the new page.

## Replacing placeholder assets

- **Header background**: replace `images/bg_top.png` with `dirt.png` (raw tile).
  Then set `--header-overlay-opacity-bottom: 0.8` and `--header-overlay-opacity-top: 0.4`
  in `css/style.css` `:root` to apply the CSS gradient instead.

- **Body background**: replace `images/bg_main.png` with `stone.png` (raw tile).
  Then uncomment the `background: rgba(0,0,0,0.45)` line in `body::after` in `style.css`.

- **Right sidebar image**: replace `images/animals.png` with Gamma Files character art.

## Download counter

Edit `js/downloads.js`:
- Set your real CurseForge numeric project ID in `CURSEFORGE_PROJECT_ID`.
- Set your CurseForge API key in `CURSEFORGE_API_KEY` (get one at https://console.curseforge.com/).
- The Modrinth slug `gamma-files-lite` is already set and works without a key.

## Deploying to GitHub Pages

1. Create a new GitHub repository (public).
2. Push this folder as the root of the repo:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. Go to the repo on GitHub → Settings → Pages.
4. Under "Source", select **Deploy from a branch** → `main` → `/ (root)`.
5. Save. Your site will be live at `https://<your-username>.github.io/<repo-name>/` within a minute or two.

The `.nojekyll` file in the root tells GitHub Pages to skip Jekyll processing,
which is necessary for the site to work correctly.
