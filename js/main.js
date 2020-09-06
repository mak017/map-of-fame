// async function getData(url) {

// }

document.addEventListener('DOMContentLoaded', function () {
  // Init leaflet map
  const map = L.map('map');
  const addSpotSidebar = document.querySelector('.add-spot');

  // Tile layer
  L.tileLayer(
    'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken:
        'pk.eyJ1IjoibWFrMDE3IiwiYSI6ImNrZXB1ZjlicTFoNmsydm84a3YybTczczkifQ.Tk6EsX0mlVOljcEYD-HXMw',
    },
  ).addTo(map);

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

  document.querySelector('.addSpot').addEventListener('click', function () {
    const center = map.getCenter();
    const newMarker = L.marker(center, { draggable: true, icon: newMarkerIcon }).addTo(map);
    newMarker.addEventListener('moveend', function () {
      if (!addSpotSidebar.classList.contains('visible')) {
        addSpotSidebar.classList.add('visible');
      }
    });
  });
});
