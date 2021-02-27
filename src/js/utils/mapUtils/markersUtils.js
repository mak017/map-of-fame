import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster.placementstrategies";
import { openedMarkerData } from "../../store";
import { markersReadyEvent } from "../commonUtils";
import { clusterIcon, markerWithPhoto } from "./icons";
import { permalink } from "./permalink";

let prevMarkers = [];
let markersLayer = null;

const clearMarkers = (map) => {
  if (prevMarkers.length) {
    prevMarkers.forEach((marker) => {
      marker.removeEventListener("click");
    });
  }
  if (markersLayer) {
    map.removeLayer(markersLayer);
  }
  prevMarkers = [];
};

export const setMarkerData = (data) => {
  const {
    id,
    artist,
    crew,
    spot_status: status,
    description,
    img,
    title,
    video_link: video,
    user: { name, link },
    firm: { banner, banner_url: bannerUrl },
  } = data;
  openedMarkerData.set({
    id,
    artist,
    crew,
    status,
    description,
    img: { src: img, title: title || id },
    video,
    user: { name, link },
    firm: { banner, bannerUrl },
  });
  permalink.update({ params: { marker: id } });
};

const createMarker = (data) => {
  const { ltd, lng, thumbnail } = data;
  const marker = L.marker([ltd, lng], { icon: markerWithPhoto(thumbnail) });
  marker.addEventListener("click", () => setMarkerData(data));
  return marker;
};

const createMarkers = (map, markersData, isSearch) => {
  markersLayer = L.markerClusterGroup({
    showCoverageOnHover: false,
    iconCreateFunction: clusterIcon,
    spiderLegPolylineOptions: { weight: 0 },
    elementsPlacementStrategy: "default",
    spiderfyDistanceMultiplier: 2,
  });
  const tempMarkersList = [];
  markersData.forEach((item) => {
    const marker = createMarker(item);
    markersLayer.addLayer(marker);
    prevMarkers.push(marker);
    tempMarkersList.push(marker);
  });
  map.addLayer(markersLayer);
  if (isSearch) {
    // eslint-disable-next-line new-cap
    const group = new L.featureGroup(tempMarkersList);
    map.fitBounds(group.getBounds());
  }
  window.dispatchEvent(markersReadyEvent);
};

export const placeMarkers = (map, markersData, isSearch) => {
  clearMarkers(map);
  if (markersData.length > 0) {
    createMarkers(map, markersData, isSearch);
  }
};

export const getLastSpots = (markersData) => {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  return markersData.filter((item) => new Date(item.created_at) >= last7Days);
};
