/**
 * @file: assets/js/dados/gestao.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-30
 * @ultima_modificacao: 2026-10-30
 * @versao: 0.7.0
 * @descricao: Consultas da Gestão de Projeto (Fase E) — centrada nos DOCUMENTOS OFICIAIS (PDFs):
 *               indice/pdfs.json      documentos (tipo, data, fonte, temas, países, trechos, lugares, link)
 *               gestao/pdf_fatos.json fatos de obra citados nos PDFs (valor, %, evento, prazo — regras estritas)
 *             e, para os gráficos que comparam com a imprensa, as tabelas das matérias (gestao/valores,
 *             percentuais, eventos, promessas; contrato 3.2+).
 *             Fontes do filtro: 'corredor' = corredorbioceanico.org (padrão); 'oficiais' = + ObservaRota, BID
 *             (arquivos manuais) e MOPC; 'todos' = todos os PDFs.
 * @requisitos: nenhum.
 */
import { normalizar } from './consultas.js';

export const FONTES_OFICIAIS = ['corredorbioceanico', 'observarota', 'manual', 'mopc'];

/** Categorias do painel → tipos de documento da PARTE 1 (dic.doc_tipos). */
export const CATEGORIAS = [
  ['atas', 'bx-notepad', ['ata']],
  ['declaracoes', 'bx-pen', ['declaracao']],
  ['relatorios', 'bx-file', ['informe', 'relatorio_reuniao']],
  ['estudos', 'bx-book-open', ['estudo', 'documento_projeto', 'termo_referencia', 'plano']],
  ['boletins', 'bx-news', ['boletim']],
  ['apresentacoes', 'bx-slideshow', ['apresentacao']],
  ['acordos', 'bx-handshake', ['convenio', 'regimento']],
  ['agendas', 'bx-calendar-event', ['agenda', 'lista_participantes']],
  ['outros', 'bx-folder', ['outro']],
];
export const categoriaDoTipo = (tipo) => (CATEGORIAS.find(([, , tipos]) => tipos.includes(tipo)) || CATEGORIAS[CATEGORIAS.length - 1])[0];

/** "Mesa … Año 2022 | Actas" → "Mesa …" (sufixo de listagem do site do corredor). */
export const limparTitulo = (t) => (t || '').replace(/\s+/g, ' ').replace(/\s*A[ñn]o \d{4}\s*\|.*$/i, '').replace(/\s*\|\s*[^|]+$/, '').trim();

/** Posições dos PDFs no filtro f = {fonte, de, ate, trecho, pais, categoria}. */
export function filtrarPdfs(pdfs, dic, f) {
  const site = dic.sites.map((s) => s.id);
  const iTrecho = f.trecho ? dic.trechos.findIndex((t) => t.id === f.trecho) : -1;
  const iPais = f.pais ? dic.paises.indexOf(f.pais) : -1;
  const { d, s, k, tr, p } = pdfs.dados;
  const out = [];
  for (let i = 0; i < pdfs.n; i++) {
    const sid = site[s[i]];
    if (f.fonte === 'corredor' && sid !== 'corredorbioceanico') continue;
    if (f.fonte === 'oficiais' && !FONTES_OFICIAIS.includes(sid)) continue;
    const ano = d[i] ? Number(d[i].slice(0, 4)) : null;
    if (ano != null && (ano < f.de || ano > f.ate)) continue;
    if (iTrecho >= 0 && !tr[i].includes(iTrecho)) continue;
    if (iPais >= 0 && !p[i].includes(iPais)) continue;
    if (f.categoria && categoriaDoTipo(dic.doc_tipos[k[i]]) !== f.categoria) continue;
    out.push(i);
  }
  return out;
}

/** Fatos dos PDFs filtrados (posições em pdf_fatos), opcionalmente de um grupo. */
export function fatosDosPdfs(fatos, idsPdf, f, grupo) {
  const out = [];
  const { id, grupo: g, trecho, pais } = fatos.dados;
  for (let i = 0; i < fatos.n; i++) {
    if (!idsPdf.has(id[i])) continue;
    if (grupo && g[i] !== grupo) continue;
    if (f.trecho && trecho[i] !== f.trecho) continue;
    if (f.pais && pais[i] && pais[i] !== f.pais) continue;
    out.push(i);
  }
  return out;
}

/** Linhas das tabelas das matérias (web) no filtro: período pela data, trecho, país (do fato ou do trecho). */
export function filtrarWeb(tab, dic, f) {
  if (!tab) return [];
  const paisTrecho = Object.fromEntries(dic.trechos.map((tr) => [tr.id, tr.pais || '']));
  const de = String(f.de), ate = `${f.ate}-99`;
  const { d, trecho, pais, ok } = tab.dados;
  const out = [];
  for (let i = 0; i < tab.n; i++) {
    if (!d[i] || d[i] < de || d[i] > ate) continue;
    if (f.trecho && trecho[i] !== f.trecho) continue;
    if (f.pais && (pais[i] || paisTrecho[trecho[i]] || '') !== f.pais) continue;
    if (ok && !ok[i]) continue;
    out.push(i);
  }
  return out;
}

/** Investimento citado: valores distintos (±1%) de contratado/financiado/previsto, somados em US$. */
export function investimentoCitado(fatos, pos) {
  const { tipo, usd } = fatos.dados;
  const vistos = [];
  let total = 0;
  for (const i of pos) {
    if (!['contratado', 'financiado', 'previsto'].includes(tipo[i]) || usd[i] == null) continue;
    if (vistos.some((v) => Math.abs(v - usd[i]) <= 0.01 * v)) continue;
    vistos.push(usd[i]);
    total += usd[i];
  }
  return { total, distintos: vistos.length };
}

/** Último % de um trecho em linhas [{d, valor}] e mediana dos 6 mais recentes. */
export function resumoPct(linhas) {
  if (!linhas.length) return null;
  const ord = [...linhas].sort((a, b) => a.d.localeCompare(b.d));
  const ult = ord.slice(-6).map((x) => x.valor).sort((a, b) => a - b);
  const meio = Math.floor(ult.length / 2);
  return { ultimo: ord[ord.length - 1], mediana: ult.length % 2 ? ult[meio] : (ult[meio - 1] + ult[meio]) / 2, n: ord.length };
}

/** Busca no acervo: todas as palavras (prefixo, ≥ 3 letras) precisam aparecer no documento. */
export function buscarPdfs(termos, consulta) {
  const palavras = normalizar(consulta).split(/[^a-z0-9-]+/).filter((p) => p.length >= 3);
  if (!palavras.length) return null;
  let docs = null;
  for (const p of palavras) {
    const achados = new Set();
    let lo = 0, hi = termos.termos.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (termos.termos[m] < p) lo = m + 1; else hi = m; }
    for (let k = lo; k < termos.termos.length && termos.termos[k].startsWith(p); k++) termos.docs[k].forEach((x) => achados.add(x));
    docs = docs ? new Set([...docs].filter((x) => achados.has(x))) : achados;
    if (!docs.size) break;
  }
  return docs;
}
