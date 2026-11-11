(function(){
var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var root=document.documentElement;
function mk(t,c,h){var n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n}

/* in-view observer shared by headline + footer reveals */
var io=null;
if('IntersectionObserver' in window){
 io=new IntersectionObserver(function(es){
  es.forEach(function(e){
   if(e.isIntersecting){
    e.target.classList.add('in');
    io.unobserve(e.target);
   }
  });
 },{threshold:0.18,rootMargin:'0px 0px -6% 0px'});
}

/* word-by-word headline reveal */
function split(h){
 var i=0;
 h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());
 (function walk(n){
  [].slice.call(n.childNodes).forEach(function(c){
   if(c.nodeType===3){
    var f=document.createDocumentFragment();
    c.textContent.split(/(\s+)/).forEach(function(t){
     if(!t)return;
     if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(' '));return}
     var w=mk('span','w'),x=mk('span','wi');
     w.setAttribute('aria-hidden','true');
     x.textContent=t;
     x.style.transitionDelay=(i++*45)+'ms';
     w.appendChild(x);
     f.appendChild(w);
    });
    c.parentNode.replaceChild(f,c);
   }else if(c.nodeType===1&&c.nodeName!=='BR'){
    walk(c);
   }
  });
 })(h);
}

if(io){
 $$('main h2').forEach(function(h){split(h);io.observe(h)});
 root.classList.add('fx');
}

/* hero: volumetric atmospheric light beam (from reference video 00:03-00:07) */
var hero=$('#hero');
if(hero&&!$('.hero-beam',hero)){
 hero.insertBefore(mk('div','hero-beam',''),hero.firstChild);
 hero.appendChild(mk('div','scue','<i></i>Scroll'));
}

