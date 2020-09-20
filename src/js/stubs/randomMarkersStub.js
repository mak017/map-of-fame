import L from "leaflet";
import "leaflet.markercluster";
import { clusterIcon, markerWithPhoto } from "../mapUtils/icons";
const RANDOM_MARKERS_COUNT = 100;
let arrMarkers = [];

const clearMarkers = (map) => {
  if (arrMarkers) {
    arrMarkers.forEach((marker) => marker.removeFrom(map));
  }
  arrMarkers = [];
};

const placeMarker = (location, text) => {
  let marker = L.marker(location, { title: text, icon: markerWithPhoto });
  return marker;
};

const plotRandom = (number, map) => {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const lngSpan = northEast.lng - southWest.lng;
  const latSpan = northEast.lat - southWest.lat;
  const pointsRand = [];
  const markers = L.markerClusterGroup({
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    iconCreateFunction: clusterIcon,
  });

  for (let i = 0; i < number; i += 1) {
    const point = [
      southWest.lat + latSpan * Math.random(),
      southWest.lng + lngSpan * Math.random(),
    ];
    pointsRand.push(point);
    const strText = `${i} : ${pointsRand[i]}`;
    const marker = placeMarker(pointsRand[i], strText);
    markers.addLayer(marker);
    arrMarkers.push(marker);
  }
  map.addLayer(markers);
};

export const addRandomMarkers = (map) => {
  clearMarkers(map);
  plotRandom(RANDOM_MARKERS_COUNT, map);
};