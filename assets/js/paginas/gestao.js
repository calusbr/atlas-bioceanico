/**
 * @file: assets/js/paginas/gestao.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-30
 * @ultima_modificacao: 2026-10-30
 * @versao: 0.8.0
 * @descricao: Gestão de Projeto (Fase E) centrada nos DOCUMENTOS OFICIAIS — atas, declarações, relatórios,
 *             estudos, boletins e apresentações publicados pelo Corredor Bioceânico (corredorbioceanico.org).
 *               apresentação  cartão de largura total explicando a fonte e o método
 *               filtros       fonte dos documentos, período, trecho, país
 *               indicadores   8 cartões: investimento citado, % concluída, obras entregues, prazos (fatos) e
 *                             acervo, último documento, trechos e lugares citados (cobertura)
 *               documentos    categorias em uma linha com contagem, busca por palavras, lista e FICHA
 *                             do documento com link direto para o PDF no site oficial
 *               mapa          lugares citados nos documentos
 *               divulgado × realizado   barras por ano (anunciado × realizado), prazo prometido × ano do
 *                             anúncio (bolhas + mediana) e avanço por trecho (barras horizontais)
 *               fatos         linha do tempo, fatos recentes, etapas por trecho e valores anunciados por ano
 *             Cada gráfico tem a sua própria escolha de base: "Só PDFs" ou "PDFs + matérias" (padrão).
 * @requisitos: contrato de dados 3.3.
 */
import { carregarGestao, carregar, ErroContrato } from '../dados/carregador.js';
import { CATEGORIAS, categoriaDoTipo, limparTitulo, filtrarPdfs, fatosDosPdfs, filtrarWeb, investimentoCitado,
  resumoPct, buscarPdfs } from '../dados/gestao.js';
import { t, numero, dataCurta, locale } from '../i18n.js';
import { h, icone, cartao, kpi, tituloSecao, carregando, erro, cabecalhoPagina } from '../ui/dom.js';
import { grafico, grade, eixoCategoria, eixoValor, comAlfa, RAMPA_ACENTO } from '../ui/graficos.js';
import { montarMapa } from '../ui/mapa.js';
import { rotulo } from '../rotulos.js';
import { navegar } from '../roteador.js';

