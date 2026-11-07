(function(){
var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};
var RM=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var root=document.documentElement;
function mk(t,c,h){var n=document.createElement(t);if(c)n.className=c;if(h!=null)n.innerHTML=h;return n}

/* in-view observer shared by headline + footer reveals */
var io=null;
if('IntersectionObserver' in window){io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.2,rootMargin:'0px 0px -8% 0px'})}

/* word-by-word headline reveal */
function split(h){var i=0;h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());
 (function walk(n){[].slice.call(n.childNodes).forEach(function(c){
  if(c.nodeType===3){var f=document.createDocumentFragment();c.textContent.split(/(\s+)/).forEach(function(t){if(!t)return;
    if(/^\s+$/.test(t)){f.appendChild(document.createTextNode(' '));return}
    var w=mk('span','w'),x=mk('span','wi');w.setAttribute('aria-hidden','true');x.textContent=t;x.style.transitionDelay=(i++*45)+'ms';w.appendChild(x);f.appendChild(w)});
   c.parentNode.replaceChild(f,c)}
  else if(c.nodeType===1&&c.nodeName!=='BR')walk(c)})})(h)}
if(io){$$('main h2').forEach(function(h){split(h);io.observe(h)});root.classList.add('fx')}

/* hero: floating glass chips built from existing division names */
var hero=$('#hero');
if(hero){
 hero.appendChild(mk('div','scue','<i></i>Scroll'));
}

/* hero: fireflies, aurora glow and gentle mouse parallax */
var art2=$('.heroart');
if(hero&&art2&&!RM){
 art2.appendChild(mk('div','aur',''));
 var ff=mk('div','ffs',''),N=innerWidth<820?14:34,h='';
 for(var q=0;q<N;q++){var sz=(2+Math.random()*3.5).toFixed(1);h+='<i style="--x:'+(Math.random()*100).toFixed(1)+'%;--y:'+(8+Math.random()*88).toFixed(1)+'%;--s:'+sz+'px;--dx:'+(Math.round(Math.random()*90-45))+'px;--dy:'+(Math.round(Math.random()*-110))+'px;--d:'+(6+Math.random()*8).toFixed(1)+'s;--t:'+(3+Math.random()*5).toFixed(1)+'s;--dl:-'+(Math.random()*8).toFixed(1)+'s"></i>'}
 ff.innerHTML=h;art2.appendChild(ff);
 if(fine){hero.addEventListener('mousemove',function(e){var r=hero.getBoundingClientRect();art2.style.setProperty('--px',((e.clientX-r.left)/r.width-.5)*-26+'px');art2.style.setProperty('--py',((e.clientY-r.top)/r.height-.5)*-16+'px')});hero.addEventListener('mouseleave',function(){art2.style.setProperty('--px','0px');art2.style.setProperty('--py','0px')})}
}

/* hero: lens that reveals the full-colour artwork under the cursor with live telemetry */
var art=$('.heroart');
if(hero&&art&&fine&&!RM){
 var ring=mk('div','lens','<span>X 0.00 · Y 0.00 · SCANNING // LIVE</span>');art.appendChild(ring);
 hero.appendChild(mk('div','hint','Move the lens over the artwork'));
 var tx=0,ty=0,cx=0,cy=0,hv=true,ro=ring.firstChild;
 hero.addEventListener('mousemove',function(e){var r=art.getBoundingClientRect();tx=e.clientX-r.left;ty=e.clientY-r.top;art.style.setProperty('--lo',1);ro.textContent='X '+(tx/r.width).toFixed(2)+' · Y '+(ty/r.height).toFixed(2)+' · LIVE // 60FPS'});
 hero.addEventListener('mouseleave',function(){art.style.setProperty('--lo',0)});
 if(io){new IntersectionObserver(function(es){hv=es[0].isIntersecting}).observe(hero)}
 (function f(){if(hv){cx+=(tx-cx)*.14;cy+=(ty-cy)*.14;art.style.setProperty('--lx',cx.toFixed(1)+'px');art.style.setProperty('--ly',cy.toFixed(1)+'px')}requestAnimationFrame(f)})();
}

