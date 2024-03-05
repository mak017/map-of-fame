<script>
import { fade } from "svelte/transition";
import { goto, url } from "@roxi/routify";

import { loginRequest } from "../../api/auth.js";
import { isLoggedIn, settings, userData, withNewbies } from "../../store.js";
import { saveToLocalStorage, validateEmail } from "../../utils/commonUtils.js";

import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "../elements/FormEmailInput.svelte";
import FormPasswordInput from "../elements/FormPasswordInput.svelte";

import { ERROR_MESSAGES } from "../../constants.js";

let email = "";
let password = "";
let errors = { email: "", password: "" };
let isDisabledSubmit = false;
let isInProgress = false;

$: isDisabledSubmit = !!errors.email || !!errors.password || isInProgress;

const validate = () => {
  const isValidEmail = validateEmail(email);
  if (!isValidEmail || !password) {
    if (!email) errors.email = ERROR_MESSAGES.emailEmpty;
    else if (!isValidEmail) errors.email = ERROR_MESSAGES.emailInvalid;
    else errors.email = "";
    errors.password = !password ? ERROR_MESSAGES.passwordEmpty : "";
    return;
  }
  errors.email = "";
  errors.password = "";
};

const handleSubmit = () => {
  validate();
  if (!errors.email && !errors.password) {
    isInProgress = true;
    loginRequest(email, password)
      .then((response) => {
        const { success, result } = response || {};
        if (success && result) {
          userData.set(result);
          isLoggedIn.set(true);
          saveToLocalStorage("token", result.token);
          withNewbies.set(result.isNewbie);

          $goto("/");
        } else {
          isInProgress = false;
          if (response.errors?.email) {
            errors.email = response.errors.email;
          }
          if (response.errors?.login) {
            errors.email = response.errors.login;
          }
          if (Array.isArray(response.errors)) {
            errors.password = response.errors[0];
          }
        }
      })
      .catch((e) => {
        console.error(e);
        isInProgress = false;
        isLoggedIn.set(false);
        errors.password = "Something went wrong";
      });
  }
};

const handleInputChange = (input) => {
  if (isDisabledSubmit || errors.password || errors.email) {
    if (errors.email) {
      errors = { email: "", password: "" };
      isDisabledSubmit = false;
      return;
    }

    errors[input] = "";
    isDisabledSubmit = !!(errors.password || errors.email);
  }
};
</script>

<form
  on:submit|preventDefault={handleSubmit}
  novalidate
  transition:fade={{ duration: 200 }}>
  <FormEmailInput
    placeholder="Email"
    bind:value={email}
    errorText={errors.email}
    on:input={() => handleInputChange("email")} />
  <FormPasswordInput
    placeholder="Password"
    bind:value={password}
    errorText={errors.password}
    on:input={() => handleInputChange("password")} />
  <div class="forgot-password">
    <a href={$url("/forgot-password")}>Forgot password</a>
  </div>
  <ButtonPrimary
    text="Login"
    type="submit"
    className="wide"
    isDisabled={isDisabledSubmit} />
  <div class="switch-to-sign-up">
    <span>Don't have an account?</span>
    <a
      href={$url(
        $settings.needInviteToRegister ? "/begistration" : "/registration",
      )}>Sign up</a>
  </div>
</form>

<style lang="scss">
form {
  width: 100%;
  max-width: 530px;
  margin-bottom: auto;
}
.forgot-password {
  margin-bottom: 36px;
  text-align: right;
  a {
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-size: 14px;
    font-weight: 900;
    line-height: 1.22;
    text-decoration: none;
    text-transform: uppercase;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}
.switch-to-sign-up {
  margin-top: 36px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.22;
  text-align: center;
  a {
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
