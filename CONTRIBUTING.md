# Contribuindo com o Beholder Academy

Obrigado pelo interesse em contribuir! 🎓

## Como Contribuir

### Reportar Bugs
1. Verifique se o bug já não foi reportado nas [Issues](../../issues)
2. Abra uma nova issue usando o template de **Bug Report**
3. Inclua screenshots e passos para reproduzir

### Sugerir Features
1. Abra uma issue usando o template de **Feature Request**
2. Descreva o problema que a feature resolve
3. Se possível, inclua mockups ou referências

### Contribuir com Código
1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Faça suas mudanças
4. Teste: `node build_unified.js` deve rodar sem erros
5. Commit: `git commit -m "feat: minha feature"`
6. Push: `git push origin feature/minha-feature`
7. Abra um Pull Request

### Contribuir com Conteúdo
Se você é professor ou especialista e quer contribuir com artigos:
1. Abra uma issue descrevendo o conteúdo proposto
2. Aguarde aprovação antes de começar a escrever
3. Siga o formato dos artigos existentes (veja `content/*.json`)

## Padrões

### Commits
Usamos [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` documentação
- `style:` formatação (sem mudança de lógica)
- `refactor:` refatoração
- `test:` testes

### Código
- HTML5 semântico
- CSS com Custom Properties (não usar Tailwind)
- JavaScript ES6+ (sem frameworks)
- Usar `textContent` em vez de `innerHTML` com dados do usuário

## Código de Conduta

Seja respeitoso e construtivo. Este é um projeto educacional voltado para estudantes brasileiros.
