<script>
import { goto } from "@roxi/routify";

import { followingState } from "../js/store";

import Modal from "../components/Modal.svelte";
import Following from "../components/follow/Following.svelte";
</script>

<Modal
  id="following-modal"
  noLogo
  alwaysOnTop
  on:close={() => {
    $goto("/");
  }}>
  <Following />
  <div slot="title">
    <span>Following</span>
    {#if $followingState.total}
      <span class="count"> ({$followingState.total})</span>
    {/if}
  </div>
</Modal>

<style>
.count {
  font-weight: 400;
}
</style>
