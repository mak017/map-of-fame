<script>
import ButtonModalBack from "../elements/ButtonModalBack.svelte";
import SpotForm from "../SpotForm.svelte";

export let editSpotData;
export let toggleEditModal;
</script>

<div class="edit-spot">
  <ButtonModalBack on:click={() => toggleEditModal(false)} />
  <h2>Edit Spot</h2>
  <SpotForm {editSpotData} onCancel={() => toggleEditModal(false)} />
</div>

<style>
.edit-spot {
  position: relative;
  width: 100%;
  max-width: 938px;
  margin-top: 80px;
}
h2 {
  margin: -20px 0 66px;
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
}

@media (max-width: 767px) {
  .edit-spot {
    margin-top: 50px;
  }
  h2 {
    margin-bottom: 24px;
  }
}
</style>
