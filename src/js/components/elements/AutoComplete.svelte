<script>
import { createEventDispatcher } from "svelte";
import Select from "svelte-select";
import AutoCompleteItem from "./AutoCompleteItem.svelte";

export let selectedValue = undefined;
export let items = undefined;
export let optionIdentifier;
export let getOptionLabel;
export let placeholder;
export let hint = undefined;
export let loadOptions = undefined;
export let errorMessage = "";
export let isSearch = false;
export let showIndicator = false;
export let noOptionsMessage = "No options";
export let externalTypedText = "";

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
  class:not-empty={selectedValue}
  class:typed-text={typedText}
  class:is-search={isSearch}>
  <Select
    {items}
    bind:value={selectedValue}
    {optionIdentifier}
    {getOptionLabel}
    {loadOptions}
    {noOptionsMessage}
    {showIndicator}
    getSelectionLabel={getOptionLabel}
    placeholder=""
    Item={AutoCompleteItem}
    on:select={onSelect}
    itemFilter={onType}
    hideEmptyState={!!selectedValue}
    indicatorSvg={`<svg width="8" height="5"viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5L4.37114e-07 -2.22545e-07L8 4.76837e-07L4 5Z" fill="#393940" /></svg>`} />
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

  --borderFocusColor: var(--color-accent);
  --borderHoverColor: var(--color-dark);
  --borderRadius: 0;
  --indicatorTop: 6px;
  --indicatorRight: -10px;
  --inputColor: var(--color-dark);
  --inputFontSize: 16px;
  --inputPadding: 0;
  --itemFirstBorderRadius: 0;
  --itemHoverBG: none;
  --itemIsActiveBG: none;
  --itemIsActiveColor: var(--color-accent);
  --listBorderRadius: 0;
  --listShadow: 0;
  --placeholderColor: var(--color-dark);
  --spinnerColor: var(--color-accent);
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
