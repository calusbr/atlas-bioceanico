/**
 * @file: assets/js/i18n.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-29
 * @versao: 0.5.0
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
    'filtro.resumo': 'matérias únicas no filtro', 'filtro.fonte': 'Fonte',
    'dados.atualizado': 'Atualizado em {data}',
    'nivel.nucleo': 'Sobre a obra', 'nivel.contexto': 'Contexto',
    'kpi.materias': 'Matérias únicas', 'kpi.materias.pe': '{n} nos últimos 12 meses',
    'kpi.nucleo': 'Sobre a obra', 'kpi.nucleo.pe': '{p} do total',
    'kpi.fontes': 'Fontes ativas', 'kpi.fontes.pe': 'Em {n} países',
    'kpi.pdfs': 'Documentos oficiais', 'kpi.pdfs.pe': 'Atas, declarações, informes',
    'kpi.lugares': 'Lugares citados', 'kpi.lugares.pe': 'Mais citado: {nome}',
    'kpi.fatos': 'Fatos realizados', 'kpi.fatos.pe': 'Inaugurações, contratos, aprovações',
    'kpi.valores': 'Valores divulgados', 'kpi.valores.pe': '{n} com tipo identificado',
    'kpi.ponte': 'Ponte bioceânica', 'kpi.ponte.pe': 'Mediana de 6 meses · até {mes}',

    'sec.visao': 'Visão geral', 'sec.cobertura': 'Cobertura no tempo', 'sec.territorio': 'Território e trechos',
    'sec.fontes': 'Fontes', 'sec.temas': 'Temas', 'sec.obra': 'Obra em números', 'sec.ultimas': 'Últimas matérias',
    'g.tempo': 'Matérias por mês', 'g.tempo.sub': 'Contagem única (traduções contam uma vez) · arraste a barra para aproximar',
    'g.paises': 'País da fonte', 'g.paises.sub': 'Origem dos veículos e órgãos',
    'g.anos': 'Matérias por ano', 'g.anos.sub': 'Sobre a obra × contexto (colunas empilhadas)',
    'g.calor': 'Calendário de cobertura', 'g.calor.sub': 'Intensidade por mês e ano',
    'g.mapa': 'O traçado e os lugares citados', 'g.mapa.sub': 'Círculo = matérias que citam o lugar · linha = traçado aproximado',
    'g.trechos': 'Trechos mais citados', 'g.trechos.sub': 'Segmentos da obra mencionados',
    'g.top_fontes': 'Fontes com mais matérias', 'g.top_fontes.sub': 'Barras: sobre a obra × contexto',
    'g.dispersao': 'Volume × foco na obra', 'g.dispersao.sub': 'Cada ponto é uma fonte · eixo X: matérias (escala log) · eixo Y: % sobre a obra',
    'g.histograma': 'Tamanho das matérias', 'g.histograma.sub': 'Histograma: quantidade de palavras por matéria',
    'g.radar': 'Perfil temático por país', 'g.radar.sub': '% das matérias de cada país que tratam do tema',
    'g.temas': 'Temas mais frequentes', 'g.temas.sub': 'Matérias por tema (uma matéria pode ter vários)',
    'g.idiomas': 'Idioma', 'g.idiomas.sub': 'Português × espanhol',
    'g.boxplot': '% de obra divulgado por trecho', 'g.boxplot.sub': 'Distribuição dos percentuais citados nas matérias (box plot) · cor pela mediana',
    'box.n': '{n} percentuais divulgados', 'box.maximo': 'Máximo', 'box.q3': '3º quartil (75%)', 'box.mediana': 'Mediana',
    'box.q1': '1º quartil (25%)', 'box.minimo': 'Mínimo', 'box.situacao': 'Situação',
    'box.s1': 'Início (até 40%)', 'box.s2': 'Em andamento (40–70%)', 'box.s3': 'Avançada (70–90%)', 'box.s4': 'Quase concluída (90%+)',
    'box.leitura': 'Metade das matérias divulgou um % entre o 1º e o 3º quartil; a mediana é o valor do meio.',
    'semaforo.1': 'Até 40%', 'semaforo.2': '40–70%', 'semaforo.3': '70–90%', 'semaforo.4': '90–100%', 'semaforo.titulo': 'Mediana do % divulgado:',
    'g.tipos_valor': 'Valores por tipo', 'g.tipos_valor.sub': 'Divulgado (previsto) × contratado × financiado × executado',
    'g.eventos': 'Fatos realizados por ano', 'g.eventos.sub': 'Inaugurações, assinaturas, aprovações…',
    'g.avanco': 'Avanço da ponte', 'g.avanco.sub': 'Desde 2022 · pontos: maior % divulgado no mês · linha: mediana móvel de 3 meses',
    'g.avanco.pontos': '% divulgado', 'g.avanco.mediana': 'Mediana 3 meses',
    'g.ultimas': 'Últimas matérias', 'g.ultimas.sub': 'Mais recentes no filtro atual',
    'eixo.materias': 'matérias', 'eixo.palavras': 'palavras', 'eixo.pct_obra': '% sobre a obra',
    'tab.titulo': 'Título', 'tab.fonte': 'Fonte', 'tab.fonte_link': 'Fonte/Link', 'tab.pais': 'País', 'tab.data': 'Data', 'tab.nivel': 'Relevância',
    'tab.idioma': 'Idioma', 'tab.anterior': 'Anterior', 'tab.proxima': 'Próxima', 'tab.pagina': 'Página {p} de {t}',
    'tab.materias': 'Matérias', 'tab.obra': '% obra',
    'outros': 'Outros', 'sem_dados': 'Sem dados para o filtro atual.',

    'materia.voltar': 'Voltar', 'materia.fonte': 'Ler na fonte original', 'materia.resumo_apenas': 'Este veículo não permite republicar o texto completo. Leia na fonte original.',
    'materia.nao_encontrada': 'Matéria não encontrada.', 'materia.dados': 'Dados extraídos', 'materia.valores': 'Valores',
    'materia.percentuais': '% de obra', 'materia.eventos': 'Fatos realizados', 'materia.lugares': 'Lugares', 'materia.atores': 'Pessoas citadas',
    'm.ficha': 'Ficha da matéria', 'm.data': 'Data', 'm.veiculo': 'Veículo', 'm.autor': 'Autor', 'm.idioma': 'Idioma',
    'm.pais_fonte': 'País da fonte', 'm.relevancia': 'Relevância', 'm.palavras': 'Palavras', 'm.tipo_fonte': 'Tipo de fonte',
    'm.fonte_primaria': 'Fonte primária', 'm.temas': 'Temas', 'm.paises': 'Países citados', 'm.trechos': 'Trechos da obra',
    'm.entidades': 'Instituições', 'm.tags': 'Tags do veículo', 'm.marcos': 'Prazos e previsões', 'm.quantidades': 'Quantidades',
    'm.pdfs': 'Documentos citados (PDF)', 'm.evidencias': 'Termos que classificaram a matéria', 'm.citar': 'Como citar (ABNT)',
    'm.copiar': 'Copiar', 'm.copiado': 'Copiado!', 'm.acesso': 'Acesso em', 'm.id': 'Identificador', 'm.traducao': 'Também publicada em outro idioma',
    'busca.titulo': 'Resultados para “{q}”', 'busca.n': '{n} matérias encontradas', 'busca.vazia': 'Digite pelo menos 3 letras.',
    'busca.escopo': 'Buscar em', 'busca.escopo.web': 'Matérias', 'busca.escopo.pdf': 'PDFs', 'busca.escopo.todos': 'PDFs + matérias',
    'busca.placeholder.gestao': 'Buscar nos documentos e matérias…', 'busca.n_pdf': '{n} documentos oficiais encontrados',
    'busca.pdfs': 'Documentos oficiais (PDFs)', 'busca.materias': 'Matérias da imprensa', 'busca.ver_gestao': 'Ver na Gestão',

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


    'ges.intro.titulo': 'Documentos oficiais do Corredor Bioceânico',
    'ges.intro': 'Atas, declarações, relatórios, estudos e boletins publicados pelo Corredor Bioceânico de Capricórnio (corredorbioceanico.org) — o organismo que coordena a obra entre Brasil, Paraguai, Argentina e Chile.',
    'ges.intro.metodo': 'Os indicadores usam só o que está escrito nos documentos. Os gráficos comparativos podem incluir as matérias da imprensa — cada gráfico tem a sua própria escolha.',
    'ges.intro.paises': 'Brasil · Paraguai · Argentina · Chile',
    'ges.k.acervo': 'Documentos no acervo', 'ges.k.acervo.pe': '{pg} páginas · {n} nos últimos 12 meses',
    'ges.k.ultimo': 'Último documento', 'ges.k.trechos': 'Trechos citados', 'ges.k.lugares': 'Lugares citados',
    'ges.k.top': 'mais citado: {nome} ({n})',
    'ges.div.anunciado': 'Anunciado', 'ges.div.realizado': 'Realizado',
    'ges.prazos.mediana': 'Prazo mediano', 'ges.prazos.n': '{n} previsão(ões)', 'ges.prazos.mesmo_ano': 'mesmo ano do anúncio',
    'ges.etapas.titulo': 'Etapas por trecho', 'ges.etapas.sub': 'fatos já registrados em cada trecho, da licitação à inauguração',
    'ges.etapas.nota': 'Quanto mais à direita estão as células preenchidas, mais avançado o trecho. O número é a quantidade de registros.',
    'ges.valores.titulo': 'Anúncios de valor por ano', 'ges.valores.sub': 'barras = anúncios distintos · linha = valor mediano (US$)', 'ges.valores.mediana': 'Valor mediano',
    'ges.valores.nota': 'Valores previstos, contratados e financiados; cada valor conta só no ano em que apareceu pela primeira vez. Câmbio fixo anual para US$.',
    'ges.filtros': 'Filtros da Gestão de Projeto', 'ges.fonte': 'Documentos de', 'ges.fonte.corredor': 'Corredor Bioceânico',
    'ges.fonte.oficiais': 'Fontes oficiais', 'ges.fonte.todos': 'Todos os PDFs', 'ges.trecho': 'Trecho', 'ges.pais': 'País',
    'ges.aviso33': 'Os dados publicados estão no contrato {versao}: rode `exportar-v3` (V2.4.1) e copie para dados/ para ver a Gestão de Projeto.',
    'ges.k.invest': 'Investimento citado (aprox.)', 'ges.k.invest.pe': '{n} citações de valores em {d} documentos',
    'ges.k.pct': '% concluída (aprox.)', 'ges.k.pct.pe': '{trecho} · documento de {data}', 'ges.k.pct.vazio': 'sem % de {trecho} nos documentos',
    'ges.k.entregues': 'Obras entregues', 'ges.k.entregues.pe': 'conclusões, inaugurações e entregas citadas nos documentos',
    'ges.k.prazos': 'Prazos divulgados', 'ges.k.prazos.pe': '{n} já vencidos · próximo: {prox}',
    'ges.docs.titulo': 'Acervo de documentos oficiais', 'ges.docs.sub': 'escolha uma categoria, busque por palavras e abra a ficha ou o PDF original',
    'ges.docs.placeholder': 'Buscar palavras dentro dos PDFs (ex.: aduana transchaco)', 'ges.docs.n': '{n} documento(s)',
    'ges.cat.todas': 'Todos', 'ges.cat.atas': 'Atas', 'ges.cat.declaracoes': 'Declarações', 'ges.cat.relatorios': 'Relatórios',
    'ges.cat.estudos': 'Estudos', 'ges.cat.boletins': 'Boletins', 'ges.cat.apresentacoes': 'Apresentações',
    'ges.cat.acordos': 'Convênios', 'ges.cat.agendas': 'Agendas', 'ges.cat.outros': 'Outros',
    'ges.col.data': 'Data', 'ges.col.documento': 'Documento', 'ges.col.tipo': 'Tipo', 'ges.col.paises': 'Países', 'ges.col.pags': 'Págs.',
    'ges.col.ultimo': 'Último %', 'ges.col.mediana': 'Mediana recente', 'ges.col.registros': 'Registros',
    'ges.ficha': 'Ficha', 'ges.fechar': 'Fechar', 'ges.abrir_pdf': 'Abrir o PDF no site oficial', 'ges.pagina_origem': 'Página de origem',
    'ges.sem_link': 'Documento sem link público (arquivo recebido diretamente)',
    'ges.f.data': 'Data', 'ges.f.estimada': 'estimada', 'ges.f.fonte': 'Fonte', 'ges.f.evento': 'Evento', 'ges.f.comissao': 'Comissão / mesa',
    'ges.f.local': 'Local', 'ges.f.idioma': 'Idioma', 'ges.f.paginas': 'Páginas', 'ges.f.resumo': 'Resumo', 'ges.f.temas': 'Temas',
    'ges.f.paises': 'Países citados', 'ges.f.trechos': 'Trechos da obra', 'ges.f.lugares': 'Lugares', 'ges.f.fatos': 'Fatos de obra extraídos',
    'ges.f.prazos': 'Prazos e previsões', 'ges.f.valores': 'Valores citados', 'ges.f.compromissos': 'Compromissos e acordos',
    'ges.f.signatarios': 'Signatários', 'ges.f.entidades': 'Entidades', 'ges.f.termos': 'Termos', 'ges.f.atores': 'Pessoas citadas',
    'ges.mapa.secao': 'Mapa dos documentos', 'ges.mapa.titulo': 'Onde os documentos falam', 'ges.mapa.sub': 'lugares citados nos documentos do filtro (círculo maior = mais documentos)',
    'ges.mapa.n': '{n} documento(s)',
    'ges.base': 'Base do gráfico', 'ges.base.pdf': 'Só PDFs', 'ges.base.web': 'PDFs + matérias', 'ges.base.pdf_um': 'Documento oficial', 'ges.base.web_um': 'Matéria da imprensa',
    'ges.acum.titulo': 'Divulgado × realizado', 'ges.acum.sub': 'por ano: o que foi anunciado (barra da esquerda) e o que foi realizado (da direita)',
    'ges.acum.nota': 'Barra da esquerda = anúncios (valores previstos, contratados, financiados e prazos); da direita = realizações (executado/pago e obra entregue). Só aparecem os anos com registros, a partir de 2015.',
    'ges.cat_fato.previsto': 'Divulgado/previsto', 'ges.cat_fato.contratado': 'Licitado/contratado', 'ges.cat_fato.financiado': 'Financiado',
    'ges.cat_fato.executado': 'Executado/pago', 'ges.cat_fato.entregue': 'Obra entregue', 'ges.cat_fato.prazo': 'Prazos anunciados',
    'ges.prazos.titulo': 'Prazo prometido × data do anúncio', 'ges.prazos.sub': 'previsões de conclusão e de início da operação',
    'ges.prazos.nota': 'Cada bolha reúne as previsões feitas num ano (horizontal) para um mesmo ano de conclusão (vertical); maior = mais previsões. A linha mostra o prazo mediano: subindo, a conclusão foi empurrada para frente.',
    'ges.prazos.prometido': 'Prometido para', 'ges.prazos.anunciado': 'anunciado em', 'ges.prazos.hoje': 'ano atual',
    'ges.avanco.titulo': 'Avanço por trecho', 'ges.avanco.sub': 'barra = último % divulgado · traço = mediana recente',
    'ges.avanco.nota': 'Os documentos oficiais trazem poucos números de avanço; com "PDFs + matérias" entram os % divulgados pela imprensa. "reg." = quantidade de registros.',
    'ges.linha.titulo': 'Linha do tempo de fatos', 'ges.linha.sub': 'o que já aconteceu, da licitação à inauguração',
    'ges.linha.nota': 'Cada marca é um fato no passado ("foi licitado", "foi concluído"). Losango = documento oficial; ponto = matéria da imprensa. Passe o mouse para ler a frase de origem.',
    'ges.recentes.titulo': 'Fatos mais recentes nos documentos', 'ges.recentes.sub': 'clique no documento para abrir a ficha', 'ges.recentes.vazio': 'Nenhum fato de obra nos documentos do filtro.',
    'sub.mapa_docs': 'Mapa dos documentos',

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
    'filtro.resumo': 'noticias únicas en el filtro', 'filtro.fonte': 'Fuente',
    'dados.atualizado': 'Actualizado el {data}',
    'nivel.nucleo': 'Sobre la obra', 'nivel.contexto': 'Contexto',
    'kpi.materias': 'Noticias únicas', 'kpi.materias.pe': '{n} en los últimos 12 meses',
    'kpi.nucleo': 'Sobre la obra', 'kpi.nucleo.pe': '{p} del total',
    'kpi.fontes': 'Fuentes activas', 'kpi.fontes.pe': 'En {n} países',
    'kpi.pdfs': 'Documentos oficiales', 'kpi.pdfs.pe': 'Actas, declaraciones, informes',
    'kpi.lugares': 'Lugares citados', 'kpi.lugares.pe': 'Más citado: {nome}',
    'kpi.fatos': 'Hechos realizados', 'kpi.fatos.pe': 'Inauguraciones, contratos, aprobaciones',
    'kpi.valores': 'Montos divulgados', 'kpi.valores.pe': '{n} con tipo identificado',
    'kpi.ponte': 'Puente bioceánico', 'kpi.ponte.pe': 'Mediana de 6 meses · hasta {mes}',

    'sec.visao': 'Visión general', 'sec.cobertura': 'Cobertura en el tiempo', 'sec.territorio': 'Territorio y tramos',
    'sec.fontes': 'Fuentes', 'sec.temas': 'Temas', 'sec.obra': 'La obra en números', 'sec.ultimas': 'Últimas noticias',
    'g.tempo': 'Noticias por mes', 'g.tempo.sub': 'Conteo único (las traducciones cuentan una vez) · arrastre la barra para acercar',
    'g.paises': 'País de la fuente', 'g.paises.sub': 'Origen de los medios y organismos',
    'g.anos': 'Noticias por año', 'g.anos.sub': 'Sobre la obra × contexto (columnas apiladas)',
    'g.calor': 'Calendario de cobertura', 'g.calor.sub': 'Intensidad por mes y año',
    'g.mapa': 'El trazado y los lugares citados', 'g.mapa.sub': 'Círculo = noticias que citan el lugar · línea = trazado aproximado',
    'g.trechos': 'Tramos más citados', 'g.trechos.sub': 'Segmentos de la obra mencionados',
    'g.top_fontes': 'Fuentes con más noticias', 'g.top_fontes.sub': 'Barras: sobre la obra × contexto',
    'g.dispersao': 'Volumen × foco en la obra', 'g.dispersao.sub': 'Cada punto es una fuente · eje X: noticias (escala log) · eje Y: % sobre la obra',
    'g.histograma': 'Extensión de las noticias', 'g.histograma.sub': 'Histograma: cantidad de palabras por noticia',
    'g.radar': 'Perfil temático por país', 'g.radar.sub': '% de las noticias de cada país que tratan el tema',
    'g.temas': 'Temas más frecuentes', 'g.temas.sub': 'Noticias por tema (una noticia puede tener varios)',
    'g.idiomas': 'Idioma', 'g.idiomas.sub': 'Portugués × español',
    'g.boxplot': '% de obra divulgado por tramo', 'g.boxplot.sub': 'Distribución de los porcentajes citados (box plot) · color según la mediana',
    'box.n': '{n} porcentajes divulgados', 'box.maximo': 'Máximo', 'box.q3': '3.er cuartil (75%)', 'box.mediana': 'Mediana',
    'box.q1': '1.er cuartil (25%)', 'box.minimo': 'Mínimo', 'box.situacao': 'Situación',
    'box.s1': 'Inicio (hasta 40%)', 'box.s2': 'En curso (40–70%)', 'box.s3': 'Avanzada (70–90%)', 'box.s4': 'Casi concluida (90%+)',
    'box.leitura': 'La mitad de las noticias divulgó un % entre el 1.er y el 3.er cuartil; la mediana es el valor central.',
    'semaforo.1': 'Hasta 40%', 'semaforo.2': '40–70%', 'semaforo.3': '70–90%', 'semaforo.4': '90–100%', 'semaforo.titulo': 'Mediana del % divulgado:',
    'g.tipos_valor': 'Montos por tipo', 'g.tipos_valor.sub': 'Anunciado × contratado × financiado × ejecutado',
    'g.eventos': 'Hechos realizados por año', 'g.eventos.sub': 'Inauguraciones, firmas, aprobaciones…',
    'g.avanco': 'Avance del puente', 'g.avanco.sub': 'Desde 2022 · puntos: mayor % divulgado en el mes · línea: mediana móvil de 3 meses',
    'g.avanco.pontos': '% divulgado', 'g.avanco.mediana': 'Mediana 3 meses',
    'g.ultimas': 'Últimas noticias', 'g.ultimas.sub': 'Más recientes en el filtro actual',
    'eixo.materias': 'noticias', 'eixo.palavras': 'palabras', 'eixo.pct_obra': '% sobre la obra',
    'tab.titulo': 'Título', 'tab.fonte': 'Fuente', 'tab.fonte_link': 'Fuente/Enlace', 'tab.pais': 'País', 'tab.data': 'Fecha', 'tab.nivel': 'Relevancia',
    'tab.idioma': 'Idioma', 'tab.anterior': 'Anterior', 'tab.proxima': 'Siguiente', 'tab.pagina': 'Página {p} de {t}',
    'tab.materias': 'Noticias', 'tab.obra': '% obra',
    'outros': 'Otros', 'sem_dados': 'Sin datos para el filtro actual.',

    'materia.voltar': 'Volver', 'materia.fonte': 'Leer en la fuente original', 'materia.resumo_apenas': 'Este medio no permite republicar el texto completo. Léalo en la fuente original.',
    'materia.nao_encontrada': 'Noticia no encontrada.', 'materia.dados': 'Datos extraídos', 'materia.valores': 'Montos',
    'materia.percentuais': '% de obra', 'materia.eventos': 'Hechos realizados', 'materia.lugares': 'Lugares', 'materia.atores': 'Personas citadas',
    'm.ficha': 'Ficha de la noticia', 'm.data': 'Fecha', 'm.veiculo': 'Medio', 'm.autor': 'Autor', 'm.idioma': 'Idioma',
    'm.pais_fonte': 'País de la fuente', 'm.relevancia': 'Relevancia', 'm.palavras': 'Palabras', 'm.tipo_fonte': 'Tipo de fuente',
    'm.fonte_primaria': 'Fuente primaria', 'm.temas': 'Temas', 'm.paises': 'Países citados', 'm.trechos': 'Tramos de la obra',
    'm.entidades': 'Instituciones', 'm.tags': 'Etiquetas del medio', 'm.marcos': 'Plazos y previsiones', 'm.quantidades': 'Cantidades',
    'm.pdfs': 'Documentos citados (PDF)', 'm.evidencias': 'Términos que clasificaron la noticia', 'm.citar': 'Cómo citar (ABNT)',
    'm.copiar': 'Copiar', 'm.copiado': '¡Copiado!', 'm.acesso': 'Acceso el', 'm.id': 'Identificador', 'm.traducao': 'También publicada en otro idioma',
    'busca.titulo': 'Resultados para “{q}”', 'busca.n': '{n} noticias encontradas', 'busca.vazia': 'Escriba al menos 3 letras.',
    'busca.escopo': 'Buscar en', 'busca.escopo.web': 'Noticias', 'busca.escopo.pdf': 'PDF', 'busca.escopo.todos': 'PDF + noticias',
    'busca.placeholder.gestao': 'Buscar en documentos y noticias…', 'busca.n_pdf': '{n} documentos oficiales encontrados',
    'busca.pdfs': 'Documentos oficiales (PDF)', 'busca.materias': 'Noticias de prensa', 'busca.ver_gestao': 'Ver en Gestión',

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


    'ges.intro.titulo': 'Documentos oficiales del Corredor Bioceánico',
    'ges.intro': 'Actas, declaraciones, informes, estudios y boletines publicados por el Corredor Bioceánico de Capricornio (corredorbioceanico.org) — el organismo que coordina la obra entre Brasil, Paraguay, Argentina y Chile.',
    'ges.intro.metodo': 'Los indicadores usan solo lo escrito en los documentos. Los gráficos comparativos pueden incluir las noticias de prensa — cada gráfico tiene su propia opción.',
    'ges.intro.paises': 'Brasil · Paraguay · Argentina · Chile',
    'ges.k.acervo': 'Documentos en el acervo', 'ges.k.acervo.pe': '{pg} páginas · {n} en los últimos 12 meses',
    'ges.k.ultimo': 'Último documento', 'ges.k.trechos': 'Tramos citados', 'ges.k.lugares': 'Lugares citados',
    'ges.k.top': 'más citado: {nome} ({n})',
    'ges.div.anunciado': 'Anunciado', 'ges.div.realizado': 'Realizado',
    'ges.prazos.mediana': 'Plazo mediano', 'ges.prazos.n': '{n} previsión(es)', 'ges.prazos.mesmo_ano': 'mismo año del anuncio',
    'ges.etapas.titulo': 'Etapas por tramo', 'ges.etapas.sub': 'hechos ya registrados en cada tramo, de la licitación a la inauguración',
    'ges.etapas.nota': 'Cuanto más a la derecha están las celdas llenas, más avanzado el tramo. El número es la cantidad de registros.',
    'ges.valores.titulo': 'Anuncios de montos por año', 'ges.valores.sub': 'barras = anuncios distintos · línea = monto mediano (US$)', 'ges.valores.mediana': 'Monto mediano',
    'ges.valores.nota': 'Montos previstos, contratados y financiados; cada monto cuenta solo en el año en que apareció por primera vez. Tipo de cambio fijo anual a US$.',
    'ges.filtros': 'Filtros de Gestión del Proyecto', 'ges.fonte': 'Documentos de', 'ges.fonte.corredor': 'Corredor Bioceánico',
    'ges.fonte.oficiais': 'Fuentes oficiales', 'ges.fonte.todos': 'Todos los PDF', 'ges.trecho': 'Tramo', 'ges.pais': 'País',
    'ges.aviso33': 'Los datos publicados están en el contrato {versao}: ejecute `exportar-v3` (V2.4.1) y copie a dados/ para ver la Gestión del Proyecto.',
    'ges.k.invest': 'Inversión citada (aprox.)', 'ges.k.invest.pe': '{n} citas de montos en {d} documentos',
    'ges.k.pct': '% concluido (aprox.)', 'ges.k.pct.pe': '{trecho} · documento del {data}', 'ges.k.pct.vazio': 'sin % de {trecho} en los documentos',
    'ges.k.entregues': 'Obras entregadas', 'ges.k.entregues.pe': 'conclusiones, inauguraciones y entregas citadas en los documentos',
    'ges.k.prazos': 'Plazos divulgados', 'ges.k.prazos.pe': '{n} ya vencidos · próximo: {prox}',
    'ges.docs.titulo': 'Acervo de documentos oficiales', 'ges.docs.sub': 'elija una categoría, busque por palabras y abra la ficha o el PDF original',
    'ges.docs.placeholder': 'Buscar palabras dentro de los PDF (ej.: aduana transchaco)', 'ges.docs.n': '{n} documento(s)',
    'ges.cat.todas': 'Todos', 'ges.cat.atas': 'Actas', 'ges.cat.declaracoes': 'Declaraciones', 'ges.cat.relatorios': 'Informes',
    'ges.cat.estudos': 'Estudios', 'ges.cat.boletins': 'Boletines', 'ges.cat.apresentacoes': 'Presentaciones',
    'ges.cat.acordos': 'Convenios', 'ges.cat.agendas': 'Agendas', 'ges.cat.outros': 'Otros',
    'ges.col.data': 'Fecha', 'ges.col.documento': 'Documento', 'ges.col.tipo': 'Tipo', 'ges.col.paises': 'Países', 'ges.col.pags': 'Págs.',
    'ges.col.ultimo': 'Último %', 'ges.col.mediana': 'Mediana reciente', 'ges.col.registros': 'Registros',
    'ges.ficha': 'Ficha', 'ges.fechar': 'Cerrar', 'ges.abrir_pdf': 'Abrir el PDF en el sitio oficial', 'ges.pagina_origem': 'Página de origen',
    'ges.sem_link': 'Documento sin enlace público (archivo recibido directamente)',
    'ges.f.data': 'Fecha', 'ges.f.estimada': 'estimada', 'ges.f.fonte': 'Fuente', 'ges.f.evento': 'Evento', 'ges.f.comissao': 'Comisión / mesa',
    'ges.f.local': 'Lugar', 'ges.f.idioma': 'Idioma', 'ges.f.paginas': 'Páginas', 'ges.f.resumo': 'Resumen', 'ges.f.temas': 'Temas',
    'ges.f.paises': 'Países citados', 'ges.f.trechos': 'Tramos de la obra', 'ges.f.lugares': 'Lugares', 'ges.f.fatos': 'Hechos de obra extraídos',
    'ges.f.prazos': 'Plazos y previsiones', 'ges.f.valores': 'Montos citados', 'ges.f.compromissos': 'Compromisos y acuerdos',
    'ges.f.signatarios': 'Firmantes', 'ges.f.entidades': 'Entidades', 'ges.f.termos': 'Términos', 'ges.f.atores': 'Personas citadas',
    'ges.mapa.secao': 'Mapa de los documentos', 'ges.mapa.titulo': 'Dónde hablan los documentos', 'ges.mapa.sub': 'lugares citados en los documentos del filtro (círculo mayor = más documentos)',
    'ges.mapa.n': '{n} documento(s)',
    'ges.base': 'Base del gráfico', 'ges.base.pdf': 'Solo PDF', 'ges.base.web': 'PDF + noticias', 'ges.base.pdf_um': 'Documento oficial', 'ges.base.web_um': 'Noticia de prensa',
    'ges.acum.titulo': 'Anunciado × realizado', 'ges.acum.sub': 'por año: lo anunciado (barra izquierda) y lo realizado (derecha)',
    'ges.acum.nota': 'Barra izquierda = anuncios (montos previstos, contratados, financiados y plazos); derecha = realizaciones (ejecutado/pagado y obra entregada). Solo aparecen los años con registros, desde 2015.',
    'ges.cat_fato.previsto': 'Anunciado/previsto', 'ges.cat_fato.contratado': 'Licitado/contratado', 'ges.cat_fato.financiado': 'Financiado',
    'ges.cat_fato.executado': 'Ejecutado/pagado', 'ges.cat_fato.entregue': 'Obra entregada', 'ges.cat_fato.prazo': 'Plazos anunciados',
    'ges.prazos.titulo': 'Plazo prometido × fecha del anuncio', 'ges.prazos.sub': 'previsiones de conclusión y de inicio de operación',
    'ges.prazos.nota': 'Cada burbuja reúne las previsiones hechas en un año (horizontal) para un mismo año de conclusión (vertical); mayor = más previsiones. La línea muestra el plazo mediano: si sube, la conclusión se postergó.',
    'ges.prazos.prometido': 'Prometido para', 'ges.prazos.anunciado': 'anunciado el', 'ges.prazos.hoje': 'año actual',
    'ges.avanco.titulo': 'Avance por tramo', 'ges.avanco.sub': 'barra = último % divulgado · trazo = mediana reciente',
    'ges.avanco.nota': 'Los documentos oficiales traen pocas cifras de avance; con "PDF + noticias" entran los % divulgados por la prensa. "reg." = cantidad de registros.',
    'ges.linha.titulo': 'Cronología de hechos', 'ges.linha.sub': 'lo que ya ocurrió, de la licitación a la inauguración',
    'ges.linha.nota': 'Cada marca es un hecho en pasado ("fue licitado", "fue concluido"). Rombo = documento oficial; punto = noticia de prensa. Pase el mouse para leer la frase de origen.',
    'ges.recentes.titulo': 'Hechos más recientes en los documentos', 'ges.recentes.sub': 'haga clic en el documento para abrir la ficha', 'ges.recentes.vazio': 'Ningún hecho de obra en los documentos del filtro.',
    'sub.mapa_docs': 'Mapa de los documentos',

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
