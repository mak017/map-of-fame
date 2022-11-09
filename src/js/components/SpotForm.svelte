<script>
import watermark from "watermarkjs";
import { reduceFileSize } from "./../utils/imageUtils.js";
import FormTelInput from "./elements/FormTelInput.svelte";
import { addWatermark } from "./../utils/addWatermark.js";
import { createSpot, getUserCategories, updateSpot } from "./../api/spot";
import {
  EMPTY_YEAR_STRING,
  ERROR_MESSAGES,
  MAX_IMAGE_FILE_SIZE,
  STATUSES,
  statusesOrdered,
  USER_TYPES,
} from "../constants";
import {
  firms,
  isSearchResults,
  markersStore,
  selectedArtist,
  selectedCrew,
  selectedUserProfileData,
  selectedYear,
  settings,
  shouldShowAddSpot,
  userCategories,
  userData,
} from "../store";
import {
  getCurrentYear,
  isEmpty,
  isValidHttpUrl,
  isYearLike,
  loadFromLocalStorage,
  validateVideoLink,
} from "../utils/commonUtils";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormRadioButton from "./elements/FormRadioButton.svelte";
import FormTextArea from "./elements/FormTextArea.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";
import CustomSelect from "./elements/CustomSelect.svelte";
import { validateYear } from "../utils/datesUtils";
import { getFirmsRequest } from "../api/settings";
import { requestSpots } from "../init.js";
import Spinner from "./elements/Spinner.svelte";
import { requestSearchSpots } from "../api/search.js";

export let onSubmit = undefined;
export let marker = null;
export let editSpotData = {};

const isEditSpot = !!editSpotData.img;

const isArtist = () => $userData.type === USER_TYPES.artist.toLowerCase();
const isCrew = () => $userData.type === USER_TYPES.crew.toLowerCase();
const isHunter = () => $userData.type === USER_TYPES.hunter.toLowerCase();

const getInitialYear = () => {
  if (editSpotData.year) {
    return `${editSpotData.year}`;
  }

  if (validateYear($selectedYear, $settings.yearStart)) {
    return $selectedYear;
  }

  return "";
};

let year = getInitialYear();
let prevYearValue = "";
let selectedStatus = editSpotData.spotStatus || STATUSES.live;
let imageFile;
let imageFilePreview = editSpotData.img || "";
let imageBlob;
let linkToVideo = editSpotData.videoLink || "";
let description = editSpotData.description || "";
let selectedCategory = null;
let sprayPaintUsed;
let link = editSpotData.link || "";
let isSubmitDisabled = false;
let isInProgress = false;
let errors = {
  year: "",
  imageFile: "",
  linkToVideo: "",
  sprayPaintUsed: "",
  link: "",
  artistCrewPairs: "",
};
const editArtistCrewPairs = editSpotData.artistCrew?.map((data) => ({
  artist: data.artist?.name ?? "",
  crew: data.crew?.name ?? "",
}));
let artistCrewPairs =
  editArtistCrewPairs?.length > 0
    ? editArtistCrewPairs
    : [
        {
          artist: isArtist() ? $userData.name ?? "" : "",
          crew: isArtist() || isCrew() ? $userData.crew ?? "" : "",
        },
      ];
const currentYear = getCurrentYear();
const token = loadFromLocalStorage("token") || null;

const isFormHasErrors = () => Object.values(errors).some((err) => !!err);

$: isSubmitDisabled =
  Object.values(errors).some((err) => !!err) || isInProgress;

const getInitialCategory = (categories) =>
  isEditSpot
    ? categories.find((cat) => cat.id === editSpotData.categoryId)
    : categories[0];

const hasCategories = () =>
  Array.isArray($userCategories) && $userCategories.length;

const hasSprays = () => Array.isArray($firms) && $firms.length;

if (!hasCategories()) {
  getUserCategories(token).then((response) => {
    const { success, result } = response;
    if (success && result) {
      userCategories.set(result);
      if (!selectedCategory) {
        selectedCategory = getInitialCategory(result);
      }
    }
  });
} else {
  selectedCategory = getInitialCategory($userCategories);
}

if (!isEditSpot && !isHunter() && !hasSprays()) {
  getFirmsRequest(token).then((response) => {
    const { success, result } = response;
    if (success && result) {
      firms.set(result);
    }
  });
}