/* hero: animated circuit traces & neural pulse nodes (from reference video 00:03-00:07) */
var art2=$('.heroart');
if(hero&&art2&&!RM){
 if(!$('#hero-circuit',art2)){
  var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.id='hero-circuit';
  svg.setAttribute('viewBox','0 0 1200 600');
  svg.setAttribute('aria-hidden','true');
  svg.innerHTML='<defs>' +
   '<linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
   '<stop offset="0%" stop-color="var(--g)" stop-opacity="0.75"/>' +
   '<stop offset="100%" stop-color="var(--g2)" stop-opacity="0.12"/>' +
   '</linearGradient>' +
   '</defs>' +
   '<g fill="none" stroke="url(#circGrad)" stroke-width="1.5" stroke-linecap="round">' +
   '<path class="c-line l1" d="M 600 300 H 450 V 220 H 280 V 160 H 120"/>' +
   '<path class="c-line l2" d="M 600 300 H 750 V 240 H 920 V 180 H 1080"/>' +
   '<path class="c-line l3" d="M 600 300 V 420 H 420 V 480 H 220"/>' +
   '<path class="c-line l4" d="M 600 300 V 400 H 780 V 470 H 980"/>' +
   '<path class="c-line l5" d="M 450 220 V 120 H 350"/>' +
   '<path class="c-line l6" d="M 750 240 V 140 H 850"/>' +
   '</g>' +
   '<g fill="var(--g)">' +
   '<circle cx="600" cy="300" r="4.5" class="c-node"/>' +
   '<circle cx="280" cy="160" r="3.2" class="c-node"/>' +
   '<circle cx="920" cy="180" r="3.2" class="c-node"/>' +
   '<circle cx="420" cy="480" r="3" class="c-node"/>' +
   '<circle cx="780" cy="470" r="3" class="c-node"/>' +
   '</g>';
  art2.appendChild(svg);
 }
 if(!$('.aur',art2))art2.appendChild(mk('div','aur',''));
 if(!$('.ffs',art2)){
  var ff=mk('div','ffs',''),N=innerWidth<820?14:32,h='';
  for(var q=0;q<N;q++){
   var sz=(2+Math.random()*3.5).toFixed(1);
   h+='<i style="--x:'+(Math.random()*100).toFixed(1)+'%;--y:'+(8+Math.random()*88).toFixed(1)+'%;--s:'+sz+'px;--dx:'+(Math.round(Math.random()*90-45))+'px;--dy:'+(Math.round(Math.random()*-110))+'px;--d:'+(6+Math.random()*8).toFixed(1)+'s;--t:'+(3+Math.random()*5).toFixed(1)+'s;--dl:-'+(Math.random()*8).toFixed(1)+'s"></i>';
  }
  ff.innerHTML=h;
  art2.appendChild(ff);
 }
 if(fine){
  hero.addEventListener('mousemove',function(e){
   var r=hero.getBoundingClientRect();
   art2.style.setProperty('--px',((e.clientX-r.left)/r.width-.5)*-26+'px');
   art2.style.setProperty('--py',((e.clientY-r.top)/r.height-.5)*-16+'px');
  });
  hero.addEventListener('mouseleave',function(){
   art2.style.setProperty('--px','0px');
   art2.style.setProperty('--py','0px');
  });
 }

 /* 3D Wireframe Polyhedron & Gyroscope Rings (NO GLOW, NO SHADOWS) */
 var cv3d=$('#hero-canvas-3d');
 if(!cv3d){
  cv3d=mk('canvas','hero-3d-canvas');
  cv3d.id='hero-canvas-3d';
  art2.appendChild(cv3d);
 }
 var cx3=cv3d.getContext('2d');
 function resize3D(){
  var dpr=Math.min(window.devicePixelRatio||1,2);
  var rect=cv3d.getBoundingClientRect();
  var w=rect.width||520,h=rect.height||520;
  cv3d.width=w*dpr;
  cv3d.height=h*dpr;
  cx3.setTransform(1,0,0,1,0,0);
  cx3.scale(dpr,dpr);
 }
 resize3D();
 window.addEventListener('resize',resize3D);

 var R=105;
 var octVertices=[
  [0,-R*1.32,0],[0,R*1.32,0],[R,0,0],[0,0,R],[-R,0,0],[0,0,-R]
 ];
 var octEdges=[
  [0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,4],[1,5],[2,3],[3,4],[4,5],[5,2]
 ];
 var cR=R*0.42;
 var cubeVertices=[
  [-cR,-cR,-cR],[cR,-cR,-cR],[cR,cR,-cR],[-cR,cR,-cR],
  [-cR,-cR,cR],[cR,-cR,cR],[cR,cR,cR],[-cR,cR,cR]
 ];
 var cubeEdges=[
  [0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]
 ];
 var rotX=0.35,rotY=0.5,rotZ=0;
 var targetRotX=0.35,targetRotY=0.5,autoAngle=0;

 if(fine){
  hero.addEventListener('mousemove',function(e){
   var r=hero.getBoundingClientRect();
   targetRotY=((e.clientX-r.left)/r.width-0.5)*1.5;
   targetRotX=((e.clientY-r.top)/r.height-0.5)*-1.2;
  });
  hero.addEventListener('mouseleave',function(){targetRotX=0.35;targetRotY=0.5});
 }

 function rotate3D(v,rx,ry,rz){
  var y1=v[1]*Math.cos(rx)-v[2]*Math.sin(rx);
  var z1=v[1]*Math.sin(rx)+v[2]*Math.cos(rx);
  var x2=v[0]*Math.cos(ry)+z1*Math.sin(ry);
  var z2=-v[0]*Math.sin(ry)+z1*Math.cos(ry);
  var x3=x2*Math.cos(rz)-y1*Math.sin(rz);
  var y3=x2*Math.sin(rz)+y1*Math.cos(rz);
  return [x3,y3,z2];
 }

 function project(x,y,z,cw,ch,fl){
  var sz=fl/(fl+z);
  return {x:cw+x*sz,y:ch+y*sz,scale:sz};
 }

 (function draw3D(){
  if(!RM&&cv3d.width>0){
   var dpr=Math.min(window.devicePixelRatio||1,2);
   var w=cv3d.width/dpr,h=cv3d.height/dpr;
   cx3.clearRect(0,0,w,h);
   cx3.shadowBlur=0;
   cx3.shadowColor='transparent';
   var isLight=root.getAttribute('data-theme')==='light';
   autoAngle+=0.0075;
   rotX+=(targetRotX+Math.sin(autoAngle*0.7)*0.14-rotX)*0.06;
   rotY+=(targetRotY+autoAngle-rotY)*0.06;
   rotZ=Math.cos(autoAngle*0.5)*0.1;
   var cw=w/2,ch=h/2,fl=460;

   var projOct=octVertices.map(function(v){
    var r=rotate3D(v,rotX,rotY,rotZ);
    return project(r[0],r[1],r[2],cw,ch,fl);
   });
   var projCube=cubeVertices.map(function(v){
    var r=rotate3D(v,rotX*1.2,rotY*1.2,rotZ);
    return project(r[0],r[1],r[2],cw,ch,fl);
   });

   // Inner cube edges (gold/silver accent)
   cx3.beginPath();
   cx3.strokeStyle=isLight?'rgba(75,82,96,0.45)':'rgba(229,201,141,0.5)';
   cx3.lineWidth=1;
   cubeEdges.forEach(function(e){
    var p1=projCube[e[0]],p2=projCube[e[1]];
    cx3.moveTo(p1.x,p1.y);cx3.lineTo(p2.x,p2.y);
   });
   cx3.stroke();

   // Octahedron edges (liquid silver)
   cx3.beginPath();
   cx3.strokeStyle=isLight?'rgba(36,40,50,0.72)':'rgba(209,214,222,0.75)';
   cx3.lineWidth=1.35;
   octEdges.forEach(function(e){
    var p1=projOct[e[0]],p2=projOct[e[1]];
    cx3.moveTo(p1.x,p1.y);cx3.lineTo(p2.x,p2.y);
   });
   cx3.stroke();

   // Vertices
   cx3.fillStyle=isLight?'#0a0c10':'#ffffff';
   projOct.forEach(function(p){
    cx3.beginPath();
    cx3.arc(p.x,p.y,2.6*p.scale,0,6.283);
    cx3.fill();
   });

   // 3D Orbital Gyroscope Rings
   var ringR=R*1.6;
   [
    {tx:rotX+0.78,ty:rotY*0.8,c:isLight?'rgba(36,40,50,0.25)':'rgba(209,214,222,0.3)'},
    {tx:rotX-0.78,ty:-rotY*0.8,c:isLight?'rgba(229,150,50,0.3)':'rgba(229,201,141,0.32)'}
   ].forEach(function(ring,idx){
    cx3.beginPath();
    cx3.strokeStyle=ring.c;
    cx3.lineWidth=1;
    var steps=40;
    for(var k=0;k<=steps;k++){
     var th=(k/steps)*Math.PI*2;
     var rx=Math.cos(th)*ringR,ry=0,rz=Math.sin(th)*ringR;
     var rot=rotate3D([rx,ry,rz],ring.tx,ring.ty,0);
     var pr=project(rot[0],rot[1],rot[2],cw,ch,fl);
     if(k===0)cx3.moveTo(pr.x,pr.y);else cx3.lineTo(pr.x,pr.y);
    }
    cx3.stroke();

    var satTh=(autoAngle*(idx===0?1.6:-1.7))%(Math.PI*2);
    var sx=Math.cos(satTh)*ringR,sz=Math.sin(satTh)*ringR;
    var sRot=rotate3D([sx,0,sz],ring.tx,ring.ty,0);
    var spr=project(sRot[0],sRot[1],sRot[2],cw,ch,fl);
    cx3.beginPath();
    cx3.fillStyle=isLight?'#0a0c10':'#ffffff';
    cx3.arc(spr.x,spr.y,2.8*spr.scale,0,6.283);
    cx3.fill();
   });
  }
  requestAnimationFrame(draw3D);
 })();
}

