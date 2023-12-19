<script>
import { onDestroy, onMount } from "svelte";
import isEqual from "lodash.isequal";
import cloneDeep from "lodash.clonedeep";

import {
  requestSearchSpots,
  requestSearchUserByArtist,
  requestSearchUserByCrew,
} from "../api/search.js";
import { getFirmsRequest } from "../api/settings";
import {
  getUserCategories,
  publishSpotDraft,
  updateSpotDraft,
} from "./../api/spot";
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
  profileState,
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
import CustomAutoComplete from "./elements/CustomAutoComplete.svelte";
import Spinner from "./elements/Spinner.svelte";
import PlusSvg from "./elements/icons/PlusSvg.svelte";

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
  if (typeof editSpotData.year !== "undefined") {
    return editSpotData.year ? `${editSpotData.year}` : "";
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
let shouldHideInProfile =
  !editSpotData.showInProfile || editSpotData.showInProfile === "0";
let isSubmitDisabled = false;
let isInProgress = false;
let isSubmitting = false;
let isSelectingAutocomplete = false;
let isAutocompleteEmpty = true;
let errors = {
  year: "",
  imageFile: "",
  linkToVideo: "",
  selectedCategory: "",
  link: "",
  artistCrewPairs: "",
};
let progressState = {
  coords: false,
  artist1: false,
  crew1: false,
  artist2: false,
  crew2: false,
  artist3: false,
  crew3: false,
  artist4: false,
  crew4: false,
  artist5: false,
  crew5: false,
  year: false,
  selectedStatus: false,
  image: false,
  image2: false,
  sketch: false,
  description: false,
  selectedCategory: false,
  linkToVideo: false,
  link: false,
};
let savedRequestParams = {};

const editArtistCrewPairs = editSpotData.artistCrew?.map((data) => ({
  artist: data.artist?.name ?? data.artistUser?.artist?.name ?? "",
  crew: data.crew?.name ?? data.crewUser?.crew?.name ?? "",
  userArtist: data.artistUser?.id ?? "",
  userCrew: data.crewUser?.id ?? "",
  artistData: data.artistUser,
  crewData: data.crewUser,
  isTouchedArtist: false,
  isTouchedCrew: false,
}));
let artistCrewPairs =
  editArtistCrewPairs?.length > 0
    ? editArtistCrewPairs
    : [
        {
          artist: isArtist() ? $userData.artist?.name ?? "" : "",
          crew: isArtist() || isCrew() ? $userData.crew?.name ?? "" : "",
          userArtist: "",
          userCrew: "",
        },
      ];

const token = loadFromLocalStorage("token") || null;

const isFormHasErrors = () => Object.values(errors).some((err) => !!err);

$: isSubmitDisabled = Object.values(errors).some((err) => !!err);
$: isInProgress = Object.values(progressState).some((field) => field);

const getInitialCategory = (categories) =>
  isEditSpot
    ? categories.find((cat) => cat.id === Number(editSpotData.categoryId))
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

const saveDraft = async (field) => {
  const requestObject = {
    year,
    spotStatus: selectedStatus,
    videoLink: linkToVideo,
    description,
    categoryId: selectedCategory?.id ?? "",
    link,
    artistsCrews: artistCrewPairs,
  };

  if (isEditSpot) {
    requestObject.spotId = editSpotData.id;
    requestObject.showInProfile = shouldHideInProfile ? 0 : 1;
  } else {
    const markerCoords = marker.getLatLng();
    const { lat, lng } = markerCoords;
    requestObject.lat = lat;
    requestObject.lng = lng;
  }

  if (field == "image") requestObject.img = image.blob ?? "";
  if (field == "image2") requestObject.additionalImg = image2.blob ?? "";
  if (field == "sketch") requestObject.sketch = sketch.blob ?? "";
  if (sprayPaintUsed) requestObject.firmId = sprayPaintUsed.id;

  if (isEqual(requestObject, savedRequestParams)) return;

  savedRequestParams = cloneDeep(requestObject);
  progressState[field] = true;
  await updateSpotDraft(token, requestObject);
  progressState[field] = false;
};

const saveDraftCoords = () => saveDraft("coords");

onMount(() => {
  marker?.on("moveend", saveDraftCoords);
});

onDestroy(() => {
  marker?.off("moveend", saveDraftCoords);
});

const handleProcessedImage = (imageType, imageObject) => {
  if (imageType === "image") {
    image = { ...imageObject };
  }

  if (imageType === "image2") {
    image2 = { ...imageObject };
  }

  if (imageType === "sketch") {
    sketch = { ...imageObject };
  }

  saveDraft(imageType);
};

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
              handleProcessedImage(imageType, imageObject, blob);
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
              handleProcessedImage(imageType, imageObject, blob, isRotated);
            },
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

  saveDraft(imageType);
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
    ? ERROR_MESSAGES.categorySingleEmpty
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

  saveDraft("selectedCategory");
};

