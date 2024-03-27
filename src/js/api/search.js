import { MAX_ITEMS_PER_PAGE } from "../constants";
import {
  SPOT_SEARCH,
  CREW_ARTIST_SEARCH,
  USER_SERACH_BY_ARTIST,
  USER_SERACH_BY_CREW,
  PHOTO_WALL,
  SPOT_SEARCH_BY_IDS,
} from "./endpoints";

export const requestSearchArtistsCrews = async (text) => {
  const response = await fetch(CREW_ARTIST_SEARCH(encodeURIComponent(text)), {
    method: "GET",
  });
  const result = await response.json();
  return result;
};

export const requestPhotoWall = async (
  text,
  limit = MAX_ITEMS_PER_PAGE,
  offset = 0
) => {
  const response = await fetch(
    PHOTO_WALL(encodeURIComponent(text), limit, offset),
    {
      method: "GET",
    }
  );
  const result = await response.json();
  return result;
};

export const requestSearchUserByArtist = async (artist) => {
  const response = await fetch(
    USER_SERACH_BY_ARTIST(encodeURIComponent(artist)),
    {
      method: "GET",
    }
  );
  const result = await response.json();
  return result;
};

export const requestSearchUserByCrew = async (crew) => {
  const response = await fetch(USER_SERACH_BY_CREW(encodeURIComponent(crew)), {
    method: "GET",
  });
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

export const requestSpotsById = async (ids) => {
  const response = await fetch(SPOT_SEARCH_BY_IDS(ids), { method: "GET" });
  const result = await response.json();
  return result;
};
