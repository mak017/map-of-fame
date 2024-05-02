<script>
import { createEventDispatcher } from "svelte";

export let id;
export let group;
export let value;
export let label;
export let className = "";

const dispatch = createEventDispatcher();
const change = (event) => dispatch("change", event);
</script>

<div class={`radio${className ? ` ${className}` : ""}`}>
  <input type="radio" {id} bind:group {value} on:change={change} />
  <label for={id}>{label}</label>
</div>

<style lang="scss">
.radio {
  display: flex;
  flex: 1 0 0;
  border: 1px solid var(--color-dark);
  border-right: 0;

  &:first-child {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }

  &:last-child {
    border-right: 1px solid var(--color-dark);
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
  }

  input {
    position: absolute;
    left: -9999px;
    clip: rect(0 0 0 0);
    opacity: 0;
  }

  label {
    flex: 1 0 auto;
    margin: -0.5px;
    padding: 10px 4px;
    width: 100%;
    overflow: hidden;
    color: var(--color-dark);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.22;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
  }

  input:checked + label {
    background-color: var(--color-dark);
    color: var(--color-light);
  }

  &.accent {
    input:checked + label {
      background-color: var(--color-accent);
      color: var(--color-light);
    }
  }

  &.small {
    label {
      padding: 3px 4px;
    }
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .radio {
    &.addSpot {
      label {
        padding: 9px 4px;
      }
    }
  }
}
</style>
