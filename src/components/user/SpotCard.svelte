<script>
import { url } from "@roxi/routify";
import { fade } from "svelte/transition";

import { userData } from "../../js/store";

import PencilSvg from "../elements/icons/PencilSvg.svelte";
import TrashSvg from "../elements/icons/TrashSvg.svelte";

export let spot;
export let isEditable;
export let onSpotClick;
export let onEdit;
export let onDelete;
</script>

<a
  href={!isEditable
    ? $url("/@:username/spot/:id", {
        username: spot.user.username,
        id: spot.id,
      })
    : undefined}
  class="spot-card"
  class:isHidden={!spot.showInProfile || spot.showInProfile === "0"}
  class:isFullyHidden={isEditable && $userData.isSpotsHidden}
  role="button"
  on:click|preventDefault={() => !isEditable && onSpotClick(spot)}
  data-spot-id={spot.id}>
  <img
    loading="lazy"
    src={spot.thumbnail}
    alt={spot.title || `${spot.username}'s art`}
    in:fade|global={{ duration: 200 }} />
  {#if isEditable}
    <div class="overlay">
      <a
        href={$url("/@:username/spot/:id", {
          username: spot.user.username,
          id: spot.id,
        })}
        class="button view"
        on:click|preventDefault={() => onSpotClick(spot)}>👁</a>
      <button type="button" class="button edit" on:click={() => onEdit(spot)}
        ><PencilSvg /></button>
      <button
        type="button"
        class="button delete"
        on:click={() => onDelete(spot)}><TrashSvg /></button>
    </div>
  {/if}
</a>

<style lang="scss">
.spot-card {
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  background-color: var(--color-accent-light);
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
  }

  .overlay {
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    transform: translateY(-100%);
    border-radius: inherit;
    opacity: 0;
    background: rgba($color: #000, $alpha: 0.45);
  }

  &.isHidden {
    &::after {
      content: "🙈";
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      align-items: center;
      justify-content: center;
      transition:
        opacity 0.3s,
        visibility 0.3s;
      background: rgba($color: #432fd8, $alpha: 0.4);
      font-size: 64px;
    }
  }

  &.isFullyHidden {
    &::after {
      content: "👮‍♂️🙈👮‍♂️";
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      align-items: center;
      justify-content: center;
      transition:
        opacity 0.3s,
        visibility 0.3s;
      background: rgba($color: #432fd8, $alpha: 0.4);
      font-size: 48px;
    }
  }

  &:hover {
    &::after {
      opacity: 0;
      visibility: hidden;
    }
    .overlay {
      opacity: 1;
      transform: translateY(0);
      transition:
        transform 0.05s,
        opacity 0.25s 0.05s;
    }
  }
}

.view,
.edit,
.delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  margin: 12px;
  background-color: var(--color-accent);
  background-repeat: no-repeat;
  background-position: 50% 50%;
}

.view {
  color: var(--color-light);
  text-decoration: none;
  font-size: 32px;
}
</style>
