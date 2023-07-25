<script>
import { createEventDispatcher } from "svelte";
import { fade, slide } from "svelte/transition";

import { isMobile } from "../utils/commonUtils.js";

import CloseCrossSvg from "./elements/icons/CloseCrossSvg.svelte";
import ArrowLeftSvg from "./elements/icons/ArrowLeftSvg.svelte";

export let id;
export let title = "";
export let withAd = false;
export let noLogo = false;
export let accentTitle = false;
export let noClose = false;
export let autoMargin = false;
export let alwaysOnTop = false;
export let stickyHeaderOnMobile = false;
export let banner = {};

const dispatch = createEventDispatcher();
const close = () => dispatch("close");
let isMobileWidth = isMobile();
let modalRef;
let scrollTop = 0;

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
  class:autoMargin={autoMargin && withAd && banner.url}
  class:alwaysOnTop
  class:stickyHeaderOnMobile={stickyHeaderOnMobile && scrollTop > 290}
  {id}
  role="dialog"
  aria-modal="true"
  on:keydown|stopPropagation={handleKeyDown}
  on:scroll={() => (scrollTop = modalRef.scrollTop)}
  bind:this={modalRef}
  tabindex="-1">
  {#if !noClose}
    <button class="close" on:click={close}><CloseCrossSvg /></button>
  {/if}
  {#if !noLogo}<span class="logo" />{/if}
  {#if title}
    <h2 transition:fade={{ duration: 200 }}>{title}</h2>
    {#if stickyHeaderOnMobile && scrollTop > 290}
      <div
        class="sticky-header"
        on:click={() => modalRef.scrollTo({ top: 0, behavior: "smooth" })}
        transition:slide={{ duration: 200 }}>
        <div class="back">
          <ArrowLeftSvg />
        </div>
        {title}
        {#if !noClose}
          <button class="close" on:click={close}><CloseCrossSvg /></button>
        {/if}
      </div>
    {/if}
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
  padding: max(5vh, 54px) 32px 5vh;
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
  background: inherit;
  cursor: pointer;
}

.logo {
  display: block;
  position: absolute;
  top: 15px;
  left: 18vw;
  width: 132px;
  height: 51px;
  background: url(../../images/logo.png) 50% 50% / contain no-repeat;
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

.sticky-header {
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1;
  padding: 26px 10px 10px;
  background-color: var(--color-light);
  color: var(--color-accent);
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
}

.back {
  width: 16px;
  height: 16px;
}

@media (max-width: 767px) {
  .modal {
    padding: 50px 12px 50px;
  }
  .close {
    right: 12px;
  }
  .logo {
    left: 12px;
    width: 97px;
    height: 37px;
  }
  h2 {
    margin-top: 64px;
  }
  .bottom-container {
    height: 106px;
    min-height: 106px;
    margin-top: 15px;
  }
  .autoMargin {
    h2 {
      margin-top: 64px;
    }
  }
  .stickyHeaderOnMobile {
    .sticky-header {
      display: flex;
      align-items: center;
    }
  }
}
</style>
