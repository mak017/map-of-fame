<script>
import { url } from "@roxi/routify";
</script>

<div class="wrapper">
  <div class="logo" />
  <div class="container">
    <img alt="Page not found" src="../images/404.gif" />
    <h1>404</h1>
    <h2>Rage not found</h2>
    <p>
      If you have rage and righteously act it out and blame it all on others,
      it's really you who suffers. The other people and the environment suffer
      also, but you suffer more because you're being eaten up inside with rage,
      causing you to hate yourself more and more
    </p>
    <p>(c) Pema Chodron</p>
    <a href={$url("../")}>Back to map</a>
  </div>
</div>

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
.logo {
  display: block;
  position: absolute;
  top: 15px;
  left: 18vw;
  width: 132px;
  height: 51px;
  background: url(../images/logo.png) 50% 50% / contain no-repeat;
  border-radius: 0 0 2px 2px;
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
  font-weight: 900;
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
a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 164px;
  height: 46px;
  border-radius: 2px;
  background-color: var(--color-accent);
  color: var(--color-light);
  font-size: 18px;
  font-weight: 600;
  text-decoration: none;
}
@media (max-width: 767px) {
  .logo {
    left: 12px;
    width: 97px;
    height: 37px;
  }
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
