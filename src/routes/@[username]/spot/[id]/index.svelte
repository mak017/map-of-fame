<script>
import { goto, url } from "@roxi/routify";

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
  <a href=${$url("/@:username", { username: $openedMarkerData.user.username })}>${
    $openedMarkerData.user?.artist?.name || $openedMarkerData.user?.crew?.name
  }</a>`;
};

let title = getTitle();

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
</Modal>
