/* Online Converter app */

const CATEGORIES = ['Organize PDF','Optimize PDF','Convert to PDF','Convert from PDF','Edit PDF','PDF Security'];

const TOOLS = [
  {id:'merge',name:'Merge PDF',desc:'Combine PDFs in the order you want.',icon:'fa-object-group',cat:'Organize PDF',impl:true},
  {id:'split',name:'Split PDF',desc:'Separate one page or a whole set for easy conversion.',icon:'fa-scissors',cat:'Organize PDF',impl:true},
  {id:'compress',name:'Compress PDF',desc:'Reduce file size while optimizing for maximal quality.',icon:'fa-compress',cat:'Optimize PDF',impl:true},
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
  {id:'scan-to-pdf',name:'Scan to PDF',desc:'Capture scans and save as PDF.',icon:'fa-camera',cat:'Convert to PDF',impl:true},
  {id:'edit',name:'Edit PDF',desc:'Add text, images and shapes to your PDF.',icon:'fa-pen-to-square',cat:'Edit PDF',impl:true},
  {id:'rotate',name:'Rotate PDF',desc:'Rotate PDF pages.',icon:'fa-rotate',cat:'Edit PDF',impl:true},
  {id:'page-numbers',name:'Page numbers',desc:'Add page numbers to PDFs.',icon:'fa-list-ol',cat:'Edit PDF',impl:true},
  {id:'watermark',name:'Watermark',desc:'Stamp text or image over PDF pages.',icon:'fa-droplet',cat:'Edit PDF',impl:true},
  {id:'crop',name:'Crop PDF',desc:'Crop PDF pages.',icon:'fa-crop',cat:'Edit PDF',impl:true},
  {id:'sign',name:'Sign PDF',desc:'Sign PDF documents.',icon:'fa-signature',cat:'Edit PDF',impl:true},
  {id:'unlock',name:'Unlock PDF',desc:'Remove PDF password.',icon:'fa-lock-open',cat:'PDF Security',impl:true},
  {id:'protect',name:'Protect PDF',desc:'Encrypt PDF with a password.',icon:'fa-lock',cat:'PDF Security',impl:true},
  {id:'organize',name:'Organize PDF',desc:'Sort, delete and rotate pages.',icon:'fa-layer-group',cat:'Organize PDF',impl:true},
  {id:'repair',name:'Repair PDF',desc:'Recover data from damaged PDF.',icon:'fa-wrench',cat:'Organize PDF',impl:true},
  {id:'compare',name:'Compare PDF',desc:'Show differences between two PDFs.',icon:'fa-code-compare',cat:'Organize PDF',impl:true},
];

function $(sel,root=document){return root.querySelector(sel);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatBytes(b){if(b<1024)return b+' B';if(b<1048576)return (b/1024).toFixed(1)+' KB';return (b/1048576).toFixed(1)+' MB';}
function downloadBlob(blob,name){ if(window.saveAs) saveAs(blob,name); else { const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u);} }
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
}
function setStatus(panel,msg,type){ const el=panel.querySelector('.status'); if(!el)return; el.textContent=msg; el.className='status show '+(type||''); }
function showProgress(panel,on){ const el=panel.querySelector('.progress'); if(!el)return; el.classList.toggle('show',on); if(!on){const b=el.querySelector('div'); if(b)b.style.width='0%';} }
function setProgress(panel,p){ const el=panel.querySelector('.progress'); if(!el)return; const b=el.querySelector('div'); if(b)b.style.width=Math.min(100,Math.max(0,p))+'%'; }

function createDropzone(panel,{accept,multiple,onFiles}){
  const dz=document.createElement('div');
  dz.className='dropzone';
  dz.innerHTML='<i class="fa-solid fa-cloud-arrow-up"></i><h3>Select or drop files</h3><p>Supported: '+ (accept||'any') +'</p>';
  const input=document.createElement('input');
  input.type='file'; input.accept=accept||''; input.multiple=!!multiple; input.style.display='none';
  dz.appendChild(input);
  dz.addEventListener('click',()=>input.click());
  ['dragenter','dragover'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.add('drag')}));
  ['dragleave','drop'].forEach(e=>dz.addEventListener(e,ev=>{ev.preventDefault();dz.classList.remove('drag')}));
  dz.addEventListener('drop',e=>{onFiles([...e.dataTransfer.files]);});
  input.addEventListener('change',e=>{onFiles([...e.target.files]);input.value='';});
  if(panel.firstChild) panel.insertBefore(dz, panel.firstChild); else panel.appendChild(dz);
  return dz;
}

