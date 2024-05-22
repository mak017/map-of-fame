<script>
import { onMount } from "svelte";
import { goto, isActive, url } from "@roxi/routify";

import {
  followersState,
  followFeedState,
  followingState,
  isLoggedIn,
  isMenuOpen,
  isShowOnMapMode,
  isUserVerifyProgress,
  notificationsState,
  profileState,
  userData,
} from "../../js/store";
import { editUser, getInvites } from "../../js/api/auth";
import { requestNotifications } from "../../js/api/notifications";
import {
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "../../js/utils/commonUtils";

import Invites from "../user/Invites.svelte";
import Popup from "../Popup.svelte";

let showInvitesPopup = false;
let unusedInvitesCount = 0;
let unseenNotificationsCount;
const token = loadFromLocalStorage("token") || null;

const toggleInvitesPopup = (toggle) => (showInvitesPopup = toggle);

const getNotificationsCount = async () => {
  const { success, result } = await requestNotifications(token, {
    limit: 1,
    offset: 0,
  });

  if (success && result) {
    unseenNotificationsCount = result.totalUnseen;
  }
};

onMount(() => {
  getNotificationsCount();
});

const handleHideAllClick = () => {
  editUser(token, $userData.id, {
    isSpotsHidden: Number(!$userData.isSpotsHidden),
  }).then((response) => {
    const { success, result } = response;
    if (success && result) {
      $userData.isSpotsHidden = result.isSpotsHidden === "1";
      $goto("/@:username", { username: $userData.username });
    }
  });
};

const handleLogout = () => {
  removeFromLocalStorage("token");
  isLoggedIn.set(false);
  userData.set({});
  setTimeout(() => {
    profileState.setInvites([]);
  }, 500);
  isMenuOpen.set(false);
  $goto("/");
};

const handleLinkInteraction = (path, callback) => (event) => {
  if ("key" in event && event.key !== "Enter") {
    return;
  }

  if (!$isActive(path)) {
    callback();
  }

  isMenuOpen.set(false);
};

const handleProfileInteraction = (event) => {
  if ("key" in event && event.key !== "Enter") {
    return;
  }

  const isActiveRoute = $isActive("/@[username]", {
    username: $userData.username,
  });
  if (!isActiveRoute) {
    isShowOnMapMode.set(false);
    profileState.reset();
  }
  isMenuOpen.set(false);
};

$: if (
  !$profileState.invites.length &&
  !$isUserVerifyProgress &&
  $userData.level > 3
) {
  getInvites(token).then((response) => {
    const { success, result } = response;
    if (success && result) {
      profileState.setInvites(result);
    }
  });
}

$: unusedInvitesCount = $profileState.invites.reduce(
  (accumulator, invite) =>
    !invite.invitedUserId ? accumulator + 1 : accumulator,
  0,
);
</script>

<ul class="links">
  <li>
    <a
      href={$url("/@:username", { username: $userData.username })}
      on:click={handleProfileInteraction}
      on:keydown={handleProfileInteraction}>Profile</a>
  </li>
  <li>
    <details>
      <summary>Follow</summary>
      <ul class="sublinks">
        <li>
          <a
            href={$url("/follow-feed")}
            on:click={handleLinkInteraction(
              "/follow-feed",
              followFeedState.reset,
            )}
            on:keydown={handleLinkInteraction(
              "/follow-feed",
              followFeedState.reset,
            )}>Feed</a>
        </li>
        <li>
          <a
            href={$url("/following")}
            on:click={handleLinkInteraction("/following", followingState.reset)}
            on:keydown={handleLinkInteraction(
              "/following",
              followingState.reset,
            )}>Following</a>
        </li>
        <li>
          <a
            href={$url("/followers")}
            on:click={handleLinkInteraction("/followers", followersState.reset)}
            on:keydown={handleLinkInteraction(
              "/followers",
              followersState.reset,
            )}>Followers</a>
        </li>
      </ul>
    </details>
  </li>
  <li>
    <a
      href={$url("/notifications")}
      class:hasUnread={unseenNotificationsCount > 0}
      on:click={handleLinkInteraction(
        "/notifications",
        notificationsState.reset,
      )}
      on:keydown={handleLinkInteraction(
        "/notifications",
        notificationsState.reset,
      )}>Notifications</a>
  </li>
</ul>

<button type="button" class="button hide-button" on:click={handleHideAllClick}>
  <div class="text-top">{$userData.isSpotsHidden ? "👀 Show" : "🚨 Hide"}</div>
  <div class="text">all your photos</div>
</button>
{#if $profileState.invites.length}
  <button
    type="button"
    class="button invites"
    on:click={() => toggleInvitesPopup(true)}>
    <div class="text-top">🖖 Invites</div>
    <div class="text">for your friends</div>
  </button>
{/if}
<button type="button" class="button logout" on:click={handleLogout}
  ><span>Logout</span></button>

{#if showInvitesPopup}
  <Popup
    title={`Invites ${unusedInvitesCount}/${$profileState.invites.length} 👽`}
    on:close={() => toggleInvitesPopup(false)}>
    <Invites
      close={() => toggleInvitesPopup(false)}
      invites={$profileState.invites}
      username={$userData.username} />
  </Popup>
{/if}

<style lang="scss">
.links {
  margin-bottom: 16px;
  font-weight: 500;

  a {
    display: block;
    margin-bottom: 16px;
    color: inherit;
    text-decoration: none;

    &:hover {
      opacity: 0.7;
    }

    &.hasUnread {
      display: flex;
      align-items: center;

      &::before {
        content: "";
        width: 8px;
        height: 8px;
        margin-right: 8px;
        border-radius: 50%;
        background-color: var(--color-accent);
      }
    }
  }

  details {
    a {
      margin-left: 7px;
      font-size: 16px;
    }

    &[open] {
      margin-bottom: 16px;

      > summary::after {
        transform: rotate(180deg);
      }
    }
  }

  summary {
    display: flex;
    margin-bottom: 16px;
    cursor: pointer;

    &::after {
      content: "";
      width: 8px;
      margin-left: 12px;
      background: url(../../images/triangle-down.svg) 50% 50% / 8px 5px
        no-repeat;
      transition: transform 0.3s;
    }
  }
}

.hide-button,
.invites {
  width: 100%;
  padding: 10px;
  background-color: var(--color-accent-light);
  transition: 0.2s;
  text-align: start;

  &:hover {
    background-color: var(--color-accent-light-hover);
  }
}

.hide-button {
  margin-bottom: 16px;
}

.text-top {
  font-weight: 500;
  line-height: 22px;
}

.logout {
  align-self: flex-end;
  width: 40px;
  height: 55px;
  margin-top: auto;
  background: var(--color-accent-light) url(../../images/logout.svg) 50% 50% /
    23px 47px no-repeat;
  color: transparent;
  font-size: 0;

  &:hover {
    background-color: var(--color-accent-light-hover);
  }
}
</style>
