<script>
export let isLight = false;
</script>

<svg
  width="16"
  height="16"
  viewBox="0 0 16 16"
  class:isLight
  xmlns="http://www.w3.org/2000/svg">
  <path
    d="M1.0877 0.512451L0.512695 1.08745L7.4252 7.99995L0.512695 14.9125L1.0877 15.4875L8.0002 8.57495L14.9127 15.4875L15.4877 14.9125L8.5752 7.99995L15.4877 1.08745L14.9127 0.512451L8.0002 7.42495L1.0877 0.512451Z" />
</svg>

<style lang="scss">
svg {
  width: 100%;
  height: 100%;
}
path {
  fill: var(--color-dark);
}
.isLight {
  path {
    fill: var(--color-light);
  }
}
</style>
