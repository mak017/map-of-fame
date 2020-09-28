<script>
import { embedVideoCodeFromBasicUrl } from "../utils";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormTextInput from "./elements/FormTextInput.svelte";
import Popup from "./Popup.svelte";
import ShareMarker from "./ShareMarker.svelte";

export let data;

let isShareOpened = false;
let isComplainOpened = false;

const { artist, crew, status, description, img, video, user } = data;

const artistName = artist || "Unknown";
const videoEmbed = embedVideoCodeFromBasicUrl(video);
console.log("data", data);
console.log("video, videoEmbed", video, videoEmbed);

const onShareOpen = () => {
  isShareOpened = true;
};

const onComplainOpen = () => {
  isComplainOpened = true;
};
</script>

<div class="card">
  <div class="top">
    <div class="artist">
      <div class="subtitle">Artist</div>
      <div class="title">{crew ? `${artistName} (${crew})` : artistName}</div>
    </div>
    <div class="status">
      <div class="subtitle">Status</div>
      <div class={`title ${status.toLowerCase()}`}>{status}</div>
    </div>
  </div>
  <div class="img"><img src={img.src} alt={img.title} /></div>
  {#if description}
    <div class="description">{description}</div>
  {/if}
  {#if video}
    <div class="video">
      {@html videoEmbed}
    </div>
  {/if}
  <div class="bottom">
    <div class="posted-by">
      <div class="subtitle">Posted by</div>
      <div class="title">{user.name}</div>
    </div>
    <div class="buttons">
      {#if user.link}
        <div class="link">
          <a href={user.link}>{`${user.name}'s Portfolio`}</a>
        </div>
      {/if}
      <div class="share"><button type="button" on:click={onShareOpen} /></div>
      <div class="complain">
        <button type="button" on:click={onComplainOpen} />
      </div>
    </div>
  </div>
</div>
{#if isShareOpened}
  <Popup on:close={() => (isShareOpened = false)} title="Share Link">
    <ShareMarker />
  </Popup>
{/if}
{#if isComplainOpened}
  <Popup on:close={() => (isComplainOpened = false)} title="Complaint!">
    <FormTextInput placeholder="Cause" />
  </Popup>
{/if}

<style lang="scss">
.card {
  width: 100%;
  max-width: 938px;
  margin-bottom: 64px;
}
.top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}
.subtitle {
  margin-bottom: 10px;
  font-size: 13px;
  line-height: 1.22;
  color: var(--color-dark);
}
.title {
  display: -webkit-box;
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-transform: uppercase;
}
.status {
  text-align: right;
  .buffed {
    color: var(--color-error);
    text-decoration-line: line-through;
  }
  .live {
    color: var(--color-accent);
  }
}

.img {
  margin-bottom: 24px;
}
.description {
  margin-bottom: 24px;
  color: var(--color-dark);
  font-size: 18px;
  line-height: 1.22;
  word-break: break-word;
}
.video {
  position: relative;
  margin-bottom: 24px;
  padding: 30px 0 56.25%;
  height: 0;
  overflow: hidden;
}

.bottom {
  display: flex;
  flex-flow: wrap;
  justify-content: space-between;
}

.posted-by {
  .title {
    font-size: 18px;
  }
}

.buttons {
  display: flex;
  div + div {
    margin-left: 12px;
  }
  button,
  a {
    display: block;
    width: 40px;
    height: 40px;
    cursor: pointer;
  }
  button {
    border: 0;
  }
}

.link a {
  font-size: 0;
  background: url(../../images/link.svg) 50% 50% / auto no-repeat;
}
.share button {
  background: url(../../images/share.svg) 50% 50% / auto no-repeat;
}
.complain button {
  background: url(../../images/warning.svg) 50% 50% / auto no-repeat;
}

@media (max-width: 767px) {
  .card {
    padding-top: 38px;
  }
  .bottom {
    margin-bottom: -16px;
  }
  .posted-by {
    margin-bottom: 16px;
  }
}
</style>
