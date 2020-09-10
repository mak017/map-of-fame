import L from 'leaflet';
import { stamenTerrain } from './tileLayers';

// const state = {
//   mode: 'light',
// };

document.addEventListener('DOMContentLoaded', function () {
  // Init leaflet map
  const map = L.map('map', { layers: [stamenTerrain] });
  const addSpotSidebar = document.querySelector('.add-spot');

  // Change position of zoom control
  map.zoomControl.setPosition('bottomleft');

  // Get location by IP
  fetch('https://ipinfo.io/json?token=c97eec3767f442')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const { loc } = data;
      const location = loc.split(',').map((item) => +item);
      map.setView(location, 13);
    });

  const newMarkerIcon = L.icon({
    iconUrl: '../images/compressed/new-marker.min.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    shadowUrl: '../images/compressed/new-marker-shadow.min.svg',
    shadowSize: [46, 46],
    shadowAnchor: [23, 43],
  });

  document.querySelector('.button-add_spot').addEventListener('click', function () {
    const center = map.getCenter();
    const newMarker = L.marker(center, { draggable: true, icon: newMarkerIcon }).addTo(map);
    newMarker.addEventListener('moveend', function () {
      if (!addSpotSidebar.classList.contains('visible')) {
        addSpotSidebar.classList.add('visible');
      }
    });
  });

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
});
