import L from 'leaflet';
import { grayScaleTileLayer } from './grayScaleTileLayer';

export const stamenTerrain = L.tileLayer(
  'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}',
  {
    attribution:
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 0,
    maxZoom: 18,
    ext: 'png',
  },
);

export const openStreetMapMapnik = grayScaleTileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    fadeAnimation: false,
  },
);
// const lightLayer = L.tileLayer(
//   'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
//   {
//     attribution:
//       'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: 'mapbox/light-v10',
//     tileSize: 512,
//     zoomOffset: -1,
//     accessToken:
//       'pk.eyJ1IjoibWFrMDE3IiwiYSI6ImNrZXB1ZjlicTFoNmsydm84a3YybTczczkifQ.Tk6EsX0mlVOljcEYD-HXMw',
//   },
// );

// const darkLayer = L.tileLayer(
//   'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
//   {
//     attribution:
//       'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: 'mapbox/dark-v10',
//     tileSize: 512,
//     zoomOffset: -1,
//     accessToken:
//       'pk.eyJ1IjoibWFrMDE3IiwiYSI6ImNrZXB1ZjlicTFoNmsydm84a3YybTczczkifQ.Tk6EsX0mlVOljcEYD-HXMw',
//   },
// );
