<script>
import { fade } from "svelte/transition";
import { AUTH_MODALS, ERROR_MESSAGES } from "../../constants";
import { validateEmail } from "../../utils";
import ButtonModalBack from "../elements/ButtonModalBack.svelte";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "../elements/FormEmailInput.svelte";

export let changeCurrentModal;
export let setForgotPasswordEmailSent;
export let forgotPasswordEmailSent;
export let isMobileWidth;

let email = "";
let errorMessage = "";
let isDisabledSubmit = false;

const validate = () => {
  const isValidEmail = validateEmail(email);
  if (!isValidEmail) {
    if (!email) errorMessage = ERROR_MESSAGES.emailEmpty;
    else if (!isValidEmail) errorMessage = ERROR_MESSAGES.emailInvalid;
    else errorMessage = "";
    isDisabledSubmit = true;
    return;
  }
  errorMessage = "";
  isDisabledSubmit = false;
};

const handleSubmit = () => {
  validate();
  if (!errorMessage) {
    // send request
    setForgotPasswordEmailSent(true);
  }
};

const handleBackClick = () => {
  changeCurrentModal(AUTH_MODALS.login);
};
</script>

<form on:submit|preventDefault={handleSubmit} novalidate transition:fade>
  {#if forgotPasswordEmailSent && !isMobileWidth}
    <p>Letter was sent to the email</p>
  {/if}
  <ButtonModalBack on:click={handleBackClick} />
  <FormEmailInput
    placeholder="Email"
    bind:value={email}
    errorText={errorMessage}
    on:blur={() => isDisabledSubmit && validate()} />
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
