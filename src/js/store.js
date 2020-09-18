import { writable } from "svelte/store";

export const isLoggedIn = writable(false);

export const selectedYear = writable("2020");
