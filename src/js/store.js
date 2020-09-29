import { writable } from "svelte/store";
import { USER_TYPES } from "./constants";
import { getCurrentYear } from "./utils";

export const isLoggedIn = writable(true);

export const selectedYear = writable(`${getCurrentYear()}`);

export const selectedCategory = writable([]);

export const selectedArtist = writable("");

export const huntersFilter = writable(false);

export const userType = writable(USER_TYPES.artist);

export const openedMarkerData = writable(null);

export const markersStore = writable([]);
