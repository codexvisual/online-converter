/* Online Converter — client-side image tools (no uploads) */
(function(){
'use strict';
const IMG_ACCEPT='image/jpeg,image/png,image/gif,image/webp,image/bmp,image/svg+xml,image/tiff,image/heic,.psd,.tif,.tiff,.heic,.heif,.raw,.cr2,.nef,.arw,.dng';

function fmtSize(n){ return n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB'; }
function baseName(f){ return (f.name||'image').replace(/\.[^.]+$/,''); }
function outName(f,suffix,ext){ return baseName(f)+suffix+'.'+ext; }
function canvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
function toBlob(c,type,q){ return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Could not encode image')),type,q)); }

async function decodeAny(file){
  if(/\.svg$/i.test(file.name)||file.type==='image/svg+xml'){
    const txt=(await file.text()).replace(/<\?xml[^>]*\?>/,'').trim();
    const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(txt);
    const im=new Image();
    await new Promise((res,rej)=>{im.onload=res;im.onerror=()=>rej(new Error('Invalid SVG image'));im.src=url;});
    return {__img:im,width:im.naturalWidth||800,height:im.naturalHeight||600,close(){}};
  }
  if(window.createImageBitmap){ try{ return await createImageBitmap(file); }catch(e){} }
  const url=URL.createObjectURL(file);
  const im=new Image();
  await new Promise((res,rej)=>{im.onload=res;im.onerror=()=>rej(new Error('Cannot read '+file.name));im.src=url;});
  return {__img:im,width:im.naturalWidth,height:im.naturalHeight,close(){URL.revokeObjectURL(url);}};
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
    const c=canvas(ifds[0].width,ifds[0].height); const ctx=c.getContext('2d');
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

function imageTool(panel,cfg){
  let files=[];
  const status=panel.querySelector('.status');
  createDropzone(panel,{accept:cfg.accept||IMG_ACCEPT,multiple:cfg.multiple!==false,core:false,onFiles:f=>{
    files=[...f]; renderList(); if(cfg.onFiles) cfg.onFiles(files,extra,get);
  }});
  const list=document.createElement('div'); list.className='file-list image-file-list';
  const opts=document.createElement('div'); opts.className='options image-options'; opts.innerHTML=cfg.options||'';
  const extra=document.createElement('div'); extra.className='image-extra'; if(cfg.extra) extra.innerHTML=cfg.extra;
  const actions=document.createElement('div'); actions.className='actions';
  actions.innerHTML='<button class="btn btn-primary" type="button"><i class="fa-solid fa-wand-magic-sparkles"></i> '+escapeHtml(cfg.button||'Process images')+'</button>';
  panel.insertBefore(list,status); panel.insertBefore(opts,status); panel.insertBefore(extra,status); panel.insertBefore(actions,status);
  function get(id){ const el=panel.querySelector('#'+id); return el?(el.type==='checkbox'?el.checked:el.value):''; }
  function renderList(){
    list.innerHTML=files.length?files.map(f=>'<div class="image-file"><i class="fa-solid fa-image"></i><span>'+escapeHtml(f.name)+'</span><small>'+fmtSize(f.size)+'</small></div>').join(''):'<div class="file-hint">No images selected yet.</div>';
  }
  renderList();
  actions.querySelector('button').addEventListener('click',async()=>{
    if(!files.length){ setStatus(panel,t('status_select'),'error'); return; }
    showProgress(panel,true); setProgress(panel,8);
    try{
      const items=await cfg.process(files,get,panel,extra);
      setProgress(panel,100);
      await deliverItems(panel,items,cfg.zipName||'images');
      setStatus(panel,'Done · '+items.length+' image(s) ready.','success');
    }catch(e){ setStatus(panel,'Something went wrong: '+(e&&e.message?e.message:e),'error'); }
    finally{ showProgress(panel,false); }
  });
  return {extra:()=>extra,get:get,files:()=>files};
}

async function imageStage(extra,file,maxW){
  const im=await decodeAny(file);
  let url;
  if(/\.svg$/i.test(file.name)||file.type==='image/svg+xml') url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(await file.text());
  else url=URL.createObjectURL(file);
  const img=document.createElement('img'); img.alt='Preview';
  img.style.cssText='max-width:100%;max-height:360px;display:block;border-radius:8px';
  img.src=url;
  await new Promise((res,rej)=>{ if(img.complete&&img.naturalWidth) return res(); img.onload=res; img.onerror=()=>rej(new Error('Preview failed')); });
  const wrap=document.createElement('div'); wrap.className='image-stage'; wrap.appendChild(img);
  extra.innerHTML=''; extra.appendChild(wrap);
  return {im,img,wrap,natural:{w:im.width,h:im.height}};
}

/* ---------- Compress IMAGE ---------- */
INITERS['image-compress']=function(panel){
  imageTool(panel,{button:'Compress images',zipName:'compressed_images',
    options:'<div class="field"><label>Quality</label><input id="cmpQ" type="range" min="20" max="95" value="80" /></div>'+
      '<div class="field"><label>Output format</label><select id="cmpF"><option value="keep">Keep original</option><option value="jpeg">JPG</option><option value="webp">WebP</option><option value="png">PNG</option></select></div>',
    process:async(files,get)=>{
      const q=Number(get('cmpQ'))/100, fmt=get('cmpF'), out=[];
      for(const f of files){
        if(/\.svg$/i.test(f.name)){
          const txt=(await f.text()).replace(/<!--[\s\S]*?-->/g,'').replace(/>\s+</g,'><').replace(/\s{2,}/g,' ').trim();
          out.push({blob:new Blob([txt],{type:'image/svg+xml'}),name:outName(f,'-min','svg')}); continue;
        }
        const p=await prepareImage(f), im=await decodeAny(p);
        const c=canvas(im.width,im.height); c.getContext('2d').drawImage(im,0,0);
        let type='image/jpeg', ext='jpg';
        if(fmt==='keep'){
          type=(f.type&&f.type.indexOf('image/')===0)?f.type:'image/jpeg';
          ext=/\.(png|webp|gif|bmp)$/i.test(f.name)?f.name.split('.').pop().toLowerCase():'jpg';
          if(type==='image/gif'||type==='image/bmp'){ type='image/png'; ext='png'; }
        }else if(fmt==='png'){ type='image/png'; ext='png'; }
        else if(fmt==='webp'){ type='image/webp'; ext='webp'; }
        out.push({blob:await toBlob(c,type,q),name:outName(f,'-compressed',ext)});
        if(im.close) im.close();
      }
      return out;
    }});
};

/* ---------- Resize IMAGE ---------- */
INITERS['image-resize']=function(panel){
  imageTool(panel,{button:'Resize images',zipName:'resized_images',
    options:'<div class="field"><label>Mode</label><select id="rsMode"><option value="pct">Percent</option><option value="px">Pixels</option></select></div>'+
      '<div class="field"><label>Size (%)</label><input id="rsPct" type="number" min="1" max="400" value="50" /></div>'+
      '<div class="field"><label>Width (px)</label><input id="rsW" type="number" min="1" placeholder="e.g. 800" /></div>'+
      '<div class="field"><label>Height (px, optional)</label><input id="rsH" type="number" min="1" placeholder="auto" /></div>'+
      '<div class="field"><label>Format</label><select id="rsF"><option value="keep">Keep original</option><option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option></select></div>',
    process:async(files,get)=>{
      const mode=get('rsMode'), fmt=get('rsF'), out=[];
      for(const f of files){
        const p=await prepareImage(f), im=await decodeAny(p);
        let w,h;
        if(mode==='pct'){ const s=Math.max(0.01,Math.min(4,(Number(get('rsPct'))||50)/100)); w=Math.round(im.width*s); h=Math.round(im.height*s); }
        else { const W=Number(get('rsW')), H=Number(get('rsH')); if(W&&H){w=W;h=H;} else if(W){w=W;h=Math.round(im.height*W/im.width);} else if(H){h=H;w=Math.round(im.width*H/im.height);} else {w=im.width;h=im.height;} }
        w=Math.max(1,Math.min(8000,w)); h=Math.max(1,Math.min(8000,h));
        const c=canvas(w,h); c.getContext('2d').drawImage(im,0,0,w,h);
        let type='image/jpeg',ext='jpg';
        if(fmt==='keep'){ type=f.type&&f.type.indexOf('image/')===0?f.type:'image/jpeg'; ext=/\.(png|webp|gif)$/i.test(f.name)?f.name.split('.').pop().toLowerCase():'jpg'; if(type==='image/gif'){type='image/png';ext='png';} }
        else if(fmt==='png'){type='image/png';ext='png';} else if(fmt==='webp'){type='image/webp';ext='webp';}
        out.push({blob:await toBlob(c,type,0.92),name:outName(f,'-resized',ext)});
        if(im.close) im.close();
      }
      return out;
    }});
};

/* ---------- crop stage ---------- */
async function makeCropUI(extra,file,inp){
  const st=await imageStage(extra,file,640);
  const layer=document.createElement('div'); layer.className='crop-layer';
  const box=document.createElement('div'); box.className='crop-box';
  ['nw','ne','se','sw'].forEach(pos=>{ const h=document.createElement('div'); h.className='crop-handle crop-handle--'+pos; h.dataset.pos=pos; box.appendChild(h); });
  layer.appendChild(box); st.wrap.appendChild(layer);
  const rect={x:0,y:0,w:st.natural.w,h:st.natural.h};
  function sync(){
    box.style.left=(100*rect.x/st.natural.w)+'%'; box.style.top=(100*rect.y/st.natural.h)+'%';
    box.style.width=(100*rect.w/st.natural.w)+'%'; box.style.height=(100*rect.h/st.natural.h)+'%';
    if(inp.x) inp.x.value=Math.round(rect.x); if(inp.y) inp.y.value=Math.round(rect.y);
    if(inp.w) inp.w.value=Math.round(rect.w); if(inp.h) inp.h.value=Math.round(rect.h);
  }
  sync();
  let drag=null;
  const scale=()=>st.natural.w/(st.img.clientWidth||st.natural.w);
  const start=(e,pos)=>{ e.preventDefault(); e.stopPropagation(); drag={pos,sx:e.clientX,sy:e.clientY,r:{x:rect.x,y:rect.y,w:rect.w,h:rect.h}}; try{box.setPointerCapture(e.pointerId);}catch(err){} };
  box.addEventListener('pointerdown',e=>start(e,'move'));
  box.querySelectorAll('.crop-handle').forEach(h=>h.addEventListener('pointerdown',e=>start(e,h.dataset.pos)));
  box.addEventListener('pointermove',e=>{
    if(!drag) return;
    const dx=(e.clientX-drag.sx)*scale(), dy=(e.clientY-drag.sy)*scale();
    let {x,y,w,h}=drag.r;
    if(drag.pos==='move'){ x=drag.r.x+dx; y=drag.r.y+dy; }
    else{
      if(drag.pos.indexOf('w')>=0){ x=drag.r.x+dx; w=drag.r.w-dx; }
      if(drag.pos.indexOf('e')>=0){ w=drag.r.w+dx; }
      if(drag.pos.indexOf('n')>=0){ y=drag.r.y+dy; h=drag.r.h-dy; }
      if(drag.pos.indexOf('s')>=0){ h=drag.r.h+dy; }
    }
    rect.x=Math.max(0,Math.min(st.natural.w-10,x)); rect.y=Math.max(0,Math.min(st.natural.h-10,y));
    rect.w=Math.max(10,Math.min(st.natural.w-rect.x,w)); rect.h=Math.max(10,Math.min(st.natural.h-rect.y,h));
    sync();
  });
  box.addEventListener('pointerup',()=>{ drag=null; });
  box.addEventListener('pointercancel',()=>{ drag=null; });
  return {getRect:()=>({x:Math.round(rect.x),y:Math.round(rect.y),w:Math.round(rect.w),h:Math.round(rect.h)})};
}

INITERS['image-crop']=function(panel){
  let ui=null;
  const t0=imageTool(panel,{button:'Crop images',zipName:'cropped_images',
    options:'<div class="field"><label>X</label><input id="cpX" type="number" min="0" value="0" /></div>'+
      '<div class="field"><label>Y</label><input id="cpY" type="number" min="0" value="0" /></div>'+
      '<div class="field"><label>Width</label><input id="cpW" type="number" min="1" value="100" /></div>'+
      '<div class="field"><label>Height</label><input id="cpH" type="number" min="1" value="100" /></div>'+
      '<div class="field"><label>Format</label><select id="cpF"><option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option></select></div>',
    extra:'<div class="file-hint">Drag the red rectangle or its corners to crop. Values are in pixels.</div>',
    onFiles:async(files,extra)=>{ ui=null; try{ ui=await makeCropUI(extra,files[0],{x:panel.querySelector('#cpX'),y:panel.querySelector('#cpY'),w:panel.querySelector('#cpW'),h:panel.querySelector('#cpH')}); }catch(e){} },
    process:async(files,get)=>{
      const fmt=get('cpF'), type=fmt==='png'?'image/png':fmt==='webp'?'image/webp':'image/jpeg', ext=fmt==='jpeg'?'jpg':fmt;
      const r={x:Number(get('cpX'))||0,y:Number(get('cpY'))||0,w:Number(get('cpW'))||100,h:Number(get('cpH'))||100};
      const out=[];
      for(const f of files){
        const im=await decodeAny(await prepareImage(f));
        const sx=Math.max(0,Math.min(r.x,im.width-1)), sy=Math.max(0,Math.min(r.y,im.height-1));
        const sw=Math.max(1,Math.min(r.w,im.width-sx)), sh=Math.max(1,Math.min(r.h,im.height-sy));
        const c=canvas(sw,sh); c.getContext('2d').drawImage(im,sx,sy,sw,sh,0,0,sw,sh);
        out.push({blob:await toBlob(c,type,0.94),name:outName(f,'-cropped',ext)});
        if(im.close) im.close();
      }
      return out;
    }});
  return t0;
};

/* ---------- Convert to JPG ---------- */
INITERS['image-to-jpg']=function(panel){
  imageTool(panel,{button:'Convert to JPG',zipName:'converted_jpg',
    options:'<div class="field"><label>Quality</label><input id="ijQ" type="range" min="30" max="98" value="90" /></div>'+
      '<div class="field"><label>Background (for transparent images)</label><input id="ijBg" type="color" value="#ffffff" /></div>',
    process:async(files,get)=>{
      const q=Number(get('ijQ'))/100, bg=get('ijBg')||'#ffffff', out=[];
      for(const f of files){
        const im=await decodeAny(await prepareImage(f));
        const c=canvas(im.width,im.height), ctx=c.getContext('2d');
        ctx.fillStyle=bg; ctx.fillRect(0,0,c.width,c.height); ctx.drawImage(im,0,0);
        out.push({blob:await toBlob(c,'image/jpeg',q),name:outName(f,'','jpg')});
        if(im.close) im.close();
      }
      return out;
    }});
};

let gifencModule=null;
async function getGifenc(){
  if(gifencModule) return gifencModule;
  gifencModule=await import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js');
  return gifencModule;
}

/* ---------- Convert from JPG ---------- */
INITERS['jpg-to-image']=function(panel){
  imageTool(panel,{button:'Convert images',zipName:'converted_images',
    options:'<div class="field"><label>Output format</label><select id="jiF"><option value="png">PNG</option><option value="gif">Animated GIF</option></select></div>'+
      '<div class="field"><label>GIF frame delay (ms)</label><input id="jiD" type="number" min="20" max="2000" value="120" /></div>'+
      '<div class="field"><label>GIF max width</label><input id="jiW" type="number" min="64" max="1200" value="480" /></div>',
    process:async(files,get)=>{
      if(get('jiF')==='gif'){
        const g=await getGifenc();
        const enc=g.GIFEncoder();
        const W=Math.max(64,Math.min(1200,Number(get('jiW'))||480)), delay=Math.max(20,Number(get('jiD'))||120);
        const first=await decodeAny(await prepareImage(files[0]));
        const H=Math.max(1,Math.round(first.height*W/first.width)); if(first.close)first.close();
        for(const f of files){
          const im=await decodeAny(await prepareImage(f));
          const c=canvas(W,H), ctx=c.getContext('2d',{willReadFrequently:true});
          ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H); ctx.drawImage(im,0,0,W,H);
          const rgba=ctx.getImageData(0,0,W,H).data;
          const pal=g.quantize(rgba,256,'rgb565');
          enc.writeFrame(g.applyPalette(rgba,pal),W,H,{palette:pal,delay:delay});
          if(im.close) im.close();
        }
        enc.finish();
        return [{blob:new Blob([enc.bytes()],{type:'image/gif'}),name:'animated.gif'}];
      }
      const out=[];
      for(const f of files){ const im=await decodeAny(await prepareImage(f)); const c=canvas(im.width,im.height); c.getContext('2d').drawImage(im,0,0); out.push({blob:await toBlob(c,'image/png'),name:outName(f,'','png')}); if(im.close)im.close(); }
      return out;
    }});
};

/* ---------- Photo editor ---------- */
INITERS['photo-editor']=function(panel){
  let stage=null;
  const t0=imageTool(panel,{button:'Apply edits',zipName:'edited_photos',multiple:false,
    options:'<div class="field"><label>Brightness</label><input id="peB" type="range" min="50" max="150" value="100" /></div>'+
      '<div class="field"><label>Contrast</label><input id="peC" type="range" min="50" max="180" value="100" /></div>'+
      '<div class="field"><label>Saturation</label><input id="peS" type="range" min="0" max="220" value="100" /></div>'+
      '<div class="field"><label>Blur</label><input id="peBlur" type="range" min="0" max="12" value="0" /></div>'+
      '<div class="field"><label>Grayscale</label><input id="peG" type="range" min="0" max="100" value="0" /></div>'+
      '<div class="field"><label>Sepia</label><input id="peSep" type="range" min="0" max="100" value="0" /></div>'+
      '<div class="field"><label>Text</label><input id="peText" type="text" placeholder="Your caption" /></div>'+
      '<div class="field"><label>Text color</label><input id="peColor" type="color" value="#ffffff" /></div>'+
      '<div class="field"><label>Frame color</label><input id="peFrame" type="color" value="#e5322d" /></div>'+
      '<div class="field"><label>Frame width</label><input id="peFW" type="range" min="0" max="40" value="0" /></div>'+
      '<div class="field"><label>Sticker</label><select id="peSticker"><option value="">None</option><option value="⭐">⭐ Star</option><option value="❤️">❤️ Heart</option><option value="😀">😀 Smile</option><option value="🔥">🔥 Fire</option><option value="✨">✨ Sparkle</option></select></div>',
    extra:'<div class="file-hint">Adjust the sliders to preview, then apply.</div>',
    onFiles:async(files,extra)=>{ try{ stage=await imageStage(extra,files[0],640); redraw(); }catch(e){} },
    process:async(files,get)=>{
      const im=await decodeAny(await prepareImage(files[0]));
      const c=canvas(im.width,im.height);
      drawEdited(c,im,get);
      if(im.close) im.close();
      return [{blob:await toBlob(c,'image/jpeg',0.94),name:outName(files[0],'-edited','jpg')}];
    }});
  function redraw(){
    if(!stage) return;
    const c=canvas(Math.min(900,stage.natural.w),Math.round(Math.min(900,stage.natural.w)*stage.natural.h/stage.natural.w));
    c.className='image-preview'; drawEdited(c,stage.im,id=>{const el=panel.querySelector('#'+id);return el?el.value:'';});
    stage.wrap.innerHTML=''; stage.wrap.appendChild(c);
  }
  // live preview
  panel.addEventListener('input',e=>{ if(e.target.id&&e.target.id.indexOf('pe')===0) redraw(); });
  panel.addEventListener('change',e=>{ if(e.target.id&&e.target.id.indexOf('pe')===0) redraw(); });
  return t0;
};
function drawEdited(c,im,get){
  const ctx=c.getContext('2d');
  const b=Number(get('peB'))||100, ct=Number(get('peC'))||100, s=Number(get('peS'))||100;
  const blur=Number(get('peBlur'))||0, gr=Number(get('peG'))||0, sep=Number(get('peSep'))||0;
  ctx.filter='brightness('+b+'%) contrast('+ct+'%) saturate('+s+'%) blur('+blur+'px) grayscale('+gr+'%) sepia('+sep+'%)';
  ctx.drawImage(im,0,0,c.width,c.height); ctx.filter='none';
  const fw=Number(get('peFW'))||0;
  if(fw>0){ ctx.strokeStyle=get('peFrame')||'#e5322d'; ctx.lineWidth=fw*2; ctx.strokeRect(fw,fw,c.width-fw*2,c.height-fw*2); }
  const text=(get('peText')||'').trim();
  if(text){
    const size=Math.max(18,Math.round(c.width/16));
    ctx.font='800 '+size+'px Inter, Arial, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.lineWidth=Math.max(2,size/10); ctx.strokeStyle='#000'; ctx.strokeText(text,c.width/2,c.height-size*0.7);
    ctx.fillStyle=get('peColor')||'#fff'; ctx.fillText(text,c.width/2,c.height-size*0.7);
  }
  const sticker=get('peSticker');
  if(sticker){ ctx.font=Math.round(c.width/7)+'px sans-serif'; ctx.textAlign='right'; ctx.textBaseline='top'; ctx.fillText(sticker,c.width-c.width/20,c.width/20); }
}

/* ---------- Upscale Image ---------- */
INITERS['image-upscale']=function(panel){
  imageTool(panel,{button:'Upscale images',zipName:'upscaled_images',
    options:'<div class="field"><label>Scale factor</label><select id="upF"><option value="2">2×</option><option value="3">3×</option><option value="4">4×</option></select></div>'+
      '<div class="field"><label>Output format</label><select id="upO"><option value="png">PNG (best quality)</option><option value="jpeg">JPG</option><option value="webp">WebP</option></select></div>',
    process:async(files,get)=>{
      const f=Number(get('upF'))||2, fmt=get('upO'), out=[];
      const type=fmt==='png'?'image/png':fmt==='webp'?'image/webp':'image/jpeg', ext=fmt==='png'?'png':fmt==='webp'?'webp':'jpg';
      for(const file of files){
        const im=await decodeAny(await prepareImage(file));
        let w=Math.min(8000,Math.round(im.width*f)), h=Math.min(8000,Math.round(im.height*f));
        const c=canvas(w,h), ctx=c.getContext('2d');
        ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
        const mid=canvas(Math.min(4000,Math.round(im.width*Math.min(2,f))),Math.min(4000,Math.round(im.height*Math.min(2,f))));
        const mctx=mid.getContext('2d'); mctx.imageSmoothingEnabled=true; mctx.imageSmoothingQuality='high'; mctx.drawImage(im,0,0,mid.width,mid.height);
        ctx.drawImage(mid,0,0,w,h);
        out.push({blob:await toBlob(c,type,0.95),name:outName(file,'-upscaled',ext)});
        if(im.close) im.close();
      }
      return out;
    }});
};

/* ---------- Remove background ---------- */
INITERS['remove-bg']=function(panel){
  imageTool(panel,{button:'Remove background',zipName:'no_background',
    options:'<div class="field"><label>Tolerance</label><input id="bgTol" type="range" min="10" max="120" value="45" /></div>',
    extra:'<div class="file-hint">Works best with plain, solid-colour backgrounds. Output is a transparent PNG.</div>',
    process:async(files,get)=>{
      const tol=Number(get('bgTol'))||45, out=[];
      for(const f of files){
        const im=await decodeAny(await prepareImage(f));
        const scale=Math.min(1,1600/Math.max(im.width,im.height));
        const w=Math.max(1,Math.round(im.width*scale)), h=Math.max(1,Math.round(im.height*scale));
        const c=canvas(w,h), ctx=c.getContext('2d',{willReadFrequently:true});
        ctx.drawImage(im,0,0,w,h);
        const d=ctx.getImageData(0,0,w,h), data=d.data;
        const corners=[[0,0],[w-1,0],[0,h-1],[w-1,h-1]].map(p=>{const i=(p[1]*w+p[0])*4;return [data[i],data[i+1],data[i+2]];});
        const bg=[0,0,0]; corners.forEach(c=>{bg[0]+=c[0]/4;bg[1]+=c[1]/4;bg[2]+=c[2]/4;});
        const seen=new Uint8Array(w*h), stack=[];
        for(let x=0;x<w;x++){ stack.push(x,(h-1)*w+x); }
        for(let y=0;y<h;y++){ stack.push(y*w,y*w+w-1); }
        while(stack.length){
          const idx=stack.pop(); if(seen[idx]) continue; seen[idx]=1;
          const p=idx*4;
          if(Math.abs(data[p]-bg[0])+Math.abs(data[p+1]-bg[1])+Math.abs(data[p+2]-bg[2])>tol) continue;
          data[p+3]=0;
          const x=idx%w, y=(idx/w)|0;
          if(x>0) stack.push(idx-1); if(x<w-1) stack.push(idx+1);
          if(y>0) stack.push(idx-w); if(y<h-1) stack.push(idx+w);
        }
        ctx.putImageData(d,0,0);
        out.push({blob:await toBlob(c,'image/png'),name:outName(f,'-nobg','png')});
        if(im.close) im.close();
      }
      return out;
    }});
};

/* ---------- Watermark IMAGE ---------- */
INITERS['image-watermark']=function(panel){
  imageTool(panel,{button:'Add watermark',zipName:'watermarked_images',
    options:'<div class="field"><label>Watermark text</label><input id="wmText" type="text" placeholder="© Your brand" /></div>'+
      '<div class="field"><label>Or image</label><input id="wmImage" type="file" accept="image/png,image/jpeg" /></div>'+
      '<div class="field"><label>Opacity</label><input id="wmO" type="range" min="5" max="100" value="45" /></div>'+
      '<div class="field"><label>Position</label><select id="wmPos"><option value="br">Bottom right</option><option value="bl">Bottom left</option><option value="tr">Top right</option><option value="tl">Top left</option><option value="c">Center</option><option value="tile">Tile</option></select></div>'+
      '<div class="field"><label>Font size</label><input id="wmSize" type="number" min="10" max="200" value="36" /></div>'+
      '<div class="field"><label>Color</label><input id="wmColor" type="color" value="#ffffff" /></div>',
    process:async(files,get)=>{
      const text=(get('wmText')||'').trim(), pos=get('wmPos'), op=(Number(get('wmO'))||45)/100;
      const size=Number(get('wmSize'))||36, color=get('wmColor')||'#fff';
      const wi=panel.querySelector('#wmImage'), mark=(wi&&wi.files&&wi.files[0])?await decodeAny(wi.files[0]):null;
      const out=[];
      for(const f of files){
        const im=await decodeAny(await prepareImage(f));
        const c=canvas(im.width,im.height), ctx=c.getContext('2d');
        ctx.drawImage(im,0,0); ctx.globalAlpha=op;
        if(mark){
          const mw=Math.round(c.width/4), mh=Math.round(mark.height*mw/mark.width);
          const pts=pos==='tile'?[]:[pos];
          if(pos==='tile'){ for(let y=0;y<c.height;y+=mh*2) for(let x=0;x<c.width;x+=mw*2) pts.push([x,y]); }
          else pts.push(({tl:[c.width/20,c.width/20],tr:[c.width-c.width/20-mw,c.width/20],bl:[c.width/20,c.height-c.width/20-mh],br:[c.width-c.width/20-mw,c.height-c.width/20-mh],c:[(c.width-mw)/2,(c.height-mh)/2]})[pos]||[c.width-c.width/20-mw,c.height-c.width/20-mh]);
          pts.forEach(p=>ctx.drawImage(mark,p[0],p[1],mw,mh));
        }else if(text){
          const fs=Math.max(10,Math.min(size,c.width/8));
          ctx.font='800 '+fs+'px Inter, Arial, sans-serif'; ctx.fillStyle=color; ctx.textBaseline='top';
          const w=ctx.measureText(text).width;
          if(pos==='tile'){
            ctx.textAlign='left';
            for(let y=0;y<c.height;y+=fs*3) for(let x=0;x<c.width;x+=w+fs*2){ ctx.save();ctx.translate(x,y);ctx.rotate(-Math.PI/6);ctx.fillText(text,0,0);ctx.restore(); }
          }else{
            ctx.textAlign='left';
            const x=pos.indexOf('l')>=0?c.width/20:(pos==='c'?(c.width-w)/2:c.width-w-c.width/20);
            const y=pos.indexOf('t')>=0?c.width/20:(pos==='c'?(c.height-fs)/2:c.height-fs-c.width/20);
            ctx.fillText(text,x,y);
          }
        }
        ctx.globalAlpha=1;
        out.push({blob:await toBlob(c,'image/jpeg',0.94),name:outName(f,'-watermarked','jpg')});
        if(im.close) im.close();
      }
      return out;
    }});
};

/* ---------- Meme generator ---------- */
INITERS['meme-generator']=function(panel){
  imageTool(panel,{button:'Create meme',zipName:'memes',multiple:false,
    options:'<div class="field"><label>Top text</label><input id="mmTop" type="text" placeholder="TOP TEXT" /></div>'+
      '<div class="field"><label>Bottom text</label><input id="mmBottom" type="text" placeholder="BOTTOM TEXT" /></div>'+
      '<div class="field"><label>Font size</label><input id="mmSize" type="number" min="16" max="160" value="56" /></div>'+
      '<div class="field"><label>Text color</label><input id="mmColor" type="color" value="#ffffff" /></div>',
    process:async(files,get)=>{
      const f=files[0], im=await decodeAny(await prepareImage(f));
      const c=canvas(im.width,im.height), ctx=c.getContext('2d');
      ctx.drawImage(im,0,0);
      const size=Math.max(16,Math.min(Number(get('mmSize'))||56,c.width/6));
      ctx.font='900 '+size+'px Impact, Arial Black, sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.lineWidth=Math.max(2,size/9); ctx.strokeStyle='#000'; ctx.fillStyle=get('mmColor')||'#fff';
      const top=(get('mmTop')||'').trim(), bottom=(get('mmBottom')||'').trim();
      if(top) wrapText(ctx,top,c.width/2,size*0.7,c.width-20,size*1.1,true);
      if(bottom) wrapText(ctx,bottom,c.width/2,c.height-size*0.7-size*(bottom.split(' ').length>4?1.1:1.1),c.width-20,size*1.1,false);
      if(im.close) im.close();
      return [{blob:await toBlob(c,'image/jpeg',0.94),name:outName(f,'-meme','jpg')}];
    }});
};
function wrapText(ctx,text,x,y,maxW,lh,top){
  const words=text.toUpperCase().split(/\s+/), lines=[]; let line='';
  words.forEach(w=>{ const test=line?line+' '+w:w; if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=w;}else line=test; });
  if(line) lines.push(line);
  lines.forEach((l,i)=>{ const yy=top?y+i*lh:y-i*lh; ctx.strokeText(l,x,yy); ctx.fillText(l,x,yy); });
}

/* ---------- Rotate IMAGE ---------- */
INITERS['image-rotate']=function(panel){
  imageTool(panel,{button:'Rotate images',zipName:'rotated_images',
    options:'<div class="field"><label>Rotation</label><select id="irotA"><option value="90">90° clockwise</option><option value="180">180°</option><option value="270">90° counter-clockwise</option></select></div>',
    process:async(files,get)=>{
      const deg=Number(get('irotA'))||90, out=[];
      for(const f of files){
        const im=await decodeAny(await prepareImage(f));
        const swap=deg===90||deg===270;
        const c=canvas(swap?im.height:im.width,swap?im.width:im.height), ctx=c.getContext('2d');
        ctx.translate(c.width/2,c.height/2); ctx.rotate(deg*Math.PI/180); ctx.drawImage(im,-im.width/2,-im.height/2);
        out.push({blob:await toBlob(c,'image/jpeg',0.94),name:outName(f,'-rotated','jpg')});
        if(im.close) im.close();
      }
      return out;
    }});
};

/* ---------- HTML to IMAGE ---------- */
INITERS['html-to-image']=function(panel){
  imageTool(panel,{button:'Render to image',zipName:'html_image',multiple:false,
    options:'<div class="field"><label>HTML</label><textarea id="hiHtml" rows="5" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px">&lt;h1 style="color:#E5322D"&gt;Hello!&lt;/h1&gt;&lt;p&gt;Your HTML here.&lt;/p&gt;</textarea></div>'+
      '<div class="field"><label>Width</label><input id="hiW" type="number" min="100" max="3000" value="800" /></div>'+
      '<div class="field"><label>Height</label><input id="hiH" type="number" min="100" max="3000" value="600" /></div>'+
      '<div class="field"><label>Format</label><select id="hiF"><option value="jpeg">JPG</option><option value="png">PNG</option><option value="svg">SVG</option></select></div>',
    process:async(files,get)=>{
      const W=Math.max(100,Math.min(3000,Number(get('hiW'))||800)), H=Math.max(100,Math.min(3000,Number(get('hiH'))||600));
      const html=get('hiHtml')||'';
      const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+W+'" height="'+H+'"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:'+W+'px;height:'+H+'px;overflow:hidden;background:#fff;font-family:Arial,sans-serif;padding:12px">'+html+'</div></foreignObject></svg>';
      const fmt=get('hiF');
      if(fmt==='svg') return [{blob:new Blob([svg],{type:'image/svg+xml'}),name:'page.svg'}];
      const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
      const im=new Image();
      await new Promise((res,rej)=>{ im.onload=res; im.onerror=()=>rej(new Error('Could not render HTML')); im.src=url; });
      const c=canvas(W,H), ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,W,H); ctx.drawImage(im,0,0,W,H);
      return [{blob:await toBlob(c,fmt==='png'?'image/png':'image/jpeg',0.94),name:'page.'+(fmt==='png'?'png':'jpg')}];
    }});
};

/* ---------- Blur face / regions ---------- */
INITERS['blur-face']=function(panel){
  let ui=null;
  imageTool(panel,{button:'Blur regions',zipName:'blurred_images',
    options:'<div class="field"><label>Blur strength</label><input id="bfBlur" type="range" min="2" max="30" value="12" /></div>'+
      '<div class="field"><label>Output</label><select id="bfF"><option value="jpeg">JPG</option><option value="png">PNG</option></select></div>',
    extra:'<div class="file-hint">Drag on the image to mark faces, plates or any area you want to hide.</div>',
    onFiles:async(files,extra)=>{ ui=null; try{ ui=await makeBlurUI(extra,files[0]); }catch(e){} },
    process:async(files,get)=>{
      const blur=Number(get('bfBlur'))||12, fmt=get('bfF'), out=[];
      const regions=ui?ui.regions():[];
      for(const f of files){
        const im=await decodeAny(await prepareImage(f));
        const c=canvas(im.width,im.height), ctx=c.getContext('2d');
        ctx.drawImage(im,0,0);
        if(regions.length && ui){
          const sx=im.width/ui.display().w, sy=im.height/ui.display().h;
          ctx.save(); ctx.filter='blur('+blur+'px)';
          regions.forEach(r=>{ ctx.save(); ctx.beginPath(); ctx.rect(r.x*sx,r.y*sy,r.w*sx,r.h*sy); ctx.clip(); ctx.drawImage(im,0,0); ctx.restore(); });
          ctx.restore();
        }
        out.push({blob:await toBlob(c,fmt==='png'?'image/png':'image/jpeg',0.94),name:outName(f,'-blurred',fmt==='png'?'png':'jpg')});
        if(im.close) im.close();
      }
      return out;
    }});
};
async function makeBlurUI(extra,file){
  const st=await imageStage(extra,file,640);
  const layer=document.createElement('div'); layer.className='crop-layer blur-layer';
  const regions=[];
  function render(){
    layer.innerHTML='';
    regions.forEach(r=>{ const d=document.createElement('div'); d.className='blur-region';
      d.style.left=r.x+'px'; d.style.top=r.y+'px'; d.style.width=r.w+'px'; d.style.height=r.h+'px'; layer.appendChild(d); });
  }
  st.wrap.appendChild(layer);
  let start=null,cur=null;
  layer.addEventListener('pointerdown',e=>{
    const b=layer.getBoundingClientRect(); start={x:e.clientX-b.left,y:e.clientY-b.top};
    cur=document.createElement('div'); cur.className='blur-region blur-region--live'; layer.appendChild(cur);
    try{layer.setPointerCapture(e.pointerId);}catch(err){}
  });
  layer.addEventListener('pointermove',e=>{
    if(!start||!cur) return;
    const b=layer.getBoundingClientRect(), x=e.clientX-b.left, y=e.clientY-b.top;
    cur.style.left=Math.min(start.x,x)+'px'; cur.style.top=Math.min(start.y,y)+'px';
    cur.style.width=Math.abs(x-start.x)+'px'; cur.style.height=Math.abs(y-start.y)+'px';
  });
  layer.addEventListener('pointerup',e=>{
    if(!start) return;
    const b=layer.getBoundingClientRect(), x=e.clientX-b.left, y=e.clientY-b.top;
    const r={x:Math.min(start.x,x),y:Math.min(start.y,y),w:Math.abs(x-start.x),h:Math.abs(y-start.y)};
    if(r.w>5&&r.h>5){ regions.push(r); render(); } else if(cur){ cur.remove(); }
    start=null; cur=null;
  });
  render();
  return {regions:()=>regions,display:()=>({w:st.img.clientWidth||1,h:st.img.clientHeight||1})};
}
})();
