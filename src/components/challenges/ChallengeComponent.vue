<template>
  <div class="challengeBox">
    <div class="challengeHeader">
      <div class="timeSpanDiv">
        <p class="timeSpan">{{ challengeObject.timeInterval }}</p>
      </div>
      <div :class="{ daysRemainingDiv: challengeExpired }">
        <p class="daysRemaining">{{ timeLeftText }}</p>
      </div>
    </div>
    <h2 class="challengeTitle">{{ challengeObject.title }}</h2>
    <ChallengeProgress
      :challenge-type="challengeType"
      :target-amount="challengeObject.targetAmount"
      :saved-amount="challengeObject.usedAmount"
      :media-url="challengeObject.mediaUrl || ''"
    />
    <p class="challengeText">{{ challengeObject.description }}</p>

    <div class="completeButtonContainer">
      <ButtonComponent
        :foreground-color="'#83FF83'"
        :background-color="'#2ABF2A'"
        v-if="completed"
        class="completeButton"
        @click="updateCompleted()"
      >
        <template v-slot:content>
          <p class="completeText">Fullfør!</p>
        </template>
      </ButtonComponent>

      <ButtonComponent
        v-if="failed"
        class="removeButton"
        @click="updateCompleted"
      >
        <template v-slot:content>
          <p class="removeText">Fjern Utfordring</p>
        </template>
      </ButtonComponent>

      <ButtonComponent
        @click="toggleAddPopup"
        v-if="challengeType === 'Spare' && !completed && !failed"
        class="addButton"
      >
        <template v-slot:content>
          <p>Legg til Penger</p>
        </template>
      </ButtonComponent>

      <ButtonComponent
        @click="toggleAddPopup"
        v-if="challengeType === 'Budsjett' && !failed && !completed"
        class="addButton"
      >
        <template v-slot:content>
          <p>Legg til Penger</p>
        </template>
      </ButtonComponent>

      <ButtonComponent
        @click="toggleAddPopup"
        v-if="challengeType === 'Forbruk' && !failed && !completed"
        class="addButton"
      >
        <template v-slot:content>
          <p>Legg til Produkt</p>
        </template>
      </ButtonComponent>
    </div>

    <PopupComponent
      @togglePopup="toggleAddPopup"
      :is-visible="addPopupIsVisible"
    >
      <template v-slot:content>
        <div class="addPopup">
          <div v-if="challengeType === 'Forbruk'">
            <p>Er du sikker på at du vil legge til et produkt?</p>
            <div class="popupButtonsDiv">
              <ButtonComponent
                class="popupButton"
                @click="addPopupIsVisible = false"
              >
                <template v-slot:content>
                  <p>Avbryt</p>
                </template>
              </ButtonComponent>
              <ButtonComponent
                class="popupButton"
                @click="addToChallenge('purchase')"
              >
                <template v-slot:content>
                  <p>Bekreft</p>
                </template>
              </ButtonComponent>
            </div>
          </div>

          <div v-if="challengeType === 'Spare' || challengeType === 'Budsjett'">
            <p>Hvor mye penger vil du legge til?</p>
            <input
              min="1"
              :max="challengeObject.targetAmount - challengeObject.usedAmount"
              type="number"
            />
            <div class="popupButtonsDiv">
              <ButtonComponent
                class="popupButton"
                @click="addPopupIsVisible = false"
              >
                <template v-slot:content>
                  <p>Avbryt</p>
                </template>
              </ButtonComponent>
              <ButtonComponent
                v-if="challengeType === 'Spare'"
                class="popupButton"
                @click="addToChallenge('saving')"
              >
                <template v-slot:content>
                  <p>Bekreft</p>
                </template>
              </ButtonComponent>
              <ButtonComponent
                v-if="challengeType === 'Budsjett'"
                class="popupButton"
                @click="addToChallenge('consumption')"
              >
                <template v-slot:content>
                  <p>Bekreft</p>
                </template>
              </ButtonComponent>
            </div>
          </div>
        </div>
      </template>
    </PopupComponent>
  </div>
</template>

<script setup lang="ts">
import ChallengeProgress from "./ChallengeProgressComponent.vue";
import type { MasterChallenge } from "@/types/challengeTypes";
import { computed, ref } from "vue";
import {
  addAmountToChallenge,
  updateCompletedChallenge,
} from "@/api/challengeHooks";
import ButtonComponent from "@/components/assets/ButtonComponent.vue";
import PopupComponent from "@/components/assets/PopupComponent.vue";

const addPopupIsVisible = ref(false);
function toggleAddPopup() {
  addPopupIsVisible.value = !addPopupIsVisible.value;
}

const props = defineProps({
  challengeObject: {
    type: Object as () => MasterChallenge,
    required: true,
  },
});

const challengeType = ref("");

if (props.challengeObject.productName) {
  challengeType.value = "Forbruk";
} else if (props.challengeObject.productCategory) {
  challengeType.value = "Budsjett";
} else {
  challengeType.value = "Spare";
}

