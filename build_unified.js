const fs = require('fs');
const path = require('path');

// --- Security: HTML Escape for text fields ---
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// --- Configuration ---
const CONTENT_DIR = path.join(__dirname, 'content');
const ASSETS_DIR = 'assets';

const subjectIcons = {
  portugues: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  matematica: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>',
  historia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m13 17 2-8 3 4 3-6"/></svg>',
  geografia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
  biologia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0Z"/><path d="M10 8a1 1 0 1 0 2 0 1 1 0 1 0-2 0Z"/><path d="M14 16a1 1 0 1 0 2 0 1 1 0 1 0-2 0Z"/><circle cx="12" cy="12" r="9"/></svg>',
  quimica: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v14.5a3.5 3.5 0 0 0 7 0V2"/><path d="M9 2h9"/><path d="M10 12h7"/></svg>',
  fisica: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2 21h20L12 3z" fill="currentColor" fill-opacity="0.1"/><path d="M12 3v18"/><path d="M5 15h14"/></svg>',
  ingles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>',
  filosofia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A4.5 4.5 0 0 0 13.5 3.5c-1.3 0-2.6.5-3.5 1.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
  sociologia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  literatura: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  redacao: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>'
};

const subjectSlugs = ['portugues', 'matematica', 'historia', 'geografia', 'biologia', 'quimica', 'fisica', 'ingles', 'filosofia', 'sociologia', 'literatura', 'redacao'];
const subjectNames = ['Português', 'Matemática', 'História', 'Geografia', 'Biologia', 'Química', 'Física', 'Inglês', 'Filosofia', 'Sociologia', 'Literatura', 'Redação'];

// Helper: convert var(--color) to proper rgba for inline backgrounds
const colorToRgba = {
  'var(--portugues)':  { bg10: 'rgba(67, 97, 238, 0.10)',  bg15: 'rgba(67, 97, 238, 0.15)'  },
  'var(--matematica)': { bg10: 'rgba(6, 214, 160, 0.10)',   bg15: 'rgba(6, 214, 160, 0.15)'  },
  'var(--historia)':   { bg10: 'rgba(230, 57, 70, 0.10)',   bg15: 'rgba(230, 57, 70, 0.15)'  },
  'var(--geografia)':  { bg10: 'rgba(244, 162, 97, 0.10)',  bg15: 'rgba(244, 162, 97, 0.15)' },
  'var(--biologia)':   { bg10: 'rgba(155, 89, 182, 0.10)',  bg15: 'rgba(155, 89, 182, 0.15)' },
  'var(--quimica)':    { bg10: 'rgba(230, 126, 34, 0.10)',  bg15: 'rgba(230, 126, 34, 0.15)' },
  'var(--fisica)':     { bg10: 'rgba(0, 188, 212, 0.10)',   bg15: 'rgba(0, 188, 212, 0.15)'  },
  'var(--ingles)':     { bg10: 'rgba(26, 188, 156, 0.10)',  bg15: 'rgba(26, 188, 156, 0.15)' },
  'var(--filosofia)':  { bg10: 'rgba(96, 125, 139, 0.10)',  bg15: 'rgba(96, 125, 139, 0.15)' },
  'var(--sociologia)': { bg10: 'rgba(233, 30, 99, 0.10)',   bg15: 'rgba(233, 30, 99, 0.15)'  },
  'var(--literatura)': { bg10: 'rgba(141, 110, 99, 0.10)',  bg15: 'rgba(141, 110, 99, 0.15)' },
  'var(--redacao)':    { bg10: 'rgba(255, 112, 67, 0.10)',  bg15: 'rgba(255, 112, 67, 0.15)' }
};
function getBg(color, opacity) {
  const map = colorToRgba[color];
  return map ? map['bg' + opacity] : `rgba(123, 47, 247, 0.${opacity})`;
}

// --- Shared Head Tags ---
function getHeadExtras() {
  return `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
  <meta name="theme-color" content="#7B2FF7">
  <meta property="og:image" content="${SITE_URL}/assets/og-image.png">`;
}

// --- Shared Templates ---

