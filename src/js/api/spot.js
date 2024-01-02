import { MAX_SPOTS_PER_PAGE } from "../constants";
import {
  DRAFT_GET_LAST,
  DRAFT_PUBLISH,
  DRAFT_UPDATE,
  SPOT_FROM_POLY,
  SPOT_ID,
  SPOT_ID_FEEDBACK,
  SPOT_LIMIT_DAYS,
  SPOT_YEAR,
  USER_CATEGORY,
  USER_ID_SPOTS,
} from "./endpoints";

export const getSpots = async (
  year,
  geoRect,
  categories,
  withHunters = true
) => {
  const response = await fetch(
    SPOT_YEAR(year, geoRect, categories, withHunters),
    {
      method: "GET",
    }
  );
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

export const getLastSpotDraft = async (token) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(DRAFT_GET_LAST(), {
    method: "GET",
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};

export const updateSpotDraft = async (
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
    spotId,
    showInProfile,
  }
) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("spot_status", spotStatus);
  if (lat) formData.append("lat", lat);
  if (lng) formData.append("lng", lng);
  if (img) formData.append("img", img);
  if (categoryId) formData.append("category_id", categoryId);
  if (artistsCrews?.length) {
    artistsCrews.forEach((item, index) => {
      const { artist, crew, userArtist, userCrew } = item;
      if (
        artist ||
        crew ||
        userArtist ||
        userCrew ||
        (index === 0 &&
          (typeof artist !== "undefined" ||
            typeof crew !== "undefined" ||
            typeof userCrew !== "undefined" ||
            typeof userArtist !== "undefined"))
      ) {
        if (!userArtist && !artist) {
          formData.append(`artist_crew[${index}][user_by_artist_id]`, "");
          formData.append(`artist_crew[${index}][artist]`, "");
        } else {
          userArtist
            ? formData.append(
                `artist_crew[${index}][user_by_artist_id]`,
                userArtist
              )
            : formData.append(`artist_crew[${index}][artist]`, artist);
        }

        if (!userCrew && !crew) {
          formData.append(`artist_crew[${index}][user_by_crew_id]`, "");
          formData.append(`artist_crew[${index}][crew]`, "");
        } else {
          userCrew
            ? formData.append(
                `artist_crew[${index}][user_by_crew_id]`,
                userCrew
              )
            : formData.append(`artist_crew[${index}][crew]`, crew);
        }
      }
    });
  }
  if (typeof year !== "undefined") formData.append("year", year);
  if (typeof videoLink !== "undefined") {
    formData.append("video_link", videoLink);
  }
  if (typeof description !== "undefined") {
    formData.append("description", description);
  }
  if (firmId) formData.append("firm_id", firmId);
  if (typeof link !== "undefined") formData.append("link", link);
  if (typeof additionalImg !== "undefined") {
    formData.append("additionalImg", additionalImg);
  }
  if (typeof sketch !== "undefined") formData.append("sketch", sketch);
  if (spotId) formData.append("spot_id", spotId);
  if (typeof showInProfile !== "undefined") {
    formData.append("showInProfile", showInProfile);
  }
  const response = await fetch(DRAFT_UPDATE(), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};

export const publishSpotDraft = async (token, spotId) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  if (spotId) formData.append("spot_id", spotId);
  const response = await fetch(DRAFT_PUBLISH(), {
    method: "POST",
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
  { limit = MAX_SPOTS_PER_PAGE, offset = 0, year = null, sortBy }
) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(
    USER_ID_SPOTS(userId, limit, offset, sortBy, year),
    {
      method: "GET",
      withCredentials: true,
      headers: { Authorization: bearer },
    }
  );
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
    additionalImg,
    sketch,
    videoLink,
    description,
    categoryId,
    link,
    artistsCrews,
    showInProfile,
  }
) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("spot_status", spotStatus);
  formData.append("category_id", categoryId);
  formData.append("year", year);
  if (img) formData.append("img", img);
  if (typeof additionalImg !== "undefined") {
    formData.append("additionalImg", additionalImg);
  }
  if (typeof sketch !== "undefined") formData.append("sketch", sketch);
  formData.append("video_link", videoLink);
  formData.append("description", description);
  formData.append("link", link);
  formData.append("showInProfile", showInProfile);
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
