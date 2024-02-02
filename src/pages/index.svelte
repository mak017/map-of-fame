<script>
import { onDestroy, onMount } from "svelte";
import { fade } from "svelte/transition";
import L from "leaflet";
import "@bopen/leaflet-area-selection/dist/index.css";
import { goto, url } from "@roxi/routify";

import { requestSpots } from "../js/init.js";
import {
  areaSelection,
  areaSpots,
  map,
  shouldShowAddSpot,
  currentZoom,
  isSpotsFromAreaLoading,
  isInitialized,
  isFirstTimeVisit,
  isLoggedIn,
  isShowOnMapMode,
  selectedArtist,
  selectedCrew,
  selectedYear,
  selectedUserProfileData,
  shouldShowResetPassword,
  userData,
  isAreaSelectionActive,
  isPermalinkReady,
  profileState,
  areaCoords,
  withHunters,
  isMenuOpen,
} from "../js/store.js";
import {
  clickOutside,
  debounce,
  getCurrentYear,
  getInviteData,
  saveToLocalStorage,
} from "../js/utils/commonUtils";
import { useObserver } from "./../js/utils/mapUtils/geoSearch.js";
import { setLocation } from "../js/utils/mapUtils/locationUtils.js";
import { permalink } from "../js/utils/mapUtils/permalink";
import { newMarkerIcon } from "../js/utils/mapUtils/icons";

import Modal from "../js/components/Modal.svelte";
import CategoryFilter from "../js/components/CategoryFilter.svelte";
import Spinner from "../js/components/elements/Spinner.svelte";
import CloseCrossSvg from "../js/components/elements/icons/CloseCrossSvg.svelte";
import HuntersSvg from "../js/components/elements/icons/HuntersSvg.svelte";
import SelectIndicatorSvg from "../js/components/elements/icons/SelectIndicatorSvg.svelte";
import AddSpot from "../js/components/addSpot/AddSpot.svelte";
import ResetPassword from "../js/components/auth/ResetPassword.svelte";

import { ALL_YEARS_STRING, MIN_ZOOM } from "../js/constants";
import Menu from "../js/components/Menu.svelte";

let isAddSpotSidebarVisible = false;
let inviteData = getInviteData();

let newMarker;

let selectedSearch = "Artist";
let isSearchSelectorOpened = false;
let searchArtistText = "";

const updatePermalink = () => permalink.update({ mapContainer: $map });

if ($isFirstTimeVisit) {
  saveToLocalStorage("isKnownUser", true);
  isFirstTimeVisit.set(false);
}

if ($map && $isPermalinkReady) {
  updatePermalink();
}

if ($map && $isInitialized && !$isPermalinkReady) {
  permalink.setup($map);
  isPermalinkReady.set(true);
}

onMount(() => {
  $map.on("moveend", updatePermalink);
  useObserver();
});

onDestroy(() => {
  $map.off("moveend", updatePermalink);
});

const showAuth = (show) => (showAuthContainer = show);
const toggleAddSpotSidebarVisible = (toggle) =>
  (isAddSpotSidebarVisible = toggle);

const toggleAreaSelectionMode = (toggle) => {
  isAreaSelectionActive.set(toggle);
  areaSpots.set(null);

  if (toggle) {
    selectedYear.set(ALL_YEARS_STRING);
    $map.setMinZoom(15);
    $areaSelection.activate();
    return;
  }

  const yearFromUrl = permalink.getDataFromUrl().year;
  const year =
    yearFromUrl && yearFromUrl !== ALL_YEARS_STRING
      ? yearFromUrl
      : getCurrentYear();

  requestSpots(year);
  selectedYear.set(year);
  $map.setMinZoom(MIN_ZOOM);
  $map.dragging.enable();
  $areaSelection.deactivate();
  isShowOnMapMode.set(false);
  document.getElementById("highlighted").innerHTML = "";
};

if (inviteData) {
  showAuth(true);
}

const handleNewMarkerMoveEnd = () => {
  if (!isAddSpotSidebarVisible) {
    toggleAddSpotSidebarVisible(true);
  }
};

const handleNewMarkerCancel = () => {
  if (newMarker) {
    quitAddSpot();
    newMarker.removeEventListener("moveend", handleNewMarkerMoveEnd);
    $map.removeLayer(newMarker);
  }
};

