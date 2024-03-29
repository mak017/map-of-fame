import L from "leaflet";
import "leaflet.markercluster";
import { get } from "svelte/store";

import {
  categoriesList,
  clusterSpots,
  globalGoto,
  isAreaSelectionActive,
  openedMarkerData,
} from "../../store";
import { markersReadyEvent } from "../commonUtils";
import { clusterIcon, markerClusterIcon, markerWithPhoto } from "./icons";

import { MAX_ZOOM } from "../../constants";

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
  const $goto = get(globalGoto);
  const $isAreaSelectionActive = get(isAreaSelectionActive);
  const {
    id,
    spotStatus: status,
    img,
    title,
    videoLink: video,
    user,
    publicBanner: { banner, bannerUrl },
    location: { lat, lng },
  } = data;
  openedMarkerData.set({
    ...data,
    status,
    img: { src: img, title: title || id },
    video,
    firm: { banner, bannerUrl },
    coords: { lat, lng },
  });
  $goto("/@:username/spot/:id", { username: user.username, id });

  if (!$isAreaSelectionActive) {
    document.getElementById("highlighted").innerHTML = "";
  }
};

const createMarker = (data) => {
  const {
    id,
    location: { lat, lng },
    icon,
    thumbnail,
  } = data;
  const marker = L.marker([lat, lng], {
    icon: markerWithPhoto(icon || thumbnail, id),
  });
  marker.addEventListener("click", () => setMarkerData(data));
  marker.spotId = id;
  return marker;
};

const createClusterMarker = (data, map) => {
  const {
    center: { lat, lng },
    spotcnt,
  } = data;
  const marker = L.marker([lat, lng], {
    icon: markerClusterIcon(spotcnt),
  });

  marker.addEventListener("click", () => map.setView([lat, lng], 14));
  return marker;
};

const createMarkers = (map, markersData, isSearch) => {
  markersLayer = L.markerClusterGroup({
    chunkedLoading: true,
    spiderfyOnMaxZoom: false,
    showCoverageOnHover: false,
    iconCreateFunction: clusterIcon,
  });
  const tempMarkersList = [];
  markersData?.spots?.forEach((item) => {
    const marker = createMarker(item);
    marker.isAdditionalCategory = get(categoriesList).find(
      (category) => category.id === item.categoryId
    )?.isAdditional;
    markersLayer.addLayer(marker);
    prevMarkers.push(marker);
    tempMarkersList.push(marker);
  });
  markersData?.clusters?.forEach((item) => {
    const marker = createClusterMarker(item, map);
    marker.count = item.spotcnt;
    markersLayer.addLayer(marker);
    prevMarkers.push(marker);
    tempMarkersList.push(marker);
  });
  markersLayer.on("clusterclick", (event) => {
    // eslint-disable-next-line no-underscore-dangle
    if (event.layer._zoom === MAX_ZOOM) {
      const $goto = get(globalGoto);
      const markers = event.layer.getAllChildMarkers();
      const spots = markersData?.spots.filter((spot) =>
        markers.some((marker) => marker.spotId === spot.id)
      );
      clusterSpots.set(spots);
      $goto("/selected-spots");
    }
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
  if (markersData?.spots?.length > 0 || markersData?.clusters?.length > 0) {
    createMarkers(map, markersData, isSearch);
  }
};

export const getLastSpots = (markersData) => {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  return markersData.filter((item) => new Date(item.created_at) >= last7Days);
};
