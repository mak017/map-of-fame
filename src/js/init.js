import { verifyAuthRequest } from "./api/auth";
import { getSettingsRequest } from "./api/settings";
import { getSpots } from "./api/spot";
import { EMPTY_YEAR_STRING } from "./constants";
import {
  isLoading,
  isLoggedIn,
  isSearchResults,
  markersStore,
  settings,
  userData,
} from "./store";
import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from "./utils/commonUtils";
import { transformSettings } from "./utils/transformers";

export const getSettings = () =>
  getSettingsRequest().then((response) => {
    if (response.status && response.data) {
      settings.set(transformSettings(response.data));
    }
  });

export const verifyAuth = (token) =>
  verifyAuthRequest(token).then((response) => {
    if (response.status && response.data) {
      userData.set(response.data);
      isLoggedIn.set(true);
      saveToLocalStorage("token", response.data.token);
    } else {
      const error = response.error;
      if (Array.isArray(error) && error[0] === "Provided token is expired.") {
        removeFromLocalStorage("token");
      }
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
  isLoading.set(true);
  if (year === EMPTY_YEAR_STRING) {
    yearForRequest = "";
  }
  return getSpots(yearForRequest).then((response) => {
    const { status, data, error } = response;
    if (status && data) {
      isLoading.set(false);
      isSearchResults.set(false);
      markersStore.set(data);
    }
    if (error) {
      isLoading.set(false);
    }
  });
};
