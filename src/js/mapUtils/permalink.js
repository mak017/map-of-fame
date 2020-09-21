import { selectedYear } from "../store";
import { validateYear } from "../utils";

let shouldUpdate = true;
let mapInstance;

const getMapLocation = (zoom, center) => {
  let newZoom = zoom;
  let newCenter = center;
  const search = window.location.search;
  if (search) {
    const params = new URLSearchParams(search);
    const coords = params.get("coords").split(",");
    newCenter = coords.map((coordinate) => parseFloat(coordinate, 10));
    newZoom = +params.get("zoom");
    const yearFromUrl = params.get("year");
    if (yearFromUrl && validateYear(yearFromUrl)) selectedYear.set(yearFromUrl);
  }
  return newZoom || newCenter ? { zoom: newZoom, center: newCenter } : null;
};
const update = (map = mapInstance) => {
  if (!shouldUpdate) {
    // do not update the URL when the view was changed in the 'popstate' handler (browser history navigation)
    shouldUpdate = true;
    return;
  }
  let year;
  selectedYear.subscribe((value) => {
    year = value;
  });

  const center = map.getCenter();
  const latitude = Math.round(center.lat * 100000) / 100000;
  const longitude = Math.round(center.lng * 100000) / 100000;
  const zoom = map.getZoom();
  const search = `?coords=${latitude},${longitude}&zoom=${zoom}&year=${year}`;
  const state = {
    zoom,
    center,
  };
  window.history.pushState(state, "map", search);
};
const setup = (map) => {
  shouldUpdate = true;

  map.on("moveend", () => update(map));

  // restore the view state when navigating through the history, see
  // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
  const popStateHandler = (event) => {
    if (event.state === null) {
      return;
    }
    map.setView(event.state.center, event.state.zoom);
    shouldUpdate = false;
  };
  mapInstance = map;
  window.addEventListener("popstate", popStateHandler);
  update(mapInstance);
};

export const permalink = {
  // gets the map center, zoom-level and rotation from the URL if present, else uses default values
  getMapLocation,
  setup,
  update,
};
