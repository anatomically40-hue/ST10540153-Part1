/* ============================================================
   map.js - interactive map on the Contact page (Leaflet)
   - Builds a map with one marker per place in locations.js
   - "Show on map" buttons let people choose a location; the
     map zooms to it and opens its pop-up
   - Zoom buttons (+ / -) and a scale are included
   - If Leaflet or the map pictures (tiles) cannot load, a clear
     message is shown and the list of addresses still works
   Map data (c) OpenStreetMap contributors.
   ============================================================ */
(function () {
  'use strict';

  var mapBox = document.getElementById('map-canvas');
  var listBox = document.getElementById('location-list');
  var messageBox = document.getElementById('map-message');
  var locations = window.FORUM_LOCATIONS || [];
  if (!mapBox || !listBox) { return; }

  function showMessage(text) {
    if (messageBox) { messageBox.textContent = text; messageBox.hidden = false; }
  }
  function osmLink(loc) {
    return 'https://www.openstreetmap.org/?mlat=' + loc.lat + '&mlon=' + loc.lng +
           '#map=17/' + loc.lat + '/' + loc.lng;
  }

  /* ---- 1. The list of locations (works even if the map fails) ---- */
  var buttons = [];
  locations.forEach(function (loc) {
    var li = document.createElement('li');
    li.className = 'location-card';

    var h3 = document.createElement('h3');
    h3.textContent = loc.name;

    var type = document.createElement('p');
    type.className = 'location-type';
    type.textContent = loc.type;

    var addr = document.createElement('p');
    addr.textContent = loc.address;

    var links = document.createElement('p');
    links.className = 'location-links';
    var osm = document.createElement('a');
    osm.href = osmLink(loc);
    osm.textContent = 'Open in OpenStreetMap';
    osm.target = '_blank';
    osm.rel = 'noopener';
    links.appendChild(osm);
    if (loc.sourceUrl) {
      var src = document.createElement('a');
      src.href = loc.sourceUrl;
      src.textContent = 'Current contact details (SAPS)';
      src.target = '_blank';
      src.rel = 'noopener';
      links.appendChild(src);
    }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'show-on-map';
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = 'Show on map';
    btn.setAttribute('data-id', loc.id);
    buttons.push(btn);

    li.appendChild(h3); li.appendChild(type); li.appendChild(addr); li.appendChild(links); li.appendChild(btn);
    listBox.appendChild(li);
  });

  /* ---- 2. The map ---- */
  if (typeof L === 'undefined') {
    mapBox.hidden = true;
    buttons.forEach(function (b) { b.hidden = true; });
    var allBtn = document.getElementById('show-all-locations');
    if (allBtn) { allBtn.hidden = true; }
    showMessage('The interactive map could not be loaded. The addresses are listed below, and each one has an "Open in OpenStreetMap" link.');
    return;
  }

  var map = L.map(mapBox, { scrollWheelZoom: false });   // wheel zoom off so the page can still scroll
  map.once('click', function () { map.scrollWheelZoom.enable(); });

  var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var tileErrors = 0;
  tiles.on('tileerror', function () {
    tileErrors++;
    if (tileErrors === 3) {
      showMessage('The map background could not be loaded (check your internet connection). The markers and the address list below still work.');
    }
  });
  tiles.on('load', function () { if (tileErrors < 3 && messageBox) { messageBox.hidden = true; } });

  L.control.scale({ imperial: false }).addTo(map);

  var markers = {};
  var group = [];
  locations.forEach(function (loc) {
    var marker = L.marker([loc.lat, loc.lng], { title: loc.name, alt: loc.name, keyboard: true }).addTo(map);

    // Build the pop-up with DOM nodes (safe: text is never treated as HTML)
    var box = document.createElement('div');
    var strong = document.createElement('strong');
    strong.textContent = loc.name;
    var addr = document.createElement('div');
    addr.textContent = loc.address;
    var link = document.createElement('a');
    link.href = osmLink(loc);
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = 'Open in OpenStreetMap';
    box.appendChild(strong); box.appendChild(addr); box.appendChild(link);
    marker.bindPopup(box);

    markers[loc.id] = marker;
    group.push(marker);
  });

  function showAll() {
    if (group.length > 1) {
      map.fitBounds(L.featureGroup(group).getBounds(), { padding: [40, 40] });
    } else if (group.length === 1) {
      map.setView(group[0].getLatLng(), 15);
    } else {
      map.setView([-25.5287, 28.1126], 12);
    }
  }
  showAll();

  /* ---- 3. Location choice controls ---- */
  function pressOnly(activeButton) {
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === activeButton ? 'true' : 'false'); });
  }
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var marker = markers[btn.getAttribute('data-id')];
      if (!marker) { return; }
      pressOnly(btn);
      map.setView(marker.getLatLng(), 16, { animate: false });
      marker.openPopup();
      mapBox.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });

  var showAllBtn = document.getElementById('show-all-locations');
  if (showAllBtn) {
    showAllBtn.addEventListener('click', function () { pressOnly(null); map.closePopup(); showAll(); });
  }
})();
