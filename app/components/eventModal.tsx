import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircleXmark, faTrashCan, faQuestionCircle, faCheckCircle } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { successThemeColor, failureThemeColor, lightThemeColor, themeColor } from '../helper/theme';
import { Event } from '../types';
import getStrings from '../locales/translation';
import { AuthContext } from '../App';
import { getEvent, putEventResponse, deleteEvent } from '../helper/api';


interface EventModalProps {
    eventUUID?: string;
    setVisible: (visible: boolean) => void;
}

function humanReadableDate(date: string) {
    const dateObj = new Date(date);
    const timeString = dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const dateString = dateObj.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return timeString + ' (' + dateString + ')';
}

const EventModal = (props: EventModalProps) => {
    const {eventUUID, setVisible} = props;
    const auth = React.useContext(AuthContext);
    const [error, setError] = useState('');

    const queryClient = useQueryClient()
    async function fetchEvent() {
        try {
            const res = await getEvent(auth.token, eventUUID)
            return res
        } catch (error) {
            console.error(error)
        }
    }

    async function updateEvent(event: Event) {
        await putEventResponse(auth.token, event.id, currentResponse)
    }

    async function removeEvent(event: Event) {
        if (window.confirm(strings.CONFIRM_DELETE_EVENT)) {
            deleteEvent(auth.token, event).then((response) => {
                queryClient.invalidateQueries({ queryKey: ['events'] })
                closeModal();
            }).catch((error) => {
                setError(strings.ERRORS.EVENT_DELETE)
            });
        }
    }

    const query = useQuery({ queryKey: ['events', eventUUID], queryFn: fetchEvent, enabled: !!eventUUID })
    useEffect(() => {
        if (query.data?.responses) {
            const idx = query.data.responses.findIndex(response => response.user.id == auth.user.id)
            setCurrentResponse(query.data.responses[idx].status)
        }
    }, [query.data?.responses])

    const mutation = useMutation({
        mutationFn: updateEvent,
        onSuccess: () => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ['events', eventUUID] })
        },
    })

    const strings = getStrings(auth.user?.language ? auth.user.language : 'de');

    const [currentResponse, setCurrentResponse] = useState('pending');

    const closeModal = () => {
        setVisible(false);
    };

    const updateResponse = (status: string) => {
        setCurrentResponse(status);
        query.data.responses = query.data.responses.map(response => {
            if (response.user.id == auth.user.id) {
                return {...response, status: status}
            }
            return response
        })
        mutation.mutate(query.data) // TODO Figure out if this is the right way to do this
    }

    const Responses = () => {
        if (query.isLoading || query.isError || !query.data || !query.data.responses) {
            return null;
        }

        return (
            <View style={styles.responsesList}>
                <Text>{query.data.responses.length} {strings.PARTICIPANTS}</Text>
                <View style={styles.responsesView}>
                {query.data?.responses.map((response, index) => {
                    return (
                        <View key={index} style={styles.response}>
                            {response.status == 'accepted' && <FontAwesomeIcon icon={faCheckCircle} color={successThemeColor} />}
                            {response.status == 'pending' && <FontAwesomeIcon icon={faQuestionCircle} />}
                            {response.status == 'declined' && <FontAwesomeIcon icon={faCircleXmark} color={failureThemeColor} />}
                            <Text style={styles.responseText}>{response.user.display_name}</Text>
                        </View>
                    );
                })}
                </View>
            </View>
        );
    };

    if (query.isLoading || query.isError || !query.data) {
        return null;
    }

    return (
        <View style={styles.modalView}>
            <View style={styles.headerView}>
                <Text style={styles.header}>{query.data.title}</Text>
                <View style={styles.buttonGroup}>
                    <Pressable style={styles.headerButton} onPress={async () => {await removeEvent(query.data)}}>
                        <FontAwesomeIcon icon={faTrashCan} />
                    </Pressable>
                    <Pressable style={styles.headerButton} onPress={closeModal}>
                        <FontAwesomeIcon icon={faXmark} />
                    </Pressable>
                </View>
            </View>
            <View style={styles.contentsView}>
                <View style={styles.contentView}>
                    <Text style={styles.contentHeader}>{strings.DESCRIPTION}:</Text><Text style={styles.content}>{query.data.description}</Text>
                </View>
                <View style={styles.contentView}>
                    <Text style={styles.contentHeader}>{strings.START_TIME}:</Text><Text style={styles.content}>{humanReadableDate(query.data.start_time)}</Text>
                </View>
                <View style={styles.contentView}>
                    <Text style={styles.contentHeader}>{strings.END_TIME}:</Text><Text style={styles.content}>{humanReadableDate(query.data.end_time)}</Text>
                </View>
            </View>
            <Responses></Responses>
            <Text style={styles.error}>{error}</Text>
            <View style={styles.footerView}>
                <Pressable
                    style={currentResponse == 'accepted' ? styles.currentResponseButton : styles.responseButton}
                    onPress={() => {updateResponse('accepted')}}
                >
                    <Text style={currentResponse == 'accepted' ? styles.currentResponseButtonText : styles.respondingButtonText}>{strings.RESPONSES.ACCEPT}</Text>
                </Pressable>
                <Pressable
                    style={currentResponse == 'pending' ? styles.currentResponseButton : styles.responseButton}
                    onPress={() => {updateResponse('pending')}}
                >
                    <Text style={currentResponse == 'pending' ? styles.currentResponseButtonText : styles.respondingButtonText}>{strings.RESPONSES.MAYBE}</Text>
                </Pressable>
                <Pressable
                    style={currentResponse == 'declined' ? styles.currentResponseButton : styles.responseButton}
                    onPress={() => {updateResponse('declined')}}
                >
                    <Text style={currentResponse == 'declined' ? styles.currentResponseButtonText : styles.respondingButtonText}>{strings.RESPONSES.DECLINE}</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default EventModal;

const styles = StyleSheet.create({
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
    buttonGroup: {
        flexDirection: "row",
        paddingHorizontal: 10,
    },
    headerButton: {
        padding: 10,
    },
    contentsView: {
        margin: 20,
        marginBottom: 0,
    },
    contentView: {
        flex: 1,
        flexDirection: 'row',
    },
    contentHeader: {
        fontWeight: 'bold',
        width: 140,
    },
    content: {
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
    responseButton: {
        padding: 10,
        borderRadius: 10,
    },
    respondingButtonText: {
        color: themeColor,
    },
    currentResponseButton: {
        backgroundColor: themeColor,
        padding: 10,
        borderRadius: 10,
    },
    currentResponseButtonText: {
        color: 'white',
    },
    response: {
        flexDirection: "row",
    },
    responsesList: {
        borderTopWidth: 1,
        borderTopColor: 'lightgrey',
        margin: 20,
    },
    responsesView: {
        margin: 10,
    },
    responseText: {
        marginLeft: 5,
        marginVertical: 1,
    },
    error: {
        textAlign: 'center',
        color: 'red',
        marginBottom: 10,
    },
});