<div class="loader">
  <div class="train">
    <div class="windows" />
    <div class="lights" />
  </div>
  <div class="rails">
    <div class="ties" />
    <div class="ties" />
    <div class="ties" />
  </div>
</div>

<style lang="scss">
$loader-color: invert(#444b54);

.rails {
  position: relative;
  text-align: center;
  width: 80px;
  &:before,
  &:after {
    background-color: $loader-color;
    border-radius: 4px;
    content: "";
    display: block;
    float: left;
    height: 40px;
    transform-origin: bottom;
    transform: skewX(-27deg);
    width: 3px;
  }
  &:after {
    float: right;
    transform: skewX(27deg);
  }
}

.ties {
  animation: track 1s infinite linear;
  background-color: $loader-color;
  border-radius: 4px;
  display: inline-block;
  height: 3px;
  opacity: 0;
  position: absolute;
  top: 89%;
  transform: translateX(-52%);
}

.ties:nth-child(2) {
  animation-delay: -0.333s;
}

.ties:nth-child(3) {
  animation-delay: -0.666s;
}

.train {
  animation: train 1.5s infinite ease-in-out;
  background-color: $loader-color;
  border-radius: 10px;
  height: 60px;
  position: relative;
  top: 1px;
  width: 60px;
}

.windows {
  background-color: invert($loader-color);
  border-radius: 4px;
  height: 23px;
  margin: 1px auto 0 auto;
  position: relative;
  top: 12px;
  width: 80%;
  &:before {
    background-color: invert($loader-color);
    border-radius: 3px;
    content: "";
    display: block;
    height: 5px;
    left: calc(50% - 7.5px);
    position: absolute;
    top: -8px;
    width: 15px;
  }
}

.lights:before,
.lights:after {
  background-color: invert($loader-color);
  border-radius: 50%;
  content: "";
  display: block;
  height: 12px;
  left: 10%;
  position: absolute;
  top: 70%;
  width: 12px;
}

.lights:after {
  left: 71%;
}

@keyframes train {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(0.5deg);
  }
  50% {
    transform: rotate(-0.5deg);
  }
  75% {
    transform: rotate(0.5deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

@keyframes track {
  0% {
    opacity: 0;
    top: 88%;
    width: 90%;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    top: 0;
    width: 38px;
  }
}

.loader {
  align-items: center;
  background-color: invert($loader-color);
  display: flex;
  flex-flow: column nowrap;
  height: 100vh;
  justify-content: center;
}
</style>
