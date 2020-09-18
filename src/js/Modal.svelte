<style>
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  overflow: auto;
  background: white;
}

.close {
  display: block;
  position: absolute;
  top: 20px;
  right: 20px;
  width: 34px;
  height: 34px;
  border: 0;
  background: url(../images/close-cross.svg);
  cursor: pointer;
}

</style>

<script>
import { createEventDispatcher } from "svelte";

const dispatch = createEventDispatcher();
const close = () => dispatch("close");

const handle_keydown = (e) => {
  if (e.key === "Escape") {
    close();
    return;
  }

  // if (e.key === "Tab") {
  //   // trap focus
  //   const nodes = modal.querySelectorAll("*");
  //   const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0);

  //   let index = tabbable.indexOf(document.activeElement);
  //   if (index === -1 && e.shiftKey) index = 0;

  //   index += tabbable.length + (e.shiftKey ? -1 : 1);
  //   index %= tabbable.length;

  //   tabbable[index].focus();
  //   e.preventDefault();
  // }
};

// const previously_focused =
//   typeof document !== "undefined" && document.activeElement;

// if (previously_focused) {
//   onDestroy(() => {
//     previously_focused.focus();
//   });
// }
</script>

<svelte:window on:keydown="{handle_keydown}" />

<div class="modal" role="dialog" aria-modal="true">
  <button class="close" on:click="{close}"></button>
  <slot name="header" />
  <slot />

  <!-- svelte-ignore a11y-autofocus -->
</div>
