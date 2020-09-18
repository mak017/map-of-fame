export const getDatesFilterStub = () => {
  const yearsArray = [
    "????",
    "13 000 B C",
    "1904",
    "1945",
    "1950",
    "1966",
    "1967",
  ];
  for (let year = 1969; year < 2022; year += 1) {
    yearsArray.push(`${year}`);
  }
  return yearsArray;
};
