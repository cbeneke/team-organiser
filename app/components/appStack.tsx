
const Tab = createBottomTabNavigator();
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// @ts-ignore
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthContext } from '../App';
import Calendar from '../screens/calendar';
import Profile from '../screens/profile';
import getStrings from '../locales/translation';


function AppStack() {
  const state = React.useContext(AuthContext);
  if (!state?.token) {
    return null;
  }

  const strings = getStrings(state.user?.language ? state.user.language : 'de');

  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen
            name="calendar"
            component={Calendar}
            options={{
              headerShown: false,
              tabBarLabel: strings.CALENDAR,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="calendar" color={color} size={size} />
              ),
            }}
            />
          <Tab.Screen
            name="profile"
            component={Profile}
            options={{
              headerShown: false,
              tabBarLabel: strings.PROFILE,
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons name="account" color={color} size={size} />
              ),
            }}
            />
        </Tab.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  )
}

export default AppStack;