function getNavDropdown(relativePath = '') {
  const links = subjectSlugs.map((slug, i) => {
    const iconWithAria = subjectIcons[slug].replace('<svg ', `<svg role="img" aria-label="${subjectNames[i]}" `);
    return `<a href="${relativePath}${slug}/">${iconWithAria} ${subjectNames[i]}</a>`;
  }).join('');

  return `
  <div class="navbar__dropdown" id="nav-dropdown">
    <button class="navbar__dropdown-toggle" id="dropdown-toggle">Matérias <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
    <div class="navbar__dropdown-menu">
      ${links}
    </div>
  </div>
`;
}

function getHeader(relativePath = '', activeLink = '') {
  return `
  <nav class="navbar"><div class="container navbar__inner">
    <a href="${relativePath}index.html" class="navbar__logo">Beholder <span class="logo-highlight">Academy</span></a>
    
    <div class="navbar__nav">
      <a href="${relativePath}index.html" class="navbar__link ${activeLink === 'home' || activeLink === 'index' ? 'navbar__link--active' : ''}">Home</a>
      ${getNavDropdown(relativePath)}

      <div class="navbar__panel-links">
        <a href="${relativePath}painel.html" class="navbar__panel-link">🎮 Painel Aluno</a>
        <a href="${relativePath}responsavel.html" class="navbar__panel-link">👨‍👩‍👧 Painel Pais</a>
      </div>
    </div>

    <div class="navbar__actions">
      <button class="dark-toggle" id="dark-toggle" aria-label="Alternar tema" title="Alternar tema">
        <svg class="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg class="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      </button>
      <div class="user-widget" id="user-widget">
        <a href="${relativePath}painel.html" class="user-avatar-circle" id="user-avatar" title="Meu Perfil">🧑‍🎓</a>
        <span class="user-level-pill" id="user-level-pill">Nv 1</span>
        <button class="btn-logout" id="btn-logout" title="Sair">Sair</button>
      </div>
    </div>

    <button class="navbar__toggle" id="menu-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
  </div></nav>
  `;
}

function getFooter(relativePath = '') {
  // Split 12 subjects into 2 columns
  const col1 = subjectSlugs.slice(0, 6).map((s, i) => `<a href="${relativePath}${s}/" class="footer__link">${subjectNames[i]}</a>`).join('');
  const col2 = subjectSlugs.slice(6).map((s, i) => `<a href="${relativePath}${s}/" class="footer__link">${subjectNames[i + 6]}</a>`).join('');

  return `
  <footer class="footer"><div class="container footer__inner">
    <div><div class="footer__brand">Beholder <span class="logo-highlight">Academy</span></div><p class="footer__desc">Portal educacional gamificado do Fundamental ao Ensino Médio. 12 matérias, conteúdo completo e gratuito.</p></div>
    <div><h3 class="footer__col-title">Matérias</h3>${col1}</div>
    <div><h3 class="footer__col-title">Mais Matérias</h3>${col2}</div>
    <div><h3 class="footer__col-title">Projeto</h3><a href="${relativePath}roadmap.html" class="footer__link">Roadmap</a><a href="${relativePath}sobre.html" class="footer__link">Sobre</a><a href="${relativePath}fontes.html" class="footer__link">Fontes e Bibliografia</a><a href="${relativePath}privacidade.html" class="footer__link">Privacidade</a><h3 class="footer__col-title" style="margin-top:1.5rem;">Contato</h3><a href="mailto:contato@beholderacademy.com.br" class="footer__link">contato@beholderacademy.com.br</a></div>
  </div><div class="container footer__bottom"><span>&copy; 2026 Beholder Academy. Todos os direitos reservados.</span><span>Feito com ⚡ para estudantes</span></div></footer>
  `;
}

// --- SEO Helpers ---
const SITE_URL = 'https://beholderacademy.com.br';

function getOGTags(title, description, url) {
  return `
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:site_name" content="Beholder Academy">
  <meta property="og:locale" content="pt_BR">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">`;
}

function getArticleSchema(art, subject, slug) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": art.title,
    "description": art.desc,
    "author": { "@type": "Organization", "name": "Beholder Academy" },
    "publisher": { "@type": "Organization", "name": "Beholder Academy", "url": SITE_URL },
    "mainEntityOfPage": `${SITE_URL}/${slug}/${art.slug}.html`,
    "articleSection": subject,
    "inLanguage": "pt-BR"
  };
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function getFAQSchema(faq) {
  if (!faq || faq.length === 0) return '';
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faq.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}

