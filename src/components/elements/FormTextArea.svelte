<script>
import { createEventDispatcher } from "svelte";

export let placeholder;
export let value;
export let height = 84;
export let errorText = "";
export let isResizable = false;
export let addSpot = false;
export let isFloatingLabel = true;

const dispatch = createEventDispatcher();
const blur = () => dispatch("blur");
const input = () => dispatch("input");
if (
  window.innerHeight < 850 &&
  window.innerWidth > window.innerHeight &&
  addSpot
) {
  height *= 0.87;
}
</script>

<div
  class="container"
  class:error={!!errorText}
  class:add-spot={addSpot}
  class:no-floating-label={!isFloatingLabel}>
  <textarea
    {placeholder}
    bind:value
    style="height: {height}px"
    on:blur={blur}
    on:input={input}
    class:resizable={isResizable} />
  {#if placeholder && isFloatingLabel}
    <div class="floating-label">{placeholder}</div>
  {/if}
  {#if errorText}
    <div class="error-text">{errorText}</div>
  {/if}
</div>

<style lang="scss">
.container {
  position: relative;
  margin-bottom: 18px;
}

textarea {
  display: block;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--color-dark);
  border-radius: 2px;
  resize: none;
  font-size: 16px;

  &:focus {
    border-color: var(--color-accent);
    outline: none;
  }

  &::placeholder {
    opacity: 0;
    color: var(--color-dark);
    font-size: 17px;
    font-weight: normal;
  }

  &:placeholder-shown + .floating-label {
    overflow: hidden;
    background: transparent;
    font-size: 17px;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: text;
  }

  &:not(:placeholder-shown) + .floating-label {
    transform: translateY(-20px);
    background: var(--color-light);
    color: rgba(#393940, 0.6);
    font-size: 13px;
  }
}

.floating-label {
  position: absolute;
  top: 13px;
  left: 8px;
  padding: 0px 3px;
  border-radius: 2px;
  transition: 0.3s;
  color: var(--color-dark);
  line-height: 1.25;
  pointer-events: none;
}

.error {
  textarea {
    border-color: var(--color-error);
  }

  &-text {
    margin: 1px 0 -17px;
    color: var(--color-error);
    font-size: 13px;
    line-height: 1.22;
  }
}

.resizable {
  resize: both;
}

.no-floating-label {
  textarea::placeholder {
    opacity: 1;
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .container {
    &.add-spot {
      margin-bottom: 13px;

      textarea {
        font-size: 14px;
      }
    }
  }
}
</style>
