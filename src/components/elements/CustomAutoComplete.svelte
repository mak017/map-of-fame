<script>
import { createEventDispatcher, onDestroy, onMount } from "svelte";
import AutoComplete from "simple-svelte-autocomplete";

import { clickOutside } from "../../js/utils/commonUtils";

import FormRadioButton from "./FormRadioButton.svelte";
import ButtonDots from "./ButtonDots.svelte";

export let getItems = undefined;
export let selectedValue = undefined;
export let data = undefined;
export let text = "";
export let showList = false;
export let isAddSpot = false;
export let label = "";
export let inputId = "";
export let type = "tagged";
export let onInputChange = () => {};
export let onInputBlur = () => {};
let inputElement;
let isExpandedCollab = false;

const dispatch = createEventDispatcher();
const onBlur = (selected) => dispatch("blur", selected);
const onChange = (selected) => dispatch("change", selected);
const onFocus = (selected) => dispatch("focus", selected);
const beforeChange = (selected) => dispatch("beforechange", selected);
const onChangeType = (selected) => dispatch("changetype", selected);

const handleDotsClick = () => {
  isExpandedCollab = true;
};

onMount(() => {
  inputElement = document.getElementById(inputId);

  inputElement.addEventListener("keydown", onInputChange, false);
  inputElement.addEventListener("blur", onInputBlur, false);
});

onDestroy(() => {
  inputElement.removeEventListener("keydown", onInputChange);
  inputElement.removeEventListener("blur", onInputBlur);
});
</script>

<div
  class="autocomplete-container"
  class:not-empty={selectedValue || text}
  class:empty={!selectedValue && !text}
  class:add-spot={isAddSpot}
  class:has-selected-value={data}
  use:clickOutside
  on:click_outside={() => (isExpandedCollab = false)}>
  <AutoComplete
    searchFunction={getItems}
    delay="200"
    localFiltering={false}
    cleanUserText={false}
    labelFieldName="name"
    valueFieldName="id"
    minCharactersToSearch={2}
    maxItemsToShowInList={5}
    showLoadingIndicator
    hideArrow
    lock
    closeOnBlur={!selectedValue && !text}
    dropdownClassName={showList ? "" : "empty"}
    {inputId}
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
      <span class="username">({data.type || `@${data.username}`})</span>
    </div>
    <div class="collab-wrapper" class:isExpandedCollab>
      <ButtonDots
        onClick={handleDotsClick}
        isVisuallyHidden={isExpandedCollab} />
      <div class="switcher-tabs">
        <FormRadioButton
          id={`tagged-${inputId}`}
          bind:group={type}
          on:change={onChangeType}
          value="tagged"
          label="Tagged"
          className="small" />
        <FormRadioButton
          id={`collab-${inputId}`}
          bind:group={type}
          on:change={onChangeType}
          value="collab"
          label="Collab"
          className="small" />
      </div>
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
  font-size: 16px;
  text-overflow: ellipsis;
  white-space: nowrap;

  span {
    line-height: 20px;

    &.username {
      font-weight: 500;
    }
  }

  .hidden {
    white-space: pre;
  }
}

.collab-wrapper {
  position: absolute;
  top: -7px;
  right: 0;

  .switcher-tabs {
    display: flex;
    position: absolute;
    top: -8px;
    right: 0;
    left: 0;
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    background-color: var(--color-light);
  }

  &.isExpandedCollab {
    width: 100%;

    .switcher-tabs {
      transform: translateY(-4px);
      opacity: 1;
      transition: 0.2s;
      visibility: visible;
    }
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .add-spot {
    .selected-type {
      font-size: 14px;
    }
  }
}
</style>
