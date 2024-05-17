<script>
import { createEventDispatcher } from "svelte";
import { scale, fade } from "svelte/transition";

import CloseCrossSvg from "./elements/icons/CloseCrossSvg.svelte";

export let title = "";

const dispatch = createEventDispatcher();
const close = () => dispatch("close");

const handleKeyDown = (e) => {
  if (e.key === "Escape") {
    close();
    return;
  }
};
</script>

<svelte:window on:keydown|stopPropagation={handleKeyDown} />

<div
  class="popup-background"
  on:click={close}
  transition:fade|global={{ duration: 200 }}
  on:keydown|stopPropagation={handleKeyDown}
  tabindex="-1"
  role="button" />
<div
  class="popup"
  role="presentation"
  transition:scale|global={{ duration: 200 }}
  on:keydown|stopPropagation={handleKeyDown}
  tabindex="-1">
  <button class="close" on:click={close}><CloseCrossSvg /></button>
  {#if title}
    <h3>{title}</h3>
  {/if}
  <slot />
</div>

<style>
.popup-background {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  opacity: 0.45;
  background: var(--color-dark);
}
.popup {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 1;
  width: 100%;
  max-width: 530px;
  max-height: 100vh;
  overflow: auto;
  transform: translate(-50%, -50%);
  padding: 6px 36px 32px;
  border-radius: 2px;
  background: var(--color-light);
}
.close {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  padding: 12px;
  border: 0;
  background: none;
  cursor: pointer;
}
h3 {
  margin-bottom: 35px;
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.22;
  text-align: center;
  text-transform: uppercase;
}
</style>
