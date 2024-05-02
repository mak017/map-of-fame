<script>
import { goto } from "@roxi/routify";

import Modal from "../components/Modal.svelte";
import Feed from "../components/follow/Feed.svelte";
</script>

<Modal
  id="follow-feed-modal"
  title="Feed"
  noLogo
  autoMargin
  on:close={() => {
    $goto("/");
  }}>
  <Feed />
</Modal>
