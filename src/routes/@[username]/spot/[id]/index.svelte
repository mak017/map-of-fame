<script>
import { goto } from "@roxi/routify";

import {
  isShowOnMapMode,
  selectedUserProfileData,
  openedMarkerData,
  hasBrowseHistory,
} from "../../../../js/store.js";

import MarkerCard from "../../../../components/markerCard/MarkerCard.svelte";
import Modal from "../../../../components/Modal.svelte";

const getTitle = () => {
  if (!$openedMarkerData) return "";

  return `<div class="posted-by">Posted by:</div>
  <div>${
    $openedMarkerData.user?.artist?.name || $openedMarkerData.user?.crew?.name
  }</div>`;
};
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
  title={getTitle()}
  noLogo
  hideTitleOnScroll
  banner={{
    img: $openedMarkerData?.firm?.banner,
    url: $openedMarkerData?.firm?.bannerUrl,
  }}>
  <MarkerCard />
</Modal>
