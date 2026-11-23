# Radar da Reforma Tributária · Funcional — instruções da atualização

Este repositório é o site https://www.radardareformatributaria.info (GitHub Pages, branch `main`).
Quando pedirem para **atualizar o radar**, siga este procedimento sem fazer perguntas.

Arquivos que a rotina altera: `noticias.json`, o bloco `<script type="application/json" id="seed">` do `index.html` e `perguntas.json` (seção 6).
Não altere: layout do `index.html`, `perguntas.html`, `scripts/`, `apps-script/`, `CNAME`, `.nojekyll`, `og-image.png`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `README.md`, este arquivo.

## 1. Estado atual
- Leia `noticias.json` e anote `atualizado_em` (última atualização).
- Se as ferramentas `mcp__claude-artifacts__*` estiverem disponíveis, leia também o `noticias.json` do artifact `3fd9514b-0dc3-4875-97e6-54bc70be7075` (get_artifact + read_file). Use como base o que tiver `atualizado_em` mais recente.

## 2. Pesquisa (WebSearch / WebFetch)
**Oficiais (WebFetch):**
- Receita Federal – RTC: https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/reforma-tributaria-do-consumo/ultimas-noticias/noticias
- Receita Federal – legislação: https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/reforma-tributaria-do-consumo/legislacao
- Comitê Gestor do IBS: https://www.cgibs.gov.br/regulamentos
- Agência Senado: https://www12.senado.leg.br/noticias/destaques/reforma-tributaria/
- Portal NF-e: https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=04BIflQt1aY=
- Portal CT-e: https://www.cte.fazenda.gov.br/portal/
- Ministério da Fazenda: https://www.gov.br/fazenda/pt-br
- Agência Câmara: https://www.camara.leg.br/noticias
Se uma página não abrir, use WebSearch com `allowed_domains` do domínio.

**Imprensa especializada (WebSearch, mode "standard", com allowed_domains):**
- ["reformatributaria.com","jota.info","migalhas.com.br"]
- ["mundologistica.com.br","contabeis.com.br","noticias.iob.com.br"]
- Grande imprensa (query "reforma tributária IBS CBS"):
  - ["valor.globo.com","g1.globo.com","oglobo.globo.com","gente.globo.com"]
  - ["folha.uol.com.br","noticias.uol.com.br","economia.uol.com.br"]  (a WebSearch recusa "uol.com.br" e "estadao.com.br" em allowed_domains; se der erro 400, remova o domínio recusado e repita, ou busque sem filtro de domínio)
  - ["cnnbrasil.com.br","infomoney.com.br","exame.com","istoedinheiro.com.br"]
  - ["agenciabrasil.ebc.com.br","poder360.com.br","correiobraziliense.com.br","conjur.com.br","bloomberglinea.com.br","brasil247.com","metropoles.com"]
  - Rastreie também veículos semelhantes que aparecerem nas buscas abertas (portais econômicos, jurídicos, tributários e regionais). Vale o mesmo critério da seção 3 (data e URL vindas da ferramenta; tipo "imprensa"; título reescrito).
- + 4 a 6 buscas abertas com a data de hoje (reforma tributária hoje, CBS alíquota Senado, IBS Comitê Gestor resolução, Imposto Seletivo MP, nota técnica NF-e IBS CBS, split payment, Simples Nacional IBS CBS, reforma tributária STF).

**Contabilidade (WebSearch com allowed_domains, "reforma tributária IBS CBS"):**
- ["cfc.org.br","fenacon.org.br","crcsp.org.br","crcpr.org.br","crcrs.org.br","crcsc.org.br","crcmg.org.br","crcrj.org.br"]
- ["crcba.org.br","crcgo.org.br","crcdf.org.br","crcpe.org.br","crc-ce.org.br","crc-es.org.br","crcms.org.br","crcmt.org.br","crcpa.org.br"]
- ["crcac.org.br","crcal.org.br","crcam.org.br","crcap.org.br","crcma.org.br","crcpb.org.br","crcpi.org.br","crcrn.org.br","crcro.org.br","crcrr.org.br","crcse.org.br","crcto.org.br"]

