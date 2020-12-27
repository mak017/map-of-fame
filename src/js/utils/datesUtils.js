import { EMPTY_YEAR_STRING } from "../constants";
import { getCurrentYear } from "./commonUtils";

const staticYearsArray = [
  EMPTY_YEAR_STRING,
  "13 000 B C",
  "1904",
  "1945",
  "1950",
];

export const getDatesFilter = (yearStart, yearEnd) => {
  const years = [...staticYearsArray];
  for (let year = +yearStart; year < +yearEnd + 1; year += 1) {
    years.push(`${year}`);
  }
  return years;
};

export const getValidDates = (isFull, yearStart) => {
  const years = isFull ? [...staticYearsArray] : [];
  for (let year = +yearStart; year < getCurrentYear() + 1; year += 1) {
    years.push(`${year}`);
  }
  return years;
};

export const validateYear = (year, yearStart, isFull = true) =>
  getValidDates(isFull, yearStart).includes(year);
