/**
 * @file: assets/js/paginas/dashboard.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-26
 * @ultima_modificacao: 2026-10-30
 * @versao: 0.5.1
 * @descricao: DASHBOARD (página inicial). Filtros (período, país da fonte, relevância, idioma) e sete
 *             seções, cada uma ligada a um subitem da barra lateral:
 *               visao      8 indicadores com minigráfico / anel de %
 *               cobertura  área mensal com zoom, rosca país/idioma, colunas por ano, calendário (calor)
 *               territorio mapa MapLibre (traçado + lugares) e trechos mais citados
 *               fontes     barras das fontes, dispersão volume × foco, histograma de tamanho
 *               temas      radar temático por país e barras dos temas
 *               obra       box plot do % de obra por trecho, avanço da ponte, valores por tipo, fatos/ano
 *               ultimas    tabela paginada das matérias mais recentes
 *             Todas as contagens de matérias são únicas por grupo de tradução. As tabelas de gestão
 *             seguem só o filtro de período (o país delas é o do fato, não o da fonte).
 * @requisitos: dados v3 (manifest, dic, índices, gestão), ECharts, MapLibre.
 */
import { carregarPainel, ErroContrato } from '../dados/carregador.js';
import { agregar, criarFiltro, anosDisponiveis, filtrarGestao, caixasPorTrecho, avancoPonte } from '../dados/consultas.js';
import { t, numero, pct, mesAno, nomesMeses, dataCurta } from '../i18n.js';
import { h, icone, cartao, kpi, tituloSecao, carregando, erro, tabelaMaterias, cabecalhoPagina } from '../ui/dom.js';
import { grafico, grade, eixoCategoria, eixoValor, gradiente, comAlfa, rampaAcento, RAMPA_ACENTO } from '../ui/graficos.js';
import { montarMapa } from '../ui/mapa.js';
import { rotulo } from '../rotulos.js';
import { navegar } from '../roteador.js';

let filtroSalvo = null;                                   // o filtro sobrevive à navegação entre páginas
const SECOES = ['visao', 'cobertura', 'territorio', 'fontes', 'temas', 'obra', 'ultimas'];

