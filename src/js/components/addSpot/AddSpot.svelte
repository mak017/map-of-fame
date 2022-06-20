<script>
import { fade } from "svelte/transition";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import AddSpotSidebar from "./AddSpotSidebar.svelte";

export let isAddSpotMode;
export let isAddSpotSidebarVisible;
export let onAddSpotBtnClick;
export let newMarker;
export let onCancel;
</script>

{#if !isAddSpotMode}
  <button
    class="button button-add_spot"
    on:click={onAddSpotBtnClick}
    transition:fade={{ duration: 200 }}>Add Art</button>
{:else}
  <div class="main-top_right_wrapper">
    <ButtonPrimary on:click={onCancel} text="Cancel" className="add-spot" />
  </div>
{/if}
{#if !isAddSpotSidebarVisible && isAddSpotMode}
  <div class="drag-to-map" transition:fade={{ duration: 200 }}>
    Drag pin to map
  </div>
{/if}
{#if isAddSpotSidebarVisible}
  <AddSpotSidebar {onCancel} marker={newMarker} />
{/if}

<style>
.button-add_spot {
  position: absolute;
  right: 18px;
  bottom: 18px;
  padding: 9px 18px;
  background-color: var(--color-dark);
  color: var(--color-light);
  font-size: 14px;
  font-weight: 900;
  line-height: 1.2222222;
  text-transform: uppercase;
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
  white-space: nowrap;
}
:global(.leaflet-dragging .drag-to-map) {
  display: none;
}

@media (max-width: 767px) {
  .drag-to-map {
    top: 98px;
  }
}
</style>
