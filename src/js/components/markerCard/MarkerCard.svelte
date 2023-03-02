<script>
import { onDestroy } from "svelte";
import { goto, params } from "@roxi/routify";

import {
  embedVideoCodeFromBasicUrl,
  isEmpty,
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
  shouldDisplayShowOnMap,
} from "../../store";
import { getProfileYears } from "../../utils/datesUtils.js";
import { getSpotById, getUserSpots } from "../../api/spot.js";

import MarkerCardComplaint from "./MarkerCardComplaint.svelte";
import Popup from "../Popup.svelte";
import ShareMarker from "./ShareMarker.svelte";
import ShareSvg from "../elements/icons/ShareSvg.svelte";
import Spinner from "../elements/Spinner.svelte";

import { EMPTY_YEAR_STRING, MAX_ZOOM } from "../../constants.js";

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

onDestroy(() => {
  !$isShowOnMapMode && selectedUserProfileData.set({});
});

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
      publicBanner: { banner, bannerUrl },
      location: { lat, lng },
      user,
    } = result;

    if (user.username !== strippedUsername) {
      $goto("/404");
      throw new Error();
    }

    const data = {
      ...result,
      status,
      img: { src: img, title: title || id },
      video,
      firm: { banner, bannerUrl },
      coords: { lat, lng },
    };
    openedMarkerData.set(data);
    return data;
  }

  if (errors && !isEmpty(errors)) {
    $goto("/404");
  }
};

const EMPTY_ARTIST = "Unknown";
const getVideoEmbed = (video) => video && embedVideoCodeFromBasicUrl(video);
const token = loadFromLocalStorage("token") || null;

const onShareToggle = (toggle) => (isShareOpened = toggle);

const onComplainToggle = (toggle) => (isComplainOpened = toggle);

const onUserClick = () => {
  const { user } = $openedMarkerData;

  if (!$selectedUserProfileData.id) {
    selectedUserProfileData.set(user ?? {});
    isAreaSelectionActive.set(false);
  }
  openedMarkerData.set(null);
  $goto("/@:username", { username: user.username });
};

const handleShowOnMapClick = () => {
  const {
    year,
    coords: { lat, lng },
  } = $openedMarkerData;

  getUserSpots($selectedUserProfileData.id, token, {
    year: year ? `${year}` : "",
    offset: 0,
    limit: 99999999999999,
  }).then((response) => {
    const { success, result } = response;
    if (success && result) {
      const { spots, years } = result;
      markersStore.set({ spots, years: getProfileYears(years) });
      isShowOnMapMode.set(true);
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
      setTimeout(() => {
        $map.setView([lat, lng], MAX_ZOOM);
        $goto("/");
      }, 0);
      openedMarkerData.set(null);
    }
  });
};

const getRandomEmojis = (count = 1) => {
  let resultString = "";
  for (let index = 0; index < count; index++) {
    const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
    resultString = resultString + "&#8239;" + emoji;
  }

  return resultString;
};

const resolveArtistCrew = (pair) => {
  const { artist, crew } = pair;

  if (artist?.name && crew?.name) {
    return `${getRandomEmojis()}&nbsp;${artist.name} <span>[${
      crew.name
    }]</span>`;
  }

  if (artist?.name) {
    return `${getRandomEmojis()}&nbsp;${artist.name}`;
  }

  return `${getRandomEmojis(3)}&nbsp;<span>[${crew?.name}]</span>`;
};

const getArtistsString = (artistCrew) => {
  if (!artistCrew || artistCrew.length === 0) {
    return EMPTY_ARTIST;
  }

  return artistCrew.reduce((accumulator, pair, index) => {
    const currentName = resolveArtistCrew(pair);

    accumulator = accumulator.concat(currentName);
    if (index < artistCrew.length - 1) {
      accumulator = accumulator.concat("; ");
    }
    return accumulator;
  }, "");
};
</script>

{#await getSpotData()}
  <Spinner height={40} margin="auto" />
{:then data}
  <div class="card">
    <div class="top">
      <div class="posted-by">
        <div class="subtitle">Posted by</div>
        <button type="button" class="button" on:click={onUserClick}>
          <div class="title">
            {data.user?.name ||
              data.user?.crew ||
              $selectedUserProfileData?.name ||
              ""}
          </div>
        </button>
      </div>
      <div class="status">
        <div class="subtitle">Status</div>
        <div class={`title ${data.status.toLowerCase()}`}>{data.status}</div>
      </div>
    </div>
    <div class="img"><img src={data.img.src} alt={data.img.title} /></div>
    <div class="bottom">
      <div class="year">{data.year ?? EMPTY_YEAR_STRING}</div>
      <div class="show-on-map-wrapper">
        {#if $shouldDisplayShowOnMap}
          <button
            type="button"
            class="show-on-map"
            on:click={handleShowOnMapClick}>Show on map</button>
        {/if}
      </div>
      <div class="buttons">
        {#if data.link}
          <div class="link">
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
      <div class="title artist">{@html getArtistsString(data.artistCrew)}</div>
    </div>
    {#if data.description}
      <div class="description">{data.description}</div>
    {/if}
    {#if data.video}
      <div class="video" class:instagram={data.video.includes("instagr")}>
        {@html getVideoEmbed(data.video)}
      </div>
    {/if}
  </div>
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
  margin-bottom: 64px;
}

.top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.subtitle {
  margin-bottom: 10px;
  color: var(--color-dark);
  font-size: 13px;
  line-height: 1.22;
}

.title {
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-align: left;
  text-transform: uppercase;
}

.posted-by {
  .button {
    background: none;
  }

  .title {
    color: var(--color-accent);
  }
}

.status {
  text-align: right;

  .buffed {
    color: var(--color-error);
    text-decoration-line: line-through;
  }

  .live {
    color: var(--color-success);
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

.show-on-map {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-accent);
  font-size: 14px;
  font-weight: 900;
  line-height: 22px;
  text-transform: uppercase;
  cursor: pointer;
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
  background: url(../../../images/link.svg) 50% 50% / auto no-repeat;
  font-size: 0;
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
  margin-bottom: 65px;
  text-align: center;
}

.artist {
  font-size: 18px;
  text-align: center;
}

.description {
  margin-bottom: 24px;
  color: var(--color-dark);
  font-size: 18px;
  line-height: 1.22;
  white-space: pre-line;
  word-break: break-word;
}

.video {
  position: relative;
  height: 0;
  margin-bottom: 24px;
  padding: 30px 0 56.25%;
  overflow: hidden;

  &.instagram {
    max-width: 370px;
    margin: 0 auto 24px;
    padding-bottom: min(182%, 670px);
  }
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

  .artist-area {
    margin-bottom: 40px;
  }
}
</style>
