/**
 * @file: assets/js/paginas/busca.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-26
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Busca do cabeçalho (#/busca/<termo>): procura todas as palavras do termo nos títulos,
 *             sem diferenciar acentos e maiúsculas, e lista as matérias únicas da mais recente para a
 *             mais antiga. A busca por significado (semântica) chega na Fase D.
 * @requisitos: índice de notícias v3.
 */
import { carregar } from '../dados/carregador.js';
import { normalizar, representante } from '../dados/consultas.js';
import { t, numero } from '../i18n.js';
import { h, icone, cartao, carregando, erro, tabelaMaterias } from '../ui/dom.js';

let titulosNorm = null;

export async function montar(alvo, [termo = '']) {
  document.getElementById('campo-busca').value = termo;
  alvo.append(carregando());
  try {
    const [dic, idx] = await Promise.all([carregar('dic.json'), carregar('indice/noticias.json')]);
    const palavras = normalizar(termo).split(/\s+/).filter((p) => p.length >= 2);
    const topo = h('div', { class: 'pagina-topo' }, h('div', {},
      h('p', { class: 'trilha' }, icone('bx-search'), t('nav.busca')),
      h('h1', {}, t('busca.titulo', { q: termo }))));
    if (normalizar(termo).replace(/\s/g, '').length < 3) {
      alvo.replaceChildren(topo, h('p', { class: 'aviso' }, t('busca.vazia')));
      return null;
    }
    if (!titulosNorm || titulosNorm.length !== idx.n) titulosNorm = idx.dados.t.map(normalizar);
    const achados = [];
    for (let i = 0; i < idx.n; i++) {
      if (representante(idx, i) && palavras.every((p) => titulosNorm[i].includes(p))) achados.push(i);
    }
    achados.sort((a, b) => (idx.dados.d[b] || '').localeCompare(idx.dados.d[a] || ''));
    topo.firstChild.append(h('p', {}, t('busca.n', { n: numero(achados.length) })));
    alvo.replaceChildren(topo, h('div', { class: 'grade' },
      cartao({ classe: 'c-12', corpo: tabelaMaterias(idx, dic, achados, 20) })));
  } catch {
    alvo.replaceChildren(erro(t('erro.dados'), () => location.reload()));
  }
  return null;
}
