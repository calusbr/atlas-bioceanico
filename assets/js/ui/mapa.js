/**
 * @file: assets/js/ui/mapa.js
 * @autor: Lucas de Souza Rodrigues (lucas.rodrigues@ifms.edu.br) + I.A Generativa
 * @data_criacao: 2026-10-25
 * @ultima_modificacao: 2026-10-26
 * @versao: 0.3.0
 * @descricao: Mapa da rota com MapLibre GL e base OpenFreeMap (gratuita, sem chave; escura ou clara
 *             conforme o modo). Camadas:
 *               - traçado aproximado com brilho (cidades com `ordem_rota` ligadas em ordem) e um
 *                 trecho animado percorrendo a rota;
 *               - lugares como círculos proporcionais às matérias que os citam (com o filtro atual);
 *               - nomes dos lugares mais citados e popup ao passar o mouse.
 *             Sem WebGL, mostra a lista dos lugares mais citados.
 * @requisitos: maplibre-gl (import map em index.html).
 */
import { paleta, aoMudarTema } from './tema.js';
import { h } from './dom.js';

function colecoes(lugares) {
  const rota = lugares.filter((l) => l.ordem_rota != null).sort((a, b) => a.ordem_rota - b.ordem_rota);
  return {
    pontos: { type: 'FeatureCollection', features: lugares.map((l) => ({ type: 'Feature',
      geometry: { type: 'Point', coordinates: [l.lon, l.lat] },
      properties: { nome: l.nome, pais: l.pais || '', n: l.n || 0, rota: l.ordem_rota != null } })) },
    linha: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {},
      geometry: { type: 'LineString', coordinates: rota.map((l) => [l.lon, l.lat]) } }] },
  };
}

