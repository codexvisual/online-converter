/* ============================================================================
   IMAGE STUDIO — unified, non-destructive canvas editor
   Original pixels are never modified. Every edit is an operation in a list;
   the visible result is regenerated from the original + operations.
   ============================================================================ */
(function(){
'use strict';

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const escS=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtBytes=n=>n>=1048576?(n/1048576).toFixed(1)+' MB':n>=1024?(n/1024).toFixed(0)+' KB':n+' B';
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=Math.max(1,w|0);c.height=Math.max(1,h|0);return c;};
const filtered=(src,f)=>{const cv=mk(src.width,src.height),c=cv.getContext('2d');c.filter=f;c.drawImage(src,0,0);return cv;};
const pixels=(src,fn)=>{const cv=mk(src.width,src.height),c=cv.getContext('2d');c.drawImage(src,0,0);const d=c.getImageData(0,0,cv.width,cv.height);fn(d.data,cv.width,cv.height);c.putImageData(d,0,0);return cv;};
const unsharp=(src,amount=1.2)=>{
  const b=filtered(src,'blur(1.4px)'),cv=mk(src.width,src.height),c=cv.getContext('2d');
  c.drawImage(src,0,0); c.globalCompositeOperation='difference'; c.drawImage(b,0,0);
  c.globalCompositeOperation='source-over'; c.globalAlpha=clamp(amount/8,0,0.6);
  c.drawImage(cv,0,0); c.globalAlpha=1; return cv;
};

/* ---------------- tool registry ---------------- */
const CATS=['Basic','Optimize','Convert','Adjust','Effects','AI','Design','Utilities'];
const T=[];
const def=o=>{T.push(o);return o;};
const R=(k,label,min,max,defv,step=1)=>({k,label,type:'range',min,max,def:defv,step});
const N=(k,label,defv)=>({k,label,type:'number',def:defv});
const SEL=(k,label,opts,defv)=>({k,label,type:'select',opts,def:defv});
const C=(k,label,defv)=>({k,label,type:'color',def:defv});
const X=(k,label,defv)=>({k,label,type:'checkbox',def:defv});

def({id:'crop',cat:'Basic',label:'Crop',icon:'fa-crop',controls:[N('x','X',0),N('y','Y',0),N('w','Width',100),N('h','Height',100),SEL('ratio','Aspect',['free','1:1','4:3','16:9','3:2'],'free')],
 apply:(s,v)=>{const x=clamp(+v.x||0,0,s.width-1),y=clamp(+v.y||0,0,s.height-1),w=clamp(+v.w||s.width-x,1,s.width-x),h=clamp(+v.h||s.height-y,1,s.height-y);const cv=mk(w,h);cv.getContext('2d').drawImage(s,x,y,w,h,0,0,w,h);return cv;}});
def({id:'resize',cat:'Basic',label:'Resize',icon:'fa-expand',controls:[N('w','Width',800),N('h','Height',600),X('lock','Lock ratio',true)],
 apply:(s,v)=>{const w=clamp(+v.w||s.width,1,12000),h=clamp(+v.h||s.height,1,12000);const cv=mk(w,h),c=cv.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(s,0,0,w,h);return cv;}});
def({id:'rotate',cat:'Basic',label:'Rotate',icon:'fa-rotate',controls:[R('deg','Angle',-180,180,90)],
 apply:(s,v)=>{const a=(+v.deg||0)*Math.PI/180,cv=mk(s.width,s.height),c=cv.getContext('2d');c.translate(cv.width/2,cv.height/2);c.rotate(a);c.drawImage(s,-s.width/2,-s.height/2);return cv;}});
def({id:'straighten',cat:'Basic',label:'Straighten',icon:'fa-compass',controls:[R('deg','Angle',-15,15,0,0.1)],
 apply:(s,v)=>{const a=(+v.deg||0)*Math.PI/180,cv=mk(s.width,s.height),c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);c.translate(cv.width/2,cv.height/2);c.rotate(a);c.drawImage(s,-s.width/2,-s.height/2);return cv;}});
def({id:'flip-h',cat:'Basic',label:'Flip horizontal',icon:'fa-arrows-left-right',controls:[],apply:s=>{const cv=mk(s.width,s.height),c=cv.getContext('2d');c.translate(s.width,0);c.scale(-1,1);c.drawImage(s,0,0);return cv;}});
def({id:'flip-v',cat:'Basic',label:'Flip vertical',icon:'fa-arrows-up-down',controls:[],apply:s=>{const cv=mk(s.width,s.height),c=cv.getContext('2d');c.translate(0,s.height);c.scale(1,-1);c.drawImage(s,0,0);return cv;}});
def({id:'canvas',cat:'Basic',label:'Canvas size',icon:'fa-table-cells',controls:[N('w','Width',800),N('h','Height',600),C('bg','Background','#ffffff')],
 apply:(s,v)=>{const w=clamp(+v.w||s.width,1,12000),h=clamp(+v.h||s.height,1,12000),cv=mk(w,h),c=cv.getContext('2d');c.fillStyle=v.bg||'#fff';c.fillRect(0,0,w,h);c.drawImage(s,(w-s.width)/2,(h-s.height)/2);return cv;}});

def({id:'compress',cat:'Optimize',label:'Compress & quality',icon:'fa-compress',controls:[R('q','Quality',10,100,80),SEL('fmt','Format',['image/jpeg','image/png','image/webp'],'image/jpeg'),X('strip','Strip metadata',true)],apply:s=>s});
def({id:'metadata',cat:'Optimize',label:'Metadata',icon:'fa-tags',controls:[X('strip','Remove EXIF / metadata',true)],apply:s=>s});

def({id:'format',cat:'Convert',label:'Convert format',icon:'fa-file-image',controls:[SEL('fmt','Output',['image/jpeg','image/png','image/webp','image/gif','image/bmp'],'image/png'),R('q','Quality',10,100,90)],apply:s=>s});
def({id:'to-base64',cat:'Convert',label:'Image to Base64',icon:'fa-code',controls:[],apply:s=>s});

def({id:'brightness',cat:'Adjust',label:'Brightness',icon:'fa-sun',controls:[R('v','Brightness',-100,100,0)],apply:(s,v)=>filtered(s,`brightness(${1+ +v.v/100})`)});
def({id:'contrast',cat:'Adjust',label:'Contrast',icon:'fa-circle-half-stroke',controls:[R('v','Contrast',-100,100,0)],apply:(s,v)=>filtered(s,`contrast(${1+ +v.v/100})`)});
def({id:'saturation',cat:'Adjust',label:'Saturation',icon:'fa-droplet',controls:[R('v','Saturation',-100,100,0)],apply:(s,v)=>filtered(s,`saturate(${1+ +v.v/100})`)});
def({id:'exposure',cat:'Adjust',label:'Exposure',icon:'fa-lightbulb',controls:[R('v','Exposure',-100,100,0)],apply:(s,v)=>filtered(s,`brightness(${Math.pow(2,+v.v/100)})`)});
def({id:'hue',cat:'Adjust',label:'Hue',icon:'fa-palette',controls:[R('v','Hue',-180,180,0)],apply:(s,v)=>filtered(s,`hue-rotate(${v.v}deg)`)});
def({id:'grayscale',cat:'Adjust',label:'Grayscale',icon:'fa-circle-half-stroke',controls:[R('v','Amount',0,100,100)],apply:(s,v)=>filtered(s,`grayscale(${v.v/100})`)});
def({id:'sepia',cat:'Adjust',label:'Sepia',icon:'fa-wand-magic-sparkles',controls:[R('v','Amount',0,100,100)],apply:(s,v)=>filtered(s,`sepia(${v.v/100})`)});
def({id:'invert',cat:'Adjust',label:'Invert',icon:'fa-adjust',controls:[R('v','Amount',0,100,100)],apply:(s,v)=>filtered(s,`invert(${v.v/100})`)});
def({id:'temperature',cat:'Adjust',label:'Temperature',icon:'fa-temperature-half',controls:[R('v','Warmth',-100,100,0)],apply:(s,v)=>pixels(s,(d)=>{const t=+v.v*0.45;for(let i=0;i<d.length;i+=4){d[i]=clamp(d[i]+t,0,255);d[i+2]=clamp(d[i+2]-t,0,255);}})});
def({id:'tint',cat:'Adjust',label:'Tint',icon:'fa-magic',controls:[R('v','Green / Magenta',-100,100,0)],apply:(s,v)=>pixels(s,d=>{const t=+v.v*0.35;for(let i=0;i<d.length;i+=4){d[i]=clamp(d[i]-t*.5,0,255);d[i+1]=clamp(d[i+1]+t,0,255);d[i+2]=clamp(d[i+2]-t*.5,0,255);}})});
def({id:'highlights',cat:'Adjust',label:'Highlights',icon:'fa-sun',controls:[R('v','Highlights',-100,100,0)],apply:(s,v)=>pixels(s,d=>{const k=+v.v/100;for(let i=0;i<d.length;i+=4)for(let c=0;c<3;c++){const p=d[i+c]/255;d[i+c]=clamp(255*Math.pow(p,k<0?1+Math.abs(k):1/(1+k)),0,255);}})});
def({id:'shadows',cat:'Adjust',label:'Shadows',icon:'fa-moon',controls:[R('v','Shadows',-100,100,0)],apply:(s,v)=>pixels(s,d=>{const k=+v.v/100;for(let i=0;i<d.length;i+=4)for(let c=0;c<3;c++){const p=d[i+c]/255;d[i+c]=clamp(255*Math.pow(p,k<0?1/(1+Math.abs(k)):1-k*0.6),0,255);}})});
def({id:'sharpness',cat:'Adjust',label:'Sharpness',icon:'fa-cut',controls:[R('v','Sharpness',0,300,100)],apply:(s,v)=>unsharp(s,+v.v/100)});

