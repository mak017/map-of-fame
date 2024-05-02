<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import { getInviteData } from "../js/utils/commonUtils";

import Modal from "../components/Modal.svelte";
import RegistrationForm from "../components/auth/RegistrationForm.svelte";

let inviteData = getInviteData();
let isInviteError = false;
</script>

<Modal
  id="registration-modal"
  on:close={() => $goto("/")}
  title={isInviteError ? "Registr💩tion" : "Registration"}
  withFooter
  noLogo>
  <RegistrationForm
    {inviteData}
    {isInviteError}
    setInviteError={() => (isInviteError = true)} />
</Modal>
