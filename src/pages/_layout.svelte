<script>
import L from "leaflet";
import { goto } from "@roxi/routify";
import { DrawAreaSelection } from "@bopen/leaflet-area-selection";

import {
  adjustVhProp,
  getResetPasswordToken,
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
  isAddSpotMode,
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
  shouldShowResetPassword,
} from "./../js/store.js";
import { getSpotsInArea } from "../js/api/spot.js";
import { placeMarkers } from "../js/utils/mapUtils/markersUtils.js";
import { getSettings, initApp, requestCategories } from "../js/init.js";
import { changePasswordCheckToken } from "../js/api/auth.js";
import { onMount } from "svelte";

onMount(() => {
  console.log("$isLoading :>> ", $isLoading);
  console.log("$isInitialized :>> ", $isInitialized);
  console.log("$map :>> ", $map);
  if (!$isInitialized) {
    adjustVhProp();

    initApp();

    let resetPasswordToken = getResetPasswordToken();
    const initialLoader = document.getElementById("initial-loader");

    if (initialLoader) initialLoader.remove();

    if (resetPasswordToken) {
      const { token, id } = resetPasswordToken;
      isLoading.set(true);
      changePasswordCheckToken(token, id).then((response) => {
        const { success, result } = response;
        if (success && result) {
          getSettings().then(() => {
            isInitialized.set(true);
          });
          isLoading.set(false);
          shouldShowResetPassword.set(true);
          resetPasswordToken = result;
        } else {
          getSettings().then(() => {
            isLoading.set(false);
            isInitialized.set(true);
          });
        }
      });
    } else {
      isLoading.set(true);
      Promise.all([getSettings(), requestCategories()]).then(() => {
        isLoading.set(false);
        isInitialized.set(true);
        console.log(">>> init", $isInitialized);
      });
    }
  }
});

globalGoto.set($goto);

let isRailwayMode = loadFromLocalStorage("railwayMode");

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
  const layers = isRailwayMode
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

<div
  class="map"
  class:add-mode={$isAddSpotMode}
  class:area-selection-mode={$isAreaSelectionActive}
  use:initMap />
<slot />

<style>
.map {
  z-index: 0;
  width: 100%;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
}
</style>
