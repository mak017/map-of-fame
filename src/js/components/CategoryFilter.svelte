<script>
import ArrowLeftSvg from "./elements/icons/ArrowLeftSvg.svelte";

let isOpened = false;
</script>

<div class="wrapper">
  <button
    type="button"
    class="button button-filter"
    class:isOpened
    on:click={() => (isOpened = !isOpened)}>
    {#if isOpened}
      <span>
        <ArrowLeftSvg isDarkColor isArrowUp />
      </span>
    {/if}
  </button>
</div>

<style lang="scss">
.wrapper {
  position: absolute;
  top: 68px;
  left: 18px;
}

.button-filter {
  width: 60px;
  height: 40px;
  background-color: var(--color-light);
  background-image: url(../../images/filter.svg);
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: 20px 16px;
  color: transparent;
  font-size: 0;

  > span {
    display: block;
    position: relative;
    top: 3px;
    width: 22px;
    height: 22px;
    margin: auto;
  }

  &.isOpened {
    background-color: var(--color-lotion);
    background-image: none;
  }
}
</style>
