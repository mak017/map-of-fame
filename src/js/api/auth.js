import { authLogin, authVerify } from "./endpoints";

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
