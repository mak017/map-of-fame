<script>
export let onClick;
export let isVisuallyHidden = false;
export let isStaticPosition = false;
export let noTransition = false;
</script>

<button
  type="button"
  class="button dots"
  class:isVisuallyHidden
  class:isStaticPosition
  class:noTransition
  on:click={onClick}><span></span><span></span><span></span></button>

<style lang="scss">
.dots {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  align-items: center;
  justify-content: space-between;
  width: 16px;
  height: 16px;
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
}
</style>
