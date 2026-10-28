/**
 * @file: assets/js/paginas/futura.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Seções das próximas fases — Semântico (D), Gestão de Projeto (E) e Agente (F). Mostra o
 *             objetivo da seção e as ferramentas planejadas (os mesmos subitens da barra lateral).
 * @requisitos: nenhum.
 */
import { t } from '../i18n.js';
import { h, icone } from '../ui/dom.js';

const SECOES = {
  semantico: { fase: 'Fase D', icone: 'bx-network-chart', itens: [['mapa', 'bx-scatter-chart', 'mapa_semantico'], ['grafo', 'bx-share-alt', 'grafo'], ['busca', 'bx-brain', 'busca_semantica']] },
  gestao: { fase: 'Fase E', icone: 'bx-building-house', itens: [['divulgado', 'bx-transfer-alt', 'divulgado'], ['avanco', 'bx-trending-up', 'avanco'], ['fatos', 'bx-time-five', 'fatos'], ['documentos', 'bx-file-find', 'documentos']] },
  agente: { fase: 'Fase F', icone: 'bx-bot', itens: [['conversa', 'bx-message-square-dots', 'conversa'], ['ao-vivo', 'bx-broadcast', 'ao_vivo']] },
};

export function montar(alvo, [sub], secao) {
  const s = SECOES[secao];
  alvo.append(
    h('div', { class: 'pagina-topo' }, h('div', {},
      h('p', { class: 'trilha' }, icone('bx-home-alt'), t(`nav.${secao}`)),
      h('h1', {}, t(`nav.${secao}`)))),
    h('section', { class: 'cartao destaque-fase' },
      h('span', { class: 'kpi-icone' }, icone(s.icone)),
      h('div', { style: { flex: '1', minWidth: '260px' } },
        h('span', { class: 'selo-fase' }, s.fase),
        h('p', { style: { margin: '10px 0 0' } }, t(`futura.${secao}`)),
        h('p', { style: { margin: '6px 0 0', color: 'var(--texto-3)' } }, t('futura.texto', { fase: s.fase }))),
      h('a', { class: 'botao', href: '#/dashboard' }, icone('bx-grid-alt'), t('nav.dashboard'))),
    h('div', { class: 'recursos' }, s.itens.map(([id, ic, chave]) => h('article', {
      class: 'cartao recurso', id: `sec-${id}`, style: id === sub ? { borderColor: 'var(--acento)' } : null },
      icone(ic), h('h3', {}, t(`sub.${chave}`)), h('p', {}, t(`r.${chave}`))))));
  return { rolar: (id) => document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }) };
}
