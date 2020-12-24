<script>
import { isMobile } from "../utils/commonUtils.js";
import { createEventDispatcher } from "svelte";
import { fade } from "svelte/transition";

export let title = "";
export let withAd = false;
export let noLogo = false;
export let noTransition = false;
export let accentTitle = false;
export let noClose = false;

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
  role="dialog"
  aria-modal="true"
  transition:fade={{ duration: !noTransition ? 400 : 0 }}
  on:keydown|stopPropagation={handleKeyDown}
  tabindex="-1">
  {#if !noClose}<button class="close" on:click={close} />{/if}
  {#if !noLogo}<span class="logo" />{/if}
  {#if title}
    <h2 transition:fade>{title}</h2>
  {/if}
  <slot />
  {#if withAd && !isMobileWidth}
    <div style="width: 938px">
      <img
        src="images/stubs/stubad.jpg"
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
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  padding: 5vh 12px;
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
  border: 0;
  background: url(../../images/close-cross.svg);
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
  margin: auto 0 6vh;
  color: var(--color-dark);
  font-weight: 900;
  font-size: 24px;
  line-height: 29px;
  text-align: center;
  text-transform: uppercase;
}

div {
  height: 150px;
  min-height: 150px;
  max-width: 100%;
  margin: auto 0 0;
  overflow: hidden;
}

.accentTitle {
  h2 {
    color: var(--color-accent);
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
}
</style>
