// import { getCountryByIp } from "../../api/geo";
import { getSpots } from "../../api/spot";
import { DEFAULT_ZOOM, DEFAULT_VIEW } from "../../constants";
import { getCurrentYear } from "../commonUtils";
import { permalink } from "./permalink";
import { markersStore, selectedYear } from "../../store";

let yearFromStore;

selectedYear.subscribe((value) => {
  yearFromStore = value;
});

const getLocationByIp = () =>
  fetch("https://ipinfo.io/json?token=c97eec3767f442")
    .then((response) => response.json())
    // getCountryByIp()
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
      // addRandomMarkers(map);
      permalink.setup(map);
      getSpots(yearFromStore || getCurrentYear()).then((response) => {
        const { status, data } = response;
        if (status && data) {
          markersStore.set(data);
        }
      });
    });
};

export const normalizeCoords = (coordinate) =>
  Math.round(coordinate * 100000) / 100000;
