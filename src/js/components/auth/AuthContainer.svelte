<script>
import Modal from "./../Modal.svelte";
import { AUTH_MODALS } from "../../constants";
import LoginForm from "./LoginForm.svelte";
import RegistrationForm from "./RegistrationForm.svelte";

export let showAuth;

let currentModal = AUTH_MODALS.login;

const changeCurrentModal = (modal) => (currentModal = modal);
</script>

{#if currentModal === AUTH_MODALS.login}
  <Modal on:close={() => showAuth(false)} title="Log in">
    <LoginForm {changeCurrentModal} {showAuth} />
  </Modal>
{/if}

{#if currentModal === AUTH_MODALS.registration}
  <Modal on:close={() => showAuth(false)} title="Registration">
    <RegistrationForm {changeCurrentModal} {showAuth} />
  </Modal>
{/if}
