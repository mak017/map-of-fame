<script>
import L from "leaflet";
import { SearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import {
  afterPageLoad,
  beforeUrlChange,
  getDirection,
  goto,
  route,
  routes,
} from "@roxi/routify";
import { DrawAreaSelection } from "@bopen/leaflet-area-selection";

import {
  adjustVhProp,
  isMobile,
  loadFromLocalStorage,
} from "../js/utils/commonUtils.js";
import {
  handleMapViewChange,
  setLocation,
} from "../js/utils/mapUtils/locationUtils.js";
import {
  openRailwayMap,
  openStreetMapMapnik,
} from "../js/utils/mapUtils/tileLayers.js";
import {
  shouldShowAddSpot,
  isAreaSelectionActive,
  mapBounds,
  markersStore,
  isShowOnMapMode,
  isInitialized,
  map,
  currentZoom,
  isSpotsFromAreaLoading,
  areaSelection,
  globalGoto,
  isLoading,
  searchControl,
  isActiveSearchControl,
  browserHistory,
  profileState,
  searchState,
} from "./../js/store.js";
import { requestSpotsInArea } from "../js/init.js";
import { placeMarkers } from "../js/utils/mapUtils/markersUtils.js";

import Loader from "../js/components/elements/Loader.svelte";
import { onMount } from "svelte";

globalGoto.set($goto);

// $beforeUrlChange((event, route) => {
//   console.log("event", event);
//   console.log("route", route);
//   console.log("window.history", window.history);
//   const { type, state, target } = event;
//   const { currentIndex, history } = $browserHistory;
//   console.log("$browserHistory", $browserHistory);

//   if (type === "pushstate") {
//     const { pathname } = window.location.pathname;
//     const data = { ...state, pathname };
//     browserHistory.setCurrentIndex(currentIndex);
//     browserHistory.setEventType(type);

//     switch (state.id) {
//       case "___username_index":
//         data.profileState = $profileState;
//         break;
//       case "_search":
//         data.searchState = $searchState;
//         break;

//       default:
//         break;
//     }

//     browserHistory.pushToHistory(data, currentIndex + 1);
//   }

//   if (type === "popstate") {
//     const { title } = route;
//     console.log("title", title);
//     console.log("target.location", target.location);
//     browserHistory.setEventType(type);

//     // switch (title) {
//     //   case '@:username':
//     //     profileState.set($browserHistory.history)
//     //     break;

//     //   default:
//     //     break;
//     // }
//   }

//   return true;
// });

// $afterPageLoad((page) => {
//   const { eventType } = $browserHistory;
//   const { pathname } = window.location.pathname;
//   if (eventType === "popstate") {
//   }
//   // const data = { ...state, pathname };
//   // browserHistory.setCurrentIndex(currentIndex + 1);
// });

// $: lastRoute = $route.last;
// $: console.log("$route", $route);
// $: console.log("lastRoute", lastRoute);
// $: direction = lastRoute && getDirection($routes, lastRoute);
// $: console.log("direction", direction);

// onMount(() => {
//   function reorient() {
//     // After travelling in the history stack
//     const positionLastShown = Number(
//       // If none, then zero
//       sessionStorage.getItem("positionLastShown"),
//     );
//     let position = history.state; // Absolute position in stack
//     if (position === null) {
//       // Meaning a new entry on the stack
//       position = positionLastShown + 1; // Top of stack

//       // (1) Stamp the entry with its own position in the stack
//       history.replaceState(position, /*no title*/ "");
//     }

//     // (2) Keep track of the last position shown
//     sessionStorage.setItem("positionLastShown", String(position));

//     // (3) Discover the direction of travel by comparing the two
//     const direction = Math.sign(position - positionLastShown);
//     console.log("Travel direction is " + direction);
//     // One of backward (-1), reload (0) and forward (1)
//   }

//   addEventListener("pageshow", reorient);
//   addEventListener("popstate", reorient); // Travel in same page
// });

let selectedCategories = loadFromLocalStorage("categories") || [1];

areaSelection.set(
  new DrawAreaSelection({
    onPolygonReady: (polygon) => {
      isSpotsFromAreaLoading.set(true);
      polygon.setStyle({
        color: "var(--color-accent)",
        weight: 4,
        fillOpacity: 0.18,
      });

      const { coordinates } = polygon.toGeoJSON().geometry;
      requestSpotsInArea(coordinates[0]);
    },
    position: "bottomright",
  }),
);

const provider = new OpenStreetMapProvider();

searchControl.set(
  new SearchControl({
    provider: provider,
    position: "topright",
    style: "button",
    showMarker: false,
    searchLabel: "Search",
    maxSuggestions: isMobile() ? 3 : 5,
    autoClose: true,
  }),
);

// Init leaflet map
const initMap = (container) => {
  const layers = selectedCategories.includes(2)
    ? [openStreetMapMapnik, openRailwayMap]
    : [openStreetMapMapnik];
  map.set(L.map(container, { layers }));

  // Change position of zoom control
  $map.zoomControl.setPosition("bottomleft");

  if ($mapBounds.length > 0) {
    $map.fitBounds($mapBounds);

    if ($markersStore?.spots?.length) {
      placeMarkers($map, $markersStore, $isShowOnMapMode);
    }
  } else {
    setLocation($map);
  }

  $map.on("moveend", () => $isInitialized && handleMapViewChange($map));

  $map.on("zoomend", () => currentZoom.set($map.getZoom()));

  document.addEventListener("click", (event) => {
    if ($isActiveSearchControl) {
      const geoSearchElement = document.querySelector(".geosearch");
      const artistSearchElement = document.querySelector(".search-artist");
      if (
        !geoSearchElement.contains(event.target) &&
        !artistSearchElement?.contains(event.target)
      ) {
        $searchControl.close();
      }

      if (event.target.classList.contains("item")) {
        $searchControl.clearResults();
      }
    }
  });

  $map.addControl($areaSelection);
  $map.addControl($searchControl);

  return {
    destroy: () => {
      $map.remove();
      map.set(null);
    },
  };
};

$: if ($map && $markersStore) {
  placeMarkers($map, $markersStore, $isShowOnMapMode);
}
</script>

<svelte:window on:resize={adjustVhProp} />
{#if $isLoading}
  <Loader />
{:else}
  <div
    class="map"
    class:add-mode={$shouldShowAddSpot}
    class:area-selection-mode={$isAreaSelectionActive}
    use:initMap />
  <slot />
{/if}

<style>
.map {
  z-index: 0;
  width: 100%;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
</style>
