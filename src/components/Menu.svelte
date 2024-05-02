<script>
import { fade, fly } from "svelte/transition";
import { goto, url } from "@roxi/routify";

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
} from "../js/store";
import { requestSpots } from "../js/init";
import { editUser, getInvites } from "../js/api/auth";
import {
  isMobile,
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "../js/utils/commonUtils";

import CloseCrossSvg from "./elements/icons/CloseCrossSvg.svelte";
import Popup from "./Popup.svelte";
import Invites from "./user/Invites.svelte";
import { requestNotifications } from "../js/api/notifications";
import { onMount } from "svelte";

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

<div
  class="overlay"
  transition:fade={{ duration: 200 }}
  on:click={() => isMenuOpen.set(false)}
  role="presentation"
  tabIndex="-1">
</div>
<div
  class="menu"
  transition:fly={{ x: !isMobile() ? 364 : window.innerWidth, duration: 300 }}>
  <div class="logo" />
  <button class="close" on:click={() => isMenuOpen.set(false)}>
    <CloseCrossSvg />
  </button>
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
      <a href={$url("/notifications")} on:click={notificationsState.reset}
        >Notifications {typeof unseenNotificationsCount === "number"
          ? `(${unseenNotificationsCount})`
          : ""}</a>
    </li>
  </ul>
  {#if $profileState.invites.length}
    <div class="invites">
      <button
        type="button"
        class="button"
        on:click={() => toggleInvitesPopup(true)}>🖖 Invites</button>
      <div class="text">for your friends</div>
    </div>
  {/if}
  <div class="hide-all">
    <button
      type="button"
      class="button hide-button"
      on:click={handleHideAllClick}
      >{$userData.isSpotsHidden ? "👀 Show" : "🚨 Hide"}</button>
    <div class="text">all your photos</div>
  </div>
  <button type="button" class="button logout" on:click={handleLogout}
    ><span>Logout</span></button>
  {#if !isMobile()}
    <div class="footer">
      <a href="https://instagram.com/streeet.karta" target="_blank"
        >@streeet.karta</a>
    </div>
  {/if}
</div>

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
.overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  background: var(--color-dark);
  opacity: 0.6;
}
.menu {
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  flex-direction: column;
  align-items: flex-start;
  width: 364px;
  padding: 36px 28px 32px 33px;
  background-color: var(--color-light);
  color: var(--color-dark);
  font-size: 18px;

  button {
    background: none;
    font-weight: 600;
    line-height: 22px;

    &:hover {
      opacity: 0.7;
    }
  }
}

.logo {
  position: absolute;
  top: 0;
  right: 100%;
  width: 208px;
  height: 100px;
  padding: 0 20px;
  background: var(--color-lotion) url(../../images/logo.png) 50% 50% / 151px
    no-repeat;
}

.close {
  display: block;
  position: absolute;
  top: 28px;
  right: 14px;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

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
  }

  details {
    a {
      margin-left: 15px;
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

.invites {
  margin-bottom: 16px;
}

.logout {
  align-self: flex-end;
  margin: auto 0 42px;
}

.footer {
  font-size: 14px;
  font-weight: 600;
  text-align: center;

  a {
    opacity: 0.4;
    color: inherit;
    text-decoration: none;

    &:hover {
      opacity: 1;
    }
  }
}

@media (max-width: 767px) {
  .menu {
    width: 100%;
    padding: 18px 24px 24px 22px;
    font-size: 24px;
  }

  .logo {
    position: static;
    justify-content: flex-start;
    width: 110px;
    height: 40px;
    margin-bottom: 24px;
    background-color: transparent;
    background-size: 120px;
  }

  .logout {
    margin-bottom: 0;
    font-size: 20px;
  }
}
</style>
