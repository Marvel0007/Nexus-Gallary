# ⚡ NEXUS // Cyber Photo Gallery

<div align="center">

![React](https://img.shields.io/badge/React-19.3-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Picsum API](https://img.shields.io/badge/Picsum-Photos_API-ef4444?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-red?style=for-the-badge)

**A high-fidelity, cyberpunk-themed visual discovery feed and inspection studio.**

[Live Demo](https://github.com/Marvel0007/Nexus-Gallary) • [Features](#-key-features) • [Keyboard Matrix](#-keyboard-shortcuts-matrix) • [Getting Started](#-getting-started)

</div>

---

## 🌌 Overview

**Nexus Gallery** is a futuristic photo curation web application engineered with **React 19**, **Tailwind CSS v4**, and the **Picsum Photos V2 API**. It pairs a responsive multi-column gallery with persistent bookmarking, dynamic visual filters, and real-time creator search.

---

## 🚀 Key Features

- 🛰️ **Continuous Photo Stream**: Seamless pagination buffering 28+ photography transmissions per batch using custom hooks and `AbortController`.
- 💾 **Persistent Memory (useReducer + LocalStorage)**: Bookmarked photos stay preserved across browser restarts.
- 📦 **JSON Backup & Restore**: Export bookmarks to `.json` files or restore previous archives with one click.
- 🔍 **Real-Time Creator Search**: Instant author filtering with query clear and shortcut focus.
- 🎛️ **Multi-Density Grid**: Switch seamlessly between **Compact** (6 columns), **Standard** (4 columns), and **Cinematic** (2 columns).
- 🎬 **Cyber Lightbox & Slideshow**:
  - Full carousel navigation (<kbd>←</kbd> and <kbd>→</kbd> arrows)
  - Hands-free auto-play slideshow mode (<kbd>Space</kbd>)
  - Direct full-res image file download (`.jpg` blob download)
  - One-click image link copy to clipboard
- 🧪 **Live Visual Filter Matrix**: Apply live CSS filters to any transmission: *Normal*, *Cyber Neon*, *Noir*, *High Contrast*, and *Vintage*.
- 🎨 **Accent Themes**: Dynamic cyber themes: *Crimson Red (Default)*, *Neon Cyan*, *Matrix Emerald*, and *Tokyo Purple*.
- 🔔 **Cyber HUD Notifications**: Instant feedback alerts for bookmarking, link copying, exporting, and memory purging.

---

## ⌨️ Keyboard Shortcuts Matrix

| Key | Action |
| :---: | :--- |
| <kbd>/</kbd> | Instantly focus the photographer search bar |
| <kbd>?</kbd> | Toggle the keyboard shortcuts reference matrix |
| <kbd>Esc</kbd> | Close the photo inspection lightbox modal |
| <kbd>←</kbd> | Navigate to previous photo in lightbox |
| <kbd>→</kbd> | Navigate to next photo in lightbox |
| <kbd>Space</kbd> | Start / Pause automatic slideshow |

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography**: Orbitron & Inter (Google Fonts)
- **API**: [Picsum Photos V2 API](https://picsum.photos/)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 📂 Project Architecture

```
photo-gallery-app/
├── index.html                   # HTML entry with Orbitron & Inter Google Fonts
├── package.json                 # Project dependencies & scripts
├── src/
│   ├── main.jsx                 # React root mount
│   ├── App.jsx                  # Main orchestration, controls, filters & themes
│   ├── index.css                # Tailwind CSS v4 styling & custom cyber scrollbar
│   ├── components/
│   │   ├── GalleryGrid.jsx      # Dynamic multi-density responsive grid
│   │   ├── PhotoCard.jsx        # Card with skeleton shimmer & error resilience
│   │   ├── PhotoModal.jsx       # Lightbox carousel, filters & download studio
│   │   ├── LoadingSpinner.jsx   # Futuristic dual rotating cyber ring loader
│   │   ├── ErrorMessage.jsx     # Network error panel with retry connection
│   │   └── Toast.jsx            # HUD toast notification system
│   ├── hooks/
│   │   └── useFetchPhotos.js    # Paginated data fetching hook with AbortController
│   └── reducers/
│       └── favouritesReducer.js # useReducer state with localStorage sync & backup
```

---

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Marvel0007/Nexus-Gallary.git
   cd Nexus-Gallary
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Lint check**:
   ```bash
   npm run lint
   ```

---

## 👤 Author

- **GitHub**: [@Marvel0007](https://github.com/Marvel0007)
- **Repository**: [Nexus-Gallary](https://github.com/Marvel0007/Nexus-Gallary)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
