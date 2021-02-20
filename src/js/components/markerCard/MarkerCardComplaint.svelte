<script>
import { onDestroy } from "svelte";
import { feedbackOnSpot } from "../../api/spot";
import { ERROR_MESSAGES } from "../../constants";
import { userData } from "../../store";
import { loadFromLocalStorage } from "../../utils/commonUtils";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormTextArea from "../elements/FormTextArea.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

export let onComplainToggle;
export let spotId;

let cause = "";
let description = "";
let errors = { cause: "", description: "" };
let isSubmitDisabled = false;
let userId;

const unsubscribeUserData = userData.subscribe((value) => (userId = value.id));

onDestroy(() => {
  unsubscribeUserData();
});

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
    const token = loadFromLocalStorage("token") || null;
    feedbackOnSpot(token, spotId, {
      userId,
      message: description,
      reason: cause,
    }).then((response) => {
      const { status, data } = response;
      if (status && data) {
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
