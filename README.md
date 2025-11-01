# Nodepad

[![version](https://img.shields.io/badge/version-1.0.0-blue.svg)](./package.json) [![license](https://img.shields.io/badge/license-ISC-green.svg)](./LICENSE)

## 📘 Project overview

Nodepad is a minimal Node.js notes website that serves a few static HTML pages and stores notes as plain text files under the `notes/` folder. It uses only Node's built-in `http` and `fs` modules and is intended as a small, educational demo or starting point for simple projects.

## 💡 Why this project

- Small surface area and few dependencies — great for learning core Node.js server APIs.
- File-based persistence keeps setup friction low (no database required).
- Single-file server (`server.js`) and static HTML in `src/` make it easy to understand and modify.

## Table of contents

- [Getting started](#-getting-started)
- [What the server does](#-what-the-server-does)
- [Project layout](#-project-layout)
- [Documentation & support](#-documentation--support)
- [Maintainers & contributing](#-maintainers--contributing)
- [Security](#-security)

## ⚙️ Getting started

Prerequisites

- Node.js 14+ (or any actively supported LTS)

Install dependencies

```powershell
npm install
```

Run

```powershell
# Start normally
npm start

# Or run with nodemon (development)
npm run server
```

Open your browser at:

```
http://localhost:5000/
```

## 🧭 What the server does

- GET / — serves `src/index.html` and injects saved notes (reads `notes/*.txt`).
- GET /about — serves `src/about.html`.
- GET /addNotes — serves `src/addNotes.html`.
- POST /save-note — accepts form-encoded `noteTitle` and `noteBody`, sanitizes the title to a safe filename, saves to `notes/<sanitized_title>.txt`, then redirects to `/`.

Example: add a note (PowerShell)

```powershell
$body = @{ noteTitle = 'My Note'; noteBody = 'This is the note body.' }
Invoke-RestMethod -Uri http://localhost:5000/save-note -Method Post -Body $body
```

## 🗂️ Project layout

- `server.js` — main server and routing logic.
- `package.json` — metadata and npm scripts.
- `src/` — static HTML pages (`index.html`, `addNotes.html`, `about.html`, `errorPage.html`).
- `notes/` — runtime folder where `.txt` note files are stored (created automatically when saving notes).

## 🧩 Documentation & support

- Read the source: start with `server.js` and the HTML files in `src/`.
- Use the repository Issues tracker to report bugs or request features.
- To add longer-form docs, create a `docs/` directory and link it from this README.

## 👥 Maintainers & contributing

- Maintainer: `atharvashirodkar` (see `package.json`)

Contributing

- Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.
- Open an issue to discuss larger changes before submitting a pull request.

## 🔒 Security

This demo is intentionally minimal. It does not provide authentication, authorization, or comprehensive input sanitization. File names are sanitized when saving notes, but do not assume this is safe for untrusted input. Do not use this project to store sensitive data without adding proper protections.

## Notes & next steps

- Consider moving `nodemon` from `dependencies` to `devDependencies` if used only in development.
- Add tests and a linter (ESLint) for higher code quality.
- Add CI (GitHub Actions) with a build/test badge.

---

If you'd like, I can also add a minimal `CONTRIBUTING.md` and `LICENSE` file so links resolve; say the word and I will add them.
