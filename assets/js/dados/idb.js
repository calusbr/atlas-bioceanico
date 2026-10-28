/**
 * @file: assets/js/dados/idb.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Cache de arquivos de dados no IndexedDB do navegador: {rel, sha256, dados}. Se o
 *             IndexedDB estiver indisponível (janela privada, armazenamento bloqueado), as operações
 *             viram no-op e o site simplesmente baixa de novo.
 * @requisitos: nenhum.
 */

const BANCO = 'atlas-bioceanico';
const LOJA = 'arquivos';
let conexao;

function abrir() {
  if (conexao) return conexao;
  conexao = new Promise((ok) => {
    try {
      const req = indexedDB.open(BANCO, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(LOJA, { keyPath: 'rel' });
      req.onsuccess = () => ok(req.result);
      req.onerror = () => ok(null);
      req.onblocked = () => ok(null);
    } catch {
      ok(null);
    }
  });
  return conexao;
}

function operar(modo, fn) {
  return abrir().then((db) => new Promise((ok) => {
    if (!db) return ok(null);
    try {
      const tx = db.transaction(LOJA, modo);
      const req = fn(tx.objectStore(LOJA));
      tx.oncomplete = () => ok(req?.result ?? null);
      tx.onerror = () => ok(null);
      tx.onabort = () => ok(null);
    } catch {
      ok(null);
    }
  }));
}

export const ler = (rel) => operar('readonly', (s) => s.get(rel));
export const gravar = (rel, sha256, dados) => operar('readwrite', (s) => s.put({ rel, sha256, dados, em: Date.now() }));
export const chaves = () => operar('readonly', (s) => s.getAllKeys());
export const apagar = (rel) => operar('readwrite', (s) => s.delete(rel));
