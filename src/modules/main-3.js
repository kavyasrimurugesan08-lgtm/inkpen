(function(){
var jobs=[],flt='All',db=null,isAdmin=false,D=['All','Tech','Academy','Media','Corporate'];
function $(i){return document.getElementById(i)}
function route(){var s=location.hash;document.body.classList.toggle('cr-on',s==='#careers');document.body.classList.toggle('ad-on',s==='#admin');if(s==='#careers'||s==='#admin')window.scrollTo(0,0);setTimeout(function(){try{window.ScrollTrigger&&ScrollTrigger.refresh()}catch(e){}},120)}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href="#careers"],a[href="#admin"]');if(a){e.preventDefault();e.stopImmediatePropagation();var h=a.getAttribute('href');if(location.hash===h)route();else location.hash=h.slice(1)}},true);
window.addEventListener('hashchange',route);route();
function el(t,c,x){var n=document.createElement(t);if(c)n.className=c;if(x!=null)n.textContent=x;return n}
function render(){
 var f=$('jbf');f.textContent='';D.forEach(function(d){var b=el('button','btn'+(d===flt?' on':''),d);b.onclick=function(){flt=d;render()};f.appendChild(b)});
 var g=$('jbg');g.textContent='';var l=jobs.filter(function(j){return j.status!=='Closed'&&(flt==='All'||j.division===flt)});
 if(!l.length){g.appendChild(el('p','mute jb-empty','No openings right now. Please check back soon.')).style.gridColumn='1/-1'}
 l.forEach(function(j){var c=el('article','jb');var t=el('div','jb-t');[j.division,j.location,j.type].forEach(function(x){if(x)t.appendChild(el('span','',x))});
  c.appendChild(t);c.appendChild(el('h3','',j.title));c.appendChild(el('p','mute',j.description));
  var a=el('a','btn p','Apply →');a.href='mailto:careers@inkpen.ink?subject='+encodeURIComponent('Application: '+j.title);c.appendChild(a);g.appendChild(c)});
 var L=$('adlist');if(L){L.textContent='';if(!jobs.length)L.appendChild(el('p','mute','No openings yet.'));
  jobs.forEach(function(j){var r=el('div','ad-row');var d=el('div');d.appendChild(el('b','',j.title));d.appendChild(el('small','',[j.division,j.location,j.type].filter(Boolean).join(' · ')));r.appendChild(d);
   var eb=el('button','','Edit');eb.onclick=function(){window.__inkpenEditJob(j)};r.appendChild(eb);var b=el('button','','Delete');b.onclick=function(){if(confirm('Delete "'+j.title+'"?'))db.collection('jobs').doc(j.id).delete().catch(function(){alert('Could not delete.')})};r.appendChild(b);L.appendChild(r)})}
}
render();
(async function(){
 try{var u=await claude.use('user');isAdmin=u?await u.canEdit():false}catch(e){}
 if(isAdmin){var _l=$('adlink');if(_l)_l.hidden=false;var _k=$('adlock');if(_k)_k.hidden=true;var _b=$('adbody');if(_b)_b.hidden=false}
 try{db=await claude.use('db')}catch(e){}
 if(!db){$('jbg').textContent='';$('jbg').appendChild(el('p','mute jb-empty','Openings could not be loaded here. Please email careers@inkpen.ink.')).style.gridColumn='1/-1';return}
 var to=setTimeout(function(){},10000);
 db.collection('jobs').onSnapshot(function(s){clearTimeout(to);jobs=s.docs.map(function(d){var x=d.data()||{};x.id=d.id;return x}).sort(function(a,b){return (b.created||0)-(a.created||0)});render()},function(){});
 $('jf').addEventListener('submit',function(e){e.preventDefault();if(window.__inkpenEditId){var eid=window.__inkpenEditId;window.__inkpenEditId=null;var uo={title:$('jt').value.trim(),division:$('jd').value,location:$('jl').value.trim(),type:$('jy').value,description:$('jx').value.trim()};db.collection('jobs').doc(eid).update(uo).then(function(){$('jf').reset();$('jok').textContent='Opening updated. It is live on the Careers page.'}).catch(function(){$('jok').textContent='Could not update.'});return}var o={title:$('jt').value.trim(),division:$('jd').value,location:$('jl').value.trim(),type:$('jy').value,description:$('jx').value.trim(),created:Date.now()};
  db.collection('jobs').add(o).then(function(){$('jf').reset();$('jok').textContent='Published. It is now live on the Careers page.'}).catch(function(){$('jok').textContent='Could not publish. Only the owner can add jobs.'})});
})();
})();
