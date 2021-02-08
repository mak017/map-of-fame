import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster.placementstrategies";
import { openedMarkerData } from "../../store";
import { markersReadyEvent } from "../commonUtils";
import { clusterIcon, markerWithPhoto } from "./icons";

let prevMarkers = [];

const clearMarkers = (map) => {
  if (prevMarkers.length) {
    prevMarkers.forEach((marker) => {
      marker.removeEventListener("click");
      marker.removeFrom(map);
    });
  }
  prevMarkers = [];
};

const setMarkerData = (data) => {
  const {
    id,
    artist,
    crew,
    spot_status: status,
    description,
    img,
    title,
    video_link: video,
  } = data;
  openedMarkerData.set({
    id,
    artist,
    crew,
    status,
    description,
    img: { src: img, title: title || id },
    video,
  });
};

const createMarker = (data) => {
  const { ltd, lng, thumbnail } = data;
  const marker = L.marker([ltd, lng], { icon: markerWithPhoto(thumbnail) });
  marker.addEventListener("click", () => setMarkerData(data));
  return marker;
};

const createMarkers = (map, markersData) => {
  const markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    iconCreateFunction: clusterIcon,
    spiderLegPolylineOptions: { weight: 0 },
    elementsPlacementStrategy: "default",
    spiderfyDistanceMultiplier: 2,
  });
  markersData.forEach((item) => {
    const marker = createMarker(item);
    markers.addLayer(marker);
    prevMarkers.push(marker);
  });
  map.addLayer(markers);
  window.dispatchEvent(markersReadyEvent);
};

export const placeMarkers = (map, markersData) => {
  clearMarkers(map);
  if (markersData.length > 0) {
    createMarkers(map, markersData);
  }
};
