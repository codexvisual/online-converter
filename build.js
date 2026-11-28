const fs=require('fs');
const path=require('path');
const ROOT='C:/Users/Rahat/Desktop/Online Converter';
const OUT=ROOT;
const data=JSON.parse(fs.readFileSync('C:/Users/Rahat/AppData/Local/Temp/opencode/toolsConfig.json','utf8'));

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

const GUIDE={
  'Organize PDF':{why:'A well-organised PDF is faster to read and easier to share. Instead of juggling several separate files you can combine chapters, remove mistakes and put pages in the right order in a single pass.',uses:['Combining a cover page, report and appendix into one document','Dropping draft or duplicate pages before sending a contract','Rotating scanned pages that arrived the wrong way round'],tip:'Review the page order on the preview before saving — it is much quicker than rebuilding the document later.'},
  'Optimize PDF':{why:'Large PDFs are slow to email and frustrating to open on a phone. Optimising removes unnecessary data while keeping the pages you actually need readable, so documents stay sharable without special software.',uses:['Shrinking a scanned document so it fits an email attachment','Preparing slides for a website with a strict upload limit','Cleaning up a PDF before archiving it'],tip:'Start with lossless compression; move to image compression only when the file is still too big.'},
  'Convert from PDF':{why:'A PDF is great for sharing but awkward to edit. Converting it into an editable format lets you reuse text, tables and page layouts in the tools you already use.',uses:['Turning an invoice into a spreadsheet for analysis','Extracting the text of a report into a Word document','Making slide content from a PDF presentation'],tip:'Always check the first converted page — complex layouts may need a little manual cleanup afterwards.'},
  'Convert to PDF':{why:'PDF is the safest way to send a finished document: it looks the same on every device and cannot be edited by accident. Converting your source files to PDF keeps formatting intact.',uses:['Sending a Word contract that must not change','Archiving a spreadsheet as a fixed record','Turning a web page into a shareable document'],tip:'Choose the page size before converting so tables and images fit without awkward breaks.'},
  'Edit PDF':{why:'Small changes should not require expensive desktop software. Browser-based editing lets you add a note, mark up a page or place a signature without installing anything.',uses:['Adding a watermark to a draft proposal','Placing page numbers on a long manual','Signing an agreement and sending it straight back'],tip:'Work on a copy of the original file so you can always start again if a change is not right.'},
  'PDF Security':{why:'Documents often contain information that should not be public. Password protection, redaction and permission controls help you share safely while keeping the original under your control.',uses:['Protecting a contract with a password','Removing personal details before publishing a document','Unlocking a PDF you have forgotten the password for'],tip:'Keep the password somewhere separate from the file, and check that redaction actually removes the text.'},
  'PDF Intelligence':{why:'Modern browsers can do more than move files around. OCR, summarisation and metadata tools help you understand what is inside a document and prepare it for other work.',uses:['Making a scanned contract searchable','Summarising a long report before a meeting','Checking what metadata a file reveals'],tip:'For scanned documents run OCR first; text-based tools need selectable text to work.'},
  'Image Tools':{why:'Images are the heaviest part of most web pages. Compressing, resizing and converting them locally keeps sites fast without uploading personal photos to a third-party server.',uses:['Preparing product photos for an online shop','Resizing a screenshot for a presentation','Removing a plain background from a profile picture'],tip:'Export WebP for the web and PNG when transparency matters.'}
};
function privacyNote(t){
  if(t.id==='translate') return 'Translate PDF is the one deliberate exception: it sends only the extracted text to a translation service so the live preview can work. Your PDF file, filename and pages are never uploaded.';
  if(t.id==='image-upscale') return 'The AI engine downloads an open-source Real-ESRGAN model (~5 MB) once and caches it in your browser; inference then runs locally. Your image itself is never uploaded.';
  return 'This tool processes your file entirely inside your browser tab. Nothing is uploaded, stored on a server, or shared. The download is generated on your device, so the original file stays private.';
}

