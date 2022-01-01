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
  in:fade={{ duration: 200 }}
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

  user-select: none;

  &::after {
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

    clip-path: var(--slice-0);
    --slice-0: inset(50% 50% 50% 50%);
    --slice-1: inset(80% -6px 0 0);
    --slice-2: inset(50% -6px 30% 0);
    --slice-3: inset(10% -6px 85% 0);
    --slice-4: inset(40% -6px 43% 0);
    --slice-5: inset(80% -6px 5% 0);
    text-shadow: -3px -3px 0 #f8f005, 3px 3px 0 #00e6f6;
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

  &.grey {
    background-color: var(--color-light-grey);
    pointer-events: none;
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
    transform: translate(-20px, -10px);

    clip-path: var(--slice-1);
  }

  10% {
    transform: translate(10px, 10px);

    clip-path: var(--slice-3);
  }

  20% {
    transform: translate(-10px, 10px);

    clip-path: var(--slice-1);
  }

  30% {
    transform: translate(0px, 5px);

    clip-path: var(--slice-3);
  }

  40% {
    transform: translate(-5px, 0px);

    clip-path: var(--slice-2);
  }

  50% {
    transform: translate(5px, 0px);

    clip-path: var(--slice-3);
  }

  60% {
    transform: translate(5px, 10px);

    clip-path: var(--slice-4);
  }

  70% {
    transform: translate(-10px, 10px);

    clip-path: var(--slice-2);
  }

  80% {
    transform: translate(20px, -10px);

    clip-path: var(--slice-5);
  }

  90% {
    transform: translate(-10px, 0px);

    clip-path: var(--slice-1);
  }

  100% {
    transform: translate(0);

    clip-path: var(--slice-1);
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
