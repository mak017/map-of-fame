<script>
import { fade } from "svelte/transition";
import { changePasswordReset } from "../../api/auth";
import { ERROR_MESSAGES } from "../../constants";
import { isLoggedIn, userData } from "../../store";
import { saveToLocalStorage, validatePassword } from "../../utils/commonUtils";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormPasswordInput from "./../elements/FormPasswordInput.svelte";

export let showResetPassword;
export let resetPasswordToken;

let password = "";
let errorMessage = "";
let isSubmitDisabled = false;
let isInProgress = false;

$: isSubmitDisabled = !!errorMessage || isInProgress;

const validate = () => {
  if (!validatePassword(password)) {
    errorMessage = !password
      ? ERROR_MESSAGES.passwordEmpty
      : ERROR_MESSAGES.passwordInvalid;
    return;
  }
  errorMessage = "";
};

const handleSubmit = () => {
  validate();
  if (!errorMessage) {
    isInProgress = true;
    changePasswordReset(resetPasswordToken.token, password).then((response) => {
      const { success, result } = response;
      isInProgress = false;
      if (success && result) {
        userData.set(resetPasswordToken);
        isLoggedIn.set(true);
        saveToLocalStorage("token", resetPasswordToken.token);
        showResetPassword(false);
      } else {
        errorMessage = "Something went wrong";
      }
    });
  }
};

const handleInputChange = () => {
  if (isSubmitDisabled || errorMessage) {
    errorMessage = "";
    // isSubmitDisabled = false;
  }
};
</script>

<form
  on:submit|preventDefault={handleSubmit}
  novalidate
  transition:fade={{ duration: 200 }}>
  <FormPasswordInput
    placeholder="New Password"
    bind:value={password}
    errorText={errorMessage}
    on:blur={() => isSubmitDisabled && validate()}
    on:input={handleInputChange} />
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
