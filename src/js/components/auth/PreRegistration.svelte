<script>
import { fade } from "svelte/transition";
import FormTextArea from "./../elements/FormTextArea.svelte";
import { preRegContact, preRegEmail } from "./../../api/auth.js";
import ButtonPrimary from "../elements/ButtonPrimary.svelte";
import FormEmailInput from "./../elements/FormEmailInput.svelte";
import { isMobile, validateEmail } from "../../utils/commonUtils.js";
import { ERROR_MESSAGES } from "../../constants.js";
import ButtonModalBack from "../elements/ButtonModalBack.svelte";

export let setIsPreRegistrationSuccess;
export let close;

const screens = { INITIAL: "INITIAL", ARTIST: "ARTIST", SUCCESS: "SUCCESS" };

let screen = screens.INITIAL;
let email = "";
let contact = "";
let errors = { email: "", contact: "" };
let isSubmitDisabled = false;
let isInProgress = false;

$: isSubmitDisabled =
  isInProgress ||
  (screen === screens.INITIAL && !!errors.email) ||
  (screen === screens.ARTIST && !!errors.contact);

const handleInputChange = (input) => {
  if (isSubmitDisabled) {
    errors[input] = "";
  }
};

const submitEmail = () => {
  if (validateEmail(email)) {
    errors.email = "";
    preRegEmail(email).then((response) => {
      const { success, errors: serverError } = response;
      if (success) {
        setIsPreRegistrationSuccess(true);
        screen = screens.SUCCESS;
      }
      if (serverError) {
        errors.email = serverError?.email?.[0] ?? "Something went wrong";
      }
    });
  } else {
    errors.email = !email
      ? ERROR_MESSAGES.emailEmpty
      : ERROR_MESSAGES.emailInvalid;
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
    <FormEmailInput
      placeholder="Email"
      bind:value={email}
      errorText={errors.email}
      on:input={() => handleInputChange("email")} />
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
      <ButtonPrimary text="Back to map" type="button" on:click={close} />
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
