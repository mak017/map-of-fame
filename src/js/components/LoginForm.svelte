<script>
import { loginRequest } from "./../api/auth.js";
import ButtonPrimary from "./elements/ButtonPrimary.svelte";
import FormEmailInput from "./elements/FormEmailInput.svelte";
import FormPasswordInput from "./elements/FormPasswordInput.svelte";

export let showLogin;

let email = "";
let password = "";

const handleSubmit = () => {
  loginRequest(email, password).then((data) => console.log("data", data));
  showLogin(false);
};
</script>

<form on:submit|preventDefault={handleSubmit}>
  <FormEmailInput placeholder="Email" bind:value={email} />
  <FormPasswordInput placeholder="Password" bind:value={password} />
  <div class="forgot-password">
    <button type="button">Forgot password</button>
  </div>
  <ButtonPrimary text="Login" type="submit" className="wide" />
  <div class="switch-to-sign-up">
    <span>Don't have an account?</span>
    <button type="button">Sign up</button>
  </div>
</form>

<style lang="scss">
form {
  margin-bottom: auto;
}
.forgot-password {
  margin-bottom: 36px;
  text-align: right;
  button {
    padding: 0;
    border: 0;
    background: none;
    color: var(--color-accent);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.22;
    cursor: pointer;
  }
}
.switch-to-sign-up {
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
