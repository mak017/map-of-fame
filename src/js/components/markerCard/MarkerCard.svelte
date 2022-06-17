<script>
import { EMPTY_YEAR_STRING, MAX_ZOOM } from "./../../constants.js";
import {
  embedVideoCodeFromBasicUrl,
  loadFromLocalStorage,
} from "../../utils/commonUtils";
import MarkerCardComplaint from "./MarkerCardComplaint.svelte";
import Popup from "../Popup.svelte";
import ShareMarker from "./ShareMarker.svelte";
import {
  isShowOnMapMode,
  markersStore,
  selectedArtist,
  selectedCrew,
  selectedUserProfileData,
  selectedYear,
  shouldDisplayShowOnMap,
  userData,
} from "../../store";
import { permalink } from "../../utils/mapUtils/permalink";
import { getProfileYears } from "../../utils/datesUtils.js";
import { getUserSpots } from "../../api/spot.js";

export let data;
export let map;
export let showUserProfile;
export let clearOpenedMarkerData;

let isShareOpened = false;
let isComplainOpened = false;

const {
  artistCrew,
  status,
  description,
  img,
  video,
  user,
  id,
  link,
  year,
  coords: { lat, lng },
} = data;

const EMPTY_ARTIST = "Unknown";
const videoEmbed = video && embedVideoCodeFromBasicUrl(video);
const isCurrentUser =
  !$selectedUserProfileData.id || $selectedUserProfileData.id === $userData.id;
const token = loadFromLocalStorage("token") || null;

const onShareToggle = (toggle) => (isShareOpened = toggle);

const onComplainToggle = (toggle) => (isComplainOpened = toggle);

const onUserClick = () => {
  if (!$selectedUserProfileData.id) {
    selectedUserProfileData.set(user ?? {});
  }
  clearOpenedMarkerData();
  showUserProfile(true);
};

const handleShowOnMapClick = () => {
  getUserSpots(isCurrentUser ? null : $selectedUserProfileData.id, token, {
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
      permalink.update({ clearParams: ["artist", "crew"] });
      setTimeout(() => {
        map.setView([lat, lng], MAX_ZOOM);
      }, 0);
      clearOpenedMarkerData();
    }
  });
};

const getArtistsString = () => {
  if (artistCrew.length === 0) {
    return EMPTY_ARTIST;
  }
  return artistCrew.reduce((accumulator, pair, index) => {
    const { artist, crew } = pair;
    const artistName = artist?.name ?? EMPTY_ARTIST;
    const currentName = crew?.name
      ? `${artistName} (${crew.name})`
      : artistName;
    accumulator = accumulator.concat(currentName);
    if (index < artistCrew.length - 1) {
      accumulator = accumulator.concat("; ");
    }
    return accumulator;
  }, "");
};
</script>

<div class="card">
  <div class="top">
    <div class="posted-by">
      <div class="subtitle">Posted by</div>
      <button type="button" class="button" on:click={onUserClick}>
        <div class="title">
          {user?.name || $selectedUserProfileData?.name || ""}
        </div>
      </button>
    </div>
    <div class="status">
      <div class="subtitle">Status</div>
      <div class={`title ${status.toLowerCase()}`}>{status}</div>
    </div>
  </div>
  <div class="img"><img src={img.src} alt={img.title} /></div>
  <div class="bottom">
    <div class="year">{year ?? EMPTY_YEAR_STRING}</div>
    <div class="show-on-map-wrapper">
      {#if $shouldDisplayShowOnMap}
        <button
          type="button"
          class="show-on-map"
          on:click={handleShowOnMapClick}>Show on map</button>
      {/if}
    </div>
    <div class="buttons">
      {#if link}
        <div class="link">
          <a href={link} target="_blank">External link to art</a>
        </div>
      {/if}
      <div class="share">
        <button type="button" on:click={() => onShareToggle(true)} />
      </div>
      <div class="complain">
        <button type="button" on:click={() => onComplainToggle(true)} />
      </div>
    </div>
  </div>
  <div class="artist-area">
    <div class="subtitle">Artist</div>
    <div class="title artist">{getArtistsString()}</div>
  </div>
  {#if description}
    <div class="description">{description}</div>
  {/if}
  {#if video}
    <div class="video">
      {@html videoEmbed}
    </div>
  {/if}
</div>
{#if isShareOpened}
  <Popup on:close={() => onShareToggle(false)} title="Share Link">
    <ShareMarker {data} />
  </Popup>
{/if}
{#if isComplainOpened}
  <Popup on:close={() => onComplainToggle(false)} title="Complaint!">
    <MarkerCardComplaint {onComplainToggle} spotId={id} />
  </Popup>
{/if}

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
  display: -webkit-box;
  overflow: hidden;
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-align: left;
  text-transform: uppercase;

  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.posted-by {
  button {
    position: relative;
    background: none;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      right: 100%;
      width: 20px;
      height: 20px;
      transform: translateY(-50%);
      background: url(../../../images/back.svg) 50% 50% / auto no-repeat;
    }
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
  margin-bottom: 24px;

  > img {
    margin: auto;
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
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
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
  background: url(../../../images/share.svg) 50% 50% / auto no-repeat;
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
}

@media (max-width: 767px) {
  .card {
    margin-bottom: 0;
    padding-top: 38px;
  }

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
