import { get } from "svelte/store";

import { openedMarkerData } from "./store";

export const getSpotCardMetadata = () => {
  const getArtistCrewList = () => {
    const data = get(openedMarkerData);

    if (!data?.artistCrew) {
      return [];
    }

    const list = [];

    for (const pair of data.artistCrew) {
      const hasArtist = !!pair.artist;
      const hasCrew = !!pair.crew;

      if (hasArtist) {
        list.push(pair.artist.name);
      }

      if (hasCrew) {
        list.push(pair.crew.name);
      }
    }

    if (!list.length) {
      return ["Unknown artist"];
    }

    return list;
  };

  const getArtistCrewString = (divider) => {
    const data = get(openedMarkerData);

    if (!data) {
      return "";
    }

    return getArtistCrewList(data).join(divider) || "";
  };

  const getMetaTitle = () => {
    return `${getArtistCrewString(" | ")} | Streeet`;
  };

  const getCategory = () => {
    const data = get(openedMarkerData);

    switch (data?.category.name) {
      case "Walls":
        return "Graffiti";
      case "Trains":
        return "Trains bombing";
      case "Murals":
        return "Murals";
      case "Autos":
        return "Graffiti on auto";
      case "Mosaic":
        return "Mosaic art, pixel art";
      case "Tagging":
        return "Tagging, graffiti";
      default:
        return "Street art";
    }
  };

  const getMetaDescription = () => {
    const data = get(openedMarkerData);

    if (!data) {
      return "";
    }

    return `${getCategory()} by ${getArtistCrewString(", ")}, ${
      data?.country
    }, ${data?.year}`;
  };

  return {
    title: getMetaTitle(),
    description: getMetaDescription(),
    keywords: getArtistCrewList(),
  };
};
