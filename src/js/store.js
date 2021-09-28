import { writable } from "svelte/store";
import { getCurrentYear } from "./utils/commonUtils";

export const isLoggedIn = writable(false);

export const selectedYear = writable(`${getCurrentYear()}`);

export const selectedCategory = writable([]);

export const selectedArtist = writable("");

export const huntersFilter = writable(false);

export const openedMarkerData = writable(null);

export const markersStore = writable([]);

export const isSearchResults = writable(false);

export const userData = writable({});

export const countriesList = writable([]);

export const settings = writable([]);

export const firms = writable([]);

export const categories = writable([]);

export const isLoading = writable(false);

export const markerIdFromUrl = writable(null);

export const isLighthouseActive = writable(false);

export const mapBounds = writable([]);
