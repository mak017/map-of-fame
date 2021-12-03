<script>
import { onDestroy } from "svelte";
import { requestSearchSpots } from "./../api/search.js";
import { markersStore, selectedUserProfileData } from "./../store.js";
import {
  getCurrentYear,
  isMobile,
  loadFromLocalStorage,
} from "../utils/commonUtils.js";
import { permalink } from "../utils/mapUtils/permalink.js";
import { getDatesFilter, getProfileYears } from "../utils/datesUtils.js";
import { requestSpots } from "../init.js";
import { EMPTY_YEAR_STRING } from "../constants.js";
import { getUserSpots } from "../api/spot.js";

export let selectedYear;
export let showCalendar;
export let yearStart;
export let yearEnd;
export let additionalYears;
export let isSearch;

let searchYearsValue = [];
const token = loadFromLocalStorage("token") || null;

const unsubscribeMarkersStore = markersStore.subscribe(
  (value) =>
    (searchYearsValue = value.years?.map((year) =>
      year !== null ? `${year}` : EMPTY_YEAR_STRING
    ))
);

onDestroy(() => {
  unsubscribeMarkersStore();
});

const datesFilter = getDatesFilter(yearStart, yearEnd, additionalYears);

const dates = !isMobile() ? datesFilter : datesFilter.reverse();

const handleClick = (year) => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const { artist, crew } = permalink.getDataFromParams(params);

  selectedYear.set(`${year}`);
  if (!isSearch && !$selectedUserProfileData.id) {
    requestSpots(year);
    permalink.update({ clearParams: "all" });
  } else if (isSearch) {
    const yearForRequest = year !== EMPTY_YEAR_STRING ? `${year}` : "";
    requestSearchSpots({ year: yearForRequest, artist, crew }).then(
      (response) => {
        const { success, result } = response;
        if (success && result) {
          markersStore.set(result);
          permalink.update({});
        }
      }
    );
  } else if ($selectedUserProfileData.id) {
    getUserSpots(token, $selectedUserProfileData.id, {
      year,
      offset: 0,
      limit: 99999999999999,
    }).then((response) => {
      const { success, result } = response;
      if (success && result) {
        const { spots, years } = result;
        markersStore.set({ spots, years: getProfileYears(years) });
        document.getElementById("highlighted").innerHTML = "";
        permalink.update({});
      }
    });
  }
  showCalendar(false);
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
          (searchYearsValue?.length && !searchYearsValue?.includes(date))}
        >{date}</a>
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
