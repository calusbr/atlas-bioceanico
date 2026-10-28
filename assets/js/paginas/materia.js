/**
 * @file: assets/js/paginas/materia.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Leitura de uma matéria (#/materia/<id>). Acha a data no índice, baixa só o arquivo do mês
 *             (dados/textos/noticias/AAAA-MM.json) e mostra o texto integral com veículo, data e o link
 *             para a fonte original (obrigatório). Ao lado, os dados extraídos pela PARTE 1: valores
 *             com tipo, % de obra, fatos realizados, pessoas e lugares.
 * @requisitos: dados v3.
 */
import { carregar } from '../dados/carregador.js';
import { posicao } from '../dados/consultas.js';
import { t, numero, dataCurta, locale } from '../i18n.js';
import { h, icone, carregando, erro, paragrafos, seloNivel } from '../ui/dom.js';
import { rotulo } from '../rotulos.js';

function moeda(v) {
  try {
    return new Intl.NumberFormat(locale(), { style: 'currency', currency: v.moeda, notation: 'compact', maximumFractionDigits: 1 }).format(v.valor);
  } catch {
    return v.texto;                                      // moeda desconhecida ("$")
  }
}

export async function montar(alvo, [id]) {
  alvo.append(carregando());
  try {
    const [dic, idx] = await Promise.all([carregar('dic.json'), carregar('indice/noticias.json')]);
    const i = posicao(idx, id);
    const mes = i == null ? null : (idx.dados.d[i] ? idx.dados.d[i].slice(0, 7) : 'sem-data');
    const textos = mes ? await carregar(`textos/noticias/${mes}.json`) : null;
    const doc = textos?.[id];
    if (!doc) { alvo.replaceChildren(erro(t('materia.nao_encontrada'))); return null; }
    const site = dic.sites[idx.dados.s[i]];
    const nivel = dic.niveis[idx.dados.r[i]];

    const lado = [];
    const bloco = (titulo, itens) => { if (itens.length) lado.push(h('h3', {}, titulo), h('ul', { class: 'fatos' }, itens)); };
    bloco(t('materia.valores'), (doc.valores || []).slice(0, 12).map((v) => h('li', {},
      h('b', {}, moeda(v)), h('span', { class: 'selo' }, rotulo('valor', v.tipo_valor || 'outro')),
      v.trecho ? h('small', {}, rotulo('trecho', v.trecho)) : null)));
    bloco(t('materia.percentuais'), (doc.percentuais_obra || []).map((q) => h('li', {},
      h('b', {}, `${numero(q.valor)}%`), h('small', {}, q.trecho ? rotulo('trecho', q.trecho) : '—'))));
    bloco(t('materia.eventos'), (doc.eventos_realizados || []).map((e) => h('li', {},
      h('span', { class: 'selo selo-nucleo' }, rotulo('evento', e.tipo)), h('small', {}, e.frase))));
    bloco(t('materia.atores'), (doc.atores || []).slice(0, 8).map((a) => h('li', {}, h('b', {}, a.nome), a.cargo ? h('small', {}, a.cargo) : null)));
    if (doc.lugares?.length) lado.push(h('h3', {}, t('materia.lugares')), h('p', { class: 'etiquetas' }, doc.lugares.map((l) => h('span', {}, l))));

    alvo.replaceChildren(
      h('div', { class: 'pagina-topo' }, h('div', {},
        h('p', { class: 'trilha' }, icone('bx-home-alt'), h('a', { href: '#/dashboard' }, t('nav.dashboard')), icone('bx-chevron-right'), t('nav.materia')),
        h('p', { class: 'trilha' }, seloNivel(nivel), h('span', { class: 'pais' }, site?.pais || ''),
          ` ${site?.nome || doc.site} · ${dataCurta(doc.data)}${doc.autor ? ` · ${doc.autor}` : ''}`),
        h('h1', {}, doc.titulo),
        doc.resumo ? h('p', { class: 'materia-resumo' }, doc.resumo) : null),
      h('a', { class: 'botao', href: doc.url, target: '_blank', rel: 'noopener noreferrer' }, icone('bx-link-external'), t('materia.fonte'))),
      h('div', { class: 'materia-grade' },
        h('article', { class: 'cartao materia-texto' },
          doc.imagem ? h('img', { src: doc.imagem, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer', onerror: (ev) => ev.target.remove() }) : null,
          doc.texto_integral && doc.conteudo ? paragrafos(doc.conteudo) : h('p', { class: 'aviso' }, icone('bx-lock-alt'), t('materia.resumo_apenas')),
          h('p', {}, h('a', { class: 'botao botao-pequeno', href: doc.url, target: '_blank', rel: 'noopener noreferrer' }, t('materia.fonte'), icone('bx-right-arrow-alt')))),
        lado.length ? h('aside', { class: 'cartao materia-lado' }, h('h2', {}, t('materia.dados')), lado) : null));
  } catch {
    alvo.replaceChildren(erro(t('erro.dados'), () => location.reload()));
  }
  return null;
}
