import {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import fontawesome from '@fortawesome/fontawesome'
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faQuestionCircle, faCheckCircle} from '@fortawesome/fontawesome-free-regular';
import {faCircleXmark} from '@fortawesome/free-regular-svg-icons';


import {successThemeColor, failureThemeColor, lightThemeColor, themeColor} from './theme';
import {Event} from '../types';

fontawesome.library.add(faQuestionCircle, faCheckCircle);

interface EventModalProps {
    event?: Event;
    setVisible: (visible: boolean) => void;
}

const EventModal = (props: EventModalProps) => {
    const {event, setVisible} = props;
    const [currentResponse, setCurrentResponse] = useState('pending');

    const closeModal = () => {
        setVisible(false);
    };

    const updateResponse = (status: string) => {
        // TODO: async API call to update response on backend
        setCurrentResponse(status);
    }

    const renderResponses = () => {
        if (!event || !event.responses) {
            return null;
        }

        return (
            <View style={styles.responsesList}>
                <Text>{event.responses.length} Teilnehmer</Text>
                <View style={styles.responsesView}>
                {event.responses.map((response, index) => {
                    return (
                        <View key={index} style={styles.response}>
                            {response.status == 'accepted' && <FontAwesomeIcon icon={['far', 'check-circle']} color={successThemeColor} />}
                            {response.status == 'pending' && <FontAwesomeIcon icon={['far', 'question-circle']} />}
                            {response.status == 'declined' && <FontAwesomeIcon icon={faCircleXmark} color={failureThemeColor} />}
                            <Text style={styles.responseText}>{response.user.firstname}</Text>
                        </View>
                    );
                })}
                </View>
            </View>
        );
    };

    if (!event) {
        return null;
    }
    return (
        <View style={styles.modalView}>
            <View style={styles.headerView}>
                <Text style={styles.header}>{event.title}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Text>X</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.contentView}>
                <Text>{event.description}</Text>
            </View>
            {renderResponses()}
            <View style={styles.responseView}>
                <TouchableOpacity
                    style={currentResponse == 'accepted' ? styles.currentResponseButton : styles.responseButton}
                    onPress={() => {updateResponse('accepted')}}
                >
                    <Text style={currentResponse == 'accepted' ? styles.currentResponseButtonText : styles.respondingButtonText}>Annehmen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={currentResponse == 'pending' ? styles.currentResponseButton : styles.responseButton}
                    onPress={() => {updateResponse('pending')}}
                >
                    <Text style={currentResponse == 'pending' ? styles.currentResponseButtonText : styles.respondingButtonText}>Vielleicht</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={currentResponse == 'declined' ? styles.currentResponseButton : styles.responseButton}
                    onPress={() => {updateResponse('declined')}}
                >
                    <Text style={currentResponse == 'declined' ? styles.currentResponseButtonText : styles.respondingButtonText}>Ablehnen</Text>
                </TouchableOpacity>
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
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
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
    responseView: {
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