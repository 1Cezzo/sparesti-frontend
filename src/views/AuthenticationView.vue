/** Component for login. Deprecated, and only used to test for design on
frontend as Oauth2 makes login happen in backend */
<template>
  <div class="authentication-wrapper">
    <div class="piggy-bank-image">
      <img
        v-bind:src="
          isDark ? '/public/long-logo-darkmode.png' : '/public/long-logo.png'
        "
        alt="piggy-bank on a walk"
      />
    </div>
    <div class="authentication-container">
      <div class="static-content">
        <p>
          Welcome to SpareSti! <br />Application to make your wallet happier.
          <br />Free to use, money back guarantee.
        </p>
      </div>
      <div class="dynamic-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDark } from "@vueuse/core";

const isDark = useDark();
</script>

<style scoped>
.authentication-wrapper {
  overflow: hidden;
}
.authentication-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  min-height: 100vh;
  place-items: center;
}

.piggy-bank-image img {
  max-width: 60%;
  height: auto;
  position: absolute;
  top: -2vw;
  left: -15vw;
  z-index: -1;
}

.static-content {
  width: 100%;
  height: 100%;
  align-content: center;
  border-right: 1px solid var(--color-border);
  padding-left: 20rem;
}

.dynamic-content {
  width: 100%;
  align-items: center;
  text-align: center;
}

.static-content {
  font-size: 1.5rem;
  text-align: left;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .authentication-container {
    grid-template-columns: 1fr;
  }

  .static-content {
    display: none;
  }

  .dynamic-content {
    display: flex;
    justify-content: center;
  }
}
</style>
