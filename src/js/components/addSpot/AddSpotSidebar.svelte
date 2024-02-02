<script>
import { fly } from "svelte/transition";

import { shouldShowAddSpot } from "../../store";
import { isMobile } from "../../utils/commonUtils";

import CloseCrossSvg from "../elements/icons/CloseCrossSvg.svelte";
import SpotForm from "../SpotForm.svelte";

export let marker;
export let onCancel;
</script>

<div
  class="add-spot"
  transition:fly={{ x: !isMobile() ? 364 : window.innerWidth, duration: 300 }}>
  <h2>Add Art</h2>
  {#if isMobile()}
    <button class="close-mob" on:click={() => shouldShowAddSpot.set(false)}>
      <CloseCrossSvg />
    </button>
  {/if}
  <div class="form-wrapper">
    <SpotForm {marker} {onCancel} />
  </div>
</div>

<style lang="scss">
.add-spot {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  flex-direction: column;
  width: 364px;
  padding: 36px 0 16px;
  background-color: var(--color-light);
}

h2 {
  display: flex;
  position: absolute;
  top: 0;
  right: 100%;
  align-items: center;
  justify-content: center;
  width: 208px;
  height: 100px;
  padding: 0 20px;
  background: var(--color-lotion);
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
}

.form-wrapper {
  padding: 0 20px;
  overflow-x: hidden;
  overflow-y: auto;
}

@media (max-width: 767px) {
  h2 {
    position: static;
    justify-content: flex-start;
    width: 100%;
    height: auto;
    margin-bottom: 12px;
    background: none;
  }

  .add-spot {
    width: 100%;
    padding-bottom: 0;
  }

  .close-mob {
    display: block;
    position: absolute;
    top: 30px;
    right: 14px;
    width: 34px;
    height: 34px;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
  }

  .form-wrapper {
    padding-bottom: 16px;
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .add-spot {
    padding-top: 16px;
  }
}
</style>
