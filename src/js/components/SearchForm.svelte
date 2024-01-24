<script>
import { onMount } from "svelte";
import InfiniteScroll from "svelte-infinite-scroll";
import { goto, params, url } from "@roxi/routify";
import highlightWords from "highlight-words";

import { searchState } from "./../store.js";
import { isMobile } from "./../utils/commonUtils.js";
import {
  requestPhotoWall,
  requestSearchArtistsCrews,
} from "./../api/search.js";

import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";
import FormRadioButton from "./elements/FormRadioButton.svelte";
import Spinner from "./elements/Spinner.svelte";
import LoupeSvg from "./elements/icons/LoupeSvg.svelte";

import { ERROR_MESSAGES, MAX_SPOTS_PER_PAGE } from "../constants";

let { text: textFromUrl } = $params;

let text = textFromUrl ?? "";
let searchedText = "";
let error = "";
let newBatch = [];
let parentModal = null;

const validateForm = () => {
  if (text.length === 0) {
    error = ERROR_MESSAGES.searchTextEmpty;
  }
};

const fetchArtistsCrews = async () => {
  validateForm();
  if (!error) {
    searchState.setIsLoading(true);
    searchState.setIsShowSpinner(true);
    const response = await requestSearchArtistsCrews(text);
    const { success, result } = response;
    if (success && result) {
      searchState.setList(result);
      searchState.setIsFetched(true);
      searchedText = text;
    }
    searchState.setIsLoading(false);
    searchState.setIsShowSpinner(false);
  }
};

const fetchPhotoWall = async (offset = 0, isNewFetch) => {
  validateForm();
  if (!error) {
    searchState.setIsLoading(isNewFetch);
    searchState.setIsShowSpinner(true);
    const response = await requestPhotoWall(text, MAX_SPOTS_PER_PAGE, offset);
    const { success, result } = response;
    if (success && result) {
      if (isNewFetch) {
        searchState.setGrid([]);
      }
      newBatch = result.items ? [...result.items] : [];
      searchState.setGrid([...$searchState.grid, ...newBatch]);
      searchState.setGridTotal(result.total);
      searchState.setHasMore(newBatch.length === MAX_SPOTS_PER_PAGE);
      searchState.setIsFetched(true);
    }
    searchState.setIsLoading(false);
    searchState.setIsShowSpinner(false);
  }
};

onMount(() => {
  if (textFromUrl) {
    fetchArtistsCrews();
    fetchPhotoWall(0, true);
  } else {
    searchState.setIsLoading(false);
    searchState.setIsShowSpinner(false);
  }

  parentModal = document.getElementById("search-modal");

  if ($searchState.scrollOffset) {
    setTimeout(() => {
      parentModal.scrollTo({
        top: $searchState.scrollOffset - parentModal.offsetHeight / 2,
      });
      searchState.setScrollOffset(0);
    }, 0);
  }
});

$: isSubmitDisabled = !!error;

const handleInputChange = () => {
  if (isSubmitDisabled) {
    error = "";
  }

  $goto("/search", { text });
};

const handleLoadMore = () => {
  if ($searchState.isShowSpinner) {
    return;
  }

  const offset = $searchState.offset + MAX_SPOTS_PER_PAGE;
  searchState.setOffset(offset);
  if ($searchState.currentView === "grid") {
    fetchPhotoWall(offset);
  }
};

const handleSubmit = () => {
  fetchArtistsCrews();
  fetchPhotoWall(0, true);
};
</script>

