import React, {useState} from 'react';
import {Platform, StyleSheet, View, ScrollView, TouchableOpacity, Text, Image, I18nManager, Switch} from 'react-native';
import {Navigation} from 'react-native-navigation';
import testIDs from '../testIDs';

const appIcon = require('../assets/icon.png');

interface Props {
  componentId: string;
  weekView?: boolean;
  horizontalView?: boolean;
}

const Menu = (props: Props) => {
  const {componentId} = props;
  const [forceRTL, setForceRTL] = useState(false);
  
  const toggleRTL = (value) => {
    I18nManager.forceRTL(value);
    setForceRTL(value);
  };

  const renderEntry = (testID: string, title: string, screen: string, options?: any) => {
    return (
      <TouchableOpacity
        testID={testID}
        style={styles.menu}
        onPress={() => openScreen(screen, options)}
      >
        <Text style={styles.menuText}>{title}</Text>
      </TouchableOpacity>
    );
  };

  const pushScreen = (screen: string, props?: Props) => {
    Navigation.push(componentId, {
      component: {
        name: screen,
        passProps: props,
        options: {
          topBar: {
            title: {
              text: props?.weekView ? 'WeekCalendar' : screen
            },
            backButton: {
              testID: 'back',
              showTitle: false, // iOS only
              color: Platform.OS === 'ios' ? '#2d4150' : undefined
            }
          }
        }
      }
    });
  };

  const openScreen = (screen: string, options: any) => {
    pushScreen(screen, options);
  };

  return (
    <ScrollView>
      <View style={styles.container} testID={testIDs.menu.CONTAINER}>
        <Image source={appIcon} style={styles.image}/>
        {renderEntry(testIDs.menu.CALENDAR, 'Calendar', 'Calendar')}
        <View style={styles.switchContainer}>
          <Text>Force RTL</Text>
          <Switch value={forceRTL} onValueChange={toggleRTL}/>
        </View>
      </View>
    </ScrollView>
  );
};

export default Menu;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  image: {
    margin: 30,
    width: 90,
    height: 90
  },
  menu: {
    width: 300,
    padding: 10,
    margin: 10,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7a92a5'
  },
  menuText: {
    fontSize: 18,
    color: '#2d4150'
  },
  switchContainer: {
    margin: 20
  }
});