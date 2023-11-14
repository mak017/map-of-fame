<script>
import { goto } from "@roxi/routify";

import { getInviteData } from "../js/utils/commonUtils";

import Modal from "../js/components/Modal.svelte";
import RegistrationForm from "../js/components/auth/RegistrationForm.svelte";

let inviteData = getInviteData();
let isInviteError = false;
</script>

<Modal
  id="registration-modal"
  on:close={() => $goto("/")}
  title={isInviteError ? "Registr💩tion" : "Registration"}
  withFooter>
  <RegistrationForm
    {inviteData}
    {isInviteError}
    setInviteError={() => (isInviteError = true)} />
</Modal>
