<script>
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormEmailInput from "./elements/FormEmailInput.svelte";
import FormPasswordInput from "./elements/FormPasswordInput.svelte";

export let showRegistration;

let step = 1;
let email = "";
let password = "";

const handleSubmit = () => {
  showRegistration(false);
};
</script>

<form on:submit|preventDefault={handleSubmit}>
  <div class="step">step {step} of 2</div>
  {#if step === 1}
    <FormEmailInput placeholder="Email" bind:value={email} />
    <FormPasswordInput placeholder="Password" bind:value={password} />
    <ButtonPrimary
      text={step == 1 ? 'Next' : 'Register'}
      type="submit"
      className="wide" />
    <div class="switch-to-sign-in">
      <span>Have an account?</span>
      <button type="button">Log in</button>
    </div>
  {/if}
</form>

<style lang="scss">
form {
  margin-bottom: auto;
}
.switch-to-sign-in {
  margin-top: 36px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.22;
  text-align: center;
  button {
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    cursor: pointer;
  }
}
</style>
