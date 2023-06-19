<script>
import { goto } from "@roxi/routify";

import Calendar from "./../js/components/Calendar.svelte";
import Modal from "../js/components/Modal.svelte";
</script>

<Modal
  id="calendar-modal"
  on:close={() => $goto("/")}
  title="Years"
  withAd
  autoMargin
  testLogo>
  <Calendar />
</Modal>
