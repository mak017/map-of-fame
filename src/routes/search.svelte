<!-- routify:meta history -->
<script>
import { goto } from "@roxi/routify";

import { isMobile } from "../js/utils/commonUtils";

import Modal from "../components/Modal.svelte";
import SearchForm from "../components/SearchForm.svelte";

let isMobileWidth = isMobile();

const handleResize = () => {
  isMobileWidth = isMobile();
};
</script>

<svelte:window on:resize={handleResize} />
<Modal
  id="search-modal"
  on:close={() => $goto("/")}
  withAd
  alwaysOnTop
  noLogo={!isMobileWidth}>
  <SearchForm />
</Modal>
