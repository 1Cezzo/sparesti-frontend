<template>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
  />
  <div class="layout">
    <div id="nav" v-if="!isSetup">
      <NAV @theme="handleThemeChange" />
    </div>

    <div id="content" :style="contentStyle">
      <RouterView />
    </div>

    <FOOTER v-if="isPhone" id="footer-box" />
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { RouterView, useRoute } from "vue-router";
import { inject } from '@vercel/analytics';
import NAV from "./views/Nav_View.vue";
import { onMounted, ref, computed } from "vue";
import FOOTER from "./views/Footer_View.vue";

const route = useRoute();
const isSetup = computed(() => route.name === "setup");
const contentStyle = computed(() => {
  return {
    paddingTop: isSetup.value ? "90px" : "0px", // Keep 90px space when setup, none otherwise
    top: isSetup.value ? "0px" : "90px", // Add top only when nav is present
  };
});
const isDark = useDark();
const toggleDark = useToggle(isDark);
const emit = defineEmits();
const handleThemeChange = () => {
  toggleDark();
  document.body.classList.toggle("dark", isDark.value);
};
document.body.classList.toggle("dark", isDark.value);

const isPhone = ref(false);
let mql;

onMounted(() => {
  inject();
  mql = window.matchMedia("(max-width: 480px)");
  isPhone.value = mql.matches;

  mql.addEventListener("change", (e) => {
    isPhone.value = e.matches;
  });
});
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
}

#nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

#content {
  position: relative;
  top: 90px;
  overflow-y: hidden;
}

#footer-box {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 1000;
}

@media screen and (max-width: 480px) {
  #content {
    padding-bottom: 60px;
  }
}
</style>
