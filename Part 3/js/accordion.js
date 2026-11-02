/* ============================================================
   accordion.js - expandable / collapsible information panels
   Used on the Services page (FAQ). Each question is a <button>;
   the answer is the panel it controls (aria-controls).
   Keyboard: Enter/Space open or close, Up/Down arrows move
   between questions, Home/End jump to the first/last question.
   Without JavaScript every answer is simply visible.
   ============================================================ */
(function () {
  'use strict';

  var accordions = document.querySelectorAll('[data-accordion]');

  accordions.forEach(function (accordion) {
    var triggers = Array.prototype.slice.call(accordion.querySelectorAll('.accordion-trigger'));

    function setOpen(trigger, open) {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
      trigger.parentElement.classList.toggle('is-open', open);
      if (panel) { panel.hidden = !open; }
    }

    // Start with every answer closed (JavaScript is running, so the buttons will work)
    triggers.forEach(function (trigger) { setOpen(trigger, false); });

    triggers.forEach(function (trigger, index) {
      trigger.addEventListener('click', function () {
        setOpen(trigger, trigger.getAttribute('aria-expanded') !== 'true');
      });

      trigger.addEventListener('keydown', function (event) {
        var target = null;
        if (event.key === 'ArrowDown') { target = triggers[(index + 1) % triggers.length]; }
        if (event.key === 'ArrowUp')   { target = triggers[(index - 1 + triggers.length) % triggers.length]; }
        if (event.key === 'Home')      { target = triggers[0]; }
        if (event.key === 'End')       { target = triggers[triggers.length - 1]; }
        if (target) { event.preventDefault(); target.focus(); }
      });
    });

    // "Expand all" and "Collapse all" buttons
    var expandAll = accordion.querySelector('[data-accordion-expand]');
    var collapseAll = accordion.querySelector('[data-accordion-collapse]');
    if (expandAll) {
      expandAll.addEventListener('click', function () { triggers.forEach(function (t) { setOpen(t, true); }); });
    }
    if (collapseAll) {
      collapseAll.addEventListener('click', function () { triggers.forEach(function (t) { setOpen(t, false); }); });
    }
  });
})();
