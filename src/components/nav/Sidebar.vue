/** * @file Sidebar.vue * @description This file contains the implementation of
the Sidebar component. * The Sidebar component is a navigation component that
displays a sidebar with various links and buttons. * It includes functionality
for toggling the theme mode, toggling the sidebar, and handling media queries
for mobile view. * The component accepts a prop for the dark mode theme. */
<template>
  <div
    class="sidebar"
    ref="sidebarRef"
    :class="{ 'sidebar-open': isOpen, 'sidebar-dark': darkMode }"
  >
    <div class="line" :class="{ 'line-dark': darkMode }" />
    <div class="top-bar-items">
      <div
        class="top-mode"
        :class="{ 'top-mode-dark': darkMode }"
        @click="toggleTheme"
        @mouseenter="toggleHoverTheme"
        @mouseleave="toggleHoverTheme"
      >
        <i
          :class="[
            darkMode
              ? 'icon-light-mode'
              : !hoverTheme
                ? 'icon-dark-mode'
                : 'icon-dark-mode-hover',
          ]"
        />
      </div>
      <div
        class="top-mode"
        :class="{ 'top-mode-dark': darkMode }"
        @click="toggleMute"
        @mouseenter="toggleHoverMute"
        @mouseleave="toggleHoverMute"
      >
        <i
          :class="[
            darkMode
              ? userStore.getMuted
                ? 'icon-mute-dark'
                : 'icon-sound-dark'
              : !hoverMute
                ? userStore.getMuted
                  ? 'icon-mute-light'
                  : 'icon-sound-light'
                : userStore.getMuted
                  ? 'icon-mute-light-hover'
                  : 'icon-sound-light-hover',
          ]"
        />
      </div>
    </div>
    <div class="bar-items">
      <router-link
        v-if="!isPhone"
        class="bar-item-desktop"
        :class="[{ 'text-dark': darkMode }]"
        @click="toggleBar"
        to="/"
      >
        <text>Hjem</text>
      </router-link>
      <router-link
        class="bar-item-desktop"
        :class="{ 'text-dark': darkMode }"
        @click="toggleBar"
        to="/profile"
      >
        <text>Profil</text>
      </router-link>
      <router-link
        v-if="!isPhone"
        class="bar-item-desktop"
        :class="[{ 'text-dark': darkMode }]"
        @click="toggleBar"
        to="/budgetpage"
      >
        <text>Budsjett</text>
      </router-link>
      <router-link
        v-if="!isPhone"
        class="bar-item-desktop"
        :class="[{ 'text-dark': darkMode }]"
        @click="toggleBar"
        to="/challenges"
      >
        <text>Utfordringer</text>
      </router-link>
      <router-link
        v-if="!isPhone"
        class="bar-item-desktop"
        :class="[{ 'text-dark': darkMode }]"
        @click="toggleBar"
        to="/badges"
      >
        <text>Medaljer</text>
      </router-link>
      <router-link
        v-if="!isPhone"
        class="bar-item-desktop"
        :class="[{ 'text-dark': darkMode }]"
        @click="toggleBar"
        to="/saving-goals"
      >
        <text>Sparemål</text>
      </router-link>
      <div
        class="bar-item-sign"
        :class="[{ 'text-dark': darkMode }]"
        @click="logout"
        @mouseenter="toggleHoverSign"
        @mouseleave="toggleHoverSign"
      >
        <text>Logg ut</text>
      </div>
      <router-link
        class="bar-item-desktop"
        :class="[isPhone ? '' : 'contact', { 'text-dark': darkMode }]"
        @click="toggleBar"
        to="/contact"
      >
        <text>Kontakt</text>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, defineEmits } from "vue";
import { oauth2 } from "@/api/axiosConfig";
import { useApiStore } from "@/stores/apiStore";
import { useUserStore } from "@/stores/userStore";
import { useDark } from "@vueuse/core";

// Reactive variables
const darkMode = useDark();
const isOpen = ref(false);
const isPhone = ref(false);
const hoverSign = ref(false);
const hoverTheme = ref(false);
const hoverMute = ref(false);

