/* Online Converter — image tools v2: live preview, presets, worker processing */
(function(){
'use strict';
const IMG_ACCEPT='image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/tiff,image/heic,.psd,.tif,.tiff,.heic,.heif,.raw,.cr2,.nef,.arw,.dng';
const MAX_PREVIEW=1000;

/* ----------------------------- helpers ----------------------------- */
function fmtSize(n){ return n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB'; }
function baseName(f){ return (f.name||'image').replace(/\.[^.]+$/,''); }
function outName(f,suffix,ext){ return baseName(f)+suffix+'.'+ext; }
function canvas(w,h){ const c=document.createElement('canvas'); c.width=Math.max(1,Math.round(w)); c.height=Math.max(1,Math.round(h)); return c; }
function toBlob(c,type,q){ return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Could not encode image')),type,q)); }
const decodeCache=new WeakMap();

async function decodeAny(file){
  if(decodeCache.has(file)) return decodeCache.get(file);
  const p=(async()=>{
    if(/\.svg$/i.test(file.name)||file.type==='image/svg+xml'){
      const txt=(await file.text()).replace(/<\?xml[^>]*\?>/,'').trim();
      const im=new Image(); const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(txt);
      await new Promise((res,rej)=>{im.onload=res;im.onerror=()=>rej(new Error('Invalid SVG image'));im.src=url;});
      return {__img:im,width:im.naturalWidth||800,height:im.naturalHeight||600,close(){}};
    }
    if(window.createImageBitmap){ try{ return await createImageBitmap(file); }catch(e){} }
    const url=URL.createObjectURL(file); const im=new Image();
    await new Promise((res,rej)=>{im.onload=res;im.onerror=()=>rej(new Error('Cannot read '+file.name));im.src=url;});
    return {__img:im,width:im.naturalWidth,height:im.naturalHeight,close(){URL.revokeObjectURL(url);}};
  })();
  decodeCache.set(file,p);
  try{ return await p; }catch(e){ decodeCache.delete(file); throw e; }
}

async function prepareImage(file){
  const n=(file.name||'').toLowerCase();
  if(/\.(heic|heif)$/.test(n)){
    await ensureLib('heic2any');
    const out=await window.heic2any({blob:file,toType:'image/jpeg',quality:0.92});
    return new File([Array.isArray(out)?out[0]:out],outName(file,'','jpg'),{type:'image/jpeg'});
  }
  if(/\.(tif|tiff)$/.test(n)){
    await ensureLib('UTIF');
    const buf=await file.arrayBuffer(); const ifds=window.UTIF.decode(buf);
    window.UTIF.decodeImage(buf,ifds[0]);
    const c=canvas(ifds[0].width,ifds[0].height), ctx=c.getContext('2d');
    const id=ctx.createImageData(c.width,c.height); id.data.set(window.UTIF.toRGBA8(ifds[0])); ctx.putImageData(id,0,0);
    return new File([await toBlob(c,'image/jpeg',0.92)],outName(file,'','jpg'),{type:'image/jpeg'});
  }
  if(/\.psd$/.test(n)){
    await ensureLib('PSD');
    const psd=window.PSD.fromBuffer(await file.arrayBuffer());
    const png=await new Promise((res,rej)=>psd.toImage((e,b)=>e?rej(e):res(b)));
    return new File([png],outName(file,'','png'),{type:'image/png'});
  }
  if(/\.(raw|cr2|nef|arw|dng)$/.test(n)) throw new Error('RAW needs a camera-specific decoder. Save it as JPG or TIFF first.');
  return file;
}

async function deliverItems(panel,items,zipName){
  const arr=(items||[]).filter(Boolean);
  if(!arr.length) throw new Error('No images were created.');
  if(arr.length===1){ offerDownload(panel,arr[0].blob,arr[0].name); return arr; }
  await waitForCore('JSZip');
  const zip=new JSZip();
  arr.forEach((it,i)=>zip.file(it.name||('image_'+(i+1)+'.jpg'),it.blob));
  offerDownload(panel,await zip.generateAsync({type:'blob'}),(zipName||'images')+'.zip');
  return arr;
}

function opts(rows){ return rows.join(''); }
function field(label,inner){ const m=inner.match(/id="([^"]+)"/); return '<div class="field"><label'+(m?' for="'+m[1]+'"':'')+'>'+label+'</label>'+inner+'</div>'; }
function range(id,label,min,max,val,step){ return field(label,'<input id="'+id+'" type="range" min="'+min+'" max="'+max+'" step="'+(step||1)+'" value="'+val+'" />'); }
function select(id,label,options){ return field(label,'<select id="'+id+'">'+options.map(o=>'<option value="'+o[0]+'">'+o[1]+'</option>').join('')+'</select>'); }
function text(id,label,val,ph){ return field(label,'<input id="'+id+'" type="text" value="'+(val||'')+'" placeholder="'+(ph||'')+'" />'); }
function number(id,label,val,min,max){ return field(label,'<input id="'+id+'" type="number" value="'+(val||'')+'" min="'+(min||0)+'" max="'+(max||99999)+'" />'); }
function color(id,label,val){ return field(label,'<input id="'+id+'" type="color" value="'+val+'" />'); }
function presets(list){ return '<div class="preset-row">'+list.map((p,i)=>'<button type="button" class="preset-btn'+(i===0?' active':'')+'" data-preset="'+escapeHtml(p[0])+'">'+escapeHtml(p[1])+'</button>').join('')+'</div>'; }
function advanced(inner){ return '<details class="advanced"><summary>Advanced options</summary><div class="options">'+inner+'</div></details>'; }

function bindPresets(panel,apply){
  panel.addEventListener('click',e=>{
    const b=e.target.closest('.preset-btn'); if(!b) return;
    panel.querySelectorAll('.preset-btn').forEach(x=>x.classList.toggle('active',x===b));
    apply(b.dataset.preset);
    panel.dispatchEvent(new Event('input',{bubbles:true}));
  });
}

/* ------------------------- shared live preview (pro) ------------------------- */
function makeLive(panel,extra,cfg){
  const box=document.createElement('div'); box.className='live-box';
  const stage=document.createElement('div'); stage.className='live-stage';
  const orig=document.createElement('canvas'); orig.className='live-original';
  const cv=document.createElement('canvas'); cv.className='live-preview';
  const inner=document.createElement('div'); inner.className='live-inner';
  const handle=document.createElement('div'); handle.className='live-split-handle'; handle.innerHTML='<i class="fa-solid fa-grip-lines-vertical"></i>';
  inner.appendChild(orig); inner.appendChild(cv); inner.appendChild(handle); stage.appendChild(inner);
  const bar=document.createElement('div'); bar.className='live-bar';
  bar.innerHTML='<span class="live-label"><i class="fa-solid fa-bolt"></i> LIVE</span>'+
    '<button type="button" class="live-tool" data-act="undo" aria-label="Undo" title="Undo (Ctrl+Z)"><i class="fa-solid fa-rotate-left"></i></button>'+
    '<button type="button" class="live-tool" data-act="redo" aria-label="Redo" title="Redo (Ctrl+Y)"><i class="fa-solid fa-rotate-right"></i></button>'+
    '<button type="button" class="live-tool" data-act="reset" aria-label="Reset all adjustments" title="Reset all"><i class="fa-solid fa-eraser"></i></button>'+
    '<button type="button" class="live-tool" data-act="compare" aria-label="Compare before and after" title="Before / after"><i class="fa-solid fa-arrows-left-right"></i></button>'+
    '<span class="live-zoom"><button type="button" class="live-tool" data-act="zoomout" aria-label="Zoom out">−</button><span class="zoom-label">100%</span><button type="button" class="live-tool" data-act="zoomin" aria-label="Zoom in">+</button></span>'+
    '<span class="live-dims"></span>';
  box.appendChild(stage); box.appendChild(bar);
  extra.innerHTML=''; extra.appendChild(box);
  let im=null, raf=0, token=0, zoom=1, split=50, compare=false;
  let hist=[], hi=0, hTimer=0, defaults=null;
  const get=id=>{ const el=panel.querySelector('#'+id); return el?(el.type==='checkbox'?el.checked:el.value):''; };
  function controls(){ return [...panel.querySelectorAll('.options input,.options select,.options textarea')].filter(e=>e.id); }
  function snapshot(){ return JSON.stringify(controls().map(el=>[el.id,el.type==='checkbox'?el.checked:el.value])); }
  function pushHistory(){
    const s=snapshot(); if(hist[hi]===s)return;
    hist=hist.slice(0,hi+1); hist.push(s); if(hist.length>40)hist.shift(); hi=hist.length-1; syncButtons();
  }
  function restore(s){
    try{ JSON.parse(s).forEach(pair=>{ const el=panel.querySelector('#'+pair[0]); if(!el)return; if(el.type==='checkbox')el.checked=pair[1]; else el.value=pair[1]; }); }catch(e){}
    refresh();
  }
  function syncButtons(){
    const u=bar.querySelector('[data-act=undo]'),r=bar.querySelector('[data-act=redo]');
    if(u)u.disabled=hi<=0; if(r)r.disabled=hi>=hist.length-1;
  }
  function size(){
    if(!im) return {w:600,h:400};
    if(cfg.previewSize) return cfg.previewSize(im,get);
    const w=Math.min(cfg.maxW||MAX_PREVIEW,im.width);
    return {w:w,h:Math.max(1,Math.round(im.height*w/im.width))};
  }
  function paintOriginal(){ if(!im)return; orig.width=cv.width; orig.height=cv.height; orig.getContext('2d').drawImage(im,0,0,cv.width,cv.height); }
  async function draw(){
    if(!im) return;
    const my=++token;
    const s=size(); cv.width=s.w; cv.height=s.h;
    inner.style.width=s.w+'px'; inner.style.height=s.h+'px';
    const ctx=cv.getContext('2d');
    try{ await cfg.render(ctx,s.w,s.h,im,get,true); }
    catch(e){ if(my===token) bar.querySelector('.live-dims').textContent='Preview error'; }
    if(my!==token)return;
    paintOriginal();
    bar.querySelector('.live-dims').textContent=s.w+' × '+s.h+(cfg.estimate?' · estimating…':'');
    if(cfg.afterDraw) cfg.afterDraw(cv,bar,get);
    syncButtons();
  }
  function refresh(){ if(raf)cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{raf=0;draw();}); }
  function scheduleHistory(){ clearTimeout(hTimer); hTimer=setTimeout(pushHistory,350); }
  const onCfg=e=>{
    if(e.target===panel||(e.target.closest&&e.target.closest('.options,.live-bar,.preset-row,.advanced'))){
      refresh(); if(e.type==='input') scheduleHistory(); else pushHistory();
    }
  };
  panel.addEventListener('input',onCfg); panel.addEventListener('change',onCfg);
  function setCompare(on){
    compare=on; box.classList.toggle('comparing',on);
    inner.style.setProperty('--split',split+'%');
    handle.style.left=split+'%';
  }
  handle.addEventListener('pointerdown',e=>{e.preventDefault();handle.setPointerCapture&&handle.setPointerCapture(e.pointerId);});
  inner.addEventListener('pointermove',e=>{ if(!compare||e.buttons===0)return; const b=inner.getBoundingClientRect(); split=Math.max(2,Math.min(98,Math.round(100*(e.clientX-b.left)/b.width))); setCompare(true); });
  bar.addEventListener('click',e=>{
    const b=e.target.closest('.live-tool'); if(!b)return;
    const a=b.dataset.act;
    if(a==='undo'){ if(hi>0){hi--;restore(hist[hi]);syncButtons();} }
    else if(a==='redo'){ if(hi<hist.length-1){hi++;restore(hist[hi]);syncButtons();} }
    else if(a==='reset'){
      if(defaults) restore(defaults);
      else controls().forEach(el=>{ if(el.dataset.def!==undefined){ if(el.type==='checkbox')el.checked=el.dataset.def==='true'; else el.value=el.dataset.def; } });
      pushHistory();
    }
    else if(a==='compare') setCompare(!compare);
    else if(a==='zoomin'||a==='zoomout'){
      zoom=Math.max(0.25,Math.min(4,a==='zoomin'?zoom+0.25:zoom-0.25));
      inner.style.transform='scale('+zoom+')'; inner.style.transformOrigin='top center';
      bar.querySelector('.zoom-label').textContent=Math.round(zoom*100)+'%';
    }
  });
  document.addEventListener('keydown',e=>{
    if(!(e.ctrlKey||e.metaKey))return;
    if(e.key.toLowerCase()==='z'&&!e.shiftKey){e.preventDefault();if(hi>0){hi--;restore(hist[hi]);}}
    if(e.key.toLowerCase()==='y'||(e.key.toLowerCase()==='z'&&e.shiftKey)){e.preventDefault();if(hi<hist.length-1){hi++;restore(hist[hi]);}}
  });
  controls().forEach(el=>{ el.dataset.def=el.type==='checkbox'?String(el.checked):el.value; });
  defaults=snapshot(); hist=[defaults]; hi=0; syncButtons();
  return {
    canvas:cv, original:orig, stage:inner, refresh, draw, setCompare,
    setSource:async file=>{ im=await decodeAny(await prepareImage(file)); await draw(); },
    getImage:()=>im, get:get, size:size,
    renderFull:async(ctx,w,h)=>{ if(!im) await setSource(cfg.firstFile()); return cfg.render(ctx,w,h,im,get,false); }
  };
}

/* --------------------------- tool framework --------------------------- */
function imageTool(panel,cfg){
  let files=[], live=null;
  const status=panel.querySelector('.status');
  createDropzone(panel,{accept:cfg.accept||IMG_ACCEPT,multiple:cfg.multiple!==false,core:false,onFiles:f=>{
    files=[...f]; renderList();
    if(cfg.render && live) live.setSource(files[0]);
    if(cfg.onFiles) cfg.onFiles(files,extra,get,live);
  }});
  const list=document.createElement('div'); list.className='file-list image-file-list';
  const optsEl=document.createElement('div'); optsEl.className='options image-options'; optsEl.innerHTML=cfg.options||'';
  const extra=document.createElement('div'); extra.className='image-extra';
  if(cfg.extra && !cfg.render) extra.innerHTML=cfg.extra;
  const actions=document.createElement('div'); actions.className='actions';
  actions.innerHTML='<button class="btn btn-primary" type="button"><i class="fa-solid fa-wand-magic-sparkles"></i> '+escapeHtml(cfg.button||'Process images')+'</button>';
  panel.insertBefore(list,status); panel.insertBefore(optsEl,status); panel.insertBefore(extra,status); panel.insertBefore(actions,status);
  if(cfg.render) live=makeLive(panel,extra,Object.assign({},cfg,{firstFile:()=>files[0]}));
  if(cfg.bind) cfg.bind(panel);
  function get(id){ const el=panel.querySelector('#'+id); return el?(el.type==='checkbox'?el.checked:el.value):''; }
  function renderList(){
    list.innerHTML=files.length?files.map(f=>'<div class="image-file"><i class="fa-solid fa-image"></i><span>'+escapeHtml(f.name)+'</span><small>'+fmtSize(f.size)+'</small></div>').join(''):'<div class="file-hint">No images selected yet.</div>';
  }
  renderList();
  if(cfg.autoFile && !files.length){
    (async()=>{
      try{
        const cv=canvas(16,16),ctx=cv.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,16,16);
        const b=await toBlob(cv,'image/png'); const f=new File([b],'canvas.png',{type:'image/png'});
        files=[f]; renderList(); if(cfg.render&&live) await live.setSource(f);
      }catch(e){}
    })();
  }
  actions.querySelector('button').addEventListener('click',async()=>{
    if(!files.length){ setStatus(panel,t('status_select'),'error'); return; }
    showProgress(panel,true); setProgress(panel,6);
    try{
      const items=await cfg.process(files,get,panel,extra,live);
      setProgress(panel,100);
      await deliverItems(panel,items,cfg.zipName||'images');
      setStatus(panel,'Done · '+items.length+' image(s) ready.','success');
    }catch(e){ setStatus(panel,'Something went wrong: '+(e&&e.message?e.message:e),'error'); }
    finally{ showProgress(panel,false); }
  });
  return {panel,extra:()=>extra,get,files:()=>files,live:()=>live};
}

async function processAll(files,get,cfg){
  const out=[];
  for(let i=0;i<files.length;i++){
    const im=await decodeAny(await prepareImage(files[i]));
    const size=cfg.fullSize?cfg.fullSize(im,get):{w:im.width,h:im.height};
    const c=canvas(size.w,size.h), ctx=c.getContext('2d');
    await cfg.render(ctx,size.w,size.h,im,get,false);
    out.push({blob:await toBlob(c,cfg.type(get),cfg.quality(get)),name:cfg.name(files[i],get,size)});
    setProgress(cfg.panel,10+Math.round(80*(i+1)/files.length));
  }
  return out;
}

/* ----------------------- interactive crop stage ----------------------- */
async function makeCropUI(extra,im,inp){
  const s=Math.min(1,640/im.width);
  const c=canvas(im.width*s,im.height*s); c.className='stage-canvas';
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  const wrap=document.createElement('div'); wrap.className='image-stage'; wrap.appendChild(c);
  const layer=document.createElement('div'); layer.className='crop-layer';
  const box=document.createElement('div'); box.className='crop-box';
  ['nw','ne','se','sw'].forEach(pos=>{ const h=document.createElement('div'); h.className='crop-handle crop-handle--'+pos; h.dataset.pos=pos; box.appendChild(h); });
  layer.appendChild(box); wrap.appendChild(layer); extra.innerHTML=''; extra.appendChild(wrap);
  const rect={x:0,y:0,w:im.width,h:im.height};
  function paint(){
    box.style.left=(100*rect.x/im.width)+'%'; box.style.top=(100*rect.y/im.height)+'%';
    box.style.width=(100*rect.w/im.width)+'%'; box.style.height=(100*rect.h/im.height)+'%';
  }
  function sync(write){
    if(write!==false){
      if(inp.x)inp.x.value=Math.round(rect.x); if(inp.y)inp.y.value=Math.round(rect.y);
      if(inp.w)inp.w.value=Math.round(rect.w); if(inp.h)inp.h.value=Math.round(rect.h);
    }
    paint();
  }
  function applyInputs(){
    rect.x=Math.max(0,Math.min(im.width-10,Number(inp.x&&inp.x.value)||0));
    rect.y=Math.max(0,Math.min(im.height-10,Number(inp.y&&inp.y.value)||0));
    rect.w=Math.max(10,Math.min(im.width-rect.x,Number(inp.w&&inp.w.value)||10));
    rect.h=Math.max(10,Math.min(im.height-rect.y,Number(inp.h&&inp.h.value)||10));
    paint();
  }
  [inp.x,inp.y,inp.w,inp.h].forEach(el=>{ if(el){el.addEventListener('input',applyInputs);el.addEventListener('change',applyInputs);} });
  sync();
  let drag=null; const sc=()=>im.width/(c.clientWidth||c.width);
  const start=(e,pos)=>{e.preventDefault();e.stopPropagation();drag={pos,sx:e.clientX,sy:e.clientY,r:{x:rect.x,y:rect.y,w:rect.w,h:rect.h}};try{box.setPointerCapture(e.pointerId);}catch(err){}};
  box.addEventListener('pointerdown',e=>start(e,'move'));
  box.querySelectorAll('.crop-handle').forEach(h=>h.addEventListener('pointerdown',e=>start(e,h.dataset.pos)));
  box.addEventListener('pointermove',e=>{
    if(!drag)return; const dx=(e.clientX-drag.sx)*sc(),dy=(e.clientY-drag.sy)*sc(); let {x,y,w,h}=drag.r;
    if(drag.pos==='move'){x=drag.r.x+dx;y=drag.r.y+dy;}
    else{
      if(drag.pos.indexOf('w')>=0){x=drag.r.x+dx;w=drag.r.w-dx;}
      if(drag.pos.indexOf('e')>=0){w=drag.r.w+dx;}
      if(drag.pos.indexOf('n')>=0){y=drag.r.y+dy;h=drag.r.h-dy;}
      if(drag.pos.indexOf('s')>=0){h=drag.r.h+dy;}
    }
    rect.x=Math.max(0,Math.min(im.width-10,x)); rect.y=Math.max(0,Math.min(im.height-10,y));
    rect.w=Math.max(10,Math.min(im.width-rect.x,w)); rect.h=Math.max(10,Math.min(im.height-rect.y,h)); sync();
  });
  box.addEventListener('pointerup',()=>drag=null); box.addEventListener('pointercancel',()=>drag=null);
  return {rect:()=>({x:Math.round(rect.x),y:Math.round(rect.y),w:Math.round(rect.w),h:Math.round(rect.h)}),sync:sync,applyInputs:applyInputs,canvas:c};
}

/* ------------------------- blur region stage ------------------------- */
async function makeBlurUI(extra,im){
  const s=Math.min(1,640/im.width);
  const c=canvas(im.width*s,im.height*s); c.className='stage-canvas';
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  const wrap=document.createElement('div'); wrap.className='image-stage'; wrap.appendChild(c);
  const layer=document.createElement('div'); layer.className='crop-layer blur-layer'; wrap.appendChild(layer);
  extra.innerHTML=''; extra.appendChild(wrap);
  const regions=[];
  function render(){ layer.innerHTML=''; regions.forEach(r=>{const d=document.createElement('div');d.className='blur-region';d.style.left=r.x+'px';d.style.top=r.y+'px';d.style.width=r.w+'px';d.style.height=r.h+'px';layer.appendChild(d);}); }
  let start=null,cur=null;
  layer.addEventListener('pointerdown',e=>{const b=layer.getBoundingClientRect();start={x:e.clientX-b.left,y:e.clientY-b.top};cur=document.createElement('div');cur.className='blur-region blur-region--live';layer.appendChild(cur);try{layer.setPointerCapture(e.pointerId);}catch(err){}});
  layer.addEventListener('pointermove',e=>{if(!start||!cur)return;const b=layer.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;cur.style.left=Math.min(start.x,x)+'px';cur.style.top=Math.min(start.y,y)+'px';cur.style.width=Math.abs(x-start.x)+'px';cur.style.height=Math.abs(y-start.y)+'px';});
  layer.addEventListener('pointerup',e=>{if(!start)return;const b=layer.getBoundingClientRect(),x=e.clientX-b.left,y=e.clientY-b.top;const r={x:Math.min(start.x,x),y:Math.min(start.y,y),w:Math.abs(x-start.x),h:Math.abs(y-start.y)};if(r.w>5&&r.h>5){regions.push(r);render();}else if(cur)cur.remove();start=null;cur=null;});
  render();
  return {regions:()=>regions,scale:()=>({x:im.width/c.width,y:im.height/c.height}),canvas:c,clear:()=>{regions.length=0;render();}};
}

/* ------------------------ background removal worker ------------------------ */
const BG_WORKER_SRC=[
'self.onmessage=function(e){',
'var d=e.data,data=new Uint8ClampedArray(d.buffer),w=d.width,h=d.height,tol=d.tol,feather=d.feather;',
'var cs=[[0,0],[w-1,0],[0,h-1],[w-1,h-1]].map(function(p){var i=(p[1]*w+p[0])*4;return [data[i],data[i+1],data[i+2]];});',
'var bg=[0,0,0];cs.forEach(function(c){bg[0]+=c[0]/4;bg[1]+=c[1]/4;bg[2]+=c[2]/4;});',
'var seen=new Uint8Array(w*h),stack=[];',
'for(var x=0;x<w;x++){stack.push(x,(h-1)*w+x);}',
'for(var y=0;y<h;y++){stack.push(y*w,y*w+w-1);}',
'while(stack.length){var idx=stack.pop();if(seen[idx])continue;seen[idx]=1;var p=idx*4;',
'if(Math.abs(data[p]-bg[0])+Math.abs(data[p+1]-bg[1])+Math.abs(data[p+2]-bg[2])>tol)continue;data[p+3]=0;',
'var xx=idx%w,yy=(idx/w)|0;if(xx>0)stack.push(idx-1);if(xx<w-1)stack.push(idx+1);if(yy>0)stack.push(idx-w);if(yy<h-1)stack.push(idx+w);}',
'if(feather>0){var a=new Uint8Array(w*h);for(var i=0;i<w*h;i++)a[i]=data[i*4+3];var out=a.slice();',
'for(var yy=1;yy<h-1;yy++)for(var xx=1;xx<w-1;xx++){var id=yy*w+xx;if(a[id]===0||a[id]===255)continue;var sum=0;',
'for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++)sum+=a[(yy+dy)*w+xx+dx];out[id]=Math.round(a[id]+(sum/9-a[id])*(feather/100));}',
'for(var i=0;i<w*h;i++)data[i*4+3]=out[i];}',
'self.postMessage({id:d.id,buffer:data.buffer,width:w,height:h},[data.buffer]);};'
].join('\n');
let bgWorker=null;
function getBgWorker(){
  if(bgWorker) return bgWorker;
  try{
    const u=URL.createObjectURL(new Blob([BG_WORKER_SRC],{type:'text/javascript'}));
    bgWorker=new Worker(u);
    URL.revokeObjectURL(u); // worker already holds the script
  }catch(e){ return null; }
  return bgWorker;
}
let bgSeq=0;
async function removeBg(im,w,h,tol,feather){
  const c=canvas(w,h),ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,w,h);
  const idata=ctx.getImageData(0,0,w,h),copy=new Uint8ClampedArray(idata.data);
  const worker=getBgWorker();
  if(!worker){ /* synchronous fallback */
    const data=copy;
    const cs=[[0,0],[w-1,0],[0,h-1],[w-1,h-1]].map(p=>{const i=(p[1]*w+p[0])*4;return [data[i],data[i+1],data[i+2]];});
    const bg=[0,0,0];cs.forEach(x=>{bg[0]+=x[0]/4;bg[1]+=x[1]/4;bg[2]+=x[2]/4;});
    const seen=new Uint8Array(w*h),stack=[];
    for(let x=0;x<w;x++)stack.push(x,(h-1)*w+x);
    for(let y=0;y<h;y++)stack.push(y*w,y*w+w-1);
    while(stack.length){const idx=stack.pop();if(seen[idx])continue;seen[idx]=1;const p=idx*4;if(Math.abs(data[p]-bg[0])+Math.abs(data[p+1]-bg[1])+Math.abs(data[p+2]-bg[2])>tol)continue;data[p+3]=0;const x=idx%w,y=(idx/w)|0;if(x>0)stack.push(idx-1);if(x<w-1)stack.push(idx+1);if(y>0)stack.push(idx-w);if(y<h-1)stack.push(idx+w);}
    idata.data.set(data);ctx.putImageData(idata,0,0);return c;
  }
  return await new Promise((res,rej)=>{
    const my=++bgSeq;
    const onMsg=e=>{
      if(e.data.id!==my)return;
      worker.removeEventListener('message',onMsg);
      const out=ctx.createImageData(w,h); out.data.set(new Uint8ClampedArray(e.data.buffer)); ctx.putImageData(out,0,0); res(c);
    };
    worker.addEventListener('message',onMsg);
    const timer=setTimeout(()=>{worker.removeEventListener('message',onMsg);rej(new Error('Background worker timed out'));},15000);
    worker.addEventListener('message',()=>clearTimeout(timer),{once:true});
    worker.postMessage({id:my,buffer:copy.buffer,width:w,height:h,tol:tol,feather:feather},[copy.buffer]);
  });
}

/* ============================== TOOLS ============================== */

/* 1 — Compress IMAGE */
INITERS['image-compress']=function(panel){
  const render=(ctx,w,h,im,get)=>{ ctx.clearRect(0,0,w,h); ctx.drawImage(im,0,0,w,h); };
  imageTool(panel,{button:'Compress images',zipName:'compressed_images',render,
    options:opts([
      presets([['80','Balanced'],['60','Smaller'],['92','Best quality']]),
      range('cmpQ','JPG / WebP quality',20,98,80),
      select('cmpF','Output format',[['keep','Keep original'],['jpeg','JPG'],['webp','WebP'],['png','PNG']]),
      advanced(field('Target size (KB, optional)','<input id="cmpTarget" type="number" min="10" placeholder="e.g. 300" />'))
    ]),
    afterDraw:async(cv,bar,get)=>{
      const target=Number(get('cmpTarget'))||0;
      const fmt=get('cmpF'), q=Number(get('cmpQ'))/100;
      const type=fmt==='jpeg'?'image/jpeg':fmt==='webp'?'image/webp':fmt==='png'?'image/png':'image/jpeg';
      const blob=await new Promise(r=>cv.toBlob(r,type,q));
      let extra=' · ~'+fmtSize(blob.size);
      if(target){
        let qq=q, out=blob;
        for(let i=0;i<7&&out.size>target*1024&&qq>0.25;i++){ qq-=0.08; out=await new Promise(r=>cv.toBlob(r,type,qq)); }
        extra+=' · target '+Math.round(qq*100)+'%';
      }
      bar.querySelector('.live-dims').textContent=cv.width+' × '+cv.height+extra;
    },
    fullSize:(im)=>({w:im.width,h:im.height}),
    type:get=>get('cmpF')==='png'?'image/png':get('cmpF')==='webp'?'image/webp':'image/jpeg',
    quality:get=>Number(get('cmpQ'))/100,
    name:(f,get)=>{
      const fmt=get('cmpF');
      const ext=fmt==='png'?'png':fmt==='webp'?'webp':(/\.(png|webp)$/i.test(f.name)?f.name.split('.').pop().toLowerCase():'jpg');
      return outName(f,'-compressed',ext);
    },
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:(im)=>({w:im.width,h:im.height}),render,type:get=>get('cmpF')==='png'?'image/png':get('cmpF')==='webp'?'image/webp':'image/jpeg',quality:get=>Number(get('cmpQ'))/100,name:(f)=>outName(f,'-compressed',get('cmpF')==='png'?'png':get('cmpF')==='webp'?'webp':'jpg')})
  });
  bindPresets(panel,p=>{const q={Balanced:80,Smaller:60,'Best quality':92}[p];if(q)panel.querySelector('#cmpQ').value=q;});
};