const onChangeImage = () => {
  const file = imageFile[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const image = new Image();
      image.src = e.target.result;
      image.onload = function () {
        watermark([file], { type: "image/jpeg" })
          .blob((img) => addWatermark(img, $userData.name ?? $userData.crew))
          .then((blob) => {
            imageBlob = new File([blob], "image.jpg");
            console.debug("imageBlob.size", imageBlob.size >> 10, "KB");
            if (imageBlob.size > MAX_IMAGE_FILE_SIZE) {
              reduceFileSize(
                imageBlob,
                MAX_IMAGE_FILE_SIZE,
                4200,
                4200,
                0.8,
                (blob) => {
                  imageBlob = new File([blob], "image.jpg");
                }
              );
            }
            imageFilePreview = URL.createObjectURL(imageBlob);
          });
      };
    };

    if (file.size < MAX_IMAGE_FILE_SIZE * 6) {
      errors.imageFile = "";
      reader.readAsDataURL(file);
    } else {
      errors.imageFile = ERROR_MESSAGES.fileTooLarge;
    }
  }
};

const validateYearInput = () => {
  const isAllowedAllYears = !isArtist() && !isHunter();
  let additionalYears = [];

  if (isAllowedAllYears && $settings.additionalYears) {
    additionalYears = JSON.parse($settings.additionalYears);
  }

  if (!year) {
    errors.year = "";
  } else if (!validateYear(year, $settings.yearStart, additionalYears)) {
    errors.year = ERROR_MESSAGES.yearNotInRange($settings.yearStart);
  } else {
    errors.year = "";
  }
};

const validateImage = () => {
  errors.imageFile =
    errors.imageFile || !imageFilePreview ? ERROR_MESSAGES.fileEmpty : "";
};

const validateFirm = () => {
  if (!isHunter() && !isEditSpot) {
    errors.sprayPaintUsed = !sprayPaintUsed ? ERROR_MESSAGES.sprayEmpty : "";
  }
};

const validateVideoLinkInput = () => {
  errors.linkToVideo =
    validateVideoLink(linkToVideo) || !linkToVideo
      ? ""
      : ERROR_MESSAGES.videoLinkInvalid;
};

const validateLink = () => {
  errors.link = isValidHttpUrl(link) || !link ? "" : ERROR_MESSAGES.linkInvalid;
};

const validate = () => {
  validateYearInput();
  validateImage();
  validateFirm();
  validateVideoLinkInput();
  validateLink();
};

const handleYearChange = () => {
  if (isYearLike(year)) {
    prevYearValue = year;
  } else {
    year = prevYearValue;
  }
  if (isSubmitDisabled || isFormHasErrors()) {
    errors.year = "";
  }
};

const handleVideoLinkChange = () => {
  if (isSubmitDisabled || isFormHasErrors()) {
    errors.linkToVideo = "";
  }
};

const handleSpraySelect = () => {
  if (isSubmitDisabled || isFormHasErrors()) {
    errors.sprayPaintUsed = "";
  }
};

const handleLinkChange = () => {
  if (isSubmitDisabled || isFormHasErrors()) {
    errors.link = "";
  }
};

const isSelectedArtistCrew = () =>
  artistCrewPairs.some(
    (pair) => pair.artist === $selectedArtist && pair.crew === $selectedCrew
  );

const handleSubmit = () => {
  validate();
  if (
    !errors.year &&
    !errors.imageFile &&
    !errors.sprayPaintUsed &&
    !errors.linkToVideo &&
    !errors.link
  ) {
    const token = loadFromLocalStorage("token") || null;
    isInProgress = true;
    if (!isEditSpot) {
      const markerCoords = marker.getLatLng();
      const { lat, lng } = markerCoords;
      const requestObject = {
        lat,
        lng,
        year,
        spotStatus: selectedStatus,
        img: imageBlob,
        videoLink: linkToVideo,
        description,
        categoryId: selectedCategory.id,
        link,
        artistsCrews: artistCrewPairs,
      };
      if (sprayPaintUsed) requestObject.firmId = sprayPaintUsed.id;
      marker.dragging.disable();
      createSpot(token, requestObject).then((response) => {
        const { success, result, errors: error } = response;
        isInProgress = false;
        if (success && result) {
          if (
            ($selectedYear === year ||
              (!year && $selectedYear === EMPTY_YEAR_STRING)) &&
            !$selectedUserProfileData.id
          ) {
            if (!$isSearchResults) {
              requestSpots($selectedYear);
            } else if (isSelectedArtistCrew()) {
              requestSearchSpots({
                artist: $selectedArtist,
                crew: $selectedCrew,
                year: $selectedYear,
              }).then((response) => {
                const { success, result } = response;
                if (success && result) {
                  markersStore.set(result);
                }
              });
            }
          }
          onCancel();
        }
        if (error && !isEmpty(error)) {
          if (error?.img) {
            errors.imageFile = error.img[0] || "";
            imageFilePreview = "";
          }
          marker.dragging.enable();
        }
      });
    } else {
      updateSpot(token, editSpotData.id, {
        year,
        spotStatus: selectedStatus,
        img: imageBlob,
        videoLink: linkToVideo,
        description,
        categoryId: selectedCategory.id,
        link,
        artistsCrews: artistCrewPairs,
      }).then((response) => {
        const { success, result } = response;
        isInProgress = false;
        if (success && result) {
          onSubmit();
          onCancel();
        }
      });
    }
  }
};

