import * as React from 'react';

import LoginStack from './components/loginStack';
import AppStack from './components/appStack';
import { handleAuthAction, initialAuthContext, getStoredCredentials, removeStoredCredentials } from './helper/authContext';

export const AuthContext = React.createContext(undefined);
export const AuthDispatchContext = React.createContext(undefined);

function App() {
  const [state, dispatch] = React.useReducer(handleAuthAction, initialAuthContext)
  
  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let {user, token} = await getStoredCredentials();
      
      if (user && token) {
        dispatch({ type: 'SIGN_IN', token: token, user: user });
      } else {
        dispatch({ type: 'SIGN_OUT' });
      }
    };

    bootstrapAsync();
  }, []);

  return (
    <AuthContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        <LoginStack></LoginStack>
        <AppStack></AppStack>
      </AuthDispatchContext.Provider>
    </AuthContext.Provider>
  )
}

export default App;