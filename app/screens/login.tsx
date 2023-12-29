import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { themeColor } from '../helper/theme';
import getStrings from '../locales/translation';

import { AuthContext, AuthDispatchContext } from '../App';
import { handleSignIn } from '../helper/authContext';

// TOOD: Figure out how to use device settings
const strings = getStrings('de');

function Login({navigation}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const state = React.useContext(AuthContext);
    const dispatch = React.useContext(AuthDispatchContext);

    async function loginHandler() {    
        if (username == '' || password == '') {
            dispatch({ type: 'SIGN_OUT', error: strings.ERRORS.USERNAME_PASSWORD_EMPTY});
        } else {
            handleSignIn(username, password).then((response) => {
                const {user, token} = response;
                if (user && token) {
                    dispatch({ type: 'SIGN_IN', token: token, user: user });
                } else {
                    dispatch({ type: 'SIGN_OUT', error: strings.ERRORS.USERNAME_PASSWORD_WRONG});
                }
            }).catch(() => {
                dispatch({ type: 'SIGN_OUT', error: strings.ERRORS.USERNAME_PASSWORD_WRONG});
            });
        }
    }

    return (
        <View>
            <View style={styles.box}>
                <Text style={styles.header}>{strings.LOGIN}</Text>
                <TextInput
                    style={styles.input}
                    placeholder={strings.USERNAME}
                    textContentType='username'
                    value={username}
                    onChangeText={setUsername}
                >
                </TextInput>
                <TextInput
                    style={styles.input}
                    placeholder={strings.PASSWORD}
                    secureTextEntry={true}
                    textContentType='password'
                    value={password}
                    onChangeText={setPassword}
                >
                </TextInput>
                <Pressable
                    style={styles.button}
                    onPress={async () => {await loginHandler()}}
                >
                    <Text style={styles.buttonText}>{strings.LOGIN}</Text>
                </Pressable>
                <Text style={styles.error}>{state.error}</Text>
                {/* TODO: Implement forgot password and register 
                <View style={styles.helperBox}>
                    <Pressable>
                        <Text style={styles.helperText}>{strings.HELPER.FORGOT_PASSWORD}</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => {navigation.navigate('register')}}
                    >
                        <Text style={styles.helperText}>{strings.HELPER.REGISTER}</Text>
                    </Pressable>
                </View> */}
             </View>
        </View>
    )
}

export default Login;

const styles = StyleSheet.create({
    box: {
        flex: 1,
        width: '40%',
        alignSelf: 'center',
        padding: 20,
    },
    header: {
        fontSize: 30,
        textAlign: 'center',
        padding: 20,
    },
    input: {
        margin: 1,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
    },
    button: {
        margin: 1,
        padding: 10,
        borderRadius: 5,
        backgroundColor: themeColor,
    },
    buttonText: {
        textAlign: 'center',
        color: 'white',
    },
    helperBox: {
        margin: 1,
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between',
    },
    helperText: {
        textAlign: 'center',
        fontSize: 10,
        color: themeColor,
    },
    error: {
        color: 'red',
    },
})