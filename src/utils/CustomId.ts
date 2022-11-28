const numbers = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9"
];
const letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z"
];

export function randomNumber() {
    const n = Math.floor(Math.random() * Math.floor(numbers.length - 1)) + 1;

    return numbers[n];
}

export function generateId() {
    return `${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()}`;
}

export function CreateId(Name: string, unique: boolean = true) {
    if (unique) {
        return `Activities_${generateId()}_${Name}`;
    } else {
        return `Activities_${Name}`;
    }
}