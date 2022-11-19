<script>
import { Router } from "@roxi/routify";
import { routes } from "../../.routify/routes";

import { changePasswordCheckToken } from "./api/auth";
import { getSettings, initApp, requestCategories } from "./init";
import { isLoading, shouldShowResetPassword } from "./store";
import { adjustVhProp, getResetPasswordToken } from "./utils/commonUtils";

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
      getSettings();
      isLoading.set(false);
      shouldShowResetPassword.set(true);
      resetPasswordToken = result;
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
</script>

<Router {routes} />
