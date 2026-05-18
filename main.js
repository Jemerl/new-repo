/* Rise Ready — small UI helpers
   - Mobile nav toggle
   - Webhook-ready form submission scaffold
*/
(function () {
  'use strict';

  // ---------- Mobile nav ----------
  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) return;
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close drawer when a link is tapped
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('is-open');
    });
  }

  // ---------- Form submission ----------
  // Reads data-endpoint on <form>. If present, POSTs JSON.
  // If absent, simulates success (so the UI works during development).
  function initForms() {
    var forms = document.querySelectorAll('form[data-rr-form]');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var status = form.querySelector('.form-status') || createStatus(form);
        var btn = form.querySelector('button[type=submit]');
        var originalLabel = btn ? btn.textContent : '';
        var endpoint = form.getAttribute('data-endpoint');

        var payload = {};
        new FormData(form).forEach(function (val, key) { payload[key] = val; });
        payload._form = form.getAttribute('data-rr-form');
        payload._timestamp = new Date().toISOString();

        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        status.classList.remove('is-success', 'is-error');

        var done = function (ok, msg) {
          if (btn) { btn.disabled = false; btn.textContent = originalLabel; }
          status.textContent = msg;
          status.classList.add(ok ? 'is-success' : 'is-error');
          if (ok) form.reset();
        };

        if (!endpoint) {
          // Dev mode — simulate success so the UI flow works
          setTimeout(function () {
            done(true, form.getAttribute('data-success') ||
              'Thank you. We received your submission and will respond within 24 hours.');
          }, 500);
          return;
        }

        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
          .then(function (r) {
            if (!r.ok) throw new Error('Request failed');
            done(true, form.getAttribute('data-success') ||
              'Thank you. We received your submission.');
          })
          .catch(function () {
            done(false, 'Something went wrong. Please email us directly at hello@riseready.com.');
          });
      });
    });
  }

  function createStatus(form) {
    var s = document.createElement('div');
    s.className = 'form-status';
    s.setAttribute('role', 'status');
    s.setAttribute('aria-live', 'polite');
    form.appendChild(s);
    return s;
  }

  // ---------- Animate gap bars on scroll ----------
  function initBars() {
    var bars = document.querySelectorAll('.bar-fill[data-pct]');
    if (!bars.length || !('IntersectionObserver' in window)) {
      bars.forEach(function (b) { b.style.width = b.getAttribute('data-pct') + '%'; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.getAttribute('data-pct') + '%';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(function (b) {
      b.style.width = '0%';
      io.observe(b);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initNav(); initForms(); initBars();
    });
  } else {
    initNav(); initForms(); initBars();
  }
})();
