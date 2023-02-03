<script>
import { goto } from "@roxi/routify";

import { requestSearchSpots } from "./../api/search.js";
import {
  isSearchResults,
  markersStore,
  selectedArtist,
  selectedCrew,
  selectedUserProfileData,
  selectedYear,
  settings,
} from "./../store.js";
import {
  getCurrentYear,
  isMobile,
  loadFromLocalStorage,
} from "../utils/commonUtils.js";
import { getDatesFilter, getProfileYears } from "../utils/datesUtils.js";
import { requestSpots } from "../init.js";
import { getUserSpots } from "../api/spot.js";

import { ALL_YEARS_STRING, EMPTY_YEAR_STRING } from "../constants.js";

let { yearStart, yearEnd, additionalYears } = $settings || {};

$: if ($settings) {
  yearStart = $settings.yearStart;
  yearEnd = $settings.yearEnd;
  additionalYears = $settings.additionalYears;
}

let searchYears = $markersStore.years?.map((year) =>
  year !== null ? `${year}` : EMPTY_YEAR_STRING
);

const datesFilter = getDatesFilter(
  yearStart,
  yearEnd,
  additionalYears && JSON.parse(additionalYears)
);

const dates = !isMobile()
  ? [ALL_YEARS_STRING, ...datesFilter]
  : [ALL_YEARS_STRING, ...datesFilter.reverse()];

const token = loadFromLocalStorage("token") || null;

const handleClick = (year) => {
  const yearForRequest = year !== EMPTY_YEAR_STRING ? `${year}` : "";

  selectedYear.set(`${year}`);
  if (!$isSearchResults && !$selectedUserProfileData.id) {
    requestSpots(year);
  } else if ($isSearchResults) {
    const requestParams = { artist: $selectedArtist, crew: $selectedCrew };
    if (yearForRequest !== ALL_YEARS_STRING) {
      requestParams.year = yearForRequest;
    }
    requestSearchSpots(requestParams).then((response) => {
      const { success, result } = response;
      if (success && result) {
        markersStore.set(result);
      }
    });
  } else if ($selectedUserProfileData.id) {
    getUserSpots($selectedUserProfileData.id, token, {
      year: yearForRequest,
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
</script>

<ol class="years-list">
  {#each dates as date}
    <li>
      <a
        href={`#${date}`}
        on:click|preventDefault={() => handleClick(date)}
        class="year"
        class:active={`${date}` === $selectedYear}
        class:disabled={+date > getCurrentYear() ||
          (searchYears?.length &&
            !searchYears?.includes(date) &&
            date !== ALL_YEARS_STRING) ||
          (!$isSearchResults && date === ALL_YEARS_STRING)}>{date}</a>
    </li>
  {/each}
</ol>

<style lang="scss">
.years-list {
  max-width: 100%;
  columns: 6;
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
    font-weight: 900;
    pointer-events: none;
  }

  &.disabled {
    opacity: 0.4;
    pointer-events: none;
  }
}

@media (max-width: 767px) {
  .years-list {
    columns: 3;
  }
}
</style>