**Transporte e logística (prioridade):**
- allowed_domains ["cnt.org.br","portalntc.org.br","setcesp.org.br","setcepar.com.br","setcemg.org.br","setcergs.com.br"] — "reforma tributária", "CBS", "CT-e IBS CBS".
- Buscas abertas: reforma tributária transporte de cargas; frete CBS transportadoras; CT-e nota técnica IBS CBS; MDF-e reforma tributária; transportador autônomo crédito presumido; FETCESP / Fetranspar / SETCESC / FETRANCESC / ABTI / ABOL reforma tributária; sindicato empresas transporte de cargas reforma tributária.

## 3. Critérios
- Janela de busca: considere tudo o que foi publicado nos **últimos 3 dias** e ainda não está no `noticias.json` (compare URL e assunto). NÃO use o `atualizado_em` como corte: matérias publicadas antes da última rodada costumam ser indexadas pela busca só horas depois e precisam entrar mesmo assim. Data e URL têm de vir de resultado de ferramenta; sem data confirmada (WebFetch se preciso), não inclua. Nunca invente URL ou data.
- Profundidade mínima por rodada: abrir as 8 fontes oficiais e fazer pelo menos 15 buscas (todas as listas da seção 2). Uma rodada que termina em poucos minutos com "0 novos" está incompleta. Registre no commit quantas buscas foram feitas, ex.: "Atualiza radar: 2026-11-06 17:00 (3 novos, 18 buscas)".
- Sem duplicatas (URL e assunto). Mesmo fato: fonte oficial + no máximo 2 imprensa + no máximo 1 entidade. Se o fato já está só em portal especializado, inclua também a matéria da grande imprensa (g1, Valor, O Globo, Folha, CNN, Estadão, InfoMoney, Exame, Agência Brasil) quando houver — ela é a mais clipada pelos clientes e pela Fenacon.
- Na lista de grande imprensa, faça também uma busca por g1 sem filtro de domínio (ex.: "g1 reforma tributária split payment", "g1 CBS IBS"), porque o filtro allowed_domains às vezes não retorna matérias recentes do g1.
- Relevância: IBS, CBS, Imposto Seletivo, alíquotas, regulamentos, DF-e/NTs, obrigações acessórias, Simples Nacional, split payment, créditos, Judiciário, setores e, com prioridade, transporte. Ignore promoção, eventos sem conteúdo e republicações.
- Zero itens novos é aceitável.
- `tipo`: "oficial" (Receita, CGIBS, Fazenda, Senado, Câmara, TCU, Planalto/DOU, CGSN, portais NF-e/CT-e) | "entidade" (CFC, CRCs, Fenacon, Sescon, CNT, NTC&Logística, sindicatos, federações, associações, confederações) | "imprensa".
- Item: `{"id":"<fonte>-<AAAA-MM-DD>-<slug>","data":"AAAA-MM-DD","adicionado_em":"<agora ISO -03:00>","titulo","resumo","fonte","orgao"(oficial/entidade),"tipo","temas":[1-3],"url"}`.
- Temas permitidos: CBS, IBS, Imposto Seletivo, Alíquotas, Documentos fiscais, Simples Nacional, Obrigações acessórias, Créditos, Split payment, Legislação, Judiciário, Setores, Transporte. Frete/CT-e/MDF-e/TAC/logística ⇒ tema "Transporte" obrigatório.
- Título: oficial e entidade mantêm o original; imprensa com título reescrito. Resumo: 1–2 frases próprias (~45 palavras) com o dado concreto. Nunca copie 15+ palavras nem mais de uma citação por fonte.

## 4. Indicadores e prazos
- `indicadores`: 4 cartões; atualize se um fato mudou (alíquota fixada pelo Senado, nova estimativa oficial, data do IS).
- `prazos`: remova os vencidos há mais de 3 dias, corrija datas, inclua novos prazos oficiais (inclusive produção de NTs). Ordene por data.

## 5. Gravação e publicação
1. Insira os itens, ordene por data desc., descarte > 120 dias, limite 300. `atualizado_em` = agora (ISO -03:00). Remova o campo `publicacao` se existir.
2. Valide com python (`json.load`; todo item com data, titulo, url http(s), tipo válido, temas).
3. Grave `noticias.json` (indent=2, ensure_ascii=False) e substitua só o conteúdo do `<script type="application/json" id="seed">` no `index.html` pelo JSON minificado (`separators=(',',':')`, trocando `</` por `<\/`).
4. Faça a seção 6 (Perguntas e respostas) antes do commit, para que `perguntas.json` entre no mesmo commit.
5. Commit e push:
   ```
   git add noticias.json index.html perguntas.json
   git -c user.name="Radar Funcional (Claude)" -c user.email="noreply@anthropic.com" commit -m "Atualiza radar: <AAAA-MM-DD HH:MM> (<n> novos, <b> buscas)"
   git fetch origin main:refs/remotes/origin/main && git rebase origin/main
   git push origin HEAD:main
   git ls-remote origin refs/heads/main   # deve mostrar o hash do seu commit
   ```
   Se houve mudança em `perguntas.json`, acrescente ao fim da mensagem do commit `, <p> perguntas publicadas`.
