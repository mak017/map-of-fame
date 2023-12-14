<script>
import { createEventDispatcher } from "svelte";
import AutoComplete from "simple-svelte-autocomplete";

export let getItems = undefined;
export let selectedValue = undefined;
export let data = undefined;
export let text = "";
export let showList = false;
export let label = "";
export let inputClassName = "";

const dispatch = createEventDispatcher();
const onBlur = (selected) => dispatch("blur", selected);
const onChange = (selected) => dispatch("change", selected);
const onFocus = (selected) => dispatch("focus", selected);
const beforeChange = (selected) => dispatch("beforechange", selected);
</script>

<div class="autocomplete-container" class:not-empty={selectedValue || text}>
  <AutoComplete
    searchFunction={getItems}
    delay="200"
    localFiltering={false}
    labelFieldName="name"
    valueFieldName="id"
    minCharactersToSearch={2}
    maxItemsToShowInList={5}
    showLoadingIndicator
    hideArrow
    lock
    dropdownClassName={showList ? "" : "empty"}
    {inputClassName}
    {onBlur}
    {onChange}
    {beforeChange}
    {onFocus}
    bind:selectedItem={data}
    bind:value={selectedValue}
    bind:text>
    <div slot="item" let:item let:label>
      <span class="name">{@html label}</span>
      <span class="type">{item.type}</span>
    </div>
    <div slot="no-results"></div>
  </AutoComplete>
  {#if label}
    <div class="floating-label">{label}</div>
  {/if}
  {#if data}
    <div class="selected-type">
      <span class:hidden={data.name}
        >{data.name || data.artist?.name || data.crew?.name}</span>
      ({data.type || data.username})
    </div>
  {/if}
</div>

<style lang="scss">
.autocomplete-container {
  position: relative;
  margin-bottom: 10px;
  padding-top: 8px;
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

.not-empty {
  .floating-label {
    overflow: hidden;
    transform: translateY(-15px);
    opacity: 0.6;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.selected-type {
  position: absolute;
  top: 12px;
  max-width: calc(100% - 30px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  span {
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
  }

  .hidden {
    opacity: 0;
  }
}
</style>