/* 2 — Resize IMAGE */
const RESIZE_PRESETS=[['custom','Custom'],['1080','Square 1080'],['1200','Wide 1200'],['800','Portrait 800'],['1920','Full HD 1920']];
function resizeDims(im,get){
  const mode=get('rsMode')||'pct';
  if(mode==='pct'){ const s=Math.max(0.01,Math.min(4,(Number(get('rsPct'))||50)/100)); return {w:Math.round(im.width*s),h:Math.round(im.height*s)}; }
  const W=Number(get('rsW')),H=Number(get('rsH'));
  const fit=get('rsFit')||'fit';
  if(W&&H){ if(fit==='fill') return {w:W,h:H}; const s=Math.min(W/im.width,H/im.height); return {w:Math.round(im.width*s),h:Math.round(im.height*s)}; }
  if(W) return {w:W,h:Math.round(im.height*W/im.width)};
  if(H) return {h:H,w:Math.round(im.width*H/im.height)};
  return {w:im.width,h:im.height};
}
INITERS['image-resize']=function(panel){
  const render=(ctx,w,h,im,get)=>{
    const d=resizeDims(im,get);
    ctx.clearRect(0,0,w,h);
    if(get('rsFit')==='fill'){ ctx.drawImage(im,0,0,d.w,d.h,0,0,w,h); }
    else {
      const s=Math.min(w/im.width,h/im.height),dw=im.width*s,dh=im.height*s;
      ctx.fillStyle=get('rsBg')||'#ffffff'; ctx.fillRect(0,0,w,h);
      ctx.drawImage(im,(w-dw)/2,(h-dh)/2,dw,dh);
    }
  };
  imageTool(panel,{button:'Resize images',zipName:'resized_images',render,
    previewSize:(im,get)=>{const d=resizeDims(im,get);const s=Math.min(1,MAX_PREVIEW/Math.max(d.w,d.h));return {w:Math.round(d.w*s),h:Math.round(d.h*s)};},
    options:opts([
      presets(RESIZE_PRESETS),
      select('rsMode','Mode',[['pct','Percent'],['px','Pixels']]),
      range('rsPct','Scale (%)',5,300,50),
      field('Width / Height (px)','<div class="dual"><input id="rsW" type="number" placeholder="width" /><input id="rsH" type="number" placeholder="height" /></div>'),
      select('rsFit','Fit mode',[['fit','Fit inside'],['fill','Crop to fill']]),
      color('rsBg','Canvas colour','#ffffff'),
      advanced(select('rsF','Format',[['keep','Keep original'],['jpeg','JPG'],['png','PNG'],['webp','WebP']]))
    ]),
    fullSize:(im,get)=>{const d=resizeDims(im,get);return {w:Math.max(1,Math.min(8000,d.w)),h:Math.max(1,Math.min(8000,d.h))};},
    type:get=>get('rsF')==='png'?'image/png':get('rsF')==='webp'?'image/webp':'image/jpeg',
    quality:()=>0.94,
    name:(f,g)=>outName(f,'-resized',g('rsF')==='png'?'png':g('rsF')==='webp'?'webp':'jpg'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:(im,g)=>{const d=resizeDims(im,g);return {w:Math.max(1,Math.min(8000,d.w)),h:Math.max(1,Math.min(8000,d.h))};},render,type:g=>g('rsF')==='png'?'image/png':g('rsF')==='webp'?'image/webp':'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-resized','jpg')})
  });
  bindPresets(panel,p=>{
    if(p==='custom')return;
    panel.querySelector('#rsMode').value='px';
    const n=Number(p);
    if(p==='1080'){panel.querySelector('#rsW').value=1080;panel.querySelector('#rsH').value=1080;}
    else if(p==='1200'){panel.querySelector('#rsW').value=1200;panel.querySelector('#rsH').value=630;}
    else if(p==='800'){panel.querySelector('#rsW').value=800;panel.querySelector('#rsH').value=1000;}
    else {panel.querySelector('#rsW').value=1920;panel.querySelector('#rsH').value=1080;}
  });
};

