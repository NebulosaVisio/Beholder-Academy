$base = "c:\Users\conta\Desktop\Beholder academy"

# Shared navbar HTML for subpages
$nav = @'
<nav class="navbar"><div class="navbar__inner"><a href="../" class="navbar__logo"><svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="url(#lg)" stroke-width="2.5"/><circle cx="16" cy="16" r="7" fill="url(#lg)"/><circle cx="16" cy="16" r="3" fill="#0A0A0F"/><defs><linearGradient id="lg" x1="4" y1="4" x2="28" y2="28"><stop stop-color="#7B2FF7"/><stop offset="1" stop-color="#00D4AA"/></linearGradient></defs></svg><span>Beholder <span class="logo-highlight">Academy</span></span></a><div class="navbar__nav" id="navbar-nav"><a href="../" class="navbar__link">Home</a><div class="navbar__dropdown" id="nav-dropdown"><button class="navbar__dropdown-toggle" id="dropdown-toggle">Matérias <svg viewBox="0 0 14 14" fill="none"><path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button><div class="navbar__dropdown-menu" id="dropdown-menu"><a href="../portugues/"><span class="dot" style="background:var(--portugues)"></span>Português</a><a href="../matematica/"><span class="dot" style="background:var(--matematica)"></span>Matemática</a><a href="../historia/"><span class="dot" style="background:var(--historia)"></span>História</a><a href="../geografia/"><span class="dot" style="background:var(--geografia)"></span>Geografia</a><a href="../biologia/"><span class="dot" style="background:var(--biologia)"></span>Biologia</a><a href="../quimica/"><span class="dot" style="background:var(--quimica)"></span>Química</a><a href="../fisica/"><span class="dot" style="background:var(--fisica)"></span>Física</a><a href="../ingles/"><span class="dot" style="background:var(--ingles)"></span>Inglês</a><a href="../filosofia/"><span class="dot" style="background:var(--filosofia)"></span>Filosofia</a><a href="../sociologia/"><span class="dot" style="background:var(--sociologia)"></span>Sociologia</a><a href="../literatura/"><span class="dot" style="background:var(--literatura)"></span>Literatura</a><a href="../redacao/"><span class="dot" style="background:var(--redacao)"></span>Redação</a></div></div><a href="../roadmap.html" class="navbar__link">Roadmap</a><a href="../sobre.html" class="navbar__link">Sobre</a></div><button class="navbar__toggle" id="menu-toggle" aria-label="Menu"><span></span><span></span><span></span></button></div></nav>
'@

$footer = @'
<footer class="footer"><div class="footer__inner"><div><div class="footer__brand">Beholder <span class="logo-highlight">Academy</span></div><p class="footer__desc">Portal de microlearning gamificado para o Ensino Fundamental 2 e Ensino Médio.</p></div><div><h3 class="footer__col-title">Matérias</h3><a href="../portugues/" class="footer__link">Português</a><a href="../matematica/" class="footer__link">Matemática</a><a href="../historia/" class="footer__link">História</a><a href="../geografia/" class="footer__link">Geografia</a><a href="../biologia/" class="footer__link">Biologia</a><a href="../quimica/" class="footer__link">Química</a></div><div><h3 class="footer__col-title">&nbsp;</h3><a href="../fisica/" class="footer__link">Física</a><a href="../ingles/" class="footer__link">Inglês</a><a href="../filosofia/" class="footer__link">Filosofia</a><a href="../sociologia/" class="footer__link">Sociologia</a><a href="../literatura/" class="footer__link">Literatura</a><a href="../redacao/" class="footer__link">Redação</a></div><div><h3 class="footer__col-title">Projeto</h3><a href="../roadmap.html" class="footer__link">Roadmap</a><a href="../sobre.html" class="footer__link">Sobre</a><a href="../privacidade.html" class="footer__link">Privacidade</a></div></div><div class="footer__bottom"><span>&copy; 2026 Beholder Academy. Todos os direitos reservados.</span><span>Feito com ⚡ para estudantes</span></div></footer>
'@

function MakeLanding($folder, $subjectName, $cssClass, $desc, $articles, $ctaTitle, $ctaDesc, $iconSvg) {
    $cards = ""
    foreach ($a in $articles) {
        $cards += @"
        <a href="$($a.file)" class="article-card reveal"><div class="article-card__icon subject-icon-$cssClass"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/></svg></div><div class="article-card__content"><h2 class="article-card__title">$($a.title)</h2><p class="article-card__desc">$($a.desc)</p><div class="article-card__meta"><span>⏱ 1 min</span><span class="xp-badge">+$($a.xp) XP</span></div></div><svg class="article-card__arrow" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></a>
"@
    }
    $html = @"
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>$subjectName — Beholder Academy</title><meta name="description" content="$desc"><link rel="canonical" href="https://beholderacademy.com.br/$folder/"><link rel="stylesheet" href="../assets/styles.css"><script type="application/ld+json">{"@context":"https://schema.org","@type":"CollectionPage","name":"$subjectName — Beholder Academy","url":"https://beholderacademy.com.br/$folder/","isPartOf":{"@type":"WebSite","name":"Beholder Academy","url":"https://beholderacademy.com.br"}}</script></head><body>
$nav
<main><div class="page-header page-header--$cssClass"><div class="container"><div class="page-header__content"><div class="breadcrumb reveal"><a href="../">Home</a><span class="breadcrumb__separator">›</span><span class="breadcrumb__current">$subjectName</span></div><h1 class="page-header__title reveal">$iconSvg $subjectName</h1><p class="page-header__desc reveal">$desc</p></div></div></div>
<div class="container" style="padding-bottom:4rem;"><div class="ad-slot ad-slot--banner"><span>Espaço Publicitário</span></div><div class="article-card-list">$cards</div></div>
<section class="cta-section"><div class="container"><div class="cta-section__content reveal"><h2 class="cta-section__title">$ctaTitle</h2><p class="cta-section__desc">$ctaDesc</p><a href="#webapp" class="btn btn--cta"><svg viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/></svg>GANHAR XP</a></div></div></section></main>
$footer
<script src="../assets/app.js"></script></body></html>
"@
    Set-Content -Path "$base\$folder\index.html" -Value $html -Encoding UTF8
    Write-Output "Created $folder/index.html"
}