def({id:'blur',cat:'Effects',label:'Blur',icon:'fa-droplet',controls:[R('v','Radius',0,40,4,0.5)],apply:(s,v)=>filtered(s,`blur(${v.v}px)`)});
def({id:'motion',cat:'Effects',label:'Motion blur',icon:'fa-wind',controls:[R('v','Strength',0,40,10),SEL('dir','Direction',['horizontal','vertical','diagonal'],'horizontal')],apply:(s,v)=>{const cv=mk(s.width,s.height),c=cv.getContext('2d'),n=Math.max(1,+v.v|0);c.globalAlpha=1/n;for(let i=0;i<n;i++){let dx=0,dy=0;if(v.dir==='vertical')dy=i;else if(v.dir==='diagonal'){dx=i;dy=i;}else dx=i;c.drawImage(s,dx,dy);}return cv;}});
def({id:'pixelate',cat:'Effects',label:'Pixelate',icon:'fa-th',controls:[R('v','Block size',2,60,10)],apply:(s,v)=>{const b=clamp(+v.v|0,2,60),w=Math.max(1,Math.ceil(s.width/b)),h=Math.max(1,Math.ceil(s.height/b)),sm=mk(w,h),sc=sm.getContext('2d');sc.drawImage(s,0,0,w,h);const cv=mk(s.width,s.height),c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(sm,0,0,s.width,s.height);return cv;}});
def({id:'duotone',cat:'Effects',label:'Duotone',icon:'fa-palette',controls:[C('a','Shadow','#0f172a'),C('b','Highlight','#f97316')],apply:(s,v)=>pixels(s,d=>{const a=hex(v.a),b=hex(v.b);for(let i=0;i<d.length;i+=4){const l=(d[i]*.299+d[i+1]*.587+d[i+2]*.114)/255;d[i]=a[0]+(b[0]-a[0])*l;d[i+1]=a[1]+(b[1]-a[1])*l;d[i+2]=a[2]+(b[2]-a[2])*l;}})});
def({id:'sketch',cat:'Effects',label:'Sketch',icon:'fa-pencil',controls:[R('v','Intensity',0,100,70)],apply:(s,v)=>pixels(s,d=>{const k=1-+v.v/200;for(let i=0;i<d.length;i+=4){const l=d[i]*.299+d[i+1]*.587+d[i+2]*.114;const g=clamp(255-(l-255*k),0,255);d[i]=d[i+1]=d[i+2]=g;}})});
def({id:'posterize',cat:'Effects',label:'Posterize',icon:'fa-layer-group',controls:[R('v','Levels',2,16,6)],apply:(s,v)=>pixels(s,d=>{const n=clamp(+v.v|0,2,16)-1;for(let i=0;i<d.length;i+=4)for(let c=0;c<3;c++)d[i+c]=Math.round(d[i+c]/255*n)/n*255;})});
def({id:'threshold',cat:'Effects',label:'Threshold',icon:'fa-circle-half-stroke',controls:[R('v','Threshold',0,255,128)],apply:(s,v)=>pixels(s,d=>{for(let i=0;i<d.length;i+=4){const l=d[i]*.299+d[i+1]*.587+d[i+2]*.114> +v.v?255:0;d[i]=d[i+1]=d[i+2]=l;}})});
def({id:'vignette',cat:'Effects',label:'Vignette',icon:'fa-circle',controls:[R('v','Strength',0,100,55)],apply:(s,v)=>{const cv=mk(s.width,s.height),c=cv.getContext('2d');c.drawImage(s,0,0);const g=c.createRadialGradient(s.width/2,s.height/2,Math.min(s.width,s.height)*.22,s.width/2,s.height/2,Math.max(s.width,s.height)*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,`rgba(0,0,0,${+v.v/100})`);c.fillStyle=g;c.fillRect(0,0,s.width,s.height);return cv;}});
def({id:'grain',cat:'Effects',label:'Film grain',icon:'fa-wand-magic-sparkles',controls:[R('v','Grain',0,100,25)],apply:(s,v)=>pixels(s,d=>{const k=+v.v*0.6;for(let i=0;i<d.length;i+=4){const n=(Math.random()-.5)*k;d[i]=clamp(d[i]+n,0,255);d[i+1]=clamp(d[i+1]+n,0,255);d[i+2]=clamp(d[i+2]+n,0,255);}})});
def({id:'film',cat:'Effects',label:'Film look',icon:'fa-film',controls:[R('v','Intensity',0,100,60)],apply:(s,v)=>{let cv=filtered(s,`sepia(${(+v.v/100)*.55}) contrast(${1+ +v.v/300})`);return unsharp(cv,.5);}});
def({id:'denoise',cat:'Effects',label:'Noise reduction',icon:'fa-broom',controls:[R('v','Strength',0,100,35)],apply:(s,v)=>filtered(s,`blur(${+v.v/25}px)`)});

def({id:'bgremove',cat:'AI',label:'Background removal',icon:'fa-wand-magic-sparkles',controls:[R('tol','Tolerance',5,120,42),R('feather','Feather',0,20,4),SEL('replace','Replacement',['transparent','white','color'],'transparent'),C('color','Color','#ffffff')],apply:studioRemoveBg});
def({id:'upscale',cat:'AI',label:'Upscale & enhance',icon:'fa-maximize',controls:[R('scale','Scale',1.2,4,2,0.1),R('sharp','Sharpen',0,300,120)],apply:(s,v)=>{const w=Math.round(s.width*(+v.scale||2)),h=Math.round(s.height*(+v.scale||2)),cv=mk(w,h),c=cv.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(s,0,0,w,h);return unsharp(cv,+v.sharp/100);}});
def({id:'enhance',cat:'AI',label:'Auto enhance',icon:'fa-wand-magic-sparkles',controls:[R('v','Strength',0,100,60)],apply:(s,v)=>unsharp(filtered(s,`contrast(${1+ +v.v/250}) saturate(${1+ +v.v/300})`),+v.v/160)});
def({id:'faceblur',cat:'AI',label:'Face / privacy blur',icon:'fa-eye-slash',controls:[R('v','Blur',2,40,14)],apply:(s,v)=>faceBlur(s,+v.v)});
def({id:'subject',cat:'AI',label:'Focus area (blur outside)',icon:'fa-scissors',controls:[N('x','X',0),N('y','Y',0),N('w','Width',200),N('h','Height',200),R('v','Outside blur',0,40,12)],apply:(s,v)=>{const cv=mk(s.width,s.height),c=cv.getContext('2d');c.filter=`blur(${v.v}px)`;c.drawImage(s,0,0);c.filter='none';const x=+v.x||0,y=+v.y||0,w=+v.w||s.width,h=+v.h||s.height;c.save();c.beginPath();c.rect(x,y,w,h);c.clip();c.drawImage(s,0,0);c.restore();return cv;}});

def({id:'text',cat:'Design',label:'Text overlay',icon:'fa-font',controls:[{k:'text',label:'Text',type:'text',def:'Your text'},N('size','Size',48),C('color','Color','#ffffff'),R('x','X %',0,100,50),R('y','Y %',0,100,50),SEL('align','Align',['center','left','right'],'center')],apply:(s,v)=>drawText(s,v,false)});
def({id:'watermark',cat:'Design',label:'Watermark',icon:'fa-droplet',controls:[{k:'text',label:'Text',type:'text',def:'© Your Brand'},N('size','Size',36),C('color','Color','#ffffff'),R('opacity','Opacity',5,100,35),R('angle','Angle',-90,0,-30)],apply:(s,v)=>drawText(s,v,true)});
def({id:'border',cat:'Design',label:'Border',icon:'fa-square',controls:[R('w','Width',0,80,8),C('color','Color','#ffffff')],apply:(s,v)=>{const cv=mk(s.width,s.height),c=cv.getContext('2d');c.drawImage(s,0,0);const w=+v.w||0;c.strokeStyle=v.color;c.lineWidth=w*2;c.strokeRect(w,w,s.width-2*w,s.height-2*w);return cv;}});
def({id:'frame',cat:'Design',label:'Frame',icon:'fa-border-style',controls:[R('w','Thickness',4,120,24),C('color','Color','#e5322d')],apply:(s,v)=>{const w=+v.w||24,cv=mk(s.width+2*w,s.height+2*w),c=cv.getContext('2d');c.fillStyle=v.color;c.fillRect(0,0,cv.width,cv.height);c.drawImage(s,w,w);return cv;}});
def({id:'sticker',cat:'Design',label:'Sticker / emoji',icon:'fa-face-smile',controls:[{k:'text',label:'Emoji',type:'text',def:'⭐'},N('size','Size',80),R('x','X %',0,100,75),R('y','Y %',0,100,25)],apply:(s,v)=>drawText(s,Object.assign({color:'#ffffff',align:'center'},v),false)});
def({id:'bcolor',cat:'Design',label:'Background color',icon:'fa-fill-drip',controls:[C('color','Color','#ffffff')],apply:(s,v)=>{const cv=mk(s.width,s.height),c=cv.getContext('2d');c.fillStyle=v.color;c.fillRect(0,0,s.width,s.height);c.drawImage(s,0,0);return cv;}});
def({id:'shape',cat:'Design',label:'Shape overlay',icon:'fa-shapes',controls:[SEL('shape','Shape',['rectangle','ellipse'],'rectangle'),C('color','Color','#e5322d'),R('opacity','Opacity',5,100,50),N('x','X',10),N('y','Y',10),N('w','Width',120),N('h','Height',120)],apply:(s,v)=>{const cv=mk(s.width,s.height),c=cv.getContext('2d');c.drawImage(s,0,0);c.globalAlpha=+v.opacity/100;c.fillStyle=v.color;c.beginPath();if(v.shape==='ellipse')c.ellipse(+v.x+ +v.w/2,+v.y+ +v.h/2,+v.w/2,+v.h/2,0,0,Math.PI*2);else c.rect(+v.x,+v.y,+v.w,+v.h);c.fill();return cv;}});

def({id:'colorpick',cat:'Utilities',label:'Color picker',icon:'fa-palette',controls:[],apply:s=>s});
def({id:'detect',cat:'Utilities',label:'Format detector',icon:'fa-magnifying-glass',controls:[],apply:s=>s});
def({id:'svgopt',cat:'Utilities',label:'SVG optimizer',icon:'fa-file-code',controls:[],apply:s=>s});
def({id:'base64',cat:'Utilities',label:'Base64 export',icon:'fa-code',controls:[],apply:s=>s});
def({id:'contact',cat:'Utilities',label:'Contact sheet',icon:'fa-table-cells',controls:[N('cols','Columns',3),C('bg','Background','#ffffff')],apply:s=>s});

function hex(c){const h=String(c||'#000').replace('#','');return [parseInt(h.slice(0,2),16)||0,parseInt(h.slice(2,4),16)||0,parseInt(h.slice(4,6),16)||0];}

