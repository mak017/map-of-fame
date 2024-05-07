<script>
import { goto } from "@roxi/routify";

import { followersState } from "../js/store";

import Modal from "../components/Modal.svelte";
import Followers from "../components/follow/Followers.svelte";
</script>

<Modal
  id="followers-modal"
  title={`Followers${$followersState.total ? ` <span>(${$followersState.total})</span>` : ""}`}
  noLogo
  alwaysOnTop
  on:close={() => {
    $goto("/");
  }}>
  <Followers />
</Modal>
