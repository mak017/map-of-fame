<script>
import { fly } from "svelte/transition";
import { url } from "@roxi/routify";

import { isMenuOpen, profileState, userData } from "../store";
import { isMobile } from "../utils/commonUtils";

import CloseCrossSvg from "./elements/icons/CloseCrossSvg.svelte";
import Popup from "./Popup.svelte";
import Invites from "./user/Invites.svelte";

let showInvitesPopup = false;
let unusedInvitesCount = 0;

const toggleInvitesPopup = (toggle) => (showInvitesPopup = toggle);

const handleHideAllClick = () => {
  editUser(token, $userData.id, {
    isSpotsHidden: Number(!$userData.isSpotsHidden),
  }).then((response) => {
    const { success, result } = response;
    if (success && result) {
      $userData.isSpotsHidden = result.isSpotsHidden === "1";
    }
  });
};

$: unusedInvitesCount = $profileState.invites.reduce(
  (accumulator, invite) =>
    !invite.invitedUserId ? accumulator + 1 : accumulator,
  0,
);
</script>

<div
  class="menu"
  transition:fly={{ x: !isMobile() ? 364 : window.innerWidth, duration: 300 }}>
  <button class="close" on:click={() => isMenuOpen.set(false)}>
    <CloseCrossSvg />
  </button>
  <div class="links">
    <a href={$url("/@:username", { username: $userData.username })}>Profile</a>
    {#if $profileState.invites.length}
      <div class="invites">
        <button
          type="button"
          class="button"
          on:click={() => toggleInvitesPopup(true)}>🖖 Invites</button>
        for your friends
      </div>
    {/if}
    <div class="hide-all">
      <button
        type="button"
        class="button hide-button"
        on:click={handleHideAllClick}
        >{$userData.isSpotsHidden ? "👀 Show" : "🚨 Hide"}</button>
      all your photos
    </div>
  </div>
</div>

{#if showInvitesPopup}
  <Popup
    title={`Invites ${unusedInvitesCount}/${$profileState.invites.length} 👽`}
    on:close={() => toggleInvitesPopup(false)}>
    <Invites
      close={() => toggleInvitesPopup(false)}
      invites={$profileState.invites}
      username={$userData.username} />
  </Popup>
{/if}

<style>
.menu {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  flex-direction: column;
  width: 364px;
  padding: 36px 0 16px;
  background-color: var(--color-light);
}

.close {
  display: block;
  position: absolute;
  top: 28px;
  right: 14px;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

@media (max-width: 767px) {
  .menu {
    width: 100%;
    padding-bottom: 0;
  }
}
</style>
