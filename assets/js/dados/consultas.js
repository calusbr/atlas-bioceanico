/**
 * @file: assets/js/dados/consultas.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-28
 * @versao: 0.4.0
 * @descricao: Consultas sobre as tabelas colunares {colunas, n, dados}. `agregar()` percorre o índice
 *             UMA vez com o filtro do Dashboard e devolve tudo que os gráficos precisam (série mensal,
 *             anos, calendário, fontes, países, temas, lugares, trechos, histograma, recentes).
 *             Contagens são ÚNICAS: só o representante do grupo de tradução (g === id) conta.
 * @requisitos: nenhum.
 */

export const linha = (tab, i) => Object.fromEntries(tab.colunas.map((c) => [c, tab.dados[c][i]]));

const indices = new WeakMap();
/** Posição de um id na tabela (mapa memorizado por tabela). */
export function posicao(tab, id) {
  if (!indices.has(tab)) indices.set(tab, new Map(tab.dados.id.map((v, i) => [v, i])));
  return indices.get(tab).get(id);
}

export const representante = (idx, i) => idx.dados.g[i] === idx.dados.id[i];

/** Faixa de anos com dados no índice. */
export function anosDisponiveis(idx) {
  let min = '9999', max = '0000';
  for (const d of idx.dados.d) if (d) { const a = d.slice(0, 4); if (a < min) min = a; if (a > max) max = a; }
  return [Number(min), Number(max)];
}

/** Filtro do Dashboard → função (i) => boolean. f = {de, ate, pais, site, nivel, idioma}; '' = todos. */
export function criarFiltro(idx, dic, f, [anoMin, anoMax]) {
  const paisSite = dic.sites.map((s) => s.pais);
  const periodoTotal = f.de <= anoMin && f.ate >= anoMax;
  const nivel = f.nivel ? dic.niveis.indexOf(f.nivel) : -1;
  const idioma = f.idioma ? dic.idiomas.indexOf(f.idioma) : -1;
  const de = String(f.de), ate = `${f.ate}-99`;
  const { d, s, r, l } = idx.dados;
  const site = f.site === '' || f.site == null ? -1 : Number(f.site);
  return (i) => {
    if (site >= 0 && s[i] !== site) return false;
    if (nivel >= 0 && r[i] !== nivel) return false;
    if (idioma >= 0 && l[i] !== idioma) return false;
    if (f.pais && paisSite[s[i]] !== f.pais) return false;
    if (!periodoTotal && (!d[i] || d[i] < de || d[i] > ate)) return false;
    return true;
  };
}

function quantis(ordenados) {
  const q = (p) => {
    const pos = (ordenados.length - 1) * p;
    const b = Math.floor(pos);
    return ordenados[b] + (ordenados[Math.min(b + 1, ordenados.length - 1)] - ordenados[b]) * (pos - b);
  };
  return [ordenados[0], q(0.25), q(0.5), q(0.75), ordenados[ordenados.length - 1]];
}

