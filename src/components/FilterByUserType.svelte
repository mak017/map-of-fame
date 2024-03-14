<script>
import { requestSpots } from "../js/init";
import { defaultUserTypeFilters, selectedYear } from "../js/store";
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from "../js/utils/commonUtils";

import HuntersSvg from "./elements/icons/HuntersSvg.svelte";

let selectedFilters;

$: selectedFilters =
  loadFromLocalStorage("userTypeFilters") || $defaultUserTypeFilters;

const handleFilterChange = (filter) => () => {
  selectedFilters[filter] = !selectedFilters[filter];
  saveToLocalStorage("userTypeFilters", selectedFilters);
  requestSpots($selectedYear);
};
</script>

<div class="switchers">
  <HuntersSvg
    isActive={selectedFilters.withHunters || selectedFilters.withNewbies} />
  <div class="switcher-buttons">
    <button
      type="button"
      class="button button-main_screen"
      class:isActive={selectedFilters.withHunters}
      on:click={handleFilterChange("withHunters")}>
      <span>Hunters</span>
    </button>
    <button
      type="button"
      class="button button-main_screen"
      class:isActive={selectedFilters.withNewbies}
      on:click={handleFilterChange("withNewbies")}>
      <span>Playground</span>
    </button>
  </div>
</div>

<style lang="scss">
.switchers {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  width: 40px;
  height: 40px;
  border-radius: 2px;
  background-color: var(--color-light);
  color: var(--color-dark);
  transition: background-color 0.3s 0.5s ease-in-out;

  .switcher-buttons {
    position: absolute;
    top: 0;
    left: 0;
    transform: scale(0.5);
    transform-origin: top left;
    transition:
      visibility 0.3s 0.5s ease-in-out,
      transform 0.3s 0.5s ease-in-out;
    visibility: hidden;
    background-color: inherit;
  }

  button {
    position: relative;
    height: 40px;
    padding: 8px 12px;
    background-color: var(--color-light);
    color: var(--color-dark);

    > span {
      display: flex;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s 0.3s ease-in-out;

      &::before {
        content: "";
        width: 24px;
        height: 15px;
        margin-right: 12px;
        border-radius: 15px;
        background-color: var(--color-dark);
        transition: background-color 0.3s;
      }

      &::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 13px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        transform: translateY(-50%);
        background-color: var(--color-light);
        transition: transform 0.3s;
      }
    }

    &.isActive {
      span {
        &::before {
          background-color: var(--color-accent);
        }

        &::after {
          transform: translate(10px, -50%);
        }
      }
    }
  }

  &:hover {
    background: transparent;
    transition: 0.3s ease-in-out;

    .switcher-buttons {
      transform: scale(1);
      transition:
        visibility 0.3s ease-in-out,
        transform 0.3s ease-in-out;
      visibility: visible;

      button > span {
        opacity: 1;
        transition: opacity 0.3s 0.3s ease-in-out;
      }
    }
  }
}
</style>
