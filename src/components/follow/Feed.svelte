<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import InfiniteScroll from "svelte-infinite-scroll";
import { url } from "@roxi/routify";

import { followFeedState } from "../../js/store";
import { getFollowingFeed } from "../../js/api/follow";
import { loadFromLocalStorage } from "../../js/utils/commonUtils";

import Spinner from "../elements/Spinner.svelte";

import { MAX_ITEMS_PER_PAGE } from "../../js/constants";

const token = loadFromLocalStorage("token") || null;
let newBatch = [];
let parentModal = null;

const fetchFeed = async (offset = 0, isNewFetch) => {
  followFeedState.setIsLoading(isNewFetch);
  followFeedState.setIsShowSpinner(true);
  const response = await getFollowingFeed(token, MAX_ITEMS_PER_PAGE, offset);
  const { success, result } = response;
  if (success && result) {
    if (isNewFetch) {
      followFeedState.setList([]);
    }
    newBatch = result.spots ? [...result.spots] : [];
    followFeedState.setList([...$followFeedState.list, ...newBatch]);
    followFeedState.setHasMore(newBatch.length === MAX_ITEMS_PER_PAGE);
    followFeedState.setIsFetched(true);
  }
  followFeedState.setIsLoading(false);
  followFeedState.setIsShowSpinner(false);
};

onMount(() => {
  parentModal = document.getElementById("follow-feed-modal");

  if ($followFeedState.scrollOffset) {
    setTimeout(() => {
      parentModal.scrollTo({
        top: $followFeedState.scrollOffset - parentModal.offsetHeight / 2,
      });
      followFeedState.setScrollOffset(0);
    }, 0);
  }
});

$: if (!$followFeedState.isFetched) {
  fetchFeed(0, true);
}

const handleLoadMore = () => {
  if ($followFeedState.isShowSpinner) {
    return;
  }

  const offset = $followFeedState.offset + MAX_ITEMS_PER_PAGE;
  followFeedState.setOffset(offset);
  fetchFeed(offset);
};

const handleSpotClick = (spot) => () => {
  const { id } = spot;
  const element = document.querySelector(`[data-scroll-element="${id}"]`);
  followFeedState.setScrollOffset(element.offsetTop);
};
</script>

<div class="container">
  <div class="top">
    <h2 class="title">Feed</h2>
  </div>
  <div class="data">
    <div class="spots">
      {#if !!$followFeedState.list.length || $followFeedState.isShowSpinner}
        {#if !$followFeedState.isLoading}
          {#each $followFeedState.list as spot}
            <a
              href={$url("/@:username/spot/:id", {
                username: spot.user.username,
                id: spot.id,
              })}
              class="button spot-card"
              on:click={handleSpotClick(spot)}
              data-scroll-element={spot.id}>
              <img
                loading="lazy"
                src={spot.thumbnail}
                alt={spot.title ?? `Spot ${spot.id}`}
                in:fade|global={{ duration: 200 }} />
            </a>
          {/each}
          {#if parentModal}
            <InfiniteScroll
              hasMore={$followFeedState.hasMore}
              threshold={100}
              on:loadMore={handleLoadMore}
              elementScroll={parentModal} />
          {/if}
        {/if}
        {#if $followFeedState.isShowSpinner}
          <div class="spinner-container">
            <Spinner margin="20px auto" />
          </div>
        {/if}
      {:else if !$followFeedState.isShowSpinner}
        <div class="empty-state">Nothing found</div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
.container {
  display: flex;
  flex: 1 0 auto;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 938px;
}

.top {
  margin-bottom: 32px;
}

.title {
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
}

.data {
  flex: 1 0 auto;
  width: 100%;
}

.spots {
  display: grid;
  grid-auto-rows: 160px;
  grid-gap: 4vmin;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  justify-content: space-between;
  width: 100%;
}

.spot-card {
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  background-color: #d3d3d3;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
  }
}

.spinner-container {
  position: relative;
}

@media (max-width: 767px) {
  .top {
    position: relative;
    flex-direction: column-reverse;
    margin-bottom: 18px;
  }
}
</style>
