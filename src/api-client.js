/* Backend API Adapter (with localStorage fallback) for INKPEN Frontend & Inline CMS */
(function () {
  var API_BASE = window.INKPEN_API_BASE || 'http://localhost:4000/api';
  var LS_JOBS = 'inkpen_jobs_v1';
  var LS_SITE = 'inkpen.site.v1';
  var listeners = { jobs: [], site: [] };

  function readLocalJobs() {
    try { return JSON.parse(localStorage.getItem(LS_JOBS) || '[]'); } catch (e) { return []; }
  }
  function writeLocalJobs(list) {
    try { localStorage.setItem(LS_JOBS, JSON.stringify(list)); } catch (e) {}
  }
  function readLocalSite() {
    try { return JSON.parse(localStorage.getItem(LS_SITE) || '{"texts":{},"imgs":{}}'); } catch (e) { return { texts: {}, imgs: {} }; }
  }
  function writeLocalSite(data) {
    try { localStorage.setItem(LS_SITE, JSON.stringify(data)); } catch (e) {}
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

  function fetchJobs() {
    return fetch(API_BASE + '/jobs')
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
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
    return fetch(API_BASE + '/site')
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
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

  window.addEventListener('DOMContentLoaded', function () {
    var cpform = document.getElementById('cpform');
    if (cpform) {
      cpform.addEventListener('submit', function () {
        var cpn = document.getElementById('cpn');
        var cpe = document.getElementById('cpe');
        var cpp = document.getElementById('cpp');
        var cpd = document.getElementById('cpd');
        var cpm = document.getElementById('cpm');
        fetch(API_BASE + '/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: cpn ? cpn.value : '',
            email: cpe ? cpe.value : '',
            phone: cpp ? cpp.value : '',
            message: (cpd ? '[' + cpd.value + '] ' : '') + (cpm ? cpm.value : '')
          })
        }).catch(function () {});
      });
    }

    var newsletterForm = document.getElementById('f');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', function () {
        var em = document.getElementById('em');
        if (em && em.value) {
          fetch(API_BASE + '/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'Newsletter Subscriber',
              email: em.value,
              phone: '',
              message: 'Newsletter / Quick Inquiry subscription'
            })
          }).catch(function () {});
        }
      });
    }
  });
})();
