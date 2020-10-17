<script>
import { createEventDispatcher } from "svelte";

export let placeholder;
export let value;
export let height = 84;
export let errorText = "";

const dispatch = createEventDispatcher();
const blur = () => dispatch("blur");
</script>

<div class="container" class:error={!!errorText}>
  <textarea
    {placeholder}
    bind:value
    style="height: {height}px"
    on:blur={blur} />
  {#if errorText}
    <div class="error-text">{errorText}</div>
  {/if}
</div>

<style lang="scss">
.container {
  margin-bottom: 18px;
}
textarea {
  display: block;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--color-dark);
  border-radius: 2px;
  resize: none;
  font-weight: 600;
  font-size: 16px;
  &:focus {
    border-color: var(--color-accent);
    outline: none;
  }
  &::placeholder {
    color: var(--color-dark);
    font-size: 17px;
    font-weight: normal;
  }
}
.error {
  textarea {
    border-color: var(--color-error);
  }
  &-text {
    margin-top: 8px;
    color: var(--color-error);
    font-size: 13px;
    line-height: 1.22;
  }
}
</style>
