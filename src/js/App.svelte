<script>
import { onDestroy } from "svelte";
import { fade } from "svelte/transition";
import L from "leaflet";
import CloseCrossSvg from "./components/elements/CloseCrossSvg.svelte";
import { getLastSpots, placeMarkers } from "./utils/mapUtils/markersUtils.js";
// import SpinnerSvg from "./components/elements/SpinnerSvg.svelte";
import { changePasswordCheckToken } from "./api/auth.js";
import RailroadSvg from "./components/elements/RailroadSvg.svelte";
import { getSettings, initApp } from "./init.js";
import SearchForm from "./components/SearchForm.svelte";
import { setLocation } from "./utils/mapUtils/locationUtils.js";
import Modal from "./components/Modal.svelte";
import {
  isLighthouseActive,
  isLoading,
  isLoggedIn,
  isSearchResults,
  markersStore,
  openedMarkerData,
  selectedArtist,
  selectedYear,
  settings,
} from "./store.js";
import {
  openRailwayMap,
  openStreetMapMapnik,
} from "./utils/mapUtils/tileLayers";
import Calendar from "./components/Calendar.svelte";
import {
  adjustVhProp,
  getCurrentYear,
  getResetPasswordToken,
  loadFromLocalStorage,
  saveToLocalStorage,
} from "./utils/commonUtils";
import AddSpot from "./components/addSpot/AddSpot.svelte";
import MarkerCard from "./components/markerCard/MarkerCard.svelte";
import { permalink } from "./utils/mapUtils/permalink";
import AuthContainer from "./components/auth/AuthContainer.svelte";
import ResetPassword from "./components/auth/ResetPassword.svelte";
import Profile from "./components/user/Profile.svelte";
import { newMarkerIcon } from "./utils/mapUtils/icons";
import Loader from "./components/elements/Loader.svelte";
import { getSpots } from "./api/spot.js";

let isRailwayMode = loadFromLocalStorage("railwayMode");
let showCalendarModal = false;
let showSearchModal = false;
let showAuthContainer = false;
let showResetPasswordModal = false;
let showUserProfileModal = false;
let isAddSpotMode = false;
let isAddSpotSidebarVisible = false;
// let isRailwayMapLoading = true;
let resetPasswordToken = getResetPasswordToken();
let prevMarkersList = [];

let map;
let newMarker;
let settingsValue;
let markersList = [];
let isSearch;
let isLighthouse;
const showCalendar = (show) => (showCalendarModal = show);
const showSearch = (show) => (showSearchModal = show);
const showAuth = (show) => (showAuthContainer = show);
const showResetPassword = (show) => (showResetPasswordModal = show);
const showUserProfile = (show) => (showUserProfileModal = show);
const toggleAddSpotMode = (toggle) => (isAddSpotMode = toggle);
const toggleAddSpotSidebarVisible = (toggle) =>
  (isAddSpotSidebarVisible = toggle);
const clearOpenedMarkerData = () => {
  openedMarkerData.set(null);
  permalink.update({ clearParams: ["marker"] });
};

const unsubscribeSettings = settings.subscribe(
  (value) => (settingsValue = value)
);

const unsubscribeMarkers = markersStore.subscribe(
  (value) => (markersList = value)
);

const unsubscribeIsSearchResults = isSearchResults.subscribe(
  (value) => (isSearch = value)
);

const unsubscribeIsLighthouse = isLighthouseActive.subscribe(
  (value) => (isLighthouse = value)
);

document.getElementById("initial-loader").remove();

onDestroy(() => {
  unsubscribeSettings();
  unsubscribeMarkers();
  unsubscribeIsSearchResults();
  unsubscribeIsLighthouse();
});

adjustVhProp();

initApp();

$: if (markersList) {
  placeMarkers(map, markersList, isSearch);
}

if (resetPasswordToken) {
  isLoading.set(true);
  changePasswordCheckToken(resetPasswordToken).then((response) => {
    const { status, data } = response;
    if (status && data && data?.reset_password_token) {
      getSettings();
      isLoading.set(false);
      showResetPassword(true);
      resetPasswordToken = data.reset_password_token;
    } else {
      getSettings().then(() => {
        isLoading.set(false);
      });
    }
  });
} else {
  isLoading.set(true);
  getSettings().then(() => {
    isLoading.set(false);
  });
}

