/**
 * ══════════════════════════════════════════════
 * BEHOLDER ACADEMY — Google Sheets Backend API
 * Simulação de backend para MVP
 * ══════════════════════════════════════════════
 * 
 * IMPORTANTE: Este script NÃO contém regras de negócio,
 * precificação ou cálculos internos.
 * Toda lógica de negócio permanece no frontend.
 * 
 * DEPLOY: Extensions > Apps Script > Deploy > Web App
 *   - Execute as: Me
 *   - Who has access: Anyone
 * 
 * SETUP: Após colar este código, rode a função setup()
 *   no menu Run > setup
 */

// ═══ CONFIGURAÇÃO ═══
const CONFIG = {
  API_KEY: 'BA_SIM_2026_8f3k',
  SPREADSHEET_ID: '1w_pGfjjJmtqHYQUeS_S6KC84JPCVcfUiCmqwFL5QofY',
  GEMINI_API_KEY: 'INSIRA_SUA_CHAVE_AQUI' // Cole sua chave gerada no Google AI Studio aqui
};

// ═══════════════════════════════════════
//  SETUP — Rodar uma vez para criar abas
// ═══════════════════════════════════════

function setup() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  const sheets = {
    'Usuarios': ['id', 'nome', 'tipo', 'senha', 'vinculo_codigo', 'vinculo_aluno_id', 'vinculo_aluno_nome', 'criado_em', 'ultimo_acesso'],
    'Progresso': ['user_id', 'dados_rpg', 'atualizado_em'],
    'Tarefas': ['id', 'responsavel_id', 'aluno_id', 'aluno_nome', 'titulo', 'recompensa', 'status', 'criado_em', 'concluido_em'],
    'Transacoes': ['id', 'user_id', 'tipo', 'valor', 'descricao', 'criado_em'],
    'Estoque': ['produto_id', 'categoria', 'titulo', 'preco_cristais', 'estoque', 'ativo', 'criado_em'],
    'Atividades': ['id', 'user_id', 'tipo', 'dados', 'criado_em'],
    'Config': ['chave', 'valor']
  };
  
  for (const [name, headers] of Object.entries(sheets)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
    } else {
      // Clear existing content
      sheet.clear();
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#7B2FF7')
      .setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    // Auto-resize columns
    for (let c = 1; c <= headers.length; c++) {
      sheet.setColumnWidth(c, 150);
    }
  }
  
  // Set API key in Config
  const configSheet = ss.getSheetByName('Config');
  configSheet.appendRow(['api_key', CONFIG.API_KEY]);
  configSheet.appendRow(['versao', '1.0']);
  configSheet.appendRow(['projeto', 'Beholder Academy']);
  
  // Remove default sheet if exists
  const defaults = ['Sheet1', 'Página1', 'Planilha1'];
  for (const name of defaults) {
    const s = ss.getSheetByName(name);
    if (s && ss.getSheets().length > 1) {
      try { ss.deleteSheet(s); } catch(e) {}
    }
  }
  
  Logger.log('✅ Setup completo! Abas criadas com sucesso.');
  SpreadsheetApp.getUi().alert('✅ Setup completo!\n\nAbas criadas:\n' + Object.keys(sheets).join(', '));
}

// ═══════════════════════════════════════
//  HTTP HANDLERS
// ═══════════════════════════════════════

