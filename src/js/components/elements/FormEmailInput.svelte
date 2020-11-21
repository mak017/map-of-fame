<script>
import { createEventDispatcher } from "svelte";

export let value = "";
export let placeholder = "";
export let errorText = "";

const dispatch = createEventDispatcher();
const blur = () => dispatch("blur");
const input = () => dispatch("input");
const keyDown = () => dispatch("keyDown");
</script>

<label class:error={!!errorText}>
  <input
    type="email"
    {placeholder}
    bind:value
    on:blur={blur}
    on:input={input}
    on:keydown={keyDown}
    autocomplete="email" />
  {#if errorText}
    <div class="error-text">{errorText}</div>
  {/if}
</label>

<style lang="scss">
label {
  display: block;
  margin-bottom: 20px;
}
input {
  width: 530px;
  max-width: 100%;
  padding: 6px 0;
  border: 0;
  border-bottom: 1px solid var(--color-dark);
  color: var(--color-dark);
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  &::placeholder {
    padding-left: 2px;
    color: var(--color-dark);
    font-weight: normal;
  }
  &:focus {
    border-bottom-color: var(--color-accent);
    outline: 0;
  }
}
.error-text {
  margin-top: 8px;
  opacity: 1;
  color: var(--color-error);
  font-size: 13px;
  line-height: 16px;
}
.error {
  input {
    border-bottom-color: var(--color-error);
  }
}

@media (max-width: 767px) {
  input {
    width: 100%;
    max-width: 530px;
  }
}
</style>
