<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import InfiniteScroll from "svelte-infinite-scroll";
import { afterUrlChange, goto, params } from "@roxi/routify";
import linkifyHtml from "linkify-html";
import "../../js/utils/customMentionPlugin.js";

import { editUser, getUserData } from "./../../js/api/auth.js";
import { getUserMarkedSpots, getUserSpots } from "../../js/api/spot";
import { followUser, unfollowUser } from "../../js/api/follow.js";
import {
  isShowOnMapMode,
  userData,
  markersStore,
  openedMarkerData,
  selectedArtist,
  selectedCrew,
  selectedUserProfileData,
  selectedYear,
  editSpotData,
  shouldShowAddSpot,
  isFirstTimeVisit,
  isUserVerifyProgress,
  isLoggedIn,
  profileState,
} from "../../js/store";
import { getProfileYears } from "./../../js/utils/datesUtils.js";
import {
  clickOutside,
  isEmpty,
  loadFromLocalStorage,
  upperFirst,
} from "../../js/utils/commonUtils";
import { processImage } from "../../js/utils/imageUtils.js";

import ShowOnMapButton from "../elements/ShowOnMapButton.svelte";
import PlusSvg from "../elements/icons/PlusSvg.svelte";
import ShareSvg from "../elements/icons/ShareSvg.svelte";
import PencilSvg from "../elements/icons/PencilSvg.svelte";
import SelectIndicatorSvg from "../elements/icons/SelectIndicatorSvg.svelte";
import GridViewSvg from "../elements/icons/GridViewSvg.svelte";
import MentionSvg from "../elements/icons/MentionSvg.svelte";
import CustomSelect from "../elements/CustomSelect.svelte";
import PlaceholdersGrid from "../elements/PlaceholdersGrid.svelte";
import Popup from "../Popup.svelte";
import DeleteSpot from "./DeleteSpot.svelte";
import ShareProfile from "./ShareProfile.svelte";
import SpotCard from "./SpotCard.svelte";

import {
  ALL_YEARS_STRING,
  EMPTY_YEAR_STRING,
  ERROR_MESSAGES,
  MAX_IMAGE_FILE_SIZE,
  MAX_ITEMS_PER_PAGE,
  USER_ABOUT_TEXT_LIMIT,
} from "../../js/constants";

let currentSpot;
let showDeletePopup = false;
let showSharePopup = false;
let newBatch = [];
let parentModal = null;
let userBg = null;
let uploadedBg = {
  file: undefined,
  filePreview: "",
  blob: undefined,
};
let errors = { uploadedBg: "" };

let about = "";
let isEditableAbout = false;
let userDescrElement;
let isExpandableAbout = false;
let isExpandedAbout = false;
let aboutCharacterCount = 0;

const token = loadFromLocalStorage("token") || null;
const EMPTY_ABOUT_TEXT = "Write something about you.";

const toggleDeletePopup = (toggle) => (showDeletePopup = toggle);
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

  userDescrElement = document.getElementById("user-description");
  const observer = new MutationObserver(() => {
    aboutCharacterCount = userDescrElement.textContent?.length;
  });
  observer.observe(userDescrElement, {
    characterData: true,
    subtree: true,
  });
});

