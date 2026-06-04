/* ============================================
   BEHOLDER ACADEMY — Responsável UI Controller
   Parent Dashboard using RPG Engine data
   ============================================ */

const ResponsavelUI = (function() {
  'use strict';
  let studentData = null;

  function init() {
    studentData = RPGEngine.load();
    renderStudents();
    renderDetail();
    setupDelegation();
  }

  function renderStudents() {
    const el = document.getElementById('resp-students');
    if (!el) return;

    const d = studentData;
    const genLevel = RPGEngine.getGeneralLevel(d);
    const title = RPGEngine.LEVEL_TITLES[genLevel] || 'Aprendiz';
    const activeSubjects = RPGEngine.SUBJECTS.filter(s => (d.subjectProgress[s]?.artigosLidos || 0) > 0).length;

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

    el.innerHTML = `
      <div class="student-card active" data-action="select-student">
        <div class="student-card-top">
          <div class="student-avatar">🧑‍🎓</div>
          <div>
            <div class="student-name">${d.nome}</div>
            <div class="student-grade">Nv. ${genLevel} — ${title} · 🔥 ${d.streak} dias</div>
          </div>
        </div>
        <div class="student-stats">
          <div class="student-stat">📚 <strong>${d.stats.artigosLidos}</strong> artigos</div>
          <div class="student-stat">🧠 <strong>${d.stats.quizzesPerfeitos}</strong> quizzes</div>
          <div class="student-stat">🏅 <strong>${d.achievements.length}</strong> conquistas</div>
        </div>
        <div class="student-bar"><div class="student-bar-fill" style="width:${progress.percent}%"></div></div>
        ${best.level > 1 ? `<div class="student-highlight">⭐ Destaque: ${best.name} (Nv. ${best.level})</div>` : ''}
        ${d.streak === 0 && d.stats.artigosLidos > 0 ? '<div class="student-alert">⚠️ Atividade baixa esta semana</div>' : ''}
      </div>
    `;
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
  }

  function renderStats(d) {
    const el = document.getElementById('resp-stats');
    if (!el) return;
    const genLevel = RPGEngine.getGeneralLevel(d);

    // Estimate study time (articles * 5 min avg)
    const studyMinutes = d.stats.artigosLidos * 5;
    const studyHours = Math.floor(studyMinutes / 60);
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

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
      `<div class="comp-card"><div class="comp-icon">${c.icon}</div><div class="comp-value">${c.value}</div><div class="comp-name">${c.name}</div></div>`
    ).join('');
  }

  function renderActivityChart(d) {
    const canvas = document.getElementById('activity-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Simulate 30-day activity from data
    const days = 30;
    const barW = (W - 40) / days;
    const activities = [];

    // Use actual activity data if available
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
      if (ctx.roundRect) {
        ctx.roundRect(x, y, barW - 2, barH, 2);
      } else {
        ctx.rect(x, y, barW - 2, barH);
      }
      ctx.fill();
    });

    // Labels
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
    // Generate notifications from activity
    (d.activity || []).slice(0, 8).forEach(a => {
      if (a.type === 'achievement') notifs.push({ icon: '🏅', text: `Conquista desbloqueada: ${a.name}`, time: a.time });
      if (a.type === 'xp' && a.levelUp) notifs.push({ icon: '🎉', text: `Subiu de nível em ${RPGEngine.SUBJECT_NAMES[a.subject] || a.subject}!`, time: a.time });
      if (a.type === 'challenge') notifs.push({ icon: '⚔️', text: a.reason, time: a.time });
      if (a.type === 'chest') notifs.push({ icon: '🛒', text: `Abriu ${a.chest}: ${a.item}`, time: a.time });
    });

    if (d.streak >= 7) notifs.unshift({ icon: '🔥', text: `Streak de ${d.streak} dias! Continue assim!`, time: Date.now() });

    if (notifs.length === 0) {
      el.innerHTML = '<div class="activity-empty">Nenhuma notificação ainda.</div>';
      return;
    }

    el.innerHTML = notifs.slice(0, 6).map(n =>
      `<div class="notif-item"><span class="notif-icon">${n.icon}</span><span class="notif-text">${n.text}</span><span class="notif-time">${timeAgo(n.time)}</span></div>`
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
    el.innerHTML = unlocked.map(a =>
      `<div class="resp-ach">${a.icon} ${a.name}</div>`
    ).join('');
  }

  function updateMesada(d) {
    const saldoEl = document.getElementById('mesada-saldo');
    if (saldoEl) saldoEl.textContent = d.cristais.toLocaleString('pt-BR');
  }

  function deposit(amount) {
    studentData.cristais += amount;
    RPGEngine.save(studentData);
    updateMesada(studentData);
    renderNotifications(studentData);
    // Visual feedback
    const saldoEl = document.getElementById('mesada-saldo');
    if (saldoEl) {
      saldoEl.style.color = '#34D399';
      setTimeout(() => { saldoEl.style.color = ''; }, 1000);
    }
  }

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return Math.floor(diff / 60) + 'min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'd';
  }

  return { init, selectStudent, deposit };
})();

// --- Event Delegation for Responsavel ---
function setupDelegation() {
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');
    if (action === 'select-student') ResponsavelUI.selectStudent();
    if (action === 'deposit') ResponsavelUI.deposit(parseInt(el.getAttribute('data-amount'), 10));
  });
}
