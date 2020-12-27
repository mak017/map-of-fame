import { country } from "./endpoints";

export const getAllCountries = async () => {
  const response = await fetch(country(), { method: "GET" });
  const result = await response.json();
  return result;
};