function getBreadcrumbSchema(subject, articleTitle, subjectSlug, articleSlug) {
  const items = [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE_URL + "/" }
  ];
  if (subject) {
    items.push({ "@type": "ListItem", "position": 2, "name": subject, "item": `${SITE_URL}/${subjectSlug}/` });
  }
  if (articleTitle) {
    items.push({ "@type": "ListItem", "position": 3, "name": articleTitle, "item": `${SITE_URL}/${subjectSlug}/${articleSlug}.html` });
  }
  return `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items })}</script>`;
}

function getBreadcrumb(relativePath, subject, articleTitle) {
  let html = `<nav class="breadcrumb" aria-label="Navegação"><a href="${relativePath}">Home</a>`;
  if (subject) {
    const idx = subjectNames.indexOf(subject);
    const slug = idx >= 0 ? subjectSlugs[idx] : '';
    html += ` <span class="breadcrumb__sep">›</span> <a href="${relativePath}${slug}/">${subject}</a>`;
  }
  if (articleTitle) {
    html += ` <span class="breadcrumb__sep">›</span> <span class="breadcrumb__current">${articleTitle}</span>`;
  }
  html += `</nav>`;
  return html;
}

// --- Generator Functions ---

function generateLanding(subjectData, allSubjectsData) {
  const { subject, slug, articles, color } = subjectData;
  
  // RPG Tier system - progressive unlocking
  const tiers = [
    { key: 'Básico', name: '🌱 Explorador', desc: 'Conteúdo inicial — comece sua jornada aqui!', unlockXP: 0 },
    { key: 'Intermediário', name: '⚔️ Guerreiro', desc: 'Desafios intermediários — prove seu valor!', unlockXP: 500 },
    { key: 'Avançado', name: '👑 Mestre', desc: 'Conteúdo avançado — apenas para os mais dedicados!', unlockXP: 2000 }
  ];
  
  const sectionsHtml = tiers.map(tier => {
    const filteredArticles = articles.filter(a => (a.difficulty || 'Básico') === tier.key);
    if (filteredArticles.length === 0) return '';

    const cards = filteredArticles.map(art => {
      return `
    <a href="${art.slug}.html" class="subject-card reveal quest-card" data-tier="${tier.key}" data-xp-required="${tier.unlockXP}" data-xp-reward="${art.xp}">
      <div class="subject-card__icon" style="background:${getBg(color, 10)}; color:${color}; font-weight:700; font-size:12px;">${tier.key === 'Básico' ? '🌱' : tier.key === 'Intermediário' ? '⚔️' : '👑'}</div>
      <div class="quest-lock" style="display:none;">🔒</div>
      <h3 class="subject-card__title">${art.title}</h3>
      <p class="subject-card__desc">${art.desc}</p>
      <div style="font-size: 0.8rem; color: var(--text-muted); display:flex; gap: 10px;">
        <span>⏱️ ${art.reading_time} min</span>
        <span style="color: ${color}">💎 +${art.xp} XP</span>
      </div>
    </a>
      `;
    }).join('');

    const totalXP = filteredArticles.reduce((s, a) => s + a.xp, 0);
    return `
    <section class="subjects-section tier-section" data-tier="${tier.key}" data-unlock-xp="${tier.unlockXP}">
      <div class="tier-header">
        <h2 class="section-title" style="border-bottom-color: ${color}">${tier.name}</h2>
        <p class="tier-desc">${tier.desc} <span class="tier-count">${filteredArticles.length} quests</span> · <span class="tier-xp">💎 ${totalXP} XP</span></p>
        <div class="tier-unlock-msg" style="display:none;">
          <span class="tier-lock-icon">🔒</span> Alcance <strong class="tier-xp-needed">${tier.unlockXP} XP</strong> para desbloquear este nível!
        </div>
      </div>
      <div class="subjects-grid">
        ${cards}
      </div>
    </section>
    `;
  }).join('');

  const landingDesc = `Acervo completo de ${subject} com ${articles.length} artigos. Conteúdo organizado por nível para Fundamental e Ensino Médio.`;
  const landingUrl = `${SITE_URL}/${slug}/`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject} — Beholder Academy</title>
  <meta name="description" content="${landingDesc}">
  ${getOGTags(subject + ' — Beholder Academy', landingDesc, landingUrl)}
  ${getHeadExtras()}
  <link rel="stylesheet" href="../assets/styles.css">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  ${getBreadcrumbSchema(subject, '', slug, '')}
