import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from '../screens/login';
import Register from '../screens/register';
import { AuthContext } from '../App';

function LoginStack() {
    const state = React.useContext(AuthContext);
    if (state?.token) {
        return null;
    }

    const Stack = createNativeStackNavigator();
    return (
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="login"
              component={Login}
              options={{
                headerShown: false
              }}
            ></Stack.Screen>
            <Stack.Screen
              name="register"
              component={Register}
              options={{
                headerShown: false
              }}
            ></Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
    );
  }

  export default LoginStack;