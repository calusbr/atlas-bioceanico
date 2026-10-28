/**
 * @file: assets/js/i18n.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Interface em Português (padrão) e Espanhol. O conteúdo das matérias fica no idioma
 *             original; inglês fica a cargo do tradutor do navegador. `t(chave, vars)` devolve o
 *             texto; `aplicarI18n()` preenche data-i18n, data-i18n-aria e data-i18n-placeholder.
 * @requisitos: nenhum.
 */

const TEXTOS = {
  pt: {
    'pular': 'Pular para o conteúdo', 'menu': 'Recolher menu', 'idioma': 'Idioma',
    'tema.alternar': 'Alternar modo claro/escuro', 'tela_cheia': 'Tela cheia',
    'busca.placeholder': 'Buscar matérias por título…',
    'nav.dashboard': 'Dashboard', 'nav.semantico': 'Semântico', 'nav.gestao': 'Gestão de Projeto',
    'nav.agente': 'Agente', 'nav.sobre': 'Sobre', 'nav.busca': 'Busca', 'nav.materia': 'Matéria',
    'sub.visao': 'Visão geral', 'sub.cobertura': 'Cobertura no tempo', 'sub.territorio': 'Território e trechos',
    'sub.fontes': 'Fontes', 'sub.temas': 'Temas', 'sub.obra': 'Obra em números', 'sub.ultimas': 'Últimas matérias',
    'sub.mapa_semantico': 'Mapa de assuntos', 'sub.grafo': 'Grafo de atores', 'sub.busca_semantica': 'Busca por significado',
    'sub.divulgado': 'Divulgado × realizado', 'sub.avanco': 'Avanço por trecho', 'sub.fatos': 'Linha do tempo de fatos',
    'sub.documentos': 'Documentos oficiais', 'sub.conversa': 'Conversar', 'sub.ao_vivo': 'Sala ao vivo',
    'sub.projeto': 'O projeto', 'sub.lista_fontes': 'Fontes monitoradas', 'sub.metodo': 'Metodologia', 'sub.dados': 'Dados abertos',

    'dados.titulo': 'Sobre os dados', 'dados.gerado': 'Gerado em', 'dados.periodo': 'Período', 'dados.contrato': 'Contrato',
    'dados.materias': 'Matérias', 'dados.unicas': 'Únicas', 'dados.pdfs': 'Documentos', 'dados.offline': 'Sem conexão: dados salvos neste navegador.',
    'dados.rodape': 'Dados de {data} · {n} matérias',
    'carregando': 'Carregando dados…', 'erro.dados': 'Não foi possível carregar os dados.',
    'erro.contrato': 'Os dados usam o contrato {versao}, que esta versão do site não conhece.', 'tentar': 'Tentar de novo',

    'dash.titulo': 'Painel da Rota Bioceânica',
    'dash.sub': 'Cobertura jornalística e documentos oficiais sobre o corredor Campo Grande → Porto Murtinho → Chaco → norte argentino → portos do Chile.',
    'filtro.periodo': 'Período', 'filtro.ate': 'até', 'filtro.pais': 'País da fonte', 'filtro.nivel': 'Relevância',
    'filtro.idioma': 'Idioma', 'filtro.todos': 'Todos', 'filtro.limpar': 'Limpar',
    'filtro.resumo': '<b>{n}</b> matérias únicas no filtro',
    'nivel.nucleo': 'Sobre a obra', 'nivel.contexto': 'Contexto',
    'kpi.materias': 'Matérias únicas', 'kpi.materias.pe': '{n} nos últimos 12 meses',
    'kpi.nucleo': 'Sobre a obra', 'kpi.nucleo.pe': '{p} do total',
    'kpi.fontes': 'Fontes ativas', 'kpi.fontes.pe': 'em {n} países',
    'kpi.pdfs': 'Documentos oficiais', 'kpi.pdfs.pe': 'atas, declarações, informes',
    'kpi.lugares': 'Lugares citados', 'kpi.lugares.pe': 'mais citado: {nome}',
    'kpi.fatos': 'Fatos realizados', 'kpi.fatos.pe': 'inaugurações, contratos, aprovações',
    'kpi.valores': 'Valores divulgados', 'kpi.valores.pe': '{n} com tipo identificado',
    'kpi.ponte': 'Ponte bioceânica', 'kpi.ponte.pe': 'mediana 6 meses · até {mes}',

    'sec.visao': 'Visão geral', 'sec.cobertura': 'Cobertura no tempo', 'sec.territorio': 'Território e trechos',
    'sec.fontes': 'Fontes', 'sec.temas': 'Temas', 'sec.obra': 'Obra em números', 'sec.ultimas': 'Últimas matérias',
    'g.tempo': 'Matérias por mês', 'g.tempo.sub': 'Contagem única (traduções contam uma vez) · arraste a barra para aproximar',
    'g.paises': 'País da fonte', 'g.paises.sub': 'Origem dos veículos e órgãos',
    'g.anos': 'Matérias por ano', 'g.anos.sub': 'Sobre a obra × contexto (colunas empilhadas)',
    'g.calor': 'Calendário de cobertura', 'g.calor.sub': 'Intensidade por mês e ano',
    'g.mapa': 'O traçado e os lugares citados', 'g.mapa.sub': 'Círculo = matérias que citam o lugar · linha = traçado aproximado',
    'g.trechos': 'Trechos mais citados', 'g.trechos.sub': 'Segmentos da obra mencionados',
    'g.top_fontes': 'Fontes com mais matérias', 'g.top_fontes.sub': 'Barras: sobre a obra × contexto',
    'g.dispersao': 'Volume × foco na obra', 'g.dispersao.sub': 'Cada ponto é uma fonte · tamanho = matérias',
    'g.histograma': 'Tamanho das matérias', 'g.histograma.sub': 'Histograma de palavras por matéria',
    'g.radar': 'Perfil temático por país', 'g.radar.sub': '% das matérias de cada país que tratam do tema',
    'g.temas': 'Temas mais frequentes', 'g.temas.sub': 'Matérias por tema (uma matéria pode ter vários)',
    'g.idiomas': 'Idioma', 'g.idiomas.sub': 'Português × espanhol',
    'g.boxplot': '% de obra divulgado por trecho', 'g.boxplot.sub': 'Distribuição dos percentuais citados nas matérias (box plot)',
    'g.tipos_valor': 'Valores por tipo', 'g.tipos_valor.sub': 'Divulgado (previsto) × contratado × financiado × executado',
    'g.eventos': 'Fatos realizados por ano', 'g.eventos.sub': 'Inaugurações, assinaturas, aprovações…',
    'g.avanco': 'Avanço da ponte', 'g.avanco.sub': 'Desde 2022 · pontos: maior % divulgado no mês · linha: mediana móvel de 3 meses',
    'g.avanco.pontos': '% divulgado', 'g.avanco.mediana': 'Mediana 3 meses',
    'g.ultimas': 'Últimas matérias', 'g.ultimas.sub': 'Mais recentes no filtro atual',
    'eixo.materias': 'matérias', 'eixo.palavras': 'palavras', 'eixo.pct_obra': '% sobre a obra',
    'tab.titulo': 'Título', 'tab.fonte': 'Fonte', 'tab.pais': 'País', 'tab.data': 'Data', 'tab.nivel': 'Relevância',
    'tab.idioma': 'Idioma', 'tab.anterior': 'Anterior', 'tab.proxima': 'Próxima', 'tab.pagina': 'Página {p} de {t}',
    'tab.materias': 'Matérias', 'tab.obra': '% obra',
    'outros': 'Outros', 'sem_dados': 'Sem dados para o filtro atual.',

    'materia.voltar': 'Voltar', 'materia.fonte': 'Ler na fonte original', 'materia.resumo_apenas': 'Este veículo não permite republicar o texto completo. Leia na fonte original.',
    'materia.nao_encontrada': 'Matéria não encontrada.', 'materia.dados': 'Dados extraídos', 'materia.valores': 'Valores',
    'materia.percentuais': '% de obra', 'materia.eventos': 'Fatos realizados', 'materia.lugares': 'Lugares', 'materia.atores': 'Pessoas citadas',
    'busca.titulo': 'Resultados para “{q}”', 'busca.n': '{n} matérias encontradas', 'busca.vazia': 'Digite pelo menos 3 letras.',

    'futura.texto': 'Esta seção chega na {fase}. Os itens abaixo são as ferramentas planejadas.',
    'futura.semantico': 'Explore as matérias pelo significado: assuntos que se aproximam, pessoas e instituições que aparecem juntas e busca em linguagem natural — tudo calculado no servidor e entregue pronto ao navegador.',
    'futura.gestao': 'Acompanhe a obra comparando o que foi divulgado (valores previstos, prazos) com o que foi realizado (contratos, desembolsos, % executado, entregas), trecho a trecho e em cada país.',
    'futura.agente': 'Pergunte sobre a rota em linguagem natural. O agente responde em tempo real, citando as matérias e documentos usados, e mantém uma sala ao vivo para acompanhar novidades.',
    'r.mapa_semantico': 'Matérias agrupadas por assunto (embeddings + UMAP + HDBSCAN).',
    'r.grafo': 'Pessoas, órgãos e lugares que aparecem juntos (comunidades Louvain).',
    'r.busca_semantica': 'Busca por significado em PT e ES, direto no navegador.',
    'r.divulgado': 'Valores previstos × contratados × financiados × executados.',
    'r.avanco': 'Curva do % de obra por trecho e por país.',
    'r.fatos': 'Inaugurações, contratos, licitações e aprovações em ordem cronológica.',
    'r.documentos': 'Atas, declarações e informes oficiais com busca por trecho.',
    'r.conversa': 'Respostas em streaming com citação das fontes (GraphRAG).',
    'r.ao_vivo': 'Sala em tempo real (WebSocket) com as novidades do dia.',

    'sobre.titulo': 'Sobre o Atlas Bioceânico',
  },
  es: {
    'pular': 'Saltar al contenido', 'menu': 'Contraer menú', 'idioma': 'Idioma',
    'tema.alternar': 'Cambiar modo claro/oscuro', 'tela_cheia': 'Pantalla completa',
    'busca.placeholder': 'Buscar noticias por título…',
    'nav.dashboard': 'Panel', 'nav.semantico': 'Semántico', 'nav.gestao': 'Gestión del Proyecto',
    'nav.agente': 'Agente', 'nav.sobre': 'Acerca de', 'nav.busca': 'Búsqueda', 'nav.materia': 'Noticia',
    'sub.visao': 'Visión general', 'sub.cobertura': 'Cobertura en el tiempo', 'sub.territorio': 'Territorio y tramos',
    'sub.fontes': 'Fuentes', 'sub.temas': 'Temas', 'sub.obra': 'La obra en números', 'sub.ultimas': 'Últimas noticias',
    'sub.mapa_semantico': 'Mapa de asuntos', 'sub.grafo': 'Grafo de actores', 'sub.busca_semantica': 'Búsqueda por significado',
    'sub.divulgado': 'Anunciado × realizado', 'sub.avanco': 'Avance por tramo', 'sub.fatos': 'Cronología de hechos',
    'sub.documentos': 'Documentos oficiales', 'sub.conversa': 'Conversar', 'sub.ao_vivo': 'Sala en vivo',
    'sub.projeto': 'El proyecto', 'sub.lista_fontes': 'Fuentes monitoreadas', 'sub.metodo': 'Metodología', 'sub.dados': 'Datos abiertos',

    'dados.titulo': 'Sobre los datos', 'dados.gerado': 'Generado el', 'dados.periodo': 'Período', 'dados.contrato': 'Contrato',
    'dados.materias': 'Noticias', 'dados.unicas': 'Únicas', 'dados.pdfs': 'Documentos', 'dados.offline': 'Sin conexión: datos guardados en este navegador.',
    'dados.rodape': 'Datos del {data} · {n} noticias',
    'carregando': 'Cargando datos…', 'erro.dados': 'No se pudieron cargar los datos.',
    'erro.contrato': 'Los datos usan el contrato {versao}, que esta versión del sitio no conoce.', 'tentar': 'Intentar de nuevo',

    'dash.titulo': 'Panel del Corredor Bioceánico',
    'dash.sub': 'Cobertura periodística y documentos oficiales sobre el corredor Campo Grande → Porto Murtinho → Chaco → norte argentino → puertos de Chile.',
    'filtro.periodo': 'Período', 'filtro.ate': 'a', 'filtro.pais': 'País de la fuente', 'filtro.nivel': 'Relevancia',
    'filtro.idioma': 'Idioma', 'filtro.todos': 'Todos', 'filtro.limpar': 'Limpiar',
    'filtro.resumo': '<b>{n}</b> noticias únicas en el filtro',
    'nivel.nucleo': 'Sobre la obra', 'nivel.contexto': 'Contexto',
    'kpi.materias': 'Noticias únicas', 'kpi.materias.pe': '{n} en los últimos 12 meses',
    'kpi.nucleo': 'Sobre la obra', 'kpi.nucleo.pe': '{p} del total',
    'kpi.fontes': 'Fuentes activas', 'kpi.fontes.pe': 'en {n} países',
    'kpi.pdfs': 'Documentos oficiales', 'kpi.pdfs.pe': 'actas, declaraciones, informes',
    'kpi.lugares': 'Lugares citados', 'kpi.lugares.pe': 'más citado: {nome}',
    'kpi.fatos': 'Hechos realizados', 'kpi.fatos.pe': 'inauguraciones, contratos, aprobaciones',
    'kpi.valores': 'Montos divulgados', 'kpi.valores.pe': '{n} con tipo identificado',
    'kpi.ponte': 'Puente bioceánico', 'kpi.ponte.pe': 'mediana 6 meses · hasta {mes}',

    'sec.visao': 'Visión general', 'sec.cobertura': 'Cobertura en el tiempo', 'sec.territorio': 'Territorio y tramos',
    'sec.fontes': 'Fuentes', 'sec.temas': 'Temas', 'sec.obra': 'La obra en números', 'sec.ultimas': 'Últimas noticias',
    'g.tempo': 'Noticias por mes', 'g.tempo.sub': 'Conteo único (las traducciones cuentan una vez) · arrastre la barra para acercar',
    'g.paises': 'País de la fuente', 'g.paises.sub': 'Origen de los medios y organismos',
    'g.anos': 'Noticias por año', 'g.anos.sub': 'Sobre la obra × contexto (columnas apiladas)',
    'g.calor': 'Calendario de cobertura', 'g.calor.sub': 'Intensidad por mes y año',
    'g.mapa': 'El trazado y los lugares citados', 'g.mapa.sub': 'Círculo = noticias que citan el lugar · línea = trazado aproximado',
    'g.trechos': 'Tramos más citados', 'g.trechos.sub': 'Segmentos de la obra mencionados',
    'g.top_fontes': 'Fuentes con más noticias', 'g.top_fontes.sub': 'Barras: sobre la obra × contexto',
    'g.dispersao': 'Volumen × foco en la obra', 'g.dispersao.sub': 'Cada punto es una fuente · tamaño = noticias',
    'g.histograma': 'Extensión de las noticias', 'g.histograma.sub': 'Histograma de palabras por noticia',
    'g.radar': 'Perfil temático por país', 'g.radar.sub': '% de las noticias de cada país que tratan el tema',
    'g.temas': 'Temas más frecuentes', 'g.temas.sub': 'Noticias por tema (una noticia puede tener varios)',
    'g.idiomas': 'Idioma', 'g.idiomas.sub': 'Portugués × español',
    'g.boxplot': '% de obra divulgado por tramo', 'g.boxplot.sub': 'Distribución de los porcentajes citados (box plot)',
    'g.tipos_valor': 'Montos por tipo', 'g.tipos_valor.sub': 'Anunciado × contratado × financiado × ejecutado',
    'g.eventos': 'Hechos realizados por año', 'g.eventos.sub': 'Inauguraciones, firmas, aprobaciones…',
    'g.avanco': 'Avance del puente', 'g.avanco.sub': 'Desde 2022 · puntos: mayor % divulgado en el mes · línea: mediana móvil de 3 meses',
    'g.avanco.pontos': '% divulgado', 'g.avanco.mediana': 'Mediana 3 meses',
    'g.ultimas': 'Últimas noticias', 'g.ultimas.sub': 'Más recientes en el filtro actual',
    'eixo.materias': 'noticias', 'eixo.palavras': 'palabras', 'eixo.pct_obra': '% sobre la obra',
    'tab.titulo': 'Título', 'tab.fonte': 'Fuente', 'tab.pais': 'País', 'tab.data': 'Fecha', 'tab.nivel': 'Relevancia',
    'tab.idioma': 'Idioma', 'tab.anterior': 'Anterior', 'tab.proxima': 'Siguiente', 'tab.pagina': 'Página {p} de {t}',
    'tab.materias': 'Noticias', 'tab.obra': '% obra',
    'outros': 'Otros', 'sem_dados': 'Sin datos para el filtro actual.',

    'materia.voltar': 'Volver', 'materia.fonte': 'Leer en la fuente original', 'materia.resumo_apenas': 'Este medio no permite republicar el texto completo. Léalo en la fuente original.',
    'materia.nao_encontrada': 'Noticia no encontrada.', 'materia.dados': 'Datos extraídos', 'materia.valores': 'Montos',
    'materia.percentuais': '% de obra', 'materia.eventos': 'Hechos realizados', 'materia.lugares': 'Lugares', 'materia.atores': 'Personas citadas',
    'busca.titulo': 'Resultados para “{q}”', 'busca.n': '{n} noticias encontradas', 'busca.vazia': 'Escriba al menos 3 letras.',

    'futura.texto': 'Esta sección llega en la {fase}. Abajo, las herramientas planificadas.',
    'futura.semantico': 'Explore las noticias por significado: asuntos cercanos, personas e instituciones que aparecen juntas y búsqueda en lenguaje natural — todo calculado en el servidor y entregado listo al navegador.',
    'futura.gestao': 'Siga la obra comparando lo anunciado (montos previstos, plazos) con lo realizado (contratos, desembolsos, % ejecutado, entregas), tramo por tramo y en cada país.',
    'futura.agente': 'Pregunte sobre el corredor en lenguaje natural. El agente responde en tiempo real, citando las noticias y documentos usados, y mantiene una sala en vivo con las novedades.',
    'r.mapa_semantico': 'Noticias agrupadas por asunto (embeddings + UMAP + HDBSCAN).',
    'r.grafo': 'Personas, organismos y lugares que aparecen juntos (comunidades Louvain).',
    'r.busca_semantica': 'Búsqueda por significado en PT y ES, directo en el navegador.',
    'r.divulgado': 'Montos previstos × contratados × financiados × ejecutados.',
    'r.avanco': 'Curva del % de obra por tramo y por país.',
    'r.fatos': 'Inauguraciones, contratos, licitaciones y aprobaciones en orden cronológico.',
    'r.documentos': 'Actas, declaraciones e informes oficiales con búsqueda por tramo.',
    'r.conversa': 'Respuestas en streaming con citas de las fuentes (GraphRAG).',
    'r.ao_vivo': 'Sala en tiempo real (WebSocket) con las novedades del día.',

    'sobre.titulo': 'Acerca del Atlas Bioceánico',
  },
};

