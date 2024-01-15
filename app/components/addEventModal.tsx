import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, Pressable, View, TextInput, SafeAreaView } from 'react-native';
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import { themeColor, lightThemeColor } from '../helper/theme';
import { NewEvent } from '../types';
import getStrings from '../locales/translation';
import { AuthContext } from '../App';
import { postEvent, getUsers } from '../helper/api';

interface AddEventModalProps {
    setVisible: (visible: boolean) => void;
}

interface OptionProps<T> {
    title: string,
    value: T,
    callback: (option: T) => void | undefined,
}

function initDate(offsetHours: number) {
    let date = new Date(Date.now())
    date.setMilliseconds(0)
    date.setSeconds(0)
    date.setMinutes(0)
    date.setHours(date.getHours() + offsetHours + 2) // TODO: Make this timezone aware
    return date.toISOString()
}

function TextOption (props: OptionProps<string>) {
    const {title, value, callback} = props;

    const [option, setOption] = useState(value);

    return (
        <SafeAreaView style={styles.optionView}>
            <Text style={styles.inputTitle}>{title}</Text>
            <TextInput
                style={styles.input}
                // TODO This looks hacky, but works for now
                onChangeText={(text) => {setOption(text); callback(text)}}
                value={option}
            ></TextInput>
        </SafeAreaView>
    )
}

// TODO Make this timezone aware
function TimeOption (props: OptionProps<string>) {
    const {title, value, callback} = props

    // Add the offset to the time to display it in local time
    // Substract the offset from the time to store it in UTC
    //const timeZoneOffset = - new Date().getTimezoneOffset() / 60

    const [date, setDate] = useState(new Date(value).toISOString().split('T')[0])

    // time is displayed to the user and needs to be in local time
    let timeDate = new Date(value)
    //timeDate.setHours(new Date(value).getHours() + timeZoneOffset)
    // Slice off ":00.000Z" from the end
    const [time, setTime] = useState(timeDate.toISOString().split('T')[1].slice(0, -8))

    return (
        <SafeAreaView style={styles.optionView}>
            <Text style={styles.inputTitle}>{title}</Text>
            <input style={styles.input} type="date" value={date} onChange={(event) => {
                setDate(event.target.value)
                callback(event.target.value + 'T' + time + 'Z')
            }}></input>
            <input style={styles.input} type="time" value={time} onChange={(event) => {
                setTime(event.target.value)
                // let isoDate = date
                // let isoTime = time
                // TODO consider negative timeZoneOffset .. Berlin has 1 or 2 .. so fine for now
                // const eventHour = parseInt(event.target.value.split(':')[0])
                // if (eventHour > timeZoneOffset) {
                //     // TODO parseInt might return NaN if the user enters a non-numeric value - we use date-picker, so it shouldn't happen in the happy path
                //     isoTime = (eventHour - timeZoneOffset) + ':' + event.target.value.split(':')[1] + ':00.000'
                // } else {
                //     let newDate = new Date(date)
                //     newDate.setDate(newDate.getDate() - 1)
                //     isoDate = newDate.toISOString().split('T')[0]
                // }
                // callback(isoDate + 'T' + isoTime + 'Z')
                callback(date + 'T' + event.target.value + ':00.000Z')

            }}></input>
        </SafeAreaView>
    )
}

// TODO: For now all users will be invited to all events
// function UserSelection (props: OptionProps<string[]>) {
//     const {title, value, callback} = props;

//     const [option, setOption] = useState(value);
//     const [nextUser, setNextUser] = useState('');

//     function addUser(nextUser: string) {
//         setOption([...option, nextUser])
//         setNextUser('')
//         callback([...option, nextUser])
//     }

//     function removeUser(user: string) {
//         setOption(option.filter((value) => value !== user))
//         callback(option.filter((value) => value !== user))
//     }
    
//     const RenderListUser = (props: any) => {
//         const {user} = props
//         return (
//             <View>
//                 <Text>{user}</Text>
//             </View>
//         )
//     }

//     return (
//         <SafeAreaView style={styles.optionView}>
//             <Text style={styles.inputTitle}>{title}</Text>
//             <View style={styles.userSelectionBox}>
//                     {option.map((user) => {
//                         return (<RenderListUser user={user} />)
//                     })}
//                 <TextInput
//                     style={styles.input}
//                     onChangeText={(text) => {setNextUser(text)}}
//                     onEndEditing={() => addUser(nextUser)}
//                     onSubmitEditing={() => addUser(nextUser)}
//                     value={nextUser}
//                 ></TextInput>
//             </View>
//         </SafeAreaView>
//     )
// }

const AddEventModal = (props: AddEventModalProps) => {
    const {setVisible} = props;
    const auth = React.useContext(AuthContext);
    const queryClient = useQueryClient()

    async function fetchUsers() {
        const users = await getUsers(auth.token);

        return {users}
    }
    const query = useQuery({queryKey: ['users'], queryFn: fetchUsers});

    const newEventProps = {
        title: "",  
        description: "",
        start_time: initDate(0), // Initialise StartDate with upcoming hour
        end_time: initDate(2), // Initialise EndDate with upcoming hour + 2
        invitees: query.data?.users ? query.data.users : [],
        display_color: "",
    }

    const strings = getStrings(auth.user?.language ? auth.user.language : 'de');
    const [error, setError] = useState('');

    const closeModal = () => {
        // Reset View on closing the modal
        setNewEvent(newEventProps);
        setVisible(false);
    };

    async function saveEvent(token: string, event: NewEvent) {
        postEvent(token, event).then((response) => {
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

    const [newEvent, setNewEvent] = useState<NewEvent>(newEventProps);

    useEffect(() => {
        if (query.data) {
            console.log(query.data)
            setNewEvent({...newEvent, invitees: query.data.users})
        }
    }, [query.data])

    return (
        <View style={styles.modalView}>
            <View style={styles.headerView}>
                <Text style={styles.header}>{strings.ADD_EVENT}</Text>
                <Pressable style={styles.closeButton} onPress={closeModal}>
                    <FontAwesomeIcon icon={faXmark} />
                </Pressable>
            </View>
            <View style={styles.contentView}>
                <TextOption
                    title={strings.TITLE}
                    value={newEvent.title}
                    callback={(title) => setNewEvent({...newEvent, title: title})} />
                <TextOption
                    title={strings.DESCRIPTION}
                    value={newEvent.description}
                    callback={(description) => setNewEvent({...newEvent, description: description})} />
                <TimeOption
                    title={strings.START_TIME}
                    value={newEvent.start_time}
                    callback={(start_time) => setNewEvent({...newEvent, start_time: start_time})} />
                <TimeOption
                    title={strings.END_TIME}
                    value={newEvent.end_time}
                    callback={(end_time) => setNewEvent({...newEvent, end_time: end_time})} />
                {/* <UserSelection
                    title={strings.INVITEES}
                    value={newEvent.invitees}
                    callback={(invitees) => setNewEvent({...newEvent, invitees: invitees})} /> */}
            </View>
            <Text style={styles.error}>{error}</Text>
            <View style={styles.footerView}>
                <Pressable style={styles.button} onPress={async () => await saveEvent(auth.token, newEvent)}>
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
    footerView: {
        backgroundColor: lightThemeColor,
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
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
    error: {
        textAlign: 'center',
        color: 'red',
        marginBottom: 10,
    },
    userSelectionBox: {
        flexGrow: 1,
    }
});