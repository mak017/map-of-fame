<script>
export let item = undefined;
// export let filterText;
export const getOptionLabel = undefined;
// export let isFirst;
// export let isActive;
// export let isHover;
</script>

<div class="item">
  <div class="name">{item.name}</div>
  {#if item.type}
    <div class="type">{item.type}</div>
  {/if}
</div>

<style lang="scss">
.item {
  display: flex;
  justify-content: space-between;
  padding: 7px 16px;
  &:hover {
    .name {
      opacity: 0.5;
    }
  }
}
.name {
  color: var(--color-dark);
  font-size: 18px;
  line-height: 1.22;
}
.type {
  opacity: 0.6;
  color: var(--color-dark);
  font-size: 13px;
  line-height: 1.22;
  text-transform: capitalize;
}
</style>