const thumbCache=new WeakMap();
async function thumbUrl(f){
  if(thumbCache.has(f)) return thumbCache.get(f);
  const work=(async()=>{
    let url=null;
    try{
      if(f.type.startsWith('image/')){
        url=URL.createObjectURL(f);
      } else if(f.type==='application/pdf'||/\.pdf$/i.test(f.name)){
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
function renderFileList(container,files,onChange){
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
    thumbUrl(f).then(u=>{ if(u && thumb.isConnected) thumb.innerHTML='<img src="'+u+'" alt="" draggable="false" />'; });
    thumb.addEventListener('click',e=>{ e.stopPropagation(); openFilePreview(f); });
    item.appendChild(thumb);

    const info=document.createElement('div');
    info.className='file-info';
    const name=document.createElement('span'); name.className='name'; name.textContent=f.name; name.title=f.name;
    const size=document.createElement('span'); size.className='size'; size.textContent=formatBytes(f.size);
    info.appendChild(name); info.appendChild(size); item.appendChild(info);

    if(multi){
      const mv=document.createElement('div'); mv.className='file-move';
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
      item.appendChild(mv);
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
function ensurePreviewOverlay(){
  if(previewOverlay) return previewOverlay;
  const ov=document.createElement('div');
  ov.className='preview-overlay';
  ov.innerHTML='<div class="preview-modal" role="dialog" aria-modal="true"><div class="preview-modal__head"><span class="preview-modal__name"></span><button type="button" class="preview-modal__close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button></div><div class="preview-modal__body"></div></div>';
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{
    if(e.target===ov || e.target.closest('.preview-modal__close')) ov.classList.remove('show');
  });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') ov.classList.remove('show'); });
  previewOverlay=ov;
  return ov;
}
async function openFilePreview(f){
  const ov=ensurePreviewOverlay();
  const body=ov.querySelector('.preview-modal__body');
  ov.querySelector('.preview-modal__name').textContent=f.name;
  body.innerHTML='<div class="preview-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading preview…</div>';
  ov.classList.add('show');
  try{
    if(f.type.startsWith('image/')){
      const img=document.createElement('img');
      img.alt=f.name;
      img.src=URL.createObjectURL(f);
      await new Promise((res,rej)=>{ img.onload=res; img.onerror=rej; });
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

/* Router */
function renderHome(root){
  root.innerHTML='';
  const hero=document.createElement('section');
  hero.className='hero';
  hero.innerHTML=`
    <div class="container">
      <h1>Every tool you need to work with PDFs in one place</h1>
      <p>Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.</p>
      <div class="search"><i class="fa-solid fa-magnifying-glass"></i><input id="searchInput" placeholder="Search tools..." /></div>
    </div>`;
  root.appendChild(hero);

  const filters=document.createElement('div');
  filters.className='tool-filters container';
  const tags=[
    {key:'all',label:'All',cats:null},
    {key:'organize',label:'Organize PDF',cats:['Organize PDF']},
    {key:'optimize',label:'Optimize PDF',cats:['Optimize PDF']},
    {key:'convert',label:'Convert PDF',cats:['Convert from PDF','Convert to PDF']},
    {key:'edit',label:'Edit PDF',cats:['Edit PDF']},
    {key:'security',label:'PDF Security',cats:['PDF Security']}
  ];
  tags.forEach((t,i)=>{
    const b=document.createElement('button');
    b.className='tool-tag'+(i===0?' active':'');
    b.textContent=t.label;
    b.dataset.cats=t.cats?t.cats.join('|'):'';
    b.addEventListener('click',()=>{
      filters.querySelectorAll('.tool-tag').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      const cats=b.dataset.cats?b.dataset.cats.split('|'):null;
      sec.querySelectorAll('.card').forEach(c=>{
        const ok=!cats||cats.includes(c.dataset.cat);
        c.dataset.filtered=ok?'1':'0';
        c.style.display=(ok&&c.dataset.matched!=='0')?'':'none';
      });
      sec.querySelectorAll('.cat-title').forEach(h=>{
        const grid=h.nextElementSibling;
        if(!grid)return;
        const any=[...grid.querySelectorAll('.card')].some(c=>c.dataset.filtered==='1'&&c.dataset.matched!=='0');
        h.style.display=any?'':'none';
        grid.style.display=any?'':'none';
      });
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
    const title=document.createElement('div'); title.className='cat-title'; const titleSpan=document.createElement('span'); titleSpan.textContent=cat; title.appendChild(titleSpan); sec.appendChild(title);
    const grid=document.createElement('div'); grid.className='grid';
    tools.forEach(t=>grid.appendChild(makeCard(t)));
    sec.appendChild(grid);
  });
  root.appendChild(sec);
  const input=$('#searchInput');
  input.addEventListener('input',()=>{
    const q=input.value.toLowerCase();
    sec.querySelectorAll('.card').forEach(c=>{
      const name=c.dataset.name.toLowerCase();
      c.dataset.matched=name.includes(q)?'1':'0';
      const filtered=c.dataset.filtered!=='0';
      c.style.display=(c.dataset.matched==='1'&&filtered)?'':'none';
    });
    sec.querySelectorAll('.cat-title').forEach(h=>{
      const grid=h.nextElementSibling;
      if(!grid)return;
      const any=[...grid.querySelectorAll('.card')].some(c=>c.style.display!=='none');
      h.style.display=any?'':'none';
      grid.style.display=any?'':'none';
    });
  });
}

function makeCard(t){
  const card=document.createElement('div');
  card.className='card';
  card.dataset.name=t.name;
  card.dataset.cat=t.cat;
  card.innerHTML=`<div class="icon"><i class="fa-solid ${t.icon}"></i></div><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.desc)}</p>`;
  card.addEventListener('click',()=>{location.hash='#/tool/'+t.id;});
  return card;
}

function renderTools(root){
  root.innerHTML='';
  const sec=document.createElement('section');
  sec.className='section container';
  sec.innerHTML='<h2>All tools</h2>';
  CATEGORIES.forEach(cat=>{
    const tools=TOOLS.filter(t=>t.cat===cat);
    if(!tools.length)return;
    const title=document.createElement('div'); title.className='cat-title'; const titleSpan=document.createElement('span'); titleSpan.textContent=cat; title.appendChild(titleSpan); sec.appendChild(title);
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
    <h1>About Online Converter</h1>
    <p>Online Converter is a free, browser-based PDF toolkit inspired by iLovePDF. All processing happens locally in your browser — your files are never uploaded to a server.</p>
    <p>Implemented with pdf-lib, pdf.js and Web Crypto. Some advanced conversions are still in progress.</p>`;
  root.appendChild(sec);
}

function renderTool(root,id){
  const tool=TOOLS.find(t=>t.id===id);
  root.innerHTML='';
  if(!tool){ root.innerHTML='<div class="container" style="padding:40px">Tool not found.</div>'; return; }
  const wrap=document.createElement('section');
  wrap.className='tool-page container';
  const header=document.createElement('div');
  header.className='tool-header';
  header.innerHTML=`<div class="icon"><i class="fa-solid ${tool.icon}"></i></div><div><h1>${escapeHtml(tool.name)}</h1><p>${escapeHtml(tool.desc)}</p></div>`;
  wrap.appendChild(header);
  const panel=document.createElement('div');
  panel.className='panel';
  wrap.appendChild(panel);
  root.appendChild(wrap);

  const status=document.createElement('div'); status.className='status'; panel.appendChild(status);
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

/* ---------- MERGE ---------- */
INITERS.merge = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:true,onFiles:f=>{files=files.concat(f);rerender();}});
  panel.insertBefore(list, panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-object-group"></i> Merge PDF';
  btn.addEventListener('click', async()=>{
    if(files.length<2){setStatus(panel,'Need at least 2 PDF files.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const merged=await PDFDocument.create();
      for(let i=0;i<files.length;i++){
        const bytes=new Uint8Array(await files[i].arrayBuffer());
        const doc=await PDFDocument.load(bytes);
        const pages=await merged.copyPages(doc,doc.getPageIndices());
        pages.forEach(p=>merged.addPage(p));
        setProgress(panel,(i+1)/files.length*100);
      }
      const out=await merged.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'merged.pdf');
      setStatus(panel,'Merged successfully!','success');
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
        <option value="all">All pages (ZIP)</option>
        <option value="ranges">Page ranges</option>
      </select>
    </div>
    <div class="field"><label>Ranges (e.g. 1-3,4,5-7)</label><input id="splitRanges" placeholder="1-3,4" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-scissors"></i> Split PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes);
      const total=doc.getPageCount();
      const mode=panel.querySelector('#splitMode').value;
      if(mode==='all'){
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
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-compress"></i> Compress PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const orig=bytes.byteLength;
      const doc=await PDFDocument.load(bytes);
      const out=await doc.save({useObjectStreams:true});
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'compressed.pdf');
      setStatus(panel,`Done. Original ${formatBytes(orig)} → ${formatBytes(out.byteLength)}.`,'success');
      setProgress(panel,100);
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
  opts.innerHTML=`<div class="field"><label>Pages (blank = all)</label><input id="rotPages" placeholder="1,3,5-7" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-rotate"></i> Rotate PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,degrees}=PDFLib;
      const bytes=await files[0].arrayBuffer();
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
  let files=[]; let order=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:async f=>{
    files=[f[0]]; order=[];
    try{
      const {PDFDocument}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes);
      order=doc.getPageIndices().slice();
      renderOrder();
    }catch(e){setStatus(panel,e.message,'error');}
  }});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const orderBox=document.createElement('div'); orderBox.className='file-list'; panel.insertBefore(orderBox,panel.querySelector('.status'));
  function renderOrder(){
    orderBox.innerHTML='';
    order.forEach((idx,i)=>{
      const item=document.createElement('div'); item.className='file-item';
      item.innerHTML=`<span class="name">Page ${idx+1}</span><button title="Up">↑</button><button title="Down">↓</button><button title="Delete">✕</button>`;
      const btns=item.querySelectorAll('button');
      btns[0].addEventListener('click',()=>{ if(i>0){[order[i-1],order[i]]=[order[i],order[i-1]]; renderOrder();} });
      btns[1].addEventListener('click',()=>{ if(i<order.length-1){[order[i+1],order[i]]=[order[i],order[i+1]]; renderOrder();} });
      btns[2].addEventListener('click',()=>{ order.splice(i,1); renderOrder(); });
      orderBox.appendChild(item);
    });
  }
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-layer-group"></i> Save organized PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length||!order.length){setStatus(panel,'Load a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes);
      const nd=await PDFDocument.create();
      const pages=await nd.copyPages(doc,order);
      pages.forEach(p=>nd.addPage(p));
      const out=await nd.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'organized.pdf');
      setStatus(panel,'Saved!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
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
      <select id="pnPos"><option value="bottom-center">Bottom center</option><option value="bottom-right">Bottom right</option><option value="top-center">Top center</option></select>
    </div>
    <div class="field"><label>Start number</label><input id="pnStart" type="number" value="1" /></div>
    <div class="field"><label>Font size</label><input id="pnSize" type="number" value="12" /></div>
    <div class="field"><label>Prefix</label><input id="pnPrefix" placeholder="Page " /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-list-ol"></i> Add page numbers';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,StandardFonts,rgb}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes);
      const font=await doc.embedFont(StandardFonts.Helvetica);
      const start=parseInt(panel.querySelector('#pnStart').value)||1;
      const size=parseInt(panel.querySelector('#pnSize').value)||12;
      const prefix=panel.querySelector('#pnPrefix').value;
      const pos=panel.querySelector('#pnPos').value;
      const total=doc.getPageCount();
      for(let i=0;i<total;i++){
        const page=doc.getPage(i);
        const {width,height}=page.getSize();
        const text=prefix+(start+i);
        const tw=font.widthOfTextAtSize(text,size);
        let x,y;
        if(pos==='bottom-center'){x=(width-tw)/2;y=24;}
        else if(pos==='bottom-right'){x=width-tw-24;y=24;}
        else {x=(width-tw)/2;y=height-30;}
        page.drawText(text,{x,y,size,font,color:rgb(0,0,0)});
        setProgress(panel,(i+1)/total*100);
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
    <div class="field"><label>Text</label><input id="wmText" value="CONFIDENTIAL" /></div>
    <div class="field"><label>Font size</label><input id="wmSize" type="number" value="48" /></div>
    <div class="field"><label>Opacity (0-1)</label><input id="wmOpacity" type="number" step="0.1" value="0.3" /></div>
    <div class="field"><label>Rotation</label><input id="wmRot" type="number" value="45" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-droplet"></i> Add watermark';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,StandardFonts,rgb,degrees}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes);
      const font=await doc.embedFont(StandardFonts.HelveticaBold);
      const text=panel.querySelector('#wmText').value||'WATERMARK';
      const size=parseInt(panel.querySelector('#wmSize').value)||48;
      const opacity=parseFloat(panel.querySelector('#wmOpacity').value)||0.3;
      const rot=parseInt(panel.querySelector('#wmRot').value)||45;
      const total=doc.getPageCount();
      for(let i=0;i<total;i++){
        const page=doc.getPage(i);
        const {width,height}=page.getSize();
        const tw=font.widthOfTextAtSize(text,size);
        page.drawText(text,{x:(width-tw)/2,y:height/2,size,font,color:rgb(0.5,0.5,0.5),opacity,rotate:degrees(rot)});
        setProgress(panel,(i+1)/total*100);
      }
      const out=await doc.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'watermarked.pdf');
      setStatus(panel,'Done!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

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
    <div class="field"><label>Password</label><input id="protPwd" type="password" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-lock"></i> Protect PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    const pwd=panel.querySelector('#protPwd').value;
    if(!pwd){setStatus(panel,'Enter a password.','error');return;}
    try{
      showProgress(panel,true);
      const {configure,lock}=await import('https://unpkg.com/pdf-lib-encrypt@1.0.3/src/index.js');
      configure(window.PDFLib);
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      const encrypted=await lock(bytes,pwd);
      offerDownload(panel, new Blob([encrypted],{type:'application/pdf'}),'protected.pdf');
      setStatus(panel,'Protected!','success');
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
    <div class="field"><label>Password</label><input id="unlockPwd" type="password" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-lock-open"></i> Unlock PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    const pwd=panel.querySelector('#unlockPwd').value;
    try{
      showProgress(panel,true);
      const {configure,unlockInPlace}=await import('https://unpkg.com/pdf-lib-encrypt@1.0.3/src/index.js');
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
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Signature text</label><input id="signText" placeholder="Your name" /></div>
    <div class="field"><label>Or signature image</label><input id="signImg" type="file" accept="image/*" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-signature"></i> Sign PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,StandardFonts,rgb}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes);
      const last=doc.getPage(doc.getPageCount()-1);
      const {width,height}=last.getSize();
      const text=panel.querySelector('#signText').value.trim();
      const imgFile=panel.querySelector('#signImg').files[0];
      if(imgFile){
        const ib=await imgFile.arrayBuffer();
        let img;
        if(imgFile.type==='image/png') img=await doc.embedPng(ib); else img=await doc.embedJpg(ib);
        const scale=0.25;
        const dims=img.scale(scale);
        last.drawImage(img,{x:width-dims.width-24,y:40,width:dims.width,height:dims.height});
      }
      if(text){
        const font=await doc.embedFont(StandardFonts.HelveticaOblique);
        last.drawText(text,{x:24,y:40,size:18,font,color:rgb(0,0,0.6)});
      }
      const out=await doc.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'signed.pdf');
      setStatus(panel,'Signed!','success');
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
  opts.innerHTML=`<div class="field"><label>Scale</label><input id="jpgScale" type="number" step="0.5" value="2" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-image"></i> Convert to JPG';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const scale=parseFloat(panel.querySelector('#jpgScale').value)||2;
      const bytes=await files[0].arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
      const zip=new JSZip();
      let singleBlob=null;
      for(let i=1;i<=pdf.numPages;i++){
        const page=await pdf.getPage(i);
        const viewport=page.getViewport({scale});
        const canvas=document.createElement('canvas');
        canvas.width=viewport.width; canvas.height=viewport.height;
        const ctx=canvas.getContext('2d');
        await page.render({canvasContext:ctx,viewport}).promise;
        const blob=await new Promise(res=>canvas.toBlob(res,'image/jpeg',0.92));
        if(pdf.numPages===1) singleBlob=blob;
        else zip.file(`page_${i}.jpg`,blob);
        setProgress(panel,i/pdf.numPages*100);
      }
      if(singleBlob) offerDownload(panel, singleBlob,'page_1.jpg');
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
  // fix remove
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-pdf"></i> Convert to PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select images first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const doc=await PDFDocument.create();
      for(let i=0;i<files.length;i++){
        const f=files[i];
        const bytes=await f.arrayBuffer();
        let img;
        if(f.type==='image/png') img=await doc.embedPng(bytes);
        else img=await doc.embedJpg(bytes);
        const page=doc.addPage([img.width,img.height]);
        page.drawImage(img,{x:0,y:0,width:img.width,height:img.height});
        setProgress(panel,(i+1)/files.length*100);
      }
      const out=await doc.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'images.pdf');
      setStatus(panel,'Converted!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
}
INITERS['jpg-to-pdf']=initImagesToPdf;
INITERS['scan-to-pdf']=initImagesToPdf;

/* ---------- PDF TO WORD ---------- */
INITERS['pdf-to-word'] = function(panel){
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`<div class="field"><label>Format</label>
    <select id="wFmt"><option value="docx">DOCX</option><option value="txt">TXT</option></select></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-word"></i> Convert to Word';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const bytes=await files[0].arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
      let fullText='';
      const paragraphs=[];
      for(let i=1;i<=pdf.numPages;i++){
        const page=await pdf.getPage(i);
        const tc=await page.getTextContent();
        const text=tc.items.map(it=>it.str).join(' ');
        paragraphs.push(text);
        fullText += `--- Page ${i} ---\n${text}\n\n`;
        setProgress(panel,i/pdf.numPages*100);
      }
      const fmt=panel.querySelector('#wFmt').value;
      if(fmt==='txt'){
        offerDownload(panel, new Blob([fullText],{type:'text/plain'}),'converted.txt');
      } else if(window.docx){
        const {Document,Packer,Paragraph,TextRun}=window.docx;
        const doc=new Document({sections:[{children:paragraphs.map(t=>new Paragraph({children:[new TextRun(t)]}))}]});
        const blob=await Packer.toBlob(doc);
        offerDownload(panel, blob,'converted.docx');
      } else {
        offerDownload(panel, new Blob([fullText],{type:'text/plain'}),'converted.txt');
      }
      setStatus(panel,'Converted!','success');
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
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-excel"></i> Convert to Excel';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const bytes=await files[0].arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
      const rows=[];
      for(let i=1;i<=pdf.numPages;i++){
        const page=await pdf.getPage(i);
        const tc=await page.getTextContent();
        rows.push(['--- Page '+i+' ---']);
        tc.items.forEach(it=>{ if(it.str.trim()) rows.push([it.str]); });
        setProgress(panel,i/pdf.numPages*100);
      }
      const ws=XLSX.utils.aoa_to_sheet(rows);
      const wb=XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb,ws,'PDF');
      const xlsxArray=XLSX.write(wb,{bookType:'xlsx',type:'array'});
      offerDownload(panel,new Blob([xlsxArray],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),'converted.xlsx');
      setStatus(panel,'Converted!','success');
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
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-powerpoint"></i> Convert to PowerPoint';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const bytes=await files[0].arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
      const pptx=new PptxGenJS();
      for(let i=1;i<=pdf.numPages;i++){
        const page=await pdf.getPage(i);
        const viewport=page.getViewport({scale:2});
        const canvas=document.createElement('canvas');
        canvas.width=viewport.width; canvas.height=viewport.height;
        await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
        const img=canvas.toDataURL('image/jpeg',0.92);
        const slide=pptx.addSlide();
        slide.addImage({data:img,x:0,y:0,w:'100%',h:'100%'});
        setProgress(panel,i/pdf.numPages*100);
      }
      const pptxBuf=await pptx.write({outputType:'arraybuffer'});
      offerDownload(panel,new Blob([pptxBuf],{type:'application/vnd.openxmlformats-officedocument.presentationml.presentation'}),'converted.pptx');
      setStatus(panel,'Converted!','success');
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
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-shield"></i> Convert to PDF/A';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes);
      doc.setTitle(doc.getTitle()||'Document');
      doc.setProducer('Online Converter');
      const out=await doc.save({useObjectStreams:true});
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'pdfa.pdf');
      setStatus(panel,'Converted (best-effort PDF/A).','success');
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
      const bytes=await files[0].arrayBuffer();
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
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-pdf"></i> Convert to PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a DOCX first.','error');return;}
    try{
      showProgress(panel,true);
      const ab=await files[0].arrayBuffer();
      const result=await mammoth.convertToHtml({arrayBuffer:ab});
      const opt={margin:10, filename:'converted.pdf', image:{type:'jpeg',quality:0.98}, html2canvas:{scale:2}, jsPDF:{unit:'pt',format:'a4',orientation:'portrait'}};
      await html2pdf().set(opt).from(result.value).save();
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
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-pdf"></i> Convert to PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select an XLSX first.','error');return;}
    try{
      showProgress(panel,true);
      const ab=await files[0].arrayBuffer();
      const wb=XLSX.read(ab,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const html=XLSX.utils.sheet_to_html(ws);
      const opt={margin:10, filename:'converted.pdf', html2canvas:{scale:2}, jsPDF:{unit:'pt',format:'a4',orientation:'landscape'}};
      await html2pdf().set(opt).from(html).save();
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
      showProgress(panel,true);
      const bytes=new Uint8Array(await files[0].arrayBuffer());
      let pdfBytes=null;
      try{
        const {Ream}=await import('https://unpkg.com/reamkit@1.36.1/dist/esm/index.js?module');
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
  opts.innerHTML=`<div class="field" style="grid-column:1/-1"><label>HTML content</label><textarea id="htmlIn" style="width:100%;min-height:160px;padding:10px;border:1px solid var(--border);border-radius:10px"></textarea></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-file-pdf"></i> Convert to PDF';
  btn.addEventListener('click', async()=>{
    const html=panel.querySelector('#htmlIn').value.trim();
    if(!html){setStatus(panel,'Enter HTML first.','error');return;}
    try{
      showProgress(panel,true);
      const opt={margin:10, filename:'converted.pdf', html2canvas:{scale:2}, jsPDF:{unit:'pt',format:'a4'}};
      await html2pdf().set(opt).from(html).save();
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
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,rerender); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Left</label><input id="cropL" type="number" value="0" /></div>
    <div class="field"><label>Right</label><input id="cropR" type="number" value="0" /></div>
    <div class="field"><label>Top</label><input id="cropT" type="number" value="0" /></div>
    <div class="field"><label>Bottom</label><input id="cropB" type="number" value="0" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-crop"></i> Crop PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes);
      const L=parseInt(panel.querySelector('#cropL').value)||0;
      const R=parseInt(panel.querySelector('#cropR').value)||0;
      const T=parseInt(panel.querySelector('#cropT').value)||0;
      const B=parseInt(panel.querySelector('#cropB').value)||0;
      const total=doc.getPageCount();
      for(let i=0;i<total;i++){
        const page=doc.getPage(i);
        const {width,height}=page.getSize();
        try{ page.setCropBox(L,B,width-L-R,height-B-T); }
        catch(e){ page.setSize(width-L-R,height-T-B); }
        setProgress(panel,(i+1)/total*100);
      }
      const out=await doc.save();
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'cropped.pdf');
      setStatus(panel,'Cropped!','success');
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
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-wrench"></i> Repair PDF';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes,{ignoreEncryption:true});
      const out=await doc.save({useObjectStreams:true});
      offerDownload(panel, new Blob([out],{type:'application/pdf'}),'repaired.pdf');
      setStatus(panel,'Repaired!','success');
    }catch(e){setStatus(panel,e.message,'error');}
    finally{showProgress(panel,false);}
  });
  actions.appendChild(btn);
  panel.insertBefore(actions,panel.querySelector('.status'));
};

/* ---------- COMPARE PDF ---------- */
INITERS.compare = function(panel){
  let f1=[],f2=[];
  const d1=document.createElement('div'); d1.className='dropzone'; d1.innerHTML='<i class="fa-solid fa-cloud-arrow-up"></i><h3>First PDF</h3>';
  const i1=document.createElement('input'); i1.type='file'; i1.accept='application/pdf'; i1.style.display='none';
  d1.appendChild(i1);
  d1.addEventListener('click',()=>i1.click());
  i1.addEventListener('change',e=>{f1=[e.target.files[0]]; i1.value='';});
  const d2=document.createElement('div'); d2.className='dropzone'; d2.innerHTML='<i class="fa-solid fa-cloud-arrow-up"></i><h3>Second PDF</h3>';
  const i2=document.createElement('input'); i2.type='file'; i2.accept='application/pdf'; i2.style.display='none';
  d2.appendChild(i2);
  d2.addEventListener('click',()=>i2.click());
  i2.addEventListener('change',e=>{f2=[e.target.files[0]]; i2.value='';});
  panel.insertBefore(d1,panel.querySelector('.status'));
  panel.insertBefore(d2,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-code-compare"></i> Compare';
  btn.addEventListener('click', async()=>{
    if(!f1.length||!f2.length){setStatus(panel,'Select both PDFs first.','error');return;}
    try{
      showProgress(panel,true);
      async function extract(f){
        const bytes=await f.arrayBuffer();
        const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
        let t='';
        for(let i=1;i<=pdf.numPages;i++){
          const page=await pdf.getPage(i);
          const tc=await page.getTextContent();
          t += tc.items.map(it=>it.str).join(' ')+'\n';
        }
        return t;
      }
      const a=await extract(f1[0]);
      const b=await extract(f2[0]);
      const la=a.split(/\n/), lb=b.split(/\n/);
      let diff='';
      const n=Math.max(la.length,lb.length);
      for(let i=0;i<n;i++){
        if(la[i]===lb[i]) diff+='  '+(la[i]||'')+'\n';
        else { if(la[i]) diff+='- '+(la[i]||'')+'\n'; if(lb[i]) diff+='+ '+(lb[i]||'')+'\n'; }
      }
      const pre=document.createElement('pre');
      pre.style.maxHeight='300px'; pre.style.overflow='auto'; pre.style.background='#f3f4f6'; pre.style.padding='12px'; pre.style.borderRadius='8px';
      pre.textContent=diff;
      panel.insertBefore(pre,panel.querySelector('.status'));
      offerDownload(panel, new Blob([diff],{type:'text/plain'}),'compare.txt');
      setStatus(panel,'Compared!','success');
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
        <div class="field"><label>Email</label><input id="authEmail" type="email" placeholder="you@example.com" /></div>
        <div class="field"><label>Password</label><input id="authPass" type="password" placeholder="••••••••" /></div>
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
  privacy:{title:'Privacy policy',icon:'fa-shield-halved',body:'Online Converter processes every file locally in your browser. Files are never uploaded to our servers, stored, or shared. We do not require an account to use the tools.'},
  terms:{title:'Terms & conditions',icon:'fa-file-contract',body:'Online Converter is provided free of charge for personal and commercial use. The service is offered “as is” without warranty. You are responsible for the files you process and for keeping backups.'},
  contact:{title:'Contact us',icon:'fa-envelope',body:'Questions, feedback or business enquiries? Email us at hello@filofa.com or visit filofa.com. We usually reply within one business day.'},
  faq:{title:'Frequently asked questions',icon:'fa-circle-question',body:'Are my files uploaded? No — all processing happens in your browser. Is it free? Yes, all tools are free. Do I need an account? No. Which formats are supported? PDF, DOCX, XLSX, PPTX, JPG, PNG and HTML.'},
  features:{title:'Features',icon:'fa-star',body:'Merge, split, compress, convert, edit, sign, protect and organize PDFs. Convert between PDF and Word, Excel, PowerPoint, JPG, HTML and PDF/A. Everything runs locally in your browser.'},
  pricing:{title:'Pricing',icon:'fa-tag',body:'Online Converter is 100% free. There are no subscriptions, hidden fees or file limits. Advanced server-side workflows are available through Filofa Technology on request.'}
};
function renderInfo(root,key){
  const info=INFO[key]||INFO.about;
  root.innerHTML='';
  const sec=document.createElement('section');
  sec.className='about container';
  sec.innerHTML=`<div class="tool-header"><div class="icon"><i class="fa-solid ${info.icon}"></i></div><div><h1>${info.title}</h1><p>Online Converter</p></div></div><p style="max-width:760px">${info.body}</p><div class="actions"><a class="btn btn-primary" href="#/tools"><i class="fa-solid fa-grid-2"></i> Explore all tools</a><a class="btn btn-ghost" href="#/">Back to home</a></div>`;
  root.appendChild(sec);
}

/* ---------- router ---------- */
function route(){
  const hash=location.hash||'#/'; const app=document.getElementById('app');
  if(hash==='#/'||hash==='#') renderHome(app);
  else if(hash==='#/tools') renderTools(app);
  else if(hash.startsWith('#/tool/')) renderTool(app,hash.split('/')[2]);
  else if(hash==='#/about') renderAbout(app);
  else if(hash==='#/login') renderAuth(app,'login');
  else if(hash==='#/register') renderAuth(app,'register');
  else if(INFO[hash.replace('#/','')]) renderInfo(app,hash.replace('#/',''));
  else renderHome(app);
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
window.addEventListener('DOMContentLoaded',route);

/* menu */
document.addEventListener('DOMContentLoaded',()=>{
  const menuBtn=document.getElementById('menuBtn');
  const menu=document.querySelector('.menu');
  if(menuBtn&&menu){
    menuBtn.addEventListener('click',e=>{
      e.stopPropagation();
      menu.classList.toggle('open');
    });
  }
  document.querySelectorAll('.nav-has-dropdown > .nav-link, .more-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault(); e.stopPropagation();
      const parent=btn.closest('.nav-has-dropdown');
      if(!parent) return;
      const wasOpen=parent.classList.contains('open');
      document.querySelectorAll('.nav-has-dropdown.open').forEach(x=>x.classList.remove('open'));
      if(!wasOpen) parent.classList.add('open');
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
      document.querySelectorAll('.nav-has-dropdown.open').forEach(x=>x.classList.remove('open'));
      if(menu) menu.classList.remove('open');
    });
  });
  const appsSearch=document.getElementById('appsSearch');
  if(appsSearch){
    appsSearch.addEventListener('input',()=>{
      const q=appsSearch.value.toLowerCase().trim();
      document.querySelectorAll('.apps-menu .app-tile').forEach(tile=>{
        tile.style.display=(!q||tile.textContent.toLowerCase().includes(q))?'':'none';
      });
    });
  }
});
