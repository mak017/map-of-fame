import L from 'leaflet';
const RANDOM_MARKERS_COUNT = 100;
const arrMarkers = [];

export const onAddMarkersClick = (map) => {
  clearmarkers();
  plotrandom(RANDOM_MARKERS_COUNT, map);
};

const clearmarkers = () => {
  if (arrMarkers) {
    for (let i in arrMarkers) {
      arrMarkers[i].removeFrom(map);
    }
  }
  arrMarkers = [];
};

const plotrandom = (number, map) => {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const lngSpan = northEast.lng - southWest.lng;
  const latSpan = northEast.lat - southWest.lat;
  pointsRand = [];

  for (let i = 0; i < number; ++i) {
    const point = [
      southWest.lat + latSpan * Math.random(),
      southWest.lng + lngSpan * Math.random(),
    ];
    pointsRand.push(point);
  }

  for (var i = 0; i < number; ++i) {
    var str_text = i + ' : ' + pointsRand[i];
    var marker = placeMarker(pointsRand[i], str_text);
    marker.addTo(map);
    arrMarkers.push(marker);
  }
};

const placeMarker = (location, text) => {
  var marker = L.marker(location, { title: text });
  return marker;
};
