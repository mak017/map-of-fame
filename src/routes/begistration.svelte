<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import Modal from "../components/Modal.svelte";
import Begistration from "../components/auth/Begistration.svelte";
</script>

<Modal
  id="registration-modal"
  on:close={() => $goto("/")}
  title="Begistration"
  withFooter>
  <Begistration />
</Modal>