<div class="container">
  <div class="logo" />
  <form on:submit|preventDefault={handleSubmit}>
    <div class="input-wrapper">
      <FormTextInput
        placeholder="Artist/Crew"
        bind:value={text}
        on:input={handleInputChange}
        errorText={error}
        search={true} />
    </div>
    <div class="button-wrapper">
      <ButtonPrimary
        type="submit"
        isDisabled={isSubmitDisabled}
        text="Search"
        withLoader={$searchState.isLoading}
        hideText={isMobile()}
        className="wide-on-mobile search">
        <div slot="icon" class="icon">
          {#if isMobile()}
            <LoupeSvg />
          {/if}
        </div>
      </ButtonPrimary>
    </div>
  </form>
  {#if $searchState.isFetched}
    {#if $searchState.list.length}
      <div class="content-caption">
        <div class="view-controls">
          <FormRadioButton
            id="view-as-list"
            group={$searchState.currentView}
            on:change={() => searchState.setCurrentView("list")}
            value="list"
            label={$searchState.list.length
              ? `Artist (${$searchState.list.length})`
              : "Artist"} />
          <FormRadioButton
            id="view-as-grid"
            group={$searchState.currentView}
            on:change={() => searchState.setCurrentView("grid")}
            value="grid"
            label={$searchState.gridTotal
              ? `Art (${$searchState.gridTotal})`
              : "Art"} />
        </div>
      </div>
    {/if}
    <div class="content">
      <div class="search-result {$searchState.currentView}">
        {#if $searchState.currentView == "list" && $searchState.list.length}
          {#if !isMobile()}
            <div class="list-head">
              <div class="cell">Username</div>
              <div class="cell">Artist</div>
              <div class="cell">Crew</div>
              <div class="cell spots">Spots</div>
              <div class="cell followers">Followers</div>
            </div>
          {/if}
          {#each $searchState.list as item}
            <a
              class="list-row"
              href={$url("/@:username", { username: item.username })}>
              <div class="cell username">
                {#if isMobile()}
                  <div class="head">Username</div>
                {/if}
                <div class="value">
                  {#each highlightWords( { text: item.username, query: searchedText }, ) as chunk (chunk.key)}
                    <span class:highlight={chunk.match}>{chunk.text}</span>
                  {/each}
                </div>
              </div>
              <div class="cell artist">
                {#if isMobile()}
                  <div class="head">Artist</div>
                {/if}
                <div class="value">
                  {#if item.artist}
                    {#each highlightWords( { text: item.artist, query: searchedText }, ) as chunk (chunk.key)}
                      <span class:highlight={chunk.match}>{chunk.text}</span>
                    {/each}
                  {/if}
                </div>
              </div>
              <div class="cell crew">
                {#if isMobile()}
                  <div class="head">Crew</div>
                {/if}
                <div class="value">
                  {#if item.crew}
                    {#each highlightWords( { text: item.crew, query: searchedText }, ) as chunk (chunk.key)}
                      <span class:highlight={chunk.match}>{chunk.text}</span>
                    {/each}
                  {/if}
                </div>
              </div>
              <div class="cell spots">
                {#if isMobile()}
                  <div class="head">Spots</div>
                {/if}
                <div class="value">{item.spotsCount ?? ""}</div>
              </div>
              <div class="cell followers">
                {#if isMobile()}
                  <div class="head">Followers</div>
                {/if}
                <div class="value">{item.followers ?? ""}</div>
              </div>
            </a>
          {/each}
        {:else if $searchState.currentView === "grid" && $searchState.grid.length}
          {#each $searchState.grid as item}
            <div class="item-wrapper">
              <img
                src={item.thumbnail}
                alt={`${item.artist ?? ""} ${item.crew ?? ""}`} />
              <div class="item">
                <div class="artist">
                  <div class="head">Artist</div>
                  <div class="value">
                    {item.artistCrew[0].artist?.name ?? ""}
                  </div>
                </div>
                <div class="crew">
                  <div class="head">Crew</div>
                  <div class="value">{item.artistCrew[0].crew?.name ?? ""}</div>
                </div>
              </div>
            </div>
          {/each}
          {#if $searchState.isShowSpinner}
            <div class="spinner-container">
              <Spinner margin="20px auto" />
            </div>
          {/if}
        {:else}
          <div class="empty">
            <div class="img-wrapper">
              <img
                src="../../images/nothing-found.jpg"
                alt="Artist/Crew Not Found" />
            </div>
            <div class="text1">
              {$searchState.currentView === "list"
                ? "Artist/Crew Not Found"
                : "Nothing found"}
            </div>
            <div class="text2">{searchedText}</div>
          </div>
        {/if}
        {#if parentModal}
          <InfiniteScroll
            hasMore={$searchState.hasMore}
            threshold={50}
            on:loadMore={handleLoadMore}
            elementScroll={parentModal} />
        {/if}
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
  top: 15px;
  left: max(calc((100vw - 940px) / 2), 32px);
  z-index: 2;
  width: 132px;
  height: 51px;
  background: url(../../images/logo.png) 50% 50% / contain no-repeat;
  border-radius: 0 0 2px 2px;
}

form {
  display: flex;
  position: sticky;
  top: -70px;
  z-index: 1;
  width: 100%;
  padding-top: 75px;
  background: var(--color-light);
}

.input-wrapper {
  flex: 1 0 auto;
  margin-right: 16px;
}

.content-caption {
  display: flex;
  position: sticky;
  top: 51px;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 8px;
  padding: 20px 0 16px;
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
  width: 220px;
}

.list {
  &-head,
  &-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr) 0.5fr 0.5fr;
  }

  &-head {
    margin-bottom: 16px;
    color: color-mix(in srgb, var(--color-dark) 60%, transparent);
    font-size: 13px;
    font-weight: 400;
  }

  &-row {
    margin-bottom: 24px;
    transition: color 0.3s;
    color: var(--color-dark);
    font-size: 16px;
    font-weight: 400;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      color: var(--color-accent);
    }
  }

  .spots,
  .followers {
    text-align: center;
  }

  .item-wrapper + .item-wrapper {
    margin-top: 20px;
  }

  .item {
    display: grid;
    grid-column-gap: 24px;
    grid-template-columns: minmax(100px, 336px) minmax(100px, 336px) 140px;
  }
}

.highlight {
  background: var(--color-highlight);
}

.grid {
  display: grid;
  grid-auto-rows: 160px;
  grid-gap: min(38px, 4vmin) min(18px, 4vmin);
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  justify-content: space-between;
  width: 100%;

  img {
    width: 100%;
    height: calc(100% - 40px);
    border-radius: 2px;
    object-fit: cover;
  }

  .item-wrapper {
    transition: color 0.3s;
    color: var(--color-dark);
  }

  .item {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }

  .head {
    margin-bottom: 4px;
    color: color-mix(in srgb, var(--color-dark) 60%, transparent);
    font-size: 13px;
  }

  .value {
    font-size: 14px;
  }
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
  grid-column: 1/4;
  grid-row: 1/3;
  color: var(--color-dark);

  .img-wrapper {
    position: relative;
    width: 100%;
    max-width: 410px;
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
  .item-wrapper {
    color: rgba(#b0b0b3, 0.6);

    &:hover {
      color: var(--color-accent);
    }
  }
}

@media (max-width: 767px) {
  .container {
    align-items: flex-start;
    margin-top: 20px;
  }

  .logo {
    display: none;
  }
  form {
    top: -50px;
    align-items: flex-end;
    width: 100%;
    max-width: 530px;
    padding: 0 0 20px;
    overflow: hidden;
  }

  .input-wrapper {
    flex: 0 0 calc(100% - 56px);
  }

  .button-wrapper {
    display: flex;
    flex: 0 0 40px;
    height: 40px;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .content-caption {
    top: 0;
    width: 100vw;
    margin: 0 -12px;
    padding: 4px 12px 16px;
  }

  .list {
    padding-left: 0;

    &-row {
      grid-template-columns: repeat(4, 1fr);
      row-gap: 8px;
      margin: 0 -12px;
      padding: 12px;
      border-top: 1px solid var(--color-light-grey);

      &:last-of-type {
        border-bottom: 1px solid var(--color-light-grey);
      }

      .head {
        color: color-mix(in srgb, var(--color-dark) 60%, transparent);
        font-size: 13px;
      }

      .username,
      .artist {
        grid-column: 1/3;
      }

      .crew {
        grid-column: 3/5;
        text-align: end;
      }

      .spots {
        grid-column: 4;
        grid-row: 1;
        text-align: end;
      }

      .followers {
        grid-column: 3;
        grid-row: 1;
        text-align: end;
      }
    }

    .item {
      grid-template-columns: minmax(100px, 336px) minmax(100px, 336px);
    }
  }

  .grid {
    row-gap: 38px;
  }
}
</style>
