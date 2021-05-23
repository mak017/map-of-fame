<script>
export let isLight = false;
</script>

<svg
  width="34"
  height="34"
  viewBox="0 0 34 34"
  xmlns="http://www.w3.org/2000/svg"
  class:isLight>
  <rect
    x="24.4707"
    y="7.4707"
    width="3"
    height="24"
    rx="1.5"
    transform="rotate(45 24.4707 7.4707)" />
  <rect
    x="26.4707"
    y="24.4707"
    width="3"
    height="24"
    rx="1.5"
    transform="rotate(135 26.4707 24.4707)" />
</svg>

<style lang="scss">
svg {
  width: 100%;
  height: 100%;
}
rect {
  fill: var(--color-dark);
}
.isLight {
  rect {
    fill: var(--color-light);
  }
}
</style>
