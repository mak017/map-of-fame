import {
  markerIdFromUrl,
  markersStore,
  openedMarkerData,
  selectedArtist,
  selectedCrew,
  selectedYear,
  settings,
} from "../../store";
import { normalizeCoords } from "./locationUtils";
import { validateYear } from "../datesUtils";
import { setMarkerData } from "./markersUtils";
import { ALL_YEARS_STRING, EMPTY_YEAR_STRING } from "../../constants";

let shouldUpdate = true;
let mapInstance = null;
let prevParams = null;
let arrMarkers = [];
let settingsObj = {};
let yearFromStore = null;
let selectedArtistValue = null;
let selectedCrewValue = null;
let markerId = null;

markersStore.subscribe((values) => {
  arrMarkers = values;
});

settings.subscribe((value) => {
  settingsObj = value;
});

selectedYear.subscribe((value) => {
  yearFromStore = value;
});

selectedArtist.subscribe((value) => {
  selectedArtistValue = value;
});

selectedCrew.subscribe((value) => {
  selectedCrewValue = value;
});

openedMarkerData.subscribe((value) => {
  markerId = value?.id;
});

const update = ({ mapContainer, params, clearParams, isProfile }) => {
  if (!shouldUpdate) {
    // do not update the URL when the view was changed in the 'popstate' handler (browser history navigation)
    shouldUpdate = true;
    return;
  }

  if (isProfile && params) {
    const marker = params?.marker || markerId;
    const paramsStr = prevParams || "";
    const markerQuery = `/?marker=${marker}`;
    const paramsToSet = !paramsStr.includes(`marker=${marker}`)
      ? paramsStr.concat(markerQuery)
      : paramsStr;
    window.history.pushState({ params }, "map", paramsToSet);
  }

  const map = mapContainer || mapInstance;
  const year = yearFromStore;
  let paramsToSet = prevParams || "";

  const center = map?.getCenter();
  const latitude = center && normalizeCoords(center.lat);
  const longitude = center && normalizeCoords(center.lng);
  const zoom = map?.getZoom();
  if (params || selectedArtistValue || selectedCrewValue) {
    const artist = params ? params.artist : selectedArtistValue;
    const crew = params ? params.crew : selectedCrewValue;
    const marker = params?.marker || markerId;
    paramsToSet = "";
    if (artist) {
      paramsToSet = paramsToSet.concat(`&artist=${artist}`);
    }
    if (crew) {
      paramsToSet = paramsToSet.concat(`&crew=${crew}`);
    }
    if (marker) {
      const paramsStr = prevParams || paramsToSet;
      const markerQuery = `&marker=${marker}`;
      paramsToSet = !paramsStr.includes(`&marker=${marker}`)
        ? paramsStr.concat(markerQuery)
        : paramsStr;
    }
    prevParams = paramsToSet;
  }
  if (clearParams === "all") {
    prevParams = null;
    paramsToSet = "";
  }
  if (clearParams && Array.isArray(clearParams) && prevParams) {
    paramsToSet = new URLSearchParams(prevParams.substring(1));
    clearParams.forEach((param) => {
      paramsToSet.delete(param);
    });
    paramsToSet = paramsToSet.toString() ? `&${paramsToSet}` : "";
    prevParams = paramsToSet;
  }
  const search = `/?coords=${latitude},${longitude}&zoom=${zoom}&year=${year}${paramsToSet}`;
  const state = { zoom, center, year, params };
  window.history.pushState(state, "map", search);
};

const getDataFromParams = (params) => {
  const year = params.get("year");
  const artist = params.get("artist");
  const crew = params.get("crew");
  const marker = params.get("marker");
  return { year, artist, crew, marker };
};

const setStateFromUrl = (params) => {
  const { year, artist, crew, marker } = getDataFromParams(params);
  const additionalYears = JSON.parse(settingsObj.additionalYears) ?? [];
  const yearsList = [...additionalYears, EMPTY_YEAR_STRING];

  if (year && (artist || crew)) {
    yearsList.push(ALL_YEARS_STRING);
  }

  if (year && validateYear(year, settingsObj.yearStart, yearsList)) {
    selectedYear.set(year);
  }

  if (artist) selectedArtist.set(artist);
  if (crew) selectedCrew.set(crew);
  if (marker && !Number.isNaN(+marker)) {
    markerIdFromUrl.set(marker);
  }
};

const setParamsFromState = (year, params) => {
  const { artist, crew, marker } = params;
  selectedYear.set(year);
  if (artist) selectedArtist.set(artist);
  if (crew) selectedCrew.set(crew);
  if (marker && arrMarkers && arrMarkers.length) {
    const markerData = arrMarkers.find((item) => item.id === +marker);
    if (markerData) {
      setMarkerData(markerData);
    }
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

const getSearchUrlFromParams = (coords, zoom, year, params) => {
  let paramsToSet = "";
  if (params) {
    Object.keys(params).forEach((param) => {
      paramsToSet = paramsToSet.concat(`&${param}=${params[param]}`);
    });
  }
  const lat = normalizeCoords(coords.lat);
  const lng = normalizeCoords(coords.lng);
  return `?coords=${lat},${lng}&zoom=${zoom}&year=${year}${paramsToSet}`;
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
const getInviteUrl = (code, username) => {
  const { origin } = window.location;
  return `${origin}?invite_code=${code}&from_user=${username}`;
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
  // update({ mapContainer: mapInstance });
};

export const permalink = {
  // gets the map center, zoom-level and rotation from the URL if present, else uses default values
  getMapLocation,
  setup,
  update,
  set,
  getCustomUrl,
  getInviteUrl,
  getDataFromParams,
};
