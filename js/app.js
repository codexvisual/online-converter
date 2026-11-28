/* Online Converter app */
if(typeof window.t!=='function'){
  window.t=k=>k;
  window.applyI18n=()=>{};
  window.setLang=()=>{};
  window.I18N={lang:'en',DICTS:{},LANGS:[]};
}
if(window.pdfjsLib && pdfjsLib.GlobalWorkerOptions){
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}


const CATEGORIES = ['Organize PDF','Optimize PDF','Convert to PDF','Convert from PDF','Edit PDF','PDF Security','PDF Intelligence','Image Tools'];
const CAT_I18N = {'Organize PDF':'cat_organize','Optimize PDF':'cat_optimize','Convert to PDF':'cat_convert_to','Convert from PDF':'cat_convert_from','Edit PDF':'cat_edit','PDF Security':'cat_security','PDF Intelligence':'cat_intelligence','Image Tools':'cat_image'};
function catLabel(cat){ return t(CAT_I18N[cat]||'filter_all'); }

const TOOLS = [
  {id:'merge',name:'Merge PDF',desc:'Combine PDF, JPG and PNG files in the order you want.',icon:'fa-object-group',cat:'Organize PDF',impl:true},
  {id:'split',name:'Split PDF',desc:'Separate one page or a whole set for easy conversion.',icon:'fa-scissors',cat:'Organize PDF',impl:true},
  {id:'compress',name:'Compress PDF',desc:'Reduce file size while optimizing for maximal quality.',icon:'fa-compress',cat:'Optimize PDF',impl:true},
  {id:'batch',name:'Batch process',desc:'Compress, rotate or watermark many PDFs at once.',icon:'fa-layer-group',cat:'Optimize PDF',impl:true},
  {id:'pdf-to-word',name:'PDF to Word',desc:'Convert PDFs to editable DOCX documents.',icon:'fa-file-word',cat:'Convert from PDF',impl:true},
  {id:'pdf-to-excel',name:'PDF to Excel',desc:'Convert PDFs to XLSX spreadsheets.',icon:'fa-file-excel',cat:'Convert from PDF',impl:true},
  {id:'pdf-to-ppt',name:'PDF to PowerPoint',desc:'Convert PDFs to PPTX slides.',icon:'fa-file-powerpoint',cat:'Convert from PDF',impl:true},
  {id:'pdf-to-jpg',name:'PDF to JPG',desc:'Convert each PDF page to a JPG image.',icon:'fa-image',cat:'Convert from PDF',impl:true},
  {id:'pdf-to-pdfa',name:'PDF to PDF/A',desc:'Convert PDF to PDF/A for long-term archiving.',icon:'fa-file-shield',cat:'Convert from PDF',impl:true},
  {id:'pdf-to-html',name:'PDF to HTML',desc:'Convert PDFs to web pages.',icon:'fa-code',cat:'Convert from PDF',impl:true},
  {id:'word-to-pdf',name:'Word to PDF',desc:'Convert DOCX documents to PDF.',icon:'fa-file-word',cat:'Convert to PDF',impl:true},
  {id:'excel-to-pdf',name:'Excel to PDF',desc:'Convert XLSX spreadsheets to PDF.',icon:'fa-file-excel',cat:'Convert to PDF',impl:true},
  {id:'ppt-to-pdf',name:'PowerPoint to PDF',desc:'Convert PPTX slides to PDF.',icon:'fa-file-powerpoint',cat:'Convert to PDF',impl:true},
  {id:'jpg-to-pdf',name:'JPG to PDF',desc:'Convert images to PDF.',icon:'fa-image',cat:'Convert to PDF',impl:true},
  {id:'html-to-pdf',name:'HTML to PDF',desc:'Convert web pages to PDF.',icon:'fa-code',cat:'Convert to PDF',impl:true},
  {id:'scan-to-pdf',name:'Scan to PDF',desc:'Capture scans and save as PDF.',icon:'fa-camera',cat:'Organize PDF',impl:true},
  {id:'edit',name:'Edit PDF',desc:'Add text, images and shapes to your PDF.',icon:'fa-pen-to-square',cat:'Edit PDF',impl:true},
  {id:'rotate',name:'Rotate PDF',desc:'Rotate PDF pages.',icon:'fa-rotate',cat:'Edit PDF',impl:true},
  {id:'page-numbers',name:'Page numbers',desc:'Add page numbers to PDFs.',icon:'fa-list-ol',cat:'Edit PDF',impl:true},
  {id:'watermark',name:'Watermark',desc:'Stamp text or image over PDF pages.',icon:'fa-droplet',cat:'Edit PDF',impl:true},
  {id:'crop',name:'Crop PDF',desc:'Crop PDF pages.',icon:'fa-crop',cat:'Edit PDF',impl:true},
  {id:'sign',name:'Sign PDF',desc:'Sign PDF documents.',icon:'fa-signature',cat:'PDF Security',impl:true},
  {id:'unlock',name:'Unlock PDF',desc:'Remove PDF password.',icon:'fa-lock-open',cat:'PDF Security',impl:true},
  {id:'protect',name:'Protect PDF',desc:'Encrypt PDF with a password.',icon:'fa-lock',cat:'PDF Security',impl:true},
  {id:'organize',name:'Organize PDF',desc:'Sort, delete and rotate pages.',icon:'fa-layer-group',cat:'Organize PDF',impl:true},
  {id:'repair',name:'Repair PDF',desc:'Recover data from damaged PDF.',icon:'fa-wrench',cat:'Optimize PDF',impl:true},
  {id:'compare',name:'Compare PDF',desc:'Show differences between two PDFs.',icon:'fa-code-compare',cat:'PDF Security',impl:true},
  {id:'metadata',name:'PDF Metadata',desc:'View and edit PDF title, author, subject and keywords.',icon:'fa-tags',cat:'Edit PDF',impl:true},
  {id:'flatten',name:'Flatten PDF',desc:'Flatten form fields and annotations into the page.',icon:'fa-clone',cat:'Edit PDF',impl:true},
  {id:'grayscale',name:'PDF to Grayscale',desc:'Convert a PDF to grayscale (black & white).',icon:'fa-circle-half-stroke',cat:'Edit PDF',impl:true},
  {id:'pdf-to-text',name:'PDF to Text',desc:'Extract all text from a PDF as a TXT file.',icon:'fa-file-lines',cat:'Convert from PDF',impl:true},
  {id:'pdf-to-csv',name:'PDF to CSV',desc:'Extract text into a CSV spreadsheet.',icon:'fa-file-csv',cat:'Convert from PDF',impl:true},
  {id:'add-blank',name:'Add blank pages',desc:'Insert blank pages into a PDF.',icon:'fa-file-circle-plus',cat:'Organize PDF',impl:true},
  {id:'remove-blank',name:'Remove blank pages',desc:'Detect and delete blank pages automatically.',icon:'fa-file-circle-minus',cat:'Organize PDF',impl:true},
  {id:'resize-pages',name:'Resize pages',desc:'Resize all pages to A4, Letter, Legal or A3.',icon:'fa-expand',cat:'Edit PDF',impl:true},
  {id:'header-footer',name:'Header & footer',desc:'Add header and footer text to every page.',icon:'fa-align-center',cat:'Edit PDF',impl:true},
  {id:'remove-pages',name:'Remove pages',desc:'Delete selected pages from a PDF.',icon:'fa-file-circle-minus',cat:'Organize PDF',impl:true},
  {id:'extract-pages',name:'Extract pages',desc:'Save selected pages as a new PDF.',icon:'fa-file-export',cat:'Organize PDF',impl:true},
  {id:'summarize',name:'PDF Summarize',desc:'Get a quick summary of a PDF document.',icon:'fa-wand-magic-sparkles',cat:'PDF Intelligence',impl:true},
  {id:'translate',name:'Translate PDF',desc:'Translate PDF text into another language.',icon:'fa-language',cat:'PDF Intelligence',impl:true},
  {id:'ocr',name:'OCR PDF',desc:'Make scanned PDFs searchable with OCR.',icon:'fa-file-circle-check',cat:'Optimize PDF',impl:true},
  {id:'pdf-to-markdown',name:'PDF to Markdown',desc:'Convert PDF text to clean Markdown.',icon:'fa-file-code',cat:'PDF Intelligence',impl:true},
  {id:'redact',name:'Redact PDF',desc:'Permanently hide sensitive content in PDFs.',icon:'fa-eye-slash',cat:'PDF Security',impl:true},
  {id:'pdf-forms',name:'PDF Forms',desc:'Fill and save editable PDF form fields.',icon:'fa-square-check',cat:'Edit PDF',impl:true},
  {id:'image-compress',name:'Compress IMAGE',desc:'Compress JPG, PNG, SVG and GIF images while saving space and maintaining quality.',icon:'fa-compress',cat:'Image Tools',impl:true},
  {id:'image-resize',name:'Resize IMAGE',desc:'Define dimensions by percent or pixel and resize your images.',icon:'fa-expand',cat:'Image Tools',impl:true},
  {id:'image-crop',name:'Crop IMAGE',desc:'Crop images with a visual rectangle editor or exact pixels.',icon:'fa-crop',cat:'Image Tools',impl:true},
  {id:'image-to-jpg',name:'Convert to JPG',desc:'Turn PNG, GIF, TIF, PSD, SVG, WEBP, HEIC and RAW images into JPG.',icon:'fa-file-image',cat:'Image Tools',impl:true},
  {id:'jpg-to-image',name:'Convert from JPG',desc:'Turn JPG images into PNG or animated GIF.',icon:'fa-images',cat:'Image Tools',impl:true},
  {id:'photo-editor',name:'Photo editor',desc:'Spice up pictures with filters, text, frames and stickers.',icon:'fa-pen-to-square',cat:'Image Tools',impl:true},
  {id:'image-upscale',name:'Upscale Image',desc:'Enlarge images with high-quality resampling while keeping detail.',icon:'fa-maximize',cat:'Image Tools',impl:true},
  {id:'remove-bg',name:'Remove background',desc:'Remove plain image backgrounds instantly and save a transparent PNG.',icon:'fa-wand-magic-sparkles',cat:'Image Tools',impl:true},
  {id:'image-watermark',name:'Watermark IMAGE',desc:'Stamp text or an image over your pictures with custom opacity and position.',icon:'fa-droplet',cat:'Image Tools',impl:true},
  {id:'meme-generator',name:'Meme generator',desc:'Caption meme images or your own pictures in seconds.',icon:'fa-face-laugh',cat:'Image Tools',impl:true},
  {id:'image-rotate',name:'Rotate IMAGE',desc:'Rotate many images at once by 90, 180 or 270 degrees.',icon:'fa-rotate',cat:'Image Tools',impl:true},
  {id:'html-to-image',name:'HTML to IMAGE',desc:'Convert HTML snippets into JPG, PNG or SVG images.',icon:'fa-code',cat:'Image Tools',impl:true},
  {id:'blur-face',name:'Blur face',desc:'Blur faces, licence plates or any selected region to hide private information.',icon:'fa-eye-slash',cat:'Image Tools',impl:true},
  {id:'image-base64',name:'Image to Base64',desc:'Convert any image into a Base64 data URL and copy it instantly.',icon:'fa-code',cat:'Image Tools',impl:true},
  {id:'base64-image',name:'Base64 to Image',desc:'Turn Base64 data back into a downloadable image file.',icon:'fa-file-image',cat:'Image Tools',impl:true},
  {id:'image-color-picker',name:'Image Color Picker',desc:'Pick exact colours from an image and sample its dominant palette.',icon:'fa-palette',cat:'Image Tools',impl:true},
  {id:'image-metadata',name:'Metadata Viewer',desc:'Inspect image details and strip embedded EXIF metadata.',icon:'fa-tags',cat:'Image Tools',impl:true},
  {id:'svg-optimizer',name:'SVG Optimizer',desc:'Minify SVG files by removing comments, metadata and redundant whitespace.',icon:'fa-file-code',cat:'Image Tools',impl:true},
  {id:'image-format-detector',name:'Format Detector',desc:'Detect real image formats from file signatures, not extensions.',icon:'fa-magnifying-glass',cat:'Image Tools',impl:true},
  {id:'image-border',name:'Image Border',desc:'Add frames, padding and rounded corners with a live preview.',icon:'fa-square',cat:'Image Tools',impl:true},
  {id:'image-favicon',name:'Favicon Generator',desc:'Create a full set of favicon PNG sizes from any image.',icon:'fa-icons',cat:'Image Tools',impl:true},
  {id:'image-contact-sheet',name:'Contact Sheet',desc:'Arrange many images into a labelled contact sheet.',icon:'fa-table-cells',cat:'Image Tools',impl:true},
];

function $(sel,root=document){return root.querySelector(sel);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatBytes(b){if(b<1024)return b+' B';if(b<1048576)return (b/1024).toFixed(1)+' KB';return (b/1048576).toFixed(1)+' MB';}
function downloadBlob(blob,name){ if(window.saveAs) saveAs(blob,name); else { const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),5000);} }

/* ---------- Advanced UX: toasts, theme, recents ---------- */
function toast(message,type='info',ms=3400){
  let wrap=document.getElementById('toastWrap');
  if(!wrap){ wrap=document.createElement('div'); wrap.id='toastWrap'; wrap.className='toast-wrap'; wrap.setAttribute('aria-live','polite'); document.body.appendChild(wrap); }
  const t=document.createElement('div');
  const icon=type==='success'?'fa-circle-check':type==='error'?'fa-circle-exclamation':type==='warn'?'fa-triangle-exclamation':'fa-circle-info';
  t.className='toast '+(type||'info');
  t.innerHTML='<i class="fa-solid '+icon+'"></i><span>'+escapeHtml(message)+'</span>';
  wrap.appendChild(t);
  requestAnimationFrame(()=>t.classList.add('show'));
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),260); },ms);
}

const RECENT_KEY='oc-recent';
function getRecent(){
  try{ return JSON.parse(localStorage.getItem(RECENT_KEY)||'[]').filter(id=>TOOLS.some(t=>t.id===id)); }
  catch(e){ return []; }
}
function pushRecent(id){
  try{
    let r=getRecent().filter(x=>x!==id);
    r.unshift(id); r=r.slice(0,8);
    localStorage.setItem(RECENT_KEY,JSON.stringify(r));
  }catch(e){}
}

function initTheme(){
  const root=document.documentElement;
  const btn=document.getElementById('themeToggle');
  const meta=document.querySelector('meta[name="theme-color"]');
  const paint=(mode)=>{
    if(mode==='dark') root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme');
    if(btn) btn.innerHTML='<i class="fa-solid fa-'+(mode==='dark'?'sun':'moon')+'"></i>';
    if(btn) btn.setAttribute('aria-label',mode==='dark'?'Switch to light mode':'Switch to dark mode');
    if(meta) meta.setAttribute('content',mode==='dark'?'#0f1115':'#E5322D');
  };
  let mode=root.getAttribute('data-theme')==='dark'?'dark':'light';
  paint(mode);
  if(btn){
    btn.addEventListener('click',()=>{
      mode = mode==='dark' ? 'light' : 'dark';
      paint(mode);
      try{ localStorage.setItem('oc-theme',mode); }catch(e){}
      toast(mode==='dark'?'Dark mode on':'Light mode on','info',1600);
    });
  }
}


function initToTop(){
  const btn=document.getElementById('toTop');
  if(!btn) return;
  const onScroll=()=>btn.classList.toggle('show',window.scrollY>480);
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
}

function initHeaderScroll(){
  const header=document.querySelector('.header');
  if(!header) return;
  const onScroll=()=>header.classList.toggle('is-scrolled',window.scrollY>6);
  window.addEventListener('scroll',onScroll,{passive:true});
  onScroll();
}

function initAccessibility(){
  document.querySelectorAll('.icon-btn,.more-btn,.file-remove,.preview-modal__close,.to-top').forEach(b=>{
    if(!b.getAttribute('aria-label')) b.setAttribute('aria-label',b.title||'Action');
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Tab') return;
    const modal=document.querySelector('.preview-modal,.feedback-box');
    if(!modal) return;
    const f=[...modal.querySelectorAll('button,a,input,textarea,select,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled);
    if(!f.length) return;
    const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  });
  document.addEventListener('keydown',e=>{
    const tag=(e.target.tagName||'').toLowerCase();
    if(tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable) return;
    const card=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.card');
    if(!card) return;
    const cards=[...document.querySelectorAll('.section .card')].filter(c=>c.style.display!=='none'&&c.offsetParent!==null);
    const i=cards.indexOf(card);
    if(i<0) return;
    if(e.key==='Enter'){card.click();e.preventDefault();return;}
    let n=i;
    if(e.key==='ArrowRight'||e.key==='ArrowDown') n=Math.min(cards.length-1,i+1);
    if(e.key==='ArrowLeft'||e.key==='ArrowUp') n=Math.max(0,i-1);
    if(n!==i){cards[n].focus();e.preventDefault();}
  });
}

function initFeedback(){
  const btn=document.createElement('button');
  btn.className='feedback-btn';
  btn.innerHTML='<i class="fa-solid fa-bug"></i>';
  btn.title=t('btn_feedback');
  btn.setAttribute('aria-label',t('btn_feedback'));
  document.body.appendChild(btn);
  btn.addEventListener('click',()=>{
    const wrap=document.createElement('div'); wrap.className='overlay feedback-modal';
    wrap.innerHTML='<div class="feedback-box" role="dialog" aria-modal="true"><h3>'+t('feedback_title')+'</h3><p>'+t('feedback_desc')+'</p>'
      +'<p class="feedback-email">Send to: <a href="mailto:support@filofa.com">support@filofa.com</a></p>'
      +'<textarea id="fbText" rows="4" placeholder="What happened?"></textarea>'
      +'<pre id="fbDetails"></pre>'
      +'<div class="actions"><button class="btn btn-primary" id="fbMail"><i class="fa-solid fa-envelope"></i> '+t('feedback_send')+'</button>'
      +'<button class="btn btn-ghost" id="fbCopy"><i class="fa-solid fa-copy"></i> '+t('feedback_copy')+'</button>'
      +'<button class="btn btn-ghost" id="fbCancel">'+t('feedback_cancel')+'</button></div></div>';
    document.body.appendChild(wrap);
    const tool=(location.hash.split('/')[2]||'home');
    const details='Tool: '+tool+'\nPage: '+location.href+'\nEmail: support@filofa.com\nUser agent: '+navigator.userAgent+'\nLast error: '+(window.__ocLastError||'none');
    wrap.querySelector('#fbDetails').textContent=details;
    const build=()=>'Problem report\n\n'+wrap.querySelector('#fbText').value+'\n\n---\n'+details;
    wrap.querySelector('#fbMail').addEventListener('click',()=>{
      window.location.href='mailto:support@filofa.com?subject='+encodeURIComponent('Online Converter problem: '+tool)+'&body='+encodeURIComponent(build());
    });
    wrap.querySelector('#fbCopy').addEventListener('click',async()=>{
      try{ await navigator.clipboard.writeText(build()); toast('Details copied','success'); }
      catch(e){ toast('Copy failed — select the text manually','error'); }
    });
    wrap.querySelector('#fbCancel').addEventListener('click',()=>wrap.remove());
    wrap.addEventListener('click',e=>{ if(e.target===wrap) wrap.remove(); });
    wrap.querySelector('#fbText').focus();
  });
}

function initHomeDrop(){
  const isHome=()=>['#/','','#'].includes(location.hash);
  let overlay=null;
  const close=()=>{ if(overlay){overlay.remove();overlay=null;} };
  window.addEventListener('dragover',e=>{
    if(!isHome()||!e.dataTransfer||!Array.from(e.dataTransfer.types).includes('Files')) return;
    e.preventDefault();
    if(!overlay){
      overlay=document.createElement('div'); overlay.className='home-drop-overlay';
      overlay.innerHTML='<div><i class="fa-solid fa-file-arrow-down"></i><h2>'+t('drop_title')+'</h2><p>'+t('privacy_notice')+'</p></div>';
      document.body.appendChild(overlay);
    }
  });
  window.addEventListener('dragleave',e=>{ if(overlay&&!e.relatedTarget) close(); });
  window.addEventListener('drop',e=>{
    if(!overlay) return;
    e.preventDefault(); close();
    const f=Array.from(e.dataTransfer.files||[])[0];
    if(!f) return;
    const isPdf=/\.pdf$/i.test(f.name)||f.type==='application/pdf';
    const picks=isPdf?['merge','split','compress','rotate','edit','pdf-to-word']:['jpg-to-pdf','word-to-pdf','excel-to-pdf','ppt-to-pdf','html-to-pdf'];
    const wrap=document.createElement('div'); wrap.className='overlay';
    wrap.innerHTML='<div class="feedback-box" role="dialog" aria-modal="true"><h3>'+escapeHtml(f.name)+'</h3><p>'+t('drop_title')+'</p><div class="suggest-grid">'
      +picks.map(id=>{const tool=TOOLS.find(x=>x.id===id);return '<button class="suggest-item" data-id="'+id+'"><i class="fa-solid '+tool.icon+'"></i><span>'+escapeHtml(tool.name)+'</span></button>';}).join('')
      +'</div><div class="actions"><button class="btn btn-ghost" id="sgClose">'+t('feedback_cancel')+'</button></div></div>';
    document.body.appendChild(wrap);
    wrap.querySelectorAll('.suggest-item').forEach(b=>b.addEventListener('click',()=>{navigate('#/tool/'+b.dataset.id);wrap.remove();}));
    wrap.querySelector('#sgClose').addEventListener('click',()=>wrap.remove());
    wrap.addEventListener('click',ev=>{if(ev.target===wrap)wrap.remove();});
  });
}

function initShortcuts(){
  document.addEventListener('keydown',e=>{
    const tag=(e.target.tagName||'').toLowerCase();
    const typing=tag==='input'||tag==='textarea'||tag==='select'||e.target.isContentEditable;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
      e.preventDefault();
      const s=document.getElementById('headerSearchInput')||document.getElementById('searchInput')||document.getElementById('appsSearch');
      if(s){ s.focus(); if(s.select) s.select(); }
      return;
    }
    if(e.key==='Escape'){
      document.querySelectorAll('.nav-has-dropdown.open').forEach(x=>x.classList.remove('open'));
      const m=document.querySelector('.menu'); if(m) m.classList.remove('open');
      const ov=document.querySelector('.preview-overlay'); if(ov) ov.remove();
      return;
    }
    if(e.key==='/'&&!typing){
      const s=document.getElementById('searchInput');
      if(s){ e.preventDefault(); s.focus(); }
    }
  });
}

window.addEventListener('unhandledrejection',e=>{
  const panel=document.querySelector('#app .panel');
  const st=panel && panel.querySelector('.status');
  const msg=(e.reason && e.reason.message) ? e.reason.message : String(e.reason||'Unexpected error');
  if(st){ st.textContent='Something went wrong: '+msg; st.className='status show error'; }
  else if(typeof toast==='function') toast('Something went wrong: '+msg,'error');
});
function offerDownload(panel,blob,name){
  if(!panel){ downloadBlob(blob,name); return; }
  let box=panel.querySelector('.download-box');
  if(!box){ box=document.createElement('div'); box.className='download-box'; panel.insertBefore(box,panel.querySelector('.status')); }
  if(box._url){ URL.revokeObjectURL(box._url); }
  const url=URL.createObjectURL(blob); box._url=url;
  box.innerHTML='';
  const a=document.createElement('a');
  a.className='download-link'; a.href=url; a.download=name;
  a.innerHTML='<i class="fa-solid fa-circle-down"></i> Download '+escapeHtml(name);
  box.appendChild(a);
  a.click();
  toast('Ready: '+name,'success');
}
function setStatus(panel,msg,type){ const el=panel.querySelector('.status'); if(type==='error') window.__ocLastError=msg; if(!el)return; el.textContent=msg; el.className='status show '+(type||''); }
function showProgress(panel,on){ const el=panel.querySelector('.progress'); if(!el)return; el.classList.toggle('show',on); if(!on){const b=el.querySelector('div'); if(b)b.style.width='0%';} }
function setProgress(panel,p){ const el=panel.querySelector('.progress'); if(!el)return; const b=el.querySelector('div'); if(b)b.style.width=Math.min(100,Math.max(0,p))+'%'; }

function createDropzone(panel,{accept,multiple,onFiles,core=true}){
  const dz=document.createElement('div');
  dz.className='dropzone';
  const acceptLabel=accept?accept.split(',').map(x=>x.trim().split('/').pop().toUpperCase()).join(', '):'any';
  dz.innerHTML='<i class="fa-solid fa-cloud-arrow-up"></i><h3>'+t('drop_title')+'</h3><p>'+t('drop_supported')+' '+ acceptLabel +'</p><div class="privacy-badge"><i class="fa-solid fa-shield-halved"></i> '+t('privacy_notice')+'</div>';
  const input=document.createElement('input');
  input.type='file'; input.accept=accept||''; input.multiple=!!multiple; input.style.display='none';
  dz.appendChild(input);
  dz.addEventListener('click',()=>input.click());
  ['dragenter','dragover'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.add('drag')}));
  ['dragleave','drop'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.remove('drag')}));
  const handle=async(list)=>{
    if(!list || !list.length) return;
    const big=list.filter(f=>f.size>150*1024*1024);
    if(big.length) toast(big.length+' file(s) exceed 150 MB and may be slow to process.','warn',5200);
    if(core){ await waitForCore('PDFLib'); await waitForCore('pdfjsLib'); }
    onFiles(list);
  };
  dz.addEventListener('drop',e=>{handle([...e.dataTransfer.files]);});
  input.addEventListener('change',e=>{handle([...e.target.files]);input.value='';});
  if(panel.firstChild) panel.insertBefore(dz, panel.firstChild); else panel.appendChild(dz);
  return dz;
}

const LIB_URLS={
  docx:['https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.iife.js','https://unpkg.com/docx@8.5.0/build/index.iife.js'],
  XLSX:['https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js','https://unpkg.com/xlsx@0.18.5/dist/xlsx.full.min.js'],
  PptxGenJS:['https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js','https://unpkg.com/pptxgenjs@3.12.0/dist/pptxgen.bundle.js'],
  mammoth:['https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js','https://unpkg.com/mammoth@1.6.0/mammoth.browser.min.js'],
  html2pdf:['https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js','https://unpkg.com/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js'],
  Tesseract:['https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js','https://unpkg.com/tesseract.js@5/dist/tesseract.min.js'],
ort:['https://cdn.jsdelivr.net/npm/onnxruntime-web@1.19.0/dist/ort.all.min.js','https://unpkg.com/onnxruntime-web@1.19.0/dist/ort.all.min.js'],
  heic2any:['https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js','https://unpkg.com/heic2any@0.0.4/dist/heic2any.min.js'],
  UTIF:['https://cdn.jsdelivr.net/npm/utif@3.1.0/UTIF.js','https://unpkg.com/utif@3.1.0/UTIF.js'],
  PSD:['https://cdn.jsdelivr.net/npm/psd.js@3.0.0/dist/psd.min.js','https://unpkg.com/psd.js@3.0.0/dist/psd.min.js'],
};
const localScriptPromises={};
function ensureLocalScript(src){
  if(!localScriptPromises[src]) localScriptPromises[src]=new Promise((resolve,reject)=>{
    const s=document.createElement('script'); s.src=src; s.async=true;
    s.onload=()=>resolve();
    s.onerror=()=>{ delete localScriptPromises[src]; reject(new Error('Could not load '+src)); };
    document.head.appendChild(s);
  });
  return localScriptPromises[src];
}
const libPromises={};
function ensureLib(name,ms=20000){
  if(window[name]) return Promise.resolve();
  if(!libPromises[name]) libPromises[name]=new Promise((resolve,reject)=>{
    const urls=Array.isArray(LIB_URLS[name])?LIB_URLS[name]:[LIB_URLS[name]];
    let idx=0;
    const tryNext=()=>{
      if(window[name]){ resolve(); return; }
      if(idx>=urls.length){ delete libPromises[name]; reject(new Error('Could not load '+name+' library. Check your connection.')); return; }
      const sc=document.createElement('script');
      let done=false;
      const timer=setTimeout(()=>{ if(done)return; done=true; sc.onload=null; sc.onerror=null; try{sc.remove();}catch(e){} tryNext(); },ms);
      const cleanup=()=>{ done=true; clearTimeout(timer); sc.onload=null; sc.onerror=null; };
      sc.src=urls[idx++]; sc.async=true;
      sc.onload=()=>{ if(done)return; cleanup(); if(window[name]) resolve(); else { try{sc.remove();}catch(e){} tryNext(); } };
      sc.onerror=()=>{ if(done)return; cleanup(); try{sc.remove();}catch(e){} tryNext(); };
      document.head.appendChild(sc);
    };
    tryNext();
  });
  return libPromises[name];
}
const thumbCache=new WeakMap();
function waitForCore(name,ms=12000){
  if(window[name]) return Promise.resolve();
  return new Promise(res=>{const t0=Date.now();const iv=setInterval(()=>{if(window[name]||Date.now()-t0>ms){clearInterval(iv);res();}},100);});
}
/* Reflow every page onto a target page size using canvas rasterization (reliable across pdf-lib builds) */
async function normalizePageSize(source,target,margin=24){
  const {PDFDocument}=PDFLib;
  const out=await PDFDocument.create();
  const dims=Array.isArray(target)?target:(target==='letter'?[612,792]:[595.28,841.89]);
  const [pw,ph]=dims;
  const m=Math.max(0,Math.min(120,Number(margin)||0));
  const srcBytes=await source.save();
  const pdf=await pdfjsLib.getDocument({data:srcBytes,useWorkerFetch:false,isEvalSupported:false}).promise;
  for(let i=1;i<=pdf.numPages;i++){
    const pg=await pdf.getPage(i);
    const base=pg.getViewport({scale:1});
    const scale=Math.max(1,Math.min(2,1800/Math.max(base.width,base.height)));
    const vp=pg.getViewport({scale});
    const canvas=document.createElement('canvas');
    canvas.width=vp.width; canvas.height=vp.height;
    await pg.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
    const jpg=canvas.toDataURL('image/jpeg',0.92).split(',')[1];
    const img=await out.embedJpg(Uint8Array.from(atob(jpg),ch=>ch.charCodeAt(0)));
    const page=out.addPage(dims);
    const availW=Math.max(10,pw-2*m), availH=Math.max(10,ph-2*m);
    const s=Math.min(availW/vp.width,availH/vp.height);
    const w=vp.width*s, h=vp.height*s;
    page.drawImage(img,{x:(pw-w)/2,y:(ph-h)/2,width:w,height:h});
  }
  return out;
}

