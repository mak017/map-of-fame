<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import { goto, url } from "@roxi/routify";

import { getAllCountries } from "./../../js/api/geo.js";
import { newbieRegistration } from "./../../js/api/auth.js";
import {
  saveToLocalStorage,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../../js/utils/commonUtils.js";
import { transformCountries } from "../../js/utils/transformers.js";
import {
  countriesList,
  isLoggedIn,
  userData,
  withNewbies,
} from "../../js/store.js";

import AutoComplete from "./../elements/AutoComplete.svelte";
import ButtonModalBack from "../elements/ButtonModalBack.svelte";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "../elements/FormEmailInput.svelte";
import FormPasswordInput from "../elements/FormPasswordInput.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

import { ERROR_MESSAGES, USER_TYPES } from "../../js/constants";

let step = 1;
let email = "";
let password = "";
let userType;
let username = "@";
let name = "";
let crew = "";
let country;
let portfolioLink = "";

let errors = {
  email: "",
  password: "",
  userType: "",
  username: "",
  name: "",
  crew: "",
  country: "",
  link: "",
};

let isSubmitDisabled = false;
let isInProgress = false;

const userTypeList = [
  { id: USER_TYPES.artist.toLowerCase(), name: USER_TYPES.artist },
  { id: USER_TYPES.crew.toLowerCase(), name: USER_TYPES.crew },
  { id: USER_TYPES.hunter.toLowerCase(), name: USER_TYPES.hunter },
];

onMount(() => {
  if (!$countriesList || $countriesList.length === 0) {
    getCountries();
  }
});

$: isSubmitDisabled =
  isInProgress ||
  (step === 1 && (!!errors.email || !!errors.password || !!errors.userType)) ||
  (step === 2 &&
    (!!errors.name || !!errors.crew || !!errors.country || !!errors.link));

const getCountries = () => {
  getAllCountries().then((response) => {
    const { success, result } = response;
    if (success && result) {
      countriesList.set(transformCountries(result));
    }
  });
};

const stripUsername = (username) =>
  username.startsWith("@") ? username.substring(1) : username;

const validate = () => {
  if (step === 1) {
    const isValidEmail = validateEmail(email);
    const isValidPassword = validatePassword(password);

    if (isValidEmail && isValidPassword && userType) {
      errors.email = "";
      errors.password = "";
      errors.userType = "";
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

      errors.userType = !userType ? ERROR_MESSAGES.profileSubtypeEmpty : "";
    }
  } else {
    const strippedUsername = stripUsername(username);
    const isValidUsername = validateUsername(strippedUsername);

    if (!isValidUsername) {
      errors.username = !strippedUsername
        ? ERROR_MESSAGES.usernameEmpty
        : ERROR_MESSAGES.usernameInvalid;
    } else errors.username = "";

    if (userType?.name !== USER_TYPES.crew) {
      errors.name = !name ? ERROR_MESSAGES.nameEmpty : "";
    } else {
      errors.crew = !crew ? ERROR_MESSAGES.crewEmpty : "";
    }

    errors.country = !country ? ERROR_MESSAGES.countryCityEmpty : "";
  }
};

const handleSubmit = () => {
  validate();
  if (step === 1) {
    if (!errors.email && !errors.password && !errors.userType) {
      step = 2;
      errors = {
        email: "",
        password: "",
        userType: "",
        username: "",
        name: "",
        crew: "",
        country: "",
        link: "",
      };
    }
  } else if (
    !errors.username &&
    !errors.name &&
    !errors.crew &&
    !errors.country &&
    !errors.link
  ) {
    isInProgress = true;
    newbieRegistration({
      name,
      username: stripUsername(username),
      password,
      email,
      country: country.name,
      type: userType.id,
      crew,
      link: portfolioLink,
    })
      .then((response) => {
        const { success, result, errors: error } = response;
        isInProgress = false;
        if (success && result) {
          userData.set(result);
          isLoggedIn.set(true);
          withNewbies.set(result.isNewbie);
          saveToLocalStorage("token", result.token);
          $goto("/");
        } else {
          if (error?.email) {
            errors.email = error.email;
            step = 1;
          }
          if (error?.password) {
            errors.password = error.password[0];
            step = 1;
          }
          if (Array.isArray(error)) {
            errors.link = error[0];
          }
          if (error?.username && Array.isArray(error.username)) {
            errors.username = error.username[0];
          }
        }
      })
      .catch((e) => {
        console.error(e);
        isInProgress = false;
        errors.password = "Something went wrong";
      });
  }
};

const handleInputChange = (input) => {
  if (
    isSubmitDisabled ||
    (step === 1 && (errors.email || errors.password || errors.userType)) ||
    (step === 2 &&
      (errors.username ||
        errors.name ||
        errors.crew ||
        errors.country ||
        errors.link))
  ) {
    errors[input] = "";
  }
};

const handleUsernameChange = (event) => {
  handleInputChange("username");
  if (!event?.detail?.target?.value?.startsWith("@")) {
    event.detail.target.value = username;
    return;
  }

  username = event?.detail?.target?.value;
};

const handleBackClick = () => {
  step = 1;
};
</script>

<form
  on:submit|preventDefault={handleSubmit}
  novalidate
  transition:fade|global={{ duration: 200 }}>
  {#if step === 2}
    <ButtonModalBack on:click={handleBackClick} withTransition />
  {/if}
  <div class="step">step {step} of 2</div>
  {#if step === 1}
    <div in:fade={{ duration: 200 }}>
      <FormEmailInput
        placeholder="Email"
        bind:value={email}
        errorText={errors.email}
        on:input={() => handleInputChange("email")} />
      <FormPasswordInput
        placeholder="Password"
        autocomplete="new-password"
        bind:value={password}
        errorText={errors.password}
        on:input={() => handleInputChange("password")} />
      <div class="profile_subtype">
        <AutoComplete
          bind:selectedValue={userType}
          items={userTypeList}
          optionIdentifier="name"
          label="name"
          placeholder="Profile Subtype"
          errorMessage={errors.userType}
          showIndicator
          on:select={() => handleInputChange("userType")} />
      </div>
    </div>
  {/if}
  {#if step === 2}
    <div in:fade={{ duration: 200 }}>
      <FormTextInput
        placeholder="Username"
        errorText={errors.username}
        value={username}
        on:input={handleUsernameChange} />
      {#if userType.name !== USER_TYPES.crew}
        <FormTextInput
          placeholder={userType.name === USER_TYPES.artist
            ? "Artist Name"
            : "Name"}
          bind:value={name}
          errorText={errors.name}
          on:input={() => handleInputChange("name")} />
      {/if}
      {#if userType.name !== USER_TYPES.hunter}
        <FormTextInput
          placeholder="Crew"
          bind:value={crew}
          errorText={errors.crew}
          on:input={() => handleInputChange("crew")} />
      {/if}
      <AutoComplete
        bind:selectedValue={country}
        items={$countriesList}
        optionIdentifier="name"
        label="name"
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
    <div class="switch-to-sign-in" in:fade={{ duration: 200 }}>
      <span>Have an account?</span>
      <a href={$url("/login")}>Log in</a>
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

  a {
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
