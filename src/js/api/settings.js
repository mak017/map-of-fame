import { category, firm, getSettings } from "./endpoints";

export const getSettingsRequest = async () => {
  const response = await fetch(getSettings(), { method: "GET" });
  const result = await response.json();
  return result;
};

export const getFirmsRequest = async (token) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(firm(), {
    method: "GET",
    withCredentials: true,
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};

export const getCategories = async () => {
  const response = await fetch(category(), { method: "GET" });
  const result = await response.json();
  return result;
};
