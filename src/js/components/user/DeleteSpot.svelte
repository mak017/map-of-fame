<script>
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import { deleteSpot } from "../../api/spot";
import { loadFromLocalStorage } from "../../utils/commonUtils";

export let close;
export let currentSpot;
export let onSubmit;

let isInProgress = false;

const handleDelete = () => {
  const token = loadFromLocalStorage("token") || null;
  isInProgress = true;
  deleteSpot(token, currentSpot.id).then((response) => {
    const { success, result } = response;
    if (success && result) {
      onSubmit();
      close();
    }
    isInProgress = false;
  });
};
</script>

<div class="buttons">
  <button
    type="button"
    class="delete"
    on:click={handleDelete}
    disabled={isInProgress}>Delete</button>
  <ButtonPrimary
    type="button"
    text="Cancel"
    on:click={close}
    isDisabled={isInProgress} />
</div>

<style lang="scss">
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
  &:disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}
</style>
