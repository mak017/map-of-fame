<script>
import { goto } from "@roxi/routify/runtime/helpers";

import Modal from "../../../../js/components/Modal.svelte";
import EditSpot from "../../../../js/components/user/EditSpot.svelte";
</script>

<Modal id="edit-spot-modal" on:close={() => $goto("/")} noLogo noClose>
  <EditSpot />
</Modal>
