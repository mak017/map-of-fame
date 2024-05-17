<script>
import { fade } from "svelte/transition";

import { isMenuOpen, shouldShowAddSpot } from "../../js/store";

import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import AddSpotSidebar from "./AddSpotSidebar.svelte";

export let isAddSpotSidebarVisible;
export let newMarker;
export let onCancel;

const handleAddSpotClick = () => {
  shouldShowAddSpot.set(true);
  isMenuOpen.set(false);
};
</script>

{#if !$shouldShowAddSpot}
  <button
    class="button button-add_spot"
    on:click={handleAddSpotClick}
    transition:fade|global={{ duration: 200 }}>Add Art</button>
{:else}
  <div class="main-top_right_wrapper">
    <ButtonPrimary
      on:click={() => shouldShowAddSpot.set(false)}
      text="Cancel"
      className="add-spot" />
  </div>
{/if}
{#if !isAddSpotSidebarVisible && $shouldShowAddSpot}
  <div class="drag-to-map" transition:fade|global={{ duration: 200 }}>
    <span>Drag & drop pin</span>
  </div>
{/if}
{#if isAddSpotSidebarVisible}
  <AddSpotSidebar {onCancel} marker={newMarker} />
{/if}

<style lang="scss">
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
  font-weight: 800;
  line-height: 1.2222222;
  text-transform: uppercase;
}

.drag-to-map {
  display: flex;
  position: absolute;
  top: 67px;
  left: 50%;
  align-items: center;
  padding: 11px 5px;
  transform: translateX(-50%);
  background-color: var(--color-light);
  color: var(--color-accent);
  font-size: 24px;
  font-weight: 800;
  line-height: 29px;
  text-transform: uppercase;
  white-space: nowrap;

  &::before {
    content: "";
    width: 29px;
    height: 29px;
    background: url(../../images/drag.svg) 50% 50% / auto no-repeat;
  }

  span {
    padding: 0 8px;
  }

  &::after {
    content: "";
    width: 19px;
    height: 28px;
    background: url(../../images/pin.svg) 50% 50% / auto no-repeat;
  }
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
    top: 115px;
  }
}
</style>
