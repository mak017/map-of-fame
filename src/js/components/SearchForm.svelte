<script>
import { CATEGORIES } from "../constants";
import { permalink } from "../mapUtils/permalink";
import {
  huntersFilter,
  selectedArtist,
  selectedCategory,
  selectedYear,
} from "../store";
import { getCurrentYear, validateYear } from "../utils";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";

export let showSearch;
let year = "";
let artist = "";
let selectedCategories = [];
let isHuntersChecked = true;
let yearErrorMessage = "";
let isSubmitDisabled = false;
const currentYear = getCurrentYear();
const categoriesOrdered = [
  CATEGORIES.walls,
  CATEGORIES.trains,
  CATEGORIES.other,
];

const validateYearInput = () => {
  if (!year) {
    yearErrorMessage = "This field is required";
  } else if (!validateYear(year, false)) {
    yearErrorMessage = `Year is not in range of 1967 - ${currentYear}`;
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
        category: selectedCategories,
        artist,
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
</script>

<form on:submit|preventDefault={handleSubmit}>
  <FormTextInput
    placeholder="Year"
    hint={`1967 - ${currentYear}`}
    bind:value={year}
    on:blur={handleYearBlur}
    errorText={yearErrorMessage} />
  <FormTextInput
    placeholder="Artist/Crew"
    hint="Empty to show all"
    bind:value={artist} />
  <div class="filter">
    {#each categoriesOrdered as category}
      <div class="checkbox">
        <input
          type="checkbox"
          id={`filter-${category.toLowerCase()}`}
          bind:group={selectedCategories}
          value={category} />
        <label for={`filter-${category.toLowerCase()}`}>{category}</label>
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
    padding: 0 12px;
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
