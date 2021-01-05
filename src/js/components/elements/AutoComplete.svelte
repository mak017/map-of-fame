<script>
import Select from "svelte-select";
import { createEventDispatcher } from "svelte";
import AutoCompleteItem from "./AutoCompleteItem.svelte";

export let selectedValue = undefined;
export let items;
export let optionIdentifier;
export let getOptionLabel;
export let placeholder;
export let hint = undefined;

let isNotEmpty = false;
let typedText = "";

const dispatch = createEventDispatcher();

const onSelect = (selected) => {
  isNotEmpty = true;
  dispatch("select", selected);
};

const onClear = () => (isNotEmpty = false);

const onType = (label, filterText) => {
  typedText = filterText;
  return label.toLowerCase().includes(filterText.toLowerCase());
};
</script>

<div
  class="autocomplete"
  class:not-empty={isNotEmpty}
  class:typed-text={typedText}>
  <Select
    {items}
    bind:selectedValue
    {optionIdentifier}
    {getOptionLabel}
    getSelectionLabel={getOptionLabel}
    placeholder=""
    Item={AutoCompleteItem}
    on:select={onSelect}
    on:clear={onClear}
    itemFilter={onType} />
  {#if placeholder}
    <div class="floating-label">{placeholder}</div>
  {/if}
  {#if hint}
    <div class="hint">{hint}</div>
  {/if}
</div>

<style lang="scss">
.autocomplete {
  --border: 1px solid var(--color-dark);
  --borderHoverColor: var(--color-dark);
  --borderRadius: 0;
  --borderFocusColor: var(--color-accent);
  --indicatorTop: 6px;
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
  position: relative;
  margin-bottom: 20px;
}
.floating-label {
  position: absolute;
  top: 8px;
  transition: 0.3s;
  opacity: 1;
  transform: translateY(0);
  color: var(--color-dark);
  font-size: 16px;
  pointer-events: none;
}
.not-empty,
.typed-text {
  .floating-label {
    overflow: hidden;
    opacity: 0.6;
    transform: translateY(-15px);
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
</style>
