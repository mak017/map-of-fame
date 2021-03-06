import L from "leaflet";
import { MAX_ZOOM, MIN_ZOOM } from "../../constants";
import { grayScaleTileLayer } from "./grayScaleTileLayer";

// export const stamenTerrain = L.tileLayer(
//   "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}",
//   {
//     attribution:
//       'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//     minZoom: 0,
//     maxZoom: 18,
//     ext: "png",
//   }
// );

export const openStreetMapMapnik = grayScaleTileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    fadeAnimation: false,
    crossOrigin: "*",
  }
);

export const openRailwayMap = L.tileLayer(
  "https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png",
  {
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    attribution:
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  }
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
