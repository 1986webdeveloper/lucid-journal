/**
 * @format
 */

import { AppRegistry } from 'react-native';
import React from 'react';
import App from './App';
import { name as appName } from './app.json';
import { Provider } from 'react-redux';

import configureStore from './store';

import { Client } from 'bugsnag-react-native';
const bugsnag = new Client("c42e75b5a3ed23afa7dde5c03b6f7403");
// bugsnag.notify(new Error("Test error"));

const store = configureStore()

console.disableYellowBox = true;

const RNRedux = () => (
    <Provider store = { store }>
      <App />
    </Provider>
  )

AppRegistry.registerComponent(appName, () => RNRedux);
