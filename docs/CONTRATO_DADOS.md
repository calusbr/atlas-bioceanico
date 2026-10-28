# Contrato de dados — exportação v3 (contrato `3.1`)

Este documento descreve os arquivos que o **site** (este repositório) consome. Os arquivos são gerados pela
**PARTE 1** (`projeto_rota/V2/CODE`, ação `exportar-v3`) e ficam na pasta `dados/` deste repositório.
O site é 100% estático: nada é consultado em banco em tempo de execução.

- Produtor: `python3 rota.py consolidar && python3 rota.py exportar-v3 --destino <pasta>`
  (ou menu › Consolidação › 6; destino padrão = variável `ATLAS_DADOS` ou `JSON/dataset/v3/`).
- Versão: `manifest.json › contrato`. Mudança **incompatível** sobe o número inteiro (`4.0`); campo novo
  e opcional sobe a fração (`3.1`). O site deve recusar contrato com inteiro diferente do que conhece.
- Codificação: UTF-8, JSON compacto. O GitHub Pages entrega com gzip — os tamanhos `bytes_gz` do manifest
  são o que o navegador realmente baixa.

## 1. Estrutura e ordem de carregamento

```
dados/                            (na raiz do repositório)
├─ manifest.json                  ① sempre (pequeno, sem cache)
├─ dic.json                       ② sempre — dicionários dos códigos inteiros
├─ indice/
│  ├─ noticias.json               ③ Home/Dashboard/busca facetada (≈ 0,8 MB gzip p/ 16 mil matérias)
│  └─ pdfs.json                   ③ seção de documentos
├─ stats/serie_mensal.json        ③ gráficos de linha do tempo (contagens únicas)
├─ gestao/                        ④ ao abrir a Gestão de Projeto
│  ├─ valores.json
│  ├─ percentuais.json
│  └─ eventos.json
└─ textos/                        ⑤ sob demanda (ao abrir uma matéria ou um mês)
   ├─ noticias/AAAA-MM.json       um arquivo por mês (maior ≈ 0,5 MB gzip)
   └─ pdfs/<id>.json              um arquivo por documento (média 23 KB, maior 0,44 MB gzip)
```

Medição na base de 25/10/2026 (16.188 matérias núcleo+contexto, 259 PDFs): ①+②+③ ≈ **0,8 MB gzip**;
④ ≈ 0,35 MB gzip; ⑤ ≈ 20 MB gzip no total, mas o site só baixa os meses que o usuário abre.

## 2. `manifest.json`

```json
{
  "projeto": "Rota Bioceânica de Capricórnio",
  "contrato": "3.1", "schema_version": "2.3", "versao_pipeline": "2.3.1",
  "gerado_em": "2026-10-25T21:00:00+00:00",
  "periodo": ["2008-01-02", "2026-10-25"],
  "contagens": {"noticias": 16134, "noticias_unicas": 16048, "pdfs": 259,
                "valores": 7676, "percentuais_obra": 1537, "eventos_realizados": 2573},
  "niveis": ["nucleo", "contexto"],
  "texto_integral": true,
  "arquivos": {"indice/noticias.json": {"bytes": 2600000, "bytes_gz": 760000,
                                         "sha256": "…", "registros": 16134}, "…": {}}
}
```

- **Cache**: o Service Worker compara `sha256` de cada arquivo com o que está no IndexedDB e só baixa o
  que mudou. `manifest.json` nunca vai para cache (buscar com `cache: "no-store"`).
- `noticias_unicas` = número de grupos de tradução (a mesma matéria em PT e ES conta uma vez). **Todo
  número exibido no site como "quantidade de matérias" deve usar a contagem única** (coluna `g`).

## 3. Formato colunar

`indice/*`, `gestao/*` e `stats/*` usam o mesmo formato — uma lista por campo, todas do mesmo tamanho:

```json
{"colunas": ["id", "d", "s"], "n": 3, "dados": {"id": ["a1…", "b2…", "c3…"], "d": ["2026-05-10", …], "s": [0, 0, 4]}}
```

