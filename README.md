
[English](README.md) | [中文](README.zh-CN.md)
# SF6 Notebook

A lightweight, open‑source notebook and utility site for **Street Fighter 6** players.

SF6 Notebook is designed as a *personal + competitive* tool: you can record matchup notes, combo ideas, character insights, and quickly reference frame data — all in one place, with an input system tailored specifically for fighting games.

---

## ✨ Features

- 📓 **Matchup & Character Notes**  
  Organize notes by character and opponent. Ideal for matchup preparation and post‑set review.

- 🧩 **Combo Notebook**  
  Create combo groups (punishes, corner, Drive Rush, etc.) and store detailed combo routes with follow‑ups and reminders.

- ⌨️ **Fighter Input Mode**  
  A custom input system optimized for fighting game notation:
  - Numpad‑style direction input (1–9 → arrows)
  - Automatic capitalization for buttons (`lp/mp/hp`, `lk/mk/hk`, `pp/kk`, etc.)
  - Toggleable per input field

- 📊 **Frame Data Reference**  
  Quickly view frame data for different characters.

- 💾 **Local‑First Storage**  
  All data is stored locally in your browser using `localStorage`.
  - Auto‑save by default
  - Export / import logbook for backup or cross‑device use

- 🌐 **Bilingual UI**  
  Full Chinese / English language toggle.

---

## 🚀 Live Demo

The project is deployed on GitHub Pages:

```
https://<your-username>.github.io/sf6_notebook/
```

---

## 🛠 Tech Stack

- **Frontend**: Vite + React
- **Routing**: React Router (`BrowserRouter` with `basename = import.meta.env.BASE_URL`)
- **Styling**: Inline styles / CSS variables
- **Deployment**: GitHub Pages (`gh-pages` branch)

---

## 📦 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/twguri/sf6_notebook.git
cd sf6_notebook
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the dev server

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173/
```

---

## 📤 Deployment (GitHub Pages)

This project uses **Vite + gh-pages** for deployment.

### One‑time setup

```bash
npm install --save-dev gh-pages
```

Ensure `package.json` contains:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "deploy": "npm run build && npx gh-pages -d dist"
}
```

### Deploy

```bash
npm run deploy
```

GitHub Pages should be configured as:

- **Source**: Deploy from a branch
- **Branch**: `gh-pages`
- **Folder**: `/ (root)`

---

## 📱 Mobile & PWA Notes

This project is designed with mobile use in mind:

- Touch targets sized for mobile interaction
- Input fields disable auto‑correct and auto‑capitalize where appropriate
- Custom handling for soft keyboard interactions
- Uses `100dvh` instead of `100vh` to avoid mobile viewport issues

Future plans include:
- PWA support (installable on mobile)
- Android APK via Capacitor
- Desktop builds via Tauri

---

## 📊 Data Sources

Frame data is compiled from:

- In‑game testing
- Official Capcom information
- Community resources (e.g. ComboMasher)

> Note: Frame data may lag behind game patches and is continuously being updated and verified.

---

## 📄 License

This project is open source and intended for **personal, educational, and competitive analysis use**.

You are free to fork, modify, and adapt it for your own workflow.

---

## 🙌 Contributing

Contributions, suggestions, and issue reports are welcome.

If you have ideas for:
- UI/UX improvements
- Input system refinements
- Additional tooling for competitive players

Feel free to open an issue or submit a pull request.

---

## 🧠 Philosophy

SF6 Notebook is intentionally:

- **Local‑first** (your data stays with you)
- **Tool‑oriented**, not social or monetized
- **Optimized for real match preparation**, not content creation

It is built to support how fighting game players actually think, train, and review.

