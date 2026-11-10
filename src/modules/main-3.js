(function(){
  'use strict';

  var DEFAULT_JOBS = [
    {
      id: 'j1',
      title: 'Full-Stack Systems Engineer',
      division: 'Tech',
      type: 'Full-time',
      location: 'Remote / Global',
      description: 'Architect and ship high-velocity enterprise platforms, microservices, and modern web applications with zero latency.',
      status: 'Open'
    },
    {
      id: 'j2',
      title: 'Cinematic Video Editor & Colorist',
      division: 'Media',
      type: 'Full-time',
      location: 'Hybrid / Chennai',
      description: 'Master 4K HDR footage, commercial narrative films, motion visuals, and audio soundscapes for global brand partners.',
      status: 'Open'
    },
    {
      id: 'j3',
      title: 'Lead Curriculum & AI Engineering Mentor',
      division: 'Academy',
      type: 'Contract',
      location: 'Remote',
      description: 'Deliver cutting-edge software architecture and interactive engineering masterclasses to cohort learners worldwide.',
      status: 'Open'
    },
    {
      id: 'j4',
      title: 'Creative Technologist & 3D Artist',
      division: 'Media',
      type: 'Full-time',
      location: 'Remote',
      description: 'Design next-generation procedural animations, WebGL interactions, and visual experiences across digital platforms.',
      status: 'Open'
    }
  ];

  var jobs = DEFAULT_JOBS.slice(), flt = 'All', D = ['All', 'Tech', 'Academy', 'Media'];

  function $(i){ return document.getElementById(i); }
  function el(t, c, x){
    var n = document.createElement(t);
    if(c) n.className = c;
    if(x != null) n.textContent = x;
    return n;
  }

  function render(){
    var f = $('jbf');
    if(f){
      f.textContent = '';
      D.forEach(function(d){
        var b = el('button', 'btn' + (d === flt ? ' on' : ''), d);
        b.onclick = function(){ flt = d; render(); };
        f.appendChild(b);
      });
    }

    var g = $('jbg');
    if(!g) return;
    g.textContent = '';
    var l = jobs.filter(function(j){
      return j.status !== 'Closed' && (flt === 'All' || j.division.toLowerCase() === flt.toLowerCase());
    });

    if(!l.length){
      g.appendChild(el('p', 'mute jb-empty', 'No openings matching this division right now.')).style.gridColumn = '1/-1';
      return;
    }

    l.forEach(function(j){
      var c = el('article', 'jb glass');
      var t = el('div', 'jb-t');
      [j.division, j.location, j.type].forEach(function(x){
        if(x) t.appendChild(el('span', '', x));
      });
      c.appendChild(t);
      c.appendChild(el('h3', '', j.title));
      c.appendChild(el('p', 'mute', j.description));
      var a = el('a', 'btn p mag', 'Apply Now →');
      a.href = 'mailto:careers@inkpen.ink?subject=' + encodeURIComponent('Application: ' + j.title);
      c.appendChild(a);
      g.appendChild(c);
    });
  }

  render();
})();
