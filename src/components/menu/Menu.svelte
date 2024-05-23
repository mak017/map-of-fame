<script>
import { fade, fly } from "svelte/transition";
import { afterUrlChange } from "@roxi/routify";

import { isLoggedIn, isMenuOpen } from "../../js/store";
import { isMobile } from "../../js/utils/commonUtils";

import CloseCrossSvg from "../elements/icons/CloseCrossSvg.svelte";
import LoggedIn from "./LoggedIn.svelte";
import Guest from "./Guest.svelte";

$afterUrlChange(() => {
  isMenuOpen.set(false);
});
</script>

<div
  class="overlay"
  transition:fade|global={{ duration: 200 }}
  on:click={() => isMenuOpen.set(false)}
  role="presentation"
  tabIndex="-1">
</div>
<div
  class="menu"
  transition:fly|global={{
    x: !isMobile() ? 270 : window.innerWidth,
    duration: 300,
  }}>
  <div class="logo" />
  <button class="close" on:click={() => isMenuOpen.set(false)}>
    <span>
      <CloseCrossSvg />
    </span>
  </button>
  {#if $isLoggedIn}
    <LoggedIn />
  {:else}
    <Guest />
  {/if}
</div>

<style lang="scss">
.overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  background: var(--color-dark);
  opacity: 0.6;
}

.menu {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  flex-direction: column;
  align-items: flex-start;
  width: 270px;
  padding: 24px 10px 30px 20px;
  background-color: var(--color-light);
  color: var(--color-dark);
  font-size: 18px;
}

.logo {
  width: 150px;
  height: 50px;
  margin-bottom: 40px;
  background: url(../../images/logo.png) 50% 50% / 151px no-repeat;
}

.close {
  display: flex;
  position: absolute;
  top: 0;
  right: 10px;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  background-color: var(--color-accent-light);
  cursor: pointer;

  > span {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: var(--color-accent-light-hover);
  }
}

@media (max-width: 767px) {
  .menu {
    width: 100%;
  }
}
</style>
