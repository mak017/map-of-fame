<script>
import { isMobile } from "../../js/utils/commonUtils";

import MapSvg from "./icons/MapSvg.svelte";

export let onClick = () => {};
export let showTextOnHover = false;
</script>

<button
  type="button"
  class="button show-on-map"
  class:showTextOnHover
  on:click={onClick}>
  {#if showTextOnHover && !isMobile()}
    <span class="text-wrapper">Show on</span>
  {/if}
  <span class="button-wrapper">
    <MapSvg />
  </span></button>

<style lang="scss">
.show-on-map {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--color-accent-light);
  color: var(--color-dark);
  font-size: 14px;
  line-height: 22px;
  text-transform: uppercase;

  .text-wrapper {
    display: flex;
    align-items: center;
    width: 0;
    height: 40px;
    opacity: 0;
    visibility: hidden;
    transform: translateX(100%);
    white-space: nowrap;
  }

  .button-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 40px;
  }

  &.showTextOnHover {
    justify-content: space-between;
    padding: 0 10px;
    transition: 0.2s;
  }

  &:hover {
    background-color: var(--color-accent-light-hover);

    .text-wrapper {
      width: 74px;
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
      transition:
        width 0.2s,
        transform 0.2s,
        visibility 0.2s 0.05s,
        opacity 0.2s 0.05s;
    }

    &.showTextOnHover {
      width: 124px;
    }
  }
}
</style>
