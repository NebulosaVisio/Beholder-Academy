/* ============================================
   BEHOLDER ACADEMY — RPG Engine v1.0
   Sistema de XP, Níveis, Moedas, Desafios, Baús
   Persistência: localStorage
   ============================================ */

const RPGEngine = (function () {
  'use strict';

  const STORAGE_KEY = 'beholder_rpg_data';

  // ── XP Table (D&D inspired, levels 1-20) ──
  const XP_TABLE = [0,0,300,600,1200,1800,2400,3000,3600,4200,5000,6000,7000,8000,9000,10000,12000,14000,16000,18000,20000];
  const LEVEL_TITLES = ['','Aprendiz','Iniciado','Estudante','Estudante II','Dedicado','Dedicado II','Aplicado','Aplicado II','Competente','Mestre','Mestre II','Especialista','Especialista II','Sábio','Sábio II','Erudito','Guardião','Guardião II','Lenda','Arcano'];

  const SUBJECTS = ['historia','portugues','matematica','geografia','biologia','quimica','fisica','ingles','filosofia','sociologia','literatura','redacao'];

  const SUBJECT_NAMES = {
    historia:'História', portugues:'Português', matematica:'Matemática',
    geografia:'Geografia', biologia:'Biologia', quimica:'Química',
    fisica:'Física', ingles:'Inglês', filosofia:'Filosofia',
    sociologia:'Sociologia', literatura:'Literatura', redacao:'Redação'
  };

  // ── XP Rewards (base values — Básico level) ──
  const XP_REWARDS = {
    leitura: 50, quiz_perfeito: 100, quiz_parcial: 50,
    desafio_diario: 75, desafio_semanal: 300, desafio_mensal: 1500,
    revisao: 25, primeiro_acesso: 30
  };

  // ── Ficha (coin) Rewards (base values — Básico level) ──
  const FICHA_REWARDS = {
    leitura: 5, quiz_perfeito: 10, quiz_parcial: 5,
    desafio_diario: 5, desafio_semanal: 50, desafio_mensal: 300,
    primeiro_acesso: 3
  };

  // ── Difficulty Multipliers ──
  // XP and Fichas scale with article difficulty level
  const DIFFICULTY_MULTIPLIERS = {
    basico:        { xp: 1.0, fichas: 1.0, label: '🟢 Básico',        grade: '6º ano' },
    intermediario: { xp: 1.5, fichas: 1.6, label: '🔵 Intermediário', grade: '7º-8º ano' },
    avancado:      { xp: 2.0, fichas: 2.4, label: '🟣 Avançado',      grade: '9º ano' },
    expert:        { xp: 3.0, fichas: 4.0, label: '🔴 Expert',        grade: 'Ensino Médio' }
  };

  // Helper: get scaled rewards based on difficulty
  function getScaledRewards(rewardKey, difficulty) {
    const diff = difficulty || 'basico';
    const mult = DIFFICULTY_MULTIPLIERS[diff] || DIFFICULTY_MULTIPLIERS.basico;
    return {
      xp: Math.round((XP_REWARDS[rewardKey] || 0) * mult.xp),
      fichas: Math.round((FICHA_REWARDS[rewardKey] || 0) * mult.fichas)
    };
  }

  // ── Competency Mapping ──
  const COMPETENCIES = {
    raciocinioLogico:  { name: 'Raciocínio Lógico', icon: '🧮', subjects: ['matematica','fisica','quimica'] },
    pensamentoCritico: { name: 'Pensamento Crítico', icon: '🧭', subjects: ['historia','filosofia','sociologia'] },
    comunicacao:       { name: 'Comunicação', icon: '💬', subjects: ['portugues','redacao','literatura'] },
    visaoDeMundo:      { name: 'Visão de Mundo', icon: '🌎', subjects: ['geografia','biologia'] },
    repertorioCultural:{ name: 'Repertório Cultural', icon: '🎭', subjects: ['ingles','literatura'] },
    disciplina:        { name: 'Disciplina', icon: '🔥', subjects: [] } // special calc
  };

  // ── Chest Drop Tables ──
  const CHESTS = {
    bronze: {
      name: 'Baú de Bronze', icon: '🟤', cost: 100,
      drops: [
        { weight: 70, rarity: 'comum', essence: 0 },
        { weight: 25, rarity: 'incomum', essence: 0 },
        { weight: 5,  rarity: 'incomum', essence: 1 }
      ]
    },
    prata: {
      name: 'Baú de Prata', icon: '⚪', cost: 300,
      drops: [
        { weight: 50, rarity: 'incomum', essence: 0 },
        { weight: 35, rarity: 'raro', essence: 0 },
        { weight: 10, rarity: 'raro', essence: 2 },
        { weight: 5,  rarity: 'epico', essence: 0 }
      ]
    },
    ouro: {
      name: 'Baú de Ouro', icon: '🟡', cost: 750,
      drops: [
        { weight: 40, rarity: 'raro', essence: 0 },
        { weight: 35, rarity: 'epico', essence: 0 },
        { weight: 15, rarity: 'epico', essence: 5 },
        { weight: 10, rarity: 'lendario', essence: 0 }
      ]
    }
  };

  // ── Cosmetic Items Pool ──
  const COSMETICS = {
    comum:    ['Borda Simples Cinza','Borda Simples Azul','Cor de Perfil: Verde','Cor de Perfil: Laranja','Avatar Padrão 2','Avatar Padrão 3'],
    incomum:  ['Moldura Floresta','Moldura Oceano','Título: Curioso','Título: Estudioso','Borda Neon Verde','Borda Neon Azul'],
    raro:     ['Borda Animada Raio','Borda Animada Ondas','Moldura Dragão','Título: Sábio','Efeito Perfil: Estrelas'],
    epico:    ['Avatar Fênix','Avatar Lobo Lunar','Trail Partículas Fogo','Moldura Galáxia','Título: Iluminado'],
    lendario: ['Moldura Lendária Aurora','Título: Lenda Viva','Avatar Guardião Celestial','Trail Runas Antigas']
  };

  // ── Achievements ──
  const ACHIEVEMENTS = [
    { id:'primeiro_passo',  name:'Primeiro Passo',  icon:'🌱', desc:'Completar 1º artigo', check: d => d.stats.artigosLidos >= 1, xp:50 },
    { id:'leitor',          name:'Leitor',          icon:'📖', desc:'10 artigos lidos',     check: d => d.stats.artigosLidos >= 10, xp:100 },
    { id:'bibliofilo',      name:'Bibliófilo',      icon:'📚', desc:'50 artigos lidos',     check: d => d.stats.artigosLidos >= 50, xp:300 },
    { id:'enciclopedia',    name:'Enciclopédia',    icon:'🏛️', desc:'100 artigos lidos',    check: d => d.stats.artigosLidos >= 100, xp:500 },
    { id:'genio',           name:'Gênio',           icon:'🧠', desc:'10 quizzes perfeitos', check: d => d.stats.quizzesPerfeitos >= 10, xp:200 },
    { id:'chama_viva',      name:'Chama Viva',      icon:'🔥', desc:'Streak de 7 dias',     check: d => d.streak >= 7, xp:150 },
    { id:'inferno',         name:'Inferno',         icon:'🔥', desc:'Streak de 30 dias',    check: d => d.streak >= 30, xp:500 },
    { id:'guerreiro',       name:'Guerreiro',       icon:'⚔️', desc:'10 desafios diários',  check: d => d.stats.desafiosDiarios >= 10, xp:100 },
    { id:'campeao',         name:'Campeão',         icon:'🗡️', desc:'4 desafios semanais',  check: d => d.stats.desafiosSemanais >= 4, xp:300 },
    { id:'lenda_badge',     name:'Lenda',           icon:'👑', desc:'3 desafios mensais',   check: d => d.stats.desafiosMensais >= 3, xp:500 },
    { id:'explorador',      name:'Explorador',      icon:'🌍', desc:'Ler de 6+ matérias',   check: d => Object.keys(d.subjectProgress).filter(s => d.subjectProgress[s].artigosLidos > 0).length >= 6, xp:200 },
    { id:'focado',          name:'Focado',           icon:'🎯', desc:'Nível 10 em 1 matéria',check: d => Object.values(d.subjectProgress).some(s => s.level >= 10), xp:300 },
    { id:'equilibrado',     name:'Equilibrado',      icon:'⚖️', desc:'Nível 5+ em todas',   check: d => SUBJECTS.every(s => (d.subjectProgress[s]||{}).level >= 5), xp:500 },
    { id:'arcano',          name:'Arcano',           icon:'🏆', desc:'Nível 20 em 1 matéria',check: d => Object.values(d.subjectProgress).some(s => s.level >= 20), xp:1000 }
  ];

  // ── Quest definitions for store tiers ──
  const TIER_QUESTS = [
    { tier: 0, level: 1,  quest: null, name: 'Aberto' },
    { tier: 1, level: 5,  quest: { id:'dedicado', name:'Dedicado', desc:'5 quizzes perfeitos', check: d => d.stats.quizzesPerfeitos >= 5 }},
    { tier: 2, level: 10, quest: { id:'mestre_q', name:'Mestre', desc:'Ler 50 artigos', check: d => d.stats.artigosLidos >= 50 }},
    { tier: 3, level: 15, quest: { id:'sabio_q', name:'Sábio', desc:'Nv.10 em 3 matérias', check: d => Object.values(d.subjectProgress).filter(s => s.level >= 10).length >= 3 }},
    { tier: 4, level: 20, quest: { id:'arcano_q', name:'Arcano', desc:'Nv.15 em 6 matérias', check: d => Object.values(d.subjectProgress).filter(s => s.level >= 15).length >= 6 }}
  ];

  // ═══════════════════════════════════════
  //  Core Functions
  // ═══════════════════════════════════════

  function createDefaultData() {
    const sp = {};
    SUBJECTS.forEach(s => { sp[s] = { xp: 0, level: 1, artigosLidos: 0, quizzesPerfeitos: 0 }; });
    return {
      version: 1,
      nome: 'Estudante',
      avatar: 'default',
      fichas: 0,          // 🟡
      cristais: 0,        // 💎
      essencias: 0,       // ✨
      streak: 0,
      lastAccessDate: null,
      subjectProgress: sp,
      stats: { artigosLidos:0, quizzesPerfeitos:0, quizzesTotais:0, desafiosDiarios:0, desafiosSemanais:0, desafiosMensais:0 },
      achievements: [],
      inventory: [],
      challenges: { daily: { date:null, tasks:[false,false,false], bonus:false }, weekly: { week:null, progress:[0,0,0], bonus:false }, monthly: { month:null, progress:[0,0,0], bonus:false } },
      completedQuests: [],
      activity: []
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch(e) { console.warn('RPG load error', e); }
    return createDefaultData();
  }

  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch(e) { console.warn('RPG save error', e); }
  }

  // ── Level Calculation ──
  function calcLevel(xp) {
    let level = 1;
    let accum = 0;
    for (let i = 2; i <= 20; i++) {
      accum += XP_TABLE[i];
      if (xp >= accum) level = i; else break;
    }
    return level;
  }

  function xpForNextLevel(level) {
    if (level >= 20) return 0;
    return XP_TABLE[level + 1];
  }

  function xpAccumulated(level) {
    let total = 0;
    for (let i = 2; i <= level; i++) total += XP_TABLE[i];
    return total;
  }

  function xpProgress(xp, level) {
    if (level >= 20) return { current: 0, needed: 0, percent: 100 };
    const base = xpAccumulated(level);
    const needed = XP_TABLE[level + 1];
    const current = xp - base;
    return { current, needed, percent: needed > 0 ? Math.floor((current / needed) * 100) : 100 };
  }

  // ── Streak ──
  function streakMultiplier(days) {
    if (days <= 0) return 1.0;
    if (days <= 7) return 1.0 + (days * 0.05);
    if (days <= 14) return 1.35 + ((days - 7) * 0.03);
    if (days <= 30) return 1.56 + ((days - 14) * 0.02);
    return 2.0;
  }

  function updateStreak(data) {
    const today = new Date().toISOString().split('T')[0];
    if (data.lastAccessDate === today) return data;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (data.lastAccessDate === yesterday) {
      data.streak += 1;
    } else if (data.lastAccessDate !== today) {
      data.streak = 1;
    }
    data.lastAccessDate = today;
    return data;
  }

  // ── General Level (average) ──
  function getGeneralLevel(data) {
    const levels = SUBJECTS.map(s => (data.subjectProgress[s] || {}).level || 1);
    return Math.floor(levels.reduce((a, b) => a + b, 0) / levels.length);
  }

  // ── Competencies ──
  function getCompetencies(data) {
    const result = {};
    for (const [key, comp] of Object.entries(COMPETENCIES)) {
      if (key === 'disciplina') {
        const streakBonus = Math.min(10, Math.floor(data.streak / 3));
        result[key] = { ...comp, value: Math.floor((getGeneralLevel(data) + streakBonus) / 2) };
      } else {
        const avg = comp.subjects.reduce((sum, s) => sum + ((data.subjectProgress[s] || {}).level || 1), 0) / comp.subjects.length;
        result[key] = { ...comp, value: Math.floor(avg) };
      }
    }
    return result;
  }

  // ═══════════════════════════════════════
  //  Actions
  // ═══════════════════════════════════════

  function addXP(data, subject, amount, reason) {
    const multi = streakMultiplier(data.streak);
    const finalXP = Math.floor(amount * multi);
    if (!data.subjectProgress[subject]) return data;

    data.subjectProgress[subject].xp += finalXP;
    const newLevel = calcLevel(data.subjectProgress[subject].xp);
    const oldLevel = data.subjectProgress[subject].level;
    data.subjectProgress[subject].level = newLevel;

    data.activity.unshift({ type:'xp', subject, amount:finalXP, reason, time: Date.now(), levelUp: newLevel > oldLevel });
    if (data.activity.length > 50) data.activity = data.activity.slice(0, 50);

    return data;
  }

  function registerLeitura(data, subject, articleSlug) {
    data = updateStreak(data);
    data.subjectProgress[subject].artigosLidos++;
    data.stats.artigosLidos++;
    data = addXP(data, subject, XP_REWARDS.leitura, 'Leitura completa');
    data.fichas += FICHA_REWARDS.leitura;
    data = updateChallengeProgress(data, 'leitura', subject);
    data = checkAchievements(data);
    save(data);
    return data;
  }

  function registerQuiz(data, subject, score, total) {
    data = updateStreak(data);
    const perfeito = score === total;
    data.stats.quizzesTotais++;

    if (perfeito) {
      data.subjectProgress[subject].quizzesPerfeitos++;
      data.stats.quizzesPerfeitos++;
      data = addXP(data, subject, XP_REWARDS.quiz_perfeito, 'Quiz perfeito');
      data.fichas += FICHA_REWARDS.quiz_perfeito;
    } else {
      data = addXP(data, subject, XP_REWARDS.quiz_parcial, 'Quiz parcial');
      data.fichas += FICHA_REWARDS.quiz_parcial;
    }

    data = updateChallengeProgress(data, 'quiz', subject, perfeito);
    data = checkAchievements(data);
    save(data);
    return data;
  }

  function registerDailyLogin(data) {
    data = updateStreak(data);
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = data._lastLoginBonus;
    if (lastLogin !== today) {
      data = addXP(data, SUBJECTS[0], XP_REWARDS.primeiro_acesso, 'Bônus diário');
      data.fichas += FICHA_REWARDS.primeiro_acesso;
      data._lastLoginBonus = today;
    }
    data = resetChallengesIfNeeded(data);
    save(data);
    return data;
  }

  // ═══════════════════════════════════════
  //  Challenge System
  // ═══════════════════════════════════════

  function resetChallengesIfNeeded(data) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Daily reset
    if (data.challenges.daily.date !== today) {
      data.challenges.daily = { date: today, tasks: [false, false, false], bonus: false };
      data._dailySubjects = [];
    }

    // Weekly reset (Monday)
    const weekNum = getWeekNumber(now);
    if (data.challenges.weekly.week !== weekNum) {
      data.challenges.weekly = { week: weekNum, progress: [0, 0, 0], bonus: false };
    }

    // Monthly reset
    const monthKey = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
    if (data.challenges.monthly.month !== monthKey) {
      data.challenges.monthly = { month: monthKey, progress: [0, 0, 0], bonus: false };
    }
    return data;
  }

  function getWeekNumber(d) {
    const start = new Date(d.getFullYear(), 0, 1);
    return d.getFullYear() + '-W' + Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
  }

  function updateChallengeProgress(data, type, subject, perfeito) {
    // Daily: [0]=ler artigo, [1]=quiz perfeito, [2]=3 matérias
    if (type === 'leitura') {
      data.challenges.daily.tasks[0] = true;
      if (!data._dailySubjects) data._dailySubjects = [];
      if (!data._dailySubjects.includes(subject)) data._dailySubjects.push(subject);
      if (data._dailySubjects.length >= 3) data.challenges.daily.tasks[2] = true;

      data.challenges.weekly.progress[0] = (data.challenges.weekly.progress[0] || 0) + 1;
      data.challenges.monthly.progress[0] = (data.challenges.monthly.progress[0] || 0) + 1;
    }
    if (type === 'quiz' && perfeito) {
      data.challenges.daily.tasks[1] = true;
      data.challenges.weekly.progress[2] = (data.challenges.weekly.progress[2] || 0) + 1;
    }

    // Streak tracking for weekly/monthly
    data.challenges.weekly.progress[1] = data.streak;
    data.challenges.monthly.progress[2] = data.streak;

    // Monthly: subir nível (checked elsewhere)

    // Check daily bonus
    if (data.challenges.daily.tasks.every(t => t) && !data.challenges.daily.bonus) {
      data.challenges.daily.bonus = true;
      data.fichas += 20;
      data.stats.desafiosDiarios++;
      data.activity.unshift({ type:'challenge', reason:'Bônus diário completo!', amount:100, time:Date.now() });
    }

    // Check weekly bonus
    const wd = data.challenges.weekly.progress;
    if (wd[0] >= 10 && wd[1] >= 7 && wd[2] >= 5 && !data.challenges.weekly.bonus) {
      data.challenges.weekly.bonus = true;
      data.fichas += 150;
      data.stats.desafiosSemanais++;
      data.inventory.push({ type:'chest', chest:'prata', time:Date.now() });
      data.activity.unshift({ type:'challenge', reason:'Bônus semanal + Baú de Prata!', amount:500, time:Date.now() });
    }

    // Check monthly bonus
    const md = data.challenges.monthly.progress;
    if (md[0] >= 30 && md[2] >= 20 && !data.challenges.monthly.bonus) {
      data.challenges.monthly.bonus = true;
      data.fichas += 500;
      data.stats.desafiosMensais++;
      data.inventory.push({ type:'chest', chest:'ouro', time:Date.now() });
      data.activity.unshift({ type:'challenge', reason:'Bônus mensal + Baú de Ouro!', amount:2000, time:Date.now() });
    }

    return data;
  }

  // ═══════════════════════════════════════
  //  Chest System
  // ═══════════════════════════════════════

  function openChest(data, chestType) {
    const chest = CHESTS[chestType];
    if (!chest) return { data, drop: null };
    if (chestType !== 'reward' && data.fichas < chest.cost) return { data, drop: null };

    if (chestType !== 'reward') data.fichas -= chest.cost;

    // Weighted random
    const roll = Math.random() * 100;
    let cumulative = 0;
    let selectedDrop = chest.drops[0];
    for (const drop of chest.drops) {
      cumulative += drop.weight;
      if (roll <= cumulative) { selectedDrop = drop; break; }
    }

    // Pick random item from rarity
    const pool = COSMETICS[selectedDrop.rarity] || COSMETICS.comum;
    const itemName = pool[Math.floor(Math.random() * pool.length)];

    const drop = {
      item: itemName,
      rarity: selectedDrop.rarity,
      essence: selectedDrop.essence,
      time: Date.now()
    };

    data.essencias += drop.essence;
    data.inventory.push({ type:'cosmetic', name:itemName, rarity:selectedDrop.rarity, time:Date.now() });
    data.activity.unshift({ type:'chest', chest:chest.name, item:itemName, rarity:selectedDrop.rarity, essence:drop.essence, time:Date.now() });

    save(data);
    return { data, drop };
  }

  // ═══════════════════════════════════════
  //  Store Visibility
  // ═══════════════════════════════════════

  function getUnlockedTier(data) {
    const generalLevel = getGeneralLevel(data);
    let maxTier = 0;
    for (const tq of TIER_QUESTS) {
      if (generalLevel >= tq.level) {
        if (!tq.quest || tq.quest.check(data)) {
          maxTier = tq.tier;
        }
      }
    }
    return maxTier;
  }

  function getVisibleStoreItems(data) {
    const tier = getUnlockedTier(data);
    // Items only APPEAR when tier is reached — no locks shown
    return { tier, items: getItemsForTier(tier) };
  }

  function getItemsForTier(tier) {
    const items = [];
    if (tier >= 0) items.push(...[
      { name:'Avatar Básico 1', cost:50, currency:'fichas', type:'cosmético' },
      { name:'Cor de Perfil', cost:30, currency:'fichas', type:'cosmético' }
    ]);
    if (tier >= 1) items.push(...[
      { name:'Avatar Premium', cost:150, currency:'fichas', type:'cosmético' },
      { name:'Moldura Dragão', cost:200, currency:'fichas', type:'cosmético' },
      { name:'Título Personalizado', cost:300, currency:'fichas', type:'cosmético' }
    ]);
    if (tier >= 2) items.push(...[
      { name:'Tema de Interface', cost:400, currency:'fichas', type:'cosmético' },
      { name:'Gift Card R$ 10', cost:3000, currency:'fichas', costCristais:1000, type:'resgate' }
    ]);
    if (tier >= 3) items.push(...[
      { name:'Badge Animado', cost:800, currency:'fichas', type:'cosmético' },
      { name:'Gift Card R$ 25', cost:6000, currency:'fichas', costCristais:2500, type:'resgate' }
    ]);
    if (tier >= 4) items.push(...[
      { name:'Gift Card R$ 50', cost:10000, currency:'fichas', costCristais:5000, type:'resgate' },
      { name:'Título Lendário', cost:5000, currency:'fichas', type:'cosmético' }
    ]);
    return items;
  }

  // ═══════════════════════════════════════
  //  Achievements
  // ═══════════════════════════════════════

  function checkAchievements(data) {
    for (const ach of ACHIEVEMENTS) {
      if (!data.achievements.includes(ach.id) && ach.check(data)) {
        data.achievements.push(ach.id);
        data.fichas += Math.floor(ach.xp / 10);
        data.activity.unshift({ type:'achievement', name:ach.name, icon:ach.icon, xp:ach.xp, time:Date.now() });
      }
    }
    return data;
  }

  // ═══════════════════════════════════════
  //  Essence Store (unique items)
  // ═══════════════════════════════════════

  const ESSENCE_ITEMS = [
    { id:'borda_fogo', name:'Borda "Fogo Ancestral"', cost:20, type:'borda' },
    { id:'titulo_escolhido', name:'Título "Escolhido pelo Beholder"', cost:30, type:'titulo' },
    { id:'avatar_guardiao', name:'Avatar "Guardião do Saber"', cost:50, type:'avatar' },
    { id:'moldura_constelacao', name:'Moldura "Constelação"', cost:40, type:'moldura' },
    { id:'trail_runas', name:'Trail "Runas Antigas"', cost:60, type:'efeito' },
    { id:'card_dragao', name:'Card "Dragão do Conhecimento"', cost:100, type:'colecionavel' }
  ];

  function buyEssenceItem(data, itemId) {
    const item = ESSENCE_ITEMS.find(i => i.id === itemId);
    if (!item || data.essencias < item.cost) return { data, success: false };
    if (data.inventory.some(i => i.essenceId === itemId)) return { data, success: false };
    data.essencias -= item.cost;
    data.inventory.push({ type:'essence_item', essenceId:itemId, name:item.name, rarity:'unico', time:Date.now() });
    data.activity.unshift({ type:'purchase', name:item.name, cost:item.cost, currency:'essencias', time:Date.now() });
    save(data);
    return { data, success: true };
  }

  // ═══════════════════════════════════════
  //  Public API
  // ═══════════════════════════════════════

  return {
    load, save, createDefaultData,
    // Actions
    registerLeitura, registerQuiz, registerDailyLogin,
    openChest, buyEssenceItem,
    // Getters
    getGeneralLevel, getCompetencies, calcLevel, xpProgress, xpForNextLevel,
    streakMultiplier, getUnlockedTier, getVisibleStoreItems,
    // Data
    SUBJECTS, SUBJECT_NAMES, LEVEL_TITLES, ACHIEVEMENTS, ESSENCE_ITEMS,
    CHESTS, COMPETENCIES, TIER_QUESTS, XP_TABLE,
    DIFFICULTY_MULTIPLIERS, getScaledRewards,
    // Challenge helpers
    resetChallengesIfNeeded, updateStreak
  };
})();
