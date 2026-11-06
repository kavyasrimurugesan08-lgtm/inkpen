/* Live Sync Engine & Backend API Adapter for INKPEN Public Website <-> Admin Panel */
(function () {
  var API_BASE = window.INKPEN_API_BASE || 'http://localhost:4000/api';
  var ADMIN_SYNC_URL = window.INKPEN_ADMIN_SYNC || 'http://localhost:5174/sync.html';
  var LS_STATE = 'inkpen-admin-v3';
  var LS_JOBS = 'inkpen_jobs_v1';
  var LS_SITE = 'inkpen.site.v1';

  var listeners = { jobs: [], site: [] };
  var currentState = null;
  var activeProjCat = 'All';
  var syncIframe = null;
  var syncReady = false;
  var pendingMessages = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function postToSyncBridge(msg) {
    if (syncIframe && syncIframe.contentWindow && syncReady) {
      try { syncIframe.contentWindow.postMessage(msg, '*'); } catch (e) {}
    } else {
      pendingMessages.push(msg);
    }
  }

  function setupSyncBridge() {
    if (syncIframe || !document.body) return;
    syncIframe = document.createElement('iframe');
    syncIframe.src = ADMIN_SYNC_URL;
    syncIframe.style.cssText = 'display:none;width:0;height:0;border:0;position:absolute;pointer-events:none';
    syncIframe.setAttribute('aria-hidden', 'true');
    syncIframe.onload = function () {
      syncReady = true;
      postToSyncBridge({ type: 'INKPEN_GET_STATE' });
      while (pendingMessages.length) {
        var m = pendingMessages.shift();
        try { syncIframe.contentWindow.postMessage(m, '*'); } catch (e) {}
      }
    };
    document.body.appendChild(syncIframe);
  }

  function readLocalState() {
    try { return JSON.parse(localStorage.getItem(LS_STATE) || 'null'); } catch (e) { return null; }
  }
  function writeLocalState(s) {
    try { localStorage.setItem(LS_STATE, JSON.stringify(s)); } catch (e) {}
  }
  function readLocalJobs() {
    if (currentState && Array.isArray(currentState.jobs)) return currentState.jobs;
    try { return JSON.parse(localStorage.getItem(LS_JOBS) || '[]'); } catch (e) { return []; }
  }
  function writeLocalJobs(list) {
    try { localStorage.setItem(LS_JOBS, JSON.stringify(list)); } catch (e) {}
    if (currentState) {
      currentState.jobs = list;
      writeLocalState(currentState);
    }
    postToSyncBridge({ type: 'INKPEN_UPDATE_JOBS', jobs: list });
  }
  function readLocalSite() {
    if (currentState && currentState.siteContent) return currentState.siteContent;
    try { return JSON.parse(localStorage.getItem(LS_SITE) || '{"texts":{},"imgs":{}}'); } catch (e) { return { texts: {}, imgs: {} }; }
  }
  function writeLocalSite(data) {
    try { localStorage.setItem(LS_SITE, JSON.stringify(data)); } catch (e) {}
    if (currentState) {
      currentState.siteContent = data;
      writeLocalState(currentState);
    }
    postToSyncBridge({ type: 'INKPEN_UPDATE_SITE_CONTENT', siteContent: data });
  }

  function notifyJobs(jobs) {
    var docs = (jobs || []).map(function (j) {
      return { id: String(j.id), data: function () { return j; } };
    });
    listeners.jobs.forEach(function (cb) {
      try { cb({ docs: docs }); } catch (e) {}
    });
  }

  function notifySite(content) {
    var docs = [];
    var c = content || { texts: {}, imgs: {} };
    docs.push({
      id: 'content',
      data: function () { return { texts: c.texts || {} }; }
    });
    var imgs = c.imgs || {};
    Object.keys(imgs).forEach(function (k) {
      docs.push({
        id: 'img-' + k,
        data: function () { return { key: k, src: imgs[k] }; }
      });
    });
    listeners.site.forEach(function (cb) {
      try { cb({ docs: docs }); } catch (e) {}
    });
  }

  /* ---- Apply Admin Panel State to Public Website DOM ---- */
  function applyAdminStateToDOM(S) {
    if (!S || typeof S !== 'object') return;
    currentState = S;
    writeLocalState(S);

    // 1. Sync Jobs to Careers Page
    if (Array.isArray(S.jobs)) {
      try { localStorage.setItem(LS_JOBS, JSON.stringify(S.jobs)); } catch (e) {}
      notifyJobs(S.jobs);
    }

    // 2. Sync Inline CMS siteContent if present
    if (S.siteContent) {
      notifySite(S.siteContent);
    }

    // 3. Apply Website Content (Hero, Story, Divisions, Impact, CTA, Footer)
    var c = S.content;
    if (c && typeof c === 'object') {
      var pill = document.querySelector('#hero .pill');
      if (pill && c.heroPill) pill.textContent = c.heroPill;

      var h1Spans = document.querySelectorAll('#hero h1 .ln > span');
      if (h1Spans.length >= 3) {
        if (c.heroLine1) {
          var words = c.heroLine1.split(' ');
          if (words.length > 1) {
            var last = words.pop();
            h1Spans[0].innerHTML = esc(words.join(' ')) + ' <em>' + esc(last) + '</em>';
          } else {
            h1Spans[0].textContent = c.heroLine1;
          }
        }
        if (c.heroLine2) h1Spans[1].textContent = c.heroLine2;
        if (c.heroLine3) h1Spans[2].textContent = c.heroLine3;
      }

      var heroSub = document.querySelector('#hero p.mute');
      if (heroSub && c.heroSub) heroSub.textContent = c.heroSub;

      var heroBtn = document.querySelector('#hero .hero-row a.btn');
      if (heroBtn && c.heroBtn) heroBtn.textContent = c.heroBtn;

      var storyEye = document.querySelector('#story .eyebrow');
      if (storyEye && c.storyEyebrow) storyEye.textContent = c.storyEyebrow;

      var storyH2 = document.querySelector('#story h2');
      if (storyH2 && c.storyHeading) storyH2.textContent = c.storyHeading;

      var slines = document.querySelectorAll('#story .sline');
      if (slines[0] && c.storyLine1) slines[0].textContent = c.storyLine1;
      if (slines[1] && c.storyLine2) slines[1].textContent = c.storyLine2;
      if (slines[2] && c.storyLine3) slines[2].textContent = c.storyLine3;

      var divEye = document.querySelector('#div .intro .eyebrow');
      if (divEye && c.divEyebrow) divEye.textContent = c.divEyebrow;

      var divH2 = document.querySelector('#div .intro h2');
      if (divH2 && c.divHeading) divH2.textContent = c.divHeading;

      var divCards = document.querySelectorAll('#div #track article.card');
      if (divCards[0]) {
        var t0 = divCards[0].querySelector('h3'), d0 = divCards[0].querySelector('p.mute');
        if (t0 && c.techTitle) t0.textContent = c.techTitle;
        if (d0 && c.techDesc) d0.textContent = c.techDesc;
      }
      if (divCards[1]) {
        var t1 = divCards[1].querySelector('h3'), d1 = divCards[1].querySelector('p.mute');
        if (t1 && c.academyTitle) t1.textContent = c.academyTitle;
        if (d1 && c.academyDesc) d1.textContent = c.academyDesc;
      }
      if (divCards[2]) {
        var t2 = divCards[2].querySelector('h3'), d2 = divCards[2].querySelector('p.mute');
        if (t2 && c.mediaTitle) t2.textContent = c.mediaTitle;
        if (d2 && c.mediaDesc) d2.textContent = c.mediaDesc;
      }

      var statBoxes = document.querySelectorAll('#impact .stats > div');
      var statPairs = [
        [c.stat1Num, c.stat1Label],
        [c.stat2Num, c.stat2Label],
        [c.stat3Num, c.stat3Label],
        [c.stat4Num, c.stat4Label]
      ];
      statPairs.forEach(function (pair, i) {
        if (!statBoxes[i]) return;
        var numEl = statBoxes[i].querySelector('[data-c]');
        var lblEl = statBoxes[i].querySelector('p.mute');
        if (numEl && pair[0]) {
          numEl.setAttribute('data-c', pair[0]);
          numEl.textContent = pair[0] + (numEl.getAttribute('data-s') || '');
        }
        if (lblEl && pair[1]) lblEl.textContent = pair[1];
      });

      var ctaH2 = document.querySelector('#contact .cta h2');
      if (ctaH2 && c.ctaHeading) ctaH2.textContent = c.ctaHeading;
      var ctaP = document.querySelector('#contact .cta > p.mute');
      if (ctaP && c.ctaSub) ctaP.textContent = c.ctaSub;

      var fBio = document.querySelector('footer .fbrand > p');
      if (fBio && c.footerBio) fBio.textContent = c.footerBio;
    }

    // 4. Apply Site Identity & Settings (Logo, Phone, Email, Address, Social Links)
    var site = S.site;
    if (site && typeof site === 'object') {
      // Custom Logo
      document.querySelectorAll('.logo, #ldlogo').forEach(function (wrap) {
        var imgs = wrap.querySelectorAll('img.lg');
        imgs.forEach(function (img) {
          if (!img.getAttribute('data-orig-src')) {
            img.setAttribute('data-orig-src', img.getAttribute('src') || '');
          }
        });
        if (site.logo) {
          if (imgs[0]) {
            imgs[0].src = site.logo;
            imgs[0].style.display = 'block';
          }
          if (imgs[1]) {
            imgs[1].style.display = 'none';
          }
        } else {
          imgs.forEach(function (img) {
            var orig = img.getAttribute('data-orig-src');
            if (orig) img.src = orig;
            img.style.display = '';
          });
        }
      });

      // Contact Page (#cpage) Headquarters info
      var cpItems = document.querySelectorAll('#cpage .cp-side .cp-it span');
      if (cpItems[0] && site.address) cpItems[0].textContent = site.address;
      if (cpItems[1] && site.email) cpItems[1].textContent = site.email;
      if (cpItems[2] && site.phone) cpItems[2].textContent = site.phone;

      // Footer Contact info
      var fciList = document.querySelectorAll('footer .fci');
      if (fciList[0] && site.address) {
        var svg0 = fciList[0].querySelector('svg');
        fciList[0].textContent = '';
        if (svg0) fciList[0].appendChild(svg0);
        fciList[0].appendChild(document.createTextNode(site.address));
      }
      var fMail = document.querySelector('footer .fci a[href^="mailto:"]');
      if (fMail && site.email) {
        fMail.textContent = site.email;
        fMail.href = 'mailto:' + site.email;
      }
      var fTel = document.querySelector('footer .fci a[href^="tel:"]');
      if (fTel && site.phone) {
        fTel.textContent = site.phone;
        fTel.href = 'tel:' + site.phone.replace(/[^\d+]/g, '');
      }

      // Social Links in Footer
      var fbrand = document.querySelector('footer .fbrand');
      if (fbrand && site.social) {
        var socBox = document.getElementById('pub-social');
        if (!socBox) {
          socBox = document.createElement('div');
          socBox.id = 'pub-social';
          socBox.style.cssText = 'display:flex;gap:.6rem;flex-wrap:wrap;margin-top:1rem';
          fbrand.appendChild(socBox);
        }
        var entries = [
          ['Instagram', site.social.instagram],
          ['Facebook', site.social.facebook],
          ['LinkedIn', site.social.linkedin],
          ['X', site.social.x]
        ].filter(function (x) { return x[1] && String(x[1]).trim(); });
        socBox.innerHTML = entries.map(function (e) {
          return '<a class="btn" style="padding:.4rem .85rem;font-size:.82rem" target="_blank" rel="noopener" href="' + esc(e[1]) + '">' + esc(e[0]) + ' ↗</a>';
        }).join('');
      }
    }

    // 5. Render Live Services in #div
    renderPublicServices(Array.isArray(S.services) ? S.services : []);

    // 6. Render Projects, Categories, Testimonials, and Client Logos in #impact
    renderPublicProjects(Array.isArray(S.projects) ? S.projects : [], Array.isArray(S.cats) ? S.cats : []);
    renderPublicReviews(Array.isArray(S.reviews) ? S.reviews : []);
    renderPublicLogos(Array.isArray(S.logos) ? S.logos : []);

    // 7. Render Team Profiles in #story
    renderPublicTeam(Array.isArray(S.team) ? S.team : []);
  }

  function renderPublicServices(services) {
    var divSec = document.getElementById('div');
    if (!divSec) return;
    var host = document.getElementById('pub-services');
    var live = services.filter(function (s) { return s.status === 'Live'; });
    if (!live.length) {
      if (host) host.remove();
      return;
    }
    if (!host) {
      host = document.createElement('div');
      host.id = 'pub-services';
      host.className = 'wrap';
      host.style.marginTop = '3.5rem';
      divSec.appendChild(host);
    }
    host.innerHTML =
      '<div style="margin-bottom:1.8rem"><span class="eyebrow">Offerings</span><h2 style="margin-top:.4rem">Live Services</h2></div>' +
      '<div class="jb-grid">' +
      live.map(function (s) {
        return '<article class="jb">' +
          '<div class="jb-t">' + (s.price ? '<span>' + esc(s.price) + '</span>' : '') + '<span>Live</span></div>' +
          '<h3>' + esc(s.name) + '</h3>' +
          (s.description ? '<p class="mute">' + esc(s.description) + '</p>' : '') +
          '<a class="btn p" href="#contact-page">Inquire →</a>' +
          '</article>';
      }).join('') +
      '</div>';
  }

  function renderPublicProjects(projects, cats) {
    var impWrap = document.querySelector('#impact .wrap');
    if (!impWrap) return;
    var host = document.getElementById('pub-projects');
    if (!projects.length) {
      if (host) host.remove();
      return;
    }
    if (!host) {
      host = document.createElement('div');
      host.id = 'pub-projects';
      host.style.marginTop = '4rem';
      impWrap.appendChild(host);
    }
    var catNames = ['All'];
    cats.forEach(function (c) { if (c.name && catNames.indexOf(c.name) === -1) catNames.push(c.name); });
    projects.forEach(function (p) { if (p.category && catNames.indexOf(p.category) === -1) catNames.push(p.category); });
    if (catNames.indexOf(activeProjCat) === -1) activeProjCat = 'All';

    var filtered = projects.filter(function (p) {
      return activeProjCat === 'All' || p.category === activeProjCat;
    });

    host.innerHTML =
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;gap:1rem;flex-wrap:wrap;margin-bottom:1.5rem">' +
      '<div><span class="eyebrow">Portfolio</span><h2 style="margin-top:.4rem">Featured Projects</h2></div>' +
      '<div class="jb-flt" style="margin:0">' +
      catNames.map(function (cn) {
        return '<button type="button" class="btn' + (cn === activeProjCat ? ' on' : '') + '" data-proj-cat="' + esc(cn) + '">' + esc(cn) + '</button>';
      }).join('') +
      '</div></div>' +
      '<div class="jb-grid">' +
      filtered.map(function (p) {
        return '<article class="jb">' +
          (p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" style="width:100%;height:180px;object-fit:cover;border-radius:12px;margin-bottom:.4rem">' : '') +
          '<div class="jb-t">' + (p.category ? '<span>' + esc(p.category) + '</span>' : '') + '</div>' +
          '<h3>' + esc(p.title) + '</h3>' +
          (p.description ? '<p class="mute">' + esc(p.description) + '</p>' : '') +
          '</article>';
      }).join('') +
      '</div>';

    host.querySelectorAll('[data-proj-cat]').forEach(function (btn) {
      btn.onclick = function () {
        activeProjCat = btn.getAttribute('data-proj-cat');
        renderPublicProjects(projects, cats);
      };
    });
  }

  function renderPublicReviews(reviews) {
    var impWrap = document.querySelector('#impact .wrap');
    if (!impWrap) return;
    var host = document.getElementById('pub-reviews');
    var approved = reviews.filter(function (r) { return r.status === 'Approved'; });
    if (!approved.length) {
      if (host) host.remove();
      return;
    }
    if (!host) {
      host = document.createElement('div');
      host.id = 'pub-reviews';
      host.style.marginTop = '4rem';
      impWrap.appendChild(host);
    }
    host.innerHTML =
      '<div style="margin-bottom:1.5rem"><span class="eyebrow">Testimonials</span><h2 style="margin-top:.4rem">What Clients Say</h2></div>' +
      '<div class="jb-grid">' +
      approved.map(function (r) {
        return '<article class="jb">' +
          '<p style="font-size:1.05rem;margin:0">“' + esc(r.quote) + '”</p>' +
          '<div class="jb-t" style="margin-top:auto"><span>' + esc(r.author) + '</span>' + (r.company ? '<span>' + esc(r.company) + '</span>' : '') + '</div>' +
          '</article>';
      }).join('') +
      '</div>';
  }

  function renderPublicLogos(logos) {
    var impWrap = document.querySelector('#impact .wrap');
    if (!impWrap) return;
    var host = document.getElementById('pub-logos');
    if (!logos.length) {
      if (host) host.remove();
      return;
    }
    if (!host) {
      host = document.createElement('div');
      host.id = 'pub-logos';
      host.style.marginTop = '3.5rem';
      impWrap.appendChild(host);
    }
    host.innerHTML =
      '<div style="margin-bottom:1.2rem"><span class="eyebrow">Trusted By</span></div>' +
      '<div style="display:flex;gap:1.25rem;flex-wrap:wrap;align-items:center">' +
      logos.map(function (l) {
        return '<div class="glass" style="padding:.85rem 1.4rem;border-radius:14px;display:flex;align-items:center;gap:.75rem">' +
          (l.url ? '<img src="' + esc(l.url) + '" alt="' + esc(l.company) + '" style="height:32px;width:auto;object-fit:contain">' : '') +
          '<b>' + esc(l.company) + '</b></div>';
      }).join('') +
      '</div>';
  }

  function renderPublicTeam(team) {
    var storyWrap = document.querySelector('#story .wrap');
    if (!storyWrap) return;
    var host = document.getElementById('pub-team');
    if (!team.length) {
      if (host) host.remove();
      return;
    }
    if (!host) {
      host = document.createElement('div');
      host.id = 'pub-team';
      host.style.gridColumn = '1 / -1';
      host.style.marginTop = '3rem';
      storyWrap.appendChild(host);
    }
    host.innerHTML =
      '<div style="margin-bottom:1.5rem"><span class="eyebrow">Leadership & Team</span><h2 style="margin-top:.4rem">The People Behind the Pen</h2></div>' +
      '<div class="jb-grid">' +
      team.map(function (t) {
        var initials = String(t.name || 'I').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
        return '<article class="jb" style="flex-direction:row;align-items:center;gap:1rem">' +
          (t.url
            ? '<img src="' + esc(t.url) + '" alt="' + esc(t.name) + '" style="width:56px;height:56px;border-radius:50%;object-fit:cover;flex:none">'
            : '<div style="width:56px;height:56px;border-radius:50%;background:rgba(45,255,138,.14);border:1px solid rgba(45,255,138,.35);color:var(--g);display:grid;place-items:center;font-weight:700;flex:none">' + esc(initials) + '</div>') +
          '<div><h3 style="font-size:1.15rem;margin:0">' + esc(t.name) + '</h3><p class="mute" style="margin:.2rem 0 0">' + esc(t.role) + '</p></div>' +
          '</article>';
      }).join('') +
      '</div>';
  }

  /* ---- Listen for Live Messages from Sync Bridge ---- */
  window.addEventListener('message', function (ev) {
    if (ev.data && ev.data.type === 'INKPEN_STATE' && ev.data.state) {
      if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', function () { applyAdminStateToDOM(ev.data.state); });
      } else {
        applyAdminStateToDOM(ev.data.state);
      }
    }
  });

  function pollBackendState() {
    fetch('/api/state')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .catch(function () {
        return fetch(API_BASE + '/state').then(function (r) { return r.ok ? r.json() : Promise.reject(); });
      })
      .then(function (s) {
        if (s && typeof s === 'object') applyAdminStateToDOM(s);
      })
      .catch(function () {
        var local = readLocalState();
        if (local) applyAdminStateToDOM(local);
      });
  }

  function fetchJobs() {
    return fetch('/api/jobs')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .catch(function () {
        return fetch(API_BASE + '/jobs').then(function (r) { if (!r.ok) throw new Error(); return r.json(); });
      })
      .then(function (jobs) {
        writeLocalJobs(jobs);
        notifyJobs(jobs);
        return jobs;
      })
      .catch(function () {
        var local = readLocalJobs();
        notifyJobs(local);
        return local;
      });
  }

  function fetchSite() {
    return fetch('/api/site')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .catch(function () {
        return fetch(API_BASE + '/site').then(function (r) { if (!r.ok) throw new Error(); return r.json(); });
      })
      .then(function (s) {
        var content = (s && s.siteContent) || { texts: {}, imgs: {} };
        writeLocalSite(content);
        notifySite(content);
        return content;
      })
      .catch(function () {
        var local = readLocalSite();
        notifySite(local);
        return local;
      });
  }

  var dbAdapter = {
    collection: function (name) {
      if (name === 'jobs') {
        return {
          onSnapshot: function (cb) {
            listeners.jobs.push(cb);
            fetchJobs();
            return function () {};
          },
          add: function (item) {
            item.status = item.status || 'Open';
            return fetch(API_BASE + '/jobs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            })
              .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
              .then(function () { return fetchJobs(); })
              .catch(function () {
                var list = readLocalJobs();
                item.id = String(Date.now());
                list.unshift(item);
                writeLocalJobs(list);
                notifyJobs(list);
                return item;
              });
          },
          doc: function (id) {
            return {
              update: function (uo) {
                return fetch(API_BASE + '/jobs/' + encodeURIComponent(id), {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(uo)
                })
                  .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
                  .then(function () { return fetchJobs(); })
                  .catch(function () {
                    var list = readLocalJobs().map(function (x) {
                      return String(x.id) === String(id) ? Object.assign({}, x, uo) : x;
                    });
                    writeLocalJobs(list);
                    notifyJobs(list);
                  });
              },
              delete: function () {
                return fetch(API_BASE + '/jobs/' + encodeURIComponent(id), {
                  method: 'DELETE'
                })
                  .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
                  .then(function () { return fetchJobs(); })
                  .catch(function () {
                    var list = readLocalJobs().filter(function (x) {
                      return String(x.id) !== String(id);
                    });
                    writeLocalJobs(list);
                    notifyJobs(list);
                  });
              }
            };
          }
        };
      }

      if (name === 'site') {
        return {
          onSnapshot: function (cb) {
            listeners.site.push(cb);
            fetchSite();
            return function () {};
          },
          doc: function (docId) {
            return {
              set: function (payload) {
                var current = readLocalSite();
                if (docId === 'content') {
                  current.texts = Object.assign({}, current.texts, payload.texts || {});
                } else if (payload.key) {
                  current.imgs = current.imgs || {};
                  current.imgs[payload.key] = payload.src;
                }
                writeLocalSite(current);
                return fetch(API_BASE + '/site', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ siteContent: current })
                })
                  .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
                  .then(function (s) {
                    var c = (s && s.siteContent) || current;
                    notifySite(c);
                    return c;
                  })
                  .catch(function () {
                    notifySite(current);
                    return current;
                  });
              }
            };
          }
        };
      }

      return {
        onSnapshot: function () {},
        add: function () { return Promise.resolve(); },
        doc: function () { return { set: function () { return Promise.resolve(); }, update: function () { return Promise.resolve(); }, delete: function () { return Promise.resolve(); } }; }
      };
    }
  };

  window.claude = window.claude || {
    use: async function (mod) {
      if (mod === 'db') return dbAdapter;
      if (mod === 'user') {
        return {
          canEdit: async function () {
            try { return sessionStorage.getItem('inkpen-admin-ok') === '1'; } catch (e) { return false; }
          }
        };
      }
      return null;
    }
  };

  function submitLead(leadObj) {
    var lead = {
      id: 'l' + Date.now(),
      name: leadObj.name || 'Visitor',
      email: leadObj.email || '',
      phone: leadObj.phone || '',
      message: leadObj.message || '',
      date: new Date().toISOString().slice(0, 10),
      status: 'New'
    };
    postToSyncBridge({ type: 'INKPEN_ADD_LEAD', lead: lead });
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    }).catch(function () {});
    fetch(API_BASE + '/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    }).catch(function () {});
  }

  window.addEventListener('DOMContentLoaded', function () {
    setupSyncBridge();
    pollBackendState();

    // Re-sync whenever user switches back to this tab
    window.addEventListener('focus', function () {
      postToSyncBridge({ type: 'INKPEN_GET_STATE' });
      pollBackendState();
    });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) {
        postToSyncBridge({ type: 'INKPEN_GET_STATE' });
        pollBackendState();
      }
    });

    var cpform = document.getElementById('cpform');
    if (cpform) {
      cpform.addEventListener('submit', function () {
        var cpn = document.getElementById('cpn');
        var cpe = document.getElementById('cpe');
        var cpp = document.getElementById('cpp');
        var cpd = document.getElementById('cpd');
        var cpm = document.getElementById('cpm');
        submitLead({
          name: cpn ? cpn.value : '',
          email: cpe ? cpe.value : '',
          phone: cpp ? cpp.value : '',
          message: (cpd ? '[' + cpd.value + '] ' : '') + (cpm ? cpm.value : '')
        });
      });
    }

    var newsletterForm = document.getElementById('f');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function () {
        var em = document.getElementById('em');
        if (em && em.value) {
          submitLead({
            name: 'Newsletter Subscriber',
            email: em.value,
            phone: '',
            message: 'Newsletter / Quick Inquiry subscription'
          });
        }
      });
    }
  });
})();
