(function(){
var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};
var root=document.documentElement,RM=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
/* theme */
var t=null;try{t=localStorage.getItem('inkpen-theme')}catch(e){}
if(!t)t='dark';
function setT(v){
  if(!v) v='dark';
  root.setAttribute('data-theme',v);
  if(document.body) document.body.setAttribute('data-theme',v);
  var m=$('meta[name=theme-color]');
  if(m) m.content=v==='dark'?'#0b0d0c':'#f8fafc';
  var sl=$('#scl');
  if(sl) sl.textContent=v==='dark'?'Night':'Day';
  try{localStorage.setItem('inkpen-theme',v)}catch(e){}
  window.dispatchEvent(new CustomEvent('inkpen-theme-changed', { detail: { theme: v } }));
}
setT(t);
document.addEventListener('DOMContentLoaded', function(){ setT(root.getAttribute('data-theme') || t); });
document.addEventListener('click', function(e){
  var btn = e.target.closest('#theme, .tbtn');
  if(btn){
    e.preventDefault();
    setT(root.getAttribute('data-theme')==='dark'?'light':'dark');
  }
});
/* nav */
var lenis=null;
function go(h){var el=$(h);if(!el)return;if(lenis)lenis.scrollTo(el,{offset:-20});else el.scrollIntoView({behavior:'smooth'})}
$$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var h=a.getAttribute('href');if(h.length>1){e.preventDefault();go(h)}})});
/* form */
$('#f').onsubmit=function(e){e.preventDefault();var v=$('#em').value;$('#ok').textContent='Thanks! We’ll write back to '+v+'.';e.target.reset()};
/* clock */
setInterval(function(){$('#clk').textContent=new Date().toLocaleTimeString()},1000);
/* canvas bg disabled */
var cv=$('#bg');
if(cv) cv.style.display='none';
/* cursor, magnetic, tilt */
if(fine&&!RM){
 var cur=$('#cur'),dot=$('#dot');
 if(cur) cur.style.display='none';
 if(dot) dot.style.display='none';
 $$('.mag').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.3+'px,'+(e.clientY-r.top-r.height/2)*.3+'px)'});b.addEventListener('mouseleave',function(){b.style.transform='';})});
 $$('.tilt').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.transform='perspective(900px) rotateY('+(x-.5)*6+'deg) rotateX('+(.5-y)*6+'deg)';c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%')});c.addEventListener('mouseleave',function(){c.style.transform=''})});
}
/* animation */
var booted = false;
function boot(){
 if(booted) return;
 booted = true;
 if(typeof gsap==='undefined'){
  var L=$('#loader');
  if(L) L.style.display='none';
  return;
 }
 gsap.registerPlugin(ScrollTrigger);
 if(typeof Lenis!=='undefined'&&!RM&&!window.lenis){
  lenis=new Lenis({lerp:.1});
  window.lenis=lenis;
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(function(t){lenis.raf(t*1000)});
  gsap.ticker.lagSmoothing(0);
 }
 gsap.to('#prog',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.2}});
 gsap.fromTo('#hero h1 .ln span',
  {yPercent:100},
  {yPercent:0,duration:1.0,stagger:.1,ease:'power4.out',delay:.05,clearProps:'transform'}
 );
 gsap.fromTo('#hero .pill,#hero p,#hero .hero-buttons-row,#hero .hero-row',
  {opacity:0,y:24},
  {opacity:1,y:0,duration:.85,stagger:.12,delay:.3,ease:'power3.out',clearProps:'opacity,transform'}
 );
 
 
 gsap.to('#hero h1',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'#hero',scrub:true,start:'top top',end:'bottom top'}});
 gsap.to('.orb',{y:400,ease:'none',scrollTrigger:{scrub:true,start:0,end:'max'}});
 $$('.sline').forEach(function(l){gsap.to(l,{opacity:1,scrollTrigger:{trigger:l,start:'top 85%',end:'top 60%',scrub:true}})});
 gsap.from('.stage',{scale:.92,opacity:0.4,rotate:-2,scrollTrigger:{trigger:'#story',start:'top 80%',end:'top 45%',scrub:true}});
 
 $$('.eyebrow').forEach(function(e){if(e.closest('#hero'))return;gsap.from(e,{opacity:0,y:50,duration:1,ease:'power3.out',scrollTrigger:{trigger:e,start:'top 88%'}})});
 $$('.stats>*,.step,details').forEach(function(e){gsap.from(e,{opacity:0,y:60,duration:.9,scrollTrigger:{trigger:e,start:'top 92%'}})});
 gsap.from('.cta',{scale:.92,opacity:0,scrollTrigger:{trigger:'.cta',start:'top 85%',end:'top 40%',scrub:true}});
 $$('[data-c]').forEach(function(n){var o={v:0},s=n.dataset.s||'',c=+n.dataset.c;gsap.to(o,{v:c,duration:2,ease:'power2.out',scrollTrigger:{trigger:n,start:'top 92%',once:true},onUpdate:function(){n.textContent=Math.round(o.v).toLocaleString()+s}})});
 function getScrollAmount(){
  var tr = document.getElementById("track");
  if(!tr) return 0;
  return Math.max(0, tr.scrollWidth - window.innerWidth);
 }

 function updateHsDist(){
  var tr = document.getElementById("track");
  var div = document.getElementById("div");
  if(!tr || !div) return 0;
  var travel = getScrollAmount();
  var dist = Math.max(window.innerHeight * 2.2, Math.round(travel * 1.35));
  div.style.setProperty("--hs-dist", dist + "px");
  return dist;
 }

 function getCardProgress(idx){
  var tr = document.getElementById("track");
  var cards = document.querySelectorAll("#track .card");
  if(!tr || !cards[idx]) return 0;
  var maxScroll = getScrollAmount();
  if(maxScroll <= 0) return 0;

  if(idx === 0) return 0;
  if(idx === cards.length - 1) return 1;

  var targetCard = cards[idx];
  var cardCenter = targetCard.offsetLeft + targetCard.offsetWidth / 2;
  var desiredX = (window.innerWidth / 2) - cardCenter;
  var clampedX = Math.max(-maxScroll, Math.min(0, desiredX));
  return -clampedX / maxScroll;
 }

 function updateDivNav(){
  var cards = document.querySelectorAll("#track .card");
  var navBtns = document.querySelectorAll("#divNavBar .div-nav-btn");
  if(!cards.length) return;
  var screenCenter = window.innerWidth / 2;
  var closestIdx = 0, minDist = Infinity;
  cards.forEach(function(c, i){
   var r = c.getBoundingClientRect();
   var cCenter = r.left + r.width / 2;
   var d = Math.abs(cCenter - screenCenter);
   if(d < minDist){ minDist = d; closestIdx = i; }
  });
  if(navBtns.length){
   navBtns.forEach(function(b, i){ b.classList.toggle("on", i === closestIdx); });
  }
  cards.forEach(function(c, i){
   c.classList.toggle("card-active", i === closestIdx);
  });
 }

 function scrollToCard(idx){
  var div = document.getElementById("div");
  var tr = document.getElementById("track");
  var cards = document.querySelectorAll("#track .card");
  if(!div || !tr || !cards[idx]) return;

  var p = getCardProgress(idx);
  var currentScroll = window.lenis ? window.lenis.scroll : window.scrollY;
  var divRect = div.getBoundingClientRect();
  var divTop = divRect.top + currentScroll;
  var divScrollable = Math.max(0, div.offsetHeight - window.innerHeight);
  var targetScroll = divTop + p * divScrollable;

  if(window.lenis){
   window.lenis.scrollTo(targetScroll, {duration: 0.85, easing: function(t){ return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }});
  }else{
   window.scrollTo({top: targetScroll, behavior: "smooth"});
  }
 }

 document.querySelectorAll("#divNavBar .div-nav-btn").forEach(function(btn){
  btn.addEventListener("click", function(e){
   e.preventDefault();
   scrollToCard(+btn.dataset.target);
  });
 });

 var prevBtn = document.getElementById("divPrevBtn");
 if(prevBtn){
  prevBtn.addEventListener("click", function(e){
   e.preventDefault();
   var activeBtn = document.querySelector("#divNavBar .div-nav-btn.on");
   var curIdx = activeBtn ? +activeBtn.dataset.target : 0;
   scrollToCard(Math.max(0, curIdx - 1));
  });
 }

 var nextBtn = document.getElementById("divNextBtn");
 if(nextBtn){
  nextBtn.addEventListener("click", function(e){
   e.preventDefault();
   var activeBtn = document.querySelector("#divNavBar .div-nav-btn.on");
   var curIdx = activeBtn ? +activeBtn.dataset.target : 0;
   scrollToCard(Math.min(2, curIdx + 1));
  });
 }

  /* Universal Sticky Horizontal Scroll Controller (Desktop, Tablet & Mobile) */
  var tr = document.getElementById("track");
  var hs = document.getElementById("hs");
  var div = document.getElementById("div");

  if(tr && hs && div){
   updateHsDist();

   if(window.ScrollTrigger){
    ScrollTrigger.addEventListener("refreshInit", function(){
     updateHsDist();
    });
   }

   gsap.to(tr, {
    x: function(){ return -getScrollAmount(); },
    ease: "none",
    scrollTrigger: {
     id: "hsScroll",
     trigger: "#div",
     start: "top top",
     end: "bottom bottom",
     scrub: 0.25,
     invalidateOnRefresh: true,
     onUpdate: function(self){
      updateDivNav();
      var hprogBar = document.querySelector("#hs .hprog i");
      if(hprogBar){
       hprogBar.style.transform = "scaleX(" + Math.min(1, Math.max(0, self.progress)) + ")";
      }
     }
    }
   });

   var onResize = function(){
    updateHsDist();
    if(window.ScrollTrigger) ScrollTrigger.refresh();
   };
   window.addEventListener("resize", onResize);

   /* Mouse wheel: horizontal trackpad gesture handling */
   var onWheel = function(e){
    if(Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 2){
     e.preventDefault();
     var delta = e.deltaX * 1.2;
     if(window.lenis){
      window.lenis.scrollTo(window.lenis.scroll + delta, {immediate: false, duration: 0.2});
     }else{
      window.scrollBy({top: delta, behavior: "auto"});
     }
    }
   };
   hs.addEventListener("wheel", onWheel, {passive: false});

   /* Touch swipe gestures on mobile and tablet */
   var touchStartX = 0, touchStartY = 0;
   hs.addEventListener("touchstart", function(e){
    if(e.touches.length === 1){
     touchStartX = e.touches[0].clientX;
     touchStartY = e.touches[0].clientY;
    }
   }, {passive: true});

   hs.addEventListener("touchmove", function(e){
    if(e.touches.length === 1){
     var dx = touchStartX - e.touches[0].clientX;
     var dy = touchStartY - e.touches[0].clientY;
     if(Math.abs(dx) > Math.abs(dy) * 1.25 && Math.abs(dx) > 6){
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      var scrollDelta = dx * 1.35;
      if(window.lenis){
       window.lenis.scrollTo(window.lenis.scroll + scrollDelta, {immediate: true});
      }else{
       window.scrollBy({top: scrollDelta, behavior: "auto"});
      }
     }
    }
   }, {passive: true});
  }
}
/* loader */
var particleAnimId=null,turnTween=null,floatTween=null;

