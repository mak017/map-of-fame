import { authLogin, authVerify, user, userPassword } from "./endpoints";

export const loginRequest = async (email, password) => {
  const data = new URLSearchParams();
  data.append("email", email);
  data.append("password", password);
  const response = await fetch(authLogin(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const result = await response.json();
  return result;
};

export const verifyAuthRequest = async (token) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(authVerify(), {
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
  const response = await fetch(user(), {
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
  const response = await fetch(userPassword(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const result = await response.json();
  return result;
};
