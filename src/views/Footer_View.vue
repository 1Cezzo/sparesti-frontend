<template>
  <footer>
    <!-- Phone bar -->
    <div class="phone-bar" :class="{ 'phone-bar-dark': darkMode }">
      <RouterLink
        class="phone-bar-item"
        :class="{ 'phone-bar-item-dark': darkMode }"
        to="/"
      >
        <i :class="darkMode ? 'icon-home-dark' : 'icon-home'"></i>
      </RouterLink>
      <RouterLink
        class="phone-bar-item"
        :class="{ 'phone-bar-item-dark': darkMode }"
        to="/challenges"
      >
        <i :class="darkMode ? 'icon-challenges-dark' : 'icon-challenges'"></i>
      </RouterLink>
      <RouterLink
        class="phone-bar-item"
        :class="{ 'phone-bar-item-dark': darkMode }"
        to="/budgetpage"
      >
        <i :class="darkMode ? 'icon-budget-dark' : 'icon-budget'"></i>
      </RouterLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useDark } from "@vueuse/core";
// Dark mode preference based on user's system settings
const darkMode = useDark();
</script>

<style scoped>
.phone-bar {
  position: fixed;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background-color: #ecffda;
  border-top: 2px solid #4b644a;
  z-index: 996;
}

.phone-bar-dark {
  background-color: #23244b;
  border-top: 2px solid #757bfd;
}

.phone-bar-item {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-bar-item:hover {
  background-color: #a6cd94;
}

.phone-bar-item-dark:hover {
  background-color: #757bfd;
}
</style>
