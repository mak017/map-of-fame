<script>
import L from "leaflet";
import { goto } from "@roxi/routify";
import { DrawAreaSelection } from "@bopen/leaflet-area-selection";

import { adjustVhProp, loadFromLocalStorage } from "../js/utils/commonUtils.js";
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
  isSearchResults,
  isShowOnMapMode,
  isInitialized,
  map,
  currentZoom,
  isSpotsFromAreaLoading,
  areaSpots,
  areaSelection,
  globalGoto,
  isLoading,
} from "./../js/store.js";
import { getSpotsInArea } from "../js/api/spot.js";
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
      getSpotsInArea(coordinates[0]).then(({ result }) => {
        areaSpots.set(result);
        isSpotsFromAreaLoading.set(false);
      });
    },
    onPolygonDblClick: () => !!$areaSpots?.length && $goto("/selected-spots"),
    position: "bottomright",
  })
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
      placeMarkers($map, $markersStore, $isSearchResults || $isShowOnMapMode);
    }
  } else {
    setLocation($map);
  }

  $map.on("moveend", () => $isInitialized && handleMapViewChange($map));

  $map.on("zoomend", () => currentZoom.set($map.getZoom()));

  $map.addControl($areaSelection);

  return {
    destroy: () => {
      $map.remove();
      map.set(null);
    },
  };
};

$: if ($map && $markersStore) {
  placeMarkers($map, $markersStore, $isSearchResults || $isShowOnMapMode);
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
