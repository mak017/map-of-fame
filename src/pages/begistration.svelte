<script>
import { goto } from "@roxi/routify";

import Modal from "../js/components/Modal.svelte";
import Begistration from "../js/components/auth/Begistration.svelte";
</script>

<Modal
  id="registration-modal"
  on:close={() => $goto("/")}
  title="Begistration"
  withFooter>
  <Begistration />
</Modal>
