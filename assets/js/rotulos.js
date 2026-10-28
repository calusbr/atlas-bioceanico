/**
 * @file: assets/js/rotulos.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-26
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Nomes legíveis (PT/ES) dos códigos de dic.json: temas, países, trechos (forma curta para
 *             gráficos), tipos de valor, tipos de evento e tipos de documento. Código desconhecido
 *             volta como veio — uma categoria nova na PARTE 1 não quebra o site.
 * @requisitos: nenhum.
 */
import { idiomaAtual } from './i18n.js';

const R = {
  tema: {
    infraestrutura_obras: ['Infraestrutura e obras', 'Infraestructura y obras'],
    logistica_transporte: ['Logística e transporte', 'Logística y transporte'],
    comercio_exterior: ['Comércio exterior', 'Comercio exterior'],
    agronegocio: ['Agronegócio', 'Agronegocio'],
    fronteira_aduana: ['Fronteira e aduana', 'Frontera y aduana'],
    turismo_cultura: ['Turismo e cultura', 'Turismo y cultura'],
    meio_ambiente: ['Meio ambiente', 'Medio ambiente'],
    seguranca: ['Segurança', 'Seguridad'],
    politica_diplomacia: ['Política e diplomacia', 'Política y diplomacia'],
    financiamento_investimento: ['Financiamento', 'Financiamiento'],
    educacao_pesquisa: ['Educação e pesquisa', 'Educación e investigación'],
    energia_mineracao: ['Energia e mineração', 'Energía y minería'],
    emprego_desenvolvimento: ['Emprego e desenvolvimento', 'Empleo y desarrollo'],
  },
  pais: {
    BR: ['Brasil', 'Brasil'], PY: ['Paraguai', 'Paraguay'], AR: ['Argentina', 'Argentina'], CL: ['Chile', 'Chile'],
    BO: ['Bolívia', 'Bolivia'], PE: ['Peru', 'Perú'], UY: ['Uruguai', 'Uruguay'], CN: ['China', 'China'],
    US: ['EUA', 'EE. UU.'], INT: ['Internacional', 'Internacional'], '': ['Outro', 'Otro'], '?': ['Outro', 'Otro'],
  },
  trecho: {
    br_267_ms: ['BR-267 (MS)', 'BR-267 (MS)'],
    acesso_ponte_br: ['Acesso BR à ponte', 'Acceso BR al puente'],
    ponte_bioceanica: ['Ponte Bioceânica', 'Puente Bioceánico'],
    acesso_ponte_py: ['Acesso PY à ponte', 'Acceso PY al puente'],
    py_15_chaco: ['PY-15 Chaco', 'PY-15 Chaco'],
    fronteira_py_ar: ['Fronteira PY–AR', 'Frontera PY–AR'],
    rotas_argentinas: ['Rotas argentinas', 'Rutas argentinas'],
    paso_jama_sico: ['Passos Jama/Sico', 'Pasos Jama/Sico'],
    portos_chilenos: ['Portos do Chile', 'Puertos de Chile'],
  },
  valor: {
    previsto: ['Divulgado/previsto', 'Anunciado/previsto'],
    contratado: ['Licitado/contratado', 'Licitado/contratado'],
    financiado: ['Financiado', 'Financiado'],
    executado: ['Executado/pago', 'Ejecutado/pagado'],
    economico: ['Indicador econômico', 'Indicador económico'],
    outro: ['Sem tipo', 'Sin tipo'],
  },
  evento: {
    inauguracao: ['Inauguração', 'Inauguración'], conclusao: ['Conclusão', 'Conclusión'], entrega: ['Entrega', 'Entrega'],
    assinatura: ['Assinatura', 'Firma'], aprovacao: ['Aprovação', 'Aprobación'], licitacao: ['Licitação', 'Licitación'],
    inicio: ['Início de obra', 'Inicio de obra'],
  },
  doc: {
    ata: ['Ata', 'Acta'], declaracao: ['Declaração', 'Declaración'], informe: ['Informe', 'Informe'], boletim: ['Boletim', 'Boletín'],
    estudo: ['Estudo', 'Estudio'], plano: ['Plano', 'Plan'], convenio: ['Convênio', 'Convenio'], apresentacao: ['Apresentação', 'Presentación'],
    agenda: ['Agenda', 'Agenda'], documento_projeto: ['Documento de projeto', 'Documento de proyecto'],
    termo_referencia: ['Termo de referência', 'Términos de referencia'], regimento: ['Regimento', 'Reglamento'],
    lista_participantes: ['Lista de participantes', 'Lista de participantes'], relatorio_reuniao: ['Relatório de reunião', 'Informe de reunión'],
    outro: ['Outro', 'Otro'],
  },
};

/** rotulo('tema', 'agronegocio') → "Agronegócio" (no idioma atual). */
export function rotulo(tipo, codigo) {
  const par = R[tipo]?.[codigo];
  return par ? par[idiomaAtual() === 'es' ? 1 : 0] : codigo;
}
