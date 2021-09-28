import { SPOT_SEARCH, USER_SEARCH } from "./endpoints";

export const requestSearchArtistsCrews = async (query) => {
  const response = await fetch(USER_SEARCH(query), { method: "GET" });
  const result = await response.json();
  return result;
};

export const requestSearchSpots = async ({
  year,
  name,
  category,
  showHunters,
  geoRect,
}) => {
  const response = await fetch(SPOT_SEARCH(), {
    method: "POST",
    body: JSON.stringify({
      year,
      name,
      category,
      showHunters,
      geoRect,
    }),
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();
  return result;
};