Leitura (JS):

```js
const linha = (tab, i) => Object.fromEntries(tab.colunas.map(c => [c, tab.dados[c][i]]));
// filtro rápido sem montar objetos: percorre só as colunas usadas
const nucleo2026 = [];
for (let i = 0; i < idx.n; i++) if (idx.dados.r[i] === 0 && idx.dados.d[i].startsWith("2026")) nucleo2026.push(i);
```

Campos com código inteiro (`s`, `l`, `r`, `c`, `k`) e listas de códigos (`tm`, `p`, `tr`, `lg`) apontam
para a posição na lista correspondente de `dic.json`.

## 4. `dic.json`

| chave | conteúdo |
|---|---|
| `sites` | `[{id, nome, pais, url}]` — código `s` |
| `idiomas` | `["pt", "es"]` — código `l` |
| `niveis` | `["nucleo", "contexto", "ruido"]` — código `r` |
| `temas` | ids de tema (`infraestrutura_obras`, `logistica_transporte`, …) — códigos `tm` |
| `paises` | códigos ISO-2 (`BR`, `PY`, `AR`, `CL`, `BO`, …) — códigos `p` |
| `trechos` | `[{id, pais, rotulo}]` — códigos `tr` (ponte, BR-267, PY-15 Chaco, acessos, fronteira, passos, portos) |
| `corredores` | `[{id, rotulo, tipo}]` — código `c` (`alvo`, `secundario`, `concorrente`) |
| `lugares` | `[{nome, tipo, pais, uf, lat, lon, ordem_rota}]` — códigos `lg` (mapa) |
| `doc_tipos` | tipos de PDF (`ata`, `declaracao`, `informe`, …) — código `k` |
| `tipos_valor` | `[{tipo, rotulo}]` — financiado, contratado, executado, economico, previsto, outro |
| `tipos_evento` | inauguracao, conclusao, entrega, assinatura, aprovacao, licitacao, inicio |

## 5. `indice/noticias.json`

| col | tipo | significado |
|---|---|---|
| `id` | string(10) | id estável (SHA-1 da chave `site|url`); chave em `textos/noticias/AAAA-MM.json` |
| `d` | `AAAA-MM-DD` ou `""` | data de publicação (sem data → arquivo `textos/noticias/sem-data.json`) |
| `s` `l` `r` `c` | int | site, idioma, nível de relevância, corredor |
| `t` | string | título |
| `g` | string(10) | id do representante do grupo de tradução (= `id` quando não há tradução) |
| `tm` `p` `tr` `lg` | int[] | temas, países citados, trechos da rota, lugares |
| `n` | int | número de palavras |
| `i` | 0/1 | tem imagem de destaque |
| `gp` | int | nº de fatos de gestão (valores + % de obra + eventos) — destaca matérias "com dados" |

O mês do arquivo de texto é `d.slice(0, 7)`.

## 6. `indice/pdfs.json`

`id, d, de` (data estimada 0/1)`, s, l, r, k` (tipo de documento)`, t, tm, p, tr, pg` (páginas)`, m`
(miniatura, caminho relativo a `PDFS/`). Texto em `textos/pdfs/<id>.json` (desde o contrato 3.1;
no 3.0 era um arquivo por ano).

## 7. `textos/noticias/AAAA-MM.json`

Objeto `{id: matéria}`:

```json
{"url": "https://…", "site": "midiamax", "titulo": "…", "data": "2026-05-10", "autor": "…",
 "resumo": "…", "conteudo": "texto integral…", "texto_integral": true, "imagem": "https://…",
 "fonte": "MOPC (Paraguai)", "tipo_fonte": "governo", "tags": [], "entidades": [], "atores": [{"nome", "cargo", "mencoes"}],
 "lugares": ["Porto Murtinho"], "valores": [ver §8], "quantidades": [], "marcos": [{"ano", "mes", "evento", "tipo", "trecho"}],
 "percentuais_obra": [ver §8], "eventos_realizados": [ver §8], "links_pdf": [], "evidencias": [], "grupo": "id do representante"}
```

