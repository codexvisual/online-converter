/* Online Converter — image utilities (real processing, no placeholders) */
(function(){
'use strict';
const core=window.OCIMG||{};
const canvas=core.canvas, toBlob=core.toBlob, decodeAny=core.decodeAny, outName=core.outName, deliverItems=core.deliverItems;

function set(id,html){const el=document.getElementById(id);if(el)el.innerHTML=html;}
function esc(s){return escapeHtml(String(s));}
function magic(bytes){
  const b=bytes;
  if(b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47)return 'PNG';
  if(b[0]===0xff&&b[1]===0xd8&&b[2]===0xff)return 'JPEG';
  if(b[0]===0x47&&b[1]===0x49&&b[2]===0x46)return 'GIF';
  if(b[0]===0x42&&b[1]===0x4d)return 'BMP';
  if(b[0]===0x52&&b[1]===0x49&&b[2]===0x46&&b[4]===0x57&&b[5]===0x45&&b[6]===0x42&&b[7]===0x50)return 'WEBP';
  if(b[4]===0x66&&b[5]===0x74&&b[6]===0x79&&b[7]===0x70)return 'AVIF/HEIC';
  if(b[0]===0x3c)return 'SVG/XML';
  return 'Unknown';
}
function shell(panel,cfg){
  let files=[];
  const status=panel.querySelector('.status');
  const opts=document.createElement('div');opts.className='options';opts.innerHTML=cfg.options||'';
  const result=document.createElement('div');result.className='util-result';
  const actions=document.createElement('div');actions.className='actions';
  actions.innerHTML='<button class="btn btn-primary" type="button"><i class="fa-solid fa-wand-magic-sparkles"></i> '+esc(cfg.button||'Process')+'</button>';
  panel.insertBefore(opts,status);panel.insertBefore(result,status);panel.insertBefore(actions,status);
  createDropzone(panel,{accept:cfg.accept||'image/*',multiple:cfg.multiple!==false,core:false,onFiles:f=>{
    files=[...f];
    if(cfg.onFiles) cfg.onFiles(files,result,get);
    else if(cfg.render) cfg.render(files,result,get);
  }});
  function get(id){const el=panel.querySelector('#'+id);return el?(el.type==='checkbox'?el.checked:el.value):'';}
  actions.querySelector('button').addEventListener('click',async()=>{
    if(!files.length&&!cfg.noFiles){setStatus(panel,t('status_select'),'error');return;}
    showProgress(panel,true);setProgress(panel,10);
    try{
      const msg=await cfg.process(files,get,panel,result);
      setProgress(panel,100);
      if(msg) setStatus(panel,msg,'success');
    }catch(e){setStatus(panel,'Something went wrong: '+(e&&e.message?e.message:e),'error');}
    finally{showProgress(panel,false);}
  });
  return {result,get,files:()=>files};
}

/* Image → Base64 */
INITERS['image-base64']=function(panel){
  shell(panel,{button:'Copy Base64',accept:'image/*',multiple:false,noFiles:true,
    options:'<div class="field"><label>Output</label><select id="b64Mode"><option value="data">Data URL (with prefix)</option><option value="raw">Pure Base64</option></select></div>',
    onFiles:(files,result,get)=>{
      const f=files[0];const r=new FileReader();
      r.onload=()=>{
        window.__b64=r.result;
        const raw=String(r.result).split(',')[1]||'';
        result.innerHTML='<div class="util-stat">'+esc(f.name)+' · '+fmt(f.size)+'</div><textarea id="b64Out" rows="7" readonly>'+esc(get('b64Mode')==='raw'?raw:r.result)+'</textarea>';
        result.querySelector('#b64Out').addEventListener('change',()=>{});
      };r.readAsDataURL(f);
    },
    process:async(files,get,panel,result)=>{
      const el=result.querySelector('#b64Out');
      if(!el||!el.value)throw new Error('Select an image first.');
      try{await navigator.clipboard.writeText(el.value);return 'Base64 copied to clipboard.';}
      catch(e){el.select();document.execCommand('copy');return 'Base64 copied.';}
    }});
  panel.addEventListener('change',e=>{if(e.target.id==='b64Mode'&&window.__b64)shellRefresh(panel);});
};
function shellRefresh(panel){const out=panel.querySelector('#b64Out');if(!out||!window.__b64)return;const raw=String(window.__b64).split(',')[1]||'';out.value=panel.querySelector('#b64Mode').value==='raw'?raw:window.__b64;}
function fmt(n){return n>1048576?(n/1048576).toFixed(2)+' MB':Math.max(1,Math.round(n/1024))+' KB';}

/* Base64 → Image */
INITERS['base64-image']=function(panel){
  shell(panel,{button:'Create image',noFiles:true,multiple:false,
    options:'<div class="field"><label>Base64 or data URL</label><textarea id="b62In" rows="6" placeholder="data:image/png;base64,..."></textarea></div><div class="field"><label>Filename</label><input id="b62Name" type="text" value="image.png" /></div>',
    process:async(files,get,panel)=>{
      const raw=(get('b62In')||'').trim().replace(/\s/g,'');
      if(!raw)throw new Error('Paste Base64 data first.');
      let mime='image/png',data=raw;
      if(raw.indexOf(',')>0){const m=raw.match(/^data:([^;]+);base64,/);if(m)mime=m[1];data=raw.split(',')[1];}
      let bin;try{bin=atob(data);}catch(e){throw new Error('Invalid Base64 data.');}
      const arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
      const ext=({ 'image/jpeg':'jpg','image/gif':'gif','image/webp':'webp','image/png':'png' })[mime]||'png';
      const name=get('b62Name')||('image.'+ext);
      offerDownload(panel,new Blob([arr],{type:mime}),name);
      return 'Image created: '+name;
    }});
};

/* Image Color Picker */
INITERS['image-color-picker']=function(panel){
  shell(panel,{button:'Analyse colours',multiple:false,
    options:'<div class="field"><label>Picked colour</label><div class="pick-readout"><span class="pick-swatch"></span><code class="pick-hex">—</code></div></div>',
    onFiles:(files,result,get)=>{
      (async()=>{
        const im=await decodeAny(files[0]);
        const s=Math.min(1,600/im.width),c=canvas(im.width*s,im.height*s);
        c.className='picker-canvas';c.getContext('2d').drawImage(im,0,0,c.width,c.height);
        result.innerHTML='<div class="file-hint">Click anywhere on the image to pick a colour.</div>';result.appendChild(c);
        const hex=result.querySelector('.pick-hex'),sw=result.querySelector('.pick-swatch');
        c.addEventListener('click',e=>{
          const b=c.getBoundingClientRect(),x=Math.round((e.clientX-b.left)*c.width/b.width),y=Math.round((e.clientY-b.top)*c.height/b.height);
          const d=c.getContext('2d').getImageData(Math.max(0,Math.min(c.width-1,x)),Math.max(0,Math.min(c.height-1,y)),1,1).data;
          const h='#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join('').toUpperCase();
          if(hex)hex.textContent=h+' · rgb('+d[0]+','+d[1]+','+d[2]+')';
          if(sw)sw.style.background=h;
        });
      })();
    },
    process:async(files,get,panel,result)=>{
      const c=result.querySelector('.picker-canvas');if(!c)throw new Error('Select an image first.');
      const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,counts={};
      for(let i=0;i<d.length;i+=4*37){const k=[d[i],d[i+1],d[i+2]].map(v=>Math.round(v/16)*16).join(',');counts[k]=(counts[k]||0)+1;}
      const top=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,6);
      result.insertAdjacentHTML('beforeend','<div class="palette">'+top.map(p=>{const rgb=p[0].split(',').map(Number);const h='#'+rgb.map(v=>Math.min(255,v).toString(16).padStart(2,'0')).join('');return '<button type="button" class="palette-chip" data-c="'+h+'" style="background:'+h+'"></button>';}).join('')+'</div><div class="file-hint">Top sampled colours — click to pick.</div>');
      result.querySelectorAll('.palette-chip').forEach(b=>b.addEventListener('click',()=>{const hex=result.querySelector('.pick-hex'),sw=result.querySelector('.pick-swatch');if(hex)hex.textContent=b.dataset.c;if(sw)sw.style.background=b.dataset.c;}));
      return 'Colour palette sampled.';
    }});
};

/* Metadata viewer + strip */
INITERS['image-metadata']=function(panel){
  shell(panel,{button:'Strip metadata & download',
    options:'<div class="field"><label>Output format</label><select id="mdF"><option value="keep">Keep original (re-encode)</option><option value="jpeg">JPG</option><option value="png">PNG</option></select></div>',
    onFiles:(files,result)=>{
      (async()=>{
        const rows=[];
        for(const f of files){
          let dims='—';try{const im=await decodeAny(f);dims=im.width+' × '+im.height;}catch(e){}
          rows.push('<tr><td>'+esc(f.name)+'</td><td>'+esc(f.type||magic(new Uint8Array(await f.slice(0,12).arrayBuffer())))+'</td><td>'+fmt(f.size)+'</td><td>'+dims+'</td></tr>');
        }
        result.innerHTML='<div class="table-wrap"><table class="util-table"><thead><tr><th>File</th><th>Type</th><th>Size</th><th>Dimensions</th></tr></thead><tbody>'+rows.join('')+'</tbody></table></div><div class="file-hint">Re-encoding through canvas removes embedded EXIF/IPTC metadata.</div>';
      })();
    },
    process:async(files,get,panel)=>{
      const out=[];
      for(const f of files){
        const im=await decodeAny(await core.prepareImage(f));
        const c=canvas(im.width,im.height);c.getContext('2d').drawImage(im,0,0);
        const fmt=get('mdF');
        const type=fmt==='png'?'image/png':fmt==='jpeg'?'image/jpeg':(f.type||'image/png');
        const ext=type==='image/png'?'png':'jpg';
        out.push({blob:await toBlob(c,type,0.94),name:outName(f,'-clean',ext)});
      }
      await deliverItems(panel,out,'clean_images');return 'Metadata stripped.';
    }});
};

/* SVG optimizer */
INITERS['svg-optimizer']=function(panel){
  shell(panel,{button:'Optimize SVG',accept:'.svg,image/svg+xml',
    onFiles:(files,result)=>{result.innerHTML='<div class="file-hint">'+files.length+' SVG file(s) ready. Optimization removes comments, whitespace and unnecessary metadata.</div>';},
    process:async(files,get,panel)=>{
      const out=[];
      for(const f of files){
        let txt=await f.text();
        const before=txt.length;
        txt=txt.replace(/<!--[\s\S]*?-->/g,'').replace(/<\?xml[^>]*\?>/g,'').replace(/>\s+</g,'><').replace(/\s{2,}/g,' ').replace(/\s*=\s*"/g,'="').trim();
        out.push({blob:new Blob([txt],{type:'image/svg+xml'}),name:outName(f,'-min','svg')});
      }
      await deliverItems(panel,out,'optimized_svg');return 'Optimized '+files.length+' SVG(s).';
    }});
};

/* Format detector */
INITERS['image-format-detector']=function(panel){
  shell(panel,{button:'Detect formats',accept:'*/*',
    onFiles:(files,result)=>{result.innerHTML='<div class="file-hint">'+files.length+' file(s) ready. Detection uses file signatures, not extensions.</div>';},
    process:async(files,get,panel,result)=>{
      const rows=[];
      for(const f of files){
        const head=new Uint8Array(await f.slice(0,16).arrayBuffer());
        const kind=magic(head);
        rows.push('<tr><td>'+esc(f.name)+'</td><td>'+esc(f.type||'—')+'</td><td><strong>'+kind+'</strong></td><td>'+(kind!=='Unknown'&&f.type&&kind.toLowerCase().indexOf(f.type.split('/')[1])<0?'⚠ mismatch':'✓')+'</td></tr>');
      }
      result.innerHTML='<div class="table-wrap"><table class="util-table"><thead><tr><th>File</th><th>Declared</th><th>Detected</th><th>Check</th></tr></thead><tbody>'+rows.join('')+'</tbody></table></div>';
      return 'Detected '+files.length+' file(s).';
    }});
};

/* Border generator */
INITERS['image-border']=function(panel){
  const render=(ctx,w,h,im,get)=>{
    const pad=Math.round(w*num(get,'brPad',4)/100),bw=Math.round(w*num(get,'brW',2)/100),rad=Math.round(w*num(get,'brR',0)/100);
    const color=get('brColor')||'#ffffff',bg=get('brBg')||'#ffffff';
    ctx.clearRect(0,0,w,h);ctx.fillStyle=color;
    roundRect(ctx,0,0,w,h,rad);ctx.fill();
    ctx.fillStyle=bg;roundRect(ctx,pad,pad,w-pad*2,h-pad*2,Math.max(0,rad-pad));ctx.fill();
    const iw=w-pad*2-bw*2,ih=h-pad*2-bw*2;
    ctx.save();ctx.beginPath();roundRect(ctx,pad+bw,pad+bw,iw,ih,Math.max(0,rad-pad-bw));ctx.clip();
    ctx.drawImage(im,pad+bw,pad+bw,iw,ih);ctx.restore();
  };
  function num(get,id,d){const v=Number(get(id));return isFinite(v)?v:d;}
  function roundRect(ctx,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
  core.imageTool(panel,{button:'Add border',zipName:'bordered_images',render,
    options:['<div class="preset-row"><button type="button" class="preset-btn" data-preset="none">None</button><button type="button" class="preset-btn active" data-preset="frame">Frame</button><button type="button" class="preset-btn" data-preset="polaroid">Polaroid</button></div>',
      '<div class="field"><label>Padding (%)</label><input id="brPad" type="range" min="0" max="20" value="6" /></div>',
      '<div class="field"><label>Border width (%)</label><input id="brW" type="range" min="0" max="10" value="2" /></div>',
      '<div class="field"><label>Rounded corners (%)</label><input id="brR" type="range" min="0" max="25" value="0" /></div>',
      '<div class="field"><label>Border colour</label><input id="brColor" type="color" value="#ffffff" /></div>',
      '<div class="field"><label>Mat colour</label><input id="brBg" type="color" value="#1f2328" /></div>'].join(''),
    fullSize:im=>({w:im.width,h:im.height}),type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-border','jpg'),
    process:(files,get,p)=>core.processAll(files,get,{panel:p,fullSize:im=>({w:im.width,h:im.height}),render,type:()=> 'image/jpeg',quality:()=>0.94,name:f=>outName(f,'-border','jpg')})
  });
  panel.addEventListener('click',e=>{const b=e.target.closest('.preset-btn');if(!b)return;panel.querySelectorAll('.preset-btn').forEach(x=>x.classList.toggle('active',x===b));const p=b.dataset.preset;const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v;};if(p==='none'){set('brPad',0);set('brW',0);set('brR',0);}else if(p==='polaroid'){set('brPad',9);set('brW',1);set('brR',0);set('brColor','#ffffff');set('brBg','#ffffff');}else{set('brPad',6);set('brW',2);set('brR',2);set('brColor','#ffffff');set('brBg','#1f2328');}panel.dispatchEvent(new Event('input',{bubbles:true}));});
};

/* Favicon generator */
INITERS['image-favicon']=function(panel){
  shell(panel,{button:'Generate favicons',multiple:false,
    options:'<div class="field"><label>Background</label><input id="fvBg" type="color" value="#ffffff" /></div><div class="file-hint">Outputs PNG sizes 16, 32, 48, 64, 180 and 512 in a ZIP.</div>',
    onFiles:(files,result)=>{result.innerHTML='<div class="file-hint">'+esc(files[0].name)+' ready.</div>';},
    process:async(files,get,panel)=>{
      const im=await decodeAny(files[0]),bg=get('fvBg')||'#ffffff',out=[];
      for(const s of [16,32,48,64,180,512]){
        const c=canvas(s,s),ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,s,s);
        const k=Math.min(s/im.width,s/im.height);ctx.drawImage(im,(s-im.width*k)/2,(s-im.height*k)/2,im.width*k,im.height*k);
        out.push({blob:await toBlob(c,'image/png'),name:'favicon-'+s+'.png'});
      }
      await deliverItems(panel,out,'favicons');return '6 favicon sizes generated.';
    }});
};

/* Contact sheet */
INITERS['image-contact-sheet']=function(panel){
  shell(panel,{button:'Create contact sheet',
    options:'<div class="field"><label>Columns</label><input id="csCols" type="number" min="1" max="8" value="4" /></div><div class="field"><label>Thumb size (px)</label><input id="csCell" type="number" min="64" max="400" value="220" /></div><div class="field"><label>Background</label><input id="csBg" type="color" value="#f7f8fa" /></div>',
    onFiles:(files,result)=>{result.innerHTML='<div class="file-hint">'+files.length+' image(s) will be arranged in a labelled grid.</div>';},
    process:async(files,get,panel)=>{
      const cols=Math.max(1,Math.min(8,Number(get('csCols'))||4)),cell=Math.max(64,Math.min(400,Number(get('csCell'))||220));
      const label=26,rows=Math.ceil(files.length/cols);
      const c=canvas(cols*cell,rows*(cell+label)),ctx=c.getContext('2d');
      ctx.fillStyle=get('csBg')||'#f7f8fa';ctx.fillRect(0,0,c.width,c.height);
      for(let i=0;i<files.length;i++){
        const im=await decodeAny(files[i]),x=(i%cols)*cell,y=Math.floor(i/cols)*(cell+label);
        const s=Math.min((cell-8)/im.width,(cell-8)/im.height);
        ctx.drawImage(im,x+(cell-im.width*s)/2+4,y+4,im.width*s,im.height*s);
        ctx.fillStyle='#1f2328';ctx.font='11px Inter,Arial,sans-serif';ctx.textAlign='center';
        const nm=files[i].name.length>24?files[i].name.slice(0,23)+'…':files[i].name;
        ctx.fillText(nm,x+cell/2,y+cell+16);
      }
      offerDownload(panel,await toBlob(c,'image/jpeg',0.92),'contact-sheet.jpg');return 'Contact sheet created.';
    }});
};
})();
