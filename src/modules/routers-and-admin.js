/* === admin-login (reads credentials from .env) === */
const _winEnv = (typeof window !== 'undefined' && window.__INKPEN_ENV__) ? window.__INKPEN_ENV__ : {};
const _buildEnv = (typeof __INKPEN_BUILD_ENV__ !== 'undefined' && __INKPEN_BUILD_ENV__) ? __INKPEN_BUILD_ENV__ : {};
const _metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

(function(){
var U = _winEnv.ADMIN_USERNAME || _buildEnv.ADMIN_USERNAME || _metaEnv.ADMIN_USERNAME || _metaEnv.VITE_ADMIN_USERNAME || 'jawaharkumar';
var P = _winEnv.ADMIN_PASSWORD || _buildEnv.ADMIN_PASSWORD || _metaEnv.ADMIN_PASSWORD || _metaEnv.VITE_ADMIN_PASSWORD || 'admin123';
var K = 'inkpen-admin-ok';
var $=function(i){return document.getElementById(i)};
var lock=$('adlock'),body=$('adbody'),f=$('alf');if(!lock||!body||!f)return;
function open(){lock.hidden=true;body.hidden=false;var l=$('adlink');if(l)l.hidden=false}
function shut(){body.hidden=true;lock.hidden=false;f.reset();$('alerr').textContent=''}
function verify(){
 if($('alu').value.trim().toLowerCase()===U.trim().toLowerCase()&&$('alp').value===P){
  try{sessionStorage.setItem(K,'1')}catch(x){}open();$('alp').value='';
 }else{
  $('alerr').textContent='Incorrect username or password.';lock.classList.remove('bad');void lock.offsetWidth;lock.classList.add('bad');
 }
}
try{if(sessionStorage.getItem(K)==='1')open()}catch(e){}
f.addEventListener('submit',function(e){e.preventDefault();verify()});
var sb=f.querySelector('button[type=submit]');if(sb)sb.addEventListener('click',function(e){e.preventDefault();verify()});
var eye=$('alye');eye.addEventListener('click',function(){var s=$('alp').type==='password';$('alp').type=s?'text':'password';eye.classList.toggle('on',s);eye.setAttribute('aria-label',s?'Hide password':'Show password');eye.setAttribute('aria-pressed',s)});
$('alout').addEventListener('click',function(){try{sessionStorage.removeItem(K)}catch(e){}shut()});
})();

/* === inkpen-admin-edit === */
(function(){
var EDIT_TAGS='h1,h2,h3,h4,h5,h6,p,li,summary,figcaption,blockquote,dt,dd,label,span,small,b,strong,em,i,td,th';
var TEXT_SKIP='.lens,.hint,.fl,.scue,.fstat,.ci,#adpage,#loader,#cur,#dot,#dv,#jbg,#adlist,#jbf,#adTb,nav,script,style,button,input,select,textarea,form,a.btn,.ad-toolbar';
var IMG_SKIP='#adpage,#loader,#dv,#adTb';
var saved={texts:{},imgs:{}}, dirty={texts:{},imgs:{}}, db=null, on=false, tb, fileIn, pendingImg=null;
var INLINE=false;
function $(i){return document.getElementById(i)}
function status(m){var s=$('adSt');if(s)s.textContent=m}
function pathOf(el){var parts=[];while(el&&el!==document.body&&el.parentElement){var p=el.parentElement,tag=el.tagName;var same=[].filter.call(p.children,function(c){return c.tagName===tag});parts.unshift(tag.toLowerCase()+':'+(same.indexOf(el)+1));el=p}return parts.join('>')}
function resolve(path){var el=document.body,segs=path.split('>');for(var i=0;i<segs.length;i++){var m=segs[i].match(/^(\w+):(\d+)$/);if(!m)return null;var tag=m[1].toUpperCase(),n=+m[2];var same=[].filter.call(el.children,function(c){return c.tagName===tag});el=same[n-1];if(!el)return null}return el}
function isLeaf(el){return !el.querySelector(EDIT_TAGS)}
function editables(){return [].filter.call(document.querySelectorAll(EDIT_TAGS),function(el){return !el.closest(TEXT_SKIP)&&isLeaf(el)&&el.textContent.trim().length>0})}
function images(){return [].filter.call(document.images,function(im){return !im.closest(IMG_SKIP)})}
function hash(s){var h=5381;for(var i=0;i<s.length;i++){h=((h<<5)+h+s.charCodeAt(i))|0}return (h>>>0).toString(36)}
function applyTexts(map){for(var k in map){var el=resolve(k);if(el&&isLeaf(el)&&el!==document.activeElement)el.textContent=map[k]}}
function applyImgs(map){for(var k in map){var el=resolve(k);if(el&&el.tagName==='IMG')el.src=map[k]}}
function applyAll(){applyTexts(saved.texts);applyTexts(dirty.texts);applyImgs(saved.imgs);applyImgs(dirty.imgs)}
function encode(im,mime,w,h,q){var c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);return c.toDataURL(mime,q)}
function shrink(file,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var mime=file.type==='image/png'?'image/png':'image/jpeg';var s=Math.min(1,1000/Math.max(im.width,im.height));var w=Math.round(im.width*s),h=Math.round(im.height*s),q=0.85;var d=encode(im,mime,w,h,q),n=0;while(d.length>240000&&n<10){n++;if(mime==='image/jpeg'&&q>0.5){q-=0.15}else{w=Math.round(w*0.8);h=Math.round(h*0.8)}d=encode(im,mime,w,h,q)}cb(d.length>240000?null:d)};im.onerror=function(){cb(null)};im.src=r.result};r.onerror=function(){cb(null)};r.readAsDataURL(file)}

