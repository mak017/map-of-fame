<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import InfiniteScroll from "svelte-infinite-scroll";
import { afterUrlChange, goto, params, url } from "@roxi/routify";
import linkifyHtml from "linkify-html";
import "../../js/utils/customMentionPlugin.js";

import { editUser, getUserData } from "./../../js/api/auth.js";
import { getUserSpots } from "../../js/api/spot";
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
  followState,
} from "../../js/store";
import { getProfileYears } from "./../../js/utils/datesUtils.js";
import {
  clickOutside,
  isEmpty,
  loadFromLocalStorage,
} from "../../js/utils/commonUtils";
import { processImage } from "../../js/utils/imageUtils.js";

import Popup from "../Popup.svelte";
import DeleteSpot from "./DeleteSpot.svelte";
import ShareProfile from "./ShareProfile.svelte";
import Spinner from "./../elements/Spinner.svelte";
import CustomSelect from "../elements/CustomSelect.svelte";
import ShowOnMapButton from "../elements/ShowOnMapButton.svelte";
import PlusSvg from "../elements/icons/PlusSvg.svelte";
import ShareSvg from "../elements/icons/ShareSvg.svelte";
import PencilSvg from "../elements/icons/PencilSvg.svelte";
import SelectIndicatorSvg from "../elements/icons/SelectIndicatorSvg.svelte";

