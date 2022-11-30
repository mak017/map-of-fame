<script>
import { goto } from "@roxi/routify";

import { isMobile } from "../js/utils/commonUtils";

import ForgotPassword from "./../js/components/auth/ForgotPassword.svelte";
import Modal from "../js/components/Modal.svelte";

let forgotPasswordEmailSent = false;
let isMobileWidth = isMobile();

const setForgotPasswordEmailSent = (bool) => (forgotPasswordEmailSent = bool);

const handleResize = () => {
  isMobileWidth = isMobile();
};
</script>

<svelte:window on:resize={handleResize} />
<Modal
  on:close={() => $goto("/")}
  title={forgotPasswordEmailSent && isMobileWidth
    ? "Letter was sent to the email"
    : "Forgot"}
  noTransition
  accentTitle={forgotPasswordEmailSent && isMobileWidth}>
  <ForgotPassword
    {setForgotPasswordEmailSent}
    {forgotPasswordEmailSent}
    {isMobileWidth} />
</Modal>