/** Tudo que o Dashboard desenha, numa passada. */
export function agregar(idx, dic, filtro) {
  const nNiv = dic.niveis.length;
  const { d, s, r, l, tm, lg, tr, n: palavras, id } = idx.dados;
  const mes = new Map(), ano = new Map(), calor = new Map();
  const porSite = new Map(), porPaisFonte = new Map(), porIdioma = new Map();
  const temas = new Map(), temasPais = new Map(), lugares = new Map(), trechos = new Map();
  const faixas = [0, 100, 200, 300, 400, 500, 700, 1000, 1500, 2000, Infinity];
  const hist = new Array(faixas.length - 1).fill(0);
  const recentes = [];
  let total = 0, nucleo = 0;
  const iNucleo = dic.niveis.indexOf('nucleo');

  for (let i = 0; i < idx.n; i++) {
    if (idx.dados.g[i] !== id[i] || !filtro(i)) continue;
    total += 1;
    if (r[i] === iNucleo) nucleo += 1;
    recentes.push(i);
    const pais = dic.sites[s[i]]?.pais || '?';
    if (d[i]) {
      const m = d[i].slice(0, 7), a = d[i].slice(0, 4);
      if (!mes.has(m)) mes.set(m, new Array(nNiv).fill(0));
      mes.get(m)[r[i]] += 1;
      if (!ano.has(a)) ano.set(a, new Array(nNiv).fill(0));
      ano.get(a)[r[i]] += 1;
      calor.set(m, (calor.get(m) || 0) + 1);
    }
    const st = porSite.get(s[i]) || { n: 0, nucleo: 0 };
    st.n += 1; if (r[i] === iNucleo) st.nucleo += 1;
    porSite.set(s[i], st);
    porPaisFonte.set(pais, (porPaisFonte.get(pais) || 0) + 1);
    porIdioma.set(l[i], (porIdioma.get(l[i]) || 0) + 1);
    if (!temasPais.has(pais)) temasPais.set(pais, { n: 0, temas: new Map() });
    const tp = temasPais.get(pais); tp.n += 1;
    for (const c of tm[i]) { temas.set(c, (temas.get(c) || 0) + 1); tp.temas.set(c, (tp.temas.get(c) || 0) + 1); }
    for (const c of lg[i]) lugares.set(c, (lugares.get(c) || 0) + 1);
    for (const c of tr[i]) trechos.set(c, (trechos.get(c) || 0) + 1);
    const k = faixas.findIndex((f, j) => palavras[i] >= f && palavras[i] < faixas[j + 1]);
    if (k >= 0 && palavras[i] > 0) hist[k] += 1;
  }

  // meses contínuos (sem buracos) entre o primeiro e o último com dados
  const chaves = [...mes.keys()].sort();
  const meses = [];
  if (chaves.length) {
    let [a, m] = chaves[0].split('-').map(Number);
    const fim = chaves[chaves.length - 1];
    for (;;) {
      const k = `${a}-${String(m).padStart(2, '0')}`;
      meses.push(k);
      if (k >= fim) break;
      m += 1; if (m > 12) { m = 1; a += 1; }
    }
  }
  recentes.sort((x, y) => (d[y] || '').localeCompare(d[x] || ''));
  return {
    total, nucleo, recentes,
    meses, porMes: dic.niveis.map((_, j) => meses.map((k) => (mes.get(k) || [])[j] || 0)),
    anos: [...ano.keys()].sort(), porAno: (j) => [...ano.keys()].sort().map((a) => ano.get(a)[j]),
    calor, porSite, porPaisFonte, porIdioma, temas, temasPais, lugares, trechos,
    histograma: { faixas, valores: hist },
  };
}

/** Linhas de uma tabela de gestão dentro do período [de, ate] (anos). */
export function filtrarGestao(tab, de, ate) {
  const a = String(de), b = `${ate}-99`;
  const out = [];
  for (let i = 0; i < tab.n; i++) { const d = tab.dados.d[i]; if (d && d >= a && d <= b) out.push(i); }
  return out;
}

/** Box plot do % de obra por trecho: [{trecho, caixa:[min,q1,med,q3,max], n}]. */
export function caixasPorTrecho(pct, posicoes) {
  const grupos = new Map();
  for (const i of posicoes) {
    const tr = pct.dados.trecho[i];
    if (!tr) continue;
    if (!grupos.has(tr)) grupos.set(tr, []);
    grupos.get(tr).push(pct.dados.valor[i]);
  }
  return [...grupos.entries()].filter(([, v]) => v.length >= 5)
    .map(([trecho, v]) => ({ trecho, caixa: quantis(v.sort((x, y) => x - y)), n: v.length }))
    .sort((a, b) => b.n - a.n);
}

/** Avanço da ponte: maior % divulgado por mês + mediana dos últimos 6 meses (tira ruído pontual). */
export function avancoPonte(pct) {
  const porMes = new Map();
  const { d, valor, trecho } = pct.dados;
  for (let i = 0; i < pct.n; i++) {
    if (trecho[i] !== 'ponte_bioceanica' || !d[i]) continue;
    const m = d[i].slice(0, 7);
    porMes.set(m, Math.max(porMes.get(m) || 0, valor[i]));
  }
  const serie = [...porMes.entries()].sort();
  const ult = serie.slice(-6).map(([, v]) => v).sort((a, b) => a - b);
  const meio = Math.floor(ult.length / 2);
  const mediana = !ult.length ? null : ult.length % 2 ? ult[meio] : (ult[meio - 1] + ult[meio]) / 2;
  return { serie, mediana, ate: serie.length ? serie[serie.length - 1][0] : '' };
}

/** Texto sem acento e minúsculo (busca). */
export const normalizar = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
