<script>
import MapSvg from "./icons/MapSvg.svelte";

export let onClick = () => {};
</script>

<button type="button" class="button show-on-map" on:click={onClick}
  ><span>Show on</span> <MapSvg /></button>

<style lang="scss">
.show-on-map {
  display: inline-flex;
  align-items: center;
  background: none;
  color: var(--color-accent);
  font-size: 14px;
  font-weight: 800;
  line-height: 22px;
  text-transform: uppercase;

  > span {
    margin-right: 6px;
  }
}
</style>
