/* ============================================
   BEHOLDER ACADEMY — Painel UI Controller
   Renders RPG Engine data into the panel UI
   ============================================ */

const PainelUI = (function() {
  'use strict';
  let data = null;

  const SUBJECT_ICONS = {
    historia:'📜', portugues:'📖', matematica:'🔢', geografia:'🌍',
    biologia:'🧬', quimica:'⚗️', fisica:'⚡', ingles:'🌐',
    filosofia:'💡', sociologia:'👥', literatura:'📚', redacao:'✍️'
  };
  const SUBJECT_COLORS = {
    historia:'#E63946', portugues:'#4361EE', matematica:'#06D6A0', geografia:'#F4A261',
    biologia:'#9B59B6', quimica:'#E67E22', fisica:'#00BCD4', ingles:'#1ABC9C',
    filosofia:'#607D8B', sociologia:'#E91E63', literatura:'#8D6E63', redacao:'#FF7043'
  };

  function init() {
    data = RPGEngine.load();
    data = RPGEngine.registerDailyLogin(data);
    setupTabs();
    setupStoreTabs();
    setupDelegation();
    renderAll();
  }

  function renderAll() {
    renderNavCurrencies();
    renderDashboard();
    renderProfile();
    renderChallenges();
    renderStore();
    renderAchievements();
  }

  // ── Tab System ──
  function setupTabs() {
    document.querySelectorAll('.painel-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
  }

  function switchTab(tabId) {
    document.querySelectorAll('.painel-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const btn = document.querySelector(`.painel-tab[data-tab="${tabId}"]`);
    const content = document.getElementById('tab-' + tabId);
    if (btn) btn.classList.add('active');
    if (content) content.classList.add('active');
  }

  function setupStoreTabs() {
    document.querySelectorAll('.store-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.store-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.store-content').forEach(c => c.classList.add('hidden'));
        tab.classList.add('active');
        const el = document.getElementById('store-' + tab.dataset.store);
        if (el) el.classList.remove('hidden');
      });
    });
  }

  // ── Nav Currencies ──
  function renderNavCurrencies() {
    setText('nav-fichas', data.fichas.toLocaleString('pt-BR'));
    setText('nav-cristais', data.cristais.toLocaleString('pt-BR'));
    setText('nav-essencias', data.essencias.toLocaleString('pt-BR'));
  }

  // ── Dashboard ──
  function renderDashboard() {
    const genLevel = RPGEngine.getGeneralLevel(data);
    const title = RPGEngine.LEVEL_TITLES[genLevel] || 'Aprendiz';
    const totalXP = RPGEngine.SUBJECTS.reduce((s, sub) => s + (data.subjectProgress[sub]?.xp || 0), 0);
    const progress = RPGEngine.xpProgress(totalXP, genLevel);

    setText('dash-streak', data.streak);
    setText('dash-level', 'Nv. ' + genLevel);
    setText('dash-title', title);
    setText('dash-multi', RPGEngine.streakMultiplier(data.streak).toFixed(2) + 'x');

    const bar = document.getElementById('dash-xp-bar');
    if (bar) bar.style.width = progress.percent + '%';
    setText('dash-xp-text', progress.current + ' / ' + progress.needed + ' XP');

    // Daily progress
    const dailyDone = data.challenges.daily.tasks.filter(t => t).length;
    setText('dash-daily-progress', dailyDone + '/3');

    // Weekly articles
    setText('dash-weekly-articles', (data.challenges.weekly.progress[0] || 0) + '/10');

    // Active subjects
    const active = RPGEngine.SUBJECTS.filter(s => (data.subjectProgress[s]?.artigosLidos || 0) > 0).length;
    setText('dash-active-subjects', active);

    // Activity feed
    renderActivityFeed();
  }

  function renderActivityFeed() {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    if (!data.activity || data.activity.length === 0) {
      feed.innerHTML = '<div class="activity-empty">Nenhuma atividade ainda. Comece lendo um artigo!</div>';
      return;
    }
    feed.innerHTML = data.activity.slice(0, 10).map(a => {
      let icon = '📌', text = '', xp = '';
      if (a.type === 'xp') { icon = '⚡'; text = a.reason + (a.subject ? ' (' + (RPGEngine.SUBJECT_NAMES[a.subject]||a.subject) + ')' : ''); xp = '+' + a.amount + ' XP'; }
      if (a.type === 'challenge') { icon = '🎁'; text = a.reason; xp = '+' + a.amount + ' XP'; }
      if (a.type === 'achievement') { icon = a.icon; text = 'Conquista: ' + a.name; xp = '+' + a.xp + ' XP'; }
      if (a.type === 'chest') { icon = '🎁'; text = a.chest + ': ' + a.item; xp = a.rarity.toUpperCase(); }
      if (a.type === 'purchase') { icon = '✨'; text = a.name; xp = '-' + a.cost + ' ✨'; }
      const time = timeAgo(a.time);
      return `<div class="activity-item"><span class="activity-icon">${icon}</span><span class="activity-text">${text}</span><span class="activity-xp">${xp}</span><span class="activity-time">${time}</span></div>`;
    }).join('');
  }

  // ── Profile ──
  function renderProfile() {
    const genLevel = RPGEngine.getGeneralLevel(data);
    const title = RPGEngine.LEVEL_TITLES[genLevel] || 'Aprendiz';

    setText('perfil-name', data.nome);
    setText('perfil-level', 'Nv. ' + genLevel);
    setText('perfil-title', title);
    setText('perfil-streak', data.streak);

    renderRadarChart();
    renderSubjectLevels();
  }

  function renderRadarChart() {
    const canvas = document.getElementById('radar-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 40;

    ctx.clearRect(0, 0, W, H);
    const comps = RPGEngine.getCompetencies(data);
    const keys = Object.keys(comps);
    const n = keys.length;

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
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-subtle') || '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw axes
    keys.forEach((_, i) => {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-subtle') || '#E5E7EB';
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
      const lx = cx + (R + 25) * Math.cos(angle);
      const ly = cy + (R + 25) * Math.sin(angle);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary') || '#111';
      ctx.font = '600 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(comps[key].icon + ' ' + comps[key].value, lx, ly);
    });
  }

  function renderSubjectLevels() {
    const container = document.getElementById('subject-levels');
    if (!container) return;
    container.innerHTML = RPGEngine.SUBJECTS.map(s => {
      const sp = data.subjectProgress[s] || { level:1, xp:0 };
      const prog = RPGEngine.xpProgress(sp.xp, sp.level);
      const color = SUBJECT_COLORS[s] || '#7B2FF7';
      return `<div class="subject-row">
        <span class="subject-icon">${SUBJECT_ICONS[s]||'📘'}</span>
        <span class="subject-name">${RPGEngine.SUBJECT_NAMES[s]}</span>
        <span class="subject-level-badge">Nv. ${sp.level}</span>
        <div class="subject-bar-wrap"><div class="subject-bar" style="width:${prog.percent}%;background:${color}"></div></div>
        <span class="subject-pct">${prog.percent}%</span>
      </div>`;
    }).join('');
  }

  // ── Challenges ──
  function renderChallenges() {
    const d = data.challenges.daily;
    const w = data.challenges.weekly;
    const m = data.challenges.monthly;

    const dailyEl = document.getElementById('daily-challenges');
    if (dailyEl) {
      dailyEl.innerHTML = [
        challengeRow(d.tasks[0], 'Ler 1 artigo', '75 XP + 5 🟡'),
        challengeRow(d.tasks[1], 'Quiz sem errar', '100 XP + 10 🟡'),
        challengeRow(d.tasks[2], '3 matérias diferentes', '50 XP + 5 🟡'),
        `<div class="challenge-item challenge-bonus ${d.bonus?'done':''}"><span class="challenge-check">${d.bonus?'✅':'🎁'}</span><span class="challenge-desc"><strong>BÔNUS:</strong> Complete os 3</span><span class="challenge-reward">+100 XP + 20 🟡</span></div>`
      ].join('');
    }

    const weeklyEl = document.getElementById('weekly-challenges');
    if (weeklyEl) {
      weeklyEl.innerHTML = [
        challengeProgress(w.progress[0], 10, 'Ler 10 artigos', '300 XP + 50 🟡'),
        challengeProgress(w.progress[1], 7, 'Streak de 7 dias', '500 XP + 100 🟡'),
        challengeProgress(w.progress[2], 5, '5 quizzes perfeitos', '400 XP + 75 🟡'),
        `<div class="challenge-item challenge-bonus ${w.bonus?'done':''}"><span class="challenge-check">${w.bonus?'✅':'🎁'}</span><span class="challenge-desc"><strong>BÔNUS:</strong> Complete os 3</span><span class="challenge-reward">+500 XP + ⚪ Baú Prata</span></div>`
      ].join('');
    }

    const monthlyEl = document.getElementById('monthly-challenges');
    if (monthlyEl) {
      monthlyEl.innerHTML = [
        challengeProgress(m.progress[0], 30, 'Ler 30 artigos', '1500 XP + 300 🟡'),
        challengeProgress(0, 1, 'Subir 1 nível', '2000 XP + 500 🟡'),
        challengeProgress(m.progress[2], 20, 'Streak de 20+ dias', '1000 XP + 200 🟡'),
        `<div class="challenge-item challenge-bonus ${m.bonus?'done':''}"><span class="challenge-check">${m.bonus?'✅':'🎁'}</span><span class="challenge-desc"><strong>BÔNUS:</strong> Complete os 3</span><span class="challenge-reward">+2000 XP + 🟡 Baú Ouro</span></div>`
      ].join('');
    }
  }

  function challengeRow(done, desc, reward) {
    return `<div class="challenge-item ${done?'done':''}"><span class="challenge-check">${done?'✅':'⬜'}</span><span class="challenge-desc">${desc}</span><span class="challenge-reward">${reward}</span></div>`;
  }

  function challengeProgress(current, total, desc, reward) {
    const pct = Math.min(100, Math.floor((current / total) * 100));
    const done = current >= total;
    return `<div class="challenge-item ${done?'done':''}"><span class="challenge-check">${done?'✅':'⬜'}</span><span class="challenge-desc">${desc}</span><div class="challenge-progress-bar"><div class="challenge-progress-fill" style="width:${pct}%"></div></div><span class="challenge-reward">${current}/${total}</span></div>`;
  }

  // ── Store ──
  function renderStore() {
    const storeData = RPGEngine.getVisibleStoreItems(data);

    // Cosméticos
    const cosmEl = document.getElementById('store-cosmeticos');
    if (cosmEl) {
      const cosmeticos = storeData.items.filter(i => i.type === 'cosmético');
      cosmEl.innerHTML = cosmeticos.map(item => storeCard(item, 'fichas')).join('') || '<p class="activity-empty">Complete quests para desbloquear itens!</p>';
    }

    // Baús
    const bausEl = document.getElementById('store-baus');
    if (bausEl) {
      bausEl.innerHTML = Object.entries(RPGEngine.CHESTS).map(([key, chest]) => {
        const canAfford = data.fichas >= chest.cost;
        return `<div class="store-item chest-card ${key}">
          <div class="store-item-icon">${chest.icon}</div>
          <div class="store-item-name">${chest.name}</div>
          <div class="store-item-cost">${chest.cost} 🟡</div>
          <button class="btn-buy" ${canAfford?'':'disabled'} data-action="buy-chest" data-chest-type="${key}">Abrir!</button>
        </div>`;
      }).join('');
    }

    // Exclusivos (Essências)
    const exclEl = document.getElementById('store-exclusivos');
    if (exclEl) {
      exclEl.innerHTML = RPGEngine.ESSENCE_ITEMS.map(item => {
        const owned = data.inventory.some(i => i.essenceId === item.id);
        const canAfford = data.essencias >= item.cost;
        return `<div class="store-item">
          <div class="store-item-icon">🔴</div>
          <div class="store-item-name">${item.name}</div>
          <div class="store-item-cost">${item.cost} ✨</div>
          <button class="btn-buy" ${owned?'disabled':''}${!canAfford&&!owned?' disabled':''} data-action="buy-essence" data-essence-id="${item.id}">${owned?'Adquirido':'Comprar'}</button>
        </div>`;
      }).join('');
    }

    // Resgates
    const resgEl = document.getElementById('store-resgates');
    if (resgEl) {
      const resgates = storeData.items.filter(i => i.type === 'resgate');
      if (resgates.length === 0) {
        resgEl.innerHTML = '<p class="activity-empty">Complete mais quests e suba de nível para ver resgates!</p>';
      } else {
        resgEl.innerHTML = resgates.map(item =>
          `<div class="store-item">
            <div class="store-item-icon">🎁</div>
            <div class="store-item-name">${item.name}</div>
            <div class="store-item-cost">${item.cost} 🟡 + ${item.costCristais} 💎</div>
            <button class="btn-buy" disabled>Em breve</button>
          </div>`
        ).join('');
      }
    }
  }

  function storeCard(item) {
    const canAfford = data.fichas >= item.cost;
    return `<div class="store-item"><div class="store-item-icon">🎨</div><div class="store-item-name">${item.name}</div><div class="store-item-cost">${item.cost} 🟡</div><button class="btn-buy" ${canAfford?'':'disabled'}>Comprar</button></div>`;
  }

  // ── Achievements ──
  function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (grid) {
      grid.innerHTML = RPGEngine.ACHIEVEMENTS.map(a => {
        const unlocked = data.achievements.includes(a.id);
        return `<div class="achievement-card ${unlocked?'unlocked':'locked'}"><div class="ach-icon">${a.icon}</div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div>`;
      }).join('');
    }

    const inv = document.getElementById('inventory-grid');
    if (inv) {
      const items = (data.inventory || []).filter(i => i.type === 'cosmetic' || i.type === 'essence_item');
      if (items.length === 0) {
        inv.innerHTML = '<p class="activity-empty">Nenhum item ainda. Abra baús para colecionar!</p>';
      } else {
        inv.innerHTML = items.map(i =>
          `<div class="inv-item rarity-${i.rarity||'comum'}">${i.name}</div>`
        ).join('');
      }
    }
  }

  // ── Chest Actions ──
  function buyChest(type) {
    const result = RPGEngine.openChest(data, type);
    if (!result.drop) return;
    data = result.data;

    const overlay = document.getElementById('chest-overlay');
    const animIcon = document.getElementById('chest-anim-icon');
    const resultDiv = document.getElementById('chest-result');
    const rarityDiv = document.getElementById('drop-rarity');
    const nameDiv = document.getElementById('drop-name');
    const essDiv = document.getElementById('drop-essence');

    animIcon.textContent = RPGEngine.CHESTS[type]?.icon || '🎁';
    resultDiv.classList.add('hidden');
    overlay.classList.remove('hidden');

    setTimeout(() => {
      animIcon.style.animation = 'none';
      rarityDiv.textContent = result.drop.rarity.toUpperCase();
      rarityDiv.className = 'drop-rarity ' + result.drop.rarity;
      nameDiv.textContent = result.drop.item;
      essDiv.textContent = result.drop.essence > 0 ? '+' + result.drop.essence + ' ✨ Essências!' : '';
      resultDiv.classList.remove('hidden');
    }, 1500);

    renderAll();
  }

  function closeChest() {
    document.getElementById('chest-overlay').classList.add('hidden');
    document.getElementById('chest-anim-icon').style.animation = 'chestBounce 0.6s ease infinite alternate';
    renderAll();
  }

  function buyEssence(itemId) {
    const result = RPGEngine.buyEssenceItem(data, itemId);
    if (result.success) { data = result.data; renderAll(); }
  }

  // ── Helpers ──
  function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

  function timeAgo(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return Math.floor(diff/60) + 'min';
    if (diff < 86400) return Math.floor(diff/3600) + 'h';
    return Math.floor(diff/86400) + 'd';
  }

  return { init, switchTab, buyChest, closeChest, buyEssence, renderAll };
})();

// --- Event Delegation Setup (called from init) ---
function setupDelegation() {
  document.addEventListener('click', function(e) {
    var el = e.target.closest('[data-action]');
    if (!el) return;
    var action = el.getAttribute('data-action');
    switch (action) {
      case 'tab':
        PainelUI.switchTab(el.getAttribute('data-tab-target'));
        break;
      case 'close-chest':
        PainelUI.closeChest();
        break;
      case 'buy-chest':
        PainelUI.buyChest(el.getAttribute('data-chest-type'));
        break;
      case 'buy-essence':
        PainelUI.buyEssence(el.getAttribute('data-essence-id'));
        break;
      case 'deposit':
        ResponsavelUI.deposit(parseInt(el.getAttribute('data-amount'), 10));
        break;
    }
  });
}
