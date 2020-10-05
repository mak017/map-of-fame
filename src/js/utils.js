import { CATEGORIES, MOBILE_BREAKPOINT } from "./constants";
import { getValidDates } from "./stubs/datesFilterStub";

// const regexYoutubf = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
// const regexYoutube = /^(https?\:\/\/)?(www|m\.)?(youtube\.com|youtu\.?be)\/.+$/;
const regexYoutube = /(?:https?:)?(?:\/\/)(?:www\.)(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^<.,!():"'\s]+)/;
const regexVimeo = /(?:http:|https:)?(?:\/\/)(?:www\.)?(?:vimeo\.com)\/([^<.,!():"'\s]+)/g;
const regexDailymotion = /(?:http:|https:)?(?:\/\/)(?:www\.)?(?:dailymotion\.com|dai\.ly)(?:\/video)?\/([^<.,!():"'\s]+)/g;

export const isMobile = () => window.innerWidth < MOBILE_BREAKPOINT;

export const validateYear = (year, isFull = true) =>
  getValidDates(isFull).includes(year);

export const validateCategory = (categories) =>
  categories.every((cat) => Object.values(CATEGORIES).includes(cat));

export const validateEmail = (email) =>
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email
  );

export const validatePassword = (password) =>
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/.test(password);

export const validateVideoLink = (link) => {
  // console.log(
  //   "validate all with OR :>> ",
  //   regexYoutube.test(link) ||
  //     regexVimeo.test(link) ||
  //     regexDailymotion.test(link)
  // );
  if (regexYoutube.test(link)) {
    console.log("regexYoutube.test(link) :>> ");
    return true;
  } else if (regexVimeo.test(link)) {
    console.log("regexVimeo.test(link) :>> ", regexVimeo.test(link));
    return true;
  } else if (regexDailymotion.test(link)) {
    console.log(
      "regexDailymotion.test(link) :>> ",
      regexDailymotion.test(link)
    );
    return true;
  } else {
    console.log("else");
    return false;
  }
  // return (
  //   regexYoutube.test(link) ||
  //   regexVimeo.test(link) ||
  //   regexDailymotion.test(link)
  // );
};

export const getCurrentYear = () => new Date().getFullYear();

export const saveToLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const loadFromLocalStorage = (key) =>
  JSON.parse(localStorage.getItem(key));

export const isYearLike = (year) => !!year.match(/^\d{0,4}$/);

export const embedVideoCodeFromBasicUrl = (url) =>
  url
    .replace(
      regexYoutube,
      '<iframe src="http://www.youtube.com/embed/$1?modestbranding=1&rel=0&wmode=transparent&theme=light&color=white" width="100%" height="100%" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
    )
    .replace(
      regexVimeo,
      '<iframe src="//player.vimeo.com/video/$1?color=ffffff&portrait=0" frameborder="0" width="100%" height="100%" allow="autoplay; fullscreen" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
    )
    .replace(
      regexDailymotion,
      '<iframe frameborder="0" type="text/html" src="http://www.dailymotion.com/embed/video/$1?logo=0&foreground=ffffff&highlight=1bb4c6&background=000000" width="100%" height="100%" allowfullscreen style="position: absolute;top: 0;left: 0;width: 100%;height: 100%;"></iframe>'
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
