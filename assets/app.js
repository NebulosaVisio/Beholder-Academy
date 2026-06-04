/* ============================================
   BEHOLDER ACADEMY — App JavaScript v2
   Dark mode, Global search, Quiz, FAQ, XP
   ============================================ */

(function() {
  'use strict';

  // --- Security: HTML Sanitization ---
  function sanitize(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Utility: Debounce ---
  function debounce(fn, delay) {
    var timer;
    return function() {
      var ctx = this, args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  }

  // --- Dark Mode ---
  // Centralizado em theme.js (carregado antes deste script)

  // --- Reading Progress Bar ---
  function initReadingProgress() {
    const progressBar = document.querySelector('.reading-progress');
    if (!progressBar) return;

    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(progress, 100) + '%';
    }

    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // --- Mobile Menu Toggle ---
  function initMobileMenu() {
    const toggle = document.querySelector('.navbar__toggle');
    const nav = document.querySelector('.navbar__nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
      toggle.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });

    nav.querySelectorAll('.navbar__link, .navbar__dropdown-menu a').forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Dropdown Menu ---
  function initDropdown() {
    var dropdown = document.getElementById('nav-dropdown');
    var toggleBtn = document.getElementById('dropdown-toggle');
    if (!dropdown || !toggleBtn) return;

    toggleBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }

  // --- Scroll Reveal Animations ---
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function(el) { observer.observe(el); });
  }

  // --- FAQ Toggle (Collapsible + aria-expanded) ---
  function initFAQ() {
    document.querySelectorAll('.faq-item__question').forEach(function(btn) {
      // Set initial aria state
      btn.setAttribute('aria-expanded', 'false');

      btn.addEventListener('click', function() {
        var item = btn.closest('.faq-item');
        var isActive = item.classList.contains('active');

        // Close siblings
        item.parentElement.querySelectorAll('.faq-item.active').forEach(function(openItem) {
          openItem.classList.remove('active');
          var openBtn = openItem.querySelector('.faq-item__question');
          if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
        });

        if (!isActive) {
          item.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // --- Accent Normalization (for search) ---
  function normalizeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // --- Global Search (Home page) ---
  function initGlobalSearch() {
    var searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    // Check if we have article cards (subject landing) or subject cards (home)
    var articleCards = document.querySelectorAll('.subject-card[data-grade]');
    var subjectCards = document.querySelectorAll('#subjects .subject-card');

    // Subject landing page: filter article cards
    if (articleCards.length > 0) {
      searchInput.addEventListener('input', function() {
        var query = normalizeAccents(this.value.trim());
        articleCards.forEach(function(card) {
          var text = normalizeAccents(card.textContent);
          card.style.display = (!query || text.includes(query)) ? '' : 'none';
        });
      });
      return;
    }

    // Home page: global search with dropdown
    var resultsContainer = document.querySelector('.search-results');
    if (!resultsContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.className = 'search-results';
      searchInput.parentElement.appendChild(resultsContainer);
    }

    var searchIndex = null;

    searchInput.addEventListener('focus', function() {
      if (!searchIndex) {
        fetch('assets/search-index.json')
          .then(function(r) { return r.json(); })
          .then(function(data) { searchIndex = data; })
          .catch(function() {
            searchIndex = [];
            console.warn('Falha ao carregar search-index.json');
          });
      }
    });

    searchInput.addEventListener('input', debounce(function() {
      var query = normalizeAccents(this.value.trim());
      
      if (!query || !searchIndex) {
        resultsContainer.classList.remove('active');
        subjectCards.forEach(function(card) { card.style.display = ''; });
        return;
      }

      subjectCards.forEach(function(card) { card.style.display = 'none'; });

      var results = searchIndex.filter(function(item) {
        return normalizeAccents(item.title).includes(query) || 
               normalizeAccents(item.desc).includes(query) ||
               normalizeAccents(item.subject).includes(query);
      }).slice(0, 8);

      // Safe DOM construction (no innerHTML with user data)
      resultsContainer.innerHTML = '';
      if (results.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'search-results__empty';
        empty.textContent = 'Nenhum resultado encontrado';
        resultsContainer.appendChild(empty);
      } else {
        results.forEach(function(r) {
          var link = document.createElement('a');
          link.href = (r.slug && (r.slug.startsWith('/') || r.slug.startsWith('.') || !r.slug.includes(':'))) ? r.slug : '#';
          link.className = 'search-results__item';
          var wrap = document.createElement('div');
          var subj = document.createElement('div');
          subj.className = 'search-results__subject';
          subj.textContent = r.subject + ' \u2022 ' + r.difficulty;
          var title = document.createElement('div');
          title.className = 'search-results__title';
          title.textContent = r.title;
          wrap.appendChild(subj);
          wrap.appendChild(title);
          link.appendChild(wrap);
          resultsContainer.appendChild(link);
        });
      }
      resultsContainer.classList.add('active');
    }, 250));

    // Close results on click outside
    document.addEventListener('click', function(e) {
      if (!searchInput.parentElement.contains(e.target)) {
        resultsContainer.classList.remove('active');
        subjectCards.forEach(function(card) { card.style.display = ''; });
      }
    });
  }

  // --- Utility: Shuffle Array (Fisher-Yates) ---
  function shuffleArray(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i]; a[i] = a[j]; a[j] = temp;
    }
    return a;
  }

  // --- Quiz Engine ---
  function initQuiz() {
    var container = document.getElementById('quiz-container');
    if (!container) return;

    var quizData;
    try {
      // Decode Base64 with proper UTF-8 support
      var raw = container.getAttribute('data-quiz');
      try {
        var binaryStr = atob(raw);
        var bytes = new Uint8Array(binaryStr.length);
        for (var i = 0; i < binaryStr.length; i++) { bytes[i] = binaryStr.charCodeAt(i); }
        quizData = JSON.parse(new TextDecoder('utf-8').decode(bytes));
      } catch(e2) { quizData = JSON.parse(raw); }
    } catch(e) { return; }

    if (!quizData || quizData.length === 0) return;

    var currentQ = 0;
    var score = 0;
    var questionEl = document.getElementById('quiz-question');
    var optionsEl = document.getElementById('quiz-options');
    var feedbackEl = document.getElementById('quiz-feedback');
    var nextBtn = document.getElementById('quiz-next');
    var resultEl = document.getElementById('quiz-result');
    var scoreEl = document.getElementById('quiz-score');
    var restartBtn = document.getElementById('quiz-restart');
    var cardEl = document.getElementById('quiz-card');

    function renderQuestion() {
      var q = quizData[currentQ];
      questionEl.textContent = (currentQ + 1) + '/' + quizData.length + ' \u2014 ' + q.question;
      optionsEl.innerHTML = '';
      feedbackEl.className = 'quiz-feedback';
      feedbackEl.style.display = 'none';
      nextBtn.style.display = 'none';

      // Shuffle options while tracking correct answer
      var correctText = q.options[q.answer];
      var shuffled = shuffleArray(q.options);
      var newCorrectIdx = shuffled.indexOf(correctText);

      shuffled.forEach(function(opt, i) {
        var btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.addEventListener('click', function() { checkAnswer(i, newCorrectIdx, btn); });
        optionsEl.appendChild(btn);
      });
    }

    function checkAnswer(selected, correct, btn) {
      var options = optionsEl.querySelectorAll('.quiz-option');
      options.forEach(function(o, i) {
        o.classList.add('disabled');
        if (i === correct) o.classList.add('correct');
      });

      if (selected === correct) {
        btn.classList.add('correct');
        feedbackEl.textContent = '✓ Correto!';
        feedbackEl.className = 'quiz-feedback show correct';
        score++;
      } else {
        btn.classList.add('wrong');
        feedbackEl.textContent = '✗ Incorreto. A resposta certa é: ' + quizData[currentQ].options[correct];
        feedbackEl.className = 'quiz-feedback show wrong';
      }

      nextBtn.style.display = 'inline-block';
      nextBtn.textContent = currentQ < quizData.length - 1 ? 'Próxima Pergunta →' : 'Ver Resultado';
    }

    nextBtn.addEventListener('click', function() {
      currentQ++;
      if (currentQ < quizData.length) {
        renderQuestion();
      } else {
        cardEl.style.display = 'none';
        resultEl.style.display = 'block';
        var pct = Math.round((score / quizData.length) * 100);
        scoreEl.textContent = score + '/' + quizData.length + ' (' + pct + '%)';

        // Award XP via RPG Engine
        var pageId = window.location.pathname;
        var claimed = JSON.parse(localStorage.getItem('claimed_quiz') || '{}');
        if (!claimed[pageId] && score > 0) {
          var subject = detectSubject();
          if (typeof RPGEngine !== 'undefined' && subject) {
            var rpgData = RPGEngine.load();
            rpgData = RPGEngine.registerQuiz(rpgData, subject, score, quizData.length);
            var perfeito = score === quizData.length;
            scoreEl.textContent += perfeito ? ' — +100 XP + 10 🟡!' : ' — +50 XP + 5 🟡!';
            showToast(perfeito ? '🏆 Quiz Perfeito! +100 XP' : '⚡ +50 XP — Quiz completo!');
            showToast(perfeito ? '+10 🟡 Fichas' : '+5 🟡 Fichas', 'gold');
            if (perfeito) showToast('🎯 Quiz sem erros!', 'achievement');
          } else {
            // Fallback: old XP system
            setXP(getXP() + score * 25);
            scoreEl.textContent += ' — +' + (score * 25) + ' XP!';
            showToast('⚡ +' + (score * 25) + ' XP!');
          }
          claimed[pageId] = true;
          localStorage.setItem('claimed_quiz', JSON.stringify(claimed));
        }
      }
    });

    restartBtn.addEventListener('click', function() {
      currentQ = 0;
      score = 0;
      cardEl.style.display = 'block';
      resultEl.style.display = 'none';
      renderQuestion();
    });

    renderQuestion();
  }

  // --- Reading Time Calculator ---
  function initReadingTime() {
    var body = document.querySelector('.article-body');
    var display = document.getElementById('reading-time');
    if (!body || !display) return;

    var words = body.textContent.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.ceil(words / 200));
    display.textContent = '⏱️ ' + minutes + ' min de leitura';
  }

  // --- Smooth Scroll ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // --- Counter Animation ---
  function initCounters() {
    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var target = parseInt(el.getAttribute('data-count'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          var prefix = el.getAttribute('data-prefix') || '';
          var duration = 1500;
          var startTime = null;

          function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            var progress = Math.min((timestamp - startTime) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.floor(eased * target);
            el.textContent = prefix + current.toLocaleString('pt-BR') + suffix;
            if (progress < 1) requestAnimationFrame(animate);
          }
          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(el) { observer.observe(el); });
  }

  // --- XP Gamification System ---
  const XP_PER_LEVEL = 1000;

  // --- Toast Notification System ---
  function showToast(message, type) {
    var container = document.querySelector('.xp-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'xp-toast-container';
      document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'xp-toast' + (type ? ' xp-toast--' + type : '');
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 3200);
  }

  function getXP() {
    return parseInt(localStorage.getItem('beholder_xp') || '0', 10);
  }

  function setXP(val) {
    localStorage.setItem('beholder_xp', val);
    updateXPUI();
  }

  // Make setXP and getXP accessible for quiz
  window.getXP = getXP;
  window.setXP = setXP;

  function updateXPUI() {
    const xp = getXP();
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const xpInLevel = xp % XP_PER_LEVEL;
    const progressPercent = (xpInLevel / XP_PER_LEVEL) * 100;

    document.querySelectorAll('.xp-progress').forEach(function(el) { el.style.width = progressPercent + '%'; });
    document.querySelectorAll('.user-level').forEach(function(el) { el.textContent = level; });
    document.querySelectorAll('.xp-current').forEach(function(el) { el.textContent = xp.toLocaleString('pt-BR'); });
  }

  function initXP() {
    updateXPUI();
    // Register daily login and reading via RPG Engine
    if (typeof RPGEngine !== 'undefined') {
      var rpgData = RPGEngine.load();
      RPGEngine.registerDailyLogin(rpgData);
      trackArticleReading();
    }
  }

  // Detect subject from URL path
  function detectSubject() {
    var path = window.location.pathname.toLowerCase();
    var subjects = ['historia','portugues','matematica','geografia','biologia','quimica','fisica','ingles','filosofia','sociologia','literatura','redacao'];
    for (var i = 0; i < subjects.length; i++) {
      if (path.indexOf('/' + subjects[i] + '/') !== -1 || path.indexOf('/' + subjects[i] + '\\') !== -1) return subjects[i];
    }
    return null;
  }

   // Track article reading (register when user scrolls >80%)
  function trackArticleReading() {
    var body = document.querySelector('.article-body');
    if (!body) return;
    var subject = detectSubject();
    if (!subject) return;
    var slug = window.location.pathname;
    var readKey = 'beholder_read';
    var readList = JSON.parse(localStorage.getItem(readKey) || '[]');
    if (readList.includes(slug)) return;

    var tracked = false;
    window.addEventListener('scroll', function() {
      if (tracked) return;
      var scrollPct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPct > 0.8) {
        tracked = true;
        readList.push(slug);
        localStorage.setItem(readKey, JSON.stringify(readList));
        var rpgData = RPGEngine.load();
        RPGEngine.registerLeitura(rpgData, subject, slug);
        showToast('🎉 +50 XP — Leitura completa!');
        showToast('+5 🟡 Fichas', 'gold');
      }
    }, { passive: true });
  }

  // --- User Widget (Avatar + Level + Logout) ---
  function initUserWidget() {
    if (typeof RPGEngine === 'undefined') return;
    var rpgData = RPGEngine.load();
    var genLevel = RPGEngine.getGeneralLevel(rpgData);
    var levelPill = document.getElementById('user-level-pill');
    if (levelPill) levelPill.textContent = 'Nv ' + genLevel;

    // Logout button
    var logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        if (confirm('Deseja sair? Seu progresso está salvo localmente.')) {
          localStorage.removeItem('beholder_user');
          window.location.href = 'login.html';
        }
      });
    }
  }

  // --- Evolution System (Microlearning ↔ Complete) ---
  function initEvolutionSystem() {
    var evolutionLinks = document.querySelectorAll('.evolution-link[data-requires]');
    if (!evolutionLinks.length) return;

    var claimedQuiz = JSON.parse(localStorage.getItem('claimed_quiz') || '{}');

    evolutionLinks.forEach(function(link) {
      var requiredPage = link.getAttribute('data-requires');
      if (!requiredPage) return;

      // Check if the required microlearning quiz was completed
      var isUnlocked = false;
      Object.keys(claimedQuiz).forEach(function(key) {
        if (key.indexOf(requiredPage) !== -1) {
          isUnlocked = true;
        }
      });

      if (isUnlocked) {
        link.classList.remove('evolution-link--locked');
        var label = link.querySelector('.evolution-link__label');
        if (label) label.textContent = '📘 Aprofundar →';
      } else {
        link.classList.add('evolution-link--locked');
      }
    });
  }

  // --- Init All ---
  function init() {
    // Dark mode is now handled by theme.js (loaded before this script)
    initReadingProgress();
    initMobileMenu();
    initDropdown();
    initScrollReveal();
    initFAQ();
    initGlobalSearch();
    initReadingTime();
    initSmoothScroll();
    initCounters();
    initXP();
    initQuiz();
    initUserWidget();
    initEvolutionSystem();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
