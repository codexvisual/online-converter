# Online Converter

A free, browser-based PDF toolkit inspired by iLovePDF.

Developed by [Filofa Technology](https://filofa.com).

## Features

- 66 tools across 8 categories: Organize, Optimize, Convert to/from, Edit, Security, Intelligence and Image tools
- Image tools: compress, resize, crop, convert, edit, upscale, background removal, watermark, meme, rotate, HTML-to-image, region blur, Base64, colour picker, metadata, SVG optimizer, format detection, borders, favicons and contact sheets
- Merge, split, extract, compress, rotate, crop, organize and repair PDFs
- Convert PDF to Word, Excel, PowerPoint, JPG, HTML, PDF/A, text, CSV, Markdown, OCR and translation
- Convert Word, Excel, PowerPoint, images and HTML to PDF
- Add page numbers, watermarks, signatures, headers/footers and metadata
- Protect/unlock PDFs, redact, flatten, grayscale and fill forms
- Everything runs locally in the browser — files are never uploaded

## Advanced UX

- **Dark mode** toggle, saved to `localStorage`, applied before page paint; follows your OS preference until you choose manually
- **Installable PWA** with manifest, icons and an offline service worker
- **Toast notifications** for downloads and warnings
- **Recently used tools** section on the home page
- **Smart search** with relevance ranking, synonyms, typo tolerance, live highlighting and keyboard navigation
- **Standardized modern cards** with equal heights, category accents and a responsive 4/3/2/2 grid
- **Tool breadcrumbs**, animated progress feedback and keyboard-activated cards (Enter/Space)
- **Keyboard shortcuts**: `Ctrl/Cmd + K` focuses search, `/` focuses search, `Esc` closes menus
- **Back to top** button and large mobile touch targets
- Self-hosted Font Awesome icons so the UI works offline too

## Tech

- Static HTML, CSS and vanilla JavaScript — no build step, no server
- pdf-lib, pdf.js, JSZip, FileSaver
- docx, SheetJS, PptxGenJS, Mammoth, html2pdf.js, Tesseract.js (lazy-loaded with CDN fallback)

## Run locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy

- **GitHub Pages**: push to `main` and serve from the repository root.
- **cPanel**: upload the full folder contents to `public_html`. No configuration needed.

The service worker is registered only over HTTPS, so localhost and GitHub Pages work automatically.
