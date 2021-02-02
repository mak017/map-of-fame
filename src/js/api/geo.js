import { COUNTRY, COUNTRY_SEARCH } from "./endpoints";

export const getAllCountries = async () => {
  const response = await fetch(COUNTRY(), { method: "GET" });
  const result = await response.json();
  return result;
};

export const getCountryByIp = async (ip) => {
  const response = await fetch(COUNTRY_SEARCH(ip), { method: "GET" });
  const result = await response.json();
  return result;
};