const handleLinkChange = () => {
  if (isSubmitDisabled || isFormHasErrors()) {
    errors.link = "";
  }
};

const isSelectedArtistCrew = () =>
  artistCrewPairs.some(
    (pair) => pair.artist === $selectedArtist && pair.crew === $selectedCrew,
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
    isSubmitting = true;

    if (isInProgress) {
      return;
    }

    isInProgress = true;
    !isEditSpot && marker.dragging.disable();

    publishSpotDraft(token, editSpotData?.id).then((response) => {
      const { success, result, errors: error } = response;
      isSubmitting = false;

      if (success && result) {
        if (isEditSpot) {
          const spots = $profileState.spotsList.map((spot) =>
            spot.id === editSpotData.id
              ? {
                  ...spot,
                  ...result,
                  img: image.filePreview,
                  thumbnail: image.filePreview,
                  additionalImg: image2.filePreview,
                  sketch: sketch.filePreview,
                }
              : spot,
          );
          profileState.setSpotsList(spots);
        } else {
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
        }
        onCancel();
      }
      if (error && !isEmpty(error)) {
        if (error?.img) {
          errors.imageFile = error.img[0] || "";
          image.filePreview = "";
        }
        if (error?.additionalImg) {
          image2.filePreview = "";
        }
        !isEditSpot && marker.dragging.enable();
        isInProgress = false;
      }
    });
  }
};

$: if (isSubmitting && !isInProgress) {
  handleSubmit();
}

const handleAddMoreClick = () => {
  artistCrewPairs = [...artistCrewPairs, { artist: "", crew: "" }];
};

const fetchUsersByArtist = async (filterText, index) => {
  artistCrewPairs[index].artist = filterText;
  artistCrewPairs[index].userArtist = "";
  artistCrewPairs[index].artistData = undefined;
  isSelectingAutocomplete = false;

  if (
    isAutocompleteEmpty &&
    savedRequestParams.artistsCrews?.[index]?.artist === filterText
  )
    return;
  const response = await requestSearchUserByArtist(filterText);
  const { success, result } = response;
  if (success && result) {
    isAutocompleteEmpty = !result.length;
    return result.map((item) => ({
      id: item.id,
      name: item.artist,
      type: `@${item.username}`,
    }));
  }
};

const fetchUsersByCrew = async (filterText, index) => {
  artistCrewPairs[index].crew = filterText;
  artistCrewPairs[index].userCrew = "";
  artistCrewPairs[index].crewData = undefined;
  isSelectingAutocomplete = false;

  if (
    isAutocompleteEmpty &&
    savedRequestParams.artistsCrews?.[index]?.crew === filterText
  )
    return;
  const response = await requestSearchUserByCrew(filterText);
  const { success, result } = response;
  if (success && result) {
    isAutocompleteEmpty = !result.length;
    return result.map((item) => ({
      id: item.id,
      name: item.crew,
      type: `@${item.username}`,
    }));
  }
};
</script>

