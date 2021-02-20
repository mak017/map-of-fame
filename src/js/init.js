import { verifyAuthRequest } from "./api/auth";
import { getSettingsRequest } from "./api/settings";
import { getSpots } from "./api/spot";
import { EMPTY_YEAR_STRING } from "./constants";
import {
  isLighthouseActive,
  // isLoading,
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
    const { status, data, error } = response;
    if (status && data) {
      userData.set(data);
      isLoggedIn.set(true);
      saveToLocalStorage("token", data.token);
    } else if (
      Array.isArray(error) &&
      error[0] === "Provided token is expired."
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
  return getSpots(yearForRequest).then((response) => {
    const { status, data } = response;
    if (status && data) {
      // isLoading.set(false);
      isSearchResults.set(false);
      isLighthouseActive.set(false);
      markersStore.set(data);
    }
    // if (error) {
    //   isLoading.set(false);
    // }
  });
};
