<script>
import Select from "svelte-select";
import { createEventDispatcher } from "svelte";

export let selectedValue = "";
export let items;
export let isClearable = true;

const dispatch = createEventDispatcher();
</script>

<div class="select">
  <Select
    {items}
    bind:selectedValue
    showChevron
    listAutoWidth={false}
    {isClearable}
    indicatorSvg={`<svg width="8" height="5"viewBox="0 0 8 5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 5L4.37114e-07 -2.22545e-07L8 4.76837e-07L4 5Z" fill="#393940" /></svg>`}
    on:select={() => dispatch('select')} />
</div>

<style>
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
}
</style>