function doGet(e) {
  try {
    const params = e.parameter || {};
    if (params.key !== CONFIG.API_KEY) {
      return jsonResponse({ success: false, error: 'Não autorizado' });
    }
    
    switch (params.action) {
      case 'login':         return handleLogin(params);
      case 'getUser':       return handleGetUser(params);
      case 'getProgress':   return handleGetProgress(params);
      case 'getTarefas':    return handleGetTarefas(params);
      case 'getTransacoes': return handleGetTransacoes(params);
      case 'getEstoque':    return handleGetEstoque(params);
      case 'ping':          return jsonResponse({ success: true, message: 'Beholder Academy API ativa', timestamp: new Date().toISOString() });
      default:              return jsonResponse({ success: false, error: 'Ação desconhecida: ' + params.action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.key !== CONFIG.API_KEY) {
      return jsonResponse({ success: false, error: 'Não autorizado' });
    }
    
    switch (data.action) {
      case 'register':       return handleRegister(data);
      case 'saveProgress':   return handleSaveProgress(data);
      case 'createTarefa':   return handleCreateTarefa(data);
      case 'updateTarefa':   return handleUpdateTarefa(data);
      case 'deleteTarefa':   return handleDeleteTarefa(data);
      case 'deposit':        return handleDeposit(data);
      case 'purchase':       return handlePurchase(data);
      case 'linkChild':      return handleLinkChild(data);
      case 'updateEstoque':  return handleUpdateEstoque(data);
      case 'logActivity':    return handleLogActivity(data);
      case 'saveBoletim':    return handleSaveBoletim(data);
      case 'saveRedacao':    return handleSaveRedacao(data);
      case 'evaluateRedacao': return handleEvaluateRedacao(data);
      case 'getBoletim':     return handleGetBoletim(data);
      default:               return jsonResponse({ success: false, error: 'Ação desconhecida: ' + data.action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ═══════════════════════════════════════
//  AUTH HANDLERS
// ═══════════════════════════════════════

function handleLogin(params) {
  const sheet = getSheet('Usuarios');
  const data = sheet.getDataRange().getValues();
  const searchName = (params.nome || '').toString().trim().toLowerCase();
  
  for (let i = 1; i < data.length; i++) {
    const rowName = (data[i][1] || '').toString().trim().toLowerCase();
    const rowSenha = (data[i][3] || '').toString();
    const inputSenha = (params.senha || '').toString();
    
    if (rowName === searchName && rowSenha === inputSenha) {
      // Atualizar último acesso
      sheet.getRange(i + 1, 9).setValue(new Date().toISOString());
      
      return jsonResponse({
        success: true,
        user: rowToUser(data[i])
      });
    }
  }
  
  return jsonResponse({ success: false, error: 'Nome ou senha incorretos' });
}

function handleRegister(body) {
  const sheet = getSheet('Usuarios');
  const data = sheet.getDataRange().getValues();
  
  // Verificar se nome + tipo já existe
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === body.nome && data[i][2] === body.tipo) {
      return jsonResponse({ success: false, error: 'Já existe um(a) ' + body.tipo + ' com o nome "' + body.nome + '"' });
    }
  }
  
  const id = generateId();
  const vinculoCodigo = body.tipo === 'aluno' ? generateVinculoCode() : '';
  const now = new Date().toISOString();
  
  sheet.appendRow([
    id,
    body.nome,
    body.tipo,
    body.senha,
    vinculoCodigo,
    '',                          // vinculo_aluno_id
    body.vinculoAlunoNome || '', // vinculo_aluno_nome
    now,
    now
  ]);
  
  // Se aluno, criar linha de progresso vazia
  if (body.tipo === 'aluno') {
    getSheet('Progresso').appendRow([id, '', now]);
  }
  
  return jsonResponse({
    success: true,
    user: {
      id: id,
      nome: body.nome,
      tipo: body.tipo,
      vinculoCodigo: vinculoCodigo,
      vinculoAlunoId: '',
      vinculoAlunoNome: body.vinculoAlunoNome || ''
    }
  });
}

function handleGetUser(params) {
  const sheet = getSheet('Usuarios');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.userId) {
      return jsonResponse({ success: true, user: rowToUser(data[i]) });
    }
  }
  
  return jsonResponse({ success: false, error: 'Usuário não encontrado' });
}

// ═══════════════════════════════════════
//  BOLETIM E REDAÇÃO (NOVA ESTRUTURA)
// ═══════════════════════════════════════

function ensureBoletimSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Boletins');
  if (!sheet) {
    sheet = ss.insertSheet('Boletins');
    sheet.appendRow(['Boletim_ID', 'Aluno_ID', 'Escola', 'Media_Aprovacao', 'Matematica', 'Portugues', 'Ciencias', 'Historia', 'Geografia', 'Data_Atualizacao']);
    sheet.getRange("A1:J1").setFontWeight("bold").setBackground("#D3D3D3");
  }
  return sheet;
}

function handleSaveBoletim(params) {
  const sheet = ensureBoletimSheet();
  const data = sheet.getDataRange().getValues();
  const alunoId = params.alunoId;
  const boletim = params.boletimData;
  
  const mat = JSON.stringify(boletim.notas['Matemática'] || []);
  const port = JSON.stringify(boletim.notas['Português'] || []);
  const cie = JSON.stringify(boletim.notas['Ciências'] || []);
  const hist = JSON.stringify(boletim.notas['História'] || []);
  const geo = JSON.stringify(boletim.notas['Geografia'] || []);
  const now = new Date().toISOString();

  // Buscar se já existe boletim para esse aluno
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === alunoId) {
      sheet.getRange(i + 1, 3).setValue(boletim.escola || '');
      sheet.getRange(i + 1, 4).setValue(boletim.media || 7.0);
      sheet.getRange(i + 1, 5).setValue(mat);
      sheet.getRange(i + 1, 6).setValue(port);
      sheet.getRange(i + 1, 7).setValue(cie);
      sheet.getRange(i + 1, 8).setValue(hist);
      sheet.getRange(i + 1, 9).setValue(geo);
      sheet.getRange(i + 1, 10).setValue(now);
      return jsonResponse({ success: true });
    }
  }

  // Se não existir, criar novo
  sheet.appendRow([generateId(), alunoId, boletim.escola || '', boletim.media || 7.0, mat, port, cie, hist, geo, now]);
  return jsonResponse({ success: true });
}

