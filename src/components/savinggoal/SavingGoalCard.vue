<template>
  <div
    :class="{
      'saving-goal-card': true,
      'green-border': savingGoal.completed,
      'yellow-border':
        !savingGoal.completed &&
        savingGoal.savedAmount < savingGoal.targetAmount,
      'red-border':
        new Date(savingGoal.deadline + 'T00:00:00').getTime() <=
          new Date(todaysDate + 'T00:00:00').getTime() &&
        savingGoal.savedAmount < savingGoal.targetAmount,
    }"
  >
    <div v-if="isEditing" class="editing-area">
      <input
        v-model="editableGoal.name"
        class="editing-input"
        placeholder="Navn på sparemål"
        maxlength="100"
      />
      <input
        v-model="editableGoal.targetAmount"
        class="editing-input"
        type="number"
        placeholder="Sparemål i kr"
      />
      <input
        v-model="editableGoal.deadline"
        class="editing-input"
        type="date"
        placeholder="Frist"
        :min="minDeadline.toISOString().split('T')[0]"
      />
      <div class="form-group">
        <label for="edit-upload-type">Velg opplastingstype:</label>
        <select id="edit-upload-type" v-model="editUploadType">
          <option value="image">Bilde</option>
          <option value="icon">Ikon</option>
          <option value="emoji">Emoji</option>
        </select>
      </div>
      <!-- Render appropriate input based on selected upload type -->
      <div v-if="editUploadType === 'image'" class="form-group">
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
      <div v-else-if="editUploadType === 'icon'" class="form-group">
        <select v-model="selectedIconUrl">
          <option v-for="icon in icons" :value="icon.url">
            {{ icon.name }}
          </option>
        </select>
        <div v-if="selectedIconUrl" class="icon-preview">
          <img :src="selectedIconUrl" alt="Valgt ikon" />
        </div>
      </div>
      <div v-else-if="editUploadType === 'emoji'" class="form-group">
        <EmojiPickerComponent
          :emoji-prop="emoji"
          @pickEmoji="pickEmoji"
          id="challengeEmojiPicker"
        />
      </div>
      <div class="button-group">
        <button @click="saveChanges" class="editing-button">
          Save Changes
        </button>
        <button @click="isEditing = false" class="editing-button">
          Cancel
        </button>
      </div>
    </div>
    <div v-else>
      <h2 class="name" :title="savingGoal.name" v-tooltip="savingGoal.name">
        {{ savingGoal.name }}
      </h2>
      <p>
        <strong>Sparemål:</strong> {{ savingGoal.savedAmount }} /
        {{ savingGoal.targetAmount }} kr
      </p>
      <p><strong>Frist:</strong> {{ savingGoal.deadline }}</p>
      <div
        class="image"
        v-if="savingGoal.mediaUrl?.length && savingGoal.mediaUrl.length > 4"
      >
        <img :src="savingGoal.mediaUrl" alt="Media" class="img" />
      </div>
      <div class="emoji-div" v-else>
        <span class="emoji">{{ savingGoal.mediaUrl }}</span>
      </div>
      <p
        v-if="
          savingGoal.completed &&
          savingGoal.savedAmount >= savingGoal.targetAmount
        "
        class="completed"
      >
        Completed
      </p>
      <div v-if="editable" class="delete-icon" @click="confirmDelete">✖</div>
      <div v-if="author" class="edit-icon" @click="startEditing">✎</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import EmojiPickerComponent from "@/components/assets/EmojiPickerComponent.vue";
import { defineProps, defineEmits, ref } from "vue";
import type { SavingGoal } from "@/types/SavingGoal";
import {
  updateSavingGoal,
  deleteSavingGoal,
  deleteSavingGoalFromUser,
} from "@/api/savingGoalHooks";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";
import { icons } from "@/utils/saving-goal-icons";
import { uploadImage } from "@/utils/imageUtils";

