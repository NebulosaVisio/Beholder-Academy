# Changelog

Todas as mudanças relevantes deste projeto serão documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.0.0] — 2026-05-23

### ✨ Adicionado
- Portal completo com **618 artigos** em **12 matérias**
- Sistema RPG gamificado (XP, níveis, fichas, cristais, essências)
- Painel do aluno com dashboard, perfil, desafios, loja e conquistas
- Painel do responsável com gráfico de atividade e mesada digital
- Sistema de quizzes interativos em cada artigo
- Busca global com índice de 618+ artigos
- Dark mode com persistência
- Design responsivo (desktop, tablet, mobile)
- SEO completo (Schema.org, OpenGraph, Twitter Cards, Sitemap)
- Headers de segurança (CSP, HSTS, X-Frame-Options)
- Sistema de streak com multiplicador
- Sistema de baús com drop table ponderada
- FAQ collapsível com Schema.org FAQPage
- Navegação prev/next entre artigos
- Barra de progresso de leitura
- Animações reveal on scroll
- Build automatizado via `build_unified.js`

### 🔒 Segurança
- Content Security Policy configurada
- HSTS com preload
- XSS prevention via `textContent` e `escapeHtml()`
- Directory listing desabilitado
- Build scripts bloqueados via robots.txt

### 🐛 Corrigido
- Quiz com respostas incorretas (218 quizzes corrigidos)
- FAQ Schema dizendo "Ensino Médio" em vez de "Fundamental" (48 FAQs)
- CSS backgrounds com `var(--materia)10` inválido → `rgba()` correto
- OG meta tags com dupla-codificação HTML
- Múltiplos `<h1>` no painel.html → heading hierarchy correta
- `canvas.roundRect()` sem fallback para browsers antigos
