import words from "./Words.json";

export function getRandomString(length: number) {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += randomChars.charAt(
            Math.floor(Math.random() * randomChars.length),
        );
    }
    return result;
}

export function getRandomSentence(length /* Word Count */: number): string[] {
    const word = [];
    for (let i = 0; i < length; i++) {
        word.push(words[Math.floor(Math.random() * words.length)]);
    }
    return word;
}

export function ShuffleString(param: string) {
    const str = param.split('');
    const length = str.length;
    for (let i = length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = str[i];
        str[i] = str[j];
        str[j] = tmp;
    }
    return str.join('');
}