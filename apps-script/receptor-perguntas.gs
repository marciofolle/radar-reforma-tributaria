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
 *
 * POST (site público): grava uma linha na aba "Perguntas".
 * GET  (rotina do radar, com ?chave=...): devolve as perguntas em JSON.
 */

const ABA = 'Perguntas';
const CABECALHO = ['id', 'recebida_em', 'pergunta', 'nome', 'email', 'origem'];
const LIMITE_DIARIO = 300; // trava contra robôs: no máximo 300 envios por dia

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
    return json_({ ok: true, id: id });
  } finally {
    lock.releaseLock();
  }
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
