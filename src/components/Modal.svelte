<script>
import { createEventDispatcher } from "svelte";
import { fade, slide } from "svelte/transition";
import { url } from "@roxi/routify";

import { isLoggedIn, isMenuOpen } from "../js/store.js";
import { isMobile } from "../js/utils/commonUtils.js";

import LoggedIn from "./menu/LoggedIn.svelte";
import CloseCrossSvg from "./elements/icons/CloseCrossSvg.svelte";
import Guest from "./menu/Guest.svelte";

export let id;
export let title = "";
export let withAd = false;
export let withFooter = false;
export let noLogo = false;
export let accentTitle = false;
export let noClose = false;
export let noPaddingTop = false;
export let noMarginTop = false;
export let autoMargin = false;
export let alwaysOnTop = false;
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
  class:withFooter
  class:accentTitle
  class:autoMargin
  class:alwaysOnTop
  class:noPaddingTop
  class:noMarginTop
  {id}
  role="presentation"
  on:keydown|stopPropagation={handleKeyDown}
  on:scroll={() => (scrollTop = modalRef.scrollTop)}
  bind:this={modalRef}
  tabindex="-1">
  <div
    class="sticky-header"
    on:click={() => modalRef.scrollTo({ top: 0, behavior: "smooth" })}
    on:keydown={(e) =>
      e.key === "Enter" && modalRef.scroll({ top: 0, behavior: "smooth" })}
    transition:slide={{ duration: 200 }}
    role="button"
    tabindex={-1}>
    {#if !noClose}
      <button class="close" on:click={close}><CloseCrossSvg /></button>
    {/if}
    {#if title}
      <h2 transition:fade|global={{ duration: 200 }}>{@html title}</h2>
    {/if}
    {#if !noLogo}<a href={$url("/")} class="logo">Open map</a>{/if}
    <button
      class="button button-burger"
      on:click={() => {
        isMenuOpen.set(true);
      }}
      in:fade|global={{ duration: 200 }}>Profile</button>
  </div>
  <div class="content">
    <slot />
  </div>
  {#if withAd && banner.url}
    <button
      style={!isMobileWidth ? "width: 938px" : "width: 100%"}
      class="button bottom-container"
      on:click={window.open(banner.url, "_blank")}>
      <img
        src={banner.img}
        alt=""
        style="object-fit: cover;width: 100%;height: 100%;" />
    </button>
  {/if}
  {#if withFooter}
    <div class="footer">
      <a href="https://instagram.com/streeet.karta" target="_blank"
        >@streeet.karta</a>
    </div>
  {/if}
</div>

{#if $isMenuOpen}
  {#if $isLoggedIn}
    <LoggedIn />
  {:else}
    <Guest />
  {/if}
{/if}

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
  padding: calc(40px + max(5vh, 54px)) 32px 5vh;
  overflow: auto;
  background: var(--color-light);

  &.withAd {
    justify-content: flex-start;
  }

  &.noPaddingTop {
    padding-top: 40px;
  }
}

.close {
  display: block;
  position: absolute;
  top: 0;
  left: 10px;
  z-index: 1;
  width: 40px;
  height: 40px;
  padding: 12px;
  border: 0;
  background: inherit;
  cursor: pointer;
}

.logo {
  display: inline-block;
  width: 100px;
  height: 33px;
  border-radius: 0 0 2px 2px;
  background: url(../../images/logo.png) 50% 50% / contain no-repeat;
  filter: grayscale(1);
  color: transparent;
  font-size: 0;
}

h2 {
  position: relative;
  color: var(--color-dark);
  font-weight: 900;
  font-size: 24px;
  line-height: 29px;
  text-align: center;
  text-transform: uppercase;
}

.button-burger {
  position: absolute;
  top: 0;
  right: 10px;
  width: 40px;
  height: 40px;
  background-color: var(--color-light);
  background-image: url(../images/burger2.svg);
  background-repeat: no-repeat;
  background-position: 50% 50%;
  background-size: 20px 14px;
  color: transparent;
  font-size: 0;
}

.content {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 20vh;
}

.bottom-container {
  height: 150px;
  min-height: 150px;
  max-width: 100%;
  margin: auto 0 0;
  overflow: hidden;
  background: none;
}

.accentTitle {
  h2 {
    color: var(--color-accent);
  }
}

.autoMargin {
  .content {
    margin-top: auto;
  }
}

.alwaysOnTop {
  .content {
    margin-top: 40px;
  }
}

.noMarginTop {
  .content {
    margin-top: 0;
  }
}

.sticky-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1;
  height: 40px;
  padding: 0 10px;
  background-color: var(--color-light);
  color: var(--color-accent);
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
}

.footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;

  a {
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-size: 14px;
    font-weight: 900;
    line-height: 1.22;
    text-decoration: none;
    text-transform: uppercase;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}

@media (max-width: 767px) {
  .modal {
    padding: 50px 12px 50px;

    &.withFooter {
      padding-bottom: 25px;
    }
  }
  .close {
    right: 12px;
  }
  .logo {
    top: 27px;
    left: 12px;
    width: 97px;
    height: 37px;
  }
  .content {
    margin-top: 30px;
  }
  .bottom-container {
    height: 106px;
    min-height: 106px;
    margin-top: 15px;
  }
}
</style>
