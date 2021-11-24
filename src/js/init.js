import { verifyAuthRequest } from "./api/auth";
import { requestSearchSpots } from "./api/search";
import { getSettingsRequest } from "./api/settings";
import { getSpots } from "./api/spot";
import { EMPTY_YEAR_STRING } from "./constants";
import {
  isInitialized,
  isLighthouseActive,
  isLoggedIn,
  isSearchResults,
  mapBounds,
  markersStore,
  settings,
  userData,
} from "./store";
import {
  isEmpty,
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from "./utils/commonUtils";
import { permalink } from "./utils/mapUtils/permalink";
import { transformSettings } from "./utils/transformers";

let bounds;

mapBounds.subscribe((value) => {
  bounds = value;
});

export const getSettings = () =>
  getSettingsRequest().then((response) => {
    if (response.success && response.result) {
      settings.set(transformSettings(response.result));
    }
  });

export const verifyAuth = (token) =>
  verifyAuthRequest(token).then((response) => {
    const { success, result, errors } = response;
    if (success && result) {
      userData.set(result);
      isLoggedIn.set(true);
      if (result.token) saveToLocalStorage("token", result.token);
    } else if (
      Array.isArray(errors) &&
      errors[0] === "Provided token is expired."
    ) {
      removeFromLocalStorage("token");
    }
  });

export const initApp = () => {
  const token = loadFromLocalStorage("token") || null;
  if (token) {
    verifyAuth(token);
  }
};

export const requestSpots = (year) => {
  let yearForRequest = year;
  // isLoading.set(true);
  if (year === EMPTY_YEAR_STRING) {
    yearForRequest = "";
  }
  if (!bounds.length) {
    return null;
  }
  return getSpots(yearForRequest, bounds).then((response) => {
    const { success, result } = response;
    if (success && result) {
      isSearchResults.set(false);
      isLighthouseActive.set(false);
      markersStore.set(result);
    }
  });
};

export const performSearch = ({ artist, crew, year, geoRect, isInitial }) => {
  requestSearchSpots({ year, artist, crew, geoRect }).then((response) => {
    const { success, result, errors } = response;
    if (isInitial) {
      isInitialized.set(true);
    }
    if (success && result) {
      isSearchResults.set(true);
      markersStore.set(result);
    }
    if (errors && !isEmpty(errors)) {
      permalink.update({ clearParams: "all" });
    }
  });
};
