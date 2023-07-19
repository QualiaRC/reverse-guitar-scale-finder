const Range = (arg1, arg2) => {
    if(arg1 === undefined || arg1 < 0) return [];
    if(arg2 === undefined || arg2 <= arg1) return [...Array(arg1).keys()];
    return [...Array(arg2 - arg1).keys()].map(n => n + arg1);
}

const frets = 24; // Custom number of frets (24 is a good number)
let activeScale = "None"; // String of the active scale
let previewing = false; // Boolean determining if hovering over a scale to preview it
let sharps = false; // Boolean determining if sharps or flats are being displayed

$(document).ready(function () {
    // Populate the tunings drop-down menu
    for (const tuning in tunings) {
        const $option = $("<option/>").val(tuning).text(tuning);
        $("#tuning-select").append($option);
    }

    // Set up the canvas and draw it
    setupCanvas();
    drawBoard();
});

let ctx; // Canvas context
let width; // Canvas width
let height; // Canvas height
let buttons = []; // List of canvas buttons

// Sets up canvas parameters, and creates buttons
function setupCanvas() {
    // Set canvas and context properties
    const canvas = document.getElementById("fretboard");
    ctx = canvas.getContext("2d");
    width = $("#fretboard").width();
    height = $("#fretboard").height();
    canvas.width = width;
    canvas.height = height;
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    // indices represents the tuning 
    // (Default to standard, or E A D G B E)
    const indices = Range(6).reverse().map(i => letterToNumber[tunings["Standard"][i]]);

    // Create all the buttons for the notes
    Range(6).forEach(y => {

        let index = indices[y]; // Initial note (unfretted)
        Range(frets).forEach(x => {
            const posX = Math.floor(width / frets * x + width / (frets * 2));
            const posY = Math.floor(height / 6 * y + height / 12);
            ctx.beginPath();
            ctx.arc(posX, posY, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Keep track of button properties in the buttons list
            buttons.push({
                x: posX,
                y: posY,
                r: 10 * 2,
                num: index,
                selected: false,
                name: notes[index][0],
                special: false
            });
            
            index = (index + 1) % 12
        });
    });

    // On canvas click, iterate through all buttons and compare their bounds
    // with the mouse click location. Toggles button active/inactive
    canvas.addEventListener('click', function (event) {
        if (activeScale !== "None") return;

        // Get mouse position coordinates relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const [x, y] = [event.clientX - rect.left, event.clientY - rect.top];
        
        for (const b of buttons) {
            // Checks bounds
            if (x >= b.x - b.r && x <= b.x + b.r && y >= b.y - b.r && y <= b.y + b.r) {

                // If selected, deselect it, and decrement the note counter for that button's note
                // As the mouse is still over it, set the color to the hover color.
                // If not selected, select it and increment the note counter, then redraw the board.
                if (b.selected) {
                    b.selected = false;
                    notes[b.num][2]--;

                    ctx.fillStyle = "lightblue";
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, 15, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = "black";
                    ctx.fillText(b.name, b.x, b.y + b.r / 4);
                } else {
                    b.selected = true;
                    notes[b.num][2]++;
                    drawBoard();
                }

                updateTable();
            }
        }
    });

    // When moving the mouse inside the canvas, show the buttons when hovered over
    canvas.addEventListener('mousemove', function (event) {
        if (activeScale !== "None") return;

        // Necessary to remove previously displayed hovered buttons
        drawBoard();

        const rect = canvas.getBoundingClientRect();
        const[x, y] = [event.clientX - rect.left, event.clientY - rect.top];

        for (const b of buttons) {
            if (x >= b.x - b.r && x <= b.x + b.r && y >= b.y - b.r && y <= b.y + b.r && !b.selected) {
                ctx.fillStyle = "lightblue";
                ctx.beginPath();
                ctx.arc(b.x, b.y, 15, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "black";
                ctx.fillText(b.name, b.x, b.y + b.r / 4);
            }
        }
    
    });
}

// Draws things on the canvas (Fretboard, active/hovered buttons, etc)
function drawBoard() {

    // Clean the canvas. Very important.
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.fillStyle = "white";

    // Frets and fret markers
    // x = 0 is the nut
    ctx.beginPath()
    ctx.moveTo(Math.floor(width / frets) - 2, 0);
    ctx.lineTo(Math.floor(width / frets) - 2, height);
    ctx.stroke();
    
    Range(1, frets).forEach(x => {
        ctx.beginPath()
        ctx.moveTo(Math.floor(width / frets * x), 0);
        ctx.lineTo(Math.floor(width / frets * x), height);
        ctx.stroke();

        // Single dot markers
        if ([3, 5, 7, 9, 15, 17, 19, 21].includes(x)) {
            ctx.beginPath();
            ctx.arc(Math.floor(width / frets * (x + 1) - width / (frets * 2)), height / 2, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }

        // Double dot marker
        if (x === 12) {
            ctx.beginPath();
            ctx.arc(Math.floor(width / frets * (x + 1) - width / (frets * 2)), height / 2 - Math.floor(height / 6), 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(Math.floor(width / frets * (x + 1) - width / (frets * 2)), height / 2 + Math.floor(height / 6), 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    });

    // Strings
    Range(6).forEach(y => {
        ctx.beginPath();
        ctx.moveTo(Math.floor(width / frets), Math.floor(height / 6 * y + height / 12));
        ctx.lineTo(width, Math.floor(height / 6 * y + height / 12));
        ctx.stroke();
    });

    // Buttons
    for (const b of buttons) {
        if (!b.selected) continue;

        ctx.fillStyle = b.special ? "orange" : (previewing ? "lightblue" : "lightgreen");

        ctx.beginPath();
        ctx.arc(b.x, b.y, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.fillText(b.name, b.x, b.y + b.r / 4);
    }
}

// Updates the table/list of possible scales
function updateTable() {

    // Get a list of all the selected notes
    const selectedNotes = Range(12).filter(i => notes[i][2] > 0)
    
    // Retrieve a string list of scales that the notes are a subset of
    const possibleScales = getScalesFromNotes(selectedNotes);

    if (!possibleScales) {
        $("#scale-list").addClass("prompt");
        $("#scale-list").text("select three or more distinct notes");
        return;
    }

    // Clear the prompt, empty the table (as you're repopulating it)
    $("#scale-list").removeClass("prompt");
    $("#scale-list").empty();

    // Iterate through all the possible scales, and create a corresponding button
    for (const possibleScale of possibleScales) {
    
        // Create the button, then add it to the table
        const $button = $("<button/>").text(possibleScale).addClass("scale-button");

        // On hover
        // - Update the display to preview scale
        $button.mouseover(function() {
            if ($(this).text() === activeScale) return;

            previewing = true;
            drawPreview($(this).text());
        });

        // On unhover
        // - Refresh the display to go back to its previous state
        $button.mouseleave(() => {
            previewing = false;
            drawBoard();
        });

        // On click
        // - Set as active scale
        // - Update the display to display scale
        $button.click(function() {
            if ($(this).text() === activeScale) return;

            $("#scale-list .selected").each(function () {
                $(this).removeClass("selected");
            });
            $(this).addClass("selected");
            activeScale = $(this).text();
            previewing = false;
            setScale();

            // Disable tuning change
            $("#tuning-select").prop("disabled", true);
        
        });

        // Add button to the list
        $("#scale-list").append($button);
    }
}

// Draws all the notes in the given scale temporarily
function drawPreview(scale) {

    // Split scale into [Note, Scale name]
    const split = {
        note: scale.substring(0, scale.indexOf(' ')),
        name: scale.substring(scale.indexOf(' ') + 1)
    }

    // Get root of scale
    const noteIndex = letterToNumber[split.note];

    // Get all the notes in the scale
    const notesInScale = scales[split.name].slice()
        .map(note => (note + noteIndex) % 12);

    // Deepcopy buttons list
    const buttonsCopy = JSON.stringify(buttons);

    // Highlights all buttons in the previewed scale
    for (const b of buttons) {
        b.selected = false;
        
        for (const note of notesInScale) {
            if (b.num !== note) continue;

            b.selected = true;
            b.special = b.num === noteIndex;
        }
    }
    drawBoard();

    // Buttons list reverted
    buttons = JSON.parse(buttonsCopy);
}

// Clears the board and resets all states
function clearBoard() {
    // Resets the states of all the buttons
    for (const b of buttons) {
        b.selected = false;
        b.special = false;
    }

    // Resets the note counts
    for (const note of notes) {
        note[2] = 0;
    }

    // Resets the active scale and updates everything.
    activeScale = "None";
    drawBoard();
    updateTable();

    // Re-enable tuning selection in case it got disabled
    $("#tuning-select").prop("disabled", false);
}

// Toggles sharps or flats
function setSharp(boolean) {

    // Nothing changed, return
    if (sharps === boolean) return;

    // Rename all the notes. (C# <-> Db)
    sharps = boolean;
    for (const b of buttons) {
        b.name = notes[b.num][sharps ? 1 : 0];
    }

    // Update the display and the table entries
    drawBoard();
    updateTable();
}

// Sets the current tuning of the strings
function setTuning(element) {
    const tuning = element.value;

    // Get the tuning list
    const indices = Range(6).map(i => letterToNumber[tunings[tuning][i]]).reverse();

    // Iterate through all the buttons in order, and rename/renumber them
    let totalIndex = 0
    for (let index of indices) { // 6 strings
        Range(frets).forEach(() => {
            buttons[totalIndex].num = index;
            buttons[totalIndex].name = notes[index][0];

            index = (index + 1) % 12;

            totalIndex++;
        });
    }

    // Recount all note occurrences (there's probably an easier solution)
    for (const note of notes) {
        note[2] = 0;
    }
    for (const b of buttons) {
        if (b.selected) notes[letterToNumber[b.name]][2]++;
    }

    // Update the display and the table entries
    drawBoard();
    updateTable();
}

// Draws all the notes in the activeScale
function setScale() {
    // Split scale into [Note, Scale name]
    const split = {
        note: activeScale.substring(0, activeScale.indexOf(' ')),
        name: activeScale.substring(activeScale.indexOf(' ') + 1)
    }

    // Get root of scale
    const noteIndex = letterToNumber[split.note];

    // Get all the notes in the scale
    const notesInScale = scales[split.name].slice()
        .map(note => (note + noteIndex) % 12);

    // Highlights all buttons in the selected scale
    for (const b of buttons) {
        b.selected = false;
        
        for (const note of notesInScale) {
            if (b.num !== note) continue;

            b.selected = true;
            b.special = b.num === noteIndex;
        }
    }
    drawBoard();
}