/* ============================================
   BEHOLDER ACADEMY — Theme Manager
   Dark mode centralizado (Single Source of Truth)
   ============================================ */
(function() {
  'use strict';

  var STORAGE_KEY = 'beholder_theme';

  // Aplicar tema salvo imediatamente (antes do paint)
  var stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    document.documentElement.setAttribute('data-theme', stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Registrar toggle quando DOM estiver pronto
  function initToggle() {
    var toggle = document.getElementById('dark-toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEY, next);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initToggle);
  } else {
    initToggle();
  }
})();
