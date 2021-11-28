import { ALL_YEARS_STRING, EMPTY_YEAR_STRING } from "../constants";
import { getCurrentYear } from "./commonUtils";

export const getDatesFilter = (yearStart, yearEnd, additionalYears = []) => {
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

export const getProfileYears = (yearsFromResponse) =>
  yearsFromResponse
    ? [
        ALL_YEARS_STRING,
        ...new Set(
          Object.values(yearsFromResponse)
            .map((y) => (y === null ? EMPTY_YEAR_STRING : y))
            .filter((y) => y)
            .sort(
              (a, b) =>
                (a === EMPTY_YEAR_STRING) - (b === EMPTY_YEAR_STRING) ||
                -(a > b) ||
                +(a < b)
            )
        ),
      ]
    : [];
