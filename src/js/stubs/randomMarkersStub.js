import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster.placementstrategies";
import { statusesOrdered } from "../constants";
import { clusterIcon, markerWithPhoto } from "../mapUtils/icons";
import { openedMarkerData } from "../store";
const RANDOM_MARKERS_COUNT = 10000;
let arrMarkers = [];

const onMarkerClick = (text, img) => {
  const status =
    statusesOrdered[
      Math.floor(Math.random() * Math.floor(statusesOrdered.length))
    ];
  const description = [text, ""][Math.round(Math.random())];
  const video = [
    "https://www.youtube.com/watch?v=G_Z8mcfBKLE",
    "https://youtu.be/G_Z8mcfBKLE",
    "https://vimeo.com/111591953",
    "https://www.dailymotion.com/video/x7tx6t6",
    "https://dai.ly/x7tx6t6",
    "",
  ][Math.round(Math.random())];
  openedMarkerData.set({
    artist: "Artist Name",
    crew: "Crew",
    status,
    description,
    img: { src: img, title: text },
    video,
    user: { name: "Username", link: "https://www.instagram.com/" },
  });
};

const clearMarkers = (map) => {
  if (arrMarkers) {
    arrMarkers.forEach((marker) => {
      marker.removeEventListener("click");
      marker.removeFrom(map);
    });
  }
  arrMarkers = [];
};

const placeMarker = (location, text) => {
  const img = "https://source.unsplash.com/random";
  const marker = L.marker(location, {
    title: text,
    icon: markerWithPhoto(img),
  });
  marker.addEventListener("click", () => onMarkerClick(text, img));
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

  for (let i = 0; i < number; i += 1) {
    const point = [
      southWest.lat + latSpan * Math.random(),
      southWest.lng + lngSpan * Math.random(),
    ];
    pointsRand.push(point);
    const strText = `${i} : ${pointsRand[i]}`;
    const marker = placeMarker(pointsRand[i], strText);
    markers.addLayer(marker);
    arrMarkers.push(marker);
  }
  map.addLayer(markers);
};

export const addRandomMarkers = (map) => {
  clearMarkers(map);
  plotRandom(RANDOM_MARKERS_COUNT, map);
};
