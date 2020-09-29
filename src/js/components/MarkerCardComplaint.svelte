<script>
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormTextArea from "./elements/FormTextArea.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";

export let onComplainToggle;

let cause = "";
let description = "";
let causeError = "";
let descriptionError = "";

const handleSubmit = () => {
  if (cause && description) {
    // send request
    causeError = "";
    descriptionError = "";
    onComplainToggle(false);
  } else {
    causeError = !cause ? "This is required field" : "";
    descriptionError = !description ? "This is required field" : "";
  }
};
</script>

<form on:submit|preventDefault={handleSubmit}>
  <FormTextInput
    placeholder="Cause"
    bind:value={cause}
    errorText={causeError} />
  <FormTextArea
    placeholder="Description"
    bind:value={description}
    height={125}
    errorText={descriptionError} />
  <ButtonPrimary text="Send" type="submit" className="wide" />
</form>
