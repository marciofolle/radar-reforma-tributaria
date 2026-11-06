# Radar da Reforma Tributária · Funcional — instruções da atualização

Este repositório é o site https://www.radardareformatributaria.info (GitHub Pages, branch `main`).
Quando pedirem para **atualizar o radar**, siga este procedimento sem fazer perguntas.

Arquivos que a rotina altera: `noticias.json` e o bloco `<script type="application/json" id="seed">` do `index.html`.
Não altere: layout do `index.html`, `CNAME`, `.nojekyll`, `og-image.png`, `favicon.svg`, `robots.txt`, `sitemap.xml`, `README.md`, este arquivo.

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
- Sem duplicatas (URL e assunto). Mesmo fato: fonte oficial + no máximo 1 imprensa + no máximo 1 entidade.
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
4. Commit e push:
   ```
   git add noticias.json index.html
   git -c user.name="Radar Funcional (Claude)" -c user.email="noreply@anthropic.com" commit -m "Atualiza radar: <AAAA-MM-DD HH:MM> (<n> novos, <b> buscas)"
   git fetch origin main:refs/remotes/origin/main && git rebase origin/main
   git push origin HEAD:main
   git ls-remote origin refs/heads/main   # deve mostrar o hash do seu commit
   ```
5. Se as ferramentas de artifact estiverem disponíveis, publique os mesmos dados no artifact `3fd9514b-0dc3-4875-97e6-54bc70be7075` (publish_files, mode "patch", noticias.json + index.html do artifact com o seed atualizado; não use o index.html deste repositório lá).
6. Encerre com um resumo curto: itens novos (oficiais/imprensa/entidades e quantos de Transporte), destaques, mudanças em indicadores/prazos e o hash do commit.
