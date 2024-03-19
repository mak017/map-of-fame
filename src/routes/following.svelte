<script>
import { goto } from "@roxi/routify";

import Modal from "../components/Modal.svelte";
import Following from "../components/follow/Following.svelte";
</script>

<Modal
  id="following-modal"
  noLogo
  on:close={() => {
    $goto("/");
  }}>
  <Following />
</Modal>
