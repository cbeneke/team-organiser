import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// import { postLogin, getUsersMe } from '../mocks/user';
import { postLogin, getUsersMe } from '../helper/api';

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

  return {user: user, token: token}
}

export const initialAuthContext = {
  token: null,
  user: null,
  error: '',
}

export async function getStoredCredentials() {

  // TODO Implement store retrieval for web
  if (Platform.OS === 'web') {
    return {user: null, token: null}
  }

  let token;

  try {
    token = await SecureStore.getItemAsync('userToken');
  } catch (e) {
    // Restoring token failed
    return {user: null, token: null}
  }

  const response = await getUsersMe(token)
  if (response.status == 200) {
    return {user: response.data, token: token}
  } else {
    return {user: null, token: null}
  }
};