/**
 * @file: assets/js/dados/carregador.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Acesso à pasta dados/ (exportação v3 da PARTE 1, docs/CONTRATO_DADOS.md).
 *               - manifest.json é sempre buscado na rede (sem cache); offline, usa a última cópia;
 *               - cada arquivo: memória → IndexedDB (se o SHA-256 do manifest bate) → rede, então uma
 *                 atualização dos dados baixa só o que mudou;
 *               - arquivos que saíram do manifest são apagados do IndexedDB;
 *               - o contrato precisa ter o mesmo número inteiro que o site conhece (3.x).
 *             O caminho de dados/ é resolvido a partir deste arquivo, então funciona em
 *             usuario.github.io/atlas-bioceanico/ e em http://localhost:8000/ sem configuração.
 * @requisitos: navegador com fetch; IndexedDB opcional.
 */
import * as idb from './idb.js';

export const CONTRATO_SUPORTADO = 3;
const BASE = new URL('../../../dados/', import.meta.url).href;

const memoria = new Map();
let manifest = null;
export const estado = { offline: false };

export class ErroContrato extends Error {
  constructor(versao) { super(`contrato ${versao}`); this.versao = versao; }
}

async function buscarJSON(rel, opcoes) {
  const resp = await fetch(BASE + rel, opcoes);
  if (!resp.ok) throw new Error(`${rel}: HTTP ${resp.status}`);
  return resp.json();
}

/** Manifest atual (rede; offline → última cópia do IndexedDB). */
export async function carregarManifest() {
  if (manifest) return manifest;
  try {
    manifest = await buscarJSON('manifest.json', { cache: 'no-store' });
    idb.gravar('manifest.json', '', manifest);
  } catch (erro) {
    const salvo = await idb.ler('manifest.json');
    if (!salvo) throw erro;
    manifest = salvo.dados;
    estado.offline = true;
  }
  const maior = parseInt(String(manifest.contrato || '0'), 10);
  if (maior !== CONTRATO_SUPORTADO) throw new ErroContrato(manifest.contrato);
  limparAntigos(manifest);
  return manifest;
}

async function limparAntigos(m) {
  const chaves = (await idb.chaves()) || [];
  chaves.filter((rel) => rel !== 'manifest.json' && !m.arquivos[rel]).forEach((rel) => idb.apagar(rel));
}

/** Arquivo de dados por caminho relativo (ex.: "indice/noticias.json"); null se não existe na versão. */
export function carregar(rel) {
  if (memoria.has(rel)) return memoria.get(rel);
  const promessa = (async () => {
    const m = await carregarManifest();
    const info = m.arquivos[rel];
    if (!info) return null;
    const salvo = await idb.ler(rel);
    if (salvo && salvo.sha256 === info.sha256) return salvo.dados;
    try {
      const dados = await buscarJSON(rel);
      idb.gravar(rel, info.sha256, dados);
      return dados;
    } catch (erro) {
      if (salvo) { estado.offline = true; return salvo.dados; }     // versão antiga é melhor que nada
      throw erro;
    }
  })();
  memoria.set(rel, promessa);
  promessa.catch(() => memoria.delete(rel));
  return promessa;
}

/** Os arquivos que o Dashboard usa, de uma vez. */
export async function carregarPainel() {
  const [m, dic, idx, pdfs, valores, percentuais, eventos] = await Promise.all([
    carregarManifest(), carregar('dic.json'), carregar('indice/noticias.json'), carregar('indice/pdfs.json'),
    carregar('gestao/valores.json'), carregar('gestao/percentuais.json'), carregar('gestao/eventos.json')]);
  return { m, dic, idx, pdfs, valores, percentuais, eventos };
}

export const urlDados = (rel) => BASE + rel;
