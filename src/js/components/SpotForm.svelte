<script>
import { requestSearchSpots } from "../api/search.js";
import { getFirmsRequest } from "../api/settings";
import { createSpot, getUserCategories, updateSpot } from "./../api/spot";
import {
  getCurrentYear,
  isEmpty,
  isValidHttpUrl,
  isYearLike,
  loadFromLocalStorage,
  validateVideoLink,
} from "../utils/commonUtils";
import { validateYear } from "../utils/datesUtils";
import { processImage } from "./../utils/imageUtils.js";
import { requestSpots } from "../init.js";
import {
  firms,
  isSearchResults,
  map,
  markersStore,
  selectedArtist,
  selectedCrew,
  selectedYear,
  settings,
  shouldShowAddSpot,
  userCategories,
  userData,
} from "../store";

import FormTelInput from "./elements/FormTelInput.svelte";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormRadioButton from "./elements/FormRadioButton.svelte";
import FormTextArea from "./elements/FormTextArea.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";
import CustomSelect from "./elements/CustomSelect.svelte";
import Spinner from "./elements/Spinner.svelte";

import {
  EMPTY_YEAR_STRING,
  ERROR_MESSAGES,
  MAX_IMAGE_FILE_SIZE,
  STATUSES,
  statusesOrdered,
  USER_TYPES,
} from "../constants";
import { permalink } from "../utils/mapUtils/permalink.js";

export let marker = null;
export let editSpotData = {};
export let onCancel;

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

const currentYear = getCurrentYear();
let year = getInitialYear();
let prevYearValue = "";
let selectedStatus =
  editSpotData.spotStatus ??
  (currentYear - +year > 10 ? STATUSES.buffed : STATUSES.live);
let image = {
  file: undefined,
  filePreview: editSpotData.img || "",
  blob: undefined,
};
let image2 = {
  file: undefined,
  filePreview: editSpotData.additionalImg || "",
  blob: undefined,
};
let sketch = {
  file: undefined,
  filePreview: editSpotData.sketchImg || "",
  blob: undefined,
};
let linkToVideo = editSpotData.videoLink || "";
let description = editSpotData.description || "";
let selectedCategory;
let sprayPaintUsed;
let link = editSpotData.link || "";
let isSubmitDisabled = false;
let isInProgress = false;
let errors = {
  year: "",
  imageFile: "",
  linkToVideo: "",
  selectedCategory: "",
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

const token = loadFromLocalStorage("token") || null;

const isFormHasErrors = () => Object.values(errors).some((err) => !!err);

$: isSubmitDisabled =
  Object.values(errors).some((err) => !!err) || isInProgress;

const getInitialCategory = (categories) =>
  isEditSpot
    ? categories.find((cat) => cat.id === editSpotData.categoryId)
    : undefined;

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
      sprayPaintUsed = result.find((firm) => firm.isDefault)?.id || undefined;
    }
  });
}

const onChangeImage = (imageType) => {
  let imageObject = { ...image };
  if (imageType === "image2") {
    imageObject = { ...image2 };
  }

  if (imageType === "sketch") {
    imageObject = { ...sketch };
  }

  const file = imageObject.file[0];
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

              if (imageType === "image") {
                image = { ...imageObject };
              }

              if (imageType === "image2") {
                image2 = { ...imageObject };
              }

              if (imageType === "sketch") {
                sketch = { ...imageObject };
              }
            }
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

              if (imageType === "image") {
                image = { ...imageObject };
              }

              if (imageType === "image2") {
                image2 = { ...imageObject };
              }

              if (imageType === "sketch") {
                sketch = { ...imageObject };
              }
            }
          );
        }
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

