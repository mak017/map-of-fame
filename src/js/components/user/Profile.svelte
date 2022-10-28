<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import InfiniteScroll from "svelte-infinite-scroll";
import Invites from "./Invites.svelte";
import { getInvites } from "./../../api/auth.js";
import Spinner from "./../elements/Spinner.svelte";
import CustomSelect from "../elements/CustomSelect.svelte";
import {
  isLoggedIn,
  isShowOnMapMode,
  userData,
  markersStore,
  openedMarkerData,
  selectedArtist,
  selectedCrew,
  selectedUserProfileData,
  selectedYear,
  shouldDisplayShowOnMap,
  isSearchResults,
} from "../../store";
import Modal from "../Modal.svelte";
import EditSpot from "./EditSpot.svelte";
import DeleteSpot from "./DeleteSpot.svelte";
import Popup from "../Popup.svelte";
import { getProfileYears } from "./../../utils/datesUtils.js";
import {
  isEmpty,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "../../utils/commonUtils";
import { getUserSpots } from "../../api/spot";
import {
  ALL_YEARS_STRING,
  EMPTY_YEAR_STRING,
  MAX_SPOTS_PER_PAGE,
} from "../../constants";
import { permalink } from "../../utils/mapUtils/permalink";

export let onAddSpotBtnClick;
export let showUserProfile;

let currentYear;
let currentSpot;
let showEditModal = false;
let showDeletePopup = false;
let showInvitesPopup = false;
let offset = 0;
let yearsToApply = [];
let spotsList = [];
let newBatch = [];
let invites = [];
let unusedInvitesCount = 0;
let isLoading = false;
let isShowSpinner = false;
const token = loadFromLocalStorage("token") || null;

const toggleEditModal = (toggle) => (showEditModal = toggle);
const toggleDeletePopup = (toggle) => (showDeletePopup = toggle);
const toggleInvitesPopup = (toggle) => (showInvitesPopup = toggle);

const username =
  $selectedUserProfileData.name ?? $userData.name ?? $userData.crew;
const isCurrentUser =
  !$selectedUserProfileData.id || $selectedUserProfileData.id === $userData.id;

const fetchSpots = ({ year, offset, isNewFetch = false }) => {
  const userId = $selectedUserProfileData.id || $userData.id;
  isLoading = isNewFetch;
  isShowSpinner = true;
  getUserSpots(isCurrentUser ? null : userId, token, { year, offset }).then(
    (response) => {
      const { success, result, errors } = response;
      if (success && result) {
        const { spots, years } = result;
        if (isNewFetch) spotsList = [];
        newBatch = spots ? [...spots] : [];
        yearsToApply = getProfileYears(years);
        if (currentYear === undefined || year === undefined) {
          currentYear = yearsToApply[0];
        }
      }
      if (errors && !isEmpty(errors)) {
        if (errors.year) {
          fetchSpots({});
        }
      }
      isLoading = false;
      isShowSpinner = false;
    }
  );
};

onMount(() => {
  fetchSpots({ isNewFetch: true });
  shouldDisplayShowOnMap.set(false);
  if (isCurrentUser) {
    getInvites(token).then((response) => {
      const { success, result } = response;
      if (success && result) {
        invites = result;
        unusedInvitesCount = invites.reduce(
          (accumulator, invite) =>
            !invite.invitedUserId ? accumulator + 1 : accumulator,
          0
        );
      }
    });
  }
});

$: spotsList = [...spotsList, ...newBatch];

const handleLogout = () => {
  removeFromLocalStorage("token");
  isLoggedIn.set(false);
  userData.set({});
  showUserProfile(false);
};

const handleAddSpot = () => {
  onAddSpotBtnClick();
  showUserProfile(false);
};

const handleYearSelect = (event) => {
  const { value } = event.detail.detail;
  currentYear = value !== EMPTY_YEAR_STRING ? value : "";
  offset = 0;
  if (currentYear === ALL_YEARS_STRING) {
    fetchSpots({ isNewFetch: true });
    return;
  }
  fetchSpots({ year: `${currentYear}`, isNewFetch: true });
};

const handleEdit = (spot) => {
  currentSpot = spot;
  toggleEditModal(true);
};

const handleDelete = (spot) => {
  currentSpot = spot;
  toggleDeletePopup(true);
};

const onLoadMore = () => {
  offset += MAX_SPOTS_PER_PAGE;
  if (currentYear === ALL_YEARS_STRING) {
    fetchSpots({ offset });
    return;
  }
  fetchSpots({ year: `${currentYear}`, offset });
};

const onSubmitChanges = () => {
  if (currentYear === ALL_YEARS_STRING) {
    fetchSpots({ isNewFetch: true });
    return;
  }
  fetchSpots({ year: `${currentYear}`, isNewFetch: true });
};

const onSpotClick = (spot) => {
  if (isCurrentUser) {
    return;
  }
  const {
    id,
    artistCrew,
    spotStatus: status,
    description,
    img,
    title,
    videoLink: video,
    publicBanner: { banner, bannerUrl },
    location: { lat, lng },
    year,
    link,
  } = spot;
  openedMarkerData.set({
    id,
    artistCrew,
    status,
    description,
    img: { src: img, title: title || id },
    video,
    user: $selectedUserProfileData,
    firm: { banner, bannerUrl },
    coords: { lat, lng },
    year,
    link,
  });
  shouldDisplayShowOnMap.set(true);
  permalink.update({ params: { marker: id } });
};

const handleShowOnMapClick = () => {
  if (!$selectedUserProfileData.id) {
    selectedUserProfileData.set($userData ?? {});
  }
  getUserSpots(isCurrentUser ? null : $selectedUserProfileData.id, token, {
    year: `${currentYear}`,
    offset: 0,
    limit: 99999999999999,
  }).then((response) => {
    const { success, result } = response;
    if (success && result) {
      const { spots, years } = result;
      markersStore.set({ spots, years: getProfileYears(years) });
      isSearchResults.set(false);
      isShowOnMapMode.set(true);
      selectedYear.set(currentYear ? `${currentYear}` : EMPTY_YEAR_STRING);
      selectedArtist.set("");
      selectedCrew.set("");
      permalink.update({ clearParams: ["artist", "crew"] });
      showUserProfile(false);
    }
  });
};
</script>

<div class="container" style={showEditModal ? "display: none" : ""}>
  {#if invites.length}
    <div class="invites">
      You have
      <button
        type="button"
        class="button"
        on:click={() => toggleInvitesPopup(true)}>Invite</button>
      for your friends 🖖
    </div>
  {/if}
  <div class="top">
    {#if username}
      <div class="username">{username}</div>
    {/if}
    {#if isCurrentUser}
      <button type="button" class="button logout" on:click={handleLogout}
        >Logout</button>
    {/if}
  </div>
  {#if !!spotsList.length || isShowSpinner}
    <div class="data">
      {#if !!spotsList.length}
        <div class="data-top">
          <div class="year-select">
            <CustomSelect
              items={yearsToApply}
              selectedValue={{ value: currentYear, label: currentYear }}
              isYear
              on:select={handleYearSelect} />
          </div>
          {#if currentYear !== ALL_YEARS_STRING}
            <button
              type="button"
              class="button show-on-map"
              on:click={handleShowOnMapClick}>Show on map</button>
          {/if}
        </div>
      {/if}
      {#if !isLoading}
        <div class="spots">
          {#each spotsList as spot}
            <div class="spot-card" on:click={() => onSpotClick(spot)}>
              <img
                loading="lazy"
                src={spot.thumbnail}
                alt={spot.title || `${username}'s art`}
                in:fade={{ duration: 200 }} />
              {#if isCurrentUser}
                <div class="overlay">
                  <button
                    type="button"
                    class="button edit"
                    on:click={() => handleEdit(spot)} />
                  <button
                    type="button"
                    class="button delete"
                    on:click={() => handleDelete(spot)} />
                </div>
              {/if}
            </div>
          {/each}
          <InfiniteScroll
            hasMore={newBatch.length === MAX_SPOTS_PER_PAGE}
            threshold={100}
            on:loadMore={onLoadMore}
            elementScroll={document.querySelector(".modal")} />
        </div>
      {/if}
      {#if isShowSpinner}
        <div class="spinner-container">
          <Spinner margin="20px auto" />
        </div>
      {/if}
    </div>
  {:else if !isShowSpinner}
    <div class="empty-state">
      <img src="../../../images/empty.jpg" alt="Empty" />
      <p>
        <button
          type="button"
          class="button empty-button"
          on:click={handleAddSpot}>Make your mark</button> on society, not in society
      </p>
    </div>
  {/if}
</div>

{#if showEditModal}
  <Modal on:close={() => toggleEditModal(false)} noLogo noClose>
    <EditSpot
      editSpotData={currentSpot}
      {toggleEditModal}
      onSubmit={onSubmitChanges} />
  </Modal>
{/if}

{#if showDeletePopup}
  <Popup title="Delete art?" on:close={() => toggleDeletePopup(false)}>
    <DeleteSpot
      close={() => toggleDeletePopup(false)}
      {currentSpot}
      onSubmit={onSubmitChanges} />
  </Popup>
{/if}

{#if showInvitesPopup}
  <Popup
    title={`Invites ${unusedInvitesCount}/${invites.length} 👽`}
    on:close={() => toggleInvitesPopup(false)}>
    <Invites close={() => toggleInvitesPopup(false)} {invites} {username} />
  </Popup>
{/if}

<style lang="scss">
.container {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 938px;
}

.top {
  display: flex;
  align-self: stretch;
  justify-content: space-between;
  margin-bottom: 6px;
}

.username {
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
}

.invites {
  margin-bottom: 26px;
  color: var(--color-dark);
  font-size: 14px;
  line-height: 17px;

  button {
    background: none;
    color: var(--color-accent);
    font-size: 14px;
    font-weight: 900;
    line-height: 22px;
    text-transform: uppercase;
  }
}

.logout {
  transition: opacity 0.3s;
  opacity: 0.4;
  background: none;
  color: var(--color-accent);
  font-size: 18px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;

  &:hover {
    opacity: 1;
  }
}

.show-on-map {
  background: none;
  color: var(--color-accent);
  font-size: 14px;
  font-weight: 900;
  line-height: 22px;
  text-transform: uppercase;
}

.empty-state {
  margin: auto 0;
  text-align: center;

  img {
    width: 100%;
    max-width: 394px;
    margin: auto;
  }

  p {
    margin: 36px 0;
    color: var(--color-dark);
    font-size: 24px;
    font-weight: 900;
    line-height: 1.22;
    text-transform: uppercase;
  }

  .empty-button {
    background: none;
    color: var(--color-accent);
    text-transform: inherit;

    &:hover {
      opacity: 0.7;
    }
  }
}

.year-select {
  width: 114px;
  height: 40px;
}

.data {
  flex: 1 0 auto;
  width: 100%;

  &-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
}

.spots {
  display: grid;
  grid-auto-rows: 160px;
  grid-gap: 4vmin;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  justify-content: space-between;
  width: 100%;
}

.spot-card {
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  background-color: #d3d3d3;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
  }

  .overlay {
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    transition: opacity 0.3s;
    border-radius: inherit;
    opacity: 0;
    background: rgba($color: #000, $alpha: 0.45);
  }

  &:hover {
    .overlay {
      opacity: 1;
    }
  }
}

.edit,
.delete {
  width: 54px;
  height: 54px;
  margin: 12px;
  background-color: var(--color-accent);
  background-repeat: no-repeat;
  background-position: 50% 50%;
}

.edit {
  background-image: url(../../../images/pencil.svg);
  background-size: 20px 20px;
}

.delete {
  background-image: url(../../../images/trash.svg);
  background-size: 14px 18px;
}

.spinner-container {
  position: relative;
}

@media (max-width: 767px) {
  .top {
    position: relative;
    flex-direction: column-reverse;
    margin-bottom: 18px;
  }

  .invites {
    position: absolute;
    top: 25px;
    left: 50%;
    width: fit-content;
    max-width: 71vw;
    transform: translateX(-50%);
    text-align: center;
  }

  .logout {
    width: 30px;
    height: 30px;
    margin: -30px 0 52px;
    background: url(../../../images/logout.svg) 50% 50%/27px 27px no-repeat;
    font-size: 0;
  }
}
</style>
