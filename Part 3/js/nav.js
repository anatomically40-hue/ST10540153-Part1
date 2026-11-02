/* ============================================================
   nav.js - mobile navigation menu
   On small screens the five page links are hidden behind a
   "Menu" button. On larger screens nothing changes.
   Without JavaScript the normal menu is still shown.
   ============================================================ */
(function () {
  'use strict';

  var nav = document.querySelector('nav.site-nav');
  if (!nav) { return; }

  // 1. Put the existing links inside one wrapper so we can hide/show them together
  var links = document.createElement('div');
  links.className = 'nav-links';
  links.id = 'site-nav-links';
  while (nav.firstChild) { links.appendChild(nav.firstChild); }

  // 2. Create the Menu button
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'nav-toggle';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'site-nav-links');
  button.innerHTML = '<span class="nav-toggle-icon" aria-hidden="true"></span><span class="nav-toggle-text">Menu</span>';

  nav.appendChild(button);
  nav.appendChild(links);

  function setOpen(open) {
    nav.classList.toggle('open', open);
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    button.querySelector('.nav-toggle-text').textContent = open ? 'Close menu' : 'Menu';
  }

  button.addEventListener('click', function () {
    setOpen(!nav.classList.contains('open'));
  });

  // Escape closes the menu and returns focus to the button
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setOpen(false);
      button.focus();
    }
  });

  // Clicking somewhere else on the page closes the menu
  document.addEventListener('click', function (event) {
    if (nav.classList.contains('open') && !nav.contains(event.target)) {
      setOpen(false);
    }
  });

  // If the window is made wider again, reset the menu
  window.addEventListener('resize', function () {
    if (window.innerWidth > 768) { setOpen(false); }
  });
})();
