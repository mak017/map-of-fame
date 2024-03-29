import {
  INVITATION_APPROVE,
  INVITATION_DECLINE,
  NOTIFICATIONS,
  NOTIFICATION_ID_ANSWER,
  NOTIFICATION_ID_SET_IS_SEEN,
} from "./endpoints";

export const requestNotifications = async (token, { limit, offset }) => {
  const bearer = `Bearer ${token}`;
  const response = await fetch(NOTIFICATIONS(limit, offset), {
    method: "GET",
    headers: { Authorization: bearer },
  });
  const result = await response.json();
  return result;
};

export const setNotificationSeen = async (token, id, status) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("status", status);
  const response = await fetch(NOTIFICATION_ID_SET_IS_SEEN(id), {
    method: "POST",
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};

export const answerNotification = async (
  token,
  id,
  { confirm, spotArtistCrewId }
) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("spot_artist_crew_id", spotArtistCrewId);
  formData.append("confirm", confirm);
  const response = await fetch(NOTIFICATION_ID_ANSWER(id), {
    method: "POST",
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};

export const approveInvitation = async (token, spotArtistCrewId) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("spot_artist_crew_id", spotArtistCrewId);
  const response = await fetch(INVITATION_APPROVE(), {
    method: "POST",
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};

export const declineInvitation = async (token, spotArtistCrewId) => {
  const bearer = `Bearer ${token}`;
  const formData = new FormData();
  formData.append("spot_artist_crew_id", spotArtistCrewId);
  const response = await fetch(INVITATION_DECLINE(), {
    method: "POST",
    headers: { Authorization: bearer },
    body: formData,
  });
  const result = await response.json();
  return result;
};