const getOptionLabel = (option) => option.name;
const getSelectionLabel = (option) => {
  if (option) return option.name;
};

const handleAddMoreClick = () => {
  artistCrewPairs = [...artistCrewPairs, { artist: "", crew: "" }];
};
</script>

<form class:edit={isEditSpot} on:submit|preventDefault={handleSubmit}>
  {#if isEditSpot}
    <div class="save">
      <ButtonPrimary
        text="Save"
        type="submit"
        isDisabled={isSubmitDisabled}
        className="add-spot" />
    </div>
  {/if}
  <div class="artists-area">
    {#each artistCrewPairs as pair}
      <div class="artist-crew-pair">
        <FormTextInput
          placeholder="Artist Name"
          bind:value={pair.artist}
          wideOnMobile
          editSpot={isEditSpot}
          addSpot={!isEditSpot} />
        <FormTextInput
          placeholder="Crew Name"
          bind:value={pair.crew}
          wideOnMobile
          editSpot={isEditSpot}
          addSpot={!isEditSpot} />
      </div>
    {/each}
    {#if artistCrewPairs.length < 5}
      <button
        type="button"
        class="button btn-add-more"
        on:click={handleAddMoreClick}>Add more</button>
    {/if}
  </div>
  <FormTelInput
    placeholder="Year"
    bind:value={year}
    hint={`${$settings.yearStart} - ${currentYear}`}
    on:input={handleYearChange}
    errorText={errors.year}
    wideOnMobile
    editSpot={isEditSpot}
    addSpot={!isEditSpot} />
  <div class="status">
    {#each statusesOrdered as status}
      <FormRadioButton
        id={`status-${status.toLowerCase()}`}
        bind:group={selectedStatus}
        value={status}
        label={status}
        className={!isEditSpot ? "addSpot" : ""} />
    {/each}
  </div>
  <div class="upload-image">
    {#if imageFilePreview}
      <img src={imageFilePreview} alt="Preview" class="preview_image" />
      <label for="upload-image" class="re-upload" />
    {:else}
      <label for="upload-image" class="first_upload">
        <span>Add Image</span>
        <span>Max 10 Mb</span>
      </label>
    {/if}
    {#if errors.imageFile}<span class="error">{errors.imageFile}</span>{/if}
    <input
      accept="image/png, image/jpeg"
      bind:files={imageFile}
      on:change={onChangeImage}
      id="upload-image"
      type="file" />
  </div>
  <FormTextInput
    label="Link To Video"
    bind:value={linkToVideo}
    errorText={errors.linkToVideo}
    on:input={handleVideoLinkChange}
    wideOnMobile
    editSpot={isEditSpot}
    addSpot={!isEditSpot}
    link />
  <div class="description">
    <FormTextArea
      placeholder="Description"
      bind:value={description}
      height={84}
      isResizable={isEditSpot}
      addSpot={!isEditSpot} />
  </div>
  <div class="category">
    {#if $userCategories.length > 0}
      {#each $userCategories as category}
        <FormRadioButton
          id={category.id}
          bind:group={selectedCategory}
          value={category}
          label={category.name}
          className={!isEditSpot ? "addSpot" : ""} />
      {/each}
    {:else}
      <Spinner height={30} margin="5px 0 5.5px" />
    {/if}
  </div>
  {#if !isHunter() && !isEditSpot}
    <div class="spray" class:with-error={errors.sprayPaintUsed}>
      <CustomSelect
        items={$firms}
        bind:selectedValue={sprayPaintUsed}
        on:select={handleSpraySelect}
        placeholder="Spray Paint Used"
        optionIdentifier="name"
        addSpot={!isEditSpot}
        {getOptionLabel}
        {getSelectionLabel} />
      {#if errors.sprayPaintUsed}
        <span class="error">{errors.sprayPaintUsed}</span>
      {/if}
    </div>
  {/if}
  <div class="link-to-work">
    <FormTextInput
      label="Link To Work"
      bind:value={link}
      on:input={handleLinkChange}
      wideOnMobile
      errorText={errors.link}
      editSpot={isEditSpot}
      addSpot={!isEditSpot}
      link />
  </div>
  {#if !editSpotData.img}
    <div class="button_wrap">
      <ButtonPrimary
        text="Post Art"
        type="submit"
        isDisabled={isSubmitDisabled}
        className={!isEditSpot ? "addSpot" : ""} />
    </div>
    <button
      type="button"
      class="cancel"
      on:click={() => shouldShowAddSpot.set(false)}
      disabled={isInProgress}>Cancel</button>
  {/if}
</form>

<style lang="scss">
form {
  display: flex;
  flex-direction: column;
}

.artists-area {
  display: flex;
  flex-direction: column;
}

.artist-crew-pair + .artist-crew-pair {
  margin-top: 18px;
}
.btn-add-more {
  display: inline-flex;
  margin-left: auto;
  padding: 4px 0;
  background-color: var(--color-light);
  color: var(--color-accent);
  font-size: 14px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
}

.status,
.category {
  display: flex;
}

.upload-image {
  position: relative;
  height: 136px;
  margin: 15px 0;

  .first_upload {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 0;
    border: 1px dashed rgba($color: #393940, $alpha: 0.4);
    border-radius: 2px;
    cursor: pointer;

    span {
      color: var(--color-dark);
      line-height: 1.22;

      &:first-child {
        font-size: 18px;
        font-weight: 600;
      }

      &:last-child {
        font-size: 11px;
      }
    }
  }

  input {
    position: absolute;
    left: -9999px;
    clip: rect(0 0 0 0);
    opacity: 0;
  }

  .preview_image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .re-upload {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transition: opaicty 0.3s;
    opacity: 0;
    background: rgba(0, 0, 0, 0.45);
    cursor: pointer;

    &:hover {
      opacity: 1;
    }

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    &::before {
      width: 68px;
      height: 68px;
      background-color: var(--color-accent);
    }

    &::after {
      width: 24px;
      height: 24px;
      background: url(../../images/re-upload.svg);
    }
  }
}

.error {
  color: var(--color-error);
  font-size: 13px;
}

.category {
  margin-bottom: 15px;
}

.spray {
  position: relative;
  margin-bottom: 15px;

  &.with-error {
    margin: 0;
  }

  .error {
    display: block;
    margin-top: 1px;
    line-height: 1.1;
  }
}

.button_wrap {
  display: flex;
  margin-bottom: 12px;
}

.cancel {
  width: 100%;
  padding: 12px 0;
  border: 0;
  border-radius: 2px;
  background-color: var(--color-light);
  color: var(--color-accent);
  font-size: 14px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.edit {
  display: grid;
  position: relative;
  grid-column-gap: 4%;
  grid-template-columns: 28% 28% 36%;

  .save {
    display: flex;
    position: absolute;
    top: -150px;
    right: 0;
    min-width: 122px;
  }

  .artists-area {
    grid-column: 1/3;
    grid-row: 5/10;
    margin-top: -9px;
  }

  .artist-crew-pair {
    display: grid;
    grid-template-columns: 47.15% 47.15%;
    grid-column-gap: 5.7%;

    + .artist-crew-pair {
      margin-top: 4px;
    }
  }

  .status {
    grid-column: 3;
    grid-row: 1;
    height: 40px;
  }

  .upload-image {
    grid-column: 1/3;
    grid-row: 1/5;
    height: 330px;
    margin: 0 0 24px;
    overflow: hidden;
    border-radius: 2px;
  }

  .description {
    grid-column: 3;
    grid-row: 6;
    margin-top: 24px;
  }

  .category {
    grid-column: 3;
    grid-row: 5;
    height: 40px;
    margin-bottom: 10px;
  }

  .link-to-work {
    grid-column: 3;
    grid-row: 3;
  }
}

@media (max-width: 767px) {
  .edit {
    display: flex;
    flex-direction: column;

    .save {
      position: static;
      order: 20;
    }

    .upload-image {
      height: 140px;
      margin-top: 18px;
    }
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  form {
    &:not(.edit) {
      .upload-image {
        height: 100px;
        margin: 12px 0;
      }

      .category {
        margin-bottom: 12px;
      }

      .button_wrap {
        margin-bottom: 10px;
      }

      .cancel {
        padding: 10px 0;
      }

      .error {
        font-size: 11px;
      }

      .spray {
        &.with-error {
          margin-bottom: 2px;
        }
      }
    }
  }
}
</style>
