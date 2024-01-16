import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, SafeAreaView } from 'react-native';


interface OptionProps<T> {
    title: string,
    value: T,
    callback: (option: T) => void | undefined,
}

export function TextOption (props: OptionProps<string>) {
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
export function TimeOption (props: OptionProps<string>) {
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


const styles = StyleSheet.create({

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
});