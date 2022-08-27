<script>
import { fade } from "svelte/transition";

import CustomSelect from "./elements/CustomSelect.svelte";

import { ALL_YEARS_STRING, EMPTY_YEAR_STRING } from "../constants";

export let spotsList;

let currentYear = ALL_YEARS_STRING;
let spotsToShow = spotsList;
let yearsToApply = [
  ALL_YEARS_STRING,
  ...new Set(
    spotsList
      .map(({ year }) => (year === null ? EMPTY_YEAR_STRING : year))
      .filter((y) => y)
      .sort(
        (a, b) =>
          (a === EMPTY_YEAR_STRING) - (b === EMPTY_YEAR_STRING) ||
          -(a > b) ||
          +(a < b)
      )
  ),
];

const handleYearSelect = (event) => {
  const { value } = event.detail.detail;
  currentYear = value !== EMPTY_YEAR_STRING ? value : null;
  spotsToShow =
    currentYear === ALL_YEARS_STRING
      ? spotsList
      : spotsList.filter((spot) => spot.year === currentYear);
};

const onSpotClick = (spot) => {
  // if (isCurrentUser) {
  //   return;
  // }
  // const {
  //   id,
  //   artistCrew,
  //   spotStatus: status,
  //   description,
  //   img,
  //   title,
  //   videoLink: video,
  //   publicBanner: { banner, bannerUrl },
  //   location: { lat, lng },
  //   year,
  //   link,
  // } = spot;
  // openedMarkerData.set({
  //   id,
  //   artistCrew,
  //   status,
  //   description,
  //   img: { src: img, title: title || id },
  //   video,
  //   user: $selectedUserProfileData,
  //   firm: { banner, bannerUrl },
  //   coords: { lat, lng },
  //   year,
  //   link,
  // });
  // shouldDisplayShowOnMap.set(true);
  // permalink.update({ params: { marker: id } });
  // showUserProfile(false);
};
</script>

<div class="container">
  <div class="top">
    <div class="title">Selected spots</div>
  </div>
  <div class="data">
    <div class="data-top">
      <div class="year-select">
        <CustomSelect
          items={yearsToApply}
          selectedValue={{ value: currentYear, label: currentYear }}
          isYear
          on:select={handleYearSelect} />
      </div>
    </div>
    <div class="spots">
      {#each spotsToShow as spot}
        <div class="spot-card" on:click={() => onSpotClick(spot)}>
          <img
            loading="lazy"
            src={spot.thumbnail}
            alt={spot.title ?? `Spot ${spot.id} from area`}
            in:fade={{ duration: 200 }} />
        </div>
      {/each}
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

.top {
  display: flex;
  align-self: stretch;
  justify-content: space-between;
  margin-bottom: 6px;
}

.title {
  color: var(--color-dark);
  font-size: 24px;
  font-weight: 900;
  line-height: 1.22;
  text-transform: uppercase;
}

.year-select {
  width: 114px;
  height: 40px;
}

.data {
  flex: 1 0 auto;
  width: 100%;

  &-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
}

.spots {
  display: grid;
  grid-auto-rows: 160px;
  grid-gap: 4vmin;
  grid-template-columns: repeat(auto-fill, minmax(275px, 1fr));
  justify-content: space-between;
  width: 100%;
}

.spot-card {
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  background-color: #d3d3d3;
  cursor: pointer;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    user-select: none;
  }
}

@media (max-width: 767px) {
  .top {
    position: relative;
    flex-direction: column-reverse;
    margin-bottom: 18px;
  }
}
</style>
