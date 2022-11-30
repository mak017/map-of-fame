<script>
import { goto } from "@roxi/routify";

import { getInviteData } from "../js/utils/commonUtils";

import Modal from "../js/components/Modal.svelte";
import RegistrationForm from "../js/components/auth/RegistrationForm.svelte";

let inviteData = getInviteData();
</script>

<Modal on:close={() => $goto("/")} title="Registration" noTransition>
  <RegistrationForm {inviteData} />
</Modal>