/* hero: lens that reveals the full-colour artwork under the cursor */
var art=$('.heroart');
if(hero&&art&&fine&&!RM){
 if(!$('.lens',art)){
  var ring=mk('div','lens','<span>DATA LAYER • PULSE V3.14</span>');
  art.appendChild(ring);
  hero.appendChild(mk('div','hint','Move the lens over the artwork to inspect'));
  var tx=0,ty=0,cx=0,cy=0,hv=true,ro=ring.firstChild;
  hero.addEventListener('mousemove',function(e){
   var r=art.getBoundingClientRect();
   tx=e.clientX-r.left;ty=e.clientY-r.top;
   art.style.setProperty('--lo',1);
   var relY=ty/r.height,relX=tx/r.width;
   if(relY<0.35){
    ro.textContent='DATA LAYER • TECH PULSE';
   }else if(relX>0.55){
    ro.textContent='TELEMETRY • 120K REQ/S ACTIVE';
   }else{
    ro.textContent='ACADEMY RADAR • 2,500+ COHORTS';
   }
  });
  hero.addEventListener('mouseleave',function(){art.style.setProperty('--lo',0)});
  if(io){new IntersectionObserver(function(es){hv=es[0].isIntersecting}).observe(hero)}
  (function f(){
   if(hv){
    cx+=(tx-cx)*.14;cy+=(ty-cy)*.14;
    art.style.setProperty('--lx',cx.toFixed(1)+'px');
    art.style.setProperty('--ly',cy.toFixed(1)+'px');
   }
   requestAnimationFrame(f);
  })();
 }
}

