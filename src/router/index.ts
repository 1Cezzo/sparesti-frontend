import { createRouter, createWebHistory } from "vue-router";
import AuthenticationView from "@/views/AuthenticationView.vue";
import LoginForm from "@/components/forms/LoginForm.vue";
import SignUpForm from "@/components/forms/SignUpForm.vue";
import CompleteAccountForm from "@/components/forms/CompleteAccountForm.vue";
import ChallengesView from "../views/ChallengesView.vue";
import LoadingView from "@/views/LoadingView.vue";
import BudgetPageView from "@/views/BudgetPageView.vue";
import BudgetDetails from "@/components/budget/BudgetDetails.vue";
import ProfileView from "@/views/ProfileView.vue";
import SettingsView from "@/views/SettingsView.vue";
import BadgesView from "@/views/BadgesView.vue";
import FrontPageView from "@/views/FrontPageView.vue";
import QuestionnaireView from "@/views/QuestionnaireView.vue";
import BadgeDetailsView from "@/views/BadgeDetailsView.vue";
import SavingGoalView from "@/views/SavingGoalView.vue";
import SavingGoalDetails from "@/components/savinggoal/SavingGoalDetails.vue";
import SavingGoalCardDetails from "@/components/savinggoal/SavingGoalCardDetails.vue";
import ContactView from "@/components/contact/Contact.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "frontpage",
      component: FrontPageView,
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfileView,
    },
    {
      path: "/settings",
      name: "settings",
      component: SettingsView,
    },
    {
      path: "/setup",
      name: "setup",
      component: QuestionnaireView,
    },
    {
      path: "/budgetpage",
      name: "budget",
      component: BudgetPageView,
    },
    {
      path: "/details/:id",
      name: "BudgetDetails",
      component: BudgetDetails,
    },
    {
      path: "/badge/:id",
      name: "BadgeDetails",
      component: BadgeDetailsView,
      props: true,
    },
    {
      path: "/saving-goal/create",
      name: "saving-goal-create",
      component: SavingGoalView,
    },
    {
      path: "/saving-goals",
      name: "savingGoalDetails",
      component: SavingGoalDetails,
      props: true,
    },
    {
      path: "/saving-goal/details/:saving_goal_id",
      name: "savingGoalCardDetails",
      component: SavingGoalCardDetails,
      props: true,
    },
    {
      path: "/badges",
      name: "badges",
      component: BadgesView,
    },
    {
      path: "/badge/:id",
      name: "BadgeDetails",
      component: BadgeDetailsView,
      props: true,
    },
    {
      path: "/challenges",
      name: "challenges",
      component: ChallengesView,
    },
    {
      path: "/authentication",
      name: "authentication",
      component: AuthenticationView,
      children: [
        {
          path: "",
          name: "login",
          component: LoginForm,
        },
        {
          path: "signup",
          name: "signup",
          component: SignUpForm,
        },
        {
          path: "complete-account",
          name: "complete-account",
          component: CompleteAccountForm,
        },
      ],
    },
    {
      path: "/contact",
      name: "contact",
      component: ContactView,
    },
    {
      path: "/token",
      name: "token",
      component: LoadingView,
    },
  ],
});

export default router;
