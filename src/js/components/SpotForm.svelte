<script>
import { onDestroy } from "svelte";
import watermark from "watermarkjs";
import { createSpot } from "./../api/spot";
import {
  EMPTY_YEAR_STRING,
  ERROR_MESSAGES,
  STATUSES,
  statusesOrdered,
  USER_TYPES,
} from "../constants";
import { markerWithPhoto } from "../utils/mapUtils/icons";
import { categories, firms, selectedYear, settings, userData } from "../store";
import {
  getCurrentYear,
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
import { getCategories, getFirmsRequest } from "../api/settings";

export let onCancel;
export let onSubmit = () => {};
export let marker = null;
export let editSpotData = {};

const isEditSpot = !!editSpotData.img;

let artist = editSpotData.artist || "";
let crew = editSpotData.crew || "";
let year = editSpotData.year ? `${editSpotData.year}` : "";
let prevYearValue = "";
let selectedStatus = editSpotData.status || STATUSES.live;
let imageFile;
let imageFilePreview = editSpotData.img || "";
let linkToVideo = editSpotData.linkToVideo || "";
let description = editSpotData.description || "";
let selectedCategory = editSpotData.category || null;
let sprayPaintUsed;
let link = editSpotData.linkToWork || "";
let isSubmitDisabled = false;
let isInProgress = false;
let userTypeValue;
let settingsValue;
let sprayFirms;
let categoriesList;
let errors = {
  year: "",
  imageFile: "",
  linkToVideo: "",
  sprayPaintUsed: "",
  link: "",
};
const currentYear = getCurrentYear();
const token = loadFromLocalStorage("token") || null;

const unsubscribeUserData = userData.subscribe(
  (value) => (userTypeValue = value.type)
);

const unsubscribeSettings = settings.subscribe(
  (value) => (settingsValue = value)
);

const unsubscribeFirms = firms.subscribe((value) => (sprayFirms = value));

const unsubscribeCategories = categories.subscribe(
  (value) => (categoriesList = value)
);

onDestroy(() => {
  unsubscribeUserData();
  unsubscribeSettings();
  unsubscribeFirms();
  unsubscribeCategories();
});

const isFormHasErrors = () => Object.values(errors).some((err) => !!err);

$: isSubmitDisabled =
  Object.values(errors).some((err) => !!err) || isInProgress;

const hasCategories = () =>
  Array.isArray(categoriesList) && categoriesList.length;

const hasSprays = () => Array.isArray(sprayFirms) && sprayFirms.length;

if (!hasCategories()) {
  getCategories().then((response) => {
    const { status, data } = response;
    if (status && data) {
      categories.set(data);
      if (!selectedCategory) {
        selectedCategory = data[0];
      }
    }
  });
} else {
  selectedCategory = categoriesList[0];
}

if (userTypeValue === USER_TYPES.artist.toLowerCase() && !hasSprays()) {
  getFirmsRequest(token).then((response) => {
    const { status, data } = response;
    if (status && data) {
      firms.set(data);
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
        watermark([file])
          .dataUrl(
            watermark.text.center("MOFF", "148px Montserrat", "#fff", 0.5)
          )
          .then((url) => {
            imageFilePreview = url;
          });
      };
    };

    if (file.size < 5242880) {
      errors.imageFile = "";
      reader.readAsDataURL(file);
    } else {
      errors.imageFile = ERROR_MESSAGES.fileTooLarge;
    }
  }
};

const validateYearInput = () => {
  if (!year) {
    errors.year = "";
  } else if (!validateYear(year, settingsValue.yearStart, false)) {
    errors.year = ERROR_MESSAGES.yearNotInRange(settingsValue.yearStart);
  } else {
    errors.year = "";
  }
};

const validateImage = () => {
  errors.imageFile =
    errors.imageFile || !imageFilePreview ? ERROR_MESSAGES.fileEmpty : "";
};

const validateFirm = () => {
  if (userTypeValue === USER_TYPES.artist.toLowerCase() && !isEditSpot) {
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

const handleSubmit = () => {
  validate();
  if (
    !errors.year &&
    !errors.imageFile &&
    !errors.sprayPaintUsed &&
    !errors.linkToVideo &&
    !errors.link
  ) {
    // console.log({
    //   artist,
    //   crew,
    //   year,
    //   selectedStatus,
    //   imageFile,
    //   linkToVideo,
    //   description,
    //   selectedCategory,
    //   sprayPaintUsed,
    //   link,
    // });
    if (!isEditSpot) {
      const token = loadFromLocalStorage("token") || null;
      const markerCoords = marker.getLatLng();
      const { lat, lng } = markerCoords;
      isInProgress = true;
      marker.dragging.disable();
      createSpot(token, {
        ltd: lat,
        lng,
        artist,
        crew,
        year,
        spotStatus: selectedStatus,
        img: imageFile[0],
        videoLink: linkToVideo,
        description,
        categoryId: selectedCategory.id,
        firmId: sprayPaintUsed.id,
        link,
      }).then((response) => {
        const { status, data, error } = response;
        isInProgress = false;
        if (status && data) {
          if (
            $selectedYear === year ||
            (!year && $selectedYear === EMPTY_YEAR_STRING)
          ) {
            marker.setIcon(markerWithPhoto(imageFilePreview));
            onSubmit();
          } else {
            onCancel();
          }
        }
        if (error) {
          if (error?.img) {
            errors.imageFile = error.img[0] || "";
            imageFilePreview = "";
          }
          marker.dragging.enable();
        }
      });
    } else {
      onCancel();
    }
  }
};

const getOptionLabel = (option) => option.name;
const getSelectionLabel = (option) => {
  if (option) return option.name;
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
  <FormTextInput
    placeholder="Artist Name"
    bind:value={artist}
    wideOnMobile
    editSpot={isEditSpot}
    addSpot={!isEditSpot} />
  <FormTextInput
    placeholder="Crew Name"
    bind:value={crew}
    wideOnMobile
    editSpot={isEditSpot}
    addSpot={!isEditSpot} />
  <FormTextInput
    placeholder="Year"
    bind:value={year}
    hint={`${settingsValue.yearStart} - ${currentYear}`}
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
        <span>Max 5 Mb</span>
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
    {#each categoriesList as category}
      <FormRadioButton
        id={category.id}
        bind:group={selectedCategory}
        value={category}
        label={category.name}
        className={!isEditSpot ? "addSpot" : ""} />
    {/each}
  </div>
  {#if userTypeValue === USER_TYPES.artist.toLowerCase() && !isEditSpot}
    <div class="spray" class:with-error={errors.sprayPaintUsed}>
      <CustomSelect
        items={sprayFirms}
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
        text="Post Spot"
        type="submit"
        isDisabled={isSubmitDisabled}
        className={!isEditSpot ? "addSpot" : ""} />
    </div>
    <button
      type="button"
      class="cancel"
      on:click={onCancel}
      disabled={isInProgress}>Cancel</button>
  {/if}
</form>

<style lang="scss">
.status,
.category {
  display: flex;
  flex-wrap: wrap;
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
    opacity: 0;
    background: rgba(0, 0, 0, 0.45);
    transition: opaicty 0.3s;
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
    line-height: 1.1;
    margin-top: 1px;
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
  font-size: 18px;
  font-weight: 600;
  line-height: 1.22;
  cursor: pointer;
  &:disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

.edit {
  display: grid;
  position: relative;
  grid-template-columns: 28% 28% 36%;
  grid-column-gap: 4%;
  .save {
    display: flex;
    position: absolute;
    right: 0;
    top: -150px;
    min-width: 122px;
  }
  .status {
    grid-column: 3;
    grid-row: 1;
    height: 40px;
  }
  .upload-image {
    grid-column: 1/3;
    grid-row: 2/6;
    height: 330px;
    margin: 18px 0 24px;
    border-radius: 2px;
    overflow: hidden;
  }
  .description {
    grid-column: 1/4;
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
