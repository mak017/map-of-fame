import { MOBILE_BREAKPOINT } from "../constants";

const regexYoutube = /(?:https?:)?(?:\/\/)(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^<.,!():"'\s]+)/;
const regexVimeo = /(?:http:|https:)?(?:\/\/)(?:www\.)?(?:vimeo\.com)\/([^<.,!():"'\s]+)/;
const regexDailymotion = /(?:http:|https:)?(?:\/\/)(?:www\.)?(?:dailymotion\.com|dai\.ly)(?:\/video)?\/([^<.,!():"'\s]+)/;

export const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

export const validateEmail = (email) =>
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email
  );

export const validatePassword = (password) => /^(?=.*).{8,20}$/.test(password);

export const validateVideoLink = (link) =>
  regexYoutube.test(link) ||
  regexVimeo.test(link) ||
  regexDailymotion.test(link);

export const isValidHttpUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

export const getCurrentYear = () => new Date().getFullYear();

export const saveToLocalStorage = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

export const loadFromLocalStorage = (key) =>
  JSON.parse(localStorage.getItem(key));

export const removeFromLocalStorage = (key) => localStorage.removeItem(key);

export const isYearLike = (year) => /^\d{0,4}$/.test(year);

export const embedVideoCodeFromBasicUrl = (url) =>
  url
    .replace(
      new RegExp(regexYoutube, "g"),
      '<iframe src="https://www.youtube.com/embed/$1?modestbranding=1&rel=0&wmode=transparent&theme=light&color=white" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
    )
    .replace(
      new RegExp(regexVimeo, "g"),
      '<iframe src="//player.vimeo.com/video/$1?color=ffffff&portrait=0" frameborder="0" width="100%" height="100%" allow="autoplay; fullscreen" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
    )
    .replace(
      new RegExp(regexDailymotion, "g"),
      '<iframe frameborder="0" type="text/html" src="https://www.dailymotion.com/embed/video/$1?logo=0&foreground=ffffff&highlight=1bb4c6&background=000000" width="100%" height="100%" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
    );

export const markersReadyEvent = new Event("markersReady");

export const copyToClipboard = (str) => {
  const temp = document.createElement("textarea");
  temp.innerHTML = str;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  temp.remove();
};

export const adjustVhProp = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
};

export const getResetPasswordToken = () => {
  const search = window.location.search;
  if (search) {
    const params = new URLSearchParams(search);
    return params.get("reset_password_token");
  }
  return null;
};

export const isEmpty = (value) => {
  if (value === null) {
    return true;
  }
  if (typeof value === "object") {
    return Object.keys(value).length === 0;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return true;
};
