<script>
import { fade, slide } from "svelte/transition";

import { requestSpots } from "../init";
import { categoriesList, map, selectedYear } from "../store";
import { loadFromLocalStorage, saveToLocalStorage } from "../utils/commonUtils";
import { openRailwayMap } from "../utils/mapUtils/tileLayers";

import CategoryIcon from "./elements/CategoryIcon.svelte";
import ArrowLeftSvg from "./elements/icons/ArrowLeftSvg.svelte";

let isOpened = false;
let categories;
let selectedCategories = loadFromLocalStorage("categories") || [1];
$: categories = $categoriesList.filter((category) => !category.isAdditional);

const handleCategoryClick = (id) => {
  const isSelected = selectedCategories.includes(id);
  selectedCategories = isSelected
    ? selectedCategories.filter((categoryId) => categoryId !== id)
    : [...selectedCategories, id];
  saveToLocalStorage("categories", selectedCategories);
  requestSpots($selectedYear);

  const isTrainsSelected = selectedCategories.includes(2);
  const hasRailwayLayer = $map.hasLayer(openRailwayMap);
  if (isTrainsSelected && !hasRailwayLayer) {
    $map.addLayer(openRailwayMap);
  }

  if (!isTrainsSelected && hasRailwayLayer) {
    $map.removeLayer(openRailwayMap);
  }
};
</script>

<div class="wrapper">
  <button
    type="button"
    class="button button-filter"
    class:isOpened
    on:click={() => (isOpened = !isOpened)}
    transition:fade={{ duration: 200 }}>
    {#if isOpened}
      <span>
        <ArrowLeftSvg isDarkColor isArrowUp />
      </span>
    {/if}
  </button>
  {#if isOpened}
    <ul class="options" transition:slide={{ duration: 200 }}>
      {#each categories as category}
        <li>
          <button
            type="button"
            class={`button button-category category-${category.id}`}
            class:isActive={selectedCategories.includes(category.id)}
            on:click={() => handleCategoryClick(category.id)}>
            <CategoryIcon
              categoryId={category.id}
              isActive={selectedCategories.includes(category.id)} />
            <span>{category.name}</span></button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style lang="scss">
.wrapper {
  position: absolute;
  top: 68px;
  left: 18px;
  transition:
    opacity 0.2s,
    visibility 0.2s;
}

li {
  &:nth-child(odd) {
    .button-category.isActive {
      background-color: var(--color-accent);
    }
  }

  &:nth-child(even) {
    .button-category.isActive {
      background-color: rgba(#432fd8, 0.9);
    }
  }

  &:last-child {
    .button-category {
      border-bottom-right-radius: 2px;
      border-bottom-left-radius: 2px;
    }
  }
}

.button {
  width: 60px;
  height: 40px;
  background-color: var(--color-light);
  background-repeat: no-repeat;
  background-position: 50% 50%;
  color: var(--color-dark);

  &-filter {
    background-image: url(../../images/filter.svg);
    background-size: 20px 16px;

    > span {
      display: block;
      position: relative;
      top: 3px;
      width: 22px;
      height: 22px;
      margin: auto;
    }

    &.isOpened {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      background-color: var(--color-lotion);
      background-image: none;
    }
  }

  &-category {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 5px 5px 0;
    border-radius: 0;
    font-size: 11px;

    &.isActive {
      color: var(--color-light);
    }
  }
}
</style>
