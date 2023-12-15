import english from './en.js'
import german from './de.js'

const strings = {
    'en': english,
    'de': german,
};

function getStrings(key: string) {
    return key in strings ? strings[key] : strings['en'];
}

export default getStrings;