/* 3 — Crop IMAGE */
INITERS['image-crop']=function(panel){
  let ui=null, live=null;
  const render=(ctx,w,h,im,get)=>{
    const r={x:Number(get('cpX'))||0,y:Number(get('cpY'))||0,w:Number(get('cpW'))||100,h:Number(get('cpH'))||100};
    const x=Math.max(0,Math.min(r.x,im.width-1)),y=Math.max(0,Math.min(r.y,im.height-1));
    const sw=Math.max(1,Math.min(r.w,im.width-x)),sh=Math.max(1,Math.min(r.h,im.height-y));
    ctx.clearRect(0,0,w,h); ctx.drawImage(im,x,y,sw,sh,0,0,w,h);
  };
  const t0=imageTool(panel,{button:'Crop images',zipName:'cropped_images',render,
    options:opts([
      presets([['free','Free'],['1:1','1 : 1'],['4:3','4 : 3'],['16:9','16 : 9'],['9:16','9 : 16']]),
      field('Rectangle (px)','<div class="quad"><input id="cpX" type="number" placeholder="X" /><input id="cpY" type="number" placeholder="Y" /><input id="cpW" type="number" placeholder="W" /><input id="cpH" type="number" placeholder="H" /></div>'),
      select('cpF','Format',[['jpeg','JPG'],['png','PNG'],['webp','WebP']]),
      advanced(range('cpZoom','Preview zoom',40,100,100))
    ]),
    onFiles:async(files,extra,get,l)=>{
      const im=await decodeAny(await prepareImage(files[0]));
      ui=await makeCropUI(extra,im,{x:panel.querySelector('#cpX'),y:panel.querySelector('#cpY'),w:panel.querySelector('#cpW'),h:panel.querySelector('#cpH')});
      const result=document.createElement('canvas'); result.className='crop-result'; result.id='cropResult';
      const lab=document.createElement('div'); lab.className='file-hint'; lab.textContent='Output preview';
      extra.appendChild(lab); extra.appendChild(result);
      const upd=()=>{
        const d=ui.rect(), s=Math.min(1,520/Math.max(d.w,d.h));
        result.width=Math.max(1,Math.round(d.w*s)); result.height=Math.max(1,Math.round(d.h*s));
        render(result.getContext('2d'),result.width,result.height,im,get);
      };
      panel.addEventListener('input',upd); panel.addEventListener('change',upd);
      ui.canvas.addEventListener('pointerup',upd); ui.canvas.addEventListener('pointermove',()=>{ if(ui) upd(); });
      upd();
    },
    fullSize:(im)=>({w:im.width,h:im.height}),
    type:g=>g('cpF')==='png'?'image/png':g('cpF')==='webp'?'image/webp':'image/jpeg',
    quality:()=>0.94,
    name:(f)=>outName(f,'-cropped','jpg'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:im=>({w:im.width,h:im.height}),render,type:g=>g('cpF')==='png'?'image/png':g('cpF')==='webp'?'image/webp':'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-cropped','jpg')})
  });
  bindPresets(panel,p=>{
    if(!ui||p==='free')return;
    const r=ui.rect(), ratios={'1:1':1,'4:3':4/3,'16:9':16/9,'9:16':9/16};
    const ar=ratios[p]; let w=r.w,h=Math.round(w/ar);
    if(h>r.h){h=r.h;w=Math.round(h*ar);}
    panel.querySelector('#cpW').value=w; panel.querySelector('#cpH').value=h;
    if(ui)ui.applyInputs();
    panel.dispatchEvent(new Event('input',{bubbles:true}));
  });
  return t0;
};

