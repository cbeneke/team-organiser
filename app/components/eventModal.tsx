import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import fontawesome from '@fortawesome/fontawesome'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faQuestionCircle, faCheckCircle } from '@fortawesome/fontawesome-free-regular';
import { faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { successThemeColor, failureThemeColor, lightThemeColor, themeColor } from '../helper/theme';
import { Event } from '../types';
import getStrings from '../locales/translation';
import { AuthContext } from '../App';
import { getEvent, putEventResponse } from '../helper/api';

fontawesome.library.add(faQuestionCircle, faCheckCircle);

interface EventModalProps {
    eventUUID?: string;
    setVisible: (visible: boolean) => void;
}

const EventModal = (props: EventModalProps) => {
    const {eventUUID, setVisible} = props;
    const auth = React.useContext(AuthContext);

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
                            {response.status == 'accepted' && <FontAwesomeIcon icon={['far', 'check-circle']} color={successThemeColor} />}
                            {response.status == 'pending' && <FontAwesomeIcon icon={['far', 'question-circle']} />}
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
                <Pressable style={styles.closeButton} onPress={closeModal}>
                    <Text>X</Text>
                </Pressable>
            </View>
            <View style={styles.contentView}>
                <Text>{query.data.description}</Text>
            </View>
            <Responses></Responses>
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
    closeButton: {
        textAlign: "center",
        paddingLeft: 20,
        paddingRight: 20,
    },
    contentView: {
        margin: 20,
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
});