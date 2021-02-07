<script>
import { fly } from "svelte/transition";
import { isMobile } from "../../utils/commonUtils";
import SpotForm from "../SpotForm.svelte";

export let onCancel;
export let onSubmit;
export let marker;
</script>

<div
  class="add-spot"
  transition:fly={{ x: !isMobile() ? 364 : window.innerWidth, duration: 300 }}>
  <h2>Add Spot</h2>
  {#if isMobile()}<button class="close-mob" on:click={onCancel} />{/if}
  <SpotForm {onCancel} {onSubmit} {marker} />
</div>

<style lang="scss">
.add-spot {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 364px;
  padding: 36px 20px 16px;
  overflow-y: auto;
  background-color: var(--color-light);
}

h2 {
  margin-bottom: 12px;
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
}

@media (max-width: 767px) {
  .add-spot {
    width: 100%;
  }
  .close-mob {
    display: block;
    position: absolute;
    top: 30px;
    right: 14px;
    width: 34px;
    height: 34px;
    border: 0;
    background: url(../../../images/close-cross.svg);
    cursor: pointer;
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .add-spot {
    padding-top: 16px;
  }
}
</style>
