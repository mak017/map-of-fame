import { verifyAuthRequest } from "./api/auth";
import { getSettingsRequest } from "./api/settings";
import { isLoggedIn, userData } from "./store";
import { loadFromLocalStorage, removeFromLocalStorage } from "./utils";

export const initApp = () => {
  const token = loadFromLocalStorage("token") || null;
  if (token) {
    verifyAuthRequest(token).then((response) => {
      if (response.status && response.data) {
        console.log("verify :>> ", response.data);
        userData.set(response.data);
        isLoggedIn.set(true);
        getSettingsRequest(token).then((resp) => {
          console.log("getSettingsRequest response :>> ", resp);
        });
      } else {
        const error = response.error;
        if (Array.isArray(error) && error[0] === "Provided token is expired.") {
          removeFromLocalStorage("token");
        }
      }
    });
  }
};
