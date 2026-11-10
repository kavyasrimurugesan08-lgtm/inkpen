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
}

/* hero: lens that reveals the full-colour artwork under the cursor */
var art=$('.heroart');
if(hero&&art&&fine&&!RM){
 if(!$('.lens',art)){
  var ring=mk('div','lens','<span>X 0.00 · Y 0.00</span>');
  art.appendChild(ring);
  hero.appendChild(mk('div','hint','Move the lens over the artwork'));
  var tx=0,ty=0,cx=0,cy=0,hv=true,ro=ring.firstChild;
  hero.addEventListener('mousemove',function(e){
   var r=art.getBoundingClientRect();
   tx=e.clientX-r.left;ty=e.clientY-r.top;
   art.style.setProperty('--lo',1);
   ro.textContent='X '+(tx/r.width).toFixed(2)+' · Y '+(ty/r.height).toFixed(2);
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
  var spotCards=$$('.card, .step, .stats .glass, .cp-card, .jb, .stage');
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
var hs=$('#hs'),tr=$('#track');
if(hs&&tr){
 var hp=mk('div','hprog','<i></i>'),bar=hp.firstChild;
 hs.appendChild(hp);
 (function f(){
  if(innerWidth>820){
   var m=getComputedStyle(tr).transform;
   if(m&&m!=='none'){
    var p=m.split(','),tx=+(m.indexOf('matrix3d')===0?p[12]:p[4]),max=tr.scrollWidth-innerWidth;
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
 $$('span',bigW).forEach(function(sp){
  sp.addEventListener('pointerenter',function(){sp.classList.add('hot')});
  sp.addEventListener('pointermove',function(){sp.classList.add('hot')});
  sp.addEventListener('pointerleave',function(){sp.classList.remove('hot')});
 });
}
var big=$('footer .big');
if(big&&'IntersectionObserver' in window){
 var bigIO=new IntersectionObserver(function(es){
  es.forEach(function(e){e.target.classList.toggle('in',e.isIntersecting)});
 },{threshold:.35});
 bigIO.observe(big);
}else if(big){
 big.classList.add('in');
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
