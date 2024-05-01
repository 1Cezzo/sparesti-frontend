import { api } from "@/api/axiosConfig";
import { type ChallengesResponse, type MasterChallenge, type ChallengeCreation } from "@/types/challengeTypes";

export const getSortedChallengesByUser = async (): Promise<ChallengesResponse | null> => {
  try {
    const response = await api.get(`/challenges/users/challenges`);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Failed to fetch challenges:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return null;
  }
};

export const getUserChallenges = async (): Promise<MasterChallenge[] | null> => {
  try {
    const response = await api.get(`/challenges/users/challenges`);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error('Failed to fetch challenges:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return null;
  }
}

export const createSavingChallenge = async (data: ChallengeCreation): Promise<ChallengeCreation> => {
  try {
    const response = await api.post(`/saving-challenges/saving`, data);

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Failed to create saving challenge");
    }
  } catch (error) {
    throw new Error(`Error creating saving challenge: ${error}`);
  }
}

export const createPurchaseChallenge = async (data: ChallengeCreation): Promise<ChallengeCreation> => {
  try {
    const response = await api.post(`/purchase-challenges/purchase`, data);

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Failed to create purchase challenge");
    }
  } catch (error) {
    throw new Error(`Error creating purchase challenge: ${error}`);
  }
}

export const createConsumptionChallenge = async (data: ChallengeCreation): Promise<ChallengeCreation> => {
  try {
    const response = await api.post(`/consumption-challenges/consumption`, data);

    if (response.status === 201) {
      return response.data;
    } else {
      throw new Error("Failed to create consumption challenge");
    }
  } catch (error) {
    throw new Error(`Error creating consumption challenge: ${error}`);
  }
}