<form class:edit={isEditSpot} on:submit|preventDefault={handleSubmit}>
  {#if isEditSpot}
    <div class="save">
      <ButtonPrimary
        text="Save"
        type="submit"
        withLoader={isSubmitting}
        isDisabled={isSubmitDisabled}
        className="add-spot" />
    </div>
  {/if}
  <div class="upload-area">
    <div class="upload-image" class:error={errors.imageFile}>
      {#if image.filePreview}
        <img src={image.filePreview} alt="Preview" class="preview_image" />
        <div class="overlay">
          <label for="upload-image" class="re-upload" />
        </div>
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
          <div class="overlay">
            <label for="upload-image2" class="re-upload" />
            <button
              type="button"
              class="button delete"
              on:click={() => onRemoveImage("image2")} />
          </div>
        {:else}
          <label for="upload-image2" class="first_upload">
            <span>Add Image (2 of 2)</span>
            <span>Max 10 Mb</span>
          </label>
        {/if}
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
  <div class="artists-area">
    {#each artistCrewPairs as pair, index}
      <div class="artist-crew-pair">
        <CustomAutoComplete
          getItems={(text) => fetchUsersByArtist(text, index)}
          selectedValue={artistCrewPairs[index].userArtist}
          data={artistCrewPairs[index].artistData}
          text={artistCrewPairs[index].artist}
          showList={!isAutocompleteEmpty}
          label="Artist Name"
          inputId={`artist-input-${index}`}
          onInputBlur={(event) => {
            if (event.target.value !== pair.artist) {
              artistCrewPairs[index].artist = event.target.value;
            }
          }}
          on:change={(event) => {
            if (isEditSpot && !pair.isTouchedArtist) {
              artistCrewPairs[index].isTouchedArtist = true;
              return;
            }
            isSelectingAutocomplete = true;
            if (!event.detail) {
              artistCrewPairs[index].artist = "";
              setTimeout(() => {
                document.getElementById(`artist-input-${index}`)?.blur();
              }, 0);
            }
            artistCrewPairs[index].userArtist = event.detail?.id;
            artistCrewPairs[index].artistData = event.detail;
            saveDraft(`artist${index + 1}`);
          }}
          on:blur={() => {
            setTimeout(() => {
              !isSelectingAutocomplete && saveDraft(`artist${index + 1}`);
              isSelectingAutocomplete = false;
            }, 200);
          }} />
        <CustomAutoComplete
          getItems={(text) => fetchUsersByCrew(text, index)}
          selectedValue={artistCrewPairs[index].userCrew}
          data={artistCrewPairs[index].crewData}
          text={artistCrewPairs[index].crew}
          showList={!isAutocompleteEmpty}
          label="Crew Name"
          inputId={`crew-input-${index}`}
          onInputBlur={(event) => {
            if (event.target.value !== pair.crew) {
              artistCrewPairs[index].crew = event.target.value;
            }
          }}
          on:change={(event) => {
            if (isEditSpot && !pair.isTouchedCrew) {
              artistCrewPairs[index].isTouchedCrew = true;
              return;
            }
            isSelectingAutocomplete = true;
            if (!event.detail) {
              artistCrewPairs[index].crew = "";
              setTimeout(() => {
                document.getElementById(`crew-input-${index}`)?.blur();
              }, 0);
            }
            artistCrewPairs[index].userCrew = event.detail?.id;
            artistCrewPairs[index].crewData = event.detail;
            saveDraft(`crew${index + 1}`);
          }}
          on:blur={() => {
            setTimeout(() => {
              !isSelectingAutocomplete && saveDraft(`crew${index + 1}`);
              isSelectingAutocomplete = false;
            }, 200);
          }} />
      </div>
    {/each}
    {#if artistCrewPairs.length < 5}
      <button
        type="button"
        class="button btn-add-more"
        on:click={handleAddMoreClick}
        ><PlusSvg /> <span>Artist/Crew</span></button>
    {/if}
  </div>
  <FormTelInput
    placeholder="Year"
    bind:value={year}
    hint={`${$settings.yearStart} - ${currentYear}`}
    on:input={handleYearChange}
    on:blur={() => saveDraft("year")}
    errorText={errors.year}
    wideOnMobile
    editSpot={isEditSpot}
    addSpot={!isEditSpot} />
  <div class="status">
    {#each statusesOrdered as status}
      <FormRadioButton
        id={`status-${status.toLowerCase()}`}
        bind:group={selectedStatus}
        on:change={() => saveDraft("selectedStatus")}
        value={status}
        label={status}
        className={!isEditSpot ? "addSpot" : ""} />
    {/each}
  </div>
  <div class="description">
    <FormTextArea
      placeholder="Description"
      bind:value={description}
      on:blur={() => saveDraft("description")}
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
      {#if errors.selectedCategory}<span class="error"
          >{errors.selectedCategory}</span
        >{/if}
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
      on:input={handleVideoLinkChange}
      on:blur={() => saveDraft("linkToVideo")}
      errorText={errors.linkToVideo}
      wideOnMobile
      editSpot={isEditSpot}
      addSpot={!isEditSpot}
      tooltip="Add link to your video hosted on Youtube / Vimeo / Dailymotion / Instagram / TikTok" />
  </div>
  <div class="link-to-work">
    <FormTextInput
      label="Link To Work"
      bind:value={link}
      on:input={handleLinkChange}
      on:blur={() => saveDraft("link")}
      wideOnMobile
      errorText={errors.link}
      editSpot={isEditSpot}
      addSpot={!isEditSpot}
      link />
  </div>
  {#if isEditSpot}
    <div class="checkbox">
      <input
        type="checkbox"
        name="hide-in-profile"
        id="hide-in-profile"
        checked={shouldHideInProfile}
        on:change={() => {
          shouldHideInProfile = !shouldHideInProfile;
          saveDraft("shouldHideInProfile");
        }} />
      <label for="hide-in-profile">Hide in profile</label>
    </div>
  {/if}
  {#if !editSpotData.img}
    <div class="button_wrap">
      <ButtonPrimary
        text="Post Art"
        type="submit"
        isDisabled={isSubmitDisabled}
        withLoader={isSubmitting}
        className={!isEditSpot ? "addSpot" : ""} />
    </div>
    <button
      type="button"
      class="cancel"
      on:click={() => shouldShowAddSpot.set(false)}
      disabled={isSubmitting}>Cancel</button>
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
  margin-bottom: 12px;
}

.artist-crew-pair + .artist-crew-pair {
  margin-top: 18px;
}
.btn-add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 40px;
  padding: 4px 0;
  background-color: var(--color-dark);
  color: var(--color-light);
  font-size: 16px;
  font-weight: 600;

  span {
    margin-left: 8px;
  }
}

.status {
  display: flex;
  margin-bottom: 18px;
}

.upload-area {
  margin-bottom: 24px;
}

.upload-image {
  position: relative;
  max-height: 136px;
  margin: 0 0 8px;

  /* &.upload-sketch {
    margin: 0 0 15px;
  } */

  &.error {
    margin-bottom: 23px;
  }

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

  .overlay {
    display: flex;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    align-items: center;
    justify-content: space-evenly;
    transition: opacity 0.3s;
    opacity: 0;
    background: rgba(0, 0, 0, 0.45);
  }

  .re-upload {
    width: 54px;
    height: 54px;
    background-color: var(--color-accent);
    background-image: url(../../images/re-upload.svg);
    background-size: 24px 24px;
    background-repeat: no-repeat;
    background-position: 50% 50%;
    cursor: pointer;
  }

  .delete {
    width: 54px;
    height: 54px;
    background-color: var(--color-accent);
    background-repeat: no-repeat;
    background-position: 50% 50%;
    background-image: url(../../images/trash.svg);
    background-size: 14px 18px;
  }

  &:hover {
    .overlay {
      opacity: 1;
    }

    .delete {
      display: block;
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
    margin-bottom: 0;
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
      height: 332px;
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

.checkbox {
  display: inline-block;
  position: relative;
  padding-left: 37px;

  input {
    position: absolute;
    left: -9999px;
    clip: rect(0 0 0 0);
    opacity: 0;
  }

  label {
    font-size: 16px;
    line-height: 17px;
    color: var(--color-dark);
    cursor: pointer;

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 22px;
      height: 22px;
      border: 1px solid var(--color-accent);
      border-radius: 2px;
    }

    &::after {
      content: "";
      position: absolute;
      top: 7px;
      left: 4px;
      width: 14px;
      height: 9px;
      background: url(../../images/checkbox.svg) 50% 50% / contain no-repeat;
      transform: scale(0);
      transition: transform 0.3s;
    }
  }

  input:checked + label {
    &::before {
      background-color: var(--color-accent);
    }

    &::after {
      transform: scale(1);
    }
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

      .preview_image {
        height: 140px;
      }
    }

    .description {
      margin-top: 0;
    }

    .checkbox {
      margin-bottom: 20px;
    }
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  form {
    &:not(.edit) {
      .upload-area {
        margin-bottom: 14px;
      }

      .upload-image {
        max-height: 100px;
        margin: 12px 0;
      }

      .preview_image {
        height: 100px;
      }

      .status {
        margin-bottom: 13px;
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
