import { CATEGORIES, MOBILE_BREAKPOINT } from "./constants";
import { getValidDates } from "./stubs/datesFilterStub";

export const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

export const validateYear = (year, isFull = true) =>
  getValidDates(isFull).includes(year);

export const validateCategory = (categories) =>
  categories.every((cat) => Object.values(CATEGORIES).includes(cat));

export const getCurrentYear = () => new Date().getFullYear();
