import * as SecureStore from 'expo-secure-store';

import { postLogin, getUsersMe } from '../mocks/user';

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
  const loginResponse = await postLogin(username, password)

  if (loginResponse.status === 200) {
    token = loginResponse.data.accessToken;
  }
  if (token == null) {
    return {user: null, token: null}
  }

  const userResponse = await getUsersMe()
  if (userResponse.status === 200) {
    user = userResponse.data
  }

  return {user: user, token: token}
}

export const initialAuthContext = {
  token: null,
  user: null,
  error: '',
}

export async function getStoredCredentials() {

  // TODO Implement store retrieval for web and mobile
  return {user: null, token: null}

  let token;

  try {
    token = await SecureStore.getItemAsync('userToken');
  } catch (e) {
    // Restoring token failed
    return {user: null, token: null}
  }

  const response = await getUsersMe()
  if (response.status == 200) {
    return {user: response.data, token: token}
  } else {
    return {user: null, token: null}
  }
};