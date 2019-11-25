import React, { Component } from "react";
import { View, Text } from "react-native";
import {
  createAppContainer,
  createStackNavigator,
  createSwitchNavigator
} from "react-navigation";

import Dashboard from "../Components/Dashboard";
import IntroScreen from "../Components/IntroScreen";
import FirstComponent from "../Components/FirstComponent";
import DreamReview from "../Components/DreamReview";
import NewJournal from "../Components/Dashboard/Add/NewJournal";
import SavedFirstEntry from "../Components/Dashboard/Add/SavedFirstEntry";
import EnableNotification from "../Components/Dashboard/Add/EnableNotification";
import LucidPremium from "../Components/LucidPremium";
import PrivacyPolicy from "../Components/PrivacyPolicy";
import TermsConditions from "../Components/TermsConditions";
import SearchScreen from "../Components/SearchScreen";
import AuthLoadingScreen from "../Components/AuthLoadingScreen";

const AppNavigator = createStackNavigator(
  {
    Dashboard: Dashboard,
    // FirstComponent: FirstComponent,
    IntroScreen: IntroScreen,
    DreamReview: DreamReview,
    NewJournal: NewJournal,
    SavedFirstEntry: SavedFirstEntry,
    EnableNotification: EnableNotification,
    LucidPremium: LucidPremium,
    PrivacyPolicy: PrivacyPolicy,
    TermsConditions: TermsConditions,
    SearchScreen: SearchScreen
  },

  {
    initialRouteName: "Dashboard",
    //transitionConfig: () => fromRight(400),
    defaultNavigationOptions: {
      header: null
    }
  }
);

const AuthStack = createStackNavigator({ IntroScreen: IntroScreen });

export default createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: AppNavigator,
      Auth: AuthStack
    },
    {
      initialRouteName: "AuthLoading"
    }
  )
);