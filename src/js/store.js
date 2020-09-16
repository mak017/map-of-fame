import { writable } from "svelte/store";

export const isLoggedIn = writable(true);

console.log("isLoggedIn :>> ", isLoggedIn);