</head>
<body>
  ${getHeader('../', slug)}
  <main>
    <header class="hero">
      <div class="container--narrow">
        ${getBreadcrumb('../', subject, '')}
        <div class="subject-card__icon" style="background:${getBg(color, 15)}; color:${color}; margin: 0 auto 1.5rem; width: 64px; height: 64px; border-radius: 16px;">
          ${subjectIcons[slug] || ''}
        </div>
        <h1 class="hero__title">${subject}</h1>
        <p class="hero__desc"><strong>${articles.length} quests</strong> disponíveis — complete desafios, ganhe XP e desbloqueie novos níveis!</p>
        
        <div class="xp-status reveal" id="xp-status">
          <span class="xp-status__level" id="xp-level">🌱 Explorador</span>
          <span class="xp-status__xp" id="xp-display">💎 0 XP</span>
        </div>
        <div class="xp-progress-bar reveal">
          <div class="xp-progress-fill" id="xp-bar" style="width: 0%"></div>
        </div>
        
        <div class="search-bar reveal">
          <input type="text" id="search-input" class="search-bar__input" placeholder="Buscar quest em ${subject}...">
          <svg class="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
      </div>
    </header>

    <div class="container">
      ${sectionsHtml}
    </div>
  </main>
  ${getFooter('../')}
  <script src="../assets/theme.js"></script>
  <script src="../assets/app.js"></script>
  <script src="../assets/rpg-engine.js"></script>
  <script>
  (function() {
    var SUBJECT = '${slug}';
    var rpgData;
    try { rpgData = JSON.parse(localStorage.getItem('beholder_rpg_data')); } catch(e) {}
    var subjectXP = 0;
    if (rpgData && rpgData.subjectProgress && rpgData.subjectProgress[SUBJECT]) {
      subjectXP = rpgData.subjectProgress[SUBJECT].xp || 0;
    }
    var completedArticles = (rpgData && rpgData.completedQuests) ? rpgData.completedQuests : [];
    
    function updateDisplay() {
      var levelEl = document.getElementById('xp-level');
      var xpEl = document.getElementById('xp-display');
      var barEl = document.getElementById('xp-bar');
      if (!levelEl) return;
      
      if (subjectXP >= 2000) {
        levelEl.textContent = '👑 Mestre';
        barEl.style.width = '100%';
      } else if (subjectXP >= 500) {
        levelEl.textContent = '⚔️ Guerreiro';
        barEl.style.width = Math.min(100, (subjectXP / 2000) * 100) + '%';
      } else {
        levelEl.textContent = '🌱 Explorador';
        barEl.style.width = Math.min(100, (subjectXP / 500) * 100) + '%';
      }
      xpEl.textContent = '💎 ' + subjectXP + ' XP';
      
      document.querySelectorAll('.tier-section').forEach(function(section) {
        var requiredXP = parseInt(section.dataset.unlockXp || '0');
        if (subjectXP < requiredXP) {
          section.classList.add('is-locked');
        } else {
          section.classList.remove('is-locked');
        }
      });
      
      document.querySelectorAll('.quest-card').forEach(function(card) {
        var href = card.getAttribute('href');
        if (href) {
          var slug = SUBJECT + '/' + href.replace('.html', '');
          if (completedArticles.includes(slug)) {
            card.classList.add('is-completed');
          }
        }
      });
    }
    updateDisplay();
  })();
  </script>
