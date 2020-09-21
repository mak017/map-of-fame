import { CATEGORIES, MOBILE_BREAKPOINT } from "./constants";
import { getValidDates } from "./stubs/datesFilterStub";

export const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

export const validateYear = (year) => getValidDates().includes(year);

export const validateCategory = (category) =>
  Object.values(CATEGORIES).includes(category);
