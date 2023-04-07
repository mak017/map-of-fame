<script>
export let isActive = false;
</script>

<svg
  width="21"
  height="19"
  viewBox="0 0 21 19"
  xmlns="http://www.w3.org/2000/svg"
  class:isActive>
  <path
    d="M8.57422 16.7749L6.07422 11.2749L0.574219 8.7749L6.07422 6.2749L8.57422 0.774902L11.0742 6.2749L16.5742 8.7749L11.0742 11.2749L8.57422 16.7749ZM16.5742 18.7749L15.3242 16.0249L12.5742 14.7749L15.3242 13.5249L16.5742 10.7749L17.8242 13.5249L20.5742 14.7749L17.8242 16.0249L16.5742 18.7749Z" />
</svg>

<style lang="scss">
path {
  fill: var(--color-dark);
}
.isActive {
  path {
    fill: var(--color-light);
  }
}
</style>
