import { getTikTokEmbed, getYoutubeEmbed } from "../api/external";

import { MOBILE_BREAKPOINT } from "../constants";

const regexYoutube =
  /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^<.,!():"'\s]+)/;
const regexVimeo =
  /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com)\/([^<.,!():"'\s]+)/;
const regexDailymotion =
  /(?:https?:\/\/)?(?:www\.)?(?:dailymotion\.com|dai\.ly)(?:\/video)?\/([^<.,!():"'\s]+)/;
const regexInstagram =
  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)?\/([^/?#&]+)/;
const regexTikTok =
  /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:tiktok\.com)\/(?:@(.*?)\/)?(?:video|v)|(?:https?:\/\/)?:\/\/(?:www\.)?(?:vt)(?:\.tiktok\.com)\/\S*/;
const regexVk = /(?:https?:\/\/)?(?:www\.)?(?:vk\.com)\/video(\d+)_(\d+)/;

const regexGoogleMaps =
  /(?:https?:\/\/)?(?:www\.)?(?:google\.[a-z]+|goo\.gl)(?:\/maps)?\/([^<.,!():"'\s]+)?/;
const regexYandexMaps =
  /(?:https?:\/\/)?(?:www\.)?(?:yandex\.[a-z]+)(?:\/maps)?\/-?\/?[a-zA-Z0-9]+/;

export const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

export const validateEmail = (email) =>
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email
  );

export const validateUsername = (username) => /^[a-z0-9_.]+$/i.test(username);

export const validatePassword = (password) => /^(?=.*).{8,20}$/.test(password);

export const validateVideoLink = (link) =>
  regexYoutube.test(link) ||
  regexVimeo.test(link) ||
  regexDailymotion.test(link) ||
  regexInstagram.test(link) ||
  regexTikTok.test(link) ||
  regexVk.test(link);

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

export const embedVideoCodeFromBasicUrl = async (url) => {
  try {
    if (regexYoutube.test(url)) {
      const embedResponse = await getYoutubeEmbed(url);

      return embedResponse?.html ?? "";
    }

    if (url.includes("tiktok")) {
      const embedResponse = await getTikTokEmbed(url);

      return embedResponse?.html ?? "";
    }

    if (url.includes("instagr")) {
      const [urlWithoutQuery] = url.split("?");

      return urlWithoutQuery.replace(
        new RegExp(regexInstagram, "g"),
        '<iframe frameborder="0" type="text/html" src="//instagram.com/p/$1/embed" width="100%" height="100%" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
      );
    }

    return url
      .replace(
        new RegExp(regexVimeo, "g"),
        '<iframe src="//player.vimeo.com/video/$1?color=ffffff&portrait=0" frameborder="0" width="100%" height="100%" allow="autoplay; fullscreen" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
      )
      .replace(
        new RegExp(regexDailymotion, "g"),
        '<iframe frameborder="0" type="text/html" src="https://www.dailymotion.com/embed/video/$1?logo=0&foreground=ffffff&highlight=1bb4c6&background=000000" width="100%" height="100%" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
      )
      .replace(
        new RegExp(regexVk, "g"),
        '<iframe src="https://vk.com/video_ext.php?oid=$1&id=$2" width="640" height="360" allow="autoplay; encrypted-media; fullscreen; picture-in-picture;" frameborder="0" allowfullscreen></iframe>'
      );
  } catch (error) {
    console.log(error);
    return "";
  }
};

export const isExternalMapsUrl = (url) =>
  regexGoogleMaps.test(url) || regexYandexMaps.test(url);

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
  const { search } = window.location;
  if (search) {
    const params = new URLSearchParams(search);
    const token = params.get("reset_password_token");
    const id = params.get("id");
    if (token && id) {
      return { token, id };
    }
  }
  return null;
};

export const getInviteData = () => {
  const { search } = window.location;
  if (search) {
    const params = new URLSearchParams(search);
    const code = params.get("invite_code");
    const from = params.get("from_user");
    if (code) {
      return { code, from };
    }
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

/** Dispatch event on click outside of node */
export const clickOutside = (node) => {
  let lastMouseDownX = 0;
  let lastMouseDownY = 0;
  let lastMouseDownWasOutside = false;

  const mouseDownListener = (event) => {
    lastMouseDownX = event.offsetX;
    lastMouseDownY = event.offsetY;
    lastMouseDownWasOutside = !event.composedPath().includes(node);
  };
  document.addEventListener("mousedown", mouseDownListener);

  const handleClick = (event) => {
    const deltaX = event.offsetX - lastMouseDownX;
    const deltaY = event.offsetY - lastMouseDownY;
    const distSq = deltaX * deltaX + deltaY * deltaY;
    const isDrag = distSq > 3;
    const isDragException = isDrag && !lastMouseDownWasOutside;

    if (!node.contains(event.target) && !isDragException) {
      node.dispatchEvent(new CustomEvent("click_outside", node));
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("mousedown", mouseDownListener);
    },
  };
};

export const debounce = (callback, wait = 300) => {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), wait);
  };
};