function drawText(s,v,tile){
  const cv=mk(s.width,s.height),c=cv.getContext('2d');c.drawImage(s,0,0);
  const size=clamp(+v.size||40,8,400),txt=String(v.text||'');
  c.font=`800 ${size}px Inter, Arial, sans-serif`;c.fillStyle=v.color||'#fff';c.textAlign=v.align||'center';c.textBaseline='middle';
  if(tile){
    c.save();c.globalAlpha=clamp(+v.opacity/100,0,1);c.translate(s.width/2,s.height/2);c.rotate((+v.angle||-30)*Math.PI/180);
    const step=Math.max(size*3,140);
    for(let y=-s.height;y<s.height;y+=step)for(let x=-s.width;x<s.width;x+=step)c.fillText(txt,x,y);
    c.restore();
  }else{
    c.fillText(txt,s.width*clamp(+v.x/100||0,0,1),s.height*clamp(+v.y/100||0,0,1));
  }
  return cv;
}

/* Fast corner-color flood fill on a downscaled mask (honest, no AI claim). */
function studioRemoveBg(src,v){
  const scale=Math.min(1,700/Math.max(src.width,src.height));
  const sw=Math.max(8,Math.round(src.width*scale)),sh=Math.max(8,Math.round(src.height*scale));
  const small=mk(sw,sh),sc=small.getContext('2d');sc.drawImage(src,0,0,sw,sh);
  const sd=sc.getImageData(0,0,sw,sh),D=sd.data,N=sw*sh,seen=new Uint8Array(N),mask=new Uint8Array(N);
  const tol=clamp(+v.tol||42,1,160);const seeds=[[0,0],[sw-1,0],[0,sh-1],[sw-1,sh-1]];
  const target=[];
  for(const [x,y] of seeds){const i=(y*sw+x)*4;target.push([D[i],D[i+1],D[i+2]]);}
  const avg=[0,1,2].map(k=>Math.round(target.reduce((a,t)=>a+t[k],0)/target.length));
  const stack=seeds.map(([x,y])=>y*sw+x);
  const near=(i)=>{const p=i*4;return Math.abs(D[p]-avg[0])+Math.abs(D[p+1]-avg[1])+Math.abs(D[p+2]-avg[2])<tol*3;};
  while(stack.length){const i=stack.pop();if(seen[i])continue;seen[i]=1;if(!near(i))continue;mask[i]=1;const x=i%sw,y=(i/sw)|0;
    if(x>0)stack.push(i-1);if(x<sw-1)stack.push(i+1);if(y>0)stack.push(i-sw);if(y<sh-1)stack.push(i+sw);}
  // feather mask
  const f=clamp(+v.feather|0,0,12);let m=mask;
  if(f>0){const tmp=new Uint8Array(N);for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){let s=0,n=0;for(let dy=-f;dy<=f;dy+=Math.max(1,f))for(let dx=-f;dx<=f;dx+=Math.max(1,f)){const xx=x+dx,yy=y+dy;if(xx>=0&&xx<sw&&yy>=0&&yy<sh){s+=mask[yy*sw+xx];n++;}}tmp[y*sw+x]=s/n*255;}m=tmp;}
  const cv=mk(src.width,src.height),c=cv.getContext('2d');c.drawImage(src,0,0);const d=c.getImageData(0,0,cv.width,cv.height),P=d.data;
  const repl=hex(v.color),mode=v.replace||'transparent';
  for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++){
    const mx=Math.min(sw-1,Math.floor(x*sw/cv.width)),my=Math.min(sh-1,Math.floor(y*sh/cv.height));
    const a=m[my*sw+mx]===1?1:(m[my*sw+mx]/255);if(a<=0)continue;
    const p=(y*cv.width+x)*4;
    if(mode==='transparent')P[p+3]=Math.max(0,Math.round(P[p+3]*(1-a)));
    else{P[p]=P[p]*(1-a)+repl[0]*a;P[p+1]=P[p+1]*(1-a)+repl[1]*a;P[p+2]=P[p+2]*(1-a)+repl[2]*a;}
  }
  c.putImageData(d,0,0);return cv;
}

function faceBlur(s,radius){
  const cv=mk(s.width,s.height),c=cv.getContext('2d');c.drawImage(s,0,0);
  const probe=mk(Math.min(400,s.width),Math.round(s.height*Math.min(400,s.width)/s.width)),pc=probe.getContext('2d');pc.drawImage(s,0,0,probe.width,probe.height);
  const d=pc.getImageData(0,0,probe.width,probe.height).data,seen=new Uint8Array(probe.width*probe.height),boxes=[];
  const sx=s.width/probe.width,sy=s.height/probe.height;
  const skin=i=>{const r=d[i],g=d[i+1],b=d[i+2];return r>95&&g>40&&b>20&&r>g&&g>b&&(r-g)>15&&(Math.max(r,g,b)-Math.min(r,g,b))>15;};
  for(let i=0;i<d.length/4;i++){
    if(seen[i]||!skin(i*4))continue;
    const st=[i],box={x0:i%probe.width,y0:(i/probe.width)|0,x1:i%probe.width,y1:(i/probe.width)|0};let count=0;
    while(st.length&&count<2000){const j=st.pop();if(seen[j])continue;seen[j]=1;count++;const x=j%probe.width,y=(j/probe.width)|0;
      box.x0=Math.min(box.x0,x);box.x1=Math.max(box.x1,x);box.y0=Math.min(box.y0,y);box.y1=Math.max(box.y1,y);
      if(x>0&&skin((j-1)*4))st.push(j-1);if(x<probe.width-1&&skin((j+1)*4))st.push(j+1);
      if(y>0&&skin((j-probe.width)*4))st.push(j-probe.width);if(y<probe.height-1&&skin((j+probe.width)*4))st.push(j+probe.width);}
    const w=box.x1-box.x0,h=box.y1-box.y0;
    if(count>60&&w>probe.width*.025&&h>probe.height*.025&&w<probe.width*.45&&h<probe.height*.45)
      boxes.push([box.x0*sx-6,box.y0*sy-6,(w+12)*sx,(h+12)*sy]);
  }
  for(const [x,y,w,h] of boxes){const patch=mk(Math.max(1,w|0),Math.max(1,h|0)),p=patch.getContext('2d');p.filter=`blur(${radius}px)`;p.drawImage(s,x,y,w,h,0,0,patch.width,patch.height);c.drawImage(patch,x,y);}
  return cv;
}

/* ---------------- state ---------------- */
const S={images:[],active:0,tool:'resize',zoom:1,pan:{x:0,y:0},compare:false,split:50,crop:null,root:null,canvas:null,statusEl:null};
const cur=()=>S.images[S.active];
const defsFor=id=>T.find(t=>t.id===id);

/* ---------------- engine ---------------- */
function applyOps(im){
  let work=mk(im.base.width,im.base.height);let c=work.getContext('2d');c.drawImage(im.base,0,0);
  const ops=im.ops.concat(im.temp?[im.temp]:[]);
  for(const op of ops){if(op.hidden)continue;const d=defsFor(op.id);if(!d||!d.apply)continue;try{const out=d.apply(work,op.v);if(out&&out!==work){work=out;c=work.getContext('2d');}}catch(e){}}
  im.current=work;
}
function rerender(){
  const im=cur();if(!im)return;
  applyOps(im);scheduleDraw();updateStatus();renderLayers();renderGallery();
  if(S.tool==='crop'&&!S.crop)S.crop={x:0,y:0,w:im.current.width,h:im.current.height};
}
let drawQueued=false;
function scheduleDraw(){
  if(drawQueued)return;drawQueued=true;
  requestAnimationFrame(()=>{drawQueued=false;draw();});
}
function draw(){
  const im=cur(),cv=S.canvas;if(!im||!cv)return;
  const w=Math.max(1,cv.clientWidth),h=Math.max(1,cv.clientHeight);
  const dpr=Math.min(2,window.devicePixelRatio||1);
  if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
  const c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);
  const fit=Math.min(w/im.current.width,h/im.current.height)*.94;
  S.fit=fit;
  const scale=fit*S.zoom;
  const ox=(w-im.current.width*scale)/2+S.pan.x,oy=(h-im.current.height*scale)/2+S.pan.y;
  c.imageSmoothingQuality='high';c.drawImage(im.current,ox,oy,im.current.width*scale,im.current.height*scale);
  // selection boundary
  c.save();c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=1;c.strokeRect(ox+.5,oy+.5,im.current.width*scale-1,im.current.height*scale-1);c.restore();
  if(S.grid){
    c.save();c.strokeStyle='rgba(255,255,255,.075)';c.lineWidth=1;c.beginPath();
    for(let x=((ox%32)+32)%32;x<w;x+=32){c.moveTo(x,0);c.lineTo(x,h);}
    for(let y=((oy%32)+32)%32;y<h;y+=32){c.moveTo(0,y);c.lineTo(w,y);}
    c.stroke();c.restore();
  }
  if(S.guides){
    c.save();c.strokeStyle='rgba(56,189,248,.55)';c.setLineDash([6,5]);c.lineWidth=1;c.beginPath();
    c.moveTo(ox+im.current.width*scale/2,0);c.lineTo(ox+im.current.width*scale/2,h);
    c.moveTo(0,oy+im.current.height*scale/2);c.lineTo(w,oy+im.current.height*scale/2);
    c.stroke();c.restore();
  }
  if(S.compare){
    const cut=ox+im.current.width*scale*(S.split/100);
    c.save();c.beginPath();c.rect(ox,oy,cut-ox,im.current.height*scale);c.clip();c.drawImage(im.base,ox,oy,im.current.width*scale,im.current.height*scale);c.restore();
    c.strokeStyle='#e5322d';c.lineWidth=2;c.beginPath();c.moveTo(cut,oy);c.lineTo(cut,oy+im.current.height*scale);c.stroke();
    c.fillStyle='#e5322d';c.beginPath();c.arc(cut,oy+im.current.height*scale/2,9,0,Math.PI*2);c.fill();
  }
  S.view={ox,oy,scale};
  if(S.tool==='crop'&&S.crop)drawCrop(c,ox,oy,scale);
}
function drawCrop(c,ox,oy,s){
  const x=ox+S.crop.x*s,y=oy+S.crop.y*s,w=S.crop.w*s,h=S.crop.h*s;
  c.save();
  c.fillStyle='rgba(0,0,0,.42)';c.fillRect(0,0,c.canvas.width,c.canvas.height);
  c.globalCompositeOperation='destination-out';c.fillRect(x,y,w,h);
  c.globalCompositeOperation='source-over';
  c.strokeStyle='#fff';c.lineWidth=1.5;c.setLineDash([7,5]);c.strokeRect(x,y,w,h);
  c.setLineDash([]);
  // rule of thirds
  c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=1;
  for(let i=1;i<3;i++){c.beginPath();c.moveTo(x+w*i/3,y);c.lineTo(x+w*i/3,y+h);c.stroke();c.beginPath();c.moveTo(x,y+h*i/3);c.lineTo(x+w,y+h*i/3);c.stroke();}
  c.strokeStyle='#e5322d';c.lineWidth=2;
  [[x,y],[x+w,y],[x,y+h],[x+w,y+h],[x+w/2,y],[x,y+h/2],[x+w,y+h/2],[x+w/2,y+h]].forEach(([px,py])=>{c.fillStyle='#e5322d';c.fillRect(px-5,py-5,10,10);});c.restore();
}