// Emit functions
const emit = defineEmits();
const userStore = useUserStore();
const apiStore = useApiStore();

// Toggle theme mode
const toggleTheme = () => {
  emit("theme");
};

// Toggle mute mode
const toggleMute = () => {
  userStore.toggleMuted();
};

// Toggle sidebar
const toggleBar = () => {
  emit("bar");
};

// Toggle hover state for sign out button
const toggleHoverSign = () => {
  hoverSign.value = !hoverSign.value;
};

// Toggle hover state for theme mode toggle
const toggleHoverTheme = () => {
  hoverTheme.value = !hoverTheme.value;
};

// Toggle hover state for mute mode toggle
const toggleHoverMute = () => {
  hoverMute.value = !hoverMute.value;
};

/**
 * Function to logout the user and revoke the access token
 */
const logout = () => {
  oauth2.post("/oauth2/revoke", {
    token: userStore.getAccessToken,
  });
  const clientId = apiStore.clientId;
  const authUrl =
    apiStore.getBackendUrl +
    `/connect/logout?client_id=${clientId}&id_token_hint=${userStore.getIdToken}&post_logout_redirect_uri=${apiStore.getBaseUrl}`;
  userStore.logout();
  sessionStorage.clear();
  window.location.href = authUrl;
};

// Handle media query for mobile view
onMounted(() => {
  const mediaQuery = window.matchMedia("(max-width: 480px)");
  const handleMediaChange = (e: any) => {
    isPhone.value = e.matches;
  };
  mediaQuery.addEventListener("change", handleMediaChange);
  handleMediaChange(mediaQuery);
});
</script>

<style scoped>
/* Styles for the sidebar component */
.sidebar {
  position: fixed;
  z-index: 990;
  top: 0;
  right: 0;
  background-color: #a6cd94;
  height: 100vh;
  width: 80vw;
  border-left: 3px solid rgba(0, 0, 0, 0.5);
}
.sidebar-dark {
  border-left: 2px solid #757bfd;
  background-color: #23244b;
}

/* Styles for the top bar items */
.top-bar-items {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 90px;
  width: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
}

/* Styles for the theme mode toggle */
.top-mode {
  height: 120px;
  width: 90px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.5s;
}

.top-mode:hover {
  background-color: #4b644a;
  .icon-dark-mode {
    stroke: #f0f0f0;
  }
  color: #f0f0f0;
}

.top-mode-dark:hover {
  background: #757bfd;
}

/* Styles for the line separator */
.line {
  margin-top: 89px;
  width: 100%;
  height: 2px;
  background-color: #4b644a;
}

.line-dark {
  background-color: #757bfd;
}

/* Styles for the bar items */
.bar-items {
  font-size: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
  min-height: 800px;
}

/* Styles for the desktop bar items */
.bar-item-desktop {
  cursor: pointer;
  color: black;
  height: 80px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: 0.5s;
  text-decoration: none;
}

@media screen and (max-height: 1000px) {
  .bar-item-desktop {
    height: 60px;
    font-size: 28px;
  }
  .bar-item-sign {
    height: 60px;
    font-size: 28px;
  }
}

.text-dark {
  color: white;
}

/* Styles for the contact bar item */
.bar-item-desktop.contact {
  position: absolute;
  bottom: 0;
}

.bar-item-desktop:hover {
  background-color: #4b644a;
  color: #f0f0f0;
}

/* Styles for the sign out button */
.bar-item-sign {
  cursor: pointer;
  color: #000000;
  height: 80px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.5s;
}

.bar-item-sign.text-dark {
  color: #f0f0f0;
}

.bar-item-sign:hover {
  background-color: rgba(255, 0, 0, 0.8);
  color: #f0f0f0;
}

.bar-item-desktop.text-dark:hover {
  background-color: #757bfd;
  color: #f0f0f0;
}

/* Media query for responsive design */
@media screen and (min-width: 481px) {
  .sidebar {
    width: 20vw;
    min-width: 300px;
  }
}
</style>
