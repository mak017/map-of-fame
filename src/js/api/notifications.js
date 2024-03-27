import {
  INVITATION_APPROVE,
  INVITATION_DECLINE,
  NOTIFICATIONS,
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
