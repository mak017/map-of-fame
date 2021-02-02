import {
  LOGIN,
  VERIFY,
  USER,
  USER_PASSWORD,
  USER_PASSWORD_TOKEN,
} from "./endpoints";

export const loginRequest = async (email, password) => {
  const data = new URLSearchParams();
  data.append("email", email);
  data.append("password", password);
  const response = await fetch(LOGIN(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const result = await response.json();
  return result;
};

export const verifyAuthRequest = async (token) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(VERIFY(), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};

export const createUserRequest = async ({
  name,
  email,
  password,
  country,
  city,
  type,
  crew,
  link,
}) => {
  const data = new URLSearchParams();
  data.append("name", name);
  data.append("email", email);
  data.append("password", password);
  data.append("country", country);
  data.append("city", city);
  data.append("type", type);
  data.append("crew", crew);
  data.append("link", link);
  const response = await fetch(USER(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const result = await response.json();
  return result;
};

export const changePasswordInit = async (email) => {
  const data = new URLSearchParams();
  data.append("email", email);
  const response = await fetch(USER_PASSWORD(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const result = await response.json();
  return result;
};

export const changePasswordCheckToken = async (resetToken) => {
  const data = new URLSearchParams();
  data.append("reset_password_token", resetToken);
  const response = await fetch(USER_PASSWORD_TOKEN(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
    // body: JSON.stringify({ reset_password_token: resetToken }),
  });
  const result = await response.json();
  return result;
};

export const changePasswordReset = async (resetToken, password) => {
  const data = new URLSearchParams();
  data.append("reset_password_token", resetToken);
  data.append("password", password);
  data.append("confirmation", password);
  const response = await fetch(USER_PASSWORD(), {
    method: "PUT",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const result = await response.json();
  return result;
};
