<script>
import { categoriesList } from "../store";
import { loadFromLocalStorage, saveToLocalStorage } from "../utils/commonUtils";
import CategoryIcon from "./elements/CategoryIcon.svelte";
import ArrowLeftSvg from "./elements/icons/ArrowLeftSvg.svelte";

let isOpened = false;
let categories = $categoriesList.filter((category) => !category.isAdditional);
$: categories = $categoriesList.filter((category) => !category.isAdditional);
console.log("categories :>> ", categories);
const selectedCategories = loadFromLocalStorage("categories") || [1];

const handleCategoryClick = (id) => {
  const isSelected = selectedCategories.includes(id);
  const updatedCategories = isSelected
    ? selectedCategories.filter((categoryId) => categoryId !== id)
    : [...selectedCategories, id];
  saveToLocalStorage("categories", updatedCategories);
};

const isCategoryActive = (id) => selectedCategories.includes(id);
</script>

<div class="wrapper">
  <button
    type="button"
    class="button button-filter"
    class:isOpened
    on:click={() => (isOpened = !isOpened)}>
    {#if isOpened}
      <span>
        <ArrowLeftSvg isDarkColor isArrowUp />
      </span>
    {/if}
  </button>
  {#if isOpened}
    <ul class="options">
      {#each categories as category}
        <li>
          <button
            type="button button-category"
            class={`button category-${category.id}`}
            class:isActive={isCategoryActive(category.id)}
            on:click={() => handleCategoryClick(category.id)}>
            <CategoryIcon
              categoryId={category.id}
              isActive={isCategoryActive()} />
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
}

.button {
  width: 60px;
  height: 40px;
  background-color: var(--color-light);
  background-repeat: no-repeat;
  background-position: 50% 50%;

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
      background-color: var(--color-lotion);
      background-image: none;
    }
  }

  &-category {
  }
}
</style>
