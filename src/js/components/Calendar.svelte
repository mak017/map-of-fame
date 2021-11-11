<script>
import { onDestroy } from "svelte";
import { requestSearchSpots } from "./../api/search.js";
import { mapBounds, markersStore } from "./../store.js";
import { getCurrentYear, isMobile } from "../utils/commonUtils.js";
import { permalink } from "../utils/mapUtils/permalink.js";
import { getDatesFilter } from "../utils/datesUtils.js";
import { requestSpots } from "../init.js";

export let selectedYear;
export let showCalendar;
export let yearStart;
export let yearEnd;
export let additionalYears;
export let isSearch;

let selectedYearValue;
let searchYearsValue;
let geoRect;

const unsubscribeSelectedYear = selectedYear.subscribe(
  (value) => (selectedYearValue = value)
);

const unsubscribeMarkersStore = markersStore.subscribe(
  (value) => (searchYearsValue = value.years)
);

const unsubscribeMapBounds = mapBounds.subscribe((value) => {
  geoRect = value;
});

onDestroy(() => {
  unsubscribeSelectedYear();
  unsubscribeMarkersStore();
  unsubscribeMapBounds();
});

const datesFilter = searchYearsValue?.length
  ? searchYearsValue
  : getDatesFilter(yearStart, yearEnd, additionalYears);

const dates = !isMobile() ? datesFilter : datesFilter.reverse();

const handleClick = (year) => {
  const search = window.location.search;
  const params = new URLSearchParams(search);
  const { artist, crew } = permalink.getDataFromParams(params);

  selectedYear.set(year);
  if (!isSearch) {
    requestSpots(year);
    permalink.update({ clearParams: "all" });
  } else {
    requestSearchSpots({ year, artist, crew, geoRect });
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
        class:active={`${date}` === selectedYearValue}
        class:disabled={+date > getCurrentYear()}>{date}</a>
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
