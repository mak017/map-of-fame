import { MAX_SPOTS_PER_PAGE } from "../constants";
import {
  SPOT,
  SPOT_ID,
  SPOT_ID_FEEDBACK,
  SPOT_YEAR,
  USER_ID_SPOTS,
} from "./endpoints";

export const getSpots = async (year, geoRect) => {
  const response = await fetch(SPOT_YEAR(year, geoRect), { method: "GET" });
  const result = await response.json();
  return result;
};

export const getSpotById = async (id) => {
  const response = await fetch(SPOT_ID(id), { method: "GET" });
  const result = await response.json();
  return result;
};

export const createSpot = async (
  token,
  {
    lat,
    lng,
    artist,
    crew,
    year,
    spotStatus,
    img,
    videoLink,
    description,
    categoryId,
    firmId,
    link,
  }
) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("lat", lat);
  formData.append("lng", lng);
  formData.append("spot_status", spotStatus);
  formData.append("img", img);
  formData.append("category_id", categoryId);
  if (artist) formData.append("artist", artist);
  if (crew) formData.append("crew", crew);
  if (year) formData.append("year", year);
  if (videoLink) formData.append("video_link", videoLink);
  if (description) formData.append("description", description);
  if (firmId) formData.append("firm_id", firmId);
  if (link) formData.append("link", link);
  const response = await fetch(SPOT(), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};

export const feedbackOnSpot = async (
  token,
  spotId,
  { userId, message, reason }
) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("message", message);
  formData.append("reason", reason);
  const response = await fetch(SPOT_ID_FEEDBACK(spotId), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};

export const getUserSpots = async (
  token,
  userId,
  { limit = MAX_SPOTS_PER_PAGE, offset = 0, year = null }
) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(USER_ID_SPOTS(userId, limit, offset, year), {
    method: "GET",
    withCredentials: true,
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};

export const updateSpot = async (
  token,
  spotId,
  {
    artist,
    crew,
    year,
    spotStatus,
    img,
    videoLink,
    description,
    categoryId,
    link,
  }
) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("spot_status", spotStatus);
  formData.append("category_id", categoryId);
  if (artist) formData.append("artist", artist);
  if (crew) formData.append("crew", crew);
  if (year) formData.append("year", year);
  if (img) formData.append("img", img);
  if (videoLink) formData.append("video_link", videoLink);
  if (description) formData.append("description", description);
  if (link) formData.append("link", link);
  const response = await fetch(SPOT_ID(spotId), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};

export const deleteSpot = async (token, spotId) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(SPOT_ID(spotId), {
    method: "DELETE",
    withCredentials: true,
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};
