import React, { useEffect, useState } from 'react';
import { Text, Pressable, View, Modal } from 'react-native';
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import { styles } from './addEventModal';
import { Event, UpdateEvent } from '../types';
import getStrings from '../locales/translation';
import { AuthContext } from '../App';
import { putEvent, getUsers, getEvent } from '../helper/api';
import { TextOption, TimeOption } from './editEventOptions';
import AskAllOrOnceModal from './askAllOrOnceModal'

interface EditEventModalProps {
    eventUUID?: string;
    setVisible: (visible: boolean) => void;
}

const EditEventModal = (props: EditEventModalProps) => {
    const {eventUUID, setVisible} = props;
    const auth = React.useContext(AuthContext);
    const queryClient = useQueryClient()

    const emptyUpdate: UpdateEvent = {
        title: undefined,
        description: undefined,
        start_time: undefined,
        end_time: undefined,
        invitees: [],
        update_all: false,
    }
    const [update, setUpdate] = useState<UpdateEvent>(emptyUpdate);
    const [isRecurring, setIsRecurring] = useState(false);

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

    async function handleSaveEvent(token: string, event: Event, update: UpdateEvent) {
        // TODO: For now we don't allow editing the dates of recurring events
        if (
            isRecurring
            && update.start_time == event.start_time
            && update.end_time == event.end_time
        ) {
            setAskAllOrOnceModalVisible(true);
        } else {
            await saveEvent(token, event, update)
        }
    }

    async function saveEvent(token: string, event: Event, update: UpdateEvent) {
        const cleanedUpdate = {
            title: update.title != event.title ? update.title : undefined,
            description: update.description != event.description ? update.description : undefined,
            start_time: update.start_time != event.start_time ? update.start_time : undefined,
            end_time: update.end_time != event.end_time ? update.end_time : undefined,
            invitees: update.invitees,
            update_all: update.update_all,
        }

        putEvent(token, event.id, cleanedUpdate).then((response) => {
            // An event ID is only generated for successful event creations
            if (response && (response.id || response[0].id) ) {
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
                update_all: update.update_all,
            })
            setIsRecurring(event_query.data.series_id != null)
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
        setUpdate(emptyUpdate)
        setIsRecurring(false)
    }, [eventUUID])

    const [askAllOrOnceModalVisible, setAskAllOrOnceModalVisible] = useState(false);

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
                <Pressable style={styles.button} onPress={async () => await handleSaveEvent(auth.token, event_query.data, update)}>
                    <Text style={styles.buttonText}>{strings.SAVE}</Text>
                </Pressable>
            </View>
            <AskAllOrOnceModal
                title={strings.ASK_ALL_ONE_SAVE}
                isModalVisible={askAllOrOnceModalVisible}
                setModalVisible={setAskAllOrOnceModalVisible}
                saveOnceCallback={() => {
                    setAskAllOrOnceModalVisible(false);
                    saveEvent(auth.token, event_query.data, update)
                }}
                saveAllCallback={() => {
                    setAskAllOrOnceModalVisible(false);
                    update.update_all = true;
                    saveEvent(auth.token, event_query.data, update)
                }}
            />
        </View>
    );
}

export default EditEventModal;