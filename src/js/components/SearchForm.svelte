<script>
import { onDestroy } from "svelte";
import FormTelInput from "./elements/FormTelInput.svelte";
import {
  requestSearchArtistsCrews,
  requestSearchSpots,
} from "./../api/search.js";
import { ERROR_MESSAGES } from "../constants";
import { permalink } from "../utils/mapUtils/permalink";
import {
  categories,
  huntersFilter,
  isLighthouseActive,
  isSearchResults,
  markersStore,
  selectedArtist,
  selectedCategory,
  selectedYear,
} from "../store";
import { getCurrentYear, isYearLike } from "../utils/commonUtils";
import AutoComplete from "./elements/AutoComplete.svelte";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import { validateYear } from "../utils/datesUtils.js";
import { getCategories } from "../api/settings.js";

export let showSearch;
export let yearStart;

let year = "";
let artist;
let selectedCategories = [];
let isHuntersChecked = true;
let yearErrorMessage = "";
let categoryErrorMessage = "";
let isSubmitDisabled = false;
let isInProgress = false;
let prevYearValue = "";
let enteredSearchValue = "";
let categoriesList;
const currentYear = getCurrentYear();

const unsubscribeCategories = categories.subscribe(
  (value) => (categoriesList = value)
);

onDestroy(() => {
  unsubscribeCategories();
});

$: isSubmitDisabled =
  !!yearErrorMessage || !!categoryErrorMessage || isInProgress;

const hasCategories = () =>
  Array.isArray(categoriesList) && categoriesList.length;

if (!hasCategories()) {
  getCategories().then((response) => {
    const { status, data } = response;
    if (status && data) {
      categories.set(data);
    }
  });
}

const validateYearInput = () => {
  if (!year) {
    yearErrorMessage = ERROR_MESSAGES.genericEmpty;
  } else if (!validateYear(year, yearStart)) {
    yearErrorMessage = ERROR_MESSAGES.yearNotInRange(yearStart);
  } else {
    yearErrorMessage = "";
  }
};

const validateCategories = () => {
  categoryErrorMessage = !selectedCategories.length
    ? ERROR_MESSAGES.categoryEmpty
    : "";
};

const validateForm = () => {
  validateYearInput();
  validateCategories();
};

const handleSubmit = () => {
  validateForm();
  if (!yearErrorMessage && !categoryErrorMessage) {
    const category = selectedCategories.map((cat) => cat.id);
    const { name } = artist || {};
    isInProgress = true;
    requestSearchSpots({
      year,
      name,
      category,
      showHunters: isHuntersChecked ? 1 : 0,
    }).then((response) => {
      const { status, data, error } = response;
      isInProgress = false;
      if (status && data) {
        selectedYear.set(year);
        selectedCategory.set(selectedCategories);
        selectedArtist.set(artist);
        huntersFilter.set(isHuntersChecked);
        markersStore.set(data);
        isSearchResults.set(true);
        isLighthouseActive.set(false);
        permalink.update({
          params: {
            category,
            artist: name,
            hunters: isHuntersChecked,
          },
        });
        showSearch(false);
      }
      if (error) {
        const { category } = error;
        categoryErrorMessage = category ? ERROR_MESSAGES.categoryEmpty : "";
      }
    });
  }
};

const handleYearChange = () => {
  if (isYearLike(year)) {
    prevYearValue = year;
  } else {
    year = prevYearValue;
  }
  if (isSubmitDisabled || yearErrorMessage || categoryErrorMessage) {
    yearErrorMessage = "";
  }
};

const handleCategoryChange = () => {
  if (isSubmitDisabled || yearErrorMessage || categoryErrorMessage) {
    categoryErrorMessage = "";
  }
};

const getOptionLabel = (option) => option.name;

const fetchArtistsCrews = async (filterText) => {
  const text = filterText ? filterText.replace(" ", "_") : "";
  enteredSearchValue = filterText;
  if (text.length > 2) {
    const response = await requestSearchArtistsCrews(filterText);
    const { status, data } = response;
    if (status && data) {
      return data;
    }
  } else {
    return new Promise((_, reject) => {
      reject();
    });
  }
};
</script>

<form on:submit|preventDefault={handleSubmit}>
  <FormTelInput
    placeholder="Year"
    hint={`${yearStart} - ${currentYear}`}
    bind:value={year}
    on:input={handleYearChange}
    errorText={yearErrorMessage}
    isYear />
  <AutoComplete
    bind:selectedValue={artist}
    optionIdentifier="name"
    {getOptionLabel}
    loadOptions={fetchArtistsCrews}
    filterValue={enteredSearchValue}
    placeholder="Artist or Crew"
    hint="Leave empty to show all artists and crews" />
  <div class="filter">
    {#each categoriesList as category}
      <div class="checkbox">
        <input
          type="checkbox"
          id={`filter-${category.name}`}
          bind:group={selectedCategories}
          value={category}
          on:change={isSubmitDisabled && validateForm()} />
        <label for={`filter-${category.name}`}>{category.name}</label>
      </div>
    {/each}
    {#if categoryErrorMessage}
      <div class="error">{categoryErrorMessage}</div>
    {/if}
  </div>
  <div class="bottom">
    <div class="checkbox">
      <input
        type="checkbox"
        bind:checked={isHuntersChecked}
        on:change={handleCategoryChange}
        id="search-show-hunters-spots" />
      <label for="search-show-hunters-spots">Show Hunter's Spots</label>
    </div>
    <ButtonPrimary
      type="submit"
      isDisabled={isSubmitDisabled}
      text="Search"
      className="wide-on-mobile" />
  </div>
</form>

<style lang="scss">
.filter {
  margin-bottom: 36px;
}
.checkbox {
  display: inline-block;
  position: relative;
  padding-left: 37px;
  input {
    position: absolute;
    left: -9999px;
    clip: rect(0 0 0 0);
    opacity: 0;
  }
  label {
    font-size: 14px;
    line-height: 17px;
    color: var(--color-dark);
    cursor: pointer;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 22px;
      height: 22px;
      border: 1px solid var(--color-accent);
      border-radius: 2px;
    }
    &::after {
      content: "";
      position: absolute;
      top: 7px;
      left: 4px;
      width: 14px;
      height: 9px;
      background: url(../../images/checkbox.svg) 50% 50% / contain no-repeat;
      transform: scale(0);
      transition: transform 0.3s;
    }
  }
  input:checked + label {
    &::before {
      background-color: var(--color-accent);
    }
    &::after {
      transform: scale(1);
    }
  }
  + .checkbox {
    margin-left: 48px;
  }
}

.bottom {
  display: flex;
  align-items: center;
  .checkbox {
    margin-right: 68px;
  }
}

.error {
  margin: 4px 0 -20px;
  color: var(--color-error);
  font-size: 13px;
  line-height: 1.25;
}

@media (max-width: 767px) {
  form {
    width: 100%;
    max-width: 530px;
  }
  .bottom {
    flex-flow: wrap;
    .checkbox {
      margin: 28px 0;
    }
  }
  .filter {
    margin-bottom: 8px;
  }
  .checkbox {
    + .checkbox {
      margin-left: 8vw;
    }
  }
}
</style>
