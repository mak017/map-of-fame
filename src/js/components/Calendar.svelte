<script>
import { isMobile } from "../utils.js";
import { getDatesFilterStub } from "../stubs/datesFilterStub.js";
export let selectedYear;
export let showCalendar;
let selectedYearValue;
selectedYear.subscribe((value) => (selectedYearValue = value));
const dates = !isMobile()
  ? getDatesFilterStub()
  : getDatesFilterStub().reverse();
const currentYear = new Date().getFullYear();

const handleClick = (year) => {
  selectedYear.set(year);
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
        class:disabled={+date > currentYear}>{date}</a>
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
  .year {
    padding: 6px 2px;
  }
}
</style>
