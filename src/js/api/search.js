import {
  SPOT_SEARCH,
  CREW_ARTIST_SEARCH,
  USER_SERACH_BY_ARTIST,
  USER_SERACH_BY_CREW,
} from "./endpoints";

export const requestSearchArtistsCrews = async (artist, crew) => {
  const response = await fetch(CREW_ARTIST_SEARCH(artist, crew), {
    method: "GET",
  });
  const result = await response.json();
  return result;
};

export const requestSearchUserByArtist = async (artist) => {
  const response = await fetch(USER_SERACH_BY_ARTIST(artist), {
    method: "GET",
  });
  const result = await response.json();
  return result;
};

export const requestSearchUserByCrew = async (crew) => {
  const response = await fetch(USER_SERACH_BY_CREW(crew), { method: "GET" });
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
