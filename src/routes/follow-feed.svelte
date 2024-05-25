<script>
import { goto } from "@roxi/routify";

import Modal from "../components/Modal.svelte";
import Feed from "../components/follow/Feed.svelte";
</script>

<Modal
  id="follow-feed-modal"
  noLogo
  autoMargin
  on:close={() => {
    $goto("/");
  }}>
  <Feed />
  <span slot="title">Feed</span>
</Modal>
