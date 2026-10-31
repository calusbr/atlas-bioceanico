/**
 * @file: assets/js/paginas/busca.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-26
 * @ultima_modificacao: 2026-10-30
 * @versao: 0.4.0
 * @descricao: Busca do cabeçalho (#/busca/<termo>[/<escopo>]):
 *               web    (padrão) todas as palavras do termo nos títulos das matérias, sem diferenciar
 *                      acentos e maiúsculas, da mais recente para a mais antiga;
 *               pdf    documentos oficiais: palavras no título ou no texto do PDF (índice invertido);
 *               todos  os dois blocos, PDFs primeiro.
 *             O escopo é escolhido no cabeçalho quando a busca parte da Gestão de Projeto.
 *             A busca por significado (semântica) chega na Fase D.
 * @requisitos: índice de notícias v3; para PDFs, indice/pdfs.json e indice/pdfs_termos.json.
 */
import { carregar } from '../dados/carregador.js';
import { normalizar, representante } from '../dados/consultas.js';
import { buscarPdfs, limparTitulo } from '../dados/gestao.js';
import { t, numero, dataCurta } from '../i18n.js';
import { h, icone, cartao, carregando, erro, tabelaMaterias } from '../ui/dom.js';
import { rotulo } from '../rotulos.js';

let titulosNorm = null;
const ESCOPOS = ['todos', 'pdf', 'web'];

export async function montar(alvo, [termo = '', escopoRota = '']) {
  const escopo = ESCOPOS.includes(escopoRota) ? escopoRota : 'web';
  document.getElementById('campo-busca').value = termo;
  if (escopoRota) document.getElementById('escopo-busca').value = escopo;
  alvo.append(carregando());
  try {
    const palavras = normalizar(termo).split(/\s+/).filter((p) => p.length >= 2);
    const abas = escopoRota ? h('div', { class: 'abas', role: 'group', 'aria-label': t('busca.escopo') },
      ESCOPOS.map((e) => h('a', { class: 'aba-link', href: `#/busca/${encodeURIComponent(termo)}/${e}`, 'aria-pressed': String(e === escopo) },
        t(`busca.escopo.${e}`)))) : null;
    const topo = h('div', { class: 'pagina-topo' }, h('div', {},
      h('p', { class: 'trilha' }, icone('bx-search'), t('nav.busca')),
      h('h1', {}, t('busca.titulo', { q: termo }))), abas);
    if (normalizar(termo).replace(/\s/g, '').length < 3) {
      alvo.replaceChildren(topo, h('p', { class: 'aviso' }, t('busca.vazia')));
      return null;
    }
    const blocos = [];
    const resumo = [];
    const dic = await carregar('dic.json');

    if (escopo !== 'web') {
      const [pdfs, termos] = await Promise.all([carregar('indice/pdfs.json'), carregar('indice/pdfs_termos.json').catch(() => null)]);
      const noTexto = termos ? buscarPdfs(termos, termo) || new Set() : new Set();
      const achados = [];
      for (let i = 0; i < pdfs.n; i++) {
        const tit = normalizar(pdfs.dados.t[i] || '');
        if (noTexto.has(i) || palavras.every((p) => tit.includes(p))) achados.push(i);
      }
      achados.sort((a, b) => (pdfs.dados.d[b] || '').localeCompare(pdfs.dados.d[a] || ''));
      resumo.push(t('busca.n_pdf', { n: numero(achados.length) }));
      blocos.push(cartao({ classe: 'c-12', titulo: t('busca.pdfs'), sub: t('busca.n_pdf', { n: numero(achados.length) }),
        acoes: h('a', { class: 'botao botao-pequeno botao-fantasma', href: '#/gestao/documentos' }, icone('bx-file-find'), t('busca.ver_gestao')),
        corpo: achados.length ? h('div', { class: 'tabela-caixa' }, h('table', { class: 'tabela tabela-docs' },
          h('thead', {}, h('tr', {}, [t('ges.col.data'), t('ges.col.documento'), t('ges.col.tipo'), ''].map((c) => h('th', {}, c)))),
          h('tbody', {}, achados.slice(0, 50).map((i) => h('tr', {},
            h('td', { style: { whiteSpace: 'nowrap' } }, pdfs.dados.d[i] ? dataCurta(pdfs.dados.d[i]) : '—'),
            h('td', {}, limparTitulo(pdfs.dados.t[i])),
            h('td', {}, h('span', { class: 'selo' }, rotulo('doc', dic.doc_tipos[pdfs.dados.k[i]]))),
            h('td', { class: 'acoes-doc' }, pdfs.dados.u?.[i] ? h('a', { class: 'botao botao-pequeno', href: pdfs.dados.u[i], target: '_blank', rel: 'noopener' },
              icone('bx-link-external'), 'PDF') : null))))))
          : h('p', { class: 'vazio' }, t('sem_dados')) }));
    }

    if (escopo !== 'pdf') {
      const idx = await carregar('indice/noticias.json');
      if (!titulosNorm || titulosNorm.length !== idx.n) titulosNorm = idx.dados.t.map(normalizar);
      const achados = [];
      for (let i = 0; i < idx.n; i++) {
        if (representante(idx, i) && palavras.every((p) => titulosNorm[i].includes(p))) achados.push(i);
      }
      achados.sort((a, b) => (idx.dados.d[b] || '').localeCompare(idx.dados.d[a] || ''));
      resumo.push(t('busca.n', { n: numero(achados.length) }));
      blocos.push(cartao({ classe: 'c-12', titulo: escopoRota ? t('busca.materias') : null, sub: escopoRota ? t('busca.n', { n: numero(achados.length) }) : null,
        corpo: tabelaMaterias(idx, dic, achados, 20) }));
    }
    topo.firstChild.append(h('p', {}, resumo.join(' · ')));
    alvo.replaceChildren(topo, ...blocos.map((b) => h('div', { class: 'grade' }, b)));
  } catch {
    alvo.replaceChildren(erro(t('erro.dados'), () => location.reload()));
  }
  return null;
}
