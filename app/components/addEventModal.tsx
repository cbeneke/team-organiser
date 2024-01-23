import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import { themeColor, lightThemeColor } from '../helper/theme';
import { NewEvent } from '../types';
import getStrings from '../locales/translation';
import { AuthContext } from '../App';
import { postEvent, getUsers } from '../helper/api';
import { TextOption, TimeOption } from './editEventOptions';

interface AddEventModalProps {
    setVisible: (visible: boolean) => void;
}

function initDate(offsetHours: number) {
    let date = new Date(Date.now())
    date.setMilliseconds(0)
    date.setSeconds(0)
    date.setMinutes(0)
    date.setHours(date.getHours() + offsetHours + 2) // TODO: Make this timezone aware
    return date.toISOString()
}

const AddEventModal = (props: AddEventModalProps) => {
    const {setVisible} = props;
    const auth = React.useContext(AuthContext);
    const queryClient = useQueryClient()

    async function fetchUsers() {
        // TODO Remove hardcoded filter as soon as team assignment is implemented
        // const users = await getUsers(auth.token);        
        let users = await getUsers(auth.token);
        users = users.filter((user) => user.username != 'admin')

        return {users}
    }
    const query = useQuery({queryKey: ['users'], queryFn: fetchUsers});

    const newEventProps = {
        title: "",  
        description: "",
        start_time: initDate(0), // Initialise StartDate with upcoming hour
        end_time: initDate(2), // Initialise EndDate with upcoming hour + 2
        invitees: query.data?.users ? query.data.users : [],
        display_color: "",
    }

    const strings = getStrings(auth.user?.language ? auth.user.language : 'de');
    const [error, setError] = useState('');

    const closeModal = () => {
        // Reset View on closing the modal
        setNewEvent(newEventProps);
        setVisible(false);
    };

    async function saveEvent(token: string, event: NewEvent) {
        postEvent(token, event).then((response) => {
            // An event ID is only generated for successful event creations
            if (response && response.id) {
                queryClient.invalidateQueries({ queryKey: ['events'] })
                closeModal();
            } else {
                setError(strings.ERRORS.EVENT_SAVE)
            }
        }).catch((error) => {
            setError(strings.ERRORS.EVENT_SAVE)
        });
    }

    const [newEvent, setNewEvent] = useState<NewEvent>(newEventProps);

    useEffect(() => {
        if (query.data) {
            setNewEvent({...newEvent, invitees: query.data.users})
        }
    }, [query.data])

    return (
        <View style={styles.modalView}>
            <View style={styles.headerView}>
                <Text style={styles.header}>{strings.ADD_EVENT}</Text>
                <Pressable style={styles.closeButton} onPress={closeModal}>
                    <FontAwesomeIcon icon={faXmark} />
                </Pressable>
            </View>
            <View style={styles.contentView}>
                <TextOption
                    title={strings.TITLE}
                    value={newEvent.title}
                    callback={(title) => setNewEvent({...newEvent, title: title})} />
                <TextOption
                    title={strings.DESCRIPTION}
                    value={newEvent.description}
                    callback={(description) => setNewEvent({...newEvent, description: description})} />
                <TimeOption
                    title={strings.START_TIME}
                    value={newEvent.start_time}
                    callback={(start_time) => setNewEvent({...newEvent, start_time: start_time})} />
                <TimeOption
                    title={strings.END_TIME}
                    value={newEvent.end_time}
                    callback={(end_time) => setNewEvent({...newEvent, end_time: end_time})} />
            </View>
            <Text style={styles.error}>{error}</Text>
            <View style={styles.footerView}>
                <Pressable style={styles.button} onPress={async () => await saveEvent(auth.token, newEvent)}>
                    <Text style={styles.buttonText}>{strings.SAVE}</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default AddEventModal;

// Re-used in editEventModal.tsx
export const styles = StyleSheet.create({
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        elevation: 5,
    },
    headerView: {
        backgroundColor: lightThemeColor,
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: "row",
    },
    header: {
        flexGrow: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: "center",
    },
    closeButton: {
        textAlign: "center",
        paddingLeft: 20,
        paddingRight: 20,
    },
    contentView: {
        margin: 20,
    },
    optionView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 1,
    },
    inputTitle: {
        width: 100,
        color: 'grey',
        textTransform: 'capitalize',
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        flexGrow: 1,
    },
    footerView: {
        backgroundColor: lightThemeColor,
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    button: {
        margin: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: themeColor,
        width: 150,
    },
    buttonText: {
        textAlign: 'center',
        color: 'white',
    },
    error: {
        textAlign: 'center',
        color: 'red',
        marginBottom: 10,
    },
    userSelectionBox: {
        flexGrow: 1,
    }
});