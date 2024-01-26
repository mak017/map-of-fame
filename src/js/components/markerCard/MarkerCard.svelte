<script>
import { onDestroy } from "svelte";
import { goto, params, url } from "@roxi/routify";

import {
  embedVideoCodeFromBasicUrl,
  isEmpty,
  isExternalMapsUrl,
  loadFromLocalStorage,
} from "../../utils/commonUtils";
import {
  openedMarkerData,
  map,
  isAreaSelectionActive,
  isShowOnMapMode,
  markersStore,
  selectedArtist,
  selectedCrew,
  selectedUserProfileData,
  selectedYear,
  profileState,
  areaSelection,
  areaSpots,
  userData,
  editSpotData,
} from "../../store";
import { getProfileYears } from "../../utils/datesUtils.js";
import { getSpotById, getUserSpots } from "../../api/spot.js";

import Popup from "../Popup.svelte";
import Spinner from "../elements/Spinner.svelte";
import ShowOnMapButton from "../elements/ShowOnMapButton.svelte";
import ShareSvg from "../elements/icons/ShareSvg.svelte";
import PencilSvg from "../elements/icons/PencilSvg.svelte";
import MarkerCardComplaint from "./MarkerCardComplaint.svelte";
import ShareMarker from "./ShareMarker.svelte";

import { EMPTY_YEAR_STRING, MAX_ZOOM, MIN_ZOOM } from "../../constants.js";

const emojiList = [
  "👽",
  "🧛",
  "🤖",
  "👻",
  "👾",
  "👨‍🚀",
  "🎅",
  "🎃",
  "💀",
  "🤠",
  "🦐",
  "⛄",
  "🧟‍️",
  "👨‍🎨",
  "🤖",
];

const { id, username } = $params;
const strippedUsername = username.substring(1);

let isShareOpened = false;
let isComplainOpened = false;
let videoEmbed = "";

onDestroy(() => {
  !$isShowOnMapMode && selectedUserProfileData.set({});
});

const getVideoEmbed = async (video) =>
  video && (await embedVideoCodeFromBasicUrl(video));

$: if ($openedMarkerData?.video?.includes("tiktok")) {
  setTimeout(() => {
    const video = document.getElementById("video-embedded");
    const newScript = document.createElement("script");
    newScript.src = "https://www.tiktok.com/embed.js";
    video.appendChild(newScript);
  }, 0);
}

$: if ($openedMarkerData?.video?.includes("t.me/")) {
  setTimeout(() => {
    const [, post] = $openedMarkerData.video.split("t.me/");
    const video = document.getElementById("video-embedded");
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.setAttribute("data-telegram-post", post);
    s.setAttribute("data-width", "100%");
    video.appendChild(s);
  }, 0);
}

const getSpotData = async () => {
  if ($openedMarkerData?.id === id) {
    return $openedMarkerData;
  }

  const { success, result, errors } = await getSpotById(id);

  if (success && result) {
    const {
      id,
      spotStatus: status,
      img,
      title,
      videoLink: video,
      embedLink,
      publicBanner: { banner, bannerUrl },
      location: { lat, lng },
      user,
    } = result;

    if (user.username !== strippedUsername) {
      $goto("/404");
      throw new Error();
    }

    if (video) {
      videoEmbed = await getVideoEmbed(video);
    }

    const data = {
      ...result,
      status,
      img: { src: img, title: title || id },
      video,
      firm: { banner, bannerUrl },
      coords: { lat, lng },
      embedLink,
    };
    openedMarkerData.set(data);
    return data;
  }

  if (errors && !isEmpty(errors)) {
    $goto("/404");
  }
};

const EMPTY_ARTIST = "Unknown";
const token = loadFromLocalStorage("token") || null;

const onShareToggle = (toggle) => (isShareOpened = toggle);

const onComplainToggle = (toggle) => (isComplainOpened = toggle);

const resetAreaSelectionMode = () => {
  if (!$isAreaSelectionActive) return;

  isAreaSelectionActive.set(false);
  areaSpots.set(null);
  $map.setMinZoom(MIN_ZOOM);
  $map.dragging.enable();
  $areaSelection.deactivate();
  document.getElementById("highlighted").innerHTML = "";
};

const onUserClick = () => {
  const { user } = $openedMarkerData;

  if (!$selectedUserProfileData.id) {
    selectedUserProfileData.set(user ?? {});
  }
  resetAreaSelectionMode();
  openedMarkerData.set(null);
  profileState.reset();
  $goto("/@:username", { username: user.username });
};

