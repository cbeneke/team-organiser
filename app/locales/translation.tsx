import english from './en.js'
import german from './de.js'

const strings = {
    'en': english,
    'de': german,
};

// TODO: Can we make this more typesafe?
function getStrings(key: string): any {
    return key in strings ? strings[key] : strings['en'];
}

export default getStrings;