<script>
import { copyToClipboard } from "../../utils/commonUtils";
import { permalink } from "../../utils/mapUtils/permalink";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

export let invites;
export let username;

const data = invites.map((invite) => ({
  link: permalink.getInviteUrl(invite.code, username),
  isDisabled: !!invite.invitedUserId,
}));

const onButtonClick = (link) => copyToClipboard(link);
</script>

{#each data as invite}
  <div class="invite">
    <div class="input">
      <FormTextInput
        label=" "
        isReadOnly
        value={invite.link}
        invite={true}
        isDisabled={invite.isDisabled} />
    </div>
    <div class="button-wrapper">
      <ButtonPrimary
        type="button"
        text={!invite.isDisabled ? "Copy" : "Used"}
        className={`wide${invite.isDisabled ? " grey" : ""}`}
        on:click={() => onButtonClick(invite)} />
    </div>
  </div>
{/each}

<style>
.invite {
  position: relative;
}

.button-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  width: 136px;
}
</style>