6. Depois do push confirmado, termine a seção 6 (passo 6.5).
7. Se as ferramentas de artifact estiverem disponíveis, publique os mesmos dados no artifact `3fd9514b-0dc3-4875-97e6-54bc70be7075` (publish_files, mode "patch", noticias.json + index.html do artifact com o seed atualizado; não use o index.html deste repositório lá).
8. Encerre com um resumo curto: itens novos (oficiais/imprensa/entidades e quantos de Transporte), destaques, mudanças em indicadores/prazos, perguntas (importadas, rascunhadas, publicadas no site) e o hash do commit.

## 6. Perguntas e respostas
O site tem `perguntas.html`, que lista as respostas de `perguntas.json` e envia perguntas novas a um receptor no Google Apps Script. A equipe revisa e publica as respostas no **Painel de Perguntas**, um artifact com banco de dados: `https://claude.ai/artifact/EBhjK27ztZ1VRmWZshdcGS` (abaixo, PAINEL). O banco do PAINEL é lido e gravado com a ferramenta `ArtifactData` (carregue com ToolSearch `select:ArtifactData`). Se `ArtifactData` não existir nesta sessão, pule a seção inteira e diga isso no resumo.

Documento `perguntas/<id>`: `texto` (original), `pergunta` (versão para publicar), `nome`, `email`, `origem`, `recebidaEm`, `status` ("nova" | "rascunho" | "publicada" | "arquivada"), `resposta`, `fontes` [{titulo,url,trecho}], `temas`, `rascunho` {origem, em, pontos[]}, `editadoEm`, `editadoPor`, `publicadaEm`, `noSiteEm`. Datas gravadas pela rotina em ISO **UTC com Z** (ex.: `2026-11-23T12:30:00Z`), o mesmo formato que o painel usa, porque o painel compara essas datas como texto.

Pasta de trabalho: `$W` = o scratchpad da sessão (nunca dentro do repositório). Nunca grave `nome` ou `email` em arquivo do repositório nem no resumo.

**6.1 Ler o painel.** `ArtifactData` action "list", collection "perguntas", `query.limit` 1000, `out_dir` `$W/painel`. Anote o `version` de cada documento que a listagem informa (os arquivos salvos não trazem a versão).

**6.2 Importar perguntas novas do site.** O endereço do receptor é a constante `ENDPOINT` em `perguntas.html`. A chave de leitura vem no prompt da rotina, como `CHAVE_PERGUNTAS`. Se `ENDPOINT` estiver vazio ou a chave não vier no prompt, pule este passo.
   ```
   curl -sL "<ENDPOINT>?chave=<CHAVE_PERGUNTAS>" -o $W/recebidas.json
   python3 scripts/perguntas_sync.py importar $W/recebidas.json $W/painel/perguntas $W/novas
   ```
   Para os ids listados em `novas`, faça um `ArtifactData` "batch" com uma entrada `{op:"set", collection:"perguntas", doc_id:<id>, file_path:"$W/novas/<id>.json"}` por pergunta, sem `if_version` (até 50 por batch). Se o curl falhar ou a resposta não tiver `"ok":true`, registre no resumo e siga.

