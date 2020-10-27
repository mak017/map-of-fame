<script>
import ButtonPrimary from "../elements/ButtonPrimary.svelte";

export let close;
export let currentSpot;

const handleDelete = () => {
  console.log("delete", currentSpot);
  // send request
  close();
};
</script>

<div class="buttons">
  <button type="button" class="delete" on:click={handleDelete}>Delete</button>
  <ButtonPrimary type="button" text="Cancel" on:click={close} />
</div>

<style>
.buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 16px;
}
.delete {
  height: 46px;
  border: 1px solid var(--color-accent);
  border-radius: 2px;
  background: none;
  color: var(--color-accent);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.22;
  cursor: pointer;
}
</style>