function initLoaderParticles(){
 var cvs=$('#loader-canvas');
 if(!cvs)return;
 var ctx=cvs.getContext('2d');
 if(!ctx)return;
 function resize(){
  cvs.width=cvs.offsetWidth||window.innerWidth;
  cvs.height=cvs.offsetHeight||window.innerHeight;
 }
 resize();
 var pts=[],count=Math.min(35,Math.floor(cvs.width/30));
 for(var i=0;i<count;i++){
  pts.push({
   x:Math.random()*cvs.width,
   y:Math.random()*cvs.height,
   r:Math.random()*2+0.8,
   vx:(Math.random()-0.5)*0.4,
   vy:-(Math.random()*0.6+0.25),
   alpha:Math.random()*0.6+0.2,
   dAlpha:(Math.random()-0.5)*0.015,
   hue:Math.random()>0.3?'0, 229, 153':'163, 230, 53'
  });
 }
 function draw(){
  ctx.clearRect(0,0,cvs.width,cvs.height);
  for(var i=0;i<pts.length;i++){
   var p=pts[i];
   p.x+=p.vx;p.y+=p.vy;p.alpha+=p.dAlpha;
   if(p.alpha<=0.1||p.alpha>=0.85)p.dAlpha=-p.dAlpha;
   if(p.y<-10){p.y=cvs.height+10;p.x=Math.random()*cvs.width;}
   if(p.x<-10)p.x=cvs.width+10;
   if(p.x>cvs.width+10)p.x=-10;
   ctx.beginPath();
   ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
   ctx.fillStyle='rgba('+p.hue+','+p.alpha.toFixed(3)+')';
   ctx.shadowBlur=8;
   ctx.shadowColor='rgba(0, 229, 153, 0.4)';
   ctx.fill();
  }
  particleAnimId=requestAnimationFrame(draw);
 }
 draw();
}

