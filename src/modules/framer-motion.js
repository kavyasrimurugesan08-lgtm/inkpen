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

/* hero: circuit traces removed */
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

/* marquee: add an outlined reverse row with edge gradient masks (from reference video 00:08, 00:23) */
var mq=$('.mq');
if(mq&&!$('.mq.r2')){
 var c=mq.cloneNode(true);
 c.classList.add('r2');
 mq.parentNode.insertBefore(c,mq.nextSibling);
}

/* nav stays pinned (fixed) and updates stuck state on scroll */
var nav=$('nav.glass');
if(nav){
  nav.classList.remove('hide');
  var onNavScroll = function(){
    nav.classList.toggle('stuck', window.scrollY > 20);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();
}

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
var hs=$('#hs');
if(hs && !$('#hs .hprog')){
 var hp=mk('div','hprog','<i></i>');
 hs.appendChild(hp);
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
/* footer: status pill + wordmark split-flap mechanical animation */
var clk=$('#clk');
if(clk){
 clk.parentNode.insertBefore(mk('div','fstat','<i class="dot"></i>All systems operational'),clk.parentNode.firstChild.nextSibling);
}

/* Split-Flap (Airport Departure Board) Scroll Animation for Footer Wordmark */
(function initSplitFlapWordmark(){
  var wordmark = $('footer .big');
  if(!wordmark) return;

  // Split existing wordmark text into spans via JS without retyping
  var rawText = (wordmark.getAttribute('aria-label') || wordmark.dataset.word || wordmark.textContent || 'INKPEN').trim().replace(/\s+/g, '');
  if(!rawText) rawText = 'INKPEN';

  wordmark.classList.add('split-flap-board');
  wordmark.innerHTML = '<div class="split-flap-row" role="presentation">' +
    rawText.split('').map(function(char, idx) {
      return (
        '<div class="split-flap-tile" style="--tile-i:' + idx + '" data-char="' + char + '" aria-hidden="true">' +
          '<div class="flap-half flap-top"><span class="flap-char">' + char + '</span></div>' +
          '<div class="flap-half flap-bottom"><span class="flap-char">' + char + '</span></div>' +
          '<div class="flap-seam" aria-hidden="true"></div>' +
          '<div class="flap-streak" aria-hidden="true"></div>' +
        '</div>'
      );
    }).join('') +
  '</div>';

  var tiles = $$('.split-flap-tile', wordmark);
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Interactive 3D micro-tilt on mouse hover
  tiles.forEach(function(tile){
    tile.addEventListener('mousemove', function(e){
      if(fine && !RM){
        var r = tile.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -14;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 14;
        tile.style.transform = 'perspective(800px) rotateX(' + rx.toFixed(1) + 'deg) rotateY(' + ry.toFixed(1) + 'deg) scale(1.02)';
      }
    });
    tile.addEventListener('mouseleave', function(){
      if(fine && !RM){
        tile.style.transform = '';
      }
    });
  });

  if(RM){
    wordmark.classList.add('is-flipped');
    tiles.forEach(function(tile){ tile.classList.add('flipped'); });
    return;
  }

  var timeouts = [];
  function clearTimeouts(){
    timeouts.forEach(function(t){ clearTimeout(t); });
    timeouts = [];
  }

  function playAnimation(){
    clearTimeouts();
    wordmark.classList.remove('is-flipped');
    tiles.forEach(function(tile){
      tile.classList.remove('flipping', 'flipped');
    });

    void wordmark.offsetWidth; // Force reflow
    wordmark.classList.add('is-flipped');

    tiles.forEach(function(tile, i){
      var tStart = setTimeout(function(){
        tile.classList.add('flipping');
      }, i * 120);
      timeouts.push(tStart);

      var tEnd = setTimeout(function(){
        tile.classList.remove('flipping');
        tile.classList.add('flipped');
      }, i * 120 + 520);
      timeouts.push(tEnd);
    });
  }

  function resetAnimation(){
    clearTimeouts();
    wordmark.classList.remove('is-flipped');
    tiles.forEach(function(tile){
      tile.classList.remove('flipping', 'flipped');
    });
  }

  // Trigger when ~30% visible; re-trigger each time it re-enters view
  if('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting && entry.intersectionRatio >= 0.3){
          playAnimation();
        } else if(!entry.isIntersecting || entry.intersectionRatio < 0.1){
          resetAnimation();
        }
      });
    }, {
      threshold: [0, 0.1, 0.3, 0.5]
    });
    observer.observe(wordmark);
  } else {
    playAnimation();
  }
})();


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


})();
