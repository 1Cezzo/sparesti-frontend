<template>
  <div class="saving-goal-form">
    <h1>Opprett et sparemål</h1>
    <form @submit.prevent="submitForm">
      <div class="form-group">
        <label for="upload-type">Velg opplastingstype:</label>
        <select id="upload-type" v-model="uploadType">
          <option value="image">Bilde</option>
          <option value="icon">Ikon</option>
          <option value="emoji">Emoji</option>
        </select>
      </div>

      <div class="form-group" v-if="uploadType === 'image'">
        <label for="image">Last opp et bilde:</label>
        <input
          type="file"
          id="image"
          @change="handleImageUpload"
          accept="image/*"
        />
        <div v-if="imagePreview" class="image-preview">
          <img :src="imagePreview" alt="Forhåndsvisning av bilde" />
        </div>
      </div>

      <div class="form-group" v-if="uploadType === 'icon'">
        <label for="icon">Velg et ikon:</label>
        <select id="icon" v-model="selectedIconUrl">
          <option v-for="icon in icons" :value="icon.url">
            {{ icon.name }}
          </option>
        </select>
        <div v-if="selectedIconUrl" class="icon-preview">
          <img :src="selectedIconUrl" alt="Valgt ikon" />
        </div>
      </div>

      <div class="form-group" v-if="uploadType === 'emoji'">
        <label for="emoji">Velg en emoji:</label>
        <EmojiPickerComponent
          :emoji-prop="emoji"
          @pickEmoji="pickEmoji"
          id="challengeEmojiPicker"
        />
      </div>

      <div class="form-group">
        <label for="title">Tittel:</label>
        <input
          type="text"
          id="title"
          v-model="savingGoal.name"
          maxlength="100"
        />
      </div>

      <div class="form-group">
        <label for="value">Mål for sparing i kr (NOK):</label>
        <input
          type="number"
          id="value"
          min="100"
          max="1000000"
          v-model.number="savingGoal.targetAmount"
        />
      </div>

      <div class="form-group">
        <label for="deadline">Deadline:</label>
        <input
          type="date"
          id="deadline"
          v-model="savingGoal.deadline"
          :min="minDeadline.toISOString().split('T')[0]"
        />
      </div>

      <button type="submit">Lagre mål</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import EmojiPickerComponent from "@/components/assets/EmojiPickerComponent.vue";
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import type { SavingGoalCreation } from "@/types/SavingGoal";
import {
  createSavingGoal,
  addSavingGoalToUser,
  userHasActiveSavingGoal,
} from "@/api/savingGoalHooks";
import { useUserStore } from "@/stores/userStore";
import { uploadImage } from "@/utils/imageUtils";
import type { SavingGoal } from "@/types/SavingGoal";
import { icons } from "@/utils/saving-goal-icons";

const uploadType = ref("image");
const savingGoal = reactive<SavingGoalCreation>({
  name: "",
  targetAmount: 0,
  mediaUrl: "",
  deadline: new Date().toISOString().split("T")[0],
});
const userStore = useUserStore();
const userEmail = userStore.getUserName;
const createdSavingGoal = ref<SavingGoal | null>(null);

const minDeadline = new Date();
minDeadline.setDate(minDeadline.getDate() + 1);
const imagePreview = ref<string | null>(null);
const selectedIconUrl = ref<string | null>(null);
const emoji = ref("");
const router = useRouter();

function pickEmoji(e: string) {
  emoji.value = e;
}

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
}

const createSavingsGoal = async (savingGoalData: SavingGoalCreation) => {
  try {
    if (await userHasActiveSavingGoal(userEmail)) {
      window.alert("Du har allerede et aktivt sparemål!");
      router.push("/saving-goals");
    } else {
      const newSavingGoal = await createSavingGoal(savingGoalData);
      console.log(newSavingGoal);
      createdSavingGoal.value = newSavingGoal;
      const savingGoalId = createdSavingGoal.value
        ? createdSavingGoal.value.id
        : null;
      console.log(savingGoalId);
      await addSavingGoalToUser(userEmail, Number(savingGoalId));
      console.log("Saving goal created:", newSavingGoal);
      alert("Sparemål opprettet!");
      router.push("/saving-goals");
    }
  } catch (error) {
    console.error("Error creating saving goal:", error);
  }
};

const submitForm = async () => {
  if (!savingGoal.name || !savingGoal.targetAmount || !savingGoal.deadline) {
    window.alert("Fyll ut alle feltene!");
    return;
  }

  if (uploadType.value === "image") {
    const fileInput = document.getElementById("image") as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      const imageUrl = await uploadImage(file, imagePreview);
      if (imageUrl !== null) {
        savingGoal.mediaUrl = imageUrl;
      } else {
        savingGoal.mediaUrl = "";
      }
    } else {
      window.alert("Error ved opplasting av bilde!");
      savingGoal.mediaUrl = "";
      return;
    }
  } else if (uploadType.value === "icon") {
    savingGoal.mediaUrl = selectedIconUrl.value || "";
  } else if (uploadType.value === "emoji") {
    savingGoal.mediaUrl = emoji.value;
  }
  createSavingsGoal(savingGoal);
};
</script>

<style scoped>
h1 {
  text-align: center;
  margin-bottom: 20px;
  color: var(--color-text);
}

label {
  color: black;
}

.saving-goal-form {
  display: flex;
  max-width: fit-content;
  margin: auto;
  margin-top: 2%;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: var(--color-background);
  border: 2px solid var(--color-border);
  margin-bottom: 5%;
  flex-direction: column;
  align-content: center;
  align-items: center;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: var(--color-text);
}

input[type="file"],
input[type="text"],
input[type="number"],
textarea {
  width: 100%;
  padding: 8px;
  line-height: 1.5;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.image-preview img {
  width: 100px;
  height: auto;
  margin-top: 20px;
  border-radius: 4px;
}

.icon-preview img {
  width: 100px;
  height: 100px;
  margin-top: 20px;
}

#challengeEmojiPicker {
  width: 45px;
  height: 45px;
}

.image-preview,
.icon-preview {
  text-align: center;
}

.emoji {
  font-size: 2rem;
  text-align: center;
  margin-top: 20px;
  opacity: 1;
}

button {
  padding: 10px 20px;
  color: var(--color-text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