function groupOf(el){var sec=el.closest('section,footer,nav,header');if(!sec)return 'Other';if(sec.id)return sec.id;return sec.getAttribute('aria-label')||sec.tagName.toLowerCase()}
function refreshThumb(im,d){var k=pathOf(im);document.querySelectorAll('[data-admin-thumb]').forEach(function(t){if(t.getAttribute('data-admin-thumb')===k)t.src=d})}
var FIELD={p:'Paragraph',h1:'Main heading',h2:'Heading',h3:'Sub-heading',h4:'Sub-heading',h5:'Sub-heading',h6:'Sub-heading',li:'List item',summary:'Question',blockquote:'Quote',figcaption:'Caption',label:'Label',td:'Table cell',th:'Table cell',dt:'Term',dd:'Definition',span:'Text',small:'Small text',b:'Bold text',strong:'Bold text',em:'Highlighted text',i:'Italic text'};
var LBL={hero:'Hero',story:'Story',div:'Divisions',impact:'Impact',process:'Process',faq:'FAQ',contact:'Contact',footer:'Footer',nav:'Navbar',crpage:'Careers page',cpage:'Contact page',dv:'Division pages',Other:'Other'};
function buildPanel(){
 var host=$('adSecs');if(!host||host.getAttribute('data-built'))return;host.setAttribute('data-built','1');
 var groups={},order=[];
 function bucket(g){if(!groups[g]){groups[g]={t:[],i:[]};order.push(g)}return groups[g]}
 editables().forEach(function(el){bucket(groupOf(el)).t.push(el)});
 images().forEach(function(im){bucket(groupOf(im)).i.push(im)});
 window.__adGroups=groups;
 order.forEach(function(g){
  var n=groups[g].t.length+groups[g].i.length;if(!n)return;
  var b=document.createElement('button');b.type='button';b.className='ad-nav';b.textContent=(LBL[g]||g)+' ('+n+')';
  b.onclick=function(){showPane(g,b)};host.appendChild(b)});
}
function showPane(g,btn){
 document.querySelectorAll('#adSide .ad-nav').forEach(function(x){x.classList.toggle('on',x===btn)});
 $('pn-jobs').hidden=true;$('pn-site').hidden=false;setTimeout(function(){$('pn-site').scrollIntoView({behavior:'smooth',block:'start'})},30);
 $('pnTitle').textContent=LBL[g]||g;
 var body=$('pnBody');body.textContent='';
 var G=window.__adGroups[g];
 G.t.forEach(function(el){
  var key=pathOf(el);var lab=document.createElement('label');lab.className='ad-field';
  var tag=el.tagName.toLowerCase();var s=document.createElement('span');s.textContent=FIELD[tag]||'Text';lab.appendChild(s);
  var ta=document.createElement('textarea');ta.rows=Math.min(6,Math.max(1,Math.ceil(el.textContent.length/80)));ta.value=el.textContent;
  ta.addEventListener('input',function(){el.textContent=ta.value;dirty.texts[key]=ta.value;status('Unsaved changes')});
  lab.appendChild(ta);body.appendChild(lab)});
 G.i.forEach(function(im){
  var key=pathOf(im);var row=document.createElement('div');row.className='ci';
  var th=document.createElement('img');th.src=im.src;th.setAttribute('data-admin-thumb',key);th.alt='';
  var nm=document.createElement('span');nm.textContent='Image'+(im.alt?' · '+im.alt:'');
  var b=document.createElement('button');b.className='btn';b.type='button';b.textContent='Replace image';
  b.onclick=function(){pendingImg=im;fileIn.click()};
  row.appendChild(th);row.appendChild(nm);row.appendChild(b);body.appendChild(row)});
 if(!body.childNodes.length)body.innerHTML='<p class="mute">Nothing to edit here.</p>';
}
function sync(){if(tb)tb.hidden=!(on&&document.body.classList.contains('ad-on'))}
function setEdit(v){
 if(v===on)return; on=v;
 if(v){buildPanel();status('Edit any text or image in the list below, then click Save changes.')}
 else{var c=$('adContent');if(c)c.remove()}
 sync();
}
function save(){
 if(!db){status('Not connected to the database. Use Download HTML to keep your changes.');return}
 var texts=Object.assign({},saved.texts,dirty.texts);
 var ops=[db.collection('site').doc('content').set({texts:texts,updated:Date.now()})];
 Object.keys(dirty.imgs).forEach(function(k){ops.push(db.collection('site').doc('img-'+hash(k)).set({key:k,src:dirty.imgs[k]}))});
 status('Saving...');
 Promise.all(ops).then(function(){Object.keys(dirty.imgs).forEach(function(k){saved.imgs[k]=dirty.imgs[k]});saved.texts=texts;dirty={texts:{},imgs:{}};status('Saved. Visitors now see these changes.')})
  .catch(function(){status('Could not save. Only the site owner can publish changes.')})
}
function download(){
 var clone=document.documentElement.cloneNode(true);
 var t2=clone.querySelector('#adTb');if(t2)t2.remove();
 clone.querySelectorAll('[contenteditable]').forEach(function(e){e.removeAttribute('contenteditable')});
 clone.querySelector('body').classList.remove('site-edit');
 var blob=new Blob(['<!DOCTYPE html>\n'+clone.outerHTML],{type:'text/html'});
 var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='INKPEN_Home.html';document.body.appendChild(a);a.click();
 setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000);
}

