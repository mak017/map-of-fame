import { get } from "svelte/store";

import {
  globalGoto,
  selectedArtist,
  selectedCrew,
  selectedYear,
  settings,
} from "../../store";
import { normalizeCoords } from "./locationUtils";
import { validateYear } from "../datesUtils";

import { ALL_YEARS_STRING, EMPTY_YEAR_STRING } from "../../constants";

let mapInstance = null;
let prevParams = null;
let settingsObj = {};
let yearFromStore = null;
let selectedArtistValue = null;
let selectedCrewValue = null;

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

const update = ({ mapContainer, params, clearParams }) => {
  const $goto = get(globalGoto);
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
    paramsToSet = "";
    if (artist) {
      paramsToSet = paramsToSet.concat(`&artist=${artist}`);
    }
    if (crew) {
      paramsToSet = paramsToSet.concat(`&crew=${crew}`);
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
  const search = `/?lat=${latitude}&lng=${longitude}&zoom=${zoom}&year=${year}${paramsToSet}`;
  const state = { zoom, center, year, params };

  if (decodeURIComponent(window.location.href).endsWith(search)) {
    return;
  }

  $goto(
    "/",
    { lat: latitude, lng: longitude, zoom, year },
    { mode: window.location.pathname === "/" ? "replace" : "push" }
  );
  // window.history.replaceStateNative(state, "map", search);
};

const getDataFromParams = (params) => {
  const year = params.get("year");
  const artist = params.get("artist");
  const crew = params.get("crew");
  return { year, artist, crew };
};

const getDataFromUrl = (url = window.location.search) => {
  const params = new URLSearchParams(url);
  return getDataFromParams(params);
};

const setStateFromUrl = (params) => {
  const { year, artist, crew } = getDataFromParams(params);
  const additionalYears = settingsObj.additionalYears
    ? JSON.parse(settingsObj.additionalYears)
    : [];
  const yearsList = [...additionalYears, EMPTY_YEAR_STRING];

  if (year && (artist || crew)) {
    yearsList.push(ALL_YEARS_STRING);
  }

  if (year && validateYear(year, settingsObj.yearStart, yearsList)) {
    selectedYear.set(year);
  }

  if (artist) selectedArtist.set(artist);
  if (crew) selectedCrew.set(crew);
};

const setParamsFromState = (year, params) => {
  const { artist, crew } = params;
  selectedYear.set(year);
  if (artist) selectedArtist.set(artist);
  if (crew) selectedCrew.set(crew);
};

const getMapLocation = () => {
  let newZoom;
  let newCenter;
  const search = window.location.search;
  if (search) {
    const params = new URLSearchParams(search);
    const lat = params.get("lat");
    const lng = params.get("lng");
    newCenter = [lat, lng].map((coordinate) => parseFloat(coordinate, 10));
    newZoom = +params.get("zoom");
    setStateFromUrl(params);
  }
  return newZoom || newCenter ? { zoom: newZoom, center: newCenter } : null;
};

const getCustomUrl = (coords, zoom, year, params) => {
  const { origin, pathname } = window.location;
  const search = getSearchUrlFromParams(coords, zoom, year, params);
  return `${origin}${pathname}${search}`;
};
const getInviteUrl = (code, username) => {
  const { origin } = window.location;
  return `${origin}/registration?invite_code=${code}&from_user=${username}`;
};
const setup = (map) => {
  mapInstance = map;
};

export const permalink = {
  // gets the map center, zoom-level and rotation from the URL if present, else uses default values
  getMapLocation,
  setup,
  update,
  getCustomUrl,
  getInviteUrl,
  getDataFromParams,
  getDataFromUrl,
};
