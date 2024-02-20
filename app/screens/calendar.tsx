import React, { useRef, useCallback, useState, useEffect } from 'react';
import { StyleSheet, Modal, Pressable, Text, View, TouchableWithoutFeedback } from 'react-native';
import { ExpandableCalendar, AgendaList, CalendarProvider, CalendarList } from 'react-native-calendars';
import { useQuery } from '@tanstack/react-query';

import testIDs from '../testIDs';
import AgendaItem from '../components/agendaItem';
import { getTheme, lightThemeColor, themeColor } from '../helper/theme';
import { getEvents } from '../helper/api';
import { Event, AgendaSection } from '../types';
import EventModal from '../components/eventModal';
import AddEventModal from '../components/addEventModal';
import EditEventModal from '../components/editEventModal';
import { AuthContext } from '../App';

const leftArrowIcon = require('../assets/previous.png');
const rightArrowIcon = require('../assets/next.png');

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

interface EventHandlerModalProps {
  modal: any;
  isVisible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const EventHandlerModal = (props: EventHandlerModalProps) => {
  const {modal, isVisible, setVisible} = props;

  return (
    <TouchableWithoutFeedback onPress={() => {
      setVisible(false);
    }}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={() => {
          setVisible(false);
        }}
      >
        {/* Overload the close Modal function to prevent closing the modal when clicking on objects within the modal */}
        <TouchableWithoutFeedback onPress={() => {}}>
          <View>
            {modal}
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </TouchableWithoutFeedback>
  )
}

const EventsCalendar = () => {
  //const queryClient = useQueryClient()
  const auth = React.useContext(AuthContext);

  async function fetchEvents() {
    const events = await getEvents(auth.token);
    const agendaItems = getAgendaItems(events);
    const markedDays = getEventMarkers(agendaItems);
  
    return {events, agendaItems, markedDays};
  }

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

  const [editEventModalVisible, setEditEventModalVisible] = useState(false);
  const editEventModalProps = useRef({
    setVisible: setEditEventModalVisible,
    eventUUID: undefined,
  })
  
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const eventModalProps = useRef({
    setVisible: setEventModalVisible,
    eventUUID: undefined,
    setEditVisible: setEditEventModalVisible,
  })

  const [addEventModalVisible, setAddEventModalVisible] = useState(false);
  const addEventModalProps = useRef({
    setVisible: setAddEventModalVisible,
    selectedDate: currentDay,
  })

  const renderItem = useCallback(({item}: any) => {
    function openEventModal(id: string) {
      return () => {
        eventModalProps.current.eventUUID = id;
        editEventModalProps.current.eventUUID = id;
        setEventModalVisible(true);
      }
    }
    return <AgendaItem item={item} onPress={openEventModal(item.id)}/>;
  }, []);

  return (
    <View style={styles.mainContainer}>
      <EventHandlerModal
        modal={EventModal(eventModalProps.current)}
        isVisible={eventModalVisible}
        setVisible={setEventModalVisible}/>
      <EventHandlerModal
        modal={AddEventModal(addEventModalProps.current)}
        isVisible={addEventModalVisible}
        setVisible={setAddEventModalVisible}/>
      <EventHandlerModal
        modal={EditEventModal(editEventModalProps.current)}
        isVisible={editEventModalVisible}
        setVisible={setEditEventModalVisible}/>
      <CalendarProvider
        date={extractDate()}
        theme={todayBtnTheme.current}
        onDateChanged={(date) => {setCurrentDay(date); addEventModalProps.current.selectedDate = date;}}
      >
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
        <AgendaList
          sections={query.data?.agendaItems ? query.data.agendaItems : []}
          renderItem={renderItem}
          scrollToNextEvent
          sectionStyle={styles.section}
          avoidDateUpdates
        />
      </CalendarProvider>
      <Pressable
        style={styles.addEventButton}
        onPress={() => setAddEventModalVisible(true)}
      ><Text style={styles.addEventText}>+</Text></Pressable>
  </View>
  );
};

export default EventsCalendar;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  calendar: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  header: {
    backgroundColor: 'lightgrey'
  },
  section: {
    backgroundColor: lightThemeColor,
    color: 'grey',
    textTransform: 'capitalize'
  },
  addEventButton: {
    position: 'absolute',
    bottom: 15,
    right: 25,
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: themeColor,
    textAlign: 'center',
    zIndex: 1,
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.5,
  },
  addEventText: {
    fontSize: 35,
    color: 'white',
    textAlign: 'center',
  }
});