</body></html>`;

  fs.mkdirSync(slug, { recursive: true });
  fs.writeFileSync(path.join(slug, 'index.html'), html);
  console.log(`  ✓ Lander: ${slug}/index.html (${articles.length} artigos)`);
}

function generateArticle(subjectData, art, index, allArticles) {
  const { subject, slug, color } = subjectData;

  // Prev / Next navigation
  const prevArt = index > 0 ? allArticles[index - 1] : null;
  const nextArt = index < allArticles.length - 1 ? allArticles[index + 1] : null;

  const prevNextHtml = `
    <div class="article-nav">
      ${prevArt ? `<a href="${prevArt.slug}.html" class="article-nav__link article-nav__prev"><span class="article-nav__label">← Anterior</span><span class="article-nav__title">${prevArt.title}</span></a>` : '<div></div>'}
      ${nextArt ? `<a href="${nextArt.slug}.html" class="article-nav__link article-nav__next"><span class="article-nav__label">Próximo →</span><span class="article-nav__title">${nextArt.title}</span></a>` : '<div></div>'}
    </div>`;

  // FAQ with collapsible structure
  const faqHtml = art.faq && art.faq.length > 0 ? `
    <div class="faq-section reveal">
      <h2 class="section-title" style="border-bottom-color: ${color}">Dúvidas Frequentes</h2>
      <div class="faq-list">
        ${art.faq.map(f => `
          <div class="faq-item">
            <button class="faq-item__question" type="button">
              <span>${f.q}</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="faq-item__answer"><p>${f.a}</p></div>
          </div>
        `).join('')}
      </div>
    </div>` : '';

  // Quiz component
  const quizHtml = art.quiz && art.quiz.length > 0 ? `
    <div class="quiz-section reveal">
      <h2 class="section-title" style="border-bottom-color: ${color}">🧠 Teste seus Conhecimentos</h2>
      <div class="quiz-container" id="quiz-container" data-quiz="${Buffer.from(JSON.stringify(art.quiz)).toString('base64')}">
        <div class="quiz-card" id="quiz-card">
          <p class="quiz-question" id="quiz-question"></p>
          <div class="quiz-options" id="quiz-options"></div>
          <div class="quiz-feedback" id="quiz-feedback"></div>
          <button class="quiz-next" id="quiz-next" style="display:none;">Próxima Pergunta →</button>
        </div>
        <div class="quiz-result" id="quiz-result" style="display:none;">
          <h3>Resultado</h3>
          <p class="quiz-score" id="quiz-score"></p>
          <button class="quiz-restart" id="quiz-restart">Tentar Novamente</button>
        </div>
      </div>
    </div>` : '';

  // SEO
  // Use raw desc for meta (escapeHtml is applied inside getOGTags via escapeHtml)
  const metaDescRaw = art.desc || art.body.replace(/<[^>]*>?/gm, '').substring(0, 155).trim() + '...';
  const metaDesc = escapeHtml(metaDescRaw);
  // grade is internal-only metadata, not shown on the site
  const articleUrl = `${SITE_URL}/${slug}/${art.slug}.html`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${art.title} — ${subject} | Beholder Academy</title>
  <meta name="description" content="${metaDesc}">
  ${getOGTags(art.title + ' — ' + subject + ' | Beholder Academy', metaDescRaw, articleUrl)}
  ${getHeadExtras()}
  <link rel="stylesheet" href="../assets/styles.css">
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml">
  ${getArticleSchema(art, subject, slug)}
  ${getFAQSchema(art.faq)}
  ${getBreadcrumbSchema(subject, art.title, slug, art.slug)}
</head>
<body>
  <div class="reading-progress" style="background:${color}"></div>
  ${getHeader('../', slug)}
  
  <article class="container--narrow" style="padding: 4rem 0;">
    ${getBreadcrumb('../', subject, art.title)}
    <header class="article-header reveal">
      <div class="article-meta" style="justify-content: center; margin-bottom: 1rem;">
        <span style="color: ${color}; font-weight: 700;">${subject}</span>
        <span style="color: var(--text-muted)">•</span>
        <span>${art.difficulty === 'Básico' ? '🌱 Explorador' : art.difficulty === 'Intermediário' ? '⚔️ Guerreiro' : '👑 Mestre'}</span>
      </div>
      <h1 class="article-title">${art.title}</h1>
      <div class="article-meta">
        <span id="reading-time">⏱️ ${art.reading_time} min de leitura</span>
        <span style="background: ${getBg(color, 10)}; color: ${color}; padding: 2px 12px; border-radius: 6px; font-weight: 800;">+${art.xp} XP</span>
      </div>
    </header>

    <div class="article-body reveal">
      ${art.body}
    </div>

    <div class="essential-box reveal" style="border-left-color: ${color}">
      <h3 class="essential-box__title" style="color: ${color}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        Essencial para a Prova
      </h3>
      <p>${art.essential}</p>
    </div>

    ${faqHtml}
    ${quizHtml}

    <div class="sources-link reveal">
      <a href="../fontes.html" class="sources-link__btn">📖 Ver Fontes e Bibliografia Completa</a>
    </div>

    ${prevNextHtml}
  </article>

  ${getFooter('../')}
  <script src="../assets/theme.js"></script>
  <script src="../assets/rpg-engine.js"></script>
  <script src="../assets/app.js"></script>
</body></html>`;

  fs.writeFileSync(path.join(slug, `${art.slug}.html`), html);
}

