import { getCurrentYear } from "./utils";

export const MOBILE_BREAKPOINT = 767;

export const DEFAULT_VIEW = { coordinates: [49.58223, 19.2041], zoom: 5 };

export const DEFAULT_ZOOM = 13;

export const MAX_ZOOM = 19;

export const CATEGORIES = { walls: "Walls", trains: "Trains", other: "Other" };

export const STATUSES = { live: "Live", buffed: "Buffed", unknown: "Unknown" };

export const USER_TYPES = { artist: "Artist", hunter: "Hunter" };

export const categoriesOrdered = [
  CATEGORIES.walls,
  CATEGORIES.trains,
  CATEGORIES.other,
];

export const statusesOrdered = [
  STATUSES.live,
  STATUSES.buffed,
  STATUSES.unknown,
];

export const MIN_YEAR = 1967;

export const EMPTY_YEAR_STRING = "????";

export const ENDPOINT_ORIGIN = "http://1828476.nailhub.web.hosting-test.net";

export const AUTH_MODALS = {
  login: "login",
  registration: "registration",
  forgotPassword: "forgotPassword",
};

export const ERROR_MESSAGES = {
  emailEmpty: "Please enter your email",
  emailInvalid: "You have entered invalid email",
  passwordEmpty: "Please enter password",
  passwordInvalid:
    "Password must be between 8 to 20 characters and contain at least 1 numeric digit, 1 uppercase and 1 lowercase letter",
  usernameEmpty: "Please fill in your name",
  countryCityEmpty: "Please specify where you from",
  fileEmpty: "Please upload image",
  fileTooLarge: "File size must be less than 5 MB",
  yearNotInRange: `Year is not in range of ${MIN_YEAR} - ${getCurrentYear()}`,
  sprayEmpty: "Please select spray paint used",
  genericEmpty: "This is required field",
};
