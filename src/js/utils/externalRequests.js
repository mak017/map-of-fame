import { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } from "../constants";

export const fetchInstagramPost = async (url) => {
  const [cleanUrl] = url.split("?");
  const response = await fetch(
    `https://graph.facebook.com/v15.0/instagram_oembed?url=${cleanUrl}&omitscript=true&access_token=${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
  );

  console.log("response :>> ", await response.json());
};
