<script>
import { fly } from "svelte/transition";
import {
  CATEGORIES,
  categoriesOrdered,
  STATUSES,
  statusesOrdered,
} from "../constants";
import { getCurrentYear } from "../utils";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";

let artist = "";
let crew = "";
let year = "";
let selectedStatus = STATUSES.live;
let imageFile;
let linkToVideo = "";
let description = "";
let selectedCategory = CATEGORIES.walls;
let sprayPaintUsed = "";
let link = "";
</script>

<div class="add-spot" transition:fly={{ x: 364, duration: 300 }}>
  <h2>Add Spot</h2>
  <form on:submit|preventDefault>
    <FormTextInput placeholder="Artist Name" bind:value={artist} />
    <FormTextInput placeholder="Crew Name" bind:value={crew} />
    <FormTextInput
      placeholder="Year"
      bind:value={year}
      hint={`1967 - ${getCurrentYear()}`} />
    <div class="status">
      {#each statusesOrdered as status}
        <div class="radio">
          <input
            type="radio"
            id={`status-${status.toLowerCase()}`}
            bind:group={selectedStatus}
            value={status} />
          <label for={`status-${status.toLowerCase()}`}>{status}</label>
        </div>
      {/each}
    </div>
    <div class="upload-image">
      <label for="upload-image"><span>Add Image</span><span>Max 5 Mb</span></label>
      <input
        accept="image/png, image/jpeg"
        bind:files={imageFile}
        id="upload-image"
        type="file" />
    </div>
    <FormTextInput label="Link To Video" bind:value={linkToVideo} />
    <textarea placeholder="Description" bind:value={description} />
    <div class="category">
      {#each categoriesOrdered as category}
        <div class="radio">
          <input
            type="radio"
            id={`category-${category.toLowerCase()}`}
            bind:group={selectedCategory}
            value={category} />
          <label for={`category-${category.toLowerCase()}`}>{category}</label>
        </div>
      {/each}
    </div>
    <div class="spray">
      <select bind:value={sprayPaintUsed}>
        <option value="" disabled selected hidden>Spray Paint Used</option>
        <option value="1">Spray 1</option>
        <option value="2">Spray 2</option>
        <option value="3">Spray 3</option>
      </select>
    </div>
    <FormTextInput label="Link To Work" bind:value={link} />
    <ButtonPrimary text="Post Spot" type="submit" />
    <button type="button" class="cancel">Cancel</button>
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

.radio {
  display: flex;
  flex: 1 0 0;
  border: 1px solid var(--color-dark);
  &:first-child {
    border-right: 0;
    border-radius: 2px 0 0 2px;
  }
  &:last-child {
    border-left: 0;
    border-radius: 0 2px 2px 0;
  }
  input {
    position: absolute;
    left: -9999px;
    clip: rect(0 0 0 0);
    opacity: 0;
  }
  label {
    flex: 1 0 auto;
    padding: 10px 0;
    color: var(--color-dark);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.22;
    text-align: center;
    cursor: pointer;
  }
  input:checked + label {
    background-color: var(--color-dark);
    color: var(--color-light);
  }
}

.upload-image {
  height: 140px;
  margin: 18px 0 24px;
  label {
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
}

textarea {
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--color-dark);
  border-radius: 2px;
  resize: none;
  font-weight: 600;
  font-size: 16px;
  &::placeholder {
    color: var(--color-dark);
    font-size: 17px;
    font-weight: normal;
  }
}
</style>
