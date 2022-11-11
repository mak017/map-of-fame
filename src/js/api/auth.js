import {
  LOGIN,
  VERIFY,
  USER,
  USER_PASSWORD,
  USER_PASSWORD_TOKEN,
  INVITES_GET_FOR_USER,
  PRE_REG_EMAIL,
  PRE_REG_CONTACT,
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
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};

export const createUserRequest = async ({
  username,
  name,
  email,
  password,
  country,
  type,
  crew,
  link,
  invite,
}) => {
  const data = new URLSearchParams();
  data.append("username", username);
  data.append("name", name);
  data.append("email", email);
  data.append("password", password);
  data.append("country", country);
  data.append("type", type);
  data.append("crew", crew);
  data.append("link", link);
  if (invite) {
    data.append("invite", invite);
  }
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

export const changePasswordCheckToken = async (resetToken, id) => {
  const data = new URLSearchParams();
  data.append("reset_password_token", resetToken);
  data.append("id", id);
  const response = await fetch(USER_PASSWORD_TOKEN(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const result = await response.json();
  return result;
};

export const changePasswordReset = async (resetToken, password) => {
  const data = new URLSearchParams();
  const bearer = `Bearer ${resetToken}`;
  data.append("password", password);
  data.append("confirmation", password);
  const response = await fetch(USER_PASSWORD(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: bearer,
    },
    body: data,
  });
  const result = await response.json();
  return result;
};

export const getInvites = async (token) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(INVITES_GET_FOR_USER(), {
    method: "GET",
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};

export const preRegEmail = async (email) => {
  const data = new URLSearchParams();
  data.append("email", email);
  const response = await fetch(PRE_REG_EMAIL(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const result = await response.json();
  return result;
};

export const preRegContact = async (contact) => {
  const data = new URLSearchParams();
  data.append("contact", contact);
  const response = await fetch(PRE_REG_CONTACT(), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: data,
  });
  const result = await response.json();
  return result;
};
