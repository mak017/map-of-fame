<script>
import { goto, prefetch } from "@roxi/routify";

import {
  isInitialized,
  isShowOnMapMode,
  selectedUserProfileData,
} from "../../js/store.js";

import Modal from "../../js/components/Modal.svelte";
import Profile from "../../js/components/user/Profile.svelte";

prefetch("/");
</script>

<Modal
  noLogo
  noTransition={!$isInitialized}
  on:close={() => {
    $goto("/");
    !$isShowOnMapMode && selectedUserProfileData.set({});
  }}>
  <Profile />
</Modal>
