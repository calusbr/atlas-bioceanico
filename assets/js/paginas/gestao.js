/**
 * @file: assets/js/paginas/gestao.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-30
 * @ultima_modificacao: 2026-10-30
 * @versao: 0.7.0
 * @descricao: Gestão de Projeto (Fase E) centrada nos DOCUMENTOS OFICIAIS — atas, declarações, relatórios,
 *             estudos, boletins e apresentações publicados pelo Corredor Bioceânico (corredorbioceanico.org).
 *               filtros       fonte dos documentos, período, trecho, país
 *               indicadores   investimento citado, % concluída, obras entregues, prazos — só PDFs
 *               documentos    categorias com contagem, busca por palavras, lista e FICHA do documento
 *                             (resumo, temas, países, lugares, prazos, valores, compromissos, termos…)
 *                             com link direto para o PDF no site oficial
 *               mapa          lugares citados nos documentos
 *               divulgado × realizado   linhas acumuladas por categoria, prazo prometido × data do
 *                             anúncio e avanço por trecho (base: só PDFs ou PDFs + matérias)
 *               linha do tempo         fatos já ocorridos por tipo, losango = documento oficial
 * @requisitos: contrato de dados 3.3.
 */
import { carregarGestao, carregar, ErroContrato } from '../dados/carregador.js';
import { CATEGORIAS, categoriaDoTipo, limparTitulo, filtrarPdfs, fatosDosPdfs, filtrarWeb, investimentoCitado,
  resumoPct, buscarPdfs } from '../dados/gestao.js';
import { t, numero, dataCurta, locale } from '../i18n.js';
import { h, icone, cartao, kpi, tituloSecao, carregando, erro, cabecalhoPagina } from '../ui/dom.js';
import { grafico, grade, eixoCategoria, eixoValor, gradiente, comAlfa } from '../ui/graficos.js';
import { montarMapa } from '../ui/mapa.js';
import { rotulo } from '../rotulos.js';
import { navegar } from '../roteador.js';

let filtroSalvo = null;
const SECOES = ['documentos', 'mapa', 'divulgado', 'avanco', 'fatos'];
const ENTREGUES = ['conclusao', 'inauguracao', 'entrega'];
const TIPOS_FATO = ['licitacao', 'assinatura', 'aprovacao', 'inicio', 'conclusao', 'entrega', 'inauguracao'];
const ANO_ATUAL = new Date().getFullYear();

