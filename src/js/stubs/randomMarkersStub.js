import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster.placementstrategies";
import { statusesOrdered } from "../constants";
import { clusterIcon, markerWithPhoto } from "../utils/mapUtils/icons";
import { normalizeCoords } from "../utils/mapUtils/locationUtils";
import { permalink } from "../utils/mapUtils/permalink";
import { markersStore, openedMarkerData } from "../store";
import { markersReadyEvent } from "../utils/commonUtils";
const RANDOM_MARKERS_COUNT = 10000;
let arrMarkers = [];

markersStore.subscribe((values) => {
  arrMarkers = values;
});

export const setMarkerDataById = (id) => {
  const marker = arrMarkers[id];
  const { icon, title } = marker?.options;
  const artist = ["Artist Name", ""][Math.round(Math.random())];
  const crew = ["Crew", ""][Math.round(Math.random())];
  const status =
    statusesOrdered[
      Math.floor(Math.random() * Math.floor(statusesOrdered.length))
    ];
  const img = icon.options.iconUrl;
  const description = [
    `${title} Lorem ipsum dolor sit amet consectetur, adipisicing elit. Minima cupiditate, perspiciatis ad fugiat vero suscipit excepturi necessitatibus placeat nemo ab dignissimos laboriosam sapiente commodi quas nulla quae voluptates, accusantium dolor.`,
    "",
  ][Math.round(Math.random())];
  const video = [
    "https://www.youtube.com/watch?v=G_Z8mcfBKLE",
    "https://m.youtube.com/watch?v=G_Z8mcfBKLE",
    "https://youtu.be/G_Z8mcfBKLE",
    "https://vimeo.com/111591953",
    "https://www.dailymotion.com/video/x7tx6t6",
    "https://dai.ly/x7tx6t6",
    "",
  ][Math.floor(Math.random() * Math.floor(7))];
  const link = ["https://www.instagram.com/", ""][Math.round(Math.random())];
  const coords = marker && {
    // eslint-disable-next-line no-underscore-dangle
    lat: normalizeCoords(marker._latlng.lat),
    // eslint-disable-next-line no-underscore-dangle
    lng: normalizeCoords(marker._latlng.lng),
  };
  openedMarkerData.set({
    id,
    artist,
    crew,
    status,
    description,
    img: { src: img, title },
    video,
    user: { name: "Username", link },
    coords,
    year: "2020",
  });
  permalink.update({ params: { marker: id } });
};

const clearMarkers = (map) => {
  if (arrMarkers) {
    arrMarkers.forEach((marker) => {
      marker.removeEventListener("click");
      marker.removeFrom(map);
    });
  }
  markersStore.set([]);
};

const placeMarker = (location, text, index) => {
  const img = "https://source.unsplash.com/random";
  const marker = L.marker(location, {
    title: text,
    icon: markerWithPhoto(img),
  });
  marker.addEventListener("click", () => setMarkerDataById(index));
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
    // spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    iconCreateFunction: clusterIcon,
    spiderLegPolylineOptions: { weight: 0 },
    // clockHelpingCircleOptions: {
    //   weight: 0.7,
    //   opacity: 1,
    //   color: "black",
    //   fillOpacity: 0,
    //   dashArray: "10 5",
    // },

    elementsPlacementStrategy: "default",
    // helpingCircles: true,

    // spiderfyDistanceSurplus: 50,
    spiderfyDistanceMultiplier: 2,

    // elementsMultiplier: 1.5,
    // firstCircleElements: 5,
  });

  const tempMarkersArr = [];
  for (let i = 0; i < number; i += 1) {
    const point = [
      southWest.lat + latSpan * Math.random(),
      southWest.lng + lngSpan * Math.random(),
    ];
    pointsRand.push(point);
    const strText = `${i} : ${pointsRand[i]}`;
    const marker = placeMarker(pointsRand[i], strText, i);
    markers.addLayer(marker);
    tempMarkersArr.push(marker);
  }
  markersStore.set(tempMarkersArr);
  map.addLayer(markers);
  window.dispatchEvent(markersReadyEvent);
};

export const addRandomMarkers = (map) => {
  clearMarkers(map);
  plotRandom(RANDOM_MARKERS_COUNT, map);
};
