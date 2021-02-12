import { CATEGORY, FIRM, SETTINGS } from "./endpoints";

export const getSettingsRequest = async () => {
  const response = await fetch(SETTINGS(), { method: "GET" });
  const result = await response.json();
  return result;
};

export const getFirmsRequest = async () => {
  const response = await fetch(FIRM(), { method: "GET" });
  const result = await response.json();
  return result;
};

export const getCategories = async () => {
  const response = await fetch(CATEGORY(), { method: "GET" });
  const result = await response.json();
  return result;
};
