# Nexus POS PWA

A polished React + Vite Progressive Web App mockup for a single-user offline POS system. The UI is designed to look like the illustrative phone mockups: Dashboard, POS checkout, Products/Inventory, Reports, and Settings.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Build

```bash
npm run build
npm run preview
```

## Install as PWA

After building/deploying or previewing over a secure origin, open the app in Chrome and choose **Install app** or **Add to Home screen**.

## What is included

- React + Vite app
- PWA setup using vite-plugin-pwa
- Mobile-first POS UI
- Dashboard screen
- POS sale/cart screen
- Inventory/products screen
- Reports screen
- Settings screen
- Bottom mobile navigation
- KES currency formatting
- Sample product and sales data

## Next features to add

- Dexie.js IndexedDB database tables
- Real product add/edit forms
- Product photo upload and local image storage
- Sales saving and stock deduction
- Receipt printing/download
- Backup and restore JSON export/import
- CSV report exports



## Native-like Android PWA mode

This project is configured to open without browser clutter after installation.

The PWA manifest uses:

```js
display: 'fullscreen'
display_override: ['fullscreen', 'standalone']
orientation: 'portrait-primary'
```

The HTML also includes mobile app meta tags and `viewport-fit=cover` so it fills the phone screen nicely.

### Install on Android

1. Run the app and open it in Chrome on the phone.
2. Tap the Chrome menu `⋮`.
3. Tap **Install app** or **Add to Home screen**.
4. Open it from the home screen icon, not from the browser tab.

When opened from the home screen, it should look like a normal Android app without the Chrome address bar.

For the best install behavior, use the production build:

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

Then open the Network preview link on the phone and install it.
