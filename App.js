import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'react-native';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeServices } from './src/services/initService';

const App = () => {
  useEffect(() => {
    initializeServices();
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <AppNavigator />
      </PaperProvider>
    </Provider>
  );
};

export default App;
