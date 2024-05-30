<script>
import { onMount } from "svelte";
import InfiniteScroll from "svelte-infinite-scroll";
import { goto, url } from "@roxi/routify";

import { followersState, profileState } from "../../js/store";
import { followUser, getFollowers, unfollowUser } from "../../js/api/follow";
import { isMobile, loadFromLocalStorage } from "../../js/utils/commonUtils";

import Spinner from "../elements/Spinner.svelte";

import { MAX_ITEMS_PER_PAGE } from "../../js/constants";

const token = loadFromLocalStorage("token") || null;
let newBatch = [];
let parentModal = null;

const fetchUsers = async (offset = 0, isNewFetch) => {
  followersState.setIsLoading(isNewFetch);
  followersState.setIsShowSpinner(true);
  const response = await getFollowers(token, MAX_ITEMS_PER_PAGE, offset);
  const { success, result } = response;
  if (success && result) {
    if (isNewFetch) {
      followersState.setList([]);
    }
    newBatch = result.followers ? [...result.followers] : [];
    followersState.setList([...$followersState.list, ...newBatch]);
    followersState.setHasMore(newBatch.length === MAX_ITEMS_PER_PAGE);
    followersState.setTotal(result.followersCount);
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

  const offset = $followersState.offset + MAX_ITEMS_PER_PAGE;
  followersState.setOffset(offset);
  fetchUsers(offset);
};

const navigateToUserProfile = (user) => {
  const element = document.querySelector(`[data-scroll-element="${user.id}"]`);
  followersState.setScrollOffset(element.offsetTop);
  profileState.reset();
  $goto("/@:username", { username: user.username });
};

const handleUserClick = (user) => (event) => {
  if (event.target.nodeName === "BUTTON" || isMobile()) return;

  navigateToUserProfile(user);
};

const handleFollowBtnClick = (user) => async () => {
  const request = user.isFollowing ? unfollowUser : followUser;
  const { success } = await request(token, user.id);

  if (success) {
    const updatedList = $followersState.list.map((item) =>
      item.id === user.id ? { ...item, isFollowing: !user.isFollowing } : item,
    );
    followersState.setList(updatedList);
  }
};
</script>

<div class="container">
  <div class="data">
    <div class="users">
      {#if !!$followersState.list.length || $followersState.isShowSpinner}
        {#if !$followersState.isLoading}
          {#if !isMobile()}
            <div class="list-head">
              <div class="cell">Username</div>
              <div class="cell">Artist</div>
              <div class="cell">Crew</div>
              <div class="cell spots">Spots</div>
              <div class="cell followers">Followers</div>
            </div>
          {/if}
          {#each $followersState.list as user (user.id)}
            <a
              href={$url("/@:username", { username: user.username })}
              class="list-row"
              data-scroll-element={user.id}
              on:click|preventDefault={handleUserClick(user)}>
              <div class="cell username">
                {#if isMobile()}
                  <div class="head">Username</div>
                {/if}
                <div class="value">
                  {`@${user.username}`}
                </div>
              </div>
              {#if !isMobile() || user.artist}
                <div class="cell artist">
                  {#if isMobile()}
                    <div class="head">Artist</div>
                  {/if}
                  <div class="value">
                    {user.artist?.name ?? ""}
                  </div>
                </div>
              {/if}
              {#if !isMobile() || user.crew}
                <div class="cell crew">
                  {#if isMobile()}
                    <div class="head">Crew</div>
                  {/if}
                  <div class="value">
                    {user.crew?.name ?? ""}
                  </div>
                </div>
              {/if}
              <div class="cell spots">
                {#if isMobile()}
                  <div class="head">Spots</div>
                {/if}
                <div class="value">{user.spotsCount ?? ""}</div>
              </div>
              <div class="cell followers">
                {#if isMobile()}
                  <div class="head">Followers</div>
                {/if}
                <div class="value">
                  <span>{user.followersCnt ?? ""}</span>
                  <button
                    type="button"
                    class="button follow"
                    on:click={handleFollowBtnClick(user)}
                    >{user.isFollowing ? "Unfollow" : "Follow"}</button>
                </div>
              </div>
              {#if isMobile()}
                <div class="overlay">
                  <a
                    href={$url("/@:username", { username: user.username })}
                    class="button view"
                    on:click|preventDefault={() => navigateToUserProfile(user)}
                    >👁</a>
                  <button
                    type="button"
                    class="button follow-mobile"
                    on:click={handleFollowBtnClick(user)}
                    >{user.isFollowing ? "Unfollow" : "Follow"}</button>
                </div>
              {/if}
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

.data {
  flex: 1 0 auto;
  width: 100%;
}

.list {
  &-head,
  &-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr) 0.5fr 0.5fr;
  }

  &-head {
    margin-bottom: 16px;
    background-color: var(--color-light);
    color: color-mix(in srgb, var(--color-dark) 60%, transparent);
    font-size: 13px;
    font-weight: 400;
  }

  &-row {
    margin-bottom: 24px;
    transition: color 0.3s;
    color: var(--color-dark);
    font-size: 16px;
    font-weight: 400;
    text-decoration: none;
    cursor: pointer;
  }
}

.username,
.artist,
.crew {
  overflow: hidden;

  .value {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.spots,
.followers {
  text-align: center;
}

.followers {
  .value {
    position: relative;

    span {
      transition: 0.15s;
    }
  }
}

.follow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 110px;
  height: 30px;
  transform: translate(-50%, -50%);
  opacity: 0;
  background: var(--color-accent-light);
  transition: 0.15s;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.overlay {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  transform: translateY(-100%);
  border-radius: inherit;
  opacity: 0;
  background: rgba($color: #000, $alpha: 0.45);
}

.view,
.follow-mobile {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  margin: 8px;
  background-color: var(--color-accent);
  color: var(--color-light);
  text-decoration: none;
}

.view {
  width: 40px;
  font-size: 24px;
}

.follow-mobile {
  width: 110px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.spinner-container {
  position: relative;
}

@media (min-width: 768px) {
  .list-row:hover {
    color: var(--color-accent);

    .followers .value {
      span {
        opacity: 0;
      }

      .follow {
        opacity: 1;
      }
    }
  }
}

@media (max-width: 767px) {
  .list {
    &-row {
      position: relative;
      grid-template-columns: repeat(4, 1fr);
      row-gap: 8px;
      margin: 0 -12px;
      padding: 12px;
      border-top: 1px solid
        color-mix(in srgb, var(--color-light-grey) 30%, transparent);
      overflow: hidden;

      &:last-of-type {
        border-bottom: 1px solid
          color-mix(in srgb, var(--color-light-grey) 30%, transparent);
      }

      .head {
        color: color-mix(in srgb, var(--color-dark) 60%, transparent);
        font-size: 13px;
      }

      .value {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .username {
        grid-column: 3/5;
        grid-row: 1;
        text-align: end;
      }

      .artist {
        grid-column: 1/3;
        grid-row: 1;
      }

      .crew {
        grid-column: 1/3;
      }

      &:hover {
        .overlay {
          opacity: 1;
          transform: translateY(0);
          transition:
            transform 0.05s,
            opacity 0.25s 0.05s;
        }
      }
    }
  }

  .spots {
    grid-column: 3;
    text-align: end;
  }

  .followers {
    grid-column: 4;
    text-align: end;
  }
}
</style>