var finished = false;
function finish(){
 if(finished) return;
 finished = true;
 var L=$('#loader');
 if(!L)return;
 if(particleAnimId){cancelAnimationFrame(particleAnimId);particleAnimId=null;}
 if(turnTween){turnTween.kill();turnTween=null;}
 if(floatTween){floatTween.kill();floatTween=null;}
 if(typeof gsap!=='undefined'){
  gsap.to(L,{
   opacity:0,
   duration:0.25,
   ease:'power2.out',
   onComplete:function(){
    L.style.display='none';
    if(window.ScrollTrigger)ScrollTrigger.refresh();
   }
  });
 }else{
  L.style.display='none';
  if(window.ScrollTrigger)ScrollTrigger.refresh();
 }
}

var hasRun = false;
function run(){
 if(hasRun) return;
 hasRun = true;
 var L=$('#loader');
 if(!L){boot();return;}
 L.style.display='grid';
 L.style.opacity='1';

 var logo = $('#ldlogo');
 if(!logo) logo = $('#ldstage');

 if(typeof gsap==='undefined'||RM){
  boot();
  finish();
  return;
 }

 initLoaderParticles();

 // Smooth, continuous rotating animation on the INKPEN logo/text
 // Total animation runtime strictly within 1 second maximum
 gsap.fromTo(logo,
  { rotateY: -180, scale: 0.78, opacity: 0 },
  {
   rotateY: 360,
   scale: 1,
   opacity: 1,
   duration: 0.72,
   ease: 'power2.inOut',
   onComplete: function(){
    gsap.to(logo, {
     scale: 1.04,
     opacity: 0.95,
     duration: 0.12,
     ease: 'power1.out',
     onComplete: function(){
      boot();
      finish();
     }
    });
   }
  }
 );
}
/* division pages */
var R=['tech','academy','media'],curDV=null,dvEl=$('#dv');
var ART={
tech:'<svg viewBox="0 0 400 300" role="img" aria-label="Code windows around a glowing chip"><g fill="none" stroke="var(--g)" stroke-width="1.5"><rect x="20" y="30" width="150" height="120" rx="8"/><rect x="230" y="30" width="150" height="90" rx="8"/><rect x="230" y="150" width="150" height="110" rx="8"/><rect x="170" y="110" width="60" height="60" rx="10" stroke-width="2.5"/><path d="M170 140H150M230 140H250M200 110V90M200 170V200M20 190H150L170 170"/></g><g stroke="var(--fg)" opacity=".35" stroke-width="3" stroke-linecap="round"><path d="M34 52h60M34 68h90M44 84h70M34 100h100M44 116h50M244 52h70M244 68h100M244 170h110M244 188h80M244 206h100M244 224h60"/></g><path d="M190 128l-10 12 10 12M210 128l10 12-10 12" fill="none" stroke="var(--g)" stroke-width="3" stroke-linecap="round"/><g fill="var(--g)"><circle cx="40" cy="190" r="4"/><rect x="40" y="215" width="100" height="6" rx="3" opacity=".6"/><rect x="40" y="235" width="70" height="6" rx="3" opacity=".4"/></g></svg>',
media:'<svg viewBox="0 0 400 300" role="img" aria-label="Cinema screen and camera"><rect x="30" y="30" width="340" height="190" rx="14" fill="none" stroke="var(--g)" stroke-width="2"/><path d="M180 85l50 35-50 35z" fill="var(--g)"/><g fill="none" stroke="var(--fg)" opacity=".4" stroke-width="2"><circle cx="80" cy="75" r="22"/><circle cx="80" cy="75" r="9"/><path d="M30 255h340M60 255l20-35M340 255l-20-35"/></g><g fill="var(--g)" opacity=".7"><rect x="50" y="190" width="40" height="6" rx="3"/><rect x="100" y="190" width="80" height="6" rx="3"/><rect x="310" y="55" width="40" height="6" rx="3"/></g></svg>',
academy:'<svg viewBox="0 0 400 300" role="img" aria-label="Open book and graduation cap"><g fill="none" stroke="var(--g)" stroke-width="2.5" stroke-linejoin="round"><path d="M200 130C160 105 100 105 60 125V240C100 220 160 220 200 245 240 220 300 220 340 240V125C300 105 240 105 200 130Z"/><path d="M200 130V245"/><path d="M200 30L290 62 200 94 110 62Z" fill="color-mix(in srgb,var(--g) 25%,transparent)"/><path d="M150 82V108Q200 128 250 108V82M290 62V100"/></g><g fill="var(--g)"><circle cx="290" cy="104" r="5"/><circle cx="80" cy="60" r="3"/><circle cx="330" cy="150" r="3"/></g><g stroke="var(--fg)" opacity=".35" stroke-width="3" stroke-linecap="round"><path d="M85 150q50-14 90 4M85 170q50-14 90 4M225 154q40-18 90-4M225 174q40-18 90-4"/></g></svg>'};
var DV={
tech:{tag:'INKPEN TECH',sub:'Full-Cycle Digital Engineering',h:'Tech that moves the business',em:'forward.',p:'From first discovery to continuous improvement, we turn complex operations into products people can use and teams can grow.',b1:'Engage Tech Engineers →',b2:'‹/› Inspect Disciplines',pl:['PHASE ',' METHODOLOGY:'],fw:'INKPEN Engineering Framework',
st:[['Discover','Find the real problem.','Deep operational discovery, requirement audits & technical feasibility benchmarking.'],['Design','Shape the useful path.','Architecture, UX flows and prototypes validated with real users.'],['Build','Make it work in the world.','Iterative engineering with automated testing and continuous integration.'],['Launch','Put it in people’s hands.','Staged releases, monitoring and hands-on onboarding.'],['Improve','Keep learning from use.','Usage analytics and rapid iteration cycles after launch.']],
stk:['React','Node.js','Next.js 15','TypeScript','Python','TailwindCSS','PostgreSQL','Docker','AWS Cloud','FastAPI','GraphQL','PyTorch'],stl:'CORE PRODUCTION STACK & TECHNOLOGIES',sts:'Modern • Scalable • Cloud-Native',
caps:[['Web Platforms','Fast, scalable web applications and portals.'],['Mobile Apps','Cross-platform apps people enjoy using.'],['AI & Machine Learning','Models and automation that solve real problems.'],['Cloud & DevOps','Reliable infrastructure and delivery pipelines.'],['Enterprise Software','Custom systems built for complex operations.'],['UI/UX Engineering','Interfaces designed and built as one craft.']]},
media:{tag:'INKPEN MEDIA',sub:'Cinematic Production & Brand Worlds',h:'Media makes the message',em:'impossible to miss.',p:'Launches, campaigns, films, social content, and brand worlds made with cinematic intent and a sharp sense of place.',b1:'Commission a Production →',b2:'Explore Capabilities',pl:['PILLAR ',' PRODUCTION FOCUS:'],fw:'INKPEN Cinema Protocol',
ov:['Media','Creative Media & Visual Storytelling','We craft powerful stories through concept, scriptwriting, cinematography and visual effects.'],
st:[['Launches','Sensory product introductions.','Sensory product introductions, stage keynote films, and reveal events built to set a new market standard.'],['Campaigns','Cross-platform commercial campaigns.','Cross-platform commercial campaigns with a single cinematic idea across every channel.'],['Films','Cinematic brand worlds & narratives.','Brand films and narratives from concept and scriptwriting to cinematography.'],['Social','Viral micro-content & 3D motion.','Short-form content and 3D motion designed for the feed.']],
caps:[['Brand Films','Story-led films from concept to final cut.'],['Commercials','Campaign spots for screen and social.'],['Visual Effects','VFX and 3D motion for launches and reveals.'],['Social Content','Micro-content built for reach.'],['Photography','Product and brand imagery with cinematic light.']]},
academy:{tag:'INKPEN ACADEMY',sub:'Industry Education & Careers',h:'Academy turns curiosity into',em:'capability.',p:'Industry education that turns curiosity into capability, through courses, mentorship and careers.',b1:'Join the Academy →',b2:'Explore Programs',pl:['STAGE ',' LEARNING FOCUS:'],fw:'INKPEN Learning Framework',
st:[['Learn','Courses taught by practitioners.','Industry-led courses that teach the skills teams actually hire for.'],['Build','Projects, not just lectures.','Hands-on projects that become a real portfolio.'],['Mentor','Guidance from people in the field.','One-to-one mentorship from working professionals.'],['Launch','From learner to career.','Career support and pathways into the INKPEN network.']],
caps:[['Courses','Structured programs across tech and media.'],['Mentorship','Personal guidance from industry mentors.'],['Careers','Placement support and career pathways.'],['Workshops','Short, practical, hands-on sessions.']]}};
function chip(a){return a.map(function(x){return '<span>'+x+'</span>'}).join('')}
function render(n){var d=DV[n],ov=d.ov?'<div class="glass ov"><b>'+d.ov[0]+'</b>'+d.ov[1]+'<br><span class="mute">'+d.ov[2]+'</span></div>':'';
dvEl.innerHTML='<div class="dvw"><button class="btn back mag" data-back>← Back to INKPEN</button><div class="glass dvh"><div class="dvt"><div><span class="tg"><b>'+d.tag+'</b> ● '+d.sub+'</span><h1>'+d.h+' <em>'+d.em+'</em></h1><p class="mute" style="max-width:520px;margin-top:1.2rem">'+d.p+'</p><div class="hero-row"><a href="#contact" class="btn p mag">'+d.b1+'</a><a href="#caps" class="btn mag">'+d.b2+'</a></div></div><div class="dvr">'+ART[n]+ov+'</div></div><div class="stp">'+d.st.map(function(s,i){return '<button class="st'+(i?'':' on')+'" data-i="'+i+'"><small>0'+(i+1)+'</small><b>'+s[0]+'</b><span>'+s[1]+'</span></button>'}).join('')+'</div><p class="ph"><span><b>'+d.pl[0]+'01'+d.pl[1]+'</b> <span id="pht">'+d.st[0][2]+'</span></span><em>'+d.fw+'</em></p></div>'+(d.stk?'<div class="glass stk"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem"><strong>'+d.stl+'</strong><span class="cnt2">'+d.sts+'</span></div><div class="chips2">'+chip(d.stk)+'</div></div>':'')+'<div class="capsw" id="capsw"><div class="capsin" id="capsin"><h2 id="caps">Available Disciplines &amp; Services</h2><p class="mute">Select any capability to inspect deliverables, tech stacks, and methodologies.</p><p class="cnt2">'+d.caps.length+' Specialized Capabilities</p><div class="caps" id="capstrack">'+d.caps.map(function(c,i){return '<button class="cap" data-i="'+i+'"><b>'+c[0]+'</b><span>'+c[1]+'</span></button>'}).join('')+'</div><div class="glass capd" id="capd"><span class="mute">Select a capability above.</span></div></div></div></div>'}
var capTw=null;function killCaps(){if(capTw){if(capTw.scrollTrigger)capTw.scrollTrigger.kill(true);capTw.kill();capTw=null}}
function initCaps(){killCaps();var tk=$('#capstrack'),pin=$('#capsin');if(!tk||!pin||RM||!window.gsap||!window.ScrollTrigger||innerWidth<=820)return;var dist=function(){return Math.max(0,tk.scrollWidth+2*parseFloat(getComputedStyle(pin).paddingLeft)-pin.clientWidth)};if(dist()<=0)return;capTw=gsap.to(tk,{x:function(){return-dist()},ease:'none',scrollTrigger:{trigger:pin,pin:true,scrub:.6,start:'top top',end:function(){return'+='+dist()},invalidateOnRefresh:true}})}
function showDV(n,push){if(!DV[n])return;killCaps();curDV=n;render(n);document.body.classList.add('dv-on');if(push!==false&&location.hash!=='#'+n)location.hash=n;window.scrollTo(0,0);if(lenis)lenis.scrollTo(0,{immediate:true});if(window.gsap&&!RM)gsap.from('.dvw>*:not(.capsw)',{opacity:0,y:40,duration:.8,stagger:.1,ease:'power3.out'});setTimeout(function(){initCaps();if(window.ScrollTrigger)ScrollTrigger.refresh()},80)}
function exitDV(then){killCaps();curDV=null;document.body.classList.remove('dv-on');setTimeout(function(){if(window.ScrollTrigger)ScrollTrigger.refresh();if(then)then()},120)}
function scrollTo2(el){if(lenis)lenis.scrollTo(el,{offset:-20});else el.scrollIntoView({behavior:'smooth'})}
function go(h){var n=h.slice(1);if(DV[n]){showDV(n);return}var el=$(h);if(!el)return;if(curDV&&!el.closest('#dv')){location.hash=n;exitDV(function(){scrollTo2($(h))})}else scrollTo2(el)}
$$('.card').forEach(function(c,i){c.style.cursor='pointer';var a=c.querySelector('a');if(a)a.setAttribute('href','#'+R[i]);c.addEventListener('click',function(e){if(!e.target.closest('a'))showDV(R[i])})});
$$('footer .fcol:first-of-type a').forEach(function(a,i){a.setAttribute('href','#'+['academy','tech','media'][i])});
dvEl.addEventListener('click',function(e){var b;if(e.target.closest('[data-back]')){e.preventDefault();location.hash='div';exitDV(function(){var el=$('#div');if(el)scrollTo2(el)});return}
if(b=e.target.closest('.st')){var d=DV[curDV],i=+b.dataset.i;$$('.st',dvEl).forEach(function(x){x.classList.remove('on')});b.classList.add('on');$('.ph b',dvEl).textContent=d.pl[0]+'0'+(i+1)+d.pl[1];$('#pht').textContent=d.st[i][2]}
if(b=e.target.closest('.cap')){var c=DV[curDV].caps[+b.dataset.i];$$('.cap',dvEl).forEach(function(x){x.classList.remove('on')});b.classList.add('on');$('#capd').innerHTML='<h3>'+c[0]+'</h3><p class="mute">'+c[1]+'</p>'}});
addEventListener('hashchange',function(){var n=location.hash.slice(1);if(DV[n]){if(n!==curDV)showDV(n,false)}else if(curDV)exitDV()});
if(DV[location.hash.slice(1)])showDV(location.hash.slice(1),false);
if(document.readyState==='loading'){
 document.addEventListener('DOMContentLoaded',run);
}else{
 run();
}
setTimeout(function(){
 if(!booted) boot();
 if(!finished) finish();
},1000);
})();


/* Interactive Project Showcase category filtering */
(function initProjectFilters(){
  var buttons = document.querySelectorAll('.p-filter');
  var cards = document.querySelectorAll('.project-card');
  if (!buttons.length || !cards.length) return;
  buttons.forEach(function(btn){
    btn.addEventListener('click', function(){
      var cat = btn.getAttribute('data-filter');
      buttons.forEach(function(b){
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      cards.forEach(function(c){
        var match = cat === 'all' || c.getAttribute('data-category') === cat;
        if (match) {
          c.classList.remove('is-hidden');
          c.style.opacity = '0';
          c.style.transform = 'translateY(8px)';
          requestAnimationFrame(function(){
            c.style.transition = 'opacity .32s ease, transform .32s ease';
            c.style.opacity = '1';
            c.style.transform = 'translateY(0)';
          });
        } else {
          c.classList.add('is-hidden');
        }
      });
    });
  });
})();
