(function(){
function route(){var on=location.hash==='#contact-page';document.body.classList.toggle('cp-on',on);document.getElementById('links')&&document.getElementById('links').classList.remove('open');if(on)window.scrollTo(0,0);setTimeout(function(){try{window.ScrollTrigger&&ScrollTrigger.refresh()}catch(e){}},120)}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href="#contact-page"]');if(a){e.preventDefault();e.stopImmediatePropagation();if(location.hash==='#contact-page')route();else location.hash='contact-page'}},true);
window.addEventListener('hashchange',route);route();
var f=document.getElementById('cpform');
f.addEventListener('submit',function(e){e.preventDefault();
 var b='Name: '+cpn.value+'\nEmail: '+cpe.value+'\nPhone: '+cpp.value+'\nDivision: '+cpd.value+'\n\n'+cpm.value;
 var a=document.createElement('a');a.href='mailto:contact@inkpen.ink?subject='+encodeURIComponent('Inquiry: '+cpd.value)+'&body='+encodeURIComponent(b);document.body.appendChild(a);a.click();a.remove();
 document.getElementById('cpok').textContent='Opening your email app with your inquiry ready to send. If nothing opens, write to contact@inkpen.ink.'});
})();
