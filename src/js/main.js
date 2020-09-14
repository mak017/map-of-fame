import L from 'leaflet';
import { addRandomMarkers } from './randomMarkersStub';
import { openRailwayMap, openStreetMapMapnik } from './mapUtils/tileLayers';
import { newMarkerIcon } from './mapUtils/icons';

const state = {
  mode: 'regular',
};

// Init leaflet map
const map = L.map('map', { layers: [openStreetMapMapnik] });
const addSpotSidebar = document.querySelector('.add-spot');

// Change position of zoom control
map.zoomControl.setPosition('bottomleft');

// Get location by IP
const getLocationByIp = () =>
  fetch('https://ipinfo.io/json?token=c97eec3767f442')
    .then((response) => response.json())
    .then((data) => {
      const { loc } = data;
      return loc.split(',').map((item) => +item);
    });

const getLocation = () => {
  if (navigator.geolocation) {
    return new Promise((res, rej) => {
      navigator.geolocation.getCurrentPosition(res, rej);
    })
      .then((position) => {
        const { latitude, longitude } = position.coords;
        return [+latitude, +longitude];
      })
      .catch(() => getLocationByIp());
  }
  return getLocationByIp();
};

const setLocation = () => {
  getLocation().then((response) => {
    map.setView(response, 13);
    addRandomMarkers(map);
  });
};

setLocation();

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

document.querySelector('.button-switch_mode').addEventListener('click', function () {
  if (state.mode === 'regular') {
    this.classList.add('active');
    map.addLayer(openRailwayMap);
    state.mode = 'railway';
  } else {
    this.classList.remove('active');
    map.removeLayer(openRailwayMap);
    state.mode = 'regular';
  }
});
