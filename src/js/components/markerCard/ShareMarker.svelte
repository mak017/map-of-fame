<script>
import { MAX_ZOOM } from "../../constants";
import { permalink } from "../../mapUtils/permalink";
import { copyToClipboard } from "../../utils";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

export let data;

const { coords, year, id } = data;

const link = permalink.getCustomUrl(coords, MAX_ZOOM, year, { marker: id });

const onButtonClick = () => copyToClipboard(link);
</script>

<div class="input">
  <FormTextInput label=" " isReadOnly value={link} />
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
