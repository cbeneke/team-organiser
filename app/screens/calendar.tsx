import React, {useRef, useCallback} from 'react';
import {StyleSheet} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';

import testIDs from '../testIDs';
import AgendaItem from '../components/agendaItem';
import {agendaItems, getMarkedDates} from '../mocks/calendar';

const leftArrowIcon = require('../assets/previous.png');
const rightArrowIcon = require('../assets/next.png');
const ITEMS: any[] = agendaItems;

interface Props {
  weekView?: boolean;
}

const Calendar = (props: Props) => {
  const {weekView} = props;
  const marked = useRef(getMarkedDates());

  const onMonthChange = useCallback(({dateString}) => {
    console.log('ExpandableCalendarScreen onMonthChange: ', dateString);
  }, []);

  const renderItem = useCallback(({item}: any) => {
    return <AgendaItem item={item}/>;
  }, []);

  return (
    <CalendarProvider
      date={ITEMS[1]?.title}
      onMonthChange={onMonthChange}
    >
      {weekView ? (
        <WeekCalendar
          testID={testIDs.weekCalendar.CONTAINER}
          firstDay={1}
          markedDates={marked.current}
        />
      ) : (
        <ExpandableCalendar
          testID={testIDs.calendar.CONTAINER}
          initialPosition={ExpandableCalendar.positions.OPEN}
          calendarStyle={styles.calendar}
          firstDay={1}
          markedDates={marked.current}
          leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon}
          animateScroll
        />
      )}
      <AgendaList
        sections={ITEMS}
        renderItem={renderItem}
        scrollToNextEvent
        sectionStyle={styles.section}
      />
    </CalendarProvider>
  );
};

export default Calendar;

const styles = StyleSheet.create({
  calendar: {
    paddingLeft: 20,
    paddingRight: 20
  },
  header: {
    backgroundColor: 'lightgrey'
  },
  section: {
    backgroundColor: '#f2f7f7',
    color: 'grey',
    textTransform: 'capitalize'
  }
});