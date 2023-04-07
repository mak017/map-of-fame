import { verifyAuthRequest } from "./api/auth";
import { requestSearchSpots } from "./api/search";
import { getCategories, getSettingsRequest } from "./api/settings";
import { getRecentSpots, getSpots } from "./api/spot";
import { EMPTY_YEAR_STRING } from "./constants";
import {
  categoriesList,
  isFirstTimeVisit,
  isInitialized,
  isLighthouseActive,
  isLoggedIn,
  isSearchResults,
  isUserVerifyProgress,
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

export const requestCategories = () => {
  getCategories().then((response) => {
    const { success, result } = response;
    if (success && result) {
      categoriesList.set(result);
    }
  });
};

export const verifyAuth = (token) =>
  verifyAuthRequest(token)
    .then((response) => {
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
      isUserVerifyProgress.set(false);
    })
    .catch(() => {
      removeFromLocalStorage("token");
      isUserVerifyProgress.set(false);
    });

export const initApp = () => {
  const token = loadFromLocalStorage("token") || null;
  const isKnownUser = loadFromLocalStorage("isKnownUser") || null;

  if (token) {
    isUserVerifyProgress.set(true);
    verifyAuth(token);
  }

  if (!isKnownUser) {
    isFirstTimeVisit.set(true);
  }
};

export const requestSpots = (year) => {
  let categories = loadFromLocalStorage("categories");
  let yearForRequest = year;

  if (!bounds.length) {
    return null;
  }

  if (!categories) {
    categories = [1];
    saveToLocalStorage("categories", categories);
  }

  if (year === EMPTY_YEAR_STRING) {
    yearForRequest = "";
  }

  return getSpots(yearForRequest, bounds, categories).then((response) => {
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

export const requestRecentSpots = () => {
  let categories = loadFromLocalStorage("categories");

  if (!categories) {
    categories = [1];
    saveToLocalStorage("categories", categories);
  }

  getRecentSpots(7, bounds, categories).then((response) => {
    const { success, result } = response;
    if (success && result) {
      isSearchResults.set(false);
      isLighthouseActive.set(true);
      markersStore.set(result);
    }
  });
};
