<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import ForgotPassword from "./../components/auth/ForgotPassword.svelte";
import Modal from "../components/Modal.svelte";

let forgotPasswordEmailSent = false;

const setForgotPasswordEmailSent = (bool) => (forgotPasswordEmailSent = bool);
</script>

<Modal
  id="forgot-password-modal"
  on:close={() => $goto("/")}
  title={forgotPasswordEmailSent ? "Check email" : "Forgot"}
  accentTitle={forgotPasswordEmailSent}
  withFooter
  noLogo
  extraMarginTopMobile>
  <ForgotPassword {setForgotPasswordEmailSent} {forgotPasswordEmailSent} />
</Modal>