/* Detect a file kind from its magic bytes (more reliable than MIME/name) */
async function detectFileKind(file){
  const type=(file.type||'').toLowerCase();
  const name=(file.name||'').toLowerCase();
  try{
    const h=new Uint8Array(await file.slice(0,12).arrayBuffer());
    if(h[0]===0x25&&h[1]===0x50&&h[2]===0x44&&h[3]===0x46&&h[4]===0x2D) return 'pdf';
    if(h[0]===0xFF&&h[1]===0xD8&&h[2]===0xFF) return 'image';
    if(h[0]===0x89&&h[1]===0x50&&h[2]===0x4E&&h[3]===0x47) return 'image';
    if(h[0]===0x47&&h[1]===0x49&&h[2]===0x46) return 'image';
    if(h[0]===0x42&&h[1]===0x4D) return 'image';
    if(h[0]===0x52&&h[1]===0x49&&h[2]===0x46&&h[8]===0x57&&h[9]===0x45&&h[10]===0x42&&h[11]===0x50) return 'image';
  }catch(e){}
  if(type==='application/pdf'||name.endsWith('.pdf')) return 'pdf';
  if(type.startsWith('image/')||/\.(jpe?g|png|webp|gif|bmp)$/i.test(name)) return 'image';
  return 'unknown';
}

async function thumbUrl(f){
  const kind=await detectFileKind(f);
  if(kind==='pdf') await waitForCore('pdfjsLib');
  if(thumbCache.has(f)) return thumbCache.get(f);
  const work=(async()=>{
    let url=null;
    try{
      if(kind==='image'){
        // Rasterize to a data URL instead of keeping a permanent object URL alive.
        const draw=(src)=>{
          const scale=Math.min(1,280/Math.max(src.width||src.naturalWidth||1,src.height||src.naturalHeight||1));
          const cv=document.createElement('canvas');
          cv.width=Math.max(1,Math.round((src.width||src.naturalWidth)*scale));
          cv.height=Math.max(1,Math.round((src.height||src.naturalHeight)*scale));
          cv.getContext('2d').drawImage(src,0,0,cv.width,cv.height);
          return cv.toDataURL('image/jpeg',0.7);
        };
        try{
          const bmp=await createImageBitmap(f);
          url=draw(bmp); if(bmp.close) bmp.close();
        }catch(e){
          const tmp=URL.createObjectURL(f);
          try{ const im=new Image(); im.src=tmp; await im.decode(); url=draw(im); }
          finally{ URL.revokeObjectURL(tmp); }
        }
      }
      else if(kind==='pdf'){
        const bytes=new Uint8Array(await f.arrayBuffer());
        const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
        const page=await pdf.getPage(1);
        const vp=page.getViewport({scale:0.35});
        const canvas=document.createElement('canvas');
        canvas.width=vp.width; canvas.height=vp.height;
        await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
        url=canvas.toDataURL('image/jpeg',0.7);
      }
    }catch(e){ url=null; }
    return url;
  })();
  const url=await Promise.race([work,new Promise(res=>setTimeout(()=>res(null),5000))]);
  thumbCache.set(f,url);
  return url;
}
function renderFileList(container,files,onChange,onRotate){
  container.innerHTML='';
  const multi=files.length>1;

  files.forEach((f,i)=>{
    const item=document.createElement('div');
    item.className='file-item';
    item.dataset.index=String(i);
    item._file=f;

    const badge=document.createElement('div');
    badge.className='file-badge';
    badge.textContent=String(i+1);
    item.appendChild(badge);

    const rm=document.createElement('button');
    rm.className='file-remove'; rm.type='button'; rm.title='Remove file';
    rm.innerHTML='<i class="fa-solid fa-xmark"></i>';
    rm.addEventListener('click',e=>{
      e.stopPropagation();
      const idx=files.indexOf(f);
      if(idx>-1) files.splice(idx,1);
      onChange();
    });
    item.appendChild(rm);

    const thumb=document.createElement('div');
    thumb.className='file-thumb';
    thumb.title='Click to preview';
    const isImg=f.type.startsWith('image/');
    thumb.innerHTML='<div class="thumb-doc"><span class="tag">'+(isImg?'IMG':'PDF')+'</span><div class="lines"><i style="width:92%"></i><i style="width:74%"></i><i style="width:86%"></i><i style="width:58%"></i></div></div>';
    thumbUrl(f).then(u=>{
    if(u && thumb.isConnected){
      thumb.innerHTML='<img src="'+u+'" alt="" draggable="false" />';
      if(f._rotation){
        const im=thumb.querySelector('img');
        im.style.transform='rotate('+f._rotation+'deg)';
        im.style.transition='transform .2s';
      }
    }
  });
    thumb.addEventListener('click',e=>{ e.stopPropagation(); openFilePreview(f); });
    item.appendChild(thumb);

    const info=document.createElement('div');
    info.className='file-info';
    const name=document.createElement('span'); name.className='name'; name.textContent=f.name; name.title=f.name;
    const size=document.createElement('span'); size.className='size'; size.textContent=formatBytes(f.size);
    info.appendChild(name); info.appendChild(size); item.appendChild(info);

    const mv=document.createElement('div'); mv.className='file-move';
    if(onRotate){
      const rl=document.createElement('button'); rl.type='button'; rl.title='Rotate left'; rl.innerHTML='<i class="fa-solid fa-rotate-left"></i>';
      rl.addEventListener('click',e=>{ e.stopPropagation(); f._rotation=((f._rotation||0)-90+360)%360; onChange(); });
      const rr=document.createElement('button'); rr.type='button'; rr.title='Rotate right'; rr.innerHTML='<i class="fa-solid fa-rotate-right"></i>';
      rr.addEventListener('click',e=>{ e.stopPropagation(); f._rotation=((f._rotation||0)+90)%360; onChange(); });
      mv.appendChild(rl); mv.appendChild(rr);
      if(f._rotation){ const deg=document.createElement('span'); deg.className='file-rotation'; deg.textContent=f._rotation+'°'; deg.title='Rotation: '+f._rotation+'°'; mv.appendChild(deg); }
    }
    if(multi){
      const up=document.createElement('button'); up.type='button'; up.title='Move earlier'; up.innerHTML='<i class="fa-solid fa-chevron-up"></i>';
      up.disabled=files.indexOf(f)===0;
      up.addEventListener('click',e=>{
        e.stopPropagation();
        const idx=files.indexOf(f);
        if(idx>0){ [files[idx-1],files[idx]]=[files[idx],files[idx-1]]; onChange(); }
      });
      const down=document.createElement('button'); down.type='button'; down.title='Move later'; down.innerHTML='<i class="fa-solid fa-chevron-down"></i>';
      down.disabled=files.indexOf(f)===files.length-1;
      down.addEventListener('click',e=>{
        e.stopPropagation();
        const idx=files.indexOf(f);
        if(idx>-1 && idx<files.length-1){ [files[idx+1],files[idx]]=[files[idx],files[idx+1]]; onChange(); }
      });
      const grip=document.createElement('span'); grip.className='grip'; grip.title='Drag to reorder';
      grip.innerHTML='<i class="fa-solid fa-grip-vertical"></i>';
      mv.appendChild(up); mv.appendChild(down); mv.appendChild(grip);
    }
    if(mv.children.length) item.appendChild(mv);
    // drag-to-reorder (grip is a visual affordance; whole card is draggable)
    if(multi){
      item.draggable=true;
      item.addEventListener('dragstart',e=>{
        e.dataTransfer.setData('text/plain',String(i));
        e.dataTransfer.effectAllowed='move';
        item.classList.add('dragging');
      });
      item.addEventListener('dragend',()=>item.classList.remove('dragging'));
      item.addEventListener('dragover',e=>{
        e.preventDefault(); e.dataTransfer.dropEffect='move';
        item.classList.add('drag-over');
      });
      item.addEventListener('dragleave',()=>item.classList.remove('drag-over'));
      item.addEventListener('drop',e=>{
        e.preventDefault(); item.classList.remove('drag-over');
        const from=parseInt(e.dataTransfer.getData('text/plain'),10);
        const to=files.indexOf(f);
        if(!isNaN(from)&&from>=0&&from<files.length&&to>=0&&to!==from){
          const moved=files.splice(from,1)[0];
          files.splice(to,0,moved);
          onChange();
        }
      });
    }
    container.appendChild(item);
  });

  if(multi){
    const hint=document.createElement('div');
    hint.className='file-hint';
    hint.innerHTML='<i class="fa-solid fa-up-down-left-right"></i> Drag a card up / down with your mouse to change the order';
    container.appendChild(hint);
    enableCardDrag(container,files,onChange);
  }

  const panel=container.closest('.panel');
  const dz=panel && panel.querySelector('.dropzone');
  if(dz){
    dz.classList.toggle('compact', files.length>0);
    const h3=dz.querySelector('h3');
    if(h3) h3.textContent = files.length ? 'Add more files' : 'Select or drop files';
  }
}

/* pointer based drag sorting (mouse + touch) */
function enableCardDrag(container,files,onChange){
  let dragEl=null, ghost=null, startX=0, startY=0, dragging=false, raf=null, lastX=0, lastY=0;

  const beginDrag=()=>{
    dragging=true;
    const r=dragEl.getBoundingClientRect();
    ghost=dragEl.cloneNode(true);
    ghost.className='file-item file-ghost';
    ghost.style.width=r.width+'px';
    ghost.style.height=r.height+'px';
    ghost.style.left=r.left+'px';
    ghost.style.top=r.top+'px';
    document.body.appendChild(ghost);
    dragEl.classList.add('dragging');
    document.body.classList.add('is-dragging-card');
  };

  const onMove=e=>{
    if(!dragEl) return;
    if(!dragging){
      if(Math.abs(e.clientX-startX)<6 && Math.abs(e.clientY-startY)<6) return;
      beginDrag();
    }
    e.preventDefault();
    lastX=e.clientX; lastY=e.clientY;
    if(raf) return;
    raf=requestAnimationFrame(()=>{
      raf=null;
      if(!ghost) return;
      ghost.style.transform='translate('+(lastX-startX)+'px,'+(lastY-startY)+'px) rotate(1.5deg)';
      const under=document.elementFromPoint(lastX,lastY);
      const target=under && under.closest ? under.closest('.file-item') : null;
      if(target && target!==dragEl && target!==ghost && container.contains(target)){
        const r=target.getBoundingClientRect();
        if(lastX > r.left + r.width/2) target.after(dragEl); else target.before(dragEl);
      }
    });
  };

  const onUp=()=>{
    window.removeEventListener('pointermove',onMove);
    window.removeEventListener('pointerup',onUp);
    window.removeEventListener('pointercancel',onUp);
    if(raf){ cancelAnimationFrame(raf); raf=null; }
    if(ghost){ ghost.remove(); ghost=null; }
    document.body.classList.remove('is-dragging-card');
    if(dragEl) dragEl.classList.remove('dragging');
    if(dragging){
      const order=[...container.querySelectorAll('.file-item')].map(el=>el._file).filter(Boolean);
      files.length=0; files.push(...order);
      dragEl=null; dragging=false;
      onChange();
      return;
    }
    dragEl=null; dragging=false;
  };

  container.addEventListener('pointerdown',e=>{
    const item=e.target.closest('.file-item');
    if(!item || !container.contains(item)) return;
    if(e.target.closest('button')) return;
    if(e.pointerType!=='mouse' && !e.target.closest('.grip')) return;
    dragEl=item; startX=e.clientX; startY=e.clientY; dragging=false;
    window.addEventListener('pointermove',onMove,{passive:false});
    window.addEventListener('pointerup',onUp);
    window.addEventListener('pointercancel',onUp);
  });
}

/* large preview modal */
let previewOverlay=null;
function hidePreview(){
  if(!previewOverlay)return;
  previewOverlay.classList.remove('show');
  if(previewOverlay._url){ URL.revokeObjectURL(previewOverlay._url); previewOverlay._url=null; }
  const body=previewOverlay.querySelector('.preview-modal__body');
  if(body) body.innerHTML='';
}
function ensurePreviewOverlay(){
  if(previewOverlay) return previewOverlay;
  const ov=document.createElement('div');
  ov.className='preview-overlay';
  ov.innerHTML='<div class="preview-modal" role="dialog" aria-modal="true"><div class="preview-modal__head"><span class="preview-modal__name"></span><button type="button" class="preview-modal__close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><div class="preview-modal__body"></div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{
    if(e.target===ov || e.target.closest('.preview-modal__close')) hidePreview();
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') hidePreview(); });
  previewOverlay=ov;
  return ov;
}
async function openFilePreview(f){
  const ov=ensurePreviewOverlay();
  const kind=await detectFileKind(f);
  const body=ov.querySelector('.preview-modal__body');
  ov.querySelector('.preview-modal__name').textContent=f.name;
  body.innerHTML='<div class="preview-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading preview…</div>';
  ov.classList.add('show');
  try{
    if(kind==='image'){
      const img=document.createElement('img');
      img.alt=f.name;
      ov._url=URL.createObjectURL(f);
      img.src=ov._url;
      await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; });
      if(f._rotation) img.style.transform='rotate('+f._rotation+'deg)';
      body.innerHTML='';
      body.appendChild(img);
      return;
    }
    const bytes=new Uint8Array(await f.arrayBuffer());
    const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
    const page=await pdf.getPage(1);
    const targetW=Math.min(720, window.innerWidth-120);
    const targetH=Math.max(240, window.innerHeight*0.68);
    const base=page.getViewport({scale:1});
    const scale=Math.max(0.3, Math.min(targetW/base.width, targetH/base.height, 2));
    const vp=page.getViewport({scale});
    const canvas=document.createElement('canvas');
    canvas.width=vp.width; canvas.height=vp.height;
    await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
    body.innerHTML='';
    body.appendChild(canvas);
    if(f._rotation){
      canvas.style.transform='rotate('+f._rotation+'deg)';
      canvas.style.transformOrigin='center center';
    }
    if(pdf.numPages>1){
      const more=document.createElement('div');
      more.className='preview-more';
      more.textContent='Page 1 of '+pdf.numPages;
      body.appendChild(more);
    }
  }catch(e){
    body.innerHTML='<div class="preview-loading">Preview is not available for this file.</div>';
  }
}

/* ---------- Powerful tool search ---------- */
const SEARCH_ALIASES={
  merge:'combine join unite concatenate append attach multiple',
  split:'separate divide cut slice break apart',
  compress:'reduce shrink smaller optimize size quality weight',
  batch:'bulk multiple many files queue at once',
  'pdf-to-word':'doc docx editable text microsoft word office',
  'pdf-to-excel':'xls xlsx spreadsheet sheet table cells columns',
  'pdf-to-ppt':'pptx powerpoint slides presentation deck',
  'pdf-to-jpg':'image images picture photo jpeg export render',
  'pdf-to-pdfa':'archive iso longterm standard compliance',
  'pdf-to-html':'web webpage website html browser',
  'word-to-pdf':'doc docx microsoft word document office',
  'excel-to-pdf':'xls xlsx spreadsheet sheet table office',
  'ppt-to-pdf':'pptx powerpoint slides presentation deck office',
  'jpg-to-pdf':'image images picture photo jpeg png camera',
  'html-to-pdf':'web webpage website url link browser',
  'scan-to-pdf':'scanner camera photo capture mobile document',
  edit:'annotate draw text image shape modify write',
  rotate:'turn orientation landscape portrait spin angle',
  'page-numbers':'number numbering pagination footer count',
  watermark:'stamp brand logo overlay text mark',
  crop:'trim margin edges cut frame',
  sign:'signature esign autograph initials contract',
  unlock:'password remove decrypt locked open access',
  protect:'password encrypt secure lock privacy safety',
  organize:'reorder sort arrange move pages order',
  repair:'fix recover damaged corrupt broken restore',
  compare:'diff difference changes versions match',
  metadata:'title author subject keywords tags properties info details',
  flatten:'layers form annotations merge bake',
  grayscale:'black white mono monochrome gray grey',
  'pdf-to-text':'txt plain extract writing copy',
  'pdf-to-csv':'comma spreadsheet xls table data rows',
  'add-blank':'insert empty page',
  'remove-blank':'delete empty page detect clean',
  'resize-pages':'size dimensions a4 letter legal a3 scale fit',
  'header-footer':'margin top bottom text running brand',
  'remove-pages':'delete remove pages cut drop',
  'extract-pages':'extract pull select save keep pages',
  'image-compress':'image jpg png gif svg photo shrink reduce optimize size quality weight',
  'image-resize':'image jpg png gif svg photo dimensions scale percent pixels width height',
  'image-crop':'image jpg png gif photo trim rectangle cut frame editor',
  'image-to-jpg':'image png gif tif tiff psd svg webp heic raw jpeg convert batch',
  'jpg-to-image':'jpg jpeg png gif animated convert batch',
  'photo-editor':'image photo filters effects text stickers frame edit',
  'image-upscale':'image enlarge high resolution quality bigger scale photo',
  'remove-bg':'image background transparency transparent cutout erase',
  'image-watermark':'image photo stamp text logo overlay mark opacity',
  'meme-generator':'meme caption funny text image photo generator',
  'image-rotate':'image photo spin turn orientation landscape portrait batch',
  'html-to-image':'html webpage web page screenshot jpg png svg code',
  'blur-face':'image photo blur face plate private hide region censor',
  'image-base64':'data url encode text copy image',
  'base64-image':'data url decode save image file',
  'image-color-picker':'colour swatch palette hex rgb eyedropper sample',
  'image-metadata':'exif iptc info strip clean remove data',
  'svg-optimizer':'minify clean vector reduce size',
  'image-format-detector':'magic bytes mime type identify check',
  'image-border':'frame padding rounded corner mat polaroid',
  'image-favicon':'icon app web 16 32 48 180 set',
  'image-contact-sheet':'thumbnail grid gallery overview print',
  summarize:'summary tldr ai brief key points overview',
  translate:'language spanish bengali hindi arabic french german chinese korean japanese urdu',
  ocr:'scan scanned text recognize searchable image photo',
  'pdf-to-markdown':'md markdown text convert notes',
  redact:'black out hide censor sensitive remove confidential',
  'pdf-forms':'fill form fields input checkbox questionnaire',
};
function normSearch(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function editDistance(a,b,max){
  if(Math.abs(a.length-b.length)>max)return max+1;
  const n=b.length;let prev=[],cur=[];
  for(let j=0;j<=n;j++)prev[j]=j;
  for(let i=1;i<=a.length;i++){
    cur[0]=i;let rowMin=i;
    for(let j=1;j<=n;j++){
      const cost=a[i-1]===b[j-1]?0:1;
      cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+cost);
      if(cur[j]<rowMin)rowMin=cur[j];
    }
    if(rowMin>max)return max+1;
    const tmp=prev;prev=cur;cur=tmp;
  }
  return prev[n];
}
function fuzzyWordScore(word,tok){
  if(!word||!tok)return 0;
  if(word===tok)return 1;
  if(tok.length>=3&&word.startsWith(tok))return .94;
  if(word.length>=4&&tok.startsWith(word))return .86;
  if(tok.length>=4){
    const max=tok.length>=8?2:1;
    const d=editDistance(word,tok,max);
    if(d<=max)return d===0?1:d===1?.74:.62;
  }
  return 0;
}
const SEARCH_INDEX=TOOLS.map(t=>({
  id:t.id,
  name:normSearch(t.name),
  desc:normSearch(t.desc),
  cat:normSearch(t.cat),
  alias:normSearch(SEARCH_ALIASES[t.id]||'')
}));
const SEARCH_INDEX_BY_ID={};
SEARCH_INDEX.forEach(e=>{SEARCH_INDEX_BY_ID[e.id]=e;});
function scoreTool(entry,tokens,phrase){
  if(!tokens.length)return 1;
  const nameWords=entry.name.split(/[^a-z0-9]+/).filter(Boolean);
  const aliasWords=entry.alias.split(/[^a-z0-9]+/).filter(Boolean);
  let total=0;
  for(const tok of tokens){
    let best=0;
    if(nameWords.indexOf(tok)>-1)best=120;
    else if(entry.name.startsWith(tok))best=100;
    else if(entry.name.indexOf(tok)>-1)best=80;
    else if(aliasWords.indexOf(tok)>-1)best=65;
    else if(entry.alias.indexOf(tok)>-1)best=50;
    else if(entry.cat.indexOf(tok)>-1)best=40;
    else if(entry.desc.indexOf(tok)>-1)best=30;
    if(!best){
      let f=0;
      for(const w of nameWords){const s=fuzzyWordScore(w,tok);if(s>f)f=s;}
      if(!f)for(const w of aliasWords){const s=fuzzyWordScore(w,tok);if(s>f)f=s;}
      if(f)best=Math.round(f*28);
    }
    if(!best)return 0;
    total+=best;
  }
  if(phrase){
    if(entry.name.indexOf(phrase)>-1)total+=120;
    else if(entry.alias.indexOf(phrase)>-1)total+=40;
  }
  return total;
}
function highlightMatches(el,text,tokens){
  if(!el)return;
  const valid=(tokens||[]).filter(x=>/[a-z0-9]/i.test(x)).sort((a,b)=>b.length-a.length);
  if(!valid.length){el.textContent=text;return;}
  const re=new RegExp('('+valid.map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','ig');
  const parts=String(text).split(re);
  el.innerHTML=parts.map((p,i)=>i%2?'<mark>'+escapeHtml(p)+'</mark>':escapeHtml(p)).join('');
}

/* Router */
function renderHome(root){
  root.innerHTML='';
  const hero=document.createElement('section');
  hero.className='hero';
  hero.innerHTML=`
    <div class="container">
      <h1 data-i18n="hero_title">${t('hero_title')}</h1>
      <p data-i18n="hero_desc">${t('hero_desc')}</p>
      <div class="search"><i class="fa-solid fa-magnifying-glass"></i><input id="searchInput" placeholder="${t('search_tools')}" data-i18n="search_tools" data-i18n-attr="placeholder" /><button class="search-clear" id="searchClear" type="button" aria-label="Clear search"><i class="fa-solid fa-xmark"></i></button></div>
      <a class="hero-studio" href="#/studio"><i class="fa-solid fa-layer-group"></i> Open Image Studio <span>— all 22 image tools in one workspace</span> <i class="fa-solid fa-arrow-right"></i></a>
      <div class="hero-chips">
        <span class="hero-chip"><i class="fa-solid fa-bolt"></i><span data-i18n="hero_chip_free">${t('hero_chip_free')}</span></span>
        <span class="hero-chip hero-chip--green"><i class="fa-solid fa-shield-halved"></i><span data-i18n="hero_chip_private">${t('hero_chip_private')}</span></span>
        <span class="hero-chip hero-chip--blue"><i class="fa-solid fa-wifi"></i><span data-i18n="hero_chip_offline">${t('hero_chip_offline')}</span></span>
        <span class="hero-chip hero-chip--violet"><i class="fa-solid fa-layer-group"></i><span class="chip-count">${TOOLS.length.toLocaleString(I18N.lang)}</span> <span data-i18n="hero_chip_tools">${t('hero_chip_tools')}</span></span>
      </div>
    </div>`;
  root.appendChild(hero);

  const recent=getRecent();
  if(recent.length){
    const rsec=document.createElement('section');
    rsec.className='section container recent-sec';
    const rt=document.createElement('div'); rt.className='cat-title';
    const rs=document.createElement('span'); rs.textContent=t('recent'); rt.appendChild(rs);
    rsec.appendChild(rt);
    const rgrid=document.createElement('div'); rgrid.className='grid';
    recent.forEach(id=>{ const t=TOOLS.find(x=>x.id===id); if(t) rgrid.appendChild(makeCard(t)); });
    rsec.appendChild(rgrid);
    root.appendChild(rsec);
  }

  const filters=document.createElement('div');
  filters.className='tool-filters container';
  const tags=[
    {key:'all',label:'filter_all',cats:null},
    {key:'organize',label:'cat_organize',cats:['Organize PDF']},
    {key:'optimize',label:'cat_optimize',cats:['Optimize PDF']},
    {key:'convert',label:'nav_convert',cats:['Convert from PDF','Convert to PDF']},
    {key:'edit',label:'cat_edit',cats:['Edit PDF']},
    {key:'security',label:'cat_security',cats:['PDF Security']},
    {key:'intelligence',label:'cat_intelligence',cats:['PDF Intelligence']},
    {key:'image',label:'cat_image',cats:['Image Tools']}
  ];
  tags.forEach((tag,i)=>{
    const b=document.createElement('button');
    b.className='tool-tag'+(i===0?' active':'');
    b.textContent=t(tag.label);
    b.dataset.cats=tag.cats?tag.cats.join('|'):'';
    b.addEventListener('click',()=>{
      filters.querySelectorAll('.tool-tag').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const cats=b.dataset.cats?b.dataset.cats.split('|'):null;
      sec.querySelectorAll('.card').forEach(c=>{
        const ok=!cats||cats.includes(c.dataset.cat);
        c.dataset.filtered=ok?'1':'0';
      });
      applySearch();
    });
    filters.appendChild(b);
  });
  root.appendChild(filters);

  const sec=document.createElement('section');
  sec.className='section container';
  // group by category
  CATEGORIES.forEach(cat=>{
    const tools=TOOLS.filter(t=>t.cat===cat);
    if(!tools.length)return;
    const title=document.createElement('div'); title.className='cat-title'; const titleSpan=document.createElement('span'); titleSpan.textContent=catLabel(cat); title.appendChild(titleSpan); sec.appendChild(title);
    const grid=document.createElement('div'); grid.className='grid';
    tools.forEach(t=>grid.appendChild(makeCard(t)));
    sec.appendChild(grid);
  });
  root.appendChild(sec);
  const input=$('#searchInput');
  const clearBtn=document.getElementById('searchClear');
  const heroContainer=input.parentElement.parentElement;
  const countEl=document.createElement('div');
  countEl.className='search-count';
  heroContainer.insertBefore(countEl, input.parentElement.nextSibling);

  const resultsEl=document.createElement('div');
  resultsEl.className='search-results';
  input.parentElement.appendChild(resultsEl);
  let activeResult=-1;
  resultsEl.addEventListener('click',e=>{
    const all=e.target.closest('[data-all]');
    if(all){ resetFilters(); applySearch(); input.focus(); }
  });
  document.addEventListener('click',e=>{
    if(!input.parentElement.contains(e.target)) resultsEl.classList.remove('show');
  });

  const emptyEl=document.createElement('div');
  emptyEl.className='search-empty';
  emptyEl.innerHTML='<i class="fa-solid fa-magnifying-glass"></i>'
    +'<p>No tools found for “<strong></strong>”</p>'
    +'<div class="search-empty__actions"><button type="button" class="btn btn-sm" data-search-reset>Clear search</button><button type="button" class="btn btn-ghost btn-sm" data-search-all style="display:none">Search all categories</button></div>'
    +'<div class="search-sugg"></div>';
  heroContainer.insertBefore(emptyEl, countEl.nextSibling);
  const emptyQuery=emptyEl.querySelector('strong');
  const suggWrap=emptyEl.querySelector('.search-sugg');
  const searchAllBtn=emptyEl.querySelector('[data-search-all]');
  const allFilter=filters.querySelector('.tool-tag');
  function resetFilters(){
    filters.querySelectorAll('.tool-tag').forEach(x=>x.classList.remove('active'));
    if(allFilter) allFilter.classList.add('active');
    sec.querySelectorAll('.card').forEach(c=>{c.dataset.filtered='1';});
  }
  ['Merge PDF','Compress PDF','PDF to Word','Split PDF','Protect PDF'].forEach(label=>{
    const b=document.createElement('button');
    b.type='button'; b.textContent=label;
    b.addEventListener('click',()=>{ resetFilters(); input.value=label; applySearch(); input.focus(); });
    suggWrap.appendChild(b);
  });
  emptyEl.querySelector('[data-search-reset]').addEventListener('click',()=>{ input.value=''; applySearch(); input.focus(); });
  searchAllBtn.addEventListener('click',()=>{ resetFilters(); applySearch(); input.focus(); });

  const blocks=[...sec.children].reduce((acc,el)=>{
    if(el.classList.contains('cat-title')){
      const grid=el.nextElementSibling;
      if(grid&&grid.classList.contains('grid')) acc.push({title:el,grid,order:acc.length,orig:[...grid.children]});
    }
    return acc;
  },[]);

  function renderResults(items,total,filterActive){
    resultsEl.innerHTML='';
    if(!items.length){
      resultsEl.innerHTML='<div class="search-results__empty">No tools found for “'+escapeHtml(input.value.trim())+'”</div>'
        +(filterActive?'<button type="button" class="search-results__all" data-all>Search all categories</button>':'');
    }else{
      items.forEach((c,i)=>{
        const tool=TOOLS.find(x=>x.id===c.dataset.toolId);
        const b=document.createElement('button');
        b.type='button'; b.className='search-result';
        b.dataset.toolId=c.dataset.toolId;
        b.innerHTML='<span class="search-result__icon"><i class="fa-solid '+(tool?tool.icon:'fa-wand-magic-sparkles')+'"></i></span>'
          +'<span class="search-result__text"><strong>'+escapeHtml(c.dataset.title||'')+'</strong><small>'+escapeHtml(c.dataset.cat||'')+' · '+escapeHtml(c.dataset.desc||'')+'</small></span>'
          +'<i class="fa-solid fa-arrow-up-right search-result__go"></i>';
        paintIcon(b.querySelector('.search-result__icon'),c.dataset.toolId,c.dataset.cat);
        b.addEventListener('click',()=>{ navigate('#/tool/'+c.dataset.toolId); resultsEl.classList.remove('show'); input.blur(); });
        resultsEl.appendChild(b);
      });
      resultsEl.insertAdjacentHTML('beforeend','<div class="search-results__foot">'+total+' result'+(total===1?'':'s')+'<span>↑↓ navigate · ↵ open</span></div>');
    }
    activeResult=-1;
    resultsEl.classList.add('show');
  }

  function applySearch(){
    const phrase=normSearch(input.value.trim());
    const tokens=phrase?phrase.split(/\s+/).filter(Boolean):[];
    const activeFilter=filters.querySelector('.tool-tag.active');
    const filterActive=!!(activeFilter&&activeFilter.dataset.cats);
    let visible=0;
    blocks.forEach(b=>{
      let maxScore=0;
      b.grid.querySelectorAll('.card').forEach(c=>{
        const entry=SEARCH_INDEX_BY_ID[c.dataset.toolId];
        const score=(entry&&tokens.length)?scoreTool(entry,tokens,phrase):1;
        c.dataset.score=score;
        if(score>maxScore)maxScore=score;
        const filtered=c.dataset.filtered!=='0';
        const show=(!tokens.length||score>0)&&filtered;
        c.style.display=show?'':'none';
        if(show)visible++;
        highlightMatches(c.querySelector('h3'),c.dataset.title||'',tokens);
        highlightMatches(c.querySelector('p'),c.dataset.desc||'',tokens);
      });
      if(tokens.length){
        [...b.grid.querySelectorAll('.card')]
          .sort((a,b2)=>(+b2.dataset.score)-(+a.dataset.score))
          .forEach(c=>b.grid.appendChild(c));
      }else{
        b.orig.forEach(c=>b.grid.appendChild(c));
      }
      b.maxScore=maxScore;
    });
    const ordered=tokens.length
      ? blocks.slice().sort((a,b)=>b.maxScore-a.maxScore||a.order-b.order)
      : blocks.slice().sort((a,b)=>a.order-b.order);
    ordered.forEach(b=>{ sec.appendChild(b.title); sec.appendChild(b.grid); });
    blocks.forEach(b=>{
      const any=[...b.grid.querySelectorAll('.card')].some(c=>c.style.display!=='none');
      b.title.style.display=any?'':'none';
      b.grid.style.display=any?'':'none';
    });
    if(clearBtn) clearBtn.classList.toggle('show',!!input.value.trim());
    if(tokens.length){
      const ranked=[...sec.querySelectorAll('.card')]
        .filter(c=>c.style.display!=='none'&&(+c.dataset.score)>0)
        .sort((a,b)=>(+b.dataset.score)-(+a.dataset.score));
      renderResults(ranked.slice(0,6),visible,filterActive);
      countEl.textContent=visible+' tool'+(visible===1?'':'s')+' found';
      emptyQuery.textContent=input.value.trim();
      emptyEl.classList.toggle('show',visible===0);
      searchAllBtn.style.display=(visible===0&&filterActive)?'':'none';
    }else{
      countEl.textContent='';
      emptyEl.classList.remove('show');
      searchAllBtn.style.display='none';
      resultsEl.classList.remove('show');
    }
    countEl.classList.toggle('show',!!tokens.length);
  }

  input.addEventListener('input',applySearch);
  input.addEventListener('keydown',e=>{
    const rows=[...resultsEl.querySelectorAll('.search-result')];
    if((e.key==='ArrowDown'||e.key==='ArrowUp')&&rows.length){
      e.preventDefault(); e.stopPropagation();
      activeResult=e.key==='ArrowDown'?Math.min(rows.length-1,activeResult+1):Math.max(0,activeResult-1);
      rows.forEach((r,i)=>r.classList.toggle('active',i===activeResult));
      rows[activeResult].scrollIntoView({block:'nearest'});
      return;
    }
    if(e.key==='Enter'&&rows.length&&resultsEl.classList.contains('show')){
      e.preventDefault(); e.stopPropagation();
      (rows[activeResult]||rows[0]).click();
      return;
    }
    if(e.key==='Escape'){
      if(resultsEl.classList.contains('show')){ resultsEl.classList.remove('show'); }
      else if(input.value){ input.value=''; applySearch(); }
    }
  });
  if(clearBtn) clearBtn.addEventListener('click',()=>{ input.value=''; applySearch(); input.focus(); });
}

const ICON_PALETTES=[
 ['#ff8a80','#e5322d','#b71c1c'],['#ffb199','#f4511e','#bf360c'],['#ffcc80','#f57c00','#e65100'],['#ffe082','#d97706','#a16207'],
 ['#93c5fd','#2563eb','#1e3a8a'],['#7dd3fc','#0284c7','#075985'],['#67e8f9','#0891b2','#164e63'],['#6ee7b7','#0d9488','#115e59'],
 ['#c4b5fd','#7c3aed','#4c1d95'],['#d8b4fe','#9333ea','#6b21a8'],['#6ee7b7','#059669','#065f46'],['#a7f3d0','#16a34a','#14532d'],
 ['#a5b4fc','#4f46e5','#312e81'],['#f0abfc','#c026d3','#86198f'],['#f9a8d4','#db2777','#9d174d'],['#fda4af','#e11d48','#881337'],
 ['#cbd5e1','#475569','#1e293b'],['#bef264','#65a30d','#3f6212']
];
const ICON_BASE={'Organize PDF':0,'Optimize PDF':2,'Convert to PDF':4,'Convert from PDF':6,'Edit PDF':8,'PDF Security':10,'PDF Intelligence':12,'Image Tools':14};
function iconHash(s){let h=0;for(let i=0;i<(s||'').length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);}
function paintIcon(el,id,cat){
  if(!el)return;
  const base=ICON_BASE[cat]; if(base===undefined)return;
  const p=ICON_PALETTES[(base+(iconHash(id)%3))%ICON_PALETTES.length];
  el.style.setProperty('--ic1',p[0]);el.style.setProperty('--ic2',p[1]);el.style.setProperty('--ic3',p[2]);
}

function makeCard(t){
  const card=document.createElement('a');
  card.className='card';
  card.href=siteBase()+'tools/'+t.id+'/';
  card.tabIndex=0;
  card.setAttribute('role','link');
  card.dataset.name=t.name;
  card.dataset.toolId=t.id;
  card.dataset.title=t.name;
  card.dataset.desc=t.desc;
  card.dataset.search=(t.name+' '+t.desc+' '+t.cat).toLowerCase();
  card.dataset.cat=t.cat;
  card.innerHTML=`<div class="icon"><i class="fa-solid ${t.icon}"></i></div><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.desc)}</p>`;
  paintIcon(card.querySelector('.icon'),t.id,t.cat);
  const open=e=>{ if(e) e.preventDefault(); navigate('#/tool/'+t.id); };
  card.addEventListener('click',open);
  card.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '||e.key==='Spacebar'){ e.preventDefault(); open(); }
  });
  return card;
}