function handleGetBoletim(params) {
  const sheet = ensureBoletimSheet();
  const data = sheet.getDataRange().getValues();
  const alunoId = params.alunoId;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === alunoId) {
       try {
         const result = {
           escola: data[i][2],
           media: parseFloat(data[i][3]),
           notas: {
             'Matemática': JSON.parse(data[i][4] || '[null,null,null,null]'),
             'Português': JSON.parse(data[i][5] || '[null,null,null,null]'),
             'Ciências': JSON.parse(data[i][6] || '[null,null,null,null]'),
             'História': JSON.parse(data[i][7] || '[null,null,null,null]'),
             'Geografia': JSON.parse(data[i][8] || '[null,null,null,null]')
           }
         };
         return jsonResponse({ success: true, boletim: result });
       } catch(e) {
         return jsonResponse({ success: false, error: 'Erro ao analisar JSON do boletim.' });
       }
    }
  }
  return jsonResponse({ success: true, boletim: null });
}

function ensureRedacoesSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName('Redacoes');
  if (!sheet) {
    sheet = ss.insertSheet('Redacoes');
    sheet.appendRow(['ID', 'Aluno_ID', 'Titulo', 'Texto', 'Caracteres', 'Nota', 'Data_Envio']);
    sheet.getRange("A1:G1").setFontWeight("bold").setBackground("#D3D3D3");
  }
  return sheet;
}

function handleSaveRedacao(params) {
  const sheet = ensureRedacoesSheet();
  const red = params.redacaoData;
  sheet.appendRow([
    red.id || generateId(),
    params.alunoId,
    red.title || '',
    red.text || '',
    red.chars || 0,
    red.grade || '',
    red.date || new Date().toISOString()
  ]);
  return jsonResponse({ success: true });
}

function handleEvaluateRedacao(params) {
  if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'INSIRA_SUA_CHAVE_AQUI') {
    return jsonResponse({ success: false, error: 'Chave do Gemini (API KEY) não configurada no Code.gs.' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
  
  const systemPrompt = `Atue como um corretor rigoroso do ENEM.
O tema da redação é: "${params.theme}".
O aluno apagou caracteres (Backspace/Delete) ${params.erasures} vezes durante a escrita, o que denota seu nível de hesitação.
Avalie o entendimento cognitivo, coerência, gramática e se o texto possui pontuação adequada.
Desconte pontos por hesitação excessiva e uso de gírias da internet.
Retorne APENAS UM JSON VÁLIDO no seguinte formato (sem formatação markdown, apenas o json limpo):
{
  "nota": <numero de 0.0 a 10.0>,
  "feedback": "<seu feedback analítico de 1 a 2 parágrafos justificando a nota>"
}`;

  const payload = {
    contents: [{
      parts: [
        { text: systemPrompt },
        { text: `Redação do aluno:\n\n${params.text}` }
      ]
    }],
    generationConfig: {
      temperature: 0.2
    }
  };

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() !== 200) {
      return jsonResponse({ success: false, error: 'Falha ao conectar com o Gemini: ' + response.getContentText() });
    }
    
    const data = JSON.parse(response.getContentText());
    const aiText = data.candidates[0].content.parts[0].text;
    
    // Parse o JSON que a IA retornou
    let resultJson;
    try {
      // Remove possiveis backticks de markdown que a IA coloque
      const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJson = JSON.parse(cleanJson);
    } catch(e) {
      return jsonResponse({ success: false, error: 'A IA retornou um formato inválido: ' + aiText });
    }
    
    // Salva a redacao analisada direto no Sheets para registro
    const sheet = ensureRedacoesSheet();
    sheet.appendRow([
      generateId(),
      params.alunoId,
      params.theme,
      params.text,
      params.text.length,
      resultJson.nota,
      new Date().toISOString()
    ]);
    
    return jsonResponse({ success: true, resultado: resultJson });
    
  } catch (err) {
    return jsonResponse({ success: false, error: 'Erro de processamento da IA: ' + err.toString() });
  }
}