const CHAVE = 'atlas.idioma';
let idioma = (() => {
  try { const s = localStorage.getItem(CHAVE); if (s && TEXTOS[s]) return s; } catch { /* bloqueado */ }
  return 'pt';                                             // padrão do projeto: Português
})();

export const idiomaAtual = () => idioma;
export const locale = () => (idioma === 'es' ? 'es' : 'pt-BR');

export function definirIdioma(novo) {
  if (!TEXTOS[novo]) return;
  idioma = novo;
  try { localStorage.setItem(CHAVE, novo); } catch { /* ignora */ }
  document.documentElement.lang = locale();
}

export function t(chave, vars = {}) {
  const txt = TEXTOS[idioma][chave] ?? TEXTOS.pt[chave] ?? chave;
  return txt.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

export function aplicarI18n(raiz = document) {
  raiz.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  raiz.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); el.title = t(el.dataset.i18nAria); });
  raiz.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
}

export const numero = (n, opc) => new Intl.NumberFormat(locale(), opc).format(n);
export const pct = (v) => new Intl.NumberFormat(locale(), { style: 'percent', maximumFractionDigits: 0 }).format(v);
const utc = (a, m, d) => new Date(Date.UTC(a, (m || 1) - 1, d || 1));
export function dataCurta(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(locale(), { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(utc(a, m, d));
}
export function mesAno(am) {
  if (!am) return '';
  const [a, m] = am.split('-').map(Number);
  return new Intl.DateTimeFormat(locale(), { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(utc(a, m, 1));
}
export const nomesMeses = () => Array.from({ length: 12 }, (_, i) =>
  new Intl.DateTimeFormat(locale(), { month: 'short', timeZone: 'UTC' }).format(utc(2026, i + 1, 1)).replace('.', ''));