// --- Main Build Execution ---
console.log('\n🔨 Beholder Academy — Build\n');

const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json'));
let totalArticlesCount = 0;
let totalSubjectsCount = files.length;
let allSubjectsData = [];

// Phase 1: Load all data
files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
    if (!data.articles || !Array.isArray(data.articles)) {
      console.error(`  ✗ ${file}: campo 'articles' ausente ou inválido`);
      process.exit(1);
    }
    totalArticlesCount += data.articles.length;
    allSubjectsData.push(data);
  } catch(e) {
    console.error(`  ✗ Erro ao processar ${file}: ${e.message}`);
    process.exit(1);
  }
});

// Phase 1b: Load Fund1 data (content/fund1/*.json) - adds to search index only
const fund1Data = [];
const fund1Dir = path.join(CONTENT_DIR, 'fund1');
if (fs.existsSync(fund1Dir)) {
  const fund1Files = fs.readdirSync(fund1Dir).filter(f => f.endsWith('.json'));
  fund1Files.forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(fund1Dir, file), 'utf8'));
      if (!data.articles || !Array.isArray(data.articles)) return;
      // Normalize Fund1 articles to match main schema
      data.articles.forEach(art => {
        if (!art.grade) art.grade = data.slug.startsWith('1ano') ? '1º ano EF1' : '2º ano EF1';
        if (!art.topic) art.topic = art.category || 'Geral';
        if (!art.quiz) art.quiz = [];
      });
      fund1Data.push(data);
    } catch(e) {
      console.warn(`  ⚠ Fund1 ${file}: ${e.message}`);
    }
  });
  if (fund1Data.length > 0) {
    console.log(`  ✓ Fund1: ${fund1Data.length} arquivos, ${fund1Data.reduce((s,d) => s+d.articles.length, 0)} artigos (search-index only)`);
  }
}

// Phase 1c: Load Fund2 data (content/fund2/*.json) - merge into existing subjects
const fund2Dir = path.join(CONTENT_DIR, 'fund2');
if (fs.existsSync(fund2Dir)) {
  const fund2Files = fs.readdirSync(fund2Dir).filter(f => f.endsWith('.json'));
  let fund2Total = 0;
  
  fund2Files.forEach(file => {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(fund2Dir, file), 'utf8'));
      if (!data.articles || !Array.isArray(data.articles)) return;
      
      // Find matching subject in allSubjectsData by normalized name
      const subjectKey = data.subject.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');
      
      const match = allSubjectsData.find(s => {
        const sKey = s.subject.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-');
        return sKey === subjectKey || s.slug === subjectKey;
      });
      
      if (match) {
        // Merge fund2 articles into the existing subject
        match.articles.push(...data.articles);
        totalArticlesCount += data.articles.length;
        fund2Total += data.articles.length;
      } else {
        console.warn(`  ⚠ Fund2 ${file}: matéria "${data.subject}" não encontrada no EM, criando nova entrada`);
        // Create a new subject entry if no EM equivalent exists
        allSubjectsData.push(data);
        totalArticlesCount += data.articles.length;
        fund2Total += data.articles.length;
      }
    } catch(e) {
      console.warn(`  ⚠ Fund2 ${file}: ${e.message}`);
    }
  });
  
  if (fund2Total > 0) {
    console.log(`  ✓ Fund2: ${fund2Files.length} arquivos, ${fund2Total} artigos (merged into subjects)`);
  }
}

// Phase 2: Generate pages for main (EM) subjects
allSubjectsData.forEach(data => {
  generateLanding(data, allSubjectsData);
  data.articles.forEach((art, i) => generateArticle(data, art, i, data.articles));
});

