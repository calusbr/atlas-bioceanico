/**
 * @file: assets/js/main.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-29
 * @versao: 0.5.0
 * @descricao: Liga a casca do painel: barra lateral (recolher no computador, gaveta no celular,
 *             submenus em sanfona, item ativo pela rota), menus suspensos (idioma, dados), modo
 *             claro/escuro, tela cheia, busca (atalho "/") e informações dos dados no rodapé.
 * @requisitos: navegador com módulos ES e import maps.
 */
import { aplicarI18n, definirIdioma, idiomaAtual, t, dataCurta, numero } from './i18n.js';
import { alternarTema, temaAtual } from './ui/tema.js';
import { iniciarRoteador, navegar, aoNavegar } from './roteador.js';
import { carregarManifest, estado } from './dados/carregador.js';
import { h } from './ui/dom.js';

const $ = (sel) => document.querySelector(sel);
const celular = () => matchMedia('(max-width: 1024px)').matches;

/* ------------------------------------------------------------ barra lateral */
function lateral() {
  const fecharGaveta = () => { document.body.classList.remove('gaveta-aberta'); $('.veu').hidden = true; };
  $('.alternar-menu').addEventListener('click', () => {
    if (celular()) {
      const aberta = document.body.classList.toggle('gaveta-aberta');
      $('.veu').hidden = !aberta;
    } else {
      document.body.classList.toggle('recolhida');     // vale só nesta visita: o site sempre abre com o menu aberto
    }
  });
  $('.veu').addEventListener('click', fecharGaveta);
  try { localStorage.removeItem('atlas.recolhida'); } catch { /* preferência antiga (v0.4) */ }
  // logo da barra recolhida também reabre o menu
  $('.marca').addEventListener('dblclick', () => document.body.classList.remove('recolhida'));

  document.querySelectorAll('.menu-grupo > .menu-item').forEach((a) => a.addEventListener('click', (ev) => {
    const grupo = a.parentElement;
    if (grupo.classList.contains('ativo') && grupo.classList.contains('aberto')) {   // segundo clique só recolhe
      ev.preventDefault();
      grupo.classList.remove('aberto');
    }
  }));
  document.querySelectorAll('.submenu a').forEach((a) => a.addEventListener('click', () => { if (celular()) fecharGaveta(); }));

  aoNavegar(({ secao, params }) => {
    document.querySelectorAll('.menu-grupo').forEach((g) => {
      const ativo = g.dataset.secao === secao;
      g.classList.toggle('ativo', ativo);
      g.classList.toggle('aberto', ativo);
      g.querySelectorAll('.submenu a').forEach((a) => {
        const alvo = a.getAttribute('href').split('/')[2];
        if (ativo && alvo === (params[0] || '')) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  });
}

/* ------------------------------------------------------------ menus suspensos */
function suspensos() {
  const fecharTodos = (exceto) => document.querySelectorAll('.menu-suspenso').forEach((m) => {
    if (m === exceto) return;
    m.querySelector('.suspenso').hidden = true;
    m.querySelector('.icone-botao').setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.menu-suspenso').forEach((m) => {
    const botao = m.querySelector('.icone-botao');
    const caixa = m.querySelector('.suspenso');
    botao.addEventListener('click', (ev) => {
      ev.stopPropagation();
      fecharTodos(m);
      caixa.hidden = !caixa.hidden;
      botao.setAttribute('aria-expanded', String(!caixa.hidden));
    });
    caixa.addEventListener('click', (ev) => ev.stopPropagation());
  });
  document.addEventListener('click', () => fecharTodos());
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') fecharTodos(); });

  // idioma
  const marcarIdioma = () => {
    $('#bandeira-idioma').textContent = idiomaAtual().toUpperCase();
    document.querySelectorAll('[data-idioma]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.idioma === idiomaAtual())));
  };
  document.querySelectorAll('[data-idioma]').forEach((b) => b.addEventListener('click', () => {
    definirIdioma(b.dataset.idioma);
    aplicarI18n();
    marcarIdioma();
    fecharTodos();
    infoDados();
    navegar(true);
  }));
  marcarIdioma();
}

/* ------------------------------------------------------------ tema, tela cheia, busca */
function acoes() {
  const iconeTema = () => { $('#botao-tema i').className = `bx ${temaAtual() === 'escuro' ? 'bx-sun' : 'bx-moon'}`; };
  $('#botao-tema').addEventListener('click', () => { alternarTema(); iconeTema(); });
  iconeTema();

  $('#botao-tela').addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  });
  document.addEventListener('fullscreenchange', () => {
    $('#botao-tela i').className = `bx ${document.fullscreenElement ? 'bx-exit-fullscreen' : 'bx-fullscreen'}`;
  });

  $('#form-busca').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const q = $('#campo-busca').value.trim();
    if (q) location.hash = `#/busca/${encodeURIComponent(q)}`;
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === '/' && !/input|textarea|select/i.test(document.activeElement?.tagName || '')) {
      ev.preventDefault();
      $('#campo-busca').focus();
    }
  });
  $('.pular').addEventListener('click', (ev) => { ev.preventDefault(); $('#conteudo').focus(); });
}

/* ------------------------------------------------------------ dados (menu e rodapé) */
async function infoDados() {
  try {
    const m = await carregarManifest();
    const c = m.contagens;
    $('#painel-dados').replaceChildren(
      h('h3', {}, t('dados.titulo')),
      h('dl', {},
        h('dt', {}, t('dados.gerado')), h('dd', {}, dataCurta(m.gerado_em.slice(0, 10))),
        h('dt', {}, t('dados.periodo')), h('dd', {}, `${m.periodo[0].slice(0, 4)} – ${m.periodo[1].slice(0, 4)}`),
        h('dt', {}, t('dados.materias')), h('dd', {}, numero(c.noticias)),
        h('dt', {}, t('dados.unicas')), h('dd', {}, numero(c.noticias_unicas)),
        h('dt', {}, t('dados.pdfs')), h('dd', {}, numero(c.pdfs)),
        h('dt', {}, t('dados.contrato')), h('dd', {}, `${m.contrato} · schema ${m.schema_version}`)),
      estado.offline ? h('p', { class: 'aviso' }, t('dados.offline')) : null);
    $('#rodape-dados').textContent = t('dados.rodape', { data: dataCurta(m.gerado_em.slice(0, 10)), n: numero(c.noticias_unicas) });
    $('#lateral-versao').textContent = `v${m.contrato}`;
  } catch { /* a página mostra o erro */ }
}

definirIdioma(idiomaAtual());
aplicarI18n();
lateral();
suspensos();
acoes();
infoDados();
iniciarRoteador();
