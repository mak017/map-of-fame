<script>
import { createEventDispatcher } from "svelte";

export let item = undefined;

const dispatch = createEventDispatcher();
const onSelect = (selected) =>
  console.log("selected", selected) || dispatch("select", selected);
</script>

<div class="item" on:click={() => onSelect(item)}>
  <div class="name">{item.label}</div>
</div>

<style lang="scss">
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 20px;
  &:hover {
    .name {
      opacity: 0.7;
    }
  }
}
.name {
  color: var(--color-dark);
  font-size: 18px;
  line-height: 1.22;
}
</style>