export async function montar(alvo) {
  alvo.append(carregando());
  let D;
  try {
    D = await carregarGestao();
    if (!D.fatos) throw new ErroContrato(D.m.contrato);
  } catch (e) {
    alvo.replaceChildren(erro(e instanceof ErroContrato ? t('ges.aviso33', { versao: e.versao }) : t('erro.dados'), () => location.reload()));
    return null;
  }
  const { dic, pdfs, fatos, valores, percentuais, eventos, promessas } = D;
  const anosPdf = pdfs.dados.d.filter(Boolean).map((d) => Number(d.slice(0, 4)));
  const faixa = [Math.min(...anosPdf), Math.max(ANO_ATUAL, ...anosPdf)];
  const f = filtroSalvo || (filtroSalvo = { fonte: 'corredor', de: faixa[0], ate: faixa[1], trecho: '', pais: '', categoria: '', base: 'pdf' });
  const posPdfPorId = new Map(pdfs.dados.id.map((id, i) => [id, i]));

  /* ------------------------------------------------------------------ formatos */
  const dinheiro = (v) => `US$ ${new Intl.NumberFormat(locale(), { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(v)}`;
  const tituloPdf = (i) => limparTitulo(pdfs.dados.t[i]);

  /* ------------------------------------------------------------------ filtro */
  let P;
  const recalcular = () => {
    const docs = filtrarPdfs(pdfs, dic, { ...f, categoria: '' });
    const ids = new Set(docs.map((i) => pdfs.dados.id[i]));
    P = {
      docs, ids,
      lista: f.categoria ? docs.filter((i) => categoriaDoTipo(dic.doc_tipos[pdfs.dados.k[i]]) === f.categoria) : docs,
      valor: fatosDosPdfs(fatos, ids, f, 'valor'), pct: fatosDosPdfs(fatos, ids, f, 'percentual'),
      evento: fatosDosPdfs(fatos, ids, f, 'evento'), prazo: fatosDosPdfs(fatos, ids, f, 'prazo'),
      web: { valores: filtrarWeb(valores, dic, f), percentuais: filtrarWeb(percentuais, dic, f),
        eventos: filtrarWeb(eventos, dic, f), promessas: filtrarWeb(promessas, dic, f) },
    };
  };
  recalcular();

  const sel = (valor, opcoes, aoMudar) => h('select', { class: 'campo', onchange: (ev) => aoMudar(ev.target.value) },
    opcoes.map(([v, r]) => h('option', { value: v, selected: String(v) === String(valor) }, r)));
  const anos = [];
  for (let a = faixa[0]; a <= faixa[1]; a++) anos.push([a, a]);
  const campo = (ic, rot, ...controles) => h('label', { class: 'filtro' },
    h('span', { class: 'filtro-rotulo' }, icone(ic), rot), h('span', { class: 'filtro-controles' }, controles));
  const aplicar = () => { recalcular(); desenhar(); };
  const filtros = h('div', { class: 'cartao filtros', role: 'group', 'aria-label': t('ges.filtros') },
    h('div', { class: 'filtros-campos filtros-gestao' },
      campo('bx-buildings', t('ges.fonte'),
        sel(f.fonte, [['corredor', t('ges.fonte.corredor')], ['oficiais', t('ges.fonte.oficiais')], ['todos', t('ges.fonte.todos')]],
          (v) => { f.fonte = v; aplicar(); })),
      campo('bx-calendar', t('filtro.periodo'),
        sel(f.de, anos, (v) => { f.de = Number(v); if (f.de > f.ate) f.ate = f.de; aplicar(); }),
        h('span', { class: 'filtro-ate' }, t('filtro.ate')),
        sel(f.ate, [...anos].reverse(), (v) => { f.ate = Number(v); if (f.ate < f.de) f.de = f.ate; aplicar(); })),
      campo('bx-git-commit', t('ges.trecho'),
        sel(f.trecho, [['', t('filtro.todos')], ...dic.trechos.filter((tr) => tr.id).map((tr) => [tr.id, `${tr.pais} · ${rotulo('trecho', tr.id)}`])],
          (v) => { f.trecho = v; aplicar(); })),
      campo('bx-world', t('ges.pais'),
        sel(f.pais, [['', t('filtro.todos')], ...['BR', 'PY', 'AR', 'CL'].map((p) => [p, rotulo('pais', p)])], (v) => { f.pais = v; aplicar(); })),
      h('button', { class: 'botao botao-pequeno botao-fantasma filtros-limpar', type: 'button', onclick: () => {
        Object.assign(f, { fonte: 'corredor', de: faixa[0], ate: faixa[1], trecho: '', pais: '', categoria: '', base: 'pdf' });
        navegar(true);
      } }, icone('bx-reset'), t('filtro.limpar'))));

  /* ------------------------------------------------------------------ esqueleto */
  const corpo = () => h('div', { class: 'cartao-corpo' });
  const el = (classe = 'grafico') => h('div', { class: classe });
  const cx = { kpis: h('div', { class: 'grade' }), categorias: h('div', { class: 'categorias-doc' }), lista: h('div'),
    mapa: h('div', { class: 'mapa' }), recentes: corpo() };
  const E = { acumulado: el('grafico grafico-alto'), prazos: el('grafico grafico-alto'), avanco: el('grafico grafico-alto'),
    linha: el('grafico grafico-alto') };
  const abasBase = () => h('div', { class: 'abas', role: 'group', 'aria-label': t('ges.base') },
    [['pdf', t('ges.base.pdf')], ['web', t('ges.base.web')]].map(([v, r]) => h('button', { 'aria-pressed': String(f.base === v), 'data-base': v,
      onclick: () => {
        f.base = v;
        document.querySelectorAll('[data-base]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.base === v)));
        atualizarGraficos();
      } }, r)));
  const campoBusca = h('input', { class: 'campo', type: 'search', placeholder: t('ges.docs.placeholder'), 'aria-label': t('ges.docs.placeholder') });

  alvo.replaceChildren(
    cabecalhoPagina({ trilha: [t('nav.gestao')], titulo: t('nav.gestao'),
      extra: h('p', { class: 'pagina-sub' }, t('ges.intro')) }),
    filtros,
    cx.kpis,
    tituloSecao('documentos', 'bx-file-find', t('sub.documentos')),
    h('div', { class: 'grade' }, cartao({ classe: 'c-12', titulo: t('ges.docs.titulo'), sub: t('ges.docs.sub'),
      corpo: h('div', { class: 'cartao-corpo' }, cx.categorias,
        h('div', { class: 'busca-docs' }, icone('bx-search'), campoBusca), cx.lista) })),
    tituloSecao('mapa', 'bx-map-alt', t('ges.mapa.secao')),
    h('div', { class: 'grade' }, cartao({ classe: 'c-12', titulo: t('ges.mapa.titulo'), sub: t('ges.mapa.sub'), corpo: cx.mapa })),
    tituloSecao('divulgado', 'bx-transfer-alt', t('sub.divulgado')),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-12', titulo: t('ges.acum.titulo'), sub: t('ges.acum.sub'), acoes: abasBase(), corpo: E.acumulado,
        nota: t('ges.acum.nota') })),
    h('div', { class: 'grade', id: 'sec-avanco' },
      cartao({ classe: 'c-6', titulo: t('ges.prazos.titulo'), sub: t('ges.prazos.sub'), corpo: E.prazos, nota: t('ges.prazos.nota') }),
      cartao({ classe: 'c-6', titulo: t('ges.avanco.titulo'), sub: t('ges.avanco.sub'), corpo: E.avanco, nota: t('ges.avanco.nota') })),
    tituloSecao('fatos', 'bx-time-five', t('sub.fatos')),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-8', titulo: t('ges.linha.titulo'), sub: t('ges.linha.sub'), acoes: abasBase(), corpo: E.linha, nota: t('ges.linha.nota') }),
      cartao({ classe: 'c-4', titulo: t('ges.recentes.titulo'), sub: t('ges.recentes.sub'), corpo: cx.recentes })));

  /* ------------------------------------------------------------------ indicadores */
  const desenharKpis = () => {
    const inv = investimentoCitado(fatos, P.valor);
    const docsValor = new Set(P.valor.map((i) => fatos.dados.id[i])).size;
    // % concluída: trecho do filtro; sem filtro, a Ponte Bioceânica (obra-símbolo do corredor)
    const alvoPct = f.trecho || 'ponte_bioceanica';
    const pctPdf = resumoPct(P.pct.filter((i) => fatos.dados.trecho[i] === alvoPct)
      .map((i) => ({ d: fatos.dados.d[i], valor: fatos.dados.valor[i] })));
    const entregues = P.evento.filter((i) => ENTREGUES.includes(fatos.dados.tipo[i]));
    const vencidos = P.prazo.filter((i) => fatos.dados.ano[i] < ANO_ATUAL).length;
    const proximo = P.prazo.map((i) => fatos.dados.ano[i]).filter((a) => a >= ANO_ATUAL).sort()[0];
    cx.kpis.replaceChildren(
      kpi({ rotulo: t('ges.k.invest'), valor: inv.total ? dinheiro(inv.total) : '—', iconeNome: 'bx-dollar-circle',
        pe: t('ges.k.invest.pe', { n: numero(P.valor.length), d: numero(docsValor) }) }),
      kpi({ rotulo: t('ges.k.pct'), valor: pctPdf ? `${numero(pctPdf.ultimo.valor)}%` : '—', anel: pctPdf ? pctPdf.ultimo.valor : null,
        iconeNome: 'bx-trending-up',
        pe: pctPdf ? t('ges.k.pct.pe', { trecho: rotulo('trecho', alvoPct), data: dataCurta(pctPdf.ultimo.d) })
          : t('ges.k.pct.vazio', { trecho: rotulo('trecho', alvoPct) }) }),
      kpi({ rotulo: t('ges.k.entregues'), valor: numero(entregues.length), iconeNome: 'bx-check-shield', pe: t('ges.k.entregues.pe') }),
      kpi({ rotulo: t('ges.k.prazos'), valor: numero(P.prazo.length), iconeNome: 'bx-calendar-check',
        pe: t('ges.k.prazos.pe', { n: numero(vencidos), prox: proximo || '—' }) }));
    [...cx.kpis.children].forEach((c) => c.classList.add('c-3'));
  };

  /* ------------------------------------------------------------------ documentos */
  let consulta = null;                                       // Set de posições achadas pela busca (ou null)
  const desenharCategorias = () => {
    const cont = new Map();
    P.docs.forEach((i) => { const c = categoriaDoTipo(dic.doc_tipos[pdfs.dados.k[i]]); cont.set(c, (cont.get(c) || 0) + 1); });
    const botao = (id, ic, rot, n) => h('button', { class: 'categoria-doc', type: 'button', 'aria-pressed': String(f.categoria === id),
      onclick: () => { f.categoria = f.categoria === id ? '' : id; aplicar(); } }, icone(ic), h('span', {}, rot), h('b', {}, numero(n)));
    cx.categorias.replaceChildren(
      botao('', 'bx-collection', t('ges.cat.todas'), P.docs.length),
      ...CATEGORIAS.filter(([id]) => cont.get(id)).map(([id, ic]) => botao(id, ic, t(`ges.cat.${id}`), cont.get(id))));
  };

  let pagina = 0;
  const POR_PAGINA = 12;
  const desenharLista = () => {
    const linhas = P.lista.filter((i) => !consulta || consulta.has(i))
      .sort((a, b) => (pdfs.dados.d[b] || '').localeCompare(pdfs.dados.d[a] || ''));
    const total = Math.max(1, Math.ceil(linhas.length / POR_PAGINA));
    pagina = Math.min(pagina, total - 1);
    if (!linhas.length) { cx.lista.replaceChildren(h('p', { class: 'vazio' }, t('sem_dados'))); return; }
    cx.lista.replaceChildren(
      h('p', { class: 'cartao-nota' }, t('ges.docs.n', { n: numero(linhas.length) })),
      h('div', { class: 'tabela-caixa' }, h('table', { class: 'tabela' },
        h('thead', {}, h('tr', {}, [t('ges.col.data'), t('ges.col.documento'), t('ges.col.tipo'), t('ges.col.paises'), t('ges.col.pags'), '']
          .map((c, k) => h('th', { class: k === 4 ? 'num' : null }, c)))),
        h('tbody', {}, linhas.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA).map((i) => h('tr', {},
          h('td', { style: { whiteSpace: 'nowrap' } }, pdfs.dados.d[i] ? dataCurta(pdfs.dados.d[i]) : '—'),
          h('td', {}, h('button', { class: 'titulo-link link-botao', type: 'button', onclick: () => abrirFicha(i) }, tituloPdf(i))),
          h('td', {}, h('span', { class: 'selo' }, rotulo('doc', dic.doc_tipos[pdfs.dados.k[i]]))),
          h('td', { class: 'paises-doc' }, pdfs.dados.p[i].slice(0, 4).map((c) => h('span', { class: 'pais' }, dic.paises[c]))),
          h('td', { class: 'num' }, pdfs.dados.pg[i] || '—'),
          h('td', { class: 'acoes-doc' },
            h('button', { class: 'botao botao-pequeno botao-fantasma', type: 'button', onclick: () => abrirFicha(i) }, icone('bx-detail'), t('ges.ficha')),
            pdfs.dados.u?.[i] ? h('a', { class: 'botao botao-pequeno', href: pdfs.dados.u[i], target: '_blank', rel: 'noopener' },
              icone('bx-link-external'), 'PDF') : null)))))),
      h('div', { class: 'paginacao' },
        h('span', {}, t('tab.pagina', { p: numero(pagina + 1), t: numero(total) })),
        h('button', { class: 'botao botao-pequeno botao-fantasma', disabled: pagina === 0, onclick: () => { pagina -= 1; desenharLista(); } },
          icone('bx-chevron-left'), t('tab.anterior')),
        h('button', { class: 'botao botao-pequeno botao-fantasma', disabled: pagina >= total - 1, onclick: () => { pagina += 1; desenharLista(); } },
          t('tab.proxima'), icone('bx-chevron-right'))));
  };
  let espera;
  campoBusca.addEventListener('input', () => {
    clearTimeout(espera);
    espera = setTimeout(async () => {
      const q = campoBusca.value.trim();
      if (!q) consulta = null;
      else {
        const termos = await carregar('indice/pdfs_termos.json');
        consulta = termos ? buscarPdfs(termos, q) || null : null;
      }
      pagina = 0;
      desenharLista();
    }, 300);
  });

  /* ------------------------------------------------------------------ ficha do documento */
  const veu = h('div', { class: 'ficha-veu', hidden: true, onclick: () => fecharFicha() });
  const ficha = h('aside', { class: 'ficha-doc', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('ges.ficha'), hidden: true });
  document.body.append(veu, ficha);
  const fecharFicha = () => { ficha.hidden = true; veu.hidden = true; };
  const aoTecla = (ev) => { if (ev.key === 'Escape') fecharFicha(); };
  document.addEventListener('keydown', aoTecla);
  const bloco = (titulo, conteudo) => (conteudo ? h('section', { class: 'ficha-bloco' }, h('h3', {}, titulo), conteudo) : null);
  const etiquetas = (itens) => (itens.length ? h('p', { class: 'etiquetas' }, itens.map((x) => h('span', {}, x))) : null);
  const lista = (itens) => (itens.length ? h('ul', { class: 'ficha-lista' }, itens.map((x) => h('li', {}, x))) : null);
  const pessoa = (x) => (typeof x === 'string' ? x : [x.nome, x.cargo].filter(Boolean).join(' — '));

  async function abrirFicha(i) {
    ficha.hidden = false; veu.hidden = false;
    ficha.replaceChildren(carregando());
    const doc = await carregar(`textos/pdfs/${pdfs.dados.id[i]}.json`).catch(() => null);
    const tipo = dic.doc_tipos[pdfs.dados.k[i]];
    const site = dic.sites[pdfs.dados.s[i]];
    const meta = (rot, val) => (val ? h('div', {}, h('dt', {}, rot), h('dd', {}, val)) : null);
    ficha.replaceChildren(
      h('header', { class: 'ficha-cabeca' },
        h('span', { class: 'selo selo-etapa' }, icone(CATEGORIAS.find(([id]) => id === categoriaDoTipo(tipo))?.[1] || 'bx-file'), rotulo('doc', tipo)),
        h('button', { class: 'icone-botao', type: 'button', 'aria-label': t('ges.fechar'), onclick: fecharFicha }, icone('bx-x')),
        h('h2', {}, tituloPdf(i))),
      h('div', { class: 'ficha-acoes' },
        doc?.url ? h('a', { class: 'botao', href: doc.url, target: '_blank', rel: 'noopener' }, icone('bx-link-external'), t('ges.abrir_pdf'))
          : h('span', { class: 'mudo' }, t('ges.sem_link')),
        doc?.url_origem ? h('a', { class: 'botao botao-fantasma', href: doc.url_origem, target: '_blank', rel: 'noopener' }, icone('bx-globe'), t('ges.pagina_origem')) : null),
      h('dl', { class: 'ficha-meta' },
        meta(t('ges.f.data'), pdfs.dados.d[i] ? dataCurta(pdfs.dados.d[i]) + (pdfs.dados.de[i] ? ` (${t('ges.f.estimada')})` : '') : ''),
        meta(t('ges.f.fonte'), site?.nome || ''),
        meta(t('ges.f.evento'), doc?.evento?.rotulo || ''),
        meta(t('ges.f.comissao'), doc?.comissao || ''),
        meta(t('ges.f.local'), doc?.local?.cidade ? `${doc.local.cidade} · ${rotulo('pais', doc.local.pais || '')}` : ''),
        meta(t('ges.f.idioma'), (doc?.idioma || '').toUpperCase()),
        meta(t('ges.f.paginas'), doc?.n_paginas ? numero(doc.n_paginas) : '')),
      bloco(t('ges.f.resumo'), doc?.resumo ? h('p', {}, doc.resumo) : null),
      bloco(t('ges.f.temas'), etiquetas((doc?.temas || []).map((x) => rotulo('tema', x)))),
      bloco(t('ges.f.paises'), etiquetas((doc?.paises || []).map((x) => rotulo('pais', x)))),
      bloco(t('ges.f.trechos'), etiquetas((doc?.trechos || []).map((x) => rotulo('trecho', x)))),
      bloco(t('ges.f.lugares'), etiquetas((doc?.lugares || []).map((x) => `${x.nome}${x.mencoes > 1 ? ` ×${x.mencoes}` : ''}`))),
      bloco(t('ges.f.fatos'), lista((doc?.fatos || []).map((x) => [h('b', {}, x.grupo === 'valor' ? `${rotulo('valor', x.tipo)} · ${dinheiro(x.usd)}`
        : x.grupo === 'percentual' ? `${numero(x.valor)}%` : x.grupo === 'prazo' ? `${rotulo('promessa', x.tipo)} · ${x.ano}` : rotulo('evento', x.tipo)),
      x.trecho ? ` · ${rotulo('trecho', x.trecho)}` : '', h('br'), h('small', { class: 'mudo' }, x.frase)]))),
      bloco(t('ges.f.prazos'), lista((doc?.marcos || []).slice(0, 8).map((x) => [h('b', {}, `${x.ano}${x.mes ? `/${x.mes}` : ''} · ${rotulo('promessa', x.tipo)}`),
        h('br'), h('small', { class: 'mudo' }, x.trecho)]))),
      bloco(t('ges.f.valores'), lista((doc?.valores || []).filter((x) => x.tipo_valor !== 'economico').slice(0, 8)
        .map((x) => [h('b', {}, x.texto), ` · ${rotulo('valor', x.tipo_valor)}`, h('br'), h('small', { class: 'mudo' }, (x.contexto || '').trim())]))),
      bloco(t('ges.f.compromissos'), lista((doc?.compromissos || []).slice(0, 6).map((x) => x.texto))),
      bloco(t('ges.f.signatarios'), etiquetas((doc?.signatarios || []).map(pessoa))),
      bloco(t('ges.f.entidades'), etiquetas((doc?.entidades || []).map((x) => x.nome))),
      bloco(t('ges.f.termos'), etiquetas((doc?.termos || []).map((x) => x.termo))),
      bloco(t('ges.f.atores'), etiquetas((doc?.atores || []).slice(0, 12).map(pessoa))));
    ficha.querySelector('.icone-botao')?.focus();
  }

  /* ------------------------------------------------------------------ mapa */
  const lugaresDocs = () => {
    const cont = new Map();
    for (const i of P.docs) for (const c of pdfs.dados.lg?.[i] || []) cont.set(c, (cont.get(c) || 0) + 1);
    return dic.lugares.map((lg, c) => ({ ...lg, n: cont.get(c) || 0 }))
      .filter((lg) => lg.lat != null && lg.lon != null && (lg.n || lg.ordem_rota != null));
  };

  /* ------------------------------------------------------------------ gráficos */
  const comWeb = () => f.base === 'web';
  const CAT_ACUM = [
    ['previsto', (p) => p.acento], ['contratado', (p) => p.series[2]], ['financiado', (p) => p.series[3]],
    ['executado', (p) => p.series[5]], ['entregue', (p) => p.series[6]], ['prazo', (p) => p.series[4]]];
  const opAcumulado = (p) => {
    // registros por ano em cada categoria, ACUMULADOS: a distância entre "divulgado" e "executado/entregue"
    // mostra quanto do que se anuncia chega a ser realizado
    const por = new Map(CAT_ACUM.map(([c]) => [c, new Map()]));
    const somar = (c, d) => { if (!d || !por.has(c)) return; const a = d.slice(0, 4); por.get(c).set(a, (por.get(c).get(a) || 0) + 1); };
    P.valor.forEach((i) => somar(fatos.dados.tipo[i], fatos.dados.d[i]));
    P.evento.forEach((i) => { if (ENTREGUES.includes(fatos.dados.tipo[i])) somar('entregue', fatos.dados.d[i]); });
    P.prazo.forEach((i) => somar('prazo', fatos.dados.d[i]));
    if (comWeb()) {
      P.web.valores.forEach((i) => somar(valores.dados.tipo[i], valores.dados.d[i]));
      P.web.eventos.forEach((i) => { if (ENTREGUES.includes(eventos.dados.tipo[i])) somar('entregue', eventos.dados.d[i]); });
      P.web.promessas.forEach((i) => somar('prazo', promessas.dados.d[i]));
    }
    const anosEixo = [];
    for (let a = f.de; a <= Math.min(f.ate, ANO_ATUAL); a++) anosEixo.push(String(a));
    return {
      tooltip: { trigger: 'axis' },
      legend: { right: 8 },
      grid: grade({ top: 44 }),
      xAxis: eixoCategoria(p, anosEixo, { boundaryGap: false }),
      yAxis: eixoValor(p, { minInterval: 1 }),
      series: CAT_ACUM.map(([c, cor], k) => {
        let acc = 0;
        const dados = anosEixo.map((a) => (acc += por.get(c).get(a) || 0));
        return { type: 'line', name: t(`ges.cat_fato.${c}`), data: dados, step: 'end', symbol: 'circle', symbolSize: 5, showSymbol: false,
          lineStyle: { width: k === 0 ? 3 : 2, color: cor(p), type: c === 'prazo' ? 'dashed' : 'solid',
            ...(k === 0 ? { shadowBlur: 12, shadowColor: cor(p) } : {}) },
          itemStyle: { color: cor(p) }, areaStyle: k === 0 ? { color: gradiente(cor(p), 0.25) } : undefined };
      }),
    };
  };

  const fonteTxt = (x) => (x === 'pdf' ? t('ges.base.pdf_um') : t('ges.base.web_um'));
  const opPrazos = (p) => {
    // cada ponto: quando o prazo foi anunciado (x) e para quando foi prometido (y). Pontos subindo com o tempo =
    // prazo remarcado; abaixo da linha "hoje" = prazo já vencido
    const pts = (tab, pos, fonte) => pos.filter((i) => ['conclusao', 'operacao'].includes(tab.dados.tipo[i]) && tab.dados.d[i])
      .map((i) => ({ value: [tab.dados.d[i], tab.dados.ano[i]], frase: tab.dados.frase[i], trecho: tab.dados.trecho[i], fonte }));
    return {
      tooltip: { trigger: 'item', confine: true, formatter: (x) => `<div style="max-width:300px;white-space:normal"><b>${t('ges.prazos.prometido')}: ${x.data.value[1]}</b><br>`
        + `<small>${t('ges.prazos.anunciado')}: ${dataCurta(x.data.value[0])} · ${fonteTxt(x.data.fonte)}`
        + `${x.data.trecho ? ` · ${rotulo('trecho', x.data.trecho)}` : ''}</small><br>${x.data.frase}</div>` },
      legend: { right: 8 },
      grid: grade({ top: 40 }),
      xAxis: { type: 'time', axisLine: { lineStyle: { color: p.linha } }, axisLabel: { color: p.texto2, fontSize: 11 }, splitLine: { show: false } },
      yAxis: eixoValor(p, { min: (v) => v.min - 1, max: (v) => Math.max(v.max, ANO_ATUAL) + 1, minInterval: 1, scale: true,
        axisLabel: { color: p.texto2, fontSize: 11, formatter: (v) => String(v) } }),
      series: [
        { type: 'scatter', name: t('ges.base.web_um'), data: comWeb() ? pts(promessas, P.web.promessas, 'web') : [], symbolSize: 6,
          itemStyle: { color: comAlfa(p.series[1], 0.35) } },
        { type: 'scatter', name: t('ges.base.pdf_um'), data: pts(fatos, P.prazo, 'pdf'), symbol: 'diamond', symbolSize: 13,
          itemStyle: { color: p.acento, shadowBlur: 10, shadowColor: p.acento },
          markLine: { silent: true, symbol: 'none', lineStyle: { color: p.series[4], type: 'dashed' },
            label: { color: p.texto2, formatter: t('ges.prazos.hoje') }, data: [{ yAxis: ANO_ATUAL }] } },
      ],
    };
  };

  const opAvanco = (p) => {
    // por trecho: último % divulgado, mediana dos 6 mais recentes e quantos registros sustentam o número
    const linhas = new Map();
    const add = (tr, d, v) => { if (!tr || !d) return; if (!linhas.has(tr)) linhas.set(tr, []); linhas.get(tr).push({ d, valor: v }); };
    P.pct.forEach((i) => add(fatos.dados.trecho[i], fatos.dados.d[i], fatos.dados.valor[i]));
    if (comWeb()) P.web.percentuais.forEach((i) => add(percentuais.dados.trecho[i], percentuais.dados.d[i], percentuais.dados.valor[i]));
    const res = [...linhas.entries()].map(([tr, ls]) => ({ tr, ...resumoPct(ls) })).sort((a, b) => b.n - a.n).slice(0, 8);
    const nomes = res.map((r) => rotulo('trecho', r.tr));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (xs) => {
        const r = res[xs[0].dataIndex];
        return `<b>${nomes[xs[0].dataIndex]}</b><br>${t('ges.col.ultimo')}: <b>${numero(r.ultimo.valor)}%</b> (${dataCurta(r.ultimo.d)})<br>`
          + `${t('ges.col.mediana')}: ${numero(r.mediana, { maximumFractionDigits: 0 })}%<br>${t('ges.col.registros')}: ${numero(r.n)}`;
      } },
      legend: { right: 8 },
      grid: grade({ top: 40, left: 28 }),
      xAxis: eixoCategoria(p, nomes, { axisLabel: { color: p.texto2, fontSize: 10, interval: 0, rotate: nomes.length > 4 ? 18 : 0,
        margin: 10, width: 90, overflow: 'truncate' } }),
      yAxis: [eixoValor(p, { max: 100, axisLabel: { color: p.texto2, formatter: '{value}%' } }),
        eixoValor(p, { splitLine: { show: false }, minInterval: 1 })],
      series: [
        { type: 'bar', name: t('ges.col.ultimo'), data: res.map((r) => r.ultimo.valor), barMaxWidth: 24,
          itemStyle: { color: p.acento, borderRadius: [4, 4, 0, 0] } },
        { type: 'bar', name: t('ges.col.mediana'), data: res.map((r) => Math.round(r.mediana)), barMaxWidth: 24,
          itemStyle: { color: comAlfa(p.acento, 0.35), borderRadius: [4, 4, 0, 0] } },
        { type: 'line', name: t('ges.col.registros'), yAxisIndex: 1, data: res.map((r) => r.n), symbol: 'circle', symbolSize: 7,
          lineStyle: { color: p.series[2], width: 2 }, itemStyle: { color: p.series[2] } },
      ],
    };
  };

  const opLinha = (p) => {
    // linhas = tipos de fato (da licitação à inauguração); losango = documento oficial, ponto = matéria
    const cats = TIPOS_FATO.map((x) => rotulo('evento', x));
    const pts = (tab, pos, fonte) => pos.filter((i) => TIPOS_FATO.includes(tab.dados.tipo[i]) && tab.dados.d[i])
      .map((i) => ({ value: [tab.dados.d[i], TIPOS_FATO.indexOf(tab.dados.tipo[i])], frase: tab.dados.frase[i], trecho: tab.dados.trecho[i], fonte }));
    return {
      tooltip: { trigger: 'item', confine: true, formatter: (x) => `<div style="max-width:320px;white-space:normal"><b>${cats[x.data.value[1]]}</b> · ${dataCurta(x.data.value[0])}<br>`
        + `<small>${fonteTxt(x.data.fonte)}${x.data.trecho ? ` · ${rotulo('trecho', x.data.trecho)}` : ''}</small><br>${x.data.frase}</div>` },
      legend: { right: 8 },
      grid: grade({ top: 40, left: 12 }),
      xAxis: { type: 'time', axisLine: { lineStyle: { color: p.linha } }, axisLabel: { color: p.texto2, fontSize: 11 }, splitLine: { show: false } },
      yAxis: { type: 'category', data: cats, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: p.texto2, fontSize: 11 },
        splitLine: { show: true, lineStyle: { color: p.linha } } },
      series: [
        { type: 'scatter', name: t('ges.base.web_um'), data: comWeb() ? pts(eventos, P.web.eventos, 'web') : [], symbolSize: 5,
          itemStyle: { color: comAlfa(p.series[1], 0.3) } },
        { type: 'scatter', name: t('ges.base.pdf_um'), data: pts(fatos, P.evento, 'pdf'), symbol: 'diamond', symbolSize: 14,
          itemStyle: { color: p.acento, shadowBlur: 10, shadowColor: p.acento } },
      ],
    };
  };

  const desenharRecentes = () => {
    const ult = [...P.evento].sort((a, b) => fatos.dados.d[b].localeCompare(fatos.dados.d[a])).slice(0, 7);
    cx.recentes.replaceChildren(ult.length ? h('ol', { class: 'fatos-lista' }, ult.map((i) => {
      const pi = posPdfPorId.get(fatos.dados.id[i]);
      return h('li', {},
        h('span', { class: `marca-fato${ENTREGUES.includes(fatos.dados.tipo[i]) ? ' entregue' : ''}` }),
        h('div', {},
          h('b', {}, rotulo('evento', fatos.dados.tipo[i])), fatos.dados.trecho[i] ? ` · ${rotulo('trecho', fatos.dados.trecho[i])}` : '',
          h('p', {}, fatos.dados.frase[i]),
          h('small', { class: 'mudo' }, dataCurta(fatos.dados.d[i]), ' · ',
            pi != null ? h('button', { class: 'link-botao', type: 'button', onclick: () => abrirFicha(pi) }, tituloPdf(pi)) : '')));
    })) : h('p', { class: 'vazio' }, t('ges.recentes.vazio')));
  };

  /* ------------------------------------------------------------------ montagem */
  const G = { acumulado: grafico(E.acumulado, opAcumulado), prazos: grafico(E.prazos, opPrazos), avanco: grafico(E.avanco, opAvanco),
    linha: grafico(E.linha, opLinha) };
  const OPS = { acumulado: opAcumulado, prazos: opPrazos, avanco: opAvanco, linha: opLinha };
  const atualizarGraficos = () => { for (const [k, g] of Object.entries(G)) g.atualizar(OPS[k]); };
  let mapa = null;
  const desenhar = () => {
    desenharKpis(); desenharCategorias(); pagina = 0; desenharLista(); desenharRecentes();
    atualizarGraficos();
    mapa?.atualizar(lugaresDocs());
  };
  desenharKpis(); desenharCategorias(); desenharLista(); desenharRecentes();
  mapa = await montarMapa(cx.mapa, lugaresDocs(), (n) => t('ges.mapa.n', { n: numero(n) }));

  return {
    desmontar: () => { mapa?.remover(); mapa = null; veu.remove(); ficha.remove(); document.removeEventListener('keydown', aoTecla); },
    rolar: (sec, imediato) => {
      if (SECOES.includes(sec)) document.getElementById(`sec-${sec}`)?.scrollIntoView({ behavior: imediato ? 'auto' : 'smooth', block: 'start' });
    },
  };
}
