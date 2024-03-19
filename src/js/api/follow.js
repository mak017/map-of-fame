import {
  FOLLOW,
  FOLLOWERS,
  FOLLOWERS_FEED,
  FOLLOWING,
  UNFOLLOW,
} from "./endpoints";

import { MAX_SPOTS_PER_PAGE } from "../constants";

export const followUser = async (token, userId) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("user_id", userId);

  const response = await fetch(FOLLOW(), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
    body: formData,
  });

  const result = await response.json();
  return result;
};

export const unfollowUser = async (token, userId) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("user_id", userId);

  const response = await fetch(UNFOLLOW(), {
    method: "POST",
    withCredentials: true,
    headers: { Authorization: bearer },
    body: formData,
  });

  const result = await response.json();
  return result;
};

export const getFollowers = async (
  token,
  { limit = MAX_SPOTS_PER_PAGE, offset = 0 }
) => {
  const bearer = `Bearer ${token}`;

  const response = await fetch(FOLLOWERS(limit, offset), {
    method: "GET",
    headers: { Authorization: bearer },
  });

  const result = await response.json();
  return result;
};

export const getFollowing = async (
  token,
  { limit = MAX_SPOTS_PER_PAGE, offset = 0 }
) => {
  const bearer = `Bearer ${token}`;

  const response = await fetch(FOLLOWING(limit, offset), {
    method: "GET",
    headers: { Authorization: bearer },
  });

  const result = await response.json();
  return result;
};

export const getFollowingFeed = async (
  token,
  { limit = MAX_SPOTS_PER_PAGE, offset = 0 }
) => {
  const bearer = `Bearer ${token}`;

  const response = await fetch(FOLLOWERS_FEED(limit, offset), {
    method: "GET",
    headers: { Authorization: bearer },
  });

  const result = await response.json();
  return result;
};
