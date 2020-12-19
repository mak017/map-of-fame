import { verifyAuthRequest } from "./api/auth";
import { getSettingsRequest } from "./api/settings";
import { isLoggedIn, settings, userData } from "./store";
import {
  loadFromLocalStorage,
  removeFromLocalStorage,
  saveToLocalStorage,
} from "./utils";

export const getSettings = (token) =>
  getSettingsRequest(token).then((response) => {
    console.log("getSettingsRequest response :>> ", response);
    if (response.status && response.data) {
      settings.set(response.data);
    }
  });

export const verifyAuth = (token) =>
  verifyAuthRequest(token).then((response) => {
    if (response.status && response.data) {
      console.log("verify :>> ", response.data);
      userData.set(response.data);
      isLoggedIn.set(true);
      saveToLocalStorage("token", response.data.token);
      getSettings(response.data.token);
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
