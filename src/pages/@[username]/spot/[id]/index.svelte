<script>
import { goto } from "@roxi/routify";

import {
  isShowOnMapMode,
  selectedUserProfileData,
  shouldDisplayShowOnMap,
  selectedYear,
  openedMarkerData,
} from "../../../../js/store.js";
import { requestSpots } from "../../../../js/init.js";

import MarkerCard from "../../../../js/components/markerCard/MarkerCard.svelte";
import Modal from "../../../../js/components/Modal.svelte";
</script>

<Modal
  on:close={() => {
    openedMarkerData.set(null);
    if (!$isShowOnMapMode) {
      selectedUserProfileData.set({});
      $shouldDisplayShowOnMap && requestSpots($selectedYear);
    }
    $goto("/");
  }}
  withAd
  noLogo
  noTransition={!$openedMarkerData}
  banner={{
    img: $openedMarkerData?.firm?.banner,
    url: $openedMarkerData?.firm?.bannerUrl,
  }}>
  <MarkerCard />
</Modal>
