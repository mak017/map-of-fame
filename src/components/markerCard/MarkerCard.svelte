<script>
import { onDestroy } from "svelte";
import { slide } from "svelte/transition";
import { goto, params, url } from "@roxi/routify";
import linkifyHtml from "linkify-html";
import "../../js/utils/customMentionPlugin.js";

import {
  clickOutside,
  embedVideoCodeFromBasicUrl,
  isEmpty,
  isExternalMapsUrl,
  loadFromLocalStorage,
  upperFirst,
} from "../../js/utils/commonUtils";
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
  isLoggedIn,
} from "../../js/store";
import { getSpotById, voteSpot } from "../../js/api/spot.js";

import Popup from "../Popup.svelte";
import Spinner from "../elements/Spinner.svelte";
import ShowOnMapButton from "../elements/ShowOnMapButton.svelte";
import ButtonDots from "../elements/ButtonDots.svelte";
import ShareSvg from "../elements/icons/ShareSvg.svelte";
import LikeSvg from "../elements/icons/LikeSvg.svelte";
import MarkerCardComplaint from "./MarkerCardComplaint.svelte";
import ShareMarker from "./ShareMarker.svelte";
import StatusUpdate from "./StatusUpdate.svelte";

import { EMPTY_YEAR_STRING, MAX_ZOOM, MIN_ZOOM } from "../../js/constants.js";

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
const token = loadFromLocalStorage("token") || null;

let isShareOpened = false;
let isComplainOpened = false;
let isStatusUpdateOpened = false;
let isExpandedButtons = false;
let videoEmbed = "";
let isCurrentUser = username === $userData.username;

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
    video?.appendChild(newScript);
  }, 0);
}

const getSpotData = async () => {
  if ($openedMarkerData?.id === id) {
    return $openedMarkerData;
  }

  const { success, result, errors } = await getSpotById(token, id);

  if (success && result) {
    const {
      id,
      spotStatus: status,
      mainImage: { img },
      title,
      videoLink: video,
      embedLink,
      publicBanner: { banner, bannerUrl },
      location: { lat, lng },
      user,
    } = result;

    if (user.username !== username) {
      $goto("/404");
      throw new Error();
    }

    isCurrentUser = username === $userData.username;

    if (video) {
      videoEmbed = await getVideoEmbed(video);
    }

    const data = {
      ...result,
      status,
      img: { src: img || result.img, title: title || id },
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

const handleShareToggle = (toggle) => (isShareOpened = toggle);

const handleComplainToggle = (toggle) => (isComplainOpened = toggle);

const handleStatusUpdateToggle = (toggle) => (isStatusUpdateOpened = toggle);

const resetAreaSelectionMode = () => {
  if (!$isAreaSelectionActive) return;

  isAreaSelectionActive.set(false);
  areaSpots.set(null);
  $map.setMinZoom(MIN_ZOOM);
  $map.dragging.enable();
  $areaSelection.deactivate();
  document.getElementById("highlighted").innerHTML = "";
};

const navigateToUserProfile = () => {
  const { user } = $openedMarkerData;

  if (!$selectedUserProfileData.id) {
    selectedUserProfileData.set(user ?? {});
  }
  resetAreaSelectionMode();
  openedMarkerData.set(null);
  profileState.reset();
};

const handleDescriptionInteraction = (event) => {
  if ("key" in event && event.key !== "Enter") {
    return;
  }

  if (event.target?.innerHTML?.startsWith("@")) {
    navigateToUserProfile();
  }
};

const handleShowOnMapClick = () => {
  const {
    year,
    coords: { lat, lng },
    user,
  } = $openedMarkerData;
  markersStore.set({ spots: [$openedMarkerData], years: [year] });
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
  $goto("/", { lat, lng, zoom: MAX_ZOOM, year });
  openedMarkerData.set(null);
};

const getUpdatedVoteCount = (value) => {
  const { likesCnt, dislikesCnt, userVote } = $openedMarkerData;

  switch (userVote) {
    case 1:
      return {
        likesCnt: likesCnt - 1,
        dislikesCnt: value === -1 ? dislikesCnt + 1 : dislikesCnt,
      };
    case -1:
      return {
        likesCnt: value === 1 ? likesCnt + 1 : likesCnt,
        dislikesCnt: dislikesCnt - 1,
      };
    default:
      return {
        likesCnt: value === 1 ? likesCnt + 1 : likesCnt,
        dislikesCnt: value === -1 ? dislikesCnt + 1 : dislikesCnt,
      };
  }
};

const handleSpotVote = (isLike) => async () => {
  const value = isLike ? 1 : -1;
  await voteSpot(token, id, value);
  const updatedData = {
    ...$openedMarkerData,
    ...getUpdatedVoteCount(value),
    userVote: $openedMarkerData.userVote === value ? null : value,
  };
  openedMarkerData.set(updatedData);
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
      accumulator = accumulator.concat('<span class="divider"> |</span>');
    }
    return accumulator;
  }, "");
};

