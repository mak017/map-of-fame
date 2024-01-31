<script>
import { fly } from "svelte/transition";

import { isMenuOpen } from "../store";
import { isMobile } from "../utils/commonUtils";

import CloseCrossSvg from "./elements/icons/CloseCrossSvg.svelte";
</script>

<div
  class="menu"
  transition:fly={{ x: !isMobile() ? 364 : window.innerWidth, duration: 300 }}>
  <button class="close-mob" on:click={() => isMenuOpen.set(false)}>
    <CloseCrossSvg />
  </button>
  <div class="links"></div>
</div>
