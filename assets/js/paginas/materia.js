/**
 * @file: assets/js/paginas/materia.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-28
 * @versao: 0.4.0
 * @descricao: Leitura de uma matéria (#/materia/<id>). Acha a data no índice, baixa só o arquivo do mês
 *             (dados/textos/noticias/AAAA-MM.json) e mostra:
 *               - cabeçalho: trilha + botão "Ler na fonte original" na mesma linha; título; barra de
 *                 metadados com a mesma largura do título; resumo;
 *               - texto integral com imagem em proporção fixa (16:9) e o link para a fonte no fim;
 *               - painel lateral para pesquisa: ficha (data, veículo, autor, idioma, país, relevância,
 *                 palavras, tipo de fonte, fonte primária, id), temas, trechos, países, lugares, pessoas,
 *                 instituições, valores (com tipo), % de obra, fatos realizados, prazos, quantidades, PDFs
 *                 citados, tags do veículo, termos que classificaram a matéria e referência ABNT.
 * @requisitos: dados v3.
 */
import { carregar } from '../dados/carregador.js';
import { posicao } from '../dados/consultas.js';
import { t, numero, dataCurta, locale, idiomaAtual } from '../i18n.js';
import { h, icone, carregando, erro, paragrafos, seloNivel, cabecalhoPagina, maiuscula } from '../ui/dom.js';
import { rotulo } from '../rotulos.js';

function moeda(v) {
  try {
    return new Intl.NumberFormat(locale(), { style: 'currency', currency: v.moeda, notation: 'compact', maximumFractionDigits: 1 }).format(v.valor);
  } catch {
    return v.texto;                                      // moeda desconhecida ("$")
  }
}