// Init leaflet map
const initMap = (container) => {
  const layers = isRailwayMode
    ? [openStreetMapMapnik, openRailwayMap]
    : [openStreetMapMapnik];
  map = L.map(container, { layers });

  // Change position of zoom control
  map.zoomControl.setPosition("bottomleft");

  setLocation(map);

  // openRailwayMap.on("load", () => (isRailwayMapLoading = false));

  return {
    destroy: () => {
      map.remove();
      map = null;
    },
  };
};

const handleChangeModeClick = () => {
  if (!isRailwayMode) {
    // isRailwayMapLoading = true;
    map.addLayer(openRailwayMap);
    isRailwayMode = true;
  } else {
    map.removeLayer(openRailwayMap);
    isRailwayMode = false;
  }
  saveToLocalStorage("railwayMode", isRailwayMode);
};

const onNewMarkerMoveEnd = () => {
  if (!isAddSpotSidebarVisible) {
    toggleAddSpotSidebarVisible(true);
  }
};

const onNewMarkerCancel = () => {
  quitAddSpot();
  newMarker.removeEventListener("moveend", onNewMarkerMoveEnd);
  map.removeLayer(newMarker);
};

const onAddSpotBtnClick = () => {
  const center = map.getCenter();
  newMarker = L.marker(center, {
    draggable: true,
    icon: newMarkerIcon,
    zIndexOffset: 10000,
  });
  map.addLayer(newMarker);
  newMarker.addEventListener("moveend", onNewMarkerMoveEnd);
  toggleAddSpotMode(true);
};

const onLighthouseClick = () => {
  if (!isLighthouse) {
    prevMarkersList = [...markersList];
    if (!isSearch) {
      const filteredSpots = getLastSpots(markersList);
      markersStore.set(filteredSpots);
      isLighthouseActive.set(true);
    } else {
      getSpots(getCurrentYear()).then((response) => {
        const { status, data } = response;
        if (status && data) {
          isSearchResults.set(false);
          isLighthouseActive.set(true);
          const filteredSpots = getLastSpots(data);
          markersStore.set(filteredSpots);
        }
      });
    }
  } else {
    markersStore.set(prevMarkersList);
    isLighthouseActive.set(false);
  }
};

const quitAddSpot = () => {
  toggleAddSpotMode(false);
  toggleAddSpotSidebarVisible(false);
};
</script>

