import L from 'leaflet';

export const newMarkerIcon = L.icon({
  iconUrl: '../images/compressed/new-marker.min.svg',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  shadowUrl: '../images/compressed/new-marker-shadow.min.svg',
  shadowSize: [46, 46],
  shadowAnchor: [23, 43],
});

export const markerWithPhoto = L.icon({
  iconUrl: 'https://source.unsplash.com/random',
  iconSize: [56, 56],
  className: 'map-marker-with-photo',
});

export const clusterIcon = (cluster) =>
  L.divIcon({ html: cluster.getChildCount(), className: 'map-marker-cluster', iconSize: [56, 56] });
