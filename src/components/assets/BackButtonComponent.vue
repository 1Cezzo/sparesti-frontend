<!--
  BackButtonComponent
  This component is a reusable back button. It can be used anywhere a back button is needed in the application.
  The button is styled with a green circular background and a left-pointing arrow.
-->
<
<template>
  <div class="buttonContainer">
    <div class="bgCircle">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 12H8M8 12L11 9M8 12L11 15"
          stroke="var(--color-button-challenges-back)"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7"
          stroke="var(--color-button-challenges-back)"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.buttonContainer {
  position: relative;
  cursor: pointer;
}

.bgCircle {
  position: absolute;
  width: 150%;
  height: 150%;
  background-color: var(--color-button-challenges);
  border-radius: 30px;
  top: -10%;
  left: 70%;
  transform: translateX(-50%);
}
</style>
