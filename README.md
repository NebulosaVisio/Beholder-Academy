<div align="center">

<img src="assets/favicon.svg" width="80" alt="Beholder Academy Logo">

# Beholder Academy

**Portal educacional gamificado para o Ensino Fundamental 2 e Médio**

[![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow?style=for-the-badge)](https://beholderacademy.com.br)
[![Artigos](https://img.shields.io/badge/artigos-618+-7B2FF7?style=for-the-badge)](https://beholderacademy.com.br)
[![Matérias](https://img.shields.io/badge/matérias-12-00D4AA?style=for-the-badge)](https://beholderacademy.com.br)
[![Licença](https://img.shields.io/badge/licença-MIT%20%2B%20CC%20BY--NC--SA-blue?style=for-the-badge)](LICENSE)

[🌐 Acessar o Site](https://beholderacademy.com.br) · [📋 Roadmap](https://beholderacademy.com.br/roadmap.html) · [📖 Sobre](https://beholderacademy.com.br/sobre.html)

</div>

---

## 📚 Sobre o Projeto

O **Beholder Academy** é um portal educacional gratuito que transforma o estudo em uma experiência gamificada. Com mais de **618 artigos** organizados em **12 matérias**, o aluno acumula XP, sobe de nível, completa desafios e desbloqueia conquistas enquanto aprende.

### ✨ Funcionalidades

| Feature | Descrição |
|---------|-----------|
| 🎮 **Sistema RPG** | XP, níveis, fichas, cristais e essências |
| ⚔️ **Desafios** | Diários, semanais e mensais com recompensas |
| 🏪 **Loja** | Cosméticos, boosters e itens desbloqueáveis |
| 🏆 **Conquistas** | 20+ achievements para coletar |
| 📦 **Baús** | Sistema de drop com raridades |
| 🔥 **Streak** | Multiplicador por dias consecutivos |
| 🧠 **Quizzes** | Teste de conhecimento em cada artigo |
| 🔍 **Busca Global** | Pesquisa em todos os 618 artigos |
| 🌙 **Dark Mode** | Tema claro e escuro |
| 👨‍👩‍👧 **Painel Pais** | Acompanhamento pelo responsável |
| 📱 **Responsivo** | Funciona em desktop, tablet e mobile |
| ♿ **Acessível** | Navegação por teclado, aria-labels, semântica HTML5 |

### 📖 Matérias Disponíveis

<table>
<tr>
<td>📘 Português (67)</td>
<td>🔢 Matemática (58)</td>
<td>🏛️ História (62)</td>
<td>🌍 Geografia (54)</td>
</tr>
<tr>
<td>🧬 Biologia (58)</td>
<td>⚗️ Química (40)</td>
<td>⚛️ Física (51)</td>
<td>🇬🇧 Inglês (47)</td>
</tr>
<tr>
<td>💭 Filosofia (48)</td>
<td>👥 Sociologia (46)</td>
<td>📖 Literatura (46)</td>
<td>✍️ Redação (41)</td>
</tr>
</table>

---

## 🏗️ Arquitetura

```
Beholder Academy/
├── index.html              # Landing page principal
├── login.html              # Autenticação (localStorage)
├── painel.html             # Dashboard do aluno (RPG)
├── responsavel.html        # Dashboard dos pais
├── sobre.html              # Página institucional
├── fontes.html             # Bibliografia e referências
├── privacidade.html        # Política de privacidade
├── roadmap.html            # Roadmap do projeto
├── 404.html                # Página de erro
├── assets/
│   ├── styles.css          # Design system (Light + Dark)
│   ├── app.js              # Core: tema, busca, quiz, reveal
│   ├── rpg-engine.js       # Motor RPG: XP, levels, loja, conquistas
│   ├── painel.js           # Controller do painel do aluno
│   ├── painel.css          # Estilos do painel
│   ├── responsavel.js      # Controller do painel de pais
│   ├── responsavel.css     # Estilos do painel de pais
│   ├── search-index.json   # Índice de busca (gerado)
│   └── favicon.svg         # Ícone do site
├── content/                # Dados-fonte dos artigos (JSON)
│   ├── portugues.json
│   ├── matematica.json
│   └── ...
├── portugues/              # Artigos gerados
├── matematica/             # Artigos gerados
├── .../                    # (12 pastas de matérias)
├── build_unified.js        # Script de build (Node.js)
├── robots.txt              # Configuração para crawlers
├── sitemap.xml             # Sitemap (gerado)
├── ads.txt                 # Autorização de anúncios
└── .htaccess               # Headers de segurança (Apache)
```

---

## 🛠️ Tech Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | HTML5 semântico, CSS3 (Custom Properties), JavaScript ES6+ |
| **Fontes** | Google Fonts (Inter + Outfit) |
| **Build** | Node.js (script de geração estática) |
| **Estado** | localStorage (RPG engine) |
| **SEO** | Schema.org (Article, FAQ, BreadcrumbList), OpenGraph, Twitter Cards |
| **Segurança** | CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| **Performance** | Gzip, Cache-Control (1 ano para assets), lazy reveal |

---

## 🚀 Quick Start

### Pré-requisitos

- [Node.js](https://nodejs.org) 18+ (apenas para build)

### Rodar localmente

```bash
# Clonar o repositório
git clone https://github.com/SEU_USUARIO/beholder-academy.git
cd beholder-academy

# Rebuild dos artigos (opcional, já vêm pré-buildados)
node build_unified.js

# Servir localmente (qualquer método)
npx -y serve .
# ou
python -m http.server 8080
```

Acesse `http://localhost:8080` e explore!

### Deploy

O projeto é 100% estático — deploy em qualquer serviço:

| Serviço | Comando |
|---------|---------|
| **Netlify** | Drag & drop da pasta |
| **Cloudflare Pages** | Connect repo → build vazio |
| **Vercel** | `npx vercel --prod` |
| **GitHub Pages** | Settings → Pages → main |

---

## 📄 Licença

- **Código** — [MIT License](LICENSE)
- **Conteúdo educacional** — [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

O conteúdo textual dos artigos não pode ser utilizado para fins comerciais sem autorização.

---

## 📬 Contato

📧 contato@beholderacademy.com.br

---

<div align="center">

Feito com ⚡ para estudantes brasileiros

**[Beholder Academy](https://beholderacademy.com.br)** © 2026

</div>
