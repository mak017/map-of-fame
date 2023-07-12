<script>
import {
  isShowOnMapMode,
  selectedUserProfileData,
  openedMarkerData,
} from "../../../../js/store.js";

import MarkerCard from "../../../../js/components/markerCard/MarkerCard.svelte";
import Modal from "../../../../js/components/Modal.svelte";
</script>

<Modal
  id="marker-card-modal"
  on:close={() => {
    openedMarkerData.set(null);
    if (!$isShowOnMapMode) {
      selectedUserProfileData.set({});
    }
    window.history.back();
  }}
  withAd
  noLogo
  banner={{
    img: $openedMarkerData?.firm?.banner,
    url: $openedMarkerData?.firm?.bannerUrl,
  }}>
  <MarkerCard />
</Modal>
