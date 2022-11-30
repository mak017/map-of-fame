<script>
import { goto } from "@roxi/routify";

import LoginForm from "../js/components/auth/LoginForm.svelte";
import Modal from "../js/components/Modal.svelte";
</script>

<Modal on:close={() => $goto("/")} title="Log in" noTransition>
  <LoginForm />
</Modal>
