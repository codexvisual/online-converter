/* Online Converter app */

const CATEGORIES = ['Merge & Split','Compress','Convert from PDF','Convert to PDF','Edit','Security','Organize'];

const TOOLS = [
  {id:'merge',name:'Merge PDF',desc:'Combine PDFs in the order you want.',icon:'fa-object-group',cat:'Merge & Split',impl:true},
  {id:'split',name:'Split PDF',desc:'Separate one page or a whole set for easy conversion.',icon:'fa-scissors',cat:'Merge & Split',impl:true},
  {id:'compress',name:'Compress PDF',desc:'Reduce file size while optimizing for maximal quality.',icon:'fa-compress',cat:'Compress',impl:true},
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
  {id:'edit',name:'Edit PDF',desc:'Add text, images and shapes to your PDF.',icon:'fa-pen-to-square',cat:'Edit',impl:true},
  {id:'rotate',name:'Rotate PDF',desc:'Rotate PDF pages.',icon:'fa-rotate',cat:'Edit',impl:true},
  {id:'page-numbers',name:'Page numbers',desc:'Add page numbers to PDFs.',icon:'fa-list-ol',cat:'Edit',impl:true},
  {id:'watermark',name:'Watermark',desc:'Stamp text or image over PDF pages.',icon:'fa-droplet',cat:'Edit',impl:true},
  {id:'crop',name:'Crop PDF',desc:'Crop PDF pages.',icon:'fa-crop',cat:'Edit',impl:true},
  {id:'sign',name:'Sign PDF',desc:'Sign PDF documents.',icon:'fa-signature',cat:'Edit',impl:true},
  {id:'unlock',name:'Unlock PDF',desc:'Remove PDF password.',icon:'fa-lock-open',cat:'Security',impl:true},
  {id:'protect',name:'Protect PDF',desc:'Encrypt PDF with a password.',icon:'fa-lock',cat:'Security',impl:true},
  {id:'organize',name:'Organize PDF',desc:'Sort, delete and rotate pages.',icon:'fa-layer-group',cat:'Organize',impl:true},
  {id:'repair',name:'Repair PDF',desc:'Recover data from damaged PDF.',icon:'fa-wrench',cat:'Organize',impl:true},
  {id:'compare',name:'Compare PDF',desc:'Show differences between two PDFs.',icon:'fa-code-compare',cat:'Organize',impl:true},
];

function $(sel,root=document){return root.querySelector(sel);}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function formatBytes(b){if(b<1024)return b+' B';if(b<1048576)return (b/1024).toFixed(1)+' KB';return (b/1048576).toFixed(1)+' MB';}
function downloadBlob(blob,name){ if(window.saveAs) saveAs(blob,name); else { const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=name; a.click(); URL.revokeObjectURL(u);} }
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

