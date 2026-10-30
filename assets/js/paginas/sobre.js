/**
 * @file: assets/js/paginas/sobre.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-26
 * @ultima_modificacao: 2026-10-28
 * @versao: 0.4.0
 * @descricao: SOBRE (#/sobre[/projeto|fontes|metodo]): o projeto, as fontes monitoradas (tabela com
 *             matérias e % sobre a obra por fonte) e a metodologia da PARTE 1. A seção de dados abertos
 *             volta depois da homologação do projeto.
 * @requisitos: dados v3.
 */
import { carregarManifest, carregar } from '../dados/carregador.js';
import { representante } from '../dados/consultas.js';
import { t, numero, pct, dataCurta, idiomaAtual } from '../i18n.js';
import { h, icone, cartao, tituloSecao, carregando, erro } from '../ui/dom.js';

const TXT = {
  pt: {
    projeto: [
      'O Atlas Bioceânico reúne o que se publica sobre a Rota Bioceânica de Capricórnio — o corredor rodoviário que liga Campo Grande (MS) aos portos do norte do Chile, passando por Porto Murtinho, pela ponte sobre o rio Paraguai, pelo Chaco paraguaio e pelo norte argentino.',
      'O objetivo é oferecer a pesquisadores, gestores públicos, jornalistas e à sociedade uma visão única e verificável: quanto se fala da obra, onde, por quem, sobre quais temas e — principalmente — o que foi anunciado em comparação com o que já foi realizado.',
      'O projeto tem duas partes. A PARTE 1 é o coletor de dados (Python, no servidor do projeto): descobre, baixa, limpa, classifica e enriquece as matérias e documentos oficiais. A PARTE 2 é este site: estático, publicado no GitHub Pages, que lê os dados já processados.',
    ],
    metodo: [
      ['Coleta', 'Descoberta híbrida em 39 fontes do BR, PY, AR e CL (APIs, sitemaps, RSS, busca interna, páginas de tag, Wayback Machine e GDELT), respeitando o robots.txt e limites de acesso.'],
      ['Relevância em 3 níveis', 'Um dicionário ponderado em PT/ES separa matérias sobre a obra (núcleo), de contexto (logística, comércio, fronteira) e ruído — que não entra no site. Corredores concorrentes (Bolívia/Peru, Interoceânica) são identificados e separados.'],
      ['Duplicatas e traduções', 'Textos repetidos entre veículos são agrupados (MinHash) e versões PT/ES da mesma matéria contam uma única vez em todos os números.'],
      ['Enriquecimento', 'Extração de lugares (com coordenadas), trechos da obra, pessoas e cargos, valores monetários (com tipo: previsto, contratado, financiado, executado), % de execução de obra, prazos e fatos já realizados.'],
      ['Documentos oficiais', 'PDFs (atas, declarações, informes) são baixados, convertidos em texto (com OCR quando digitalizados), divididos em trechos e enriquecidos com o mesmo esquema.'],
      ['Limitações', 'As extrações são automáticas e por regras: há ruído. Por isso todo número leva à frase e à matéria de origem, com o link para a fonte original.'],
    ],
  },
  es: {
    projeto: [
      'El Atlas Bioceánico reúne lo que se publica sobre el Corredor Bioceánico de Capricornio — la ruta que une Campo Grande (MS, Brasil) con los puertos del norte de Chile, pasando por Porto Murtinho, el puente sobre el río Paraguay, el Chaco paraguayo y el norte argentino.',
      'El objetivo es ofrecer a investigadores, gestores públicos, periodistas y a la sociedad una visión única y verificable: cuánto se habla de la obra, dónde, quién, sobre qué temas y — sobre todo — lo anunciado frente a lo ya realizado.',
      'El proyecto tiene dos partes. La PARTE 1 es el recolector de datos (Python, en el servidor del proyecto): descubre, descarga, limpia, clasifica y enriquece las noticias y documentos oficiales. La PARTE 2 es este sitio: estático, publicado en GitHub Pages, que lee los datos ya procesados.',
    ],
    metodo: [
      ['Recolección', 'Descubrimiento híbrido en 39 fuentes de BR, PY, AR y CL (APIs, sitemaps, RSS, búsqueda interna, etiquetas, Wayback Machine y GDELT), respetando robots.txt y límites de acceso.'],
      ['Relevancia en 3 niveles', 'Un diccionario ponderado en PT/ES separa noticias sobre la obra (núcleo), de contexto (logística, comercio, frontera) y ruido — que no entra en el sitio. Los corredores competidores (Bolivia/Perú, Interoceánica) se identifican y separan.'],
      ['Duplicados y traducciones', 'Los textos repetidos entre medios se agrupan (MinHash) y las versiones PT/ES de la misma noticia cuentan una sola vez en todos los números.'],
      ['Enriquecimiento', 'Extracción de lugares (con coordenadas), tramos de la obra, personas y cargos, montos (con tipo: previsto, contratado, financiado, ejecutado), % de ejecución de obra, plazos y hechos ya realizados.'],
      ['Documentos oficiales', 'Los PDF (actas, declaraciones, informes) se descargan, se convierten en texto (con OCR si están escaneados), se dividen en fragmentos y se enriquecen con el mismo esquema.'],
      ['Limitaciones', 'Las extracciones son automáticas y por reglas: hay ruido. Por eso cada número lleva a la frase y a la noticia de origen, con el enlace a la fuente original.'],
    ],
  },
};


