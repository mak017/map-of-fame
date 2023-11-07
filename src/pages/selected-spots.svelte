<script>
import { goto } from "@roxi/routify";

import SelectedSpots from "./../js/components/SelectedSpots.svelte";
import Modal from "../js/components/Modal.svelte";
</script>

<Modal
  id="selected-spots-modal"
  noLogo
  on:close={() => {
    $goto("/");
  }}>
  <SelectedSpots />
</Modal>
