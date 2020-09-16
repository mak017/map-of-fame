<script>
import L from "leaflet";
import { addRandomMarkers } from "./randomMarkersStub";
import { openRailwayMap, openStreetMapMapnik } from "./mapUtils/tileLayers";
// import { newMarkerIcon } from './mapUtils/icons';

// const state = {
//   mode: 'regular',
// };

// Init leaflet map
const initMap = (container) => {
  const map = L.map(container, { layers: [openStreetMapMapnik] });
  // const addSpotSidebar = document.querySelector('.add-spot');

  // Change position of zoom control
  map.zoomControl.setPosition("bottomleft");

  // Get location by IP
  const getLocationByIp = () =>
    fetch("https://ipinfo.io/json?token=c97eec3767f442")
      .then((response) => response.json())
      .then((data) => {
        const { loc } = data;
        return loc.split(",").map((item) => +item);
      });

  const getLocation = async () => {
    if (navigator.geolocation) {
      try {
        const position = await new Promise((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej);
        });
        const { latitude, longitude } = position.coords;
        return [+latitude, +longitude];
      } catch (e) {
        return await getLocationByIp();
      }
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
};

// const onNewMarkerMoveEnd = () => {
//   if (!addSpotSidebar.classList.contains('visible')) {
//     addSpotSidebar.classList.add('visible');
//   }
// };

// const onAddSpotBtnClick = () => {
//   const center = map.getCenter();
//   const newMarker = L.marker(center, { draggable: true, icon: newMarkerIcon }).addTo(map);
//   newMarker.addEventListener('moveend', onNewMarkerMoveEnd);
// };

// document.querySelector('.button-add_spot').addEventListener('click', onAddSpotBtnClick);

// document.querySelector('.button-switch_mode').addEventListener('click', function () {
//   if (state.mode === 'regular') {
//     this.classList.add('active');
//     map.addLayer(openRailwayMap);
//     state.mode = 'railway';
//   } else {
//     this.classList.remove('active');
//     map.removeLayer(openRailwayMap);
//     state.mode = 'regular';
//   }
// });
</script>

<div class="map" use:initMap></div>
<div class="main-top_left_wrapper">
  <button class="button button-main_screen button-open_calendar">2020</button>
  <button class="button button-square button-lighthouse">
    <svg
      width="9"
      height="15"
      viewBox="0 0 9 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.59095 6.18163H5.20517L8.12795 0.657462C8.20028 0.521392 8.19986 0.354423 8.12678 0.218811C8.05327 0.0833129 7.91861 0 7.77276 0H2.86365C2.68755 0 2.53127 0.121078 2.47576 0.300407L0.0212066 8.23985C-0.020768 8.37374 0.00043238 8.52137 0.0771372 8.63593C0.154268 8.7506 0.277742 8.81835 0.409099 8.81835H3.87967L1.66961 14.3876C1.59046 14.5855 1.65683 14.816 1.82622 14.9313C1.99284 15.0458 2.21667 15.0157 2.35112 14.8525L8.89659 6.91302C9.00366 6.78382 9.03008 6.59877 8.96414 6.4413C8.89819 6.28337 8.75203 6.18163 8.59095 6.18163Z"
      ></path>
    </svg>
  </button>
</div>
<div class="main-top_right_wrapper">
  <button
    class="button button-main_screen button-square button-open_search"
  ></button>
  <button
    class="button button-main_screen button-square button-open_login"
  ></button>
</div>
<button class="button button-add_spot">Add Spot</button>
<button
  class="button button-main_screen button-square button-switch_mode"
></button>
<div class="add-spot"></div>
