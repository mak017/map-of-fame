<script>
import { fade } from "svelte/transition";
import { changePasswordReset } from "../../api/auth";
import { ERROR_MESSAGES } from "../../constants";
import { validatePassword } from "../../utils/commonUtils";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormPasswordInput from "./../elements/FormPasswordInput.svelte";

export let showResetPassword;
export let resetPasswordToken;

let password = "";
let errorMessage = "";
let isSubmitDisabled = "";

const validate = () => {
  if (!validatePassword(password)) {
    errorMessage = !password
      ? ERROR_MESSAGES.passwordEmpty
      : ERROR_MESSAGES.passwordInvalid;
    isSubmitDisabled = true;
    return;
  }
  errorMessage = "";
  isSubmitDisabled = false;
};

const handleSubmit = () => {
  validate();
  if (!errorMessage) {
    changePasswordReset(resetPasswordToken, password).then((response) => {
      console.log("response", response);
      const { status, data } = response;
      if (status && data) {
        showResetPassword(false);
      } else {
      }
    });
  }
};

const handleKeyDown = (event) => {
  const { code } = event.detail;
  isSubmitDisabled &&
    (code === "Enter" || code === "NumpadEnter") &&
    handleSubmit();
};
</script>

<form on:submit|preventDefault={handleSubmit} novalidate transition:fade>
  <FormPasswordInput
    placeholder="New Password"
    bind:value={password}
    errorText={errorMessage}
    on:blur={() => isSubmitDisabled && validate()}
    on:keyDown={handleKeyDown} />
  <div class="submit-wrapper">
    <ButtonPrimary
      text="Reset"
      type="submit"
      className="wide"
      isDisabled={isSubmitDisabled} />
  </div>
</form>

<style>
form {
  width: 100%;
  max-width: 530px;
  margin-bottom: auto;
}
.submit-wrapper {
  margin-top: 36px;
}
</style>
