import React, { useRef, useCallback, useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Modal } from 'react-native';
import { ExpandableCalendar, AgendaList, CalendarProvider, WeekCalendar } from 'react-native-calendars';
import { useQuery } from '@tanstack/react-query';

import testIDs from '../testIDs';
import AgendaItem from '../components/agendaItem';
import { getTheme, lightThemeColor, themeColor } from '../helper/theme';
import { getEvents } from '../helper/api';
import { Event, AgendaSection } from '../types';
import EventModal from '../components/eventModal';
import { AuthContext } from '../App';

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
    const dateString = extractDate(event.start_time);
    const startHour = extractHour(event.start_time);
    // TODO: This does not work if the event spans multiple days
    const duration = extractHour(event.end_time) - startHour;

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

function getEventMarkers(items: AgendaSection[]) {
  let marked = {}
  // Set markers for each day that has an event
  items.forEach(item => {
    if (item.data && item.data.length > 0) {
      marked[item.title] = {marked: true};
    }
  });

  return marked;
}

const Calendar = (props: Props) => {
  //const queryClient = useQueryClient()
  const state = React.useContext(AuthContext);

  async function fetchEvents() {
    const events = await getEvents(state.token);
    const agendaItems = getAgendaItems(events);
    const markedDays = getEventMarkers(agendaItems);
  
    return {events, agendaItems, markedDays};
  }

  const {weekView} = props;
  const query = useQuery({queryKey: ['events'], queryFn: fetchEvents});
  const [markedDays, setMarkedDays] = useState(null);
  const [currentDay, setCurrentDay] = useState(extractDate());
  useEffect(() => {
    let days = {};
    if (query.data?.markedDays) {
      days = {...query.data.markedDays}
    }
    days[currentDay] = {...days[currentDay], selected: true};
    setMarkedDays(days);
  }, [query.data, currentDay]); // Update markedDays if either event data or current day changes

  const theme = useRef(getTheme());
  const todayBtnTheme = useRef({
    todayButtonTextColor: themeColor
  });

  const [modalVisible, setModalVisible] = useState(false);
  const modalProps = useRef({
    setVisible: setModalVisible,
    eventUUID: undefined,
  })

  const renderItem = useCallback(({item}: any) => {
    function openEventModal(id: string) {
      return () => {
        modalProps.current.eventUUID = id;
        setModalVisible(true);
      }
    }
    return <AgendaItem item={item} onPress={openEventModal(item.id)}/>;
  }, []);

  return (
    <ScrollView>
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
        onDateChanged={setCurrentDay}
      >
        {weekView ? (
          <WeekCalendar
            testID={testIDs.weekCalendar.CONTAINER}
            firstDay={1}
            markedDates={markedDays}
          />
        ) : (
          <ExpandableCalendar
            testID={testIDs.calendar.CONTAINER}
            initialPosition={ExpandableCalendar.positions.OPEN}
            calendarStyle={styles.calendar}
            theme={theme.current}
            firstDay={1}
            markedDates={markedDays}
            leftArrowImageSource={leftArrowIcon}
            rightArrowImageSource={rightArrowIcon}
            animateScroll
          />
        )}
        <AgendaList
          sections={query.data?.agendaItems ? query.data.agendaItems : []}
          renderItem={renderItem}
          scrollToNextEvent
          sectionStyle={styles.section}
          avoidDateUpdates
        />
      </CalendarProvider>
    </ScrollView>
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