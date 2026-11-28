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
  const jsonld=[{"@context":"https://schema.org","@type":"SoftwareApplication","name":t.title,"applicationCategory":"UtilitiesApplication","operatingSystem":"Any","description":t.metaDescription,"url":url,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"author":{"@type":"Organization","name":"Filofa Technology"}},{"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqJson}];
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
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(t.title)}" />
<meta name="twitter:description" content="${esc(t.metaDescription)}" />
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
<div id="app"></div>
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

// Generate tool pages
for(const t of data){
  const dir=path.join(OUT,'tools',t.slug); fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'index.html'), toolPage(t));
}
// legal pages already exist at root; ensure studio dir exists (root index handles studio)
const studioDir=path.join(OUT,'studio'); if(!fs.existsSync(studioDir)) fs.mkdirSync(studioDir,{recursive:true});
if(!fs.existsSync(path.join(studioDir,'index.html'))) fs.copyFileSync(path.join(OUT,'index.html'),path.join(studioDir,'index.html'));
// sitemap
const base='https://codexvisual.github.io/online-converter';
let sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
sm+=`<url><loc>${base}/</loc><priority>1.0</priority></url>\n`;
sm+=`<url><loc>${base}/studio/</loc><priority>0.9</priority></url>\n`;
for(const t of data) sm+=`<url><loc>${base}/tools/${t.slug}/</loc><priority>0.7</priority></url>\n`;
for(const p of ['about','contact','privacy-policy','terms','cookies','blog','press']) sm+=`<url><loc>${base}/${p}/</loc><priority>0.5</priority></url>\n`;
sm+='</urlset>\n';
fs.writeFileSync(path.join(OUT,'sitemap.xml'), sm);
console.log('built', data.length, 'tool pages at root');
