import React, {useRef, useCallback, useState, useEffect} from 'react';
import {StyleSheet} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';

import testIDs from '../testIDs';
import AgendaItem from '../components/agendaItem';
import {getTheme, lightThemeColor, themeColor} from '../components/theme';
import {mockEvents} from '../mocks/calendar';

const leftArrowIcon = require('../assets/previous.png');
const rightArrowIcon = require('../assets/next.png');

interface Props {
  weekView?: boolean;
}

interface User {
    id: string;
    username: string;
    firstname: string;
}

interface EventResponse {
    user: User;
    status: string;
}

interface Event {
    startTime: string;
    endTime: string;
    title: string;
    description: string;
    responses: EventResponse[];
}

interface AgendaEvent {
    hour: string;
    duration: string;
    title: string;
}

interface AgendaSection {
    title: string;
    data: AgendaEvent[];
}

function extractDate(date?: string) {
  if (!date) {
    date = new Date().toISOString();
  }
  return date.split('T')[0];
}

function extractHour(date: string) {
  return parseInt(date.split('T')[1].split(':')[0]);
}

function getAgendaItems(events: Event[]) {
  let items: AgendaSection[] = [];
  if (!events || events.length == 0) {
    return items;
  }

  events.forEach(event => {
    // TODO: Make this more flexible (e.g. minutes in the events)
    const dateString = extractDate(event.startTime);
    const startHour = extractHour(event.startTime);
    const duration = extractHour(event.endTime) - startHour;

    const eventData = {
      hour: startHour + ":00",
      duration: duration + "h",
      title: event.title,
    }

    const index = items.findIndex(item => item.title == dateString);
    if (items[index] == null) {
        items.push({
            title: dateString,
            data: [eventData]
        });
    } else {
        items[index].data.push(eventData);
    };
  });
  return items;
}

function getEventDates(items: AgendaSection[]) {
  let marked = {}
  // Set markers for each day that has an event
  items.forEach(item => {
    if (item.data && item.data.length > 0) {
      marked[item.title] = {marked: true};
    }
  });

  // Initially mark today as selected day
  markSelectedDay(marked, extractDate());
  return marked;
}

function markSelectedDay(marked: object, day: string) {
  if (marked[day]) {
    marked[day] = {marked: true, selected: true};
  } else {
    marked[day] = {selected: true};
  }
}

function unmarkSelectedDay(marked: object, day: string) {
  if (marked[day].marked) {
    marked[day] = {marked: true};
  } else {
    delete marked[day];
  }
}

const Calendar = (props: Props) => {
  const {weekView} = props;
  const events = useRef(getAgendaItems(mockEvents));
  const markedDays = useRef(getEventDates(events.current));
  const previousDay = useRef(extractDate());
  const theme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor
  });

  // const onMonthChange = useCallback(({dateString}) => {
  // }, []);

  const onDateChanged = useCallback((dateString: string) => {
    unmarkSelectedDay(markedDays.current, previousDay.current);
    markSelectedDay(markedDays.current, dateString);
    previousDay.current = dateString;

  }, [markedDays]);

  const renderItem = useCallback(({item}: any) => {
    return <AgendaItem item={item}/>;
  }, []);

  return (
    <CalendarProvider
      date={extractDate()}
      theme={todayBtnTheme.current}
      // onMonthChange={onMonthChange}
      onDateChanged={onDateChanged}
    >
      {weekView ? (
        <WeekCalendar
          testID={testIDs.weekCalendar.CONTAINER}
          firstDay={1}
          markedDates={markedDays.current}
        />
      ) : (
        <ExpandableCalendar
          testID={testIDs.calendar.CONTAINER}
          initialPosition={ExpandableCalendar.positions.OPEN}
          calendarStyle={styles.calendar}
          theme={theme.current}
          firstDay={1}
          markedDates={markedDays.current}
          leftArrowImageSource={leftArrowIcon}
          rightArrowImageSource={rightArrowIcon}
          animateScroll
        />
      )}
      <AgendaList
        sections={events.current}
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
    backgroundColor: lightThemeColor,
    color: 'grey',
    textTransform: 'capitalize'
  }
});