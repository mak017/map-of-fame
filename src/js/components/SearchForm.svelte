<script>
import { selectedYear } from "./../store.js";
import {
  isMobile,
  loadFromLocalStorage,
  saveToLocalStorage,
} from "./../utils/commonUtils.js";
import {
  requestSearchArtistsCrews,
  requestSearchSpots,
} from "./../api/search.js";
import { permalink } from "../utils/mapUtils/permalink";
import {
  isLighthouseActive,
  isSearchResults,
  markersStore,
  selectedArtist,
  selectedCrew,
} from "../store";

import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";
import GridViewSvg from "./elements/icons/GridViewSvg.svelte";
import ListViewSvg from "./elements/icons/ListViewSvg.svelte";

import { ALL_YEARS_STRING, ERROR_MESSAGES } from "../constants";

const searchHistoryLimit = isMobile() ? 5 : 10;
const EMPTY_ARTIST_OR_CREW = "---";

let artist = "";
let crew = "";
let artistError = "";
let crewError = "";
let currentSearchFor = "";
let fetchedList = [];
let isFetched = false;
let currentView = "list";
let savedPreviousSearches = loadFromLocalStorage("prevSearchResults") || [];
let previousSearches = savedPreviousSearches.slice(0, searchHistoryLimit);

$: isSubmitDisabled = !!artistError || !!crewError;

const saveCurrentSearch = (artist, crew) => {
  if (
    !previousSearches.some(
      (result) => result.artist === artist && result.crew === crew
    )
  ) {
    const updatedSearches = [{ artist, crew }, ...previousSearches];
    saveToLocalStorage("prevSearchResults", updatedSearches);
  }
};

const validateForm = () => {
  if (artist.length === 0 && crew.length === 0) {
    artistError = ERROR_MESSAGES.artistEmpty;
    crewError = ERROR_MESSAGES.crewEmpty;
  }
};

const handleArtistClick = (artist, crew) => {
  saveCurrentSearch(artist, crew);
  requestSearchSpots({ artist, crew }).then((response) => {
    const { success, result } = response;
    if (success && result) {
      selectedArtist.set(artist);
      selectedCrew.set(crew);
      markersStore.set(result);
      isSearchResults.set(true);
      isLighthouseActive.set(false);
      if (result?.spots?.length) {
        selectedYear.set(ALL_YEARS_STRING);
      }
      permalink.update({ params: { artist, crew } });
    }
  });
};

const handleInputChange = () => {
  if (isSubmitDisabled) {
    artistError = "";
    crewError = "";
  }
};

const fetchArtistsCrews = async () => {
  validateForm();
  if (!artistError || !crewError) {
    const response = await requestSearchArtistsCrews(artist, crew);
    const { success, result, errors } = response;
    if (success && result) {
      fetchedList = result;
      isFetched = true;
      currentSearchFor = `${artist} ${crew}`;
    }
    if (!success && errors) {
      artistError = errors.artist?.[0] ?? "";
      crewError = errors.crew?.[0] ?? "";
    }
  }
};
</script>

