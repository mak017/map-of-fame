<script>
import { fade } from "svelte/transition";
import { changePasswordInit } from "../../api/auth";
import { ERROR_MESSAGES } from "../../constants";
import { validateEmail } from "../../utils/commonUtils";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "../elements/FormEmailInput.svelte";

export let setForgotPasswordEmailSent;
export let forgotPasswordEmailSent;
export let isMobileWidth;

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
  transition:fade={{ duration: 200 }}>
  {#if forgotPasswordEmailSent && !isMobileWidth}
    <p>Letter was sent to the email</p>
  {/if}
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
p {
  position: absolute;
  top: -20vh;
  left: 50%;
  width: 100%;
  transform: translateX(-50%);
  color: var(--color-accent);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-align: center;
  text-transform: uppercase;
}
.submit-wrapper {
  margin-top: 36px;
}

@media (max-height: 400px) {
  p {
    top: calc(-6vh - 70px);
  }
}
</style>
