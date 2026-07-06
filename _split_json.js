const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, 'content');
const fund1Dir = path.join(contentDir, 'fund1');
const fund2Dir = path.join(contentDir, 'fund2');
const medioDir = path.join(contentDir, 'medio');

if (!fs.existsSync(fund1Dir)) fs.mkdirSync(fund1Dir);
if (!fs.existsSync(fund2Dir)) fs.mkdirSync(fund2Dir);
if (!fs.existsSync(medioDir)) fs.mkdirSync(medioDir);

const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.json'));

const gradeMap = {
    '1º ano': { level: 'Fundamental 1', dir: fund1Dir, prefix: '1ano', diff: 'Nível 1' },
    '2º ano': { level: 'Fundamental 1', dir: fund1Dir, prefix: '2ano', diff: 'Nível 2' },
    '3º ano': { level: 'Fundamental 1', dir: fund1Dir, prefix: '3ano', diff: 'Nível 3' },
    '4º ano': { level: 'Fundamental 1', dir: fund1Dir, prefix: '4ano', diff: 'Nível 4' },
    '5º ano': { level: 'Fundamental 1', dir: fund1Dir, prefix: '5ano', diff: 'Nível 5' },
    '6º ano': { level: 'Fundamental 2', dir: fund2Dir, prefix: '6ano', diff: 'Nível 6' },
    '7º ano': { level: 'Fundamental 2', dir: fund2Dir, prefix: '7ano', diff: 'Nível 7' },
    '8º ano': { level: 'Fundamental 2', dir: fund2Dir, prefix: '8ano', diff: 'Nível 8' },
    '9º ano': { level: 'Fundamental 2', dir: fund2Dir, prefix: '9ano', diff: 'Nível 9' },
    '1º ano médio': { level: 'Ensino Médio', dir: medioDir, prefix: '1ano', diff: 'Nível 10' },
    '2º ano médio': { level: 'Ensino Médio', dir: medioDir, prefix: '2ano', diff: 'Nível 11' },
    '3º ano médio': { level: 'Ensino Médio', dir: medioDir, prefix: '3ano', diff: 'Nível 12' }
};

files.forEach(file => {
    const filePath = path.join(contentDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const articlesByGrade = {};
    
    data.articles.forEach(article => {
        let rawGrade = (article.grade || '').toLowerCase().trim();
        
        if (rawGrade.includes('médio') || rawGrade.includes('medio')) {
            if (rawGrade.includes('1')) rawGrade = '1º ano médio';
            else if (rawGrade.includes('2')) rawGrade = '2º ano médio';
            else if (rawGrade.includes('3')) rawGrade = '3º ano médio';
            else rawGrade = 'unknown';
        } else {
            const match = rawGrade.match(/([1-9])/);
            if (match) {
                rawGrade = match[1] + 'º ano';
            } else {
                rawGrade = 'unknown';
            }
        }
        
        if (rawGrade !== 'unknown') {
            if (!articlesByGrade[rawGrade]) articlesByGrade[rawGrade] = [];
            
            if (gradeMap[rawGrade]) {
                article.difficulty = gradeMap[rawGrade].diff;
            }
            
            articlesByGrade[rawGrade].push(article);
        }
    });
    
    for (const [grade, articles] of Object.entries(articlesByGrade)) {
        const mapping = gradeMap[grade];
        if (mapping) {
            const outSlug = mapping.prefix + '-' + data.slug;
            const outFile = path.join(mapping.dir, outSlug + '.json');
            
            const outData = {
                subject: data.subject,
                slug: outSlug,
                level: mapping.level,
                grade: grade.replace(' médio', ''),
                color: data.color || ('var(--' + data.slug + ')'),
                icon: data.icon || 'book',
                articles: articles
            };
            
            fs.writeFileSync(outFile, JSON.stringify(outData, null, 2), 'utf8');
            console.log(`Generated ${outFile} with ${articles.length} articles`);
        }
    }
});