/* marquee: add an outlined reverse row with edge gradient masks (from reference video 00:08, 00:23) */
var mq=$('.mq');
if(mq&&!$('.mq.r2')){
 var c=mq.cloneNode(true);
 c.classList.add('r2');
 mq.parentNode.insertBefore(c,mq.nextSibling);
}

/* nav stays absolute at top and never hides */
var nav=$('nav.glass');
if(nav){nav.classList.remove('hide')}

/* dynamic bento spotlight border shader & 3D perspective tilt (from reference video 00:05, 00:13, 00:16, 00:32, 00:40) */
if(fine&&!RM){
 function initSpotlightCards(){
  var spotCards=$$('.card, .step, .stats .glass, .cp-card, .jb, .stage, .project-card');
  spotCards.forEach(function(card){
   if(card.dataset.spotInit)return;
   card.dataset.spotInit='1';
   card.addEventListener('mousemove',function(e){
    var r=card.getBoundingClientRect();
    var x=e.clientX-r.left;
    var y=e.clientY-r.top;
    card.style.setProperty('--mx',x.toFixed(1)+'px');
    card.style.setProperty('--my',y.toFixed(1)+'px');
    var tiltX=((x/r.width)-0.5)*9;
    var tiltY=((y/r.height)-0.5)*-9;
    card.style.setProperty('--tilt-x',tiltX.toFixed(2)+'deg');
    card.style.setProperty('--tilt-y',tiltY.toFixed(2)+'deg');
   });
   card.addEventListener('mouseleave',function(){
    card.style.setProperty('--tilt-x','0deg');
    card.style.setProperty('--tilt-y','0deg');
   });
  });
 }
 initSpotlightCards();
 if('MutationObserver' in window){
  new MutationObserver(function(){initSpotlightCards()}).observe(document.body,{childList:true,subtree:true});
 }
}

