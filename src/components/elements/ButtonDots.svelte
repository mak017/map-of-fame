<script>
export let onClick;
export let isVisuallyHidden = false;
export let isStaticPosition = false;
export let noTransition = false;
export let isBig = false;
export let withBg = false;
</script>

<button
  type="button"
  class="button dots"
  class:isVisuallyHidden
  class:isStaticPosition
  class:noTransition
  class:isBig
  class:withBg
  on:click={onClick}><span></span><span></span><span></span></button>

<style lang="scss">
.dots {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  align-items: center;
  justify-content: space-evenly;
  width: 20px;
  height: 20px;
  transition: 0.3s;
  background: none;

  span {
    width: 4px;
    height: 4px;
    border: 1px solid var(--color-dark);
    border-radius: 50%;
  }

  &.isVisuallyHidden {
    opacity: 0;
    visibility: hidden;
  }

  &.isStaticPosition {
    position: static;
  }

  &.noTransition {
    transition: none;
  }

  &.isBig {
    width: 40px;
    height: 40px;
    padding: 10px;
  }

  &.withBg {
    background-color: var(--color-accent-light);
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--color-accent-light-hover);
    }
  }
}
</style>
