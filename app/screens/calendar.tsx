import React, {useRef, useCallback, useState} from 'react';
import {StyleSheet, View, Modal} from 'react-native';
import {ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar} from 'react-native-calendars';

import testIDs from '../testIDs';
import AgendaItem from '../components/agendaItem';
import {getTheme, lightThemeColor, themeColor} from '../components/theme';
import {getEvents, getEvent} from '../mocks/calendar';
import {Event, AgendaSection} from '../types';
import EventModal from '../components/eventModal';

const leftArrowIcon = require('../assets/previous.png');
const rightArrowIcon = require('../assets/next.png');

interface Props {
  weekView?: boolean;
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
    // TODO: This does not work if the event spans multiple days
    const duration = extractHour(event.endTime) - startHour;

    const eventData = {
      id: event.id,
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
  const events = useRef(getEvents());
  const agenda = useRef(getAgendaItems(events.current));
  const markedDays = useRef(getEventDates(agenda.current));
  const previousDay = useRef(extractDate());
  const theme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor
  });

  const onDateChanged = useCallback((dateString: string) => {
    unmarkSelectedDay(markedDays.current, previousDay.current);
    markSelectedDay(markedDays.current, dateString);
    previousDay.current = dateString;

  }, [markedDays]);

  const [modalVisible, setModalVisible] = useState(false);
  const modalProps = useRef({
    setVisible: setModalVisible,
    event: undefined,
  })

  const renderItem = useCallback(({item}: any) => {
    function openEventModal(id: string) {
      return () => {
        modalProps.current.event = getEvent(id);
        setModalVisible(true);
      }
    }
    return <AgendaItem item={item} onPress={openEventModal(item.id)}/>;
  }, []);

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
        >
        {EventModal(modalProps.current)}
      </Modal>
      <CalendarProvider
        date={extractDate()}
        theme={todayBtnTheme.current}
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
          sections={agenda.current}
          renderItem={renderItem}
          scrollToNextEvent
          sectionStyle={styles.section}
          avoidDateUpdates
        />
      </CalendarProvider>
    </View>
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