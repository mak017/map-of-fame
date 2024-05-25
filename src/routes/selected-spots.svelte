<script>
import { goto } from "@roxi/routify";

import SelectedSpots from "./../components/SelectedSpots.svelte";
import Modal from "../components/Modal.svelte";
</script>

<Modal
  id="selected-spots-modal"
  noLogo
  alwaysOnTop
  on:close={() => {
    $goto("/");
  }}>
  <SelectedSpots />
  <span slot="title">Selected location</span>
</Modal>