- **Direitos**: o texto integral é republicado com a URL original (projeto acadêmico e aberto; fontes
  oficiais, institucionais e imprensa). O site **deve** exibir o nome do veículo e o link `url` em toda
  matéria. Sites com `texto_integral: false` chegam com `conteudo: ""` — mostrar só resumo + link.

## 8. Gestão de Projeto — "divulgado × realizado"

Somente o **representante** de cada grupo de tradução entra nestas tabelas (o mesmo fato em PT e ES
conta uma vez). `id` aponta para o índice/textos da matéria de origem.

### `gestao/valores.json`
`id, d, valor` (número, na moeda original)`, moeda` (`BRL`, `USD`, `PYG`, `ARS`, `CLP`, …)`, tipo, trecho,
pais, texto`. Só valores ligados à obra/corredor (`rota` verdadeiro ou com trecho).

| `tipo` | leitura no painel |
|---|---|
| `previsto` | **divulgado**: anunciado, estimado, orçamento |
| `contratado` | licitado / contratado / ordem de serviço |
| `financiado` | empréstimo, crédito (BID, CAF, BNDES, Fonplata…) |
| `executado` | **realizado**: pago, desembolsado, "já foram investidos" |
| `economico` | indicador econômico (PIB, exportações) — não é custo de obra |
| `outro` | valor sem qualificação |

### `gestao/percentuais.json`
`id, d, valor` (0–100)`, trecho, pais, origem, contexto`. `origem = texto` quando a data da medição foi
escrita junto do percentual; `publicacao` quando se usa a data da matéria. Para a curva de avanço por
trecho, use o **máximo por trecho e por mês** (matérias repetem números antigos).

### `gestao/eventos.json`
`id, d, tipo, trecho, pais, origem, frase`. `origem`: `texto` (data completa na frase), `ano_no_texto`
("em 2024 se firmó…" → `AAAA-01-01`, precisão de ano) ou `publicacao`.

> As três tabelas são extraídas por regras transparentes (`config/taxonomia.yaml › gestao_projeto` na
> PARTE 1). Há ruído residual: o painel deve sempre permitir abrir a frase/contexto e a matéria original.

## 9. `stats/serie_mensal.json`

`mes` (`AAAA-MM`)`, pais` (país citado; sem país → país do veículo)`, nivel, qtd` — matérias únicas.
Uma matéria que cita dois países soma 1 em cada país (não some os países para obter o total: use o índice).

## 10. Publicação (pasta `dados/` no próprio repositório)

O site roda no GitHub Pages direto do branch `main` (sem GitHub Actions e sem build). Os dados ficam em
`dados/` na raiz do repositório:

```bash
# no servidor (ou no computador, com a base local)
sh scripts/publicar-dados.sh                        # rota.py consolidar + exportar-v3 --destino dados/
git add dados && git commit -m "dados $(date +%F)" && git push
```

O exportador remove os arquivos que saíram da base (o destino fica sempre igual ao manifest). Tamanho
atual: ~100 MB em disco (nenhum arquivo acima de 20 MB; o limite do GitHub é 100 MB por arquivo).

## 11. Camadas futuras (Fase D — Semântico)

Serão acrescentadas sem quebrar o contrato (`3.x`): `semantico/vetores_int8.bin` + `semantico/ids.json`
(multilingual-e5-small, 384 dim), `semantico/umap.json` (x, y, cluster HDBSCAN), `grafo/*.json`
(coocorrência + comunidades Louvain + relações GraphRAG) e `pagefind/` (índice de busca textual).

## Histórico do contrato

| versão | mudança |
|---|---|
| 3.0 | primeira versão (Fase A) |
| 3.1 | `textos/pdfs/AAAA.json` → `textos/pdfs/<id>.json` (um arquivo por documento) |
