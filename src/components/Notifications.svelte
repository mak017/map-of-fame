<script>
import { onMount } from "svelte";
import InfiniteScroll from "svelte-infinite-scroll";

import { notificationsState } from "../js/store";
import {
  answerNotification,
  requestNotifications,
  setNotificationSeen,
} from "../js/api/notifications";
import { loadFromLocalStorage } from "../js/utils/commonUtils";

import Spinner from "./elements/Spinner.svelte";

import { MAX_ITEMS_PER_PAGE } from "../js/constants";

const token = loadFromLocalStorage("token") || null;
let newBatch = [];
let parentModal = null;

const fetchNotifications = async (offset = 0, isNewFetch) => {
  notificationsState.setIsLoading(isNewFetch);
  notificationsState.setIsShowSpinner(true);
  const response = await requestNotifications(token, {
    limit: MAX_ITEMS_PER_PAGE,
    offset,
  });
  const { success, result } = response;
  if (success && result) {
    if (isNewFetch) {
      notificationsState.setList([]);
    }
    newBatch = result.notifications ? [...result.notifications] : [];
    notificationsState.setList([...$notificationsState.list, ...newBatch]);
    notificationsState.setHasMore(newBatch.length === MAX_ITEMS_PER_PAGE);
    notificationsState.setIsFetched(true);
  }
  notificationsState.setIsLoading(false);
  notificationsState.setIsShowSpinner(false);
};

onMount(() => {
  parentModal = document.getElementById("notifications-modal");

  if ($notificationsState.scrollOffset) {
    setTimeout(() => {
      parentModal.scrollTo({
        top: $notificationsState.scrollOffset - parentModal.offsetHeight / 2,
      });
      notificationsState.setScrollOffset(0);
    }, 0);
  }
});

$: if (!$notificationsState.isFetched) {
  fetchNotifications(0, true);
}

const handleLoadMore = () => {
  if ($notificationsState.isShowSpinner) {
    return;
  }

  const offset = $notificationsState.offset + MAX_ITEMS_PER_PAGE;
  notificationsState.setOffset(offset);
  fetchNotifications(offset);
};

const handleButtonClick = (notification, confirm) => () => {
  const { id } = notification;
  answerNotification(token, id, confirm ? 1 : 0);
  const updatedList = $notificationsState.list.map((item) =>
    item.id === id ? { ...item, isAnswered: true } : item,
  );
  notificationsState.setList(updatedList);
};

const actionWhenInViewport = (element) => {
  const options = { root: parentModal, rootMargin: "0px", threshold: 1 };
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      if (element.classList.contains("unseen")) {
        setNotificationSeen(token, element.dataset.notificationId);
      }

      observer.disconnect();
    }
  }, options);

  observer.observe(element);
};
</script>

<div class="container">
  <div class="data">
    <div class="notifications">
      {#if !!$notificationsState.list.length || $notificationsState.isShowSpinner}
        {#if !$notificationsState.isLoading}
          {#each $notificationsState.list as notification}
            <div
              use:actionWhenInViewport
              class="notification"
              class:unseen={!notification.isSeen}
              data-notification-id={notification.id}>
              <div class="text">{@html notification.message}</div>
              {#if [1, 4].includes(notification.notificationTypeId) && !notification.isAnswered}
                <div class="buttons">
                  <button
                    type="button"
                    class="button"
                    on:click={handleButtonClick(notification, true)}
                    >Yes</button>
                  <button
                    type="button"
                    class="button"
                    on:click={handleButtonClick(notification, false)}
                    >No</button>
                </div>
              {/if}
            </div>
          {/each}
          {#if parentModal}
            <InfiniteScroll
              hasMore={$notificationsState.hasMore}
              threshold={100}
              on:loadMore={handleLoadMore}
              elementScroll={parentModal} />
          {/if}
        {/if}
        {#if $notificationsState.isShowSpinner}
          <div class="spinner-container">
            <Spinner margin="20px auto" />
          </div>
        {/if}
      {:else if !$notificationsState.isShowSpinner}
        <div class="empty-state">No notifications</div>
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

.notifications {
  width: 100%;
}

.notification {
  position: relative;
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--color-dark);
  border-radius: 4px;

  &.unseen {
    border-width: 2px;

    &::after {
      content: "";
      position: absolute;
      top: 10px;
      right: 10px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--color-error);
    }
  }
}

.buttons {
  margin-top: 8px;

  .button {
    min-width: 120px;
    padding: 2px 8px;
  }
}

.spinner-container {
  position: relative;
}
</style>
