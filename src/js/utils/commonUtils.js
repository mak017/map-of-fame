import { MOBILE_BREAKPOINT } from "../constants";

const regexYoutube =
  /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^<.,!():"'\s]+)/;
const regexVimeo =
  /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com)\/([^<.,!():"'\s]+)/;
const regexDailymotion =
  /(?:https?:\/\/)?(?:www\.)?(?:dailymotion\.com|dai\.ly)(?:\/video)?\/([^<.,!():"'\s]+)/;
const regexInstagram =
  /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel)?\/([^/?#&]+)/;

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
  regexInstagram.test(link);

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

export const embedVideoCodeFromBasicUrl = (url) => {
  if (url.includes("instagr")) {
    const [urlWithoutQuery] = url.split("?");

    return urlWithoutQuery.replace(
      new RegExp(regexInstagram, "g"),
      '<iframe frameborder="0" type="text/html" src="//instagram.com/p/$1/embed" width="100%" height="100%" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
    );
  }

  return url
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
};

// const isGoogleMapUrl = (url) =>
//   /(https|http):\/\/(www\.|)google\.[a-z]+\/maps/.test(url);

// export const embedMapFromBasicUrl = (url) => {
//   const coords = /@([0-9.,\-a-zA-Z]*)/.exec(url);
//   if (coords != null) {
//     const coordsArray = coords[1].split(",");
//     return (
//       "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d20000!2d" +
//       coordsArray[1] +
//       "!3d" +
//       coordsArray[0] +
//       "!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2suk!4v1486486434098"
//     );
//   }

//   return null;

//   // '<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.609469825536!2d14.558796016159334!3d40.74861804331011!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133bbc03e72a4917%3A0x886cdd5255e39ed5!2sSS%2018%20Tirrena%20Inferiore%2C%2040%2C%2084012%20Angri%20SA%2C%20Italy!5e0!3m2!1sen!2sua!4v1678829459165!5m2!1sen!2sua" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>'
// };

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
