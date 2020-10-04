<script>
import { ERROR_MESSAGES } from "../../constants";

import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormTextArea from "../elements/FormTextArea.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

export let onComplainToggle;

let cause = "";
let description = "";
let errors = { cause: "", description: "" };
let isSubmitDisabled = false;

const validate = () => {
  if (!cause || !description) {
    errors.cause = !cause ? ERROR_MESSAGES.genericEmpty : "";
    errors.description = !description ? ERROR_MESSAGES.genericEmpty : "";
    isSubmitDisabled = true;
  } else {
    errors.cause = "";
    errors.description = "";
    isSubmitDisabled = false;
  }
};

const handleSubmit = () => {
  validate();
  if (cause && description) {
    // send request
    onComplainToggle(false);
  }
};
</script>

<form on:submit|preventDefault={handleSubmit}>
  <FormTextInput
    placeholder="Cause"
    bind:value={cause}
    errorText={errors.cause}
    on:blur={() => isSubmitDisabled && validate()} />
  <FormTextArea
    placeholder="Description"
    bind:value={description}
    height={125}
    errorText={errors.description}
    on:blur={() => isSubmitDisabled && validate()} />
  <ButtonPrimary
    text="Send"
    type="submit"
    className="wide"
    isDisabled={isSubmitDisabled} />
</form>
