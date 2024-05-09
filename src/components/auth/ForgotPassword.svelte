<script>
import { fade } from "svelte/transition";

import { changePasswordInit } from "../../js/api/auth";
import { validateEmail } from "../../js/utils/commonUtils";

import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "../elements/FormEmailInput.svelte";

import { ERROR_MESSAGES } from "../../js/constants";

export let setForgotPasswordEmailSent;
export let forgotPasswordEmailSent;

let email = "";
let errorMessage = "";
let isDisabledSubmit = false;
let isInProgress = false;

$: isDisabledSubmit = !!errorMessage || isInProgress;

const validate = () => {
  const isValidEmail = validateEmail(email);
  if (!isValidEmail) {
    if (!email) errorMessage = ERROR_MESSAGES.emailEmpty;
    else if (!isValidEmail) errorMessage = ERROR_MESSAGES.emailInvalid;
    else errorMessage = "";
    return;
  }
  errorMessage = "";
};

const handleSubmit = () => {
  validate();
  if (!errorMessage) {
    isInProgress = true;
    changePasswordInit(email)
      .then((response) => {
        const { success, result, errors } = response;
        isInProgress = false;
        if (success && result) {
          setForgotPasswordEmailSent(true);
        } else {
          errorMessage = errors?.email ?? "Something went wrong";
        }
      })
      .catch((e) => {
        console.error(e);
        isInProgress = false;
        errorMessage = "Something went wrong";
      });
  }
};

const handleInputChange = () => {
  if (isDisabledSubmit || errorMessage) {
    errorMessage = "";
    isDisabledSubmit = false;
  }
};
</script>

<form
  on:submit|preventDefault={handleSubmit}
  novalidate
  transition:fade|global={{ duration: 200 }}>
  <FormEmailInput
    placeholder="Email"
    bind:value={email}
    errorText={errorMessage}
    on:input={handleInputChange} />
  <div class="submit-wrapper">
    <ButtonPrimary
      text="Send"
      type="submit"
      className="wide"
      isDisabled={isDisabledSubmit || forgotPasswordEmailSent} />
  </div>
</form>

<style>
form {
  position: relative;
  width: 100%;
  max-width: 530px;
  margin-bottom: auto;
}

.submit-wrapper {
  margin-top: 36px;
}
</style>
