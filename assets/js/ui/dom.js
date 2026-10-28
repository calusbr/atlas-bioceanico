/**
 * @file: assets/js/ui/dom.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Construtores de DOM das páginas: `h()` (texto sempre escapado), cartão com cabeçalho,
 *             indicador (KPI) com ícone e minigráfico, título de seção, estados de carregamento/erro,
 *             tabela de matérias com paginação e parágrafos de texto.
 * @requisitos: nenhum.
 */
import { t, numero, dataCurta } from '../i18n.js';

/** h('a', {href, class, onclick}, 'texto', nó) — null/false são ignorados. */
export function h(tag, attrs = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'html') el.innerHTML = v;                 // só para textos fixos do i18n (sem dados externos)
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos.flat()) {
    if (f == null || f === false) continue;
    el.append(f instanceof Node ? f : document.createTextNode(String(f)));
  }
  return el;
}

export const icone = (nome) => h('i', { class: `bx ${nome}`, 'aria-hidden': 'true' });

/** Cartão com título, subtítulo, ações à direita e corpo. */
export function cartao({ titulo, sub, acoes, classe = '', corpo, nota, id }) {
  return h('section', { class: `cartao ${classe}`, id },
    titulo ? h('header', { class: 'cartao-cabeca' }, h('div', {}, h('h2', {}, titulo), sub ? h('small', {}, sub) : null), acoes || null) : null,
    corpo,
    nota ? h('p', { class: 'cartao-nota' }, nota) : null);
}

/** Minigráfico de linha (SVG) para os indicadores. */
export function sparkline(valores) {
  const L = 96, A = 26;
  if (!valores?.length) return null;
  const max = Math.max(1, ...valores);
  const x = (i) => (valores.length === 1 ? L : (i / (valores.length - 1)) * L);
  const y = (v) => A - 2 - (v / max) * (A - 4);
  const pts = valores.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`);
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${L} ${A}`);
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<polygon points="0,${A} ${pts.join(' ')} ${L},${A}"></polygon><polyline points="${pts.join(' ')}"></polyline>`;
  return svg;
}

/** Indicador: rótulo, valor grande, ícone (ou anel de %), rodapé com texto e minigráfico. */
export function kpi({ rotulo, valor, iconeNome, anel, pe, serie }) {
  const visual = anel != null
    ? h('span', { class: 'kpi-icone', style: { background: 'none', boxShadow: 'none' } },
      h('span', { class: 'anel', style: `--p:${Math.round(anel)}` }))
    : h('span', { class: 'kpi-icone' }, icone(iconeNome));
  return h('article', { class: 'cartao kpi' },
    h('span', { class: 'kpi-rotulo' }, rotulo),
    h('span', { class: 'kpi-valor' }, valor),
    visual,
    h('span', { class: 'kpi-pe' }, h('span', {}, pe || ''), serie ? sparkline(serie) : null));
}

export const tituloSecao = (id, iconeNome, texto) =>
  h('h2', { class: 'secao-titulo secao-ancora', id: `sec-${id}` }, icone(iconeNome), texto);

export const carregando = () => h('div', { class: 'estado', role: 'status' }, h('span', { class: 'giro' }), t('carregando'));
export const erro = (msg, aoTentar) => h('div', { class: 'estado', role: 'alert' }, icone('bx-error-circle'), h('p', {}, msg),
  aoTentar ? h('button', { class: 'botao', onclick: aoTentar }, t('tentar')) : null);

export const paragrafos = (texto) => (texto || '').split(/\n+/).map((p) => p.trim()).filter(Boolean).map((p) => h('p', {}, p));

export const seloNivel = (nivel) => h('span', { class: `selo selo-${nivel}` }, t(`nivel.${nivel}`));

/**
 * Tabela de matérias com paginação. posicoes = índices no índice de notícias (já ordenados).
 */
export function tabelaMaterias(idx, dic, posicoes, porPagina = 10) {
  const corpo = h('tbody');
  const rodape = h('div', { class: 'paginacao' });
  let pagina = 0;
  const totalPag = Math.max(1, Math.ceil(posicoes.length / porPagina));
  const desenhar = () => {
    corpo.replaceChildren(...posicoes.slice(pagina * porPagina, (pagina + 1) * porPagina).map((i) => {
      const site = dic.sites[idx.dados.s[i]];
      return h('tr', {},
        h('td', {}, h('a', { class: 'titulo-link', href: `#/materia/${idx.dados.id[i]}` }, idx.dados.t[i])),
        h('td', {}, site?.nome || ''),
        h('td', {}, h('span', { class: 'pais' }, site?.pais || '')),
        h('td', { style: { whiteSpace: 'nowrap' } }, dataCurta(idx.dados.d[i])),
        h('td', {}, seloNivel(dic.niveis[idx.dados.r[i]])),
        h('td', {}, (dic.idiomas[idx.dados.l[i]] || '').toUpperCase()));
    }));
    rodape.replaceChildren(
      h('span', {}, t('tab.pagina', { p: numero(pagina + 1), t: numero(totalPag) })),
      h('button', { class: 'botao botao-pequeno botao-fantasma', disabled: pagina === 0, onclick: () => { pagina -= 1; desenhar(); } },
        icone('bx-chevron-left'), t('tab.anterior')),
      h('button', { class: 'botao botao-pequeno botao-fantasma', disabled: pagina >= totalPag - 1, onclick: () => { pagina += 1; desenhar(); } },
        t('tab.proxima'), icone('bx-chevron-right')));
  };
  desenhar();
  if (!posicoes.length) return h('p', { class: 'vazio' }, t('sem_dados'));
  return h('div', {},
    h('div', { class: 'tabela-caixa' }, h('table', { class: 'tabela' },
      h('thead', {}, h('tr', {}, ['tab.titulo', 'tab.fonte', 'tab.pais', 'tab.data', 'tab.nivel', 'tab.idioma'].map((k) => h('th', {}, t(k))))),
      corpo)),
    rodape);
}
