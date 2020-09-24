<script>
import { newMarkerIcon } from "../mapUtils/icons";
import AddSpotSidebar from "./AddSpotSidebar.svelte";

export let map;
export let isAddSpotMode;
export let toggleAddSpotMode;

let isAddSpotSidebarVisible = true;
let newMarker;

const toggleAddSpotSidebarVisible = (toggle) =>
  (isAddSpotSidebarVisible = toggle);

const onNewMarkerMoveEnd = () => {
  if (!isAddSpotSidebarVisible) {
    toggleAddSpotSidebarVisible(true);
  }
};

const onCancel = () => {
  toggleAddSpotMode(false);
  toggleAddSpotSidebarVisible(false);
  newMarker.removeEventListener("moveend", onNewMarkerMoveEnd);
  map.removeLayer(newMarker);
};

const onAddSpotBtnClick = () => {
  const center = map.getCenter();
  newMarker = L.marker(center, {
    draggable: true,
    icon: newMarkerIcon,
    zIndexOffset: 10000,
  });
  map.addLayer(newMarker);
  newMarker.addEventListener("moveend", onNewMarkerMoveEnd);
  toggleAddSpotMode(true);
};
</script>

<button class="button button-add_spot" on:click={onAddSpotBtnClick}>Add Spot</button>
{#if !isAddSpotSidebarVisible && isAddSpotMode}
  <div class="drag-to-map">Drag to Map</div>
{/if}
{#if isAddSpotSidebarVisible}
  <AddSpotSidebar {onCancel} />
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

.drag-to-map {
  position: absolute;
  top: 67px;
  left: 50%;
  padding: 11px 26px;
  transform: translateX(-50%);
  background-color: var(--color-light);
  color: var(--color-accent);
  font-size: 24px;
  font-weight: 900;
  line-height: 29px;
  text-transform: uppercase;
}
:global(.leaflet-dragging .drag-to-map) {
  display: none;
}
</style>
