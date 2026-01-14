# Nulish - Minimal Note App

Aplikasi catatan minimalis berbasis Markdown yang didesain untuk fokus. Dibangun menggunakan React, Vite, dan Tailwind CSS.

## 🚀 Persiapan (Zero Config)

Jika kamu baru saja pull repository ini ke laptop baru, cukup jalankan:

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Jalankan Development Server**
    ```bash
    npm run dev
    ```

Akses aplikasi di [http://localhost:5173](http://localhost:5173).

## 🛠 Tech Stack
- **Framework**: React 18 & TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS (v3) + Typography
- **Editor**: MDXEditor
- **Routing**: Wouter
- **Animations**: Framer Motion
- **Database (Dev)**: LocalStorage with Seeding logic

## ☁️ Deployment ke Cloudflare

Proyek ini siap untuk di-deploy ke **Cloudflare Pages**.

1.  **Login ke Cloudflare**
    ```bash
    npx wrangler login
    ```

2.  **Setup Database D1**
    ```bash
    npx wrangler d1 create nulish-db
    ```
    *Update database_id di wrangler.jsonc dengan ID yang didapat.*

3.  **Inisialisasi Schema**
    ```bash
    npx wrangler d1 execute nulish-db --file=./schema.sql
    ```

4.  **Deploy**
    ```bash
    npx wrangler pages deploy dist
    ```

---
*Dibuat dengan ❤️ menggunakan AI.*
