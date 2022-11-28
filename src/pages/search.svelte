<script>
import { goto } from "@roxi/routify";

import { isMobile } from "../js/utils/commonUtils";

import Modal from "../js/components/Modal.svelte";
import SearchForm from "../js/components/SearchForm.svelte";
</script>

<Modal
  on:close={() => $goto("/")}
  title="Search"
  withAd
  alwaysOnTop
  noLogo={!isMobile()}
  stickyHeaderOnMobile>
  <SearchForm />
</Modal>