/* 4 — Convert to JPG */
INITERS['image-to-jpg']=function(panel){
  const render=(ctx,w,h,im,get)=>{ctx.clearRect(0,0,w,h);ctx.fillStyle=get('ijBg')||'#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(im,0,0,w,h);};
  imageTool(panel,{button:'Convert to JPG',zipName:'converted_jpg',render,
    options:opts([range('ijQ','Quality',30,98,92),color('ijBg','Transparent background','#ffffff')]),
    fullSize:im=>({w:im.width,h:im.height}),type:()=> 'image/jpeg',quality:g=>Number(g('ijQ'))/100,name:f=>outName(f,'','jpg'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:im=>({w:im.width,h:im.height}),render,type:()=> 'image/jpeg',quality:g=>Number(g('ijQ'))/100,name:f=>outName(f,'','jpg')})
  });
};

/* 5 — Convert from JPG */
let gifencModule=null;
async function getGifenc(){ if(!gifencModule) gifencModule=await import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js'); return gifencModule; }
INITERS['jpg-to-image']=function(panel){
  const render=(ctx,w,h,im)=>{ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(im,0,0,w,h);};
  imageTool(panel,{button:'Convert images',zipName:'converted_images',render,
    options:opts([
      select('jiF','Output format',[['png','PNG'],['gif','Animated GIF']]),
      advanced(field('GIF delay (ms)','<input id="jiD" type="number" min="20" max="2000" value="120" />')+field('GIF width','<input id="jiW" type="number" min="64" max="1200" value="480" />'))
    ]),
    process:async(files,get,panel)=>{
      if(get('jiF')==='gif'){
        const g=await getGifenc(), enc=g.GIFEncoder();
        const W=Math.max(64,Math.min(1200,Number(get('jiW'))||480));
        const first=await decodeAny(await prepareImage(files[0]));
        const H=Math.max(1,Math.round(first.height*W/first.width));
        const delay=Math.max(20,Number(get('jiD'))||120);
        for(const f of files){
          const im=await decodeAny(await prepareImage(f));
          const c=canvas(W,H),ctx=c.getContext('2d',{willReadFrequently:true});
          ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.drawImage(im,0,0,W,H);
          const rgba=ctx.getImageData(0,0,W,H).data, pal=g.quantize(rgba,256,'rgb565');
          enc.writeFrame(g.applyPalette(rgba,pal),W,H,{palette:pal,delay:delay});
          setProgress(panel,10+Math.round(70*files.indexOf(f)/files.length));
        }
        enc.finish();
        return [{blob:new Blob([enc.bytes()],{type:'image/gif'}),name:'animated.gif'}];
      }
      return await processAll(files,get,{panel,fullSize:im=>({w:im.width,h:im.height}),render,type:()=> 'image/png',quality:()=>1,name:f=>outName(f,'','png')});
    }
  });
};

/* 6 — Photo editor */
const PHOTO_PRESETS=[['none','Original'],['film','Film'],['noir','Noir'],['vintage','Vintage'],['fresh','Fresh'],['warm','Warm'],['cool','Cool'],['drama','Drama']];
function num(get,id,d){ const v=Number(get(id)); return isFinite(v)?v:d; }
function applyFx(ctx,w,h,src,get){
  const fx=get('peFx')||'none', k=Math.max(0,Math.min(2,num(get,'peFxK',100)/100));
  if(fx==='none'||k<=0) return;
  if(fx==='pixelate'){
    const step=Math.max(2,Math.round(28*k)), c=canvas(Math.max(1,Math.round(w/step)),Math.max(1,Math.round(h/step)));
    c.getContext('2d').drawImage(src,0,0,c.width,c.height);
    ctx.clearRect(0,0,w,h); ctx.imageSmoothingEnabled=false; ctx.drawImage(c,0,0,w,h); ctx.imageSmoothingEnabled=true; return;
  }
  if(fx==='motion'){
    ctx.clearRect(0,0,w,h); ctx.globalAlpha=Math.min(0.5,0.18*k);
    for(let i=-4;i<=4;i++) ctx.drawImage(src,i*3*k,0,w,h);
    ctx.globalAlpha=1; return;
  }
  if(fx==='blur'||fx==='gaussian'){
    ctx.clearRect(0,0,w,h); ctx.filter='blur('+(5*k)+'px)'; ctx.drawImage(src,0,0,w,h); ctx.filter='none'; return;
  }
  if(fx==='duotone'||fx==='sketch'){
    const tmp=canvas(w,h),tc=tmp.getContext('2d',{willReadFrequently:true});tc.drawImage(src,0,0);
    const d=tc.getImageData(0,0,w,h),a=d.data;
    const c1=fx==='duotone'?[25,35,90]:[0,0,0], c2=fx==='duotone'?[255,120,80]:[255,255,255];
    for(let i=0;i<a.length;i+=4){
      const l=(a[i]*0.299+a[i+1]*0.587+a[i+2]*0.114)/255;
      const v=fx==='sketch'?Math.min(255,255-(1-l)*255*k):l;
      a[i]=c1[0]+(c2[0]-c1[0])*v; a[i+1]=c1[1]+(c2[1]-c1[1])*v; a[i+2]=c1[2]+(c2[2]-c1[2])*v;
    }
    tc.putImageData(d,0,0);ctx.clearRect(0,0,w,h);ctx.drawImage(tmp,0,0);return;
  }
}
function drawEdited(ctx,w,h,im,get){
  const br=num(get,'peB',100),ct=num(get,'peC',100),sat=num(get,'peS',100),exp=num(get,'peExp',100)/100;
  const blur=num(get,'peBlur',0),gr=num(get,'peG',0),sep=num(get,'peSep',0);
  const temp=num(get,'peTemp',0),tint=num(get,'peTint',0),hi=num(get,'peHi',0),sh=num(get,'peSh',0);
  const sharp=num(get,'peSharp',0),vig=num(get,'peVig',0),grain=num(get,'peGrain',0);
  const flip=get('peFlip')||'none',rot=num(get,'peRot',0),straight=num(get,'peStraight',0);
  ctx.clearRect(0,0,w,h);
  ctx.save(); ctx.translate(w/2,h/2); ctx.rotate((rot+straight)*Math.PI/180);
  if(flip==='h'||flip==='both')ctx.scale(-1,1);
  if(flip==='v'||flip==='both')ctx.scale(1,-1);
  const s=Math.max(Math.abs(w/im.width),Math.abs(h/im.height))*1.02;
  ctx.filter='brightness('+(br*exp)+'%) contrast('+ct+'%) saturate('+sat+'%) blur('+blur+'px) grayscale('+gr+'%) sepia('+sep+'%)';
  ctx.drawImage(im,-im.width*s/2,-im.height*s/2,im.width*s,im.height*s); ctx.filter='none'; ctx.restore();
  if(temp){ctx.globalCompositeOperation='overlay';ctx.fillStyle=temp>0?'rgba(255,170,80,'+Math.min(.5,temp/200)+')':'rgba(70,150,255,'+Math.min(.5,-temp/200)+')';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';}
  if(tint){ctx.globalCompositeOperation='soft-light';ctx.fillStyle=tint>0?'rgba(255,80,180,'+Math.min(.5,tint/200)+')':'rgba(80,255,140,'+Math.min(.5,-tint/200)+')';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';}
  if(hi){ctx.globalCompositeOperation='screen';const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(255,255,255,'+Math.min(.35,Math.abs(hi)/250)+')');g.addColorStop(.5,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=hi>0?g:'rgba(0,0,0,0)';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';}
  if(sh){ctx.globalCompositeOperation='multiply';const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+Math.min(.4,Math.abs(sh)/250)+')');ctx.fillStyle=sh<0?g:'rgba(255,255,255,0)';ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over';}
  if(sharp>0){
    const tmp=canvas(w,h),tc=tmp.getContext('2d',{willReadFrequently:true});tc.drawImage(ctx.canvas,0,0);
    const d=tc.getImageData(0,0,w,h),a=d.data,out=new Uint8ClampedArray(a);
    for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
      const i=(y*w+x)*4;
      for(let c=0;c<3;c++){const v=a[i+c]*2-(a[i-4+c]+a[i+4+c]+a[i-w*4+c]+a[i+w*4+c])/4;out[i+c]=Math.max(0,Math.min(255,a[i+c]+(v-a[i+c])*sharp/250));}
    }
    d.data.set(out);tc.putImageData(d,0,0);ctx.clearRect(0,0,w,h);ctx.drawImage(tmp,0,0);
  }
  const fxSrc=canvas(w,h);fxSrc.getContext('2d').drawImage(ctx.canvas,0,0);
  applyFx(ctx,w,h,fxSrc,get);
  if(vig>0){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*0.25,w/2,h/2,Math.max(w,h)*0.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,'+(vig/200)+')');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
  if(grain>0){const tile=canvas(64,64),tc=tile.getContext('2d'),d=tc.createImageData(64,64);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=Math.round(grain*1.5);}tc.putImageData(d,0,0);ctx.globalAlpha=Math.min(0.4,grain/200);ctx.fillStyle=ctx.createPattern(tile,'repeat');ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;}
  const fw=num(get,'peFW',0);
  if(fw>0){const k=fw*w/900;ctx.strokeStyle=get('peFrame')||'#e5322d';ctx.lineWidth=Math.max(1,k*2);ctx.strokeRect(k,k,w-k*2,h-k*2);}
  const text=(get('peText')||'').trim();
  if(text){const fs=Math.max(10,Math.min(num(get,'peSize',36),w/10));ctx.font='800 '+fs+'px Inter,Arial,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';ctx.lineWidth=Math.max(2,fs/9);ctx.strokeStyle='#000';ctx.strokeText(text,w*0.05,h*0.82);ctx.fillStyle=get('peColor')||'#fff';ctx.fillText(text,w*0.05,h*0.82);}
  const sticker=get('peSticker');
  if(sticker){ctx.font=Math.round(w/7)+'px sans-serif';ctx.textAlign='right';ctx.textBaseline='top';ctx.fillText(sticker,w*0.94,w*0.03);}
}
INITERS['photo-editor']=function(panel){
  imageTool(panel,{button:'Apply edits',zipName:'edited_photos',multiple:false,
    render:(ctx,w,h,im,get)=>drawEdited(ctx,w,h,im,get),
    options:opts([
      presets(PHOTO_PRESETS),
      range('peExp','Exposure',50,180,100),range('peB','Brightness',50,160,100),range('peC','Contrast',50,180,100),range('peS','Saturation',0,220,100),
      range('peTemp','Temperature',-100,100,0),range('peTint','Tint',-100,100,0),range('peHi','Highlights',-100,100,0),range('peSh','Shadows',-100,100,0),
      range('peSharp','Sharpness',0,100,0),range('peBlur','Blur',0,12,0),range('peG','Grayscale',0,100,0),range('peSep','Sepia',0,100,0),range('peVig','Vignette',0,100,0),range('peGrain','Film grain',0,80,0),
      select('peFx','Effect',[['none','None'],['duotone','Duotone'],['sketch','Sketch'],['pixelate','Pixelate'],['motion','Motion blur'],['blur','Gaussian blur']]),range('peFxK','Effect intensity',0,200,100),
      select('peFlip','Flip',[['none','None'],['h','Horizontal'],['v','Vertical'],['both','Both']]),select('peRot','Rotate',[['0','0°'],['90','90°'],['180','180°'],['270','270°']]),range('peStraight','Straighten',-15,15,0),
      advanced([text('peText','Caption','','Your caption'),number('peSize','Caption size',36,10,160),color('peColor','Caption colour','#ffffff'),color('peFrame','Frame colour','#e5322d'),range('peFW','Frame width',0,40,0),select('peSticker','Sticker',[['','None'],['⭐','Star'],['❤️','Heart'],['😀','Smile'],['🔥','Fire'],['✨','Sparkle']])].join(''))
    ]),
    fullSize:im=>({w:im.width,h:im.height}),type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-edited','jpg'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:im=>({w:im.width,h:im.height}),render:(ctx,w,h,im,g)=>drawEdited(ctx,w,h,im,g),type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-edited','jpg')})
  });
  bindPresets(panel,p=>{
    const map={film:[105,110,110,85,8,0,0,0,12,0,0,22,20,12],noir:[105,135,0,0,0,0,0,0,18,0,100,0,35,0],vintage:[105,95,78,0,18,0,0,0,8,0,10,45,30,16],fresh:[108,112,122,0,-8,0,0,0,14,0,0,0,8,0],warm:[110,108,115,0,30,0,0,0,10,0,0,18,14,0],cool:[105,108,110,0,-30,0,0,0,10,0,0,0,10,0],drama:[105,145,105,0,0,0,0,0,25,0,0,0,45,8]};
    const v=map[p]; if(!v)return;
    const ids=['peExp','peB','peC','peS','peTemp','peTint','peHi','peSh','peSharp','peBlur','peG','peSep','peVig','peGrain'];
    ids.forEach((id,i)=>{const el=panel.querySelector('#'+id);if(el)el.value=v[i];});
    const fx=panel.querySelector('#peFx');if(fx)fx.value='none';
  });
};

