<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import Calendar from "./../components/Calendar.svelte";
import Modal from "../components/Modal.svelte";
</script>

<Modal
  id="calendar-modal"
  on:close={() => $goto("/")}
  title="Calendar"
  noLogo
  withAd>
  <Calendar />
</Modal>
