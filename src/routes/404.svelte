<script>
import { goto } from "@roxi/routify";

import Modal from "../components/Modal.svelte";
</script>

<Modal id="404" on:close={() => $goto("/")}>
  <div class="wrapper">
    <div class="container">
      <img alt="Page not found" src="/images/404.gif" />
      <h1>404</h1>
      <h2>Rage not found</h2>
      <p>
        If you have rage and righteously act it out and blame it all on others,
        it's really you who suffers. The other people and the environment suffer
        also, but you suffer more because you're being eaten up inside with
        rage, causing you to hate yourself more and more
      </p>
      <p>(c) Pema Chodron</p>
    </div>
  </div>
</Modal>

<style>
.wrapper {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--color-light);
  line-height: 1.5;
  text-rendering: optimizeSpeed;
}

.container {
  max-width: 620px;
  text-align: center;
}

img {
  width: 195px;
  margin: 0 auto 22px;
}

h1,
h2 {
  color: var(--color-accent);
  font-size: 24px;
  font-weight: 800;
  line-height: 29px;
  text-transform: uppercase;
}

h2 {
  margin: 24px 0 36px;
}

p {
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 17px;
}

p + p {
  margin-bottom: 36px;
}

@media (max-width: 767px) {
  h2 {
    margin: 16px 0;
    font-size: 14px;
    line-height: 17px;
  }

  p + p {
    margin-bottom: 24px;
  }
}
</style>
