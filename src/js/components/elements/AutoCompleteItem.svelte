<script>
export let item = undefined;
export const filterText = undefined;
export const getOptionLabel = undefined;
export const isFirst = undefined;
export const isActive = undefined;
export const isHover = undefined;
</script>

<div class="item">
  <div class="name">{item.name}</div>
  {#if item.type}
    <div class="type">
      {item.type === "artists" ? item.type.slice(0, -1) : item.type}
    </div>
  {/if}
</div>

<style lang="scss">
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 20px;
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
