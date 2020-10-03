<script>
import { fly } from "svelte/transition";
import {
  CATEGORIES,
  categoriesOrdered,
  EMPTY_YEAR_STRING,
  MIN_YEAR,
  STATUSES,
  statusesOrdered,
  USER_TYPES,
} from "../constants";
import { markerWithPhoto } from "../mapUtils/icons";
import { selectedYear, userType } from "../store";
import { getCurrentYear, isMobile, isYearLike, validateYear } from "../utils";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormRadioButton from "./elements/FormRadioButton.svelte";
import FormTextArea from "./elements/FormTextArea.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";

export let onCancel;
export let marker;
export let quitAddSpot;

let artist = "";
let crew = "";
let year = "";
let yearErrorMessage = "";
let prevYearValue = "";
let selectedStatus = STATUSES.live;
let imageFile;
let imageFilePreview = "";
let imageError = "";
let linkToVideo = "";
let description = "";
let selectedCategory = CATEGORIES.walls;
let sprayPaintUsed = "";
let sprayPaintUsedError = "";
let link = "";
let isSubmitDisabled = false;
let userTypeValue;
let selectedYearValue;
const currentYear = getCurrentYear();
userType.subscribe((value) => (userTypeValue = value));
selectedYear.subscribe((value) => (selectedYearValue = value));

let spraysStub = [
  { id: 1, text: `Spray 1` },
  { id: 2, text: `Spray 2` },
  { id: 3, text: `Spray 3` },
];

const onChangeImage = () => {
  console.log("imageFile", imageFile);
  const file = imageFile[0];
  if (file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      imageFilePreview = e.target.result;
    };

    if (file.size < 5242880) {
      imageError = "";
      reader.readAsDataURL(file);
    } else {
      imageError = "File size must be less than 5 MB";
    }
  }
};

const validateYearInput = () => {
  if (!year) {
    yearErrorMessage = "";
  } else if (!validateYear(year, false)) {
    yearErrorMessage = `Year is not in range of ${MIN_YEAR} - ${currentYear}`;
  } else {
    yearErrorMessage = "";
  }
};

const validateImage = () => {
  imageError = imageError || !imageFile ? "Please upload image" : "";
};

const validateFirm = () => {
  if (userTypeValue === USER_TYPES.artist) {
    sprayPaintUsedError = !sprayPaintUsed
      ? "Please select spray paint used"
      : "";
  }
};

const validate = () => {
  validateYearInput();
  validateImage();
  validateFirm();
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
    isSubmitDisabled = !!yearErrorMessage;
  }
};

const handleSubmit = () => {
  validate();
  if (!yearErrorMessage && !imageError && !sprayPaintUsedError) {
    if (
      selectedYearValue === year ||
      (!year && selectedYearValue === EMPTY_YEAR_STRING)
    ) {
      marker.setIcon(markerWithPhoto(imageFilePreview));
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
      quitAddSpot();
    } else {
      onCancel();
    }
  } else {
    isSubmitDisabled = true;
  }
};
</script>

<div
  class="add-spot"
  transition:fly={{ x: !isMobile() ? 364 : window.innerWidth, duration: 300 }}>
  <h2>Add Spot</h2>
  {#if isMobile()}<button class="close-mob" on:click={onCancel} />{/if}
  <form on:submit|preventDefault={handleSubmit}>
    <FormTextInput placeholder="Artist Name" bind:value={artist} />
    <FormTextInput placeholder="Crew Name" bind:value={crew} />
    <FormTextInput
      placeholder="Year"
      bind:value={year}
      hint={`${MIN_YEAR} - ${currentYear}`}
      on:blur={handleYearBlur}
      on:input={handleYearChange}
      errorText={yearErrorMessage} />
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
        <label for="upload-image" class="first_upload"><span>Add Image</span><span>Max
            5 Mb</span></label>
      {/if}
      {#if imageError}<span class="error">{imageError}</span>{/if}
      <input
        accept="image/png, image/jpeg"
        bind:files={imageFile}
        on:change={onChangeImage}
        id="upload-image"
        type="file" />
    </div>
    <FormTextInput label="Link To Video" bind:value={linkToVideo} />
    <FormTextArea
      placeholder="Description"
      bind:value={description}
      height={84} />
    <div class="category">
      {#each categoriesOrdered as category}
        <FormRadioButton
          id={`category-${category.toLowerCase()}`}
          bind:group={selectedCategory}
          value={category}
          label={category} />
      {/each}
    </div>
    {#if userTypeValue === USER_TYPES.artist}
      <div class="spray">
        <select bind:value={sprayPaintUsed}>
          <option value="" disabled hidden>Spray Paint Used</option>
          {#each spraysStub as spray}
            <option value={spray}>{spray.text}</option>
          {/each}
        </select>
        {#if sprayPaintUsedError}
          <span class="error">{sprayPaintUsedError}</span>
        {/if}
      </div>
    {/if}
    <FormTextInput label="Link To Work" bind:value={link} />
    <div class="button_wrap">
      <ButtonPrimary
        text="Post Spot"
        type="submit"
        isDisabled={isSubmitDisabled} />
    </div>
    <button type="button" class="cancel" on:click={onCancel}>Cancel</button>
  </form>
</div>

<style lang="scss">
.add-spot {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 364px;
  padding: 36px 20px 16px;
  overflow-y: auto;
  background-color: var(--color-light);
}

h2 {
  margin-bottom: 12px;
  color: var(--color-dark);
  font-size: 24px;
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
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    pointer-events: none;
    width: 8px;
    height: 5px;
    background: url(../../images//triangle-down.svg);
  }
}
select {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--color-dark);
  background: var(--color-light);
  padding: 10px 0;
  appearance: none;
  cursor: pointer;
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

@media (max-width: 767px) {
  .add-spot {
    width: 100%;
  }
  .close-mob {
    display: block;
    position: absolute;
    top: 30px;
    right: 14px;
    width: 34px;
    height: 34px;
    border: 0;
    background: url(../../images/close-cross.svg);
    cursor: pointer;
  }
}
</style>
