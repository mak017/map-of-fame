<script>
import FormTextInput from "./../elements/FormTextInput.svelte";
import { fade } from "svelte/transition";
import { goto } from "@roxi/routify";

import { preRegContact, preRegEmail } from "./../../api/auth.js";
import { isMobile } from "../../utils/commonUtils.js";

import FormTextArea from "./../elements/FormTextArea.svelte";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import ButtonModalBack from "../elements/ButtonModalBack.svelte";

import { ERROR_MESSAGES } from "../../constants.js";

export let setIsPreRegistrationSuccess;

const screens = { INITIAL: "INITIAL", ARTIST: "ARTIST", SUCCESS: "SUCCESS" };

let screen = screens.INITIAL;
let link = "";
let contact = "";
let errors = { link: "", contact: "" };
let isSubmitDisabled = false;
let isInProgress = false;

$: isSubmitDisabled =
  isInProgress ||
  (screen === screens.INITIAL && !!errors.link) ||
  (screen === screens.ARTIST && !!errors.contact);

const handleInputChange = (input) => {
  if (isSubmitDisabled) {
    errors[input] = "";
  }
};

const submitEmail = () => {
  if (link) {
    errors.link = "";
    preRegEmail(link).then((response) => {
      const { success, errors: serverError } = response;
      if (success) {
        setIsPreRegistrationSuccess(true);
        screen = screens.SUCCESS;
      }
      if (serverError) {
        errors.link = serverError?.email?.[0] ?? "Something went wrong";
      }
    });
  } else {
    errors.link = ERROR_MESSAGES.genericEmpty;
  }
};

const submitContact = () => {
  if (contact) {
    errors.contact = "";
    preRegContact(contact).then((response) => {
      const { success, errors: serverError } = response;
      if (success) {
        setIsPreRegistrationSuccess(true);
        screen = screens.SUCCESS;
      }
      if (serverError) {
        errors.contact = serverError?.contact?.[0] ?? "Something went wrong";
      }
    });
  } else {
    errors.contact = ERROR_MESSAGES.contactEmpty;
  }
};
</script>

{#if screen === screens.INITIAL}
  <form on:submit|preventDefault={submitEmail} novalidate>
    <p>Жди нас дорогой друг, мы тебе напишем...</p>
    <FormTextInput
      placeholder="Instagram"
      bind:value={link}
      errorText={errors.link}
      on:input={() => handleInputChange("link")} />
    <div class="submit-wrapper">
      <ButtonPrimary
        text="Send"
        type="submit"
        className="wide"
        isDisabled={isSubmitDisabled} />
    </div>
    <div class="switch-to-artist">
      <span>Если ты Бэнкси,</span>
      <button
        type="button"
        class="button"
        on:click={() => (screen = screens.ARTIST)}>Жми сюда</button>
    </div>
  </form>
{/if}

{#if screen === screens.SUCCESS}
  <div class="success" in:fade={{ delay: 500, duration: 200 }}>
    <div class="thumb">👍</div>
    <div class="button-wrapper">
      <ButtonPrimary
        text="Back to map"
        type="button"
        on:click={() => $goto("/")} />
    </div>
  </div>
{/if}

{#if screen === screens.ARTIST}
  <form on:submit|preventDefault={submitContact} novalidate>
    <ButtonModalBack on:click={() => (screen = screens.INITIAL)} />
    <FormTextArea
      placeholder="Если ты уверен что ты должен тут быть, с нами, напиши нам кто ты, и как с тобой связаться"
      bind:value={contact}
      height={!isMobile() ? 84 : 200}
      errorText={errors.contact}
      isFloatingLabel={false}
      on:input={() => handleInputChange("contact")} />
    <div class="submit-wrapper">
      <ButtonPrimary
        text="Send"
        type="submit"
        className="wide"
        isDisabled={isSubmitDisabled} />
    </div>
  </form>
{/if}

<style>
form {
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  max-width: 530px;
}
p {
  max-width: 318px;
  margin: 0 auto 24px;
  color: var(--color-dark);
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  text-align: center;
}
.submit-wrapper {
  margin-top: 16px;
}
.switch-to-artist {
  margin-top: 36px;
  text-align: center;
}
.button {
  background: none;
  color: var(--color-accent);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.22;
}

.success {
  margin: auto;
}

.thumb {
  margin-bottom: 28px;
  font-size: 144px;
  line-height: 176px;
}
</style>