function camadas(mapa, dados, p) {
  mapa.addSource('rota', { type: 'geojson', data: dados.linha, lineMetrics: true });
  mapa.addSource('lugares', { type: 'geojson', data: dados.pontos });
  mapa.addLayer({ id: 'rota-brilho', type: 'line', source: 'rota', layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': p.acento, 'line-width': 14, 'line-opacity': 0.16, 'line-blur': 8 } });
  mapa.addLayer({ id: 'rota-linha', type: 'line', source: 'rota', layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': p.acento, 'line-width': 2.4, 'line-opacity': 0.9 } });
  mapa.addLayer({ id: 'rota-pulso', type: 'line', source: 'rota', layout: { 'line-cap': 'round' },
    paint: { 'line-width': 5, 'line-gradient': gradientePulso(p.acento, 0) } });
  mapa.addLayer({ id: 'lugares-halo', type: 'circle', source: 'lugares',
    paint: { 'circle-radius': raio(dados, 10), 'circle-color': p.acento, 'circle-opacity': 0.12, 'circle-blur': 0.6 } });
  mapa.addLayer({ id: 'lugares-circulo', type: 'circle', source: 'lugares',
    paint: {
      'circle-radius': raio(dados, 0),
      'circle-color': ['case', ['get', 'rota'], p.acento, p.series[2]],
      'circle-opacity': 0.55, 'circle-stroke-width': 1.2, 'circle-stroke-color': p.escuro ? '#ffffff' : '#0f2230',
    } });
  const max = Math.max(1, ...dados.pontos.features.map((f) => f.properties.n));
  mapa.addLayer({ id: 'lugares-nome', type: 'symbol', source: 'lugares', filter: ['>=', ['get', 'n'], max * 0.05],
    layout: { 'text-field': ['get', 'nome'], 'text-size': 11, 'text-offset': [0, 1.4], 'text-anchor': 'top', 'text-font': ['Noto Sans Regular'] },
    paint: { 'text-color': p.texto, 'text-halo-color': p.fundo, 'text-halo-width': 1.4 } });
}

const raio = (dados, extra) => {
  const max = Math.max(1, ...dados.pontos.features.map((f) => f.properties.n));
  return ['+', 3 + extra, ['*', 24, ['sqrt', ['/', ['get', 'n'], max]]]];
};

/** Um "cometa" de luz que percorre a linha (posição t entre 0 e 1). */
function gradientePulso(cor, f) {
  const t = 0.03 + 0.94 * f;                       // paradas sempre crescentes dentro de (0, 1)
  const nada = 'rgba(0,0,0,0)';
  return ['interpolate', ['linear'], ['line-progress'], 0, nada, t - 0.025, nada, t, cor, t + 0.006, nada, 1, nada];
}

function reserva(alvo, lugares) {
  alvo.replaceChildren(h('ul', { class: 'barras', style: { padding: '16px 20px' } }, lugares.filter((l) => l.n).sort((a, b) => b.n - a.n).slice(0, 12)
    .map((l) => h('li', {}, h('span', { class: 'rot' }, `${l.nome} (${l.pais})`), h('span', { class: 'val' }, l.n)))));
}

/** Monta o mapa em `alvo`. Devolve {atualizar(lugares), remover()} ou null. */
export async function montarMapa(alvo, lugares, rotulo) {
  let maplibregl;
  try {
    maplibregl = (await import('maplibre-gl')).default;
  } catch {
    reserva(alvo, lugares);
    return null;
  }
  let dados = colecoes(lugares);
  let mapa;
  try {
    mapa = new maplibregl.Map({ container: alvo, style: paleta().mapa, center: [-62, -23], zoom: 3.6,
      attributionControl: { compact: true }, cooperativeGestures: true });
  } catch {
    reserva(alvo, lugares);
    return null;
  }
  mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  mapa.addControl(new maplibregl.FullscreenControl(), 'top-right');
  mapa.on('styleimagemissing', (ev) => {
    if (!mapa.hasImage(ev.id)) mapa.addImage(ev.id, { width: 1, height: 1, data: new Uint8Array(4) });
  });
  let ajustado = false;
  mapa.on('style.load', () => {
    camadas(mapa, dados, paleta());
    if (!ajustado) {
      const c = dados.linha.features[0].geometry.coordinates;
      if (c.length > 1) mapa.fitBounds(c.reduce((b, x) => b.extend(x), new maplibregl.LngLatBounds(c[0], c[0])), { padding: 40, duration: 0 });
      ajustado = true;
    }
  });
  // pulso animado ao longo da rota (respeita "reduzir movimento")
  let quadro = 0, ultimo = 0;
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animar = (agora) => {
    quadro = requestAnimationFrame(animar);
    if (agora - ultimo < 50 || !mapa.getLayer('rota-pulso')) return;
    ultimo = agora;
    mapa.setPaintProperty('rota-pulso', 'line-gradient', gradientePulso(paleta().acento, ((agora / 9000) % 1)));
  };
  if (!reduzir) quadro = requestAnimationFrame(animar);

  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 12 });
  mapa.on('mousemove', 'lugares-circulo', (ev) => {
    const pr = ev.features[0].properties;
    mapa.getCanvas().style.cursor = 'pointer';
    popup.setLngLat(ev.lngLat).setDOMContent(h('div', {}, h('b', {}, pr.nome), ` · ${pr.pais}`, h('br'), rotulo(pr.n))).addTo(mapa);
  });
  mapa.on('mouseleave', 'lugares-circulo', () => { mapa.getCanvas().style.cursor = ''; popup.remove(); });
  const cancelar = aoMudarTema(() => mapa.setStyle(paleta().mapa, { diff: false }));

  return {
    atualizar(novos) {
      dados = colecoes(novos);
      mapa.getSource('lugares')?.setData(dados.pontos);
      if (mapa.getLayer('lugares-circulo')) {
        mapa.setPaintProperty('lugares-circulo', 'circle-radius', raio(dados, 0));
        mapa.setPaintProperty('lugares-halo', 'circle-radius', raio(dados, 10));
      }
    },
    remover() { cancelAnimationFrame(quadro); cancelar(); mapa.remove(); },
  };
}
