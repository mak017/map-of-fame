<script>
import { fade } from "svelte/transition";
import { ERROR_MESSAGES } from "../../constants";
import { validatePassword } from "../../utils/commonUtils";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormPasswordInput from "./../elements/FormPasswordInput.svelte";

export let showResetPassword;

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
    // send request
    showResetPassword(false);
  }
};
</script>

<form on:submit|preventDefault={handleSubmit} novalidate transition:fade>
  <FormPasswordInput
    placeholder="New Password"
    bind:value={password}
    errorText={errorMessage}
    on:blur={() => isSubmitDisabled && validate()} />
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
