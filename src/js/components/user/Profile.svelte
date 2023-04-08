<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import InfiniteScroll from "svelte-infinite-scroll";
import { goto, params, url } from "@roxi/routify";

import { getInvites, getUserData } from "./../../api/auth.js";
import { getUserSpots } from "../../api/spot";
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
  editSpotData,
  shouldShowAddSpot,
  isFirstTimeVisit,
  isUserVerifyProgress,
  profileState,
} from "../../store";
import { getProfileYears } from "./../../utils/datesUtils.js";
import {
  isEmpty,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "../../utils/commonUtils";

import Invites from "./Invites.svelte";
import Spinner from "./../elements/Spinner.svelte";
import CustomSelect from "../elements/CustomSelect.svelte";
import DeleteSpot from "./DeleteSpot.svelte";
import Popup from "../Popup.svelte";
import ShareSvg from "../elements/icons/ShareSvg.svelte";
import ShareProfile from "./ShareProfile.svelte";

import {
  ALL_YEARS_STRING,
  EMPTY_YEAR_STRING,
  MAX_SPOTS_PER_PAGE,
} from "../../constants";

let currentSpot;
let showDeletePopup = false;
let showInvitesPopup = false;
let showSharePopup = false;
let newBatch = [];
let invites = [];
let unusedInvitesCount = 0;
let parentModal = null;
const token = loadFromLocalStorage("token") || null;

const toggleDeletePopup = (toggle) => (showDeletePopup = toggle);
const toggleInvitesPopup = (toggle) => (showInvitesPopup = toggle);
const toggleSharePopup = (toggle) => (showSharePopup = toggle);

onMount(() => {
  parentModal = document.getElementById("profile-modal");
  if ($profileState.scrollOffset) {
    setTimeout(() => {
      parentModal.scrollTo({
        top: $profileState.scrollOffset - parentModal.offsetHeight / 2,
      });
      profileState.setScrollOffset(0);
    }, 0);
  }
});

const { username } = $params;
const strippedUsername = username.substring(1);

let isCurrentUser = $userData.username === strippedUsername;
let name = isCurrentUser
  ? $userData.name ?? $userData.crew
  : $profileState.user.name ?? $profileState.user.crew;

$: isCurrentUser = $userData.username === strippedUsername;
$: name = isCurrentUser
  ? $userData.name ?? $userData.crew
  : $profileState.user.name ?? $profileState.user.crew;

$: if (!$profileState.isInitialized && !$isUserVerifyProgress) {
  profileState.setIsInitialized(true);
  if (!isCurrentUser && !$profileState.user.id) {
    getUserData(strippedUsername).then((response) => {
      const { success, result, errors } = response;

      if (errors) {
        $goto("/404");
      }

      if (success && result) {
        fetchSpots({ isNewFetch: true });
        shouldDisplayShowOnMap.set(false);
        profileState.setUser(result);
        profileState.setIsLoading(false);
      }
    });
  } else {
    fetchSpots({ isNewFetch: true });
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
  }
}

const fetchSpots = ({ year, offset, isNewFetch = false }) => {
  profileState.setIsLoading(isNewFetch);
  profileState.setIsShowSpinner(true);
  getUserSpots(strippedUsername, token, {
    year,
    offset,
  }).then((response) => {
    const { success, result, errors } = response;
    if (success && result) {
      const { spots, years } = result;
      if (isNewFetch) {
        profileState.setSpotsList([]);
      }
      newBatch = spots ? [...spots] : [];
      profileState.setSpotsList([...$profileState.spotsList, ...newBatch]);
      profileState.setHasMore(newBatch.length === MAX_SPOTS_PER_PAGE);
      const yearsToApply = getProfileYears(years);
      profileState.setYearsToApply(yearsToApply);
      if ($profileState.currentYear === undefined || year === undefined) {
        profileState.setCurrentYear(yearsToApply[0]);
      }
    }
    if (errors && !isEmpty(errors)) {
      if (errors.year) {
        fetchSpots({});
      }
    }
    profileState.setIsLoading(false);
    profileState.setIsShowSpinner(false);
  });
};

const handleLogout = () => {
  removeFromLocalStorage("token");
  isLoggedIn.set(false);
  userData.set({});
  $goto("/");
};

const handleAddSpot = () => {
  shouldShowAddSpot.set(true);
  $goto("/");
};

const handleYearSelect = (event) => {
  const { value } = event.detail.detail;
  const currentYear = value !== EMPTY_YEAR_STRING ? value : "";
  profileState.setCurrentYear(currentYear);
  profileState.setOffset(0);
  if (currentYear === ALL_YEARS_STRING) {
    fetchSpots({ isNewFetch: true });
    return;
  }
  fetchSpots({ year: `${currentYear}`, isNewFetch: true });
};

const handleEdit = (spot) => {
  const { id } = spot;
  editSpotData.set(spot);
  $goto("/@:username/spot/:id/edit", { username: strippedUsername, id });
};

const handleDelete = (spot) => {
  currentSpot = spot;
  toggleDeletePopup(true);
};

const onLoadMore = () => {
  if ($profileState.isShowSpinner) {
    return;
  }

  const offset = $profileState.offset + MAX_SPOTS_PER_PAGE;
  profileState.setOffset(offset);
  if ($profileState.currentYear === ALL_YEARS_STRING) {
    fetchSpots({ offset });
    return;
  }
  fetchSpots({ year: `${$profileState.currentYear}`, offset });
};

const onSubmitChanges = () => {
  if ($profileState.currentYear === ALL_YEARS_STRING) {
    fetchSpots({ isNewFetch: true });
    return;
  }
  fetchSpots({ year: `${$profileState.currentYear}`, isNewFetch: true });
};

const onSpotClick = (spot) => {
  selectedUserProfileData.set($profileState.user);
  const {
    id,
    spotStatus: status,
    img,
    title,
    videoLink: video,
    publicBanner: { banner, bannerUrl },
    location: { lat, lng },
  } = spot;
  openedMarkerData.set({
    ...spot,
    status,
    img: { src: img, title: title || id },
    video,
    firm: { banner, bannerUrl },
    coords: { lat, lng },
  });
  shouldDisplayShowOnMap.set(true);
  const element = document.querySelector(`[data-spot-id="${spot.id}"]`);
  profileState.setScrollOffset(element.offsetTop);
  $goto("/@:username/spot/:id", {
    username: isCurrentUser ? strippedUsername : $profileState.user.username,
    id,
  });
};

const handleShowOnMapClick = (showAll) => {
  if (!$selectedUserProfileData.id && isCurrentUser) {
    selectedUserProfileData.set($userData ?? {});
  } else {
    selectedUserProfileData.set(user);
  }
  getUserSpots(strippedUsername, token, {
    year:
      showAll || $profileState.currentYear === ALL_YEARS_STRING
        ? undefined
        : `${$profileState.currentYear}`,
    offset: 0,
    limit: 99999999999999,
  }).then((response) => {
    const { success, result } = response;
    if (success && result) {
      const { spots, years } = result;
      markersStore.set({ spots, years: getProfileYears(years) });
      isSearchResults.set(false);
      isShowOnMapMode.set(true);
      selectedYear.set(
        $profileState.currentYear
          ? `${$profileState.currentYear}`
          : EMPTY_YEAR_STRING
      );
      selectedArtist.set("");
      selectedCrew.set("");
      $goto("/");
    }
  });
};
</script>

<div class="container" class:isCurrentUser>
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
    {#if !$profileState.isLoading && (name || username)}
      <div class="user">
        {#if name}
          <span class="name">{name}</span>
          <button
            type="button"
            class="button name"
            on:click={() => toggleSharePopup(true)}
            ><ShareSvg color="dark" /></button>
        {/if}
        {#if username}
          <div class="username">{username}</div>
        {/if}
      </div>
    {/if}
    {#if isCurrentUser}
      <button type="button" class="button logout" on:click={handleLogout}
        >Logout</button>
    {/if}
  </div>
  {#if !!$profileState.spotsList.length || $profileState.isShowSpinner}
    <div class="data">
      {#if !!$profileState.spotsList.length}
        <div class="data-top">
          <div class="year-select">
            <CustomSelect
              items={$profileState.yearsToApply}
              selectedValue={{
                value: $profileState.currentYear,
                label: $profileState.currentYear || EMPTY_YEAR_STRING,
              }}
              isYear
              on:select={handleYearSelect}
              listPlacement="bottom" />
          </div>
          <button
            type="button"
            class="button show-on-map"
            on:click={handleShowOnMapClick}>Show on map</button>
        </div>
      {/if}
      {#if !$profileState.isLoading}
        <div class="spots">
          {#each $profileState.spotsList as spot}
            <a
              href={!isCurrentUser
                ? $url("/@:username/spot/:id", {
                    username: $profileState.user.username,
                    id: spot.id,
                  })
                : undefined}
              class="spot-card"
              role="button"
              on:click|preventDefault={() =>
                !isCurrentUser && onSpotClick(spot)}
              data-spot-id={spot.id}>
              <img
                loading="lazy"
                src={spot.thumbnail}
                alt={spot.title || `${username}'s art`}
                in:fade={{ duration: 200 }} />
              {#if isCurrentUser}
                <div class="overlay">
                  <a
                    href={$url("/:username/spot/:id", {
                      username,
                      id: spot.id,
                    })}
                    class="button view"
                    on:click|preventDefault={() => onSpotClick(spot)}>👁</a>
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
            </a>
          {/each}
          {#if parentModal}
            <InfiniteScroll
              hasMore={$profileState.hasMore}
              threshold={100}
              on:loadMore={onLoadMore}
              elementScroll={parentModal} />
          {/if}
        </div>
      {/if}
      {#if $profileState.isShowSpinner}
        <div class="spinner-container">
          <Spinner margin="20px auto" />
        </div>
      {/if}
    </div>
  {:else if !$profileState.isShowSpinner}
    <div class="empty-state">
      <img src="../../../images/empty.jpg" alt="Empty" />
      <p>
        {#if isCurrentUser}
          <button
            type="button"
            class="button empty-button"
            on:click={handleAddSpot}>Make your mark</button> on society, not in society
        {:else}
          Make your mark on society, not in society
        {/if}
      </p>
    </div>
  {/if}
</div>

{#if $isFirstTimeVisit && !$profileState.isLoading && !isCurrentUser}
  <button
    type="button"
    class="button go-to-map"
    on:click={() => handleShowOnMapClick(true)}>Go to map</button>
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

{#if showSharePopup}
  <Popup on:close={() => toggleSharePopup(false)} title="Share Profile">
    <ShareProfile />
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
  align-items: baseline;
  align-self: stretch;
  justify-content: space-between;
  margin-bottom: 6px;
}

.user {
  color: var(--color-dark);

  .name {
    margin-bottom: 4px;
    background: none;
    color: inherit;
    font-size: 24px;
    font-weight: 900;
    line-height: 1.22;
    text-transform: uppercase;
  }

  &name {
    opacity: 0.4;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.25;
  }
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

    &:hover {
      opacity: 0.7;
    }
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

.view,
.edit,
.delete {
  width: 54px;
  height: 54px;
  margin: 12px;
  background-color: var(--color-accent);
  background-repeat: no-repeat;
  background-position: 50% 50%;
}

.view {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-light);
  text-decoration: none;
  font-size: 32px;
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

.go-to-map {
  display: block;
  position: fixed;
  top: 112px;
  left: 0;
  width: 64px;
  height: 52px;
  border-radius: 0 50% 50% 0;
  background: var(--color-accent) url(../../../images/map.svg) 50% 50%/ 30px 26px
    no-repeat;
  color: transparent;
  font-size: 0;
}

@media (max-width: 767px) {
  .container:not(.isCurrentUser) {
    margin-top: 48px;
  }

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

  .go-to-map {
    top: 16px;
  }
}
</style>
