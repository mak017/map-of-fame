<script>
import { createEventDispatcher } from "svelte";

import Tooltip from "./Tooltip.svelte";

export let value = "";
export let placeholder = "";
export let hint = "";
export let errorText = "";
export let label = "";
export let tooltip = "";
export let isReadOnly = false;
export let wideOnMobile = false;
export let editSpot = false;
export let addSpot = false;
export let link = false;
export let search = false;
export let invite = false;
export let extraMargin = false;
export let isDisabled = false;

const dispatch = createEventDispatcher();
const blur = () => dispatch("blur");
const input = (event) => dispatch("input", event);
const keyDown = (event) => dispatch("keyDown", event);
</script>

<label
  class:with-label={!!label}
  class:with-hint={!!hint}
  class:error={!!errorText}
  class:wide-on-mobile={wideOnMobile}
  class:edit-spot={editSpot}
  class:add-spot={addSpot}
  class:link
  class:search
  class:invite
  class:extra-margin={extraMargin}
  class:disabled={isDisabled}>
  {#if label}
    <span>{label}</span>
    {#if tooltip}
      <Tooltip tip={tooltip} top arrowBottomLeft>
        <span class="info-trigger">info</span>
      </Tooltip>
    {/if}
  {/if}
  <input
    type="text"
    {placeholder}
    bind:value
    on:blur={blur}
    on:input={input}
    on:click={isReadOnly && this.select()}
    on:keydown={keyDown}
    readonly={isReadOnly} />
  {#if placeholder && !search}
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
  padding-top: 0;

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

label:not(.with-label) {
  input {
    padding: 4px 0 8px;

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
  padding: 0 3px;
  transition: 0.3s;
  border-radius: 2px;
  color: var(--color-dark);
  line-height: 1.25;
}

.info-trigger {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: url(../../../images/info.svg) 50% 50% / auto no-repeat;
  color: transparent;
  text-indent: -9999px;
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
  margin-bottom: 15px;

  .hint {
    margin-top: 4px;
  }

  &:not(.with-label) {
    margin-bottom: 10px;
  }
}

.edit-spot {
  input {
    line-height: 27px;
  }

  &:not(.with-label) {
    input {
      padding: 1px 0 11px;
    }
  }
}

.search {
  margin-bottom: 0;
  &:not(.with-label) {
    input {
      width: 100%;
      padding: 2px 0 10px;
      line-height: 25px;
      font-size: 24px;
      font-weight: 900;

      &::placeholder {
        opacity: 0.6;
      }
    }
  }
}

.extra-margin {
  margin-bottom: 26px;
}

.disabled {
  pointer-events: none;

  input {
    border-color: var(--color-light-grey);
    color: var(--color-light-grey);
  }
}

.invite {
  input {
    padding-right: 146px;
    line-height: 26px;
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

  .search {
    &:not(.with-label) {
      input {
        width: 100%;
        max-width: 530px;
        padding: 6px 0;
        line-height: 20px;
      }
    }
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .add-spot {
    margin-bottom: 13px;

    input {
      padding: 5px 0;
      font-size: 14px;
      line-height: 17px;
    }

    .hint {
      font-size: 11px;
      line-height: 14px;
    }

    &:not(.with-label) {
      margin-bottom: 6px;
    }

    &.with-label {
      > span {
        font-size: 14px;
      }

      input {
        padding: 8px 10px;
      }
    }

    &.error:not(.with-hint) .hint {
      margin: 0 0 -14px;
    }

    &.link {
      margin-bottom: 19px;
    }
  }
}
</style>
