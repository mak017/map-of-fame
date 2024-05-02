<script>
import { goto, node } from "@roxi/routify";

import {
  isShowOnMapMode,
  selectedUserProfileData,
  openedMarkerData,
  hasBrowseHistory,
} from "../../../../js/store.js";

import MarkerCard from "../../../../components/markerCard/MarkerCard.svelte";
import Modal from "../../../../components/Modal.svelte";
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
  noLogo
  autoMargin
  banner={{
    img: $openedMarkerData?.firm?.banner,
    url: $openedMarkerData?.firm?.bannerUrl,
  }}>
  <MarkerCard />
</Modal>