/* ---------------- UI ---------------- */
const MENUS={
  file:[['Open images','open'],['Open project (JSON)','openproject'],['Save project (JSON)','save'],['Quick save (default name)','quicksave'],['Export…','export']],
  edit:[['Undo','undo'],['Redo','redo'],['Reset all edits','reset']],
  view:[['Fit to screen','fit'],['Actual size','actual'],['Grid','grid'],['Rulers','rulers'],['Smart guides','guides'],['Fullscreen','fullscreen'],['Hide left panel','drawer'],['Hide right panel','props']],
  exportquick:[['PNG — best quality','q:image/png'],['JPG — smallest','q:image/jpeg'],['WebP — balanced','q:image/webp'],['GIF — 256 colours','q:image/gif'],['BMP — uncompressed','q:image/bmp'],['Full export options…','export']],
  help:[['Keyboard shortcuts','shortcuts'],['About Image Studio','about']]
};
const MENU_LABELS={exportquick:'Quick export'};
const PRESETS={
  'image-compress':[['Web','q:60'],['Balanced','q:80'],['Print','q:95']],
  'compress':[['Web','q:60'],['Balanced','q:80'],['Print','q:95']],
  'bgremove':[['Light','tol:22'],['Normal','tol:42'],['Strong','tol:70']],
  'blur':[['Soft','v:3'],['Medium','v:8'],['Strong','v:18']],
  'sharpness':[['Soft','v:60'],['Normal','v:120'],['Strong','v:220']],
  'upscale':[['2×','scale:2'],['3×','scale:3'],['4×','scale:4']],
  'saturation':[['Muted','v:-35'],['Natural','v:0'],['Vivid','v:35']],
  'contrast':[['Soft','v:-25'],['Normal','v:0'],['Punchy','v:30']]
};
const RAIL=[
  {cat:'Basic',icon:'fa-crop'},
  {cat:'Optimize',icon:'fa-compress'},
  {cat:'Convert',icon:'fa-exchange-alt'},
  {cat:'Adjust',icon:'fa-sliders'},
  {cat:'Effects',icon:'fa-wand-magic-sparkles'},
  {cat:'AI',icon:'fa-brain'},
  {cat:'Design',icon:'fa-font'},
  {cat:'Utilities',icon:'fa-toolbox'}
];

function loadPrefs(){try{return JSON.parse(localStorage.getItem('oc-studio-prefs')||'{}')||{};}catch(e){return {};}}
function savePrefs(){try{localStorage.setItem('oc-studio-prefs',JSON.stringify({drawer:S.drawerOpen,props:S.propsOpen,grid:S.grid,rulers:S.rulers,guides:S.guides}));}catch(e){}}

function render(root,initialId){
  S.root=root;S.images=[];S.active=0;S.zoom=1;S.pan={x:0,y:0};S.compare=false;S.crop=null;
  const p=loadPrefs();
  const mobile=window.innerWidth<768,compact=window.innerWidth<1024;
  S.drawerOpen=mobile?false:p.drawer!==false;S.propsOpen=compact?false:p.props!==false;
  S.grid=!!p.grid;S.rulers=!!p.rulers;S.guides=!!p.guides;
  root.innerHTML=`<section class="pro-studio ${S.drawerOpen?'':'hide-drawer'} ${S.propsOpen?'':'hide-props'} ${S.grid?'show-grid':''} ${S.rulers?'show-rulers':''} ${S.guides?'show-guides':''}">
    <header class="pro-header">
      <div class="pro-brand"><span class="pro-logo"><i class="fa-solid fa-layer-group"></i></span><div><strong>Image Studio</strong><small>Non-destructive · browser-only</small></div></div>
      <nav class="pro-menu" aria-label="Application menu">
        ${Object.keys(MENUS).map(k=>`<div class="pro-menu-wrap"><button type="button" class="pro-menu-btn" data-menu="${k}">${MENU_LABELS[k]||k.charAt(0).toUpperCase()+k.slice(1)}</button><div class="pro-menu-pop" data-pop="${k}" hidden>${MENUS[k].map(([label,act])=>`<button type="button" data-menu-act="${act}">${label}</button>`).join('')}</div></div>`).join('')}
      </nav>
      <div class="pro-header-actions">
        <button class="pro-btn" data-act="save" title="Save project"><i class="fa-solid fa-file-arrow-down"></i><span> Save project</span></button>
        <select id="proTheme" class="pro-theme" aria-label="Theme"><option value="auto">Auto</option><option value="light">Light</option><option value="dark">Dark</option></select>
        <button class="pro-btn pro-btn--primary" data-act="export"><i class="fa-solid fa-download"></i> Export</button>
      </div>
      <input type="file" id="proProjectInput" accept="application/json,.json" hidden />
    </header>
    <div class="pro-contextbar">
      <button class="pro-btn" data-act="undo" title="Undo (Ctrl+Z)"><i class="fa-solid fa-arrow-rotate-left"></i></button>
      <button class="pro-btn" data-act="redo" title="Redo (Ctrl+Y)"><i class="fa-solid fa-arrow-rotate-right"></i></button>
      <span class="pro-sep"></span>
      <button class="pro-btn" data-act="zoomout" title="Zoom out (-)"><i class="fa-solid fa-minus"></i></button><span class="pro-zoom" id="proZoom">100%</span><button class="pro-btn" data-act="zoomin" title="Zoom in (+)"><i class="fa-solid fa-plus"></i></button>
      <button class="pro-btn pro-hide-sm" data-act="fit" title="Fit to screen"><i class="fa-solid fa-expand"></i></button>
      <button class="pro-btn pro-hide-sm" data-act="actual" title="Actual pixels"><i class="fa-solid fa-1"></i></button>
      <span class="pro-sep"></span>
      <button class="pro-btn" data-act="compare" title="Before / after"><i class="fa-solid fa-code-compare"></i></button>
      <button class="pro-btn pro-hide-sm" data-act="grid" title="Grid"><i class="fa-solid fa-grid-2"></i></button>
      <button class="pro-btn pro-hide-sm" data-act="guides" title="Smart guides"><i class="fa-solid fa-ruler-combined"></i></button>
      <button class="pro-btn" data-act="reset" title="Reset all"><i class="fa-solid fa-rotate"></i></button>
      <span class="pro-sep"></span>
      <button class="pro-btn pro-hide-sm" data-panel="drawer" title="Toggle tools"><i class="fa-solid fa-panel-left"></i></button>
      <button class="pro-btn pro-hide-sm" data-panel="props" title="Toggle properties"><i class="fa-solid fa-panel-right"></i></button>
      <button class="pro-btn pro-hide-sm" data-act="fullscreen" title="Fullscreen"><i class="fa-solid fa-maximize"></i></button>
      <div class="pro-context-tools" id="proContextTools"></div>
      <button class="pro-btn pro-sheet-btn" data-panel="props" title="Settings"><i class="fa-solid fa-sliders"></i></button>
    </div>
    <div class="pro-workspace">
      <nav class="pro-rail" id="proRail" aria-label="Tool categories">${RAIL.map(r=>`<button type="button" class="pro-rail-btn" data-cat="${r.cat}" title="${r.cat}"><i class="fa-solid ${r.icon}"></i><span>${r.cat.slice(0,3)}</span></button>`).join('')}</nav>
      <aside class="pro-drawer" id="proDrawer">
        <div class="pro-drawer-head"><strong>Tools</strong><button class="pro-icon-btn" data-panel="drawer" title="Collapse"><i class="fa-solid fa-angles-left"></i></button></div>
        <div class="pro-upload" id="proUpload" tabindex="0" role="button"><i class="fa-solid fa-cloud-arrow-up"></i><strong>Open images</strong><span>Drop · click · paste</span><input type="file" id="proInput" accept="image/*,.svg" multiple hidden></div>
        <div class="pro-gallery" id="proGallery"></div>
        <label class="pro-search"><i class="fa-solid fa-magnifying-glass"></i><input type="search" id="proToolSearch" placeholder="Search 52 tools…" aria-label="Search tools" autocomplete="off"></label>
        <div class="pro-popular" id="proPopular"></div>
        <div class="pro-tools" id="proTools"></div>
      </aside>
      <main class="pro-stage" id="proStage">
        <div class="pro-canvas-wrap"><canvas id="proCanvas"></canvas><div class="pro-hint" id="proHint"><div class="pro-hint-box"><i class="fa-solid fa-images"></i><strong>Drop an image to start</strong><span>or click “Open images” · paste from clipboard</span><button type="button" id="proSample"><i class="fa-solid fa-wand-magic-sparkles"></i> Try a sample image</button></div></div></div>
        <input type="range" class="pro-split" id="proSplit" min="0" max="100" value="50" hidden aria-label="Comparison divider">
        <div class="pro-fab"><button type="button" data-panel="drawer" title="Tools"><i class="fa-solid fa-toolbox"></i></button><button type="button" data-panel="props" title="Settings"><i class="fa-solid fa-sliders"></i></button></div>
      </main>
      <aside class="pro-props" id="proProps">
        <div class="pro-right-head"><i class="fa-solid fa-sliders"></i><strong id="proToolName">Crop</strong><button class="pro-icon-btn" data-panel="props" title="Collapse"><i class="fa-solid fa-angles-right"></i></button></div>
        <div class="pro-controls" id="proControls"></div>
        <div class="pro-layers"><div class="pro-layers-t">History / Layers <span id="proLayerCount">0</span></div><div id="proLayerList"></div></div>
      </aside>
    </div>
    <footer class="pro-statusbar"><span id="proDims">—</span><span id="proFmt">—</span><span id="proSize">—</span><span class="pro-status-spacer"></span><span id="proStatus">Ready</span><span id="proZoomStatus">100%</span></footer>
    <nav class="pro-mobile-nav" id="proMobileNav">${RAIL.map(r=>`<button type="button" data-cat="${r.cat}"><i class="fa-solid ${r.icon}"></i><span>${r.cat.slice(0,4)}</span></button>`).join('')}</nav>
  </section>`;
  root.appendChild(root.firstElementChild);
  const q=s=>root.querySelector(s);
  S.canvas=q('#proCanvas');S.statusEl=q('#proStatus');

  q('#proTools').innerHTML=CATS.map(cat=>`<div class="pro-group" data-group="${cat}"><div class="pro-group-t">${cat}</div>${T.filter(t=>t.cat===cat).map(t=>`<button type="button" class="pro-tool" data-tool="${t.id}" title="${escS(t.label)}"><i class="fa-solid ${t.icon}"></i><span>${escS(t.label)}</span></button>`).join('')}</div>`).join('');
  q('#proTools').querySelectorAll('.pro-tool').forEach(b=>b.addEventListener('click',()=>selectTool(b.dataset.tool)));
  // popular quick tools
  const popular=['resize','crop','remove-bg','compress','text','watermark'];
  q('#proPopular').innerHTML=popular.map(id=>{const d=defsFor(id);return d?`<button type="button" class="pro-pop" data-tool="${id}" title="${escS(d.label)}"><i class="fa-solid ${d.icon}"></i>${escS(d.label)}</button>`:'';}).join('');
  q('#proPopular').querySelectorAll('.pro-pop').forEach(b=>b.addEventListener('click',()=>selectTool(b.dataset.tool)));
  // tool search
  q('#proToolSearch').addEventListener('input',e=>{
    const term=e.target.value.trim().toLowerCase();let shown=0;
    q('#proTools').querySelectorAll('.pro-group').forEach(g=>{
      let n=0;g.querySelectorAll('.pro-tool').forEach(b=>{const ok=!term||b.dataset.tool.includes(term)||b.textContent.toLowerCase().includes(term);b.hidden=!ok;if(ok)n++;});
      g.hidden=n===0;shown+=n;
    });
    studioStatus(term?shown+' tool(s) found':'52 tools','success');
  });

  // menus
  const closeMenus=()=>root.querySelectorAll('.pro-menu-pop').forEach(x=>x.hidden=true);
  q('.pro-menu').addEventListener('click',e=>{
    const b=e.target.closest('[data-menu]');if(b){const pop=q(`[data-pop="${b.dataset.menu}"]`);const was=!pop.hidden;closeMenus();pop.hidden=was;return;}
    const a=e.target.closest('[data-menu-act]');if(a){const act=a.dataset.menuAct;closeMenus();
      if(act==='open')q('#proInput').click();
      else if(act==='openproject')q('#proProjectInput').click();
      else if(act==='save')saveProjectDialog();
      else if(act==='quicksave')saveProject();
      else if(act==='shortcuts')shortcutHelp();
      else if(act==='about')studioStatus('Image Studio · non-destructive canvas editor · all processing stays in your browser','success');
      else if(act.startsWith('q:'))quickExport(act.slice(2));
      else if(act==='drawer'||act==='props')togglePanel(act);
      else toolbar(act);
    }
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.pro-menu'))closeMenus();});

  q('.pro-contextbar').addEventListener('click',e=>{
    const p=e.target.closest('[data-panel]');if(p){togglePanel(p.dataset.panel);return;}
    const b=e.target.closest('[data-act]');if(b)toolbar(b.dataset.act);
  });
  q('.pro-header').addEventListener('click',e=>{
    const b=e.target.closest('[data-act]');if(!b)return;
    const act=b.dataset.act;
    if(act==='save')saveProject();
    else if(act==='export')directExport('image/png');
    else if(act==='quicksave')saveProject();
    else toolbar(act);
  });
  const railClick=e=>{const b=e.target.closest('[data-cat]');if(!b)return;
    S.drawerOpen=true;root.querySelector('.pro-studio').classList.remove('hide-drawer');savePrefs();
    const grp=q(`[data-group="${b.dataset.cat}"]`);if(grp)grp.scrollIntoView({block:'nearest',behavior:'smooth'});
    root.querySelectorAll('[data-cat]').forEach(x=>x.classList.toggle('active',x.dataset.cat===b.dataset.cat));
  };
  q('#proRail').addEventListener('click',railClick);q('#proMobileNav').addEventListener('click',railClick);

  const theme=q('#proTheme');
  try{const cur=localStorage.getItem('oc-theme');theme.value=cur==='dark'?'dark':cur==='light'?'light':'auto';}catch(e){}
  theme.addEventListener('change',()=>{const v=theme.value;
    if(v==='auto'){try{localStorage.removeItem('oc-theme');}catch(e){}document.documentElement.setAttribute('data-theme',matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}
    else{try{localStorage.setItem('oc-theme',v);}catch(e){}document.documentElement.setAttribute('data-theme',v);}
  });

  const up=q('#proUpload'),inp=q('#proInput');
  up.addEventListener('click',()=>inp.click());
  up.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inp.click();}});
  ['dragenter','dragover'].forEach(ev=>up.addEventListener(ev,e=>{e.preventDefault();up.classList.add('drag');}));
  ['dragleave','drop'].forEach(ev=>up.addEventListener(ev,e=>{e.preventDefault();up.classList.remove('drag');}));
  up.addEventListener('drop',e=>addFiles([...e.dataTransfer.files]));
  inp.addEventListener('change',()=>{addFiles([...inp.files]);inp.value='';});
  q('#proSplit').addEventListener('input',e=>{S.split=+e.target.value;draw();});
  root.addEventListener('click',e=>{const f=e.target.closest('.pro-fab [data-panel]');if(f)togglePanel(f.dataset.panel);});
  q('#proProjectInput').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;
    try{const data=JSON.parse(await f.text());if(!data.images)throw new Error('Not an Image Studio project');
      S.images=[];S.active=0;
      for(const item of data.images){
        const img=new Image();img.src=item.base;await img.decode();
        const cv=mk(img.naturalWidth,img.naturalHeight);cv.getContext('2d').drawImage(img,0,0);
        S.images.push({name:item.name||'image.png',size:0,base:cv,ops:item.ops||[],redo:[],temp:null,current:cv});
      }
      if(S.images.length){q('#proHint').hidden=true;renderGallery();rerender();studioStatus('Project restored','success');}
    }catch(err){studioStatus('Could not open project: '+(err.message||err),'error');}
    e.target.value='';
  });
  q('#proSample').addEventListener('click',async()=>{
    const cv=mk(720,480),c=cv.getContext('2d');
    const g=c.createLinearGradient(0,0,720,480);g.addColorStop(0,'#1e3a8a');g.addColorStop(1,'#e5322d');c.fillStyle=g;c.fillRect(0,0,720,480);
    c.fillStyle='rgba(255,255,255,.9)';c.font='800 76px Inter, Arial';c.textAlign='center';c.fillText('Image Studio',360,250);
    c.font='600 26px Inter, Arial';c.fillText('Sample image — try any tool',360,300);
    const b=await new Promise(r=>cv.toBlob(r,'image/png'));
    addFiles([new File([b],'sample.png',{type:'image/png'})]);
  });
  bindCanvas();
  document.addEventListener('paste',pasteHandler);
  document.addEventListener('keydown',keyHandler);
  window.addEventListener('resize',scheduleDraw);
  selectTool(initialId&&defsFor(initialId)?initialId:'resize');
  updateStatus();
}

