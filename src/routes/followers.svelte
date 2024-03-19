<script>
import { goto } from "@roxi/routify";

import Modal from "../components/Modal.svelte";
import Followers from "../components/follow/Followers.svelte";
</script>

<Modal
  id="followers-modal"
  noLogo
  on:close={() => {
    $goto("/");
  }}>
  <Followers />
</Modal>
