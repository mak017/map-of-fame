import { getCurrentYear } from "./utils/commonUtils";

export const MOBILE_BREAKPOINT = 767;

export const DEFAULT_VIEW = { coordinates: [49.58223, 19.2041], zoom: 5 };

export const DEFAULT_ZOOM = 13;

export const MIN_ZOOM = 2;

export const MAX_ZOOM = 19;

export const STATUSES = { live: "Live", buffed: "Buffed", unknown: "Unknown" };

export const USER_TYPES = { artist: "Artist", hunter: "Hunter" };

export const statusesOrdered = [
  STATUSES.live,
  STATUSES.buffed,
  STATUSES.unknown,
];

export const EMPTY_YEAR_STRING = "????";

export const ENDPOINT_ORIGIN = process.env.SVELTE_APP_API_ENTRYPOINT;

export const AUTH_MODALS = {
  login: "login",
  registration: "registration",
  forgotPassword: "forgotPassword",
};

export const ERROR_MESSAGES = {
  emailEmpty: "Please enter your email",
  emailInvalid: "You have entered invalid email",
  passwordEmpty: "Please enter password",
  passwordInvalid: "Password must be between 8 to 20 characters",
  usernameEmpty: "Please fill in your name",
  countryCityEmpty: "Please specify where you from",
  fileEmpty: "Please upload image",
  fileTooLarge: "File size must be less than 5 MB",
  yearNotInRange: (yearStart) =>
    `Year is not in range of ${yearStart} - ${getCurrentYear()}`,
  sprayEmpty: "Please select spray paint used",
  genericEmpty: "This is required field",
  videoLinkInvalid: "Youtube, Vimeo or Dailymotion links only",
  categoryEmpty: "Please select at least 1 category",
  linkInvalid: "Link must start with http or https",
};
