<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import { getInviteData } from "../js/utils/commonUtils";

import Modal from "../components/Modal.svelte";
import RegistrationForm from "../components/auth/RegistrationForm.svelte";

let inviteData = getInviteData();
let isInviteError = false;
let step = 1;

const setStep = (value) => {
  step = value;
};

const handleClose = () => {
  if (step === 2) {
    step = 1;
    return;
  }

  $goto("/");
};
</script>

<Modal
  id="registration-modal"
  on:close={handleClose}
  title={isInviteError ? "Registr💩tion" : "Registration"}
  withFooter
  noLogo
  extraMarginTopMobile
  closeIconAsBack={step === 2}>
  <RegistrationForm
    {inviteData}
    {isInviteError}
    {step}
    {setStep}
    setInviteError={() => (isInviteError = true)} />
</Modal>
