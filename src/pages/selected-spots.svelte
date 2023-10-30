<script>
import { goto } from "@roxi/routify";

import {
  map,
  areaSelection,
  isAreaSelectionActive,
  areaSpots,
} from "./../js/store.js";

import SelectedSpots from "./../js/components/SelectedSpots.svelte";
import Modal from "../js/components/Modal.svelte";

import { MIN_ZOOM } from "../js/constants.js";

const toggleAreaSelectionMode = (toggle) => {
  isAreaSelectionActive.set(toggle);

  if (toggle) {
    $map.setMinZoom(15);
    $areaSelection.activate();
    $goto("/");
    return;
  }

  $map.setMinZoom(MIN_ZOOM);
  $map.dragging.enable();
  $areaSelection.deactivate();
  areaSpots.set(null);
};
</script>

<Modal
  id="selected-spots-modal"
  noLogo
  on:close={() => {
    $goto("/");
  }}>
  <SelectedSpots />
</Modal>
