<script>
import { feedbackOnSpot } from "../../js/api/spot";
import { userData } from "../../js/store";

import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormTextArea from "../elements/FormTextArea.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

import { ERROR_MESSAGES } from "../../js/constants";

export let onComplainToggle;
export let spotId;

let cause = "";
let description = "";
let errors = { cause: "", description: "" };
let isSubmitDisabled = false;
let userId = $userData.id;

$: isSubmitDisabled = !!errors.cause || !!errors.description;

const validate = () => {
  if (!cause || !description) {
    errors.cause = !cause ? ERROR_MESSAGES.genericEmpty : "";
    errors.description = !description ? ERROR_MESSAGES.genericEmpty : "";
  } else {
    errors.cause = "";
    errors.description = "";
  }
};

const handleSubmit = () => {
  validate();
  if (cause && description) {
    feedbackOnSpot(spotId, {
      userId,
      message: description,
      reason: cause,
    }).then((response) => {
      const { success, result } = response;
      if (success && result) {
        onComplainToggle(false);
      }
    });
  }
};

const handleInputChange = (input) => {
  if (isSubmitDisabled || errors.cause || errors.description) {
    errors[input] = "";
  }
};
</script>

<form on:submit|preventDefault={handleSubmit}>
  <FormTextInput
    placeholder="Cause"
    bind:value={cause}
    errorText={errors.cause}
    on:input={() => handleInputChange("cause")}
    extraMargin />
  <FormTextArea
    placeholder="Description"
    bind:value={description}
    height={125}
    errorText={errors.description}
    on:input={() => handleInputChange("description")} />
  <ButtonPrimary
    text="Send"
    type="submit"
    className="wide"
    isDisabled={isSubmitDisabled} />
</form>
