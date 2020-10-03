<script>
import { validateEmail, validatePassword } from "./../../utils.js";
import { AUTH_MODALS, USER_TYPES } from "../../constants";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "../elements/FormEmailInput.svelte";
import FormPasswordInput from "../elements/FormPasswordInput.svelte";
import FormRadioButton from "../elements/FormRadioButton.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

export let showAuth;
export let changeCurrentModal;

let step = 1;
let selectedType = USER_TYPES.artist;
let email = "";
let password = "";
let userName = "";
let crew = "";
let countryCity = "";
let portfolioLink = "";
let errors = { email: "", password: "", name: "", countryCity: "" };

const handleSubmit = () => {
  if (step === 1) {
    const isValidEmail = validateEmail(email);
    const isValidPassword = validatePassword(password);
    if (isValidEmail && isValidPassword) {
      errors.email = "";
      errors.password = "";
      step = 2;
    } else {
      errors.email = !isValidEmail ? "You have entered invalid email" : "";
      errors.password = !isValidPassword
        ? "Password must be between 8 to 20 characters and contain at least one numeric digit, one uppercase and one lowercase letter"
        : "";
    }
  } else showAuth(false);
};
</script>

<form on:submit|preventDefault={handleSubmit} novalidate>
  {#if step === 2}<button class="back" on:click={() => (step = 1)} />{/if}
  {#if step === 1}
    <div class="switcher">
      <FormRadioButton
        id={`user-type-switcher-${USER_TYPES.artist.toLowerCase()}`}
        bind:group={selectedType}
        value={USER_TYPES.artist}
        label={USER_TYPES.artist}
        className="accent" />
      <FormRadioButton
        id={`user-type-switcher-${USER_TYPES.hunter.toLowerCase()}`}
        bind:group={selectedType}
        value={USER_TYPES.hunter}
        label={USER_TYPES.hunter}
        className="accent" />
    </div>
  {/if}
  <div class="step">step {step} of 2</div>
  {#if step === 1}
    <FormEmailInput
      placeholder="Email"
      bind:value={email}
      errorText={errors.email} />
    <FormPasswordInput
      placeholder="Password"
      bind:value={password}
      errorText={errors.password} />
  {/if}
  {#if step === 2}
    <FormTextInput
      placeholder="User Name"
      bind:value={userName}
      errorText={errors.name} />
    {#if selectedType === USER_TYPES.artist}
      <FormTextInput placeholder="Crew" bind:value={crew} />
    {/if}
    <FormTextInput
      placeholder="Country/City"
      bind:value={countryCity}
      errorText={errors.countryCity} />
    <FormTextInput
      placeholder="Link to Your Portfolio: Like Instagram@"
      bind:value={portfolioLink} />
  {/if}
  <div class="submit-wrapper">
    <ButtonPrimary
      text={step == 1 ? 'Next' : 'Register'}
      type="submit"
      className="wide" />
  </div>
  {#if step === 1}
    <div class="switch-to-sign-in">
      <span>Have an account?</span>
      <button
        type="button"
        on:click={() => changeCurrentModal(AUTH_MODALS.login)}>Log in</button>
    </div>
  {/if}
</form>

<style lang="scss">
form {
  position: relative;
  width: 100%;
  max-width: 530px;
  margin-bottom: auto;
}
.back {
  position: absolute;
  top: calc(-6vh - 25px);
  left: 0;
  width: 20px;
  height: 20px;
  border: 0;
  background: url(../../../images/back.svg);
  cursor: pointer;
}
.switcher {
  display: flex;
  margin-bottom: 24px;
}
.step {
  margin-bottom: 24px;
  color: var(--color-dark);
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}
.submit-wrapper {
  margin-top: 36px;
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
