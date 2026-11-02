/* ============================================================
   gallery.js - photo gallery filter + lightbox
   - Filter buttons show/hide photos by category.
   - Clicking a photo opens a larger version in a lightbox
     (a native <dialog> element, which gives us keyboard focus
     handling and the Escape key for free).
   - Lightbox controls: Close button, Previous / Next buttons,
     Left/Right arrow keys, swipe on touch screens, click on
     the dark background to close.
   Without JavaScript each thumbnail is a normal link that opens
   the large image on its own.
   ============================================================ */
(function () {
  'use strict';

  var gallery = document.getElementById('gallery');
  if (!gallery) { return; }

  var items = Array.prototype.slice.call(gallery.querySelectorAll('li'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var statusBox = document.getElementById('gallery-status');

  /* ---------------- FILTERING ---------------- */
  function applyFilter(category, label) {
    var shown = 0;
    items.forEach(function (item) {
      var match = (category === 'all') || (item.getAttribute('data-category') === category);
      item.hidden = !match;
      if (match) { shown++; }
    });
    filterButtons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-filter') === category ? 'true' : 'false');
    });
    if (statusBox) {
      statusBox.textContent = 'Showing ' + shown + ' of ' + items.length + ' photos' +
        (category === 'all' ? '.' : ' in "' + label + '".');
    }
  }

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyFilter(btn.getAttribute('data-filter'), btn.textContent.trim());
    });
  });

  /* ---------------- LIGHTBOX ---------------- */
  var dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Photo viewer');
  dialog.innerHTML =
    '<button type="button" class="lightbox-close" aria-label="Close photo viewer">&times;</button>' +
    '<div class="lightbox-inner">' +
      '<figure class="lightbox-figure">' +
        '<div class="lightbox-stage">' +
          '<img class="lightbox-image" alt="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7">' +
          '<p class="lightbox-message" role="status"></p>' +
        '</div>' +
        '<figcaption class="lightbox-caption"></figcaption>' +
      '</figure>' +
      '<div class="lightbox-controls">' +
        '<button type="button" class="lightbox-prev" aria-label="Previous photo">&#8249; Previous</button>' +
        '<span class="lightbox-count" aria-live="polite"></span>' +
        '<button type="button" class="lightbox-next" aria-label="Next photo">Next &#8250;</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(dialog);

  var imageEl = dialog.querySelector('.lightbox-image');
  var messageEl = dialog.querySelector('.lightbox-message');
  var captionEl = dialog.querySelector('.lightbox-caption');
  var countEl = dialog.querySelector('.lightbox-count');
  var inner = dialog.querySelector('.lightbox-inner');

  var visibleLinks = [];   // links of the photos currently shown (respects the filter)
  var current = 0;
  var opener = null;       // the thumbnail link that opened the lightbox (to return focus)

  function getVisibleLinks() {
    return items
      .filter(function (item) { return !item.hidden; })
      .map(function (item) { return item.querySelector('a.gallery-link'); });
  }

  function showPhoto(index) {
    current = (index + visibleLinks.length) % visibleLinks.length;
    var link = visibleLinks[current];
    var thumb = link.querySelector('img');

    imageEl.classList.remove('is-loaded');
    messageEl.textContent = 'Loading photo...';
    messageEl.hidden = false;

    imageEl.onload = function () { messageEl.hidden = true; imageEl.classList.add('is-loaded'); };
    imageEl.onerror = function () {
      messageEl.textContent = 'Sorry, this photo could not be loaded.';
      messageEl.hidden = false;
    };
    imageEl.alt = thumb.alt;
    imageEl.src = link.getAttribute('href');

    captionEl.textContent = link.getAttribute('data-caption') || thumb.alt;
    countEl.textContent = 'Photo ' + (current + 1) + ' of ' + visibleLinks.length;

    // Preload the neighbours so moving between photos feels quick
    [current + 1, current - 1].forEach(function (i) {
      var n = visibleLinks[(i + visibleLinks.length) % visibleLinks.length];
      if (n) { new Image().src = n.getAttribute('href'); }
    });
  }

  function openLightbox(link) {
    visibleLinks = getVisibleLinks();
    opener = link;
    showPhoto(visibleLinks.indexOf(link));
    var single = visibleLinks.length < 2;
    dialog.querySelector('.lightbox-prev').disabled = single;
    dialog.querySelector('.lightbox-next').disabled = single;
    document.body.classList.add('lightbox-open');
    dialog.showModal();
  }

  gallery.addEventListener('click', function (event) {
    var link = event.target.closest('a.gallery-link');
    if (!link) { return; }
    event.preventDefault();      // stop the browser opening the bare image file
    openLightbox(link);
  });

  dialog.querySelector('.lightbox-close').addEventListener('click', function () { dialog.close(); });
  dialog.querySelector('.lightbox-prev').addEventListener('click', function () { showPhoto(current - 1); });
  dialog.querySelector('.lightbox-next').addEventListener('click', function () { showPhoto(current + 1); });

  // Click on the dark area (not on the photo or buttons) closes the lightbox
  dialog.addEventListener('click', function (event) {
    if (event.target === dialog || event.target === inner) { dialog.close(); }
  });

  // Arrow keys (Escape is handled by <dialog> itself)
  dialog.addEventListener('keydown', function (event) {
    if (visibleLinks.length < 2) { return; }
    if (event.key === 'ArrowRight') { showPhoto(current + 1); }
    if (event.key === 'ArrowLeft')  { showPhoto(current - 1); }
  });

  // Simple swipe support for phones and tablets
  var touchStartX = null;
  dialog.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', function (e) {
    if (touchStartX === null || visibleLinks.length < 2) { return; }
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { showPhoto(dx < 0 ? current + 1 : current - 1); }
    touchStartX = null;
  }, { passive: true });

  // When the lightbox closes: allow page scrolling again, return focus
  dialog.addEventListener('close', function () {
    document.body.classList.remove('lightbox-open');
    imageEl.removeAttribute('src');
    if (opener) { opener.focus(); }
  });

  applyFilter('all', 'All photos');
})();