function toolPage(t){
  const base='';
  const url=`https://codexvisual.github.io/online-converter/tools/${t.slug}/`;
  const related=data.filter(x=>x.category===t.category&&x.id!==t.id).slice(0,6);
  const faqJson=t.faqs.map(f=>({ "@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}));
  const jsonld=[{"@context":"https://schema.org","@type":"SoftwareApplication","name":t.title,"applicationCategory":"UtilitiesApplication","operatingSystem":"Any","description":t.metaDescription,"url":url,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"author":{"@type":"Organization","name":"Filofa Technology"}},{"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqJson},{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://codexvisual.github.io/online-converter/"},{"@type":"ListItem","position":2,"name":"All Tools","item":"https://codexvisual.github.io/online-converter/tools/"},{"@type":"ListItem","position":3,"name":t.title,"item":url}]}];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<base href="../../" />
<script>window.__BASE_PATH__=document.baseURI.replace(location.origin,'');</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(t.title)} — Free Online Tool | Online Converter</title>
<meta name="description" content="${esc(t.metaDescription)}" />
<meta name="keywords" content="${esc(t.keywords.join(', '))}" />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="${esc(t.title)} — Online Converter" />
<meta property="og:description" content="${esc(t.metaDescription)}" />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://codexvisual.github.io/online-converter/assets/icon-512.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(t.title)}" />
<meta name="twitter:description" content="${esc(t.metaDescription)}" />
<meta name="twitter:image" content="https://codexvisual.github.io/online-converter/assets/icon-512.png" />
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<link rel="icon" type="image/png" href="${base}assets/favicon.png" />
<link rel="stylesheet" href="${base}assets/fontawesome/css/all.min.css" />
<link rel="stylesheet" href="${base}css/style.css" />
<link rel="stylesheet" href="${base}css/studio.css" />
</head>
<body>
<script>window.__BASE_PATH__='../../';</script>
<header class="header"><div class="container"><a class="brand" href="./"><img src="${base}assets/logo-small.png" alt="Online Converter" class="brand-logo"/></a></div></header>
<main>
<div class="container" style="padding:20px 0">
  <nav class="tool-crumb" aria-label="Breadcrumb"><a href="./">Home</a> <i class="fa-solid fa-chevron-right"></i> <span>${esc(t.title)}</span></nav>
</div>
<div id="app"><div class="container" style="padding:28px 0"><h1>${esc(t.title)}</h1><p style="max-width:760px;color:var(--muted)">${esc(t.metaDescription)}</p></div></div>
<div class="ad-slot" aria-label="Advertisement" style="min-height:90px;margin:24px auto;max-width:880px"></div>
<section class="seo-block container" style="padding:40px 20px;max-width:880px">
  <p class="seo-lead">${esc(t.longDesc)}</p>
  <p>Before you begin, gather the files you want to work with and keep an untouched copy of the originals. There is no sign-up and no waiting room: the tool opens instantly and runs on your device. Very large files depend on your computer's available memory, so close unused tabs if a document is unusually big.</p>
  <h2>How to Use ${esc(t.title)}</h2>
  <ol>${t.howToSteps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>
  <h2>Key Features &amp; Privacy Guarantee</h2>
  <ul>${t.features.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
  <h2>Why Use ${esc(t.title)}?</h2>
  <p>${esc((GUIDE[t.category]||GUIDE['Image Tools']).why)}</p>
  <h2>Common Use Cases</h2>
  <ul>${(GUIDE[t.category]||GUIDE['Image Tools']).uses.map(u=>`<li>${esc(u)}</li>`).join('')}</ul>
  <h2>Tips &amp; Best Practices</h2>
  <ul>${(t.tips||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
  <p>${esc((GUIDE[t.category]||GUIDE['Image Tools']).tip)}</p>
  <h2>Privacy &amp; Security</h2>
  <p>${esc(privacyNote(t))}</p>
  <h2>Frequently Asked Questions</h2>
  ${t.faqs.map(f=>`<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n  ')}
  <h2>Need More Help?</h2>
  <p>Every tool page includes a "Report a problem" button. If a file does not behave as expected, tell us the tool name, your browser and a short description — please do not send the actual document. You can also browse the related tools below; many workflows combine two or three tools, for example converting a file and then compressing the result before sharing.</p>
  <h2>Related Tools</h2>
  <div class="related-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">
    ${related.map(r=>`<a href="tools/${r.slug}/" class="card" style="padding:10px">${esc(r.title)}</a>`).join('')}
  </div>
</section>
</main>
<script>window.__INITIAL_TOOL__='${t.id}';</script>
<script src="${base}js/i18n.js" defer></script>
<script src="${base}js/app.js" defer></script>
<script src="${base}js/image-tools.js" defer></script>
<script src="${base}js/image-utils.js" defer></script>
<footer class="footer"><div class="container"><div class="footer-copy">© 2026 Online Converter · Developed by <a href="https://filofa.com" target="_blank" rel="noopener">Filofa Technology</a> · <a href="${base}about/">About</a> · <a href="${base}contact/">Contact</a> · <a href="${base}privacy-policy/">Privacy</a> · <a href="${base}terms/">Terms</a></div></div></footer>
</body>
</html>`;
}

function toolsIndexPage(){
  const base='';
  const url='https://codexvisual.github.io/online-converter/tools/';
  const cats=[...new Set(data.map(t=>t.category))];
  const secs=cats.map(c=>{
    const items=data.filter(t=>t.category===c);
    return `<section style="margin:0 0 30px">
  <h2 style="font-size:17px;margin:0 0 12px">${esc(c)} <span style="font-weight:400;color:var(--muted);font-size:13px">(${items.length})</span></h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">
    ${items.map(t=>`<a class="card" style="padding:10px 12px;font-size:14px" href="${t.slug}/">${esc(t.title)}</a>`).join('\n    ')}
  </div>
</section>`;
  }).join('\n');
  const jsonld=[{"@context":"https://schema.org","@type":"CollectionPage","name":"All Tools","url":url,"description":"Browse all 66 free PDF and image tools on Online Converter.","isPartOf":{"@type":"WebSite","name":"Online Converter","url":"https://codexvisual.github.io/online-converter/"}},{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://codexvisual.github.io/online-converter/"},{"@type":"ListItem","position":2,"name":"All Tools","item":url}]}];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<base href="../" />
<script>window.__BASE_PATH__=document.baseURI.replace(location.origin,'');</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>All Tools — 66 Free PDF &amp; Image Tools | Online Converter</title>
<meta name="description" content="Browse all 66 free Online Converter tools: merge, split, compress and convert PDFs, edit images, remove backgrounds and more. Everything runs in your browser." />
<link rel="canonical" href="${url}" />
<meta property="og:title" content="All Tools — Online Converter" />
<meta property="og:description" content="Browse all 66 free PDF and image tools. No uploads, no sign-up, no watermarks." />
<meta property="og:url" content="${url}" />
<meta property="og:type" content="website" />
<meta property="og:image" content="https://codexvisual.github.io/online-converter/assets/icon-512.png" />
<meta name="twitter:card" content="summary_large_image" />
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
<link rel="icon" type="image/png" href="${base}assets/favicon.png" />
<link rel="stylesheet" href="${base}assets/fontawesome/css/all.min.css" />
<link rel="stylesheet" href="${base}css/style.css" />
</head>
<body>
<header class="header"><div class="container"><a class="brand" href="./"><img src="${base}assets/logo-small.png" alt="Online Converter" class="brand-logo"/></a></div></header>
<main id="app" class="container" style="padding:28px 20px;max-width:1100px">
<h1>All Tools</h1>
<p class="seo-lead">66 free tools for PDFs and images. Every tool runs entirely in your browser — your files are never uploaded, stored or shared.</p>
${secs}
<p><a href="./">← Back to home</a></p>
</main>
<footer class="footer"><div class="container"><div class="footer-copy">© 2026 Online Converter · Developed by <a href="https://filofa.com" target="_blank" rel="noopener">Filofa Technology</a> · <a href="${base}about/">About</a> · <a href="${base}contact/">Contact</a> · <a href="${base}privacy-policy/">Privacy</a> · <a href="${base}terms/">Terms</a></div></div></footer>
</body>
</html>`;
}

// Generate tool pages
for(const t of data){
  const dir=path.join(OUT,'tools',t.slug); fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'), toolPage(t));
}
// Hub page listing every tool (real static URL, strong internal linking for SEO)
fs.writeFileSync(path.join(OUT,'tools','index.html'), toolsIndexPage());
// Studio page: derived from index.html so header/footer stay in sync, but with
// a "../" base so assets resolve correctly when served at /studio/.
const studioDir=path.join(OUT,'studio'); fs.mkdirSync(studioDir,{recursive:true});
const studioUrl='https://codexvisual.github.io/online-converter/studio/';
const homeHtml=fs.readFileSync(path.join(OUT,'index.html'),'utf8');
let st=homeHtml
  .replace(/((?:href|src)=")((?:assets|css|js)\/)/g,'$1../$2')
  .replace(/(href=")(about|contact|privacy-policy|terms|security|cookies|blog|press)\//g,'$1../$2/')
  .replace(/(href=")manifest\.json"/g,'$1../manifest.json"')
  .replace('<title>Online Converter - Every tool you need to work with PDFs</title>','<title>Image Studio — Free Online Photo Editor | Online Converter</title>')
  .replace('<meta name="description" content="Online Converter: merge, split, compress, convert, edit and secure PDF files in your browser. 100% free, private and offline-capable." />','<meta name="description" content="Edit, crop, resize, retouch and export images in your browser with Image Studio — a free, non-destructive photo editor. No uploads, no sign-up." />')
  .replace('<meta property="og:title" content="Online Converter — Free PDF Toolkit" />','<meta property="og:title" content="Image Studio — Free Online Photo Editor" />')
  .replace('<meta property="og:description" content="Every tool you need to work with PDFs and images in one place. 66 free tools, all processed in your browser." />','<meta property="og:description" content="A free, non-destructive browser photo editor with crop, resize, retouch, filters and export." />')
  .replace('<meta property="og:url" content="https://codexvisual.github.io/online-converter/" />','<meta property="og:url" content="'+studioUrl+'" />')
  .replace('<link rel="canonical" href="https://codexvisual.github.io/online-converter/" />','<link rel="canonical" href="'+studioUrl+'" />')
  .replace('"url":"https://codexvisual.github.io/online-converter/"','"url":"'+studioUrl+'"')
  .replace(/<main id="app" tabindex="-1">[\s\S]*?<\/main>/, '<main id="app" tabindex="-1"><div class="container" style="padding:32px 20px"><h1>Image Studio</h1><p style="max-width:760px;color:var(--muted)">Free, non-destructive photo editor that runs entirely in your browser. Crop, resize, retouch, filter and export without uploading anything.</p></div></main>')
  .replace('<base href="./" />','<base href="../" />')
  .replace('</body>','<script>window.__INITIAL_STUDIO__=true;</script>\n</body>');
fs.writeFileSync(path.join(studioDir,'index.html'), st);
// sitemap
const base='https://codexvisual.github.io/online-converter';
const lastmod=new Date().toISOString().slice(0,10);
let sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
sm+=`<url><loc>${base}/</loc><lastmod>${lastmod}</lastmod><priority>1.0</priority></url>\n`;
sm+=`<url><loc>${base}/studio/</loc><lastmod>${lastmod}</lastmod><priority>0.9</priority></url>\n`;
sm+=`<url><loc>${base}/tools/</loc><lastmod>${lastmod}</lastmod><priority>0.9</priority></url>\n`;
for(const t of data) sm+=`<url><loc>${base}/tools/${t.slug}/</loc><lastmod>${lastmod}</lastmod><priority>0.7</priority></url>\n`;
for(const p of ['about','contact','privacy-policy','terms','security','cookies','blog','press']) sm+=`<url><loc>${base}/${p}/</loc><lastmod>${lastmod}</lastmod><priority>0.5</priority></url>\n`;
sm+='</urlset>\n';
fs.writeFileSync(path.join(OUT,'sitemap.xml'), sm);
console.log('built', data.length, 'tool pages at root');
