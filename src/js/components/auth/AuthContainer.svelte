<script>
import Modal from "./../Modal.svelte";
import { AUTH_MODALS } from "../../constants";
import LoginForm from "./LoginForm.svelte";
import RegistrationForm from "./RegistrationForm.svelte";
import { isMobile } from "../../utils";
import ForgotPassword from "./ForgotPassword.svelte";

export let showAuth;

let currentModal = AUTH_MODALS.login;
let isInitialLoad = true;
let isMobileWidth = isMobile();
let forgotPasswordEmailSent = false;

const changeCurrentModal = (modal) => {
  currentModal = modal;
  if (isInitialLoad) isInitialLoad = false;
};

const handleResize = () => {
  isMobileWidth = isMobile();
};

const setForgotPasswordEmailSent = (bool) => (forgotPasswordEmailSent = bool);
</script>

<svelte:window on:resize={handleResize} />

{#if currentModal === AUTH_MODALS.login}
  <Modal
    on:close={() => showAuth(false)}
    title="Log in"
    noTransition={!isInitialLoad}>
    <LoginForm {changeCurrentModal} {showAuth} />
  </Modal>
{/if}

{#if currentModal === AUTH_MODALS.registration}
  <Modal on:close={() => showAuth(false)} title="Registration" noTransition>
    <RegistrationForm {changeCurrentModal} {showAuth} />
  </Modal>
{/if}

{#if currentModal === AUTH_MODALS.forgotPassword}
  <Modal
    on:close={() => showAuth(false)}
    title={forgotPasswordEmailSent && isMobileWidth ? 'Letter was sent to the email' : 'Forgot'}
    noTransition
    accentTitle={forgotPasswordEmailSent && isMobileWidth}>
    <ForgotPassword
      {changeCurrentModal}
      {setForgotPasswordEmailSent}
      {forgotPasswordEmailSent}
      {isMobileWidth} />
  </Modal>
{/if}
