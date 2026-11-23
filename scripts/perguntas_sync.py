#!/usr/bin/env python3
"""Ponte entre o site (perguntas.json), o receptor do Google Apps Script e o
Painel de Perguntas (banco do artifact https://claude.ai/artifact/EBhjK27ztZ1VRmWZshdcGS).

O banco do painel é lido e gravado pela ferramenta ArtifactData; este script só
prepara e confere arquivos. Subcomandos (todos imprimem um resumo em JSON):

  contexto  <saida.json>
      Gera o documento contexto/noticias (cópia compacta do noticias.json),
      que o Claude do painel usa como base de consulta.

  importar  <recebidas.json> <pasta_perguntas> <pasta_saida>
      <recebidas.json>: resposta do receptor (GET ...?chave=...).
      <pasta_perguntas>: documentos atuais da coleção "perguntas", salvos com
      ArtifactData list + out_dir (aceita a pasta inexistente = coleção vazia).
      Escreve um arquivo por pergunta nova em <pasta_saida>/<id>.json e imprime
      a lista de ids, pronta para um ArtifactData batch (op "set", sem if_version).

  site      <pasta_perguntas>
      Regrava perguntas.json com as perguntas de status "publicada" e imprime
      {mudou, publicadas, marcar_no_site:[{id, version}]} — os documentos cujo
      noSiteEm deve ser atualizado depois do push.
"""
import json, os, re, sys, glob, datetime

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMAS = {"CBS", "IBS", "Imposto Seletivo", "Alíquotas", "Documentos fiscais", "Simples Nacional",
         "Obrigações acessórias", "Créditos", "Split payment", "Legislação", "Judiciário", "Setores", "Transporte"}
ID_OK = re.compile(r"^[A-Za-z0-9_\-.~:@+]{1,200}$")


def agora():
    return datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-3))).replace(microsecond=0).isoformat()


def ler_docs(pasta):
    """Lê os JSON salvos por ArtifactData (out_dir). Aceita {id,data,version} ou o corpo puro."""
    docs = {}
    if not pasta or not os.path.isdir(pasta):
        return docs
    for f in glob.glob(os.path.join(pasta, "**", "*.json"), recursive=True):
        with open(f, encoding="utf-8") as fh:
            j = json.load(fh)
        if isinstance(j, dict) and isinstance(j.get("data"), dict):
            corpo, versao, did = j["data"], j.get("version"), j.get("id")
        else:
            corpo, versao, did = j, None, None
        did = did or os.path.splitext(os.path.basename(f))[0]
        docs[did] = {"data": corpo, "version": versao}
    return docs


def contexto(saida):
    d = json.load(open(os.path.join(RAIZ, "noticias.json"), encoding="utf-8"))
    campos = ("data", "fonte", "tipo", "titulo", "resumo", "url", "temas")
    out = {"atualizado_em": d.get("atualizado_em"), "itens": [{k: i.get(k) for k in campos} for i in d.get("itens", [])]}
    s = json.dumps(out, ensure_ascii=False)
    if len(s.encode()) > 240_000:  # limite de 256 KiB por documento
        out["itens"] = out["itens"][:200]
        s = json.dumps(out, ensure_ascii=False)
    open(saida, "w", encoding="utf-8").write(s)
    print(json.dumps({"itens": len(out["itens"]), "bytes": len(s.encode()), "arquivo": saida}, ensure_ascii=False))


def importar(recebidas, pasta, saida):
    r = json.load(open(recebidas, encoding="utf-8"))
    if not r.get("ok"):
        print(json.dumps({"erro": r.get("erro", "resposta inválida do receptor")}, ensure_ascii=False))
        sys.exit(1)
    existentes = ler_docs(pasta)
    os.makedirs(saida, exist_ok=True)
    novas = []
    for i in r.get("itens", []):
        pid = str(i.get("id", "")).strip()
        texto = str(i.get("pergunta", "")).strip()
        if not ID_OK.match(pid) or pid in existentes or len(texto) < 15:
            continue
        doc = {"texto": texto[:1500], "pergunta": texto[:1500], "nome": str(i.get("nome", ""))[:80],
               "email": str(i.get("email", ""))[:120], "origem": str(i.get("origem", "site"))[:200] or "site",
               "recebidaEm": i.get("recebida_em") or agora(), "status": "nova",
               "resposta": "", "fontes": [], "temas": []}
        with open(os.path.join(saida, pid + ".json"), "w", encoding="utf-8") as fh:
            json.dump(doc, fh, ensure_ascii=False)
        novas.append(pid)
    print(json.dumps({"recebidas": len(r.get("itens", [])), "novas": novas, "pasta": saida}, ensure_ascii=False))


def site(pasta):
    docs = ler_docs(pasta)
    itens, marcar = [], []
    for pid, d in docs.items():
        c = d["data"]
        if c.get("status") != "publicada":
            continue
        pergunta, resposta = str(c.get("pergunta") or "").strip(), str(c.get("resposta") or "").strip()
        if len(pergunta) < 10 or len(resposta) < 40:
            continue
        fontes = [{"titulo": str(f.get("titulo") or f.get("url")).strip(), "url": str(f.get("url")).strip()}
                  for f in (c.get("fontes") or []) if isinstance(f, dict) and re.match(r"^https?://\S+$", str(f.get("url", "")).strip())]
        itens.append({"id": pid, "pergunta": pergunta, "resposta": resposta, "fontes": fontes,
                      "temas": [t for t in (c.get("temas") or []) if t in TEMAS][:3],
                      "publicada_em": c.get("publicadaEm") or c.get("editadoEm"),
                      "atualizada_em": c.get("editadoEm") or c.get("publicadaEm")})
        if not c.get("noSiteEm") or (c.get("editadoEm") and c["noSiteEm"] < c["editadoEm"]):
            marcar.append({"id": pid, "version": d["version"]})
    itens.sort(key=lambda i: str(i["publicada_em"]), reverse=True)

    caminho = os.path.join(RAIZ, "perguntas.json")
    antigo = json.load(open(caminho, encoding="utf-8")) if os.path.exists(caminho) else {"itens": []}
    mudou = antigo.get("itens") != itens
    if mudou:
        novo = {"versao": 1, "atualizado_em": agora(), "itens": itens}
        with open(caminho, "w", encoding="utf-8", newline="\n") as fh:
            json.dump(novo, fh, ensure_ascii=False, indent=2)
            fh.write("\n")
        json.load(open(caminho, encoding="utf-8"))
    print(json.dumps({"mudou": mudou, "publicadas": len(itens), "marcar_no_site": marcar}, ensure_ascii=False))


if __name__ == "__main__":
    cmd, args = (sys.argv[1], sys.argv[2:]) if len(sys.argv) > 1 else ("", [])
    if cmd == "contexto" and len(args) == 1:
        contexto(*args)
    elif cmd == "importar" and len(args) == 3:
        importar(*args)
    elif cmd == "site" and len(args) == 1:
        site(*args)
    else:
        print(__doc__)
        sys.exit(2)
