import { ENDPOINT_ORIGIN } from "../constants";

const getGeoRect = (geoRect) =>
  `&geoRect[0][lat]=${geoRect[0].lat}&geoRect[0][lng]=${geoRect[0].lng}&geoRect[1][lat]=${geoRect[1].lat}&geoRect[1][lng]=${geoRect[1].lng}`;

const getCategories = (categories) =>
  categories.reduce(
    (acc, category, index) => acc.concat(`&category[${index}]=${category}`),
    ""
  );

export const LOGIN = () => `${ENDPOINT_ORIGIN}/api/login`;

export const VERIFY = () => `${ENDPOINT_ORIGIN}/api/verify`;

export const USER = () => `${ENDPOINT_ORIGIN}/api/user`;

export const USER_ID = (id) => `${ENDPOINT_ORIGIN}/api/user/${id}`;

export const USER_ID_SPOTS = (id, limit, offset, sortBy, year) => {
  let url = `${ENDPOINT_ORIGIN}/api/user/${id}/spots?limit=${limit}&offset=${offset}`;

  if (typeof sortBy === "string") {
    url = url.concat(`&sortBy=${sortBy}`);
  }

  if (typeof year === "string") {
    url = url.concat(`&year=${year}`);
  }

  return url;
};

export const USER_PASSWORD = () => `${ENDPOINT_ORIGIN}/api/user/password`;

export const USER_PASSWORD_TOKEN = () =>
  `${ENDPOINT_ORIGIN}/api/user/password/token`;

export const USER_SERACH_BY_ARTIST = (artist) =>
  `${ENDPOINT_ORIGIN}/api/user/searchByArtist?artist=${artist}`;

export const USER_SERACH_BY_CREW = (crew) =>
  `${ENDPOINT_ORIGIN}/api/user/searchByCrew?crew=${crew}`;

export const INVITES_GET_FOR_USER = () =>
  `${ENDPOINT_ORIGIN}/api/invites/getForUser`;

export const CREW_ARTIST_SEARCH = (text) =>
  `${ENDPOINT_ORIGIN}/api/crewAndArtist/search?search=${text}`;

export const PHOTO_WALL = (text, limit, offset) =>
  `${ENDPOINT_ORIGIN}/api/photoWall?search=${text}&limit=${limit}&offset=${offset}`;

export const USER_CATEGORY = () => `${ENDPOINT_ORIGIN}/api/usercategory`;

export const PRE_REG_EMAIL = () => `${ENDPOINT_ORIGIN}/api/prereg/email`;

export const PRE_REG_CONTACT = () => `${ENDPOINT_ORIGIN}/api/prereg/contact`;

export const NEWBIE = () => `${ENDPOINT_ORIGIN}/api/newbie`;

export const FIRM = () => `${ENDPOINT_ORIGIN}/api/firm`;

export const FIRM_ID = (id) => `${ENDPOINT_ORIGIN}/api/firm/${id}`;

export const AVAILABILITY = () => `${ENDPOINT_ORIGIN}/api/availability`;

export const AVAILABILITY_ID = (id) =>
  `${ENDPOINT_ORIGIN}/api/availability/${id}`;

export const CATEGORY = () => `${ENDPOINT_ORIGIN}/api/category`;

export const CATEGORY_ID = (id) => `${ENDPOINT_ORIGIN}/api/category/${id}`;

export const COUNTRY = () => `${ENDPOINT_ORIGIN}/api/country`;

export const COUNTRY_SEARCH = (ip) =>
  `${ENDPOINT_ORIGIN}/api/country/search?ip=${ip}`;

export const SETTINGS = () => `${ENDPOINT_ORIGIN}/api/settings`;

export const SITE_YEARS = () => `${ENDPOINT_ORIGIN}/api/site/years`;

export const SPOT = () => `${ENDPOINT_ORIGIN}/api/spot`;

export const SPOT_YEAR = (
  year,
  geoRect,
  categories,
  withHunters,
  withNubies
) => {
  let url = `${ENDPOINT_ORIGIN}/api/spot?hunters=${
    withHunters ? 1 : 0
  }&allow_newbie=${withNubies ? 1 : 0}${getGeoRect(geoRect)}`;

  if (typeof year !== "undefined") {
    url += `&year=${year}`;
  }

  if (categories) {
    url = url.concat(getCategories(categories));
  }
  return url;
};

export const SPOT_LIMIT_DAYS = (limitDays, geoRect, categories) => {
  let url = `${ENDPOINT_ORIGIN}/api/spot?limitDays=${limitDays}${getGeoRect(
    geoRect
  )}`;
  if (categories) {
    url = url.concat(getCategories(categories));
  }
  return url;
};

export const SPOT_ID = (id) => `${ENDPOINT_ORIGIN}/api/spot/${id}`;

export const SPOT_ID_FEEDBACK = (id) =>
  `${ENDPOINT_ORIGIN}/api/spot/${id}/feedback`;

export const SPOT_SEARCH = () => `${ENDPOINT_ORIGIN}/api/spot/search`;

export const SPOT_SEARCH_BY_IDS = (ids) => {
  const query = ids.reduce((acc, id, index) => {
    const chunk = `ids[${index}]=${id}`;

    return index === 0 ? chunk : `${acc}&${chunk}`;
  }, "");

  return `${ENDPOINT_ORIGIN}/api/spot/search/byIds?${query}`;
};

export const SPOT_FROM_POLY = (polygon, withHunters, withNubies) => {
  const query = polygon.reduce((acc, coords, index) => {
    const [lng, lat] = coords;
    const chunk = `poly[${index}][lat]=${lat}&poly[${index}][lng]=${lng}`;
    return index === 0 ? chunk : `${acc}&${chunk}`;
  }, "");

  return `${ENDPOINT_ORIGIN}/api/spot/fromPoly?${query}&hunters=${
    withHunters ? 1 : 0
  }&allow_newbie=${withNubies ? 1 : 0}`;
};

export const DRAFT_GET_LAST = () => `${ENDPOINT_ORIGIN}/api/draft/getLast`;

export const DRAFT_UPDATE = () => `${ENDPOINT_ORIGIN}/api/draft/update`;

export const DRAFT_PUBLISH = () => `${ENDPOINT_ORIGIN}/api/draft/publicate`;

export const FOLLOW = () => `${ENDPOINT_ORIGIN}/api/follow`;

export const UNFOLLOW = () => `${ENDPOINT_ORIGIN}/api/unfollow`;

export const FOLLOWERS = (limit, offset) =>
  `${ENDPOINT_ORIGIN}/api/followers?limit=${limit}&offset=${offset}`;

export const FOLLOWING = (limit, offset) =>
  `${ENDPOINT_ORIGIN}/api/following?limit=${limit}&offset=${offset}`;

export const FOLLOWERS_FEED = (limit, offset) =>
  `${ENDPOINT_ORIGIN}/api/followers/feed?limit=${limit}&offset=${offset}`;
