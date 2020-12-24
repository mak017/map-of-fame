import { EMPTY_YEAR_STRING, MIN_YEAR } from "../constants";
import { getCurrentYear } from "../utils/commonUtils";

export const getDatesFilterStub = () => {
  const yearsArray = [EMPTY_YEAR_STRING, "13 000 B C", "1904", "1945", "1950"];
  for (let year = MIN_YEAR; year < getCurrentYear() + 2; year += 1) {
    yearsArray.push(`${year}`);
  }
  return yearsArray;
};

export const getValidDates = (isFull) => {
  const years = getDatesFilterStub();
  const firstIndex = isFull ? 0 : 4;
  return years.slice(firstIndex, years.length - 1);
};
