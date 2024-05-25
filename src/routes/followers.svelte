<script>
import { goto } from "@roxi/routify";

import { followersState } from "../js/store";

import Modal from "../components/Modal.svelte";
import Followers from "../components/follow/Followers.svelte";
</script>

<Modal
  id="followers-modal"
  noLogo
  alwaysOnTop
  on:close={() => {
    $goto("/");
  }}>
  <Followers />
  <div slot="title">
    <span>Followers</span>
    {#if $followersState.total}
      <span class="count"> ({$followersState.total})</span>
    {/if}
  </div>
</Modal>

<style>
.count {
  font-weight: 400;
}
</style>
