// Ugly code alert
// I tried commenting as much as I could

var activeScale = "None"; // String of the active scale
var previewing = false; // Boolean determining if hovering over a scale to preview it
var sharps = false; // Boolean determining if sharps or flats are being displayed
var frets = 24; // Custom number of frets (24 is a good number)

$(document).ready(function () {
    // Populate the tunings drop-down menu
    for (var tuning in tunings) {
        var $option = $("<option/>").val(tuning).text(tuning);
        $("#tuning-select").append($option);
    }

    // Set up the canvas and draw it
    setupCanvas();
    drawBoard();
});

var ctx; // Canvas context
var width; // Canvas width
var height; // Canvas height
var buttons = []; // List of canvas buttons


// Sets up canvas parameters, and creates buttons
function setupCanvas() {
    // Set canvas and context properties
    var canvas = document.getElementById("fretboard");
    ctx = canvas.getContext("2d");
    width = $("#fretboard").width();
    height = $("#fretboard").height();
    canvas.width = width;
    canvas.height = height;
    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    // indeces represents the tuning 
    // (Default to standard, or E A D G B E)
    var indeces = [];
    for (var i = 0; i < 6; i++) {
        indeces[i] = letterToNumber[tunings["Standard"][i]];
    }
    indeces.reverse();

    // Create all the buttons for the notes
    for (var y = 0; y < 6; y++) {
        var index = indeces[y]; // Initial note (unfretted)
        for (var x = 0; x < frets; x++) {
            var posX = Math.floor(width / frets * x + width / (frets * 2));
            var posY = Math.floor(height / 6 * y + height / 12);
            ctx.beginPath();
            ctx.arc(posX, posY, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Keep track of button properties in the buttons list
            var button = {
                x: posX,
                y: posY,
                r: 10 * 2,
                num: index,
                selected: false,
                name: notes[index][0],
                special: false
            }
            buttons.push(button);

            // 12 notes, overflow back to 0
            if (index++ > 10) {
                index = 0;
            }
        }
    }

    // On canvas click, iterate through all buttons and compare their bounds
    // with the mouse click location. Toggles button active/inactive
    canvas.addEventListener('click', function (event) {
        if (activeScale == "None") {

            // Get mouse position coordinates relative to the canvas
            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;

            for (var button in buttons) {

                // For easy reference
                var b = buttons[button];

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

                    // Update the possible scales accordingly
                    updateTable();
                }
            }
        }
    });

    // When moving the mouse inside the canvas, show the buttons when hovered over
    canvas.addEventListener('mousemove', function (event) {
        if (activeScale == "None") {

            // Necessary to remove previously displayed hovered buttons
            drawBoard();

            var rect = canvas.getBoundingClientRect();
            var x = event.clientX - rect.left;
            var y = event.clientY - rect.top;

            for (var button in buttons) {
                var b = buttons[button]
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
    for (var x = 1; x < frets; x++) {
        ctx.beginPath()
        ctx.moveTo(Math.floor(width / frets * x), 0);
        ctx.lineTo(Math.floor(width / frets * x), height);
        ctx.stroke();

        // Single dot markers
        if (x == 3 || x == 5 || x == 7 || x == 9 || x == 15 || x == 17 || x == 19 || x == 21) {
            ctx.beginPath();
            ctx.arc(Math.floor(width / frets * (x + 1) - width / (frets * 2)), height / 2, 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }

        // Double dot marker
        if (x == 12) {
            ctx.beginPath();
            ctx.arc(Math.floor(width / frets * (x + 1) - width / (frets * 2)), height / 2 - Math.floor(height / 6), 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(Math.floor(width / frets * (x + 1) - width / (frets * 2)), height / 2 + Math.floor(height / 6), 10, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        }
    }

    // Strings
    for (var y = 0; y < 6; y++) {
        ctx.beginPath();
        ctx.moveTo(Math.floor(width / frets), Math.floor(height / 6 * y + height / 12));
        ctx.lineTo(width, Math.floor(height / 6 * y + height / 12));
        ctx.stroke();
    }

    // Buttons
    for (var button in buttons) {
        var b = buttons[button];
        if (b.selected) {
            if (b.special) {
                ctx.fillStyle = "orange";
            } else {
                if (previewing) {
                    ctx.fillStyle = "lightblue";
                } else {
                    ctx.fillStyle = "lightgreen";
                }
            }
            ctx.beginPath();
            ctx.arc(b.x, b.y, 15, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = "black";
            ctx.fillText(b.name, b.x, b.y + b.r / 4);
        }
    }
}

// Updates the table/list of possible scales
function updateTable() {

    // Get a list of all the selected notes
    var selectedNotes = [];
    for (var i = 0; i < 12; i++) {
        if (notes[i][2] > 0) {
            selectedNotes.push(i);
        }
    }

    // Retrieve a string list of scales that the notes are a subset of
    var possibleScales = getScalesFromNotes(selectedNotes);

    if (possibleScales != null) {

        // Clear the prompt, empty the table (as you're repopulating it)
        $("#scale-list").removeClass("prompt");
        $("#scale-list").empty();

        // Iterate through all the possible scales, and create a corresponding button
        var index = 0;
        for (var possibleScale in possibleScales) {
            index++;

            // Create the button, then add it to the table
            var $button = $("<button/>").text(possibleScales[possibleScale]).addClass("scale-button");

            // On hover
            // - Update the display to preview scale
            $button.mouseover(function (event) {
                if ($(this).text() != activeScale) {
                    previewing = true;
                    drawPreview($(this).text());
                }
            });

            // On unhover
            // - Refresh the display to go back to its previous state
            $button.mouseleave(function (event) {
                previewing = false;
                drawBoard();
            });

            // On click
            // - Set as active scale
            // - Update the display to display scale
            $button.click(function (event) {
                if ($(this).text() != activeScale) {
                    $("#scale-list .selected").each(function () {
                        $(this).removeClass("selected");
                    });
                    $(this).addClass("selected");
                    activeScale = $(this).text();
                    previewing = false;
                    setScale();

                    // Disable tuning change
                    $("#tuning-select").prop("disabled", true);
                }
            });

            // Add button to the list
            $("#scale-list").append($button);
        }
    } else {
        $("#scale-list").addClass("prompt");
        $("#scale-list").text("select three or more distinct notes");
    }
}

// Draws all the notes in the given scale temporarily
function drawPreview(scale) {

    // Split scale into [Note, Scale name]
    var split = [
        scale.substr(0, scale.indexOf(' ')),
        scale.substr(scale.indexOf(' ') + 1)
    ]

    // Get root of scale
    var noteIndex = letterToNumber[split[0]];

    // Get all the notes in the scale
    var notesInScale = scales[split[1]].slice();
    for (var i = 0; i < notesInScale.length; i++) {
        notesInScale[i] += noteIndex;
        if (notesInScale[i] > 11) {
            notesInScale[i] -= 12;
        }
    }

    // Deepcopy buttons list
    var buttonsCopy = jQuery.extend(true, {}, buttons);

    // Highlights all buttons in the previewed scale
    for (var button in buttons) {
        var b = buttons[button];
        b.selected = false;
        for (var i = 0; i < notesInScale.length; i++) {
            if (b.num == notesInScale[i]) {
                b.selected = true;
                if (b.num == noteIndex) {
                    b.special = true;
                }
            }
        }
    }
    drawBoard();

    // Buttons list reverted
    buttons = jQuery.extend(true, {}, buttonsCopy);
}

// Clears the board and resets all states
function clearBoard() {
    // Resets the states of all the buttons
    for (var button in buttons) {
        var b = buttons[button];
        b.selected = false;
        b.special = false;
    }

    // Resets the note counts
    for (var i = 0; i < notes.length; i++) {
        notes[i][2] = 0;
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
    if (sharps == boolean) {
        return;
    }

    // Rename all the notes. (C# <-> Db)
    sharps = boolean;
    for (var button in buttons) {
        var b = buttons[button];
        b.name = notes[b.num][sharps ? 1 : 0];
    }

    // Update the display and the table entries
    drawBoard();
    updateTable();
}

// Sets the current tuning of the strings
function setTuning(element) {
    var tuning = element.value;

    // Get the tuning list
    var indeces = [];
    for (var i = 0; i < 6; i++) {
        indeces[i] = letterToNumber[tunings[tuning][i]];
    }
    indeces.reverse();

    // Iterate through all the buttons in order, and rename/renumber them
    totalIndex = 0
    for (var y = 0; y < 6; y++) {
        var index = indeces[y];
        for (var x = 0; x < frets; x++) {
            buttons[totalIndex].num = index;
            buttons[totalIndex].name = notes[index][0];

            if (index++ > 10) {
                index = 0;
            }

            totalIndex++;
        }
    }

    // Recount all note occurrences (there's probably an easier solution)
    for (var note in notes) {
        notes[note][2] = 0;
    }
    for (var button in buttons) {
        var b = buttons[button];
        if (b.selected) {
            notes[letterToNumber[b.name]][2]++;
        }
    }

    // Update the display and the table entries
    drawBoard();
    updateTable();
}

// Draws all the notes in the activeScale
function setScale() {
    // Split scale into [Note, Scale name]
    var split = [
        activeScale.substr(0, activeScale.indexOf(' ')),
        activeScale.substr(activeScale.indexOf(' ') + 1)
    ]

    // Get root of scale
    var noteIndex = letterToNumber[split[0]];

    // Get all the notes in the scale
    var notesInScale = scales[split[1]].slice();
    for (var i = 0; i < notesInScale.length; i++) {
        notesInScale[i] += noteIndex;
        if (notesInScale[i] > 11) {
            notesInScale[i] -= 12;
        }
    }

    // Highlights all buttons in the selected scale
    for (var button in buttons) {
        var b = buttons[button];
        b.selected = false;
        for (var i = 0; i < notesInScale.length; i++) {
            if (b.num == notesInScale[i]) {
                b.selected = true;
                if (b.num == noteIndex) {
                    b.special = true;
                }
            }
        }
    }
    drawBoard();
}