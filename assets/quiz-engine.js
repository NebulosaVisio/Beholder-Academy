/* =========================================
   BEHOLDER ACADEMY - Quiz & Activity Engine
   Controla a trilha de missões diárias
   ========================================= */

const QuizEngine = (function() {
  'use strict';

  // Banco de Questões Mock (MVP) - Misto das 4 matérias
  const DB_QUESTOES = [
    { id: 1, subj: 'Matemática', diff: 1, q: 'Quanto é 7 x 8?', opts: ['54', '56', '62', '64'], ans: 1 },
    { id: 2, subj: 'Português', diff: 1, q: 'Qual palavra é um substantivo?', opts: ['Correr', 'Feliz', 'Casa', 'Rapidamente'], ans: 2 },
    { id: 3, subj: 'Ciências', diff: 1, q: 'Qual planeta é conhecido como Planeta Vermelho?', opts: ['Vênus', 'Marte', 'Júpiter', 'Saturno'], ans: 1 },
    { id: 4, subj: 'Lógica', diff: 1, q: 'O que vem a seguir: 2, 4, 6, 8, ...?', opts: ['9', '10', '11', '12'], ans: 1 },
    { id: 5, subj: 'Matemática', diff: 2, q: 'Qual a raiz quadrada de 144?', opts: ['10', '12', '14', '16'], ans: 1 },
    { id: 6, subj: 'Português', diff: 2, q: 'Indique o sinônimo de "Efêmero".', opts: ['Eterno', 'Passageiro', 'Luminoso', 'Sólido'], ans: 1 },
    { id: 7, subj: 'Ciências', diff: 2, q: 'Qual é o gás que as plantas usam na fotossíntese?', opts: ['Oxigênio', 'Nitrogênio', 'Gás Carbônico', 'Hélio'], ans: 2 },
    { id: 8, subj: 'Lógica', diff: 2, q: 'Se todos os gatos miam e Félix é um gato, então:', opts: ['Félix late', 'Félix mia', 'Nem todo gato mia', 'Félix é um cachorro'], ans: 1 },
    { id: 9, subj: 'Matemática', diff: 3, q: 'Resolva: 3x - 5 = 10. Qual o valor de x?', opts: ['3', '5', '15', '10'], ans: 1 },
    { id: 10, subj: 'Ciências', diff: 3, q: 'Qual a força que atrai os corpos para o centro da Terra?', opts: ['Magnetismo', 'Fricção', 'Gravidade', 'Inércia'], ans: 2 },
    // Para simplificar o teste, usaremos 10 perguntas na demo.
  ];

  let currentMission = [];
  let currentIndex = 0;
  let correctAnswers = 0;
  let selectedOption = null;
  let isChecking = false;
  let hearts = 3;
  let erasureCount = 0; // Tracking for writing mission

  // DOM Elements
  const ui = {
    screenQuiz: document.getElementById('screen-quiz'),
    screenReading: document.getElementById('screen-reading'),
    screenWriting: document.getElementById('screen-writing'),
    screenResult: document.getElementById('screen-result'),
    progress: document.getElementById('activity-progress'),
    hearts: document.getElementById('hearts-container'),
    
    // Quiz UI
    subject: document.getElementById('quiz-subject'),
    difficulty: document.getElementById('quiz-difficulty'),
    question: document.getElementById('quiz-question'),
    optionsGrid: document.getElementById('quiz-options'),
    
    // Reading UI
    readingTitle: document.getElementById('reading-title'),
    readingText: document.getElementById('reading-text'),
    readingTimer: document.getElementById('reading-timer'),
    
    // Writing UI
    writingPrompt: document.getElementById('writing-prompt'),
    writingArea: document.getElementById('writing-area'),
    wordCount: document.getElementById('word-count'),
    errorCount: document.getElementById('error-count'),

    // Footer & Actions
    footer: document.getElementById('activity-footer'),
    btnCheck: document.getElementById('btn-check'),
    btnSkip: document.getElementById('btn-skip'),
    btnNext: document.getElementById('btn-next'),
    btnExit: document.getElementById('btn-exit'),
    feedbackBanner: document.getElementById('feedback-banner'),
    feedbackMessage: document.getElementById('feedback-message')
  };

  let missionType = 'QUIZ'; // Pode ser QUIZ, READING ou WRITING
  let readingTimeRemaining = 0;
  let readingInterval = null;

  function init() {
    if (!localStorage.getItem('beholder_user')) {
      window.location.href = 'login.html';
      return;
    }

    bindEvents();
    
    // Check URL parameters to decide which mission to start
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (type === 'leitura') {
       startReadingMission();
    } else if (type === 'redacao') {
       startWritingMission();
    } else {
       startDailyMission();
    }
  }

  function bindEvents() {
    ui.btnCheck.addEventListener('click', handleCheck);
    ui.btnNext.addEventListener('click', handleNext);
    ui.btnSkip.addEventListener('click', handleSkip);
    ui.btnExit.addEventListener('click', () => {
      if(confirm('Tem certeza que deseja sair? Todo o progresso desta missão será perdido.')) {
        window.location.href = 'painel.html';
      }
    });
    
    document.getElementById('btn-finish').addEventListener('click', finishMission);
    
    // Bind Retake
    const btnRetake = document.getElementById('btn-retake');
    if(btnRetake) {
       btnRetake.addEventListener('click', handleRetake);
    }
  }

  function startDailyMission() {
    missionType = 'QUIZ';
    ui.screenQuiz.classList.remove('hidden');
    ui.screenReading.classList.add('hidden');
    ui.screenWriting.classList.add('hidden');
    
    // Filtra perguntas: 3 fáceis (diff 1), depois médias e difíceis
    let faceis = DB_QUESTOES.filter(q => q.diff === 1).sort(() => 0.5 - Math.random()).slice(0, 3);
    let outras = DB_QUESTOES.filter(q => q.diff > 1).sort(() => 0.5 - Math.random()).slice(0, 7); // total 10 na demo
    
    currentMission = [...faceis, ...outras];
    currentIndex = 0;
    correctAnswers = 0;
    hearts = 3;
    
    updateHeartsUI();
    renderQuestion();
  }

  // ═══ MÓDULO DE LEITURA ═══
  function startReadingMission() {
    missionType = 'READING';
    ui.screenQuiz.classList.add('hidden');
    ui.screenWriting.classList.add('hidden');
    ui.screenReading.classList.remove('hidden');
    
    ui.hearts.style.display = 'none'; // Sem vidas na leitura
    
    ui.readingTitle.textContent = "A Importância da Água";
    ui.readingText.innerHTML = `
      <p>A água é um recurso fundamental para a sobrevivência de todos os seres vivos...</p>
      <p>Cerca de 70% da superfície do nosso planeta é coberta por água, mas apenas uma pequena fração é doce e própria para consumo.</p>
      <p>A poluição e o desperdício são os maiores inimigos deste recurso precioso.</p>
    `;
    
    // Define tempo mínimo de leitura (ex: 30 segundos para o MVP)
    readingTimeRemaining = 30; 
    document.getElementById('reading-min-time').textContent = "0.5";
    
    ui.btnCheck.classList.remove('hidden');
    ui.btnCheck.disabled = true;
    ui.btnCheck.textContent = "Aguarde o tempo...";
    ui.btnSkip.classList.add('hidden');
    ui.footer.className = 'activity-footer';
    
    readingInterval = setInterval(() => {
      readingTimeRemaining--;
      const m = Math.floor(readingTimeRemaining / 60).toString().padStart(2, '0');
      const s = (readingTimeRemaining % 60).toString().padStart(2, '0');
      ui.readingTimer.textContent = m + ':' + s;
      
      // Update progress bar
      ui.progress.style.width = ((30 - readingTimeRemaining) / 30 * 100) + '%';
      
      if (readingTimeRemaining <= 0) {
        clearInterval(readingInterval);
        ui.readingTimer.textContent = "Tempo Concluído!";
        ui.readingTimer.style.color = "#10B981";
        ui.btnCheck.textContent = "Fazer Quiz de Validação";
        ui.btnCheck.disabled = false;
      }
    }, 1000);
  }

  // ═══ MÓDULO DE REDAÇÃO ═══
  function startWritingMission() {
    missionType = 'WRITING';
    ui.screenQuiz.classList.add('hidden');
    ui.screenReading.classList.add('hidden');
    ui.screenWriting.classList.remove('hidden');
    
    ui.hearts.style.display = 'none';
    ui.progress.style.width = '0%';
    erasureCount = 0;
    
    ui.writingPrompt.textContent = "Tema: O que você faria se pudesse viajar no tempo?";
    ui.btnCheck.classList.remove('hidden');
    ui.btnCheck.textContent = "Enviar Redação";
    ui.btnCheck.disabled = true;
    ui.btnSkip.classList.add('hidden');
    
    // Bloquear colagem
    ui.writingArea.addEventListener('paste', (e) => {
      e.preventDefault();
      alert('Por favor, digite a redação. A colagem de textos não é permitida.');
    });

    // Monitorar apagamentos
    ui.writingArea.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        erasureCount++;
      }
    });

    // Validação de meta de caracteres
    ui.writingArea.addEventListener('input', () => {
      const text = ui.writingArea.value;
      const charCount = text.length;
      const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
      
      ui.wordCount.textContent = `${charCount} caracteres | ${words} palavras`;
      
      // Exigir pelo menos 400 caracteres
      if (charCount >= 400) {
        ui.btnCheck.disabled = false;
        ui.progress.style.width = '100%';
      } else {
        ui.btnCheck.disabled = true;
        ui.progress.style.width = ((charCount / 400) * 100) + '%';
      }
      
      ui.errorCount.textContent = "Escreva no mínimo 400 caracteres.";
      ui.errorCount.style.color = "var(--text-muted)";
    });
  }

  function renderQuestion() {
    isChecking = false;
    selectedOption = null;
    
    const q = currentMission[currentIndex];
    
    // Reset Footer UI
    ui.footer.className = 'activity-footer';
    ui.btnCheck.classList.remove('hidden');
    ui.btnCheck.disabled = true;
    ui.btnSkip.classList.remove('hidden');
    ui.btnNext.classList.add('hidden');
    
    // Progress
    ui.progress.style.width = ((currentIndex / currentMission.length) * 100) + '%';
    
    // Textos
    ui.subject.textContent = q.subj;
    ui.difficulty.textContent = q.diff === 1 ? '⭐ FÁCIL' : q.diff === 2 ? '⭐⭐ MÉDIO' : '⭐⭐⭐ DIFÍCIL';
    ui.question.textContent = q.q;
    
    // Render Options
    ui.optionsGrid.innerHTML = '';
    q.opts.forEach((optText, index) => {
      const btn = document.createElement('div');
      btn.className = 'option-card';
      btn.textContent = optText;
      btn.onclick = () => selectOption(btn, index);
      ui.optionsGrid.appendChild(btn);
    });
  }

  function selectOption(btnElement, index) {
    if (isChecking) return;
    
    // Remove selected class de todos
    Array.from(ui.optionsGrid.children).forEach(c => c.classList.remove('selected'));
    
    // Seleciona novo
    btnElement.classList.add('selected');
    selectedOption = index;
    ui.btnCheck.disabled = false;
  }

  function handleCheck() {
    if (missionType === 'READING') {
      // Transforma em quiz de validação (1 pergunta)
      missionType = 'QUIZ';
      currentMission = [{ subj: 'Compreensão', diff: 2, q: 'Sobre o que era o texto?', opts: ['Espaço', 'Importância da Água', 'Economia', 'Esportes'], ans: 1 }];
      currentIndex = 0;
      correctAnswers = 0;
      ui.screenReading.classList.add('hidden');
      ui.screenQuiz.classList.remove('hidden');
      ui.btnCheck.textContent = "Verificar";
      ui.hearts.style.display = 'block';
      renderQuestion();
      return;
    }
    
    if (missionType === 'WRITING') {
       const redacaoText = ui.writingArea.value;
       
       ui.btnCheck.disabled = true;
       ui.btnCheck.textContent = "Corrigindo (IA)...";
       
       if (typeof SheetsAPI !== 'undefined' && SheetsAPI.isUserOnline()) {
          SheetsAPI.evaluateRedacao(SheetsAPI.getCurrentUserId(), {
              text: redacaoText,
              erasures: erasureCount,
              theme: 'Viagem no Tempo'
          }).then(res => {
              if(res.success && res.resultado) {
                 // Mock the currentMission length just for math in showResults
                 correctAnswers = Math.round(res.resultado.nota); 
                 currentMission = new Array(10); 
                 showRedacaoResults(res.resultado);
              } else {
                 alert("Erro na IA: " + (res.error || "Desconhecido"));
                 ui.btnCheck.disabled = false;
                 ui.btnCheck.textContent = "Enviar Redação";
              }
          }).catch(e => {
              console.warn('[Sync] Redacao IA fail:', e);
              alert("Erro de conexão com o servidor de IA.");
              ui.btnCheck.disabled = false;
              ui.btnCheck.textContent = "Enviar Redação";
          });
       } else {
          alert('Você precisa estar online para usar a correção com Inteligência Artificial!');
          ui.btnCheck.disabled = false;
          ui.btnCheck.textContent = "Enviar Redação";
       }
       return;
    }

    if (selectedOption === null) return;
    isChecking = true;
    
    const q = currentMission[currentIndex];
    const isCorrect = (selectedOption === q.ans);
    
    const options = Array.from(ui.optionsGrid.children);
    
    if (isCorrect) {
      correctAnswers++;
      options[selectedOption].classList.add('correct');
      ui.footer.classList.add('correct');
      ui.feedbackMessage.textContent = 'Mandou bem! Resposta correta.';
    } else {
      hearts--;
      updateHeartsUI();
      options[selectedOption].classList.add('wrong');
      options[q.ans].classList.add('correct'); 
      ui.footer.classList.add('wrong');
      ui.feedbackMessage.textContent = 'Ops! A resposta correta era: ' + q.opts[q.ans];
    }
    
    ui.btnCheck.classList.add('hidden');
    ui.btnSkip.classList.add('hidden');
    ui.btnNext.classList.remove('hidden');
    ui.btnNext.focus();
    
    if (hearts <= 0) {
      setTimeout(() => {
        alert('Você ficou sem corações! Vamos tentar de novo?');
        window.location.href = 'painel.html';
      }, 1500);
    }
  }

  function handleSkip() {
    isChecking = true;
    const q = currentMission[currentIndex];
    const options = Array.from(ui.optionsGrid.children);
    options[q.ans].classList.add('correct'); // Mostra a certa
    ui.footer.classList.add('wrong');
    ui.feedbackMessage.textContent = 'A resposta era: ' + q.opts[q.ans];
    
    ui.btnCheck.classList.add('hidden');
    ui.btnSkip.classList.add('hidden');
    ui.btnNext.classList.remove('hidden');
    ui.btnNext.focus();
  }

  function handleNext() {
    currentIndex++;
    if (currentIndex >= currentMission.length) {
      showResults();
    } else {
      renderQuestion();
    }
  }

  function updateHeartsUI() {
    let hStr = '';
    for(let i=0; i<3; i++) {
      hStr += (i < hearts) ? '❤️ ' : '🤍 ';
    }
    ui.hearts.textContent = hStr.trim();
  }

  function showRedacaoResults(aiResult) {
    ui.screenWriting.classList.add('hidden');
    ui.footer.style.display = 'none';
    ui.screenResult.classList.remove('hidden');
    
    // Injeta Feedback da IA
    const fbContainer = document.getElementById('ai-feedback-container');
    const fbText = document.getElementById('ai-feedback-text');
    const btnRetake = document.getElementById('btn-retake');
    
    if(fbContainer && fbText) {
       fbContainer.classList.remove('hidden');
       fbText.textContent = aiResult.feedback;
    }
    
    if(btnRetake && hearts > 0) {
       btnRetake.classList.remove('hidden');
    }
    
    // Calcula XP/Cristais com base na nota (0 a 10)
    const percentage = Math.round((aiResult.nota / 10) * 100);
    const xpGained = Math.round(aiResult.nota * 15);
    const cristaisGanhos = Math.round(aiResult.nota * 5);
    
    document.getElementById('result-score').textContent = aiResult.nota + ' / 10';
    document.getElementById('result-xp').textContent = xpGained;
    document.getElementById('result-cristais').textContent = cristaisGanhos;
    
    // Não vamos salvar XP agora, só no `finishMission`, para dar a chance de Refazer!
    window.tempReward = { xpGained, cristaisGanhos, percentage };
  }

  function handleRetake() {
    if (hearts <= 0) return;
    hearts--;
    updateHeartsUI();
    
    ui.screenResult.classList.add('hidden');
    document.getElementById('ai-feedback-container').classList.add('hidden');
    document.getElementById('btn-retake').classList.add('hidden');
    ui.footer.style.display = 'flex';
    
    ui.writingArea.value = '';
    ui.wordCount.textContent = '0 caracteres';
    startWritingMission();
  }

  function showResults() {
    ui.screenQuiz.classList.add('hidden');
    ui.footer.style.display = 'none';
    ui.screenResult.classList.remove('hidden');
    ui.progress.style.width = '100%';
    
    const percentage = Math.round((correctAnswers / currentMission.length) * 100);
    const xpGained = correctAnswers * 15;
    const cristaisGanhos = correctAnswers * 5;
    
    document.getElementById('result-score').textContent = percentage + '%';
    document.getElementById('result-xp').textContent = xpGained;
    document.getElementById('result-cristais').textContent = cristaisGanhos;
    
    window.tempReward = { xpGained, cristaisGanhos, percentage };
  }

  function finishMission() {
    if (window.tempReward) {
      // Salva XP efetivamente
      let rpgData = RPGEngine.load();
      const xpGained = window.tempReward.xpGained;
      const cristaisGanhos = window.tempReward.cristaisGanhos;
      const percentage = window.tempReward.percentage;
      
      const subjList = ['matematica', 'portugues', 'biologia', 'historia'];
      const xpPerSubj = Math.floor(xpGained / 4);
      
      subjList.forEach(sub => {
         if(rpgData.subjectProgress[sub]) {
             rpgData.subjectProgress[sub].xp += xpPerSubj;
             rpgData.subjectProgress[sub].level = RPGEngine.calcLevel(rpgData.subjectProgress[sub].xp);
         }
      });
      
      rpgData.cristais += cristaisGanhos;
      rpgData.fichas += cristaisGanhos * 2;
      
      RPGEngine.save(rpgData);
      
      if (SheetsAPI.isUserOnline()) {
         SheetsAPI.logActivity(SheetsAPI.getCurrentUserId(), missionType, JSON.stringify({
           score: percentage,
           xp: xpGained,
           cristais: cristaisGanhos
         }));
         SheetsAPI.syncProgressToCloud(SheetsAPI.getCurrentUserId(), rpgData);
      }
    }
    window.location.href = 'painel.html';
  }

  return { init: init };

})();

document.addEventListener('DOMContentLoaded', QuizEngine.init);