const prepareDescription = (description) => {
  const formatted = linkifyHtml(description, {
    defaultProtocol: "https",
    nl2br: true,
    target: { url: "_blank", email: "_blank", mention: null },
    formatHref: {
      mention: (href) => console.log("href", href) || `/@${href.substring(1)}`,
    },
  });

  return upperFirst(formatted);
};
</script>

{#await getSpotData()}
  <Spinner height={40} margin="auto" />
{:then data}
  {#if data}
    <div class="card">
      <div class={`top ${data.status.toLowerCase()}`}>
        <div class="year">
          <div class="subtitle">Year</div>
          <div class="title">
            {data.year ?? EMPTY_YEAR_STRING}
          </div>
        </div>
        <div class="status">
          <div class="subtitle">Status</div>
          <button
            type="button"
            class="button title"
            disabled={!$isLoggedIn || isCurrentUser}
            on:click={() => {
              handleStatusUpdateToggle(true);
            }}>{data.status}</button>
        </div>
      </div>
      <div class="img">
        <img src={data.img.src} alt={`Main image: ${data.img.title}`} />
      </div>
      <div class="bottom">
        <div class="likes">
          <button
            type="button"
            class="button"
            on:click={handleSpotVote(true)}
            disabled={!$isLoggedIn}
            ><div class="icon-wrapper">
              <LikeSvg isActive={$openedMarkerData?.userVote === 1} />
            </div>
            <div class="text">{$openedMarkerData?.likesCnt}</div></button>
          <button
            type="button"
            class="button"
            on:click={handleSpotVote(false)}
            disabled={!$isLoggedIn}
            ><div class="icon-wrapper">
              <LikeSvg
                isDislike
                isActive={$openedMarkerData?.userVote === -1} />
            </div>
            <div class="text">{$openedMarkerData?.dislikesCnt}</div></button>
        </div>
        <div class="buttons-wrapper">
          <div
            class="buttons"
            class:isExpandedButtons
            use:clickOutside
            on:click_outside={() => (isExpandedButtons = false)}>
            <ButtonDots
              isStaticPosition
              noTransition
              isBig
              withBg
              isVisuallyHidden={isExpandedButtons}
              onClick={() => (isExpandedButtons = true)} />
            {#if isExpandedButtons}
              <div
                class="additional"
                transition:slide={{ duration: 300, axis: "x" }}>
                {#if (data.link && !data.embedLink) || (data.embedLink && !isExternalMapsUrl(data.link))}
                  <div
                    class="link button"
                    class:externalMap={isExternalMapsUrl(data.link)}>
                    <a href={data.link} target="_blank" rel="noreferrer"
                      >External link to art</a>
                  </div>
                {/if}
                <div class="share">
                  <button
                    type="button"
                    class="button"
                    on:click={() => handleShareToggle(true)}
                    ><ShareSvg color="dark" /></button>
                </div>
                <div class="complain">
                  <button
                    type="button"
                    class="button"
                    on:click={() => handleComplainToggle(true)} />
                </div>
              </div>
            {/if}
          </div>
          <div class="show-on-map-wrapper">
            <ShowOnMapButton onClick={handleShowOnMapClick} />
          </div>
        </div>
      </div>
      <div class="artist-area">
        <div class="subtitle">ARTIST [CREW]</div>
        <button class="button title artist" on:click={profileState.reset}>
          {@html getArtistsString(data.artistCrew)}
        </button>
      </div>
      {#if data.description}
        <div
          class="spot-description"
          on:click={handleDescriptionInteraction}
          on:keydown={handleDescriptionInteraction}
          role="presentation">
          {@html prepareDescription(data.description)}
        </div>
      {/if}
      {#if data.embedLink}
        <div class="embed-link">{@html data.embedLink}</div>
      {/if}
      {#if data.images?.slice?.(1)?.length > 0}
        {#each data.images.slice(1) as image (image.id)}
          <div class="img">
            <img src={image.img} alt={`Additional image: ${image.id}`} />
          </div>
        {/each}
      {/if}
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
    {#if isShareOpened}
      <Popup on:close={() => handleShareToggle(false)} title="Share Link">
        <ShareMarker />
      </Popup>
    {/if}
    {#if isComplainOpened}
      <Popup on:close={() => handleComplainToggle(false)} title="Complaint!">
        <MarkerCardComplaint {handleComplainToggle} spotId={id} />
      </Popup>
    {/if}
    {#if isStatusUpdateOpened}
      <Popup
        on:close={() => handleStatusUpdateToggle(false)}
        title="Status update">
        <StatusUpdate
          close={() => handleStatusUpdateToggle(false)}
          spotId={id} />
      </Popup>
    {/if}
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
  margin-bottom: 20px;

  .year {
    max-width: 60%;
  }

  .status {
    text-align: right;
  }

  &.buffed {
    .year {
      max-width: 72%;
    }

    .status .title {
      color: var(--color-error);
      text-decoration-line: line-through;
    }
  }

  &.live {
    .year {
      max-width: 85%;
    }

    .status .title {
      color: var(--color-success);
    }
  }
}

.subtitle {
  margin-bottom: 2px;
  color: var(--color-dark);
  font-size: 10px;
  line-height: 1.22;
  text-transform: uppercase;
}

.title {
  max-width: 100%;
  overflow: hidden;
  background: none;
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 800;
  line-height: 1.22;
  text-align: left;
  text-transform: uppercase;
  text-overflow: ellipsis;
}

.img {
  position: relative;
  margin-bottom: 10px;

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
  grid-template-columns: repeat(2, 1fr);
  align-items: center;
  margin-bottom: 45px;
}

.show-on-map-wrapper {
  text-align: center;
}

.buttons-wrapper {
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
    background-color: var(--color-accent-light);
    transition: 0.2s;
    cursor: pointer;

    &:hover {
      background-color: var(--color-accent-light-hover);
    }
  }

  button {
    border: 0;
  }

  .buttons {
    display: flex;
    align-items: center;
    min-width: 16px;
    min-height: 40px;
  }

  .additional {
    display: flex;
  }
}

.likes {
  display: flex;

  .button {
    width: 40px;
    height: 40px;
    padding: 4px 0;
    background-color: var(--color-accent-light);
    color: var(--color-dark);
    font-size: 13px;

    .icon-wrapper {
      height: 18px;
      transform: translateY(7px);
      transition: 0.2s;
    }

    .text {
      opacity: 0;
      transition: 0.3s;
    }

    &:hover,
    &:focus {
      background-color: var(--color-accent-light-hover);

      .icon-wrapper {
        transform: translateY(0);
      }

      .text {
        opacity: 1;
      }
    }
  }
}

.link a {
  background: var(--color-accent-light) url(../../images/web.svg) 50% 50% / auto
    no-repeat;
  font-size: 0;
}

.externalMap a {
  background: var(--color-accent-light) url(../../images/panorama.svg) 50% 50% /
    auto no-repeat;
}

.share button {
  display: flex;
  align-items: center;
  justify-content: center;
}

.complain button {
  background: var(--color-accent-light) url(../../images/warning.svg) 50% 50% /
    auto no-repeat;
}

.artist-area {
  margin-bottom: 32px;
  text-align: center;
}

.artist {
  background: none;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  cursor: text;
}

.spot-description {
  margin-bottom: 32px;
  color: var(--color-dark);
  font-size: 16px;
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
  .year {
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

  .buttons-wrapper {
    grid-column: 3;
  }

  .edit {
    top: 40px;
  }
}
</style>
