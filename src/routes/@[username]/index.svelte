<script>
import { goto } from "@roxi/routify";

import { isShowOnMapMode, selectedUserProfileData } from "../../js/store.js";

import Modal from "../../components/Modal.svelte";
import Profile from "../../components/user/Profile.svelte";
</script>

<Modal
  id="profile-modal"
  noLogo
  noPaddingTop
  on:close={() => {
    $goto("/");
    !$isShowOnMapMode && selectedUserProfileData.set({});
  }}>
  <Profile />
</Modal>
