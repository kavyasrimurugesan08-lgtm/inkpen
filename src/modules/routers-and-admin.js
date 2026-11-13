/* ==========================================================================
   INKPEN Client Router & Interactive Behaviors
   - Public-facing navigation router (Home, About, Services, Careers, Projects, Contact)
   - Interactive Framer-style console switcher
   - "Ask INKPEN" plain-English assistant
   - Animated number counters
   - Mobile navigation controls
   ========================================================================== */

(function(){
  'use strict';

  var ANCHOR_MAP = {
    'services': 'div',
    'div': 'div',
    'about': 'story',
    'story': 'story',
    'projects': 'impact',
    'impact': 'impact',
    'footer': 'footer',
    'console': 'telemetry',
    'telemetry': 'telemetry',
    'process': 'process',
    'faq': 'faq',
    'ask': 'ask',
    'contact': 'contact'
  };

  var DVK = ['academy', 'tech', 'media'];

  function clearSubpages(){
    document.body.classList.remove('cp-on', 'cr-on', 'dv-on', 'pg-about', 'pg-services', 'pg-projects');
  }

  function scrollToSection(targetId){
    var el = document.getElementById(targetId);
    if(!el) return;
    if(window.lenis && typeof window.lenis.scrollTo === 'function'){
      window.lenis.scrollTo(el, { offset: -25, duration: 1.1 });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function applyRoute(){
    var hash = (location.hash || '').replace(/^#/, '').toLowerCase();

    if(hash === 'careers'){
      document.body.classList.remove('cp-on', 'dv-on', 'pg-about', 'pg-services', 'pg-projects');
      document.body.classList.add('cr-on');
      window.scrollTo({top: 0, behavior: 'smooth'});
    } else if(hash === 'contact-page'){
      document.body.classList.remove('cr-on', 'dv-on', 'pg-about', 'pg-services', 'pg-projects');
      document.body.classList.add('cp-on');
      window.scrollTo({top: 0, behavior: 'smooth'});
    } else if(DVK.indexOf(hash) > -1){
      // Handled by division deep dive modal router
    } else {
      // Full Landing Page Navigation
      clearSubpages();
      var targetId = ANCHOR_MAP[hash] || hash;
      var el = targetId ? document.getElementById(targetId) : null;
      if(el){
        scrollToSection(targetId);
      } else if(hash === 'top' || hash === 'home' || hash === ''){
        if(window.lenis && typeof window.lenis.scrollTo === 'function'){
          window.lenis.scrollTo(0, { duration: 0.9 });
        } else {
          window.scrollTo({top: 0, behavior: 'smooth'});
        }
      }
    }

    setTimeout(function(){
      try {
        if(window.ScrollTrigger) window.ScrollTrigger.refresh();
      } catch(e){}
    }, 120);
  }

  document.addEventListener('click', function(e){
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if(!a || a.target === '_blank') return;

    var href = a.getAttribute('href') || '';
    var target = href.replace(/^#/, '').toLowerCase();

    if(DVK.indexOf(target) > -1) return; // handled by division modal

    if(target === 'careers'){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(location.hash !== '#careers') location.hash = 'careers';
      else applyRoute();
    } else if(target === 'contact-page'){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(location.hash !== '#contact-page') location.hash = 'contact-page';
      else applyRoute();
    } else if(ANCHOR_MAP[target] || document.getElementById(target)){
      e.preventDefault();
      e.stopImmediatePropagation();
      clearSubpages();
      var sectionId = ANCHOR_MAP[target] || target;
      scrollToSection(sectionId);
      try {
        history.replaceState(null, '', '#' + target);
      } catch(err){}
    } else if(target === 'top' || target === 'home' || target === ''){
      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        history.replaceState(null, '', location.pathname + location.search);
      } catch(err){}
      clearSubpages();
      if(window.lenis && typeof window.lenis.scrollTo === 'function'){
        window.lenis.scrollTo(0, { duration: 0.9 });
      } else {
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    }
  }, true);

  window.addEventListener('hashchange', applyRoute);
  window.addEventListener('popstate', applyRoute);
  applyRoute();

  /* === Interactive Animated Navigation Overlay Menu === */
  (function initNavigationMenu(){
    var nav = document.querySelector('nav.glass');
    var bur = document.getElementById('bur');
    var links = document.getElementById('links');
    var overlay = document.getElementById('navOverlay');
    var closeBtn = document.getElementById('navOverlayClose');
    if(!bur) return;

    var isOpen = false;
    if(nav) nav.classList.remove('hide', 'mnav-off', 'mnav-on', 'menu-open');
    if(links) links.removeAttribute('hidden');

    function syncActiveLinks(){
      var h = (location.hash || '#top').toLowerCase();
      if(h === '#' || h === '') h = '#top';
      if(links){
        var items = links.querySelectorAll('a[href]');
        for(var i = 0; i < items.length; i++){
          var href = (items[i].getAttribute('href') || '').toLowerCase();
          items[i].classList.toggle('active', href === h);
        }
      }
      if(overlay){
        var oLinks = overlay.querySelectorAll('.nav-item-link, .overlay-sub-nav a');
        for(var j = 0; j < oLinks.length; j++){
          var oHref = (oLinks[j].getAttribute('href') || '').toLowerCase();
          oLinks[j].classList.toggle('active', oHref === h);
        }
      }
    }

    function setMenu(open){
      isOpen = !!open;
      if(nav) nav.classList.toggle('menu-open', isOpen);
      if(links) links.classList.toggle('open', isOpen);
      bur.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      if(overlay){
        overlay.classList.toggle('open', isOpen);
        overlay.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      }

      // Prevent background scrolling while the menu is open
      if(isOpen){
        document.body.classList.add('nav-menu-open');
        document.documentElement.classList.add('nav-menu-locked');
        syncActiveLinks();
      } else {
        document.body.classList.remove('nav-menu-open');
        document.documentElement.classList.remove('nav-menu-locked');
      }
    }

    setMenu(false);
    syncActiveLinks();

    // Toggle on burger click (desktop, tablet, and mobile)
    bur.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      setMenu(!isOpen);
    });

    // Close button inside overlay
    if(closeBtn){
      closeBtn.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        setMenu(false);
        bur.focus();
      });
    }

    // Close when clicking overlay backdrop
    if(overlay){
      overlay.addEventListener('click', function(e){
        if(e.target === overlay || (e.target.classList && e.target.classList.contains('nav-overlay-backdrop'))){
          setMenu(false);
        }
      });
    }

    // Close menu automatically after selecting ANY navigation item
    window.addEventListener('click', function(e){
      var t = e.target;
      if(!t || !t.closest) return;
      var link = t.closest('#navOverlay a[href], #links a, nav.glass .logo, nav.glass .navr a:not(#bur)');
      if(link){
        if(isOpen) setMenu(false);
        syncActiveLinks();
      } else if(isOpen && overlay && !overlay.contains(t) && !bur.contains(t)){
        setMenu(false);
      }
    }, true);

    // Close on Escape key
    window.addEventListener('keydown', function(e){
      if(isOpen && (e.key === 'Escape' || e.key === 'Esc')){
        setMenu(false);
        bur.focus();
      }
    });

    window.addEventListener('hashchange', function(){
      if(isOpen) setMenu(false);
      syncActiveLinks();
    });
  })();

  /* === Hero Framer Console Switcher === */
  (function initHeroConsole(){
    var consoleHost = document.getElementById('heroConsole');
    if(!consoleHost) return;

    var tabs = consoleHost.querySelectorAll('.c-tab');
    var panels = consoleHost.querySelectorAll('.c-panel');

    function selectTab(tabKey){
      tabs.forEach(function(btn){
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
      });
      panels.forEach(function(pnl){
        var match = pnl.getAttribute('data-panel') === tabKey;
        pnl.classList.toggle('active', match);
        if(match && !matchMedia('(prefers-reduced-motion:reduce)').matches){
          pnl.animate([
            {opacity: 0, transform: 'translateY(8px)'},
            {opacity: 1, transform: 'translateY(0)'}
          ], {duration: 340, easing: 'cubic-bezier(.16,1,.3,1)'});
        }
      });
    }

    tabs.forEach(function(btn){
      btn.addEventListener('click', function(){
        selectTab(btn.getAttribute('data-tab'));
      });
      btn.addEventListener('mouseenter', function(){
        selectTab(btn.getAttribute('data-tab'));
      });
    });
  })();

  /* === "Ask INKPEN" Plain-English Assistant === */
  (function initAskAssistant(){
    var askSec = document.getElementById('ask');
    if(!askSec) return;

    var qBtns = askSec.querySelectorAll('.ask-prompt-pill');
    var answerCards = askSec.querySelectorAll('.ask-answer-card');

    qBtns.forEach(function(btn){
      btn.addEventListener('click', function(){
        var qId = btn.getAttribute('data-q');
        qBtns.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');

        answerCards.forEach(function(card){
          var isMatch = card.getAttribute('data-answer') === qId;
          card.classList.toggle('active', isMatch);
          if(isMatch && !matchMedia('(prefers-reduced-motion:reduce)').matches){
            card.animate([
              {opacity: 0, transform: 'translateY(10px) scale(0.99)'},
              {opacity: 1, transform: 'translateY(0) scale(1)'}
            ], {duration: 360, easing: 'cubic-bezier(.16,1,.3,1)'});
          }
        });
      });
    });
  })();

  /* === Animated Counters on Scroll === */
  (function initAnimatedCounters(){
    var counters = document.querySelectorAll('[data-c]');
    if(!counters.length) return;

    function countUp(el){
      var target = parseFloat(el.getAttribute('data-c')) || 0;
      var suffix = el.getAttribute('data-s') || '';
      var prefix = el.getAttribute('data-p') || '';
      var duration = 1400;
      var start = performance.now();

      function step(now){
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var ease = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(ease * target);

        el.textContent = prefix + current.toLocaleString() + suffix;
        if(progress < 1){
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target.toLocaleString() + suffix;
        }
      }

      requestAnimationFrame(step);
    }

    if('IntersectionObserver' in window){
      var counterObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            countUp(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, {threshold: 0.2});

      counters.forEach(function(c){ counterObserver.observe(c); });
    } else {
      counters.forEach(function(c){ countUp(c); });
    }
  })();

})();
