<script>
import { onDestroy } from "svelte";
import {
  requestSearchArtistsCrews,
  requestSearchSpots,
} from "./../api/search.js";
import { ERROR_MESSAGES } from "../constants";
import { permalink } from "../utils/mapUtils/permalink";
import {
  huntersFilter,
  isLighthouseActive,
  isSearchResults,
  mapBounds,
  markersStore,
  selectedArtist,
  selectedCategory,
  selectedYear,
} from "../store";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import Spinner from "./elements/Spinner.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";

export let showSearch;

let artist = "";
let crew = "";
let artistError = "";
let crewError = "";
let fetchedList = [];
let isInProgress = false;
let geoRect;

const unsubscribeMapBounds = mapBounds.subscribe((value) => {
  geoRect = value;
});

onDestroy(() => {
  unsubscribeMapBounds();
});

$: isSubmitDisabled = !!artistError || !!crewError;

const validateForm = () => {
  if (artist.length > 0 && artist.length < 3) {
    artistError = ERROR_MESSAGES.fieldMinLength("artist", 3);
  } else if (crew.length > 0 && crew.length < 3) {
    crewError = ERROR_MESSAGES.fieldMinLength("crew", 3);
  }
};

const handleSubmit = () => {
  if (!yearErrorMessage && !categoryErrorMessage) {
    const category = selectedCategories.map((cat) => cat.id);
    const { name } = artist || {};
    isInProgress = true;
    requestSearchSpots({
      year,
      name,
      category,
      showHunters: isHuntersChecked ? 1 : 0,
      geoRect,
    }).then((response) => {
      const { success, result, error } = response;
      isInProgress = false;
      if (success && result) {
        selectedYear.set(year);
        selectedCategory.set(selectedCategories);
        selectedArtist.set(name);
        huntersFilter.set(isHuntersChecked);
        markersStore.set(result);
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

const fetchArtistsCrews = async () => {
  validateForm();
  if (!artistError && !crewError) {
    const response = await requestSearchArtistsCrews(artist, crew);
    const { success, result, errors } = response;
    if (success && result) {
      console.log("result :>> ", result);
      fetchedList = result;
    }
    if (!success && errors) {
      artistError = errors.artist?.[0] ?? "";
      crewError = errors.crew?.[0] ?? "";
    }
  }
};
</script>

<form on:submit|preventDefault={fetchArtistsCrews}>
  <div class="input-wrapper">
    <FormTextInput
      placeholder="Artist"
      bind:value={artist}
      errorText={artistError}
      search={true} />
  </div>
  <div class="input-wrapper">
    <FormTextInput
      placeholder="Crew"
      bind:value={crew}
      errorText={crewError}
      search={true} />
  </div>
  <div class="button-wrapper">
    <ButtonPrimary
      type="submit"
      isDisabled={isSubmitDisabled}
      text="Search"
      className="wide-on-mobile search" />
  </div>
</form>

<style lang="scss">
form {
  display: flex;
  max-width: 860px;
}
.input-wrapper {
  margin: 0 12px;
}
.button-wrapper {
  margin-left: 12px;
}

@media (max-width: 767px) {
  form {
    flex-direction: column;
    width: 100%;
    max-width: 530px;
  }
  .input-wrapper {
    margin: 0 0 4px 0;
  }
  .button-wrapper {
    display: flex;
    margin: 20px 0 0;
  }
}
</style>
