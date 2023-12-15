import React, {useState} from 'react';
import {
    StyleSheet, Text, View, TextInput, SafeAreaView,
    TextInputSubmitEditingEventData, NativeSyntheticEvent, TouchableOpacity
} from 'react-native';

import { lightThemeColor, themeColor } from '../components/theme';
import { getMeUser } from '../mocks/user';
import getStrings from '../locales/translation';

const user = getMeUser()
const strings = getStrings(user.language);

const TextOptionView = (title: string, reference?: any, callback?: () => void, secureView: boolean = false) => {
    const [option, setOption] = useState(reference)

    function updateOption(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
        if (reference != undefined) {
            reference = e.nativeEvent.text
        }
        if (callback != undefined) {
            callback()
        }
    }

    return (
        <SafeAreaView style={styles.optionView}>
            <Text style={styles.inputTitle}>{title}</Text>
            <TextInput
                style={styles.input}
                onChangeText={setOption}
                onSubmitEditing={updateOption}
                value={option}
                secureTextEntry={secureView}
            ></TextInput>
        </SafeAreaView>
    )
}

const EnumOptionView = (title: string, options: any[], reference?: any, callback?: (option) => void, secureView: boolean = false) => {
    const [current, setCurrent] = useState(reference)
    
    function updateOption(option: any) {
        setCurrent(option)
        if (reference != undefined) {
            // TODO: This does not seem to work, check language
            reference = option
        }
        if (callback != undefined) {
            callback(option)
        }
    }

    return (
        <SafeAreaView style={styles.optionView}>
            <Text style={styles.inputTitle}>{title}</Text>
            <View style={styles.optionsView}>
                {options.map((option, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            style={option == current ? styles.currentOption : styles.option}
                            onPress={() => {updateOption(option)}}
                        >
                            <Text
                                style={option == current ? styles.currentOptionText : styles.optionText}
                            >{option}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </SafeAreaView>
    )
}

const Profile = () => {
    return (
        <View>
            <View style={styles.headerView}>
                <Text style={styles.header}>{strings.SETTINGS}</Text>
            </View>
            <View style={styles.bodyView}>
                {TextOptionView(strings.NAME, user.firstname)}
                {TextOptionView(strings.PASSWORD)}
            </View>
        </View>
    )
}

export default Profile;

const styles = StyleSheet.create({
    headerView: {
        backgroundColor: lightThemeColor,
        width: '100%',
        height: 40,
        padding: 10,
    },
    header: {
        color: 'grey',
        textTransform: 'capitalize',
        fontSize: 20,
    },
    bodyView: {
        padding: 10,
    },
    optionView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 1,
    },
    inputTitle: {
        width: 80,
        color: 'grey',
        textTransform: 'capitalize',
    },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        flexGrow: 1,
    },
    optionsView: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        flexGrow: 1,
    },
    option: {
        border: 1,
        borderRadius: 10,
        padding: 10,
    },
    optionText: {},
    currentOption: {
        backgroundColor: themeColor,
        border: 1,
        borderRadius: 10,
        padding: 10,
    },
    currentOptionText: {
        color: 'white',
    },
})