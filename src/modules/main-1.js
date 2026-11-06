(function(){
var $=function(s,c){return(c||document).querySelector(s)},$$=function(s,c){return[].slice.call((c||document).querySelectorAll(s))};
var root=document.documentElement,RM=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
/* theme */
var t=null;try{t=localStorage.getItem('inkpen-theme')}catch(e){}
if(!t)t=matchMedia('(prefers-color-scheme:light)').matches?'light':'dark';
function setT(v){root.setAttribute('data-theme',v);var m=$('meta[name=theme-color]');if(m)m.content=v==='dark'?'#0b0d0c':'#fbfcfb';var sl=$('#scl');if(sl)sl.textContent=v==='dark'?'Night':'Day';try{localStorage.setItem('inkpen-theme',v)}catch(e){}}
setT(t);$('#theme').onclick=function(){setT(root.getAttribute('data-theme')==='dark'?'light':'dark')};
/* nav */
var bur=$('#bur'),links=$('#links');
bur.onclick=function(){var o=links.classList.toggle('open');bur.setAttribute('aria-expanded',o)};
var lenis=null;
function go(h){var el=$(h);if(!el)return;links.classList.remove('open');if(lenis)lenis.scrollTo(el,{offset:-20});else el.scrollIntoView({behavior:'smooth'})}
$$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var h=a.getAttribute('href');if(h.length>1){e.preventDefault();go(h)}})});
/* form */
$('#f').onsubmit=function(e){e.preventDefault();var v=$('#em').value;$('#ok').textContent='Thanks! We’ll write back to '+v+'.';e.target.reset()};
/* clock */
setInterval(function(){$('#clk').textContent=new Date().toLocaleTimeString()},1000);
/* canvas bg */
var cv=$('#bg'),cx=cv.getContext('2d'),P=[],W,H,vis=true;
function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight}rs();addEventListener('resize',rs);
for(var i=0;i<(innerWidth<700?30:70);i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*1.8+.6});
document.addEventListener('visibilitychange',function(){vis=!document.hidden});
(function draw(){if(vis&&!RM){cx.clearRect(0,0,W,H);var g=getComputedStyle(root).getPropertyValue('--g').trim()||'#2dff8a';cx.fillStyle=g;cx.strokeStyle=g;
for(var i=0;i<P.length;i++){var p=P[i];p.x=(p.x+p.vx+W)%W;p.y=(p.y+p.vy+H)%H;cx.globalAlpha=.6;cx.beginPath();cx.arc(p.x,p.y,p.r,0,6.3);cx.fill();
for(var j=i+1;j<P.length;j++){var q=P[j],d=Math.hypot(p.x-q.x,p.y-q.y);if(d<110){cx.globalAlpha=(1-d/110)*.18;cx.beginPath();cx.moveTo(p.x,p.y);cx.lineTo(q.x,q.y);cx.stroke()}}}}
requestAnimationFrame(draw)})();
/* cursor, magnetic, tilt */
if(fine&&!RM){
 var cur=$('#cur'),dot=$('#dot'),mx=0,my=0,cxp=0,cyp=0;
 addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;dot.style.transform='translate('+mx+'px,'+my+'px)'});
 (function f(){cxp+=(mx-cxp)*.18;cyp+=(my-cyp)*.18;cur.style.transform='translate('+cxp+'px,'+cyp+'px)';requestAnimationFrame(f)})();
 $$('a,button,summary,input').forEach(function(e){e.addEventListener('mouseenter',function(){cur.classList.add('h')});e.addEventListener('mouseleave',function(){cur.classList.remove('h')})});
 $$('.mag').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+(e.clientX-r.left-r.width/2)*.3+'px,'+(e.clientY-r.top-r.height/2)*.3+'px)'});b.addEventListener('mouseleave',function(){b.style.transform='';})});
 $$('.tilt').forEach(function(c){c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;c.style.transform='perspective(900px) rotateY('+(x-.5)*6+'deg) rotateX('+(.5-y)*6+'deg)';c.style.setProperty('--mx',x*100+'%');c.style.setProperty('--my',y*100+'%')});c.addEventListener('mouseleave',function(){c.style.transform=''})});
}
/* animation */
function boot(){
 if(typeof gsap==='undefined'){$('#loader').style.display='none';return}
 gsap.registerPlugin(ScrollTrigger);
 if(typeof Lenis!=='undefined'&&!RM){lenis=new Lenis({lerp:.1});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
 gsap.to('#prog',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.2}});
 gsap.from('#hero h1 .ln span',{yPercent:110,duration:1.2,stagger:.12,ease:'power4.out',delay:.1});
 gsap.from('#hero .pill,#hero p,.hero-row',{opacity:0,y:30,duration:1,stagger:.15,delay:.6});
 
 
 gsap.to('#hero h1',{yPercent:-12,ease:'none',scrollTrigger:{trigger:'#hero',scrub:true,start:'top top',end:'bottom top'}});
 gsap.to('.orb',{y:400,ease:'none',scrollTrigger:{scrub:true,start:0,end:'max'}});
 $$('.sline').forEach(function(l){gsap.to(l,{opacity:1,scrollTrigger:{trigger:l,start:'top 75%',end:'top 45%',scrub:true}})});
 gsap.from('.stage',{scale:.85,opacity:0,rotate:-4,scrollTrigger:{trigger:'#story',start:'top 70%',end:'top 20%',scrub:true}});
 
 $$('.eyebrow').forEach(function(e){if(e.closest('#hero'))return;gsap.from(e,{opacity:0,y:50,duration:1,ease:'power3.out',scrollTrigger:{trigger:e,start:'top 88%'}})});
 $$('.stats>*,.step,details').forEach(function(e){gsap.from(e,{opacity:0,y:60,duration:.9,scrollTrigger:{trigger:e,start:'top 92%'}})});
 gsap.from('.cta',{scale:.92,opacity:0,scrollTrigger:{trigger:'.cta',start:'top 85%',end:'top 40%',scrub:true}});
 $$('[data-c]').forEach(function(n){var o={v:0},s=n.dataset.s||'',c=+n.dataset.c;gsap.to(o,{v:c,duration:2,ease:'power2.out',scrollTrigger:{trigger:n,start:'top 92%',once:true},onUpdate:function(){n.textContent=Math.round(o.v).toLocaleString()+s}})});
 var mm=gsap.matchMedia();
 mm.add('(min-width:821px)',function(){var tr=$('#track');gsap.to(tr,{x:function(){return-(tr.scrollWidth-innerWidth)},ease:'none',scrollTrigger:{trigger:'#hs',pin:true,scrub:.6,start:'top top',end:function(){return'+='+(tr.scrollWidth-innerWidth)},invalidateOnRefresh:true}})});
 mm.add('(max-width:820px)',function(){$$('.card').forEach(function(c){gsap.from(c,{opacity:0,y:60,scrollTrigger:{trigger:c,start:'top 90%'}})})});
}
/* loader */
var cnt=$('#cnt'),stat=$('#stat'),msgs=['Sharpening the nib','Finding the sheep','Following the trail','Writing the future'],o={v:0};
function finish(){var L=$('#loader');if(typeof gsap!=='undefined')gsap.to(L,{yPercent:-100,duration:1,ease:'power4.inOut',onComplete:function(){L.style.display='none'}});else L.style.display='none'}
function run(){
 if(typeof gsap==='undefined'||RM){cnt.textContent='100';finish();boot();return}
 gsap.from('#ldlogo',{scale:.8,opacity:0,duration:1.4,ease:'power3.out'});
 gsap.to(o,{v:100,duration:2.4,ease:'power1.inOut',onUpdate:function(){cnt.textContent=Math.round(o.v);stat.textContent=msgs[Math.min(3,Math.floor(o.v/25))]},onComplete:function(){boot();finish()}});
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
function go(h){var n=h.slice(1);links.classList.remove('open');if(DV[n]){showDV(n);return}var el=$(h);if(!el)return;if(curDV&&!el.closest('#dv')){location.hash=n;exitDV(function(){scrollTo2($(h))})}else scrollTo2(el)}
$$('.card').forEach(function(c,i){c.style.cursor='pointer';var a=c.querySelector('a');if(a)a.setAttribute('href','#'+R[i]);c.addEventListener('click',function(e){if(!e.target.closest('a'))showDV(R[i])})});
$$('footer .fcol:first-of-type a').forEach(function(a,i){a.setAttribute('href','#'+['academy','tech','media'][i])});
dvEl.addEventListener('click',function(e){var b;if(e.target.closest('[data-back]')){e.preventDefault();location.hash='div';exitDV(function(){var el=$('#div');if(el)scrollTo2(el)});return}
if(b=e.target.closest('.st')){var d=DV[curDV],i=+b.dataset.i;$$('.st',dvEl).forEach(function(x){x.classList.remove('on')});b.classList.add('on');$('.ph b',dvEl).textContent=d.pl[0]+'0'+(i+1)+d.pl[1];$('#pht').textContent=d.st[i][2]}
if(b=e.target.closest('.cap')){var c=DV[curDV].caps[+b.dataset.i];$$('.cap',dvEl).forEach(function(x){x.classList.remove('on')});b.classList.add('on');$('#capd').innerHTML='<h3>'+c[0]+'</h3><p class="mute">'+c[1]+'</p>'}});
addEventListener('hashchange',function(){var n=location.hash.slice(1);if(DV[n]){if(n!==curDV)showDV(n,false)}else if(curDV)exitDV()});
if(DV[location.hash.slice(1)])showDV(location.hash.slice(1),false);
if(document.readyState==='complete')run();else addEventListener('load',run);
setTimeout(function(){var L=$('#loader');if(L&&L.style.display!=='none'&&cnt.textContent==='0'){L.style.display='none';boot()}},9000);
})();
