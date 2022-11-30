<script>
import { goto } from "@roxi/routify";

import PreRegistration from "./../js/components/auth/PreRegistration.svelte";
import Modal from "../js/components/Modal.svelte";

let isPreRegistrationSuccess = false;

const setIsPreRegistrationSuccess = () => (isPreRegistrationSuccess = true);
</script>

<Modal
  on:close={() => $goto("/")}
  title={!isPreRegistrationSuccess && "Pre 👀 Registration"}
  noTransition>
  <PreRegistration {setIsPreRegistrationSuccess} />
</Modal>
