// USEFUL MUSIC DATA/MAPPINGS

// A list of all the notes
// [flat, sharp, count]
const notes = [
    ["C",  "C",  0],
    ["Db", "C#", 0],
    ["D",  "D",  0],
    ["Eb", "D#", 0],
    ["E",  "E",  0],
    ["F",  "F",  0],
    ["Gb", "F#", 0],
    ["G",  "G",  0],
    ["Ab", "G#", 0],
    ["A",  "A",  0],
    ["Bb", "A#", 0],
    ["B",  "B",  0],
]

// Mapping note names to numbers
const letterToNumber = {
    "C": 0,
    "Db": 1, "C#": 1,
    "D": 2,
    "Eb": 3, "D#": 3,
    "E": 4,
    "F": 5,
    "Gb": 6, "F#": 6,
    "G": 7,
    "Ab": 8, "G#": 8,
    "A": 9,
    "Bb": 10, "A#": 10,
    "B": 11
}

// Mapping scale names to interval sets
// (eg. Major is whole whole half whole whole whole)
const scales = {
    "Major" : [0, 2, 4, 5, 7, 9, 11],
    "Major Pentatonic" : [0, 2, 4, 7, 9],

    "Natural Minor" : [0, 2, 3, 5, 7, 8, 10],
    "Harmonic Minor" : [0, 2, 3, 5, 7, 8, 11],
    "Minor Pentatonic" : [0, 3, 5, 7, 10]
}

// Mapping tuning names to lists of notes corresponding with the order of the strings
const tunings = {
    "Standard" : ["E", "A", "D", "G", "B", "E"],
    "Drop D" : ["D", "A", "D", "G", "B", "E"],
    "Drop C#" : ["C#", "G#", "C#", "F#", "A#", "D#"],
    "Drop C" : ["C", "G", "C", "F", "A", "D"],
    "Drop B" : ["B", "Gb", "B", "E", "Ab", "Db"],
    "Drop A" : ["A", "E", "A", "D", "Gb", "B"],
    "DADGAD" : ["D", "A", "D", "G", "A", "D"],
    "Half Step Down" : ["Eb", "Ab", "Db", "Gb", "Bb", "Eb"],
    "Full Step Down" : ["D", "G", "C", "F", "A", "D"],
    "Open C" : ["C", "G", "C", "G", "C", "E"],
    "Open D" : ["D", "A", "D", "F#", "A", "D"],
    "Open E" : ["E", "B", "E", "G#", "B", "E"],
    "Open F" : ["F", "A", "C", "F", "C", "F"],
    "Open G" : ["D", "G", "G", "G", "B", "D"],
    "Open A" : ["E", "A", "E", "A", "C#", "E"],
}

// If 3 or more notes selected, return a list of scales in
// which notesList is a subset
function getScalesFromNotes(notesList) {
    if (notesList.length < 3) return null;
    let ret = [];

    [...Array(12).keys()].forEach(offset => {
        for (const key in scales) {
            const copy = scales[key].slice().map(note => (note + offset) % 12);
            
            if (notesList.every(val => copy.includes(val))) {
                ret.push(notes[offset][sharps ? 1 : 0] + " " + key);
            }
        }
    });
    
    return ret;
}