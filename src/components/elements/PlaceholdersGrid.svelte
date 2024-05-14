<script>
export let amount = 18;
</script>

{#each [...Array(amount)] as _}
  <div class="item"></div>
{/each}

<style lang="scss">
.item {
  border-radius: 2px;
  overflow: hidden;
  background-color: var(--color-grey);

  &::before {
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    animation-duration: 1.25s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-name: placeHolderShimmer;
    animation-timing-function: linear;
    background: linear-gradient(
      to right,
      var(--color-light-grey) 10%,
      var(--color-grey) 18%,
      var(--color-light-grey) 33%
    );
    background-size: 800px 104px;
  }
}

@keyframes placeHolderShimmer {
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
  }
}
</style>