import {
  ALL_YEARS_STRING,
  EMPTY_YEAR_STRING,
  ERROR_MESSAGES,
  MAX_IMAGE_FILE_SIZE,
  MAX_SPOTS_PER_PAGE,
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
let isFollowing = false;

const token = loadFromLocalStorage("token") || null;

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
  getUserSpots(username, token, {
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
    getUserData(username).then((response) => {
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

$: if ($isLoggedIn && !isCurrentUser && !$followState.isFetched) {
  followState.request(token);
}

$: if (!isCurrentUser && $followState.list.length && $profileState.user.id) {
  isFollowing = $followState.list.some(
    (user) => user.id === $profileState.user.id,
  );
}

$afterUrlChange(({ route }) => {
  const { params } = route;
  if (params.username && username !== params.username) {
    username = params.username;
    profileState.setIsInitialized(false);
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
  $goto("/@:username/spot/:id/edit", { username: username, id });
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
  const element = document.querySelector(`[data-spot-id="${spot.id}"]`);
  profileState.setScrollOffset(element.offsetTop);
  $goto("/@:username/spot/:id", {
    username: isCurrentUser ? username : $profileState.user.username,
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
        mention: (href) => `@${href.substring(1)}`,
      },
    });

  return isEditableAbout || !isCurrentUser
    ? formattedText ?? ""
    : formattedText ?? "Write something about you.";
};

const handleFollowBtnClick = async () => {
  const request = isFollowing ? unfollowUser : followUser;

  await request(token, $profileState.user.id);

  if (isFollowing) {
    const updatedList = $followState.list.filter(
      (user) => user.id !== $profileState.user.id,
    );
    console.log("updatedList", updatedList);
    followState.setList(updatedList);
    isFollowing = false;
    return;
  }

  followState.pushToList($profileState.user);
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
      {#if name}
        <div class="buttons-wrapper">
          <button
            type="button"
            class="button name"
            on:click={() => toggleSharePopup(true)}><ShareSvg /></button>
          {#if $isLoggedIn && !isCurrentUser && !$profileState.user.isSpotsHidden}
            <button
              type="button"
              class="button follow"
              class:active={!isFollowing}
              on:click={handleFollowBtnClick}
              >{isFollowing ? "Unfollow" : "Follow"}</button>
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
    <div
      id="user-description"
      class="text"
      contenteditable={isEditableAbout ? "plaintext-only" : false}
      on:blur={handleDescrBlur(isEditableAbout)}
      use:clickOutside
      on:click_outside={() => {
        if (isEditableAbout) {
          isEditableAbout = false;
        }
      }}>
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
        <PencilSvg fill="var(--color-accent)" /></button>
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
            <ShowOnMapButton onClick={() => handleShowOnMapClick(false)} />
          </div>
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
              class:isHidden={!spot.showInProfile || spot.showInProfile === "0"}
              class:isFullyHidden={isCurrentUser && $userData.isSpotsHidden}
              role="button"
              on:click|preventDefault={() =>
                !isCurrentUser && onSpotClick(spot)}
              data-spot-id={spot.id}>
              <img
                loading="lazy"
                src={spot.thumbnail}
                alt={spot.title || `${username}'s art`}
                in:fade|global={{ duration: 200 }} />
              {#if isCurrentUser}
                <div class="overlay">
                  <a
                    href={$url("/@:username/spot/:id", {
                      username,
                      id: spot.id,
                    })}
                    class="button view"
                    on:click|preventDefault={() => onSpotClick(spot)}>👁</a>
                  <button
                    type="button"
                    class="button edit"
                    on:click={() => handleEdit(spot)}><PencilSvg /></button>
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

  .buttons-wrapper {
    position: absolute;
    right: 0;
    bottom: -44px;

    .name {
      width: 44px;
      height: 44px;
      border-radius: 0;
      background-color: var(--color-lotion);
    }

    .follow {
      width: 110px;
      height: 44px;
      padding: 0 16px;
      border-radius: 0;
      background-color: var(--color-lotion);
      color: var(--color-dark);
      font-size: 16px;
      font-weight: 600;

      &.active {
        background-image: url(../../../images/follow.svg);
        background-position: 80% 50%;
        background-repeat: no-repeat;
        background-size: 14px 18px;
        color: var(--color-accent);
        text-align: left;
      }
    }
  }
}

.user-bg {
  display: flex;
  position: absolute;
  top: 0;
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
      top: 50px;
      left: 50%;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
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
  overflow: hidden;
  color: var(--color-dark);
  text-overflow: ellipsis;

  .name {
    margin-bottom: 4px;
    color: inherit;
    font-size: 48px;
    font-weight: 900;
    line-height: 1.22;
    text-transform: uppercase;

    &-wrapper {
      padding: 6px 10px;
    }
  }

  &name {
    display: inline-block;
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
  margin-bottom: 32px;
  font-size: 14px;

  .text {
    overflow: hidden;
    min-width: 225px;
    max-height: 105px;
    font-weight: 600;
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
    }
  }

  .button-edit {
    align-self: flex-end;
    margin-left: 10px;
    background: none;
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
      max-width: calc(100% - 30px);
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

.data {
  flex: 1 0 auto;
  width: 100%;

  &-top {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }
}

.year-select {
  width: 114px;
  height: 40px;
}

.sorting {
  margin-left: 24px;
  line-height: 40px;

  .button {
    background: none;
    color: var(--color-accent);
    font-size: 16px;
    font-weight: 400;

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

  &.isHidden {
    &::after {
      content: "🙈";
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      align-items: center;
      justify-content: center;
      transition:
        opacity 0.3s,
        visibility 0.3s;
      background: rgba($color: #432fd8, $alpha: 0.4);
      font-size: 64px;
    }
  }

  &.isFullyHidden {
    &::after {
      content: "👮‍♂️🙈👮‍♂️";
      display: flex;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      align-items: center;
      justify-content: center;
      transition:
        opacity 0.3s,
        visibility 0.3s;
      background: rgba($color: #432fd8, $alpha: 0.4);
      font-size: 48px;
    }
  }

  &:hover {
    &::after {
      opacity: 0;
      visibility: hidden;
    }
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
  display: flex;
  align-items: center;
  justify-content: center;
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
  .user-bg-wrapper {
    height: 220px;
    padding: 12px 0;

    .buttons-wrapper {
      bottom: -34px;
    }
  }

  .user-bg {
    height: 220px;
  }

  .top {
    position: relative;
    flex-direction: column-reverse;
  }

  .user .name {
    font-size: 24px;
  }

  .description {
    .text {
      max-height: 85px;
    }

    &.isEditableAbout .text {
      max-height: 265px;
    }
  }

  .sorting {
    margin-left: auto;
    padding-left: 10px;
  }

  .show-on-map {
    padding-left: 10px;
  }

  .go-to-map {
    top: 16px;
  }
}
</style>