function togglePanel(which){
  const el=S.root.querySelector('.pro-studio');
  if(which==='drawer'){
    S.drawerOpen=!S.drawerOpen;el.classList.toggle('hide-drawer',!S.drawerOpen);
    if(S.drawerOpen&&window.innerWidth<768){S.propsOpen=false;el.classList.add('hide-props');}
  }else{
    S.propsOpen=!S.propsOpen;el.classList.toggle('hide-props',!S.propsOpen);
    if(S.propsOpen&&window.innerWidth<768){S.drawerOpen=false;el.classList.add('hide-drawer');}
  }
  savePrefs();scheduleDraw();
}
function quickExport(fmt){
  if(!cur()){studioStatus('Open an image first','error');return;}
  exportDialog(fmt);
}
function directExport(fmt){
  const im=cur();if(!im){studioStatus('Open an image first','error');return;}
  (async()=>{
    try{
      const ext=fmt.split('/')[1].replace('jpeg','jpg');
      const blob=await canvasBlob(im.current,fmt,.92);
      download(blob,(im.name.replace(/\.[^.]+$/,'')||'image')+'.'+ext);
      studioStatus('Downloaded '+ext.toUpperCase(),'success');
    }catch(e){studioStatus((fmt.split('/')[1]||'').toUpperCase()+' not supported here — use WebP or PNG','error');}
  })();
}
function shortcutHelp(){
  const m=document.createElement('div');m.className='pro-modal';
  m.innerHTML=`<div class="pro-modal__box"><button class="pro-modal__x" type="button" aria-label="Close"><i class="fa-solid fa-xmark"></i></button><h2>Keyboard shortcuts</h2>
    <div class="pro-shortcuts">${[['Ctrl / ⌘ + Z','Undo'],['Ctrl / ⌘ + Y','Redo'],['Ctrl / ⌘ + S','Export'],['+ / -','Zoom in / out'],['0','Fit to screen'],['Space + drag','Pan canvas'],['/','Search tools'],['Esc','Close menus / panels']].map(([k,v])=>`<div><kbd>${k}</kbd><span>${v}</span></div>`).join('')}</div></div>`;
  document.body.appendChild(m);
  const close=()=>m.remove();m.querySelector('.pro-modal__x').addEventListener('click',close);m.addEventListener('click',e=>{if(e.target===m)close();});
}
function saveProject(name){
  if(!S.images.length){studioStatus('Open an image first','error');return;}
  const fn=(name||'image-studio-project').trim().replace(/[^a-z0-9._-]+/gi,'-')||'image-studio-project';
  const data=S.images.map(im=>({name:im.name,base:im.base.toDataURL('image/png'),ops:im.ops}));
  download(new Blob([JSON.stringify({app:'Image Studio',version:1,images:data},null,2)],{type:'application/json'}),fn+'.json');
  studioStatus('Project saved as '+fn+'.json','success');
}
function saveProjectDialog(){
  if(!S.images.length){studioStatus('Open an image first','error');return;}
  const m=document.createElement('div');m.className='pro-modal';
  m.innerHTML=`<div class="pro-modal__box"><button class="pro-modal__x" type="button" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
    <h2>Save project</h2><p class="pro-modal__sub">${S.images.length} image(s) · JSON project file</p>
    <label class="pro-field"><span>File name</span><input type="text" id="svName" value="image-studio-project" /></label>
    <div class="pro-modal__actions"><button class="pro-btn" data-close>Cancel</button><button class="pro-btn pro-btn--primary" id="svGo"><i class="fa-solid fa-floppy-disk"></i> Save</button></div></div>`;
  document.body.appendChild(m);
  const close=()=>m.remove();
  m.querySelector('.pro-modal__x').addEventListener('click',close);
  m.querySelector('[data-close]').addEventListener('click',close);
  m.addEventListener('click',e=>{if(e.target===m)close();});
  const go=()=>{saveProject(m.querySelector('#svName').value);const b=m.querySelector('#svGo');if(b){b.innerHTML='<i class="fa-solid fa-check"></i> Saved';b.disabled=true;}setTimeout(close,900);};
  m.querySelector('#svGo').addEventListener('click',go);
  m.querySelector('#svName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();go();}});
  setTimeout(()=>{const i=m.querySelector('#svName');i.focus();i.select();},50);
}
function pasteHandler(e){
  if(!S.root||!document.body.contains(S.root))return;
  const f=[...((e.clipboardData||{}).files||[])].filter(x=>x.type.startsWith('image/'));
  if(f.length){e.preventDefault();addFiles(f);}
}
function keyHandler(e){
  if(!S.root||!document.body.contains(S.root))return;
  if(/input|textarea|select/i.test((e.target.tagName||'')))return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();toolbar(e.shiftKey?'redo':'undo');}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();toolbar('redo');}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();toolbar('export');}
  else if(e.key==='+'||e.key==='='){toolbar('zoomin');}
  else if(e.key==='-'){toolbar('zoomout');}
  else if(e.key==='0'){toolbar('resetzoom');}
  else if(e.key==='/'){e.preventDefault();const s=S.root.querySelector('#proToolSearch');if(s){S.drawerOpen=true;S.root.querySelector('.pro-studio').classList.remove('hide-drawer');s.focus();}}
  else if(e.key==='Escape'){const st=S.root.querySelector('.pro-studio');st.classList.add('hide-props');S.propsOpen=false;}
}

