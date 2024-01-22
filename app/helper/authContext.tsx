import { Platform } from 'react-native';
import { postLogin, getUsersMe } from '../helper/api';
import * as SecureStore from 'expo-secure-store';
import localstorage from '@react-native-async-storage/async-storage';

export function handleAuthAction(prevState, action) {
    switch (action.type) {
      case 'SIGN_IN':
          return {
            ...prevState,
            token: action.token,
            user: action.user,
          };
      case 'SIGN_OUT':
          return {
            ...prevState,
            token: null,
            user: null,
            error: action.error,
          };
    }
}

export async function handleSignIn(username, password) {
  let user = null;
  let token = null;
  try {
    const loginResponse = await postLogin(username, password)
    token = loginResponse.access_token
  } catch (e) {
    return {user: null, token: null}
  }

  try {
    user = await getUsersMe(token)
  } catch (e) {
    return {user: null, token: null}
  }

  try {
    await storeCredentials(token);
  } catch (e) {
    // Storing failed, but we have a token, so we can continue
  }

  return {user: user, token: token}
}

export const initialAuthContext = {
  token: null,
  user: null,
  error: '',
}


export async function getStoredCredentials() {
  let token;

  try {
    if (Platform.OS === 'web') {
      token = await localstorage.getItem('userToken');
    } else {
      token = await SecureStore.getItemAsync('userToken');
    }
  } catch (e) {
    // Restoring token failed
    return {user: null, token: null}
  }

  const response = await getUsersMe(token)
  if (response) {
    return {user: response, token: token}
  } else {
    await removeStoredCredentials();
    return {user: null, token: null}
  }
};

export async function storeCredentials(token) {
  try {
    if (Platform.OS === 'web') {
      token = await localstorage.setItem('userToken', token);
    } else {
      token = await SecureStore.setItemAsync('userToken', token);
    }
  } catch (e) {
      // Saving token failed
      console.log("Failed to store token securely: " + e)
  }
};

export async function removeStoredCredentials() {
  try {
    if (Platform.OS === 'web') {
      await localstorage.removeItem('userToken');
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
  } catch (e) {
      // Saving token failed
      console.log("Failed to store token securely: " + e)
  }
};