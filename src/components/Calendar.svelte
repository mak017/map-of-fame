<script>
import { onMount } from "svelte";
import { goto } from "@roxi/routify";

import {
  isShowOnMapMode,
  markersStore,
  selectedUserProfileData,
  selectedYear,
  settings,
} from "./../js/store.js";
import {
  getCurrentYear,
  loadFromLocalStorage,
} from "../js/utils/commonUtils.js";
import { getDatesFilter, getProfileYears } from "../js/utils/datesUtils.js";
import { requestSpots } from "../js/init.js";
import { getUserSpots } from "../js/api/spot.js";
import { getActiveYears } from "../js/api/settings.js";

import { ALL_YEARS_STRING, EMPTY_YEAR_STRING } from "../js/constants.js";

let { yearStart, yearEnd, additionalYears } = $settings || {};
let activeYears;

$: if ($settings) {
  yearStart = $settings.yearStart;
  yearEnd = $settings.yearEnd;
  additionalYears = $settings.additionalYears;
}

onMount(() => {
  getActiveYears().then((response) => {
    const { result, success } = response;

    if (success && result) {
      activeYears = result.map((item) => item.year);
    }
  });
});

let searchYears = $markersStore.years?.map((year) =>
  year !== null ? `${year}` : EMPTY_YEAR_STRING,
);

const datesFilter = getDatesFilter(
  yearStart,
  yearEnd,
  additionalYears && JSON.parse(additionalYears),
);

const dates = [...datesFilter.reverse(), ALL_YEARS_STRING];

const token = loadFromLocalStorage("token") || null;

const handleClick = (year) => {
  const yearForRequest = year !== EMPTY_YEAR_STRING ? `${year}` : "";

  selectedYear.set(`${year}`);
  if (!$selectedUserProfileData.id) {
    requestSpots(year);
  } else if ($selectedUserProfileData.id) {
    getUserSpots($selectedUserProfileData.id, token, {
      year: yearForRequest === ALL_YEARS_STRING ? undefined : yearForRequest,
      offset: 0,
      limit: 99999999999999,
    }).then((response) => {
      const { success, result } = response;
      if (success && result) {
        const { spots, years } = result;
        markersStore.set({ spots, years: getProfileYears(years) });
        document.getElementById("highlighted").innerHTML = "";
      }
    });
  }
  $goto("/");
};

const isDisabled = (date, activeYears) => {
  if (+date > getCurrentYear()) {
    return true;
  }
  if (
    !activeYears?.includes(+date) &&
    date !== EMPTY_YEAR_STRING &&
    date !== ALL_YEARS_STRING
  ) {
    return true;
  }
  if (
    searchYears?.length &&
    !searchYears?.includes(date) &&
    date !== ALL_YEARS_STRING
  ) {
    return true;
  }
  if (!$isShowOnMapMode && date === ALL_YEARS_STRING) {
    return true;
  }

  return false;
};
</script>

<ol class="years-list">
  {#each dates as date}
    <li>
      <a
        href={`#${date}`}
        on:click|preventDefault={() => handleClick(date)}
        class="year"
        class:active={`${date}` === $selectedYear}
        class:disabled={isDisabled(date, activeYears)}>{date}</a>
    </li>
  {/each}
</ol>

<style lang="scss">
.years-list {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-column-gap: 16px;
  max-width: 100%;
  text-align: center;
}

li {
  margin-bottom: 2vh;
}

.year {
  display: inline-block;
  padding: 6px 11px;
  transition: color 0.3s;
  color: var(--color-dark);
  font-size: 18px;
  line-height: 22px;
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;

  &:hover {
    color: var(--color-accent);
  }

  &.active {
    background-color: var(--color-accent);
    color: var(--color-light);
    font-weight: 800;
    pointer-events: none;
  }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

@media (max-width: 767px) {
  .years-list {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
