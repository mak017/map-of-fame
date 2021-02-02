import { USER_SEARCH } from "./endpoints";

export const requestSearchArtistsCrews = async (query) => {
  const response = await fetch(USER_SEARCH(query), { method: "GET" });
  const result = await response.json();
  return result;
};