async function addFiles(list){
  const f=(list||[]).filter(x=>x&&(x.type.startsWith('image/')||/\.(svg|heic|tif|tiff|psd)$/i.test(x.name)));
  if(!f.length)return;
  const wasEmpty=S.images.length===0;
  studioStatus('Loading image…','info');
  for(const file of f){
    try{
      if(file.size>50*1024*1024){studioStatus(file.name+' is too large (max 50 MB)','error');continue;}
      let bmp;
      if(window.OCIMG&&window.OCIMG.decodeAny) bmp=await window.OCIMG.decodeAny(file);
      if(!bmp) bmp=await createImageBitmap(file);
      const maxDim=4096;
      let w=bmp.width||1,h=bmp.height||1;
      if(w>maxDim||h>maxDim){const sc=Math.min(maxDim/w,maxDim/h);w=Math.round(w*sc);h=Math.round(h*sc);}
      const cv=mk(w,h);const c=cv.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(bmp,0,0,w,h);
      if(bmp.close)bmp.close();
      S.images.push({name:file.name,size:file.size,base:cv,ops:[],redo:[],temp:null,current:cv});
    }catch(e){ studioStatus('Could not open '+file.name+' — '+(e.message||e),'error'); }
  }
  if(S.images.length){S.active=S.images.length-1;S.root.querySelector('#proHint').hidden=true;renderGallery();rerender();if(wasEmpty)selectTool('resize');studioStatus(S.images.length+' image(s) ready','success');}
}

function renderGallery(){
  const g=S.root.querySelector('#proGallery');if(!g)return;
  g.innerHTML=S.images.map((im,i)=>`<div class="pro-thumb ${i===S.active?'active':''}" data-i="${i}" title="${escS(im.name)}"><canvas data-c="${i}"></canvas><button type="button" class="pro-thumb-x" data-x="${i}" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button></div>`).join('')+
    (S.images.length>1?'<button type="button" class="pro-all" id="proApplyAll"><i class="fa-solid fa-copy"></i> Apply edits to all</button>':'');
  g.querySelectorAll('.pro-thumb').forEach(el=>el.addEventListener('click',()=>{S.active=+el.dataset.i;S.crop=null;renderGallery();rerender();}));
  g.querySelectorAll('.pro-thumb-x').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();S.images.splice(+b.dataset.x,1);S.active=clamp(S.active,0,Math.max(0,S.images.length-1));if(!S.images.length)S.root.querySelector('#proHint').hidden=false;renderGallery();rerender();}));
  const all=g.querySelector('#proApplyAll');if(all)all.addEventListener('click',()=>{
    const ops=JSON.parse(JSON.stringify(cur().ops));S.images.forEach(im=>{im.ops=JSON.parse(JSON.stringify(ops));im.redo=[];});rerender();studioStatus('Edits applied to all '+S.images.length+' images','success');});
  g.querySelectorAll('canvas[data-c]').forEach(cv=>{const im=S.images[+cv.dataset.c];cv.width=96;cv.height=72;const c=cv.getContext('2d');const s=Math.min(96/im.current.width,72/im.current.height);c.drawImage(im.current,(96-im.current.width*s)/2,(72-im.current.height*s)/2,im.current.width*s,im.current.height*s);});
}

function selectTool(id){
  const d=defsFor(id);if(!d)return;
  S.tool=id;S.crop=null;
  S.root.querySelectorAll('.pro-tool').forEach(b=>b.classList.toggle('active',b.dataset.tool===id));
  S.root.querySelector('#proToolName').textContent=d.label;
  const box=S.root.querySelector('#proControls');
  const presets=PRESETS[id]||[];
  box.innerHTML=`<div class="pro-tool-info"><i class="fa-solid ${d.icon}"></i><span>${escS(d.label)}</span></div>`+
    (presets.length?`<div class="pro-presets">${presets.map(([label,val])=>`<button type="button" class="pro-preset" data-preset="${val}">${escS(label)}</button>`).join('')}</div>`:'')+
    d.controls.map(c=>controlHtml(c)).join('')+
    `<div class="pro-tool-actions"><button type="button" class="pro-btn" data-tool-act="reset"><i class="fa-solid fa-rotate-left"></i> Reset tool</button><button type="button" class="pro-btn pro-btn--primary" data-tool-act="apply"><i class="fa-solid fa-check"></i> Apply</button></div>`+
    (id==='bgremove'||id==='upscale'||id==='faceblur'||id==='enhance'?`<p class="pro-note"><i class="fa-solid fa-circle-info"></i> Browser-side heuristic — no cloud AI, no upload.</p>`:'')+
    (id==='colorpick'?`<p class="pro-note">Click anywhere on the image to read its color.</p><div class="pro-color-out" id="proColor">—</div>`:'')+
    (id==='detect'?`<div class="pro-color-out" id="proDetect">—</div>`:'')+
    (id==='base64'?`<button class="pro-btn" data-tool-act="b64">Copy data URL</button>`:'')+
    (id==='svgopt'?`<textarea id="proSvg" rows="7" placeholder="Paste SVG markup..."></textarea><button class="pro-btn" data-tool-act="svg">Optimize</button>`:'')+
    (id==='contact'?`<p class="pro-note">Add multiple images, then export to get a contact sheet ZIP.</p>`:'');
  box.insertAdjacentHTML('beforeend',`<div class="pro-transform"><div class="pro-transform-t">Transform &amp; align</div>
    <div class="pro-transform-grid">
      <button type="button" class="pro-btn pro-btn--mini" data-quick="fit" title="Fit to screen"><i class="fa-solid fa-expand"></i></button>
      <button type="button" class="pro-btn pro-btn--mini" data-quick="actual" title="Actual pixels">1:1</button>
      <button type="button" class="pro-btn pro-btn--mini" data-quick="center" title="Center"><i class="fa-solid fa-compress"></i></button>
      <button type="button" class="pro-btn pro-btn--mini" data-quick="fliph" title="Flip horizontal"><i class="fa-solid fa-arrows-left-right"></i></button>
      <button type="button" class="pro-btn pro-btn--mini" data-quick="flipv" title="Flip vertical"><i class="fa-solid fa-arrows-up-down"></i></button>
      <button type="button" class="pro-btn pro-btn--mini" data-quick="rotl" title="Rotate left"><i class="fa-solid fa-rotate-left"></i></button>
      <button type="button" class="pro-btn pro-btn--mini" data-quick="rotr" title="Rotate right"><i class="fa-solid fa-rotate-right"></i></button>
    </div></div>`);
  box.querySelectorAll('[data-quick]').forEach(b=>b.addEventListener('click',()=>{
    const q=b.dataset.quick;const im=cur();
    if(q==='fit')toolbar('fit');else if(q==='actual')toolbar('actual');else if(q==='center'){S.pan={x:0,y:0};scheduleDraw();}
    else if(im){
      if(q==='fliph')im.ops.push({id:'flip-h',v:{}});
      if(q==='flipv')im.ops.push({id:'flip-v',v:{}});
      if(q==='rotl')im.ops.push({id:'rotate',v:{deg:-90}});
      if(q==='rotr')im.ops.push({id:'rotate',v:{deg:90}});
      rerender();
    }
  }));
  box.querySelectorAll('.pro-preset').forEach(b=>b.addEventListener('click',()=>{
    const [k,v]=b.dataset.preset.split(':');const el=box.querySelector(`[data-k="${k}"]`);if(!el)return;
    el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
    box.querySelectorAll('.pro-preset').forEach(x=>x.classList.toggle('active',x===b));
  }));
  bindControls(box,d);
  updateContextTools();renderLayers();
  scheduleDraw();
}
function controlHtml(c){
  const v=c.def;
  if(c.type==='range')return `<label class="pro-field"><span>${escS(c.label)} <b data-out="${c.k}">${v}</b></span><input type="range" data-k="${c.k}" min="${c.min}" max="${c.max}" step="${c.step||1}" value="${v}"></label>`;
  if(c.type==='number')return `<label class="pro-field"><span>${escS(c.label)}</span><input type="number" data-k="${c.k}" value="${v}"></label>`;
  if(c.type==='select')return `<label class="pro-field"><span>${escS(c.label)}</span><select data-k="${c.k}">${c.opts.map(o=>`<option ${o===v?'selected':''}>${escS(o)}</option>`).join('')}</select></label>`;
  if(c.type==='color')return `<label class="pro-field"><span>${escS(c.label)}</span><input type="color" data-k="${c.k}" value="${escS(v)}"></label>`;
  if(c.type==='checkbox')return `<label class="pro-field pro-check"><input type="checkbox" data-k="${c.k}" ${v?'checked':''}><span>${escS(c.label)}</span></label>`;
  return `<label class="pro-field"><span>${escS(c.label)}</span><input type="text" data-k="${c.k}" value="${escS(v)}"></label>`;
}
function values(box){const o={};box.querySelectorAll('[data-k]').forEach(el=>{o[el.dataset.k]=el.type==='checkbox'?el.checked:el.value;});return o;}
function bindControls(box,d){
  const im=cur();
  const setTemp=()=>{if(!im)return;im.temp={id:d.id,v:values(box)};rerender();};
  box.querySelectorAll('input[type=range]').forEach(el=>{
    const out=box.querySelector(`[data-out="${el.dataset.k}"]`);
    el.addEventListener('input',()=>{if(out)out.textContent=el.value;setTemp();});
    el.addEventListener('change',()=>{if(!im)return;if(im.temp){im.ops.push(im.temp);im.redo=[];im.temp=null;}setDefaultsFrom(im.ops);rerender();renderGallery();});
  });
  box.querySelectorAll('input:not([type=range]):not([type=checkbox]),select').forEach(el=>el.addEventListener('change',setTemp));
  box.querySelectorAll('input[type=checkbox]').forEach(el=>el.addEventListener('change',setTemp));
  box.addEventListener('click',async e=>{
    const b=e.target.closest('[data-tool-act]');if(!b)return;
    const act=b.dataset.toolAct;
    if(act==='reset'){if(im){im.ops=im.ops.filter(o=>o.id!==d.id);im.temp=null;rerender();studioStatus(d.label+' reset','success');}}
    if(act==='apply'){if(im&&im.temp){im.ops.push(im.temp);im.redo=[];im.temp=null;}rerender();renderGallery();studioStatus(d.label+' applied','success');}
    if(act==='b64'){try{await navigator.clipboard.writeText(im.current.toDataURL('image/png'));toastInline('Data URL copied');}catch(e){toastInline('Copy failed');}}
    if(act==='svg'){const s=box.querySelector('#proSvg').value;const out=s.replace(/>\s+</g,'><').replace(/\s{2,}/g,' ').trim();box.querySelector('#proSvg').value=out;toastInline('SVG minimized '+(s.length-out.length)+' chars');}
  });
  box.addEventListener('click',async e=>{
    if(!im||!S.view)return;
    if(d.id==='colorpick'){const r=S.canvas.getBoundingClientRect();const x=(e.clientX-r.left-S.view.ox)/S.view.scale,y=(e.clientY-r.top-S.view.oy)/S.view.scale;
      if(x<0||y<0||x>=im.current.width||y>=im.current.height)return;
      const px=im.current.getContext('2d').getImageData(x|0,y|0,1,1).data;
      const hex='#'+[px[0],px[1],px[2]].map(n=>n.toString(16).padStart(2,'0')).join('');
      const out=box.querySelector('#proColor');if(out)out.textContent=hex+'  rgb('+px[0]+','+px[1]+','+px[2]+')';
      try{await navigator.clipboard.writeText(hex);}catch(_){}
    }
  });
  if(d.id==='detect'&&im){const out=box.querySelector('#proDetect');if(out)out.textContent=(im.name.split('.').pop()||'?').toUpperCase()+' · '+im.current.width+'×'+im.current.height+' · '+fmtBytes(im.size);}
  // crop geometry from current image
  if(d.id==='crop'){S.crop={x:0,y:0,w:im?im.current.width:100,h:im?im.current.height:100};const syncCropInputs=()=>{['x','y','w','h'].forEach(k=>{const i=box.querySelector(`[data-k=${k}]`);if(i)i.value=Math.round(S.crop[k]);});};syncCropInputs();
    box.querySelectorAll('[data-k]').forEach(el=>el.addEventListener('change',()=>{
    if(!S.crop)return;['x','y','w','h'].forEach(k=>{const i=box.querySelector(`[data-k=${k}]`);if(i)S.crop[k]=+i.value||0;});
    const ratio=box.querySelector('[data-k=ratio]')&&box.querySelector('[data-k=ratio]').value;
    if(ratio&&ratio!=='free'&&im){
      const [a,b]=ratio.split(':').map(Number);if(a&&b){const nh=Math.round(S.crop.w*b/a);if(nh>=1&&nh<=im.current.height-S.crop.y)S.crop.h=nh;}
    }
    syncCropInputs();draw();}));studioStatus('Drag on the canvas to adjust the crop — handles resize, drag moves');}
  if(d.id==='resize'&&im){box.querySelector('[data-k=w]').value=im.current.width;box.querySelector('[data-k=h]').value=im.current.height;
    box.querySelector('[data-k=w]').addEventListener('input',()=>{if(box.querySelector('[data-k=lock]').checked&&im){const r=im.current.height/im.current.width;box.querySelector('[data-k=h]').value=Math.round(+box.querySelector('[data-k=w]').value*r);}});
  }
}
function setDefaultsFrom(ops){/* ranges keep their own values; no-op placeholder */}

