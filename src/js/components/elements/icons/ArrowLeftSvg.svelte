<script>
export let isAccentColor = true;
export let isDarkColor = false;
export let isArrowUp = false;
export let isArrowDown = false;
</script>

<svg
  width="20"
  height="20"
  viewBox="0 0 20 20"
  xmlns="http://www.w3.org/2000/svg"
  class:isAccentColor
  class:isDarkColor
  class:isArrowUp
  class:isArrowDown>
  <path
    d="M11.0718 1.07177C10.486 0.485986 9.53624 0.485984 8.95045 1.07177L1.56356 8.45867C1.50592 8.50166 1.45067 8.54933 1.39832 8.60168C1.05326 8.94674 0.911464 9.41808 0.972914 9.86693C1.01246 10.1871 1.15511 10.4969 1.40088 10.7427C1.44674 10.7885 1.49483 10.8308 1.5448 10.8695L8.95022 18.2749C9.53601 18.8607 10.4858 18.8607 11.0715 18.2749C11.6573 17.6891 11.6573 16.7394 11.0715 16.1536L4.59142 9.67346L11.0718 3.19309C11.6576 2.60731 11.6576 1.65756 11.0718 1.07177Z" />
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
