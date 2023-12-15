import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Calendar from './screens/calendar';
import Profile from './screens/profile';
import getStrings from './locales/translation';
import { getMeUser } from './mocks/user';

const user = getMeUser()
const strings = getStrings(user.language);

const Tab = createBottomTabNavigator();

function App() {
  return (    
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
  );
}

export default App;