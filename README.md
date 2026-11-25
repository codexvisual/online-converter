# Online Converter

A free, browser-based PDF toolkit inspired by iLovePDF.

Developed by [Filofa Technology](https://filofa.com).

## Features

- Merge, split, compress, rotate and organize PDFs
- Convert PDF to Word, Excel, PowerPoint, JPG, HTML and PDF/A
- Convert Word, Excel, PowerPoint, images and HTML to PDF
- Add page numbers, watermarks and signatures
- Protect and unlock PDFs with AES-256
- Compare and repair PDFs
- Everything runs in the browser — files are never uploaded

## Tech

- HTML, CSS, vanilla JavaScript
- pdf-lib, pdf.js, pdf-lib-encrypt
- SheetJS, PptxGenJS, Mammoth, html2pdf.js, docx
- Ream (PPTX/DOCX/XLSX to PDF)

## Run locally

Open `index.html` directly, or serve the folder:

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## Deploy to cPanel

Upload the contents of this folder to `public_html` (or a subfolder). No build step or server configuration is required.
