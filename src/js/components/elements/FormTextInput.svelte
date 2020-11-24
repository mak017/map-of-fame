<script>
import { createEventDispatcher } from "svelte";

export let value = "";
export let placeholder = "";
export let hint = "";
export let errorText = "";
export let label = "";
export let isReadOnly = false;
export let wideOnMobile = false;
export let editSpot = false;
export let isYear = false;

const dispatch = createEventDispatcher();
const blur = () => dispatch("blur");
const input = () => dispatch("input");
</script>

<label
  class:with-label={!!label}
  class:error={!!errorText}
  class:wide-on-mobile={wideOnMobile}
  class:edit-spot={editSpot}
  class:year={isYear}>
  {#if label}<span>{label}</span>{/if}
  <input
    type="text"
    {placeholder}
    bind:value
    on:blur={blur}
    on:input={input}
    on:click={isReadOnly && this.select()}
    readonly={isReadOnly} />
  {#if errorText || hint}
    <div class="hint">{errorText || hint}</div>
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
  font-size: 16px;
  font-weight: 600;
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

.with-label {
  > span {
    font-size: 16px;
    line-height: 1.22;
  }
  input {
    padding: 9px 10px;
    border: 1px solid var(--color-dark);
    border-radius: 2px;
    &:focus {
      border-color: var(--color-accent);
    }
  }
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
}

.edit-spot {
  input {
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
</style>