/* hero: split-flap kinetic typography on emphasis text */
var heroEm=$('#hero h1 em');
if(heroEm&&!heroEm.querySelector('.mt-fl')){
 var wText=heroEm.textContent.trim();
 heroEm.classList.add('mt-flap');
 var fHtml='';
 for(var fi=0;fi<wText.length;fi++){
  var fChar=wText[fi];
  var fAcc=fi===wText.length-1?' is-acc':'';
  fHtml+='<span class="mt-fl'+fAcc+'" style="--i:'+fi+'"><span class="mt-fl-i">'+(fChar===' '?'&nbsp;':fChar)+'</span></span>';
 }
 heroEm.innerHTML=fHtml;
 setTimeout(function(){heroEm.classList.add('hero-in')},350);
}

/* marquee: add an outlined reverse row */
var mq=$('.mq');
if(mq){var c=mq.cloneNode(true);c.classList.add('r2');mq.parentNode.insertBefore(c,mq.nextSibling)}

/* nav stays absolute at top and never hides */
var nav=$('nav.glass');
if(nav){nav.classList.remove('hide')}

/* Metrio navbar: live pulsing status badge + link indicator LEDs */
var navR=$('nav.glass .navr');
if(navR&&!$('.mthd-st',navR)){
 var st=mk('div','mthd-st','<i class="dot"></i><span>SYSTEM OPERATIONAL</span>');
 navR.insertBefore(st,navR.firstChild);
}
$$('.links a:not(.btn)').forEach(function(a){
 if(!a.querySelector('.mthd-led')){a.appendChild(mk('i','mthd-led',''))}
});

/* Metrio tactile 3D buttons */
function initBtn(scope){
 $$('.btn',scope||document).forEach(function(btn){
  if(btn.querySelector('.mt-cap'))return;
  var cap=mk('span','mt-cap',''),led=mk('i','mt-led',''),lbl=mk('span','mt-lbl','');
  while(btn.firstChild){lbl.appendChild(btn.firstChild)}
  cap.appendChild(led);
  cap.appendChild(lbl);
  var rawTxt=lbl.textContent.trim();
  if(rawTxt.endsWith('→')){
   lbl.innerHTML=lbl.innerHTML.replace(/\s*→\s*$/,'');
   cap.appendChild(mk('span','mt-arr','→'));
  }
  btn.appendChild(cap);
  if(fine){
   btn.addEventListener('mousemove',function(e){
    var r=btn.getBoundingClientRect();
    btn.style.setProperty('--mx',((e.clientX-r.left-r.width/2)*.18).toFixed(1)+'px');
    btn.style.setProperty('--my',((e.clientY-r.top-r.height/2)*.18).toFixed(1)+'px');
   });
   btn.addEventListener('mouseleave',function(){
    btn.style.setProperty('--mx','0px');
    btn.style.setProperty('--my','0px');
   });
  }
 });
}
initBtn();
if('MutationObserver' in window){
 new MutationObserver(function(muts){
  muts.forEach(function(m){
   if(m.addedNodes&&m.addedNodes.length){
    m.addedNodes.forEach(function(n){
     if(n.nodeType===1){
      if(n.classList&&n.classList.contains('btn'))initBtn(n.parentElement);
      else if(n.querySelector&&n.querySelector('.btn'))initBtn(n);
     }
    });
   }
  });
 }).observe(document.body||root,{childList:true,subtree:true});
}

/* Metrio precision data bar on section eyebrows */
$$('main section .eyebrow').forEach(function(eb){
 if(!eb.querySelector('.mt-bar')){eb.appendChild(mk('span','mt-bar',''))}
});

