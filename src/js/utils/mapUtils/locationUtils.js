import { getCurrentYear } from "../commonUtils";
import { permalink } from "./permalink";
import {
  isInitialized,
  isLighthouseActive,
  isSearchResults,
  isShowOnMapMode,
  mapBounds,
  selectedArtist,
  selectedCrew,
  selectedYear,
} from "../../store";
import { performSearch, requestRecentSpots, requestSpots } from "../../init";

import {
  DEFAULT_ZOOM,
  DEFAULT_VIEW,
  EMPTY_YEAR_STRING,
  ALL_YEARS_STRING,
} from "../../constants";

let yearFromStore;
let artistFromStore;
let crewFromStore;
let isSearch;
let isShowOnMapModeValue;
let isLighthouseMode;

selectedYear.subscribe((value) => {
  yearFromStore = value;
});

selectedArtist.subscribe((value) => {
  artistFromStore = value;
});

selectedCrew.subscribe((value) => {
  crewFromStore = value;
});

isSearchResults.subscribe((value) => {
  isSearch = value;
});

isShowOnMapMode.subscribe((value) => {
  isShowOnMapModeValue = value;
});

isLighthouseActive.subscribe((value) => {
  isLighthouseMode = value;
});

const getLocationByIp = () =>
  fetch("https://ipinfo.io/json?token=f7826cd7c9e44b")
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

  if (isLighthouseMode) {
    requestRecentSpots();
    return;
  }

  if (!isSearch && !isShowOnMapModeValue) {
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
      const shouldSearch = artistFromStore || crewFromStore;
      mapBounds.set(bounds);
      if (shouldSearch) {
        const params = {
          artist: artistFromStore,
          crew: crewFromStore,
          isInitial: true,
        };

        if (yearFromStore !== ALL_YEARS_STRING) {
          params.year =
            yearFromStore !== EMPTY_YEAR_STRING ? yearFromStore : "";
        }

        performSearch(params);
      } else {
        isInitialized.set(true);
        requestSpots(yearFromStore || getCurrentYear());
      }
    });
};

export const normalizeCoords = (coordinate) =>
  Math.round(coordinate * 100000) / 100000;