**6.3 Rascunho pesquisado (no máximo 3 por rodada, as mais antigas primeiro).** Para cada documento com `status` "nova" e `resposta` vazia, incluindo os recém-importados:
   - Pesquise com WebSearch/WebFetch, priorizando fontes oficiais (Planalto, Receita Federal, CGIBS, CGSN, portais NF-e/CT-e) e depois as notícias de `noticias.json`. Toda URL citada precisa ter vindo de um resultado de ferramenta. Nunca invente URL, artigo, alíquota ou data.
   - Escreva a `resposta`: português do Brasil, 120 a 350 palavras, parágrafos de texto puro separados por linha em branco, sem markdown. Comece respondendo em uma ou duas frases. Cite dispositivos legais (ex.: "art. 169 da LC 214/2025") só quando tiver confirmado. Se depender de detalhes do caso, diga quais. Feche com "Situação em <data de hoje por extenso>."
   - `pergunta`: reescreva o texto sem nomes de pessoas ou empresas, CNPJ ou dados pessoais, mantendo o sentido.
   - `fontes`: 1 a 4 links usados, cada um `{titulo, url, trecho}`. O `trecho` (até ~1.500 caracteres) traz o conteúdo da fonte que sustenta a resposta: o dispositivo legal transcrito, no caso de lei, ato ou nota técnica, ou um resumo fiel dos pontos usados, com no máximo uma citação curta, no caso de imprensa ou entidade. Ele fica só no painel (o site publica apenas título e link) e serve de base quando a equipe pede "Refazer com Claude".
   - `temas`: 1 a 3 da lista da seção 3 (frete/CT-e/TAC ⇒ "Transporte").
   - Se a pergunta for spam, ofensiva ou fora do tema, não rascunhe: deixe `resposta` vazia e ponha em `rascunho.pontos` a sugestão de arquivar.
   - Grave com `ArtifactData` "update" e `if_version` igual à versão lida: `{pergunta, resposta, fontes, temas, rascunho:{origem:"pesquisa-rotina", em:<agora UTC Z>, pontos:[o que o revisor deve conferir]}}`. **Não mude `status`**: a pergunta continua "nova" até alguém da equipe revisar. Se o `if_version` falhar, alguém editou: deixe como está.

**6.4 Atualizar o site.** Releia o painel como em 6.1 (anote de novo as versões, que mudaram com as gravações de 6.2 e 6.3) e rode `python3 scripts/perguntas_sync.py site $W/painel/perguntas`. O script regrava `perguntas.json` só com as perguntas de status "publicada" (sem nome nem e-mail). Ele informa `mudou`, quantas estão publicadas e a lista `marcar_no_site`. Se `mudou` for true, `perguntas.json` entra no commit da seção 5. Perguntas despublicadas ou arquivadas saem do site automaticamente.

**6.5 Depois do push confirmado.**
   - Para cada id em `marcar_no_site`: `ArtifactData` "update" `{noSiteEm:<agora UTC Z>}`, com o `if_version` da releitura de 6.4. Isso faz o painel mostrar "no site desde…". Se o `if_version` falhar, deixe para a próxima rodada.
   - Atualize a base de consulta do Claude no painel (só na rotina do radar): `python3 scripts/perguntas_sync.py contexto $W/contexto.json` e `ArtifactData` "set" collection "contexto", doc_id "noticias", `file_path` `$W/contexto.json`. Leia antes o documento (action "get") para obter o `if_version`; se ele não existir, grave sem `if_version`.

**6.6 Rotina "Perguntas: sincronizar painel e site" (execução avulsa).** Essa rotina é acionada pelo receptor a cada pergunta enviada e a cada clique em "Publicar"/"Despublicar" no painel, e também roda de hora em hora. Ela NÃO atualiza o radar de notícias. Ordem, para o painel e o site refletirem as mudanças o quanto antes:
   0. Comece do `main` atual (a cópia recebida pode estar desatualizada): `git fetch origin main && git switch -c perguntas-$(date +%s) origin/main`.
   1. 6.1 e 6.2 (ler o painel e importar as perguntas novas).
   2. 6.4 (gerar `perguntas.json`). Se `mudou` for true, faça commit e push só desse arquivo:
      ```
      git add perguntas.json
      git -c user.name="Radar Funcional (Claude)" -c user.email="noreply@anthropic.com" commit -m "Perguntas: <p> publicadas no site"
      git fetch origin main:refs/remotes/origin/main && git rebase origin/main
      git push origin HEAD:main
      git ls-remote origin refs/heads/main   # deve mostrar o hash do seu commit
      ```
      Se o rebase der conflito em `perguntas.json` (outra rodada publicou ao mesmo tempo): `git rebase --abort`, depois `git fetch origin main && git switch -c perguntas-$(date +%s) origin/main`, repita 6.1 e 6.4 e faça o commit de novo. Não use `git reset --hard` (é bloqueado).
   3. 6.5, só a parte do `noSiteEm` (a base de notícias fica com a rotina do radar).
   4. 6.3 (rascunhos), por último.
   Termine com uma linha: importadas, publicadas no site (e hash do commit, se houve), rascunhadas, erros.