/* ---------------- canvas interaction ---------------- */
function bindCanvas(){
  const cv=S.canvas;let drag=null;
  const pointers=new Map();let pinch=null;
  cv.addEventListener('wheel',e=>{
    e.preventDefault();
    const r=cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
    const before=S.view?{ox:S.view.ox,oy:S.view.oy,s:S.view.scale}:null;
    S.zoom=clamp(S.zoom*(e.deltaY<0?1.12:1/1.12),.1,8);
    if(before){const k=S.zoom/(before.s/(S.fit||1));S.pan.x+=(px-before.ox)*(1-k);S.pan.y+=(py-before.oy)*(1-k);}
    updateStatus();scheduleDraw();
  },{passive:false});
  cv.addEventListener('pointerdown',e=>{
    pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){
      const [a,b]=[...pointers.values()];
      pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:S.zoom,cx:(a.x+b.x)/2,cy:(a.y+b.y)/2};drag=null;return;
    }
    if(S.compare||S.spaceDown){
      const r=cv.getBoundingClientRect();
      if(S.compare)S.split=clamp((e.clientX-r.left)/cv.clientWidth*100,0,100);
      S.root.querySelector('#proSplit').value=S.split;
      drag={mode:S.compare?'compare':'pan',x:e.clientX,y:e.clientY,p:{...S.pan}};cv.setPointerCapture(e.pointerId);return;
    }
    if(S.tool==='crop'&&S.crop&&S.view){
      const r=cv.getBoundingClientRect(),x=(e.clientX-r.left-S.view.ox)/S.view.scale,y=(e.clientY-r.top-S.view.oy)/S.view.scale,c=S.crop;
      const corners=[[c.x,c.y,'nw'],[c.x+c.w,c.y,'ne'],[c.x,c.y+c.h,'sw'],[c.x+c.w,c.y+c.h,'se']];
      let mode='move';for(const [cx,cy,m] of corners)if(Math.hypot(cx-x,cy-y)<18/S.view.scale){mode=m;break;}
      drag={mode,x,y,c:{...c}};cv.setPointerCapture(e.pointerId);return;
    }
    drag={mode:'pan',x:e.clientX,y:e.clientY,p:{...S.pan}};cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove',e=>{
    if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pointers.size>=2){
      const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);
      S.zoom=clamp(pinch.z*(d/pinch.d),.1,8);updateStatus();scheduleDraw();return;
    }
    if(!drag)return;
    if(drag.mode==='compare'){S.split=clamp((e.clientX-cv.getBoundingClientRect().left)/cv.clientWidth*100,0,100);S.root.querySelector('#proSplit').value=S.split;scheduleDraw();return;}
    if(drag.mode==='pan'){S.pan.x=drag.p.x+(e.clientX-drag.x);S.pan.y=drag.p.y+(e.clientY-drag.y);scheduleDraw();return;}
    if(S.tool==='crop'&&S.crop&&S.view){
      const dx=(e.clientX-drag.x)/S.view.scale,dy=(e.clientY-drag.y)/S.view.scale,c=drag.c,n={...c};
      if(drag.mode==='move'){n.x=c.x+dx;n.y=c.y+dy;}
      else{if(drag.mode.includes('e'))n.w=c.w+dx;if(drag.mode.includes('s'))n.h=c.h+dy;if(drag.mode.includes('w')){n.x=c.x+dx;n.w=c.w-dx;}if(drag.mode.includes('n')){n.y=c.y+dy;n.h=c.h-dy;}}
      const im=cur();if(im){n.x=clamp(n.x,0,im.current.width-1);n.y=clamp(n.y,0,im.current.height-1);n.w=clamp(n.w,1,im.current.width-n.x);n.h=clamp(n.h,1,im.current.height-n.y);}
      S.crop=n;scheduleDraw();
      const _box=S.root.querySelector('#proControls');if(_box){['x','y','w','h'].forEach(k=>{const i=_box.querySelector(`[data-k=${k}]`);if(i)i.value=Math.round(n[k]);});}
    }
  });
  const end=e=>{
    pointers.delete(e.pointerId);
    if(pointers.size<2)pinch=null;
    if(drag&&S.crop){const box=S.root.querySelector('#proControls');['x','y','w','h'].forEach(k=>{const i=box.querySelector(`[data-k=${k}]`);if(i)i.value=Math.round(S.crop[k]);});}
    drag=null;
  };
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  document.addEventListener('keydown',e=>{if(e.code==='Space'&&!/input|textarea/i.test(e.target.tagName||'')){S.spaceDown=true;cv.classList.add('panning');e.preventDefault();}});
  document.addEventListener('keyup',e=>{if(e.code==='Space'){S.spaceDown=false;cv.classList.remove('panning');}});
}
/* ---------------- toolbar / export ---------------- */
function updateContextTools(){
  const d=defsFor(S.tool),box=S.root&&S.root.querySelector('#proContextTools');
  if(box&&d)box.innerHTML=`<span class="pro-ctx-name"><i class="fa-solid ${d.icon}"></i> ${escS(d.label)}</span><button type="button" class="pro-btn pro-hide-sm" data-act="resettool" title="Reset this tool"><i class="fa-solid fa-rotate-left"></i></button>`;
}
function renderLayers(){
  const im=cur(),box=S.root&&S.root.querySelector('#proLayerList');if(!box||!im)return;
  S.root.querySelector('#proLayerCount').textContent=im.ops.length;
  box.innerHTML=im.ops.length?im.ops.map((op,i)=>{
    const d=defsFor(op.id);
    return `<div class="pro-layer ${op.hidden?'hidden':''}" data-i="${i}">
      <button type="button" class="pro-layer-eye" data-lay="eye" title="Show / hide"><i class="fa-solid ${op.hidden?'fa-eye-slash':'fa-eye'}"></i></button>
      <i class="fa-solid ${d?d.icon:'fa-circle'}"></i><span class="pro-layer-name">${escS(d?d.label:op.id)}</span>
      <button type="button" data-lay="up" title="Move up"><i class="fa-solid fa-chevron-up"></i></button>
      <button type="button" data-lay="down" title="Move down"><i class="fa-solid fa-chevron-down"></i></button>
      <button type="button" data-lay="dup" title="Duplicate"><i class="fa-solid fa-copy"></i></button>
      <button type="button" data-lay="del" title="Delete"><i class="fa-solid fa-trash"></i></button>
    </div>`;}).join(''):'<div class="pro-empty">No edits yet — choose a tool</div>';
  box.querySelectorAll('.pro-layer').forEach(el=>el.addEventListener('click',e=>{
    const a=e.target.closest('[data-lay]');if(!a)return;
    const i=+el.dataset.i,op=im.ops[i];if(!op)return;
    const act=a.dataset.lay;
    if(act==='eye')op.hidden=!op.hidden;
    else if(act==='del')im.ops.splice(i,1);
    else if(act==='up'&&i<im.ops.length-1){[im.ops[i],im.ops[i+1]]=[im.ops[i+1],im.ops[i]];}
    else if(act==='down'&&i>0){[im.ops[i],im.ops[i-1]]=[im.ops[i-1],im.ops[i]];}
    else if(act==='dup')im.ops.splice(i+1,0,JSON.parse(JSON.stringify(op)));
    im.redo=[];rerender();renderGallery();renderLayers();
  }));
}
function toolbar(act){
  const im=cur(),root=S.root;
  if(act==='zoomin')S.zoom=clamp(S.zoom*1.25,.1,8);
  else if(act==='zoomout')S.zoom=clamp(S.zoom/1.25,.1,8);
  else if(act==='fit'||act==='resetzoom'){S.zoom=1;S.pan={x:0,y:0};}
  else if(act==='actual'){S.zoom=clamp(1/(S.fit||1),.1,8);S.pan={x:0,y:0};}
  else if(act==='compare'){S.compare=!S.compare;root.querySelector('#proSplit').hidden=!S.compare;root.querySelector('[data-act=compare]').classList.toggle('active',S.compare);}
  else if(act==='grid'){S.grid=!S.grid;root.querySelector('.pro-studio').classList.toggle('show-grid',S.grid);root.querySelector('[data-act=grid]').classList.toggle('active',S.grid);savePrefs();}
  else if(act==='guides'){S.guides=!S.guides;root.querySelector('.pro-studio').classList.toggle('show-guides',S.guides);root.querySelector('[data-act=guides]').classList.toggle('active',S.guides);savePrefs();}
  else if(act==='fullscreen'){const el=root.querySelector('.pro-studio');if(document.fullscreenElement)document.exitFullscreen();else if(el.requestFullscreen)el.requestFullscreen();}
  else if(act==='undo'){if(im&&im.ops.length){im.redo.push(im.ops.pop());im.temp=null;rerender();renderGallery();renderLayers();}}
  else if(act==='redo'){if(im&&im.redo.length){im.ops.push(im.redo.pop());im.temp=null;rerender();renderGallery();renderLayers();}}
  else if(act==='resettool'){if(im){im.ops=im.ops.filter(o=>o.id!==S.tool);im.temp=null;rerender();renderGallery();renderLayers();studioStatus(S.tool+' reset','success');}}
  else if(act==='reset'){if(im){im.ops=[];im.redo=[];im.temp=null;S.zoom=1;S.pan={x:0,y:0};rerender();renderGallery();renderLayers();studioStatus('All edits reset','success');}}
  else if(act==='export'){exportDialog();return;}
  updateStatus();scheduleDraw();
}
function studioStatus(msg,kind){const el=S.statusEl;if(el){el.textContent=msg;el.className='pro-status-msg '+(kind||'');}}
function toastInline(msg){studioStatus(msg,'success');}