/* 7 — Upscale Image */
INITERS['image-upscale']=function(panel){
  const render=(ctx,w,h,im,get)=>{
    const q=get('upQ')||'quality';
    ctx.clearRect(0,0,w,h); ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
    if(q==='fast'){ ctx.drawImage(im,0,0,w,h); return; }
    const half=canvas(Math.max(1,Math.round(w/2)),Math.max(1,Math.round(h/2)));
    const hc=half.getContext('2d');hc.imageSmoothingEnabled=true;hc.imageSmoothingQuality='high';hc.drawImage(im,0,0,half.width,half.height);
    ctx.drawImage(half,0,0,w,h);
    if(q==='detail'){
      const d=ctx.getImageData(0,0,w,h),a=d.data,out=new Uint8ClampedArray(a),W=w,H=h;
      for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
        const i=(y*W+x)*4;
        for(let k=0;k<3;k++){ const v=a[i+k]*2-(a[i-4+k]+a[i+4+k]+a[i-W*4+k]+a[i+W*4+k])/4; out[i+k]=Math.max(0,Math.min(255,a[i+k]+(v-a[i+k])*0.22)); }
      }
      d.data.set(out);ctx.putImageData(d,0,0);
    }
  };
  imageTool(panel,{button:'Upscale images',zipName:'upscaled_images',render,
    previewSize:(im,get)=>{const f=Number(get('upF'))||2;const w=Math.min(MAX_PREVIEW,im.width*f);return {w:w,h:Math.round(im.height*f*w/(im.width*f))};},
    options:opts([presets([['2','2×'],['3','3×'],['4','4×']]),select('upF','Scale factor',[['2','2×'],['3','3×'],['4','4×']]),select('upQ','Quality mode',[['quality','Balanced'],['detail','Sharpen detail'],['fast','Fast']]),select('upO','Format',[['png','PNG'],['jpeg','JPG'],['webp','WebP']])]),
    fullSize:(im,get)=>{const f=Number(get('upF'))||2;return {w:Math.min(8000,Math.round(im.width*f)),h:Math.min(8000,Math.round(im.height*f))};},
    type:g=>g('upO')==='png'?'image/png':g('upO')==='webp'?'image/webp':'image/jpeg',quality:()=>0.95,
    name:(f,g)=>outName(f,'-upscaled',g('upO')==='png'?'png':g('upO')==='webp'?'webp':'jpg'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:(im,g)=>{const f=Number(g('upF'))||2;return {w:Math.min(8000,Math.round(im.width*f)),h:Math.min(8000,Math.round(im.height*f))};},render,type:g=>g('upO')==='png'?'image/png':g('upO')==='webp'?'image/webp':'image/jpeg',quality:()=>0.95,name:f=>outName(f,'-upscaled','png')})
  });
  bindPresets(panel,p=>{const el=panel.querySelector('#upF');if(el)el.value=p;});
};

