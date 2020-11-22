import { getSettings } from "./endpoints";

export const getSettingsRequest = async (token) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(getSettings(), {
    method: "GET",
    withCredentials: true,
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};
