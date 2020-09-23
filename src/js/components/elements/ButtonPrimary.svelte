<script>
import { createEventDispatcher } from "svelte";

export let isDisabled = false;
export let type = "button";
export let className = "";
export let text = "";

const dispatch = createEventDispatcher();
</script>

<button
  {type}
  class={`button${className ? ` ${className}` : ''}`}
  disabled={isDisabled}
  on:click={() => dispatch('click')}>{text}</button>

<style lang="scss">
button {
  flex: 1 0 auto;
  padding: 12px 0;
  background-color: var(--color-accent);
  color: var(--color-light);
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  &:disabled {
    opacity: 0.4;
  }
}
.add-spot {
  padding: 9px 29px;
}
@media (max-width: 767px) {
  .wide-on-mobile {
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
  }
}
</style>
