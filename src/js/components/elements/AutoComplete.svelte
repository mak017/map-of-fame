<script>
import { createEventDispatcher } from "svelte";
import Select from "svelte-select";

import AutoCompleteItem from "./AutoCompleteItem.svelte";
import SelectIndicatorSvg from "./icons/SelectIndicatorSvg.svelte";

export let selectedValue = undefined;
export let items = undefined;
export let optionIdentifier;
export let placeholder;
export let hint = undefined;
export let loadOptions = undefined;
export let errorMessage = "";
export let isSearch = false;
export let showIndicator = false;
export let noOptionsMessage = "No options";
export let label = "label";
export let externalTypedText = "";
export let prependText = "";

let typedText = "";

$: {
  typedText = externalTypedText;
}

const dispatch = createEventDispatcher();

const onSelect = (selected) => dispatch("select", selected);

const onType = (label, filterText) => {
  typedText = filterText;
  return label.toLowerCase().includes(filterText.toLowerCase());
};
</script>

<div
  class="autocomplete"
  class:not-empty={selectedValue || prependText}
  class:typed-text={typedText}
  class:is-search={isSearch}>
  <Select
    {items}
    bind:value={selectedValue}
    itemId={optionIdentifier}
    {loadOptions}
    {label}
    showChevron={showIndicator && !selectedValue}
    placeholder=""
    on:change={onSelect}
    itemFilter={onType}
    hideEmptyState={!!selectedValue}>
    <div slot="chevron-icon"><SelectIndicatorSvg /></div>
    <div slot="prepend">{prependText}</div>
    <div slot="item" let:item>
      <AutoCompleteItem {item} />
    </div>
    <div slot="empty" class="empty">{noOptionsMessage}</div>
  </Select>
  {#if placeholder}
    <div class="floating-label">{placeholder}</div>
  {/if}
  {#if hint}
    <div class="hint">{hint}</div>
  {/if}
  {#if errorMessage}
    <div class="error">{errorMessage}</div>
  {/if}
</div>

<style lang="scss">
.autocomplete {
  position: relative;
  margin-bottom: 20px;
  --border: 1px solid var(--color-dark);
  --border-focused: 1px solid var(--color-accent);
  --border-hover: 1px solid var(--color-dark);
  --border-radius: 0;
  --indicator-top: 6px;
  --indicator-right: -10px;
  --input-color: var(--color-dark);
  --input-font-size: 16px;
  --input-padding: 0;
  --item-first-border-radius: 0;
  --item-height: auto;
  --item-line-height: auto;
  --item-hover-bg: none;
  --item-is-active-bg: none;
  --item-is-active-color: var(--color-accent);
  --item-padding: 0;
  --list-border-radius: 0;
  --list-shadow: 0;
  --placeholder-color: var(--color-dark);
  --spinner-color: var(--color-accent);
}

.empty {
  padding: 20px 0;
  text-align: center;
}

.floating-label {
  position: absolute;
  top: 8px;
  transform: translateY(0);
  transition: 0.3s;
  opacity: 1;
  color: var(--color-dark);
  font-size: 16px;
  pointer-events: none;
}

.not-empty,
.typed-text {
  .floating-label {
    overflow: hidden;
    transform: translateY(-15px);
    opacity: 0.6;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  margin: 4px 0 -20px;
  color: var(--color-error);
  font-size: 13px;
  line-height: 16px;
}
</style>
