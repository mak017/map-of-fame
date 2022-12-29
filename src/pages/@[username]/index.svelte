<script>
import { goto } from "@roxi/routify";

import {
  isInitialized,
  isShowOnMapMode,
  selectedUserProfileData,
} from "../../js/store.js";

import Modal from "../../js/components/Modal.svelte";
import Profile from "../../js/components/user/Profile.svelte";
</script>

<Modal
  id="profile-modal"
  noLogo
  noTransition={!$isInitialized}
  on:close={() => {
    $goto("/");
    !$isShowOnMapMode && selectedUserProfileData.set({});
  }}>
  <Profile />
</Modal>
