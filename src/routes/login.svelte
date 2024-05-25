<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import LoginForm from "../components/auth/LoginForm.svelte";
import Modal from "../components/Modal.svelte";
</script>

<Modal
  id="login-modal"
  on:close={() => $goto("/")}
  noLogo
  withFooter
  extraMarginTopMobile>
  <LoginForm />
  <span slot="title">Log in</span>
</Modal>
