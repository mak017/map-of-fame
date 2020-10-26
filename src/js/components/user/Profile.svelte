<script>
import { fade } from "svelte/transition";
import CustomSelect from "../elements/CustomSelect.svelte";
import { isLoggedIn, userData, userSpots } from "../../store";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import Modal from "../Modal.svelte";
import EditSpot from "./EditSpot.svelte";

export let onAddSpotBtnClick;
export let showUserProfile;

let username = "";
let spotsData = [];
let spotsToShow = [];
let year;
let currentSpot;
let showEditModal = false;

const toggleEditModal = (toggle) => (showEditModal = toggle);

userData.subscribe((value) => (username = value.name));
userSpots.subscribe((value) => (spotsData = value));

const years = [...new Set(spotsData.map((data) => data.year))];
year = Math.max(...years);
const yearsToApply = years.map((year) => ({ label: `${year}`, value: year }));

const handleLogout = () => {
  isLoggedIn.set(false);
  userData.set({});
  showUserProfile(false);
};

const handleAddSpot = () => {
  onAddSpotBtnClick();
  showUserProfile(false);
};

const handleYearSelect = (event) => {
  year = event.detail.detail.value;
  spotsToShow = getSpotsByYear(year);
};

const handleEdit = (spot) => {
  currentSpot = spot;
  toggleEditModal(true);
};

const getSpotsByYear = (year) =>
  spotsData.filter((data) => data.year === +year);
spotsToShow = getSpotsByYear(year);
</script>

<div class="container" style={showEditModal ? 'display: none' : ''}>
  <div class="top">
    <div class="username">{username}</div>
    <button class="logout" on:click={handleLogout}>Logout</button>
  </div>
  {#if !!spotsData.length}
    <div class="data">
      <div class="year-select">
        <CustomSelect
          items={yearsToApply}
          selectedValue={{ value: year, label: `${year}` }}
          isYear
          on:select={handleYearSelect} />
      </div>
      <div class="spots">
        {#each spotsToShow as spot}
          <div class="spot-card">
            <img loading="lazy" src={spot.img} alt="" in:fade />
            <div class="overlay">
              <button
                type="button"
                class="edit"
                on:click={() => handleEdit(spot)} />
              <button type="button" class="delete" />
            </div>
          </div>
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

{#if showEditModal}
  <Modal on:close={() => toggleEditModal(false)} noLogo>
    <EditSpot editSpotData={currentSpot} {toggleEditModal} />
  </Modal>
{/if}

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
  grid-gap: 4vmin;
  justify-content: space-between;
  width: 100%;
}

.spot-card {
  position: relative;
  border-radius: 2px;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s;
    background: rgba($color: #000, $alpha: 0.45);
  }
  &:hover {
    .overlay {
      opacity: 1;
    }
  }
}

.edit,
.delete {
  border: 0;
  background-color: var(--color-accent);
  background-position: 50% 50%;
  background-repeat: no-repeat;
  width: 54px;
  height: 54px;
  margin: 12px;
  border-radius: 2px;
  cursor: pointer;
}

.edit {
  background-image: url(../../../images/pencil.svg);
  background-size: 20px 20px;
}

.delete {
  background-image: url(../../../images/trash.svg);
  background-size: 14px 18px;
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
