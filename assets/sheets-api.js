/* ============================================
   BEHOLDER ACADEMY — Sheets API Client v1.0
   Camada de comunicação com Google Sheets Backend
   
   NOTA: Este módulo NÃO contém regras de negócio.
   Apenas transporta dados entre frontend e backend.
   ============================================ */

const SheetsAPI = (function() {
  'use strict';

  // ═══ CONFIGURAÇÃO ═══
  // URL preenchida após deploy do Google Apps Script
  // Formato: https://script.google.com/macros/s/DEPLOY_ID/exec
  const STORAGE_KEY_URL = 'ba_api_url';
  const API_KEY = 'BA_SIM_2026_8f3k';

  let _baseUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  let _isOnline = false;
  let _lastError = null;

  // ═══ CORE HTTP ═══

  async function _get(action, params) {
    if (!_baseUrl) {
      _isOnline = false;
      return { success: false, error: 'API não configurada', offline: true };
    }

    const url = new URL(_baseUrl);
    url.searchParams.set('key', API_KEY);
    url.searchParams.set('action', action);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, v);
      }
    }

    try {
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      _isOnline = true;
      _lastError = null;
      return data;
    } catch (e) {
      console.warn('[SheetsAPI] GET falhou:', action, e.message);
      _isOnline = false;
      _lastError = e.message;
      return { success: false, error: 'Sem conexão com o servidor', offline: true };
    }
  }

  async function _post(action, body) {
    if (!_baseUrl) {
      _isOnline = false;
      return { success: false, error: 'API não configurada', offline: true };
    }

    try {
      const res = await fetch(_baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Apps Script requer text/plain para CORS
        body: JSON.stringify({ ...body, key: API_KEY, action: action })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      _isOnline = true;
      _lastError = null;
      return data;
    } catch (e) {
      console.warn('[SheetsAPI] POST falhou:', action, e.message);
      _isOnline = false;
      _lastError = e.message;
      return { success: false, error: 'Sem conexão com o servidor', offline: true };
    }
  }

  // ═══ AUTH ═══

  async function login(nome, senha) {
    return _get('login', { nome: nome, senha: senha });
  }

  async function register(nome, tipo, senha, vinculoAlunoNome) {
    return _post('register', {
      nome: nome,
      tipo: tipo,
      senha: senha,
      vinculoAlunoNome: vinculoAlunoNome || ''
    });
  }

  async function getUser(userId) {
    return _get('getUser', { userId: userId });
  }

  // ═══ PROGRESSO ═══

  async function getProgress(userId) {
    return _get('getProgress', { userId: userId });
  }

  async function saveProgress(userId, rpgData) {
    return _post('saveProgress', {
      userId: userId,
      rpgData: typeof rpgData === 'string' ? rpgData : JSON.stringify(rpgData)
    });
  }

  // ═══ TAREFAS ═══

  async function getTarefas(userId) {
    return _get('getTarefas', { userId: userId });
  }

  async function createTarefa(responsavelId, alunoId, alunoNome, titulo, recompensa) {
    return _post('createTarefa', {
      responsavelId: responsavelId,
      alunoId: alunoId,
      alunoNome: alunoNome,
      titulo: titulo,
      recompensa: recompensa
    });
  }

  async function updateTarefa(tarefaId, status) {
    return _post('updateTarefa', { tarefaId: tarefaId, status: status });
  }

  async function deleteTarefa(tarefaId) {
    return _post('deleteTarefa', { tarefaId: tarefaId });
  }

  // ═══ TRANSAÇÕES ═══

  async function deposit(userId, valor, descricao) {
    return _post('deposit', {
      userId: userId,
      valor: valor,
      descricao: descricao || ''
    });
  }

  async function purchase(userId, produtoId, valor, descricao) {
    return _post('purchase', {
      userId: userId,
      produtoId: produtoId,
      valor: valor,
      descricao: descricao || ''
    });
  }

  async function getTransacoes(userId) {
    return _get('getTransacoes', { userId: userId });
  }

  // ═══ VÍNCULO ═══

  async function linkChild(responsavelId, codigo) {
    return _post('linkChild', { responsavelId: responsavelId, codigo: codigo });
  }

  // ═══ NOVIDADES: BOLETIM E REDACAO ═══

  async function saveBoletim(alunoId, boletimData) {
    return _post('saveBoletim', {
      alunoId: alunoId,
      boletimData: boletimData
    });
  }

  async function getBoletim(alunoId) {
    return _get('getBoletim', { alunoId: alunoId });
  }

  async function saveRedacao(alunoId, redacaoData) {
    return _post('saveRedacao', {
      alunoId: alunoId,
      redacaoData: redacaoData
    });
  }

  async function evaluateRedacao(alunoId, data) {
    return _post('evaluateRedacao', {
      alunoId: alunoId,
      text: data.text,
      erasures: data.erasures,
      theme: data.theme
    });
  }

  // ═══ ESTOQUE ═══

  async function getEstoque() {
    return _get('getEstoque');
  }

  async function updateEstoque(produtoId, changes) {
    return _post('updateEstoque', { produtoId: produtoId, ...changes });
  }

  // ═══ ATIVIDADES ═══

  async function logActivity(userId, tipo, dados) {
    return _post('logActivity', {
      userId: userId,
      tipo: tipo,
      dados: dados || ''
    });
  }

  // ═══ SYNC HELPERS ═══

  /**
   * Sincroniza progresso RPG da nuvem para o local.
   * Retorna os dados mais recentes (cloud ou local).
   */
  async function syncProgressFromCloud(userId) {
    if (!userId) return { synced: false, source: 'local' };

    const result = await getProgress(userId);
    if (result.success && result.data) {
      try {
        var cloudData = JSON.parse(result.data);
        var localData = RPGEngine.load();
        
        // Usar o que for mais recente
        var cloudTime = result.updatedAt ? new Date(result.updatedAt).getTime() : 0;
        var localTime = localData._lastSyncTime || 0;
        
        if (cloudTime > localTime) {
          cloudData._lastSyncTime = Date.now();
          RPGEngine.save(cloudData);
          return { synced: true, source: 'cloud', data: cloudData };
        }
        return { synced: true, source: 'local', data: localData };
      } catch(e) {
        console.warn('[SheetsAPI] Erro ao parsear dados da nuvem:', e);
        return { synced: false, source: 'local', data: RPGEngine.load() };
      }
    }
    return { synced: false, source: 'local' };
  }

  /**
   * Salva progresso localmente E na nuvem (fire-and-forget).
   */
  async function syncProgressToCloud(userId, rpgData) {
    if (!userId) return;
    rpgData._lastSyncTime = Date.now();
    RPGEngine.save(rpgData);
    // Fire-and-forget — não bloqueia a UI
    saveProgress(userId, rpgData).catch(function(e) {
      console.warn('[SheetsAPI] Sync para nuvem falhou:', e);
    });
  }

  // ═══ CONFIGURAÇÃO & STATUS ═══

  function setApiUrl(url) {
    _baseUrl = url;
    localStorage.setItem(STORAGE_KEY_URL, url);
  }

  function getApiUrl() {
    return _baseUrl;
  }

  function isConfigured() {
    return !!_baseUrl;
  }

  async function ping() {
    return _get('ping');
  }

  function isOnline() {
    return _isOnline;
  }

  function getLastError() {
    return _lastError;
  }

  /**
   * Retorna o userId do usuário logado (do localStorage)
   */
  function getCurrentUserId() {
    try {
      var userData = localStorage.getItem('beholder_user');
      if (userData) {
        var user = JSON.parse(userData);
        return user.id || null;
      }
    } catch(e) {}
    return null;
  }

  /**
   * Retorna se o usuário está no modo online (tem ID da nuvem)
   */
  function isUserOnline() {
    try {
      var userData = localStorage.getItem('beholder_user');
      if (userData) {
        var user = JSON.parse(userData);
        return !!(user.id && user.online);
      }
    } catch(e) {}
    return false;
  }

  // ═══ UI HELPERS ═══

  /**
   * Mostra/esconde indicador de status da API na navbar
   */
  function renderStatusBadge() {
    var existing = document.getElementById('api-status-badge');
    if (!existing) {
      existing = document.createElement('span');
      existing.id = 'api-status-badge';
      existing.style.cssText = 'font-size:0.7rem; padding:2px 8px; border-radius:12px; margin-left:8px; font-weight:600;';
      var nav = document.querySelector('.navbar__nav');
      if (nav) nav.insertBefore(existing, nav.firstChild);
    }

    if (!isConfigured()) {
      existing.textContent = '⚙️ API não configurada';
      existing.style.background = 'rgba(251,191,36,0.15)';
      existing.style.color = '#FBBF24';
    } else if (_isOnline) {
      existing.textContent = '🟢 Online';
      existing.style.background = 'rgba(52,211,153,0.15)';
      existing.style.color = '#34D399';
    } else {
      existing.textContent = '🔴 Offline';
      existing.style.background = 'rgba(239,68,68,0.15)';
      existing.style.color = '#EF4444';
    }
  }

  // ═══ PUBLIC API ═══

  return {
    // Auth
    login: login,
    register: register,
    getUser: getUser,
    // Progress
    getProgress: getProgress,
    saveProgress: saveProgress,
    // Sync helpers
    syncProgressFromCloud: syncProgressFromCloud,
    syncProgressToCloud: syncProgressToCloud,
    // Tarefas
    getTarefas: getTarefas,
    createTarefa: createTarefa,
    updateTarefa: updateTarefa,
    deleteTarefa: deleteTarefa,
    // Transações
    deposit: deposit,
    purchase: purchase,
    getTransacoes: getTransacoes,
    // Vínculo
    linkChild,
    // Estoque
    getEstoque,
    updateEstoque,
    // Atividades
    logActivity: logActivity,
    // Boletim e Redação
    saveBoletim,
    getBoletim,
    saveRedacao,
    evaluateRedacao,
    // Config & Status
    setApiUrl: setApiUrl,
    getApiUrl: getApiUrl,
    isConfigured: isConfigured,
    ping: ping,
    isOnline: isOnline,
    getLastError: getLastError,
    // Auth context helpers
    getCurrentUserId,
    isUserOnline,
    renderStatusBadge: renderStatusBadge
  };
})();
