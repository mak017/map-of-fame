<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import SelectedSpots from "./../components/SelectedSpots.svelte";
import Modal from "../components/Modal.svelte";
</script>

<Modal
  id="selected-spots-modal"
  noLogo
  on:close={() => {
    $goto("/");
  }}>
  <SelectedSpots />
</Modal>
