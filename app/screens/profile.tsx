import React, {useEffect, useState} from 'react';
import {
    StyleSheet, Text, View, TextInput, ScrollView, SafeAreaView
} from 'react-native';

import { lightThemeColor, themeColor } from '../components/theme';
import { getMeUser } from '../mocks/user';
import getStrings from '../locales/translation';


const TextOptionView = (
    title: string,
    initialValue: any,
    callback?: (option) => void,
    isEditable: boolean = true,
    isHiddenField: boolean = false,
    textContentType: "none" | "username" | "password" = "none"
) => {
    const [option, setOption] = useState(initialValue)

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
                editable={isEditable}
                secureTextEntry={isHiddenField}
                selectTextOnFocus={isEditable}
                textContentType={textContentType}
                placeholder={isHiddenField ? "••••••••" : undefined}
            ></TextInput>
        </SafeAreaView>
    )
}

const Profile = () => {
    const [user, setUser] = useState(getMeUser())
    const strings = getStrings(user.language);

    useEffect(() => {
        setUser(user)
    }, [user.firstname])

    function updateName(option: string) {
        // TODO implement backend call
        user.firstname = option
    }

    return (
        <ScrollView>
            <View style={styles.headerView}>
                <Text style={styles.header}>{strings.SETTINGS}</Text>
            </View>
            <View style={styles.bodyView}>
                {/*             title, reference, callback, isEditable, isHidden, textContentType */}
                {TextOptionView(strings.USERNAME, user.username, undefined, false, false, "username")}
                {TextOptionView(strings.NAME, user.firstname, updateName, true, false, "none")}
                {TextOptionView(strings.PASSWORD, undefined, undefined, true, true, "password")}
            </View>
        </ScrollView>
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
        width: 85,
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