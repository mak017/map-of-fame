<script>
import { fade } from "svelte/transition";

import { shouldShowAddSpot } from "../../store";

import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import AddSpotSidebar from "./AddSpotSidebar.svelte";

export let isAddSpotSidebarVisible;
export let newMarker;
export let onCancel;
</script>

{#if !$shouldShowAddSpot}
  <button
    class="button button-add_spot"
    on:click={() => shouldShowAddSpot.set(true)}
    transition:fade={{ duration: 200 }}>Add Art</button>
{:else}
  <div class="main-top_right_wrapper">
    <ButtonPrimary
      on:click={() => shouldShowAddSpot.set(false)}
      text="Cancel"
      className="add-spot" />
  </div>
{/if}
{#if !isAddSpotSidebarVisible && $shouldShowAddSpot}
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
  bottom: 18px;
  left: 50%;
  min-width: 122px;
  min-height: 40px;
  padding: 11px 26px;
  transform: translateX(-50%);
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
  .button-add_spot {
    right: 18px;
    left: auto;
    transform: none;
  }

  .drag-to-map {
    top: 98px;
  }
}
</style>
