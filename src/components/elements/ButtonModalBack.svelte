<script>
import { createEventDispatcher } from "svelte";
import { fade } from "svelte/transition";

import ArrowLeftSvg from "./icons/ArrowLeftSvg.svelte";

export let withTransition = false;
export let editSpot = false;

const dispatch = createEventDispatcher();
</script>

<button
  type="button"
  class="button back"
  class:edit-spot={editSpot}
  on:click={() => dispatch("click")}
  transition:fade={{ duration: withTransition ? 200 : 0 }}
  ><ArrowLeftSvg /></button>

<style>
.back {
  position: absolute;
  top: calc(-6vh - 25px);
  left: 0;
  width: 20px;
  height: 20px;
  background: transparent;
}
.edit-spot {
  top: -64px;
}
</style>
