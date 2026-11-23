/**
 * Receptor de perguntas do Radar da Reforma Tributária.
 *
 * Instalação (uma vez):
 *  1. Crie uma planilha Google vazia (ex.: "Radar · Perguntas recebidas").
 *  2. Na planilha: Extensões > Apps Script. Apague o conteúdo e cole este arquivo.
 *  3. Configurações do projeto (engrenagem) > Propriedades do script > Adicionar:
 *       CHAVE = uma senha longa e aleatória (só a rotina do radar vai usar).
 *  4. Implantar > Nova implantação > Tipo "App da Web":
 *       Executar como: Eu  |  Quem pode acessar: Qualquer pessoa.
 *     Autorize e copie a URL que termina em /exec.
 *  5. Cole essa URL na constante ENDPOINT do perguntas.html.
 *  6. (Painel atualizado a cada envio) Em claude.ai/code/routines, abra a rotina
 *     "Perguntas: importar ao receber" > Editar > Trigger "+" > API. Copie a Fire URL,
 *     clique em Generate token e copie o token. Em Propriedades do script, adicione:
 *       ROTINA_URL   = a Fire URL
 *       ROTINA_TOKEN = o token
 *     Depois rode a função testarDisparo uma vez pelo editor (autorize o acesso pedido)
 *     e publique uma nova versão da implantação (Gerenciar implantações > lápis > Nova versão).
 *
 * POST (site público): grava uma linha na aba "Perguntas" e aciona a rotina.
 * GET  (rotina do radar, com ?chave=...): devolve as perguntas em JSON.
 */

const ABA = 'Perguntas';
const CABECALHO = ['id', 'recebida_em', 'pergunta', 'nome', 'email', 'origem'];
const LIMITE_DIARIO = 300; // trava contra robôs: no máximo 300 envios por dia
const INTERVALO_DISPARO_MS = 2 * 60 * 1000; // no máximo um disparo da rotina a cada 2 minutos

function aba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(CABECALHO);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function limpa_(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
}

function doPost(e) {
  let dados = {};
  try { dados = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) { return json_({ ok: false, erro: 'formato' }); }

  // Campo invisível preenchido = robô. Responde "ok" sem gravar.
  if (limpa_(dados.site, 200)) return json_({ ok: true });

  const pergunta = limpa_(dados.pergunta, 1500);
  if (pergunta.length < 15) return json_({ ok: false, erro: 'pergunta curta' });

  const cache = CacheService.getScriptCache();
  const hoje = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const n = Number(cache.get('envios-' + hoje) || 0);
    if (n >= LIMITE_DIARIO) return json_({ ok: false, erro: 'limite diário' });
    cache.put('envios-' + hoje, String(n + 1), 21600);

    // Ignora reenvio idêntico (duplo clique) nos últimos 10 minutos.
    const assinatura = Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, pergunta)).slice(0, 40);
    if (cache.get('p-' + assinatura)) return json_({ ok: true, repetida: true });
    cache.put('p-' + assinatura, '1', 600);

    const id = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyyMMdd-HHmmss') + '-' + Utilities.getUuid().slice(0, 6);
    aba_().appendRow([id, new Date(), pergunta, limpa_(dados.nome, 80), limpa_(dados.email, 120), limpa_(dados.origem, 200)]);
    try { agendarDisparo_(id); } catch (err) { console.error('Disparo da rotina: ' + err); }
    return json_({ ok: true, id: id });
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Aciona a rotina "Perguntas: importar ao receber" ---------- */

// Junta os envios: dispara na hora se o último disparo foi há mais de 2 minutos;
// senão agenda um disparo único para quando o intervalo vencer.
function agendarDisparo_(id) {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ROTINA_URL') || !props.getProperty('ROTINA_TOKEN')) return;
  const pend = JSON.parse(props.getProperty('PENDENTES') || '[]');
  pend.push(id);
  props.setProperty('PENDENTES', JSON.stringify(pend.slice(-50)));
  const espera = INTERVALO_DISPARO_MS - (Date.now() - Number(props.getProperty('ULTIMO_DISPARO') || 0));
  if (espera <= 0) { dispararRotina(); return; }
  if (!props.getProperty('DISPARO_AGENDADO')) {
    ScriptApp.newTrigger('dispararRotina').timeBased().after(espera + 5000).create();
    props.setProperty('DISPARO_AGENDADO', String(Date.now()));
  }
}

function dispararRotina() {
  const props = PropertiesService.getScriptProperties();
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'dispararRotina') ScriptApp.deleteTrigger(t);
  });
  props.deleteProperty('DISPARO_AGENDADO');
  const pend = JSON.parse(props.getProperty('PENDENTES') || '[]');
  const url = props.getProperty('ROTINA_URL'), token = props.getProperty('ROTINA_TOKEN');
  if (!pend.length || !url || !token) return;
  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token,
      'anthropic-beta': 'experimental-cc-routine-2026-04-01',
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify({ text: 'Perguntas recém-enviadas (ids): ' + pend.join(', ') }),
    muteHttpExceptions: true
  });
  const codigo = resp.getResponseCode();
  props.setProperty('ULTIMO_DISPARO', String(Date.now()));
  props.setProperty('ULTIMO_RESULTADO', new Date().toISOString() + ' HTTP ' + codigo + ' ' + resp.getContentText().slice(0, 300));
  if (codigo >= 200 && codigo < 300) props.setProperty('PENDENTES', '[]');
}

// Rode pelo editor para autorizar e testar o disparo. O resultado aparece no registro de execução.
function testarDisparo() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('ROTINA_URL') || !props.getProperty('ROTINA_TOKEN')) {
    console.log('Faltam as propriedades ROTINA_URL e/ou ROTINA_TOKEN.');
    return;
  }
  props.setProperty('PENDENTES', JSON.stringify(['teste-manual']));
  props.deleteProperty('ULTIMO_DISPARO');
  dispararRotina();
  console.log(props.getProperty('ULTIMO_RESULTADO'));
}

function doGet(e) {
  const chave = PropertiesService.getScriptProperties().getProperty('CHAVE');
  const p = (e && e.parameter) || {};
  if (!chave || p.chave !== chave) return json_({ ok: false, erro: 'acesso negado' });

  const linhas = aba_().getDataRange().getValues().slice(1);
  const desde = p.desde ? new Date(p.desde) : null;
  const itens = linhas
    .filter(function (l) { return l[0]; })
    .map(function (l) {
      return {
        id: String(l[0]),
        recebida_em: Utilities.formatDate(new Date(l[1]), 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ssXXX"),
        pergunta: String(l[2]),
        nome: String(l[3] || ''),
        email: String(l[4] || ''),
        origem: String(l[5] || '')
      };
    })
    .filter(function (i) { return !desde || new Date(i.recebida_em) > desde; });
  return json_({ ok: true, total: itens.length, itens: itens });
}
