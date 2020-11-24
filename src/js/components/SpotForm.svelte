<script>
import { onDestroy } from "svelte";
import watermark from "watermarkjs";
import {
  CATEGORIES,
  categoriesOrdered,
  EMPTY_YEAR_STRING,
  ERROR_MESSAGES,
  MIN_YEAR,
  STATUSES,
  statusesOrdered,
  USER_TYPES,
} from "../constants";
import { markerWithPhoto } from "../mapUtils/icons";
import { selectedYear, userData } from "../store";
import {
  getCurrentYear,
  isYearLike,
  validateVideoLink,
  validateYear,
} from "../utils";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormRadioButton from "./elements/FormRadioButton.svelte";
import FormTextArea from "./elements/FormTextArea.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";
import CustomSelect from "./elements/CustomSelect.svelte";

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
let selectedCategory = editSpotData.category || CATEGORIES.walls;
let sprayPaintUsed;
let link = editSpotData.linkToWork || "";
let isSubmitDisabled = false;
let userTypeValue;
let errors = { year: "", imageFile: "", linkToVideo: "", sprayPaintUsed: "" };
const currentYear = getCurrentYear();
const unsubscribeUserData = userData.subscribe(
  (value) => (userTypeValue = value.type)
);

onDestroy(() => unsubscribeUserData());

let spraysStub = [
  { value: 1, label: `Spray 1` },
  { value: 2, label: `Spray 2` },
  { value: 3, label: `Spray 3` },
  { value: 4, label: `Spray 4` },
  { value: 5, label: `Spray 5` },
  { value: 6, label: `Spray 6` },
  { value: 7, label: `Spray 7` },
  { value: 8, label: `Spray 8` },
  { value: 9, label: `Spray 9` },
  { value: 10, label: `Spray 10` },
  { value: 11, label: `Spray 11` },
  { value: 12, label: `Spray 12` },
  { value: 13, label: `Spray 13` },
  { value: 14, label: `Spray 14` },
  { value: 15, label: `Spray 15` },
];

const isFormHasErrors = () => Object.values(errors).some((err) => !!err);

const onChangeImage = () => {
  const file = imageFile[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const image = new Image();
      image.src = e.target.result;
      image.onload = function () {
        console.log("this :>> ", this);
        watermark([file])
          .dataUrl(
            watermark.text.center("Text", "148px Montserrat", "#fff", 0.5)
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
  console.log("year", year);
  if (!year) {
    errors.year = "";
  } else if (!validateYear(year, false)) {
    errors.year = ERROR_MESSAGES.yearNotInRange;
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

const validate = () => {
  validateYearInput();
  validateImage();
  validateFirm();
  validateVideoLinkInput();
};

const handleYearChange = () => {
  if (isYearLike(year)) {
    prevYearValue = year;
  } else {
    year = prevYearValue;
  }
};

const handleYearBlur = () => {
  if (isSubmitDisabled) {
    validateYearInput();
    isSubmitDisabled = isFormHasErrors();
  }
};

const handleVideoLinkBlur = () => {
  if (isSubmitDisabled) {
    validateVideoLinkInput();
    isSubmitDisabled = isFormHasErrors();
  }
};

const handleSpraySelectBlur = () => {
  if (isSubmitDisabled) {
    validateFirm();
    isSubmitDisabled = isFormHasErrors();
  }
};

const handleSubmit = () => {
  validate();
  console.log("errors", errors);
  if (
    !errors.year &&
    !errors.imageFile &&
    !errors.sprayPaintUsed &&
    !errors.linkToVideo
  ) {
    console.log({
      artist,
      crew,
      year,
      selectedStatus,
      imageFile,
      linkToVideo,
      description,
      selectedCategory,
      sprayPaintUsed,
      link,
    });
    if (!isEditSpot) {
      if (
        $selectedYear === year ||
        (!year && $selectedYear === EMPTY_YEAR_STRING)
      ) {
        marker.setIcon(markerWithPhoto(imageFilePreview));
        onSubmit();
      } else {
        onCancel();
      }
    } else {
      onCancel();
    }
  } else {
    isSubmitDisabled = true;
  }
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
    editSpot={isEditSpot} />
  <FormTextInput
    placeholder="Crew Name"
    bind:value={crew}
    wideOnMobile
    editSpot={isEditSpot} />
  <FormTextInput
    placeholder="Year"
    bind:value={year}
    hint={`${MIN_YEAR} - ${currentYear}`}
    on:blur={handleYearBlur}
    on:input={handleYearChange}
    errorText={errors.year}
    wideOnMobile
    editSpot={isEditSpot} />
  <div class="status">
    {#each statusesOrdered as status}
      <FormRadioButton
        id={`status-${status.toLowerCase()}`}
        bind:group={selectedStatus}
        value={status}
        label={status} />
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
    on:blur={handleVideoLinkBlur}
    wideOnMobile
    editSpot={isEditSpot} />
  <div class="description">
    <FormTextArea
      placeholder="Description"
      bind:value={description}
      height={84}
      isResizable={isEditSpot} />
  </div>
  <div class="category">
    {#each categoriesOrdered as category}
      <FormRadioButton
        id={`category-${category.toLowerCase()}`}
        bind:group={selectedCategory}
        value={category}
        label={category} />
    {/each}
  </div>
  {#if userTypeValue === USER_TYPES.artist.toLowerCase() && !isEditSpot}
    <div class="spray">
      <CustomSelect
        items={spraysStub}
        bind:selectedValue={sprayPaintUsed}
        on:select={handleSpraySelectBlur} />
      {#if errors.sprayPaintUsed}
        <span class="error">{errors.sprayPaintUsed}</span>
      {/if}
    </div>
  {/if}
  <div class="link-to-work">
    <FormTextInput
      label="Link To Work"
      bind:value={link}
      wideOnMobile
      editSpot={isEditSpot} />
  </div>
  {#if !editSpotData.img}
    <div class="button_wrap">
      <ButtonPrimary
        text="Post Spot"
        type="submit"
        isDisabled={isSubmitDisabled} />
    </div>
    <button type="button" class="cancel" on:click={onCancel}>Cancel</button>
  {/if}
</form>

<style lang="scss">
.status,
.category {
  display: flex;
}

.upload-image {
  position: relative;
  height: 140px;
  margin: 18px 0 24px;
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
}

.category {
  margin-bottom: 14px;
}

.spray {
  position: relative;
  margin-bottom: 24px;
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
</style>
