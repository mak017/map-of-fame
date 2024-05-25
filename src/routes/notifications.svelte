<script>
import { goto } from "@roxi/routify";

import Modal from "../components/Modal.svelte";
import Notifications from "../components/Notifications.svelte";
</script>

<Modal
  id="notifications-modal"
  noLogo
  noMarginTop
  on:close={() => {
    $goto("/");
  }}>
  <Notifications />
  <span title="slot">Notifications</span>
</Modal>
