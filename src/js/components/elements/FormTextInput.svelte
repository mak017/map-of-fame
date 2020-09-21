<script>
export let value = "";
export let placeholder;
export let hint;
export let errorText = "";
</script>

<label class:error={errorText}>
  <input type="text" {placeholder} bind:value />
  {#if errorText || hint}
    <div class="hint">{errorText || hint}</div>
  {/if}
</label>

<style lang="scss">
label {
  display: block;
  margin-bottom: 20px;
}
input {
  width: 530px;
  max-width: 100%;
  padding: 6px 0;
  border: 0;
  border-bottom: 1px solid var(--color-dark);
  color: var(--color-dark);
  font-weight: 600;
  font-size: 16px;
  line-height: 20px;
  &::placeholder {
    color: var(--color-dark);
    font-weight: normal;
  }
  &:focus {
    border-bottom-color: var(--color-accent);
    outline: 0;
  }
}
.hint {
  margin-top: 8px;
  opacity: 0.6;
  color: var(--color-dark);
  font-size: 13px;
  line-height: 16px;
}
.error {
  input {
    border-bottom-color: var(--color-error);
  }
  .hint {
    opacity: 1;
    color: var(--color-error);
  }
}

@media (max-width: 767px) {
  input {
    width: 100%;
    max-width: 530px;
  }
}
</style>