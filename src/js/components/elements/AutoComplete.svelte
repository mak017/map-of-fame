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

const dispatch = createEventDispatcher();
</script>

<div class="autocomplete">
  <Select
    {items}
    bind:selectedValue
    {optionIdentifier}
    {getOptionLabel}
    getSelectionLabel={getOptionLabel}
    {placeholder}
    Item={AutoCompleteItem}
    on:select={(selected) => dispatch('select', selected)} />
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
  margin-bottom: 20px;
}
.hint {
  margin-top: 8px;
  opacity: 0.6;
  color: var(--color-dark);
  font-size: 13px;
  line-height: 16px;
}
</style>
