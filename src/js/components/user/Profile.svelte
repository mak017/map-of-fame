<script>
import CustomSelect from "../elements/CustomSelect.svelte";
import { isLoggedIn, userData, userSpots } from "../../store";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";

export let onAddSpotBtnClick;
export let showUserProfile;

let username = "";
let spotsData = [];
let year;

userData.subscribe((value) => (username = value.name));
userSpots.subscribe((value) => (spotsData = value));

const years = [...new Set(spotsData.map((data) => data.year))];
year = Math.max(...years);
console.log("years", years);
console.log("year", year);

const handleLogout = () => {
  isLoggedIn.set(false);
  userData.set({});
  showUserProfile(false);
};

const handleAddSpot = () => {
  onAddSpotBtnClick();
  showUserProfile(false);
};

const getSpotsByYear = () => spotsData.filter((data) => data.year === year);
console.log("getSpotsByYear()", getSpotsByYear());
</script>

<div class="container">
  <div class="top">
    <div class="username">{username}</div>
    <button class="logout" on:click={handleLogout}>Logout</button>
  </div>
  {#if !!spotsData.length}
    <div class="data">
      <div class="year-select">
        <CustomSelect items={years} selectedValue={year} isClearable={false} />
      </div>
      <div class="spots">
        {#each getSpotsByYear() as spot}
          <div class="spot-card"><img src={spot.img} alt="" /></div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <img src="../../../images/empty.png" alt="Empty" />
      <p>Spot not</p>
      <ButtonPrimary text="Add spot" type="button" on:click={handleAddSpot} />
    </div>
  {/if}
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
  margin-bottom: 36px;
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
  margin: auto 0;
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

.year-select {
  width: 114px;
  height: 40px;
  margin-bottom: 16px;
}

.data {
  flex: 1 0 auto;
  width: 100%;
}

.spots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  grid-auto-rows: 160px;
  grid-gap: 4vw;
  justify-content: space-between;
  width: 100%;
}

.spot-card {
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
