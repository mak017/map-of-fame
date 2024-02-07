import { get } from "svelte/store";

import { getCurrentYear } from "../commonUtils";
import { permalink } from "./permalink";
import {
  isAreaSelectionActive,
  isInitialized,
  isPermalinkReady,
  isShowOnMapMode,
  mapBounds,
  selectedYear,
} from "../../store";
import { requestSpots } from "../../init";

import { DEFAULT_ZOOM, DEFAULT_VIEW } from "../../constants";

const getLocationByIp = () =>
  fetch("https://ipinfo.io/json?token=f7826cd7c9e44b")
    .then((response) => response.json())
    .then((data) => {
      const { loc } = data;
      return {
        center: loc.split(",").map((item) => +item),
        zoom: 11,
      };
    });

const getLocation = async (ignoreUrl) => {
  const locationFromUrl = !ignoreUrl && permalink.getMapLocation();
  if (locationFromUrl) {
    return locationFromUrl;
  }
  if (navigator.geolocation) {
    try {
      const position = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
      });
      const { latitude, longitude } = position.coords;
      return { center: [+latitude, +longitude], zoom: DEFAULT_ZOOM };
    } catch {
      return getLocationByIp();
    }
  }
  return getLocationByIp();
};

const getBounds = (map) => {
  const bounds = map.getBounds();
  return [bounds.getNorthWest(), bounds.getSouthEast()];
};

export const handleMapViewChange = (map) => {
  const bounds = getBounds(map);
  mapBounds.set(bounds);

  if (get(isAreaSelectionActive)) {
    return;
  }

  if (!get(isShowOnMapMode)) {
    const yearFromStore = get(selectedYear);
    requestSpots(yearFromStore);
  }
};

export const setLocation = (map, force) => {
  getLocation(force)
    .then((response) => {
      map.setView(
        response.center || DEFAULT_VIEW.coordinates,
        response.zoom || DEFAULT_ZOOM
      );
    })
    .catch(() => {
      map.setView(DEFAULT_VIEW.coordinates, DEFAULT_VIEW.zoom);
    })
    .finally(() => {
      permalink.setup(map);
      isPermalinkReady.set(true);
      const bounds = getBounds(map);
      const yearFromStore = get(selectedYear);
      mapBounds.set(bounds);
      if (!force) {
        isInitialized.set(true);
        requestSpots(yearFromStore || getCurrentYear());
      }
    });
};

export const normalizeCoords = (coordinate) =>
  Math.round(coordinate * 100000) / 100000;