function init(){
 tb=document.createElement('div');tb.className='ad-toolbar';tb.id='adTb';tb.hidden=true;
 tb.innerHTML='<span>Editing site</span><span id="adSt"></span><button class="btn p" id="adSave" type="button">Save changes</button><button class="btn" id="adDl" type="button">Download HTML</button><button class="btn" id="adDis" type="button">Discard</button>';
 
 fileIn=document.createElement('input');fileIn.type='file';fileIn.accept='image/*';fileIn.hidden=true;document.body.appendChild(fileIn);
 $('adSave').onclick=save;
 $('adDl').onclick=download;
 $('adDis').onclick=function(){if(Object.keys(dirty.texts).length||Object.keys(dirty.imgs).length){if(!confirm('Discard unsaved changes?'))return}location.reload()};
 fileIn.addEventListener('change',function(){var f=fileIn.files[0];fileIn.value='';if(!f||!pendingImg)return;var im=pendingImg;pendingImg=null;
  shrink(f,function(d){if(!d){status('Image is too large. Try a smaller file.');return}dirty.imgs[pathOf(im)]=d;im.src=d;refreshThumb(im,d);status('Image changed. Click Save changes to publish.')})});

 document.addEventListener('click',function(e){
  if(!INLINE||!on)return;var t=e.target;
  if(t.closest&&t.closest('#adpage,#adTb'))return;
  if(t.isContentEditable){e.stopPropagation();if(t.closest('a'))e.preventDefault();return}
  var im=t.closest&&t.closest('img');
  if(im&&!im.closest('#loader,#dv')){e.preventDefault();e.stopPropagation();pendingImg=im;fileIn.click()}
 },true);
 document.addEventListener('input',function(e){
  if(!INLINE||!on)return;var el=e.target;if(!el.isContentEditable||el.closest('#adpage'))return;
  dirty.texts[pathOf(el)]=el.textContent;status('Unsaved changes');
 });
 document.addEventListener('paste',function(e){
  if(!INLINE||!on||!e.target.isContentEditable)return;e.preventDefault();
  document.execCommand('insertText',false,(e.clipboardData||window.clipboardData).getData('text/plain'));
 });
 document.addEventListener('keydown',function(e){
  if(!INLINE||!on||e.key!=='Enter'||!e.target.isContentEditable)return;
  if(e.target.tagName!=='P'&&e.target.tagName!=='LI'&&e.target.tagName!=='BLOCKQUOTE')e.preventDefault();
 });

 new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});