const props = defineProps({
  savingGoal: {
    type: Object as () => SavingGoal,
    default: () => ({
      name: "",
      targetAmount: 0,
      savedAmount: "0",
      deadline: "",
      mediaUrl: "",
      completed: false,
    }),
  },
  author: {
    type: Boolean,
    default: false,
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["deleteGoal", "updateGoal"]);

const isEditing = ref(false);
const editableGoal = ref<SavingGoal>(props.savingGoal);
const todaysDate = new Date().toISOString().split("T")[0];
const userStore = useUserStore();
const userEmail = userStore.getUserName;
const router = useRouter();
const imagePreview = ref<string | null>(null);
const selectedIconUrl = ref<string | null>(null);
const minDeadline = new Date();
minDeadline.setDate(minDeadline.getDate() + 1);
const emoji = ref("");

// Initialize editUploadType with the default value from props.savingGoal.mediaUrl
const editUploadType = ref(props.savingGoal.mediaUrl ? "image" : "");

const startEditing = () => {
  editableGoal.value = { ...props.savingGoal };
  isEditing.value = true;
};

function pickEmoji(e: string) {
  emoji.value = e;
}

const saveChanges = async () => {
  try {
    if (
      editableGoal.value.name.trim() === "" ||
      editableGoal.value.targetAmount < 100 ||
      editableGoal.value.targetAmount > 1000000 ||
      editableGoal.value.deadline <= todaysDate
    ) {
      alert("Sparemål må være over 100 kr, ha et navn og en gyldig frist.");
      return;
    }

    if (editUploadType.value === "image") {
      const fileInput = document.getElementById("image") as HTMLInputElement;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const imageUrl = await uploadImage(file, imagePreview);
        if (imageUrl !== null) {
          editableGoal.value.mediaUrl = imageUrl;
        } else {
          editableGoal.value.mediaUrl = "";
        }
      }
    } else if (editUploadType.value === "icon") {
      editableGoal.value.mediaUrl = selectedIconUrl.value || "";
    } else if (editUploadType.value === "emoji") {
      editableGoal.value.mediaUrl = emoji.value;
    }

    await updateSavingGoal(Number(props.savingGoal.id), {
      ...editableGoal.value,
      mediaUrl: editableGoal.value.mediaUrl || "",
    });
    emits("updateGoal", editableGoal.value);
    isEditing.value = false;
    window.location.reload();
  } catch (error) {
    console.error("Error updating saving goal:", error);
  }
};

const confirmDelete = async () => {
  try {
    const confirmDelete = confirm(
      "Er du sikker på at du vil fjerne deg selv fra dette sparemålet?",
    );
    if (!confirmDelete) return;
    await deleteSavingGoalFromUser(userEmail, Number(props.savingGoal.id));
    try {
      await deleteSavingGoal(Number(props.savingGoal.id));
    } catch (error) {
      console.log("Can't delete saving goal that has users");
    }
    emits("deleteGoal", props.savingGoal.id);
  } catch (error) {
    console.error("Error deleting saving goal:", error);
  }
  router.push("/saving-goals");
};

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
</script>

<style scoped>
.saving-goal-card {
  position: relative;
  max-width: 600px;
  width: 222px;
  height: 424px;
  margin: auto;
  margin-top: 2%;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: white;
  margin-bottom: 5%;
  transition: transform 0.3s ease;
}

.saving-goal-card:hover {
  background-color: #f0f0f0;
  box-shadow: 0 0 5px #ccc;
  transform: scale(1.05);
  cursor: pointer;
}

#challengeEmojiPicker {
  margin-top: 20px;
  width: 45px;
  height: 45px;
}

.header {
  padding-top: 1%;
}

.image img {
  max-width: 30vh;
  width: 30vh;
  margin-top: 8px;
  width: -webkit-fill-available;
}

.image {
  display: flex;
  justify-content: center;
  padding-top: 10px;
}

.icon-preview img,
.image-preview img {
  width: 50%;
  height: 50%;
}

.image-preview {
  padding-top: 10px;
}

.emoji-div {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.emoji {
  font-size: 9.5rem;
  line-height: normal;
}

.completed {
  color: lightgreen;
  font-weight: bold;
  font-size: 20px;
  text-align: center;
  margin-top: 10px;
}

.delete-icon,
.edit-icon {
  position: absolute;
  top: 10px;
  font-size: 24px;
  transition: transform 0.3s ease;
}

.delete-icon:hover,
.edit-icon:hover {
  transform: scale(1.5);
  cursor: crosshair;
}

.delete-icon {
  right: 5%;
  color: red;
}

.edit-icon {
  right: 17.5%;
  color: green;
}

.editing-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.editing-input:focus {
  outline: none;
  border-color: #8fbf7f;
}

.editing-button {
  background-color: #8fbf7f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  margin-top: 10px;
}

.editing-button:hover {
  background-color: #67a652;
}

h2 {
  padding-right: 70px;
  overflow-wrap: anywhere;
  overflow: hidden;
  max-height: 70px;
}

.saving-goal-card.green-border {
  border: 2px solid var(--border-color-green);
}

.saving-goal-card.yellow-border {
  border: 2px solid var(--border-color-yellow);
}

.saving-goal-card.red-border {
  border: 2px solid var(--border-color-red);
}

.editing-area {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.icon-preview {
  display: flex;
  justify-content: center;
  margin-top: 10px;
  width: 60%;
  height: auto;
}

.editing-button {
  width: 48%;
  margin: 5px 1%;
}

.button-group {
  display: flex;
  justify-content: space-between;
  padding-bottom: 2%;
}

.name {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  white-space: normal;
  padding-right: 70px;
}

.name[title] {
  position: relative;
}

.name[title]:hover::after {
  content: attr(title);
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 5px;
  border-radius: 4px;
  z-index: 999;
  left: 100%;
  top: 0;
  white-space: normal;
}
</style>