const onRemoveImage = (imageType) => {
  if (imageType === "image2") {
    image2 = {
      file: undefined,
      filePreview: "",
      blob: undefined,
    };
  }

  if (imageType === "sketch") {
    sketch = {
      file: undefined,
      filePreview: "",
      blob: undefined,
    };
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
    errors.imageFile || !image.filePreview ? ERROR_MESSAGES.fileEmpty : "";
};

const validateCategory = () => {
  errors.selectedCategory = !selectedCategory
    ? ERROR_MESSAGES.categoryEmpty
    : "";
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
  validateCategory();
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

const handleCategorySelect = () => {
  if (isSubmitDisabled || isFormHasErrors()) {
    errors.selectedCategory = "";
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
    !errors.selectedCategory &&
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
        img: image.blob,
        additionalImg: image2.blob,
        sketch: sketch.blob,
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
          const yearForRequest = year || EMPTY_YEAR_STRING;

          selectedYear.set(yearForRequest);
          if (!$isSearchResults) {
            requestSpots($selectedYear);
            permalink.update({ mapContainer: $map });
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
        img: image.blob,
        additionalImg: image2.blob,
        sketch: sketch.blob,
        videoLink: linkToVideo,
        description,
        categoryId: selectedCategory.id,
        link,
        artistsCrews: artistCrewPairs,
      }).then((response) => {
        const { success, result } = response;
        isInProgress = false;
        if (success && result) {
          onCancel();
        }
      });
    }
  }
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
  <div class="upload-area">
    <div class="upload-image">
      {#if image.filePreview}
        <img src={image.filePreview} alt="Preview" class="preview_image" />
        <label for="upload-image" class="re-upload" />
      {:else}
        <label for="upload-image" class="first_upload">
          <span>Add Image (1 of 2)</span>
          <span>Max 10 Mb</span>
        </label>
      {/if}
      {#if errors.imageFile}<span class="error">{errors.imageFile}</span>{/if}
      <input
        accept="image/png, image/jpeg"
        bind:files={image.file}
        on:change={() => onChangeImage("image")}
        id="upload-image"
        type="file" />
    </div>
    {#if image.filePreview}
      <div class="upload-image upload-image2">
        {#if image2.filePreview}
          <img src={image2.filePreview} alt="Preview" class="preview_image" />
          <label for="upload-image2" class="re-upload" />
          <button
            type="button"
            class="button delete"
            on:click={() => onRemoveImage("image2")} />
        {:else}
          <label for="upload-image2" class="first_upload">
            <span>Add Image (2 of 2)</span>
            <span>Max 10 Mb</span>
          </label>
        {/if}
        {#if errors.imageFile}<span class="error">{errors.imageFile}</span>{/if}
        <input
          accept="image/png, image/jpeg"
          bind:files={image2.file}
          on:change={() => onChangeImage("image2")}
          id="upload-image2"
          type="file" />
      </div>
    {/if}
    <!-- <div class="upload-image upload-sketch">
      {#if sketch.filePreview}
        <img src={sketch.filePreview} alt="Preview" class="preview_image" />
        <label for="upload-sketch" class="re-upload" />
        <button
          type="button"
          class="button delete"
          on:click={() => onRemoveImage("sketch")} />
      {:else}
        <label for="upload-sketch" class="first_upload">
          <span>Add Sketch</span>
          <span>Max 10 Mb</span>
        </label>
      {/if}
      {#if errors.imageFile}<span class="error">{errors.imageFile}</span>{/if}
      <input
        accept="image/png, image/jpeg"
        bind:files={sketch.file}
        on:change={() => onChangeImage("sketch")}
        id="upload-sketch"
        type="file" />
    </div> -->
  </div>
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
      <CustomSelect
        items={$userCategories}
        bind:selectedValue={selectedCategory}
        on:select={handleCategorySelect}
        placeholder="Art Category"
        optionIdentifier="name"
        addSpot={!isEditSpot}
        label="name" />
    {:else}
      <Spinner height={30} margin="5px 0 5.5px" />
    {/if}
  </div>
  <!-- {#if !isHunter() && !isEditSpot}
    <div class="spray">
      <CustomSelect
        items={$firms}
        bind:selectedValue={sprayPaintUsed}
        placeholder="Spray Paint Used"
        optionIdentifier="name"
        addSpot={!isEditSpot}
        label="name" />
    </div>
  {/if} -->
  <div class="link-to-video">
    <FormTextInput
      label="Link To Video"
      bind:value={linkToVideo}
      errorText={errors.linkToVideo}
      on:input={handleVideoLinkChange}
      wideOnMobile
      editSpot={isEditSpot}
      addSpot={!isEditSpot} />
  </div>
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

.status {
  display: flex;
}

.upload-image {
  position: relative;
  max-height: 136px;
  margin: 15px 0 8px;

  &.upload-image2 {
    margin: 0 0 8px;
  }

  /* &.upload-sketch {
    margin: 0 0 15px;
  } */

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
    height: 136px;
    object-fit: cover;
  }

  .re-upload {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transition: opacity 0.3s;
    opacity: 0;
    background: rgba(0, 0, 0, 0.45);
    cursor: pointer;

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 54px;
      height: 54px;
      transform: translate(-50%, -50%);
      background-color: var(--color-accent);
      background-image: url(../../images/re-upload.svg);
      background-size: 24px 24px;
      background-repeat: no-repeat;
      background-position: 50% 50%;
    }
  }

  .delete {
    display: none;
    position: absolute;
    top: 50%;
    right: calc(35% - 27px);
    width: 54px;
    height: 54px;
    transform: translateY(-50%);
    background-color: var(--color-accent);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-image: url(../../images/trash.svg);
    background-size: 14px 18px;
  }

  &:hover {
    .re-upload {
      opacity: 1;
    }

    .delete {
      display: block;
    }
  }
}

.upload-image2 {
  /* .upload-sketch { */
  .re-upload {
    &::before {
      left: calc(35% - 27px);
      transform: translateY(-50%);
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

/* .spray {
  position: relative;
  margin-bottom: 15px;
} */

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
  grid-gap: 12px 4%;
  grid-template-columns: 28% 28% 36%;

  .save {
    display: flex;
    position: absolute;
    top: -150px;
    right: 0;
    min-width: 122px;
  }

  .artists-area {
    grid-column: 3;
    grid-row: 6;
  }

  .artist-crew-pair {
    + .artist-crew-pair {
      margin-top: 4px;
    }
  }

  .status {
    grid-column: 3;
    grid-row: 1;
    height: 40px;
  }

  .upload-area {
    grid-column: 1/3;
    grid-row: 1/9;
  }

  .upload-image {
    max-height: 332px;
    margin: 0 0 16px;
    overflow: hidden;
    border-radius: 2px;

    .preview_image {
      height: 100%;
    }
  }

  .description {
    grid-column: 3;
    grid-row: auto;
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

  .link-to-video {
    grid-column: 3;
    grid-row: 4;
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
      max-height: 140px;
      margin-top: 18px;
    }

    .description {
      margin-top: 0;
    }
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  form {
    &:not(.edit) {
      .upload-image {
        max-height: 100px;
        margin: 12px 0;
      }

      .preview_image {
        height: 100px;
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

      /* .spray {
        margin-bottom: 12px;
      } */
    }
  }
}
</style>