export async function montar(alvo) {
  alvo.append(carregando());
  let m, dic, idx;
  try {
    [m, dic, idx] = await Promise.all([carregarManifest(), carregar('dic.json'), carregar('indice/noticias.json')]);
  } catch {
    alvo.replaceChildren(erro(t('erro.dados'), () => location.reload()));
    return null;
  }
  const X = TXT[idiomaAtual()] || TXT.pt;

  // fontes: matérias únicas e % sobre a obra
  const porSite = new Map();
  const iN = dic.niveis.indexOf('nucleo');
  for (let i = 0; i < idx.n; i++) {
    if (!representante(idx, i)) continue;
    const s = porSite.get(idx.dados.s[i]) || { n: 0, nuc: 0, ult: '' };
    s.n += 1; if (idx.dados.r[i] === iN) s.nuc += 1;
    if ((idx.dados.d[i] || '') > s.ult) s.ult = idx.dados.d[i];
    porSite.set(idx.dados.s[i], s);
  }
  const linhasFontes = [...porSite.entries()].sort((a, b) => b[1].n - a[1].n).map(([s, v]) => {
    const site = dic.sites[s];
    return h('tr', {},
      h('td', {}, site?.url ? h('a', { class: 'titulo-link', href: site.url, target: '_blank', rel: 'noopener' }, site.nome) : (site?.nome || s)),
      h('td', {}, h('span', { class: 'pais' }, site?.pais || '—')),
      h('td', { class: 'num' }, numero(v.n)),
      h('td', { class: 'num' }, pct(v.nuc / v.n)),
      h('td', { style: { whiteSpace: 'nowrap' } }, dataCurta(v.ult)));
  });

  alvo.replaceChildren(
    h('div', { class: 'pagina-topo' }, h('div', {},
      h('p', { class: 'trilha' }, icone('bx-home-alt'), t('nav.sobre')),
      h('h1', {}, t('sobre.titulo')))),
    tituloSecao('projeto', 'bx-bulb', t('sub.projeto')),
    h('div', { class: 'grade' }, cartao({ classe: 'c-12', corpo: h('div', { class: 'cartao-corpo texto-longo' }, X.projeto.map((p) => h('p', {}, p))) })),
    tituloSecao('fontes', 'bx-broadcast', t('sub.lista_fontes')),
    h('div', { class: 'grade' }, cartao({ classe: 'c-12', corpo: h('div', { class: 'tabela-caixa' }, h('table', { class: 'tabela' },
      h('thead', {}, h('tr', {}, [t('tab.fonte'), t('tab.pais'), t('tab.materias'), t('tab.obra'), t('tab.data')].map((x, j) => h('th', { class: j >= 2 && j <= 3 ? 'num' : null }, x)))),
      h('tbody', {}, linhasFontes))) })),
    tituloSecao('metodo', 'bx-git-branch', t('sub.metodo')),
    h('div', { class: 'recursos', style: { marginBottom: '20px' } }, X.metodo.map(([tit, txt], j) => h('article', { class: 'cartao recurso' },
      icone(['bx-radar', 'bx-target-lock', 'bx-copy-alt', 'bx-brain', 'bx-file', 'bx-error'][j]), h('h3', {}, tit), h('p', {}, txt)))));
  return { rolar: (id) => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) };
}
