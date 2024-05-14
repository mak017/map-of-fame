<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import Modal from "../components/Modal.svelte";
import Begistration from "../components/auth/Begistration.svelte";

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
  title="Begistration"
  noLogo
  withFooter
  extraMarginTopMobile
  closeIconAsBack={step === 2}>
  <Begistration {step} {setStep} />
</Modal>
