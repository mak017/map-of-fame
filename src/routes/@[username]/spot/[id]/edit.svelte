<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import { hasBrowseHistory } from "../../../../js/store";

import Modal from "../../../../components/Modal.svelte";
import EditSpot from "../../../../components/user/EditSpot.svelte";
</script>

<Modal
  id="edit-spot-modal"
  on:close={() => ($hasBrowseHistory ? window.history.back() : $goto("/"))}
  noLogo
  closeIconAsBack
  noMarginTop>
  <EditSpot />
  <span slot="title">Edit Art</span>
</Modal>
