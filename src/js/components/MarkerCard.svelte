<script>
import { embedVideoCodeFromBasicUrl } from "../utils";

export let data;

const {
  artist = "Unknown",
  crew,
  status,
  description,
  img,
  video,
  user,
} = data;

const videoEmbed = embedVideoCodeFromBasicUrl(video);
console.log("data", data);
console.log("video, videoEmbed", video, videoEmbed);
</script>

<div class="card">
  <div class="top">
    <div class="artist">
      <div class="subtitle">Artist</div>
      <div class="title">{crew ? `${artist} (${crew})` : artist}</div>
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
      <div class="title">{user}</div>
    </div>
    <div class="buttons">
      <div class="link">
        <a href={user.link}>{`${user.name}'s Portfolio`}</a>
      </div>
      <div class="share"><button type="button" /></div>
      <div class="complain"><button type="button" /></div>
    </div>
  </div>
</div>

<style lang="scss">
.top {
  display: flex;
  justify-content: space-between;
}
.status {
  text-align: right;
}
.video {
  position: relative;
  padding-bottom: 56.25%;
  padding-top: 30px;
  height: 0;
  overflow: hidden;
}
</style>
