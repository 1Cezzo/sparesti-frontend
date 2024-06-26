import { api } from "@/api/axiosConfig";
import { type SavingGoalCreation, type SavingGoal } from "@/types/SavingGoal";
import { ref } from "vue";

// This should be toggled when a saving goal has its amount updated.
export const savingGoalListener = ref(false);

function notify() {
  savingGoalListener.value = !savingGoalListener.value;
}

export const createSavingGoal = async (
  data: SavingGoalCreation,
): Promise<SavingGoal> => {
  try {
    const response = await api.post(`/savings-goals`, data);

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Failed to create saving goal");
    }
  } catch (error) {
    throw new Error(`Error creating saving goal: ${error}`);
  }
};

export const addSavingGoalToUser = async (
  userEmail: string,
  savingGoalId: number,
): Promise<void> => {
  try {
    const response = await api.post(
      `/savings-goals/add-user/${savingGoalId}?userEmail=${encodeURIComponent(userEmail)}`,
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to add saving goal to user");
    }
  } catch (error) {
    throw new Error(`Error adding saving goal to user: ${error}`);
  }
};

export const getSavingGoals = async () => {
  try {
    const response = await api.get(`/savings-goals/savings-goals`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to get saving goals");
    }
  } catch (error) {
    throw new Error(`Error getting saving goals: ${error}`);
  }
};

export const getSavingGoalById = async (savingGoalId: number) => {
  try {
    const response = await api.get(`/savings-goals/${savingGoalId}`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to get saving goal");
    }
  } catch (error) {
    throw new Error(`Error getting saving goal: ${error}`);
  }
};

export const deleteSavingGoalFromUser = async (
  userEmail: string,
  savingGoalId: number,
) => {
  try {
    const response = await api.delete(
      `/savings-goals/${savingGoalId}/user/delete?userEmail=${encodeURIComponent(userEmail)}`,
    );

    if (response.status === 204) {
      return response.data;
    } else {
      throw new Error("Failed to delete saving goal from user");
    }
  } catch (error) {
    throw new Error(`Error deleting saving goal from user: ${error}`);
  }
};

export const deleteSavingGoal = async (savingGoalId: number) => {
  try {
    const response = await api.delete(`/savings-goals/${savingGoalId}`);

    if (response.status === 204) {
      return response.data;
    } else {
      throw new Error("Failed to delete saving goal");
    }
  } catch (error) {
    throw new Error(`Error deleting saving goal: ${error}`);
  }
};

export const updateSavingGoal = async (
  savingGoalId: number,
  data: SavingGoalCreation,
) => {
  try {
    const response = await api.put(`/savings-goals/${savingGoalId}`, data);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to update saving goal");
    }
  } catch (error) {
    throw new Error(`Error updating saving goal: ${error}`);
  }
};

export const getUsersBySavingGoal = async (savingGoalId: number) => {
  try {
    const response = await api.get(`/savings-goals/${savingGoalId}/users`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to get users by saving goal");
    }
  } catch (error) {
    throw new Error(`Error getting users by saving goal: ${error}`);
  }
};

export const userHasActiveSavingGoal = async (userEmail: string) => {
  try {
    const response = await api.get(
      `/savings-goals/user/${encodeURIComponent(userEmail)}/active`,
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed to get active saving goal");
    }
  } catch (error) {
    throw new Error(`Error getting active saving goal: ${error}`);
  }
};

export const getCurrentSavingGoal = async (): Promise<SavingGoal | null> => {
  try {
    const response = await api.get("/savings-goals/current");
    if (response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export const addToSavedAmount = async (
  savingGoalId: number,
  amount: number,
): Promise<number> => {
  try {
    const response = await api.put(
      `/savings-goals/user/saving_goal/${savingGoalId}/update-saved-amount?savedAmount=${amount}`,
    );
    if (response.status === 200) {
      notify();
    }
    return response.status;
  } catch (error) {
    throw error;
  }
};

export const completeCurrentSavingGoal = async (): Promise<number | null> => {
  try {
    const response = await api.patch("/savings-goals/complete");
    return response.status;
  } catch (error) {
    return null;
  }
};
