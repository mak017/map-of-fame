<script>
import { copyToClipboard } from "../../js/utils/commonUtils";

import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

const { href } = window.location;

const onButtonClick = () => copyToClipboard(href);
</script>

<div class="input">
  <FormTextInput label=" " isReadOnly value={href} />
</div>
<ButtonPrimary
  type="button"
  text="Copy Link"
  className="wide"
  on:click={onButtonClick} />

<style>
.input {
  margin-bottom: 24px;
}
</style>
