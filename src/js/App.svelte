<script>
import { fade } from "svelte/transition";
import L from "leaflet";
import "@bopen/leaflet-area-selection/dist/index.css";
import { DrawAreaSelection } from "@bopen/leaflet-area-selection";

import { placeMarkers } from "./utils/mapUtils/markersUtils.js";
import { changePasswordCheckToken } from "./api/auth.js";
import {
  getSettings,
  initApp,
  requestCategories,
  requestRecentSpots,
  requestSpots,
} from "./init.js";
import {
  isInitialized,
  isLighthouseActive,
  isLoading,
  isLoggedIn,
  isSearchResults,
  isShowOnMapMode,
  markersStore,
  openedMarkerData,
  selectedArtist,
  selectedCrew,
  selectedYear,
  settings,
  selectedUserProfileData,
  shouldDisplayShowOnMap,
} from "./store.js";
import {
  openRailwayMap,
  openStreetMapMapnik,
} from "./utils/mapUtils/tileLayers";
import {
  handleMapViewChange,
  setLocation,
} from "./utils/mapUtils/locationUtils.js";
import {
  adjustVhProp,
  getCurrentYear,
  getInviteData,
  getResetPasswordToken,
  isMobile,
  loadFromLocalStorage,
  saveToLocalStorage,
} from "./utils/commonUtils";
import { permalink } from "./utils/mapUtils/permalink";
import { newMarkerIcon } from "./utils/mapUtils/icons";
import { getSpotsInArea } from "./api/spot";

import CloseCrossSvg from "./components/elements/icons/CloseCrossSvg.svelte";
import RailroadSvg from "./components/elements/icons/RailroadSvg.svelte";
import SearchForm from "./components/SearchForm.svelte";
import Modal from "./components/Modal.svelte";
import Calendar from "./components/Calendar.svelte";
import AddSpot from "./components/addSpot/AddSpot.svelte";
import MarkerCard from "./components/markerCard/MarkerCard.svelte";
import AuthContainer from "./components/auth/AuthContainer.svelte";
import ResetPassword from "./components/auth/ResetPassword.svelte";
import Profile from "./components/user/Profile.svelte";
import Loader from "./components/elements/Loader.svelte";
import Spinner from "./components/elements/Spinner.svelte";
import SelectedSpots from "./components/SelectedSpots.svelte";

import { ALL_YEARS_STRING, MIN_ZOOM } from "./constants";

let isRailwayMode = loadFromLocalStorage("railwayMode");
let showCalendarModal = false;
let showSearchModal = false;
let showAuthContainer = false;
let showResetPasswordModal = false;
let showUserProfileModal = false;
let isAddSpotMode = false;
let isAddSpotSidebarVisible = false;
let isAreaSelectionActive = false;
let isSpotsFromAreaLoading = false;
let showSpotsFromAreaModal = false;
let resetPasswordToken = getResetPasswordToken();
let inviteData = getInviteData();
let areaSpots;

let map;
let newMarker;
let currentZoom;

const areaSelection = new DrawAreaSelection({
  onPolygonReady: (polygon) => {
    isSpotsFromAreaLoading = true;
    polygon.setStyle({
      color: "var(--color-accent)",
      weight: 4,
      fillOpacity: 0.18,
    });

    const { coordinates } = polygon.toGeoJSON().geometry;
    getSpotsInArea(coordinates[0]).then(({ result, success }) => {
      areaSpots = result;
      isSpotsFromAreaLoading = false;
    });
  },
  onPolygonDblClick: () => showSpotsFromArea(true),
  position: "bottomright",
});

const showCalendar = (show) => (showCalendarModal = show);
const showSearch = (show) => (showSearchModal = show);
const showAuth = (show) => (showAuthContainer = show);
const showResetPassword = (show) => (showResetPasswordModal = show);
const showUserProfile = (show) => (showUserProfileModal = show);
const showSpotsFromArea = (show) => (showSpotsFromAreaModal = show);
const toggleAddSpotMode = (toggle) => (isAddSpotMode = toggle);
const toggleAddSpotSidebarVisible = (toggle) =>
  (isAddSpotSidebarVisible = toggle);
