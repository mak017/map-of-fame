import { EMPTY_YEAR_STRING } from "../constants";
import { getCurrentYear } from "./commonUtils";

export const getDatesFilter = (yearStart, yearEnd, additionalYears) => {
  const years = [EMPTY_YEAR_STRING, ...additionalYears];
  for (let year = +yearStart; year <= +yearEnd + 1; year += 1) {
    years.push(`${year}`);
  }
  return years;
};

export const getValidDates = (additionalYears, yearStart) => {
  const years = [...additionalYears];
  for (let year = +yearStart; year < getCurrentYear() + 1; year += 1) {
    years.push(`${year}`);
  }
  return years;
};

export const validateYear = (year, yearStart, additionalYears = []) =>
  getValidDates(additionalYears, yearStart).includes(year);
