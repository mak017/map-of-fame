<script>
import Select from "svelte-select";
import { createEventDispatcher } from "svelte";
import SelectIconCalendar from "./SelectIconCalendar.svelte";

export let selectedValue = undefined;
export let items;
export let isYear = false;
export let placeholder = "Select...";
export let optionIdentifier;
export let getOptionLabel;
export let getSelectionLabel;
export let addSpot = false;

const dispatch = createEventDispatcher();
</script>

<div class={`select${isYear ? " year" : ""}`} class:add-spot={addSpot}>
  <Select
    {items}
    bind:selectedValue
    {optionIdentifier}
    {getOptionLabel}
    {getSelectionLabel}
    showIndicator
    listAutoWidth={isYear}
    isClearable={false}
    isSearchable={false}
    indicatorSvg={`<svg width="8" height="5"viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5L4.37114e-07 -2.22545e-07L8 4.76837e-07L4 5Z" fill="#393940" /></svg>`}
    Icon={isYear ? SelectIconCalendar : false}
    on:select={(selected) => dispatch("select", selected)}
    {placeholder} />
</div>

<style lang="scss">
.select {
  --border: 1px solid var(--color-dark);
  --borderHoverColor: var(--color-dark);
  --borderRadius: 2px;
  --borderFocusColor: var(--color-accent);
  --indicatorTop: 6px;
  --inputColor: var(--color-dark);
  --inputFontSize: 16px;
  --inputPadding: 0 10px;
  --itemFirstBorderRadius: 0;
  --itemHoverBG: none;
  --itemIsActiveBG: none;
  --itemIsActiveColor: var(--color-accent);
  --listBorderRadius: 0;
  --listShadow: 0;
  --placeholderColor: var(--color-dark);
  &.year {
    --border: 0;
    --inputPadding: 0 10px 0 35px;
    --listMaxHeight: 468px;
    --padding: 0 16px 0 13px;
    --selectedItemPadding: 0 20px 0 8px;
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .select {
    &.add-spot {
      --height: 36px;
      --indicatorTop: 3px;
    }
  }
}
</style>
