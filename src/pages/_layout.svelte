<script>
import L from "leaflet";
import { SearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import { goto } from "@roxi/routify";
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
} from "./../js/store.js";
import { requestSpotsInArea } from "../js/init.js";
import { placeMarkers } from "../js/utils/mapUtils/markersUtils.js";

import Loader from "../js/components/elements/Loader.svelte";

globalGoto.set($goto);

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
