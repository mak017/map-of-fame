export const getYoutubeEmbed = async (url) => {
  const response = await fetch(`https://www.youtube.com/oembed?url=${url}`, {
    method: "GET",
  });

  const result = await response.json();
  return result;
};

export const getTikTokEmbed = async (url) => {
  const response = await fetch(`https://www.tiktok.com/oembed?url=${url}`, {
    method: "GET",
  });

  const result = await response.json();
  return result;
};
