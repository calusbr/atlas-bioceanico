# Atlas Bioceânico

Painel de pesquisa (GitHub Pages) do ecossistema **Rota Bioceânica de Capricórnio** (MS – Paraguai –
Argentina – Chile): notícias e documentos oficiais de fontes do BR, PY, AR e CL, coletados, classificados
e enriquecidos pela PARTE 1 ([projeto_rota](https://github.com/calusbr/projeto_rota), pasta `V2/CODE`).

## Como rodar

O site é **estático e sem etapa de build**: HTML + CSS + módulos JavaScript nativos. O mesmo conteúdo
roda localmente e no GitHub Pages.

```bash
sh scripts/servir.sh          # http://localhost:8000/  (só precisa do Python 3)
```

Bibliotecas carregadas por CDN com versão fixa (import map em `index.html`): Apache ECharts 5.5.1
(gráficos), MapLibre GL 4.7.1 + base OpenFreeMap (mapa, sem chave), Boxicons 2.1.4 (ícones), fontes
Orbitron + Inter (Google Fonts).

## Publicação no GitHub Pages

1. Envie o repositório (`git push`).
2. GitHub › Settings › Pages › **Deploy from a branch** › `main` / `(root)`.
3. O site fica em `https://calusbr.github.io/atlas-bioceanico/`. O arquivo `.nojekyll` desliga o Jekyll
   (o Pages entrega os arquivos como estão).

## Dados

A pasta `dados/` é a **exportação v3 em camadas** da PARTE 1 (formato em
[docs/CONTRATO_DADOS.md](docs/CONTRATO_DADOS.md)). O navegador baixa primeiro só o índice (~0,8 MB gzip)
e busca o texto de cada mês quando uma matéria é aberta; tudo fica guardado no IndexedDB e só é baixado
de novo quando o SHA-256 no `manifest.json` muda.

Atualizar os dados:

```bash
sh scripts/publicar-dados.sh                      # no servidor: consolidar + exportar-v3 → dados/
sh scripts/publicar-dados.sh --copiar <pasta_v3>  # ou copiar uma exportação já pronta
git add dados && git commit -m "dados AAAA-MM-DD" && git push
```

## Estrutura

```
index.html                    casca: cabeçalho, barra lateral, conteúdo, rodapé (+ import map)
.nojekyll                     GitHub Pages sem Jekyll
assets/css/temas.css          tokens dos modos escuro/claro (glassmorphism + neon)
assets/css/app.css            layout de painel e componentes
assets/img/                   logo provisório e favicon
assets/js/main.js             barra lateral, menus, tema, idioma, busca, tela cheia
assets/js/roteador.js         rotas por hash (#/dashboard/secao, #/materia/<id>, #/busca/<termo>, #/sobre…)
assets/js/i18n.js             textos PT (padrão) e ES
assets/js/rotulos.js          nomes PT/ES de temas, países, trechos, tipos de valor/evento
assets/js/dados/              carregador (manifest + IndexedDB), consultas (agregações), gestao (documentos oficiais), idb
assets/js/ui/                 dom (componentes), graficos (ECharts), mapa (MapLibre), tema
assets/js/paginas/            dashboard, materia, busca, sobre, gestao, futura (seções das próximas fases)
dados/                        exportação v3 (gerada pela PARTE 1 — não editar à mão)
docs/CONTRATO_DADOS.md        formato dos dados
scripts/                      servir (local), publicar-dados
```

## Seções

| Seção | Conteúdo | Fase |
|---|---|---|
| **Dashboard** (página inicial) | filtros (período, país, relevância, idioma); 8 indicadores; área mensal com zoom, rosca país/idioma, colunas por ano, calendário de calor; mapa do traçado; trechos; fontes (barras, dispersão, histograma); temas (radar, barras); obra (box plot do % por trecho, avanço da ponte, valores por tipo, fatos por ano); tabela das últimas matérias | B ✅ |
| Matéria / Busca | texto integral com link para a fonte e dados extraídos; busca por título | B ✅ |
| Sobre | projeto, fontes monitoradas, metodologia, dados abertos | B ✅ |
| Semântico | mapa de assuntos, grafo de atores, busca por significado | D |
| Gestão de Projeto | centrada nos documentos oficiais do Corredor Bioceânico (corredorbioceanico.org): filtros (fonte, período, trecho, país); 4 indicadores só de PDFs (investimento citado, % concluída, obras entregues, prazos); acervo com categorias (atas, declarações, relatórios, estudos, boletins…), busca por palavras e ficha do documento com link para o PDF oficial; mapa dos lugares citados; divulgado × realizado (linhas acumuladas, prazo prometido × data do anúncio, avanço por trecho) e linha do tempo de fatos — com opção de incluir as matérias | E ✅ (v0.7) |
| Agente | conversa com citações (GraphRAG) e sala ao vivo (Cloudflare Worker / Durable Objects) | F |

Visual: glassmorphism escuro com acento neon (referências: Dashtreme e Artifice), modos escuro e claro,
interface em Português (padrão) e Espanhol.

Autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa.
