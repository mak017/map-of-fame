import { DEFAULT_ZOOM, DEFAULT_VIEW } from "../../constants";
import { isEmpty } from "../commonUtils";
import { permalink } from "./permalink";
import {
  huntersFilter,
  // isLoading,
  isSearchResults,
  mapBounds,
  markerIdFromUrl,
  markersStore,
  selectedArtist,
  selectedCategory,
  selectedYear,
} from "../../store";
import { requestSearchSpots } from "../../api/search";
import { requestSpots } from "../../init";
import { getSpotById } from "../../api/spot";
import { setMarkerData } from "./markersUtils";

let yearFromStore;
let selectedHuntersFilter;
let categoryFromStore;
let artistFromStore;
let markerId;
let isSearch;

selectedYear.subscribe((value) => {
  yearFromStore = value;
});

huntersFilter.subscribe((value) => {
  selectedHuntersFilter = value;
});

selectedCategory.subscribe((value) => {
  categoryFromStore = value;
});

selectedArtist.subscribe((value) => {
  artistFromStore = value;
});

markerIdFromUrl.subscribe((value) => {
  markerId = value;
});

isSearchResults.subscribe((value) => {
  isSearch = value;
});

const getLocationByIp = () =>
  fetch("https://ipinfo.io/json?token=c97eec3767f442")
    .then((response) => response.json())
    .then((data) => {
      const { loc } = data;
      return {
        center: loc.split(",").map((item) => +item),
        zoom: 11,
      };
    });

const getLocation = async () => {
  const locationFromUrl = permalink.getMapLocation();
  if (locationFromUrl) {
    return locationFromUrl;
  }
  if (navigator.geolocation) {
    try {
      const position = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej);
      });
      const { latitude, longitude } = position.coords;
      return { center: [+latitude, +longitude], zoom: DEFAULT_ZOOM };
    } catch {
      return getLocationByIp();
    }
  }
  return getLocationByIp();
};

const getBounds = (map) => {
  const bounds = map.getBounds();
  return [bounds.getNorthWest(), bounds.getSouthEast()];
};

export const handleMapViewChange = (map) => {
  const bounds = getBounds(map);
  mapBounds.set(bounds);

  if (!isSearch) {
    requestSpots(yearFromStore);
  }
};

export const setLocation = (map) => {
  getLocation()
    .then((response) => {
      map.setView(
        response.center || DEFAULT_VIEW.coordinates,
        response.zoom || DEFAULT_ZOOM
      );
    })
    .catch(() => {
      map.setView(DEFAULT_VIEW.coordinates, DEFAULT_VIEW.zoom);
    })
    .finally(() => {
      permalink.setup(map);
      const bounds = getBounds(map);
      mapBounds.set(bounds);
      if (typeof selectedHuntersFilter === "boolean") {
        // isLoading.set(true);
        requestSearchSpots({
          year: yearFromStore,
          name: artistFromStore,
          category: categoryFromStore.map((cat) => cat.id),
          showHunters: selectedHuntersFilter ? 1 : 0,
          geoRect: bounds,
        }).then((response) => {
          const { success, result, errors } = response;
          if (success && result) {
            isSearchResults.set(true);
            markersStore.set(result);
            // isLoading.set(false);
          }
          if (errors && !isEmpty(errors)) {
            permalink.update({ clearParams: "all" });
            // requestSpots(yearFromStore);
          }
        });
      } else if (markerId) {
        // isLoading.set(true);
        getSpotById(markerId).then((response) => {
          const { success, result, errors } = response;
          markerIdFromUrl.set(null);
          if (success && result) {
            // isLoading.set(false);
            setMarkerData(result);
          }
          if (errors && !isEmpty(errors)) {
            permalink.update({ clearParams: "all" });
          }
          // requestSpots(yearFromStore);
        });
      } else {
        // requestSpots(yearFromStore || getCurrentYear());
      }
    });
};

export const normalizeCoords = (coordinate) =>
  Math.round(coordinate * 100000) / 100000;
