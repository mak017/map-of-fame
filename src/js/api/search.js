import { searchArtistsCrews } from "./endpoints";

export const requestSearchArtistsCrews = async (query) => {
  const response = await fetch(searchArtistsCrews(query), { method: "GET" });
  const result = await response.json();
  return result;
};
