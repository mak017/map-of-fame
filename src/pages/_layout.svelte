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
  searchControl,
  isActiveSearchControl,
} from "./../js/store.js";
import { getSpotsInArea } from "../js/api/spot.js";
import { requestSpots } from "../js/init.js";
import { placeMarkers } from "../js/utils/mapUtils/markersUtils.js";
import { ALL_YEARS_STRING } from "../js/constants.js";

import Loader from "../js/components/elements/Loader.svelte";

globalGoto.set($goto);

let selectedCategories = loadFromLocalStorage("categories") || [1];

areaSelection.set(
  new DrawAreaSelection({
    onPolygonReady: (polygon) => {
      isSpotsFromAreaLoading.set(true);
      requestSpots(ALL_YEARS_STRING);
      polygon.setStyle({
        color: "var(--color-accent)",
        weight: 4,
        fillOpacity: 0.18,
      });

      const { coordinates } = polygon.toGeoJSON().geometry;
      getSpotsInArea(coordinates[0]).then(({ result }) => {
        areaSpots.set(result);
        let style = "";
        result.forEach((item, index) => {
          style += `${index > 0 ? ", " : ""}.marker-id-${item.id}`;
        });
        style += `
            {
              width: 34px !important;
              height: 34px !important;
              border-width: 2px;
              opacity: 1 !important;
              font-size: 14px;
              pointer-events: auto;
            }
          `;
        document.getElementById("highlighted").innerHTML = style;
        isSpotsFromAreaLoading.set(false);
      });
    },
    position: "bottomright",
  })
);

const provider = new OpenStreetMapProvider();

searchControl.set(
  new SearchControl({
    provider: provider,
    position: "topright",
    style: "button",
    showMarker: false,
    searchLabel: "Address",
    maxSuggestions: isMobile() ? 3 : 5,
    autoClose: true,
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

  document.addEventListener("click", (event) => {
    if ($isActiveSearchControl) {
      const geoSearchElement = document.querySelector(".geosearch");
      if (!geoSearchElement.contains(event.target)) {
        $searchControl.close();
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
