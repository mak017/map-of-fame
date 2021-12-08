<script>
import Modal from "./../Modal.svelte";
import { AUTH_MODALS } from "../../constants";
import LoginForm from "./LoginForm.svelte";
import RegistrationForm from "./RegistrationForm.svelte";
import { isMobile } from "../../utils/commonUtils";
import ForgotPassword from "./ForgotPassword.svelte";
import PreRegistration from "./PreRegistration.svelte";

export let showAuth;
export let inviteData;
export let clearInviteData;

let currentModal = !inviteData ? AUTH_MODALS.login : AUTH_MODALS.registration;
let isInitialLoad = true;
let isMobileWidth = isMobile();
let forgotPasswordEmailSent = false;
let isPreRegistrationSuccess = false;

const changeCurrentModal = (modal) => {
  currentModal = modal;
  if (isInitialLoad) isInitialLoad = false;
};

const handleResize = () => {
  isMobileWidth = isMobile();
};

const setForgotPasswordEmailSent = (bool) => (forgotPasswordEmailSent = bool);

const setIsPreRegistrationSuccess = () => (isPreRegistrationSuccess = true);
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
  <Modal
    on:close={() => (showAuth(false), clearInviteData())}
    title="Registration"
    noTransition={!inviteData}>
    <RegistrationForm
      {changeCurrentModal}
      {showAuth}
      {inviteData}
      {clearInviteData} />
  </Modal>
{/if}

{#if currentModal === AUTH_MODALS.forgotPassword}
  <Modal
    on:close={() => showAuth(false)}
    title={forgotPasswordEmailSent && isMobileWidth
      ? "Letter was sent to the email"
      : "Forgot"}
    noTransition
    accentTitle={forgotPasswordEmailSent && isMobileWidth}>
    <ForgotPassword
      {changeCurrentModal}
      {setForgotPasswordEmailSent}
      {forgotPasswordEmailSent}
      {isMobileWidth} />
  </Modal>
{/if}

{#if currentModal === AUTH_MODALS.preRegistration}
  <Modal
    on:close={() => showAuth(false)}
    title={!isPreRegistrationSuccess && "Pre 👀 Registration"}
    noTransition>
    <PreRegistration
      {setIsPreRegistrationSuccess}
      close={() => showAuth(false)} />
  </Modal>
{/if}
