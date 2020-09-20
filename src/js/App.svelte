<script>
import { setLocation } from "./mapUtils/locationUtils.js";
import Modal from "./Modal.svelte";
import L from "leaflet";
import { fly } from "svelte/transition";
import { isLoggedIn, selectedYear } from "./store.js";
import { openRailwayMap, openStreetMapMapnik } from "./mapUtils/tileLayers";
import { newMarkerIcon } from "./mapUtils/icons";
import Calendar from "./Calendar.svelte";

const state = {
  isRailwayMode: false,
  isAddSpotSidebarVisible: false,
  showCalendarModal: false,
  isLighthouseActive: false,
};

let map;
let isLoggedInValue;
let selectedYearValue;
isLoggedIn.subscribe((value) => (isLoggedInValue = value));
selectedYear.subscribe((value) => (selectedYearValue = value));
const showCalendar = (show) => (state.showCalendarModal = show);

// Init leaflet map
const initMap = (container) => {
  map = L.map(container, { layers: [openStreetMapMapnik] });

  // Change position of zoom control
  map.zoomControl.setPosition("bottomleft");

  setLocation(map);

  return {
    destroy: () => {
      map.remove();
      map = null;
    },
  };
};

const onNewMarkerMoveEnd = () => {
  if (!state.isAddSpotSidebarVisible) {
    state.isAddSpotSidebarVisible = true;
  }
};

const onAddSpotBtnClick = () => {
  const center = map.getCenter();
  const newMarker = L.marker(center, {
    draggable: true,
    icon: newMarkerIcon,
  }).addTo(map);
  newMarker.addEventListener("moveend", onNewMarkerMoveEnd);
};

const handleChangeModeClick = () => {
  if (!state.isRailwayMode) {
    map.addLayer(openRailwayMap);
    state.isRailwayMode = true;
  } else {
    map.removeLayer(openRailwayMap);
    state.isRailwayMode = false;
  }
};
</script>

<div class="map" use:initMap />
<div class="main-top_left_wrapper">
  <button
    class="button button-main_screen button-open_calendar"
    on:click={() => (state.showCalendarModal = true)}>{selectedYearValue}</button>
  <button
    class="button button-square button-lighthouse"
    class:active={state.isLighthouseActive}
    disabled={!isLoggedInValue}>
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
</div>
<div class="main-top_right_wrapper">
  <button class="button button-main_screen button-square button-open_search" />
  {#if isLoggedInValue}
    <button class="button button-main_screen button-square button-burger" />
  {:else}
    <button class="button button-main_screen button-square button-open_login" />
  {/if}
</div>
<button
  class="button button-main_screen button-square button-switch_mode"
  class:active={state.isRailwayMode}
  on:click={handleChangeModeClick} />
{#if isLoggedInValue}
  <button class="button button-add_spot" on:click={onAddSpotBtnClick}>Add Spot</button>
  {#if state.isAddSpotSidebarVisible}
    <div class="add-spot" transition:fly={{ x: 150, duration: 300 }} />
  {/if}
{/if}

{#if state.showCalendarModal}
  <Modal on:close={() => showCalendar(false)} title="Date" withAd>
    <Calendar {selectedYear} {showCalendar} />
  </Modal>
{/if}

<style lang="scss">
.map {
  z-index: 0;
  width: 100%;
  height: 100vh;
}
.button {
  &-main_screen {
    background: var(--color-light);

    &:active {
      background-color: var(--color-accent);
    }
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
    position: absolute;
    bottom: 18px;
    left: 70px;
    background-image: url(../images/railroad.svg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 19px 22px;

    &.active {
      background-color: var(--color-accent);
    }
  }

  &-burger {
    background-image: url(../images/burger.svg);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-size: 18px 13px;
  }

  &-add_spot {
    position: absolute;
    right: 18px;
    bottom: 18px;
    padding: 9px 18px;
    background-color: var(--color-dark);
    color: var(--color-light);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.2222222;
  }
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