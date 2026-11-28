const fs=require('fs');
const path=require('path');
const ROOT='C:/Users/Rahat/Desktop/Online Converter';
const OUT=ROOT;
const data=JSON.parse(fs.readFileSync('C:/Users/Rahat/AppData/Local/Temp/opencode/toolsConfig.json','utf8'));

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function toolPage(t){
  const base='../../';
  const url=`https://codexvisual.github.io/online-converter/tools/${t.slug}/`;
  const related=data.filter(x=>x.category===t.category&&x.id!==t.id).slice(0,6);
  const faqJson=t.faqs.map(f=>({ "@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}));
  const jsonld=[{"@context":"https://schema.org","@type":"SoftwareApplication","name":t.title,"applicationCategory":"UtilitiesApplication","operatingSystem":"Any","description":t.metaDescription,"url":url,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"author":{"@type":"Organization","name":"Filofa Technology"}},{"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqJson},{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://codexvisual.github.io/online-converter/"},{"@type":"ListItem","position":2,"name":"All Tools","item":"https://codexvisual.github.io/online-converter/tools/"},{"@type":"ListItem","position":3,"name":t.title,"item":url}]}];
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
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
<header class="header"><div class="container"><a class="brand" href="${base}"><img src="${base}assets/logo-small.png" alt="Online Converter" class="brand-logo"/></a></div></header>
<main>
<div class="container" style="padding:20px 0">
  <nav class="tool-crumb" aria-label="Breadcrumb"><a href="${base}">Home</a> <i class="fa-solid fa-chevron-right"></i> <span>${esc(t.title)}</span></nav>
</div>
<div id="app"><div class="container" style="padding:28px 0"><h1>${esc(t.title)}</h1><p style="max-width:760px;color:var(--muted)">${esc(t.metaDescription)}</p></div></div>
<div class="ad-slot" aria-label="Advertisement" style="min-height:90px;margin:24px auto;max-width:880px"></div>
<section class="seo-block container" style="padding:40px 20px;max-width:880px">
  <p class="seo-lead">${esc(t.longDesc)}</p>
  <h2>How to Use ${esc(t.title)}</h2>
  <ol>${t.howToSteps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>
  <h2>Key Features &amp; Privacy Guarantee</h2>
  <ul>${t.features.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
  <h2>Tips &amp; Best Practices</h2>
  <ul>${(t.tips||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
  <h2>Frequently Asked Questions</h2>
  ${t.faqs.map(f=>`<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('\n  ')}
  <h2>Related Tools</h2>
  <div class="related-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">
    ${related.map(r=>`<a href="../${r.slug}/" class="card" style="padding:10px">${esc(r.title)}</a>`).join('')}
  </div>
</section>
</main>
<script>window.__INITIAL_TOOL__='${t.id}'; location.hash='#/tool/${t.id}';</script>
<script src="${base}js/i18n.js" defer></script>
<script src="${base}js/app.js" defer></script>
<script src="${base}js/image-tools.js" defer></script>
<script src="${base}js/image-utils.js" defer></script>
<footer class="footer"><div class="container"><div class="footer-copy">© 2026 Online Converter · Developed by <a href="https://filofa.com" target="_blank" rel="noopener">Filofa Technology</a> · <a href="${base}about/">About</a> · <a href="${base}contact/">Contact</a> · <a href="${base}privacy-policy/">Privacy</a> · <a href="${base}terms/">Terms</a></div></div></footer>
</body>
</html>`;
}

function toolsIndexPage(){
  const base='../';
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
<header class="header"><div class="container"><a class="brand" href="${base}"><img src="${base}assets/logo-small.png" alt="Online Converter" class="brand-logo"/></a></div></header>
<main id="app" class="container" style="padding:28px 20px;max-width:1100px">
<h1>All Tools</h1>
<p class="seo-lead">66 free tools for PDFs and images. Every tool runs entirely in your browser — your files are never uploaded, stored or shared.</p>
${secs}
<p><a href="${base}">← Back to home</a></p>
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
  .replace("<script>window.__BASE_PATH__='';</script>","<script>window.__BASE_PATH__='../';</script>")
  .replace('<title>Online Converter - Every tool you need to work with PDFs</title>','<title>Image Studio — Free Online Photo Editor | Online Converter</title>')
  .replace('<meta name="description" content="Online Converter: merge, split, compress, convert, edit and secure PDF files in your browser. 100% free, private and offline-capable." />','<meta name="description" content="Edit, crop, resize, retouch and export images in your browser with Image Studio — a free, non-destructive photo editor. No uploads, no sign-up." />')
  .replace('<meta property="og:title" content="Online Converter — Free PDF Toolkit" />','<meta property="og:title" content="Image Studio — Free Online Photo Editor" />')
  .replace('<meta property="og:description" content="Every tool you need to work with PDFs and images in one place. 66 free tools, all processed in your browser." />','<meta property="og:description" content="A free, non-destructive browser photo editor with crop, resize, retouch, filters and export." />')
  .replace('<meta property="og:url" content="https://codexvisual.github.io/online-converter/" />','<meta property="og:url" content="'+studioUrl+'" />')
  .replace('<link rel="canonical" href="https://codexvisual.github.io/online-converter/" />','<link rel="canonical" href="'+studioUrl+'" />')
  .replace('"url":"https://codexvisual.github.io/online-converter/"','"url":"'+studioUrl+'"')
  .replace(/<main id="app" tabindex="-1">[\s\S]*?<\/main>/, '<main id="app" tabindex="-1"><div class="container" style="padding:32px 20px"><h1>Image Studio</h1><p style="max-width:760px;color:var(--muted)">Free, non-destructive photo editor that runs entirely in your browser. Crop, resize, retouch, filter and export without uploading anything.</p></div></main>')
  .replace('</body>','<script>window.__INITIAL_STUDIO__=true;if(!location.hash)location.hash="#/studio";</script>\n</body>');
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