// ═══════════════════════════════════════
//  PROGRESSO HANDLERS
// ═══════════════════════════════════════

function handleGetProgress(params) {
  const sheet = getSheet('Progresso');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === params.userId) {
      return jsonResponse({
        success: true,
        data: data[i][1] || null,
        updatedAt: data[i][2]
      });
    }
  }
  
  return jsonResponse({ success: true, data: null });
}

function handleSaveProgress(body) {
  const sheet = getSheet('Progresso');
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.userId) {
      sheet.getRange(i + 1, 2).setValue(body.rpgData);
      sheet.getRange(i + 1, 3).setValue(now);
      return jsonResponse({ success: true, updatedAt: now });
    }
  }
  
  // Criar nova linha
  sheet.appendRow([body.userId, body.rpgData, now]);
  return jsonResponse({ success: true, updatedAt: now });
}

// ═══════════════════════════════════════
//  TAREFAS HANDLERS
// ═══════════════════════════════════════

function handleGetTarefas(params) {
  const sheet = getSheet('Tarefas');
  const data = sheet.getDataRange().getValues();
  const tarefas = [];
  
  for (let i = 1; i < data.length; i++) {
    // Buscar por responsavel_id ou aluno_id
    if (data[i][1] === params.userId || data[i][2] === params.userId) {
      tarefas.push({
        id: data[i][0],
        responsavelId: data[i][1],
        alunoId: data[i][2],
        alunoNome: data[i][3],
        titulo: data[i][4],
        recompensa: data[i][5],
        status: data[i][6],
        criadoEm: data[i][7],
        concluidoEm: data[i][8]
      });
    }
  }
  
  return jsonResponse({ success: true, tarefas: tarefas });
}

function handleCreateTarefa(body) {
  const sheet = getSheet('Tarefas');
  const id = Date.now();
  const now = new Date().toISOString();
  
  sheet.appendRow([
    id, body.responsavelId, body.alunoId, body.alunoNome || '',
    body.titulo, body.recompensa, 'pending', now, ''
  ]);
  
  return jsonResponse({ success: true, id: id });
}

function handleUpdateTarefa(body) {
  const sheet = getSheet('Tarefas');
  const data = sheet.getDataRange().getValues();
  const now = new Date().toISOString();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.tarefaId)) {
      sheet.getRange(i + 1, 7).setValue(body.status);
      if (body.status === 'done') {
        sheet.getRange(i + 1, 9).setValue(now);
      }
      return jsonResponse({ success: true });
    }
  }
  
  return jsonResponse({ success: false, error: 'Tarefa não encontrada' });
}

function handleDeleteTarefa(body) {
  const sheet = getSheet('Tarefas');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(body.tarefaId)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ success: true });
    }
  }
  
  return jsonResponse({ success: false, error: 'Tarefa não encontrada' });
}

// ═══════════════════════════════════════
//  TRANSAÇÕES HANDLERS
// ═══════════════════════════════════════

function handleDeposit(body) {
  const sheet = getSheet('Transacoes');
  const id = Date.now();
  const now = new Date().toISOString();
  
  sheet.appendRow([id, body.userId, 'deposit', body.valor, body.descricao || 'Compra de cristais', now]);
  
  return jsonResponse({ success: true, id: id });
}

