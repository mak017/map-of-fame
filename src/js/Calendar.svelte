<style>
.years-list {
  columns: 6;
  text-align: center;
}

.year {
  transition: color 0.3s;
  color: var(--color-dark);
  font-size: 18px;
  line-height: 22px;
  text-decoration: none;
}

.year:hover {
  color: var(--color-accent);
}

.year.active {
  background-color: var(--color-accent);
  color: var(--color-light);
  font-weight: 900;
}

</style>

<script>
import { getDatesFilterStub } from "./stubs/datesFilterStub.js";
export let selectedYear;
console.log("selectedYear", selectedYear);
const dates = getDatesFilterStub();
const currentYear = new Date().getFullYear();
</script>

<ol class="years-list">
  {#each dates as date}
    <li>
      <a
        href="{`#${date}`}"
        on:click|preventDefault
        class="year"
        class:active="{date === selectedYear}"
        class:disabled="{+date > currentYear}"
      >{date}</a>
    </li>
  {/each}
</ol>
