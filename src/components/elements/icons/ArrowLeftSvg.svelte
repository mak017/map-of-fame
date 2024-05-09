<script>
export let isAccentColor = true;
export let isDarkColor = false;
export let isArrowUp = false;
export let isArrowDown = false;
</script>

<svg
  width="15"
  height="15"
  viewBox="0 0 15 15"
  xmlns="http://www.w3.org/2000/svg"
  class:isAccentColor
  class:isDarkColor
  class:isArrowUp
  class:isArrowDown>
  <path
    d="M13.35 0L0.55 7.17757L0 7.5L0.55 7.82243L13.35 15L14.5 14.3551L2.275 7.5L14.5 0.64486L13.35 0Z" />
</svg>

<style lang="scss">
svg {
  width: inherit;
  height: inherit;
}

.isAccentColor {
  path {
    fill: var(--color-accent);
  }
}

.isDarkColor {
  path {
    fill: var(--color-dark);
  }
}

.isArrowUp {
  transform: rotate(90deg);
}

.isArrowDown {
  transform: rotate(-90deg);
}
</style>
