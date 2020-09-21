<script>
import FormTextInput from "./elements/FormTextInput.svelte";
let year = "";
let artist = "";
</script>

<form on:submit|preventDefault>
  <FormTextInput placeholder="Year" hint="1970 - 2020" value={year} />
  <FormTextInput
    placeholder="Artist/Crew"
    hint="Empty to show all"
    value={artist} />
  <div class="filter">
    <div class="checkbox">
      <input type="checkbox" id="filter-walls" />
      <label for="filter-walls">Walls</label>
    </div>
    <div class="checkbox">
      <input type="checkbox" id="filter-trains" />
      <label for="filter-trains">Trains</label>
    </div>
    <div class="checkbox">
      <input type="checkbox" id="filter-other" />
      <label for="filter-other">Other</label>
    </div>
  </div>
  <div class="bottom">
    <div class="checkbox">
      <input type="checkbox" checked id="search-show-hunters-spots" />
      <label for="search-show-hunters-spots">Show Hunter's Spots</label>
    </div>
    <button type="submit" class="button">Search</button>
  </div>
</form>

<style lang="scss">
.filter {
  margin-bottom: 36px;
}
.checkbox {
  display: inline-block;
  position: relative;
  padding-left: 37px;
  input {
    position: absolute;
    left: -9999px;
    clip: rect(0 0 0 0);
    opacity: 0;
  }
  label {
    font-size: 14px;
    line-height: 17px;
    color: var(--color-dark);
    cursor: pointer;
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 22px;
      height: 22px;
      border: 1px solid var(--color-accent);
      border-radius: 2px;
    }
    &::after {
      content: "";
      position: absolute;
      top: 7px;
      left: 4px;
      width: 14px;
      height: 9px;
      background: url(../../images/checkbox.svg) 50% 50% / contain no-repeat;
      transform: scale(0);
      transition: transform 0.3s;
    }
  }
  input:checked + label {
    &::before {
      background-color: var(--color-accent);
    }
    &::after {
      transform: scale(1);
    }
  }
  + .checkbox {
    margin-left: 48px;
  }
}

.bottom {
  display: flex;
  align-items: center;
}

button {
  flex: 1 0 auto;
  margin-left: 68px;
  padding: 12px 0;
  background-color: var(--color-accent);
  color: var(--color-light);
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
}

@media (max-width: 767px) {
  form {
    width: 100%;
    max-width: 530px;
    padding: 0 12px;
  }
  .bottom {
    flex-flow: wrap;
    margin-bottom: -28px;
  }
  button {
    width: 100%;
    max-width: 350px;
    margin: 28px auto;
  }
  .checkbox {
    + .checkbox {
      margin-left: 8vw;
    }
  }
}
</style>
