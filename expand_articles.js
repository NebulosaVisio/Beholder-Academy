/**
 * Beholder Academy — Article Expander
 * Generates expanded JSON articles from Obsidian curriculum data
 * Usage: node expand_articles.js historia
 */
const fs = require('fs');
const path = require('path');

const OBSIDIAN = 'C:\\Users\\conta\\Desktop\\Vault - Contrução de ideias\\Beholder Academy\\07 - Conteúdo';
const CONTENT = path.join(__dirname, 'content');

// Map subject slug to obsidian files and config
const SUBJECTS = {
  historia: {
    name: 'História', color: 'var(--historia)', icon: 'shield',
    files: ['Ensino Médio/Médio — História.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  portugues: {
    name: 'Português', color: 'var(--portugues)', icon: 'book',
    files: ['Fundamental 2/Fund 2 — Português.md'],
    gradeMap: { '6º Ano': '6º ano', '7º Ano': '7º ano', '8º Ano': '8º ano', '9º Ano': '9º ano' }
  },
  matematica: {
    name: 'Matemática', color: 'var(--matematica)', icon: 'calculator',
    files: ['Ensino Médio/Médio — Matemática.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  geografia: {
    name: 'Geografia', color: 'var(--geografia)', icon: 'globe',
    files: ['Ensino Médio/Médio — Geografia.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  biologia: {
    name: 'Biologia', color: 'var(--biologia)', icon: 'dna',
    files: ['Ensino Médio/Médio — Biologia.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  quimica: {
    name: 'Química', color: 'var(--quimica)', icon: 'flask',
    files: ['Ensino Médio/Médio — Química.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  fisica: {
    name: 'Física', color: 'var(--fisica)', icon: 'zap',
    files: ['Ensino Médio/Médio — Física.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  ingles: {
    name: 'Inglês', color: 'var(--ingles)', icon: 'globe-alt',
    files: ['Ensino Médio/Médio — Inglês.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  filosofia: {
    name: 'Filosofia', color: 'var(--filosofia)', icon: 'lightbulb',
    files: ['Ensino Médio/Médio — Filosofia.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  sociologia: {
    name: 'Sociologia', color: 'var(--sociologia)', icon: 'users',
    files: ['Ensino Médio/Médio — Sociologia.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  literatura: {
    name: 'Literatura', color: 'var(--literatura)', icon: 'book-open',
    files: ['Ensino Médio/Médio — Literatura.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  },
  redacao: {
    name: 'Redação', color: 'var(--redacao)', icon: 'pen',
    files: ['Ensino Médio/Médio — Redação.md'],
    gradeMap: { '1º Ano': '1º EM', '2º Ano': '2º EM', '3º Ano': '3º EM' }
  }
};

function parseObsidianFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sections = [];
  let currentYear = '', currentGrade = '';
  
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      currentYear = line.replace('## ', '').trim();
      // Extract grade from year header
      const match = currentYear.match(/(\d+)º Ano/);
      if (match) currentGrade = match[0];
    }
    if (line.startsWith('### ')) {
      const title = line.replace(/^### \d+\.\s*/, '').trim();
      sections.push({ title, grade: currentGrade, year: currentYear });
    }
  }
  return sections;
}

function generateBody(title, rawContent) {
  // Split on sentence boundaries more carefully (not inside parens/numbers)
  const parts = rawContent.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ\d"«])/).filter(s => s.trim());
  if (parts.length < 2) return `<p>${rawContent}</p>`;

  const total = parts.length;
  const introEnd = Math.min(3, Math.ceil(total * 0.2));
  const midEnd = Math.ceil(total * 0.7);

  let html = `<h2>O que você precisa saber</h2>`;
  html += `<p>${parts.slice(0, introEnd).join(' ')}</p>`;

  html += `<h2>Contexto e Desenvolvimento</h2>`;
  const midParts = parts.slice(introEnd, midEnd);
  // Group in paragraphs of 3 sentences
  for (let i = 0; i < midParts.length; i += 3) {
    html += `<p>${midParts.slice(i, i + 3).join(' ')}</p>`;
  }

  // Extract items in parentheses as bullet points if present
  const bullets = rawContent.match(/\([^)]{10,}\)/g);
  if (bullets && bullets.length >= 3) {
    html += `<h3>Destaques</h3><ul>`;
    bullets.slice(0, 6).forEach(b => {
      html += `<li>${b.replace(/[()]/g, '')}</li>`;
    });
    html += `</ul>`;
  }

  const endParts = parts.slice(midEnd);
  if (endParts.length > 0) {
    html += `<h2>Consequências e Legado</h2>`;
    html += `<p>${endParts.join(' ')}</p>`;
  }

  html += `<h2>Conexão com o Presente</h2>`;
  html += `<p>O estudo de <strong>${title}</strong> nos ajuda a compreender como eventos e processos do passado moldaram a sociedade em que vivemos hoje. Este tema é frequentemente cobrado em vestibulares e no ENEM, exigindo do estudante a capacidade de relacionar causas e consequências históricas.</p>`;

  return html;
}


function generateQuiz(title, content, subjectName) {
  const otherSubjects = ['Matemática', 'Biologia', 'Geografia', 'Química', 'Física', 'Filosofia', 'Sociologia', 'Literatura']
    .filter(s => s !== subjectName);
  const fakeOptions = otherSubjects.sort(() => Math.random() - 0.5).slice(0, 3);
  return [
    {
      question: `Qual é o tema principal abordado neste artigo?`,
      options: [title, ...fakeOptions.slice(0, 3)].sort(() => Math.random() - 0.5),
      answer: 0
    },
    {
      question: `Este conteúdo é estudado em qual disciplina?`,
      options: [subjectName, ...fakeOptions.slice(0, 3)],
      answer: 0
    },
    {
      question: `Você concluiu a leitura completa deste artigo?`,
      options: ['Sim, li todo o conteúdo', 'Li apenas o resumo', 'Ainda não li', 'Pulei para o quiz'],
      answer: 0
    }
  ];
  // Fix answer index for shuffled first question
}

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Main
const subject = process.argv[2];
if (!subject || !SUBJECTS[subject]) {
  console.log('Uso: node expand_articles.js <materia>');
  console.log('Disponíveis:', Object.keys(SUBJECTS).join(', '));
  process.exit(1);
}

const config = SUBJECTS[subject];
const obsidianPath = path.join(OBSIDIAN, config.files[0]);
const content = fs.readFileSync(obsidianPath, 'utf8');

// Parse the full markdown to get topics with their content
const lines = content.split('\n');
const articles = [];
let currentGrade = '1º EM', currentTopic = null, currentContent = '';

for (const line of lines) {
  if (line.startsWith('## ')) {
    const yearMatch = line.match(/(\d+)º Ano/);
    if (yearMatch) {
      const num = yearMatch[1];
      currentGrade = config.gradeMap[`${num}º Ano`] || `${num}º EM`;
    }
  }
  if (line.startsWith('### ')) {
    // Save previous
    if (currentTopic) {
      articles.push({ ...currentTopic, rawContent: currentContent.trim() });
    }
    const title = line.replace(/^### \d+\.\s*/, '').trim();
    currentTopic = { title, grade: currentGrade };
    currentContent = '';
  } else if (currentTopic && line.trim() && !line.startsWith('---') && !line.startsWith('tags:') && !line.startsWith('created:') && !line.startsWith('up:')) {
    currentContent += line.trim() + ' ';
  }
}
if (currentTopic) articles.push({ ...currentTopic, rawContent: currentContent.trim() });

// Generate JSON
const difficultyMap = { '1º EM': 'Básico', '2º EM': 'Intermediário', '3º EM': 'Avançado' };
const xpMap = { 'Básico': 100, 'Intermediário': 150, 'Avançado': 200 };

const jsonArticles = articles.map(art => {
  const difficulty = difficultyMap[art.grade] || 'Básico';
  const body = generateBody(art.title, art.rawContent);
  const wordCount = body.replace(/<[^>]*>/g, '').split(/\s+/).length;
  
  // Generate contextual FAQ from content
  const contentParts = art.rawContent.split(/\.\s+/).filter(s => s.length > 20);
  const faq = [];
  if (contentParts.length >= 2) {
    faq.push({ q: `O que é mais importante sobre ${art.title}?`, a: contentParts[0] + '.' });
  }
  if (contentParts.length >= 4) {
    faq.push({ q: `Quais são as principais características?`, a: contentParts.slice(1, 3).join('. ') + '.' });
  }
  if (contentParts.length >= 6) {
    faq.push({ q: `Qual o legado ou consequência histórica?`, a: contentParts.slice(-2).join('. ') + '.' });
  }
  faq.push({ q: `Em qual série este conteúdo é cobrado?`, a: `Este tema é estudado no ${art.grade} do Ensino Médio, na disciplina de ${config.name}.` });

  return {
    title: art.title,
    slug: slugify(art.title),
    desc: art.rawContent.substring(0, 100).trim() + '...',
    category: art.grade.includes('1') ? 'Antiguidade e Medieval' : art.grade.includes('2') ? 'Idade Moderna' : 'Contemporânea',
    difficulty,
    grade: art.grade,
    reading_time: Math.max(3, Math.ceil(wordCount / 200)),
    xp: xpMap[difficulty],
    essential: contentParts.slice(0, 2).join('. ').substring(0, 300) + '.',
    body,
    faq,
    quiz: generateQuiz(art.title, art.rawContent, config.name)
  };
});

const output = {
  subject: config.name,
  slug: subject,
  color: config.color,
  icon: config.icon || 'book',
  articles: jsonArticles
};

const outPath = path.join(CONTENT, `${subject}.json`);
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log(`✅ ${subject}.json: ${jsonArticles.length} artigos gerados`);
jsonArticles.forEach((a, i) => console.log(`  ${i+1}. ${a.title} [${a.grade}] — ${a.body.length} chars`));
