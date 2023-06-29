<script>
import { goto } from "@roxi/routify";

import { isMobile } from "../js/utils/commonUtils";

import Modal from "../js/components/Modal.svelte";
import SearchForm from "../js/components/SearchForm.svelte";

let isMobileWidth = isMobile();

const handleResize = () => {
  isMobileWidth = isMobile();
};
</script>

<svelte:window on:resize={handleResize} />
<Modal
  id="search-modal"
  on:close={() => $goto("/")}
  title="Search"
  withAd
  alwaysOnTop
  noLogo={!isMobileWidth}
  stickyHeaderOnMobile>
  <SearchForm />
</Modal>
