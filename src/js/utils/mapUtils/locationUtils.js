import { DEFAULT_ZOOM, DEFAULT_VIEW } from "../../constants";
import { getCurrentYear } from "../commonUtils";
import { permalink } from "./permalink";
import {
  huntersFilter,
  isLoading,
  isSearchResults,
  markersStore,
  selectedArtist,
  selectedCategory,
  selectedYear,
} from "../../store";
import { requestSearchSpots } from "../../api/search";
import { requestSpots } from "../../init";

let yearFromStore;
let selectedHuntersFilter;
let categoryFromStore;
let artistFromStore;

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
      if (selectedHuntersFilter) {
        isLoading.set(true);
        requestSearchSpots({
          year: yearFromStore,
          name: artistFromStore,
          category: categoryFromStore.map((cat) => cat.id),
          showHunters: selectedHuntersFilter ? 1 : 0,
        }).then((response) => {
          const { status, data, error } = response;
          if (status && data) {
            isSearchResults.set(true);
            markersStore.set(data);
            isLoading.set(false);
          }
          if (error) {
            permalink.update({ clearParams: "all" });
            requestSpots(yearFromStore);
          }
        });
      } else {
        requestSpots(yearFromStore || getCurrentYear());
      }
    });
};

export const normalizeCoords = (coordinate) =>
  Math.round(coordinate * 100000) / 100000;