function renderFileList(container,files,onRemove){
  container.innerHTML='';
  files.forEach((f,i)=>{
    const item=document.createElement('div');
    item.className='file-item';
    item.innerHTML=`<i class="fa-solid fa-file"></i><span class="name">${escapeHtml(f.name)}</span><span class="size">${formatBytes(f.size)}</span><button title="Remove"><i class="fa-solid fa-xmark"></i></button>`;
    item.querySelector('button').addEventListener('click',()=>onRemove(i));
    container.appendChild(item);
  });
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
    {key:'organize',label:'Organize PDF',cats:['Merge & Split','Organize']},
    {key:'optimize',label:'Optimize PDF',cats:['Compress']},
    {key:'convert',label:'Convert PDF',cats:['Convert from PDF','Convert to PDF']},
    {key:'edit',label:'Edit PDF',cats:['Edit']},
    {key:'security',label:'PDF Security',cats:['Security']}
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
    const title=document.createElement('div'); title.className='cat-title'; title.textContent=cat; sec.appendChild(title);
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
    const title=document.createElement('div'); title.className='cat-title'; title.textContent=cat; sec.appendChild(title);
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
        const bytes=await files[i].arrayBuffer();
        const doc=await PDFDocument.load(bytes);
        const pages=await merged.copyPages(doc,doc.getPageIndices());
        pages.forEach(p=>merged.addPage(p));
        setProgress(panel,(i+1)/files.length*100);
      }
      const out=await merged.save();
      downloadBlob(new Blob([out],{type:'application/pdf'}),'merged.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
        downloadBlob(blob,'split_pages.zip');
      } else {
        const ranges=parseRanges(panel.querySelector('#splitRanges').value,total);
        if(ranges.length===1){
          const nd=await PDFDocument.create();
          const pages=await nd.copyPages(doc,ranges[0].map(x=>x-1));
          pages.forEach(p=>nd.addPage(p));
          const b=await nd.save();
          downloadBlob(new Blob([b],{type:'application/pdf'}),'split.pdf');
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
          downloadBlob(blob,'split_parts.zip');
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
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];renderFileList(list,files,i=>{files=[];renderFileList(list,files,()=>{});});}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'compressed.pdf');
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
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Angle</label>
      <select id="rotAngle"><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select>
    </div>
    <div class="field"><label>Pages (blank = all)</label><input id="rotPages" placeholder="1,3,5-7" /></div>`;
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
      const angle=parseInt(panel.querySelector('#rotAngle').value);
      const pagesInput=panel.querySelector('#rotPages').value.trim();
      let targets;
      if(!pagesInput) targets=[...Array(total).keys()];
      else targets=parseRanges(pagesInput,total).flat().map(n=>n-1);
      targets.forEach(i=>{ const p=doc.getPage(i); p.setRotation(degrees((p.getRotation().angle+angle)%360)); });
      const out=await doc.save();
      downloadBlob(new Blob([out],{type:'application/pdf'}),'rotated.pdf');
      setStatus(panel,'Rotated successfully!','success');
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'organized.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'numbered.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'watermarked.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
      downloadBlob(new Blob([encrypted],{type:'application/pdf'}),'protected.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'unlocked.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'signed.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
      if(singleBlob) downloadBlob(singleBlob,'page_1.jpg');
      else { const b=await zip.generateAsync({type:'blob'}); downloadBlob(b,'pdf_pages.zip'); }
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
  createDropzone(panel,{accept:'image/*',multiple:true,onFiles:f=>{files=files.concat(f);renderFileList(list,files,i=>{files.splice(i,1);renderFileList(list,files,()=>{});});}});
  // fix remove
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'images.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{ files.splice(i,1); rerender(); }); }
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
        downloadBlob(new Blob([fullText],{type:'text/plain'}),'converted.txt');
      } else if(window.docx){
        const {Document,Packer,Paragraph,TextRun}=window.docx;
        const doc=new Document({sections:[{children:paragraphs.map(t=>new Paragraph({children:[new TextRun(t)]}))}]});
        const blob=await Packer.toBlob(doc);
        downloadBlob(blob,'converted.docx');
      } else {
        downloadBlob(new Blob([fullText],{type:'text/plain'}),'converted.txt');
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
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
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
      XLSX.writeFile(wb,'converted.xlsx');
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
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
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
      await pptx.writeFile({fileName:'converted.pptx'});
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
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'pdfa.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
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
      downloadBlob(new Blob([html],{type:'text/html'}),'converted.html');
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
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
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
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
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
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
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
      downloadBlob(new Blob([pdfBytes],{type:'application/pdf'}),'converted.pdf');
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
  let files=[];
  const list=document.createElement('div'); list.className='file-list';
  createDropzone(panel,{accept:'application/pdf',multiple:false,onFiles:f=>{files=[f[0]];rerender();}});
  panel.insertBefore(list,panel.querySelector('.status'));
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
  rerender();
  const opts=document.createElement('div'); opts.className='options';
  opts.innerHTML=`
    <div class="field"><label>Text to add</label><input id="editText" /></div>
    <div class="field"><label>Page (1-based, blank=all)</label><input id="editPage" /></div>
    <div class="field"><label>X</label><input id="editX" type="number" value="50" /></div>
    <div class="field"><label>Y</label><input id="editY" type="number" value="50" /></div>
    <div class="field"><label>Size</label><input id="editSize" type="number" value="16" /></div>
    <div class="field"><label>Image (optional)</label><input id="editImg" type="file" accept="image/*" /></div>`;
  panel.insertBefore(opts,panel.querySelector('.status'));
  const actions=document.createElement('div'); actions.className='actions';
  const btn=document.createElement('button'); btn.className='btn btn-primary'; btn.innerHTML='<i class="fa-solid fa-pen-to-square"></i> Apply edits';
  btn.addEventListener('click', async()=>{
    if(!files.length){setStatus(panel,'Select a PDF first.','error');return;}
    try{
      showProgress(panel,true);
      const {PDFDocument,StandardFonts,rgb}=PDFLib;
      const bytes=await files[0].arrayBuffer();
      const doc=await PDFDocument.load(bytes);
      const text=panel.querySelector('#editText').value;
      const size=parseInt(panel.querySelector('#editSize').value)||16;
      const x=parseInt(panel.querySelector('#editX').value)||50;
      const y=parseInt(panel.querySelector('#editY').value)||50;
      const pageInput=panel.querySelector('#editPage').value.trim();
      const imgFile=panel.querySelector('#editImg').files[0];
      const total=doc.getPageCount();
      const targets=pageInput?pageInput.split(',').map(n=>parseInt(n)-1):[...Array(total).keys()];
      const font=await doc.embedFont(StandardFonts.Helvetica);
      for(const i of targets){
        if(i<0||i>=total) continue;
        const page=doc.getPage(i);
        if(text) page.drawText(text,{x,y,size,font,color:rgb(0,0,0)});
        if(imgFile){
          const ib=await imgFile.arrayBuffer();
          let img;
          if(imgFile.type==='image/png') img=await doc.embedPng(ib); else img=await doc.embedJpg(ib);
          page.drawImage(img,{x:x+ (text?100:0),y,width:100,height:100});
        }
        setProgress(panel,(targets.indexOf(i)+1)/targets.length*100);
      }
      const out=await doc.save();
      downloadBlob(new Blob([out],{type:'application/pdf'}),'edited.pdf');
      setStatus(panel,'Edited!','success');
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
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'cropped.pdf');
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
  function rerender(){ renderFileList(list,files,i=>{files=[];rerender();}); }
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
      downloadBlob(new Blob([out],{type:'application/pdf'}),'repaired.pdf');
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
      downloadBlob(new Blob([diff],{type:'text/plain'}),'compare.txt');
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
  document.querySelectorAll('.nav-link,.more-btn').forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault(); e.stopPropagation();
      const parent=btn.closest('.nav-has-dropdown');
      const wasOpen=parent.classList.contains('open');
      document.querySelectorAll('.nav-has-dropdown.open').forEach(x=>x.classList.remove('open'));
      if(!wasOpen) parent.classList.add('open');
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
});