const fetchSpots = ({ year, offset, isNewFetch = false }) => {
  profileState.setIsLoading(isNewFetch);
  profileState.setIsShowSpinner(true);

  const request = $profileState.showMarkedSpots
    ? getUserMarkedSpots
    : getUserSpots;

  request(username, token, {
    year,
    offset,
    sortBy: $profileState.sortBy,
  }).then((response) => {
    const { success, result, errors } = response;
    if (success && result) {
      const { spots, years } = result;
      if (isNewFetch) {
        profileState.setSpotsList([]);
      }
      newBatch = spots ? [...spots] : [];
      profileState.setSpotsList([...$profileState.spotsList, ...newBatch]);
      profileState.setHasMore(newBatch.length === MAX_ITEMS_PER_PAGE);
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

let { username } = $params;

let isCurrentUser = $userData.username === username;
let name = isCurrentUser
  ? $userData.artist?.name ?? $userData.crew?.name
  : $profileState.user.artist?.name ?? $profileState.user.crew?.name;

$: isCurrentUser = $userData.username === username;
$: name = isCurrentUser
  ? $userData.artist?.name ?? $userData.crew?.name
  : $profileState.user.artist?.name ?? $profileState.user.crew?.name;
$: userBg = isCurrentUser
  ? $userData.background
  : $profileState.user.background;
$: about = isCurrentUser ? $userData.about : $profileState.user.about;
$: if (about) {
  aboutCharacterCount = about.replace(/(\r\n)/gm, "\n").length;
}

$: if (about && userDescrElement) {
  setTimeout(() => {
    isExpandableAbout = userDescrElement.scrollHeight > 120;
  }, 0);
}

$: if (!$profileState.isInitialized && !$isUserVerifyProgress) {
  profileState.setIsInitialized(true);
  if (!isCurrentUser && !$profileState.user.id) {
    getUserData(token, username).then((response) => {
      const { success, result, errors } = response;

      if (errors) {
        $goto("/404");
      }

      if (success && result) {
        fetchSpots({ isNewFetch: true });
        profileState.setUser(result);
        profileState.setIsLoading(false);
      }
    });
  } else {
    fetchSpots({ isNewFetch: true });
  }
}

$afterUrlChange(({ route }) => {
  const { params } = route;
  if (params.username && username !== params.username) {
    username = params.username;
    profileState.reset();
  }
});

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
  const element = document.querySelector(`[data-spot-id="${spot.id}"]`);
  profileState.setScrollOffset(element.offsetTop);
  $goto("/@:username/spot/:id/edit", { username: spot.user.username, id });
};

const handleDelete = (spot) => {
  currentSpot = spot;
  toggleDeletePopup(true);
};

const onLoadMore = () => {
  if ($profileState.isShowSpinner) {
    return;
  }

  const offset = $profileState.offset + MAX_ITEMS_PER_PAGE;
  profileState.setOffset(offset);
  if ($profileState.currentYear === ALL_YEARS_STRING) {
    fetchSpots({ offset });
    return;
  }
  fetchSpots({ year: `${$profileState.currentYear}`, offset });
};

const handleSubmitChanges = () => {
  if ($profileState.currentYear === ALL_YEARS_STRING) {
    fetchSpots({ isNewFetch: true });
    return;
  }
  fetchSpots({ year: `${$profileState.currentYear}`, isNewFetch: true });
};

const handleSpotClick = (spot) => {
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
  const element = document.querySelector(`[data-spot-id="${spot.id}"]`);
  profileState.setScrollOffset(element.offsetTop);
  $goto("/@:username/spot/:id", {
    username: spot.user.username,
    id,
  });
};

const handleShowOnMapClick = (showAll) => {
  if (!$selectedUserProfileData.id && isCurrentUser) {
    selectedUserProfileData.set(
      $userData ?? ($profileState.user?.id ? $profileState.user : {}),
    );
  } else {
    $profileState.user?.id && selectedUserProfileData.set($profileState.user);
  }
  getUserSpots(username, token, {
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
      isShowOnMapMode.set(true);
      selectedYear.set(
        $profileState.currentYear
          ? `${$profileState.currentYear}`
          : EMPTY_YEAR_STRING,
      );
      selectedArtist.set("");
      selectedCrew.set("");
      $goto("/");
    }
  });
};

const handleSortingChange = (value) => () => {
  if ($profileState.sortBy === value) return;

  profileState.setSorting(value);
  fetchSpots({ isNewFetch: true });
};

const handleProcessedImage = (imageObject) => {
  uploadedBg = { ...imageObject };

  editUser(token, $userData.id, {
    background: uploadedBg.blob,
  }).then((response) => {
    const { success, result } = response;
    if (success && result) {
      $userData.background = result.background;
    }
  });
};

const handleImageChange = () => {
  let imageObject = { ...uploadedBg };
  const file = uploadedBg.file[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function () {
        if (file.size > MAX_IMAGE_FILE_SIZE) {
          processImage(
            file,
            MAX_IMAGE_FILE_SIZE,
            4200,
            4200,
            0.8,
            true,
            (blob) => {
              const newBlob = new File([blob], "image.jpg");
              imageObject = {
                ...imageObject,
                blob: newBlob,
                filePreview: URL.createObjectURL(newBlob),
              };
              handleProcessedImage(imageObject);
            },
          );
        } else {
          processImage(
            file,
            0,
            Infinity,
            Infinity,
            0.85,
            false,
            (blob, isRotated) => {
              const newBlob = new File([blob], "image.jpg");
              imageObject = isRotated
                ? {
                    ...imageObject,
                    blob: newBlob,
                    filePreview: URL.createObjectURL(newBlob),
                  }
                : { ...imageObject, blob: file, filePreview: e.target.result };
              handleProcessedImage(imageObject);
            },
          );
        }
      };
    };

    if (file.size < MAX_IMAGE_FILE_SIZE * 6) {
      errors.uploadedBg = "";
      reader.readAsDataURL(file);
    } else {
      errors.uploadedBg = ERROR_MESSAGES.fileTooLarge;
    }
  }
};

const getBgStyleUrl = (uploadedBg, userBg) => {
  if (
    (!uploadedBg.filePreview && !userBg) ||
    (!isCurrentUser && $profileState.user.isSpotsHidden)
  ) {
    return;
  }

  return `url(${uploadedBg.filePreview || userBg}) 50%/cover no-repeat`;
};

const initDescrEditing = () => {
  isEditableAbout = true;

  setTimeout(() => {
    userDescrElement.focus();
    document.execCommand("selectAll", false, null);
    document.getSelection().collapseToEnd();
  }, 0);
};

const handleDescrBlur = (isEditable) => (event) => {
  if (!isEditable) return;

  const { innerText } = event.target;
  const trimmedText = innerText.trim();

  if (trimmedText === about || trimmedText.length > USER_ABOUT_TEXT_LIMIT)
    return;

  editUser(token, $userData.id, {
    about: trimmedText,
  }).then((response) => {
    const { success, result } = response;
    if (success && result) {
      $userData.about = result.about;
    }
  });

  userDescrElement.scrollTo(0, 0);
  isEditableAbout = false;
  isExpandableAbout = userDescrElement.scrollHeight > 120;
};

const prepareAboutText = (text) => {
  if (!isCurrentUser && $profileState.user.isSpotsHidden) return "";

  const formattedText =
    text &&
    linkifyHtml(text, {
      defaultProtocol: "https",
      nl2br: true,
      target: { url: "_blank", email: "_blank", mention: null },
      formatHref: {
        mention: (href) => `/@${href.substring(1)}`,
      },
    });
  const textWithUpperFirst = upperFirst(formattedText);

  return textWithUpperFirst || "";
};

const handleFollowBtnClick = async () => {
  const { user } = $profileState;
  const request = user.isFollowing ? unfollowUser : followUser;
  const { success } = await request(token, user.id);

  if (success) {
    const updatedUser = { ...user, isFollowing: !user.isFollowing };
    profileState.setUser(updatedUser);
  }
};

const handleMarkedSpotsSwitch = (showMarked) => () => {
  profileState.setShowMarkedSpots(showMarked);
  profileState.setSpotsList([{}]);
  fetchSpots({ isNewFetch: true });
};
</script>

<div
  class="container"
  class:isCurrentUser
  class:hasBg={!(!isCurrentUser && $profileState.user.isSpotsHidden) &&
    (uploadedBg.filePreview || userBg)}>
  <div class="user-bg-wrapper">
    <div
      class="user-bg"
      style={`background: ${
        getBgStyleUrl(uploadedBg, userBg) ?? "var(--color-accent)"
      };`}>
    </div>
    <div class="user-data">
      <div class="top">
        {#if name || username}
          <div class="user">
            {#if name}
              <div class="name-wrapper">
                <span class="name">{name}</span>
              </div>
            {/if}
            {#if username}
              <div class="username">{`@${username}`}</div>
            {/if}
          </div>
        {/if}
      </div>
      <div class="user-type-wrapper">
        <div
          class={`user-type ${isCurrentUser ? $userData.type : $profileState.user.type}`}
          title={isCurrentUser ? $userData.type : $profileState.user.type}>
        </div>
        {#if (isCurrentUser ? $userData.level : $profileState.user.level) < 3}
          <div class="sandbox" />
        {/if}
      </div>
      {#if name}
        <div class="buttons-wrapper">
          <button
            type="button"
            class="button name"
            on:click={() => toggleSharePopup(true)}
            ><ShareSvg color="dark" /></button>
          {#if $isLoggedIn && !isCurrentUser && !$profileState.user.isSpotsHidden}
            <button
              type="button"
              class="button follow"
              class:active={!$profileState.user.isFollowing}
              on:click={handleFollowBtnClick}
              >{$profileState.user.isFollowing ? "Unfollow" : "Follow"}</button>
          {/if}
        </div>
      {/if}
    </div>
    {#if isCurrentUser}
      <div class="user-bg-control">
        <input
          accept="image/png, image/jpeg"
          bind:files={uploadedBg.file}
          on:change={handleImageChange}
          id="upload-bg"
          type="file" />
        <label
          for="upload-bg"
          type="button"
          class="button"
          title="Add background image"
          ><PlusSvg color="var(--color-dark)" /></label>
      </div>
    {/if}
  </div>
  <div class="description" class:isExpandedAbout class:isEditableAbout>
    {#if isCurrentUser && !about && !isEditableAbout && !userDescrElement?.innerText.length}
      <div class="text empty_state" in:fade={{ transition: 200 }}>
        {EMPTY_ABOUT_TEXT}
      </div>
    {/if}
    <div
      id="user-description"
      class="text"
      contenteditable={isEditableAbout ? "plaintext-only" : false}
      use:clickOutside
      on:blur={handleDescrBlur(isEditableAbout)}
      on:click_outside={() => {
        if (isEditableAbout) {
          isEditableAbout = false;
        }
      }}
      on:keydown|stopPropagation={(event) => {
        if (isEditableAbout && event.key === "Escape") {
          isEditableAbout = false;
        }
      }}
      role="textbox"
      tabindex="0">
      {@html prepareAboutText(about)}
    </div>
    {#if isEditableAbout}
      <div
        class="char-counter"
        title={aboutCharacterCount > USER_ABOUT_TEXT_LIMIT
          ? `${USER_ABOUT_TEXT_LIMIT} symbols limit exceeded, changes will not be saved`
          : `You typed ${aboutCharacterCount} from ${USER_ABOUT_TEXT_LIMIT} symbols`}>
        <span class:invalid={aboutCharacterCount > USER_ABOUT_TEXT_LIMIT}
          >{aboutCharacterCount}</span>
        / {USER_ABOUT_TEXT_LIMIT}
      </div>
    {/if}
    {#if isCurrentUser && !isEditableAbout}
      <button
        type="button"
        class="button button-edit"
        on:click={initDescrEditing}>
        <PencilSvg fill="var(--color-dark)" /></button>
    {/if}
    {#if isExpandableAbout && !isEditableAbout}
      <div class="expand-wrapper">
        <button
          type="button"
          class="button button-expand"
          on:click={() => (isExpandedAbout = !isExpandedAbout)}
          >{isExpandedAbout ? "Show less" : "Show more"}
          <span><SelectIndicatorSvg /></span></button>
      </div>
    {/if}
  </div>
  {#if !!$profileState.spotsList.length || $profileState.isShowSpinner || $profileState.showMarkedSpots}
    <div class="data">
      {#if !!$profileState.spotsList.length || $profileState.showMarkedSpots}
        <div class="data-tabs_wrapper">
          <div class="right_tabs">
            <button
              type="button"
              class="button"
              class:active={!$profileState.showMarkedSpots}
              on:click={handleMarkedSpotsSwitch(false)}
              ><GridViewSvg
                isActive={!$profileState.showMarkedSpots} /></button>
            <button
              type="button"
              class="button"
              class:active={$profileState.showMarkedSpots}
              on:click={handleMarkedSpotsSwitch(true)}
              ><MentionSvg isActive={$profileState.showMarkedSpots} /></button>
          </div>
        </div>
        <div class="data-top">
          <div class="year-select">
            <CustomSelect
              items={$profileState.yearsToApply}
              selectedValue={{
                value: $profileState.currentYear,
                label: $profileState.currentYear || EMPTY_YEAR_STRING,
              }}
              isYear
              on:select={handleYearSelect} />
          </div>
          {#if $profileState.currentYear === ALL_YEARS_STRING}
            <div class="sorting">
              <span>Sort by: </span>
              <button
                type="button"
                class="button"
                class:active={$profileState.sortBy === "created_at"}
                on:click={handleSortingChange("created_at")}>Upload</button>
              {" / "}
              <button
                type="button"
                class="button"
                class:active={$profileState.sortBy === "year"}
                on:click={handleSortingChange("year")}>Year</button>
            </div>
          {/if}
          <div class="show-on-map">
            <ShowOnMapButton
              onClick={() => handleShowOnMapClick(false)}
              showTextOnHover />
          </div>
        </div>
      {/if}
      {#if !$profileState.isLoading}
        <div class="spots">
          {#each $profileState.spotsList as spot}
            <SpotCard
              isEditable={isCurrentUser && !$profileState.showMarkedSpots}
              {spot}
              onSpotClick={handleSpotClick}
              onEdit={handleEdit}
              onDelete={handleDelete} />
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
        <div class="spots"><PlaceholdersGrid /></div>
      {:else if !$profileState.spotsList.length}
        <div class="empty-state marked">No marked spots found</div>
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
      onSubmit={handleSubmitChanges} />
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

.user-bg-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 240px;
  margin-bottom: 24px;
  padding: 32px 0;

  .user-data {
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    flex: 1 0 auto;
    width: 100%;
  }

  .user-type-wrapper {
    display: flex;
    position: absolute;
    bottom: -48px;
    left: 0;

    > div {
      width: 44px;
      height: 44px;
      border-radius: 0;
      background-color: var(--color-accent-light);
    }

    .artist {
      background: var(--color-accent-light) url(../../images/artist.svg) 50% 50%/
        29px 30px no-repeat;
    }

    .crew {
      background: var(--color-accent-light) url(../../images/crew.svg) 50% 50%/ 30px
        30px no-repeat;
    }

    .hunter {
      background: var(--color-accent-light) url(../../images/hunter.svg) 50% 50%/
        25px 30px no-repeat;
    }

    .sandbox {
      margin-left: 4px;
      background: var(--color-accent-light) url(../../images/sandbox.svg) 50%
        50%/ 29px 25px no-repeat;
    }
  }

  .buttons-wrapper {
    display: flex;
    position: absolute;
    right: 0;
    bottom: -48px;

    .name,
    .follow {
      height: 44px;
      border-radius: 0;
      background-color: var(--color-accent-light);
      transition: 0.2s;

      &:hover {
        background-color: var(--color-accent-light-hover);
      }
    }

    .name {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
    }

    .follow {
      width: 110px;
      margin-left: 12px;
      padding: 0 5px;
      color: var(--color-dark);
      font-size: 16px;
      text-transform: uppercase;
      font-weight: 500;

      &.active {
        font-weight: 600;
      }
    }
  }
}

.user-bg {
  display: flex;
  position: absolute;
  top: 40px;
  right: 0;
  left: 0;
  z-index: -1;
  align-items: center;
  justify-content: center;
  height: 240px;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
  opacity: 0.25;

  &-control {
    input {
      position: absolute;
      left: -9999px;
      clip: rect(0 0 0 0);
      opacity: 0;
    }

    label {
      display: flex;
      position: absolute;
      top: 226px;
      left: 50%;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 0;
      transform: translateX(-50%);
      background-color: var(--color-light);
      transition: opacity 0.3s;
    }
  }
}

.hasBg {
  .user-bg {
    opacity: 1;
  }

  .user-bg-control {
    label {
      opacity: 0.5;

      &:hover {
        opacity: 1;
      }
    }
  }

  .user .name-wrapper,
  .username {
    background-color: var(--color-light);
  }
}

.top {
  display: flex;
  align-items: baseline;
  align-self: stretch;
  justify-content: space-between;
  margin-top: auto;
}

.user {
  max-width: 100%;
  margin-bottom: -14px;
  color: var(--color-dark);

  .name {
    margin-bottom: 4px;
    color: inherit;
    font-size: 48px;
    font-weight: 800;
    line-height: 1.22;
    text-transform: uppercase;

    &-wrapper {
      padding: 6px 10px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &name {
    display: inline-block;
    position: relative;
    top: -14px;
    padding: 4px 10px;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.25;
  }
}

.description {
  display: flex;
  position: relative;
  align-self: flex-start;
  flex-wrap: wrap;
  max-width: 100%;
  min-height: 40px;
  margin-bottom: 32px;
  font-size: 14px;

  .text {
    overflow: hidden;
    min-width: 225px;
    max-height: 105px;

    &.empty_state {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
  }

  &.isEditableAbout {
    width: 100%;
    .text {
      overflow: auto;
      width: 100%;
      min-height: 45px;
      max-height: 330px;
      padding: 10px 8px 20px;
      border: 1px solid var(--color-black);
      border-radius: 2px;

      &:focus-visible {
        outline: none;
      }
    }
  }

  .button-edit {
    display: flex;
    align-self: flex-end;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-left: 10px;
    transition: 0.2s;
    background-color: var(--color-accent-light);

    &:hover {
      background-color: var(--color-accent-light-hover);
    }
  }

  .expand-wrapper {
    width: 100%;
  }

  .button-expand {
    display: flex;
    align-items: center;
    opacity: 0.7;
    background: none;
    color: inherit;
    transition: opacity 0.3s;
    font-size: 13px;

    > span {
      display: inline-flex;
      align-items: center;
      margin-left: 4px;
      transition: transform 0.3s;
    }

    &:hover {
      opacity: 1;
    }
  }

  .char-counter {
    position: absolute;
    right: 1px;
    bottom: 1px;
    padding: 0 2px;
    background-color: var(--color-light);
    font-size: 13px;

    .invalid {
      color: var(--color-error);
      font-weight: 700;
    }
  }

  &.isExpandedAbout {
    .text {
      max-height: none;
    }

    .button-expand > span {
      transform: rotate(180deg);
    }
  }
}

.isCurrentUser {
  .description {
    .text {
      max-width: calc(100% - 50px);
    }

    &.isEditableAbout {
      .text {
        max-width: 100%;
      }
    }
  }
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
    font-weight: 800;
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

  &.marked {
    padding: 24px;
  }
}

.data {
  flex: 1 0 auto;
  width: 100%;

  &-tabs_wrapper {
    display: flex;
    margin-bottom: 24px;
  }

  &-top {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
}

.right_tabs {
  display: flex;
  margin-left: auto;

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-bottom: 1px solid transparent;
    border-radius: 0;
    background-color: var(--color-accent-light);
    transition: 0.2s;

    &.active {
      border-bottom-color: var(--color-dark);
      pointer-events: none;
    }

    &:hover {
      background-color: var(--color-accent-light-hover);
    }
  }
}

.year-select {
  width: 114px;
  height: 40px;
}

.sorting {
  margin-left: 24px;
  font-size: 14px;
  line-height: 40px;

  > span {
    text-transform: uppercase;
  }

  .button {
    background: none;
    color: var(--color-dark);
    font-weight: 500;
    text-transform: uppercase;

    &.active {
      font-weight: 600;
      pointer-events: none;
    }

    &:disabled {
      opacity: 0.5;
    }

    &:hover {
      opacity: 0.7;
    }
  }
}

.show-on-map {
  margin-left: auto;
  line-height: 40px;
}

.spots {
  display: grid;
  grid-auto-rows: 160px;
  grid-gap: 4vmin;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  justify-content: space-between;
  width: 100%;
}

.go-to-map {
  display: block;
  position: fixed;
  top: 112px;
  left: 0;
  width: 64px;
  height: 52px;
  border-radius: 0 50% 50% 0;
  background: var(--color-accent) url(../../images/map.svg) 50% 50%/ 30px 26px no-repeat;
  color: transparent;
  font-size: 0;
}

@media (max-width: 767px) {
  .user-bg-wrapper {
    height: 220px;
    margin-bottom: 28px;
    padding: 12px 0;

    .buttons-wrapper,
    .user-type-wrapper {
      bottom: -34px;
    }
  }

  .user-bg {
    height: 220px;

    &-control {
      label {
        top: 110px;
      }
    }
  }

  .top {
    margin-bottom: 22px;
  }

  .username {
    top: -6px;
  }

  .user .name {
    font-size: 24px;
  }

  .description {
    margin-bottom: 24px;

    .text {
      max-height: 85px;
    }

    &.isEditableAbout .text {
      max-height: 265px;
    }
  }

  .right_tabs {
    width: 100%;
    margin: 0;

    .button {
      flex: 0 0 50%;
      margin: 0;
    }
  }

  .sorting {
    align-self: center;
    line-height: 1.2;

    > span {
      display: block;
    }
  }

  .show-on-map {
    padding-left: 10px;
  }

  .go-to-map {
    top: 16px;
  }
}
</style>
