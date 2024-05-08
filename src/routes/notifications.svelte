<script>
import { goto } from "@roxi/routify";

import Modal from "../components/Modal.svelte";
import Notifications from "../components/Notifications.svelte";
</script>

<Modal
  id="notifications-modal"
  title="Notifications"
  noLogo
  noMarginTop
  on:close={() => {
    $goto("/");
  }}>
  <Notifications />
</Modal>
