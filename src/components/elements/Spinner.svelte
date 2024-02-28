<script>
export let height = 40;
export let margin = "10px auto";
export let isWhite = false;
</script>

<div
  class="spinner"
  class:isWhite
  style="width: {height}px; height: {height}px; margin: {margin};">
  <svg class="spinner-icon" viewBox="25 25 50 50">
    <circle
      class="spinner-path"
      cx="50"
      cy="50"
      r="20"
      fill="none"
      stroke="currentColor"
      stroke-width="5"
      stroke-miterlimit="10" />
  </svg>
</div>

<style lang="scss">
.spinner {
  color: var(--color-accent);
  animation: rotate 0.75s linear infinite;

  &.isWhite {
    color: var(--color-white);
  }
}

.spinner-icon {
  display: block;
  height: 100%;
  transform-origin: center center;
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  transform: none;
}

.spinner-path {
  stroke-dasharray: 90;
  stroke-linecap: round;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>
