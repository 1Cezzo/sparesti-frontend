import { api } from "@/api/axiosConfig";
import { type Badge } from "@/types/Badge";
import type { UserBadgeResponse } from "@/types/UserBadgeResponse";

export const getAllBadges = async (): Promise<Badge[] | null> => {
  try {
    const response = await api.get(`/badges`);
    console.log(response.data);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Failed to fetch badges:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching badges:", error);
    return null;
  }
};

export const getBadgeById = async (badgeId: number): Promise<Badge | null> => {
  try {
    const response = await api.get(`/badges/${badgeId}`);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Failed to fetch badge:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching badge:", error);
    return null;
  }
};

export const getBadgeRarity = async (
  badgeId: number,
): Promise<string | null> => {
  try {
    const response = await api.get(`/badges/rarity/${badgeId}`);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Failed to fetch badge rarity:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching badge rarity:", error);
    return null;
  }
};

export const getAllUsersWithGivenBadge = async (
  badgeId: number,
): Promise<UserBadgeResponse[] | null> => {
  try {
    const response = await api.get(`/badges/badge/${badgeId}/users`);

    if (response.status === 200) {
      return response.data.map((userBadge: UserBadgeResponse) => ({
        dateEarned: userBadge.dateEarned,
        user: {
          id: userBadge.user.id,
          email: userBadge.user.email,
          profilePictureUrl: userBadge.user.profilePictureUrl,
        },
      }));
    } else {
      console.error("Failed to fetch users with badge:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching users with badge:", error);
    return null;
  }
};

export const getBadgesByUser = async (): Promise<Badge[] | null> => {
  try {
    const response = await api.get(`/badges/user`);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Failed to fetch badges:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching badges:", error);
    return null;
  }
};

export const checkAndAwardBadge = async (): Promise<Badge | null> => {
  try {
    const response = await api.post(`/badges/check-and-award`);
    const data = response.data;
    console.log("Badges awarded:", data);
    return data;
  } catch (error) {
    console.error("Error checking and awarding badges:", error);
  }
  return null;
};

export const giveUserBadge = async (
  badgeId: number,
  userId: number,
): Promise<Badge | null> => {
  try {
    const response = await api.post(`/badges/${userId}/give/${badgeId}`);

    if (response.status === 200) {
      return response.data;
    } else {
      console.error("Failed to give badge:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error giving badge:", error);
    return null;
  }
};