export async function montar(alvo) {
  alvo.append(carregando());
  let D;
  try {
    D = await carregarPainel();
  } catch (e) {
    alvo.replaceChildren(erro(e instanceof ErroContrato ? t('erro.contrato', { versao: e.versao }) : t('erro.dados'), () => location.reload()));
    return null;
  }
  const { m, dic, idx, pdfs, valores, percentuais, eventos } = D;
  const faixaAnos = anosDisponiveis(idx);
  const f = filtroSalvo || (filtroSalvo = { de: faixaAnos[0], ate: faixaAnos[1], pais: '', site: '', nivel: '', idioma: '' });
  const niveis = dic.niveis;
  const ponte = avancoPonte(percentuais);

  let A, G;                                                // agregados do filtro atual
  const recalcular = () => {
    A = agregar(idx, dic, criarFiltro(idx, dic, f, faixaAnos));
    G = {
      valores: filtrarGestao(valores, f.de, f.ate),
      percentuais: filtrarGestao(percentuais, f.de, f.ate),
      eventos: filtrarGestao(eventos, f.de, f.ate),
      pdfs: pdfsNoFiltro(),
    };
  };
  const pdfsNoFiltro = () => {
    const out = [];
    for (let i = 0; i < pdfs.n; i++) {
      const d = pdfs.dados.d[i];
      const pais = dic.sites[pdfs.dados.s[i]]?.pais || '';
      if (f.pais && pais !== f.pais) continue;
      if (f.site !== '' && pdfs.dados.s[i] !== Number(f.site)) continue;
      if (d && (d.slice(0, 4) < String(f.de) || d.slice(0, 4) > String(f.ate))) continue;
      out.push(i);
    }
    return out;
  };
  recalcular();

  /* ------------------------------------------------------------------ filtros */
  const opcoesAno = () => {
    const out = [];
    for (let a = faixaAnos[1]; a >= faixaAnos[0]; a--) out.push(a);
    return out;
  };
  const sel = (valor, opcoes, aoMudar) => {
    const s = h('select', { class: 'campo', onchange: (ev) => aoMudar(ev.target.value) },
      opcoes.map(([v, r]) => h('option', { value: v, selected: String(v) === String(valor) }, r)));
    return s;
  };
  const paisesFonte = [...new Set(dic.sites.map((s) => s.pais).filter(Boolean))];
  // fontes com matérias no índice, agrupadas por país (optgroup)
  const comMaterias = new Set(idx.dados.s);
  const selSite = h('select', { class: 'campo', onchange: (ev) => { f.site = ev.target.value; aplicar(); } },
    h('option', { value: '' }, t('filtro.todos')),
    paisesFonte.map((p) => h('optgroup', { label: rotulo('pais', p) },
      dic.sites.map((st, k) => [st, k]).filter(([st, k]) => st.pais === p && comMaterias.has(k))
        .sort((a, b) => a[0].nome.localeCompare(b[0].nome))
        .map(([st, k]) => h('option', { value: k, selected: String(k) === String(f.site) }, st.nome)))));
  const resumoNum = h('b');
  const resumo = h('div', { class: 'filtros-resumo', role: 'status' }, icone('bx-filter-alt'), resumoNum, h('span', {}, t('filtro.resumo')));
  const aplicar = () => { recalcular(); atualizarTudo(); };
  // cada filtro: rótulo pequeno em cima e o campo embaixo (todos na mesma linha no computador)
  const campo = (ic, rot, ...controles) => h('label', { class: 'filtro' },
    h('span', { class: 'filtro-rotulo' }, icone(ic), rot), h('span', { class: 'filtro-controles' }, controles));
  const filtros = h('div', { class: 'cartao filtros', role: 'group', 'aria-label': t('filtro.periodo') },
    h('div', { class: 'filtros-campos' },
      campo('bx-calendar', t('filtro.periodo'),
        sel(f.de, opcoesAno().map((a) => [a, a]).reverse(), (v) => { f.de = Number(v); if (f.de > f.ate) f.ate = f.de; aplicar(); }),
        h('span', { class: 'filtro-ate' }, t('filtro.ate')),
        sel(f.ate, opcoesAno().map((a) => [a, a]), (v) => { f.ate = Number(v); if (f.ate < f.de) f.de = f.ate; aplicar(); })),
      campo('bx-world', t('filtro.pais'),
        sel(f.pais, [['', t('filtro.todos')], ...paisesFonte.map((p) => [p, rotulo('pais', p)])], (v) => { f.pais = v; aplicar(); })),
      campo('bx-broadcast', t('filtro.fonte'), selSite),
      campo('bx-target-lock', t('filtro.nivel'),
        sel(f.nivel, [['', t('filtro.todos')], ...niveis.filter((n) => n !== 'ruido').map((n) => [n, t(`nivel.${n}`)])], (v) => { f.nivel = v; aplicar(); })),
      campo('bx-globe', t('filtro.idioma'),
        sel(f.idioma, [['', t('filtro.todos')], ...dic.idiomas.map((l) => [l, l.toUpperCase()])], (v) => { f.idioma = v; aplicar(); })),
      h('button', { class: 'botao botao-pequeno botao-fantasma filtros-limpar', type: 'button', onclick: () => {
        Object.assign(f, { de: faixaAnos[0], ate: faixaAnos[1], pais: '', site: '', nivel: '', idioma: '' });
        navegar(true);                                     // remonta a página com os selects zerados
      } }, icone('bx-reset'), t('filtro.limpar'))),
    resumo);

  /* ------------------------------------------------------------------ esqueleto */
  const cxKpis = h('div', { class: 'grade' });
  const el = (classe = 'grafico') => h('div', { class: classe });
  const E = {
    tempo: el('grafico grafico-alto'), paises: el('grafico grafico-alto'), anos: el(), calor: el(),
    fontes: el('grafico grafico-alto'), dispersao: el('grafico grafico-alto'), histograma: el('grafico grafico-baixo'), radar: el('grafico grafico-alto'), temas: el('grafico grafico-alto'),
    boxplot: el(), ponte: el(), tiposValor: el(), eventos: el(),
  };
  const cxTrechos = h('div', { class: 'cartao-corpo' });
  const cxMapa = h('div', { class: 'mapa' });
  const cxTabela = h('div');
  let modoRosca = 'pais';
  const abasRosca = h('div', { class: 'abas', role: 'group' },
    h('button', { 'aria-pressed': 'true', onclick: (ev) => trocarRosca('pais', ev.currentTarget) }, t('tab.pais')),
    h('button', { 'aria-pressed': 'false', onclick: (ev) => trocarRosca('idioma', ev.currentTarget) }, t('tab.idioma')));
  const trocarRosca = (modo, botao) => {
    modoRosca = modo;
    abasRosca.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
    G_.paises.atualizar(opPaises);
  };

  alvo.replaceChildren(
    cabecalhoPagina({
      trilha: [t('nav.dashboard'), t('sub.visao')],
      titulo: t('dash.titulo'),
      acao: h('button', { class: 'botao botao-info', type: 'button', title: t('dados.titulo'),
        onclick: (ev) => { ev.stopPropagation(); document.getElementById('botao-dados')?.click(); } },
        icone('bx-time-five'), t('dados.atualizado', { data: dataCurta(m.gerado_em.slice(0, 10)) })),
    }),
    filtros,
    tituloSecao('visao', 'bx-pulse', t('sec.visao')), cxKpis,
    tituloSecao('cobertura', 'bx-line-chart', t('sec.cobertura')),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-8', titulo: t('g.tempo'), sub: t('g.tempo.sub'), corpo: E.tempo }),
      cartao({ classe: 'c-4', titulo: t('g.paises'), sub: t('g.paises.sub'), acoes: abasRosca, corpo: E.paises })),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-6', titulo: t('g.anos'), sub: t('g.anos.sub'), corpo: E.anos }),
      cartao({ classe: 'c-6', titulo: t('g.calor'), sub: t('g.calor.sub'), corpo: E.calor })),
    tituloSecao('territorio', 'bx-map-alt', t('sec.territorio')),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-8', titulo: t('g.mapa'), sub: t('g.mapa.sub'), corpo: cxMapa }),
      cartao({ classe: 'c-4', titulo: t('g.trechos'), sub: t('g.trechos.sub'), corpo: cxTrechos })),
    tituloSecao('fontes', 'bx-broadcast', t('sec.fontes')),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-6', titulo: t('g.top_fontes'), sub: t('g.top_fontes.sub'), corpo: E.fontes }),
      cartao({ classe: 'c-6', titulo: t('g.dispersao'), sub: t('g.dispersao.sub'), corpo: E.dispersao })),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-12', titulo: t('g.histograma'), sub: t('g.histograma.sub'), corpo: E.histograma })),
    tituloSecao('temas', 'bx-category', t('sec.temas')),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-7', titulo: t('g.radar'), sub: t('g.radar.sub'), corpo: E.radar }),
      cartao({ classe: 'c-5', titulo: t('g.temas'), sub: t('g.temas.sub'), corpo: E.temas })),
    tituloSecao('obra', 'bx-hard-hat', t('sec.obra')),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-6', titulo: t('g.boxplot'), sub: t('g.boxplot.sub'), corpo: E.boxplot,
        nota: h('span', { class: 'semaforo' }, t('semaforo.titulo'),
          [1, 2, 3, 4].map((k) => h('span', {}, h('i', { class: `sem-${k}` }), t(`semaforo.${k}`)))) }),
      cartao({ classe: 'c-6', titulo: t('g.avanco'), sub: t('g.avanco.sub'), corpo: E.ponte })),
    h('div', { class: 'grade' },
      cartao({ classe: 'c-6', titulo: t('g.tipos_valor'), sub: t('g.tipos_valor.sub'), corpo: E.tiposValor }),
      cartao({ classe: 'c-6', titulo: t('g.eventos'), sub: t('g.eventos.sub'), corpo: E.eventos })),
    tituloSecao('ultimas', 'bx-news', t('sec.ultimas')),
    h('div', { class: 'grade' }, cartao({ classe: 'c-12', titulo: t('g.ultimas'), sub: t('g.ultimas.sub'), corpo: cxTabela })));

  /* ------------------------------------------------------------------ indicadores */
  const ultimos12 = (serie) => serie.slice(-12);
  const desenharKpis = () => {
    const totalMes = A.meses.map((_, k) => A.porMes.reduce((s, sr) => s + sr[k], 0));
    const iN = niveis.indexOf('nucleo');
    const paisesAtivos = new Set([...A.porSite.keys()].map((s) => dic.sites[s]?.pais).filter(Boolean));
    const topLugar = [...A.lugares.entries()].sort((a, b) => b[1] - a[1])[0];
    const valoresObra = G.valores.filter((i) => valores.dados.tipo[i] !== 'economico');
    const comTipo = valoresObra.filter((i) => valores.dados.tipo[i] !== 'outro').length;
    const eventosAno = new Map();
    G.eventos.forEach((i) => { const a = eventos.dados.d[i].slice(0, 4); eventosAno.set(a, (eventosAno.get(a) || 0) + 1); });
    cxKpis.replaceChildren(
      kpi({ rotulo: t('kpi.materias'), valor: numero(A.total), iconeNome: 'bx-news',
        pe: t('kpi.materias.pe', { n: numero(ultimos12(totalMes).reduce((a, b) => a + b, 0)) }), serie: ultimos12(totalMes) }),
      kpi({ rotulo: t('kpi.nucleo'), valor: numero(A.nucleo), iconeNome: 'bx-target-lock',
        pe: t('kpi.nucleo.pe', { p: pct(A.total ? A.nucleo / A.total : 0) }), serie: ultimos12(A.porMes[iN] || []) }),
      kpi({ rotulo: t('kpi.fontes'), valor: numero(A.porSite.size), iconeNome: 'bx-broadcast',
        pe: t('kpi.fontes.pe', { n: numero(paisesAtivos.size) }) }),
      kpi({ rotulo: t('kpi.pdfs'), valor: numero(G.pdfs.length), iconeNome: 'bx-file', pe: t('kpi.pdfs.pe') }),
      kpi({ rotulo: t('kpi.lugares'), valor: numero(A.lugares.size), iconeNome: 'bx-map-pin',
        pe: topLugar ? t('kpi.lugares.pe', { nome: dic.lugares[topLugar[0]]?.nome || '' }) : '' }),
      kpi({ rotulo: t('kpi.fatos'), valor: numero(G.eventos.length), iconeNome: 'bx-check-shield', pe: t('kpi.fatos.pe'),
        serie: [...eventosAno.keys()].sort().slice(-10).map((a) => eventosAno.get(a)) }),
      kpi({ rotulo: t('kpi.valores'), valor: numero(valoresObra.length), iconeNome: 'bx-dollar-circle',
        pe: t('kpi.valores.pe', { n: numero(comTipo) }) }),
      kpi({ rotulo: t('kpi.ponte'), valor: ponte.mediana != null ? `${numero(Math.round(ponte.mediana))}%` : '—',
        anel: ponte.mediana ?? 0, pe: t('kpi.ponte.pe', { mes: mesAno(ponte.ate) }) }));
    [...cxKpis.children].forEach((c) => c.classList.add('c-3'));
    resumoNum.textContent = numero(A.total);
  };

  /* ------------------------------------------------------------------ opções dos gráficos */
  const nomeNivel = (n) => t(`nivel.${n}`);
  const rotuloFatia = (p) => ({ show: true, position: 'inside', color: '#fff', fontWeight: 600, fontSize: 11,
    textBorderColor: 'rgba(0,0,0,.45)', textBorderWidth: 2,
    formatter: (x) => (x.percent >= 4 ? `${numero(x.percent, { maximumFractionDigits: 0 })}%` : '') });
  const niveisVis = niveis.filter((n) => n !== 'ruido');

  const opTempo = (p) => {
    const inicio = Math.max(0, A.meses.findIndex((m) => m >= `${f.ate - 9}`));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'line', lineStyle: { color: p.acento } } },
      legend: { right: 8 },
      grid: grade({ bottom: 48 }),
      xAxis: eixoCategoria(p, A.meses.map(mesAno), { boundaryGap: false }),
      yAxis: eixoValor(p),
      dataZoom: [{ type: 'inside', startValue: inicio }, {
        type: 'slider', startValue: inicio, height: 18, bottom: 6, borderColor: 'transparent', backgroundColor: comAlfa(p.acento, 0.06),
        fillerColor: comAlfa(p.acento, 0.16), handleStyle: { color: p.acento }, dataBackground: { lineStyle: { color: p.acento }, areaStyle: { color: comAlfa(p.acento, 0.2) } },
        textStyle: { color: p.texto2 } }],
      series: niveisVis.map((n, j) => ({
        name: nomeNivel(n), type: 'line', stack: 'total', smooth: 0.35, symbol: 'none',
        lineStyle: { width: 2, color: p.series[j] }, itemStyle: { color: p.series[j] },
        areaStyle: { color: gradiente(p.series[j], j ? 0.25 : 0.5) },
        data: A.porMes[niveis.indexOf(n)],
      })),
    };
  };

  const opPaises = (p) => {
    const dados = modoRosca === 'pais'
      ? [...A.porPaisFonte.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ name: rotulo('pais', k), value: v }))
      : [...A.porIdioma.entries()].map(([k, v]) => ({ name: (dic.idiomas[k] || '?').toUpperCase(), value: v }));
    return {
      tooltip: { trigger: 'item', formatter: (x) => `${x.name}<br><b>${numero(x.value)}</b> · ${numero(x.percent, { maximumFractionDigits: 1 })}%` },
      legend: { bottom: 0, top: 'auto' },
      title: { text: numero(A.total), subtext: t('eixo.materias'), left: 'center', top: '38%',
        textStyle: { color: p.texto, fontFamily: 'Orbitron', fontSize: 20, fontWeight: 600 }, subtextStyle: { color: p.texto2 } },
      series: [{ type: 'pie', radius: ['50%', '78%'], center: ['50%', '45%'], padAngle: 2, itemStyle: { borderRadius: 6 },
        label: rotuloFatia(p), labelLine: { show: false }, emphasis: { scale: true, scaleSize: 6 }, data: dados }],
    };
  };

  const opAnos = (p) => ({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { right: 8 },
    grid: grade(),
    xAxis: eixoCategoria(p, A.anos),
    yAxis: eixoValor(p),
    series: niveisVis.map((n, j) => ({ name: nomeNivel(n), type: 'bar', stack: 'ano', barMaxWidth: 22,
      itemStyle: { color: j ? comAlfa(p.series[1], 0.55) : p.series[0], borderRadius: j ? [4, 4, 0, 0] : 0 },
      data: A.porAno(niveis.indexOf(n)) })),
  });

  const opCalor = (p) => {
    const anos = [];
    for (let a = f.de; a <= f.ate; a++) anos.push(String(a));
    const dados = [];
    let max = 1;
    anos.forEach((a, y) => { for (let m = 1; m <= 12; m++) {
      const v = A.calor.get(`${a}-${String(m).padStart(2, '0')}`) || 0;
      max = Math.max(max, v);
      dados.push([m - 1, y, v || '-']);
    } });
    return {
      tooltip: { formatter: (x) => `${nomesMeses()[x.value[0]]} ${anos[x.value[1]]}<br><b>${numero(x.value[2] === '-' ? 0 : x.value[2])}</b> ${t('eixo.materias')}` },
      grid: grade({ top: 8, bottom: 40 }),
      xAxis: eixoCategoria(p, nomesMeses(), { splitArea: { show: false } }),
      yAxis: eixoCategoria(p, anos, { axisLabel: { color: p.texto2, fontSize: 10 } }),
      visualMap: { min: 0, max, calculable: false, orient: 'horizontal', left: 'center', bottom: 0, itemHeight: 120, itemWidth: 10,
        textStyle: { color: p.texto2 }, inRange: { color: RAMPA_ACENTO.map((a) => comAlfa(p.acento, a)) } },
      series: [{ type: 'heatmap', data: dados, itemStyle: { borderColor: p.fundo, borderWidth: 2, borderRadius: 3 },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: p.acento } } }],
    };
  };

  const topFontes = () => [...A.porSite.entries()].sort((a, b) => b[1].n - a[1].n);
  const opFontes = (p) => {
    const top = topFontes().slice(0, 10).reverse();
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { right: 8 },
      grid: grade(),
      xAxis: eixoValor(p),
      yAxis: eixoCategoria(p, top.map(([s]) => dic.sites[s]?.nome || s), { axisLabel: { color: p.texto2, fontSize: 11, width: 110, overflow: 'truncate' } }),
      series: [
        { name: nomeNivel('nucleo'), type: 'bar', stack: 'f', barMaxWidth: 14, itemStyle: { color: p.series[0] }, data: top.map(([, v]) => v.nucleo) },
        { name: nomeNivel('contexto'), type: 'bar', stack: 'f', barMaxWidth: 14, itemStyle: { color: comAlfa(p.series[1], 0.5), borderRadius: [0, 4, 4, 0] },
          data: top.map(([, v]) => v.n - v.nucleo) },
      ],
    };
  };

  const opDispersao = (p) => {
    const porPais = new Map();
    for (const [st, v] of A.porSite) {
      const site = dic.sites[st]; const pais = site?.pais || '?';
      if (!porPais.has(pais)) porPais.set(pais, []);
      porPais.get(pais).push([v.n, Math.round((v.nucleo / v.n) * 100), site?.nome || st]);
    }
    const max = Math.max(1, ...[...A.porSite.values()].map((v) => v.n));
    const destaque = new Set([...A.porSite.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 6)
      .map(([st]) => dic.sites[st]?.nome || st));                // só as 6 maiores fontes ganham nome
    const compacto = (v) => numero(v, { notation: 'compact', maximumFractionDigits: 1 });
    return {
      tooltip: { formatter: (x) => `<b>${x.value[2]}</b><br>${numero(x.value[0])} ${t('eixo.materias')}<br>${x.value[1]}% ${t('nivel.nucleo').toLowerCase()}` },
      legend: { bottom: 0, top: 'auto', left: 'center' },
      grid: grade({ top: 34, bottom: 56, left: 16, right: 56 }),
      xAxis: eixoValor(p, { type: 'log', min: 1, name: t('eixo.materias'), nameLocation: 'middle', nameGap: 28,
        nameTextStyle: { color: p.texto2, fontSize: 12 }, axisLabel: { color: p.texto2, fontSize: 11, formatter: compacto } }),
      yAxis: eixoValor(p, { min: 0, max: 100, name: t('eixo.pct_obra'), nameLocation: 'end', nameGap: 12,
        nameTextStyle: { color: p.texto2, fontSize: 12, align: 'left' }, axisLabel: { color: p.texto2, fontSize: 11, formatter: '{value}%' } }),
      series: [...porPais.entries()].map(([pais, pts]) => ({ name: rotulo('pais', pais), type: 'scatter', data: pts,
        symbolSize: (v) => 10 + 30 * Math.sqrt(v[0] / max), itemStyle: { opacity: 0.85, borderColor: p.fundo, borderWidth: 1 },
        label: { show: true, position: 'top', distance: 6, fontSize: 10, color: p.texto2,
          formatter: (x) => (destaque.has(x.value[2]) ? x.value[2] : '') },
        labelLayout: { hideOverlap: true },
        emphasis: { focus: 'series', label: { show: true, formatter: (x) => x.value[2] } } })),
    };
  };

  const opHistograma = (p) => {
    const { faixas, valores: v } = A.histograma;
    const rot = faixas.slice(0, -1).map((a, i) => (faixas[i + 1] === Infinity ? `${numero(a)}+` : `${numero(a)}–${numero(faixas[i + 1])}`));
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: grade({ top: 16, bottom: 4 }),
      xAxis: eixoCategoria(p, rot, { axisLabel: { color: p.texto2, fontSize: 11, interval: 0 } }),
      yAxis: eixoValor(p),
      // mesma rampa do calendário de cobertura: acento translúcido (poucas) → acento pleno (muitas)
      series: [{ type: 'bar', barCategoryGap: '4%', name: t('eixo.materias'),
        data: v.map((n) => ({ value: n, itemStyle: { color: rampaAcento(p, n / (Math.max(...v) || 1)) } })),
        itemStyle: { borderRadius: [4, 4, 0, 0] } }],
    };
  };

  const topTemas = () => [...A.temas.entries()].sort((a, b) => b[1] - a[1]);
  const opRadar = (p) => {
    const temas = topTemas().slice(0, 8).map(([c]) => c);
    const paises = ['BR', 'PY', 'AR', 'CL'].filter((x) => A.temasPais.get(x)?.n);
    const series = paises.map((x) => {
      const tp = A.temasPais.get(x);
      return { name: rotulo('pais', x), value: temas.map((c) => Math.round(((tp.temas.get(c) || 0) / tp.n) * 100)) };
    });
    const max = Math.max(10, ...series.flatMap((s) => s.value));
    return {
      tooltip: { trigger: 'item' },
      legend: { right: 8 },
      radar: { radius: '66%', center: ['50%', '55%'], splitNumber: 4,
        indicator: temas.map((c) => ({ name: rotulo('tema', dic.temas[c]), max: Math.ceil(max / 10) * 10 })),
        axisName: { color: p.texto2, fontSize: 11 }, splitLine: { lineStyle: { color: p.linha } },
        splitArea: { areaStyle: { color: ['transparent', comAlfa(p.acento, 0.03)] } }, axisLine: { lineStyle: { color: p.linha } } },
      series: [{ type: 'radar', symbolSize: 4, data: series.map((s, j) => ({ ...s,
        lineStyle: { width: 2, color: p.series[j === 1 ? 2 : j === 2 ? 3 : j === 3 ? 4 : 0] },
        itemStyle: { color: p.series[j === 1 ? 2 : j === 2 ? 3 : j === 3 ? 4 : 0] },
        areaStyle: { color: comAlfa(p.series[j === 1 ? 2 : j === 2 ? 3 : j === 3 ? 4 : 0], 0.12) } })) }],
    };
  };

  const opTemas = (p) => {
    const top = topTemas().reverse();
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: grade({ top: 8 }),
      xAxis: eixoValor(p),
      yAxis: eixoCategoria(p, top.map(([c]) => rotulo('tema', dic.temas[c]))),
      series: [{ type: 'bar', name: t('eixo.materias'), barMaxWidth: 14, data: top.map(([, v]) => v),
        itemStyle: { borderRadius: [0, 6, 6, 0], color: p.series[0] },
        label: { show: true, position: 'right', color: p.texto2, fontSize: 10, formatter: (x) => numero(x.value) } }],
    };
  };

  // faixas pela mediana do % divulgado, na rampa do calendário: até 40 (tom frio, translúcido) → 90+ (acento pleno)
  const ALFA_FAIXA = [0.3, 0.55, 0.8, 1];
  const faixa = (v) => (v >= 90 ? 3 : v >= 70 ? 2 : v >= 40 ? 1 : 0);
  const corSemaforo = (v, p) => comAlfa(p.acento, ALFA_FAIXA[faixa(v)]);
  const semaforoRotulo = (v) => t(`box.s${v >= 90 ? 4 : v >= 70 ? 3 : v >= 40 ? 2 : 1}`);
  const opBoxplot = (p) => {
    const caixas = caixasPorTrecho(percentuais, G.percentuais).slice(0, 7);
    return {
      tooltip: { trigger: 'item', confine: true, padding: [10, 14], formatter: (x) => {
        if (x.seriesType !== 'boxplot') return '';
        const [, mi, q1, me, q3, ma] = x.value;
        const cor = corSemaforo(me, p);
        const linha = (rot, v, forte) => `<tr><td style="padding:2px 14px 2px 0;opacity:.75">${rot}</td>`
          + `<td style="text-align:right;font-variant-numeric:tabular-nums">${forte ? `<b>${numero(v)}%</b>` : `${numero(v)}%`}</td></tr>`;
        return `<div style="font-weight:600;margin-bottom:4px">${x.name}</div>`
          + `<div style="opacity:.75;margin-bottom:6px">${t('box.n', { n: numero(caixas[x.dataIndex].n) })}</div>`
          + `<table style="border-collapse:collapse">${linha(t('box.maximo'), ma)}${linha(t('box.q3'), q3)}`
          + `${linha(t('box.mediana'), me, true)}${linha(t('box.q1'), q1)}${linha(t('box.minimo'), mi)}</table>`
          + `<div style="margin-top:6px;display:flex;align-items:center;gap:6px"><span style="width:10px;height:10px;border-radius:50%;background:${cor}"></span>`
          + `${t('box.situacao')}: <b>${semaforoRotulo(me)}</b></div>`
          + `<div style="margin-top:4px;opacity:.6;font-size:11px;max-width:240px;white-space:normal">${t('box.leitura')}</div>`;
      } },
      grid: grade({ top: 16 }),
      xAxis: eixoCategoria(p, caixas.map((c) => rotulo('trecho', c.trecho)), { axisLabel: { color: p.texto2, fontSize: 10, interval: 0, rotate: 20 } }),
      yAxis: eixoValor(p, { max: 100, axisLabel: { color: p.texto2, formatter: '{value}%' } }),
      series: [{ type: 'boxplot', boxWidth: ['30%', '55%'],
        data: caixas.map((c) => {
          const a = ALFA_FAIXA[faixa(c.caixa[2])];
          return { value: c.caixa, itemStyle: { color: comAlfa(p.acento, 0.08 + 0.22 * a), borderColor: comAlfa(p.acento, a), borderWidth: 1.8 } };
        }) }],
    };
  };

  const opPonte = (p) => {
    // pontos = maior % divulgado no mês (ruidoso: matérias repetem números antigos);
    // linha = mediana móvel de 3 meses. A obra da ponte começou em 2022.
    const serie = ponte.serie.filter(([m]) => m >= '2022-01');
    const mediana = serie.map((_, k) => {
      const janela = serie.slice(Math.max(0, k - 2), k + 1).map(([, v]) => v).sort((a, b) => a - b);
      return janela[Math.floor(janela.length / 2)];
    });
    return {
      tooltip: { trigger: 'axis', valueFormatter: (v) => `${numero(v)}%` },
      legend: { right: 8 },
      grid: grade({ top: 40 }),
      xAxis: eixoCategoria(p, serie.map(([m]) => mesAno(m)), { boundaryGap: false }),
      yAxis: eixoValor(p, { max: 100, axisLabel: { color: p.texto2, formatter: '{value}%' } }),
      series: [
        { type: 'scatter', name: t('g.avanco.pontos'), data: serie.map(([, v]) => v), symbolSize: 6,
          itemStyle: { color: comAlfa(p.series[1], 0.45) } },
        { type: 'line', name: t('g.avanco.mediana'), smooth: 0.4, symbol: 'none', data: mediana,
          lineStyle: { width: 3, color: p.acento, shadowBlur: 12, shadowColor: p.acento }, areaStyle: { color: gradiente(p.acento, 0.35) },
          markLine: { silent: true, symbol: 'none', lineStyle: { color: p.series[5], type: 'dashed' }, label: { color: p.texto2, formatter: '100%' }, data: [{ yAxis: 100 }] } },
      ],
    };
  };

  const opTiposValor = (p) => {
    const cont = new Map();
    G.valores.forEach((i) => { const k = valores.dados.tipo[i]; cont.set(k, (cont.get(k) || 0) + 1); });
    const ordem = ['previsto', 'contratado', 'financiado', 'executado', 'economico', 'outro'];
    const cores = { previsto: p.acento, contratado: p.series[2], financiado: p.series[3], executado: p.series[5],
      economico: p.series[4], outro: comAlfa(p.series[1], 0.25) };
    return {
      tooltip: { trigger: 'item', formatter: (x) => `${x.name}<br><b>${numero(x.value)}</b> · ${numero(x.percent, { maximumFractionDigits: 1 })}%` },
      legend: { orient: 'vertical', right: 8, top: 'middle' },
      series: [{ type: 'pie', radius: ['48%', '76%'], center: ['36%', '52%'], padAngle: 2, itemStyle: { borderRadius: 6 },
        label: rotuloFatia(p), labelLine: { show: false }, emphasis: { scale: true, scaleSize: 6 },
        data: ordem.filter((k) => cont.get(k)).map((k) => ({ name: rotulo('valor', k), value: cont.get(k), itemStyle: { color: cores[k] } })) }],
    };
  };

  const opEventos = (p) => {
    const anos = [...new Set(G.eventos.map((i) => eventos.dados.d[i].slice(0, 4)))].sort().slice(-12);
    const tipos = dic.tipos_evento;
    const cont = new Map();
    G.eventos.forEach((i) => { const k = `${eventos.dados.d[i].slice(0, 4)}|${eventos.dados.tipo[i]}`; cont.set(k, (cont.get(k) || 0) + 1); });
    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: { right: 8, type: 'scroll', width: '70%' },
      grid: grade({ top: 44 }),
      xAxis: eixoCategoria(p, anos),
      yAxis: eixoValor(p),
      series: tipos.map((tp) => ({ name: rotulo('evento', tp), type: 'bar', stack: 'e', barMaxWidth: 26, emphasis: { focus: 'series' },
        data: anos.map((a) => cont.get(`${a}|${tp}`) || 0) })),
    };
  };

  /* ------------------------------------------------------------------ montagem */
  const G_ = {
    tempo: grafico(E.tempo, opTempo), paises: grafico(E.paises, opPaises), anos: grafico(E.anos, opAnos), calor: grafico(E.calor, opCalor),
    fontes: grafico(E.fontes, opFontes), dispersao: grafico(E.dispersao, opDispersao), histograma: grafico(E.histograma, opHistograma),
    radar: grafico(E.radar, opRadar), temas: grafico(E.temas, opTemas), boxplot: grafico(E.boxplot, opBoxplot),
    ponte: grafico(E.ponte, opPonte), tiposValor: grafico(E.tiposValor, opTiposValor), eventos: grafico(E.eventos, opEventos),
  };
  const OPS = { tempo: opTempo, paises: opPaises, anos: opAnos, calor: opCalor, fontes: opFontes, dispersao: opDispersao,
    histograma: opHistograma, radar: opRadar, temas: opTemas, boxplot: opBoxplot, ponte: opPonte, tiposValor: opTiposValor, eventos: opEventos };

  const lugaresFiltro = () => dic.lugares.map((lg, i) => ({ ...lg, n: A.lugares.get(i) || 0 })).filter((lg) => lg.lat != null && lg.lon != null);
  const desenharTrechos = () => {
    const lista = dic.trechos.map((tr, i) => ({ ...tr, n: A.trechos.get(i) || 0 })).filter((tr) => tr.n).sort((a, b) => b.n - a.n);
    const max = Math.max(1, ...lista.map((tr) => tr.n));
    cxTrechos.replaceChildren(lista.length ? h('ul', { class: 'barras' }, lista.map((tr) => h('li', { title: tr.rotulo },
      h('span', { class: 'rot' }, h('span', { class: 'pais' }, tr.pais), ' ', rotulo('trecho', tr.id)),
      h('span', { class: 'val' }, numero(tr.n)),
      h('span', { class: 'trilho' }, h('span', { style: { width: `${(tr.n / max) * 100}%` } })))))
      : h('p', { class: 'vazio' }, t('sem_dados')));
  };

  let mapa = null;
  const atualizarTudo = () => {
    desenharKpis();
    desenharTrechos();
    for (const [k, g] of Object.entries(G_)) g.atualizar(OPS[k]);
    mapa?.atualizar(lugaresFiltro());
    cxTabela.replaceChildren(tabelaMaterias(idx, dic, A.recentes, 10));
  };
  desenharKpis();
  desenharTrechos();
  cxTabela.append(tabelaMaterias(idx, dic, A.recentes, 10));
  mapa = await montarMapa(cxMapa, lugaresFiltro(), (n) => `${numero(n)} ${t('eixo.materias')}`);

  return {
    desmontar: () => { mapa?.remover(); mapa = null; },
    rolar: (sec, imediato) => {
      if (SECOES.includes(sec)) document.getElementById(`sec-${sec}`)?.scrollIntoView({ behavior: imediato ? 'auto' : 'smooth', block: 'start' });
    },
  };
}