function exportDialog(initialFmt){
  const im=cur();if(!im){studioStatus('Open an image first','error');return;}
  const ops=im.ops.concat(im.temp?[im.temp]:[]);
  const fmtOp=ops.filter(o=>o.id==='format').pop(),cmpOp=ops.filter(o=>o.id==='compress').pop();
  const fmt=(initialFmt)||(cmpOp&&cmpOp.v.fmt)||(fmtOp&&fmtOp.v.fmt)||'image/png';
  const q=((cmpOp||fmtOp)&&+((cmpOp||fmtOp).v.q)/100)||.9;
  const modal=document.createElement('div');modal.className='pro-modal';
  modal.innerHTML=`<div class="pro-modal__box"><button class="pro-modal__x" type="button" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
    <h2>Export</h2><p class="pro-modal__sub">${S.images.length} image(s) · processed locally</p>
    <label class="pro-field"><span>Format</span><select id="exFmt">${['image/png','image/jpeg','image/webp','image/gif','image/bmp'].map(f=>`<option ${f===fmt?'selected':''}>${f}</option>`).join('')}</select></label>
    <label class="pro-field"><span>Quality <b id="exQv">${Math.round(q*100)}</b>%</span><input type="range" id="exQ" min="10" max="100" value="${Math.round(q*100)}"></label>
    <label class="pro-field pro-check"><input type="checkbox" id="exAll" ${S.images.length>1?'checked':''}><span>Export all images (ZIP)</span></label>
    <label class="pro-field pro-check"><input type="checkbox" id="exStrip" ${(cmpOp&&cmpOp.v.strip)?'checked':''}><span>Strip metadata</span></label>
    <div class="pro-modal__actions"><button class="pro-btn" data-close>Cancel</button><button class="pro-btn pro-btn--primary" id="exGo"><i class="fa-solid fa-download"></i> Download</button></div></div>`;
  document.body.appendChild(modal);
  const close=()=>modal.remove();
  modal.querySelector('.pro-modal__x').addEventListener('click',close);
  modal.querySelector('[data-close]').addEventListener('click',close);
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  modal.querySelector('#exQ').addEventListener('input',e=>modal.querySelector('#exQv').textContent=e.target.value);
  modal.querySelector('#exGo').addEventListener('click',async()=>{
    const f=modal.querySelector('#exFmt').value,quality=+modal.querySelector('#exQ').value/100,all=modal.querySelector('#exAll').checked;
    try{
      if(all&&S.images.length>1&&window.JSZip){
        const zip=new JSZip();const names=new Set();
        for(const x of S.images){let name=x.name.replace(/\.[^.]+$/,'')+'.'+f.split('/')[1].replace('jpeg','jpg');while(names.has(name))name='copy-'+name;names.add(name);
          zip.file(name,await canvasBlob(x.current,f,quality));}
        const blob=await zip.generateAsync({type:'blob'});download(blob,'image-studio.zip');
      }else{
        const b=await canvasBlob(im.current,f,quality);download(b,(im.name.replace(/\.[^.]+$/,'')||'image')+'.'+f.split('/')[1].replace('jpeg','jpg'));
      }
      const btn=modal.querySelector('#exGo');if(btn){btn.innerHTML='<i class="fa-solid fa-check"></i> Downloaded';btn.disabled=true;}
      studioStatus('Export ready','success');
      setTimeout(close,900);
    }catch(e){studioStatus('Export failed: '+(e.message||e),'error');}
  });
}
function canvasBlob(cv,type,q){
  if(type==='image/bmp')return Promise.resolve(encodeBMP(cv));
  if(type==='image/gif')return encodeGIF(cv);
  return new Promise((res,rej)=>cv.toBlob(b=>{
    if(!b)return rej(new Error('Unsupported format'));
    if(b.type&&b.type!==type)return rej(new Error(type.split('/')[1].toUpperCase()+' export is not supported by this browser'));
    res(b);
  },type,q));
}
function encodeBMP(cv){
  const w=cv.width,h=cv.height;
  const data=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;
  const rowSize=Math.floor((24*w+31)/32)*4;
  const size=54+rowSize*h;
  const buf=new ArrayBuffer(size),view=new DataView(buf),bytes=new Uint8Array(buf);
  bytes[0]=0x42;bytes[1]=0x4d;
  view.setUint32(2,size,true);view.setUint32(10,54,true);
  view.setUint32(14,40,true);view.setInt32(18,w,true);view.setInt32(22,-h,true);
  view.setUint16(26,1,true);view.setUint16(28,24,true);view.setUint32(34,rowSize*h,true);
  for(let y=0;y<h;y++){
    let o=54+y*rowSize;
    for(let x=0;x<w;x++){
      const i=(y*w+x)*4;
      bytes[o++]=data[i+2];bytes[o++]=data[i+1];bytes[o++]=data[i];
    }
  }
  return new Blob([buf],{type:'image/bmp'});
}
let gifencPromise=null;
function encodeGIF(cv){
  if(!gifencPromise)gifencPromise=import('https://cdn.jsdelivr.net/npm/gifenc@1.0.3/dist/gifenc.esm.js');
  return gifencPromise.then(g=>{
    const {width:w,height:h}=cv;
    const rgba=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,w,h).data;
    const pal=g.quantize(rgba,256,'rgb565');
    const enc=g.GIFEncoder();
    enc.writeFrame(g.applyPalette(rgba,pal),w,h,{palette:pal,delay:100});
    enc.finish();
    return new Blob([enc.bytes()],{type:'image/gif'});
  }).catch(e=>{gifencPromise=null;throw new Error('GIF encoder could not load. Check your connection.');});
}
function download(blob,name){
  const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000);
}
function updateStatus(){
  const im=cur(),q=s=>S.root.querySelector(s);
  const dims=q('#proDims'),fmt=q('#proFmt'),size=q('#proSize'),z=q('#proZoom'),zs=q('#proZoomStatus');
  if(dims)dims.textContent=im?im.current.width+' × '+im.current.height+' px':'—';
  if(fmt)fmt.textContent=im?(im.name.split('.').pop()||'image').toUpperCase():'—';
  if(size)size.textContent=im?fmtBytes(im.size):'—';
  if(z)z.textContent=Math.round(S.zoom*100)+'%';
  if(zs)zs.textContent=Math.round(S.zoom*100)+'%';
  const u=S.root.querySelector('[data-act=undo]'),r=S.root.querySelector('[data-act=redo]');
  if(u)u.disabled=!(im&&im.ops.length);
  if(r)r.disabled=!(im&&im.redo.length);
}

window.OCSTUDIO={render:render,tools:T.map(t=>t.id)};
})();