let filtroSalvo = null;
const SECOES = ['documentos', 'mapa', 'divulgado', 'avanco', 'fatos'];
const ENTREGUES = ['conclusao', 'inauguracao', 'entrega'];
const TIPOS_FATO = ['licitacao', 'assinatura', 'aprovacao', 'inicio', 'conclusao', 'entrega', 'inauguracao'];
const ANO_ATUAL = new Date().getFullYear();
const ANO_MIN_GRAFICOS = 2015;                 // antes disso quase não há registros de obra
const BASES_PADRAO = { divulgado: 'web', prazos: 'web', avanco: 'web', linha: 'web', etapas: 'web', valores: 'web' };

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
  const { m, dic, pdfs, fatos, valores, percentuais, eventos, promessas } = D;
  const anosPdf = pdfs.dados.d.filter(Boolean).map((d) => Number(d.slice(0, 4)));
  const faixa = [Math.min(...anosPdf), Math.max(ANO_ATUAL, ...anosPdf)];
  const f = filtroSalvo || (filtroSalvo = { fonte: 'corredor', de: faixa[0], ate: faixa[1], trecho: '', pais: '', categoria: '',
    base: { ...BASES_PADRAO } });
  const posPdfPorId = new Map(pdfs.dados.id.map((id, i) => [id, i]));

  /* ------------------------------------------------------------------ formatos */
  const compacto = (v) => new Intl.NumberFormat(locale(), { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1 }).format(v);
  const dinheiro = (v) => `US$ ${compacto(v)}`;
  const tituloPdf = (i) => limparTitulo(pdfs.dados.t[i]);
  const cortar = (s, n) => (s && s.length > n ? `${s.slice(0, n - 1).trim()}…` : s || '');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

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
        Object.assign(f, { fonte: 'corredor', de: faixa[0], ate: faixa[1], trecho: '', pais: '', categoria: '', base: { ...BASES_PADRAO } });
        navegar(true);
      } }, icone('bx-reset'), t('filtro.limpar'))));

  /* ------------------------------------------------------------------ esqueleto */
  const corpo = (extra = '') => h('div', { class: `cartao-corpo ${extra}`.trim() });
  const el = (classe = 'grafico') => h('div', { class: classe });
  const cx = { kpis: h('div', { class: 'grade' }), categorias: h('div', { class: 'categorias-doc', role: 'group', 'aria-label': t('ges.docs.titulo') }),
    lista: h('div'), mapa: h('div', { class: 'mapa' }), recentes: corpo('recentes-rolagem') };
  const E = { divulgado: el('grafico grafico-medio'), prazos: el('grafico grafico-medio'), avanco: el('grafico grafico-medio'),
    linha: el('grafico grafico-linha'), etapas: el('grafico grafico-medio'), valores: el('grafico grafico-medio') };
  // seletor de base de UM gráfico: só redesenha o próprio gráfico
  const abasBase = (chave) => {
    const grupo = h('div', { class: 'abas', role: 'group', 'aria-label': t('ges.base') });
    grupo.append(...[['web', t('ges.base.web')], ['pdf', t('ges.base.pdf')]].map(([v, r]) => h('button', { type: 'button',
      'aria-pressed': String(f.base[chave] === v), onclick: (ev) => {
        f.base[chave] = v;
        grupo.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === ev.currentTarget)));
        G[chave].atualizar(OPS[chave]);
      } }, r)));
    return grupo;
  };
  const campoBusca = h('input', { class: 'campo', type: 'search', placeholder: t('ges.docs.placeholder'), 'aria-label': t('ges.docs.placeholder') });
  const apresentacao = h('section', { class: 'cartao destaque-gestao' },
    h('span', { class: 'destaque-icone' }, icone('bx-library')),
    h('div', { class: 'destaque-texto' },
      h('h2', {}, t('ges.intro.titulo')),
      h('p', {}, t('ges.intro')),
      h('p', { class: 'destaque-metodo' }, icone('bx-info-circle'), t('ges.intro.metodo'))),
    h('div', { class: 'destaque-selos' },
      h('a', { class: 'selo selo-etapa', href: 'https://corredorbioceanico.org/pb/', target: '_blank', rel: 'noopener' },
        icone('bx-link-external'), 'corredorbioceanico.org'),
      h('span', { class: 'selo' }, icone('bx-world'), t('ges.intro.paises'))));

  alvo.replaceChildren(
    cabecalhoPagina({ trilha: [t('nav.gestao')], titulo: t('nav.gestao'),
      acao: h('button', { class: 'botao botao-info', type: 'button', title: t('dados.titulo'),
        onclick: (ev) => { ev.stopPropagation(); document.getElementById('botao-dados')?.click(); } },
        icone('bx-time-five'), t('dados.atualizado', { data: dataCurta(m.gerado_em.slice(0, 10)) })) }),
    apresentacao,
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
      cartao({ classe: 'c-12', titulo: t('ges.acum.titulo'), sub: t('ges.acum.sub'), acoes: abasBase('divulgado'), corpo: E.divulgado,
        nota: t('ges.acum.nota') })),
    h('div', { class: 'grade', id: 'sec-avanco' },
      cartao({ classe: 'c-6', titulo: t('ges.prazos.titulo'), sub: t('ges.prazos.sub'), acoes: abasBase('prazos'), corpo: E.prazos, nota: t('ges.prazos.nota') }),
      cartao({ classe: 'c-6', titulo: t('ges.avanco.titulo'), sub: t('ges.avanco.sub'), acoes: abasBase('avanco'), corpo: E.avanco, nota: t('ges.avanco.nota') })),
    tituloSecao('fatos', 'bx-time-five', t('sub.fatos')),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-8', titulo: t('ges.linha.titulo'), sub: t('ges.linha.sub'), acoes: abasBase('linha'), corpo: E.linha, nota: t('ges.linha.nota') }),
      cartao({ classe: 'c-4', titulo: t('ges.recentes.titulo'), sub: t('ges.recentes.sub'), corpo: cx.recentes })),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-6', titulo: t('ges.etapas.titulo'), sub: t('ges.etapas.sub'), acoes: abasBase('etapas'), corpo: E.etapas, nota: t('ges.etapas.nota') }),
      cartao({ classe: 'c-6', titulo: t('ges.valores.titulo'), sub: t('ges.valores.sub'), acoes: abasBase('valores'), corpo: E.valores, nota: t('ges.valores.nota') })));

  /* ------------------------------------------------------------------ indicadores */
  const maisFrequente = (cont) => [...cont.entries()].sort((a, b) => b[1] - a[1])[0];
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

    // cobertura do acervo filtrado
    const { d, pg, tr, lg } = pdfs.dados;
    const paginas = P.docs.reduce((s, i) => s + (pg[i] || 0), 0);
    const limite12 = new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10);
    const recentes = P.docs.filter((i) => d[i] && d[i] >= limite12).length;
    const porAno = new Map();
    P.docs.forEach((i) => { if (d[i]) porAno.set(d[i].slice(0, 4), (porAno.get(d[i].slice(0, 4)) || 0) + 1); });
    const serie = [];
    for (let a = Math.max(f.de, ANO_MIN_GRAFICOS); a <= Math.min(f.ate, ANO_ATUAL); a++) serie.push(porAno.get(String(a)) || 0);
    const ultimo = P.docs.filter((i) => d[i]).sort((a, b) => d[b].localeCompare(d[a]))[0];
    const contTr = new Map(), contLg = new Map();
    P.docs.forEach((i) => {
      tr[i].forEach((c) => contTr.set(c, (contTr.get(c) || 0) + 1));
      (lg?.[i] || []).forEach((c) => contLg.set(c, (contLg.get(c) || 0) + 1));
    });
    const topTr = maisFrequente(contTr), topLg = maisFrequente(contLg);

    cx.kpis.replaceChildren(
      kpi({ rotulo: t('ges.k.invest'), valor: inv.total ? dinheiro(inv.total) : '—', iconeNome: 'bx-dollar-circle',
        pe: t('ges.k.invest.pe', { n: numero(P.valor.length), d: numero(docsValor) }) }),
      kpi({ rotulo: t('ges.k.pct'), valor: pctPdf ? `${numero(pctPdf.ultimo.valor)}%` : '—', anel: pctPdf ? pctPdf.ultimo.valor : null,
        iconeNome: 'bx-trending-up',
        pe: pctPdf ? t('ges.k.pct.pe', { trecho: rotulo('trecho', alvoPct), data: dataCurta(pctPdf.ultimo.d) })
          : t('ges.k.pct.vazio', { trecho: rotulo('trecho', alvoPct) }) }),
      kpi({ rotulo: t('ges.k.entregues'), valor: numero(entregues.length), iconeNome: 'bx-check-shield', pe: t('ges.k.entregues.pe') }),
      kpi({ rotulo: t('ges.k.prazos'), valor: numero(P.prazo.length), iconeNome: 'bx-calendar-check',
        pe: t('ges.k.prazos.pe', { n: numero(vencidos), prox: proximo || '—' }) }),
      kpi({ rotulo: t('ges.k.acervo'), valor: numero(P.docs.length), iconeNome: 'bx-library', serie,
        pe: t('ges.k.acervo.pe', { pg: numero(paginas), n: numero(recentes) }) }),
      kpi({ rotulo: t('ges.k.ultimo'), valor: ultimo != null ? d[ultimo].split('-').reverse().join('/') : '—', iconeNome: 'bx-time-five',
        pe: ultimo != null ? cortar(tituloPdf(ultimo), 70) : t('sem_dados') }),
      kpi({ rotulo: t('ges.k.trechos'), valor: numero(contTr.size), iconeNome: 'bx-git-commit',
        pe: topTr ? t('ges.k.top', { nome: rotulo('trecho', dic.trechos[topTr[0]]?.id), n: numero(topTr[1]) }) : t('sem_dados') }),
      kpi({ rotulo: t('ges.k.lugares'), valor: numero(contLg.size), iconeNome: 'bx-map-pin',
        pe: topLg ? t('ges.k.top', { nome: dic.lugares[topLg[0]]?.nome, n: numero(topLg[1]) }) : t('sem_dados') }));
    [...cx.kpis.children].forEach((c) => c.classList.add('c-3'));
    // o último documento abre a ficha
    const cartUlt = cx.kpis.children[5];
    cartUlt.classList.add('kpi-data');
    if (ultimo != null) { cartUlt.classList.add('kpi-clicavel'); cartUlt.tabIndex = 0; cartUlt.onclick = () => abrirFicha(ultimo);
      cartUlt.onkeydown = (ev) => { if (ev.key === 'Enter') abrirFicha(ultimo); }; }
  };

  /* ------------------------------------------------------------------ documentos */
  let consulta = null;                                       // Set de posições achadas pela busca (ou null)
  const desenharCategorias = () => {
    const cont = new Map();
    P.docs.forEach((i) => { const c = categoriaDoTipo(dic.doc_tipos[pdfs.dados.k[i]]); cont.set(c, (cont.get(c) || 0) + 1); });
    const botao = (id, ic, rot, n) => h('button', { class: 'categoria-doc', type: 'button', title: `${rot} · ${numero(n)}`,
      'aria-pressed': String(f.categoria === id), onclick: () => { f.categoria = f.categoria === id ? '' : id; aplicar(); } },
    icone(ic), h('b', {}, numero(n)), h('span', {}, rot));
    cx.categorias.replaceChildren(
      botao('', 'bx-collection', t('ges.cat.todas'), P.docs.length),
      ...CATEGORIAS.filter(([id]) => cont.get(id)).map(([id, ic]) => botao(id, ic, t(`ges.cat.${id}`), cont.get(id))));
  };

  const paisesDoc = (codigos) => {
    const nomes = codigos.map((c) => dic.paises[c]);
    return h('span', { class: 'paises-linha', title: nomes.map((x) => rotulo('pais', x)).join(', ') },
      nomes.slice(0, 3).map((x) => h('span', { class: 'pais' }, x)),
      nomes.length > 3 ? h('span', { class: 'pais pais-mais' }, `+${nomes.length - 3}`) : null);
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
      h('div', { class: 'tabela-caixa' }, h('table', { class: 'tabela tabela-docs' },
        h('thead', {}, h('tr', {}, [t('ges.col.data'), t('ges.col.documento'), t('ges.col.tipo'), t('ges.col.paises'), t('ges.col.pags'), '']
          .map((c, k) => h('th', { class: k === 4 ? 'num' : null }, c)))),
        h('tbody', {}, linhas.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA).map((i) => h('tr', {},
          h('td', { style: { whiteSpace: 'nowrap' } }, pdfs.dados.d[i] ? dataCurta(pdfs.dados.d[i]) : '—'),
          h('td', {}, h('button', { class: 'titulo-link link-botao', type: 'button', onclick: () => abrirFicha(i) }, tituloPdf(i))),
          h('td', {}, h('span', { class: 'selo' }, rotulo('doc', dic.doc_tipos[pdfs.dados.k[i]]))),
          h('td', { class: 'paises-doc' }, paisesDoc(pdfs.dados.p[i])),
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
  const comWeb = (chave) => f.base[chave] === 'web';
  const fonteTxt = (x) => (x === 'pdf' ? t('ges.base.pdf_um') : t('ges.base.web_um'));
  const ano0 = () => Math.max(f.de, ANO_MIN_GRAFICOS);
  const ano1 = () => Math.min(f.ate, ANO_ATUAL);
  const eixoTempo = (p, extra = {}) => ({ type: 'time', min: `${ano0()}-01-01`, max: `${ano1()}-12-31`,
    axisLine: { lineStyle: { color: p.linha } }, axisLabel: { color: p.texto2, fontSize: 11 }, splitLine: { show: false }, ...extra });
  const legenda = (p) => ({ top: 0, left: 0, icon: 'roundRect', itemWidth: 10, itemHeight: 10, textStyle: { color: p.texto2, fontSize: 11 } });

  // anunciado (valores previstos/contratados/financiados + prazos) × realizado (executado + entregue)
  const CAT_DIV = [
    ['previsto', 'div', (p) => p.acento], ['contratado', 'div', (p) => p.series[2]], ['financiado', 'div', (p) => p.series[3]],
    ['prazo', 'div', (p) => p.series[4]], ['executado', 'real', (p) => p.series[5]], ['entregue', 'real', (p) => p.series[6]]];
  const opDivulgado = (p) => {
    const por = new Map(CAT_DIV.map(([c]) => [c, new Map()]));
    const somar = (c, d) => { if (!d || !por.has(c)) return; const a = d.slice(0, 4); por.get(c).set(a, (por.get(c).get(a) || 0) + 1); };
    P.valor.forEach((i) => somar(fatos.dados.tipo[i], fatos.dados.d[i]));
    P.evento.forEach((i) => { if (ENTREGUES.includes(fatos.dados.tipo[i])) somar('entregue', fatos.dados.d[i]); });
    P.prazo.forEach((i) => somar('prazo', fatos.dados.d[i]));
    if (comWeb('divulgado')) {
      P.web.valores.forEach((i) => somar(valores.dados.tipo[i], valores.dados.d[i]));
      P.web.eventos.forEach((i) => { if (ENTREGUES.includes(eventos.dados.tipo[i])) somar('entregue', eventos.dados.d[i]); });
      P.web.promessas.forEach((i) => somar('prazo', promessas.dados.d[i]));
    }
    // só os anos com algum registro
    const anosEixo = [];
    for (let a = ano0(); a <= ano1(); a++) if (CAT_DIV.some(([c]) => por.get(c).get(String(a)))) anosEixo.push(String(a));
    const tot = (pilha, a) => CAT_DIV.filter(([, s]) => s === pilha).reduce((s, [c]) => s + (por.get(c).get(a) || 0), 0);
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (xs) => {
        const a = xs[0].axisValue;
        const linha = (x) => (x.value ? `${x.marker}${x.seriesName}: <b>${numero(x.value)}</b><br>` : '');
        return `<b>${a}</b><br><small>${t('ges.div.anunciado')}: ${numero(tot('div', a))}</small><br>${xs.filter((x) => x.seriesIndex < 4).map(linha).join('')}`
          + `<small>${t('ges.div.realizado')}: ${numero(tot('real', a))}</small><br>${xs.filter((x) => x.seriesIndex >= 4).map(linha).join('')}`;
      } },
      legend: legenda(p),
      grid: grade({ top: 48 }),
      xAxis: eixoCategoria(p, anosEixo),
      yAxis: eixoValor(p, { minInterval: 1 }),
      series: CAT_DIV.map(([c, pilha, cor], k) => ({
        type: 'bar', name: t(`ges.cat_fato.${c}`), stack: pilha, data: anosEixo.map((a) => por.get(c).get(a) || 0),
        barMaxWidth: 26, barGap: '12%',
        itemStyle: { color: c === 'prazo' ? comAlfa(cor(p), 0.55) : cor(p),
          borderRadius: (pilha === 'div' && k === 3) || (pilha === 'real' && k === 5) ? [4, 4, 0, 0] : 0 },
        emphasis: { focus: 'series' } })),
    };
  };

  const opPrazos = (p) => {
    // bolhas: ano do anúncio (x) × ano prometido (y), tamanho = nº de previsões; a linha liga a mediana do ano
    // prometido em cada ano de anúncio — subindo, os prazos foram empurrados para frente
    const grupos = new Map();
    const add = (tab, pos, fonte) => pos.forEach((i) => {
      const d = tab.dados.d[i], prom = tab.dados.ano[i];
      if (!d || !['conclusao', 'operacao'].includes(tab.dados.tipo[i]) || !prom || prom < ANO_MIN_GRAFICOS || prom > ANO_ATUAL + 15) return;
      const an = Number(d.slice(0, 4));
      if (an < ano0() || an > ano1()) return;
      const k = `${fonte}|${an}|${prom}`;
      if (!grupos.has(k)) grupos.set(k, { fonte, an, prom, n: 0, frases: [] });
      const g = grupos.get(k); g.n += 1; if (g.frases.length < 2) g.frases.push(tab.dados.frase[i]);
    });
    add(fatos, P.prazo, 'pdf');
    if (comWeb('prazos')) add(promessas, P.web.promessas, 'web');
    const todos = [...grupos.values()];
    const mediana = new Map();
    todos.forEach((g) => { if (!mediana.has(g.an)) mediana.set(g.an, []); for (let k = 0; k < g.n; k++) mediana.get(g.an).push(g.prom); });
    const linhaMed = [...mediana.entries()].sort((a, b) => a[0] - b[0]).map(([an, ys]) => {
      ys.sort((a, b) => a - b); const mm = Math.floor(ys.length / 2);
      return [an, ys.length % 2 ? ys[mm] : (ys[mm - 1] + ys[mm]) / 2];
    });
    const tam = (n) => Math.min(42, 8 + Math.sqrt(n) * 6);
    const pts = (fonte) => todos.filter((g) => g.fonte === fonte).map((g) => ({ value: [g.an, g.prom, g.n], g }));
    const minAno = Math.min(ano0(), ...todos.map((g) => g.prom)), maxAno = Math.max(ANO_ATUAL + 1, ...todos.map((g) => g.prom));
    return {
      tooltip: { trigger: 'item', confine: true, formatter: (x) => {
        if (x.seriesType === 'line') return `<b>${x.value[0]}</b><br>${t('ges.prazos.mediana')}: <b>${Math.round(x.value[1])}</b>`;
        const g = x.data.g;
        return `<div style="max-width:300px;white-space:normal"><b>${t('ges.prazos.n', { n: numero(g.n) })}</b><br>`
          + `<small>${t('ges.prazos.anunciado')} ${g.an} · ${t('ges.prazos.prometido')} ${g.prom} · ${fonteTxt(g.fonte)}</small>`
          + `${g.frases.map((s) => `<br>“${esc(cortar(s, 180))}”`).join('')}</div>`;
      } },
      legend: legenda(p),
      grid: grade({ top: 48 }),
      xAxis: eixoValor(p, { min: ano0() - 0.5, max: ano1() + 0.5, interval: 1, splitLine: { show: false },
        axisLabel: { color: p.texto2, fontSize: 11, formatter: (v) => (Number.isInteger(v) ? String(v) : '') } }),
      yAxis: eixoValor(p, { min: Math.floor((minAno - 1) / 5) * 5, max: Math.ceil((maxAno + 1) / 5) * 5, interval: 5,
        axisLabel: { color: p.texto2, fontSize: 11, formatter: (v) => String(v) } }),
      series: [
        { type: 'scatter', name: t('ges.base.web_um'), data: pts('web'), symbolSize: (v) => tam(v[2]),
          itemStyle: { color: comAlfa(p.series[1], 0.45), borderColor: p.series[1], borderWidth: 1 } },
        { type: 'scatter', name: t('ges.base.pdf_um'), data: pts('pdf'), symbol: 'diamond', symbolSize: (v) => tam(v[2]) + 4,
          itemStyle: { color: p.acento, shadowBlur: 10, shadowColor: p.acento }, z: 3 },
        { type: 'line', name: t('ges.prazos.mediana'), data: linhaMed, symbol: 'circle', symbolSize: 6, z: 4,
          lineStyle: { color: p.series[4], width: 2 }, itemStyle: { color: p.series[4] },
          markLine: { silent: true, symbol: 'none', lineStyle: { color: p.texto3 || p.texto2, type: 'dashed', opacity: 0.6 },
            label: { color: p.texto2, fontSize: 10, formatter: (x) => x.name },
            data: [[{ name: t('ges.prazos.mesmo_ano'), coord: [ano0(), ano0()] }, { coord: [ano1(), ano1()] }],
              { name: t('ges.prazos.hoje'), yAxis: ANO_ATUAL }] } },
      ],
    };
  };

  const opAvanco = (p) => {
    // por trecho (barras horizontais): último % divulgado; traço = mediana dos 6 mais recentes
    const linhas = new Map();
    const add = (tr, d, v) => { if (!tr || !d) return; if (!linhas.has(tr)) linhas.set(tr, []); linhas.get(tr).push({ d, valor: v }); };
    P.pct.forEach((i) => add(fatos.dados.trecho[i], fatos.dados.d[i], fatos.dados.valor[i]));
    if (comWeb('avanco')) P.web.percentuais.forEach((i) => add(percentuais.dados.trecho[i], percentuais.dados.d[i], percentuais.dados.valor[i]));
    const res = [...linhas.entries()].map(([tr, ls]) => ({ tr, ...resumoPct(ls) })).sort((a, b) => b.n - a.n).slice(0, 8).reverse();
    const nomes = res.map((r) => rotulo('trecho', r.tr));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, formatter: (xs) => {
        const r = res[xs[0].dataIndex];
        return `<b>${nomes[xs[0].dataIndex]}</b><br>${t('ges.col.ultimo')}: <b>${numero(r.ultimo.valor, { maximumFractionDigits: 1 })}%</b> (${dataCurta(r.ultimo.d)})<br>`
          + `${t('ges.col.mediana')}: ${numero(r.mediana, { maximumFractionDigits: 0 })}%<br>${t('ges.col.registros')}: ${numero(r.n)}`;
      } },
      legend: legenda(p),
      grid: grade({ top: 40, right: 70 }),
      xAxis: eixoValor(p, { max: 100, axisLabel: { color: p.texto2, formatter: '{value}%' } }),
      yAxis: eixoCategoria(p, nomes, { axisLabel: { color: p.texto2, fontSize: 11, width: 150, overflow: 'truncate' } }),
      series: [
        { type: 'bar', name: t('ges.col.ultimo'), data: res.map((r) => r.ultimo.valor), barMaxWidth: 16,
          itemStyle: { color: p.acento, borderRadius: [0, 4, 4, 0] },
          showBackground: true, backgroundStyle: { color: comAlfa(p.acento, 0.06), borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'right', color: p.texto2, fontSize: 11,
            formatter: (x) => `${numero(Math.round(x.value))}% · ${numero(res[x.dataIndex].n)} reg.` } },
        { type: 'scatter', name: t('ges.col.mediana'), data: res.map((r) => Math.round(r.mediana)), symbol: 'rect', symbolSize: [3, 20],
          itemStyle: { color: p.series[4] }, z: 4 },
      ],
    };
  };

  const opLinha = (p) => {
    // linhas = tipos de fato (da licitação à inauguração); losango = documento oficial, ponto = matéria
    const cats = TIPOS_FATO.map((x) => rotulo('evento', x));
    const pts = (tab, pos, fonte) => pos.filter((i) => TIPOS_FATO.includes(tab.dados.tipo[i]) && tab.dados.d[i]
      && Number(tab.dados.d[i].slice(0, 4)) >= ano0())
      .map((i) => ({ value: [tab.dados.d[i], TIPOS_FATO.indexOf(tab.dados.tipo[i])], frase: tab.dados.frase[i], trecho: tab.dados.trecho[i], fonte }));
    return {
      tooltip: { trigger: 'item', confine: true, formatter: (x) => `<div style="max-width:320px;white-space:normal"><b>${cats[x.data.value[1]]}</b> · ${dataCurta(x.data.value[0])}<br>`
        + `<small>${fonteTxt(x.data.fonte)}${x.data.trecho ? ` · ${rotulo('trecho', x.data.trecho)}` : ''}</small><br>${esc(cortar(x.data.frase, 220))}</div>` },
      legend: legenda(p),
      grid: grade({ top: 40, left: 12 }),
      xAxis: eixoTempo(p),
      yAxis: { type: 'category', data: cats, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: p.texto2, fontSize: 11 },
        splitArea: { show: true, areaStyle: { color: [comAlfa(p.acento, 0.03), 'transparent'] } }, splitLine: { show: false } },
      series: [
        { type: 'scatter', name: t('ges.base.web_um'), data: comWeb('linha') ? pts(eventos, P.web.eventos, 'web') : [], symbolSize: 6,
          itemStyle: { color: comAlfa(p.series[1], 0.4) }, emphasis: { scale: 2 } },
        { type: 'scatter', name: t('ges.base.pdf_um'), data: pts(fatos, P.evento, 'pdf'), symbol: 'diamond', symbolSize: 14, z: 3,
          itemStyle: { color: p.acento, shadowBlur: 10, shadowColor: p.acento } },
      ],
    };
  };

  const opEtapas = (p) => {
    // mapa de calor trecho × etapa: quantos fatos de cada etapa já foram registrados em cada trecho
    const cont = new Map();
    const add = (tr, tipo) => { if (!tr || !TIPOS_FATO.includes(tipo)) return; const k = `${tr}|${tipo}`; cont.set(k, (cont.get(k) || 0) + 1); };
    P.evento.forEach((i) => add(fatos.dados.trecho[i], fatos.dados.tipo[i]));
    if (comWeb('etapas')) P.web.eventos.forEach((i) => add(eventos.dados.trecho[i], eventos.dados.tipo[i]));
    const totTr = new Map();
    cont.forEach((n, k) => { const tr = k.split('|')[0]; totTr.set(tr, (totTr.get(tr) || 0) + n); });
    const trs = [...totTr.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tr]) => tr).reverse();
    const dados = [];
    trs.forEach((tr, y) => TIPOS_FATO.forEach((tp, x) => { const n = cont.get(`${tr}|${tp}`); if (n) dados.push([x, y, n]); }));
    const max = Math.max(1, ...dados.map((d) => d[2]));
    return {
      tooltip: { formatter: (x) => `<b>${rotulo('trecho', trs[x.value[1]])}</b><br>${rotulo('evento', TIPOS_FATO[x.value[0]])}: <b>${numero(x.value[2])}</b>` },
      grid: grade({ top: 8, bottom: 40 }),
      xAxis: { type: 'category', data: TIPOS_FATO.map((x) => rotulo('evento', x)), splitArea: { show: false }, axisTick: { show: false },
        axisLine: { show: false }, axisLabel: { color: p.texto2, fontSize: 10, interval: 0, rotate: 28 } },
      yAxis: { type: 'category', data: trs.map((tr) => rotulo('trecho', tr)), axisTick: { show: false }, axisLine: { show: false },
        axisLabel: { color: p.texto2, fontSize: 11, width: 140, overflow: 'truncate' } },
      visualMap: { min: 0, max, show: false, inRange: { color: RAMPA_ACENTO.map((a) => comAlfa(p.acento, a)) } },
      series: [{ type: 'heatmap', data: dados, label: { show: true, color: p.texto, fontSize: 10 },
        itemStyle: { borderColor: p.fundo, borderWidth: 2, borderRadius: 3 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: p.acento } } }],
    };
  };

  const opValores = (p) => {
    // anúncios de valor DISTINTOS por ano (previstos, contratados, financiados): um valor (±1%) conta só no ano em
    // que apareceu pela primeira vez. Barras = quantos anúncios; linha = valor mediano (US$) dos anúncios do ano.
    // (Somar os valores não faz sentido: as matérias citam obras de toda a região, não só do corredor.)
    const ANUNCIO = ['previsto', 'contratado', 'financiado'];
    const itens = [];
    const pegar = (tab, pos, fonte) => pos.forEach((i) => {
      const u = tab.dados.usd[i], d = tab.dados.d[i];
      if (ANUNCIO.includes(tab.dados.tipo[i]) && u != null && d) itens.push({ d, u, fonte });
    });
    pegar(fatos, P.valor, 'pdf');
    if (comWeb('valores')) pegar(valores, P.web.valores, 'web');
    itens.sort((a, b) => a.d.localeCompare(b.d) || (a.fonte === 'pdf' ? -1 : 1));
    const vistos = [];
    const cont = { pdf: new Map(), web: new Map() }, usdAno = new Map();
    for (const x of itens) {
      if (vistos.some((v) => Math.abs(v - x.u) <= 0.01 * v)) continue;
      vistos.push(x.u);
      const a = x.d.slice(0, 4);
      cont[x.fonte].set(a, (cont[x.fonte].get(a) || 0) + 1);
      if (!usdAno.has(a)) usdAno.set(a, []);
      usdAno.get(a).push(x.u);
    }
    const anosEixo = [];
    for (let a = ano0(); a <= ano1(); a++) if (usdAno.has(String(a))) anosEixo.push(String(a));
    const med = (xs) => { const o = [...xs].sort((a, b) => a - b), k = Math.floor(o.length / 2); return o.length % 2 ? o[k] : (o[k - 1] + o[k]) / 2; };
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
        formatter: (xs) => `<b>${xs[0].axisValue}</b><br>${xs.map((x) => `${x.marker}${x.seriesName}: <b>${x.seriesType === 'line'
          ? dinheiro(x.value) : numero(x.value)}</b>`).join('<br>')}` },
      legend: legenda(p),
      grid: grade({ top: 48 }),
      xAxis: eixoCategoria(p, anosEixo),
      yAxis: [eixoValor(p, { minInterval: 1 }),
        eixoValor(p, { type: 'log', logBase: 10, splitLine: { show: false }, axisLabel: { color: p.texto2, fontSize: 11, formatter: (v) => compacto(v) } })],
      series: [
        { type: 'bar', name: t('ges.base.web_um'), stack: 'v', data: anosEixo.map((a) => cont.web.get(a) || 0), barMaxWidth: 26,
          itemStyle: { color: comAlfa(p.series[1], 0.55) } },
        { type: 'bar', name: t('ges.base.pdf_um'), stack: 'v', data: anosEixo.map((a) => cont.pdf.get(a) || 0), barMaxWidth: 26,
          itemStyle: { color: p.acento, borderRadius: [4, 4, 0, 0] } },
        { type: 'line', name: t('ges.valores.mediana'), yAxisIndex: 1, data: anosEixo.map((a) => med(usdAno.get(a))), symbol: 'circle', symbolSize: 6,
          lineStyle: { color: p.series[4], width: 2 }, itemStyle: { color: p.series[4] } },
      ],
    };
  };

  const desenharRecentes = () => {
    const ult = [...P.evento].sort((a, b) => fatos.dados.d[b].localeCompare(fatos.dados.d[a])).slice(0, 10);
    cx.recentes.replaceChildren(ult.length ? h('ol', { class: 'fatos-lista' }, ult.map((i) => {
      const pi = posPdfPorId.get(fatos.dados.id[i]);
      return h('li', {},
        h('span', { class: `marca-fato${ENTREGUES.includes(fatos.dados.tipo[i]) ? ' entregue' : ''}` }),
        h('div', {},
          h('b', {}, rotulo('evento', fatos.dados.tipo[i])), fatos.dados.trecho[i] ? ` · ${rotulo('trecho', fatos.dados.trecho[i])}` : '',
          h('p', {}, cortar(fatos.dados.frase[i], 220)),
          h('small', { class: 'mudo' }, dataCurta(fatos.dados.d[i]), ' · ',
            pi != null ? h('button', { class: 'link-botao', type: 'button', onclick: () => abrirFicha(pi) }, cortar(tituloPdf(pi), 80)) : '')));
    })) : h('p', { class: 'vazio' }, t('ges.recentes.vazio')));
  };

  /* ------------------------------------------------------------------ montagem */
  const OPS = { divulgado: opDivulgado, prazos: opPrazos, avanco: opAvanco, linha: opLinha, etapas: opEtapas, valores: opValores };
  const G = Object.fromEntries(Object.entries(OPS).map(([k, op]) => [k, grafico(E[k], op)]));
  let mapa = null;
  const desenhar = () => {
    desenharKpis(); desenharCategorias(); pagina = 0; desenharLista(); desenharRecentes();
    for (const [k, g] of Object.entries(G)) g.atualizar(OPS[k]);
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
