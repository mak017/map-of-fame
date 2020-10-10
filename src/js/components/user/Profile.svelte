<script>
import { isLoggedIn, userData } from "../../store";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";

export let onAddSpotBtnClick;
export let showUserProfile;

let username = "";

userData.subscribe((value) => (username = value.name));

const handleLogout = () => {
  isLoggedIn.set(false);
  userData.set({});
  showUserProfile(false);
};

const handleAddSpot = () => {
  onAddSpotBtnClick();
  showUserProfile(false);
};
</script>

<div class="container">
  <div class="top">
    <div class="username">{username}</div>
    <button class="logout" on:click={handleLogout}>Logout</button>
  </div>
  <div class="empty-state">
    <img src="../../../images/empty.png" alt="Empty" />
    <p>Spot not</p>
    <ButtonPrimary text="Add spot" type="button" on:click={handleAddSpot} />
  </div>
</div>

<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 0 auto;
  width: 100%;
  max-width: 938px;
}
.top {
  display: flex;
  align-self: stretch;
  justify-content: space-between;
  margin-bottom: auto;
}
.username {
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
}
.logout {
  border: 0;
  opacity: 0.4;
  transition: opacity 0.3s;
  background: none;
  color: var(--color-accent);
  font-size: 18px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}

.empty-state {
  margin-bottom: auto;
  text-align: center;
  img {
    width: 195px;
  }
  p {
    margin: 36px 0;
    color: var(--color-dark);
    font-size: 24px;
    font-weight: 900;
    line-height: 1.22;
    text-transform: uppercase;
  }
}

@media (max-width: 767px) {
  .top {
    flex-direction: column-reverse;
  }
  .logout {
    width: 30px;
    height: 30px;
    margin: -30px 0 52px;
    font-size: 0;
    background: url(../../../images/logout.svg) 50% 50%/27px 27px no-repeat;
  }
}
</style>
