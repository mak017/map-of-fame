<script>
import { fly } from "svelte/transition";
import { STATUSES } from "../constants";
import { getCurrentYear } from "../utils";
import FormTextInput from "./elements/FormTextInput.svelte";

let artist = "";
let crew = "";
let year = "";
let selectedStatus = STATUSES.live;
let imageFile;
let linkToVideo = "";
let description = "";
let category = "";
let sprayPaintUsed = "";
let link = "";

const statusesOrdered = [STATUSES.live, STATUSES.buffed, STATUSES.unknown];
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
  </form>
</div>

<style>
.add-spot {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 364px;
  padding: 36px 20px 16px;
  background-color: var(--color-light);
}
</style>
