import React from 'react';
import { Modal, View, Pressable, Text, StyleSheet } from 'react-native';
import { lightThemeColor, themeColor } from '../helper/theme';
import getStrings from '../locales/translation';
import { AuthContext } from '../App';

interface AskAllOrOnceModalProps {
    title: string;
    isModalVisible: boolean;
    setModalVisible: (boolean) => void;
    saveOnceCallback: () => void;
    saveAllCallback: () => void;
}

const AskAllOrOnceModal = (props: AskAllOrOnceModalProps) => {
    const {title, isModalVisible, setModalVisible, saveOnceCallback, saveAllCallback} = props

    const auth = React.useContext(AuthContext);
    const strings = getStrings(auth.user?.language ? auth.user.language : 'de');


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
                setModalVisible(false);
            }}
        >
            <View style={styles.modalView}>
                <View style={styles.headerView}>
                    <Text style={styles.header}>{title}</Text>
                </View>
                <View style={styles.buttonView}>
                    <Pressable style={styles.button} onPress={saveAllCallback}>
                        <View>
                            <Text style={styles.buttonText}>{strings.ALL_ONE_ALL}</Text>
                        </View>
                    </Pressable>
                    <Pressable style={styles.button} onPress={saveOnceCallback}>
                        <View>
                            <Text style={styles.buttonText}>{strings.ALL_ONE_ONE}</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
}


const styles = StyleSheet.create({
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
        elevation: 5,
        width: 320,
        alignContent: 'center',
        alignSelf: 'center',
    },
    headerView: {
        backgroundColor: lightThemeColor,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: "row",
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: "center",
    },
    buttonView: {
        flexDirection: "row",
    },
    button: {
        margin: 20,
        borderRadius: 10,
        padding: 10,
        flexGrow: 1,
        backgroundColor: themeColor,
    },
    buttonText: {
        color: 'white',
    }
})

export default AskAllOrOnceModal;