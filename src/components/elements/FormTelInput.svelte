<script>
import { createEventDispatcher } from "svelte";

export let value = "";
export let placeholder = "";
export let hint = "";
export let errorText = "";
export let wideOnMobile = false;
export let editSpot = false;
export let isYear = false;
export let addSpot = false;

const dispatch = createEventDispatcher();
const blur = () => dispatch("blur");
const input = () => dispatch("input");
const keyDown = (event) => dispatch("keyDown", event);
</script>

<label
  class:with-hint={!!hint}
  class:error={!!errorText}
  class:wide-on-mobile={wideOnMobile}
  class:edit-spot={editSpot}
  class:add-spot={addSpot}
  class:year={isYear}>
  <input
    type="tel"
    {placeholder}
    bind:value
    on:blur={blur}
    on:input={input}
    on:keydown={keyDown} />
  {#if placeholder}
    <div class="floating-label">{placeholder}</div>
  {/if}
  {#if errorText || hint}
    <div class="hint">{errorText || hint}</div>
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
  padding: 4px 0 8px;
  border: 0;
  border-bottom: 1px solid var(--color-dark);
  color: var(--color-dark);
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

label {
  input {
    &:placeholder-shown + .floating-label {
      overflow: hidden;
      background: transparent;
      font-size: 16px;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: text;
    }
    &:not(:placeholder-shown) + .floating-label {
      transform: translateY(-16px);
      background: var(--color-light);
      color: rgba(#393940, 0.6);
      font-size: 13px;
    }
    &::placeholder {
      opacity: 0;
    }
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
.hint {
  margin-top: 8px;
  opacity: 0.6;
  color: var(--color-dark);
  font-size: 13px;
  line-height: 16px;
}
.error {
  input {
    border-color: var(--color-error);
  }
  .hint {
    opacity: 1;
    color: var(--color-error);
  }
  &:not(.with-hint) {
    .hint {
      margin: 4px 0 -20px;
    }
  }
}

.add-spot {
  margin-bottom: 10px;
  .hint {
    margin-top: 4px;
  }
}

.edit-spot {
  input {
    padding: 1px 0 11px;
    line-height: 27px;
  }
}

.year {
  input {
    font-size: 18px;
    font-weight: 700;
  }
}

@media (max-width: 767px) {
  input {
    width: 100%;
    max-width: 530px;
  }
  .wide-on-mobile {
    input {
      max-width: none;
    }
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .add-spot {
    margin-bottom: 6px;
    input {
      padding: 5px 0;
      font-size: 14px;
      line-height: 17px;
    }
    .hint {
      font-size: 11px;
      line-height: 14px;
    }
    &.error:not(.with-hint) .hint {
      margin: 0 0 -14px;
    }
  }
}
</style>
