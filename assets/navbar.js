/* ============================================
   BEHOLDER ACADEMY — Navbar & Footer v2.0
   Componente espelhado: 1 arquivo = todas as páginas
   
   Estados:
   - Deslogado: botão "Entrar"
   - Aluno: XP bar + nível + tier + avatar dropdown
   - Pai: nome + avatar dropdown
   ============================================ */

(function() {
  'use strict';

  // ── Detect base path from current page ──
  function getBasePath() {
    var scripts = document.querySelectorAll('script[src*="navbar.js"]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src') || '';
      // assets/navbar.js → '' (root)
      // ../assets/navbar.js → '../' (subdir)
      return src.replace('assets/navbar.js', '');
    }
    // Fallback: check if we're in a subdirectory
    var pathParts = window.location.pathname.split('/').filter(Boolean);
    // GitHub Pages: /Beholder-Academy/matematica/artigo.html
    // Local: /matematica/artigo.html
    var depth = 0;
    var fileName = pathParts[pathParts.length - 1] || '';
    if (fileName.indexOf('.html') !== -1) pathParts.pop();
    // Check known subdirs
    var knownRootFiles = ['index.html','login.html','painel.html','responsavel.html','sobre.html','roadmap.html','fontes.html','privacidade.html','termos.html'];
    if (knownRootFiles.indexOf(fileName) !== -1) return '';
    return '../';
  }

  var BASE = getBasePath();

  // ── Subject data ──
  var subjects = [
    { slug: 'portugues', name: 'Português' },
    { slug: 'matematica', name: 'Matemática' },
    { slug: 'historia', name: 'História' },
    { slug: 'geografia', name: 'Geografia' },
    { slug: 'biologia', name: 'Biologia' },
    { slug: 'quimica', name: 'Química' },
    { slug: 'fisica', name: 'Física' },
    { slug: 'ingles', name: 'Inglês' },
    { slug: 'filosofia', name: 'Filosofia' },
    { slug: 'sociologia', name: 'Sociologia' },
    { slug: 'literatura', name: 'Literatura' },
    { slug: 'redacao', name: 'Redação' }
  ];

  // ── Tier definitions ──
  var TIERS = [
    { min: 1,  max: 4,  name: 'Aprendiz',  icon: '🌱', color: '#06D6A0' },
    { min: 5,  max: 9,  name: 'Guerreiro',  icon: '⚔️', color: '#4361EE' },
    { min: 10, max: 14, name: 'Mestre',     icon: '👑', color: '#7B2FF7' },
    { min: 15, max: 20, name: 'Arcano',     icon: '🔮', color: '#F7B32B' }
  ];

  function getTier(level) {
    for (var i = TIERS.length - 1; i >= 0; i--) {
      if (level >= TIERS[i].min) return TIERS[i];
    }
    return TIERS[0];
  }

  // ── Build subject dropdown links ──
  function buildSubjectLinks() {
    return subjects.map(function(s) {
      return '<a href="' + BASE + s.slug + '/">' + s.name + '</a>';
    }).join('');
  }

  // ── Dark mode toggle SVGs ──
  var sunSVG = '<svg class="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  var moonSVG = '<svg class="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  // ── Chevron SVG ──
  var chevronDown = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  var chevronRight = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg>';

  // ═══════════════════════════════════════
  //  NAVBAR HTML
  // ═══════════════════════════════════════

  function buildNavbar() {
    return '' +
    '<div class="container navbar__inner">' +
      '<a href="' + BASE + 'index.html" class="navbar__logo">Beholder <span class="logo-highlight">Academy</span></a>' +

      '<div class="navbar__nav">' +
        '<a href="' + BASE + 'index.html" class="navbar__link">Home</a>' +
        '<div class="navbar__dropdown" id="nav-dropdown">' +
          '<button class="navbar__dropdown-toggle" id="dropdown-toggle">Matérias ' + chevronRight + '</button>' +
          '<div class="navbar__dropdown-menu">' + buildSubjectLinks() + '</div>' +
        '</div>' +
      '</div>' +

      // Right side: actions
      '<div class="navbar__actions">' +
        // XP bar area (aluno only, hidden by default)
        '<div class="navbar-xp-area" id="navbar-xp-area" style="display:none;">' +
          '<div class="navbar-xp-info">' +
            '<span class="navbar-xp-level" id="navbar-xp-level">Nv 1</span>' +
            '<div class="navbar-xp-bar"><div class="navbar-xp-fill" id="navbar-xp-fill"></div></div>' +
            '<span class="navbar-xp-text" id="navbar-xp-text">0/300</span>' +
          '</div>' +
          '<span class="navbar-tier-badge" id="navbar-tier-badge">🌱 Aprendiz</span>' +
        '</div>' +

        // Dark toggle
        '<button class="dark-toggle" id="dark-toggle" aria-label="Alternar tema" title="Alternar tema">' +
          sunSVG + moonSVG +
        '</button>' +

        // Login button (shown when not logged in)
        '<a href="' + BASE + 'login.html" class="navbar-login-btn" id="navbar-login-btn">Entrar</a>' +

        // Avatar dropdown (shown when logged in)
        '<div class="navbar-avatar-wrapper" id="navbar-avatar-wrapper" style="display:none;">' +
          '<button class="navbar-avatar-btn" id="navbar-avatar-btn" aria-label="Menu do usuário">' +
            '<span class="navbar-avatar-icon" id="navbar-avatar-icon">🧑‍🎓</span>' +
            '<span class="navbar-avatar-name" id="navbar-avatar-name"></span>' +
            chevronDown +
          '</button>' +
          '<div class="navbar-avatar-dropdown" id="navbar-avatar-dropdown">' +
            // Populated dynamically based on user type
          '</div>' +
        '</div>' +
      '</div>' +

      // Mobile hamburger
      '<button class="navbar__toggle" id="menu-toggle" aria-label="Menu"><span></span><span></span><span></span></button>' +
    '</div>';
  }

  // ═══════════════════════════════════════
  //  FOOTER HTML
  // ═══════════════════════════════════════

  function buildFooter() {
    var col1 = subjects.slice(0, 6).map(function(s) {
      return '<a href="' + BASE + s.slug + '/" class="footer__link">' + s.name + '</a>';
    }).join('');
    var col2 = subjects.slice(6).map(function(s) {
      return '<a href="' + BASE + s.slug + '/" class="footer__link">' + s.name + '</a>';
    }).join('');

    return '' +
    '<div class="container footer__inner">' +
      '<div><div class="footer__brand">Beholder <span class="logo-highlight">Academy</span></div>' +
      '<p class="footer__desc">Portal educacional gamificado do Fundamental ao Ensino Médio. 12 matérias, conteúdo completo e gratuito.</p></div>' +
      '<div><h3 class="footer__col-title">Matérias</h3>' + col1 + '</div>' +
      '<div><h3 class="footer__col-title">Mais Matérias</h3>' + col2 + '</div>' +
      '<div><h3 class="footer__col-title">Projeto</h3>' +
        '<a href="' + BASE + 'roadmap.html" class="footer__link">Roadmap</a>' +
        '<a href="' + BASE + 'sobre.html" class="footer__link">Sobre</a>' +
        '<a href="' + BASE + 'fontes.html" class="footer__link">Fontes e Bibliografia</a>' +
        '<a href="' + BASE + 'privacidade.html" class="footer__link">Privacidade</a>' +
        '<a href="' + BASE + 'termos.html" class="footer__link">Termos de Uso</a>' +
        '<h3 class="footer__col-title" style="margin-top:1.5rem;">Contato</h3>' +
        '<a href="mailto:contato@beholderacademy.com.br" class="footer__link">contato@beholderacademy.com.br</a>' +
      '</div>' +
    '</div>' +
    '<div class="container footer__bottom">' +
      '<span>&copy; 2026 Beholder Academy. Todos os direitos reservados.</span>' +
      '<span>Feito com ⚡ para estudantes</span>' +
    '</div>';
  }

  // ═══════════════════════════════════════
  //  INJECT INTO PAGE
  // ═══════════════════════════════════════

  function inject() {
    // Find or create navbar container
    var nav = document.getElementById('main-navbar');
    if (!nav) {
      nav = document.querySelector('nav.navbar');
      if (nav) {
        nav.id = 'main-navbar';
        nav.innerHTML = buildNavbar();
      }
    } else {
      nav.className = 'navbar';
      nav.innerHTML = buildNavbar();
    }

    // Find or create footer container
    var footer = document.getElementById('main-footer');
    if (!footer) {
      footer = document.querySelector('footer.footer');
      if (footer) {
        footer.id = 'main-footer';
        footer.innerHTML = buildFooter();
      }
    } else {
      footer.className = 'footer';
      footer.innerHTML = buildFooter();
    }
  }

  // ═══════════════════════════════════════
  //  USER STATE (3 states)
  // ═══════════════════════════════════════

  function updateUserState() {
    var loginBtn = document.getElementById('navbar-login-btn');
    var avatarWrapper = document.getElementById('navbar-avatar-wrapper');
    var xpArea = document.getElementById('navbar-xp-area');
    var avatarDropdown = document.getElementById('navbar-avatar-dropdown');
    var avatarIcon = document.getElementById('navbar-avatar-icon');
    var avatarName = document.getElementById('navbar-avatar-name');

    if (!loginBtn || !avatarWrapper) return;

    var userData = null;
    try { userData = JSON.parse(localStorage.getItem('beholder_user')); } catch(e) {}

    if (!userData) {
      // ── STATE: NOT LOGGED IN ──
      loginBtn.style.display = '';
      avatarWrapper.style.display = 'none';
      if (xpArea) xpArea.style.display = 'none';
      return;
    }

    // Logged in
    loginBtn.style.display = 'none';
    avatarWrapper.style.display = '';

    if (userData.type === 'responsavel') {
      // ── STATE: PARENT ──
      if (xpArea) xpArea.style.display = 'none';
      if (avatarIcon) avatarIcon.textContent = '👨‍👩‍👧';
      if (avatarName) avatarName.textContent = (userData.name || 'Responsável').split(' ')[0];

      if (avatarDropdown) {
        avatarDropdown.innerHTML = '' +
          '<a href="' + BASE + 'responsavel.html" class="navbar-dd-item">📊 Painel do Responsável</a>' +
          '<a href="' + BASE + 'responsavel.html#banco" class="navbar-dd-item">💰 Banco Digital</a>' +
          '<a href="' + BASE + 'responsavel.html#filhos" class="navbar-dd-item">👧 Meus Filhos</a>' +
          '<a href="' + BASE + 'responsavel.html#indicacao" class="navbar-dd-item">🎁 Indicar Amigo</a>' +
          '<div class="navbar-dd-divider"></div>' +
          '<button class="navbar-dd-item navbar-dd-logout" id="navbar-logout">↩️ Sair</button>';
      }
    } else {
      // ── STATE: STUDENT ──
      if (avatarIcon) avatarIcon.textContent = userData.avatar || '🧑‍🎓';
      if (avatarName) avatarName.textContent = '';

      // Show XP bar
      if (xpArea && typeof RPGEngine !== 'undefined') {
        xpArea.style.display = '';
        try {
          var rpgData = RPGEngine.load();
          var genLevel = RPGEngine.getGeneralLevel(rpgData);
          var tier = getTier(genLevel);

          // Level pill
          var lvlEl = document.getElementById('navbar-xp-level');
          if (lvlEl) lvlEl.textContent = 'Nv ' + genLevel;

          // XP bar fill
          var totalXP = 0;
          var subjectKeys = Object.keys(rpgData.subjectProgress || {});
          subjectKeys.forEach(function(k) { totalXP += (rpgData.subjectProgress[k].xp || 0); });
          
          // Calculate XP for current level → next level
          var XP_TABLE = [0,0,300,600,1200,1800,2400,3000,3600,4200,5000,6000,7000,8000,9000,10000,12000,14000,16000,18000,20000];
          var xpForCurrent = 0, xpForNext = 0;
          for (var i = 2; i <= genLevel; i++) xpForCurrent += XP_TABLE[i] || 0;
          xpForNext = xpForCurrent + (XP_TABLE[genLevel + 1] || XP_TABLE[20] || 20000);
          var xpInLevel = totalXP - xpForCurrent;
          var xpNeeded = xpForNext - xpForCurrent;
          var pct = Math.min(100, Math.max(0, (xpInLevel / xpNeeded) * 100));

          var fillEl = document.getElementById('navbar-xp-fill');
          if (fillEl) fillEl.style.width = pct + '%';

          var textEl = document.getElementById('navbar-xp-text');
          if (textEl) textEl.textContent = xpInLevel + '/' + xpNeeded;

          // Tier badge
          var tierEl = document.getElementById('navbar-tier-badge');
          if (tierEl) {
            tierEl.textContent = tier.icon + ' ' + tier.name;
            tierEl.style.background = tier.color;
            tierEl.style.color = '#fff';
          }
        } catch(e) {
          console.warn('Navbar XP error:', e);
          xpArea.style.display = 'none';
        }
      } else if (xpArea) {
        xpArea.style.display = 'none';
      }

      if (avatarDropdown) {
        avatarDropdown.innerHTML = '' +
          '<a href="' + BASE + 'painel.html" class="navbar-dd-item">🎮 Meu Painel</a>' +
          '<a href="' + BASE + 'painel.html#conquistas" class="navbar-dd-item">🏆 Conquistas</a>' +
          '<a href="' + BASE + 'painel.html#loja" class="navbar-dd-item">🛒 Loja</a>' +
          '<a href="' + BASE + 'painel.html#indicacao" class="navbar-dd-item">🎁 Indicar Amigo</a>' +
          '<div class="navbar-dd-divider"></div>' +
          '<button class="navbar-dd-item navbar-dd-logout" id="navbar-logout">↩️ Sair</button>';
      }
    }

    // Bind logout
    setTimeout(function() {
      var logoutBtn = document.getElementById('navbar-logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
          if (confirm('Deseja sair? Seu progresso está salvo.')) {
            localStorage.removeItem('beholder_user');
            window.location.href = BASE + 'login.html';
          }
        });
      }
    }, 50);
  }

  // ═══════════════════════════════════════
  //  EVENT LISTENERS
  // ═══════════════════════════════════════

  function bindEvents() {
    // Subject dropdown
    var dropdownToggle = document.getElementById('dropdown-toggle');
    var navDropdown = document.getElementById('nav-dropdown');
    if (dropdownToggle && navDropdown) {
      dropdownToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        navDropdown.classList.toggle('open');
      });
    }

    // Avatar dropdown
    var avatarBtn = document.getElementById('navbar-avatar-btn');
    var avatarDropdown = document.getElementById('navbar-avatar-dropdown');
    if (avatarBtn && avatarDropdown) {
      avatarBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        avatarDropdown.classList.toggle('open');
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', function() {
      if (navDropdown) navDropdown.classList.remove('open');
      if (avatarDropdown) avatarDropdown.classList.remove('open');
    });

    // Mobile toggle
    var menuToggle = document.getElementById('menu-toggle');
    var navbarNav = document.querySelector('.navbar__nav');
    var navbarActions = document.querySelector('.navbar__actions');
    if (menuToggle) {
      menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        if (navbarNav) navbarNav.classList.toggle('open');
        if (navbarActions) navbarActions.classList.toggle('open');
      });
    }
  }

  // ═══════════════════════════════════════
  //  INIT
  // ═══════════════════════════════════════

  function init() {
    inject();
    updateUserState();
    bindEvents();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for external use
  window.BeholderNavbar = {
    refresh: function() {
      updateUserState();
    }
  };

})();