const handleShowOnMapClick = () => {
  const {
    year,
    coords: { lat, lng },
    user,
  } = $openedMarkerData;
  const userId = $selectedUserProfileData.id ?? user.id;

  getUserSpots(userId, token, {
    year: year ? `${year}` : "",
    offset: 0,
    limit: 99999999999999,
  }).then((response) => {
    const { success, result } = response;
    if (success && result) {
      const { spots, years } = result;
      markersStore.set({ spots, years: getProfileYears(years) });
      isShowOnMapMode.set(true);
      resetAreaSelectionMode();
      document.getElementById("highlighted").innerHTML = `
        .marker-id-${id} {
          min-width: 64px;
          min-height: 64px;
          border-color: rgba(101, 13, 151, 0.43);
          box-shadow: 0 8px 8px var(--color-accent);
        }
      `;
      selectedYear.set(year ? `${year}` : EMPTY_YEAR_STRING);
      selectedArtist.set("");
      selectedCrew.set("");
      selectedUserProfileData.set(user);
      setTimeout(() => {
        $map.setView([lat, lng], MAX_ZOOM);
        $goto("/");
      }, 0);
      openedMarkerData.set(null);
    }
  });
};

const handleGoToEdit = (data) => {
  const { id } = data;
  editSpotData.set({
    ...data,
    img: data.img?.src,
  });

  $goto("/@:username/spot/:id/edit", { username: strippedUsername, id });
};

const getRandomEmojis = (count = 1) => {
  let resultString = "";
  for (let index = 0; index < count; index++) {
    const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
    resultString = resultString + "&#8239;" + emoji;
  }

  return resultString;
};

const getUserLink = (user, text) => {
  return user?.username
    ? `<a href=${$url("/@:username", { username: user.username })}>${
        text ?? user.artist?.name ?? user.crew?.name
      }</a>`
    : text;
};

const resolveArtistCrew = (pair) => {
  const { artist, crew, artistUser, crewUser } = pair;
  const hasArtist = !!(artist?.name || artistUser?.id);
  const hasCrew = !!(crew?.name || crewUser?.id);

  if (!hasArtist && !hasCrew) {
    return EMPTY_ARTIST;
  }

  if (hasArtist && hasCrew) {
    return `${getRandomEmojis()}&nbsp;${getUserLink(
      artistUser,
      artist?.name,
    )} <span>[${getUserLink(crewUser, crew?.name)}]</span>`;
  }

  if (hasArtist) {
    return `${getRandomEmojis()}&nbsp;${getUserLink(artistUser, artist?.name)}`;
  }

  return `${getRandomEmojis(3)}&nbsp;<span>[${getUserLink(
    crewUser,
    crew?.name,
  )}]</span>`;
};

const getArtistsString = (artistCrew) => {
  if (
    !artistCrew ||
    artistCrew.length === 0 ||
    (artistCrew.length === 1 &&
      !artistCrew[0].artist &&
      !artistCrew[0].crew &&
      !artistCrew[0].artistUser &&
      !artistCrew[0].crewUser)
  ) {
    return EMPTY_ARTIST;
  }

  return artistCrew.reduce((accumulator, pair, index) => {
    const currentName = resolveArtistCrew(pair);

    accumulator = accumulator.concat(currentName);
    if (index < artistCrew.length - 1) {
      accumulator = accumulator.concat('<span class="divider"> | </span>');
    }
    return accumulator;
  }, "");
};
</script>

