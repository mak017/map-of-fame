<script>
import { requestSearchArtistsCrews } from "./../api/search.js";
import { ERROR_MESSAGES } from "../constants";
import { permalink } from "../utils/mapUtils/permalink";
import {
  categories,
  huntersFilter,
  selectedArtist,
  selectedCategory,
  selectedYear,
} from "../store";
import { getCurrentYear, isYearLike } from "../utils/commonUtils";
import AutoComplete from "./elements/AutoComplete.svelte";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";
import { validateYear } from "../utils/datesUtils.js";
import { getCategories } from "../api/settings.js";
import { onDestroy } from "svelte";

export let showSearch;
export let yearStart;

let year = "";
let artist;
let selectedCategories = [];
let isHuntersChecked = true;
let yearErrorMessage = "";
let isSubmitDisabled = false;
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
  } else if (!validateYear(year, yearStart, false)) {
    yearErrorMessage = ERROR_MESSAGES.yearNotInRange(yearStart);
  } else {
    yearErrorMessage = "";
  }
};

const validateForm = () => {
  validateYearInput();
};

const handleSubmit = () => {
  validateForm();
  if (!yearErrorMessage) {
    selectedYear.set(year);
    selectedCategory.set(selectedCategories);
    selectedArtist.set(artist);
    huntersFilter.set(isHuntersChecked);
    permalink.update({
      params: {
        category: selectedCategories.map((cat) => cat.id),
        artist: artist?.name,
        hunters: isHuntersChecked,
      },
    });
    showSearch(false);
  } else {
    isSubmitDisabled = true;
  }
};

const handleYearBlur = () => {
  if (isSubmitDisabled) {
    validateYearInput();
    isSubmitDisabled = !!yearErrorMessage;
  }
};

const handleYearChange = () => {
  if (isYearLike(year)) {
    prevYearValue = year;
  } else {
    year = prevYearValue;
  }
};

const handleKeyDown = (event) => {
  const { code } = event.detail;
  isSubmitDisabled &&
    (code === "Enter" || code === "NumpadEnter") &&
    handleSubmit();
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
  <FormTextInput
    placeholder="Year"
    hint={`${yearStart} - ${currentYear}`}
    bind:value={year}
    on:blur={handleYearBlur}
    on:input={handleYearChange}
    on:keyDown={handleKeyDown}
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
          value={category} />
        <label for={`filter-${category.name}`}>{category.name}</label>
      </div>
    {/each}
  </div>
  <div class="bottom">
    <div class="checkbox">
      <input
        type="checkbox"
        bind:checked={isHuntersChecked}
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

@media (max-width: 767px) {
  form {
    width: 100%;
    max-width: 530px;
  }
  .bottom {
    flex-flow: wrap;
    margin-top: -28px;
    .checkbox {
      margin: 28px 0;
    }
  }
  .checkbox {
    + .checkbox {
      margin-left: 8vw;
    }
  }
}
</style>