<div class="container">
  <div class="logo" />
  <form on:submit|preventDefault={fetchArtistsCrews}>
    <div class="input-wrapper">
      <FormTextInput
        placeholder="Artist"
        bind:value={artist}
        on:input={handleInputChange}
        errorText={artistError}
        search={true} />
    </div>
    <div class="input-wrapper">
      <FormTextInput
        placeholder="Crew"
        bind:value={crew}
        on:input={handleInputChange}
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
  {#if isFetched}
    {#if fetchedList.length}
      <div class="content-caption">
        <div class="result">Result: {fetchedList.length}</div>
        <div class="view-controls">
          <button
            class="view-as-list"
            on:click={() => {
              currentView = "list";
            }}><ListViewSvg isActive={currentView === "list"} /></button>
          <button
            class="view-as-grid"
            on:click={() => {
              currentView = "grid";
            }}><GridViewSvg isActive={currentView === "grid"} /></button>
        </div>
      </div>
    {/if}
    <div class="content">
      <div class="search-result {currentView}">
        {#each fetchedList as pair}
          <div
            class="pair-wrapper"
            on:click={() => handleArtistClick(pair.artist, pair.crew)}>
            {#if currentView === "grid"}
              <img
                src={pair.image}
                alt={`${pair.artist ?? ""} ${pair.crew ?? ""}`} />
            {/if}
            <div class="pair">
              <div class="artist">
                {pair.artist ? pair.artist : EMPTY_ARTIST_OR_CREW}
              </div>
              <div class="crew">
                {pair.crew ? pair.crew : EMPTY_ARTIST_OR_CREW}
              </div>
            </div>
          </div>
        {:else}
          <div class="empty">
            <div class="img-wrapper">
              <img
                src="../../images/nothing-found.jpg"
                alt="Artist/Crew Not Found" />
            </div>
            <div class="text1">Artist/Crew Not Found</div>
            <div class="text2">{currentSearchFor}</div>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="content">
      <div class="content-caption">
        <div class="history-icon">
          <img src="../../images/history.svg" alt="Search History icon" />
        </div>
      </div>
      <div class="previous-searches list">
        {#each previousSearches as pair}
          <div
            class="pair-wrapper"
            on:click={() => handleArtistClick(pair.artist, pair.crew)}>
            <div class="pair">
              <div class="artist">
                {pair.artist ? pair.artist : EMPTY_ARTIST_OR_CREW}
              </div>
              <div class="crew">
                {pair.crew ? pair.crew : EMPTY_ARTIST_OR_CREW}
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
  max-width: 940px;
}

.logo {
  display: block;
  position: fixed;
  top: 0;
  left: max(calc((100vw - 940px) / 2), 32px);
  z-index: 1;
  width: 137px;
  height: 76px;
  background: var(--color-accent) url(../../images/logo-test2.png) 50% 50% /
    contain no-repeat;
  /* background: var(--color-accent) url(../../images/logo.svg) 50% 50%/43px 56px
    no-repeat; */
  border-radius: 0 0 2px 2px;
}

form {
  display: grid;
  position: sticky;
  top: -30px;
  grid-column-gap: 24px;
  grid-template-columns: minmax(100px, 336px) minmax(100px, 336px) 140px;
  padding: 15px 0 0 80px;
  background: var(--color-light);
}

.content-caption {
  display: flex;
  position: sticky;
  top: 31px;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 24px;
  padding: 25px 0 0 80px;
  background: var(--color-light);
}

.content {
  width: 100%;
}

.result {
  color: var(--color-dark);
  font-size: 14px;
  line-height: 17px;
}

.view-controls {
  display: flex;
}

button {
  padding: 0;
  border: 0;
  background: 0;
  cursor: pointer;

  + button {
    margin-left: 12px;
  }
}

.list {
  padding-left: 80px;

  .pair-wrapper + .pair-wrapper {
    margin-top: 20px;
  }

  .pair {
    display: grid;
    grid-column-gap: 24px;
    grid-template-columns: minmax(100px, 336px) minmax(100px, 336px) 140px;
  }
}

.grid {
  display: grid;
  grid-auto-rows: 160px;
  grid-gap: 4vmin;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  justify-content: space-between;
  width: 100%;

  img {
    width: 100%;
    height: calc(100% - 40px);
    border-radius: 2px;
    object-fit: cover;
  }

  .pair {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }
}

.pair-wrapper {
  transition: color 0.3s;
  color: var(--color-dark);
  cursor: pointer;

  &:hover {
    color: var(--color-accent);
  }
}

.pair {
  font-size: 24px;
  font-weight: 900;
  line-height: 29px;
}

.artist,
.crew {
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-dark);

  .img-wrapper {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 38.839%;

    > img {
      position: absolute;
      top: 0;
      left: 50%;
      height: auto;
      transform: translateX(-50%);
    }
  }

  .text1 {
    margin: 20px 0;
    font-size: 18px;
    line-height: 22px;
  }

  .text2 {
    font-size: 24px;
    font-weight: 900;
    line-height: 29px;
  }
}

.previous-searches {
  .pair-wrapper {
    color: rgba(#b0b0b3, 0.6);

    &:hover {
      color: var(--color-accent);
    }
  }
}

@media (max-width: 767px) {
  .logo {
    display: none;
  }
  form {
    display: flex;
    position: static;
    flex-direction: column;
    width: 100%;
    max-width: 530px;
    padding: 0;
  }

  .input-wrapper {
    margin: 0 0 4px 0;
  }

  .button-wrapper {
    display: flex;
    margin: 20px 0 0;
  }

  .content-caption {
    top: 8px;
    padding-left: 0;
  }

  .list {
    padding-left: 0;
    .pair {
      grid-template-columns: minmax(100px, 336px) minmax(100px, 336px);
    }
  }
}
</style>
