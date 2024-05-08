<script>
import { onMount } from "svelte";
import { fade, fly } from "svelte/transition";
import { afterUrlChange, goto, url } from "@roxi/routify";

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
  selectedYear,
  userData,
} from "../../js/store";
import { requestSpots } from "../../js/init";
import { editUser, getInvites } from "../../js/api/auth";
import { requestNotifications } from "../../js/api/notifications";
import {
  isMobile,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "../../js/utils/commonUtils";

import CloseCrossSvg from "../elements/icons/CloseCrossSvg.svelte";
import Invites from "../user/Invites.svelte";
import Popup from "../Popup.svelte";

let showInvitesPopup = false;
let unusedInvitesCount = 0;
let unseenNotificationsCount;
const token = loadFromLocalStorage("token") || null;

$afterUrlChange(() => {
  isMenuOpen.set(false);
});

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
      requestSpots($selectedYear);
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
      on:click={() => {
        isShowOnMapMode.set(false);
        profileState.reset();
      }}>Profile</a>
  </li>
  <li>
    <details>
      <summary>Follow</summary>
      <ul class="sublinks">
        <li>
          <a href={$url("/follow-feed")} on:click={followFeedState.reset}
            >Feed</a>
        </li>
        <li>
          <a href={$url("/following")} on:click={followingState.reset}
            >Following</a>
        </li>
        <li>
          <a href={$url("/followers")} on:click={followersState.reset}
            >Followers</a>
        </li>
      </ul>
    </details>
  </li>
  <li>
    <a
      href={$url("/notifications")}
      class:hasUnread={unseenNotificationsCount > 0}
      on:click={notificationsState.reset}>Notifications</a>
  </li>
</ul>
<div class="hide-all">
  <button type="button" class="button hide-button" on:click={handleHideAllClick}
    >{$userData.isSpotsHidden ? "👀 Show" : "🚨 Hide"}</button>
  <div class="text">all your photos</div>
</div>
{#if $profileState.invites.length}
  <div class="invites">
    <button
      type="button"
      class="button"
      on:click={() => toggleInvitesPopup(true)}>🖖 Invites</button>
    <div class="text">for your friends</div>
  </div>
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
  font-weight: 600;

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

.hide-all,
.invites {
  width: 100%;
  padding: 10px;
  background-color: var(--color-lotion);
}

.hide-all {
  margin-bottom: 16px;
}

.button {
  background: none;
  font-weight: 600;
  line-height: 22px;

  &:hover {
    opacity: 0.7;
  }
}

.logout {
  align-self: flex-end;
  width: 35px;
  height: 55px;
  margin-top: auto;
  background: url(../../images/logout.svg) 50% 50% / 23px 47px no-repeat;
  color: transparent;
  font-size: 0;
}

@media (max-width: 767px) {
  .logout {
    margin-bottom: 0;
    font-size: 20px;
  }
}
</style>
