import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Pressable, View, TextInput, SafeAreaView } from 'react-native';
import fontawesome from '@fortawesome/fontawesome'
import { faQuestionCircle, faCheckCircle } from '@fortawesome/fontawesome-free-regular';

import { themeColor, lightThemeColor } from '../helper/theme';
import { NewEvent } from '../types';
import getStrings from '../locales/translation';
import { AuthContext } from '../App';
import { putEvent } from '../helper/api';

fontawesome.library.add(faQuestionCircle, faCheckCircle);

interface AddEventModalProps {
    setVisible: (visible: boolean) => void;
}

interface TextOptionProps {
    title: string,
    callback?: (option: string) => void | undefined,
}

function TextOption (props: TextOptionProps) {
    const {title, callback} = props;
    
    const [option, setOption] = useState('')

    function updateOption(){
        if (callback != undefined) {
            callback(option)
        }
    }

    return (
        <SafeAreaView style={styles.optionView}>
            <Text style={styles.inputTitle}>{title}</Text>
            <TextInput
                style={styles.input}
                onChangeText={setOption}
                onEndEditing={updateOption}
                onSubmitEditing={updateOption}
                value={option}
            ></TextInput>
        </SafeAreaView>
    )
}

TextOption.defaultProps = {
    initialValue: '',
    callback: undefined,
    isEditable: true,
    isHiddenField: false,
    textContentType: "none"
}

function addEvent(token: string, event: NewEvent,) {
    if (event) {
        putEvent(token, event)
    }
}

const AddEventModal = (props: AddEventModalProps) => {
    const {setVisible} = props;
    const auth = React.useContext(AuthContext);

    const strings = getStrings(auth.user?.language ? auth.user.language : 'de');

    const closeModal = () => {
        setVisible(false);
    };

    const [newEvent, setNewEvent] = useState<NewEvent>();

    return (
        <View style={styles.modalView}>
            <View style={styles.headerView}>
                <Text style={styles.header}>{strings.ADD_EVENT}</Text>
                <Pressable style={styles.closeButton} onPress={closeModal}>
                    <Text>X</Text>
                </Pressable>
            </View>
            <View style={styles.contentView}>
                <TextOption title={strings.TITLE} callback={(title) => setNewEvent({...newEvent, title: title})} />
                <TextOption title={strings.DESCRIPTION} callback={(description) => setNewEvent({...newEvent, description: description})} />
                <TextOption title={strings.START_TIME} callback={(start_time) => setNewEvent({...newEvent, start_time: start_time})} />
                <TextOption title={strings.END_TIME} callback={(end_time) => setNewEvent({...newEvent, end_time: end_time})} />
                <TextOption title={strings.INVITEES} callback={(invitees) => setNewEvent({...newEvent, invitees: invitees.split(',')})} />
            </View>
            <View style={styles.buttonView}>
                <Pressable style={styles.button} onPress={() => addEvent(auth.token, newEvent)}>
                    <Text style={styles.buttonText}>{strings.SAVE}</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default AddEventModal;

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
    buttonView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingBottom: 10,
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
});