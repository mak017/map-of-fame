<script>
import Spinner from "./../elements/Spinner.svelte";
import { onDestroy, onMount } from "svelte";
import { fade } from "svelte/transition";
import InfiniteScroll from "svelte-infinite-scroll";
import { isEmpty } from "./../../utils/commonUtils.js";
import CustomSelect from "../elements/CustomSelect.svelte";
import { isLoggedIn, userData } from "../../store";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import Modal from "../Modal.svelte";
import EditSpot from "./EditSpot.svelte";
import DeleteSpot from "./DeleteSpot.svelte";
import Popup from "../Popup.svelte";
import {
  loadFromLocalStorage,
  removeFromLocalStorage,
} from "../../utils/commonUtils";
import { getUserSpots } from "../../api/spot";
import { EMPTY_YEAR_STRING, MAX_SPOTS_PER_PAGE } from "../../constants";

export let onAddSpotBtnClick;
export let showUserProfile;

let user;
let currentYear;
let currentSpot;
let showEditModal = false;
let showDeletePopup = false;
let offset = 0;
let yearsToApply = [];
let spotsList = [];
let newBatch = [];
let isLoading = false;
let isShowSpinner = false;
const token = loadFromLocalStorage("token") || null;

const toggleEditModal = (toggle) => (showEditModal = toggle);
const toggleDeletePopup = (toggle) => (showDeletePopup = toggle);

const unsubscribeUserData = userData.subscribe((value) => (user = value));

const fetchSpots = ({ year, offset, isNewFetch = false }) => {
  isLoading = isNewFetch;
  isShowSpinner = true;
  getUserSpots(token, user.id, { year, offset }).then((response) => {
    const { status, data, error } = response;
    if (status && data) {
      const { spots, years } = data;
      if (isNewFetch) spotsList = [];
      newBatch = [...spots];
      yearsToApply = [
        ...new Set(
          years
            .map((y) => (y === "" || y === " " ? EMPTY_YEAR_STRING : y))
            .filter((y) => y)
        ),
      ];
      if (currentYear === undefined || year === undefined) {
        currentYear = yearsToApply[0];
      }
    }
    if (error && !isEmpty(error)) {
      if (error.year) {
        fetchSpots({});
      }
    }
    isLoading = false;
    isShowSpinner = false;
  });
};

onMount(() => {
  fetchSpots({});
});

onDestroy(() => {
  unsubscribeUserData();
});

$: spotsList = [...spotsList, ...newBatch];

const handleLogout = () => {
  removeFromLocalStorage("token");
  isLoggedIn.set(false);
  userData.set({});
  showUserProfile(false);
};

const handleAddSpot = () => {
  onAddSpotBtnClick();
  showUserProfile(false);
};

const handleYearSelect = (event) => {
  const { value } = event.detail.detail;
  currentYear = value !== EMPTY_YEAR_STRING ? value : "";
  fetchSpots({ year: currentYear, isNewFetch: true });
};

const handleEdit = (spot) => {
  currentSpot = spot;
  toggleEditModal(true);
};

const handleDelete = (spot) => {
  currentSpot = spot;
  toggleDeletePopup(true);
};

const onLoadMore = () => {
  offset += MAX_SPOTS_PER_PAGE;
  fetchSpots({ year: currentYear, offset });
};

const onSubmitChanges = () => {
  fetchSpots({ year: currentYear, isNewFetch: true });
};
</script>

<div class="container" style={showEditModal ? "display: none" : ""}>
  <div class="top">
    {#if $userData.name}
      <div class="username">{$userData.name}</div>
    {/if}
    <button class="logout" on:click={handleLogout}>Logout</button>
  </div>
  {#if !!spotsList.length || isShowSpinner}
    <div class="data">
      {#if !!spotsList.length}
        <div class="year-select">
          <CustomSelect
            items={yearsToApply}
            selectedValue={{ value: currentYear, label: currentYear }}
            isYear
            on:select={handleYearSelect} />
        </div>
      {/if}
      {#if !isLoading}
        <div class="spots">
          {#each spotsList as spot}
            <div class="spot-card">
              <img loading="lazy" src={spot.img} alt="" in:fade />
              <div class="overlay">
                <button
                  type="button"
                  class="edit"
                  on:click={() => handleEdit(spot)} />
                <button
                  type="button"
                  class="delete"
                  on:click={() => handleDelete(spot)} />
              </div>
            </div>
          {/each}
          <InfiniteScroll
            hasMore={newBatch.length}
            threshold={100}
            on:loadMore={onLoadMore}
            elementScroll={document.querySelector(".modal")} />
        </div>
      {/if}
      {#if isShowSpinner}
        <div class="spinner-container">
          <Spinner margin="20px auto" />
        </div>
      {/if}
    </div>
  {:else if !isShowSpinner}
    <div class="empty-state">
      <img src="../../../images/empty.gif" alt="Empty" />
      <p>Spot not</p>
      <ButtonPrimary text="Add spot" type="button" on:click={handleAddSpot} />
    </div>
  {/if}
</div>

{#if showEditModal}
  <Modal on:close={() => toggleEditModal(false)} noLogo noClose>
    <EditSpot
      editSpotData={currentSpot}
      {toggleEditModal}
      onSubmit={onSubmitChanges} />
  </Modal>
{/if}

{#if showDeletePopup}
  <Popup title="Delete spot?" on:close={() => toggleDeletePopup(false)}>
    <DeleteSpot
      close={() => toggleDeletePopup(false)}
      {currentSpot}
      onSubmit={onSubmitChanges} />
  </Popup>
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
  background-color: #d3d3d3;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
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

.spinner-container {
  position: relative;
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
