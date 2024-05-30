<script>
export let isBeginner = false;
export let selectedType;

let clicked1 = false;
let clicked2 = false;
let clicked3 = false;
let clicked4 = false;
</script>

<div class="tiles" class:isBeginner>
  {#if selectedType}
    <button
      type="button"
      class="button tile {selectedType ? selectedType.toLowerCase() : ''}"
    ></button>
  {:else}
    <button
      type="button"
      class="button tile tile1"
      class:clicked={clicked1}
      on:click={() => (clicked1 = true)}></button>
    <button
      type="button"
      class="button tile tile2"
      class:clicked={clicked2}
      on:click={() => (clicked2 = true)}></button>
    <button
      type="button"
      class="button tile tile3"
      class:clicked={clicked3}
      on:click={() => (clicked3 = true)}></button>
    <button
      type="button"
      class="button tile tile4"
      class:clicked={clicked4}
      on:click={() => (clicked4 = true)}></button>
  {/if}
</div>

<style lang="scss">
.tiles {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;

  &:not(.isBeginner) {
    .tile1 {
      background-image: url(../../images/paint-roller.svg);
    }

    .tile2 {
      background-image: url(../../images/paint-bucket.svg);
    }

    .tile3 {
      background-image: url(../../images/paint-spray.svg);
    }

    .tile4 {
      background-image: url(../../images/paint-pistol.svg);
    }
  }

  &.isBeginner {
    .tile1 {
      background-image: url(../../images/sandbox.svg);
    }

    .tile2 {
      background-image: url(../../images/swing.svg);
    }

    .tile3 {
      background-image: url(../../images/seesaw.svg);
    }

    .tile4 {
      background-image: url(../../images/slide.svg);
    }
  }

  .tile1 {
    &.clicked {
      background-image: url(../../images/hand-fist.svg);
    }
  }

  .tile2 {
    &.clicked {
      background-image: url(../../images/hand-wrench.svg);
    }
  }

  .tile3 {
    &.clicked {
      background-image: url(../../images/hand-fist.svg);
    }
  }

  .tile4 {
    &.clicked {
      background-image: url(../../images/hand-four-fingers.svg);
    }
  }
}

.tile {
  width: 40px;
  height: 40px;
  margin: 0 2px;
  background-color: var(--color-accent-light);
  background-position: 50% 50%;
  background-repeat: no-repeat;
  cursor: pointer;

  &:hover {
    background-color: var(--color-accent-light-hover);
  }

  &.clicked {
    pointer-events: none;
  }

  &.hunter {
    background-image: url(../../images/hunter.svg);
  }

  &.artist {
    background-image: url(../../images/artist.svg);
  }

  &.crew {
    background-image: url(../../images/crew.svg);
  }
}
</style>