const clearOpenedMarkerData = () => {
  openedMarkerData.set(null);
  permalink.update({ clearParams: ["marker"] });
};

const toggleAreaSelectionMode = (toggle) => {
  isAreaSelectionActive = toggle;

  if (toggle) {
    map.setMinZoom(15);
    areaSelection.activate();
    return;
  }

  map.setMinZoom(MIN_ZOOM);
  map.dragging.enable();
  areaSelection.deactivate();
  areaSpots = null;
};

document.getElementById("initial-loader").remove();

adjustVhProp();

initApp();

$: if ($markersStore) {
  placeMarkers(map, $markersStore, $isSearchResults || $isShowOnMapMode);
}

if (resetPasswordToken) {
  const { token, id } = resetPasswordToken;
  isLoading.set(true);
  changePasswordCheckToken(token, id).then((response) => {
    const { success, result } = response;
    if (success && result) {
      getSettings();
      isLoading.set(false);
      showResetPassword(true);
      resetPasswordToken = result;
    } else {
      getSettings().then(() => {
        isLoading.set(false);
      });
    }
  });
} else {
  isLoading.set(true);
  Promise.all([getSettings(), requestCategories()]).then(() => {
    isLoading.set(false);
  });
}

if (inviteData) {
  showAuth(true);
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

  map.on("zoomend dragend", () => $isInitialized && handleMapViewChange(map));

  map.on("zoomend", () => (currentZoom = map.getZoom()));

  map.addControl(areaSelection);

  return {
    destroy: () => {
      map.remove();
      map = null;
    },
  };
};

