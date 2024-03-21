<script>
import { loadFromLocalStorage } from "../../js/utils/commonUtils";

import CustomSelect from "../elements/CustomSelect.svelte";
import FormTextArea from "../elements/FormTextArea.svelte";

import { ERROR_MESSAGES, statusesOrdered } from "../../js/constants";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import { requestChangeStatus } from "../../js/api/spot";

export let spotId;
export let close;

const token = loadFromLocalStorage("token") || null;
let spotStatus;
let description = "";
let error = "";
let isSubmitDisabled = false;

const handleSubmit = async () => {
  error = !spotStatus ? ERROR_MESSAGES.statusEmpty : "";

  const { success, result, errors } = await requestChangeStatus(token, spotId, {
    spotStatus: spotStatus.value,
    description,
  });

  if (success && result) {
    close();
  }

  if (errors) {
    error = errors.spotStatus ?? "Unknown error";
  }
};

const handleStatusSelect = () => {
  if (isSubmitDisabled || error) {
    error = "";
  }
};
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="select-wrapper">
    <CustomSelect
      items={statusesOrdered}
      bind:selectedValue={spotStatus}
      on:select={handleStatusSelect}
      placeholder="Select status" />
    {#if error}<span class="error">{error}</span>{/if}
  </div>
  <FormTextArea
    placeholder="Description"
    bind:value={description}
    height={125} />
  <ButtonPrimary
    text="Send"
    type="submit"
    className="wide"
    isDisabled={isSubmitDisabled} />
</form>

<style>
.select-wrapper {
  position: relative;
  margin-bottom: 26px;
}

.error {
  position: absolute;
  color: var(--color-error);
  font-size: 13px;
}
</style>
