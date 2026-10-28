/**
 * @file: assets/js/roteador.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Rotas por hash (funcionam no GitHub Pages sem configurar servidor):
 *               #/dashboard[/secao]   página inicial (por enquanto) — o subitem rola até a seção
 *               #/materia/<id>        leitura de uma matéria
 *               #/busca/<termo>       busca por título
 *               #/sobre[/secao]       sobre o projeto, fontes, método, dados
 *               #/semantico | #/gestao | #/agente   seções das próximas fases
 *             Cada página é um módulo carregado sob demanda com `montar(alvo, params)`, que pode
 *             devolver uma função de desmontagem. Trocar só o subitem da página atual apenas rola.
 * @requisitos: nenhum.
 */
import { descartarTodos } from './ui/graficos.js';

const PAGINAS = {
  dashboard: () => import('./paginas/dashboard.js'),
  materia: () => import('./paginas/materia.js'),
  busca: () => import('./paginas/busca.js'),
  sobre: () => import('./paginas/sobre.js'),
  semantico: () => import('./paginas/futura.js'),
  gestao: () => import('./paginas/futura.js'),
  agente: () => import('./paginas/futura.js'),
};

let atual = { secao: null, desmontar: null, rolar: null };
let geracao = 0;
const ouvintes = new Set();

export function rotaAtual() {
  const [secao = '', ...params] = location.hash.replace(/^#\/?/, '').split('/').map((p) => decodeURIComponent(p));
  return { secao: PAGINAS[secao] ? secao : 'dashboard', params };
}

export const aoNavegar = (fn) => ouvintes.add(fn);

export async function navegar(forcar = false) {
  const minha = ++geracao;
  const rota = rotaAtual();
  ouvintes.forEach((fn) => fn(rota));
  if (!forcar && rota.secao === atual.secao && atual.rolar) {   // mesma página: só muda a seção
    atual.rolar(rota.params[0]);
    return;
  }
  const alvo = document.getElementById('conteudo');
  if (typeof atual.desmontar === 'function') atual.desmontar();
  descartarTodos();
  atual = { secao: null, desmontar: null, rolar: null };
  const modulo = await PAGINAS[rota.secao]();
  if (minha !== geracao) return;
  alvo.replaceChildren();
  window.scrollTo(0, 0);
  const res = await modulo.montar(alvo, rota.params, rota.secao);
  if (minha !== geracao) { if (typeof res?.desmontar === 'function') res.desmontar(); return; }
  atual = { secao: rota.secao, desmontar: res?.desmontar || null, rolar: res?.rolar || null };
  if (rota.params[0] && atual.rolar) requestAnimationFrame(() => atual.rolar?.(rota.params[0], true));
}

export function iniciarRoteador() {
  window.addEventListener('hashchange', () => navegar());
  return navegar(true);
}