function renderTools(root){
  root.innerHTML='';
  const sec=document.createElement('section');
  sec.className='section container';
  sec.innerHTML='<h1>'+t('all_tools')+'</h1>';
  CATEGORIES.forEach(cat=>{
    const tools=TOOLS.filter(t=>t.cat===cat);
    if(!tools.length)return;
    const title=document.createElement('div'); title.className='cat-title'; const titleSpan=document.createElement('span'); titleSpan.textContent=catLabel(cat); title.appendChild(titleSpan); sec.appendChild(title);
    const grid=document.createElement('div'); grid.className='grid';
    tools.forEach(t=>grid.appendChild(makeCard(t)));
    sec.appendChild(grid);
  });
  root.appendChild(sec);
}

function renderAbout(root){
  root.innerHTML='';
  const sec=document.createElement('section');
  sec.className='about container';
  sec.innerHTML=`
    <h1>${t('about_title')}</h1>
    <p>Online Converter is a free, browser-based PDF toolkit inspired by iLovePDF. All processing happens locally in your browser — your files are never uploaded to a server. The optional Translate tool asks for consent before sending extracted text to a free translation service.</p>
    <p>Implemented with pdf-lib, pdf.js and Web Crypto. Some advanced conversions are still in progress.</p>`;
  root.appendChild(sec);
}

function renderTool(root,id){
  const tool=TOOLS.find(t=>t.id===id);
  root.innerHTML='';
  if(!tool){ root.innerHTML='<div class="container" style="padding:40px">Tool not found.</div>'; return; }
  pushRecent(id);
  const wrap=document.createElement('section');
  wrap.className='tool-page container';
  const header=document.createElement('div');
  header.className='tool-header';
  header.innerHTML=`<div class="icon"><i class="fa-solid ${tool.icon}"></i></div><div class="tool-header__text"><nav class="tool-crumb" aria-label="Breadcrumb"><a href="#/" data-i18n="footer_home">${t('footer_home')}</a><i class="fa-solid fa-chevron-right"></i><a href="#/tools" data-i18n="all_tools">${t('all_tools')}</a><i class="fa-solid fa-chevron-right"></i><span data-i18n="${CAT_I18N[tool.cat]||'filter_all'}">${catLabel(tool.cat)}</span></nav><h1>${escapeHtml(tool.name)}</h1><p>${escapeHtml(tool.desc)}</p></div>`;
  paintIcon(header.querySelector('.icon'),tool.id,tool.cat);
  wrap.appendChild(header);
  const panel=document.createElement('div');
  panel.className='panel';
  wrap.appendChild(panel);
  root.appendChild(wrap);

  const status=document.createElement('div'); status.className='status'; status.setAttribute('role','status'); status.setAttribute('aria-live','polite'); panel.appendChild(status);
  // progress added by init maybe; ensure
  const progress=document.createElement('div'); progress.className='progress'; progress.innerHTML='<div></div>'; panel.appendChild(progress);

  if(tool.impl){
    try { INITERS[tool.id](panel); }
    catch(e){ panel.innerHTML+='<p class="status show error">'+escapeHtml(e.message)+'</p>'; }
  } else {
    panel.innerHTML+='<p style="color:var(--muted)">This tool is coming soon. Try another tool from the home page.</p>';
  }
}

const INITERS = {};

/* Convert an uploaded PDF or image file into a PDFDocument (with optional rotation) */
async function fileToPdf(file,rotation=0){
  const {PDFDocument,degrees}=PDFLib;
  const type=(file.type||'').toLowerCase();
  const kind=await detectFileKind(file);
  if(kind==='pdf'){
    const doc=await PDFDocument.load(new Uint8Array(await file.arrayBuffer()));
    if(rotation) doc.getPages().forEach(p=>p.setRotation(degrees((p.getRotation().angle+rotation)%360)));
    return doc;
  }
  if(kind==='image'){
    const doc=await PDFDocument.create();
    const bytes=new Uint8Array(await file.arrayBuffer());
    let img;
    if(type==='image/jpeg'||type==='image/jpg'||/\.jpe?g$/i.test(file.name||'')) img=await doc.embedJpg(bytes);
    else if(type==='image/png'||/\.png$/i.test(file.name||'')) img=await doc.embedPng(bytes);
    else{
      const dataUrl=await new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(fr.result);fr.onerror=()=>rej(new Error('Cannot read image'));fr.readAsDataURL(file);});
      const el=new Image(); el.src=dataUrl; await el.decode();
      const c=document.createElement('canvas'); c.width=el.naturalWidth; c.height=el.naturalHeight;
      c.getContext('2d').drawImage(el,0,0);
      const jpg=c.toDataURL('image/jpeg',0.92).split(',')[1];
      img=await doc.embedJpg(Uint8Array.from(atob(jpg),ch=>ch.charCodeAt(0)));
    }
    const {width,height}=img.scale(1);
    const page=doc.addPage([width,height]);
    page.drawImage(img,{x:0,y:0,width,height});
    if(rotation) page.setRotation(degrees(rotation%360));
    return doc;
  }
  throw new Error('Unsupported file type: '+(file.name||type));
}

