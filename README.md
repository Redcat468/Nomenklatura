<p align="center">
  <img src="public/SB_NOBG_BLACK.svg" alt="Nomenklatura" width="360" />
</p>

<h3 align="center">Filename Nomenclature Engine</h3>

<p align="center">
  A client-side web app for generating, managing, and exporting standardized filenames for audiovisual post-production deliveries.
</p>

<p align="center">
  <a href="https://redcat468.github.io/Nomenklatura/">Live Demo</a>
</p>

---

## Overview

Nomenklatura is a schema-driven filename generator built for post-production workflows. It enforces consistent naming conventions across video, audio, and subtitle deliverables — eliminating human error in file naming during clean master deliveries.

Define your segments (program, version, language, codec, resolution...), fill in the form, and the engine builds standardized filenames with live preview, colored segments, and batch export.

## Features

- **Schema-driven** — Segments, options, and rules are defined in a single JSON schema
- **Live preview** — Color-coded filename segments update as you type
- **Composite segments** — Language + subtitles merge automatically (e.g. `FR-STEN`)
- **Batch management** — Add, edit, duplicate, reorder (drag & drop), and delete entries
- **Export** — CSV, JSON, and styled PDF with colored segments and dark entry cards
- **Import** — Drag & drop CSV/JSON import with replace or append modes
- **File size calculator** — Estimate file sizes from duration and bitrate
- **Persistent** — Entries saved to localStorage automatically
- **Fully client-side** — No server, no tracking, runs entirely in the browser

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Drag & Drop | @dnd-kit |
| Animations | Framer Motion |
| PDF | jsPDF |
| CSV | PapaParse |
| Icons | Lucide React |
| Deploy | GitHub Pages via GitHub Actions |

## Getting Started

```bash
git clone https://github.com/Redcat468/Nomenklatura.git
cd Nomenklatura
npm install
npm run dev
```

## Export Naming Convention

All exports follow the pattern:

```
PROGRAM_NAME_EXPORT-LIST_YYMMDD.csv
PROGRAM_NAME_EXPORT-LIST_YYMMDD.json
PROGRAM_NAME_EXPORT-LIST_YYMMDD.pdf
```

## Schema

The default schema (`src/schemas/default.json`) defines a clean masters delivery workflow with segments for:

| Segment | Type | Example |
|---------|------|---------|
| Program | text | `MonFilm` |
| Version | text | `V2` |
| Language | select | `FR` |
| Subtitles | composite select | `STEN` |
| File Format | select | `ProRes_422HQ` |
| Video Format | select | `UHD` |
| Aspect Ratio | text | `239` |
| Resolution | text | `1920x1080` |
| Cadence | select | `25` |
| Audio Format | select | `51` |
| Audio Codec | text | `PCM` |
| Date | date | `260520` |

**Example output:** `MonFilm_V2_FR-STEN_ProRes_422HQ_UHD_239_1920x1080_25_51_PCM_260520`

## License

This project is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

See [LICENSE](LICENSE) for details.