sync();
var ad=$('adbody');
 if(ad){new MutationObserver(function(){setEdit(!ad.hidden)}).observe(ad,{attributes:true,attributeFilter:['hidden']});setEdit(!ad.hidden)}

 window.__inkpenEditJob=function(j){
  $('jt').value=j.title||'';$('jd').value=j.division||'Tech';$('jl').value=j.location||'';$('jy').value=j.type||'Full-time';$('jx').value=j.description||'';
  window.__inkpenEditId=j.id;$('jok').textContent='Editing "'+(j.title||'')+'". Click Publish to save this change.';
  $('jf').scrollIntoView({behavior:'smooth',block:'center'});
 };

 (async function(){
  try{db=await claude.use('db')}catch(e){db=null}
  if(!db)return;
  db.collection('site').onSnapshot(function(snap){
   saved={texts:{},imgs:{}};
   snap.docs.forEach(function(d){var x=d.data()||{};if(d.id==='content')saved.texts=x.texts||{};else if(x.key)saved.imgs[x.key]=x.src});
   applyAll();
  },function(){});
 })();
}
if(document.readyState==='complete')init();else addEventListener('load',init);
})();

/* === admin-nav === */
(function(){
var menu=document.getElementById('adSide');if(!menu)return;
function setOn(btn){document.querySelectorAll('#adSide .ad-nav').forEach(function(x){x.classList.toggle('on',x===btn)})}
function show(id){var el=document.getElementById(id);el.hidden=false;setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'start'})},30)}
function hideAll(){document.getElementById('pn-jobs').hidden=true;document.getElementById('pn-site').hidden=true}
menu.querySelector('[data-k=jobs]').addEventListener('click',function(e){var j=e.currentTarget;hideAll();setOn(j);show('pn-jobs')});
document.querySelectorAll('#adMain [data-close]').forEach(function(c){c.addEventListener('click',function(){hideAll();setOn(null)})});
})();

/* === admin-theme === */
(function(){
var b=document.getElementById('adTheme');if(!b)return;
function lbl(){b.textContent=document.documentElement.getAttribute('data-theme')==='light'?'Dark mode':'Light mode'}
b.addEventListener('click',function(){var t=document.getElementById('theme');if(t)t.click();setTimeout(lbl,0)});
new MutationObserver(lbl).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});lbl();
})();

/* === admin-ui === */
(function(){
var sh=document.getElementById('adShell');
var c=document.getElementById('adCollapse');
if(c&&sh)c.addEventListener('click',function(){var off=sh.classList.toggle('collapsed');c.setAttribute('aria-expanded',String(!off));c.textContent=off?'›':'‹';c.setAttribute('aria-label',off?'Open menu':'Close menu')});
var g=document.getElementById('adGrpBtn'),s=document.getElementById('adSecs');
if(g&&s)g.addEventListener('click',function(){var open=s.hidden;s.hidden=!open;g.setAttribute('aria-expanded',String(open));g.classList.toggle('shut',!open)});
})();