// Phase 3: Generate search index for global search
const searchIndex = [];
allSubjectsData.forEach(data => {
  data.articles.forEach(art => {
    searchIndex.push({
      title: art.title,
      desc: (art.desc || '').substring(0, 80),
      subject: data.subject,
      slug: `${data.slug}/${art.slug}.html`,
      difficulty: art.difficulty || 'Básico',
      grade: art.grade || '',
      xp: art.xp
    });
  });
});
// Include Fund1 articles in search index
fund1Data.forEach(data => {
  data.articles.forEach(art => {
    searchIndex.push({
      title: art.title,
      desc: (art.desc || '').substring(0, 80),
      subject: data.subject,
      slug: '', // No HTML pages yet for Fund1
      difficulty: art.difficulty || 'Básico',
      grade: art.grade || '',
      xp: art.xp
    });
  });
});
fs.writeFileSync(path.join(ASSETS_DIR, 'search-index.json'), JSON.stringify(searchIndex));
console.log(`  ✓ Search index: ${searchIndex.length} articles indexed (${Math.round(Buffer.byteLength(JSON.stringify(searchIndex))/1024)}KB)`);

// Phase 4: Generate favicon SVG
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#7B2FF7"/><text x="50" y="68" font-size="52" font-family="Arial" font-weight="bold" fill="white" text-anchor="middle">BA</text></svg>`;
fs.writeFileSync(path.join(ASSETS_DIR, 'favicon.svg'), faviconSvg);
console.log(`  ✓ Favicon generated`);

// Phase 5: Update static pages
function updateStaticPages() {
  ['index.html', 'roadmap.html', 'sobre.html', 'privacidade.html', 'fontes.html'].forEach(page => {
    if (!fs.existsSync(page)) return;
    let content = fs.readFileSync(page, 'utf8');
    
    const headerHtml = getHeader('', page.split('.')[0]);
    const footerHtml = getFooter('');
    
    if (content.includes('class="navbar"')) {
      content = content.replace(/<nav[\s\S]*?class="navbar"[\s\S]*?>[\s\S]*?<\/nav>/, headerHtml);
    }
    if (content.includes('class="footer"')) {
      content = content.replace(/<footer[\s\S]*?class="footer"[\s\S]*?>[\s\S]*?<\/footer>/, footerHtml);
    }
    
    // Update article/subject counts in homepage
    if (page === 'index.html') {
      // Fix stats: update both the matérias count and artigos count
      // Use specific patterns to avoid replacing wrong occurrences
      content = content.replace(/class="brand-primary;">\d+<\/div>\s*<div[^>]*>Matérias/g, 
        `class="brand-primary;">${totalSubjectsCount}</div>\n             <div style="font-size: 0.85rem; color: var(--text-muted);">Matérias`);
      content = content.replace(/class="brand-primary;">\d+<\/div>\s*<div[^>]*>Artigos/g,
        `class="brand-primary;">${totalArticlesCount}</div>\n             <div style="font-size: 0.85rem; color: var(--text-muted);">Artigos`);
    }

    if (page === 'roadmap.html') {
      content = content.replace(/data-count="\d+"/g, `data-count="${totalArticlesCount}"`);
    }

    fs.writeFileSync(page, content);
    console.log(`  ✓ Static: ${page}`);
  });
}

updateStaticPages();

// Phase 6: Generate sitemap.xml
function generateSitemap() {
  const now = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', freq: 'weekly' },
    { url: '/sobre.html', priority: '0.6', freq: 'monthly' },
    { url: '/roadmap.html', priority: '0.5', freq: 'monthly' },
    { url: '/fontes.html', priority: '0.5', freq: 'monthly' },
    { url: '/privacidade.html', priority: '0.3', freq: 'yearly' }
  ];
  staticPages.forEach(p => {
    xml += `  <url><loc>${SITE_URL}${p.url}</loc><lastmod>${now}</lastmod><changefreq>${p.freq}</changefreq><priority>${p.priority}</priority></url>\n`;
  });

  // Subject landings
  allSubjectsData.forEach(data => {
    xml += `  <url><loc>${SITE_URL}/${data.slug}/</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
  });

  // Articles
  allSubjectsData.forEach(data => {
    data.articles.forEach(art => {
      xml += `  <url><loc>${SITE_URL}/${data.slug}/${art.slug}.html</loc><lastmod>${now}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
    });
  });

  xml += '</urlset>\n';
  fs.writeFileSync('sitemap.xml', xml);
  console.log(`  ✓ Sitemap: ${staticPages.length + allSubjectsData.length + totalArticlesCount} URLs`);
}

generateSitemap();
console.log(`\n✅ Build completo! ${totalSubjectsCount} matérias, ${totalArticlesCount} artigos.\n`);
