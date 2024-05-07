<script>
import { goto } from "@roxi/routify";

import { followingState } from "../js/store";

import Modal from "../components/Modal.svelte";
import Following from "../components/follow/Following.svelte";
</script>

<Modal
  id="following-modal"
  title={`Following${$followingState.total ? ` <span>(${$followingState.total})</span>` : ""}`}
  noLogo
  alwaysOnTop
  on:close={() => {
    $goto("/");
  }}>
  <Following />
</Modal>
