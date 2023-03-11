<script>
import Select from "svelte-select";
import { createEventDispatcher } from "svelte";
import SelectIconCalendar from "./icons/SelectIconCalendar.svelte";
import SelectIndicatorSvg from "./icons/SelectIndicatorSvg.svelte";

export let selectedValue = undefined;
export let items;
export let isYear = false;
export let placeholder = "Select...";
export let label = "label";
export let optionIdentifier;
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
        <SelectIconCalendar />
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
    --border: 0;
    --border-focused: 0;
    --border-hover: 0;
    --chevron-width: 20px;
    --chevron-height: 20px;
    --list-max-height: 310px;
    --padding: 0 16px 0 13px;
    --selected-item-padding: 0 0 0 8px;
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
