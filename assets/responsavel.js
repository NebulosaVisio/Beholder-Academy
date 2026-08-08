/* ============================================
   BEHOLDER ACADEMY — Responsável UI Controller v2.0
   Parent Dashboard using RPG Engine data
   ============================================ */

const ResponsavelUI = (function() {
  'use strict';
  let studentData = null;
  let currentUser = null;

  const PRODUTOS = [
    // Material Escolar BA — Mult: 1.22 (brand premium)
    { id: 'PRD-ES001', cat: 'Material Escolar', title: 'Caderno BA Temático', price: 2540 },
    { id: 'PRD-ES002', cat: 'Material Escolar', title: 'Kit Lápis BA (12 cores)', price: 1130 },
    { id: 'PRD-ES003', cat: 'Material Escolar', title: 'Régua + Esquadro BA', price: 850 },
    { id: 'PRD-ES004', cat: 'Material Escolar', title: 'Mochila Beholder Academy', price: 12530 },
    { id: 'PRD-ES005', cat: 'Material Escolar', title: 'Fichário BA Organizado', price: 4510 },
    { id: 'PRD-ES006', cat: 'Material Escolar', title: 'Caneta BA Edição Limitada', price: 710 },
    { id: 'PRD-ES007', cat: 'Material Escolar', title: 'Estojo BA RPG Edition', price: 3520 },
    { id: 'PRD-ES008', cat: 'Material Escolar', title: 'Planner Semanal BA', price: 4930 },
    // Gaming — Mult: 1.18 (demanda inelástica)
    { id: 'PRD-GM001', cat: 'Gaming', title: 'Robux R$25', price: 3410 },
    { id: 'PRD-GM002', cat: 'Gaming', title: 'Diamantes FF R$20', price: 2730 },
    { id: 'PRD-GM003', cat: 'Gaming', title: 'Minecoins R$30', price: 4090 },
    { id: 'PRD-GM004', cat: 'Gaming', title: 'V-Bucks R$40', price: 5450 },
    { id: 'PRD-GM005', cat: 'Gaming', title: 'Steam R$50', price: 6820 },
    { id: 'PRD-GM006', cat: 'Gaming', title: 'PlayStation R$100', price: 13630 },
    // Delivery — Mult: 1.16 (mantido)
    { id: 'PRD-DL001', cat: 'Delivery', title: 'iFood R$30', price: 4020 },
    { id: 'PRD-DL002', cat: 'Delivery', title: 'Rappi R$25', price: 3350 },
    { id: 'PRD-DL003', cat: 'Delivery', title: 'McDonald\'s R$20', price: 2680 },
    // Streaming — Mult: 1.14 (leve aumento)
    { id: 'PRD-ST001', cat: 'Streaming', title: 'Spotify 1 mês', price: 2900 },
    { id: 'PRD-ST002', cat: 'Streaming', title: 'YouTube Premium 1 mês', price: 3160 },
    { id: 'PRD-ST003', cat: 'Streaming', title: 'Netflix R$40', price: 5270 },
    { id: 'PRD-ST004', cat: 'Streaming', title: 'Disney+ 1 mês', price: 3690 },
    // Educação — Mult: 1.06 (REDUZIDO — posicionamento educacional)
    { id: 'PRD-ED001', cat: 'Educação', title: 'Udemy Curso', price: 3430 },
    { id: 'PRD-ED002', cat: 'Educação', title: 'Alura 1 mês', price: 10400 },
    { id: 'PRD-ED003', cat: 'Educação', title: 'Livro Amazon', price: 4280 },
    { id: 'PRD-ED004', cat: 'Educação', title: 'Cambly Aula', price: 6120 },
    // Experiências — Mult: 1.24 (aspiracional)
    { id: 'PRD-EX001', cat: 'Experiências', title: 'Uber R$30', price: 4310 },
    { id: 'PRD-EX002', cat: 'Experiências', title: 'Google Play R$25', price: 3590 },
    { id: 'PRD-EX003', cat: 'Experiências', title: 'App Store R$25', price: 3590 },
    { id: 'PRD-EX004', cat: 'Experiências', title: 'Amazon R$50', price: 7180 },
    { id: 'PRD-EX005', cat: 'Experiências', title: 'Cinemark 2 ingressos', price: 8600 }
  ];

  function init() {
    try {
      const userDataStr = localStorage.getItem('beholder_user');
      if (userDataStr) {
        currentUser = JSON.parse(userDataStr);
      }
      studentData = RPGEngine.load();
    } catch(e) {
      console.warn('RPG Engine load error in responsavel:', e);
      studentData = RPGEngine.createDefaultData();
    }
    
    bindEvents();
    renderStudents();
    renderDetail();
    renderTarefas();
    renderProdutos();
    renderBoletimTable();
  }

  // --- TABS & DROPDOWN ---
  function bindEvents() {
    document.addEventListener('click', function(e) {
      const el = e.target.closest('[data-action]');
      
      // Avatar dropdown logic
      const dropdownMenu = document.getElementById('user-dropdown-menu');
      const avatarBtn = e.target.closest('#user-avatar-btn');
      
      if (avatarBtn) {
        dropdownMenu.classList.toggle('show');
      } else if (dropdownMenu && !e.target.closest('.user-dropdown')) {
        dropdownMenu.classList.remove('show');
      }

      // Tab logic
      const tabBtn = e.target.closest('.painel-tab');
      if (tabBtn) {
        document.querySelectorAll('.painel-tab').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tabBtn.classList.add('active');
        const targetId = 'tab-' + tabBtn.getAttribute('data-tab');
        const targetSection = document.getElementById(targetId);
        if (targetSection) targetSection.classList.add('active');
        return;
      }

      if (!el) return;
      
      const action = el.getAttribute('data-action');
      if (action === 'logout') logout();
      if (action === 'select-student') selectStudent();
      if (action === 'deposit') deposit(parseInt(el.getAttribute('data-amount'), 10));
      
      // Modals
      if (action === 'open-modal-tarefa') openModalTarefa();
      if (action === 'close-modal-tarefa') closeModal('modal-tarefa');
      if (action === 'save-tarefa') saveTarefa();
      
      if (action === 'open-modal-filho') openModalFilho();
      if (action === 'close-modal-filho') closeModal('modal-filho');
      if (action === 'save-filho') saveFilho();
      
      if (action === 'open-modal-produto') openModalProduto(el.getAttribute('data-id'));
      if (action === 'close-modal-produto') closeModal('modal-produto');
      if (action === 'confirm-produto') confirmProduto();
      
      if (action === 'save-boletim') saveBoletim();
    });
  }

  function logout() {
    localStorage.removeItem('beholder_user');
    window.location.href = 'login.html';
  }

  // --- STUDENTS (DASHBOARD & FILHOS) ---
  function renderStudents() {
    const el = document.getElementById('resp-students');
    if (!el) return;

    const d = studentData;
    const genLevel = RPGEngine.getGeneralLevel(d);
    const title = RPGEngine.LEVEL_TITLES[genLevel] || 'Aprendiz';

    // Find best and weakest subject
    let best = { name: '', level: 0 }, weak = { name: '', level: 21 };
    RPGEngine.SUBJECTS.forEach(s => {
      const lv = d.subjectProgress[s]?.level || 1;
      if (lv > best.level) { best = { name: RPGEngine.SUBJECT_NAMES[s], level: lv }; }
      if (lv < weak.level && (d.subjectProgress[s]?.artigosLidos || 0) > 0) { weak = { name: RPGEngine.SUBJECT_NAMES[s], level: lv }; }
    });

    const progress = RPGEngine.xpProgress(
      RPGEngine.SUBJECTS.reduce((s, sub) => s + (d.subjectProgress[sub]?.xp || 0), 0),
      genLevel
    );

    const childName = (currentUser && currentUser.linkedTo) ? currentUser.linkedTo : d.nome;

    el.innerHTML = `
      <div class="student-card active" data-action="select-student">
        <div class="student-card-top">
          <div class="student-avatar">🧑‍🎓</div>
          <div>
            <div class="student-name">${childName}</div>
            <div class="student-grade">Nv. ${genLevel} — ${title} · 🔥 ${d.streak} dias</div>
          </div>
        </div>
        <div class="student-stats">
          <div class="student-stat">📚 <strong>${d.stats.artigosLidos}</strong> artigos</div>
          <div class="student-stat">🧠 <strong>${d.stats.quizzesPerfeitos}</strong> quizzes</div>
          <div class="student-stat">🏅 <strong>${d.achievements.length}</strong> conquistas</div>
        </div>
        <div class="student-bar"><div class="student-bar-fill" style="width:${progress.percent}%"></div></div>
        ${best.level > 1 ? '<div class="student-highlight">⭐ Destaque: ' + best.name + ' (Nv. ' + best.level + ')</div>' : ''}
        ${d.streak === 0 && d.stats.artigosLidos > 0 ? '<div class="student-alert">⚠️ Atividade baixa esta semana</div>' : ''}
      </div>
    `;
    
    // Fill select in Tarefas Modal
    const selectChild = document.getElementById('tarefa-child');
    if (selectChild) {
      selectChild.innerHTML = '<option value="' + childName + '">' + childName + '</option>';
    }
  }

  function selectStudent() {
    document.getElementById('resp-detail')?.classList.remove('hidden');
  }

  function renderDetail() {
    const d = studentData;
    document.getElementById('resp-detail')?.classList.remove('hidden');

    renderStats(d);
    renderCompetencies(d);
    renderActivityChart(d);
    renderNotifications(d);
    renderAchievements(d);
    updateMesada(d);
    renderRadarChart(d);
  }

  // --- STATS, CHARTS & NOTIFS ---
  function renderStats(d) {
    const el = document.getElementById('resp-stats');
    if (!el) return;
    const genLevel = RPGEngine.getGeneralLevel(d);
    const studyHours = Math.floor((d.stats.artigosLidos * 5) / 60);

    el.innerHTML = `
      <div class="resp-stat-card"><div class="resp-stat-icon">📚</div><div class="resp-stat-value">${d.stats.artigosLidos}</div><div class="resp-stat-label">Artigos lidos</div></div>
      <div class="resp-stat-card"><div class="resp-stat-icon">🧠</div><div class="resp-stat-value">${d.stats.quizzesPerfeitos}</div><div class="resp-stat-label">Quizzes perfeitos</div></div>
      <div class="resp-stat-card"><div class="resp-stat-icon">⏱️</div><div class="resp-stat-value">${studyHours}h</div><div class="resp-stat-label">Tempo estudando</div></div>
      <div class="resp-stat-card"><div class="resp-stat-icon">🔥</div><div class="resp-stat-value">${d.streak}</div><div class="resp-stat-label">Dias de streak</div></div>
      <div class="resp-stat-card"><div class="resp-stat-icon">🎯</div><div class="resp-stat-value">Nv. ${genLevel}</div><div class="resp-stat-label">Nível geral</div></div>
      <div class="resp-stat-card"><div class="resp-stat-icon">🏅</div><div class="resp-stat-value">${d.achievements.length}/${RPGEngine.ACHIEVEMENTS.length}</div><div class="resp-stat-label">Conquistas</div></div>
    `;
  }

  function renderCompetencies(d) {
    const el = document.getElementById('resp-competencies');
    if (!el) return;
    const comps = RPGEngine.getCompetencies(d);
    el.innerHTML = Object.values(comps).map(c =>
      '<div class="comp-card"><div class="comp-icon">'+c.icon+'</div><div class="comp-value">'+c.value+'</div><div class="comp-name">'+c.name+'</div></div>'
    ).join('');
  }

  function renderRadarChart(d) {
    const canvas = document.getElementById('parent-radar-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 30;

    ctx.clearRect(0, 0, W, H);
    const comps = RPGEngine.getCompetencies(d);
    const keys = Object.keys(comps);
    const n = keys.length;
    if (n === 0) return;

    // Draw grid
    for (let ring = 1; ring <= 4; ring++) {
      const r = R * (ring / 4);
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axes
    keys.forEach((_, i) => {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
      ctx.strokeStyle = '#E5E7EB';
      ctx.stroke();
    });

    // Draw data
    ctx.beginPath();
    keys.forEach((key, i) => {
      const val = Math.min(comps[key].value, 20) / 20;
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      const x = cx + R * val * Math.cos(angle);
      const y = cy + R * val * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(123, 47, 247, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#7B2FF7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw points + labels
    keys.forEach((key, i) => {
      const val = Math.min(comps[key].value, 20) / 20;
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      const x = cx + R * val * Math.cos(angle);
      const y = cy + R * val * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#7B2FF7';
      ctx.fill();

      // Label
      const lx = cx + (R + 15) * Math.cos(angle);
      const ly = cy + (R + 15) * Math.sin(angle);
      ctx.fillStyle = '#111';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(comps[key].icon + ' ' + comps[key].value, lx, ly);
    });
  }

  function renderActivityChart(d) {
    const canvas = document.getElementById('activity-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const days = 30;
    const barW = (W - 40) / days;
    const activities = [];

    const now = Date.now();
    for (let i = 0; i < days; i++) {
      const dayStart = now - (days - 1 - i) * 86400000;
      const dayEnd = dayStart + 86400000;
      const count = (d.activity || []).filter(a => a.time >= dayStart && a.time < dayEnd).length;
      activities.push(count);
    }

    const maxVal = Math.max(...activities, 1);

    activities.forEach((val, i) => {
      const barH = (val / maxVal) * (H - 30);
      const x = 20 + i * barW;
      const y = H - 20 - barH;

      ctx.fillStyle = val > 0 ? '#7B2FF7' : (getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary') || '#F3F4F6');
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, barW - 2, barH, 2);
      else ctx.rect(x, y, barW - 2, barH);
      ctx.fill();
    });

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted') || '#9CA3AF';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ['30d', '20d', '10d', 'Hoje'].forEach((label, i) => {
      ctx.fillText(label, 20 + (i * (days / 3)) * barW, H - 5);
    });
  }

  function renderNotifications(d) {
    const el = document.getElementById('notif-list');
    if (!el) return;

    const notifs = [];
    (d.activity || []).slice(0, 8).forEach(a => {
      if (a.type === 'achievement') notifs.push({ icon: '🏅', text: 'Conquista desbloqueada: ' + a.name, time: a.time });
      if (a.type === 'xp' && a.levelUp) notifs.push({ icon: '🎉', text: 'Subiu de nível em ' + (RPGEngine.SUBJECT_NAMES[a.subject] || a.subject) + '!', time: a.time });
      if (a.type === 'challenge') notifs.push({ icon: '⚔️', text: a.reason, time: a.time });
      if (a.type === 'chest') notifs.push({ icon: '🛒', text: 'Abriu ' + a.chest + ': ' + a.item, time: a.time });
      if (a.type === 'task') notifs.push({ icon: '📋', text: 'Tarefa concluída: ' + a.name + ' (+💎 ' + a.reward + ')', time: a.time });
      if (a.type === 'request') notifs.push({ icon: '🛍️', text: 'Produto solicitado: ' + a.name, time: a.time });
    });

    if (d.streak >= 7) notifs.unshift({ icon: '🔥', text: 'Streak de ' + d.streak + ' dias! Continue assim!', time: Date.now() });

    if (notifs.length === 0) {
      el.innerHTML = '<div class="activity-empty">Nenhuma notificação ainda.</div>';
      return;
    }

    el.innerHTML = notifs.slice(0, 6).map(n =>
      '<div class="notif-item"><span class="notif-icon">'+n.icon+'</span><span class="notif-text">'+n.text+'</span><span class="notif-time">'+timeAgo(n.time)+'</span></div>'
    ).join('');
  }

  function renderAchievements(d) {
    const el = document.getElementById('resp-achievements');
    if (!el) return;
    const unlocked = RPGEngine.ACHIEVEMENTS.filter(a => d.achievements.includes(a.id));
    if (unlocked.length === 0) {
      el.innerHTML = '<p class="activity-empty">Nenhuma conquista ainda.</p>';
      return;
    }
    el.innerHTML = unlocked.map(a => '<div class="resp-ach">'+a.icon+' '+a.name+'</div>').join('');
  }

  // --- MESADA & BANCO ---
  function colorSaldo(saldo) {
    if (saldo >= 3000) return '#34D399';
    if (saldo >= 1000) return '#FBBF24';
    return '#EF4444';
  }

  function updateMesada(d) {
    const saldoEl = document.getElementById('mesada-saldo');
    if (saldoEl) {
      saldoEl.textContent = d.cristais.toLocaleString('pt-BR');
      saldoEl.style.color = colorSaldo(d.cristais);
    }
    
    // Calcular gasto mensal
    const gastoEl = document.getElementById('mesada-gasto');
    if (gastoEl) {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const gastoMes = (d.activity || [])
        .filter(a => a.type === 'request' && a.time >= monthStart)
        .reduce((sum, a) => sum + (a.cost || 0), 0);
      gastoEl.textContent = '💎 ' + gastoMes.toLocaleString('pt-BR');
    }
  }

  function deposit(amount) {
    const priceMap = { 450: 'R$ 6,90', 980: 'R$ 12,90', 2150: 'R$ 24,90', 4900: 'R$ 49,90' };
    const priceLabel = priceMap[amount] || ('💎 ' + amount.toLocaleString('pt-BR'));
    const saldoAtual = studentData.cristais || 0;
    const novoSaldo = saldoAtual + amount;

    if (!confirm('Confirmar compra?\n\n' + priceLabel + ' → +💎 ' + amount.toLocaleString('pt-BR') + ' cristais\n\nSaldo atual: 💎 ' + saldoAtual.toLocaleString('pt-BR') + '\nNovo saldo: 💎 ' + novoSaldo.toLocaleString('pt-BR'))) return;

    studentData.cristais = novoSaldo;
    if (!studentData.activity) studentData.activity = [];
    studentData.activity.push({ type: 'deposit', amount: amount, time: Date.now() });
    
    RPGEngine.save(studentData);
    updateMesada(studentData);
    renderNotifications(studentData);

    // ═══ SYNC TO CLOUD ═══
    if (SheetsAPI.isUserOnline() && currentUser && currentUser.id) {
      var targetUserId = currentUser.vinculoAlunoId || SheetsAPI.getCurrentUserId();
      SheetsAPI.deposit(currentUser.id, amount, priceLabel + ' → +💎 ' + amount);
      if (targetUserId) {
        SheetsAPI.syncProgressToCloud(targetUserId, studentData);
      }
    }

    alert('Compra confirmada com sucesso!');
  }

  // --- PRODUTOS ---
  function renderProdutos() {
    const grid = document.getElementById('produtos-grid');
    if (!grid) return;
    
    let html = '';
    PRODUTOS.forEach(p => {
      html += `
        <div class="produto-card">
          <div class="produto-cat">${p.cat}</div>
          <div class="produto-title">${p.title}</div>
          <div class="produto-price">💎 ${p.price.toLocaleString('pt-BR')}</div>
          <button class="produto-btn" data-action="open-modal-produto" data-id="${p.id}">Solicitar Produto</button>
        </div>
      `;
    });
    grid.innerHTML = html;
  }

  // --- TAREFAS CRUD ---
  function renderTarefas() {
    const el = document.getElementById('tarefas-list');
    if (!el) return;

    let tarefasStr = localStorage.getItem('beholder_tarefas');
    let tarefas = tarefasStr ? JSON.parse(tarefasStr) : [];

    if (tarefas.length === 0) {
      el.innerHTML = '<p class="activity-empty">Nenhuma tarefa cadastrada. Adicione uma tarefa para recompensar seu filho com cristais!</p>';
      return;
    }

    el.innerHTML = tarefas.map(t => {
      // Compatibilidade com formato local e cloud
      var titulo = t.titulo || t.title || 'Sem título';
      var recompensa = t.recompensa || t.reward || 0;
      var atribuido = t.alunoNome || t.child || 'Aluno';
      var status = t.status || 'pending';
      var statusBadge = status === 'done' 
        ? '<span class="tarefa-status done">✅ Concluída</span>' 
        : '<span class="tarefa-status pending">⏳ Pendente</span>';

      return `
      <div class="tarefa-item ${status === 'done' ? 'tarefa-done' : ''}">
        <div class="tarefa-info">
          <div class="tarefa-title">${titulo}</div>
          <div class="tarefa-child">Atribuído a: ${atribuido} ${statusBadge}</div>
        </div>
        <div class="tarefa-reward">💎 ${recompensa}</div>
      </div>
    `}).join('');
  }

  async function saveTarefa() {
    const type = document.getElementById('tarefa-type').value;
    let titulo = '';
    
    if (type === 'comum') {
      titulo = document.getElementById('tarefa-title').value.trim();
    } else {
      const disc = document.getElementById('tarefa-disciplina').value;
      const alvo = document.getElementById('tarefa-nota-alvo').value;
      if (!alvo) {
         alert('Preencha a nota alvo!');
         return;
      }
      titulo = `Tirar nota mínima ${alvo} em ${disc}`;
    }

    const rewardEl = document.getElementById('tarefa-reward');
    const childEl = document.getElementById('tarefa-child');
    
    if (!titulo || !rewardEl.value) {
      alert('Preencha todos os campos obrigatórios da tarefa.');
      return;
    }

    const recompensa = parseInt(rewardEl.value, 10);
    const child = childEl.value;

    // Salvar localmente
    let tarefasStr = localStorage.getItem('beholder_tarefas');
    let tarefas = tarefasStr ? JSON.parse(tarefasStr) : [];
    
    tarefas.push({
      id: Date.now(),
      titulo: titulo,
      title: titulo,
      recompensa: recompensa,
      reward: recompensa,
      alunoNome: child,
      child: child,
      status: 'pending'
    });

    localStorage.setItem('beholder_tarefas', JSON.stringify(tarefas));
    
    // Registrar atividade
    if (!studentData.activity) studentData.activity = [];
    studentData.activity.push({ type: 'task', name: titulo, reward: recompensa, time: Date.now() });
    RPGEngine.save(studentData);

    // ═══ SYNC TO CLOUD ═══
    if (SheetsAPI.isUserOnline() && currentUser && currentUser.id) {
      SheetsAPI.createTarefa(
        currentUser.id,
        currentUser.vinculoAlunoId || '',
        child,
        titulo,
        recompensa
      ).catch(function(e) { console.warn('[Sync] Tarefa cloud save failed:', e); });
      
      var targetUserId = currentUser.vinculoAlunoId || SheetsAPI.getCurrentUserId();
      if (targetUserId) {
        SheetsAPI.syncProgressToCloud(targetUserId, studentData);
      }
    }

    closeModal('modal-tarefa');
    renderTarefas();
    renderNotifications(studentData);
    document.getElementById('tarefa-title').value = '';
    document.getElementById('tarefa-reward').value = '';
    if(document.getElementById('tarefa-nota-alvo')) document.getElementById('tarefa-nota-alvo').value = '';
  }

  // --- BOLETIM CRUD ---
  const BOLETIM_SUBJECTS = ['Matemática', 'Português', 'Ciências', 'História', 'Geografia'];
  let evolutionChart = null;

  function renderBoletimTable() {
    const tbody = document.getElementById('boletim-table-body');
    if (!tbody) return;
    
    let boletimDataStr = localStorage.getItem('beholder_boletim_data');
    let boletimData;
    
    if (!boletimDataStr) {
      boletimData = { escola: '', media: 7.0, notas: {} };
      BOLETIM_SUBJECTS.forEach(sub => boletimData.notas[sub] = [null, null, null, null]);
    } else {
      boletimData = JSON.parse(boletimDataStr);
    }
    
    document.getElementById('boletim-escola').value = boletimData.escola || '';
    document.getElementById('boletim-media').value = boletimData.media || 7.0;
    
    let html = '';
    BOLETIM_SUBJECTS.forEach(sub => {
       const n = boletimData.notas[sub] || [null, null, null, null];
       
       let total = 0; let count = 0;
       n.forEach(v => { if(v !== null && v !== '') { total += parseFloat(v); count++; } });
       let mediaFinal = count > 0 ? (total/count).toFixed(1) : '-';
       let color = (count > 0 && parseFloat(mediaFinal) >= parseFloat(boletimData.media)) ? '#10B981' : (count > 0 ? '#EF4444' : 'inherit');
       
       html += `
         <tr style="border-bottom: 1px solid var(--border-subtle);">
           <td style="padding: 0.75rem 0.5rem; font-weight:600; color:var(--text-primary);">${sub}</td>
           <td style="padding: 0.75rem 0.5rem; text-align:center;"><input type="number" step="0.1" min="0" max="10" class="input-field" style="width:60px; padding:0.25rem; text-align:center;" value="${n[0] !== null ? n[0] : ''}" data-sub="${sub}" data-bim="0"></td>
           <td style="padding: 0.75rem 0.5rem; text-align:center;"><input type="number" step="0.1" min="0" max="10" class="input-field" style="width:60px; padding:0.25rem; text-align:center;" value="${n[1] !== null ? n[1] : ''}" data-sub="${sub}" data-bim="1"></td>
           <td style="padding: 0.75rem 0.5rem; text-align:center;"><input type="number" step="0.1" min="0" max="10" class="input-field" style="width:60px; padding:0.25rem; text-align:center;" value="${n[2] !== null ? n[2] : ''}" data-sub="${sub}" data-bim="2"></td>
           <td style="padding: 0.75rem 0.5rem; text-align:center;"><input type="number" step="0.1" min="0" max="10" class="input-field" style="width:60px; padding:0.25rem; text-align:center;" value="${n[3] !== null ? n[3] : ''}" data-sub="${sub}" data-bim="3"></td>
           <td style="padding: 0.75rem 0.5rem; text-align:center; font-weight:bold; color:${color};">${mediaFinal}</td>
         </tr>
       `;
    });
    tbody.innerHTML = html;
    
    renderEvolutionChart(boletimData);
  }

  function saveBoletim() {
    let boletimData = {
      escola: document.getElementById('boletim-escola').value,
      media: parseFloat(document.getElementById('boletim-media').value) || 7.0,
      notas: {}
    };
    
    BOLETIM_SUBJECTS.forEach(sub => {
       boletimData.notas[sub] = [null, null, null, null];
    });
    
    const inputs = document.querySelectorAll('#boletim-table-body input[type="number"]');
    inputs.forEach(input => {
      const sub = input.getAttribute('data-sub');
      const bim = parseInt(input.getAttribute('data-bim'));
      const val = input.value !== '' ? parseFloat(input.value) : null;
      boletimData.notas[sub][bim] = val;
    });
    
    localStorage.setItem('beholder_boletim_data', JSON.stringify(boletimData));
    
    // SYNC TO CLOUD
    if (SheetsAPI.isUserOnline() && currentUser && currentUser.vinculoAlunoId) {
      SheetsAPI.saveBoletim(currentUser.vinculoAlunoId, boletimData)
        .catch(function(e) { console.warn('[Sync] Boletim cloud save failed:', e); });
    }
    
    alert('Boletim salvo com sucesso! O gráfico será atualizado.');
    renderBoletimTable();
  }

  function renderEvolutionChart(d) {
    const canvas = document.getElementById('boletim-evolution-chart');
    if (!canvas || typeof Chart === 'undefined') return;
    
    if (evolutionChart) {
      evolutionChart.destroy();
    }
    
    const datasets = [];
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'];
    
    BOLETIM_SUBJECTS.forEach((sub, i) => {
       const raw = d.notas[sub] || [null, null, null, null];
       datasets.push({
          label: sub,
          data: raw,
          borderColor: colors[i % colors.length],
          backgroundColor: colors[i % colors.length],
          tension: 0.3,
          spanGaps: true
       });
    });
    
    evolutionChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['1º Bimestre', '2º Bimestre', '3º Bimestre', '4º Bimestre'],
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 0, max: 10, title: { display:true, text: 'Nota' } }
        }
      }
    });
  }

  // --- FILHOS CRUD ---
  async function saveFilho() {
    const codeEl = document.getElementById('filho-code');
    if (!codeEl.value.trim()) {
      alert('Digite o código de vínculo.');
      return;
    }

    const codigo = codeEl.value.trim().toUpperCase();

    // ═══ ONLINE: Real vinculo via API ═══
    if (SheetsAPI.isUserOnline() && currentUser && currentUser.id) {
      const result = await SheetsAPI.linkChild(currentUser.id, codigo);
      if (result.success) {
        // Atualizar dados do usuário local
        currentUser.linkedTo = result.aluno.nome;
        currentUser.vinculoAlunoId = result.aluno.id;
        localStorage.setItem('beholder_user', JSON.stringify(currentUser));

        alert('✅ Filho vinculado com sucesso!\nAcompanhando: ' + result.aluno.nome);
        closeModal('modal-filho');
        codeEl.value = '';
        window.location.reload();
      } else {
        alert('❌ ' + (result.error || 'Código inválido. Verifique e tente novamente.'));
      }
    } else {
      // ═══ OFFLINE: Mock linkage ═══
      alert('✅ Código válido! Filho vinculado com sucesso. (modo offline)');
      closeModal('modal-filho');
      codeEl.value = '';
    }
  }

  // --- MODALS ---
  let selectedProdutoId = null;

  function openModalTarefa() {
    document.getElementById('modal-tarefa').classList.remove('hidden');
  }
  
  function openModalFilho() {
    document.getElementById('modal-filho').classList.remove('hidden');
  }

  function openModalProduto(id) {
    selectedProdutoId = id;
    const produto = PRODUTOS.find(p => p.id === id);
    const body = document.getElementById('modal-produto-body');
    if (produto && body) {
      body.innerHTML = `
        <p>Você está prestes a solicitar <strong>${produto.title}</strong> para seu filho.</p>
        <p>Custo: <strong style="color:var(--brand-primary); font-size:1.2rem;">💎 ${produto.price.toLocaleString('pt-BR')}</strong></p>
        <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem;">O valor será descontado do saldo de mesada digital.</p>
      `;
      document.getElementById('modal-produto').classList.remove('hidden');
    }
  }

  function confirmProduto() {
    const produto = PRODUTOS.find(p => p.id === selectedProdutoId);
    if (!produto) return;

    if (studentData.cristais < produto.price) {
      alert('Saldo insuficiente!');
      closeModal('modal-produto');
      return;
    }

    studentData.cristais -= produto.price;
    if (!studentData.activity) studentData.activity = [];
    studentData.activity.push({ type: 'request', name: produto.title, cost: produto.price, time: Date.now() });
    
    RPGEngine.save(studentData);
    updateMesada(studentData);
    renderNotifications(studentData);

    // ═══ SYNC TO CLOUD ═══
    if (SheetsAPI.isUserOnline() && currentUser && currentUser.id) {
      var targetUserId = currentUser.vinculoAlunoId || SheetsAPI.getCurrentUserId();
      SheetsAPI.purchase(currentUser.id, produto.id, produto.price, produto.title);
      if (targetUserId) {
        SheetsAPI.syncProgressToCloud(targetUserId, studentData);
      }
    }
    
    alert('Solicitação realizada com sucesso! Descontado 💎 ' + produto.price.toLocaleString('pt-BR') + ' do saldo.');
    closeModal('modal-produto');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return Math.floor(diff / 60) + 'min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  }

  function toggleTarefaFields() {
    const type = document.getElementById('tarefa-type').value;
    if (type === 'nota') {
      document.getElementById('tarefa-comum-fields').classList.add('hidden');
      document.getElementById('tarefa-nota-fields').classList.remove('hidden');
    } else {
      document.getElementById('tarefa-comum-fields').classList.remove('hidden');
      document.getElementById('tarefa-nota-fields').classList.add('hidden');
    }
  }

  // Exposed for external sync refresh
  function refreshTarefas() {
    renderTarefas();
  }

  return { init, selectStudent, deposit, refreshTarefas, toggleTarefaFields };
})();
