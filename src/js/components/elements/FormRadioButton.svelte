<script>
export let id;
export let group;
export let value;
export let label;
export let className = "";
</script>

<div class={`radio${className ? ` ${className}` : ''}`}>
  <input type="radio" {id} bind:group {value} />
  <label for={id}>{label}</label>
</div>

<style lang="scss">
.radio {
  display: flex;
  flex: 1 0 0;
  border: 1px solid var(--color-dark);
  &:first-child {
    border-right: 0;
    border-radius: 2px 0 0 2px;
  }
  &:last-child {
    border-left: 0;
    border-radius: 0 2px 2px 0;
  }
  input {
    position: absolute;
    left: -9999px;
    clip: rect(0 0 0 0);
    opacity: 0;
  }
  label {
    flex: 1 0 auto;
    padding: 10px 0;
    color: var(--color-dark);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.22;
    text-align: center;
    cursor: pointer;
  }
  input:checked + label {
    background-color: var(--color-dark);
    color: var(--color-light);
  }
  &.accent {
    input:checked + label {
      background-color: var(--color-accent);
      color: var(--color-light);
    }
  }
}
</style>
