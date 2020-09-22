import { writable } from "svelte/store";
import { getCurrentYear } from "./utils";

export const isLoggedIn = writable(true);

export const selectedYear = writable(`${getCurrentYear()}`);

export const selectedCategory = writable([]);

export const selectedArtist = writable("");

export const huntersFilter = writable(false);
