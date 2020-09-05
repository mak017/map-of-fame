// async function getData(url) {

// }

document.addEventListener('DOMContentLoaded', function () {
  const map = L.map('map');
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

  fetch('https://ipinfo.io/json?token=c97eec3767f442')
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      const { loc } = data;
      const location = loc.split(',').map((item) => +item);
      map.setView(location, 13);
    });
});
