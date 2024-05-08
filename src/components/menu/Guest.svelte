<script>
import { afterUrlChange, url } from "@roxi/routify";

import { isMenuOpen, settings } from "../../js/store";

$afterUrlChange(() => {
  isMenuOpen.set(false);
});
</script>

<ul class="links">
  <li>
    <a href={$url("/login")}>Login</a>
  </li>
  <li>
    <a
      href={$url(
        $settings.needInviteToRegister ? "/begistration" : "/registration",
      )}>Register</a>
  </li>
</ul>

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
  }
}
</style>