{#await getSpotData()}
  <Spinner height={40} margin="auto" />
{:then data}
  <div class="card">
    <div class={`top ${data.status.toLowerCase()}`}>
      <div class="posted-by">
        <div class="subtitle">Posted by</div>
        <button type="button" class="button" on:click={onUserClick}>
          <div class="title">
            {data.user?.artist?.name ||
              data.user?.crew?.name ||
              $selectedUserProfileData?.artist?.name ||
              ""}
          </div>
        </button>
      </div>
      <div class="status">
        <div class="subtitle">Status</div>
        <div class="title">{data.status}</div>
      </div>
    </div>
    <div class="img">
      <img src={data.img.src} alt={`Main image: ${data.img.title}`} />
    </div>
    <div class="bottom">
      <div class="year">{data.year ?? EMPTY_YEAR_STRING}</div>
      <div class="show-on-map-wrapper">
        <ShowOnMapButton onClick={handleShowOnMapClick} />
      </div>
      <div class="buttons">
        {#if (data.link && !data.embedLink) || (data.embedLink && !isExternalMapsUrl(data.link))}
          <div class="link" class:externalMap={isExternalMapsUrl(data.link)}>
            <a href={data.link} target="_blank" rel="noreferrer"
              >External link to art</a>
          </div>
        {/if}
        <div class="share">
          <button
            type="button"
            class="button"
            on:click={() => onShareToggle(true)}><ShareSvg /></button>
        </div>
        <div class="complain">
          <button
            type="button"
            class="button"
            on:click={() => onComplainToggle(true)} />
        </div>
      </div>
    </div>
    <div class="artist-area">
      <div class="subtitle">Artist/Crew</div>
      <div class="title artist" on:click={profileState.reset}>
        {@html getArtistsString(data.artistCrew)}
      </div>
    </div>
    {#if data.description}
      <div class="description">{data.description}</div>
    {/if}
    {#if data.embedLink}
      <div class="embed-link">{@html data.embedLink}</div>
    {/if}
    {#if data.additionalImg}
      <div class="img">
        <img
          src={data.additionalImg}
          alt={`Additional image: ${data.img.title}`} />
      </div>
    {/if}
    <!-- {#if data.sketchImg}
      <div class="img">
        <img src={data.sketchImg} alt={`Sketch image: ${data.img.title}`} />
      </div>
    {/if} -->
    {#if data.video}
      <div
        id="video-embedded"
        class="video"
        class:instagram={data.video.includes("instagr")}
        class:tiktok={data.video.includes("tiktok")}>
        {@html videoEmbed}
      </div>
    {/if}
  </div>
  {#if strippedUsername === $userData.username}
    <button
      type="button"
      class="button edit"
      title="Edit spot"
      on:click={() => handleGoToEdit(data)}><PencilSvg /></button>
  {/if}
  {#if isShareOpened}
    <Popup on:close={() => onShareToggle(false)} title="Share Link">
      <ShareMarker />
    </Popup>
  {/if}
  {#if isComplainOpened}
    <Popup on:close={() => onComplainToggle(false)} title="Complaint!">
      <MarkerCardComplaint {onComplainToggle} spotId={id} />
    </Popup>
  {/if}
{/await}

<style lang="scss">
.card {
  width: 100%;
  max-width: 938px;
  margin-bottom: 32px;
}

.top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;

  .posted-by {
    max-width: 60%;
  }

  .status {
    text-align: right;
  }

  &.buffed {
    .posted-by {
      max-width: 72%;
    }

    .status .title {
      color: var(--color-error);
      text-decoration-line: line-through;
    }
  }

  &.live {
    .posted-by {
      max-width: 85%;
    }

    .status .title {
      color: var(--color-success);
    }
  }
}

.subtitle {
  margin-bottom: 10px;
  color: var(--color-dark);
  font-size: 13px;
  line-height: 1.22;
}

.title {
  max-width: 100%;
  overflow: hidden;
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-align: left;
  text-transform: uppercase;
  text-overflow: ellipsis;
}

.posted-by {
  .button {
    max-width: 100%;
    background: none;
  }

  .title {
    color: var(--color-accent);
  }
}

.img {
  position: relative;
  margin-bottom: 24px;

  > img {
    margin: auto;
    pointer-events: none;
    user-select: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}

.bottom {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  margin-bottom: 45px;
}

.year {
  font-size: 13px;
  font-weight: bold;
  line-height: 16px;
}

.show-on-map-wrapper {
  text-align: center;
}

.buttons {
  display: flex;
  justify-content: flex-end;

  div + div {
    margin-left: 12px;
  }

  button,
  a {
    display: block;
    width: 40px;
    height: 40px;
    cursor: pointer;
  }

  button {
    border: 0;
  }
}

.link a {
  background: url(../../../images/web.svg) 50% 50% / auto no-repeat;
  font-size: 0;
}

.externalMap a {
  background: url(../../../images/panorama.svg) 50% 50% / auto no-repeat;
}

.share button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
}

.complain button {
  background: url(../../../images/warning.svg) 50% 50% / auto no-repeat;
}

.artist-area {
  margin-bottom: 32px;
  text-align: center;
}

.artist {
  font-size: 18px;
  text-align: center;
}

.description {
  margin-bottom: 32px;
  color: var(--color-dark);
  font-size: 18px;
  line-height: 1.22;
  white-space: pre-line;
  word-break: break-word;
}

.embed-link {
  margin-bottom: 32px;
}

.video {
  position: relative;
  height: 0;
  margin: 32px 0 24px;
  padding: 0 0 56.25%;
  overflow: hidden;

  &.instagram {
    max-width: 370px;
    margin: 0 auto 24px;
    padding-bottom: min(182%, 670px);
  }

  &.tiktok {
    height: auto;
    padding: 0;
  }
}

.edit {
  display: block;
  position: fixed;
  top: 152px;
  left: 0;
  width: 64px;
  height: 52px;
  border-radius: 0 50% 50% 0;
  background: var(--color-accent);
  color: transparent;
  font-size: 0;
}

@media (max-width: 1039px) {
  .card {
    margin-bottom: 0;
    padding-top: 38px;
  }
}

@media (max-width: 767px) {
  .posted-by {
    button {
      &::before {
        top: -300%;
        right: auto;
        left: 0;
        transform: none;
      }
    }
  }

  .bottom {
    grid-row-gap: 10px;
    margin-bottom: 20px;
  }

  .show-on-map-wrapper {
    grid-column: 1/4;
    grid-row: 2;
  }

  .buttons {
    grid-column: 3;
  }

  .edit {
    top: 16px;
  }
}
</style>
