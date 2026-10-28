/**
 * @file: assets/js/ui/graficos.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Camada fina sobre o Apache ECharts (área, colunas, barras, rosca, radar, histograma,
 *             dispersão, box plot, mapa de calor). Cada gráfico é criado com uma função
 *             `opcoes(p)` que recebe a paleta do tema; ao trocar claro/escuro ou idioma todos são
 *             redesenhados, e um ResizeObserver acompanha o tamanho do cartão.
 * @requisitos: echarts 5 (import map em index.html).
 */
import * as echarts from 'echarts';
import { paleta, aoMudarTema } from './tema.js';

const ativos = new Set();
const observador = new ResizeObserver((entradas) => {
  for (const e of entradas) for (const g of ativos) if (g.el === e.target) g.inst.resize();
});
aoMudarTema(() => ativos.forEach((g) => desenhar(g)));

/** Estilo comum: fontes, dica (tooltip) e cores do tema. */
function base(p) {
  return {
    color: p.series,
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'Inter, system-ui, sans-serif', color: p.texto2 },
    animationDuration: 700,
    animationEasing: 'cubicOut',
    tooltip: {
      backgroundColor: p.dica, borderColor: p.borda, borderWidth: 1, padding: [8, 12],
      textStyle: { color: p.texto, fontSize: 12 }, extraCssText: 'border-radius:8px;backdrop-filter:blur(8px);',
    },
    legend: { textStyle: { color: p.texto2 }, icon: 'roundRect', itemWidth: 10, itemHeight: 10, top: 0 },
  };
}

function desenhar(g) {
  const p = paleta();
  const b = base(p);
  const o = g.opcoes(p);
  // legenda e dica do gráfico completam (não substituem) o estilo do tema
  const juntar = (chave) => (o[chave] === undefined ? b[chave] : { ...b[chave], ...o[chave],
    textStyle: { ...b[chave].textStyle, ...(o[chave].textStyle || {}) } });
  const legenda = o.legend === undefined ? { show: false } : juntar('legend');     // sem legenda se o gráfico não pede
  g.inst.setOption({ ...b, ...o, legend: legenda, tooltip: juntar('tooltip') }, true);
}

/** Cria um gráfico em `el`. Devolve {atualizar(opcoes), inst}. */
export function grafico(el, opcoes) {
  const g = { el, opcoes, inst: echarts.init(el, null, { renderer: 'canvas' }) };
  ativos.add(g);
  observador.observe(el);
  desenhar(g);
  return { inst: g.inst, atualizar: (novas) => { g.opcoes = novas; desenhar(g); } };
}

/** Descarta todos os gráficos da página (ao navegar). */
export function descartarTodos() {
  for (const g of ativos) { observador.unobserve(g.el); g.inst.dispose(); }
  ativos.clear();
}

export const redesenharTodos = () => ativos.forEach((g) => desenhar(g));

/* ---- auxiliares de eixo/grade usados pelas páginas ---- */
export const grade = (extra = {}) => ({ left: 8, right: 16, top: 36, bottom: 8, containLabel: true, ...extra });
export const eixoCategoria = (p, dados, extra = {}) => ({
  type: 'category', data: dados, axisLine: { lineStyle: { color: p.linha } }, axisTick: { show: false },
  axisLabel: { color: p.texto2, fontSize: 11 }, ...extra,
});
export const eixoValor = (p, extra = {}) => ({
  type: 'value', splitLine: { lineStyle: { color: p.linha } }, axisLabel: { color: p.texto2, fontSize: 11 }, ...extra,
});
/** Gradiente vertical para áreas (cor → transparente). */
export const gradiente = (cor, alfa = 0.45) => new echarts.graphic.LinearGradient(0, 0, 0, 1, [
  { offset: 0, color: comAlfa(cor, alfa) }, { offset: 1, color: comAlfa(cor, 0) }]);

export function comAlfa(cor, a) {
  const m = cor.match(/^#([0-9a-f]{6})$/i);
  if (!m) return cor;
  const n = parseInt(m[1], 16);
  return `rgba(${n >> 16}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