function handlePurchase(body) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const transSheet = ss.getSheetByName('Transacoes');
  const id = Date.now();
  const now = new Date().toISOString();
  
  transSheet.appendRow([id, body.userId, 'purchase', body.valor, body.descricao || 'Compra de produto', now]);
  
  // Atualizar estoque se aplicável
  if (body.produtoId) {
    const estoqueSheet = ss.getSheetByName('Estoque');
    const estoqueData = estoqueSheet.getDataRange().getValues();
    for (let i = 1; i < estoqueData.length; i++) {
      if (estoqueData[i][0] === body.produtoId && estoqueData[i][4] > 0) {
        estoqueSheet.getRange(i + 1, 5).setValue(estoqueData[i][4] - 1);
        break;
      }
    }
  }
  
  return jsonResponse({ success: true, id: id });
}

function handleGetTransacoes(params) {
  const sheet = getSheet('Transacoes');
  const data = sheet.getDataRange().getValues();
  const transacoes = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === params.userId) {
      transacoes.push({
        id: data[i][0],
        userId: data[i][1],
        tipo: data[i][2],
        valor: data[i][3],
        descricao: data[i][4],
        criadoEm: data[i][5]
      });
    }
  }
  
  return jsonResponse({ success: true, transacoes: transacoes });
}

// ═══════════════════════════════════════
//  VÍNCULO HANDLERS
// ═══════════════════════════════════════

function handleLinkChild(body) {
  const sheet = getSheet('Usuarios');
  const data = sheet.getDataRange().getValues();
  
  // Encontrar aluno com o código de vínculo
  let alunoData = null;
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === body.codigo && data[i][2] === 'aluno') {
      alunoData = { id: data[i][0], nome: data[i][1], row: i + 1 };
      break;
    }
  }
  
  if (!alunoData) {
    return jsonResponse({ success: false, error: 'Código de vínculo não encontrado. Verifique se o código está correto.' });
  }
  
  // Atualizar responsável com link do aluno
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.responsavelId) {
      sheet.getRange(i + 1, 6).setValue(alunoData.id);   // vinculo_aluno_id
      sheet.getRange(i + 1, 7).setValue(alunoData.nome);  // vinculo_aluno_nome
      break;
    }
  }
  
  return jsonResponse({
    success: true,
    aluno: { id: alunoData.id, nome: alunoData.nome }
  });
}

// ═══════════════════════════════════════
//  ESTOQUE HANDLERS
// ═══════════════════════════════════════

function handleGetEstoque(params) {
  const sheet = getSheet('Estoque');
  const data = sheet.getDataRange().getValues();
  const produtos = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      produtos.push({
        produtoId: data[i][0],
        categoria: data[i][1],
        titulo: data[i][2],
        precoCristais: data[i][3],
        estoque: data[i][4],
        ativo: data[i][5]
      });
    }
  }
  
  return jsonResponse({ success: true, produtos: produtos });
}

function handleUpdateEstoque(body) {
  const sheet = getSheet('Estoque');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === body.produtoId) {
      if (body.estoque !== undefined) sheet.getRange(i + 1, 5).setValue(body.estoque);
      if (body.ativo !== undefined) sheet.getRange(i + 1, 6).setValue(body.ativo);
      return jsonResponse({ success: true });
    }
  }
  
  return jsonResponse({ success: false, error: 'Produto não encontrado' });
}

// ═══════════════════════════════════════
//  ATIVIDADES HANDLER
// ═══════════════════════════════════════

function handleLogActivity(body) {
  const sheet = getSheet('Atividades');
  const id = Date.now();
  const now = new Date().toISOString();
  
  sheet.appendRow([id, body.userId, body.tipo, body.dados || '', now]);
  
  return jsonResponse({ success: true, id: id });
}

// ═══════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════

function getSheet(name) {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(name);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function rowToUser(row) {
  return {
    id: row[0],
    nome: row[1],
    tipo: row[2],
    vinculoCodigo: row[4],
    vinculoAlunoId: row[5],
    vinculoAlunoNome: row[6]
  };
}

function generateId() {
  return 'BA-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 6);
}

function generateVinculoCode() {
  // Caracteres sem ambiguidade (sem 0/O, 1/I/L)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 3; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}
