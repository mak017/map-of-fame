import {
  FOLLOW,
  FOLLOWERS,
  FOLLOWERS_FEED,
  FOLLOWING,
  UNFOLLOW,
} from "./endpoints";

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

export const getFollowers = async (token) => {
  const bearer = `Bearer ${token}`;

  const response = await fetch(FOLLOWERS(), {
    method: "GET",
    headers: { Authorization: bearer },
  });

  const result = await response.json();
  return result;
};

export const getFollowing = async (token) => {
  const bearer = `Bearer ${token}`;

  const response = await fetch(FOLLOWING(), {
    method: "GET",
    headers: { Authorization: bearer },
  });

  const result = await response.json();
  return result;
};

export const getFollowingFeed = async (token) => {
  const bearer = `Bearer ${token}`;

  const response = await fetch(FOLLOWERS_FEED(), {
    method: "GET",
    headers: { Authorization: bearer },
  });

  const result = await response.json();
  return result;
};
