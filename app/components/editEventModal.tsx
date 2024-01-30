import React, { useEffect, useState } from 'react';
import { Text, Pressable, View } from 'react-native';
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import { styles } from './addEventModal';
import { Event, UpdateEvent } from '../types';
import getStrings from '../locales/translation';
import { AuthContext } from '../App';
import { putEvent, getUsers, getEvent } from '../helper/api';
import { TextOption, TimeOption } from './editEventOptions';

interface EditEventModalProps {
    eventUUID?: string;
    setVisible: (visible: boolean) => void;
}

const EditEventModal = (props: EditEventModalProps) => {
    const {eventUUID, setVisible} = props;
    const auth = React.useContext(AuthContext);
    const queryClient = useQueryClient()

    const emptyUpdate: UpdateEvent = {
        title: "",
        description: "",
        start_time: "1970-01-01T00:00:00.000Z",
        end_time: "1970-01-01T00:00:00.000Z",
        invitees: [],
        display_color: "",
    }
    const [update, setUpdate] = useState<UpdateEvent>(emptyUpdate);

    async function fetchUsers() {
        // TODO Remove hardcoded filter as soon as team assignment is implemented
        // const users = await getUsers(auth.token);        
        let users = await getUsers(auth.token);
        users = users.filter((user) => user.username != 'admin')
        return {users}
    }
    async function fetchEvent() {
        try {
            const res = await getEvent(auth.token, eventUUID)
            return res
        } catch (error) {
            console.error(error)
        }
    }
    const users_query = useQuery({queryKey: ['users'], queryFn: fetchUsers});
    const event_query = useQuery({queryKey: ['events', eventUUID], queryFn: fetchEvent, enabled: !!eventUUID});

    const strings = getStrings(auth.user?.language ? auth.user.language : 'de');
    const [error, setError] = useState('');

    const closeModal = () => {
        setVisible(false);
    };

    async function saveEvent(token: string, event: Event, update: UpdateEvent) {
        putEvent(token, event.id, update).then((response) => {
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

    useEffect(() => {
        if (event_query.data) {
            setUpdate({
                title: update.title != emptyUpdate.title ? update.title : event_query.data.title,
                description: update.description != emptyUpdate.description ? update.description : event_query.data.description,
                start_time: update.start_time != emptyUpdate.start_time ? update.start_time : event_query.data.start_time,
                end_time: update.end_time != emptyUpdate.end_time ? update.end_time : event_query.data.end_time,
            })
        }
    }, [event_query.data])

    useEffect(() => {
        if (users_query.data) {
            setUpdate({
                ...update,
                invitees: users_query.data.users, // This logic needs to be changed if we switch from all users are invited
            })
        }
    }, [users_query.data])

    useEffect(() => {
        setUpdate(emptyUpdate);
    }, [eventUUID])

    return (
        <View style={styles.modalView}>
            <View style={styles.headerView}>
                <Text style={styles.header}>{strings.EDIT_EVENT}</Text>
                <Pressable style={styles.closeButton} onPress={closeModal}>
                    <FontAwesomeIcon icon={faXmark} />
                </Pressable>
            </View>
            <View style={styles.contentView}>
                <TextOption
                    title={strings.TITLE}
                    value={update.title}
                    callback={(title) => setUpdate({...update, title: title})} />
                <TextOption
                    title={strings.DESCRIPTION}
                    value={update.description}
                    callback={(description) => setUpdate({...update, description: description})} />
                <TimeOption
                    title={strings.START_TIME}
                    value={update.start_time}
                    callback={(start_time) => setUpdate({...update, start_time: start_time})} />
                <TimeOption
                    title={strings.END_TIME}
                    value={update.end_time}
                    callback={(end_time) => setUpdate({...update, end_time: end_time})} />
            </View>
            <Text style={styles.error}>{error}</Text>
            <View style={styles.footerView}>
                <Pressable style={styles.button} onPress={async () => await saveEvent(auth.token, event_query.data, update)}>
                    <Text style={styles.buttonText}>{strings.SAVE}</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default EditEventModal;