/* Metrio console window header on showcase stage */
var stage=$('#story .stage');
if(stage&&!stage.querySelector('.mtz-bar')){
 stage.classList.add('mtz-win');
 var mtzBar=mk('div','mtz-bar','<div class="mtz-dots"><i></i><i></i><i></i></div><span class="mtz-url">inkpen.studio // engineering-console</span><span class="mt-bar"></span>');
 stage.insertBefore(mtzBar,stage.firstChild);
}

/* divisions: horizontal progress line */
var hs=$('#hs'),tr=$('#track');
if(hs&&tr){var hp=mk('div','hprog','<i></i>'),bar=hp.firstChild;hs.appendChild(hp);
 (function f(){if(innerWidth>820){var m=getComputedStyle(tr).transform;if(m&&m!=='none'){var p=m.split(','),tx=+(m.indexOf('matrix3d')===0?p[12]:p[4]),max=tr.scrollWidth-innerWidth;bar.style.transform='scaleX('+Math.max(0,Math.min(1,max>0?-tx/max:0))+')'}}requestAnimationFrame(f)})()}

/* faq: smooth open and close */
$$('details').forEach(function(d){var s=$('summary',d),p=$('p',d);if(!s||!p||RM)return;
 s.addEventListener('click',function(e){e.preventDefault();if(d.dataset.busy)return;d.dataset.busy=1;
  var done=function(){delete d.dataset.busy;if(window.ScrollTrigger)ScrollTrigger.refresh()};
  if(!d.open){d.open=true;var h=p.scrollHeight;p.animate([{height:'0px',opacity:0,marginTop:'0px'},{height:h+'px',opacity:1}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish=done}
  else{var h2=p.offsetHeight;p.animate([{height:h2+'px',opacity:1},{height:'0px',opacity:0,marginTop:'0px'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'}).onfinish=function(){d.open=false;done()}}})});

/* footer: status pill + wordmark rise */
var clk=$('#clk');
if(clk){clk.parentNode.insertBefore(mk('div','fstat','<i class="dot"></i>All systems operational'),clk.parentNode.firstChild.nextSibling)}
var bigW=$('footer .big');if(bigW){$$('span',bigW).forEach(function(sp){sp.addEventListener('pointerenter',function(){sp.classList.add('hot')});sp.addEventListener('pointermove',function(){sp.classList.add('hot')});sp.addEventListener('pointerleave',function(){sp.classList.remove('hot')})})}
var big=$('footer .big');if(big&&'IntersectionObserver' in window){var bigIO=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('in',e.isIntersecting)})},{threshold:.35});bigIO.observe(big)}else if(big)big.classList.add('in');

/* Metrio Power-On Bootloader with 7-segment display & shutter split */
var loader=$('#loader');
var cnt=$('#cnt'),stat=$('#stat');
if(loader&&cnt){
 var DIGIT_PATHS=[
  'M4 2h14l-2 3H6z',
  'M19 3l2 2v13l-2 2-2-2V5z',
  'M19 21l2 2v13l-2 2-2-2V23z',
  'M4 38l2-3h10l2 3z',
  'M3 21l2 2v13l-2 2-2-2V23z',
  'M3 3l2 2v13l-2 2-2-2V5z',
  'M5 20l1.5-2h9l1.5 2-1.5 2h-9z'
 ];
 var DIGIT_MAP=[
  [1,1,1,1,1,1,0],
  [0,1,1,0,0,0,0],
  [1,1,0,1,1,0,1],
  [1,1,1,1,0,0,1],
  [0,1,1,0,0,1,1],
  [1,0,1,1,0,1,1],
  [1,0,1,1,1,1,1],
  [1,1,1,0,0,0,0],
  [1,1,1,1,1,1,1],
  [1,1,1,1,0,1,1]
 ];
 function mkDigitSvg(c){
  return '<svg viewBox="0 0 22 40" class="mtld-d '+c+'" aria-hidden="true">'+DIGIT_PATHS.map(function(d){return '<path d="'+d+'" class=""/>'}).join('')+'</svg>';
 }
 var ledsHtml='';
 for(var li=0;li<24;li++){ledsHtml+='<i></i>'}
 var mtldIn=mk('div','mtld-in',
  '<p class="mtld-line"><i class="on"></i>SYSTEM POWER // INKPEN CORE 2.0</p>'+
  '<div class="mtld-panel">'+
   '<span class="mtld-scw a"></span><span class="mtld-scw b"></span>'+
   '<span class="mtld-scw c"></span><span class="mtld-scw d"></span>'+
   '<div class="mtld-leds">'+ledsHtml+'</div>'+
   '<div class="mtld-read">'+
    '<span class="mtld-seg">'+mkDigitSvg('d1')+mkDigitSvg('d2')+mkDigitSvg('d3')+'</span>'+
    '<b>%</b>'+
   '</div>'+
   '<div class="mtld-w">'+
    '<span class="is-on">› Sharpening the nib</span>'+
    '<span>› Finding the sheep</span>'+
    '<span>› Following the trail</span>'+
    '<span>› Writing the future</span>'+
    '<span>› Systems Live</span>'+
   '</div>'+
  '</div>'+
  '<p class="mtld-name">'+
   '<span class="mtld-t"><span>I</span></span>'+
   '<span class="mtld-t"><span>N</span></span>'+
   '<span class="mtld-t"><span>K</span></span>'+
   '<span class="mtld-t"><span>P</span></span>'+
   '<span class="mtld-t"><span>E</span></span>'+
   '<span class="mtld-t is-acc"><span>N</span></span>'+
  '</p>'
 );
 var oldInner=loader.firstElementChild;
 if(oldInner)oldInner.style.display='none';
 loader.appendChild(mtldIn);

 var p1=[].slice.call(mtldIn.querySelectorAll('.d1 path')),
     p2=[].slice.call(mtldIn.querySelectorAll('.d2 path')),
     p3=[].slice.call(mtldIn.querySelectorAll('.d3 path'));
 var leds=[].slice.call(mtldIn.querySelectorAll('.mtld-leds i'));
 var tiles=[].slice.call(mtldIn.querySelectorAll('.mtld-name .mtld-t'));
 var steps=[].slice.call(mtldIn.querySelectorAll('.mtld-w span'));

 function setD(paths,d){
  if(d==null||d<0){for(var j=0;j<7;j++)paths[j].classList.remove('on')}
  else{var m=DIGIT_MAP[d]||[0,0,0,0,0,0,0];for(var j=0;j<7;j++)paths[j].classList.toggle('on',!!m[j])}
 }

 function updateBL(v){
  var val=Math.max(0,Math.min(100,Math.round(v)));
  var h=null,t=null,u=val;
  if(val>=100){h=1;t=0;u=0}
  else if(val>=10){t=Math.floor(val/10);u=val%10}
  setD(p1,h);setD(p2,t);setD(p3,u);
  var onC=Math.floor((val/100)*24);
  for(var k=0;k<24;k++){leds[k].classList.toggle('on',k<onC)}
  var sIdx=Math.min(4,Math.floor(val/22));
  steps.forEach(function(sp,idx){
   sp.classList.toggle('is-on',idx===sIdx);
   sp.classList.toggle('is-past',idx<sIdx);
  });
  var th=[18,36,52,68,82,94];
  tiles.forEach(function(tl,idx){tl.classList.toggle('is-on',val>=th[idx])});
  if(val>=100){
   setTimeout(function(){
    loader.classList.add('mtld-open');
    setTimeout(function(){loader.style.display='none'},750);
   },180);
  }
 }

 updateBL(parseFloat(cnt.textContent)||0);
 new MutationObserver(function(){
  updateBL(parseFloat(cnt.textContent)||0);
 }).observe(cnt,{childList:true,characterData:true,subtree:true});
}
})();