/* 8 — Remove background */
INITERS['remove-bg']=function(panel){
  const render=async(ctx,w,h,im,get)=>{
    const tol=Number(get('bgTol'))||45, feather=Number(get('bgFeather'))||0;
    const c=await removeBg(im,w,h,tol,feather);
    ctx.clearRect(0,0,w,h);ctx.drawImage(c,0,0);
    const bg=get('bgColor');
    if(bg&&bg!=='transparent'){ ctx.globalCompositeOperation='destination-over';ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);ctx.globalCompositeOperation='source-over'; }
  };
  imageTool(panel,{button:'Remove background',zipName:'no_background',render,
    options:opts([
      presets([['45','Auto remove'],['20','Fine edges'],['80','Aggressive']]),
      range('bgTol','Tolerance',10,120,45),range('bgFeather','Edge smoothing',0,100,25),
      select('bgColor','Replace with',[['transparent','Transparent'],['#ffffff','White'],['#e5322d','Brand red'],['#1f2328','Dark']])
    ]),
    fullSize:im=>{const s=Math.min(1,2000/Math.max(im.width,im.height));return {w:Math.round(im.width*s),h:Math.round(im.height*s)};},
    type:()=> 'image/png',quality:()=>1,name:f=>outName(f,'-nobg','png'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:im=>{const s=Math.min(1,2000/Math.max(im.width,im.height));return {w:Math.round(im.width*s),h:Math.round(im.height*s)};},render,type:()=> 'image/png',quality:()=>1,name:f=>outName(f,'-nobg','png')})
  });
  bindPresets(panel,p=>{const v={'Auto remove':45,'Fine edges':20,'Aggressive':80}[p];if(v)panel.querySelector('#bgTol').value=v;});
};

