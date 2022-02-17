<script>
import { fade } from "svelte/transition";
import { loginRequest } from "../../api/auth.js";
import { AUTH_MODALS, ERROR_MESSAGES } from "../../constants.js";
import { isLoggedIn, settings, userData } from "../../store.js";
import { saveToLocalStorage, validateEmail } from "../../utils/commonUtils.js";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "../elements/FormEmailInput.svelte";
import FormPasswordInput from "../elements/FormPasswordInput.svelte";

export let showAuth;
export let changeCurrentModal;

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
          showAuth(false);
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
    <button
      type="button"
      on:click={() => changeCurrentModal(AUTH_MODALS.forgotPassword)}
      >Forgot password</button>
  </div>
  <ButtonPrimary
    text="Login"
    type="submit"
    className="wide"
    isDisabled={isDisabledSubmit} />
  <div class="switch-to-sign-up">
    <span>Don't have an account?</span>
    <button
      type="button"
      on:click={() =>
        changeCurrentModal(
          $settings.needInviteToRegister
            ? AUTH_MODALS.preRegistration
            : AUTH_MODALS.registration
        )}>Sign up</button>
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
  button {
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.22;
    cursor: pointer;
  }
}
.switch-to-sign-up {
  margin-top: 36px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.22;
  text-align: center;
  button {
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    cursor: pointer;
  }
}
</style>
