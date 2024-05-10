<script>
import { onMount } from "svelte";
import InfiniteScroll from "svelte-infinite-scroll";
import { goto, params, url } from "@roxi/routify";
import highlightWords from "highlight-words";

import { profileState, searchState } from "./../js/store.js";
import { isMobile } from "./../js/utils/commonUtils.js";
import {
  requestPhotoWall,
  requestSearchArtistsCrews,
} from "./../js/api/search.js";

import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";
import FormRadioButton from "./elements/FormRadioButton.svelte";
import Spinner from "./elements/Spinner.svelte";
import LoupeSvg from "./elements/icons/LoupeSvg.svelte";

import { ERROR_MESSAGES, MAX_ITEMS_PER_PAGE } from "../js/constants";

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
    const response = await requestSearchArtistsCrews(text.toLowerCase());
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
    const response = await requestPhotoWall(
      text.toLowerCase(),
      MAX_ITEMS_PER_PAGE,
      offset,
    );
    const { success, result } = response;
    if (success && result) {
      if (isNewFetch) {
        searchState.setGrid([]);
      }
      newBatch = result.items ? [...result.items] : [];
      searchState.setGrid([...$searchState.grid, ...newBatch]);
      searchState.setGridTotal(result.total);
      searchState.setHasMore(newBatch.length === MAX_ITEMS_PER_PAGE);
      searchState.setIsFetched(true);
    }
    searchState.setIsLoading(false);
    searchState.setIsShowSpinner(false);
  }
};

onMount(() => {
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

$: if (!$searchState.isFetched) {
  if (textFromUrl) {
    fetchArtistsCrews();
    fetchPhotoWall(0, true);
  } else {
    searchState.setIsLoading(false);
    searchState.setIsShowSpinner(false);
  }
}

$: isSubmitDisabled = !!error;

const handleInputChange = () => {
  if (isSubmitDisabled) {
    error = "";
  }

  $goto("/search", { text }, { mode: "replace" });
};

const handleLoadMore = () => {
  if ($searchState.isShowSpinner) {
    return;
  }

  const offset = $searchState.offset + MAX_ITEMS_PER_PAGE;
  searchState.setOffset(offset);
  if ($searchState.currentView === "grid") {
    fetchPhotoWall(offset);
  }
};

const handleSubmit = () => {
  searchState.setCurrentView("list");
  fetchArtistsCrews();
  fetchPhotoWall(0, true);
};

const handleScrollElementClick = (identifier) => () => {
  const element = document.querySelector(
    `[data-scroll-element="${identifier}"]`,
  );
  searchState.setScrollOffset(element.offsetTop);
};

const handleUserClick = (identifier) => () => {
  handleScrollElementClick(identifier)();
  profileState.reset();
};
</script>

<div class="container">
  <form on:submit|preventDefault={handleSubmit}>
    <div class="input-wrapper">
      <FormTextInput
        placeholder="Username or Artist or Crew"
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
    {#if $searchState.list.length || $searchState.grid.length}
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
      <div
        class="search-result {$searchState.currentView}"
        class:isEmpty={!$searchState.list.length && !$searchState.grid.length}>
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
              href={$url("/@:username", { username: item.username })}
              class="list-row"
              data-scroll-element={item.username}
              on:click={handleUserClick(item.username)}>
              <div class="cell username">
                {#if isMobile()}
                  <div class="head">Username</div>
                {/if}
                <div class="value">
                  {#each highlightWords( { text: `@${item.username}`, query: searchedText }, ) as chunk (chunk.key)}
                    <span class:highlight={chunk.match}>{chunk.text}</span>
                  {/each}
                </div>
              </div>
              {#if !isMobile() || item.artist}
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
              {/if}
              {#if !isMobile() || item.crew}
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
              {/if}
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
                <div class="value">{item.followersCnt ?? ""}</div>
              </div>
            </a>
          {/each}
        {:else if $searchState.currentView === "grid" && $searchState.grid.length}
          {#each $searchState.grid as item}
            <a
              href={$url("/@:username/spot/:id", {
                username: item.user.name,
                id: item.id,
              })}
              on:click={handleScrollElementClick(item.id)}
              class="item-wrapper"
              data-scroll-element={item.id}>
              <img
                src={item.thumbnail}
                alt={`${item.artist?.name ?? ""} ${item.crew?.name ?? ""}`} />
              <div class="item">
                <div class="artist">
                  <div class="head">Artist</div>
                  <div class="value">
                    {item.artist?.name ?? ""}
                  </div>
                </div>
                <div class="crew">
                  <div class="head">Crew</div>
                  <div class="value">{item.crew?.name ?? ""}</div>
                </div>
              </div>
            </a>
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

form {
  display: flex;
  position: sticky;
  top: -1px;
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
  top: 120px;
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
    position: sticky;
    top: 120px;
    margin-bottom: 16px;
    background-color: var(--color-light);
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
  grid-auto-rows: 200px;
  grid-gap: min(24px, 4vmin) min(18px, 4vmin);
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  justify-content: space-between;
  width: 100%;

  .item-wrapper {
    transition: color 0.3s;
    color: var(--color-dark);
    text-decoration: none;

    img {
      width: 100%;
      height: calc(100% - 57px);
      border-radius: 2px;
      object-fit: cover;
    }

    &:hover {
      color: var(--color-accent);
    }
  }

  .item {
    display: flex;
    justify-content: space-between;
    margin-top: 12px;
  }

  .head {
    margin-bottom: 4px;
    color: color-mix(in srgb, var(--color-dark) 60%, transparent);
    font-size: 12px;
    line-height: 1.2;
  }

  .value {
    font-size: 14px;
    line-height: 1.2;
  }

  .crew {
    text-align: end;
  }
}

.artist,
.crew {
  overflow: hidden;

  .value {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.search-result.isEmpty {
  display: block;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  grid-column: 1/4;
  grid-row: 1/3;
  padding-top: 10px;
  color: var(--color-dark);

  .img-wrapper {
    position: relative;
    width: 100%;
    max-width: 410px;
  }

  .text1 {
    margin: 20px 0;
    font-size: 18px;
    line-height: 22px;
  }

  .text2 {
    font-size: 24px;
    font-weight: 600;
    line-height: 29px;
  }
}

@media (max-width: 767px) {
  .container {
    align-items: flex-start;
    margin-top: 40px;
  }

  .logo {
    display: none;
  }

  form {
    top: -10px;
    align-items: flex-end;
    width: 100vw;
    margin: 0 -12px;
    padding: 0 12px 20px;
    overflow: hidden;
  }

  .input-wrapper {
    flex: 0 0 min(calc(100% - 56px), 530px);
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
    top: 60px;
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
      border-top: 1px solid
        color-mix(in srgb, var(--color-light-grey) 30%, transparent);

      &:last-of-type {
        border-bottom: 1px solid
          color-mix(in srgb, var(--color-light-grey) 30%, transparent);
      }

      .head {
        color: color-mix(in srgb, var(--color-dark) 60%, transparent);
        font-size: 13px;
      }

      .value {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .username {
        grid-column: 3/5;
        grid-row: 1;
        text-align: end;
      }

      .artist {
        grid-column: 1/3;
        grid-row: 1;
      }

      .crew {
        grid-column: 1/3;
      }

      .spots {
        grid-column: 3;
        text-align: end;
      }

      .followers {
        grid-column: 4;
        text-align: end;
      }
    }

    .item {
      grid-template-columns: minmax(100px, 336px) minmax(100px, 336px);
    }
  }

  .grid {
    row-gap: 24px;
  }
}
</style>