/* 9 — Watermark IMAGE */
INITERS['image-watermark']=function(panel){
  const custom={x:0.7,y:0.85};
  const render=async(ctx,w,h,im,get)=>{
    ctx.clearRect(0,0,w,h);ctx.drawImage(im,0,0,w,h);
    const text=(get('wmText')||'').trim(),pos=get('wmPos'),op=(Number(get('wmO'))||45)/100;
    ctx.globalAlpha=op;
    const markFile=(panel.querySelector('#wmImage')||{}).files&&panel.querySelector('#wmImage').files[0];
    if(markFile){
      const mk=await decodeAny(markFile);
      const mw=w*(Number(get('wmScale'))||20)/100;
      const mh=Math.max(1,Math.round(mk.height*mw/mk.width));
      const pts=pos==='tile'?[]:[pos];
      if(pos==='tile')for(let y=0;y<h;y+=mh*2)for(let x=0;x<w;x+=mw*2)pts.push([x,y]);
      else pts.push(({tl:[w*0.03,w*0.03],tr:[w-w*0.03-mw,w*0.03],bl:[w*0.03,h-w*0.03-mh],br:[w-w*0.03-mw,h-w*0.03-mh],c:[(w-mw)/2,(h-mh)/2],custom:[custom.x*w,custom.y*h]})[pos]||[w-w*0.03-mw,h-w*0.03-mh]);
      pts.forEach(p=>ctx.drawImage(mk,p[0],p[1],mw,mh));
    } else if(text){
      const fs=Math.max(9,Math.min(Number(get('wmSize'))||36,w/8));
      ctx.font='800 '+fs+'px Inter,Arial,sans-serif';ctx.fillStyle=get('wmColor')||'#fff';ctx.textBaseline='top';ctx.textAlign='left';
      const tw=ctx.measureText(text).width;
      if(pos==='tile'){for(let y=0;y<h;y+=fs*3)for(let x=0;x<w;x+=tw+fs*2){ctx.save();ctx.translate(x,y);ctx.rotate(-Math.PI/6);ctx.fillText(text,0,0);ctx.restore();}}
      else{
        const x=pos==='custom'?custom.x*w:(pos.indexOf('l')>=0?w*0.03:(pos==='c'?(w-tw)/2:w-tw-w*0.03));
        const y=pos==='custom'?custom.y*h:(pos.indexOf('t')>=0?w*0.03:(pos==='c'?(h-fs)/2:h-fs-w*0.03));
        ctx.fillText(text,x,y);
      }
    }
    ctx.globalAlpha=1;
  };
  imageTool(panel,{button:'Add watermark',zipName:'watermarked_images',render,
    options:opts([
      presets([['br','Bottom right'],['c','Center'],['tl','Top left'],['tile','Tile']]),
      text('wmText','Watermark text','© Your brand',''),
      field('Or image','<input id="wmImage" type="file" accept="image/png,image/jpeg" />'),
      range('wmO','Opacity',5,100,45),
      select('wmPos','Position',[['br','Bottom right'],['bl','Bottom left'],['tr','Top right'],['tl','Top left'],['c','Center'],['tile','Tile'],['custom','Drag on preview']]),
      number('wmSize','Font size',36,10,200),color('wmColor','Colour','#ffffff'),
      advanced(range('wmScale','Image size (%)',5,60,20))
    ]),
    onFiles:(files,extra,get,live)=>{
      const cv=live.canvas;
      const move=e=>{if(get('wmPos')!=='custom')return;const b=cv.getBoundingClientRect();custom.x=(e.clientX-b.left)/b.width;custom.y=(e.clientY-b.top)/b.height;live.refresh();};
      cv.style.cursor='move';cv.addEventListener('pointermove',move);
    },
    fullSize:im=>({w:im.width,h:im.height}),type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-watermarked','jpg'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:im=>({w:im.width,h:im.height}),render,type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-watermarked','jpg')})
  });
  bindPresets(panel,p=>{const el=panel.querySelector('#wmPos');if(el)el.value=p;});
};

