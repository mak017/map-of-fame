<script>
import { clickOutside } from "../../js/utils/commonUtils";

export let tip = "";
export let top = false;
export let right = false;
export let bottom = false;
export let left = false;
export let arrowBottomLeft = false;
export let active = false;
</script>

<div
  class="tooltip-wrapper"
  use:clickOutside
  on:click_outside={() => (active = false)}>
  <button
    class="button tooltip-slot"
    on:click|preventDefault={() => (active = true)}>
    <slot />
  </button>
  <div
    class="tooltip"
    class:active
    class:left
    class:right
    class:bottom
    class:top
    class:arrow-bottom-left={arrowBottomLeft}>
    {#if tip}
      <div class="default-tip">{tip}</div>
    {:else}
      <slot name="custom-tip" />
    {/if}
  </div>
</div>

<style lang="scss">
.tooltip-wrapper {
  display: inline-block;
  position: relative;
  z-index: 1;
}

.tooltip {
  display: inline-block;
  position: absolute;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 150ms,
    visibility 150ms;
  color: inherit;
  font-family: inherit;

  &-slot {
    background: none;
  }
}

.default-tip {
  display: inline-block;
  min-width: 270px;
  padding: 8px 16px;
  border-radius: 6px;
  background-color: var(--color-lotion);
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.36);
  color: inherit;

  &::before {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    width: 0;
    border-top: 12px solid var(--color-lotion);
    border-right: 9px solid transparent;
    border-left: 9px solid transparent;
    font-size: 0;
    line-height: 0;
    filter: drop-shadow(0 4px 2px rgba(0, 0, 0, 0.36));
  }
}

.tooltip.top {
  left: 50%;
  margin-top: -14px;
  transform: translate(-50%, -100%);

  &.arrow-bottom-left {
    left: 20%;
    transform: translate(-21%, -100%);

    .default-tip::before {
      left: 20%;
    }
  }
}

.tooltip.bottom {
  bottom: 0;
  left: 50%;
  margin-bottom: -8px;
  transform: translate(-50%, 100%);
}

.tooltip.left {
  left: 0;
  margin-left: -8px;
  transform: translateX(-100%);
}

.tooltip.right {
  right: 0;
  margin-right: -8px;
  transform: translateX(100%);
}

.tooltip.active {
  opacity: 1;
  visibility: initial;
}

@media (max-width: 375px) {
  .default-tip {
    min-width: 230px;
  }
}
</style>
