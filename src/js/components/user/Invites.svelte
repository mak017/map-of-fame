<script>
import { copyToClipboard } from "../../utils/commonUtils";
import { permalink } from "../../utils/mapUtils/permalink";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

export let invites;

const links = invites.map((invite) => permalink.getInviteUrl(invite.code));

const onButtonClick = (link) => copyToClipboard(link);
</script>

{#each links as invite}
  <div class="invite">
    <div class="input">
      <FormTextInput label=" " isReadOnly value={invite} invite={true} />
    </div>
    <div class="button">
      <ButtonPrimary
        type="button"
        text="Copy"
        className="wide"
        on:click={() => onButtonClick(invite)} />
    </div>
  </div>
{/each}

<style>
.invite {
  position: relative;
}

.button {
  position: absolute;
  top: 0;
  right: 0;
  width: 136px;
}
</style>
