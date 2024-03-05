import { get } from "svelte/store";

import { verifyAuthRequest } from "./api/auth";
import { getCategories, getSettingsRequest } from "./api/settings";
import { getRecentSpots, getSpots, getSpotsInArea } from "./api/spot";
import {
  areaCoords,
  areaSpots,
  categoriesList,
  isFirstTimeVisit,
  isLoggedIn,
  isSpotsFromAreaLoading,
  isUserVerifyProgress,
  mapBounds,
  markersStore,
  settings,
  userData,
  withHunters,
  withNewbies,
} from "./store";
import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from "./utils/commonUtils";
import { transformSettings } from "./utils/transformers";

import { ALL_YEARS_STRING, EMPTY_YEAR_STRING } from "./constants";

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
        withNewbies.set(result.isNewbie);
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
  const bounds = get(mapBounds);
  const $withHunters = get(withHunters);
  const $withNewbies = get(withNewbies);
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

  if (year === ALL_YEARS_STRING) {
    yearForRequest = undefined;
  }

  return getSpots(
    yearForRequest,
    bounds,
    categories,
    $withHunters,
    $withNewbies
  ).then((response) => {
    const { success, result } = response;
    if (success && result) {
      markersStore.set(result);
    }
  });
};

export const requestRecentSpots = () => {
  const bounds = get(mapBounds);
  let categories = loadFromLocalStorage("categories");

  if (!categories) {
    categories = [1];
    saveToLocalStorage("categories", categories);
  }

  getRecentSpots(7, bounds, categories).then((response) => {
    const { success, result } = response;
    if (success && result) {
      markersStore.set(result);
    }
  });
};

export const requestSpotsInArea = (coords) => {
  const $withHunters = get(withHunters);
  const $withNewbies = get(withNewbies);
  getSpotsInArea(coords, $withHunters, $withNewbies).then(({ result }) => {
    areaCoords.set(coords);
    areaSpots.set(result);
    markersStore.set({ spots: result });
    const style = `
      .map-marker-with-photo, .map-marker-cluster
        {
          width: 34px !important;
          height: 34px !important;
          border-width: 2px;
          opacity: 1 !important;
          font-size: 14px;
          pointer-events: auto !important;
        }
      `;
    document.getElementById("highlighted").innerHTML = style;
    isSpotsFromAreaLoading.set(false);
  });
};
