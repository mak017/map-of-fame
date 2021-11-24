<script>
import { createEventDispatcher } from "svelte";
import { fade } from "svelte/transition";
import CloseCrossSvg from "./elements/icons/CloseCrossSvg.svelte";
import { isMobile } from "../utils/commonUtils.js";

export let title = "";
export let withAd = false;
export let noLogo = false;
export let noTransition = false;
export let accentTitle = false;
export let noClose = false;
export let autoMargin = false;
export let alwaysOnTop = false;
export let banner = {};

const dispatch = createEventDispatcher();
const close = () => dispatch("close");
let isMobileWidth = isMobile();

const handleKeyDown = (e) => {
  if (e.key === "Escape" && !noClose) {
    close();
    return;
  }
};

const handleResize = () => {
  isMobileWidth = isMobile();
};
</script>

<svelte:window on:resize={handleResize} />

<div
  class="modal"
  class:withAd
  class:accentTitle
  class:autoMargin
  class:alwaysOnTop
  role="dialog"
  aria-modal="true"
  transition:fade={{ duration: !noTransition ? 200 : 0 }}
  on:keydown|stopPropagation={handleKeyDown}
  tabindex="-1">
  {#if !noClose}
    <button class="close" on:click={close}><CloseCrossSvg /></button>
  {/if}
  {#if !noLogo}<span class="logo" />{/if}
  {#if title}
    <h2 transition:fade>{title}</h2>
  {/if}
  <slot />
  {#if withAd && banner.url}
    <div
      style={!isMobileWidth ? "width: 938px" : "width: 100%"}
      class="bottom-container"
      on:click={window.open(banner.url, "_blank")}>
      <img
        src={banner.img}
        alt=""
        style="object-fit: cover;width: 100%;height: 100%;" />
    </div>
  {/if}
</div>

<style lang="scss">
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  padding: 5vh 32px;
  overflow: auto;
  background: var(--color-light);
  &.withAd {
    justify-content: flex-start;
  }
}

.close {
  display: block;
  position: absolute;
  top: 20px;
  right: 20px;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.logo {
  display: block;
  position: absolute;
  left: 18vw;
  top: 0px;
  width: 57px;
  height: 76px;
  background: var(--color-accent) url(../../images/logo.svg) 50% 50%/43px 56px
    no-repeat;
  border-radius: 0 0 2px 2px;
}

h2 {
  margin: 20vh 0 6vh;
  color: var(--color-dark);
  font-weight: 900;
  font-size: 24px;
  line-height: 29px;
  text-align: center;
  text-transform: uppercase;
}

.bottom-container {
  height: 150px;
  min-height: 150px;
  max-width: 100%;
  margin: auto 0 0;
  overflow: hidden;
  cursor: pointer;
}

.accentTitle {
  h2 {
    color: var(--color-accent);
  }
}

.autoMargin {
  h2 {
    margin-top: auto;
  }
}

.alwaysOnTop {
  h2 {
    margin-top: 40px;
  }
}

@media (max-width: 767px) {
  .modal {
    padding: 50px 12px 100px;
  }
  .close {
    right: 12px;
  }
  .logo {
    left: 12px;
  }
  h2 {
    margin-top: 64px;
  }
  .bottom-container {
    height: 106px;
    min-height: 106px;
    margin-top: 56px;
  }
  .autoMargin {
    h2 {
      margin-top: 64px;
    }
  }
}
</style>
