/**
 * @file: assets/js/ui/tema.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Modo escuro (padrão) e claro — <html data-tema="escuro|claro">, salvo no navegador.
 *             `paleta()` lê as variáveis CSS para gráficos e mapa seguirem o modo atual;
 *             `aoMudarTema()` avisa quem precisa se redesenhar.
 * @requisitos: nenhum.
 */

const CHAVE = 'atlas.tema';
const ouvintes = new Set();

export function temaAtual() {
  const t = document.documentElement.dataset.tema;
  return t === 'claro' ? 'claro' : 'escuro';
}

export function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  try { localStorage.setItem(CHAVE, tema); } catch { /* ignora */ }
  ouvintes.forEach((fn) => fn(tema));
}

export const alternarTema = () => aplicarTema(temaAtual() === 'escuro' ? 'claro' : 'escuro');

export function aoMudarTema(fn) {
  ouvintes.add(fn);
  return () => ouvintes.delete(fn);
}

const v = (nome) => getComputedStyle(document.documentElement).getPropertyValue(nome).trim().replace(/^['"]|['"]$/g, '');

/** Cores do modo atual. */
export function paleta() {
  return {
    series: [1, 2, 3, 4, 5, 6, 7, 8].map((i) => v(`--serie-${i}`)),
    acento: v('--acento'),
    texto: v('--texto'),
    texto2: v('--grafico-texto'),
    linha: v('--grafico-linha'),
    dica: v('--grafico-dica'),
    borda: v('--borda-forte'),
    fundo: v('--fundo-2'),
    mapa: v('--mapa-estilo'),
    escuro: temaAtual() === 'escuro',
  };
}
