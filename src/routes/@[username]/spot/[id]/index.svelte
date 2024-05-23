<script>
import { goto, params, url } from "@roxi/routify";

import {
  isShowOnMapMode,
  selectedUserProfileData,
  openedMarkerData,
  hasBrowseHistory,
  profileState,
  userData,
} from "../../../../js/store.js";

import MarkerCard from "../../../../components/markerCard/MarkerCard.svelte";
import Modal from "../../../../components/Modal.svelte";
import PencilSvg from "../../../../components/elements/icons/PencilSvg.svelte";
import Popup from "../../../../components/Popup.svelte";
import DeleteSpot from "../../../../components/user/DeleteSpot.svelte";
import TrashSvg from "../../../../components/elements/icons/TrashSvg.svelte";

const getTitle = () => {
  if (!$openedMarkerData) return "";

  return `<div class="posted-by">Posted by:</div>
  <a href=${$url("/@:username", { username: $openedMarkerData.user.username })}>${
    $openedMarkerData.user?.artist?.name || $openedMarkerData.user?.crew?.name
  }</a>`;
};

let title = getTitle();
let showDeletePopup = false;
let { username, id } = $params;

const toggleDeletePopup = (toggle) => (showDeletePopup = toggle);

$: if ($openedMarkerData) title = getTitle();
</script>

<Modal
  id="marker-card-modal"
  on:close={() => {
    openedMarkerData.set(null);
    if (!$isShowOnMapMode) {
      selectedUserProfileData.set({});
    }

    $hasBrowseHistory ? window.history.back() : $goto("/");
  }}
  withAd
  alwaysOnTop
  {title}
  noLogo
  noPaddingTop
  hideTitleOnScroll
  twoLineTitle
  banner={{
    img: $openedMarkerData?.firm?.banner,
    url: $openedMarkerData?.firm?.bannerUrl,
  }}>
  <MarkerCard />
  <div slot="left-buttons" class="left-buttons-wrapper">
    {#if username === $userData.username}
      <a
        href={$url("/@:username/spot/:id/edit", { username: username, id })}
        class="button edit"><PencilSvg fill="var(--color-dark)" /></a>
      <button
        type="button"
        class="button delete"
        on:click={() => toggleDeletePopup(true)}>
        <TrashSvg fill="var(--color-dark)" />
      </button>
    {/if}
  </div>
</Modal>

{#if showDeletePopup}
  <Popup title="Delete art?" on:close={() => toggleDeletePopup(false)}>
    <DeleteSpot
      close={() => toggleDeletePopup(false)}
      currentSpot={$openedMarkerData}
      onSubmit={() => {
        profileState.reset();
        $hasBrowseHistory ? window.history.back() : $goto("/");
      }} />
  </Popup>
{/if}

<style lang="scss">
.left-buttons-wrapper {
  display: flex;
}

.edit,
.delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color-accent-light);
  transition: 0.2s;

  &:hover {
    background-color: var(--color-accent-light-hover);
  }
}
</style>
