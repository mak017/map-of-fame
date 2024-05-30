<script>
import { url } from "@roxi/routify";

import { isMenuOpen, settings } from "../../js/store";

const closeMenu = () => isMenuOpen.set(false);

const closeMenuOnEnter = (e) => e.key === "Enter" && closeMenu();
</script>

<ul class="links">
  <li>
    <a href={$url("/login")} on:click={closeMenu} on:keydown={closeMenuOnEnter}
      >Log in</a>
  </li>
  <li>
    <a
      href={$url(
        $settings.needInviteToRegister ? "/begistration" : "/registration",
      )}
      on:click={closeMenu}
      on:keydown={closeMenuOnEnter}>Sign up</a>
  </li>
</ul>

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
  }
}
</style>
