import { getCurrentYear } from "./utils/commonUtils";

export const MOBILE_BREAKPOINT = 767;

export const DEFAULT_VIEW = { coordinates: [49.58223, 19.2041], zoom: 5 };

export const DEFAULT_ZOOM = 13;

export const MIN_ZOOM = 2;

export const MAX_ZOOM = 19;

export const MAX_SPOTS_PER_PAGE = 36;

export const MAX_IMAGE_FILE_SIZE = 5120000;

export const STATUSES = { live: "Live", buffed: "Buffed", unknown: "Unknown" };

export const USER_TYPES = {
  artist: "Artist",
  crew: "Crew",
  hunter: "Hunter",
  admin: "Admin",
  superUser: "Super User",
};

export const statusesOrdered = [
  STATUSES.live,
  STATUSES.buffed,
  STATUSES.unknown,
];

export const EMPTY_YEAR_STRING = "????";

export const ALL_YEARS_STRING = "All";

export const ENDPOINT_ORIGIN = process.env.SVELTE_APP_API_ENTRYPOINT;

export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;

export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

export const ERROR_MESSAGES = {
  emailEmpty: "Please enter your email",
  emailInvalid: "You have entered invalid email",
  passwordEmpty: "Please enter password",
  passwordInvalid: "Password must be between 8 to 20 characters",
  profileSubtypeEmpty: "Please select profile subtype",
  usernameEmpty: "Please fill in your username",
  usernameInvalid: "Username can only contain latin letters and numbers",
  nameEmpty: "Please fill in your name",
  countryCityEmpty: "Please specify where you from",
  fileEmpty: "Please upload image",
  fileTooLarge: "File size must be less than 5 MB",
  yearNotInRange: (yearStart) =>
    `Year is not in range of ${yearStart} - ${getCurrentYear()}`,
  sprayEmpty: "Please select spray paint used",
  genericEmpty: "This is required field",
  videoLinkInvalid: "Youtube/Vimeo/Dailymotion/Instagram/TikTok links only",
  categoryEmpty: "Please select at least 1 category",
  categorySingleEmpty: "Please select category",
  linkInvalid: "Link must start with http or https",
  fieldMinLength: (field, min) =>
    `The ${field} must be at least ${min} characters`,
  artistEmpty: "The artist field is required when crew is not present",
  crewEmpty: "The crew field is required when artist is not present",
  contactEmpty: "Please provide your contact information",
};
