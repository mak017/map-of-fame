<script>
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import { goto, url } from "@roxi/routify";

import { getAllCountries } from "./../../api/geo.js";
import { createUserRequest } from "./../../api/auth.js";
import {
  saveToLocalStorage,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../../utils/commonUtils.js";
import { countriesList, isLoggedIn, userData } from "../../store.js";
import { transformCountries } from "../../utils/transformers.js";

import AutoComplete from "./../elements/AutoComplete.svelte";
import ButtonModalBack from "../elements/ButtonModalBack.svelte";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "../elements/FormEmailInput.svelte";
import FormPasswordInput from "../elements/FormPasswordInput.svelte";
import FormRadioButton from "../elements/FormRadioButton.svelte";
import FormTextInput from "../elements/FormTextInput.svelte";

import { ERROR_MESSAGES, USER_TYPES } from "../../constants";

export let inviteData;

let step = 1;
let selectedType = USER_TYPES.artist;
let email = "";
let password = "";
let subtype;
let username = "";
let name = "";
let crew = "";
let country;
let portfolioLink = "";

let errors = {
  email: "",
  password: "",
  subtype: "",
  username: "",
  name: "",
  crew: "",
  country: "",
  link: "",
};

let isSubmitDisabled = false;
let isInProgress = false;

const subtypeList = [
  { id: USER_TYPES.artist.toLowerCase(), name: USER_TYPES.artist },
  { id: USER_TYPES.crew.toLowerCase(), name: USER_TYPES.crew },
];

onMount(() => {
  if (!$countriesList || $countriesList.length === 0) {
    getCountries();
  }
});

$: isSubmitDisabled =
  isInProgress ||
  (step === 1 && (!!errors.email || !!errors.password || !!errors.subtype)) ||
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

const getOptionLabel = (option) => option.name;

const validate = () => {
  if (step === 1) {
    const isValidEmail = validateEmail(email);
    const isValidPassword = validatePassword(password);

    if (
      isValidEmail &&
      isValidPassword &&
      (selectedType === USER_TYPES.hunter ||
        (selectedType === USER_TYPES.artist && subtype))
    ) {
      errors.email = "";
      errors.password = "";
      errors.subtype = "";
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

      errors.subtype =
        selectedType === USER_TYPES.artist && !subtype
          ? ERROR_MESSAGES.profileSubtypeEmpty
          : "";
    }
  } else {
    const isValidUsername = validateUsername(username);

    if (!isValidUsername) {
      errors.username = !username
        ? ERROR_MESSAGES.usernameEmpty
        : ERROR_MESSAGES.usernameInvalid;
    } else errors.username = "";

    if (subtype?.name !== USER_TYPES.crew) {
      errors.name = !username ? ERROR_MESSAGES.nameEmpty : "";
    } else {
      errors.crew = !crew ? ERROR_MESSAGES.crewEmpty : "";
    }

    errors.country = !country ? ERROR_MESSAGES.countryCityEmpty : "";
  }
};

const handleSubmit = () => {
  validate();
  if (step === 1) {
    if (!errors.email && !errors.password && !errors.subtype) {
      step = 2;
      errors = {
        email: "",
        password: "",
        subtype: "",
        username: "",
        name: "",
        crew: "",
        country: "",
        link: "",
      };
    }
  } else {
    if (
      !errors.username &&
      !errors.name &&
      !errors.crew &&
      !errors.country &&
      !errors.link
    ) {
      isInProgress = true;
      createUserRequest({
        name,
        username,
        password,
        email,
        country: country.name,
        type:
          selectedType === USER_TYPES.hunter
            ? selectedType.toLowerCase()
            : subtype.id,
        crew,
        link: portfolioLink,
        invite: inviteData?.code,
      })
        .then((response) => {
          const { success, result, errors: error } = response;
          isInProgress = false;
          if (success && result) {
            userData.set(result);
            isLoggedIn.set(true);
            saveToLocalStorage("token", result.token);
            $goto("/");
          } else {
            if (error?.email) {
              errors.email = error.email;
              step = 1;
            }
            if (Array.isArray(error)) {
              errors.link = error[0];
            }
            if (error?.message) {
              errors.link = error.message;
            }
          }
        })
        .catch((e) => {
          console.error(e);
          isInProgress = false;
          errors.password = "Something went wrong";
        });
    }
  }
};

const handleInputChange = (input) => {
  if (
    isSubmitDisabled ||
    (step === 1 && (errors.email || errors.password || errors.subtype)) ||
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

const handleBackClick = () => {
  step = 1;
};
</script>

<form
  on:submit|preventDefault={handleSubmit}
  novalidate
  transition:fade={{ duration: 200 }}>
  {#if inviteData?.from}
    <div class="invite-from">
      По воле юзера {inviteData.from} <br />
      ты получил доступ в святую святых, аминь друг мой, да прибудет с тобой силы.
    </div>
  {/if}
  {#if step === 2}
    <ButtonModalBack on:click={handleBackClick} withTransition />
  {/if}
  {#if step === 1 && !inviteData}
    <div class="switcher" in:fade|local={{ duration: 200 }}>
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
    <div in:fade|local={{ duration: 200 }}>
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
      {#if selectedType === USER_TYPES.artist}
        <div class="profile_subtype" class:with-error={errors.sprayPaintUsed}>
          <AutoComplete
            bind:selectedValue={subtype}
            items={subtypeList}
            optionIdentifier={"name"}
            {getOptionLabel}
            placeholder="Profile Subtype"
            errorMessage={errors.subtype}
            showIndicator
            on:select={() => handleInputChange("subtype")} />
        </div>
      {/if}
    </div>
  {/if}
  {#if step === 2}
    <div in:fade|local={{ duration: 200 }}>
      <FormTextInput
        placeholder="Username"
        bind:value={username}
        errorText={errors.username}
        on:input={() => handleInputChange("username")} />
      {#if subtype?.name !== USER_TYPES.crew}
        <FormTextInput
          placeholder={selectedType === USER_TYPES.artist
            ? "Artist Name"
            : "Name"}
          bind:value={name}
          errorText={errors.name}
          on:input={() => handleInputChange("name")} />
      {/if}
      {#if selectedType === USER_TYPES.artist}
        <FormTextInput
          placeholder="Crew"
          bind:value={crew}
          errorText={errors.crew}
          on:input={() => handleInputChange("crew")} />
      {/if}
      <AutoComplete
        bind:selectedValue={country}
        items={$countriesList}
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
    <div class="switch-to-sign-in" in:fade|local={{ duration: 200 }}>
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
.invite-from {
  margin-bottom: 36px;
  color: var(--color-dark);
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
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
