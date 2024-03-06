<script>
export let isActive = false;
</script>

<svg
  width="25"
  height="15"
  viewBox="0 0 25 15"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class:isActive>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M3.10449 9V12H10.6045V9H3.10449ZM3.10449 6L10.6045 6V3H3.10449V6ZM13.6045 9V12H21.1045V9H13.6045ZM21.1045 6L13.6045 6V3H21.1045V6ZM1.10449 0C0.552207 0 0.104492 0.447715 0.104492 1V14C0.104492 14.5523 0.552208 15 1.10449 15H23.1045C23.6568 15 24.1045 14.5523 24.1045 14V1C24.1045 0.447715 23.6568 0 23.1045 0H1.10449Z" />
</svg>

<style lang="scss">
path {
  fill: var(--color-dark);
}

.isActive {
  path {
    fill: var(--color-accent);
  }
}
</style>
