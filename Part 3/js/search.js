/* ============================================================
   search.js - search the website's information (Home page)
   The list below (SEARCH_DATA) describes the real content of
   the five pages. The search box filters it as you type, and
   the topic buttons filter by category. Each result links to
   the section of the page where the information is found.
   To add something new to the search, add one more entry to
   SEARCH_DATA (and make sure the page section has that id).
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('site-search-form');
  if (!form) { return; }

  var input = document.getElementById('site-search');
  var resultsList = document.getElementById('search-results');
  var statusBox = document.getElementById('search-status');
  var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-topic]'));
  var suggestionButtons = Array.prototype.slice.call(document.querySelectorAll('[data-suggestion]'));

  var PAGES = { home: 'Home', about: 'About', services: 'Services', enquiry: 'Enquiry', contact: 'Contact Us' };
  var FILES = { home: 'index.html', about: 'About.html', services: 'Services.html', enquiry: 'Enquiry.html', contact: 'Contact%20Us.html' };

  var SEARCH_DATA = [
    { title: 'Real-time crime alerts', topic: 'services', page: 'services', anchor: 'alerts',
      text: 'When a member reports a threat, every nearby profile receives an alert straight away, so people do not have to wait for a phone call chain or a whistle. This feature is planned.',
      keywords: 'alert warning notification crime danger threat nearby planned' },
    { title: 'Incident reporting', topic: 'services', page: 'services', anchor: 'reporting',
      text: 'Members will log what happened, where and when in the app, without having to confront a suspect or gather in person. This feature is planned.',
      keywords: 'report incident crime log safe planned' },
    { title: 'Community announcements', topic: 'services', page: 'services', anchor: 'announcements',
      text: 'Forum organisers can share safety updates, imbizo dates and community notices in one reliable place instead of scattered WhatsApp forwards. This feature is planned.',
      keywords: 'announcement notice news events imbizo meeting whatsapp planned' },
    { title: 'Emergency button with live location tracking', topic: 'services', page: 'services', anchor: 'emergency-button',
      text: 'A single button a member can press when in immediate danger. It shares their live location with nearby volunteers and emergency contacts. This feature is planned.',
      keywords: 'emergency panic button gps location tracking danger help planned' },
    { title: 'Free and low-data access', topic: 'services', page: 'services', anchor: 'access',
      text: 'The platform is planned to stay free to use, and future versions aim to keep data use as light as possible for members who cannot always afford data or airtime.',
      keywords: 'free data airtime cost low data cheap afford' },
    { title: 'Frequently asked questions', topic: 'services', page: 'services', anchor: 'faq',
      text: 'Short answers about the Forum, whether the alert app exists yet, cost, what to do in an emergency and how to get involved.',
      keywords: 'faq questions answers help join volunteer cost' },

    { title: 'Our story: who the Forum is', topic: 'about', page: 'about', anchor: 'our-story',
      text: 'The Forum has over 100 active members across Soshanguve. Members currently share safety information by phone calls, SMS, WhatsApp and whistles. Many members are unemployed and cannot always afford data or airtime.',
      keywords: 'story members residents community whatsapp sms whistle unemployed history' },
    { title: 'The problem: a communication gap', topic: 'about', page: 'about', anchor: 'the-problem',
      text: 'Parts of Soshanguve, especially Jukulyn, have been flagged by Gauteng officials for serious crime. Government has introduced panic-button pilots, CCTV in some blocks and a SAPS stabilisation team, but these are area-specific pilots.',
      keywords: 'problem crime jukulyn police panic button cctv government communication' },
    { title: 'Why volunteering is dangerous right now', topic: 'about', page: 'about', anchor: 'volunteer-risk',
      text: 'In March 2025 community patrollers on a safety walkabout in the Marry Me informal settlement were attacked and six lost their lives. The Community Policing Forum urges residents to use registered structures.',
      keywords: 'patrollers volunteers danger marry me attack community policing forum cpf' },
    { title: 'Where we are headed', topic: 'about', page: 'about', anchor: 'where-were-headed',
      text: 'The website is the first step toward a free safety app for iOS and Android with profiles, real-time alerts, incident reporting, announcements and an emergency button.',
      keywords: 'future app ios android plan goals' },
    { title: 'Photo gallery: community street clean-ups', topic: 'photos', page: 'about', anchor: 'gallery',
      text: 'Photos of residents cleaning their streets and of illegal dumping that the community wants cleared.',
      keywords: 'photos gallery clean up cleanup rubbish dumping environment street' },
    { title: 'Photo gallery: safety patrols', topic: 'photos', page: 'about', anchor: 'gallery',
      text: 'Photos of patrollers, patrol uniforms, the crime prevention unit and patrollers with their guard dogs.',
      keywords: 'photos gallery patrol patrollers uniform dogs crime prevention safety' },
    { title: 'Photo gallery: community meetings and launches', topic: 'photos', page: 'about', anchor: 'gallery',
      text: 'Photos of leaders meetings, volunteers meeting residents and the official launch of the community platform.',
      keywords: 'photos gallery meeting launch leaders hall residents' },

    { title: 'Crime figure: Rietgat contact crime up 35%', topic: 'safety', page: 'home', anchor: 'why-this-matters',
      text: 'Contact crimes at the Rietgat station, which covers Jukulyn, rose 35% year on year according to a 2024 SAPS station briefing.',
      keywords: 'statistics crime rietgat jukulyn contact crime saps' },
    { title: 'Crime figure: Soshanguve contact crime up 4.6%', topic: 'safety', page: 'about', anchor: 'the-problem',
      text: 'Contact crimes at Soshanguve station rose 4.6% year on year in SAPS quarterly statistics from 2024.',
      keywords: 'statistics crime soshanguve contact crime saps quarterly' },
    { title: 'Crime figure: 300+ active cases in Jukulyn', topic: 'safety', page: 'home', anchor: 'why-this-matters',
      text: 'Over 300 active criminal cases were reported in Jukulyn at the start of 2024.',
      keywords: 'statistics crime jukulyn cases premier' },

    { title: 'Emergency numbers: 10111, 10177 and 112', topic: 'emergency', page: 'contact', anchor: 'emergency-numbers',
      text: 'SAPS police 10111. Ambulance and fire 10177. National emergency number from a cell phone 112. The Forum website is not an emergency service.',
      keywords: 'emergency police ambulance fire 10111 10177 112 saps help number phone' },
    { title: 'Find the nearest police station on the map', topic: 'emergency', page: 'contact', anchor: 'map',
      text: 'An interactive map of the Soshanguve (Block H) and Rietgat (Buitekant Street) SAPS stations with their addresses.',
      keywords: 'map police station soshanguve rietgat address location directions saps' },
    { title: 'Contact the Forum', topic: 'contact', page: 'contact', anchor: 'contact-forum',
      text: 'How to reach the Forum for non-urgent questions and volunteering.',
      keywords: 'contact reach phone whatsapp location base' },
    { title: 'Send the Forum a message', topic: 'contact', page: 'contact', anchor: 'contact-form',
      text: 'A contact form for general questions, website feedback, volunteering, announcements, media and partnerships.',
      keywords: 'contact form message email feedback media partnership' },
    { title: 'Make an enquiry or volunteer', topic: 'contact', page: 'enquiry', anchor: 'enquiry-form',
      text: 'Ask about the app, volunteer with the Forum, raise a non-urgent safety concern, or make a media or partnership enquiry. You can choose to be contacted by phone call, WhatsApp or SMS, or email.',
      keywords: 'enquiry question volunteer join concern phone whatsapp sms email' }
  ];

  var TOPIC_LABELS = {
    services: 'Services', about: 'About the Forum', photos: 'Photos', safety: 'Crime facts',
    emergency: 'Emergency and police', contact: 'Contact and enquiries'
  };

  var activeTopic = 'all';

  function normalise(text) { return String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function tokensOf(query) { return normalise(query).split(/[^a-z0-9]+/).filter(function (t) { return t.length > 0; }); }
  // "alerts" should also match "alert"
  function variants(token) {
    var list = [token];
    if (token.length > 3 && token.charAt(token.length - 1) === 's') { list.push(token.slice(0, -1)); }
    return list;
  }
  function scoreItem(item, tokens) {
    var title = normalise(item.title), kw = normalise(item.keywords), text = normalise(item.text);
    var total = 0;
    for (var i = 0; i < tokens.length; i++) {
      var best = 0;
      variants(tokens[i]).forEach(function (v) {
        if (title.indexOf(v) !== -1) { best = Math.max(best, 5); }
        if (kw.indexOf(v) !== -1)    { best = Math.max(best, 3); }
        if (text.indexOf(v) !== -1)  { best = Math.max(best, 1); }
      });
      if (best === 0) { return 0; }   // every word typed must be found somewhere
      total += best;
    }
    return total;
  }

  // Write text into an element, wrapping matched words in <mark>
  function appendHighlighted(parent, text, tokens) {
    if (!tokens.length) { parent.appendChild(document.createTextNode(text)); return; }
    var lower = normalise(text);
    var ranges = [];
    tokens.forEach(function (tok) {
      variants(tok).forEach(function (v) {
        var from = 0, at;
        while ((at = lower.indexOf(v, from)) !== -1) { ranges.push([at, at + v.length]); from = at + v.length; }
      });
    });
    ranges.sort(function (a, b) { return a[0] - b[0]; });
    var merged = [];
    ranges.forEach(function (r) {
      var last = merged[merged.length - 1];
      if (last && r[0] <= last[1]) { last[1] = Math.max(last[1], r[1]); } else { merged.push(r.slice()); }
    });
    var pos = 0;
    merged.forEach(function (r) {
      if (r[0] > pos) { parent.appendChild(document.createTextNode(text.slice(pos, r[0]))); }
      var mark = document.createElement('mark');
      mark.textContent = text.slice(r[0], r[1]);
      parent.appendChild(mark);
      pos = r[1];
    });
    if (pos < text.length) { parent.appendChild(document.createTextNode(text.slice(pos))); }
  }

  function render() {
    var query = input.value.trim();
    var tokens = tokensOf(query);
    resultsList.textContent = '';

    // Empty search and no topic chosen: give guidance instead of a blank list
    if (tokens.length === 0 && activeTopic === 'all') {
      statusBox.textContent = 'Type a word above, for example emergency, map or volunteer, or choose a topic.';
      statusBox.className = 'search-status';
      return;
    }

    var results = SEARCH_DATA
      .filter(function (item) { return activeTopic === 'all' || item.topic === activeTopic; })
      .map(function (item) { return { item: item, score: tokens.length ? scoreItem(item, tokens) : 1 }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; });

    if (results.length === 0) {
      statusBox.textContent = 'No results for "' + query + '"' +
        (activeTopic !== 'all' ? ' in ' + TOPIC_LABELS[activeTopic] : '') +
        '. Try a different word (for example alert, police, photos or volunteer) or choose another topic.';
      statusBox.className = 'search-status search-status-empty';
      return;
    }

    statusBox.textContent = results.length + (results.length === 1 ? ' result' : ' results') +
      (query ? ' for "' + query + '"' : '') +
      (activeTopic !== 'all' ? ' in ' + TOPIC_LABELS[activeTopic] : '') + '.';
    statusBox.className = 'search-status';

    results.forEach(function (r) {
      var li = document.createElement('li');
      li.className = 'search-result';

      var h3 = document.createElement('h3');
      var a = document.createElement('a');
      a.href = FILES[r.item.page] + '#' + r.item.anchor;
      appendHighlighted(a, r.item.title, tokens);
      h3.appendChild(a);

      var p = document.createElement('p');
      appendHighlighted(p, r.item.text, tokens);

      var tag = document.createElement('span');
      tag.className = 'search-tag';
      tag.textContent = TOPIC_LABELS[r.item.topic] + ' - ' + PAGES[r.item.page] + ' page';

      li.appendChild(h3); li.appendChild(p); li.appendChild(tag);
      resultsList.appendChild(li);
    });
  }

  input.addEventListener('input', render);
  form.addEventListener('submit', function (event) { event.preventDefault(); render(); });

  chipButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeTopic = btn.getAttribute('data-topic');
      chipButtons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      render();
    });
  });

  suggestionButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      input.value = btn.getAttribute('data-suggestion');
      input.focus();
      render();
    });
  });

  render();
})();