const handleChangeModeClick = () => {
  if (!isRailwayMode) {
    map.addLayer(openRailwayMap);
    isRailwayMode = true;
  } else {
    map.removeLayer(openRailwayMap);
    isRailwayMode = false;
  }
  saveToLocalStorage("railwayMode", isRailwayMode);
  !$isLighthouseActive ? requestSpots($selectedYear) : requestRecentSpots();
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
  if (!$isLighthouseActive) {
    requestRecentSpots();
  } else {
    requestSpots($selectedYear);
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
  <div
    class="map"
    class:add-mode={isAddSpotMode}
    class:area-selection-mode={isAreaSelectionActive}
    use:initMap />

  <div class="main-top_left_wrapper">
    {#if !isAddSpotMode || (isAddSpotMode && !isAddSpotSidebarVisible)}
      <button
        class="button button-main_screen button-open_calendar"
        class:inactive={isAreaSelectionActive}
        on:click={() => showCalendar(true)}
        transition:fade={{ duration: 200 }}
        >{isAreaSelectionActive ? ALL_YEARS_STRING : $selectedYear}</button>
    {/if}
    {#if !isAddSpotMode && !$isSearchResults && !$isShowOnMapMode && !isAreaSelectionActive}
      <button
        class="button button-square button-lighthouse"
        class:active={$isLighthouseActive}
        disabled={+$selectedYear !== getCurrentYear()}
        on:click={onLighthouseClick}
        transition:fade={{ duration: 200 }}>
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
    {#if !isAddSpotMode && !isAreaSelectionActive}
      {#if !($isSearchResults && ($selectedArtist || $selectedCrew)) && !$selectedUserProfileData.name}
        <button
          class="button button-main_screen button-square button-open_search"
          on:click={() => showSearch(true)}
          in:fade={{ duration: 200 }} />
        {#if $isLoggedIn}
          <button
            class="button button-main_screen button-square button-burger"
            on:click={() => showUserProfile(true)}
            in:fade={{ duration: 200 }} />
        {:else}
          <button
            class="button button-main_screen button-square button-open_login"
            on:click={() => showAuth(true)} />
        {/if}
      {:else}
        <div class="selection selected-artist">
          <span
            >{$selectedArtist || $selectedUserProfileData?.name || ""}
            {$selectedCrew || $selectedUserProfileData?.crew || ""}</span>
          <button
            class="button button-square button-clear_search"
            on:click|stopPropagation={() => {
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
    {:else if isAreaSelectionActive && (areaSpots || isSpotsFromAreaLoading)}
      <div
        class="selection selected-area-spots"
        class:active={!isSpotsFromAreaLoading && areaSpots.length > 0}
        transition:fade={{ duration: 200 }}
        on:click={() => showSpotsFromArea(true)}>
        {#if isSpotsFromAreaLoading}
          <Spinner height={20} margin="10px" isWhite />
        {/if}
        {#if areaSpots}
          <span>{areaSpots?.length} Spots Selected</span>
        {/if}
      </div>
    {/if}
  </div>

  {#if !$isSearchResults && !$selectedUserProfileData.name && !isAreaSelectionActive}
    <button
      class="button button-main_screen button-square button-switch_mode"
      class:active={isRailwayMode}
      on:click={handleChangeModeClick}
      transition:fade={{ duration: 200 }}
      title="Highlight railways">
      <RailroadSvg isLight={isRailwayMode} />
    </button>
  {/if}

  {#if !$isSearchResults && !$selectedUserProfileData.name && (isAreaSelectionActive || currentZoom > 14)}
    <button
      class="button button-main_screen button-square button-select_area"
      class:active={isAreaSelectionActive}
      on:click={() => toggleAreaSelectionMode(!isAreaSelectionActive)}
      transition:fade={{ duration: 200 }}
      title={isAreaSelectionActive
        ? "Cancel area selection mode"
        : "Activate area selection mode"}>
      {#if isAreaSelectionActive}
        <CloseCrossSvg isLight />
      {/if}
    </button>
  {/if}

  {#if $isLoggedIn && !isAreaSelectionActive}
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
        isSearch={$isSearchResults}
        yearStart={$settings.yearStart}
        yearEnd={$settings.yearEnd}
        additionalYears={$settings.additionalYears &&
          JSON.parse($settings.additionalYears)} />
    </Modal>
  {/if}

  {#if showSearchModal}
    <Modal
      on:close={() => showSearch(false)}
      title="Search"
      withAd
      alwaysOnTop
      noLogo={!isMobile()}
      stickyHeaderOnMobile>
      <SearchForm {showSearch} />
    </Modal>
  {/if}

  {#if showUserProfileModal}
    <Modal
      noLogo
      on:close={() => {
        showUserProfile(false);
        !$isShowOnMapMode && selectedUserProfileData.set({});
      }}>
      <Profile {onAddSpotBtnClick} {showUserProfile} />
    </Modal>
  {/if}

  {#if showSpotsFromAreaModal}
    <Modal
      noLogo
      on:close={() => {
        showSpotsFromArea(false);
        toggleAreaSelectionMode(false);
      }}>
      <SelectedSpots spotsList={areaSpots} />
    </Modal>
  {/if}

  {#if $openedMarkerData}
    <Modal
      on:close={() => {
        clearOpenedMarkerData();
        if (!$isShowOnMapMode) {
          selectedUserProfileData.set({});
          $shouldDisplayShowOnMap && requestSpots($selectedYear);
        }
        isAreaSelectionActive && toggleAreaSelectionMode(false);
      }}
      withAd
      noLogo
      banner={{
        img: $openedMarkerData.firm?.banner,
        url: $openedMarkerData.firm?.bannerUrl,
      }}>
      <MarkerCard
        data={$openedMarkerData}
        {map}
        {showUserProfile}
        {showSpotsFromAreaModal}
        {showSpotsFromArea}
        {clearOpenedMarkerData}
        {toggleAreaSelectionMode} />
    </Modal>
  {/if}

  {#if showAuthContainer}
    <AuthContainer
      {showAuth}
      {inviteData}
      clearInviteData={() => (inviteData = null)} />
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
    color: var(--color-dark);
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
      pointer-events: none;
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
    position: absolute;
    bottom: 18px;
    left: 70px;
    align-items: center;
    justify-content: center;

    &.active {
      background-color: var(--color-accent);
    }
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
      background-color: var(--color-accent);
      background-image: none;
    }
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
  }

  .selected-artist {
    width: 156px;
  }
}
</style>
