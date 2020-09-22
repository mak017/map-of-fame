<script>
import { fly } from "svelte/transition";
import { newMarkerIcon } from "../mapUtils/icons";

export let map;

let isAddSpotSidebarVisible = false;
let isAddSpotDragMode = false;

const onNewMarkerMoveEnd = () => {
  if (!state.isAddSpotSidebarVisible) {
    state.isAddSpotSidebarVisible = true;
  }
};

const onAddSpotBtnClick = () => {
  const center = map.getCenter();
  const newMarker = L.marker(center, {
    draggable: true,
    icon: newMarkerIcon,
  }).addTo(map);
  newMarker.addEventListener("moveend", onNewMarkerMoveEnd);
  isAddSpotDragMode = true;
  window.document.body.classList.add("add-mode");
};
</script>

<button class="button button-add_spot" on:click={onAddSpotBtnClick}>Add Spot</button>
{#if isAddSpotSidebarVisible}
  <div class="add-spot" transition:fly={{ x: 150, duration: 300 }} />
{/if}

<style>
.button-add_spot {
  position: absolute;
  right: 18px;
  bottom: 18px;
  padding: 9px 18px;
  background-color: var(--color-dark);
  color: var(--color-light);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2222222;
}
.add-spot {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 150px;
  background-color: var(--color-light);
}
</style>
