import React, { useEffect, useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, ScrollView, SafeAreaView
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { lightThemeColor, themeColor } from '../helper/theme';
import getStrings from '../locales/translation';
import { AuthContext } from '../App';
import { getUsersMe, putUser } from '../helper/api';
import { UpdateUser } from '../types';

interface TextOptionProps {
    title: string,
    initialValue: string,
    callback?: (option: string) => void | undefined,
    isEditable?: boolean,
    isHiddenField?: boolean,
    textContentType?: "none" | "username" | "password"
}

function TextOptionView (props: TextOptionProps) {
    const {title, initialValue, callback, isEditable, isHiddenField, textContentType} = props;
    
    const [option, setOption] = useState(initialValue)
    useEffect(() => {
        setOption(initialValue)
    }, [initialValue])

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

TextOptionView.defaultProps = {
    initialValue: '',
    callback: undefined,
    isEditable: true,
    isHiddenField: false,
    textContentType: "none"
}

const Profile = () => {
    const auth = React.useContext(AuthContext);
    const strings = getStrings(auth.user.language);

    const queryClient = useQueryClient()
    async function fetchUser() {
        try {
            const res = await getUsersMe(auth.token)
            return res
        } catch (error) {
            console.error(error)
        }
    }
    async function updateUser(update: UpdateUser) {
        await putUser(auth.token, auth.user.id, update)
        if (update.display_name) {
            auth.user.display_name = update.display_name
        }
    }
    const query = useQuery({ queryKey: ['users', auth.id], queryFn: fetchUser })

    const mutation = useMutation({
        mutationFn: updateUser,
        onSuccess: () => {
          // Invalidate and refetch
          queryClient.invalidateQueries({ queryKey: ['users', auth.id] })
        },
    })

    return (
        <ScrollView>
            <View style={styles.headerView}>
                <Text style={styles.header}>{strings.SETTINGS}</Text>
            </View>
            <View style={styles.bodyView}>
                <TextOptionView
                    title={strings.USERNAME}
                    initialValue={query.data?.username}
                    isEditable={false}
                    textContentType={"username"}
                />
                <TextOptionView
                    title={strings.NAME}
                    initialValue={query.data?.display_name}
                    callback={(option) => mutation.mutate({display_name: option})}
                />
                <TextOptionView
                    title={strings.PASSWORD}
                    callback={(option) => mutation.mutate({password: option})}
                    isHiddenField={true}
                    textContentType={"password"}
                />
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