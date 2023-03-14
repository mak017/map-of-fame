import { MAX_SPOTS_PER_PAGE } from "../constants";
import {
  SPOT,
  SPOT_FROM_POLY,
  SPOT_ID,
  SPOT_ID_FEEDBACK,
  SPOT_LIMIT_DAYS,
  SPOT_YEAR,
  USER_CATEGORY,
  USER_ID_SPOTS,
  USER_SPOTS,
} from "./endpoints";

export const getSpots = async (year, geoRect, categories) => {
  const response = await fetch(SPOT_YEAR(year, geoRect, categories), {
    method: "GET",
  });
  const result = await response.json();
  return result;
};

export const getRecentSpots = async (limitDays, geoRect, categories) => {
  const response = await fetch(
    SPOT_LIMIT_DAYS(limitDays, geoRect, categories),
    {
      method: "GET",
    }
  );
  const result = await response.json();
  return result;
};

export const getSpotById = async (id) => {
  const response = await fetch(SPOT_ID(id), { method: "GET" });
  const result = await response.json();
  return result;
};

export const getSpotsInArea = async (polygon) => {
  const response = await fetch(SPOT_FROM_POLY(polygon), { method: "GET" });
  const result = await response.json();
  return result;
};

export const createSpot = async (
  token,
  {
    lat,
    lng,
    artistsCrews,
    year,
    spotStatus,
    img,
    additionalImg,
    sketch,
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
  if (artistsCrews?.length) {
    artistsCrews.forEach((item, index) => {
      const { artist, crew } = item;
      if (artist || crew) {
        formData.append(`artist_crew[${index}][artist]`, artist);
        formData.append(`artist_crew[${index}][crew]`, crew);
      }
    });
  }
  if (year) formData.append("year", year);
  if (videoLink) formData.append("video_link", videoLink);
  if (description) formData.append("description", description);
  if (firmId) formData.append("firm_id", firmId);
  if (link) formData.append("link", link);
  if (additionalImg) formData.append("additionalImg", additionalImg);
  if (sketch) formData.append("sketch", sketch);
  const response = await fetch(SPOT(), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};

export const feedbackOnSpot = async (spotId, { userId, message, reason }) => {
  const formData = new FormData();
  if (userId) formData.append("user_id", userId);
  formData.append("message", message);
  formData.append("reason", reason);
  const response = await fetch(SPOT_ID_FEEDBACK(spotId), {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  return result;
};

export const getUserSpots = async (
  userId,
  token,
  { limit = MAX_SPOTS_PER_PAGE, offset = 0, year = null }
) => {
  const bearer = `Bearer ${token}`;
  const response =
    userId === null
      ? await fetch(USER_SPOTS(limit, offset, year), {
          method: "GET",
          withCredentials: true,
          headers: { Authorization: bearer },
        })
      : await fetch(USER_ID_SPOTS(userId, limit, offset, year), {
          method: "GET",
        });
  const result = await response.json();
  return result;
};

export const updateSpot = async (
  token,
  spotId,
  {
    year,
    spotStatus,
    img,
    videoLink,
    description,
    categoryId,
    link,
    artistsCrews,
  }
) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("spot_status", spotStatus);
  formData.append("category_id", categoryId);
  formData.append("year", year);
  if (img) formData.append("img", img);
  formData.append("video_link", videoLink);
  formData.append("description", description);
  formData.append("link", link);
  if (artistsCrews?.length) {
    artistsCrews.forEach((item, index) => {
      const { artist, crew } = item;
      if (artist || crew || (artistsCrews.length === 1 && index === 0)) {
        formData.append(`artist_crew[${index}][artist]`, artist);
        formData.append(`artist_crew[${index}][crew]`, crew);
      }
    });
  }
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

export const getUserCategories = async (token) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(USER_CATEGORY(), {
    method: "GET",
    withCredentials: true,
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};