/* interactive portfolio category filters (All / Tech / Media / Academy) */
var pFilters=$$('.p-filter');
var pCards=$$('.project-card');
if(pFilters.length&&pCards.length){
 pFilters.forEach(function(btn){
  btn.addEventListener('click',function(){
   var cat=btn.dataset.filter;
   pFilters.forEach(function(b){b.classList.remove('active');b.setAttribute('aria-selected','false')});
   btn.classList.add('active');
   btn.setAttribute('aria-selected','true');
   pCards.forEach(function(card){
    var cardCat=card.dataset.category;
    var match=cat==='all'||cardCat===cat;
    if(match){
     card.style.display='';
     if(!RM){
      card.animate([
       {opacity:0,transform:'scale(0.96) translateY(12px)'},
       {opacity:1,transform:'scale(1) translateY(0)'}
      ],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'});
     }
    }else{
     card.style.display='none';
    }
   });
   if(window.ScrollTrigger)ScrollTrigger.refresh();
  });
 });
}

/* tactile magnetic buttons across all interactive buttons (from reference video 00:04, 00:32, 00:37) */
if(fine&&!RM){
 function initMagBtns(){
  var btns=$$('.btn, .tbtn, .burger, .mag');
  btns.forEach(function(b){
   if(b.dataset.magInit)return;
   b.dataset.magInit='1';
   b.addEventListener('mousemove',function(e){
    var r=b.getBoundingClientRect();
    var mx=((e.clientX-r.left)-r.width/2)*0.26;
    var my=((e.clientY-r.top)-r.height/2)*0.26;
    b.style.transform='translate('+mx.toFixed(1)+'px,'+my.toFixed(1)+'px)';
   });
   b.addEventListener('mouseleave',function(){
    b.style.transform='';
   });
  });
 }
 initMagBtns();
 if('MutationObserver' in window){
  new MutationObserver(function(){initMagBtns()}).observe(document.body,{childList:true,subtree:true});
 }
}

/* divisions: horizontal progress line */
var hs=$('#hs'),tr=$('#track'),intro=$('#hs .intro');
if(hs&&tr){
 var hp=mk('div','hprog','<i></i>'),bar=hp.firstChild;
 hs.appendChild(hp);
 (function f(){
  if(innerWidth>820){
   var m=getComputedStyle(tr).transform;
   if(m&&m!=='none'){
    var p=m.split(','),tx=+(m.indexOf('matrix3d')===0?p[12]:p[4]);
    var introW = intro ? intro.offsetWidth : 0;
    var max = Math.max(1, tr.scrollWidth - (innerWidth - introW) + 100);
    bar.style.transform='scaleX('+Math.max(0,Math.min(1,max>0?-tx/max:0))+')';
   }
  }
  requestAnimationFrame(f);
 })();
}

/* faq: smooth open and close height physics (from reference video 00:34-00:36) */
$$('details').forEach(function(d){
 var s=$('summary',d),p=$('p',d);
 if(!s||!p||RM)return;
 s.addEventListener('click',function(e){
  e.preventDefault();
  if(d.dataset.busy)return;
  d.dataset.busy=1;
  var done=function(){
   delete d.dataset.busy;
   if(window.ScrollTrigger)ScrollTrigger.refresh();
  };
  if(!d.open){
   d.open=true;
   var h=p.scrollHeight;
   p.animate([{height:'0px',opacity:0,marginTop:'0px'},{height:h+'px',opacity:1}],{duration:420,easing:'cubic-bezier(.16,1,.3,1)'}).onfinish=done;
  }else{
   var h2=p.offsetHeight;
   p.animate([{height:h2+'px',opacity:1},{height:'0px',opacity:0,marginTop:'0px'}],{duration:320,easing:'cubic-bezier(.16,1,.3,1)'}).onfinish=function(){
    d.open=false;
    done();
   };
  }
 });
});

/* curved horizon atmospheric sunrise glow in bottom CTA / contact section (from reference video 00:10, 00:36-00:38) */
var cta=$('.cta')||$('#contact')||$('#contact-page');
if(cta&&!$('.horizon-glow',cta)){
 cta.appendChild(mk('div','horizon-glow',''));
}

/* footer: status pill + wordmark rise */
var clk=$('#clk');
if(clk){
 clk.parentNode.insertBefore(mk('div','fstat','<i class="dot"></i>All systems operational'),clk.parentNode.firstChild.nextSibling);
}
var bigW=$('footer .big');
if(bigW){
 var items = $$('.mt-giant-card', bigW);
 if(!items.length) items = $$('span', bigW);
 items.forEach(function(el){
  el.addEventListener('mousemove', function(e){
   if(fine&&!RM){
    var r = el.getBoundingClientRect();
    var rx = ((e.clientY - r.top) / r.height - 0.5) * -18;
    var ry = ((e.clientX - r.left) / r.width - 0.5) * 18;
    el.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + ry.toFixed(1) + 'deg) scale(1.04)';
   }
   el.classList.add('hot');
  });
  el.addEventListener('mouseleave', function(){
   if(fine&&!RM){
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
   }
   el.classList.remove('hot');
  });
  el.addEventListener('click', function(){
   if(!RM){
    el.animate([
     {transform: 'perspective(800px) rotateX(0deg)'},
     {transform: 'perspective(800px) rotateX(180deg)'},
     {transform: 'perspective(800px) rotateX(360deg)'}
    ], {duration: 600, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'});
   }
  });
 });
}
var big=$('footer .big');
if(big&&'IntersectionObserver' in window){
 var bigIO=new IntersectionObserver(function(es){
  es.forEach(function(e){
   if(e.isIntersecting){
    e.target.classList.add('in');
    bigIO.unobserve(e.target);
   }
  });
 },{threshold:0.12,rootMargin:'0px 0px -20px 0px'});
 bigIO.observe(big);
}else if(big){
 big.classList.add('in');
}

/* Parallax floating math & tech badges (from Pinterest Reference) */
var fBadges=$$('.hero-floating-badges .f-badge');
if(hero&&fBadges.length&&fine&&!RM){
 hero.addEventListener('mousemove',function(e){
  var r=hero.getBoundingClientRect();
  var nx=(e.clientX-r.left)/r.width-0.5;
  var ny=(e.clientY-r.top)/r.height-0.5;
  fBadges.forEach(function(b,idx){
   var speed=(idx%3+1)*15;
   var inv=(idx%2===0?1:-1);
   b.style.setProperty('--fx',(nx*speed*inv).toFixed(1)+'px');
   b.style.setProperty('--fy',(ny*speed).toFixed(1)+'px');
  });
 });
 hero.addEventListener('mouseleave',function(){
  fBadges.forEach(function(b){
   b.style.setProperty('--fx','0px');
   b.style.setProperty('--fy','0px');
  });
 });
}

/* Process Step Switcher (from Pinterest Reference) */
var procBtns=$$('.proc-step-btn');
var procSteps=$$('.steps .step');
if(procBtns.length&&procSteps.length){
 procBtns.forEach(function(btn){
  btn.addEventListener('click',function(){
   var stepIdx=btn.dataset.step;
   procBtns.forEach(function(b){b.classList.remove('active')});
   btn.classList.add('active');
   procSteps.forEach(function(s,idx){
    if(s.dataset.step===stepIdx||idx===+stepIdx){
     s.classList.add('active-step');
     s.style.borderColor='var(--acc-emerald)';
     if(!RM){
      s.animate([
       {transform:'scale(0.97)'},
       {transform:'scale(1.02)'},
       {transform:'scale(1)'}
      ],{duration:380,easing:'cubic-bezier(.16,1,.3,1)'});
     }
    }else{
     s.classList.remove('active-step');
     s.style.borderColor='';
    }
   });
  });
 });
}

/* ORIGINAL ENTRANCE 100 COUNTER & LOGO (PRESERVED 100% UNTOUCHED): progress bar follows the counter */
var cnt=$('#cnt');
if(cnt){
 var lb=mk('div','lbar','<i></i>');
 cnt.parentNode.appendChild(lb);
 var fill=lb.firstChild;
 new MutationObserver(function(){
  fill.style.width=(parseFloat(cnt.textContent)||0)+'%';
 }).observe(cnt,{childList:true,characterData:true,subtree:true});
}
})();
