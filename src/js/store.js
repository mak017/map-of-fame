import { writable } from "svelte/store";
import { fakeUser, fakeUserSpots } from "./stubs/fakeUserData";
import { getCurrentYear } from "./utils/commonUtils";

export const isLoggedIn = writable(false);

export const selectedYear = writable(`${getCurrentYear()}`);

export const selectedCategory = writable([]);

export const selectedArtist = writable("");

export const huntersFilter = writable(false);

export const openedMarkerData = writable(null);

export const markersStore = writable([]);

// export const userData = writable({});
export const userData = writable(fakeUser);

// export const userSpots = writable([]);
export const userSpots = writable(fakeUserSpots);

export const countriesList = writable([]);

export const settings = writable([]);

export const firms = writable([]);
