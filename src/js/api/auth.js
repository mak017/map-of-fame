import { isLoggedIn, userData } from "../store";
import { loadFromLocalStorage } from "../utils";
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
  if (response.ok) {
    return response.json();
  }
  return response;
};

export const verifyAuthRequest = async (token) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(authVerify(), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
  });
  if (response.ok) {
    return response.json();
  }
  return response;
};

export const verifyAuth = () => {
  const token = loadFromLocalStorage("token") || null;
  if (token) {
    verifyAuthRequest(token).then((response) => {
      if (response.status && response.data) {
        console.log("verify :>> ", response.data);
        userData.set(response.data);
        isLoggedIn.set(true);
      }
    });
  }
};
