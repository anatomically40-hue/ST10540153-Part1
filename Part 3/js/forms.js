/* ============================================================
   forms.js - validation + sending for the Enquiry and Contact forms
   Part 1: ForumValidation (pure functions, also unit-tested)
   Part 2: the form engine (inline errors, summary, result panel)

   Three different outcomes are kept apart on purpose:
     1. Passed validation  - the details look correct
     2. Accepted           - the form service (Netlify Forms) replied "OK"
     3. Failed             - nothing was sent; details are kept
   The page never says a message was sent unless the service accepted it.
   No email address, password or secret is stored in this file.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------- Part 1: validators ---------------- */
  var VOWELISH = /[aeiouyw]/i;
  var KEY_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', 'qazwsxedc', 'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz'];
  var PLACEHOLDERS = ['test', 'testing', 'asdf', 'qwerty', 'abc', 'abcd', 'xyz', 'name', 'none', 'null', 'asd', 'sdf', 'fgh'];

  function plain(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }

  function foldLetters(s) {
    var t = s.toLowerCase();
    try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
    return t.replace(/[^a-z]/g, '');
  }

  function hasKeyboardRun(letters) {
    for (var r = 0; r < KEY_ROWS.length; r++) {
      var row = KEY_ROWS[r];
      for (var i = 0; i + 5 <= row.length; i++) {
        if (letters.indexOf(row.substr(i, 5)) !== -1) { return true; }
      }
    }
    return false;
  }

  function looksRandomWord(word) {
    var w = foldLetters(word);
    if (w.length < 2) { return false; }
    if (PLACEHOLDERS.indexOf(w) !== -1) { return true; }
    if (/(.)\1\1/.test(w)) { return true; }                        // aaa
    if (w.length >= 4 && !VOWELISH.test(w)) { return true; }       // hjkl
    if (/[^aeiouyw]{5,}/.test(w)) { return true; }                 // 5+ consonants in a row
    if (hasKeyboardRun(w)) { return true; }                        // asdfg, qwert
    if (w.length >= 6 && /^(.{2,3})\1+/.test(w)) { return true; }  // ababab, xyzxyz
    return false;
  }

  var V = {};
  V.looksRandomWord = looksRandomWord;

  V.name = function (raw) {
    var s = plain(raw);
    if (!s) { return 'Please enter your name.'; }
    if (/\d/.test(s)) { return 'Your name cannot contain numbers.'; }
    if (!/^\p{L}+(?:[ '’-]\p{L}+)*$/u.test(s)) {
      return 'Use letters only. Spaces, hyphens (-) and apostrophes (\') are allowed.';
    }
    var letters = s.replace(/[^\p{L}]/gu, '');
    if (letters.length < 2) { return 'Your name is too short. Please enter at least 2 letters.'; }
    if (s.length > 60) { return 'Your name is too long. Please keep it under 60 characters.'; }
    var parts = s.split(/[ '’-]+/);
    if (!parts.some(function (p) { return p.length >= 2; })) { return 'Your name is too short. Please enter your full name.'; }
    var bad = false;
    parts.forEach(function (p) { if (p.length >= 2 && looksRandomWord(p)) { bad = true; } });
    if (bad) { return 'That does not look like a real name. Please enter your name as you would write it.'; }
    if (parts.length === 1 && letters.length < 3 && !VOWELISH.test(foldLetters(letters))) {
      return 'That does not look like a real name. Please enter your name as you would write it.';
    }
    return '';
  };

  V.email = function (raw, required) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) { return required ? 'Please enter your email address.' : ''; }
    if (/\s/.test(s)) { return 'An email address cannot contain spaces.'; }
    if (s.length > 254) { return 'That email address is too long.'; }
    var at = s.split('@');
    if (at.length !== 2 || !at[0] || !at[1]) { return 'Please enter a valid email address, like name@example.com.'; }
    var local = at[0], domain = at[1];
    if (local.length > 64 || /^\.|\.$|\.\./.test(local) || !/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+$/.test(local)) {
      return 'Please enter a valid email address, like name@example.com.';
    }
    if (domain.indexOf('.') === -1 || /^\.|\.$|\.\.|^-|-$|\.-|-\./.test(domain) || !/^[A-Za-z0-9.-]+$/.test(domain)) {
      return 'Please enter a valid email address, like name@example.com.';
    }
    var tld = domain.split('.').pop();
    if (!/^[A-Za-z]{2,24}$/.test(tld)) { return 'Please enter a valid email address, like name@example.com.'; }
    return '';
  };

  V.normalisePhone = function (raw) {
    var s = String(raw == null ? '' : raw).trim();
    if (/[^\d\s()+\-.]/.test(s)) { return null; }
    var d = s.replace(/[^\d+]/g, '');
    if (d.indexOf('+') > 0 || (d.match(/\+/g) || []).length > 1) { return null; }
    if (d.indexOf('+27') === 0) { d = '0' + d.slice(3); }
    else if (d.indexOf('0027') === 0) { d = '0' + d.slice(4); }
    else if (d.charAt(0) === '+') { return null; }
    if (!/^0[1-8]\d{8}$/.test(d)) { return null; }
    return d;
  };

  V.phone = function (raw, required) {
    var s = String(raw == null ? '' : raw).trim();
    if (!s) { return required ? 'Please enter your phone number.' : ''; }
    if (!V.normalisePhone(s)) {
      return 'Please enter a South African number, like 072 123 4567 or +27 72 123 4567.';
    }
    return '';
  };

  V.message = function (raw) {
    var s = plain(raw);
    if (!s) { return 'Please write your message.'; }
    if (s.length < 15) { return 'Your message is too short. Please write at least 15 characters.'; }
    if (s.length > 1000) { return 'Your message is too long. Please keep it under 1000 characters.'; }
    var letters = (s.match(/\p{L}/gu) || []).length;
    if (letters / s.length < 0.6) { return 'Please write your message in words, not mostly numbers or symbols.'; }
    if (/(.)\1{5,}/u.test(s)) { return 'Please remove repeated characters and write a real message.'; }
    var words = s.toLowerCase().match(/\p{L}+/gu) || [];
    var realWords = words.filter(function (w) { return w.length >= 2; });   // single letters do not count as words
    var unique = {};
    realWords.forEach(function (w) { unique[w] = true; });
    if (realWords.length < 3 || Object.keys(unique).length < 3) {
      return 'Please write at least 3 different words so we can understand your message.';
    }
    return '';
  };

  V.area = function (raw) {
    var s = plain(raw);
    if (!s) { return ''; }
    if (s.length < 3) { return 'Please enter at least 3 characters, or leave this blank.'; }
    if (s.length > 80) { return 'Please keep this under 80 characters.'; }
    if (!/^[\p{L}\d][\p{L}\d ,.'’()\/-]*$/u.test(s) || (s.match(/\p{L}/gu) || []).length < 2) {
      return 'Please enter a block, section or area name (letters, numbers and spaces).';
    }
    return '';
  };

  window.ForumValidation = V;

  /* ---------------- Part 2: the form engine ---------------- */
  function $(root, sel) { return root.querySelector(sel); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) { e.className = cls; }
    if (text != null) { e.textContent = text; }
    return e;
  }

  function isLocalPreview() {
    var p = location.protocol, h = location.hostname;
    return p === 'file:' || h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '';
  }

  function encode(formData) {
    var parts = [];
    formData.forEach(function (v, k) {
      if (typeof v === 'string') { parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v)); }
    });
    return parts.join('&');
  }

  /* Returns a promise resolving to 'accepted' | 'not-configured' | 'failed' */
  function deliver(form) {
    var cfg = window.FORUM_CONFIG || {};
    if (cfg.formDelivery !== 'netlify' || isLocalPreview()) { return Promise.resolve('not-configured'); }
    var data = new FormData(form);
    data.set('form-name', form.getAttribute('name'));
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;
    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(data),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (timer) { clearTimeout(timer); }
      return res.ok ? 'accepted' : 'failed';
    }).catch(function () {
      if (timer) { clearTimeout(timer); }
      return 'failed';
    });
  }


  /* What the visitor is told after a valid enquiry, depending on the reason chosen.
     These messages only describe what is already stated on this website. */
  var ENQUIRY_RESPONSES = {
    'General question about the app': ['About the app', 'The alert app is a planned feature and is not available yet. It is planned to stay free to use, and future versions aim to keep data use low. See the Services page for the full list of planned features.'],
    'I want to volunteer with the Forum': ['About volunteering', 'Thank you for offering to help. A Forum member will use the reply method you chose to talk about how you can help. Please read the safety note on the About page first: informal patrol groups without proper structure have faced serious danger.'],
    'I want to sponsor or support the Forum': ['About sponsoring or supporting the Forum', 'Thank you for offering to support the Forum. No sponsorship packages or prices have been published yet, so a Forum member will need to talk to you directly about what is possible.'],
    'A non-urgent safety concern in my area': ['About your safety concern', 'This form is not watched around the clock and is not for reporting crimes. If anyone is in danger, call SAPS on 10111, Ambulance on 10177, or 112 from a cell phone.'],
    'Media or partnership enquiry': ['About media and partnership enquiries', 'A Forum member will reply using the method you chose. Please include the name of your organisation in your message if you have not already.'],
    'Something else': ['About your enquiry', 'A Forum member will read your message and reply using the method you chose.'],
    'Emergency - I need immediate help': ['This is an emergency', 'Please do not wait for a reply. Call SAPS on 10111, Ambulance on 10177, or 112 from a cell phone now.']
  };

  function initForm(form) {
    var type = form.getAttribute('data-form-type');
    form.setAttribute('novalidate', '');
    var summary = $(form, '.form-summary');
    var statusBox = $(form.parentNode, '.form-status') || $(form, '.form-status');
    var submitBtn = $(form, '[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : '';
    var counter = $(form, '#message-count');
    var touched = {};

    function field(name) { return form.elements[name]; }
    function value(name) { var f = field(name); return f ? f.value : ''; }
    function replyMethod() {
      var r = form.querySelector('input[name="reply"]:checked');
      return r ? r.value : '';
    }

    function rules() {
      var list = [{ name: 'name', label: 'Name', check: function () { return V.name(value('name')); } }];
      if (type === 'enquiry') {
        var m = replyMethod();
        list.push({ name: 'reply', label: 'Reply method', check: function () { return m ? '' : 'Please choose how you would like us to reply.'; } });
        list.push({ name: 'phone', label: 'Phone number', check: function () { return V.phone(value('phone'), m === 'phone' || m === 'whatsapp'); } });
        list.push({ name: 'email', label: 'Email address', check: function () { return V.email(value('email'), m === 'email'); } });
        list.push({ name: 'area', label: 'Block or area', check: function () { return V.area(value('area')); } });
        list.push({ name: 'reason', label: 'Reason for enquiry', check: function () { return value('reason') ? '' : 'Please choose a reason for your enquiry.'; } });
      } else {
        list.push({ name: 'email', label: 'Email address', check: function () { return V.email(value('email'), true); } });
        list.push({ name: 'phone', label: 'Phone number', check: function () { return V.phone(value('phone'), false); } });
        list.push({ name: 'subject', label: 'Subject', check: function () { return value('subject') ? '' : 'Please choose a subject.'; } });
      }
      list.push({ name: 'message', label: 'Message', check: function () { return V.message(value('message')); } });
      list.push({ name: 'consent', label: 'Consent', check: function () { return field('consent') && field('consent').checked ? '' : 'Please tick the box to confirm you agree.'; } });
      return list;
    }

    function setError(name, msg) {
      var box = document.getElementById(name + '-error');
      var wrap = box ? box.closest('.field') : null;
      var inputs = name === 'reply' ? form.querySelectorAll('input[name="reply"]') : [field(name)];
      if (box) { box.textContent = msg; box.hidden = !msg; }
      if (wrap) { wrap.classList.toggle('has-error', !!msg); }
      Array.prototype.forEach.call(inputs, function (i) {
        if (!i) { return; }
        if (msg) { i.setAttribute('aria-invalid', 'true'); } else { i.removeAttribute('aria-invalid'); }
      });
    }

    function validateOne(rule) {
      var msg = rule.check();
      setError(rule.name, msg);
      return msg;
    }

    function validateAll() {
      var errors = [];
      rules().forEach(function (r) {
        var msg = validateOne(r);
        if (msg) { errors.push({ name: r.name, label: r.label, msg: msg }); }
      });
      return errors;
    }

    function focusField(name) {
      var f = name === 'reply' ? form.querySelector('input[name="reply"]') : field(name);
      if (f && f.focus) { f.focus(); }
    }

    function renderSummary(errors) {
      if (!summary) { return; }
      summary.textContent = '';
      if (!errors.length) { summary.hidden = true; return; }
      var h = el('h3', null, 'Please fix ' + errors.length + (errors.length === 1 ? ' problem' : ' problems') + ' before sending:');
      var ul = el('ul');
      errors.forEach(function (e) {
        var li = el('li');
        var a = el('a', null, e.label + ': ' + e.msg);
        a.href = '#' + e.name;
        a.addEventListener('click', function (ev) { ev.preventDefault(); focusField(e.name); });
        li.appendChild(a); ul.appendChild(li);
      });
      summary.appendChild(h); summary.appendChild(ul);
      summary.hidden = false;
    }

    function updateCounter() {
      if (!counter) { return; }
      var n = value('message').length;
      counter.textContent = n + ' / 1000 characters';
      counter.classList.toggle('is-over', n > 1000);
    }

    function updateReplyNotes() {
      var m = replyMethod();
      var pn = document.getElementById('phone-note'), en = document.getElementById('email-note');
      if (pn) { pn.textContent = (m === 'phone' || m === 'whatsapp') ? '(required)' : '(optional)'; }
      if (en) { en.textContent = m === 'email' ? '(required)' : '(optional)'; }
    }

    function showStatus(kind, title, lines, rows, extra) {
      if (!statusBox) { return; }
      statusBox.textContent = '';
      statusBox.className = 'form-status status-' + kind;
      statusBox.appendChild(el('h3', null, title));
      lines.forEach(function (t) { statusBox.appendChild(el('p', null, t)); });
      if (rows && rows.length) {
        var dl = el('dl', 'status-rows');
        rows.forEach(function (r) { dl.appendChild(el('dt', null, r[0])); dl.appendChild(el('dd', null, r[1])); });
        statusBox.appendChild(dl);
      }
      if (extra) {
        var box = el('div', 'enquiry-response');
        box.appendChild(el('h4', null, extra[0]));
        box.appendChild(el('p', null, extra[1]));
        statusBox.appendChild(box);
      }
      statusBox.hidden = false;
      statusBox.focus();
      statusBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    function summaryRows() {
      var rows = [['Name', plain(value('name'))]];
      if (type === 'enquiry') {
        rows.push(['Reply by', replyMethod()]);
        rows.push(['Reason', value('reason')]);
      } else {
        rows.push(['Subject', value('subject')]);
      }
      return rows;
    }

    /* live feedback: validate a field once the visitor has left it, then clear errors as it is fixed */
    form.addEventListener('blur', function (e) {
      var n = e.target && e.target.name;
      if (!n) { return; }
      touched[n] = true;
      rules().forEach(function (r) { if (r.name === n) { validateOne(r); } });
    }, true);
    form.addEventListener('input', function (e) {
      var n = e.target && e.target.name;
      if (n === 'message') { updateCounter(); }
      if (n && touched[n]) { rules().forEach(function (r) { if (r.name === n) { validateOne(r); } }); }
    });
    form.addEventListener('change', function (e) {
      var n = e.target && e.target.name;
      if (n === 'reply') {
        updateReplyNotes();
        ['phone', 'email', 'reply'].forEach(function (k) {
          rules().forEach(function (r) { if (r.name === k && (touched[k] || k === 'reply')) { validateOne(r); } });
        });
      } else if (n) {
        rules().forEach(function (r) { if (r.name === n) { validateOne(r); } });
      }
    });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (statusBox) { statusBox.hidden = true; }
      var bot = form.querySelector('[name="bot-field"]');
      if (bot && bot.value) { return; }                       // honeypot: silently ignore bots

      var errors = validateAll();
      renderSummary(errors);
      if (errors.length) {
        errors.forEach(function (e) { touched[e.name] = true; });
        focusField(errors[0].name);
        return;
      }

      var rows = summaryRows();
      var extra = type === 'enquiry' ? ENQUIRY_RESPONSES[value('reason')] : null;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
      form.setAttribute('aria-busy', 'true');

      deliver(form).then(function (outcome) {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = submitLabel; }
        form.removeAttribute('aria-busy');
        if (outcome === 'accepted') {
          form.reset(); touched = {}; updateCounter(); updateReplyNotes();
          showStatus('success', 'Thank you. Your ' + (type === 'enquiry' ? 'enquiry' : 'message') + ' was accepted.', [
            'Our form service confirmed it received your details and passed them on to the Forum. We cannot promise how quickly someone will read it.',
            'If this is an emergency, do not wait. Call SAPS on 10111, Ambulance on 10177, or 112 from a cell phone.'
          ], rows, extra);
        } else if (outcome === 'not-configured') {
          showStatus('warning', 'Your details are correct, but nothing has been sent yet.', [
            'This copy of the website is not connected to a live form service (for example, you are viewing it from your own computer). Your details have been kept in the form.',
            'Once the website is published with Netlify Forms switched on, this button will send the message.'
          ], null, extra);
        } else {
          showStatus('error', 'Sorry, your message was not sent.', [
            'Something went wrong while sending. Your details are still in the form, so you can try again.',
            'If it keeps failing, please phone the Forum on the number on the Contact Us page. In an emergency call 10111, 10177 or 112.'
          ], null);
        }
      });
    });

    updateCounter();
    updateReplyNotes();
  }

  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('form[data-form-type]'), initForm);
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); } else { start(); }
})();
