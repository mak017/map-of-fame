import { writable } from "svelte/store";
import { USER_TYPES } from "./constants";
import { fakeUser, fakeUserSpots } from "./stubs/fakeUserData";
import { getCurrentYear } from "./utils";

export const isLoggedIn = writable(true);

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
