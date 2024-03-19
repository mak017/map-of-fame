<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import InfiniteScroll from "svelte-infinite-scroll";
import { url } from "@roxi/routify";

import { followersState } from "../../js/store";
import { getFollowers } from "../../js/api/follow";
import { loadFromLocalStorage } from "../../js/utils/commonUtils";

import Spinner from "../elements/Spinner.svelte";

import { MAX_SPOTS_PER_PAGE } from "../../js/constants";

const token = loadFromLocalStorage("token") || null;
let newBatch = [];
let parentModal = null;

const fetchUsers = async (offset = 0, isNewFetch) => {
  followersState.setIsLoading(isNewFetch);
  followersState.setIsShowSpinner(true);
  const response = await getFollowers(token, MAX_SPOTS_PER_PAGE, offset);
  const { success, result } = response;
  if (success && result) {
    if (isNewFetch) {
      followersState.setList([]);
    }
    newBatch = result.followers ? [...result.followers] : [];
    followersState.setList([...$followersState.list, ...newBatch]);
    // followersState.setGridTotal(result.total);
    followersState.setHasMore(newBatch.length === MAX_SPOTS_PER_PAGE);
    followersState.setIsFetched(true);
  }
  followersState.setIsLoading(false);
  followersState.setIsShowSpinner(false);
};

onMount(() => {
  parentModal = document.getElementById("followers-modal");

  if ($followersState.scrollOffset) {
    setTimeout(() => {
      parentModal.scrollTo({
        top: $followersState.scrollOffset - parentModal.offsetHeight / 2,
      });
      followersState.setScrollOffset(0);
    }, 0);
  }
});

$: if (!$followersState.isFetched) {
  fetchUsers(0, true);
}

const handleLoadMore = () => {
  if ($followersState.isShowSpinner) {
    return;
  }

  const offset = $followersState.offset + MAX_SPOTS_PER_PAGE;
  followersState.setOffset(offset);
  fetchUsers(offset);
};

const handleUserClick = (user) => () => {
  const element = document.querySelector(`[data-scroll-element="${user.id}"]`);
  followersState.setScrollOffset(element.offsetTop);
};
</script>

<div class="container">
  <div class="top">
    <h2 class="title">Followers</h2>
  </div>
  <div class="data">
    <div class="users">
      {#if !!$followersState.list.length || $followersState.isShowSpinner}
        {#if !$followersState.isLoading}
          {#each $followersState.list as user}
            <a
              href={$url("/@:username", { username: user.username })}
              class="button user-card"
              on:click={handleUserClick(user)}
              data-scroll-element={user.id}>
              <div class="avatar">
                {#if user.background}
                  <img
                    loading="lazy"
                    src={user.background}
                    alt={user.username}
                    in:fade|global={{ duration: 200 }} />
                {/if}
              </div>
              <div>{`@${user.username}`}</div>
            </a>
          {/each}
          {#if parentModal}
            <InfiniteScroll
              hasMore={$followersState.hasMore}
              threshold={100}
              on:loadMore={handleLoadMore}
              elementScroll={parentModal} />
          {/if}
        {/if}
        {#if $followersState.isShowSpinner}
          <div class="spinner-container">
            <Spinner margin="20px auto" />
          </div>
        {/if}
      {:else if !$followersState.isShowSpinner}
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

.users {
  display: grid;
  grid-auto-rows: 160px;
  grid-gap: 4vmin;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  justify-content: space-between;
  width: 100%;
}

.user-card {
  position: relative;
  border-radius: 2px;
  overflow: hidden;
  color: var(--color-dark);
  text-align: center;
  cursor: pointer;

  .avatar {
    width: 140px;
    height: 140px;
    margin: auto;
    border-radius: 50%;
    overflow: hidden;
    background-color: #d3d3d3;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
  }

  &:hover {
    text-decoration: none;
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
