<script>
import { fade, fly } from "svelte/transition";
import { afterUrlChange, url } from "@roxi/routify";

import { isMenuOpen, settings } from "../../js/store";
import { isMobile } from "../../js/utils/commonUtils";

import CloseCrossSvg from "../elements/icons/CloseCrossSvg.svelte";

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
    x: !isMobile() ? 364 : window.innerWidth,
    duration: 300,
  }}>
  <div class="logo" />
  <button class="close" on:click={() => isMenuOpen.set(false)}>
    <CloseCrossSvg />
  </button>
  <ul class="links">
    <li>
      <a href={$url("/login")}>Login</a>
    </li>
    <li>
      <a
        href={$url(
          $settings.needInviteToRegister ? "/begistration" : "/registration",
        )}>Register</a>
    </li>
  </ul>
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
  width: 364px;
  padding: 36px 28px 32px 33px;
  background-color: var(--color-light);
  color: var(--color-dark);
  font-size: 18px;

  button {
    background: none;
    font-weight: 600;
    line-height: 22px;

    &:hover {
      opacity: 0.7;
    }
  }
}

.logo {
  position: absolute;
  top: 0;
  right: 100%;
  width: 208px;
  height: 100px;
  padding: 0 20px;
  background: var(--color-lotion) url(../../images/logo.png) 50% 50% / 151px
    no-repeat;
}

.close {
  display: block;
  position: absolute;
  top: 28px;
  right: 14px;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.links {
  margin-bottom: 16px;
  font-weight: 600;

  a {
    display: block;
    margin-bottom: 16px;
    color: inherit;
    text-decoration: none;

    &:hover {
      opacity: 0.7;
    }
  }
}

@media (max-width: 767px) {
  .menu {
    width: 100%;
    padding: 18px 24px 24px 22px;
    font-size: 24px;
  }

  .logo {
    position: static;
    justify-content: flex-start;
    width: 110px;
    height: 40px;
    margin-bottom: 24px;
    background-color: transparent;
    background-size: 120px;
  }
}
</style>