const challengeExpired =
  new Date(props.challengeObject.expiryDate).getTime() < new Date().getTime();

const completed = computed(() => {
  if (challengeType.value === "Spare") {
    return (
      props.challengeObject.usedAmount >= props.challengeObject.targetAmount
    );
  } else {
    return (
      props.challengeObject.usedAmount <= props.challengeObject.targetAmount &&
      challengeExpired
    );
  }
});

const failed = computed(() => {
  if (challengeType.value === "Spare") {
    return !completed.value && challengeExpired;
  } else if (challengeType.value === "Forbruk") {
    return (
      props.challengeObject.usedAmount >= props.challengeObject.targetAmount
    );
  } else if (challengeType.value === "Budsjett") {
    return (
      props.challengeObject.usedAmount >= props.challengeObject.targetAmount
    );
  }
});

const timeLeftText = computed(() => {
  let timeLeft =
    new Date(props.challengeObject.expiryDate).getTime() - new Date().getTime();
  let daysLeft = timeLeft / (1000 * 60 * 60 * 24);
  if (challengeExpired) {
    return "Expired";
  } else if (daysLeft < 1) {
    let hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
    let minutesLeft = Math.floor(
      (timeLeft - hoursLeft * 1000 * 60 * 60) / (1000 * 60),
    );
    let secondsLeft = Math.floor(
      (timeLeft - hoursLeft * 1000 * 60 * 60 - minutesLeft * 1000 * 60) / 1000,
    );

    return hoursLeft + "h " + minutesLeft + "m " + secondsLeft + "s";
  } else {
    return Math.floor(daysLeft) + " Days Left";
  }
});

const updateCompleted = async () => {
  try {
    await updateCompletedChallenge(Number(props.challengeObject.id));
    console.log("Challenge completed successfully.");
    alert("Challenge completed successfully!");
    setTimeout(() => {
      location.reload();
    }, 1000);
  } catch (error) {
    console.error("Failed to complete challenge:", error);
  }
};

const addToChallenge = async (challengeInput: string) => {
  try {
    const inputElement = document.querySelector('input[type="number"]');
    let amountToAdd = inputElement
      ? Number((inputElement as HTMLInputElement).value)
      : 0;
    if (challengeInput === "purchase") {
      amountToAdd = 1;
    }
    if (
      !amountToAdd ||
      amountToAdd <= 0 ||
      amountToAdd >
        props.challengeObject.targetAmount - props.challengeObject.usedAmount
    ) {
      alert("Invalid amount");
      console.error("Invalid amount");
      return;
    }
    await addAmountToChallenge(
      challengeInput,
      Number(props.challengeObject.id),
      amountToAdd,
    );
    console.log("Amount added to challenge successfully.");
    addPopupIsVisible.value = false;
    alert("Lagt til beløp til utfordring!");
    setTimeout(() => {
      location.reload();
    }, 1000);
  } catch (error) {
    console.error("Failed to add amount to challenge:", error);
  }
};
</script>

<style scoped>
.challengeBox {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 1rem;
  background-color: var(--color-badges-owned);
  border: 2px solid var(--color-badges-owned-hover);
  border-radius: 20px;
  padding: 1rem 0;
}

.challengeHeader {
  display: flex;
  justify-content: space-between;
  margin: 0 0.5rem;
}

.timeSpanDiv {
  background-color: #f5c116;
  border-radius: 40px;
  padding: 0 1rem;
  vertical-align: center;
}

.timeSpan {
  color: #f0f0f0;
  font-weight: 500;
  font-size: 1rem;
}

.daysRemainingDiv {
  float: right;
  background-color: #ff4d4d;
  border-radius: 40px;
  padding: 0 1rem;
  vertical-align: center;
}

.daysRemaining {
  color: var(--color-text);
  font-weight: 500;
  font-size: 1rem;
}

.challengeTitle {
  margin: 10px;
  color: var(--color-text);
  font-weight: 500;
  overflow-wrap: anywhere;
}

.challengeText {
  color: var(--color-text);
  margin: 0.6rem 0.3rem;
  white-space: normal;
}

.completeButtonContainer {
  height: 30px;
}

.completeButton {
  width: 100px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.completeText {
  color: #12d612;
  font-size: 1rem;
  font-weight: 700;
}

.removeButton {
  width: 150px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.removeText {
  color: #8f0d0d;
  font-size: 1rem;
  font-weight: 700;
}

.addButton {
  width: 150px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.addPopup {
  position: absolute;
  width: 200px;
  height: max-content;
  background-color: var(--color-badges-owned);
  border: 2px solid var(--color-badges-owned-hover);
  border-radius: 20px;
  padding: 1rem 0;
  top: 40%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
}

.popupButton {
  width: 70px;
  height: 30px;
  margin: 0 0.5rem;
}

.popupButtonsDiv {
  margin: 1rem 0;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
