<script>
import { goto } from "@roxi/routify";

import { isInitialized } from "./../js/store.js";

import Calendar from "./../js/components/Calendar.svelte";
import Modal from "../js/components/Modal.svelte";
</script>

<Modal
  id="calendar-modal"
  on:close={() => $goto("/")}
  title="Years"
  withAd
  autoMargin
  noTransition={!$isInitialized}>
  <Calendar />
</Modal>
