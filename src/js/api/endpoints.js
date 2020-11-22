import { ENDPOINT_ORIGIN } from "../constants";

export const authLogin = () => `${ENDPOINT_ORIGIN}/api/login`;

export const authVerify = () => `${ENDPOINT_ORIGIN}/api/verify`;

export const user = () => `${ENDPOINT_ORIGIN}/api/user`;

export const userId = (id) => `${ENDPOINT_ORIGIN}/api/user/${id}`;

export const firm = () => `${ENDPOINT_ORIGIN}/api/firm`;

export const firmId = (id) => `${ENDPOINT_ORIGIN}/api/firm/${id}`;

export const availability = () => `${ENDPOINT_ORIGIN}/api/availability`;

export const availabilityId = (id) =>
  `${ENDPOINT_ORIGIN}/api/availability/${id}`;

export const category = () => `${ENDPOINT_ORIGIN}/api/category`;

export const categoryId = (id) => `${ENDPOINT_ORIGIN}/api/category/${id}`;

export const country = () => `${ENDPOINT_ORIGIN}/api/country`;

export const city = (code) => `${ENDPOINT_ORIGIN}/api/country/${code}/city`;

export const getSettings = () => `${ENDPOINT_ORIGIN}/api/settings`;
