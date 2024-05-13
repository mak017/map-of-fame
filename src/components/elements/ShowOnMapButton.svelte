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
    <span>Show on</span>
  {/if}
  <MapSvg /></button>

<style lang="scss">
.show-on-map {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  color: var(--color-dark);
  font-size: 14px;
  line-height: 22px;
  text-transform: uppercase;

  > span {
    margin-right: 10px;
    opacity: 0;
    transform: translateX(100%);
  }

  &.showTextOnHover {
    width: auto;
  }

  &:hover {
    span {
      opacity: 1;
      transform: translateX(0);
      transition:
        transform 0.2s,
        opacity 0.2s 0.05s;
    }
  }
}
</style>
