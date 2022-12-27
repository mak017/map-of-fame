<script>
import {
  isInitialized,
  isLoading,
  settings,
  shouldShowResetPassword,
} from "./store.js";
import { Router } from "@roxi/routify";

import { routes } from "../../.routify/routes";
import { adjustVhProp, getResetPasswordToken } from "./utils/commonUtils.js";
import { getSettings, initApp, requestCategories } from "./init.js";
import { changePasswordCheckToken } from "./api/auth.js";
import { onMount } from "svelte";

let count = 0;

onMount(() => {
  count += 1;
  // console.log("count :>> ", count);
  // console.log("$isInitialized :>> ", $isInitialized);
  // console.log("$settings :>> ", $settings);
  // console.log("window.__appLoaded :>> ", window.__appLoaded);
  if (!window.__appLoaded) {
    adjustVhProp();

    initApp();

    let resetPasswordToken = getResetPasswordToken();
    const initialLoader = document.getElementById("initial-loader");

    if (initialLoader) initialLoader.remove();

    if (resetPasswordToken) {
      const { token, id } = resetPasswordToken;
      isLoading.set(true);
      changePasswordCheckToken(token, id).then((response) => {
        const { success, result } = response;
        if (success && result) {
          getSettings().then(() => {
            isInitialized.set(true);
            window.__appLoaded = true;
          });
          isLoading.set(false);
          shouldShowResetPassword.set(true);
          resetPasswordToken = result;
        } else {
          getSettings().then(() => {
            isLoading.set(false);
            isInitialized.set(true);
            window.__appLoaded = true;
          });
        }
      });
    } else {
      isLoading.set(true);
      Promise.all([getSettings(), requestCategories()]).then(() => {
        isLoading.set(false);
        isInitialized.set(true);
        window.__appLoaded = true;
        console.log(">>> init", $isInitialized);
      });
    }
  }
});
</script>

<Router {routes} />
