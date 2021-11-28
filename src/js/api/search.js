import { SPOT_SEARCH, USER_SEARCH } from "./endpoints";

export const requestSearchArtistsCrews = async (artist, crew) => {
  const response = await fetch(USER_SEARCH(artist, crew), { method: "GET" });
  const result = await response.json();
  return result;
};

export const requestSearchSpots = async ({ artist, crew, geoRect, year }) => {
  const requestObject = { geoRect, year };
  if (artist) {
    requestObject.artist = artist;
  }
  if (crew) {
    requestObject.crew = crew;
  }
  const response = await fetch(SPOT_SEARCH(), {
    method: "POST",
    body: JSON.stringify(requestObject),
    headers: { "Content-Type": "application/json" },
  });
  const result = await response.json();
  return result;
};