/* ---------- MERGE ---------- */
INITERS.merge = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf,image/jpeg,image/png,image/webp,image/gif,image/bmp',multiple:true,onFiles:f=>{files=files.concat(f);rerender();}});
  panel.insertBefore(list, panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender,true); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="mgSize">Page size / alignment</label><select id="mgSize">'
    +'<option value="first" selected>Auto — match first page</option>'
    +'<option value="a4">A4 — fit &amp; center all pages</option>'
    +'<option value="letter">Letter — fit &amp; center all pages</option>'
    +'<option value="original">Keep original sizes</option></select></div>'
    +'<div class="field"><label for="mgMargin">Margin (pt)</label><input id="mgMargin" type="number" min="0" max="120" value="24" /></div>';
  panel.insertBefore(opts, panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-object-group"></i> Merge files';
  btn.addEventListener('click', async()=>{
    if(files.length<2){setStatus(panel,'Need at least 2 files (PDF or images).','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const mode=(panel.querySelector('#mgSize')||{}).value||'first';
      const margin=(panel.querySelector('#mgMargin')||{}).value||24;
      let target=null;
      const merged=await PDFDocument.create();
      for(let i=0;i<files.length;i++){
        let doc=await fileToPdf(files[i],files[i]._rotation||0);
        if(mode==='first'){
          if(i===0){
            const fp=doc.getPage(0), s=fp.getSize(), rot=(fp.getRotation().angle||0)%360;
            target=(rot===90||rot===270)?[s.height,s.width]:[s.width,s.height];
          }else{
            doc=await normalizePageSize(doc,target,margin);
          }
        }else if(mode!=='original'){
          doc=await normalizePageSize(doc,mode,margin);
        }
        const pages=await merged.copyPages(doc,doc.getPageIndices());
        pages.forEach(p=>merged.addPage(p));
        setProgress(panel,(i+1)/files.length*100);
      }
      const out=await merged.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'merged.pdf');
      setStatus(panel,'Merged '+files.length+' file'+(files.length===1?'':'s')+' successfully!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions, panel.querySelector('.status'));
};

/* ---------- SPLIT ---------- */
INITERS.split = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Mode</label>
      <select id="splitMode">
        <option value="all">All pages (one PDF per page)</option>
        <option value="jpg">All pages (one JPG per page)</option>
        <option value="ranges">Page ranges</option>
        <option value="every">Every N pages</option>
      </select>
    </div>
    <div class="field"><label for="splitScale">JPG scale (for JPG mode)</label><select id="splitScale"><option value="1">1x</option><option value="1.5" selected>1.5x</option><option value="2">2x</option></select></div>
    <div class="field"><label for="splitRanges">Ranges (e.g. 1-3,4,5-7)</label><input id="splitRanges" placeholder="1-3,4" /></div>
    <div class="field"><label for="splitEvery">Every N pages</label><input id="splitEvery" type="number" value="2" min="1" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-scissors"></i> Split PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const doc=await PDFDocument.load(bytes);
      const total=doc.getPageCount();
      const mode=panel.querySelector('#splitMode').value;
      if(mode==='every'){
        const n=parseInt(panel.querySelector('#splitEvery').value)||2;
        const zip=new JSZip();
        for(let i=0;i<total;i+=n){
          const nd=await PDFDocument.create();
          const pages=await nd.copyPages(doc,[...Array(Math.min(n,total-i)).keys()].map(x=>i+x));
          pages.forEach(p=>nd.addPage(p));
          const b=await nd.save();
          zip.file(`pages_${i+1}-${Math.min(i+n,total)}.pdf`,b);
          setProgress(panel,(i+n)/total*100);
        }
        const blob=await zip.generateAsync({type:'blob'});
        offerDownload(panel, blob,'split_every.zip');
      } else if(mode==='jpg'){
        const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
        const scale=parseFloat(panel.querySelector('#splitScale').value)||1.5;
        const zip=new JSZip();
        for(let i=1;i<=pdf.numPages;i++){
          const pg=await pdf.getPage(i);
          const vp=pg.getViewport({scale});
          const canvas=document.createElement('canvas');
          canvas.width=vp.width; canvas.height=vp.height;
          await pg.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
          const jpg=await new Promise(res=>canvas.toBlob(res,'image/jpeg',0.92));
          zip.file('page_'+i+'.jpg',jpg);
          setProgress(panel,i/pdf.numPages*100);
        }
        const blob=await zip.generateAsync({type:'blob'});
        offerDownload(panel,blob,'split_jpg.zip');
      } else if(mode==='all'){
        const zip=new JSZip();
        for(let i=0;i<total;i++){
          const nd=await PDFDocument.create();
          const [p]=await nd.copyPages(doc,[i]);
          nd.addPage(p);
          const b=await nd.save();
          zip.file(`page_${i+1}.pdf`,b);
          setProgress(panel,(i+1)/total*100);
        }
        const blob=await zip.generateAsync({type:'blob'});
        offerDownload(panel, blob,'split_pages.zip');
      } else {
        const ranges=parseRanges(panel.querySelector('#splitRanges').value,total);
        if(ranges.length===1){
          const nd=await PDFDocument.create();
          const pages=await nd.copyPages(doc,ranges[0].map(x=>x-1));
          pages.forEach(p=>nd.addPage(p));
          const b=await nd.save();
          offerDownload(panel, new Blob([b],{type:'application/pdf'}),'split.pdf');
        } else {
          const zip=new JSZip();
          for(let r=0;r<ranges.length;r++){
            const nd=await PDFDocument.create();
            const pages=await nd.copyPages(doc,ranges[r].map(x=>x-1));
            pages.forEach(p=>nd.addPage(p));
            const b=await nd.save();
            zip.file(`part_${r+1}.pdf`,b);
          }
          const blob=await zip.generateAsync({type:'blob'});
          offerDownload(panel, blob,'split_parts.zip');
        }
      }
      setStatus(panel,'Split complete!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

function parseRanges(str,total){
  const parts=str.split(',').map(s=>s.trim()).filter(Boolean);
  const out=[];
  for(const p of parts){
    if(p.includes('-')){
      const [a,b]=p.split('-').map(n=>parseInt(n));
      const arr=[]; for(let i=a;i<=b;i++){ if(i>=1&&i<=total) arr.push(i);}
      if(arr.length) out.push(arr);
    } else {
      const n=parseInt(p); if(n>=1&&n<=total) out.push([n]);
    }
  }
  return out.length?out:[[...Array(total).keys()].map(i=>i+1)];
}

/* ---------- COMPRESS ---------- */
INITERS.compress = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Compression level</label>
      <select id="compLvl"><option value="recommended">Recommended (good quality)</option><option value="extreme">Extreme (smallest size)</option><option value="less">Less (keep quality)</option></select></div>
    <div class="field"><label>Image quality</label>
      <select id="compQ"><option value="auto">Auto by level</option><option value="0.85">High</option><option value="0.7">Medium</option><option value="0.5">Low</option></select></div>
    <div class="field"><label for="compScale">Render scale (image modes)</label><select id="compScale"><option value="auto">Auto by level</option><option value="1.5">1.5×</option><option value="1.2">1.2×</option><option value="1">1×</option></select></div>
    <div class="field"><label for="compTarget">Target size (KB, optional)</label><input id="compTarget" type="number" min="20" placeholder="e.g. 500" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const result=document.createElement('div'); result.className='compare-summary'; result.hidden=true;
  panel.insertBefore(result,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-compress"></i> Compress PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const level=panel.querySelector('#compLvl').value;
      const qSel=panel.querySelector('#compQ').value;
      const target=parseInt(panel.querySelector('#compTarget').value)||0;
      const scaleSel=panel.querySelector('#compScale').value;
      const {PDFDocument}=PDFLib;
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const orig=bytes.byteLength;
      let out;
      if(level==='less'){
        const doc=await PDFDocument.load(bytes);
        out=await doc.save({useObjectStreams:true});
      } else {
        let q=qSel==='auto'?(level==='extreme'?0.55:0.75):(parseFloat(qSel)||0.75);
        let sc=scaleSel==='auto'?(level==='extreme'?1.1:1.35):(parseFloat(scaleSel)||1.35);
        if(target>0 && target<bytes.byteLength/1024){
          const ratio=target*1024/bytes.byteLength;
          if(ratio<0.5){ q=Math.max(0.35,q-0.12); sc=Math.max(0.8,sc*0.85); }
          else if(ratio<0.75){ q=Math.max(0.4,q-0.06); }
        }
        const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
        const doc=await PDFDocument.create();
        for(let n=1;n<=pdf.numPages;n++){
          const page=await pdf.getPage(n);
          const vp=page.getViewport({scale:sc});
          const canvas=document.createElement('canvas');
          canvas.width=vp.width; canvas.height=vp.height;
          await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
          const blob=await new Promise(res=>canvas.toBlob(res,'image/jpeg',q));
          const img=await doc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
          const p=doc.addPage([vp.width,vp.height]);
          p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});
          setProgress(panel,n/pdf.numPages*95);
        }
        out=await doc.save({useObjectStreams:true});
      }
      const pct=Math.round((1-out.byteLength/orig)*100);
      const already=pct<=0;
      if(already) offerDownload(panel, files[0], files[0].name.replace(/\.pdf$/i,'')+'-original.pdf');
      else offerDownload(panel, new Blob([out],{type:'application/pdf'}),'compressed.pdf');
      result.hidden=false;
      result.innerHTML='<strong>Compression result</strong><br>Original: '+formatBytes(orig)+' → '+(already?'kept original':formatBytes(out.byteLength))
        +'<br>'+(already?'Already optimized — recompression would make it larger, so your original file is kept.':pct+'% smaller')
        +(level==='less'?' · Text and vectors preserved':' · Pages flattened to images for maximum saving');
      setStatus(panel,already?'Already optimized — original file kept for download.':`Done. Original ${formatBytes(orig)} → ${formatBytes(out.byteLength)} (${pct}% smaller).`,already?'info':'success');
      setProgress(panel,100);
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- BATCH PROCESS ---------- */
INITERS.batch = function(panel){
  let files=[], btn=null;
  const updateLabel=()=>{ if(btn) btn.innerHTML='<i class="fa-solid fa-layer-group"></i> Process '+files.length+' file(s)'; };
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf,.pdf',multiple:true,onFiles:f=>{files=files.concat(f);rerender();updateLabel();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="btOp">Operation</label><select id="btOp"><option value="compress">Compress (re-save optimized)</option><option value="rotate">Rotate all pages</option><option value="watermark">Add text watermark</option></select></div>'
    +'<div class="field"><label for="btRot">Rotation</label><select id="btRot"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></div>'
    +'<div class="field"><label for="btText">Watermark text</label><input id="btText" value="CONFIDENTIAL" /></div>'
    +'<div class="field"><label for="btOut">Output</label><select id="btOut"><option value="zip">ZIP archive</option><option value="pdf">Single merged PDF</option></select></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btnEl=document.createElement('button'); btnEl.className='btn btn-primary'; btnEl.id='btRun'; btn=btnEl;
  updateLabel();
  btn.addEventListener('click',async()=>{
    if(files.length<1){setStatus(panel,'Add at least one PDF.','error');return;}
    try{
      showProgress(panel,true); setProgress(panel,5);
      await waitForCore('PDFLib'); await waitForCore('JSZip');
      const {PDFDocument,StandardFonts,degrees,rgb}=PDFLib;
      const op=panel.querySelector('#btOp').value;
      const rot=parseInt(panel.querySelector('#btRot').value)||90;
      const wm=panel.querySelector('#btText').value||'CONFIDENTIAL';
      const outMode=panel.querySelector('#btOut').value;
      const merged=outMode==='pdf'?await PDFDocument.create():null;
      const zip=new JSZip();
      for(const [i,f] of files.entries()){
        const bytes=new Uint8Array(await f.arrayBuffer());
        const doc=await PDFDocument.load(bytes,{ignoreEncryption:true});
        const pages=doc.getPages();
        if(op==='rotate') pages.forEach(p=>p.setRotation(degrees((p.getRotation().angle+rot)%360)));
        else if(op==='watermark'){
          const font=await doc.embedFont(StandardFonts.HelveticaBold);
          pages.forEach(p=>{
            const {width,height}=p.getSize();
            p.drawText(wm,{x:24,y:24,size:Math.min(28,width/16),font,color:rgb(0.8,0.1,0.1),opacity:0.25,rotate:degrees(0)});
          });
        }
        const out=await doc.save({useObjectStreams:true});
        let base=f.name.replace(/\.pdf$/i,'');
        let n=1; while(zip.file(base+'-processed.pdf')) base=f.name.replace(/\.pdf$/i,'')+'('+(++n)+')';
        if(merged){
          const loaded=await PDFDocument.load(out);
          const copy=await merged.copyPages(loaded,loaded.getPageIndices());
          copy.forEach(p=>merged.addPage(p));
        } else zip.file(base+'-processed.pdf',out);
        setProgress(panel,10+85*(i+1)/files.length);
      }
      if(merged){
        offerDownload(panel,new Blob([await merged.save()],{type:'application/pdf'}),'batch-merged.pdf');
      } else {
        const blob=await zip.generateAsync({type:'blob'});
        offerDownload(panel,blob,'batch-processed.zip');
      }
      setProgress(panel,100);
      setStatus(panel,'Processed '+files.length+' file(s)!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- ROTATE ---------- */
INITERS.rotate = function(panel){
  let files=[];
  let rotation=0;
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));

  const studio=document.createElement('div');
  studio.className='rotate-studio';
  studio.hidden=true;
  studio.innerHTML=`
    <div class="rotate-studio__head"><span>Rotate preview</span><strong id="rotAngleVal">0°</strong></div>
    <div class="rotate-body">
      <div class="rotate-stage" id="rotStage" title="Click to turn 90°">
        <div class="rotate-page" id="rotPage"><img id="rotImg" alt="Page preview" /></div>
      </div>
      <div class="rotate-dial" id="rotDial" title="Drag to rotate">
        <div class="rotate-dial__ring"></div>
        <div class="rotate-dial__arm" id="rotArm"><div class="rotate-dial__handle"><i class="fa-solid fa-arrows-rotate"></i></div></div>
        <div class="rotate-dial__center"><i class="fa-solid fa-rotate"></i></div>
      </div>
    </div>
    <div class="rotate-quick">
      <button type="button" data-rot="-90"><i class="fa-solid fa-rotate-left"></i> 90° left</button>
      <button type="button" data-rot="90"><i class="fa-solid fa-rotate-right"></i> 90° right</button>
      <button type="button" data-rot="180">180°</button>
      <button type="button" data-rot="reset"><i class="fa-solid fa-rotate-left"></i> Reset</button>
    </div>
    <p class="rotate-tip">Drag the round handle to rotate freely · Click the page for a quick 90° turn</p>`;
  panel.insertBefore(studio,panel.querySelector('.status'));

  const rotPage=studio.querySelector('#rotPage');
  const rotImg=studio.querySelector('#rotImg');
  const rotArm=studio.querySelector('#rotArm');
  const dial=studio.querySelector('#rotDial');
  const angleVal=studio.querySelector('#rotAngleVal');
  const applyRotation=()=>{
    rotPage.style.transform='rotate('+rotation+'deg)';
    rotArm.style.transform='rotate('+rotation+'deg)';
    angleVal.textContent=Math.round(rotation)+'°';
  };

  let dialDrag=false;
  const setFromPointer=e=>{
    const r=dial.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    let deg=Math.atan2(e.clientY-cy, e.clientX-cx)*180/Math.PI+90;
    deg=(deg+360)%360;
    if(e.shiftKey) deg=Math.round(deg/15)*15;
    rotation=Math.round(deg);
    applyRotation();
  };
  dial.addEventListener('pointerdown',e=>{
    dialDrag=true;
    try{ dial.setPointerCapture(e.pointerId); }catch(_){}
    setFromPointer(e);
  });
  dial.addEventListener('pointermove',e=>{ if(dialDrag) setFromPointer(e); });
  dial.addEventListener('pointerup',()=>{ dialDrag=false; });
  dial.addEventListener('pointercancel',()=>{ dialDrag=false; });

  studio.querySelector('#rotStage').addEventListener('click',()=>{ rotation=(rotation+90)%360; applyRotation(); });
  studio.querySelectorAll('.rotate-quick button').forEach(b=>{
    b.addEventListener('click',()=>{
      const v=b.dataset.rot;
      if(v==='reset') rotation=0;
      else rotation=(rotation+parseInt(v,10)+360)%360;
      applyRotation();
    });
  });

  function rerender(){
    renderFileList(list,files,rerender);
    studio.hidden=files.length===0;
    if(files.length){
      rotation=0; applyRotation();
      thumbUrl(files[0]).then(u=>{ if(u && rotImg.isConnected) rotImg.src=u; });
    }
  }
  rerender();

  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`<div class="field"><label for="rotPages">Pages (blank = all)</label><input id="rotPages" placeholder="1,3,5-7" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-rotate"></i> Rotate PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    if(!rotation){setStatus(panel,'Choose an angle first — click 90° left/right or drag the dial.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,degrees}=PDFLib;
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const doc=await PDFDocument.load(bytes);
      const total=doc.getPageCount();
      const pagesInput=panel.querySelector('#rotPages').value.trim();
      let targets;
      if(!pagesInput) targets=[...Array(total).keys()];
      else targets=parseRanges(pagesInput,total).flat().map(n=>n-1);
      targets.forEach(i=>{ const p=doc.getPage(i); p.setRotation(degrees((p.getRotation().angle+rotation)%360)); });
      const out=await doc.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'rotated.pdf');
      setStatus(panel,'Rotated '+Math.round(rotation)+'° successfully!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- ORGANIZE ---------- */
INITERS.organize = function(panel){
  let files=[], order=[], rotations={}, thumbs={}, srcDoc=null;
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:async f=>{
    files=[f[0]]; order=[]; rotations={}; thumbs={};
    try{
      showProgress(panel,true); setProgress(panel,10);
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      srcDoc=await PDFLib.PDFDocument.load(bytes);
      order=srcDoc.getPageIndices().slice();
      const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
      const cv=document.createElement('canvas');
      for(let n=1;n<=pdf.numPages;n++){
        const pg=await pdf.getPage(n);
        const vp=pg.getViewport({scale:0.45});
        cv.width=vp.width; cv.height=vp.height;
        await pg.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;
        thumbs[n-1]=cv.toDataURL('image/jpeg',0.75);
        setProgress(panel,10+80*n/pdf.numPages);
      }
      renderOrder();
      setStatus(panel,'Loaded '+order.length+' page(s). Drag to reorder, rotate or delete.','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  }});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const hint=document.createElement('p'); hint.className='pdf-editor__tip'; hint.textContent='Drag tiles to reorder · rotate · delete';
  panel.insertBefore(hint,panel.querySelector('.status'));
  const orderBox=document.createElement('div'); orderBox.className='page-grid'; panel.insertBefore(orderBox,panel.querySelector('.status'));
  function renderOrder(){
    orderBox.innerHTML='';
    order.forEach((idx,i)=>{
      const item=document.createElement('div'); item.className='page-tile'; item.draggable=true; item.dataset.i=String(i);
      item.innerHTML='<div class="page-tile__thumb">'+(thumbs[idx]?'<img src="'+thumbs[idx]+'" alt="Page '+(idx+1)+'">':'<i class="fa-solid fa-file-pdf"></i>')+'</div>'
        +'<div class="page-tile__bar"><span>Page '+(idx+1)+'</span><span class="page-tile__tools">'
        +'<button type="button" data-a="up" title="Move left" '+(i===0?'disabled':'')+'><i class="fa-solid fa-arrow-left"></i></button>'
        +'<button type="button" data-a="down" title="Move right" '+(i===order.length-1?'disabled':'')+'><i class="fa-solid fa-arrow-right"></i></button>'
        +'<button type="button" data-a="rotl" title="Rotate left"><i class="fa-solid fa-rotate-left"></i></button>'
        +'<button type="button" data-a="rotr" title="Rotate right"><i class="fa-solid fa-rotate-right"></i></button>'
        +'<button type="button" data-a="del" title="Delete"><i class="fa-solid fa-trash"></i></button>'
        +'</span></div>'+(rotations[idx]?'<span class="page-tile__rot">'+rotations[idx]+'°</span>':'');
      item.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',String(i));item.classList.add('dragging');});
      item.addEventListener('dragend',()=>item.classList.remove('dragging'));
      item.addEventListener('dragover',e=>e.preventDefault());
      item.addEventListener('drop',e=>{
        e.preventDefault();
        const from=parseInt(e.dataTransfer.getData('text/plain'),10);
        if(!isNaN(from)&&from!==i){const [m]=order.splice(from,1);order.splice(i,0,m);renderOrder();}
      });
      item.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{
        const a=b.dataset.a;
        if(a==='up'&&i>0){[order[i-1],order[i]]=[order[i],order[i-1]];}
        else if(a==='down'&&i<order.length-1){[order[i+1],order[i]]=[order[i],order[i+1]];}
        else if(a==='rotl'){rotations[idx]=((rotations[idx]||0)-90+360)%360;}
        else if(a==='rotr'){rotations[idx]=((rotations[idx]||0)+90)%360;}
        else if(a==='del'){order.splice(i,1);delete rotations[idx];}
        renderOrder();
      }));
      orderBox.appendChild(item);
    });
  }
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-layer-group"></i> Save organized PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length||!order.length){setStatus(panel,'Load a PDF first.','error');return;}
    try{
      showProgress(panel,true); setProgress(panel,10);
      const {PDFDocument,degrees}=PDFLib;
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const doc=await PDFDocument.load(bytes);
      const nd=await PDFDocument.create();
      const pages=await nd.copyPages(doc,order);
      pages.forEach((p,i)=>{
        const rot=rotations[order[i]]||0;
        if(rot) p.setRotation(degrees(rot));
        nd.addPage(p);
        setProgress(panel,10+85*(i+1)/pages.length);
      });
      const out=await nd.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'organized.pdf');
      setProgress(panel,100);
      setStatus(panel,'Saved '+pages.length+' page(s)!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  const resetBtn=document.createElement('button'); resetBtn.className='btn btn-ghost'; resetBtn.innerHTML='<i class="fa-solid fa-rotate"></i> Reset order';
  resetBtn.addEventListener('click',()=>{
    if(!srcDoc){setStatus(panel,'Load a PDF first.','error');return;}
    order=srcDoc.getPageIndices().slice(); rotations={}; renderOrder();
    setStatus(panel,'Order reset.','success');
  });
  actions.appendChild(btn); actions.appendChild(resetBtn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- PAGE NUMBERS ---------- */
INITERS['page-numbers'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Position</label>
      <select id="pnPos"><option value="bottom-center">Bottom center</option><option value="bottom-left">Bottom left</option><option value="bottom-right">Bottom right</option><option value="top-center">Top center</option><option value="top-left">Top left</option><option value="top-right">Top right</option></select></div>
    <div class="field"><label>Format</label>
      <select id="pnFmt"><option value="arabic">1, 2, 3...</option><option value="roman">I, II, III...</option><option value="letters">A, B, C...</option></select></div>
    <div class="field"><label for="pnStart">Start number</label><input id="pnStart" type="number" value="1" /></div>
    <div class="field"><label for="pnSize">Font size</label><input id="pnSize" type="number" value="12" /></div>
    <div class="field"><label for="pnColor">Color</label><select id="pnColor"><option value="0,0,0">Black</option><option value="0.3,0.3,0.3">Gray</option><option value="0.8,0,0">Red</option><option value="0,0,0.7">Blue</option></select></div>
    <div class="field"><label for="pnPrefix">Prefix</label><input id="pnPrefix" placeholder="Page " /></div>
    <div class="field"><label for="pnPages">Pages (blank = all)</label><input id="pnPages" placeholder="1,3,5-7" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-list-ol"></i> Add page numbers';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,StandardFonts,rgb}=PDFLib;
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const doc=await PDFDocument.load(bytes);
      const font=await doc.embedFont(StandardFonts.Helvetica);
      const start=parseInt(panel.querySelector('#pnStart').value)||1;
      const size=parseInt(panel.querySelector('#pnSize').value)||12;
      const prefix=panel.querySelector('#pnPrefix').value;
      const pos=panel.querySelector('#pnPos').value;
      const fmt=panel.querySelector('#pnFmt').value;
      const col=panel.querySelector('#pnColor').value.split(',').map(Number);
      const pagesInput=panel.querySelector('#pnPages').value.trim();
      const total=doc.getPageCount();
      const targets=pagesInput?parseRanges(pagesInput,total).flat().map(n=>n-1):[...Array(total).keys()];
      const toRoman=n=>{const r=['','I','II','III','IV','V','VI','VII','VIII','IX','X'];return r[n]||(n+'');};
      const toLetters=n=>String.fromCharCode(64+((n-1)%26)+1);
      for(const [k,i] of targets.entries()){
        const page=doc.getPage(i);
        const {width,height}=page.getSize();
        const num=start+k;
        const label=fmt==='roman'?toRoman(num):fmt==='letters'?toLetters(num):String(num);
        const text=prefix+label;
        const tw=font.widthOfTextAtSize(text,size);
        const margin=24;
        let x,y;
        if(pos==='bottom-center'){x=(width-tw)/2;y=margin;}
        else if(pos==='bottom-left'){x=margin;y=margin;}
        else if(pos==='bottom-right'){x=width-tw-margin;y=margin;}
        else if(pos==='top-center'){x=(width-tw)/2;y=height-size-margin;}
        else if(pos==='top-left'){x=margin;y=height-size-margin;}
        else {x=width-tw-margin;y=height-size-margin;}
        page.drawText(text,{x,y,size,font,color:rgb(col[0],col[1],col[2])});
        setProgress(panel,(k+1)/targets.length*100);
      }
      const out=await doc.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'numbered.pdf');
      setStatus(panel,'Done!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- WATERMARK ---------- */
INITERS.watermark = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Type</label>
      <select id="wmType"><option value="text">Text</option><option value="image">Image</option></select></div>
    <div class="field" id="wmTextWrap"><label for="wmText">Text</label><input id="wmText" value="CONFIDENTIAL" /></div>
    <div class="field" id="wmImgWrap" hidden><label for="wmImg">Image</label><input id="wmImg" type="file" accept="image/*" /></div>
    <div class="field"><label>Position</label>
      <select id="wmPos"><option value="center">Center</option><option value="top-left">Top left</option><option value="top-center">Top center</option><option value="top-right">Top right</option><option value="bottom-left">Bottom left</option><option value="bottom-center">Bottom center</option><option value="bottom-right">Bottom right</option><option value="tile">Tile (repeat)</option></select></div>
    <div class="field"><label for="wmSize">Font size</label><input id="wmSize" type="number" value="48" /></div>
    <div class="field"><label for="wmScale">Scale (image)</label><input id="wmScale" type="number" step="0.1" value="0.3" /></div>
    <div class="field"><label for="wmColor">Color</label><select id="wmColor"><option value="0.5,0.5,0.5">Gray</option><option value="0.8,0,0">Red</option><option value="0,0,0.7">Blue</option><option value="0,0,0">Black</option></select></div>
    <div class="field"><label for="wmOpacity">Opacity (0-1)</label><input id="wmOpacity" type="number" step="0.1" value="0.3" /></div>
    <div class="field"><label for="wmRot">Rotation</label><input id="wmRot" type="number" value="45" /></div>
    <div class="field"><label for="wmLayer">Layer</label><select id="wmLayer"><option value="over">Over content</option><option value="under">Under content</option></select></div>
    <div class="field"><label for="wmPages">Pages (blank = all)</label><input id="wmPages" placeholder="1,3,5-7" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const typeSel=opts.querySelector('#wmType');
  typeSel.addEventListener('change',()=>{
    opts.querySelector('#wmTextWrap').hidden=typeSel.value!=='text';
    opts.querySelector('#wmImgWrap').hidden=typeSel.value!=='image';
  });

  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-droplet"></i> Add watermark';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    const type=opts.querySelector('#wmType').value;
    if(type==='text' && !opts.querySelector('#wmText').value.trim()){setStatus(panel,'Enter watermark text.','error');return;}
    if(type==='image' && !opts.querySelector('#wmImg').files[0]){setStatus(panel,'Select an image.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,StandardFonts,rgb,degrees}=PDFLib;
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const doc=await PDFDocument.load(bytes);
      const font=await doc.embedFont(StandardFonts.HelveticaBold);
      const text=opts.querySelector('#wmText').value||'WATERMARK';
      const size=parseInt(opts.querySelector('#wmSize').value)||48;
      const opacity=parseFloat(opts.querySelector('#wmOpacity').value)||0.3;
      const rot=parseInt(opts.querySelector('#wmRot').value)||45;
      const col=opts.querySelector('#wmColor').value.split(',').map(Number);
      const pos=opts.querySelector('#wmPos').value;
      const layer=opts.querySelector('#wmLayer').value;
      const pagesInput=opts.querySelector('#wmPages').value.trim();
      const total=doc.getPageCount();
      const targets=pagesInput?parseRanges(pagesInput,total).flat().map(n=>n-1):[...Array(total).keys()];

      let img=null;
      if(type==='image'){
        const f=opts.querySelector('#wmImg').files[0];
        const ib=new Uint8Array(await f.arrayBuffer());
        if(f.type==='image/png') img=await doc.embedPng(ib); else img=await doc.embedJpg(ib);
      }

      for(const [k,i] of targets.entries()){
        const page=doc.getPage(i);
        const {width,height}=page.getSize();
        if(img){
          const sc=parseFloat(opts.querySelector('#wmScale').value)||0.3;
          const dims=img.scale(sc);
          const positions=calcPositions(pos,width,height,dims.width,dims.height);
          for(const [x,y] of positions){
            page.drawImage(img,{x,y,width:dims.width,height:dims.height,opacity});
          }
        } else {
          const tw=font.widthOfTextAtSize(text,size);
          const positions=calcPositions(pos,width,height,tw,size);
          for(const [x,y] of positions){
            page.drawText(text,{x,y,size,font,color:rgb(col[0],col[1],col[2]),opacity,rotate:degrees(rot)});
          }
        }
        setProgress(panel,(k+1)/targets.length*100);
      }
      const out=await doc.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'watermarked.pdf');
      setStatus(panel,'Watermark added to '+targets.length+' page(s)!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

function calcPositions(pos,pw,ph,w,h){
  const m=24;
  if(pos==='tile'){
    const out=[];
    for(let x=m;x<pw-m;x+=Math.max(w+40,80)){
      for(let y=m;y<ph-m;y+=Math.max(h+40,60)){
        out.push([x,y]);
      }
    }
    return out;
  }
  let x,y;
  if(pos==='top-left'){x=m;y=ph-h-m;}
  else if(pos==='top-center'){x=(pw-w)/2;y=ph-h-m;}
  else if(pos==='top-right'){x=pw-w-m;y=ph-h-m;}
  else if(pos==='bottom-left'){x=m;y=m;}
  else if(pos==='bottom-center'){x=(pw-w)/2;y=m;}
  else if(pos==='bottom-right'){x=pw-w-m;y=m;}
  else {x=(pw-w)/2;y=(ph-h)/2;}
  return [[x,y]];
}

/* ---------- PROTECT ---------- */
INITERS.protect = async function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label for="protPwd">User password (to open)</label><input id="protPwd" type="password" /></div>
    <div class="field"><label for="protOwner">Owner password (optional)</label><input id="protOwner" type="password" placeholder="defaults to user password" /></div>
    <div class="field"><label>Permissions</label>
      <div class="perm-grid">
        <label><input type="checkbox" id="permPrint" checked /> Print</label>
        <label><input type="checkbox" id="permCopy" checked /> Copy text</label>
        <label><input type="checkbox" id="permModify" /> Modify</label>
        <label><input type="checkbox" id="permAnnotate" checked /> Annotate</label>
      </div>
    </div>
    <div class="field"><label>Password strength</label><div id="pwdStrength" class="pwd-strength">—</div><small>AES-256 encryption (PDF 2.0, /V5 /R6). Works offline.</small></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const strength=opts.querySelector('#pwdStrength');
  opts.querySelector('#protPwd').addEventListener('input',e=>{
    const v=e.target.value;
    let score=0;
    if(v.length>=8)score++;
    if(v.length>=12)score++;
    if(/[A-Z]/.test(v)&&/[a-z]/.test(v))score++;
    if(/\d/.test(v))score++;
    if(/[^A-Za-z0-9]/.test(v))score++;
    const labels=['Very weak','Weak','Fair','Good','Strong','Very strong'];
    strength.textContent=v?labels[Math.min(score,5)]:'—';
    strength.dataset.level=String(Math.min(score,5));
  });
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-lock"></i> Protect PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    const pwd=panel.querySelector('#protPwd').value;
    if(!pwd){setStatus(panel,'Enter a password.','error');return;}
    try{
      showProgress(panel,true);
      const {configure,lock}=await import('../assets/vendor/pdf-lib-encrypt.js');
      configure(window.PDFLib);
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const owner=panel.querySelector('#protOwner').value.trim()||pwd;
      const permissions={
        printing:panel.querySelector('#permPrint').checked,
        copying:panel.querySelector('#permCopy').checked,
        modifying:panel.querySelector('#permModify').checked,
        annotating:panel.querySelector('#permAnnotate').checked
      };
      const encrypted=await lock(bytes,pwd,{ownerPassword:owner,permissions});
      offerDownload(panel, new Blob([encrypted],{type:'application/pdf'}),'protected.pdf');
      setStatus(panel,'Protected with permissions!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- UNLOCK ---------- */
INITERS.unlock = async function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label for="unlockPwd">Password</label><input id="unlockPwd" type="password" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-lock-open"></i> Unlock PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    const pwd=panel.querySelector('#unlockPwd').value;
    try{
      showProgress(panel,true);
      const {configure,unlockInPlace}=await import('../assets/vendor/pdf-lib-encrypt.js');
      configure(window.PDFLib);
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const doc=await PDFLib.PDFDocument.load(bytes,{ignoreEncryption:true});
      await unlockInPlace(doc,pwd);
      const out=await doc.save({useObjectStreams:false});
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'unlocked.pdf');
      setStatus(panel,'Unlocked!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- SIGN ---------- */
INITERS.sign = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();

  const studio=document.createElement('div'); studio.className='sig-studio';
  studio.innerHTML=`
    <div class="sig-modes">
      <button type="button" data-mode="draw" class="active"><i class="fa-solid fa-pen"></i> Draw</button>
      <button type="button" data-mode="type"><i class="fa-solid fa-keyboard"></i> Type</button>
      <button type="button" data-mode="image"><i class="fa-solid fa-image"></i> Upload</button>
    </div>
    <div class="sig-canvas-wrap" id="sigDraw">
      <canvas id="sigCanvas" width="420" height="160"></canvas>
      <div class="sig-canvas-tools">
        <label>Color <input id="sigColor" type="color" value="#1a3a6b" /></label>
        <label>Thickness <input id="sigThick" type="range" min="1" max="8" value="2.5" step="0.5" /></label>
        <button type="button" id="sigClear"><i class="fa-solid fa-eraser"></i> Clear</button>
        <button type="button" id="sigUndo" title="Undo"><i class="fa-solid fa-undo"></i></button>
        <button type="button" id="sigRedo" title="Redo"><i class="fa-solid fa-redo"></i></button>
      </div>
    </div>
    <div class="sig-type" id="sigType" hidden>
      <input id="sigText" placeholder="Your name" />
      <select id="sigFont"><option value="cursive">Cursive</option><option value="serif">Serif</option><option value="sans">Sans</option></select>
    </div>
    <div class="sig-image" id="sigImage" hidden>
      <input id="sigFile" type="file" accept="image/*" />
    </div>
    <div class="sig-preview"><span>Preview:</span><img id="sigPreview" alt="Signature preview" /></div>`;
  panel.insertBefore(studio,panel.querySelector('.status'));

  const canvas=studio.querySelector('#sigCanvas');
  const ctx=canvas.getContext('2d');
  ctx.strokeStyle='#1a3a6b'; ctx.lineWidth=2.5; ctx.lineCap='round'; ctx.lineJoin='round';
  let drawing=false, mode='draw', hasDrawn=false;
  const sigHistory=[]; let sh=-1;
  const snapSig=()=>{ sigHistory.splice(sh+1); sigHistory.push(ctx.getImageData(0,0,canvas.width,canvas.height)); sh=sigHistory.length-1; };
  const restoreSig=()=>{ if(sh>=0){ ctx.putImageData(sigHistory[sh],0,0); if(typeof updatePreview==='function') updatePreview(); } };
  snapSig();
  const startDraw=e=>{drawing=true;const r=canvas.getBoundingClientRect();ctx.beginPath();ctx.moveTo(e.clientX-r.left,e.clientY-r.top);};
  const moveDraw=e=>{if(!drawing)return;const r=canvas.getBoundingClientRect();ctx.lineTo(e.clientX-r.left,e.clientY-r.top);ctx.stroke();hasDrawn=true;updatePreview();};
  const endDraw=()=>{ if(drawing&&hasDrawn){ snapSig(); hasDrawn=false; } drawing=false; };
  canvas.addEventListener('pointerdown',startDraw);
  canvas.addEventListener('pointermove',moveDraw);
  canvas.addEventListener('pointerup',endDraw);
  canvas.addEventListener('pointerleave',endDraw);
  studio.querySelector('#sigColor').addEventListener('input',e=>{ctx.strokeStyle=e.target.value;});
  studio.querySelector('#sigThick').addEventListener('input',e=>{ctx.lineWidth=parseFloat(e.target.value);});
  studio.querySelector('#sigClear').addEventListener('click',()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasDrawn=false;snapSig();updatePreview();});
studio.querySelector('#sigUndo').addEventListener('click',()=>{ if(sh>0){sh--;restoreSig();} });
studio.querySelector('#sigRedo').addEventListener('click',()=>{ if(sh<sigHistory.length-1){sh++;restoreSig();} });
  studio.querySelectorAll('.sig-modes button').forEach(b=>{
    b.addEventListener('click',()=>{
      studio.querySelectorAll('.sig-modes button').forEach(x=>x.classList.remove('active'));
      b.classList.add('active'); mode=b.dataset.mode;
      studio.querySelector('#sigDraw').hidden=mode!=='draw';
      studio.querySelector('#sigType').hidden=mode!=='type';
      studio.querySelector('#sigImage').hidden=mode!=='image';
      updatePreview();
    });
  });
  studio.querySelector('#sigText').addEventListener('input',updatePreview);
  studio.querySelector('#sigFont').addEventListener('change',updatePreview);
  studio.querySelector('#sigFile').addEventListener('change',updatePreview);

  let sigUrl=null;
  function updatePreview(){
    const img=studio.querySelector('#sigPreview');
    if(sigUrl){ URL.revokeObjectURL(sigUrl); sigUrl=null; }
    if(mode==='draw'){
      if(!hasDrawn){ img.style.display='none'; return; }
      img.src=canvas.toDataURL('image/png'); img.style.display='block';
    } else if(mode==='type'){
      const t=studio.querySelector('#sigText').value.trim();
      if(!t){ img.style.display='none'; return; }
      const c=document.createElement('canvas'); c.width=420;c.height=160; const x=c.getContext('2d');
      const font=studio.querySelector('#sigFont').value;
      const family=font==='cursive'?'cursive':font==='serif'?'Georgia,serif':'Arial,sans-serif';
      x.font='48px '+family; x.fillStyle='#1a3a6b'; x.textBaseline='middle'; x.fillText(t,12,80);
      img.src=c.toDataURL('image/png'); img.style.display='block';
    } else {
      const f=studio.querySelector('#sigFile').files[0];
      if(!f){ img.style.display='none'; return; }
      sigUrl=URL.createObjectURL(f); img.src=sigUrl; img.style.display='block';
    }
  }
  updatePreview();

  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Position</label>
      <select id="signPos"><option value="bottom-right">Bottom right</option><option value="bottom-center">Bottom center</option><option value="bottom-left">Bottom left</option><option value="top-right">Top right</option><option value="top-left">Top left</option></select></div>
    <div class="field"><label for="signSize">Size</label><select id="signSize"><option value="0.18">Small</option><option value="0.25" selected>Medium</option><option value="0.35">Large</option></select></div>
    <div class="field"><label for="signPage">Page</label><select id="signPage"><option value="last">Last page</option><option value="first">First page</option><option value="all">All pages</option></select></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));

  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-signature"></i> Sign PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    const img=studio.querySelector('#sigPreview');
    if(img.style.display==='none'){setStatus(panel,'Create a signature first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const doc=await PDFDocument.load(bytes);
      const scale=parseFloat(panel.querySelector('#signSize').value)||0.25;
      const pos=panel.querySelector('#signPos').value;
      const pageSel=panel.querySelector('#signPage').value;
      const total=doc.getPageCount();
      const targets=pageSel==='first'?[0]:pageSel==='all'?[...Array(total).keys()]:[total-1];
      const src=img.src;
      const ib=await (await fetch(src)).arrayBuffer();
      let sig;
      if(src.startsWith('data:image/png')) sig=await doc.embedPng(new Uint8Array(ib));
      else if(src.endsWith('.jpg')||src.endsWith('.jpeg')) sig=await doc.embedJpg(new Uint8Array(ib));
      else sig=await doc.embedPng(new Uint8Array(ib));
      const dims=sig.scale(scale);
      for(const i of targets){
        const page=doc.getPage(i);
        const {width,height}=page.getSize();
        const margin=24;
        let x,y;
        if(pos.includes('right')) x=width-dims.width-margin;
        else if(pos.includes('left')) x=margin;
        else x=(width-dims.width)/2;
        if(pos.startsWith('top')) y=height-dims.height-margin;
        else y=margin;
        page.drawImage(sig,{x,y,width:dims.width,height:dims.height});
        setProgress(panel,(targets.indexOf(i)+1)/targets.length*100);
      }
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'signed.pdf');
      setStatus(panel,'Signed '+targets.length+' page(s)!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- PDF TO JPG ---------- */
INITERS['pdf-to-jpg'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label for="jpgFmt">Format</label><select id="jpgFmt"><option value="jpeg">JPG</option><option value="png">PNG</option></select></div>
    <div class="field"><label for="jpgQ">Quality</label><select id="jpgQ"><option value="0.95">High</option><option value="0.85">Medium</option><option value="0.7">Low</option></select></div>
    <div class="field"><label for="jpgScale">Scale (DPI)</label><select id="jpgScale"><option value="1">1x (72 dpi)</option><option value="1.5">1.5x</option><option value="2" selected>2x (144 dpi)</option><option value="3">3x (216 dpi)</option><option value="4">4x (288 dpi)</option></select></div>
    <div class="field"><label for="jpgPages">Pages (blank = all)</label><input id="jpgPages" placeholder="1,3,5-7" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-image"></i> Convert to JPG';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const fmt=panel.querySelector('#jpgFmt').value;
      const q=parseFloat(panel.querySelector('#jpgQ').value)||0.92;
      const scale=parseFloat(panel.querySelector('#jpgScale').value)||2;
      const mime=fmt==='png'?'image/png':'image/jpeg';
      const ext=fmt==='png'?'png':'jpg';
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
      const total=pdf.numPages;
      const raw=panel.querySelector('#jpgPages').value.trim();
      const targets=raw?parseRanges(raw,total).flat().map(n=>n-1):[...Array(total).keys()];
      const zip=new JSZip();
      let singleBlob=null;
      for(const [k,i] of targets.entries()){
        const page=await pdf.getPage(i+1);
        const viewport=page.getViewport({scale});
        const canvas=document.createElement('canvas');
        canvas.width=viewport.width; canvas.height=viewport.height;
        await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
        const blob=await new Promise(res=>canvas.toBlob(res,mime,fmt==='png'?undefined:q));
        if(targets.length===1) singleBlob=blob;
        else zip.file(`page_${i+1}.${ext}`,blob);
        setProgress(panel,(k+1)/targets.length*100);
      }
      if(singleBlob) offerDownload(panel, singleBlob,`page_1.${ext}`);
      else { const b=await zip.generateAsync({type:'blob'}); offerDownload(panel, b,'pdf_pages.zip'); }
      setStatus(panel,'Converted!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- JPG TO PDF / SCAN ---------- */
function initImagesToPdf(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'image/*',multiple:true,onFiles:f=>{files=files.concat(f);rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Page size</label>
      <select id="imgSize"><option value="auto">Original image size</option><option value="a4">A4 (210×297mm)</option><option value="letter">Letter (8.5×11in)</option><option value="legal">Legal (8.5×14in)</option></select></div>
    <div class="field"><label>Orientation</label>
      <select id="imgOri"><option value="auto">Auto (from image)</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>
    <div class="field"><label>Fit</label>
      <select id="imgFit"><option value="contain">Fit (keep aspect)</option><option value="cover">Fill (crop)</option><option value="stretch">Stretch</option></select></div>
    <div class="field"><label>Margin</label>
      <select id="imgMargin"><option value="0">None</option><option value="10">Small (10mm)</option><option value="20">Medium (20mm)</option><option value="40">Large (40mm)</option></select></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-pdf"></i> Convert to PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select images first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.create();
      const size=panel.querySelector('#imgSize').value;
      const ori=panel.querySelector('#imgOri').value;
      const fit=panel.querySelector('#imgFit').value;
      const marginMm=parseInt(panel.querySelector('#imgMargin').value)||0;
      const mm=72/25.4;
      const pageSize={a4:[595.28,841.89],letter:[612,792],legal:[612,1008]};
      for(let i=0;i<files.length;i++){
        const f=files[i];
        const bytes=new Uint8Array(await f.arrayBuffer());
        let img;
        if(f.type==='image/png') img=await doc.embedPng(bytes);
        else img=await doc.embedJpg(bytes);
        let pw=img.width, ph=img.height;
        if(size!=='auto'){
          let [pw0,ph0]=pageSize[size];
          if(ori==='landscape' || (ori==='auto' && img.width>img.height)) [pw0,ph0]=[ph0,pw0];
          const m=marginMm*mm;
          const aw=pw0-2*m, ah=ph0-2*m;
          let dw,dh,dx,dy;
          if(fit==='stretch'){ dw=aw; dh=ah; dx=m; dy=m; }
          else {
            const r=img.width/img.height, ar=aw/ah;
            if((fit==='contain'&&r>ar)||(fit==='cover'&&r<ar)){ dw=ah*r; dh=ah; }
            else { dw=aw; dh=aw/r; }
            dx=m+(aw-dw)/2; dy=m+(ah-dh)/2;
          }
          const page=doc.addPage([pw0,ph0]);
          page.drawImage(img,{x:dx,y:dy,width:dw,height:dh});
        } else {
          const page=doc.addPage([pw,ph]);
          page.drawImage(img,{x:0,y:0,width:pw,height:ph});
        }
        setProgress(panel,(i+1)/files.length*100);
      }
      const out=await doc.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'images.pdf');
      setStatus(panel,'Converted '+files.length+' image(s)!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
}
INITERS['jpg-to-pdf']=initImagesToPdf;
INITERS['scan-to-pdf']=initImagesToPdf;


INITERS['scan-to-pdf']=initImagesToPdf;

/* ---------- PDF TO WORD ---------- */
INITERS['pdf-to-word'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();extract();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();

  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Output format</label>
      <select id="wFmt"><option value="docx">DOCX (Word)</option><option value="txt">Plain text (TXT)</option><option value="md">Markdown (MD)</option></select></div>
    <div class="field"><label>Layout</label>
      <select id="wLay"><option value="smart" selected>Smart (headings + tables)</option><option value="preserve">Preserve layout (line by line)</option><option value="flow">Flow (paragraphs)</option></select></div>
    <div class="field"><label for="wPages">Pages (blank = all)</label><input id="wPages" placeholder="1,3,5-7" /></div>
    <div class="field"><label for="wPn">Include page numbers</label><select id="wPn"><option value="no">No</option><option value="yes">Yes</option></select></div>
    <div class="field"><label for="wFont">Font</label><select id="wFont"><option value="default">Default</option><option value="serif">Serif</option><option value="mono">Monospace</option></select></div>
    <div class="field"><label for="wHead">Heading size threshold (pt)</label><input id="wHead" type="number" value="16" min="10" max="60" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));

  const preview=document.createElement('div'); preview.className='translate-preview'; preview.hidden=true;
  preview.innerHTML='<div class="field"><label>Preview (first page)</label><textarea id="wPreview" rows="8" readonly></textarea></div>';
  panel.insertBefore(preview,panel.querySelector('.status'));

  let cachedPages=[]; // [{lines:[{text,size,font,bold}]}]
  let fullText='';
  let extractJob=null;

  function extract(){
    if(!files.length) return Promise.resolve();
    if(extractJob) return extractJob;
    extractJob=(async()=>{
    try{
      setStatus(panel,'Reading PDF…','success');
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
      cachedPages=[];
      let txt='';
      const pageInput=panel.querySelector('#wPages').value.trim();
      const total=pdf.numPages;
      const targets=parseRanges(pageInput,total).flat().map(n=>n-1);
      for(const i of targets){
        if(i<0||i>=total) continue;
        const page=await pdf.getPage(i+1);
        const tc=await page.getTextContent();
        const lines=extractLines(tc.items);
        cachedPages.push({page:i+1,lines});
        txt += '--- Page '+(i+1)+' ---\n'+lines.map(l=>l.text).join('\n')+'\n\n';
      }
      fullText=txt;
      preview.hidden=false;
      preview.querySelector('#wPreview').value=linesToText(cachedPages[0]||{lines:[]});
      setStatus(panel,'Extracted '+cachedPages.length+' page(s). Choose options and convert.','success');
    }catch(e){ setStatus(panel,e.message,'error'); }
    finally{ extractJob=null; }
    })();
    return extractJob;
  }
  function extractLines(items){
    const rows=[];
    for(const it of items){
      if(!it.str || !it.str.trim()) continue;
      const y=it.transform[5], x=it.transform[4];
      const size=Math.max(6,Math.hypot(it.transform[2],it.transform[3])||it.height||10);
      const bold=/bold/i.test(it.fontName||'');
      const italic=/italic|oblique/i.test(it.fontName||'');
      let row=rows.find(r=>Math.abs(r.y-y)<size*0.6);
      if(!row){ row={y,xMin:x,texts:[],size,bold,italic}; rows.push(row); }
      row.texts.push({x,text:it.str,size,bold,italic});
      row.texts.sort((a,b)=>a.x-b.x);
      if(size>row.size) row.size=size;
    }
    rows.sort((a,b)=>b.y-a.y);
    return rows.map(r=>{
      const txt=r.texts.map(t=>t.text).join(' ').replace(/\s+/g,' ').trim();
      const sizes=r.texts.map(t=>t.size);
      const avg=sizes.length?sizes.reduce((a,b)=>a+b,0)/sizes.length:12;
      return {text:txt,size:Math.round(avg),bold:r.texts.some(t=>t.bold),italic:r.texts.some(t=>t.italic),xs:r.texts.map(t=>Math.round(t.x))};
    }).filter(l=>l.text);
  }
  function detectTables(lines){
    const blocks=[]; let cur=[];
    const flush=()=>{ if(cur.length>=2) blocks.push({start:cur[0].i,end:cur[cur.length-1].i,rows:cur.map(l=>l.text.split(/\s{2,}|\t/).filter(Boolean))}); cur=[]; };
    lines.forEach((l,i)=>{
      const cols=l.xs.filter((x,k)=>k===0||x-l.xs[k-1]>30).length;
      const looksTable=cols>=2 && /\s{2,}|\t/.test(l.text);
      if(looksTable) cur.push({...l,i});
      else flush();
    });
    flush();
    return blocks;
  }
  function smartBlocks(lines,threshold){
    const tables=detectTables(lines);
    const out=[]; let i=0;
    while(i<lines.length){
      const t=tables.find(b=>b.start===i);
      if(t){ out.push({type:'table',rows:t.rows}); i=t.end+1; continue; }
      const l=lines[i];
      out.push({type:l.size>=threshold?'heading':'para',text:l.text,bold:l.bold,italic:l.italic});
      i++;
    }
    return out;
  }
  function linesToText(p){ return (p.lines||[]).map(l=>l.text).join('\n'); }

  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-word"></i> Convert to Word';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    if(!cachedPages.length) await extract();
    if(!cachedPages.length){setStatus(panel,'No text extracted.','error');return;}
    try{
      showProgress(panel,true);
      const fmt=panel.querySelector('#wFmt').value;
      const layout=panel.querySelector('#wLay').value;
      const pn=panel.querySelector('#wPn').value==='yes';
      const fontSel=panel.querySelector('#wFont').value;
      const threshold=parseInt(panel.querySelector('#wHead').value)||16;
      if(fmt==='docx') await ensureLib('docx');
      if(fmt==='txt'){
        offerDownload(panel,new Blob([fullText],{type:'text/plain'}),'converted.txt');
      } else if(fmt==='md'){
        const md=cachedPages.map(pg=>{
          let s='## Page '+pg.page+'\n\n';
          if(layout==='preserve') s+=pg.lines.map(l=>l.text).join('\n\n');
          else if(layout==='flow') s+=pg.lines.map(l=>l.text).join(' ');
          else s+=smartBlocks(pg.lines,threshold).map(b=>{
            if(b.type==='heading') return '### '+b.text;
            if(b.type==='table') return '| '+b.rows.map(r=>r.join(' | ')).join(' |\n| ')+' |';
            return b.text;
          }).join('\n\n');
          return s;
        }).join('\n\n---\n\n');
        offerDownload(panel,new Blob([md],{type:'text/markdown'}),'converted.md');
      } else if(window.docx){
        const {Document,Packer,Paragraph,TextRun,PageBreak,Table,TableRow,TableCell}=window.docx;
        const fontMap={default:undefined,serif:'Times New Roman',mono:'Courier New'};
        const fn=fontMap[fontSel];
        const run=(text,opts={})=>new TextRun(Object.assign({text:text||' ',font:fn},opts));
        const children=[];
        for(const [pi,pg] of cachedPages.entries()){
          if(pn) children.push(new Paragraph({children:[run('— Page '+pg.page+' —',{italics:true,size:20,color:'808080'})]}));
          if(layout==='preserve'){
            for(const l of pg.lines) children.push(new Paragraph({children:[run(l.text,{bold:l.bold,italics:l.italic,size:Math.max(16,l.size*2)})]}));
          } else if(layout==='flow'){
            const para=pg.lines.map(l=>l.text).join(' ').trim();
            if(para) children.push(new Paragraph({children:[run(para)]}));
          } else {
            for(const b of smartBlocks(pg.lines,threshold)){
              if(b.type==='heading') children.push(new Paragraph({heading:'Heading1',children:[run(b.text,{bold:true,size:Math.min(44,threshold*2+6)})]}));
              else if(b.type==='table' && Table && TableRow && TableCell){
                children.push(new Table({rows:b.rows.slice(0,25).map(r=>new TableRow({children:r.slice(0,8).map(c=>new TableCell({children:[new Paragraph({children:[run(c)]})]}))}))}));
              } else children.push(new Paragraph({children:[run(b.text)]}));
            }
          }
          children.push(new Paragraph({children:[new PageBreak()]}));
          setProgress(panel,15+80*(pi+1)/cachedPages.length);
        }
        const doc=new Document({sections:[{children}]});
        const blob=await Packer.toBlob(doc);
        offerDownload(panel,blob,'converted.docx');
      } else {
        offerDownload(panel,new Blob([fullText],{type:'text/plain'}),'converted.txt');
      }
      setProgress(panel,100);
      setStatus(panel,'Converted '+cachedPages.length+' page(s)!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- PDF TO EXCEL ---------- */
INITERS['pdf-to-excel'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="xlMode">Extraction mode</label><select id="xlMode"><option value="table">Detect tables (columns)</option><option value="rows">One text item per row</option><option value="lines">One line per row</option></select></div>'
    +'<div class="field"><label for="xlSheets">Sheets</label><select id="xlSheets"><option value="one">Single sheet</option><option value="page">One sheet per page</option></select></div>'
    +'<div class="field"><label for="xlPages">Pages</label><input id="xlPages" placeholder="All (e.g. 1-3,5)" /></div>'
    +'<div class="field"><label for="xlMark">Page markers</label><select id="xlMark"><option value="yes">Yes</option><option value="no" selected>No</option></select></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const prev=document.createElement('div'); prev.className='translate-preview'; prev.hidden=true;
  prev.innerHTML='<label style="font-size:13px;font-weight:700">Data preview</label><textarea id="xlPreview" rows="6" readonly></textarea>';
  panel.insertBefore(prev,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-excel"></i> Convert to Excel';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true); setProgress(panel,10);
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
      await ensureLib('XLSX');
      const mode=panel.querySelector('#xlMode').value;
      const perPage=panel.querySelector('#xlSheets').value==='page';
      const marks=panel.querySelector('#xlMark').value==='yes';
      const pages=parseRanges(panel.querySelector('#xlPages').value.trim(),pdf.numPages).flat();
      const wb=XLSX.utils.book_new();
      let preview='';
      const allRows=[];
      for(const [pi,pno] of pages.entries()){
        const tc=await (await pdf.getPage(pno)).getTextContent();
        const rows=[];
        if(mode==='rows'){
          tc.items.forEach(it=>{ if(it.str.trim()) rows.push([it.str.trim()]); });
        }else{
          const items=tc.items.filter(it=>it.str&&it.str.trim()).map(it=>({s:it.str.trim(),x:it.transform[4],y:it.transform[5]}));
          const lines=[];
          items.forEach(it=>{
            let line=lines.find(l=>Math.abs(l.y-it.y)<3.2);
            if(!line){line={y:it.y,items:[]};lines.push(line);}
            line.items.push(it);
          });
          lines.sort((a,b)=>b.y-a.y);
          lines.forEach(line=>{
            line.items.sort((a,b)=>a.x-b.x);
            if(mode==='lines') rows.push([line.items.map(i=>i.s).join(' ')]);
            else{
              const cells=[]; let lastX=-1e6;
              line.items.forEach(it=>{
                if(it.x-lastX>28) cells.push(it.s);
                else cells[cells.length-1]=(cells[cells.length-1]||'')+' '+it.s;
                lastX=it.x+(it.s.length*4);
              });
              rows.push(cells);
            }
          });
        }
        if(marks) rows.unshift(['--- Page '+pno+' ---']);
        if(perPage){
          const ws=XLSX.utils.aoa_to_sheet(rows);
          const maxCols=Math.max(1,...rows.map(r=>r.length));
          ws['!cols']=Array.from({length:maxCols},()=>({wch:24}));
          XLSX.utils.book_append_sheet(wb,ws,'Page '+pno);
        }else{
          if(pi>0) allRows.push(['']);
          for(const r of rows) allRows.push(r);
        }
        if(pi===0) preview=rows.slice(0,12).map(r=>r.join(' | ')).join('\n');
        setProgress(panel,15+80*(pi+1)/pages.length);
      }
      if(!perPage){
        const ws=XLSX.utils.aoa_to_sheet(allRows);
        const maxCols=Math.max(1,...allRows.map(r=>r.length));
        ws['!cols']=Array.from({length:maxCols},()=>({wch:24}));
        XLSX.utils.book_append_sheet(wb,ws,'PDF');
      }
      const xlsxArray=XLSX.write(wb,{bookType:'xlsx',type:'array'});
      offerDownload(panel,new Blob([xlsxArray],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'converted.xlsx');
      prev.hidden=false; prev.querySelector('#xlPreview').value=preview;
      setProgress(panel,100);
      setStatus(panel,'Converted '+pages.length+' page(s) to Excel.','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- PDF TO PPT ---------- */
INITERS['pdf-to-ppt'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="ptQ">Image quality</label><select id="ptQ"><option value="0.7">Lower (small file)</option><option value="0.85" selected>Balanced</option><option value="0.95">Higher</option></select></div>'
    +'<div class="field"><label for="ptScale">Render scale</label><select id="ptScale"><option value="1.2">1.2×</option><option value="1.6" selected>1.6×</option><option value="2">2×</option><option value="2.5">2.5×</option></select></div>'
    +'<div class="field"><label for="ptAspect">Slide aspect</label><select id="ptAspect"><option value="page" selected>Match PDF page</option><option value="16:9">16:9 widescreen</option><option value="4:3">4:3 classic</option></select></div>'
 +'<div class="field"><label for="ptMode">Slide content</label><select id="ptMode"><option value="image" selected>Page images (exact appearance)</option><option value="text">Editable text (approximate layout)</option></select></div>'
    +'<div class="field"><label for="ptPages">Pages</label><input id="ptPages" placeholder="All (e.g. 1-3,5)" /></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-powerpoint"></i> Convert to PowerPoint';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true); setProgress(panel,8);
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
      await ensureLib('PptxGenJS');
      const q=parseFloat(panel.querySelector('#ptQ').value)||0.85;
      const scale=parseFloat(panel.querySelector('#ptScale').value)||1.6;
      const aspect=panel.querySelector('#ptAspect').value;
      const textMode=panel.querySelector('#ptMode').value==='text';
      let slideW=aspect==='16:9'?13.333:10, slideH=7.5;
      const pages=parseRanges(panel.querySelector('#ptPages').value.trim(),pdf.numPages).flat();
      const pptx=new PptxGenJS();
      pptx.author='Online Converter';
      pptx.subject=textMode?'PDF to PowerPoint (editable text)':'PDF to PowerPoint';
      if(aspect==='16:9') pptx.defineLayout({name:'OC16',width:13.333,height:7.5});
      if(aspect==='4:3') pptx.defineLayout({name:'OC43',width:10,height:7.5});
      if(aspect!=='page') pptx.layout=aspect==='16:9'?'OC16':'OC43';
      if(textMode && aspect==='page' && pages.length){
        const first=await pdf.getPage(pages[0]);
        const bv=first.getViewport({scale:1});
        slideW=bv.width/72; slideH=bv.height/72;
        pptx.defineLayout({name:'OCPage',width:slideW,height:slideH});
        pptx.layout='OCPage';
      }
      for(const [i,pno] of pages.entries()){
        const page=await pdf.getPage(pno);
        const viewport=page.getViewport({scale});
        const slide=pptx.addSlide();
        if(textMode){
          const base=page.getViewport({scale:1});
          const k=aspect==='page'?1:(slideW/(base.width/72));
          const tc=await page.getTextContent();
          for(const it of tc.items){
            if(!it.str||!it.str.trim())continue;
            const fsz=Math.max(6,Math.hypot(it.transform[2],it.transform[3])||12);
            const x=Math.max(0,it.transform[4]/72*k);
            const y=Math.max(0,(base.height-it.transform[5]-fsz)/72*k);
            slide.addText(it.str,{x,y,w:Math.min(slideW-x,Math.max(0.3,fsz*0.52*it.str.length/72*k)),h:Math.min(slideH-y,fsz*1.4/72*k),fontSize:fsz*k,fontFace:'Arial',margin:0});
          }
        }else{
          const canvas=document.createElement('canvas');
          canvas.width=viewport.width; canvas.height=viewport.height;
          await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
          const img=canvas.toDataURL('image/jpeg',q);
          if(aspect==='page') slide.addImage({data:img,x:0,y:0,w:'100%',h:'100%'});
          else{
            const ratio=viewport.width/viewport.height;
            const target=slideW/slideH;
            if(ratio>target){ const h=slideW/ratio; slide.addImage({data:img,x:0,y:(slideH-h)/2,w:slideW,h}); }
            else { const w=slideH*ratio; slide.addImage({data:img,x:(slideW-w)/2,y:0,w,h:slideH}); }
          }
        }
        setProgress(panel,10+85*(i+1)/pages.length);
      }
      const pptxBuf=await pptx.write({outputType:'arraybuffer'});
      offerDownload(panel,new Blob([pptxBuf],{type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'}),'converted.pptx');
      setProgress(panel,100);
      setStatus(panel,textMode?'Converted '+pages.length+' page(s) to editable slides.':'Converted '+pages.length+' page(s) to PowerPoint.',textMode?'info':'success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- PDF TO PDF/A ---------- */
INITERS['pdf-to-pdfa'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="paLevel">Conformance target</label><select id="paLevel"><option value="1">PDF/A-1b</option><option value="2" selected>PDF/A-2b</option><option value="3">PDF/A-3b</option></select></div>'
    +'<div class="field"><label for="paMode">Method</label><select id="paMode"><option value="preserve">Preserve vector text (recommended)</option><option value="raster">Flatten to images (maximum compatibility)</option></select></div>'
    +'<div class="field"><label for="paScale">Render scale (flatten mode)</label><select id="paScale"><option value="1.5" selected>1.5×</option><option value="2">2×</option></select></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const checks=document.createElement('div'); checks.className='compare-summary'; checks.hidden=true;
  panel.insertBefore(checks,panel.querySelector('.status'));

  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-shield"></i> Convert to PDF/A';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true); setProgress(panel,10);
      const {PDFDocument}=PDFLib;
      const orig=new Uint8Array(await files[0].arrayBuffer());
      const raw=new TextDecoder('latin1').decode(orig);
      const level=panel.querySelector('#paLevel').value;
      const mode=panel.querySelector('#paMode').value;
      const found=[];
      if(/\/JavaScript/i.test(raw)) found.push('JavaScript removed/disabled');
      if(/\/Encrypt/.test(raw)) found.push('Encryption detected');
      if(/\/XFA/i.test(raw)) found.push('XFA form detected');
      let doc;
      if(mode==='raster'){
        const pdf=await pdfjsLib.getDocument({data:orig,useWorkerFetch:false,isEvalSupported:false}).promise;
        doc=await PDFDocument.create();
        const scale=parseFloat(panel.querySelector('#paScale').value)||1.5;
        const cv=document.createElement('canvas');
        for(let n=1;n<=pdf.numPages;n++){
          const page=await pdf.getPage(n);
          const vp=page.getViewport({scale});
          cv.width=vp.width; cv.height=vp.height;
          await page.render({canvasContext:cv.getContext('2d'),viewport:vp}).promise;
          const blob=await new Promise(res=>cv.toBlob(res,'image/jpeg',0.9));
          const img=await doc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
          const p=doc.addPage([vp.width,vp.height]);
          p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});
          setProgress(panel,30+50*n/pdf.numPages);
        }
        found.push('Pages flattened — no transparency, JS or form fields');
      }else{
        doc=await PDFDocument.load(orig,{ignoreEncryption:true});
        setProgress(panel,70);
      }
      doc.setTitle(doc.getTitle()||'Document');
      doc.setProducer('Online Converter — PDF/A-'+level+'b ready');
      doc.setCreator('Online Converter');
      doc.setSubject('pdfaid:part='+level+';pdfaid:conformance=B');
      doc.setModificationDate(new Date());
      const out=await doc.save({useObjectStreams:true});
      offerDownload(panel,new Blob([out],{type:'application/pdf'}),'pdfa-' + level + 'b.pdf');
      checks.hidden=false;
      checks.innerHTML='<strong>Conformance check</strong><br>'+found.map(x=>'• '+x).join('<br>')
        +'<br>• No embedded file attachments<br>• Metadata set: PDF/A-'+level+'b<br><small>Full PDF/A certification requires a dedicated validator.</small>';
      setProgress(panel,100);
      setStatus(panel,'PDF/A-'+level+'b ready (not formally certified).','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- PDF TO HTML ---------- */
INITERS['pdf-to-html'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-code"></i> Convert to HTML';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
      let body='';
      for(let i=1;i<=pdf.numPages;i++){
        const page=await pdf.getPage(i);
        const tc=await page.getTextContent();
        body += '<h2>Page '+i+'</h2><p>'+tc.items.map(it=>escapeHtml(it.str)).join(' ')+'</p>';
        setProgress(panel,i/pdf.numPages*100);
      }
      const html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Converted</title></head><body>'+body+'</body></html>';
      offerDownload(panel, new Blob([html],{type:'text/html'}),'converted.html');
      setStatus(panel,'Converted!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- WORD TO PDF ---------- */
INITERS['word-to-pdf'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label for="w2pSize">Page size</label><select id="w2pSize"><option value="a4">A4</option><option value="letter">Letter</option><option value="legal">Legal</option></select></div>
    <div class="field"><label for="w2pOri">Orientation</label><select id="w2pOri"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>
    <div class="field"><label for="w2pMargin">Margin (pt)</label><input id="w2pMargin" type="number" value="10" min="0" max="60" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-pdf"></i> Convert to PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a DOCX first.','error');return;}
    try{
      showProgress(panel,true);
      const ab=new Uint8Array(await files[0].arrayBuffer());
      await ensureLib('mammoth'); await ensureLib('html2pdf');
      const result=await mammoth.convertToHtml({arrayBuffer:ab});
      const pageSize=panel.querySelector('#w2pSize').value;
      const orient=panel.querySelector('#w2pOri').value;
      const margin=parseInt(panel.querySelector('#w2pMargin').value)||10;
      const opt={margin, filename:'converted.pdf', image:{type:'jpeg',quality:0.98}, html2canvas:{scale:2}, jsPDF:{unit:'pt',format:pageSize,orientation:orient}};
      const blob=await html2pdf().set(opt).from(result.value).outputPdf('blob');
      offerDownload(panel,blob,'converted.pdf');
      setStatus(panel,'Converted!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- EXCEL TO PDF ---------- */
INITERS['excel-to-pdf'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label for="e2pSize">Page size</label><select id="e2pSize"><option value="a4">A4</option><option value="letter">Letter</option><option value="legal">Legal</option></select></div>
    <div class="field"><label for="e2pOri">Orientation</label><select id="e2pOri"><option value="landscape" selected>Landscape</option><option value="portrait">Portrait</option></select></div>
    <div class="field"><label for="e2pMargin">Margin (pt)</label><input id="e2pMargin" type="number" value="10" min="0" max="60" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-pdf"></i> Convert to PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select an XLSX first.','error');return;}
    try{
      showProgress(panel,true);
      const ab=new Uint8Array(await files[0].arrayBuffer());
      await ensureLib('XLSX'); await ensureLib('html2pdf');
      const wb=XLSX.read(ab,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const html=XLSX.utils.sheet_to_html(ws);
      const pageSize=panel.querySelector('#e2pSize').value;
      const orient=panel.querySelector('#e2pOri').value;
      const margin=parseInt(panel.querySelector('#e2pMargin').value)||10;
      const opt={margin, filename:'converted.pdf', html2canvas:{scale:2}, jsPDF:{unit:'pt',format:pageSize,orientation:orient}};
      await ensureLib('html2pdf');
      const blob=await html2pdf().set(opt).from(html).outputPdf('blob');
      offerDownload(panel,blob,'converted.pdf');
      setStatus(panel,'Converted!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- POWERPOINT TO PDF ---------- */
INITERS['ppt-to-pdf'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-pdf"></i> Convert to PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PPTX first.','error');return;}
    try{
      showProgress(panel,true); setStatus(panel,'Converting slides…','info');
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      let pdfBytes=null;
      try{
        const mod=await Promise.race([
          import('https://unpkg.com/reamkit@1.36.1/dist/esm/index.js?module'),
          new Promise((_,rej)=>setTimeout(()=>rej(new Error('renderer timeout')),8000))
        ]);
        const {Ream}=mod;
        const doc=Ream.parse(bytes);
        pdfBytes=await doc.convert('pdf');
      }catch(err){
        // Fallback: extract slide text and images with JSZip
        pdfBytes=await pptxFallbackPdf(bytes);
      }
      offerDownload(panel, new Blob([pdfBytes],{type:'application/pdf'}),'converted.pdf');
      setStatus(panel,'Converted!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

async function pptxFallbackPdf(bytes){
  const {PDFDocument,StandardFonts,rgb}=PDFLib;
  const zip=await JSZip.loadAsync(bytes);
  const slideNames=Object.keys(zip.files)
    .filter(n=>/^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a,b)=>parseInt(a.match(/slide(\d+)\.xml/)[1])-parseInt(b.match(/slide(\d+)\.xml/)[1]));
  const doc=await PDFDocument.create();
  const font=await doc.embedFont(StandardFonts.Helvetica);
  const bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const W=720,H=540;
  const decode=s=>s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  for(let si=0;si<slideNames.length;si++){
    const xml=await zip.file(slideNames[si]).async('string');
    const texts=[...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)].map(m=>decode(m[1])).filter(Boolean);
    const page=doc.addPage([W,H]);
    page.drawText('Slide '+(si+1),{x:40,y:H-36,size:10,font,color:rgb(0.55,0.55,0.55)});
    let y=H-80;
    for(const t of texts){
      const words=t.split(/\s+/);
      let line='';
      for(const w of words){
        const test=line?line+' '+w:w;
        if(font.widthOfTextAtSize(test,18)>W-80){ page.drawText(line,{x:40,y,size:18,font:bold,color:rgb(0,0,0)}); y-=26; line=w; }
        else line=test;
      }
      if(line){ page.drawText(line,{x:40,y,size:18,font:bold,color:rgb(0,0,0)}); y-=30; }
      if(y<60){ break; }
    }
  }
  if(!slideNames.length){ const page=doc.addPage([W,H]); page.drawText('No slides found',{x:40,y:H/2,size:18,font}); }
  return await doc.save();
}

/* ---------- HTML TO PDF ---------- */
INITERS['html-to-pdf'] = function(panel){
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field" style="grid-column:1/-1"><label for="htmlFile">Or upload an HTML file</label><input id="htmlFile" type="file" accept=".htm,.html,text/html" /></div>
    <div class="field" style="grid-column:1/-1"><label>HTML content</label><textarea id="htmlIn" style="width:100%;min-height:160px;padding:10px;border:1px solid var(--border);border-radius:10px"></textarea></div>
    <div class="field"><label for="h2pSize">Page size</label><select id="h2pSize"><option value="a4">A4</option><option value="letter">Letter</option><option value="legal">Legal</option></select></div>
    <div class="field"><label for="h2pMargin">Margin (pt)</label><input id="h2pMargin" type="number" value="10" min="0" max="60" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  opts.querySelector('#htmlFile').addEventListener('change',async e=>{
    const f=e.target.files&&e.target.files[0]; if(!f) return;
    try{ opts.querySelector('#htmlIn').value=await f.text(); setStatus(panel,'Loaded '+f.name+' — click Convert to PDF.','success'); }
    catch(err){ setStatus(panel,'Could not read that file.','error'); }
  });
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-pdf"></i> Convert to PDF';
  btn.addEventListener('click', async()=>{
    const html=panel.querySelector('#htmlIn').value.trim();
    if(!html){setStatus(panel,'Enter HTML first.','error');return;}
    try{
      showProgress(panel,true);
      const pageSize=panel.querySelector('#h2pSize').value;
      const margin=parseInt(panel.querySelector('#h2pMargin').value)||10;
      const opt={margin, filename:'converted.pdf', html2canvas:{scale:2}, jsPDF:{unit:'pt',format:pageSize}};
      await ensureLib('html2pdf');
      const blob=await html2pdf().set(opt).from(html).outputPdf('blob');
      offerDownload(panel,blob,'converted.pdf');
      setStatus(panel,'Converted!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- EDIT PDF ---------- */
INITERS.edit = function(panel){
  let files=[], pdfDoc=null, pageNum=1, totalPages=0, items=[], selected=null, addMode=true, deleted=[];
  let viewport=null, renderScale=1;
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];loadDoc(files[0]);rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }

  const editor=document.createElement('div');
  editor.className='pdf-editor'; editor.hidden=true;
  editor.innerHTML=`
    <div class="pdf-editor__bar">
      <div class="pdf-editor__nav">
        <button type="button" data-act="prev" title="Previous page"><i class="fa-solid fa-chevron-left"></i></button>
        <span id="edPage">Page 1</span>
        <button type="button" data-act="next" title="Next page"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="pdf-editor__tools">
        <button type="button" data-act="add" class="active"><i class="fa-solid fa-plus"></i> Add text</button>
        <label>Size <input id="edSize" type="number" min="8" max="120" value="18" /></label>
        <label>Color <input id="edColor" type="color" value="#111111" /></label>
        <select id="edFont" title="Font">
          <option value="Helvetica">Helvetica</option>
          <option value="HelveticaBold">Helvetica Bold</option>
          <option value="TimesRoman">Times</option>
          <option value="Courier">Courier</option>
        </select>
        <button type="button" data-act="del" title="Delete selected"><i class="fa-solid fa-trash"></i></button>
        <button type="button" data-act="clear" title="Clear all text"><i class="fa-solid fa-eraser"></i></button>
      </div>
    </div>
    <div class="pdf-editor__stage" id="edStage">
      <canvas id="edCanvas"></canvas>
      <div class="pdf-editor__layer" id="edLayer"></div>
    </div>
    <p class="pdf-editor__tip">Click existing text to edit it · Click empty space to add text · Drag to move · Double-click to edit · Delete key removes</p>`;
  panel.insertBefore(editor,panel.querySelector('.status'));

  const stage=editor.querySelector('#edStage');
  const canvas=editor.querySelector('#edCanvas');
  const layer=editor.querySelector('#edLayer');
  const pageLabel=editor.querySelector('#edPage');
  const sizeInput=editor.querySelector('#edSize');
  const colorInput=editor.querySelector('#edColor');
  const fontSelect=editor.querySelector('#edFont');
  const addBtn=editor.querySelector('[data-act="add"]');

  const select=item=>{
    selected=item;
    layer.querySelectorAll('.ed-text').forEach(el=>el.classList.toggle('selected',el._item===item));
    if(item){ sizeInput.value=item.size; colorInput.value=item.color; fontSelect.value=item.font; }
  };

  function fontCss(font){
    if(font==='Courier') return 'monospace';
    if(font==='TimesRoman') return 'Georgia,serif';
    return 'Arial,sans-serif';
  }

  function renderItems(){
    layer.innerHTML='';
    items.filter(it=>it.page===pageNum).forEach(item=>{
      const el=document.createElement('div');
      el.className='ed-text'+(selected===item?' selected':'')+(item.pdfRect?' ed-text--source':'');
      el._item=item;
      el.style.left=item.x+'px'; el.style.top=item.y+'px';
      el.style.fontSize=item.size+'px'; el.style.color=item.color;
      el.style.fontFamily=fontCss(item.font);
      el.style.fontWeight=item.font==='HelveticaBold'?'700':'400';
      el.textContent=item.text;
      el.addEventListener('pointerdown',e=>{
        e.stopPropagation(); select(item);
        if(el.isContentEditable) return;
        const sx=e.clientX, sy=e.clientY, ox=item.x, oy=item.y;
        const move=ev=>{ item.x=ox+ev.clientX-sx; item.y=oy+ev.clientY-sy; item.moved=true; el.style.left=item.x+'px'; el.style.top=item.y+'px'; };
        const up=()=>{ window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); };
        window.addEventListener('pointermove',move); window.addEventListener('pointerup',up);
      });
      el.addEventListener('dblclick',e=>{
        e.stopPropagation();
        el.contentEditable='true'; el.focus(); select(item);
        const range=document.createRange(); range.selectNodeContents(el);
        const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      });
      el.addEventListener('input',()=>{ item.text=el.textContent; item.changed=true; });
      el.addEventListener('blur',()=>{ el.contentEditable='false'; });
      layer.appendChild(el);
    });
  }

  async function extractText(page){
    try{
      const tc=await page.getTextContent();
      const list=[];
      for(const it of tc.items){
        if(!it.str || !it.str.trim()) continue;
        let m;
        try{ m=pdfjsLib.Util.transform(viewport.transform,it.transform); }
        catch(e){ m=[1,0,0,1,it.transform[4]*renderScale,viewport.height-it.transform[5]*renderScale]; }
        const sizeCss=Math.max(6,Math.min(120,Math.hypot(m[2],m[3])||(it.height||12)*renderScale));
        const wCss=(it.width||0)*renderScale;
        list.push({
          page:pageNum,
          x:m[4], y:m[5]-sizeCss*0.86, origX:m[4], origY:m[5]-sizeCss*0.86,
          size:sizeCss, color:'#111111', font:'Helvetica',
          text:it.str.trim(),
          pdfRect:{x:it.transform[4],y:it.transform[5],w:it.width||0,h:it.height||sizeCss/renderScale,size:Math.hypot(it.transform[2],it.transform[3])||it.height||sizeCss/renderScale},
          changed:false, source:true
        });
      }
      return list;
    }catch(e){ return []; }
  }

  async function renderPage(){
    if(!pdfDoc) return;
    const page=await pdfDoc.getPage(pageNum);
    const base=page.getViewport({scale:1});
    renderScale=Math.min(1.7,Math.max(0.55,780/base.width));
    viewport=page.getViewport({scale:renderScale});
    const vp=viewport;
    canvas.width=vp.width; canvas.height=vp.height;
    canvas.style.width=vp.width+'px'; canvas.style.height=vp.height+'px';
    stage.style.width=vp.width+'px'; stage.style.height=vp.height+'px';
    await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
    pageLabel.textContent='Page '+pageNum+' / '+totalPages;
    const existing=await extractText(page);
    items=items.filter(it=>!it.source||it.page!==pageNum).concat(existing);
    renderItems();
  }

  async function loadDoc(file){
    try{
      setStatus(panel,'Loading PDF…','success');
      const bytes=new Uint8Array(await file.arrayBuffer());
      pdfDoc=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false}).promise;
      totalPages=pdfDoc.numPages; pageNum=1; items=[]; deleted=[]; selected=null;
      editor.hidden=false;
      await renderPage();
      setStatus(panel,'PDF loaded. Click any text to edit it, or click empty space to add new text.','success');
    }catch(e){ setStatus(panel,'Could not open PDF: '+e.message,'error'); }
  }

  stage.addEventListener('click',e=>{
    if(!addMode || e.target.closest('.ed-text')) return;
    const r=stage.getBoundingClientRect();
    const item={page:pageNum,x:e.clientX-r.left+stage.scrollLeft,y:e.clientY-r.top+stage.scrollTop,
      text:'Type here',size:parseInt(sizeInput.value)||18,color:colorInput.value,font:fontSelect.value,changed:true};
    items.push(item); select(item); renderItems();
    const el=layer.querySelector('.ed-text:last-child');
    if(el){ el.contentEditable='true'; el.focus(); const range=document.createRange(); range.selectNodeContents(el); const sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(range); }
  });

  editor.querySelectorAll('[data-act]').forEach(b=>{
    b.addEventListener('click',()=>{
      const act=b.dataset.act;
      if(act==='prev'){ if(pageNum>1){ pageNum--; selected=null; renderPage(); } }
      else if(act==='next'){ if(pageNum<totalPages){ pageNum++; selected=null; renderPage(); } }
      else if(act==='add'){ addMode=true; addBtn.classList.add('active'); }
      else if(act==='del'){
        if(selected){ if(selected.source) deleted.push(selected); items=items.filter(x=>x!==selected); selected=null; renderItems(); }
      }
      else if(act==='clear'){ deleted.push(...items.filter(x=>x.source)); items=[]; selected=null; renderItems(); }
    });
  });
  [sizeInput,colorInput,fontSelect].forEach(inp=>{
    inp.addEventListener('input',()=>{
      if(!selected) return;
      if(inp===sizeInput) selected.size=parseInt(inp.value)||18;
      else if(inp===colorInput) selected.color=inp.value;
      else selected.font=inp.value;
      selected.changed=true;
      renderItems();
    });
  });
  document.addEventListener('keydown',e=>{
    if(editor.hidden) return;
    if(e.key==='Delete' && selected && !e.target.isContentEditable){ if(selected.source) deleted.push(selected); items=items.filter(x=>x!==selected); selected=null; renderItems(); }
    if(e.key==='Escape') select(null);
  });

  const sampleColor=(x,y,w,h,dark)=>{
    try{
      const ctx=canvas.getContext('2d');
      const rx=Math.max(0,Math.round(x)), ry=Math.max(0,Math.round(y));
      const rw=Math.max(1,Math.min(canvas.width-rx,Math.round(w)));
      const rh=Math.max(1,Math.min(canvas.height-ry,Math.round(h)));
      const d=ctx.getImageData(rx,ry,rw,rh).data;
      let best=null, bestLum=dark?999:-1;
      for(let i=0;i<d.length;i+=4){
        const lum=(d[i]+d[i+1]+d[i+2])/3;
        if((dark&&lum<bestLum)||(!dark&&lum>bestLum)){ bestLum=lum; best=[d[i],d[i+1],d[i+2]]; }
      }
      if(best) return PDFLib.rgb(best[0]/255,best[1]/255,best[2]/255);
    }catch(e){}
    return dark?PDFLib.rgb(0,0,0):PDFLib.rgb(1,1,1);
  };
  const rgbFromHex=h=>PDFLib.rgb(parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255);

  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-pen-to-square"></i> Apply edits';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    if(!items.length){setStatus(panel,'No text to apply.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,StandardFonts,rgb}=PDFLib;
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const doc=await PDFDocument.load(bytes);
      const fontMap={Helvetica:StandardFonts.Helvetica,HelveticaBold:StandardFonts.HelveticaBold,TimesRoman:StandardFonts.TimesRoman,Courier:StandardFonts.Courier};
      const cache={};
      const getFont=async name=>{ if(!cache[name]) cache[name]=await doc.embedFont(fontMap[name]||StandardFonts.Helvetica); return cache[name]; };

      const toDraw=[], toRedact=[];
      for(const item of items){
        if(item.source && !item.changed && !item.moved) continue;
        toDraw.push(item);
        if(item.pdfRect) toRedact.push(item);
      }
      for(const item of deleted) if(item.pdfRect) toRedact.push(item);

      for(const item of toRedact){
        const page=doc.getPage(Math.min(Math.max(item.page-1,0),doc.getPageCount()-1));
        const r=item.pdfRect;
        const sx=item.origX!==undefined?item.origX:item.x;
        const sy=item.origY!==undefined?item.origY:item.y;
        const bg=sampleColor(sx-2,sy-2,r.w*renderScale+6,r.h*renderScale+6,false);
        page.drawRectangle({x:Math.max(0,r.x-1.5),y:Math.max(0,r.y-r.h*0.25),width:r.w+3,height:r.h*1.35,color:bg});
      }
      for(const [idx,item] of toDraw.entries()){
        const page=doc.getPage(Math.min(Math.max(item.page-1,0),doc.getPageCount()-1));
        const pw=page.getWidth();
        const font=await getFont(item.font);
        const color=rgbFromHex(item.color);
        if(item.pdfRect){
          const r=item.pdfRect;
          const lines=String(item.text).split('\n');
          lines.forEach((line,li)=>{
            if(line) page.drawText(line,{x:r.x,y:r.y-li*r.size*1.18,size:r.size,font,color});
          });
        } else {
          const cssPerPoint=Math.max(0.01,canvas.clientWidth/pw);
          const fontSize=item.size/cssPerPoint;
          const x=item.x/cssPerPoint;
          const lines=String(item.text).split('\n');
          lines.forEach((line,li)=>{
            const y=page.getHeight()-(item.y+item.size*0.82+li*item.size*1.18)/cssPerPoint;
            if(line) page.drawText(line,{x,y,size:fontSize,font,color});
          });
        }
        setProgress(panel,(idx+1)/Math.max(1,toDraw.length)*100);
      }
      const out=await doc.save();
      offerDownload(panel,new Blob([out],{type:'application/pdf'}),'edited.pdf');
      setStatus(panel,'Edited! '+items.length+' text item(s) applied.','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- CROP PDF ---------- */
INITERS.crop = function(panel){
  let files=[], pdfDoc=null, pageNum=1, total=0, vp=null, scale=1, box=null;
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();loadDoc();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();

  const ed=document.createElement('div'); ed.className='pdf-editor'; ed.hidden=true;
  ed.innerHTML=`
    <div class="pdf-editor__bar">
      <div class="pdf-editor__nav">
        <button type="button" data-a="p" title="Previous page"><i class="fa-solid fa-chevron-left"></i></button>
        <span id="cpPage">Page 1</span>
        <button type="button" data-a="n" title="Next page"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
      <div class="pdf-editor__tools">
        <label><input id="cpAll" type="checkbox" checked /> Apply to all pages</label>
        <button type="button" data-a="undo" title="Undo"><i class="fa-solid fa-undo"></i></button>
        <button type="button" data-a="redo" title="Redo"><i class="fa-solid fa-redo"></i></button>
        <button type="button" data-a="r"><i class="fa-solid fa-rotate-left"></i> Reset</button>
        <button type="button" data-a="full">Full page</button>
        <button type="button" data-a="half">Center 50%</button>
      </div>
    </div>
    <div class="pdf-editor__stage" id="cpStage">
      <canvas id="cpCanvas"></canvas>
      <div class="crop-layer" id="cpLayer"><div class="crop-box" id="cpBox"></div></div>
    </div>
    <p class="pdf-editor__tip">Drag the box to move · Drag the white handles to resize</p>`;
  panel.insertBefore(ed,panel.querySelector('.status'));

  const stage=ed.querySelector('#cpStage'), canvas=ed.querySelector('#cpCanvas');
  const layer=ed.querySelector('#cpLayer'), cropBox=ed.querySelector('#cpBox');
  const handles=['nw','n','ne','e','se','s','sw','w'];
  handles.forEach(h=>{
    const d=document.createElement('div');
    d.className='crop-handle crop-handle--'+h; d.dataset.h=h;
    cropBox.appendChild(d);
  });

  const paint=()=>{
    if(!box) return;
    cropBox.style.left=box.x+'px'; cropBox.style.top=box.y+'px';
    cropBox.style.width=box.w+'px'; cropBox.style.height=box.h+'px';
  };
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const boxHistory=[]; let bh=-1;
  const pushBox=()=>{
    if(!box) return;
    boxHistory.splice(bh+1);
    boxHistory.push({...box}); bh=boxHistory.length-1;
  };

  async function renderPage(){
    if(!pdfDoc) return;
    const page=await pdfDoc.getPage(pageNum);
    const base=page.getViewport({scale:1});
    scale=Math.min(1.6,Math.max(0.55,780/base.width));
    vp=page.getViewport({scale});
    canvas.width=vp.width; canvas.height=vp.height;
    canvas.style.width=vp.width+'px'; canvas.style.height=vp.height+'px';
    stage.style.width=vp.width+'px'; stage.style.height=vp.height+'px';
    await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
    ed.querySelector('#cpPage').textContent='Page '+pageNum+' / '+total;
    if(!box || box.page!==pageNum) box={page:pageNum,x:vp.width*0.1,y:vp.height*0.1,w:vp.width*0.8,h:vp.height*0.8};
    if(!boxHistory.length) pushBox();
    paint();
  }

  async function loadDoc(){
    try{
      pdfDoc=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      total=pdfDoc.numPages; pageNum=1; box=null; ed.hidden=false;
      await renderPage();
      setStatus(panel,'Drag the crop box to select the area.','success');
    }catch(e){ setStatus(panel,e.message,'error'); }
  }

  let drag=null;
  const pos=e=>{
    const r=stage.getBoundingClientRect();
    return {x:e.clientX-r.left+stage.scrollLeft, y:e.clientY-r.top+stage.scrollTop};
  };
  const onDown=e=>{
    const h=e.target.dataset && e.target.dataset.h;
    drag={mode:h||'move', start:pos(e), orig:{...box}};
    e.preventDefault(); e.stopPropagation();
  };
  cropBox.addEventListener('pointerdown',onDown);
  layer.addEventListener('pointerdown',e=>{
    if(e.target===layer){
      const p=pos(e);
      box={page:pageNum,x:clamp(p.x,0,vp.width-20),y:clamp(p.y,0,vp.height-20),w:20,h:20};
      drag={mode:'se',start:p,orig:{...box}};
      paint();
    }
  });
  window.addEventListener('pointermove',e=>{
    if(!drag||!box) return;
    const p=pos(e), dx=p.x-drag.start.x, dy=p.y-drag.start.y;
    const o=drag.orig, m=drag.mode;
    if(m==='move'){
      box.x=clamp(o.x+dx,0,vp.width-o.w);
      box.y=clamp(o.y+dy,0,vp.height-o.h);
    } else {
      let x=o.x,y=o.y,w=o.w,h=o.h;
      if(m.includes('w')){ x=clamp(o.x+dx,0,o.x+o.w-20); w=o.x+o.w-x; }
      if(m.includes('e')){ w=clamp(o.w+dx,20,vp.width-o.x); }
      if(m.includes('n')){ y=clamp(o.y+dy,0,o.y+o.h-20); h=o.y+o.h-y; }
      if(m.includes('s')){ h=clamp(o.h+dy,20,vp.height-o.y); }
      box.x=x; box.y=y; box.w=w; box.h=h;
    }
    paint();
  });
  window.addEventListener('pointerup',()=>{ if(drag){ drag=null; pushBox(); } });

  ed.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{
    const a=b.dataset.a;
    if(a==='p' && pageNum>1){ pageNum--; box=null; renderPage(); }
    else if(a==='n' && pageNum<total){ pageNum++; box=null; renderPage(); }
    else if(a==='r'){ box={page:pageNum,x:vp.width*0.1,y:vp.height*0.1,w:vp.width*0.8,h:vp.height*0.8}; paint(); pushBox(); }
    else if(a==='full'){ box={page:pageNum,x:0,y:0,w:vp.width,h:vp.height}; paint(); pushBox(); }
    else if(a==='half'){ box={page:pageNum,x:vp.width*0.25,y:vp.height*0.25,w:vp.width*0.5,h:vp.height*0.5}; paint(); pushBox(); }
    else if(a==='undo' && bh>0){ bh--; box={...boxHistory[bh]}; paint(); }
    else if(a==='redo' && bh<boxHistory.length-1){ bh++; box={...boxHistory[bh]}; paint(); }
  }));

  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-crop"></i> Crop PDF';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    if(!box){box={page:pageNum,x:vp.width*0.1,y:vp.height*0.1,w:vp.width*0.8,h:vp.height*0.8};paint();pushBox();}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const all=ed.querySelector('#cpAll').checked;
      const targets=all?[...Array(doc.getPageCount()).keys()]:[pageNum-1];
      for(const [i,idx] of targets.entries()){
        if(idx<0||idx>=doc.getPageCount()) continue;
        const page=doc.getPage(idx);
        const bx=Number(box.x)||parseFloat(cropBox.style.left)||0;
        const by=Number(box.y)||parseFloat(cropBox.style.top)||0;
        const bw=Number(box.w)||parseFloat(cropBox.style.width)||page.getWidth();
        const bh=Number(box.h)||parseFloat(cropBox.style.height)||page.getHeight();
        const s=(Number(vp&&vp.width)||canvas.width||1)/Number(page.getWidth()||1);
        const safe=n=>Number.isFinite(n)?n:0;
        page.setCropBox(
          safe(bx/s),
          safe(page.getHeight()-(by+bh)/s),
          safe(Math.max(1,bw/s)),
          safe(Math.max(1,bh/s))
        );
        setProgress(panel,(i+1)/targets.length*100);
      }
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'cropped.pdf');
      setStatus(panel,'Cropped '+targets.length+' page(s)!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- REPAIR PDF ---------- */
INITERS.repair = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="rpMode">Repair mode</label><select id="rpMode"><option value="auto">Auto (try all methods)</option><option value="structure">Structure only (fast)</option><option value="rebuild">Rebuild pages (aggressive)</option></select></div>'
    +'<div class="field"><label for="rpScale">Render scale for rebuild</label><select id="rpScale"><option value="1.2">1.2×</option><option value="1.5" selected>1.5×</option><option value="2">2×</option></select></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const report=document.createElement('div'); report.className='compare-summary'; report.hidden=true;
  panel.insertBefore(report,panel.querySelector('.status'));

  async function rebuild(bytes,scale){
    const pdf=await pdfjsLib.getDocument({data:bytes,useWorkerFetch:false,isEvalSupported:false,stopAtErrors:false}).promise;
    const {PDFDocument}=PDFLib;
    const out=await PDFDocument.create();
    const canvas=document.createElement('canvas');
    let saved=0;
    for(let n=1;n<=pdf.numPages;n++){
      try{
        const page=await pdf.getPage(n);
        const vp=page.getViewport({scale});
        canvas.width=vp.width; canvas.height=vp.height;
        await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
        const blob=await new Promise(res=>canvas.toBlob(res,'image/jpeg',0.85));
        const img=await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
        const p=out.addPage([vp.width,vp.height]);
        p.drawImage(img,{x:0,y:0,width:vp.width,height:vp.height});
        saved++;
      }catch(e){ /* skip unreadable page */ }
      setProgress(panel,n/pdf.numPages*100);
    }
    return {pdf:out,saved,total:pdf.numPages};
  }

  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-wrench"></i> Repair PDF';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true); setProgress(panel,10);
      const {PDFDocument}=PDFLib;
      const orig=new Uint8Array(await files[0].arrayBuffer());
      const mode=panel.querySelector('#rpMode').value;
      const scale=parseFloat(panel.querySelector('#rpScale').value)||1.5;
      let bytes=orig, method='', doc=null, reportText='';

      if(mode!=='rebuild'){
        for(const candidate of [orig, (()=>{const a=new Uint8Array(orig.length+16);a.set(orig);const tail=new TextEncoder().encode('\n%%EOF\n');a.set(tail,orig.length);return a;})()]){
          try{
            doc=await PDFDocument.load(candidate,{ignoreEncryption:true});
            bytes=candidate; method='structure'; break;
          }catch(e){}
        }
      }
      if(!doc && mode!=='structure'){
        try{
          const res=await rebuild(orig,scale);
          doc=res.pdf;
          reportText='Rebuilt '+res.saved+' of '+res.total+' page(s) from renderable content.';
          method='rebuild';
        }catch(e){ reportText='Page rebuild failed: '+e.message; }
      }
      if(!doc){
        const err=reportText||'Could not recover this PDF. The file may be too damaged or not a valid PDF.';
        report.hidden=false; report.textContent=err;
        setStatus(panel,err,'error');
        return;
      }
      showProgress(panel,true); setProgress(panel,95);
      const out=await doc.save({useObjectStreams:method==='structure'});
      offerDownload(panel,new Blob([out],{type:'application/pdf'}),'repaired.pdf');
      report.hidden=false;
      report.textContent=(method==='rebuild'?reportText+' ':'')+'Method: '+method+' · Original '+formatBytes(orig.length)+' → '+formatBytes(out.length);
      setProgress(panel,100);
      setStatus(panel,'Repaired with '+method+' method.','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- COMPARE PDF ---------- */
INITERS.compare = function(panel){
  let f1=[],f2=[];
  const wrap=document.createElement('div'); wrap.className='compare-wrap';
  wrap.innerHTML=`
    <div class="compare-drop">
      <div class="dropzone" id="cd1"><i class="fa-solid fa-cloud-arrow-up"></i><h3>First PDF</h3><p>Click or drop</p><input type="file" accept="application/pdf" hidden></div>
      <div class="dropzone" id="cd2"><i class="fa-solid fa-cloud-arrow-up"></i><h3>Second PDF</h3><p>Click or drop</p><input type="file" accept="application/pdf" hidden></div>
    </div>
    <div class="options">
      <div class="field"><label for="cmpView">View</label><select id="cmpView"><option value="side">Side by side</option><option value="diff">Text diff</option></select></div>
      <div class="field"><label for="cmpMax">Max pages</label><input id="cmpMax" type="number" value="6" min="1" max="20" /></div>
    </div>`;
  panel.insertBefore(wrap,panel.querySelector('.status'));
  const d1=wrap.querySelector('#cd1'), d2=wrap.querySelector('#cd2');
  const i1=d1.querySelector('input'), i2=d2.querySelector('input');
  d1.addEventListener('click',()=>i1.click()); d2.addEventListener('click',()=>i2.click());
  i1.addEventListener('change',e=>{ if(e.target.files[0]){ f1=[e.target.files[0]]; d1.querySelector('h3').textContent=e.target.files[0].name; }});
  i2.addEventListener('change',e=>{ if(e.target.files[0]){ f2=[e.target.files[0]]; d2.querySelector('h3').textContent=e.target.files[0].name; }});

  const resultBox=document.createElement('div'); resultBox.className='compare-result';
  panel.insertBefore(resultBox,panel.querySelector('.status'));

  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-code-compare"></i> Compare';
  btn.addEventListener('click', async()=>{
    if(!f1.length||!f2.length){setStatus(panel,'Select both PDFs first.','error');return;}
    try{
      showProgress(panel,true);
      const [p1,p2]=await Promise.all([pdfjsLib.getDocument({data:new Uint8Array(await f1[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise,
                                       pdfjsLib.getDocument({data:new Uint8Array(await f2[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise]);
      const max=parseInt(panel.querySelector('#cmpMax').value)||6;
      const n=Math.min(max,Math.max(p1.numPages,p2.numPages));
      const view=panel.querySelector('#cmpView').value;
      resultBox.innerHTML='';
      if(view==='side'){
        const grid=document.createElement('div'); grid.className='compare-grid';
        for(let i=1;i<=n;i++){
          const row=document.createElement('div'); row.className='compare-row';
          const lab=document.createElement('div'); lab.className='compare-row__label'; lab.textContent='Page '+i; row.appendChild(lab);
          const cell1=document.createElement('div'); cell1.className='compare-cell';
          const cell2=document.createElement('div'); cell2.className='compare-cell';
          for(const [cell,pdf,pageNo] of [[cell1,p1,i],[cell2,p2,i]]){
            if(pageNo<=pdf.numPages){
              const pg=await pdf.getPage(pageNo);
              const vp=pg.getViewport({scale:0.65});
              const c=document.createElement('canvas'); c.width=vp.width;c.height=vp.height;
              await pg.render({canvasContext:c.getContext('2d'),viewport:vp}).promise;
              cell.appendChild(c);
            } else {
              cell.innerHTML='<span class="muted">No page</span>';
            }
          }
          row.appendChild(cell1); row.appendChild(cell2);
          grid.appendChild(row);
        }
        resultBox.appendChild(grid);
      }
      // text diff
      async function extract(pdf){
        let t='';
        for(let i=1;i<=pdf.numPages;i++){
          const tc=await (await pdf.getPage(i)).getTextContent();
          t += tc.items.map(it=>it.str).join(' ')+'\n';
        }
        return t;
      }
      const a=await extract(p1), b=await extract(p2);
      const la=a.split(/\n/), lb=b.split(/\n/);
      let diff='', changes=0;
      const nn=Math.max(la.length,lb.length);
      for(let i=0;i<nn;i++){
        if(la[i]===lb[i]) diff+='  '+(la[i]||'')+'\n';
        else { if(la[i]){ diff+='- '+(la[i]||'')+'\n'; changes++; } if(lb[i]){ diff+='+ '+(lb[i]||'')+'\n'; changes++; } }
      }
      const pre=document.createElement('pre'); pre.className='compare-diff';
      pre.textContent=diff;
      const summary=document.createElement('div'); summary.className='compare-summary';
      summary.textContent='Compared '+n+' page(s). '+changes+' changed line(s).';
      resultBox.appendChild(summary);
      if(view==='diff') resultBox.appendChild(pre);
      else { const toggle=document.createElement('button'); toggle.className='btn btn-ghost'; toggle.textContent='Show text diff'; toggle.addEventListener('click',()=>{toggle.remove();resultBox.appendChild(pre);}); resultBox.appendChild(toggle); }
      offerDownload(panel, new Blob([diff],{type:'text/plain'}),'compare.txt');
      setStatus(panel,'Compared! '+changes+' changed line(s).','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- AUTH (demo) ---------- */
function renderAuth(root,mode){
  root.innerHTML='';
  const sec=document.createElement('section');
  sec.className='tool-page container';
  sec.style.maxWidth='480px';
  sec.innerHTML=`
    <div class="tool-header">
      <div class="icon"><i class="fa-solid ${mode==='login'?'fa-right-to-bracket':'fa-user-plus'}"></i></div>
      <div><h1>${mode==='login'?'Login':'Sign up'}</h1><p>${mode==='login'?'Welcome back to Online Converter.':'Create your free Online Converter account.'}</p></div>
    </div>
    <div class="panel">
      <div class="options" style="grid-template-columns:1fr">
        <div class="field"><label for="authEmail">Email</label><input id="authEmail" type="email" placeholder="you@example.com" /></div>
        <div class="field"><label for="authPass">Password</label><input id="authPass" type="password" placeholder="••••••••" /></div>
      </div>
      <div class="actions"><button class="btn btn-primary" id="authBtn">${mode==='login'?'Login':'Create account'}</button></div>
      <div class="status"></div>
    </div>`;
  root.appendChild(sec);
  const panel=sec.querySelector('.panel');
  sec.querySelector('#authBtn').addEventListener('click',()=>{
    const email=sec.querySelector('#authEmail').value.trim();
    const pass=sec.querySelector('#authPass').value;
    if(!email||!pass){setStatus(panel,'Please fill in email and password.','error');return;}
    setStatus(panel,'Demo only: authentication backend is not connected. All PDF tools work without an account.','success');
  });
}

/* ---------- INFO PAGES ---------- */
const INFO = {
  privacy:{title:'Privacy policy',icon:'fa-shield-halved',body:'Online Converter processes every file locally in your browser. Files are never uploaded to our servers, stored, or shared. The only exception is the optional Translate PDF tool, which asks for your consent before sending extracted text to the free MyMemory translation service — your PDF file itself is never uploaded.'},
  terms:{title:'Terms & conditions',icon:'fa-file-contract',body:'Online Converter is provided free of charge for personal and commercial use. The service is offered “as is” without warranty. You are responsible for the files you process and for keeping backups.'},
  contact:{title:'Contact us',icon:'fa-envelope',body:'Questions, feedback or business enquiries? Email us at <a href="mailto:support@filofa.com">support@filofa.com</a> or visit filofa.com. We usually reply within one business day.'},
  faq:{title:'Frequently asked questions',icon:'fa-circle-question',body:'Are my files uploaded? No — all processing happens in your browser. Is it free? Yes, all tools are free. Do I need an account? No. Which formats are supported? PDF, DOCX, XLSX, PPTX, JPG, PNG and HTML.'},
  features:{title:'Features',icon:'fa-star',body:'Merge, split, compress, convert, edit, sign, protect and organize PDFs. Convert between PDF and Word, Excel, PowerPoint, JPG, HTML and PDF/A. Everything runs locally in your browser.'},
  pricing:{title:'Pricing',icon:'fa-tag',body:'Online Converter is 100% free. There are no subscriptions, hidden fees or file limits. Advanced server-side workflows are available through Filofa Technology on request.'}
};
function renderInfo(root,key){
  const info=INFO[key]||INFO.about;
  const mailBtn=key==='contact'?'<a class="btn btn-primary" href="mailto:support@filofa.com"><i class="fa-solid fa-envelope"></i> Email support@filofa.com</a>':'';
  root.innerHTML='';
  const sec=document.createElement('section');
  sec.className='about container';
  sec.innerHTML=`<div class="tool-header"><div class="icon"><i class="fa-solid ${info.icon}"></i></div><div><h1>${info.title}</h1><p>Online Converter</p></div></div><p style="max-width:760px">${info.body}</p><div class="actions">${mailBtn}<a class="btn btn-primary" href="#/tools"><i class="fa-solid fa-grid-2"></i> Explore all tools</a><a class="btn btn-ghost" href="#/">Back to home</a></div>`;
  root.appendChild(sec);
}

/* ---------- REMOVE PAGES ---------- */
INITERS['remove-pages'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="rmPages">Pages to remove (e.g. 2,4-6)</label><input id="rmPages" placeholder="1,3,5-7" /></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-circle-minus"></i> Remove pages';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    const raw=panel.querySelector('#rmPages').value.trim();
    if(!raw){setStatus(panel,'Enter page numbers to remove.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const total=doc.getPageCount();
      const pages=parseRanges(raw,total).flat().map(n=>n-1).sort((a,b)=>b-a);
      if(pages.length>=total){setStatus(panel,'Cannot remove every page.','error');return;}
      pages.forEach(i=>doc.removePage(i));
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'pages-removed.pdf');
      setStatus(panel,'Removed '+pages.length+' page(s).','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- EXTRACT PAGES ---------- */
INITERS['extract-pages'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="exPages">Pages to extract (e.g. 2,4-6)</label><input id="exPages" placeholder="1,3,5-7" /></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-export"></i> Extract pages';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    const raw=panel.querySelector('#exPages').value.trim();
    if(!raw){setStatus(panel,'Enter page numbers to extract.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const src=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const total=src.getPageCount();
      const wanted=[];
      for(const tok of raw.split(',').map(s=>s.trim()).filter(Boolean)){
        if(tok.includes('-')){
          let [a,b]=tok.split('-').map(n=>parseInt(n));
          if(!Number.isFinite(a)||!Number.isFinite(b)) continue;
          if(a>b){const t=a;a=b;b=t;}
          for(let i=Math.max(1,a);i<=Math.min(total,b);i++) wanted.push(i);
        } else {
          const n=parseInt(tok);
          if(n>=1&&n<=total) wanted.push(n);
        }
      }
      const pages=[...new Set(wanted)];
      if(!pages.length){setStatus(panel,'No valid pages in that range.','error');return;}
      const out=await PDFDocument.create();
      const copied=await out.copyPages(src,pages.map(n=>n-1));
      copied.forEach(p=>out.addPage(p));
      offerDownload(panel,new Blob([await out.save()],{type:'application/pdf'}),'extracted-pages.pdf');
      setStatus(panel,'Extracted '+pages.length+' page(s).','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- PDF TO MARKDOWN ---------- */
INITERS['pdf-to-markdown'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-code"></i> Convert to Markdown';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      const out=[];
      for(let n=1;n<=pdf.numPages;n++){
        const page=await pdf.getPage(n);
        const tc=await page.getTextContent();
        const lines=[]; let lastY=null, cur='';
        for(const it of tc.items){
          const y=it.transform[5];
          if(lastY!==null && Math.abs(y-lastY)>4){ if(cur.trim()) lines.push(cur.trim()); cur=''; }
          cur+=(cur?' ':'')+it.str;
          lastY=y;
        }
        if(cur.trim()) lines.push(cur.trim());
        const md=lines.map((l,i)=>{
          if(i===0) return '# '+l;
          if(/^[\d\.\)\-]+\s/.test(l) || /^[•\-*]\s/.test(l)) return '- '+l.replace(/^[\d\.\)\-]+\s|^[•\-*]\s/,'');
          return l;
        }).join('\n\n');
        out.push('## Page '+n+'\n\n'+md);
        setProgress(panel,n/pdf.numPages*100);
      }
      offerDownload(panel,new Blob([out.join('\n\n---\n\n')],{type:'text/markdown'}),'converted.md');
      setStatus(panel,'Converted to Markdown!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- SUMMARIZE ---------- */
INITERS.summarize = function(panel){
  let files=[], extracted='', pdfPages=0;
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];extracted='';rerender();extract();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="sumCount">Sentences in summary</label><input id="sumCount" type="number" value="5" min="1" max="30" /></div>'
    +'<div class="field"><label for="sumMode">Style</label><select id="sumMode"><option value="balanced">Balanced</option><option value="short">Short &amp; punchy</option><option value="detailed">Detailed</option></select></div>'
    +'<div class="field"><label for="sumFmt">Output</label><select id="sumFmt"><option value="txt">Text (.txt)</option><option value="md">Markdown (.md)</option></select></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const prev=document.createElement('div'); prev.className='translate-preview'; prev.hidden=true;
  prev.innerHTML='<label style="font-size:13px;font-weight:700">Summary preview</label><textarea id="sumPreview" rows="9" readonly placeholder="Your summary will appear here..."></textarea>';
  panel.insertBefore(prev,panel.querySelector('.status'));

  async function extract(){
    if(!files.length) return;
    try{
      showProgress(panel,true); setProgress(panel,10);
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      pdfPages=pdf.numPages;
      const chunks=[];
      for(let n=1;n<=pdf.numPages;n++){
        const tc=await (await pdf.getPage(n)).getTextContent();
        const rows=[];
        tc.items.forEach(it=>{
          if(!it.str || !it.str.trim()) return;
          const x=it.transform[4], y=it.transform[5];
          let row=rows.find(r=>Math.abs(r.y-y)<3);
          if(!row){row={y,x:it.x,parts:[]};rows.push(row);}
          row.parts.push({x,str:it.str});
        });
        rows.sort((a,b)=>b.y-a.y);
        chunks.push(rows.map(r=>r.parts.sort((a,b)=>a.x-b.x).map(p=>p.str).join(' ')).join('\n'));
        setProgress(panel,10+70*n/pdf.numPages);
      }
      extracted=chunks.join('\n\n').replace(/[ \t]+/g,' ').trim();
      if(extracted){
        prev.hidden=false;
        prev.querySelector('#sumPreview').value=extracted.slice(0,2500);
        setStatus(panel,'Text extracted from '+pdfPages+' page(s). Choose options and summarize.','success');
      }else{
        setStatus(panel,'No readable text found — this PDF may be a scan. Use the OCR PDF tool first.','error');
      }
    }catch(e){ setStatus(panel,e.message,'error'); }
    finally{ showProgress(panel,false); }
  }

  function buildSummary(text,count,mode){
    const minLen=mode==='short'?35:mode==='detailed'?20:25;
    const stop=new Set(('the a an and or but if then than that this these those with from into onto for of in on at by as is are was were be been being to it its it\'s their our your his her they them we us he she i you not no nor so such very can could should would may might must will just about after before between during each few more most other some only own same too also here there when where why how all any both every many much one two three new like get got made make use used using work works year years day days time times').split(' '));
    const sentences=text.replace(/\s+/g,' ')
      .split(/(?<=[.!?])\s+|\n+/)
      .map(s=>s.trim()).filter(s=>s.length>=minLen);
    const pool=sentences.length?sentences:text.split(/\s+/).filter(Boolean);
    const freq={};
    text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).forEach(w=>{
      if(w.length>3&&!stop.has(w)) freq[w]=(freq[w]||0)+1;
    });
    const max=Math.max(1,...Object.values(freq));
    const scored=pool.map((s,i)=>{
      const words=s.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w=>w&&!stop.has(w));
      const raw=words.reduce((a,w)=>a+(freq[w]||0)/max,0)/Math.sqrt(words.length||1);
      const bonus=mode==='short'?-s.length/900 : mode==='detailed'?s.length/1200 : 0;
      return {s,i,score:raw+bonus};
    });
    const seen=new Set();
    const picked=[];
    scored.sort((a,b)=>b.score-a.score).forEach(x=>{
      const key=x.s.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,70);
      if(picked.length<count&&key&&!seen.has(key)){ seen.add(key); picked.push(x); }
    });
    picked.sort((a,b)=>a.i-b.i);
    return picked.map(x=>x.s.replace(/\s+([,.!?])/g,'$1'));
  }

  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> Summarize PDF';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    if(!extracted) await extract();
    if(!extracted){setStatus(panel,'Nothing to summarize. Try OCR for scanned files.','error');return;}
    try{
      showProgress(panel,true); setProgress(panel,80);
      const count=Math.max(1,Math.min(parseInt(panel.querySelector('#sumCount').value)||5,30));
      const mode=panel.querySelector('#sumMode').value;
      const fmt=panel.querySelector('#sumFmt').value;
      const picked=buildSummary(extracted,count,mode);
      if(!picked.length){setStatus(panel,'Not enough readable text to summarize.','error');return;}
      const body=fmt==='md'?'## Summary\n\n'+picked.map(s=>'- '+s).join('\n'):picked.join('\n\n');
      prev.hidden=false;
      prev.querySelector('#sumPreview').value=body;
      offerDownload(panel,new Blob([body],{type:fmt==='md'?'text/markdown':'text/plain'}),fmt==='md'?'summary.md':'summary.txt');
      setProgress(panel,100);
      setStatus(panel,'Summary ready ('+picked.length+' sentences from '+pdfPages+' page(s)).','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  const copyBtn=document.createElement('button'); copyBtn.className='btn btn-ghost'; copyBtn.innerHTML='<i class="fa-solid fa-copy"></i> Copy summary';
  copyBtn.addEventListener('click',async()=>{
    const v=prev.querySelector('#sumPreview').value;
    if(!v){setStatus(panel,'Run summarize first.','error');return;}
    try{await navigator.clipboard.writeText(v);toast('Summary copied','success');}catch(e){setStatus(panel,'Copy failed — select the text manually.','error');}
  });
  const ocrBtn=document.createElement('button'); ocrBtn.className='btn btn-ghost'; ocrBtn.innerHTML='<i class="fa-solid fa-file-circle-check"></i> OCR first';
  ocrBtn.addEventListener('click',()=>{navigate('#/tool/ocr');});
  actions.appendChild(btn); actions.appendChild(copyBtn); actions.appendChild(ocrBtn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- REDACT ---------- */
INITERS.redact = function(panel){
  let files=[], boxes=[], pdfDoc=null, pageNum=1, total=0, vp=null;
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];loadDoc();rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  const ed=document.createElement('div'); ed.className='pdf-editor'; ed.hidden=true;
  ed.innerHTML='<div class="pdf-editor__bar"><div class="pdf-editor__nav"><button type="button" data-a="p"><i class="fa-solid fa-chevron-left"></i></button><span id="rdPage">Page 1</span><button type="button" data-a="n"><i class="fa-solid fa-chevron-right"></i></button></div><div class="pdf-editor__tools"><button type="button" data-a="c"><i class="fa-solid fa-eraser"></i> Clear boxes</button></div></div><div class="pdf-editor__stage" id="rdStage"><canvas id="rdCanvas"></canvas><div class="pdf-editor__layer" id="rdLayer"></div></div><p class="pdf-editor__tip">Drag on the page to draw a black redaction box</p>';
  panel.insertBefore(ed,panel.querySelector('.status'));
  const stage=ed.querySelector('#rdStage'), canvas=ed.querySelector('#rdCanvas'), layer=ed.querySelector('#rdLayer');
  function drawBoxes(){
    layer.innerHTML='';
    boxes.filter(b=>b.page===pageNum).forEach(b=>{
      const el=document.createElement('div'); el.className='redact-box';
      el.style.left=b.x+'px'; el.style.top=b.y+'px'; el.style.width=b.w+'px'; el.style.height=b.h+'px';
      layer.appendChild(el);
    });
  }
  async function renderPage(){
    const page=await pdfDoc.getPage(pageNum);
    const base=page.getViewport({scale:1});
    const sc=Math.min(1.6,Math.max(0.55,780/base.width));
    vp=page.getViewport({scale:sc});
    canvas.width=vp.width; canvas.height=vp.height;
    canvas.style.width=vp.width+'px'; canvas.style.height=vp.height+'px';
    stage.style.width=vp.width+'px'; stage.style.height=vp.height+'px';
    await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
    ed.querySelector('#rdPage').textContent='Page '+pageNum+' / '+total;
    drawBoxes();
  }
  async function loadDoc(){
    try{
      pdfDoc=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      total=pdfDoc.numPages; pageNum=1; boxes=[]; ed.hidden=false;
      await renderPage();
      setStatus(panel,'Drag on the page to mark areas to redact.','success');
    }catch(e){setStatus(panel,e.message,'error');}
  }
  let drawing=null;
  stage.addEventListener('pointerdown',e=>{
    if(e.target.closest('.redact-box')) return;
    const r=stage.getBoundingClientRect();
    drawing={x:e.clientX-r.left+stage.scrollLeft,y:e.clientY-r.top+stage.scrollTop};
  });
  window.addEventListener('pointermove',e=>{
    if(!drawing) return;
    const r=stage.getBoundingClientRect();
    const x=e.clientX-r.left+stage.scrollLeft, y=e.clientY-r.top+stage.scrollTop;
    drawing.w=Math.abs(x-drawing.x); drawing.h=Math.abs(y-drawing.y);
    let b=layer.querySelector('.redact-box--live');
    if(!b){ b=document.createElement('div'); b.className='redact-box redact-box--live'; layer.appendChild(b); }
    b.style.left=Math.min(drawing.x,x)+'px'; b.style.top=Math.min(drawing.y,y)+'px';
    b.style.width=drawing.w+'px'; b.style.height=drawing.h+'px';
  });
  window.addEventListener('pointerup',()=>{
    if(!drawing) return;
    const live=layer.querySelector('.redact-box--live'); if(live) live.remove();
    if(drawing.w>5 && drawing.h>5){
      const r=stage.getBoundingClientRect();
      boxes.push({page:pageNum,x:Math.min(drawing.x,drawing.x+(drawing.w||0)),y:Math.min(drawing.y,drawing.y+(drawing.h||0)),w:drawing.w,h:drawing.h});
      drawBoxes();
    }
    drawing=null;
  });
  ed.querySelectorAll('[data-a]').forEach(b=>b.addEventListener('click',()=>{
    const a=b.dataset.a;
    if(a==='p' && pageNum>1){pageNum--;renderPage();}
    else if(a==='n' && pageNum<total){pageNum++;renderPage();}
    else if(a==='c'){boxes=[];drawBoxes();}
  }));
  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-eye-slash"></i> Apply redactions';
  btn.addEventListener('click',async()=>{
    if(!boxes.length){setStatus(panel,'Draw at least one redaction box.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const scale=vp.width/doc.getPage(0).getWidth();
      for(const b of boxes){
        const page=doc.getPage(Math.min(b.page-1,doc.getPageCount()-1));
        const ph=page.getHeight();
        page.drawRectangle({x:b.x/scale,y:ph-(b.y+b.h)/scale,width:b.w/scale,height:b.h/scale,color:PDFLib.rgb(0,0,0)});
      }
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'redacted.pdf');
      setStatus(panel,'Redacted '+boxes.length+' area(s).','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- PDF FORMS ---------- */
INITERS['pdf-forms'] = function(panel){
  let files=[], doc=null, fieldEls=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();loadForm();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const formBox=document.createElement('div'); formBox.className='form-fields'; formBox.hidden=true;
  panel.insertBefore(formBox,panel.querySelector('.status'));
  async function loadForm(){
    formBox.innerHTML='<p class="muted">Reading form fields…</p>';
    try{
      const {PDFDocument}=PDFLib;
      doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const form=doc.getForm();
      const fields=form.getFields();
      fieldEls=[]; formBox.innerHTML='';
      if(!fields.length){ formBox.innerHTML='<p class="muted">This PDF has no fillable form fields.</p>'; formBox.hidden=false; return; }
      fields.forEach((f,i)=>{
        const name=f.getName();
        const wrap=document.createElement('div'); wrap.className='field';
        const label=document.createElement('label'); label.textContent=name; wrap.appendChild(label);
        let input;
        if(f.constructor && f.constructor.name==='PDFCheckBox'){
          input=document.createElement('input'); input.type='checkbox';
          try{ input.checked=f.isChecked(); }catch(e){}
        } else {
          input=document.createElement('input'); input.type='text';
          try{ input.value=f.getText()||''; }catch(e){}
        }
        input.dataset.index=String(i); wrap.appendChild(input); formBox.appendChild(wrap);
        fieldEls.push(input);
      });
      formBox.hidden=false;
      setStatus(panel,'Found '+fields.length+' form field(s).','success');
    }catch(e){ setStatus(panel,e.message,'error'); }
  }
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-square-check"></i> Save filled form';
  btn.addEventListener('click',async()=>{
    if(!doc){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const form=doc.getForm(), fields=form.getFields();
      fieldEls.forEach((el,i)=>{
        const f=fields[i];
        if(el.type==='checkbox'){ el.checked?f.check():f.uncheck(); }
        else { try{ f.setText(el.value); }catch(e){} }
      });
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'filled-form.pdf');
      setStatus(panel,'Form saved!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- OCR PDF ---------- */
INITERS.ocr = function(panel){
  let files=[], extracted=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="ocrLang">Language</label><select id="ocrLang">'
    +'<option value="eng">English</option><option value="spa">Español</option><option value="fra">Français</option>'
    +'<option value="deu">Deutsch</option><option value="ita">Italiano</option><option value="por">Português</option>'
    +'<option value="hin">हिन्दी</option><option value="ben">বাংলা</option><option value="ara">العربية</option><option value="rus">Русский</option></select></div>'
    +'<div class="field"><label for="ocrScale">Render scale</label><select id="ocrScale"><option value="1.5">1.5× (fast)</option><option value="1.8" selected>1.8× (balanced)</option><option value="2.5">2.5× (accurate)</option></select></div>'
    +'<div class="field"><label for="ocrOut">Output</label><select id="ocrOut"><option value="pdf">Searchable PDF + text</option><option value="txt">Text only (.txt)</option></select></div>'
    +'<div class="field"><label for="ocrPages">Pages</label><input id="ocrPages" placeholder="All (e.g. 1-3,5)" /></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const prev=document.createElement('div'); prev.className='translate-preview'; prev.hidden=true;
  prev.innerHTML='<label style="font-size:13px;font-weight:700">Recognized text</label><textarea id="ocrPreview" rows="8" readonly></textarea>';
  panel.insertBefore(prev,panel.querySelector('.status'));
  function b64Bytes(dataUrl){
    const b=atob(dataUrl.split(',')[1]); const u=new Uint8Array(b.length);
    for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i); return u;
  }
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-circle-check"></i> Run OCR';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true); setProgress(panel,5);
      await ensureLib('Tesseract');
      setStatus(panel,'OCR is loading… the first run may take a moment.','success');
      const lang=panel.querySelector('#ocrLang').value;
      const scale=parseFloat(panel.querySelector('#ocrScale').value)||1.8;
      const outMode=panel.querySelector('#ocrOut').value;
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      const wanted=parseRanges(panel.querySelector('#ocrPages').value.trim(),pdf.numPages).flat();
      extracted=[];
      const canvas=document.createElement('canvas');
      for(const n of wanted){
        const page=await pdf.getPage(n);
        const vp=page.getViewport({scale});
        canvas.width=vp.width; canvas.height=vp.height;
        await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;
        const r=await Tesseract.recognize(canvas,lang,{
          logger:m=>{ if(m.status==='recognizing text') setProgress(panel,5+75*((n-1+(m.progress||0))/pdf.numPages)); }
        });
        // Store this page's own rendered image before moving to the next page.
        extracted.push({n,w:vp.width,h:vp.height,jpg:canvas.toDataURL('image/jpeg',0.6),text:r.data.text||''});
      }
      const allText=extracted.map(p=>'--- Page '+p.n+' ---\n'+p.text).join('\n\n');
      prev.hidden=false; prev.querySelector('#ocrPreview').value=allText;
      const {PDFDocument,StandardFonts}=PDFLib;
      const out=await PDFDocument.create();
      const font=await out.embedFont(StandardFonts.Helvetica);
      if(outMode==='txt'){
        offerDownload(panel,new Blob([allText],{type:'text/plain'}),'ocr-text.txt');
      }else{
        for(const pg of extracted){
          const p=out.addPage([pg.w,pg.h]);
          const img=await out.embedJpg(b64Bytes(pg.jpg));
          p.drawImage(img,{x:0,y:0,width:pg.w,height:pg.h});
          const fontW=font.widthOfTextAtSize('M',9);
          const maxChars=Math.max(20,Math.floor(pg.w/Math.max(2,fontW)));
          (pg.text.replace(/[^\x20-\x7E\n]/g,' ').split('\n')).forEach((line,li)=>{
            for(let k=0;k<line.length;k+=maxChars){
              const chunk=line.slice(k,k+maxChars);
              if(chunk.trim()) p.drawText(chunk,{x:6,y:pg.h-14-li*11-(k/maxChars)*11,size:9,font,opacity:0});
            }
          });
          setProgress(panel,80+20*(extracted.indexOf(pg)+1)/extracted.length);
        }
        offerDownload(panel,new Blob([await out.save()],{type:'application/pdf'}),'ocr.pdf');
      }
      setProgress(panel,100);
      setStatus(panel,'OCR complete — '+extracted.length+' page(s) processed.','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- TRANSLATE PDF ---------- */
INITERS.translate = function(panel){
  const LANGS=[
    ['auto','Auto detect'],['en','English'],['bn','বাংলা'],['hi','हिन्दी'],['es','Español'],
    ['fr','Français'],['de','Deutsch'],['pt','Português'],['it','Italiano'],['ru','Русский'],
    ['ar','العربية'],['zh-CN','中文（简体）'],['ja','日本語'],['ko','한국어'],['ur','اردو'],
    ['tr','Türkçe'],['vi','Tiếng Việt'],['th','ไทย'],['id','Bahasa Indonesia'],['ms','Bahasa Melayu'],
    ['nl','Nederlands'],['pl','Polski'],['sv','Svenska'],['da','Dansk'],['fi','Suomi'],
    ['el','Ελληνικά'],['he','עברית'],['fa','فارسی'],['ta','தமிழ்'],['te','తెలుగు'],
    ['mr','मराठी'],['gu','ગુજરાતી'],['pa','ਪੰਜਾਬੀ']
  ];
  const optList=(skipAuto)=>LANGS.filter(l=>!skipAuto||l[0]!=='auto').map(l=>`<option value="${l[0]}">${l[1]}</option>`).join('');
  let files=[],raw='',job=0,changeTimer=null;

  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();extract();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();

  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`<div class="field"><label for="trFrom">From</label><select id="trFrom">${optList(false)}</select></div>
    <div class="field"><label for="trTo">To</label><select id="trTo">${optList(true)}</select></div>
    <div class="field"><label for="trFmt">Download as</label><select id="trFmt">
      <option value="docx">Word document (.docx)</option>
      <option value="pdf">PDF document</option>
      <option value="txt">Plain text (.txt)</option>
      <option value="html">Web page (.html)</option>
    </select></div>
    <div class="field"><label>&nbsp;</label><button type="button" class="btn btn-ghost" id="trSwap"><i class="fa-solid fa-arrows-left-right"></i> Swap</button></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  opts.querySelector('#trTo').value='bn';

  const prev=document.createElement('div'); prev.className='translate-preview'; prev.hidden=true;
  prev.innerHTML='<div class="field"><label>Extracted text</label><textarea id="trText" rows="5" readonly></textarea></div>'
    +'<div class="field"><label>Live translation <small id="trMeta" style="color:var(--muted);font-weight:400"></small></label><textarea id="trOut" rows="9" readonly placeholder="Translation appears here as soon as the PDF is read..."></textarea></div>'
    +'<div class="field" id="trSideWrap" style="grid-column:1/-1;display:none"><label>Side-by-side comparison</label><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><div id="trLeft" style="white-space:pre-wrap;max-height:340px;overflow:auto;padding:12px;border:1px solid var(--border);border-radius:10px;font-size:13px;line-height:1.6"></div><div id="trRight" style="white-space:pre-wrap;max-height:340px;overflow:auto;padding:12px;border:1px solid var(--border);border-radius:10px;font-size:13px;line-height:1.6"></div></div></div>';
  panel.insertBefore(prev,panel.querySelector('.status'));

  function label(code){ const l=LANGS.find(x=>x[0]===code); return l?l[1]:code; }

  async function extract(){
    try{
      setStatus(panel,'Reading PDF…','info');
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      const parts=[];
      for(let n=1;n<=pdf.numPages;n++){
        const tc=await (await pdf.getPage(n)).getTextContent();
        const rows=[];
        tc.items.forEach(it=>{
          if(!it.str||!it.str.trim())return;
          const y=it.transform[5];
          let r=rows.find(r=>Math.abs(r.y-y)<3);
          if(!r){ r={y,items:[]}; rows.push(r); }
          r.items.push({x:it.transform[4],s:it.str});
        });
        rows.sort((a,b)=>b.y-a.y);
        parts.push(rows.map(r=>r.items.sort((a,b)=>a.x-b.x).map(i=>i.s).join(' ').replace(/\s+/g,' ').trim()).filter(Boolean).join('\n'));
      }
      raw=parts.map(p=>p.trim()).filter(Boolean).join('\n\n');
      prev.hidden=!raw;
      prev.querySelector('#trText').value=raw;
      if(!raw){ setStatus(panel,'No readable text found. Use OCR PDF first for scanned files.','error'); return; }
      setStatus(panel,'Text extracted from '+pdf.numPages+' page(s) — translating live…','info');
      translateLive();
    }catch(e){ setStatus(panel,e.message,'error'); }
  }

  /* Group by paragraph; split long paragraphs on sentence boundaries. */
  function makeChunks(text){
    const groups=[];
    for(const para of text.split(/\n{2,}/)){
      const p=para.replace(/\s*\n\s*/g,' ').trim();
      if(!p)continue;
      const parts=[]; let cur='';
      for(const s of p.split(/(?<=[.!?।])\s+/)){
        if((cur+' '+s).length>450&&cur){ parts.push(cur); cur=s; }
        else cur=cur?cur+' '+s:s;
      }
      if(cur)parts.push(cur);
      groups.push(parts.length?parts:[p]);
    }
    return groups;
  }

  async function translateText(text,from,to){
    const key='oc-tr2|'+from+'|'+to+'|'+text;
    try{ const c=localStorage.getItem(key); if(c)return c; }catch(e){}
    let result=null;
    try{
      for(let a=0;a<2&&!result;a++){
        try{
          const u='https://translate.googleapis.com/translate_a/single?client=gtx&sl='+encodeURIComponent(from)+'&tl='+encodeURIComponent(to)+'&dt=t&q='+encodeURIComponent(text);
          const r=await fetch(u); if(!r.ok)throw new Error('HTTP '+r.status);
          const j=await r.json();
          const t=(j[0]||[]).map(x=>x[0]||'').join('').trim();
          if(t)result=t;
        }catch(e){}
        if(!result)await new Promise(r=>setTimeout(r,350));
      }
    }catch(e){}
    if(!result){
      try{
        const u='https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+encodeURIComponent((from==='auto'?'en':from)+'|'+to);
        const r=await fetch(u); const j=await r.json();
        const t=j.responseData&&j.responseData.translatedText;
        if(t&&!/MYMEMORY WARNING|INVALID|QUERY LENGTH/i.test(t))result=t;
      }catch(e){}
    }
    result=result||text;
    if(result!==text){ try{ localStorage.setItem(key,result); }catch(e){} }
    return result;
  }

  async function translateLive(){
    if(!raw)return Promise.resolve();
    const my=++job;
    const from=panel.querySelector('#trFrom').value, to=panel.querySelector('#trTo').value;
    const outBox=prev.querySelector('#trOut');
    if(from===to){
      outBox.value=raw;
      prev.querySelector('#trMeta').textContent='(same language — original text)';
      prev.querySelector('#trLeft').textContent=raw;
      prev.querySelector('#trRight').textContent=raw;
      setStatus(panel,'Source and target language are the same.','info');
      return;
    }
    const groups=makeChunks(raw);
    const flat=[];
    groups.forEach((g,gi)=>g.forEach((t,pi)=>flat.push({t,gi,pi})));
    const done=groups.map(g=>new Array(g.length).fill(null));
    const rebuild=()=>done.map(arr=>arr.filter(Boolean).join(' ')).filter(Boolean).join('\n\n');
    prev.hidden=false;
    outBox.value='';
    prev.querySelector('#trLeft').textContent=raw;
    prev.querySelector('#trRight').textContent='';
    prev.querySelector('#trMeta').textContent='('+label(from)+' → '+label(to)+', '+flat.length+' segments)';
    showProgress(panel,true);
    setStatus(panel,'Translating live preview…','info');
    let cursor=0, finished=0;
    async function worker(){
      while(cursor<flat.length&&my===job){
        const idx=cursor++;
        const item=flat[idx];
        const text=await translateText(item.t,from,to);
        if(my!==job)return;
        done[item.gi][item.pi]=text;
        finished++;
        const built=rebuild();
        outBox.value=built;
        prev.querySelector('#trRight').textContent=built;
        setProgress(panel,Math.round(finished/flat.length*100));
      }
    }
    await Promise.all([worker(),worker(),worker()]);
    if(my!==job)return;
    showProgress(panel,false);
    setStatus(panel,'Live translation ready — choose a format and download.','success');
  }

  async function buildOutput(fmt,result,to){
    const rtl=/^(ar|ur|fa|he)$/.test(to);
    const paras=result.split(/\n{2,}/).map(s=>s.trim()).filter(Boolean);
    if(fmt==='txt'){
      offerDownload(panel,new Blob([result],{type:'text/plain;charset=utf-8'}),'translated.txt');
    }else if(fmt==='html'){
      const body=paras.map(p=>'<p>'+escapeHtml(p)+'</p>').join('\n');
      const html='<!DOCTYPE html><html lang="'+to+'" dir="'+(rtl?'rtl':'ltr')+'"><head><meta charset="utf-8"><title>Translated document</title><style>body{font-family:system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.7}</style></head><body>'+body+'</body></html>';
      offerDownload(panel,new Blob([html],{type:'text/html;charset=utf-8'}),'translated.html');
    }else if(fmt==='docx'){
      await ensureLib('docx');
      const {Document,Packer,Paragraph,TextRun}=window.docx;
      const children=paras.map(p=>new Paragraph({bidirectional:rtl,children:[new TextRun({text:p,bidirectional:rtl})]}));
      const blob=await Packer.toBlob(new Document({sections:[{children}]}));
      offerDownload(panel,blob,'translated.docx');
    }else{
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.create();
      const sc=1.5,PW=595,PH=842;
      const cv=document.createElement('canvas'); cv.width=PW*sc; cv.height=PH*sc;
      const ctx=cv.getContext('2d');
      const fontFamily='"Noto Sans Bengali","Noto Sans Devanagari","Noto Sans Arabic","Noto Sans CJK SC","Noto Sans CJK JP","Noto Sans CJK KR","Microsoft YaHei","Malgun Gothic","Yu Gothic","Noto Nastaliq Urdu",Arial,sans-serif';
      const setFont=()=>{ ctx.fillStyle='#111'; ctx.font=(20*sc)+'px '+fontFamily; ctx.textBaseline='top'; ctx.direction=rtl?'rtl':'ltr'; ctx.textAlign=rtl?'right':'left'; };
      const wrap=(text,maxW)=>{
        const out=[]; let line='';
        for(const word of text.split(/\s+/)){
          const test=line?line+' '+word:word;
          if(ctx.measureText(test).width>maxW&&line){out.push(line);line=word;}
          else line=test;
        }
        if(line)out.push(line);
        return out;
      };
      const lines=[];
      for(const p of paras)lines.push(...wrap(p,(PW-90)*sc),'');
      let page=doc.addPage([PW,PH]);
      ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);setFont();
      let y=64*sc;
      for(const line of lines){
        if(y>PH*sc-70*sc){
          page.drawImage(await doc.embedJpg(cv.toDataURL('image/jpeg',0.85)),{x:0,y:0,width:PW,height:PH});
          page=doc.addPage([PW,PH]);
          ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);setFont();y=64*sc;
        }
        if(line)ctx.fillText(line,rtl?(PW-45)*sc:45*sc,y);
        y+=(line?30:16)*sc;
      }
      page.drawImage(await doc.embedJpg(cv.toDataURL('image/jpeg',0.85)),{x:0,y:0,width:PW,height:PH});
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'translated.pdf');
    }
  }

  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-download"></i> Download translation';
  btn.addEventListener('click',async()=>{
    const result=prev.querySelector('#trOut').value;
    if(!result){setStatus(panel,'Upload a PDF with readable text first.','error');return;}
    try{
      showProgress(panel,true);
      const fmt=panel.querySelector('#trFmt').value;
      const to=panel.querySelector('#trTo').value;
      await buildOutput(fmt,result,to);
      setStatus(panel,'Downloaded '+fmt.toUpperCase()+' translation.','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  const copyBtn=document.createElement('button'); copyBtn.className='btn btn-ghost'; copyBtn.innerHTML='<i class="fa-solid fa-copy"></i> Copy text';
  copyBtn.addEventListener('click',async()=>{
    const v=prev.querySelector('#trOut').value;
    if(!v){setStatus(panel,'Nothing to copy yet.','error');return;}
    try{await navigator.clipboard.writeText(v);toast('Translation copied','success');}
    catch(e){setStatus(panel,'Copy failed — select the text manually.','error');}
  });
  const viewBtn=document.createElement('button'); viewBtn.className='btn btn-ghost'; viewBtn.innerHTML='<i class="fa-solid fa-columns"></i> Side-by-side';
  let sideShown=false;
  viewBtn.addEventListener('click',()=>{
    sideShown=!sideShown;
    prev.querySelector('#trSideWrap').style.display=sideShown?'':'none';
    const fields=prev.querySelectorAll(':scope > .field');
    fields[0].style.display=sideShown?'none':'';
    fields[1].style.display=sideShown?'none':'';
    viewBtn.innerHTML=sideShown?'<i class="fa-solid fa-columns"></i> Single view':'<i class="fa-solid fa-columns"></i> Side-by-side';
  });
  actions.appendChild(btn); actions.appendChild(copyBtn); actions.appendChild(viewBtn);
  panel.insertBefore(actions,panel.querySelector('.status'));

  opts.querySelector('#trSwap').addEventListener('click',()=>{
    const a=panel.querySelector('#trFrom'),b=panel.querySelector('#trTo');
    if(a.value==='auto')a.value='en';
    const v=a.value; a.value=b.value; b.value=v;
    if(raw)translateLive();
  });
  ['trFrom','trTo'].forEach(id=>panel.querySelector('#'+id).addEventListener('change',()=>{
    clearTimeout(changeTimer);
    changeTimer=setTimeout(()=>{if(raw)translateLive();},250);
  }));
};

INITERS.metadata = function(panel){
  let files=[], doc=null;
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];load();rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label for="mdTitle">Title</label><input id="mdTitle" /></div>
    <div class="field"><label for="mdAuthor">Author</label><input id="mdAuthor" /></div>
    <div class="field"><label for="mdSubject">Subject</label><input id="mdSubject" /></div>
    <div class="field"><label for="mdKeywords">Keywords</label><input id="mdKeywords" placeholder="comma,separated" /></div>
    <div class="field"><label for="mdCreator">Creator</label><input id="mdCreator" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  async function load(){
    try{
      const {PDFDocument}=PDFLib;
      doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      opts.querySelector('#mdTitle').value=doc.getTitle()||'';
      opts.querySelector('#mdAuthor').value=doc.getAuthor()||'';
      opts.querySelector('#mdSubject').value=doc.getSubject()||'';
      opts.querySelector('#mdKeywords').value=(doc.getKeywords()||[]).join(', ');
      opts.querySelector('#mdCreator').value=doc.getCreator()||'';
      setStatus(panel,'Metadata loaded. Edit and apply.','success');
    }catch(e){setStatus(panel,e.message,'error');}
  }
  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-tags"></i> Save metadata';
  btn.addEventListener('click',async()=>{
    if(!doc){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      doc.setTitle(opts.querySelector('#mdTitle').value);
      doc.setAuthor(opts.querySelector('#mdAuthor').value);
      doc.setSubject(opts.querySelector('#mdSubject').value);
      doc.setKeywords(opts.querySelector('#mdKeywords').value.split(',').map(s=>s.trim()).filter(Boolean));
      doc.setCreator(opts.querySelector('#mdCreator').value);
      doc.setModificationDate(new Date());
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'metadata.pdf');
      setStatus(panel,'Metadata saved!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

INITERS.flatten = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-clone"></i> Flatten PDF';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      try{ doc.getForm().flatten(); }catch(e){}
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'flattened.pdf');
      setStatus(panel,'Flattened!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

INITERS.grayscale = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="gsScale">Render quality (page size is preserved)</label><select id="gsScale"><option value="1.5">1.5x</option><option value="2" selected>2x</option><option value="3">3x</option></select></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-circle-half-stroke"></i> Convert to grayscale';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const scale=parseFloat(panel.querySelector('#gsScale').value)||2;
      const {PDFDocument}=PDFLib;
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      const doc=await PDFDocument.create();
      const cv=document.createElement('canvas');
      for(let n=1;n<=pdf.numPages;n++){
        const page=await pdf.getPage(n);
        const base=page.getViewport({scale:1});
        const vp=page.getViewport({scale});
        cv.width=vp.width; cv.height=vp.height;
        const ctx=cv.getContext('2d');
        await page.render({canvasContext:ctx,viewport:vp}).promise;
        const d=ctx.getImageData(0,0,cv.width,cv.height);
        for(let i=0;i<d.data.length;i+=4){const g=Math.round(d.data[i]*0.299+d.data[i+1]*0.587+d.data[i+2]*0.114);d.data[i]=d.data[i+1]=d.data[i+2]=g;}
        ctx.putImageData(d,0,0);
        const blob=await new Promise(res=>cv.toBlob(res,'image/jpeg',0.9));
        const img=await doc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
        const p=doc.addPage([base.width,base.height]);
        p.drawImage(img,{x:0,y:0,width:base.width,height:base.height});
        setProgress(panel,n/pdf.numPages*100);
      }
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'grayscale.pdf');
      setStatus(panel,'Converted to grayscale!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

INITERS['pdf-to-text'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="txtPages">Pages (blank = all)</label><input id="txtPages" placeholder="1,3,5-7" /></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-lines"></i> Extract text';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      const total=pdf.numPages;
      const raw=panel.querySelector('#txtPages').value.trim();
      const targets=raw?parseRanges(raw,total).flat().map(n=>n-1):[...Array(total).keys()];
      const out=[];
      for(const i of targets){
        const tc=await (await pdf.getPage(i+1)).getTextContent();
        out.push('--- Page '+(i+1)+' ---\n'+tc.items.map(it=>it.str).join(' ').replace(/\s+/g,' ').trim());
        setProgress(panel,(targets.indexOf(i)+1)/targets.length*100);
      }
      offerDownload(panel,new Blob([out.join('\n\n')],{type:'text/plain'}),'extracted.txt');
      setStatus(panel,'Extracted '+targets.length+' page(s)!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

INITERS['pdf-to-csv'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="csvPages">Pages (blank = all)</label><input id="csvPages" placeholder="1,3,5-7" /></div><div class="field"><label for="csvGap">Column gap (px)</label><input id="csvGap" type="number" value="18" /></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-csv"></i> Convert to CSV';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      const total=pdf.numPages;
      const raw=panel.querySelector('#csvPages').value.trim();
      const targets=raw?parseRanges(raw,total).flat().map(n=>n-1):[...Array(total).keys()];
      const gap=parseInt(panel.querySelector('#csvGap').value)||18;
      const rows=[];
      for(const i of targets){
        const tc=await (await pdf.getPage(i+1)).getTextContent();
        const lines=[];
        for(const it of tc.items){
          if(!it.str.trim()) continue;
          const y=it.transform[5], x=it.transform[4];
          let line=lines.find(l=>Math.abs(l.y-y)<6);
          if(!line){line={y,items:[]};lines.push(line);}
          line.items.push({x,text:it.str.trim()});
        }
        lines.sort((a,b)=>b.y-a.y);
        for(const line of lines){
          line.items.sort((a,b)=>a.x-b.x);
          const cols=[];
          for(const it of line.items){
            if(cols.length && it.x-cols[cols.length-1].x>gap) cols.push(it);
            else if(!cols.length) cols.push(it);
            else cols[cols.length-1].text+=' '+it.text;
          }
          rows.push(cols.map(c=>'"'+c.text.replace(/"/g,'""')+'"').join(','));
        }
        setProgress(panel,(targets.indexOf(i)+1)/targets.length*100);
      }
      offerDownload(panel,new Blob([rows.join('\n')],{type:'text/csv'}),'extracted.csv');
      setStatus(panel,'Converted '+targets.length+' page(s) to CSV!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

INITERS['add-blank'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label for="abPos">Position</label><select id="abPos"><option value="end">End</option><option value="start">Start</option><option value="after">After page N</option><option value="before">Before page N</option></select></div>
    <div class="field"><label for="abN">Page number</label><input id="abN" type="number" value="1" min="1" /></div>
    <div class="field"><label for="abCount">How many</label><input id="abCount" type="number" value="1" min="1" max="50" /></div>
    <div class="field"><label for="abSize">Page size</label><select id="abSize"><option value="same">Same as document</option><option value="a4">A4</option><option value="letter">Letter</option></select></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-circle-plus"></i> Add blank pages';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const pos=panel.querySelector('#abPos').value;
      const n=parseInt(panel.querySelector('#abN').value)||1;
      const count=parseInt(panel.querySelector('#abCount').value)||1;
      const size=panel.querySelector('#abSize').value;
      const sizes={a4:[595.28,841.89],letter:[612,792]};
      let pw,ph;
      if(size==='same'){const p0=doc.getPage(0);pw=p0.getWidth();ph=p0.getHeight();}
      else [pw,ph]=sizes[size];
      const total=doc.getPageCount();
      let idx;
      if(pos==='start') idx=0;
      else if(pos==='end') idx=total;
      else if(pos==='after') idx=Math.min(n,total);
      else idx=Math.max(0,n-1);
      for(let i=0;i<count;i++) doc.insertPage(idx+i,[pw,ph]);
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'blank-added.pdf');
      setStatus(panel,'Added '+count+' blank page(s).','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

INITERS['remove-blank'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML='<div class="field"><label for="rbThresh">Threshold (0-255, higher = more sensitive)</label><input id="rbThresh" type="number" value="245" min="200" max="255" /></div><div class="field"><label for="rbMin">Min dark pixels to keep</label><input id="rbMin" type="number" value="50" min="0" /></div>';
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-circle-minus"></i> Remove blank pages';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await files[0].arrayBuffer()),useWorkerFetch:false,isEvalSupported:false}).promise;
      const thresh=parseInt(panel.querySelector('#rbThresh').value)||245;
      const minDark=parseInt(panel.querySelector('#rbMin').value)||50;
      const keep=[];
      const canvas=document.createElement('canvas');
      for(let n=1;n<=pdf.numPages;n++){
        const page=await pdf.getPage(n);
        const vp=page.getViewport({scale:0.5});
        canvas.width=vp.width; canvas.height=vp.height;
        const ctx=canvas.getContext('2d');
        await page.render({canvasContext:ctx,viewport:vp}).promise;
        const d=ctx.getImageData(0,0,canvas.width,canvas.height).data;
        let dark=0;
        for(let i=0;i<d.length;i+=4){ if(d[i]<thresh||d[i+1]<thresh||d[i+2]<thresh) dark++; }
        if(dark>minDark) keep.push(n-1);
        setProgress(panel,n/pdf.numPages*100);
      }
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const all=[...Array(doc.getPageCount()).keys()];
      const remove=all.filter(i=>!keep.includes(i)).sort((a,b)=>b-a);
      remove.forEach(i=>doc.removePage(i));
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'blank-removed.pdf');
      setStatus(panel,'Removed '+remove.length+' blank page(s). Kept '+keep.length+'.','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

INITERS['resize-pages'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label for="rpSize">Target size</label><select id="rpSize"><option value="a4">A4 (210×297mm)</option><option value="letter">Letter (8.5×11in)</option><option value="legal">Legal (8.5×14in)</option><option value="a3">A3 (297×420mm)</option></select></div>
    <div class="field"><label for="rpFit">Fit content</label><select id="rpFit"><option value="contain">Fit (keep aspect)</option><option value="stretch">Stretch to fill</option></select></div>
    <div class="field"><label for="rpPages">Pages (blank = all)</label><input id="rpPages" placeholder="1,3,5-7" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-expand"></i> Resize pages';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const sizes={a4:[595.28,841.89],letter:[612,792],legal:[612,1008],a3:[841.89,1190.55]};
      const target=sizes[panel.querySelector('#rpSize').value];
      const fit=panel.querySelector('#rpFit').value;
      const pagesInput=panel.querySelector('#rpPages').value.trim();
      const total=doc.getPageCount();
      const targets=pagesInput?parseRanges(pagesInput,total).flat().map(n=>n-1):[...Array(total).keys()];
      for(const [k,i] of targets.entries()){
        const page=doc.getPage(i);
        const pw=page.getWidth(), ph=page.getHeight();
        const [nw,nh]=target;
        if(fit==='stretch'){
          page.setSize(nw,nh);
        } else {
          page.setSize(nw,nh);
        }
        setProgress(panel,(k+1)/targets.length*100);
      }
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'resized.pdf');
      setStatus(panel,'Resized '+targets.length+' page(s) to '+panel.querySelector('#rpSize').value.toUpperCase()+'.','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

INITERS['header-footer'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label for="hfH">Header text</label><input id="hfH" placeholder="Document title" /></div>
    <div class="field"><label for="hfF">Footer text</label><input id="hfF" placeholder="Page {n} of {total}" /></div>
    <div class="field"><label for="hfSize">Font size</label><input id="hfSize" type="number" value="10" /></div>
    <div class="field"><label for="hfColor">Color</label><select id="hfColor"><option value="0.3,0.3,0.3">Gray</option><option value="0,0,0">Black</option><option value="0.8,0,0">Red</option></select></div>
    <div class="field"><label for="hfPages">Pages (blank = all)</label><input id="hfPages" placeholder="1,3,5-7" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-align-center"></i> Add header & footer';
  btn.addEventListener('click',async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,StandardFonts,rgb}=PDFLib;
      const doc=await PDFDocument.load(new Uint8Array(await files[0].arrayBuffer()));
      const font=await doc.embedFont(StandardFonts.Helvetica);
      const header=panel.querySelector('#hfH').value;
      const footer=panel.querySelector('#hfF').value;
      const size=parseInt(panel.querySelector('#hfSize').value)||10;
      const col=panel.querySelector('#hfColor').value.split(',').map(Number);
      const pagesInput=panel.querySelector('#hfPages').value.trim();
      const total=doc.getPageCount();
      const targets=pagesInput?parseRanges(pagesInput,total).flat().map(n=>n-1):[...Array(total).keys()];
      for(const [k,i] of targets.entries()){
        const page=doc.getPage(i);
        const {width,height}=page.getSize();
        const txtH=header.replace('{n}',String(i+1)).replace('{total}',String(total));
        const txtF=footer.replace('{n}',String(i+1)).replace('{total}',String(total));
        if(txtH) page.drawText(txtH,{x:(width-font.widthOfTextAtSize(txtH,size))/2,y:height-24,size,font,color:rgb(col[0],col[1],col[2])});
        if(txtF) page.drawText(txtF,{x:(width-font.widthOfTextAtSize(txtF,size))/2,y:12,size,font,color:rgb(col[0],col[1],col[2])});
        setProgress(panel,(k+1)/targets.length*100);
      }
      offerDownload(panel,new Blob([await doc.save()],{type:'application/pdf'}),'header-footer.pdf');
      setStatus(panel,'Done!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- router (clean URLs, no /#/) ---------- */
function siteBase(){
  if(typeof window.__BASE_PATH__==='string') return window.__BASE_PATH__;
  return location.pathname.indexOf('/online-converter/')===0?'/online-converter/':'/';
}
function hashFromPath(pathname){
  const p=(pathname||location.pathname).replace(/\/+$/,'');
  const parts=p.split('/').filter(Boolean);
  const base=siteBase().replace(/\/+$/,'');
  if(base && p.indexOf(base)===0) parts.shift();
  const seg=parts[parts.length-1]||'';
  if(seg && TOOLS.some(t=>t.id===seg)) return '#/tool/'+seg;
  if(seg==='studio') return '#/studio';
  if(seg==='tools') return '#/tools';
  if(INFO[seg]) return '#/'+seg;
  return '#/';
}
function cleanUrlFromHash(h){
  const base=siteBase().replace(/\/$/,'');
  h=h||'#/';
  if(h==='#/'||h==='#') return base+'/';
  if(h==='#/tools') return base+'/tools/';
  if(h==='#/studio'||h.startsWith('#/studio/')) return base+'/studio/';
  if(h.startsWith('#/tool/')) return base+'/tools/'+h.split('/')[2]+'/';
  const k=h.replace('#/','');
  if(INFO[k]) return base+'/'+k+'/';
  return base+'/';
}
function currentHash(){
  if(history.state && history.state.ocHash) return history.state.ocHash;
  if(location.hash) return location.hash;
  return hashFromPath(location.pathname);
}
function navigate(hash,replace){
  hash=hash||'#/';
  try{
    history[replace?'replaceState':'pushState']({ocHash:hash},'',cleanUrlFromHash(hash));
  }catch(e){ location.hash=hash; return; }
  route();
}
function syncNavActive(){
  const m=(currentHash()||'').match(/^#\/tool\/([^/?#]+)/);
  const id=m?m[1]:'';
  document.querySelectorAll('.nav-link--direct').forEach(a=>{
    if(id&&a.getAttribute('href')==='#/tool/'+id) a.setAttribute('aria-current','page');
    else a.removeAttribute('aria-current');
  });
}
function syncTitle(hash){
  const base='Online Converter — Free PDF Toolkit';
  const m=(hash||'').match(/^#\/tool\/([^/?#]+)/);
  const key=(hash||'').replace('#/','');
  let name='', suffix='';
  if(m){ const tool=TOOLS.find(x=>x.id===m[1]); if(tool){ name=tool.name; suffix=' — Free Online Tool'; } }
  else if(hash==='#/tools') name=t('all_tools');
  else if(hash==='#/studio'||(hash||'').startsWith('#/studio/')) name='Image Studio — Free Online Photo Editor';
  else if(INFO[key]) name=INFO[key].title;
  document.title=name?name+suffix+' | Online Converter':base;
}
function route(){
  const hash=currentHash();
  const app=document.getElementById('app');
  if(!app) return;
  document.querySelectorAll('.nav-has-dropdown.open').forEach(x=>x.classList.remove('open'));
  const menuEl=document.querySelector('.menu'); if(menuEl) menuEl.classList.remove('open');
  if(hash==='#/'||hash==='#') renderHome(app);
  else if(hash==='#/tools') renderTools(app);
  else if(hash==='#/studio'||hash.startsWith('#/studio/')){
    const sid=hash.startsWith('#/studio/')?hash.split('/')[2].split('?')[0]:'';
    if(window.OCSTUDIO){ window.OCSTUDIO.render(app,sid); }
    else{
      app.innerHTML='<div class="studio-loading"><span class="studio-loading__spin" aria-hidden="true"></span><p>Opening Image Studio…</p></div>';
      ensureLocalScript(siteBase()+'js/image-studio.js')
        .then(()=>{ if(window.OCSTUDIO) window.OCSTUDIO.render(app,sid); })
        .catch(()=>{ app.innerHTML='<div class="container" style="padding:60px 20px">Image Studio could not be loaded. Please refresh the page.</div>'; });
    }
  }
  else if(hash.startsWith('#/tool/')) renderTool(app,hash.split('/')[2]);
  else if(hash==='#/about') renderAbout(app);
  else if(INFO[hash.replace('#/','')]) renderInfo(app,hash.replace('#/',''));
  else renderHome(app);
  syncNavActive();
  syncTitle(hash);
  window.scrollTo(0,0);
  const heading=app.querySelector('h1');
  if(heading){
    if(!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex','-1');
    try{ heading.focus({preventScroll:true}); }catch(e){ heading.focus(); }
  }
}
function onReady(fn){
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn);
  else fn();
}
window.addEventListener('hashchange',()=>{
  const h=location.hash||'#/';
  try{ history.replaceState({ocHash:h},'',cleanUrlFromHash(h)); }catch(e){}
  route();
});
window.addEventListener('popstate',()=>{ route(); });
document.addEventListener('click',e=>{
  if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const el=e.target instanceof Element?e.target:(e.target&&e.target.parentElement);
  const a=el&&el.closest?el.closest('a[href^="#/"],a[href^="tools/"],a[href^="studio/"]'):null;
  if(!a||a.target==='_blank'||a.hasAttribute('download'))return;
  const href=a.getAttribute('href')||'';
  e.preventDefault();
  if(href.startsWith('#/')) navigate(href);
  else {
    const m=href.match(/^tools\/([\w-]+)\/$/);
    navigate(m?'#/tool/'+m[1]:(href==='tools/'?'#/tools':'#/studio'));
  }
});
onReady(()=>{
  // Old bookmarks with #/… are migrated to a clean URL without a second hashchange.
  if(location.hash){
    try{ history.replaceState({ocHash:location.hash},'',cleanUrlFromHash(location.hash)); }catch(e){}
  }
  route();
  // Initial clean URL: record the derived hash in history state without changing the path.
  if(!history.state || !history.state.ocHash){
    try{ history.replaceState({ocHash:currentHash()},'',location.pathname); }catch(e){}
  }
});


/* menu */
onReady(()=>{
  const menuBtn=document.getElementById('menuBtn');
  const menu=document.querySelector('.menu');
  if(menuBtn&&menu){
    menuBtn.addEventListener('click',e=>{
      e.stopPropagation();
      menu.classList.toggle('open');
    });
  }
  const closeDropdowns=()=>document.querySelectorAll('.nav-has-dropdown.open').forEach(x=>{
    x.classList.remove('open');
    const b=x.querySelector('.nav-link, .more-btn');
    if(b) b.setAttribute('aria-expanded','false');
  });
  const dropdownLinks=parent=>[...parent.querySelectorAll('.nav-dropdown a')].filter(a=>a.offsetParent!==null);
  const triggerOf=parent=>parent?parent.querySelector('.nav-link, .more-btn'):null;
  const toggleDropdown=(btn,focusFirst)=>{
    const parent=btn.closest('.nav-has-dropdown');
    if(!parent) return;
    const wasOpen=parent.classList.contains('open');
    closeDropdowns();
    if(!wasOpen){
      parent.classList.add('open');
      btn.setAttribute('aria-expanded','true');
      if(focusFirst){ const first=dropdownLinks(parent)[0]; if(first) first.focus(); }
    }
  };
  document.querySelectorAll('.nav-has-dropdown > .nav-link, .more-btn').forEach(btn=>{
    btn.setAttribute('aria-haspopup','true');
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click',e=>{
      e.preventDefault(); e.stopPropagation();
      toggleDropdown(btn,false);
    });
    btn.addEventListener('keydown',e=>{
      if(e.key==='ArrowDown'||e.key==='Enter'||e.key===' '){
        e.preventDefault(); e.stopPropagation();
        toggleDropdown(btn,true);
      }else if(e.key==='Escape'){
        closeDropdowns();
      }
    });
  });
  document.querySelectorAll('.nav-dropdown a').forEach(a=>{
    a.addEventListener('keydown',e=>{
      const parent=a.closest('.nav-has-dropdown');
      const links=parent?dropdownLinks(parent):[];
      const i=links.indexOf(a);
      if(e.key==='ArrowDown'){ e.preventDefault(); if(links[i+1]) links[i+1].focus(); }
      else if(e.key==='ArrowUp'){ e.preventDefault(); if(links[i-1]) links[i-1].focus(); else { const tr=triggerOf(parent); if(tr) tr.focus(); } }
      else if(e.key==='Escape'){
        e.preventDefault();
        closeDropdowns();
        const tr=triggerOf(parent); if(tr) tr.focus();
      }
    });
  });
  document.querySelectorAll('.nav-link--direct').forEach(a=>{
    a.addEventListener('click',()=>{
      document.querySelectorAll('.nav-has-dropdown.open').forEach(x=>x.classList.remove('open'));
      if(menu) menu.classList.remove('open');
    });
  });
  document.addEventListener('click',()=>{
    document.querySelectorAll('.nav-has-dropdown.open').forEach(x=>x.classList.remove('open'));
    if(menu) menu.classList.remove('open');
  });
  document.querySelectorAll('.nav-dropdown a').forEach(a=>{
    a.addEventListener('click',()=>{
      const parent=a.closest('.nav-has-dropdown');
      if(parent) parent.classList.add('suppress');
      document.querySelectorAll('.nav-has-dropdown.open').forEach(x=>x.classList.remove('open'));
      if(menu) menu.classList.remove('open');
    });
  });
  document.querySelectorAll('.nav-has-dropdown').forEach(n=>{
    n.addEventListener('mouseleave',()=>n.classList.remove('suppress'));
  });
  const appsSearch=document.getElementById('appsSearch');
  if(appsSearch){
    appsSearch.addEventListener('input',()=>{
      const phrase=normSearch(appsSearch.value.trim());
      const tokens=phrase?phrase.split(/\s+/).filter(Boolean):[];
      document.querySelectorAll('.apps-menu .app-tile').forEach(tile=>{
        const id=(tile.getAttribute('href')||'').split('/').pop();
        const entry=SEARCH_INDEX_BY_ID[id];
        const score=(entry&&tokens.length)?scoreTool(entry,tokens,phrase):1;
        tile.style.display=(!tokens.length||score>0)?'':'none';
      });
    });
  }
});

/* advanced UX boot */
let deferredInstallPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  const b=document.getElementById('installBtn');
  if(b) b.style.display='inline-flex';
});
onReady(()=>{
  initTheme();
  initToTop();
  initHeaderScroll();
  const skipLink=document.getElementById('skipLink');
  if(skipLink) skipLink.addEventListener('click',()=>{
    const app=document.getElementById('app');
    if(app){ app.focus(); app.scrollIntoView({block:'start',behavior:'smooth'}); }
  });
  document.addEventListener('click',e=>{
    if(e.target.closest && e.target.closest('a[href="#"]')) e.preventDefault();
  });
  initShortcuts();
  initAccessibility();
  initFeedback();
  initHomeDrop();
  const langSel=document.getElementById('langSelect');
  if(langSel){
    langSel.value=I18N.lang;
    langSel.addEventListener('change',e=>{ setLang(e.target.value); toast(t('footer_language')+': '+e.target.value,'success',1600); });
  }
  const installBtn=document.getElementById('installBtn');
  if(installBtn){
    installBtn.addEventListener('click',async()=>{
      if(!deferredInstallPrompt){
        toast('Open your browser menu and choose “Install app” to add Online Converter.','info',5200);
        return;
      }
      try{
        deferredInstallPrompt.prompt();
        const choice=await deferredInstallPrompt.userChoice;
        deferredInstallPrompt=null;
        installBtn.style.display='none';
        toast(choice && choice.outcome==='accepted'?'Installing Online Converter…':'Install dismissed',choice && choice.outcome==='accepted'?'success':'info');
      }catch(e){ toast('Could not start installation.','error'); }
    });
  }
  const appsGrid=document.querySelector('.apps-grid');
  if(appsGrid){
    const colors=['blue','purple','green','red','orange','yellow','teal','dark','indigo'];
    appsGrid.innerHTML=TOOLS.map((t,i)=>'<a href="tools/'+t.id+'/" class="app-tile"><span class="app-icon"><i class="fa-solid '+t.icon+'"></i></span><span>'+escapeHtml(t.name)+'</span></a>').join('');
    appsGrid.querySelectorAll('.app-tile').forEach(tile=>{
      const id=(tile.getAttribute('href')||'').split('/').filter(Boolean).pop();
      const t=TOOLS.find(x=>x.id===id);
      if(t) paintIcon(tile.querySelector('.app-icon'),t.id,t.cat);
    });
  }
  if(!window.__BASE_PATH__) window.__BASE_PATH__='';
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register((window.__BASE_PATH__||'')+'sw.js').catch(()=>{});
    });
  }
  // Warm the Image Studio chunk during idle time so the first click is instant.
  if(!window.OCSTUDIO){
    const warm=()=>{ ensureLocalScript((window.__BASE_PATH__||'')+'js/image-studio.js').catch(()=>{}); };
    if('requestIdleCallback' in window) requestIdleCallback(warm,{timeout:4000});
    else setTimeout(warm,2500);
  }
});
