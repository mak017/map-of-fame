import { country } from "./endpoints";

export const getAllCountries = async () => {
  const response = await fetch(country(), {
    method: "GET",
    // withCredentials: true,
    // headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};