onDestroy(() => {
  handleNewMarkerCancel();
});

const showAddSpot = () => {
  const center = $map.getCenter();
  newMarker = L.marker(center, {
    draggable: true,
    icon: newMarkerIcon,
    zIndexOffset: 10000,
  });
  $map.addLayer(newMarker);
  newMarker.addEventListener("moveend", handleNewMarkerMoveEnd);
  shouldShowAddSpot.set(true);
};

$: if ($shouldShowAddSpot) showAddSpot();
$: if ($shouldShowAddSpot === false) handleNewMarkerCancel();

const quitAddSpot = () => {
  shouldShowAddSpot.set(false);
  toggleAddSpotSidebarVisible(false);
};

const handleKeyDown = (e) => {
  if (e.key === "Escape") {
    if ($shouldShowAddSpot) {
      quitAddSpot();
      return;
    }

    if ($isAreaSelectionActive) {
      toggleAreaSelectionMode(false);
    }
  }
};

const handleSearchInput = () => {
  if (searchArtistText) {
    $goto("/search", { text: searchArtistText });
  }
};

const debouncedSearchChange = () => debounce(handleSearchInput, 1000);
</script>

<svelte:window on:keydown={handleKeyDown} />
{#if $shouldShowResetPassword}
  <Modal
    id="reset-password-modal"
    title="Reset Password"
    on:close={() => shouldShowResetPassword.set(false)}>
    <ResetPassword />
  </Modal>
{:else}
  <div class="main-top_left_wrapper">
    {#if !$shouldShowAddSpot || ($shouldShowAddSpot && !isAddSpotSidebarVisible)}
      <a
        href={$url("/calendar")}
        class="button button-main_screen button-open_calendar"
        class:inactive={$isAreaSelectionActive}
        transition:fade={{ duration: 200 }}>{$selectedYear}</a>
    {/if}
    {#if !$shouldShowAddSpot && !$isShowOnMapMode && !$isAreaSelectionActive}
      <div class="hunters-switcher">
        <HuntersSvg isActive={$withHunters} />
        <button
          type="button"
          class="button button-main_screen"
          class:isActive={$withHunters}
          on:click={() => {
            withHunters.set(!$withHunters);
            requestSpots($selectedYear);
          }}>
          <span>Hunters</span>
        </button>
      </div>
    {/if}
  </div>

  {#if !$selectedUserProfileData.artist && !$isAreaSelectionActive && !$isShowOnMapMode}
    <CategoryFilter />
  {/if}

  <div class="main-top_right_wrapper">
    {#if !$shouldShowAddSpot && !$isAreaSelectionActive}
      {#if !($selectedArtist || $selectedCrew) && !$isShowOnMapMode}
        <div
          class="search search-artist"
          class:isArtistSearch={selectedSearch === "Artist"}
          class:isAddressSearch={selectedSearch === "Address"}>
          <div
            class="search-select"
            class:isSearchSelectorOpened
            use:clickOutside
            on:click_outside={() => (isSearchSelectorOpened = false)}>
            <div
              class="selected"
              on:click={() =>
                (isSearchSelectorOpened = !isSearchSelectorOpened)}>
              {selectedSearch} <span><SelectIndicatorSvg /></span>
            </div>
            <div class="options">
              <div
                class="item"
                on:click={() => {
                  selectedSearch =
                    selectedSearch === "Artist" ? "Address" : "Artist";
                  isSearchSelectorOpened = false;
                }}>
                {selectedSearch === "Artist" ? "Address" : "Artist"}
              </div>
            </div>
          </div>
          <form on:submit|preventDefault={handleSearchInput}>
            <input
              type="text"
              placeholder="Search"
              bind:value={searchArtistText} />
          </form>
        </div>
        {#if $isLoggedIn}
          <button
            class="button button-main_screen button-square button-burger"
            on:click={() => {
              isMenuOpen.set(true);
            }}
            in:fade={{ duration: 200 }}>Profile</button>
        {:else}
          <a
            href={$url("/login")}
            class="button button-main_screen button-square button-open_login"
            >Login</a>
        {/if}
      {:else}
        <div class="selection selected-artist">
          <span
            >{$selectedArtist || $selectedUserProfileData?.artist?.name || ""}
            {$selectedCrew || $selectedUserProfileData?.crew?.name || ""}</span>
          <button
            class="button button-square button-clear_search"
            on:click|stopPropagation={() => {
              $selectedYear === ALL_YEARS_STRING &&
                selectedYear.set(`${getCurrentYear()}`);
              requestSpots($selectedYear);
              selectedUserProfileData.set({});
              selectedArtist.set("");
              selectedCrew.set("");
              isShowOnMapMode.set(false);
              permalink.update({ clearParams: "all" });
              document.getElementById("highlighted").innerHTML = "";
            }}>
            <CloseCrossSvg isLight />
          </button>
        </div>
      {/if}
    {:else if $isAreaSelectionActive && ($areaSpots || $isSpotsFromAreaLoading)}
      <a
        href={$url("/selected-spots", {
          poly: $areaCoords,
        })}
        class="selection selected-area-spots"
        class:active={!$isSpotsFromAreaLoading && $areaSpots.length > 0}
        transition:fade={{ duration: 200 }}>
        {#if $isSpotsFromAreaLoading}
          <Spinner height={20} margin="10px" isWhite />
        {:else if $areaSpots}
          <span>{$areaSpots?.length} Spots Selected</span>
        {/if}
      </a>
    {/if}
  </div>

  {#if !$selectedUserProfileData.artist?.name && !$isAreaSelectionActive && !$isShowOnMapMode}
    <button
      class="button button-main_screen button-square button-location"
      on:click={() => setLocation($map, true)}
      transition:fade={{ duration: 200 }}
      title="Go to your location" />
  {/if}

  {#if !$shouldShowAddSpot && !$selectedUserProfileData.artist?.name && ($isAreaSelectionActive || $currentZoom > 14)}
    <button
      class="button button-main_screen button-square button-select_area"
      class:active={$isAreaSelectionActive}
      on:click={() => toggleAreaSelectionMode(!$isAreaSelectionActive)}
      transition:fade={{ duration: 200 }}
      title={$isAreaSelectionActive
        ? "Cancel area selection mode"
        : "Activate area selection mode"}>
      {#if $isAreaSelectionActive}
        <CloseCrossSvg />
      {/if}
    </button>
  {/if}

  {#if $isLoggedIn && !$isAreaSelectionActive && !$isShowOnMapMode}
    <AddSpot
      {isAddSpotSidebarVisible}
      {showAddSpot}
      {newMarker}
      onCancel={handleNewMarkerCancel} />
  {/if}

  {#if $isMenuOpen}
    <Menu />
  {/if}
{/if}

<style lang="scss">
.button {
  &-main_screen {
    background: var(--color-light);
    color: var(--color-dark);
  }

  &-square {
    width: 40px;
    height: 40px;
  }

  &-open_calendar {
    display: flex;
    align-items: center;
    position: relative;
    min-width: 114px;
    height: 40px;
    padding: 0 36px;
    text-decoration: none;
    text-transform: uppercase;
    user-select: none;

    &::before {
      content: "";
      position: absolute;
      top: 13px;
      left: 13px;
      width: 14px;
      height: 14px;
      background: url(../images/calendar.svg);
    }

    &::after {
      content: "";
      position: absolute;
      top: 18px;
      right: 18px;
      width: 8px;
      height: 5px;
      background: url(../images//triangle-down.svg);
    }

    &.inactive {
      background: var(--color-lotion);
      color: var(--color-grey);
      pointer-events: none;

      &::before,
      &::after {
        opacity: 0.5;
      }
    }
  }

  &-open_login {
    background-image: url(../images/lock.svg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 9px 17px;
    color: transparent;
    font-size: 0;
  }

  &-select_area {
    position: absolute;
    right: 18px;
    bottom: 18px;
    background-image: url(../images/area-select.svg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 22px 24px;

    &.active {
      background-image: none;
    }
  }

  &-burger {
    background-image: url(../images/burger.svg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 18px 13px;
    color: transparent;
    font-size: 0;
  }

  &-location {
    display: flex;
    position: absolute;
    bottom: 18px;
    left: 70px;
    background-image: url(../images/target.svg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 20px 20px;
  }

  &-clear_search {
    margin-left: 5px;
    padding: 8px;
    background-color: transparent;
  }
}

.hunters-switcher {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  width: 40px;
  height: 40px;
  border-radius: 2px;
  background: var(--color-light);
  color: var(--color-dark);

  > button {
    position: absolute;
    left: 0;
    height: 40px;
    padding: 8px 12px;
    transform: scaleX(0.5);
    transform-origin: left;
    transition:
      visibility 0.3s 0.5s ease-in-out,
      transform 0.3s 0.5s ease-in-out;
    visibility: hidden;

    > span {
      display: flex;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s 0.3s ease-in-out;

      &::before {
        content: "";
        width: 24px;
        height: 15px;
        margin-right: 12px;
        border-radius: 15px;
        background-color: var(--color-dark);
        transition: background-color 0.3s;
      }

      &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 13px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        transform: translateY(-50%);
        background-color: var(--color-light);
        transition: transform 0.3s;
      }
    }

    &.isActive {
      span {
        &::before {
          background-color: var(--color-accent);
        }

        &::after {
          transform: translate(10px, -50%);
        }
      }
    }
  }

  &:hover {
    > button {
      transform: scaleX(1);
      transition:
        visibility 0.3s ease-in-out,
        transform 0.3s ease-in-out;
      visibility: visible;

      > span {
        opacity: 1;
        transition: opacity 0.3s 0.3s ease-in-out;
      }
    }
  }
}

.search-artist {
  display: flex;
  position: absolute;
  right: 40px;
  margin-right: 52px;
  opacity: 0;
  visibility: hidden;

  .search-select {
    position: relative;
    width: 112px;
    border-right: 1px solid var(--color-grey);

    .selected {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
      padding: 0 12px;
      cursor: pointer;

      > span {
        transition: transform 0.3s;
        line-height: 0;
      }
    }

    .options {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      opacity: 0;
      visibility: hidden;

      .item {
        padding: 0 12px 8px;
        cursor: pointer;
      }
    }

    &.isSearchSelectorOpened {
      background-color: var(--color-lotion);

      .selected > span {
        transform: rotate(180deg);
      }

      .options {
        border-radius: 0 0 2px 2px;
        opacity: 1;
        visibility: visible;
        background-color: inherit;
      }
    }
  }

  input {
    width: 280px;
    height: 40px;
    max-width: 100%;
    padding: 6px 12px;
    border: 0;
    background-color: var(--color-light);
    color: var(--color-dark);
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;

    &::placeholder {
      color: var(--color-dark);
      font-weight: normal;
    }

    &:focus {
      outline: 0;
    }
  }

  &.isAddressSearch {
    margin-right: 332px;
    form {
      display: none;
    }
  }
}

.selection {
  display: flex;
  align-items: center;
  height: 40px;
  border-radius: 2px;
  background: var(--color-accent);
  color: var(--color-light);
  font-size: 14px;
  line-height: 17px;

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.selected-artist {
  justify-content: space-between;
  width: 186px;
  padding-left: 16px;

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.selected-area-spots {
  width: 180px;
  padding-left: 40px;
  background-image: url(../images/list.svg);
  background-repeat: no-repeat;
  background-position: 14px 50%;
  background-size: 14px 12px;
  text-decoration: none;
  pointer-events: none;

  &.active {
    pointer-events: all;
    cursor: pointer;
  }
}

@media (max-width: 767px) {
  .button {
    &-open_calendar {
      max-width: 130px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &-clear_search {
      padding: 4px;
    }

    &-select_area {
      bottom: 68px;
    }
  }

  .main-top_right_wrapper {
    transition: visibility 0s 0.7s;
  }

  .main-top_left_wrapper {
    &:has(.hunters-switcher:hover) {
      ~ .main-top_right_wrapper {
        visibility: hidden;
        transition: visibility 0s;
      }
    }
  }

  .search-artist {
    top: 0;
    right: 0;
    width: calc(100vw - 76px);
    margin-right: 0;

    .search-select {
      flex: 0 0 82px;

      .selected {
        padding: 0 4px;
      }

      .options .item {
        padding: 0 4px 8px;
      }
    }

    form {
      flex: 1 0 auto;
      max-width: calc(100% - 122px);
    }

    input {
      width: 100%;
      padding: 6px;
    }

    &.isAddressSearch {
      position: fixed;
      top: 16px;
      right: auto;
      left: 58px;
      width: 82px;
      margin-right: 0;
    }
  }

  .selected-artist {
    width: 156px;
  }
}
</style>
