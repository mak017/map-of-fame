import L from 'leaflet';
import { addRandomMarkers } from './randomMarkersStub';
import { openStreetMapMapnik } from './mapUtils/tileLayers';
import { newMarkerIcon } from './mapUtils/icons';

// const state = {
//   mode: 'light',
// };

// document.addEventListener('DOMContentLoaded', function () {
// Init leaflet map
const map = L.map('map', { layers: [openStreetMapMapnik] });
const addSpotSidebar = document.querySelector('.add-spot');

// Change position of zoom control
map.zoomControl.setPosition('bottomleft');

// Get location by IP
fetch('https://ipinfo.io/json?token=c97eec3767f442')
  .then((response) => response.json())
  .then((data) => {
    const { loc } = data;
    const location = loc.split(',').map((item) => +item);
    map.setView(location, 13);
    addRandomMarkers(map);
  });

const onNewMarkerMoveEnd = () => {
  if (!addSpotSidebar.classList.contains('visible')) {
    addSpotSidebar.classList.add('visible');
  }
};

const onAddSpotBtnClick = () => {
  const center = map.getCenter();
  const newMarker = L.marker(center, { draggable: true, icon: newMarkerIcon }).addTo(map);
  newMarker.addEventListener('moveend', onNewMarkerMoveEnd);
};

document.querySelector('.button-add_spot').addEventListener('click', onAddSpotBtnClick);

// document.querySelector('.button-dark_mode').addEventListener('click', function () {
//   if (state.mode === 'light') {
//     map.removeLayer(lightLayer);
//     map.addLayer(darkLayer);
//     state.mode = 'dark';
//   } else {
//     map.removeLayer(darkLayer);
//     map.addLayer(lightLayer);
//     state.mode = 'light';
//   }
// });
// });
