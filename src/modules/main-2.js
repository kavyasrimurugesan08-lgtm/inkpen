(function(){
function $(i){return document.getElementById(i)}
function route(){var on=location.hash==='#contact-page';document.body.classList.toggle('cp-on',on);if(on)window.scrollTo(0,0);setTimeout(function(){try{window.ScrollTrigger&&ScrollTrigger.refresh()}catch(e){}},120)}
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href="#contact-page"]');if(a){e.preventDefault();e.stopImmediatePropagation();if(location.hash==='#contact-page')route();else location.hash='contact-page'}},true);
window.addEventListener('hashchange',route);route();
var f=$('cpform');
if(f)f.addEventListener('submit',function(e){e.preventDefault();
 var cpn=$('cpn'),cpe=$('cpe'),cpp=$('cpp'),cpd=$('cpd'),cpm=$('cpm');
 var b='Name: '+(cpn?cpn.value:'')+'\nEmail: '+(cpe?cpe.value:'')+'\nPhone: '+(cpp?cpp.value:'')+'\nDivision: '+(cpd?cpd.value:'')+'\n\n'+(cpm?cpm.value:'');
 var a=document.createElement('a');a.href='mailto:contact@inkpen.ink?subject='+encodeURIComponent('Inquiry: '+(cpd?cpd.value:''))+'&body='+encodeURIComponent(b);document.body.appendChild(a);a.click();a.remove();
 if($('cpok'))$('cpok').textContent='Opening your email app with your inquiry ready to send. If nothing opens, write to contact@inkpen.ink.'});
})();
