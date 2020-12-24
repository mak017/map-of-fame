import {
  huntersFilter,
  markersStore,
  selectedArtist,
  selectedCategory,
  selectedYear,
} from "../../store";
import { validateCategory, validateYear } from "../commonUtils";
import { setMarkerDataById } from "../../stubs/randomMarkersStub";
import { normalizeCoords } from "./locationUtils";

let shouldUpdate = true;
let mapInstance = null;
let prevParams = null;
let arrMarkers = [];

markersStore.subscribe((values) => {
  arrMarkers = values;
});

const setStateFromUrl = (params) => {
  const yearFromUrl = params.get("year");
  const categoryFromUrl = params.get("category");
  const category = categoryFromUrl && categoryFromUrl.split(",");
  const artistFromUrl = params.get("artist");
  const huntersFromUrl = params.get("hunters");
  const markerFromUrl = params.get("marker");
  if (yearFromUrl && validateYear(yearFromUrl)) selectedYear.set(yearFromUrl);
  if (categoryFromUrl && validateCategory(category)) {
    selectedCategory.set(category);
  }
  if (artistFromUrl) selectedArtist.set(artistFromUrl);
  if (huntersFromUrl) {
    huntersFilter.set(JSON.parse(huntersFromUrl.toLowerCase()));
  }
  if (markerFromUrl && !Number.isNaN(+markerFromUrl)) {
    window.addEventListener(
      "markersReady",
      () => {
        setMarkerDataById(+markerFromUrl);
      },
      false
    );
  }
};

const setParamsFromState = (year, params) => {
  const { category, artist, hunters, marker } = params;
  selectedYear.set(year);
  if (category) selectedCategory.set(category);
  if (artist) selectedArtist.set(artist);
  if (hunters) huntersFilter.set(hunters);
  if (marker && arrMarkers && arrMarkers.length) {
    setMarkerDataById(arrMarkers[+marker]);
  }
};

const getMapLocation = (zoom, center) => {
  let newZoom = zoom;
  let newCenter = center;
  const search = window.location.search;
  if (search) {
    const params = new URLSearchParams(search);
    const coords = params.get("coords").split(",");
    newCenter = coords.map((coordinate) => parseFloat(coordinate, 10));
    newZoom = +params.get("zoom");
    setStateFromUrl(params);
  }
  return newZoom || newCenter ? { zoom: newZoom, center: newCenter } : null;
};
const update = ({ mapContainer, params, clearParams }) => {
  if (!shouldUpdate) {
    // do not update the URL when the view was changed in the 'popstate' handler (browser history navigation)
    shouldUpdate = true;
    return;
  }
  const map = mapContainer || mapInstance;
  let year;
  let paramsToSet = prevParams || "";
  selectedYear.subscribe((value) => {
    year = value;
  });

  const center = map?.getCenter();
  const latitude = center && normalizeCoords(center.lat);
  const longitude = center && normalizeCoords(center.lng);
  const zoom = map?.getZoom();
  if (params) {
    const { category, artist, hunters, marker } = params;
    paramsToSet = "";
    if (category?.length) {
      paramsToSet = paramsToSet.concat(`&category=${category.join(",")}`);
    }
    if (artist) {
      paramsToSet = paramsToSet.concat(`&artist=${artist}`);
    }
    if (hunters || hunters === false) {
      paramsToSet = paramsToSet.concat(`&hunters=${hunters}`);
    }
    if (marker) {
      const paramsStr = prevParams || paramsToSet;
      paramsToSet = paramsStr.concat(`&marker=${marker}`);
    }
    prevParams = paramsToSet;
  }
  if (clearParams === "all") {
    prevParams = null;
    paramsToSet = "";
  }
  if (clearParams && Array.isArray(clearParams)) {
    paramsToSet = new URLSearchParams(prevParams.substring(1));
    clearParams.forEach((param) => {
      paramsToSet.delete(param);
    });
    paramsToSet = paramsToSet.toString() ? `&${paramsToSet}` : "";
    prevParams = paramsToSet;
  }
  const search = `?coords=${latitude},${longitude}&zoom=${zoom}&year=${year}${paramsToSet}`;
  const state = { zoom, center, year, params };
  window.history.pushState(state, "map", search);
};
const getSearchUrlFromParams = (coords, zoom, year, params) => {
  let paramsToSet = "";
  if (params) {
    Object.keys(params).forEach((param) => {
      paramsToSet = paramsToSet.concat(`&${param}=${params[param]}`);
    });
  }
  return `?coords=${coords.lat},${coords.lng}&zoom=${zoom}&year=${year}${paramsToSet}`;
};
const set = (coords, zoom, year, params) => {
  const state = { zoom, center: coords, year, params };
  window.history.pushState(
    state,
    "map",
    getSearchUrlFromParams(coords, zoom, year, params)
  );
};
const getCustomUrl = (coords, zoom, year, params) => {
  const { origin, pathname } = window.location;
  const search = getSearchUrlFromParams(coords, zoom, year, params);
  return `${origin}${pathname}${search}`;
};
const setup = (map) => {
  shouldUpdate = true;

  map.on("moveend", () => update({ mapContainer: map }));

  // restore the view state when navigating through the history, see
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
  const popStateHandler = (event) => {
    if (event.state === null) {
      return;
    }
    const { center, zoom, year, params } = event.state;
    if (params) setParamsFromState(year, params);
    map.setView(center, zoom);
    shouldUpdate = false;
  };
  mapInstance = map;
  window.addEventListener("popstate", popStateHandler);
  update({ mapContainer: mapInstance });
};

export const permalink = {
  // gets the map center, zoom-level and rotation from the URL if present, else uses default values
  getMapLocation,
  setup,
  update,
  set,
  getCustomUrl,
};
