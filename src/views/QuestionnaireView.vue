<!--
  This is the main view that renders the questionnaire components.
  It handles the navigation between the different steps of the questionnaire.
-->
<template>
  <div class="questionnaire-container">
    <div class="piggy-bank-image">
      <img
        :src="
          isDark ? '/public/long-logo-darkmode.png' : '/public/long-logo.png'
        "
        alt="piggy-bank on a walk"
      />
    </div>
    <ProgressBar :completionPercentage="completionPercentage" />
    <component
      :is="currentComponent"
      @update-step="updateStep"
      :key="currentStep"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useDark } from "@vueuse/core";
import ProgressBar from "@/components/questionnaire/ProgressBar.vue";
import StepOne from "@/components/questionnaire/StepOne.vue";
import StepTwo from "@/components/questionnaire/StepTwo.vue";
import StepThree from "@/components/questionnaire/StepThree.vue";
import StepFour from "@/components/questionnaire/StepFour.vue";
import StepFive from "@/components/questionnaire/StepFive.vue";
import StepSix from "@/components/questionnaire/StepSix.vue";

const isDark = useDark();
const components = [StepOne, StepTwo, StepThree, StepFour, StepFive, StepSix];
const totalSteps = components.length;
const currentStep = ref(1);

const currentComponent = computed(() => {
  return components[currentStep.value - 1];
});

const updateStep = (step: number) => {
  currentStep.value = Math.max(step, 1);
};

watch(currentStep, (newStep, oldStep) => {
  if (newStep > oldStep) {
    history.pushState({ step: newStep }, `Step ${newStep}`, `?step=${newStep}`);
  } else {
    history.replaceState(
      { step: newStep },
      `Step ${newStep}`,
      `?step=${newStep}`,
    );
  }
});

// Handle browser back button navigation
window.onpopstate = (event) => {
  if (event.state?.step) {
    const stepFromHistory = event.state.step;
    if (stepFromHistory !== currentStep.value) {
      currentStep.value = stepFromHistory;
    }
  } else {
    currentStep.value = 1;
    history.replaceState({ step: 1 }, "Step 1", "?step=1");
  }
};

const completionPercentage = computed(() => {
  return (currentStep.value / totalSteps) * 100;
});
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-height: 300px;
  max-width: 400px;
  margin: auto;
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 20px;
  position: relative;
  overflow: visible;
}

.piggy-bank-image img {
  max-width: 60%;
  height: auto;
  position: absolute;
  top: -20px;
  left: -20vw;
  z-index: -1;
}
</style>
