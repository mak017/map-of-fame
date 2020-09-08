const state = {
  mode: 'light',
};

document.addEventListener('DOMContentLoaded', function () {
  // Tile layers
  const lightLayer = L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/light-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        'pk.eyJ1IjoibWFrMDE3IiwiYSI6ImNrZXB1ZjlicTFoNmsydm84a3YybTczczkifQ.Tk6EsX0mlVOljcEYD-HXMw',
    },
  );

  const darkLayer = L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/dark-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        'pk.eyJ1IjoibWFrMDE3IiwiYSI6ImNrZXB1ZjlicTFoNmsydm84a3YybTczczkifQ.Tk6EsX0mlVOljcEYD-HXMw',
    },
  );

  // Init leaflet map
  const map = L.map('map', { layers: [lightLayer] });
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

  document.querySelector('.button-dark_mode').addEventListener('click', function () {
    if (state.mode === 'light') {
      map.removeLayer(lightLayer);
      map.addLayer(darkLayer);
      state.mode = 'dark';
    } else {
      map.removeLayer(darkLayer);
      map.addLayer(lightLayer);
      state.mode = 'light';
    }
  });
});
