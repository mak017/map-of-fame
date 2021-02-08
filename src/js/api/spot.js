import { SPOT, SPOT_YEAR } from "./endpoints";

export const getSpots = async (year) => {
  const response = await fetch(SPOT_YEAR(year), { method: "GET" });
  const result = await response.json();
  return result;
};

export const createSpot = async (
  token,
  {
    ltd,
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
  formData.append("ltd", ltd);
  formData.append("lng", lng);
  formData.append("artist", artist);
  formData.append("crew", crew);
  formData.append("year", year);
  formData.append("spot_status", spotStatus);
  formData.append("img", img);
  formData.append("video_link", videoLink);
  formData.append("description", description);
  formData.append("category_id", categoryId);
  formData.append("firm_id", firmId);
  formData.append("link", link);
  const response = await fetch(SPOT(), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};
