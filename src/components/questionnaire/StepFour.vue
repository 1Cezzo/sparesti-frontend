<template>
  <div class="form-container">
    <div v-if="!isLoading">
      <h2>Vi trenger Litt mer info</h2>
      <p>Legg til produkter du vil spare på</p>
      <div class="product-list">
        <!-- Product Header -->
        <div class="product-header">
          <span class="header-name">Navn</span>
          <span class="header-amount">Mengde</span>
          <span class="header-price">Enhets pris</span>
          <span class="header-action"></span>
        </div>
        <!-- Product Items -->
        <div v-for="(item, index) in products" :key="index" class="product-item">
          <span>{{ item.name }}</span>
          <span>{{ item.amount }}</span>
          <span>{{ item.price }}kr</span>
          <button @click="removeProduct(index)">X</button>
        </div>
      </div>
      <!-- New Product Form -->
      <div class="new-product">
        <label for="productName" class="form-label">Produktnavn:</label>
        <input
          v-model="newProduct.name"
          placeholder="Produkt"
          class="new-product-input"
        />
        <label for="productAmount" class="form-label">Mengde:</label>
        <input
          v-model.number="newProduct.amount"
          type="number"
          placeholder="Mengde"
          class="new-product-input"
        />
        <div class="frequency-wrapper">
          <label for="frequencySelect" class="form-label">Hvor ofte?</label>
          <select v-model="newProduct.frequency" class="timeunit-select">
            <option value="daily">Daglig</option>
            <option value="weekly">Ukentlig</option>
            <option value="monthly">Månedlig</option>
          </select>
        </div>
        <div class="price-wrapper">
          <label for="productPrice" class="form-label">Pris per enhet?</label>
          <input
            v-model="newProduct.price"
            type="number"
            placeholder="Enhetspris"
            class="price-input"
          />
          <span>kr</span>
        </div>
        <button @click="addProduct" class="add-button">Add</button>
      </div>
      <div v-if="formErrors.length" class="error-messages">
        <div v-for="error in formErrors" :key="error">{{ error }}</div>
      </div>
      <div class="button-container">
        <FormButton type="button" @click="goBack">Tilbake</FormButton>
        <FormButton type="submit" @click="finishQuestionnaire">Neste</FormButton>
      </div>
      </div>
    <div v-else>
      <p>Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted, watch } from "vue";
import { useQuestionnaireStore } from "@/stores/questionnaireStore";
import {
  submitUserInfo,
  updateUserInfo,
  updateAccounts,
} from "@/api/userHooks";
import FormButton from "@/components/forms/FormButton.vue";
import { useUserStore } from "@/stores/userStore";

const store = useQuestionnaireStore();
const userStore = useUserStore();
const isLoading = ref(false);
const error = ref(null);
const emit = defineEmits(["update-step"]);

const products = ref(store.stepFourData.products);
const newProduct = ref({ name: "", frequency: "daily", amount: 0, price: 0 });
const formErrors = ref<string[]>([]);

const checkingAccount = ref(
  store.stepTwoData.checkingAccount.replace(/\s/g, ""),
);
const savingsAccount = ref(store.stepTwoData.savingsAccount.replace(/\s/g, ""));

watch(
  products,
  (newProducts) => {
    store.updateStepFourData({ products: newProducts });
  },
  { deep: true },
);

/**
 * Adds a new product to the list of products.
 * Validates the input fields before adding the product.
 */
function addProduct() {
  formErrors.value = [];

  if (!newProduct.value.name.trim()) {
    formErrors.value.push("Produktnavn er påkrevd.");
  }
  if (newProduct.value.price <= 0) {
    formErrors.value.push("Pris per enhet må være større enn 0.");
  }
  if (newProduct.value.amount <= 0) {
    formErrors.value.push("Har du ingen mengde?");
  }

  if (formErrors.value.length === 0) {
    products.value.push({
      name: newProduct.value.name,
      frequency: newProduct.value.frequency,
      amount: newProduct.value.amount,
      price: newProduct.value.price,
    });
    newProduct.value = { name: "", frequency: "daily", amount: 0, price: 0 };
  }
}

function removeProduct(index: any) {
  products.value.splice(index, 1);
}

/**
 * Submits the questionnaire data that has been stored in the
 * QuestionnaireStore to the server if the userinformation has not yet been created.
 * Also doubles as a function to updates the user information
 * if they decide to go back and change it.
 */
const finishQuestionnaire = async () => {
  isLoading.value = true;
  const checkingAccountNumber = parseInt(checkingAccount.value, 10);
  const savingsAccountNumber = parseInt(savingsAccount.value, 10);
  const userInfo = {
    ...store.getAllData(),
    checkingAccount: checkingAccount.value,
    savingsAccount: savingsAccount.value,
    budgetingProducts: products.value.map((product) => ({
      name: product.name,
      frequency: product.frequency.toUpperCase(),
      amount: product.amount,
      unitPrice: product.price,
    })),
  };

  try {
    if (userStore.getUserInfoExists) {
      await updateUserInfo(userInfo);
    } else {
      await submitUserInfo(userInfo);
      userStore.setUserInfoExists(true);
    }

    await updateAccounts(checkingAccountNumber, savingsAccountNumber);
    emit("update-step", 5);
  } catch (err: any) {
    error.value = err.message || "Greide ikke å fullføre oppdateringen.";
  } finally {
    isLoading.value = false;
  }
};

function goBack() {
  emit("update-step", 3);
}

onMounted(() => {
  products.value = [...store.stepFourData.products];
});
</script>

<style scoped>
.product-list {
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 1rem;
  width: 100%;
  overflow-y: auto;
  text-align: left;
}

.product-header {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 2px solid #ccc;
  margin-bottom: 10px;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}

.product-item:last-child {
  border-bottom: none;
}

.header-name,
.item-name {
  flex: 2;
}

.header-amount,
.item-amount {
  flex: 2;
}

.header-price,
.item-price {
  flex: 3;
}

.header-action {
  flex: 0.5;
  visibility: hidden;
}

.product-item button {
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  text-align: center;
}

.new-product-input,
.price-input,
.timeunit-select {
  border: none;
  border-radius: 5px;
  padding: 5px;
  margin-bottom: 10px;
  width: 25%;
}

.add-button {
  border: none;
  border-radius: 5px;
  padding: 7px 15px;
  cursor: pointer;
  text-align: center;
  margin-top: 10px;
}

.button-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 30px;
}

.form-container h2,
.form-container p {
  margin-bottom: 10px;
}

.error-messages {
  color: #e57373;
}
</style>

@/stores/QuestionnaireStore
