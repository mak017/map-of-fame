<script>
import { onDestroy } from "svelte";
import { getCurrentYear, isMobile } from "../utils/commonUtils.js";
import { permalink } from "../utils/mapUtils/permalink.js";
import { getDatesFilter } from "../utils/datesUtils.js";
import { requestSpots } from "../init.js";

export let selectedYear;
export let showCalendar;
export let yearStart;
export let yearEnd;
export let additionalYears;

let selectedYearValue;

const unsubscribeSelectedYear = selectedYear.subscribe(
  (value) => (selectedYearValue = value)
);

onDestroy(() => unsubscribeSelectedYear());

const datesFilter = getDatesFilter(yearStart, yearEnd, additionalYears);

const dates = !isMobile() ? datesFilter : datesFilter.reverse();

const handleClick = (year) => {
  selectedYear.set(year);
  requestSpots(year);
  permalink.update({ clearParams: "all" });
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
        class:active={date === selectedYearValue}
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
