<script>
import { Router, createRouter } from "@roxi/routify";

import {
  isInitialized,
  isLoading,
  resetPasswordToken,
  shouldShowResetPassword,
} from "./js/store.js";
import { getSettings, initApp, requestCategories } from "./js/init.js";
import routes from "../.routify/routes.default.js";
import { adjustVhProp, getResetPasswordToken } from "./js/utils/commonUtils.js";
import { changePasswordCheckToken } from "./js/api/auth.js";

const router = createRouter({ routes });

if (!$isInitialized) {
  adjustVhProp();

  initApp();

  let resetPasswordData = getResetPasswordToken();
  const initialLoader = document.getElementById("initial-loader");

  if (initialLoader) initialLoader.remove();

  if (resetPasswordData) {
    const { token, id } = resetPasswordData;
    isLoading.set(true);
    changePasswordCheckToken(token, id).then((response) => {
      const { success, result } = response;
      if (success && result) {
        getSettings();
        isLoading.set(false);
        shouldShowResetPassword.set(true);
        resetPasswordToken.set(result);
      } else {
        getSettings().then(() => {
          isLoading.set(false);
        });
      }
    });
  } else {
    isLoading.set(true);
    Promise.all([getSettings(), requestCategories()]).then(() => {
      isLoading.set(false);
    });
  }
}
</script>

<Router {router} />
