<script>
import { createEventDispatcher } from "svelte";
import Select from "svelte-select";

import SelectIndicatorSvg from "./icons/SelectIndicatorSvg.svelte";
import CalendarSvg from "./icons/CalendarSvg.svelte";

export let selectedValue = undefined;
export let items;
export let isYear = false;
export let placeholder = "Select...";
export let label = "label";
export let optionIdentifier = undefined;
export let addSpot = false;

const dispatch = createEventDispatcher();
</script>

<div class="select" class:year={isYear} class:add-spot={addSpot}>
  <Select
    {items}
    bind:value={selectedValue}
    itemId={optionIdentifier}
    showChevron
    clearable={false}
    searchable={false}
    on:select={(selected) => dispatch("select", selected)}
    {placeholder}
    {label}>
    <div slot="prepend" class="prepend">
      {#if isYear}
        <CalendarSvg />
      {/if}
    </div>
    <div slot="chevron-icon"><SelectIndicatorSvg /></div>
  </Select>
</div>

<style lang="scss">
.select {
  --border: 1px solid var(--color-dark);
  --border-focused: 1px solid var(--color-accent);
  --border-hover: 1px solid var(--color-dark);
  --border-radius: 2px;
  --indicators-position: relative;
  --indicators-top: -3px;
  --input-color: var(--color-dark);
  --input-font-size: 16px;
  --item-first-border-radius: 0;
  --item-hover-bg: none;
  --item-is-active-bg: none;
  --item-is-active-color: var(--color-accent);
  --list-border: 1px solid var(--color-accent);
  --list-border-radius: 0;
  --list-max-height: 220px;
  --list-shadow: 0;
  --padding: 0 0 0 10px;
  --placeholder-color: var(--color-dark);

  &.year {
    --chevron-width: 20px;
    --chevron-height: 20px;
    --height: 40px;
    --indicators-right: -4px;
    --list-max-height: 310px;
    --padding: 0 11px 0 13px;
    --selected-item-padding: 0 0 0 8px;
    text-transform: uppercase;
  }

  .prepend {
    display: flex;
    align-items: center;
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .select {
    &.add-spot {
      --height: 36px;
      --indicator-top: 3px;
    }
  }
}
</style>