function MakeArticle($folder, $file, $cssClass, $subjectName, $title, $breadcrumbTitle, $metaDesc, $xp, $bodyHtml, $essentialHtml, $faq1Q, $faq1A, $faq2Q, $faq2A, $emoji) {
    $html = @"
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>$title — $subjectName | Beholder Academy</title><meta name="description" content="$metaDesc"><link rel="canonical" href="https://beholderacademy.com.br/$folder/$file"><link rel="stylesheet" href="../assets/styles.css"><script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"$title","description":"$metaDesc","author":{"@type":"Organization","name":"Beholder Academy"},"publisher":{"@type":"Organization","name":"Beholder Academy","url":"https://beholderacademy.com.br"},"datePublished":"2026-04-02","dateModified":"2026-04-02","mainEntityOfPage":"https://beholderacademy.com.br/$folder/$file","inLanguage":"pt-BR"}</script><script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"$faq1Q","acceptedAnswer":{"@type":"Answer","text":"$faq1A"}},{"@type":"Question","name":"$faq2Q","acceptedAnswer":{"@type":"Answer","text":"$faq2A"}}]}</script></head><body>
<div class="reading-progress $cssClass" id="reading-progress"></div>
$nav
<main><div class="container"><div class="article-layout"><article class="article-content">
<div class="breadcrumb reveal"><a href="../">Home</a><span class="breadcrumb__separator">›</span><a href="./">$subjectName</a><span class="breadcrumb__separator">›</span><span class="breadcrumb__current">$breadcrumbTitle</span></div>
<div class="article-meta reveal"><div class="article-meta__item"><svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M8 4v4l3 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg><span id="reading-time">1 min de leitura</span></div><div class="article-meta__item"><svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 6h12M6 2v12" stroke="currentColor" stroke-width="1.5"/></svg><span>02 Abr 2026</span></div><span class="xp-badge">+$xp XP</span></div>
<h1 class="article-title reveal">$title</h1>
<div class="ad-slot ad-slot--banner" id="ad-topo"><span>Espaço Publicitário</span></div>
<div class="article-body reveal">$bodyHtml</div>
<div class="essential-box $cssClass reveal"><h3 class="essential-box__title"><svg viewBox="0 0 20 20" fill="none"><path d="M10 1l2.5 5 5.5.8-4 3.9.9 5.3L10 13.5 5.1 16l.9-5.3-4-3.9 5.5-.8L10 1z" fill="#FFD700"/></svg>Essencial para a Prova</h3>$essentialHtml</div>
<div class="faq-section reveal"><h2 class="faq-section__title"><svg viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M7 7.5a3 3 0 015.5 1.5c0 2-3 2-3 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="10" cy="15.5" r="0.8" fill="currentColor"/></svg>Perguntas Frequentes</h2>
<div class="faq-item" id="faq-1"><button class="faq-item__question">$faq1Q<svg class="faq-item__chevron" viewBox="0 0 20 20" fill="none"><path d="M5 7l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><div class="faq-item__answer"><div class="faq-item__answer-inner">$faq1A</div></div></div>
<div class="faq-item" id="faq-2"><button class="faq-item__question">$faq2Q<svg class="faq-item__chevron" viewBox="0 0 20 20" fill="none"><path d="M5 7l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><div class="faq-item__answer"><div class="faq-item__answer-inner">$faq2A</div></div></div></div>
<div class="cta-section" style="padding:2rem 0;"><div class="cta-section__content reveal"><h2 class="cta-section__title">Missão concluída! $emoji</h2><p class="cta-section__desc">Ganhe XP completando o desafio no Web App.</p><a href="#webapp" class="btn btn--cta" id="cta-xp"><svg viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor"/></svg>GANHAR +$xp XP →</a></div></div>
</article><aside class="article-sidebar"><div class="ad-slot ad-slot--sidebar" id="ad-lateral"><span>Espaço Publicitário (Sidebar)</span></div></aside></div></div></main>
$footer
<script src="../assets/app.js"></script></body></html>
"@
    Set-Content -Path "$base\$folder\$file" -Value $html -Encoding UTF8
    Write-Output "Created $folder/$file"
}

Write-Output "Functions loaded. Ready to generate."