/* 10 — Meme generator */
function wrapText(ctx,text,x,y,maxW,lh,top){
  const words=text.toUpperCase().split(/\s+/),lines=[];let line='';
  words.forEach(w=>{const test=line?line+' '+w:w;if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=w;}else line=test;});
  if(line)lines.push(line);
  lines.forEach((l,i)=>{const yy=top?y+i*lh:y-i*lh;ctx.strokeText(l,x,yy);ctx.fillText(l,x,yy);});
}
INITERS['meme-generator']=function(panel){
  const render=(ctx,w,h,im,get)=>{
    ctx.clearRect(0,0,w,h);ctx.drawImage(im,0,0,w,h);
    const size=Math.max(10,Math.min(Number(get('mmSize'))||56,w/6));
    const font=get('mmFont')||'Impact';
    ctx.font='900 '+size+'px '+(font==='Impact'?'Impact,Arial Black,sans-serif':'Inter,Arial,sans-serif');
    ctx.textAlign='center';ctx.textBaseline='top';ctx.lineWidth=Math.max(2,size*(Number(get('mmOutline'))||12)/100);
    ctx.strokeStyle='#000';ctx.fillStyle=get('mmColor')||'#fff';
    const top=(get('mmTop')||'').trim(),bottom=(get('mmBottom')||'').trim();
    if(top)wrapText(ctx,top,w/2,size*0.5,w-16,size*1.1,true);
    if(bottom)wrapText(ctx,bottom,w/2,h-size*0.5-size*1.1*(bottom.split(' ').length>4?2:1),w-16,size*1.1,false);
  };
  imageTool(panel,{button:'Create meme',zipName:'memes',multiple:false,render,
    options:opts([
      text('mmTop','Top text','','TOP TEXT'),text('mmBottom','Bottom text','','BOTTOM TEXT'),
      number('mmSize','Font size',56,16,160),color('mmColor','Colour','#ffffff'),
      select('mmFont','Font',[['Impact','Impact'],['Arial','Arial']]),range('mmOutline','Outline',2,25,12)
    ]),
    fullSize:im=>({w:im.width,h:im.height}),type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-meme','jpg'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:im=>({w:im.width,h:im.height}),render,type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-meme','jpg')})
  });
};

/* 11 — Rotate IMAGE */
INITERS['image-rotate']=function(panel){
  const render=(ctx,w,h,im,get)=>{
    const deg=Number(get('irotA'))||90, swap=deg===90||deg===270;
    const ow=swap?im.height:im.width, oh=swap?im.width:im.height;
    const s=Math.min(w/ow,h/oh);
    ctx.clearRect(0,0,w,h);
    ctx.save(); ctx.translate(w/2,h/2); ctx.rotate(deg*Math.PI/180); ctx.scale(s,s);
    ctx.drawImage(im,-im.width/2,-im.height/2); ctx.restore();
  };
  imageTool(panel,{button:'Rotate images',zipName:'rotated_images',render,
    previewSize:(im,get)=>{const deg=Number(get('irotA'))||90;const swap=deg===90||deg===270;const w=Math.min(MAX_PREVIEW,swap?im.height:im.width);return {w:w,h:Math.round((swap?im.width:im.height)*w/(swap?im.height:im.width))};},
    options:opts([presets([['90','90° ↻'],['180','180°'],['270','90° ↺']]),select('irotA','Rotation',[['90','90° clockwise'],['180','180°'],['270','90° counter-clockwise']])]),
    fullSize:(im,get)=>{const deg=Number(get('irotA'))||90;const swap=deg===90||deg===270;return {w:swap?im.height:im.width,h:swap?im.width:im.height};},
    type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-rotated','jpg'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:(im,g)=>{const deg=Number(g('irotA'))||90;const swap=deg===90||deg===270;return {w:swap?im.height:im.width,h:swap?im.width:im.height};},render,type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-rotated','jpg')})
  });
  bindPresets(panel,p=>{const el=panel.querySelector('#irotA');if(el)el.value=p;});
};

/* 12 — HTML to IMAGE */
let htmlToken=0;
INITERS['html-to-image']=function(panel){
  const render=async(ctx,w,h,im,get)=>{
    const W=w,H=h,html=get('hiHtml')||'';
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:'+W+'px;height:'+H+'px;overflow:hidden;background:#fff;font-family:Arial,sans-serif;padding:12px">'+html+'</div></foreignObject></svg>';
    const my=++htmlToken;
    const img=new Image(); const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
    await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url;});
    if(my!==htmlToken)return;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
  };
  imageTool(panel,{button:'Render to image',zipName:'html_image',multiple:false,autoFile:true,render,
    previewSize:(im,get)=>{const W=Math.max(100,Math.min(3000,Number(get('hiW'))||800)),H=Math.max(100,Math.min(3000,Number(get('hiH'))||600));const s=Math.min(1,MAX_PREVIEW/Math.max(W,H));return {w:Math.round(W*s),h:Math.round(H*s)};},
    options:opts([
      field('HTML','<textarea id="hiHtml" rows="5">&lt;h1 style="color:#E5322D"&gt;Hello!&lt;/h1&gt;&lt;p&gt;Live HTML preview.&lt;/p&gt;</textarea>'),
      field('Canvas','<div class="dual"><input id="hiW" type="number" value="800" /><input id="hiH" type="number" value="600" /></div>'),
      select('hiF','Format',[['jpeg','JPG'],['png','PNG'],['svg','SVG']])
    ]),
    fullSize:(im,get)=>{const W=Math.max(100,Math.min(3000,Number(get('hiW'))||800)),H=Math.max(100,Math.min(3000,Number(get('hiH'))||600));return {w:W,h:H};},
    type:g=>g('hiF')==='png'?'image/png':'image/jpeg',quality:()=>0.94,name:(f,g)=>g('hiF')==='svg'?'page.svg':'page.'+(g('hiF')==='png'?'png':'jpg'),
    process:async(files,get,panel)=>{
      const W=Math.max(100,Math.min(3000,Number(get('hiW'))||800)),H=Math.max(100,Math.min(3000,Number(get('hiH'))||600));
      const html=get('hiHtml')||'';
      const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:'+W+'px;height:'+H+'px;overflow:hidden;background:#fff;font-family:Arial,sans-serif;padding:12px">'+html+'</div></foreignObject></svg>';
      if(get('hiF')==='svg')return [{blob:new Blob([svg],{type:'image/svg+xml'}),name:'page.svg'}];
      const c=canvas(W,H),ctx=c.getContext('2d');await render(ctx,W,H,null,get);
      return [{blob:await toBlob(c,get('hiF')==='png'?'image/png':'image/jpeg',0.94),name:'page.'+(get('hiF')==='png'?'png':'jpg')}];
    }
  });
};

/* 13 — Blur face / regions */
INITERS['blur-face']=function(panel){
  let ui=null;
  const render=(ctx,w,h,im,get)=>{
    ctx.clearRect(0,0,w,h);ctx.drawImage(im,0,0,w,h);
    const regions=ui?ui.regions():[],sc=ui?ui.scale():{x:1,y:1};
    if(!regions.length)return;
    const blur=Number(get('bfBlur'))||12;
    ctx.save();ctx.filter='blur('+blur+'px)';
    regions.forEach(r=>{ctx.save();ctx.beginPath();ctx.rect(r.x*sc.x,r.y*sc.y,r.w*sc.x,r.h*sc.y);ctx.clip();ctx.drawImage(im,0,0,w,h);ctx.restore();});
    ctx.restore();
  };
  imageTool(panel,{button:'Blur regions',zipName:'blurred_images',render,
    options:opts([range('bfBlur','Blur strength',2,40,14),select('bfF','Output',[['jpeg','JPG'],['png','PNG']])]),
    onFiles:async(files,extra,get,live)=>{
      const im=await decodeAny(await prepareImage(files[0])); ui=await makeBlurUI(extra,im);
      const lab=document.createElement('div'); lab.className='file-hint'; lab.textContent='Output preview';
      const result=document.createElement('canvas'); result.className='crop-result';
      extra.appendChild(lab); extra.appendChild(result);
      const upd=()=>{
        const s=Math.min(1,520/Math.max(im.width,im.height));
        result.width=Math.max(1,Math.round(im.width*s)); result.height=Math.max(1,Math.round(im.height*s));
        render(result.getContext('2d'),result.width,result.height,im,get);
      };
      panel.addEventListener('input',upd); panel.addEventListener('change',upd);
      ui.canvas.addEventListener('pointerup',()=>upd());
      upd();
    },
    fullSize:im=>({w:im.width,h:im.height}),type:g=>g('bfF')==='png'?'image/png':'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-blurred','jpg'),
    process:(files,get,panel)=>processAll(files,get,{panel,fullSize:im=>({w:im.width,h:im.height}),render,type:g=>g('bfF')==='png'?'image/png':'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-blurred','jpg')})
  });
};
window.OCIMG={decodeAny:decodeAny,prepareImage:prepareImage,toBlob:toBlob,canvas:canvas,deliverItems:deliverItems,outName:outName,makeLive:makeLive,imageTool:imageTool,processAll:processAll};
})();
