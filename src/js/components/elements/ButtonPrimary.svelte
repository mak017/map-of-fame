<script>
import { createEventDispatcher } from "svelte";
import { fade } from "svelte/transition";

export let isDisabled = false;
export let type = "button";
export let className = "";
export let text = "";

const dispatch = createEventDispatcher();
</script>

<button
  {type}
  class={`button${className ? ` ${className}` : ""}`}
  disabled={isDisabled}
  on:click={() => dispatch("click")}
  in:fade
  data-text={text}>{text}</button>

<style lang="scss">
button {
  position: relative;
  flex: 1 0 auto;
  padding: 12px 19px;
  background-color: var(--color-accent);
  color: var(--color-light);
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  &::after {
    --slice-0: inset(50% 50% 50% 50%);
    --slice-1: inset(80% -6px 0 0);
    --slice-2: inset(50% -6px 30% 0);
    --slice-3: inset(10% -6px 85% 0);
    --slice-4: inset(40% -6px 43% 0);
    --slice-5: inset(80% -6px 5% 0);
    content: attr(data-text);
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(
      45deg,
      transparent 3%,
      #00e6f6 3%,
      #00e6f6 5%,
      var(--color-accent) 5%
    );
    text-shadow: -3px -3px 0px #f8f005, 3px 3px 0px #00e6f6;
    clip-path: var(--slice-0);
  }
  &:hover {
    &::after {
      animation: 1s glitch steps(2, end);
    }
  }
  &:disabled {
    opacity: 0.4;
    pointer-events: none;
  }
  &.wide {
    width: 100%;
  }
}
.add-spot {
  padding: 9px 29px;
}
.search {
  width: 140px;
}

@keyframes glitch {
  0% {
    clip-path: var(--slice-1);
    transform: translate(-20px, -10px);
  }
  10% {
    clip-path: var(--slice-3);
    transform: translate(10px, 10px);
  }
  20% {
    clip-path: var(--slice-1);
    transform: translate(-10px, 10px);
  }
  30% {
    clip-path: var(--slice-3);
    transform: translate(0px, 5px);
  }
  40% {
    clip-path: var(--slice-2);
    transform: translate(-5px, 0px);
  }
  50% {
    clip-path: var(--slice-3);
    transform: translate(5px, 0px);
  }
  60% {
    clip-path: var(--slice-4);
    transform: translate(5px, 10px);
  }
  70% {
    clip-path: var(--slice-2);
    transform: translate(-10px, 10px);
  }
  80% {
    clip-path: var(--slice-5);
    transform: translate(20px, -10px);
  }
  90% {
    clip-path: var(--slice-1);
    transform: translate(-10px, 0px);
  }
  100% {
    clip-path: var(--slice-1);
    transform: translate(0);
  }
}
@media (max-width: 767px) {
  .wide-on-mobile {
    width: 100%;
    max-width: 350px;
    margin: 0 auto;
  }
}

@media (orientation: landscape) and (max-height: 960px) {
  .addSpot {
    padding: 10px 19px;
  }
}
</style>
