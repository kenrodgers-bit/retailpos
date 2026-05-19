# Shoeshop POS

Offline Progressive Web App point-of-sale system for a single shop.

## Features

- React + Vite + Tailwind CSS
- Dexie.js powered IndexedDB local storage
- Full admin setup, login, inventory, sales, reports
- Product image upload and local storage
- Backup / restore with JSON and CSV export
- Installable PWA with offline support

## Install

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run local development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## PWA Installation

- Open the app in Chrome and install it from the browser menu.
- After installation, it runs like a native mobile app.

## Local Storage

- All app data is stored in IndexedDB using Dexie.
- Admin credentials, settings, products, sales, stock adjustments, and backups are local only.

## Backup & Restore

- Export full app backup as JSON for a safe copy.
- Import JSON backup to restore data.
- Export CSV reports for products, sales, and stock adjustments.

## Reset

- Clearing browser data or uninstalling the app removes all local data.
- Keep regular backups to avoid data loss.