/* === page-router === */
(function(){
  var PAGES={story:'pg-story',div:'pg-div',impact:'pg-impact'};
  var DVK=['academy','tech','media'];
  function byId(i){return document.getElementById(i)}
  function applyPage(){
    var h=location.hash.slice(1);
    Object.keys(PAGES).forEach(function(k){document.body.classList.toggle(PAGES[k],h===k)});
    setTimeout(function(){try{window.ScrollTrigger&&ScrollTrigger.refresh()}catch(e){}},120);
  }
  function clearOthers(){
    document.body.classList.remove('cp-on','cr-on','dv-on');
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');
    if(!a||a.target==='_blank')return;
    var n=(a.getAttribute('href')||'').slice(1)||'top';
    if(n==='contact-page'||n==='careers'||n==='admin'||DVK.indexOf(n)>-1)return; // handled by their own routers
    e.preventDefault();
    clearOthers();
    if(PAGES[n]){
      e.stopImmediatePropagation();
      if(location.hash!=='#'+n)location.hash=n;   // fires hashchange
      applyPage();
      window.scrollTo(0,0);
    }else if(n==='top'){
      e.stopImmediatePropagation();
      history.replaceState(null,'',location.pathname+location.search);
      applyPage();
      window.scrollTo(0,0);
    }else{
      // a section that lives on the Home page: show Home, then let the site's own scroll handler run
      history.replaceState(null,'','#'+n);
      applyPage();
    }
  },true);
  window.addEventListener('hashchange',applyPage);
  window.addEventListener('popstate',applyPage);
  applyPage();
})();

/* === mobile-nav === */
(function(){
  var nav=document.querySelector('nav.glass');
  var bur=document.getElementById('bur');
  var links=document.getElementById('links');
  if(!nav||!bur||!links)return;

  var isOpen=false;
  nav.classList.remove('hide','mnav-off','mnav-on','menu-open');
  links.removeAttribute('hidden');

  function targetEl(e){
    var t=e&&e.target;
    return t&&t.nodeType===1?t:(t&&t.parentElement)||null;
  }

  function syncActiveLink(overrideHash){
    var h=(overrideHash||location.hash||'#top').toLowerCase();
    if(h==='#'||h==='')h='#top';
    var items=links.querySelectorAll('a[href]');
    for(var i=0;i<items.length;i++){
      var href=(items[i].getAttribute('href')||'').toLowerCase();
      items[i].classList.toggle('active',href===h);
    }
  }

  function setMenu(open){
    isOpen=!!open;
    nav.classList.toggle('menu-open',isOpen);
    links.classList.toggle('open',isOpen);
    bur.setAttribute('aria-expanded',isOpen?'true':'false');
    if(isOpen)syncActiveLink();
  }

  setMenu(false);
  syncActiveLink();

  // Touch & click toggle on the menu icon (touch-action: manipulation avoids 300ms delay & double-trigger)
  bur.addEventListener('click',function(e){
    e.preventDefault();
    e.stopPropagation();
    setMenu(!isOpen);
  });

  // Auto-close when selecting any menu item (window capture runs before document capture routers)
  window.addEventListener('click',function(e){
    var el=targetEl(e);
    if(!el||!el.closest)return;
    var link=el.closest('#links a, nav.glass .logo, nav.glass .navr a');
    if(link){
      if(isOpen)setMenu(false);
      syncActiveLink(link.getAttribute('href'));
      setTimeout(function(){syncActiveLink();},0);
    }
  },true);

  // Close when touching or clicking outside the navbar
  function onOutsidePress(e){
    if(!isOpen)return;
    var el=targetEl(e);
    if(el&&!nav.contains(el))setMenu(false);
  }
  if(window.PointerEvent){
    window.addEventListener('pointerdown',onOutsidePress,{passive:true});
  }else{
    window.addEventListener('touchstart',onOutsidePress,{passive:true});
    window.addEventListener('mousedown',onOutsidePress);
  }

  // Close on Escape key & route changes
  window.addEventListener('keydown',function(e){
    if(isOpen&&(e.key==='Escape'||e.key==='Esc')){
      setMenu(false);
      bur.focus();
    }
  });
  window.addEventListener('hashchange',function(){
    if(isOpen)setMenu(false);
    syncActiveLink();
  });
  window.addEventListener('popstate',function(){
    if(isOpen)setMenu(false);
    syncActiveLink();
  });
})();
