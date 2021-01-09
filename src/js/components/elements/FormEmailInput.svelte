<script>
import { createEventDispatcher } from "svelte";

export let value = "";
export let placeholder = "";
export let errorText = "";

const dispatch = createEventDispatcher();
const blur = () => dispatch("blur");
const input = () => dispatch("input");
const keyDown = (event) => dispatch("keyDown", event);
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
  {#if placeholder}
    <div class="floating-label">{placeholder}</div>
  {/if}
  {#if errorText}
    <div class="error-text">{errorText}</div>
  {/if}
</label>

<style lang="scss">
label {
  display: block;
  position: relative;
  margin-bottom: 20px;
  padding-top: 8px;
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
    opacity: 0;
    color: var(--color-dark);
    font-weight: normal;
  }
  &:focus {
    border-bottom-color: var(--color-accent);
    outline: 0;
  }
  &:placeholder-shown + .floating-label {
    overflow: hidden;
    background: transparent;
    font-size: 16px;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: text;
  }
  &:not(:placeholder-shown) + .floating-label {
    transform: translateY(-13px);
    background: var(--color-light);
    color: rgba(#393940, 0.6);
    font-size: 13px;
  }
}
.floating-label {
  position: absolute;
  top: 13px;
  left: -3px;
  padding: 0px 3px;
  border-radius: 2px;
  transition: 0.3s;
  color: var(--color-dark);
  line-height: 1.25;
}
.error-text {
  margin: 4px 0 -20px;
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
