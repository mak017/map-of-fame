import { verifyAuthRequest } from "./api/auth";
import { requestSearchSpots } from "./api/search";
import { getCategories, getSettingsRequest } from "./api/settings";
import { getRecentSpots, getSpots } from "./api/spot";
import { EMPTY_YEAR_STRING } from "./constants";
import {
  categoriesList,
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
    })
    .catch(() => {
      removeFromLocalStorage("token");
    });

export const initApp = () => {
  const token = loadFromLocalStorage("token") || null;
  if (token) {
    verifyAuth(token);
  }
};

export const requestSpots = (year) => {
  const isRailwayMode = loadFromLocalStorage("railwayMode");
  let yearForRequest = year;
  let categories = null;
  if (!bounds.length) {
    return null;
  }
  if (year === EMPTY_YEAR_STRING) {
    yearForRequest = "";
  }
  if (!isRailwayMode) {
    categories = [1, 3, 4, 5, 6];
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
  const isRailwayMode = loadFromLocalStorage("railwayMode");
  let categories = null;
  if (!isRailwayMode) {
    categories = [1, 3, 4, 5, 6];
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
