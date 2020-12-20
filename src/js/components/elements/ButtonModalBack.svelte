<script>
import { createEventDispatcher } from "svelte";
import { fade } from "svelte/transition";

export let withTransition = false;
export let editSpot = false;

const dispatch = createEventDispatcher();
</script>

<button
  type="button"
  class="back"
  class:edit-spot={editSpot}
  on:click={() => dispatch('click')}
  transition:fade|local={{ duration: withTransition ? 400 : 0 }} />

<style>
.back {
  position: absolute;
  top: calc(-6vh - 25px);
  left: 0;
  width: 20px;
  height: 20px;
  border: 0;
  background: url(../../../images/back.svg) 50% 50% / auto no-repeat;
  cursor: pointer;
}
.edit-spot {
  top: -64px;
}
</style>