<svelte:window on:resize={adjustVhProp} />
{#if $isLoading}
  <Loader />
{:else if showResetPasswordModal}
  <Modal noClose title="Reset Password">
    <ResetPassword {showResetPassword} {resetPasswordToken} />
  </Modal>
{:else}
  <div class="map" class:add-mode={isAddSpotMode} use:initMap />

  <div class="main-top_left_wrapper">
    {#if !isAddSpotMode || (isAddSpotMode && !isAddSpotSidebarVisible)}
      <button
        class="button button-main_screen button-open_calendar"
        on:click={() => showCalendar(true)}
        transition:fade>{$selectedYear}</button>
    {/if}
    {#if !isAddSpotMode}
      <button
        class="button button-square button-lighthouse"
        class:active={isLighthouse}
        disabled={+$selectedYear !== getCurrentYear()}
        on:click={onLighthouseClick}
        transition:fade>
        <svg
          width="9"
          height="15"
          viewBox="0 0 9 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.59095 6.18163H5.20517L8.12795 0.657462C8.20028 0.521392 8.19986 0.354423 8.12678 0.218811C8.05327 0.0833129 7.91861 0 7.77276 0H2.86365C2.68755 0 2.53127 0.121078 2.47576 0.300407L0.0212066 8.23985C-0.020768 8.37374 0.00043238 8.52137 0.0771372 8.63593C0.154268 8.7506 0.277742 8.81835 0.409099 8.81835H3.87967L1.66961 14.3876C1.59046 14.5855 1.65683 14.816 1.82622 14.9313C1.99284 15.0458 2.21667 15.0157 2.35112 14.8525L8.89659 6.91302C9.00366 6.78382 9.03008 6.59877 8.96414 6.4413C8.89819 6.28337 8.75203 6.18163 8.59095 6.18163Z" />
        </svg>
      </button>
    {/if}
  </div>

  <div class="main-top_right_wrapper">
    {#if !isAddSpotMode && !$selectedArtist}
      <button
        class="button button-main_screen button-square button-open_search"
        on:click={() => showSearch(true)}
        in:fade />
      {#if $isLoggedIn}
        <button
          class="button button-main_screen button-square button-burger"
          on:click={() => showUserProfile(true)}
          in:fade />
      {:else}
        <button
          class="button button-main_screen button-square button-open_login"
          on:click={() => showAuth(true)} />
      {/if}
    {/if}
    {#if $selectedArtist}
      <div class="selected-artist">
        <span>{$selectedArtist}</span>
        <button class="button button-square button-clear_search">
          <CloseCrossSvg isLight />
        </button>
      </div>
    {/if}
  </div>

  <button
    class="button button-main_screen button-square button-switch_mode"
    class:active={isRailwayMode}
    on:click={handleChangeModeClick}
    title="Highlight railways">
    <!-- {#if !isRailwayMapLoading} -->
    <RailroadSvg isLight={isRailwayMode} />
  </button>

  {#if $isLoggedIn}
    <AddSpot
      {isAddSpotMode}
      {isAddSpotSidebarVisible}
      {onAddSpotBtnClick}
      {newMarker}
      onCancel={onNewMarkerCancel} />
  {/if}

  {#if showCalendarModal}
    <Modal on:close={() => showCalendar(false)} title="Years" withAd autoMargin>
      <Calendar
        {selectedYear}
        {showCalendar}
        yearStart={settingsValue.yearStart}
        yearEnd={settingsValue.yearEnd}
        additionalYears={JSON.parse(settingsValue.additionalYears)} />
    </Modal>
  {/if}

  {#if showSearchModal}
    <Modal on:close={() => showSearch(false)} title="Search spots" withAd>
      <SearchForm {showSearch} yearStart={settingsValue.yearStart} />
    </Modal>
  {/if}

  {#if $openedMarkerData}
    <Modal
      on:close={clearOpenedMarkerData}
      withAd
      noLogo
      banner={{
        img: $openedMarkerData.firm?.banner,
        url: $openedMarkerData.firm?.bannerUrl,
      }}>
      <MarkerCard data={$openedMarkerData} isLoggedIn={$isLoggedIn} />
    </Modal>
  {/if}

  {#if showAuthContainer}
    <AuthContainer {showAuth} />
  {/if}

  {#if showUserProfileModal}
    <Modal noLogo on:close={() => showUserProfile(false)}>
      <Profile {onAddSpotBtnClick} {showUserProfile} />
    </Modal>
  {/if}
{/if}

<style lang="scss">
.map {
  z-index: 0;
  width: 100%;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
.button {
  &-main_screen {
    background: var(--color-light);
  }

  &-square {
    width: 40px;
    height: 40px;
  }

  &-open_calendar {
    position: relative;
    min-width: 114px;
    height: 40px;
    padding: 0 36px;
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
  }

  &-lighthouse {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    margin-left: 12px;
    overflow: hidden;
    background-color: var(--color-dark);

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 22px;
      height: 22px;
      transform: translate(-50%, -50%) scale(0);
      transition: transform 0.3s;
      border-radius: 50%;
      background-color: var(--color-accent);
    }

    svg {
      position: relative;
      transition: transform 0.3s;
      fill: var(--color-light);
    }

    &:disabled {
      background-color: var(--color-light);

      svg {
        fill: rgba($color: #000, $alpha: 0.2);
      }
    }

    &:hover {
      &::before {
        transform: translate(-50%, -50%) scale(1);
      }

      svg {
        transform: scale(1.5);
      }
    }

    &.active,
    &:active {
      &::before {
        transform: translate(-50%, -50%) scale(3);
      }

      svg {
        transform: scale(1);
      }
    }
  }

  &-open_search {
    margin-right: 12px;
    background-image: url(../images/loupe.svg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 20px 20px;
  }

  &-open_login {
    background-image: url(../images/lock.svg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 9px 17px;
  }

  &-switch_mode {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    bottom: 18px;
    left: 70px;

    &.active {
      background-color: var(--color-accent);
    }
    // &.is-loading {
    //   pointer-events: none;
    // }
  }

  &-burger {
    background-image: url(../images/burger.svg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 18px 13px;
  }
  &-clear_search {
    margin-left: 5px;
    padding: 8px;
    background-color: transparent;
  }
}

.selected-artist {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 186px;
  height: 40px;
  padding-left: 16px;
  border-radius: 2px;
  background: var(--color-accent);
  color: var(--color-light);
  font-size: 14px;
  line-height: 17px;
}

@media (max-width: 767px) {
  .button-open_calendar {
    max-width: 130px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
