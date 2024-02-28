<script>
import ArtStSvg from "./icons/ArtStSvg.svelte";
import AutosSvg from "./icons/AutosSvg.svelte";
import MosaicSvg from "./icons/MosaicSvg.svelte";
import MuralsSvg from "./icons/MuralsSvg.svelte";
import OtherCategorySvg from "./icons/OtherCategorySvg.svelte";
import RailroadSvg from "./icons/RailroadSvg.svelte";
import WallsSvg from "./icons/WallsSvg.svelte";
export let categoryId;
export let isActive = false;
</script>

{#if categoryId === 1}
  <WallsSvg {isActive} />
{:else if categoryId === 2}
  <RailroadSvg {isActive} />
{:else if categoryId === 5}
  <ArtStSvg {isActive} />
{:else if categoryId === 6}
  <MuralsSvg {isActive} />
{:else if categoryId === 7}
  <AutosSvg {isActive} />
{:else if categoryId === 8}
  <MosaicSvg {isActive} />
{:else}
  <OtherCategorySvg {isActive} />
{/if}
