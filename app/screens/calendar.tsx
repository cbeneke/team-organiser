import React, {useState, useMemo, useCallback} from 'react';
import {StyleSheet, Text, View, TextStyle} from 'react-native';
import {CalendarList, DateData} from 'react-native-calendars';
import testIDs from '../testIDs';

const RANGE = 24;
// Get the current date in yyyy-mm-dd format
// https://www.freecodecamp.org/news/javascript-get-current-date-todays-date-in-js/
const today = new Date().toJSON().slice(0, 10);

const Calendar = () => {
  const horizontalView = true;
  const [selected, setSelected] = useState(today);
  const marked = useMemo(() => {
    return {
      [selected]: {
        selected: true,
        disableTouchEvent: true,
        selectedColor: '#5E60CE',
        selectedTextColor: 'white'
      }
    };
  }, [selected]);

  const onDayPress = useCallback((day: DateData) => {
    setSelected(day.dateString);
  }, []);

  return (
    <CalendarList
      testID={testIDs.calendar.CONTAINER}
      current={today}
      pastScrollRange={RANGE}
      futureScrollRange={RANGE}
      onDayPress={onDayPress}
      markedDates={marked}
      renderHeader={!horizontalView ? renderCustomHeader : undefined}
      calendarHeight={!horizontalView ? 390 : undefined}
      theme={!horizontalView ? theme : undefined}
      horizontal={horizontalView}
      pagingEnabled={horizontalView}
      staticHeader={horizontalView}
    />
  );
};

const theme = {
  stylesheet: {
    calendar: {
      header: {
        dayHeader: {
          fontWeight: '600',
          color: '#48BFE3'
        }
      }
    }
  },
  'stylesheet.day.basic': {
    todayText: {
      color: '#5390D9',
      fontWeight: '800'
    }
  }
};

function renderCustomHeader(date: any) {
  const header = date.toString('MMMM yyyy');
  const [month, year] = header.split(' ');
  const textStyle: TextStyle = {
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 10,
    paddingBottom: 10,
    color: '#5E60CE',
    paddingRight: 5
  };

  return (
    <View style={styles.header}>
      <Text style={[styles.month, textStyle]}>{`${month}`}</Text>
      <Text style={[styles.year, textStyle]}>{year}</Text>
    </View>
  );
}

export default Calendar;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10
  },
  month: {
    marginLeft: 5
  },
  year: {
    marginRight: 5
  }
});