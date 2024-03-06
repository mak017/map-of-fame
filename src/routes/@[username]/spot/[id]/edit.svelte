<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import Modal from "../../../../components/Modal.svelte";
import EditSpot from "../../../../components/user/EditSpot.svelte";
</script>

<Modal id="edit-spot-modal" on:close={() => $goto("/")} noLogo noClose>
  <EditSpot />
</Modal>