const MESES_ABNT = ['jan.', 'fev.', 'mar.', 'abr.', 'maio', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];
const dataAbnt = (iso) => {
  if (!iso) return 's.d.';
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} ${MESES_ABNT[(m || 1) - 1]} ${a}`;
};

/** Referência ABNT (NBR 6023) de matéria online. */
function referenciaAbnt(doc, veiculo) {
  const hoje = new Date().toISOString().slice(0, 10);
  let autoria = '';
  const autor = (doc.autor || '').split(/,| e | y /)[0].trim();
  if (autor && autor.split(/\s+/).length >= 2 && !/reda[cç][aã]o|agência|agencia|assessoria/i.test(autor)) {
    const partes = autor.split(/\s+/);
    autoria = `${partes.pop().toUpperCase()}, ${partes.join(' ')}. `;
  }
  const titulo = autoria ? doc.titulo : doc.titulo.replace(/^(\S+)/, (w) => w.toUpperCase());
  return `${autoria}${titulo}. ${veiculo}, ${dataAbnt(doc.data)}. Disponível em: ${doc.url}. Acesso em: ${dataAbnt(hoje)}.`;
}

const fichas = (pares) => h('dl', { class: 'ficha' }, pares.filter(([, v]) => v !== '' && v != null)
  .flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
const chips = (lista) => h('p', { class: 'etiquetas' }, lista.map((x) => h('span', {}, x)));

export async function montar(alvo, [id]) {
  alvo.append(carregando());
  try {
    const [dic, idx] = await Promise.all([carregar('dic.json'), carregar('indice/noticias.json')]);
    const i = posicao(idx, id);
    const mes = i == null ? null : (idx.dados.d[i] ? idx.dados.d[i].slice(0, 7) : 'sem-data');
    const textos = mes ? await carregar(`textos/noticias/${mes}.json`) : null;
    const doc = textos?.[id];
    if (!doc) { alvo.replaceChildren(erro(t('materia.nao_encontrada'))); return null; }
    const D = idx.dados;
    const site = dic.sites[D.s[i]];
    const nivel = dic.niveis[D.r[i]];
    const veiculo = site?.nome || doc.site;
    const traduzida = D.g[i] !== D.id[i] || D.g.some((g, k) => g === D.id[i] && k !== i);

    // ------------------------------------------------------------------ painel lateral
    const lado = [];
    const bloco = (titulo, conteudo) => { if (conteudo) lado.push(h('h3', {}, titulo), conteudo); };
    const lista = (itens) => (itens.length ? h('ul', { class: 'fatos' }, itens) : null);

    bloco(t('m.ficha'), fichas([
      [t('m.data'), dataCurta(doc.data)],
      [t('m.veiculo'), site?.url ? h('a', { href: site.url, target: '_blank', rel: 'noopener' }, veiculo) : veiculo],
      [t('m.autor'), doc.autor],
      [t('m.idioma'), (dic.idiomas[D.l[i]] || '').toUpperCase()],
      [t('m.pais_fonte'), site?.pais ? rotulo('pais', site.pais) : ''],
      [t('m.relevancia'), seloNivel(nivel)],
      [t('m.palavras'), D.n[i] ? numero(D.n[i]) : ''],
      [t('m.tipo_fonte'), maiuscula(doc.tipo_fonte || '')],
      [t('m.fonte_primaria'), doc.fonte],
      [t('m.id'), h('code', {}, id)],
    ]));
    if (traduzida) lado.push(h('p', { class: 'aviso-mini' }, icone('bx-transfer-alt'), t('m.traducao')));
    bloco(t('m.temas'), D.tm[i].length ? chips(D.tm[i].map((c) => rotulo('tema', dic.temas[c]))) : null);
    bloco(t('m.trechos'), D.tr[i].length ? chips(D.tr[i].map((c) => rotulo('trecho', dic.trechos[c]?.id))) : null);
    bloco(t('m.paises'), D.p[i].length ? chips(D.p[i].map((c) => rotulo('pais', dic.paises[c]))) : null);
    bloco(t('materia.lugares'), doc.lugares?.length ? chips(doc.lugares) : null);
    bloco(t('materia.atores'), lista((doc.atores || []).slice(0, 12).map((a) => h('li', {},
      h('b', {}, a.nome), a.cargo ? h('span', {}, maiuscula(a.cargo)) : null, a.mencoes > 1 ? h('small', {}, `×${a.mencoes}`) : null))));
    bloco(t('m.entidades'), lista((doc.entidades || []).slice(0, 12).map((e) => h('li', {},
      h('b', {}, e.nome), e.tipo ? h('span', { class: 'selo' }, e.tipo) : null, e.pais ? h('span', { class: 'pais' }, e.pais) : null))));
    bloco(t('materia.valores'), lista((doc.valores || []).slice(0, 12).map((v) => h('li', {},
      h('b', {}, moeda(v)), h('span', { class: `selo selo-valor-${v.tipo_valor || 'outro'}` }, rotulo('valor', v.tipo_valor || 'outro')),
      v.trecho ? h('small', {}, rotulo('trecho', v.trecho)) : null))));
    bloco(t('materia.percentuais'), lista((doc.percentuais_obra || []).map((q) => h('li', {},
      h('b', {}, `${numero(q.valor)}%`), h('small', {}, q.trecho ? rotulo('trecho', q.trecho) : '—')))));
    bloco(t('materia.eventos'), lista((doc.eventos_realizados || []).map((e) => h('li', {},
      h('span', { class: 'selo selo-nucleo' }, rotulo('evento', e.tipo)), h('small', {}, e.frase)))));
    bloco(t('m.marcos'), lista((doc.marcos || []).slice(0, 8).map((mc) => h('li', {},
      h('b', {}, [mc.mes, mc.ano].filter(Boolean).join(' ')), h('span', { class: 'selo' }, mc.tipo), h('small', {}, mc.trecho)))));
    bloco(t('m.quantidades'), lista((doc.quantidades || []).slice(0, 10).map((q) => h('li', {}, h('b', {}, q.texto)))));
    bloco(t('m.pdfs'), lista((doc.links_pdf || []).slice(0, 10).map((u) => h('li', {},
      h('a', { href: u, target: '_blank', rel: 'noopener' }, icone('bx-file'), ' ', decodeURIComponent(u.split('/').pop() || u).slice(0, 60))))));
    bloco(t('m.tags'), doc.tags?.length ? chips(doc.tags.slice(0, 20)) : null);
    bloco(t('m.evidencias'), doc.evidencias?.length ? chips(doc.evidencias) : null);
    const ref = referenciaAbnt(doc, veiculo);
    const botaoCopiar = h('button', { class: 'botao botao-pequeno botao-fantasma', type: 'button', onclick: async () => {
      try { await navigator.clipboard.writeText(ref); botaoCopiar.lastChild.textContent = t('m.copiado'); } catch { /* sem permissão */ }
    } }, icone('bx-copy'), h('span', {}, t('m.copiar')));
    bloco(t('m.citar'), h('div', { class: 'citacao' }, h('p', {}, ref), botaoCopiar));

    // ------------------------------------------------------------------ página
    const fonte = (classe = '') => h('a', { class: `botao ${classe}`, href: doc.url, target: '_blank', rel: 'noopener noreferrer' },
      icone('bx-link-external'), t('materia.fonte'));
    alvo.replaceChildren(
      h('div', { class: 'materia-topo' },
        cabecalhoPagina({ trilha: [[t('nav.dashboard'), '#/dashboard'], t('nav.materia')], acao: fonte() }),
        h('div', { class: 'materia-cabeca' },
          h('h1', {}, doc.titulo),
          h('div', { class: 'materia-meta' },
            h('span', { class: 'materia-meta-grupo' }, seloNivel(nivel), h('span', { class: 'pais' }, site?.pais || ''), h('b', {}, veiculo)),
            h('span', { class: 'materia-meta-grupo' }, icone('bx-calendar'), dataCurta(doc.data),
              doc.autor ? [h('span', { class: 'ponto' }, '·'), icone('bx-user'), doc.autor] : null)),
          doc.resumo ? h('p', { class: 'materia-resumo' }, doc.resumo) : null)),
      h('div', { class: 'materia-grade' },
        h('article', { class: 'cartao materia-texto', lang: idiomaAtual() === (dic.idiomas[D.l[i]] || 'pt') ? null : dic.idiomas[D.l[i]] },
          doc.imagem ? h('figure', { class: 'materia-figura' }, h('img', { src: doc.imagem, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer',
            onerror: (ev) => ev.target.closest('figure').remove() })) : null,
          doc.texto_integral && doc.conteudo ? paragrafos(doc.conteudo) : h('p', { class: 'aviso' }, icone('bx-lock-alt'), t('materia.resumo_apenas')),
          h('p', { class: 'materia-fim' }, fonte('botao-pequeno'))),
        lado.length ? h('aside', { class: 'cartao materia-lado' }, h('h2', {}, t('materia.dados')), lado) : null));
  } catch {
    alvo.replaceChildren(erro(t('erro.dados'), () => location.reload()));
  }
  return null;
}
