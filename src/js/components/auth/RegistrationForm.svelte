<script>
import { onDestroy, onMount } from "svelte";
import { getAllCountries } from "./../../api/geo.js";
import AutoComplete from "./../elements/AutoComplete.svelte";
import { createUserRequest } from "./../../api/auth.js";
import {
  saveToLocalStorage,
  validateEmail,
  validatePassword,
} from "../../utils/commonUtils.js";
import { AUTH_MODALS, ERROR_MESSAGES, USER_TYPES } from "../../constants";
import ButtonModalBack from "../elements/ButtonModalBack.svelte";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "../elements/FormEmailInput.svelte";
import FormPasswordInput from "../elements/FormPasswordInput.svelte";
import FormRadioButton from "../elements/FormRadioButton.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";
import { fade } from "svelte/transition";
import { countriesList, isLoggedIn, userData } from "../../store.js";
import { transformCountries } from "../../utils/transformers.js";

export let showAuth;
export let changeCurrentModal;

let step = 1;
let selectedType = USER_TYPES.artist;
let email = "";
let password = "";
let username = "";
let crew = "";
let country;
let portfolioLink = "";
let errors = { email: "", password: "", name: "", country: "", link: "" };
let isSubmitDisabled = false;
let countries = [];

const unsubscribeCountriesList = countriesList.subscribe(
  (value) => (countries = value)
);

onMount(() => {
  if (!countries || countries.length === 0) {
    getCountries();
  }
});

onDestroy(() => unsubscribeCountriesList());

const getCountries = () => {
  getAllCountries().then((response) => {
    console.log("data", response);
    const { status, data } = response;
    if (status && data) {
      countriesList.set(transformCountries(data));
    }
  });
};

const getOptionLabel = (option) => option.name;

const isFormHasErrors = () => Object.values(errors).some((err) => !!err);

const validate = () => {
  if (step === 1) {
    const isValidEmail = validateEmail(email);
    const isValidPassword = validatePassword(password);
    if (isValidEmail && isValidPassword) {
      errors.email = "";
      errors.password = "";
      isSubmitDisabled = false;
    } else {
      if (!isValidEmail) {
        errors.email = !email
          ? ERROR_MESSAGES.emailEmpty
          : ERROR_MESSAGES.emailInvalid;
      } else errors.email = "";
      if (!isValidPassword) {
        errors.password = !password
          ? ERROR_MESSAGES.passwordEmpty
          : ERROR_MESSAGES.passwordInvalid;
      } else errors.password = "";
      isSubmitDisabled = true;
    }
  } else {
    errors.name = !username ? ERROR_MESSAGES.usernameEmpty : "";
    errors.country = !country ? ERROR_MESSAGES.countryCityEmpty : "";
    isSubmitDisabled = !username || !country;
  }
};

const handleSubmit = () => {
  validate();
  if (step === 1) {
    if (!errors.email && !errors.password) {
      step = 2;
      errors = { email: "", password: "", name: "", country: "", link: "" };
    }
  } else {
    if (username && country) {
      createUserRequest({
        name: username,
        password,
        email,
        country: country.name,
        type: selectedType.toLowerCase(),
        crew,
        link: portfolioLink,
      })
        .then((response) => {
          if (response.status && response.data) {
            userData.set(response.data);
            isLoggedIn.set(true);
            saveToLocalStorage("token", response.data.token);
            showAuth(false);
          } else {
            if (response.error?.email) {
              errors.email = response.error.email;
              step = 1;
            }
            if (Array.isArray(response.error)) {
              errors.link = response.error[0];
            }
          }
        })
        .catch((e) => {
          console.error(e);
          errors.password = "Something went wrong";
        });
    }
  }
};

const handleInputChange = (input) => {
  if (
    isSubmitDisabled ||
    (step === 1 && (errors.email || errors.password)) ||
    (step === 2 && (errors.name || errors.country || errors.link))
  ) {
    errors[input] = "";
    isSubmitDisabled = isFormHasErrors();
  }
};

const handleBackClick = () => {
  step = 1;
  if (isSubmitDisabled) {
    isSubmitDisabled = false;
  }
};
</script>

<form on:submit|preventDefault={handleSubmit} novalidate transition:fade>
  {#if step === 2}
    <ButtonModalBack on:click={handleBackClick} withTransition />
  {/if}
  {#if step === 1}
    <div class="switcher" in:fade|local>
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
    <div in:fade|local>
      <FormEmailInput
        placeholder="Email"
        bind:value={email}
        errorText={errors.email}
        on:input={() => handleInputChange("email")} />
      <FormPasswordInput
        placeholder="Password"
        bind:value={password}
        errorText={errors.password}
        on:input={() => handleInputChange("password")} />
    </div>
  {/if}
  {#if step === 2}
    <div in:fade|local>
      <FormTextInput
        placeholder="User Name"
        bind:value={username}
        errorText={errors.name}
        on:input={() => handleInputChange("name")} />
      {#if selectedType === USER_TYPES.artist}
        <FormTextInput placeholder="Crew" bind:value={crew} />
      {/if}
      <AutoComplete
        bind:selectedValue={country}
        items={countries}
        optionIdentifier={"name"}
        {getOptionLabel}
        placeholder="Country"
        errorMessage={errors.country}
        on:select={() => handleInputChange("country")} />
      <FormTextInput
        placeholder="Link to Your Portfolio: Like Instagram@"
        bind:value={portfolioLink}
        errorText={errors.link}
        on:input={() => handleInputChange("link")} />
    </div>
  {/if}
  <div class="submit-wrapper">
    <ButtonPrimary
      text={step == 1 ? "Next" : "Register"}
      type="submit"
      className="wide"
      isDisabled={isSubmitDisabled} />
  </div>
  {#if step === 1}
    <div class="switch-to-sign-in" in:fade|local>
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
