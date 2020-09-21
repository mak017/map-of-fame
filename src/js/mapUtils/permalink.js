import {
  huntersFilter,
  selectedArtist,
  selectedCategory,
  selectedYear,
} from "../store";
import { validateCategory, validateYear } from "../utils";

let shouldUpdate = true;
let mapInstance = null;
let prevParams = null;

const setStateFromUrl = (params) => {
  const yearFromUrl = params.get("year");
  const categoryFromUrl = params.get("category").split(",");
  const artistFromUrl = params.get("artist");
  const huntersFromUrl = params.get("hunters");
  if (yearFromUrl && validateYear(yearFromUrl)) selectedYear.set(yearFromUrl);
  if (categoryFromUrl && validateCategory(categoryFromUrl)) {
    selectedCategory.set(categoryFromUrl);
  }
  if (artistFromUrl) selectedArtist.set(artistFromUrl);
  if (huntersFromUrl) {
    huntersFilter.set(JSON.parse(huntersFromUrl.toLowerCase()));
  }
};

const setParamsFromState = (year, params) => {
  const { category, artist, hunters } = params;
  selectedYear.set(year);
  if (category) selectedCategory.set(category);
  if (artist) selectedArtist.set(artist);
  if (category) huntersFilter.set(hunters);
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

  const center = map.getCenter();
  const latitude = Math.round(center.lat * 100000) / 100000;
  const longitude = Math.round(center.lng * 100000) / 100000;
  const zoom = map.getZoom();
  if (params) {
    const { category, artist, hunters } = params;
    prevParams = params;
    paramsToSet = "";
    if (category) {
      paramsToSet.concat(`&category=${category.join(",")}`);
    }
    if (artist) {
      paramsToSet.concat(`&artist=${artist}`);
    }
    if (hunters) {
      paramsToSet.concat(`&hunters=${hunters}`);
    }
  }
  if (clearParams) {
    prevParams = null;
    paramsToSet = "";
  }
  const search = `?coords=${latitude},${longitude}&zoom=${zoom}&year=${year}${paramsToSet}`;
  const state = { zoom, center, year, params };
  window.history.pushState(state, "map", search);
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
    setParamsFromState(year, params);
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
};
