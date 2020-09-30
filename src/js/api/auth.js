import { authLogin } from "./endpoints";

export const loginRequest = async (email, password) => {
  const data = new URLSearchParams();
  data.append("email", email);
  data.append("password", password);
  const response = await fetch(authLogin(), {
    method: "POST",
    // mode: "no-cors",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    // body: `email=${email}&password=${password}`,
    body: data,
  });
  return await response;
};
