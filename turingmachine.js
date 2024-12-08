let tape = [];
let currentState = 'q0';
let currentPosition = 0;
let halted = false;
let transitions = [];
let acceptState = 'q_accept';  // Default accept state
let rejectState = 'q_reject';  // Default reject state
const BLANK_SYMBOL = '_';
function checkInitialization() {
    if (tape.length === 0) {
        alert("Tape is not initialized. Please input a valid tape and initialize the machine.");
        return false;
    }
    if (transitions.length === 0) {
        alert("Transitions are not defined. Please add at least one transition before starting.");
        return false;
    }
    return true;
}


// Create the tape UI
function createTape() {
    const tapeContainer = document.getElementById('tape-container');
    tapeContainer.innerHTML = ''; // Clear previous tape

    // Populate the tape UI
    tape.forEach((symbol, index) => {
        const tapeCell = document.createElement('div');
        tapeCell.classList.add('tape-cell');
        tapeCell.setAttribute('data-index', index);
        tapeCell.innerHTML = symbol || ''; // Display the symbol or empty if undefined
        tapeContainer.appendChild(tapeCell);
    });

    updateTapeHead();
}

function extendTape(direction) {
    if (direction === 'left' && currentPosition < 0) {
        tape.unshift(BLANK_SYMBOL); // Add an empty cell to the left
        currentPosition = 0; // Reset position after extending
    } else if (direction === 'right' && currentPosition >= tape.length) {
        tape.push(BLANK_SYMBOL); // Add an empty cell to the right
    }
    createTape(); // Update the UI
}


// Update tape head position
function updateTapeHead() {
    const tapeCells = document.querySelectorAll('.tape-cell');
    tapeCells.forEach(cell => {
        cell.innerHTML = cell.innerHTML.replace(/<div class="tape-head"><\/div>/, ''); // Remove previous
    });

    if (tapeCells[currentPosition]) {
        const tapeHead = document.createElement('div');
        tapeHead.classList.add('tape-head');
        tapeCells[currentPosition].appendChild(tapeHead); // Attach at the current position
    }
}

// Initialize machine with user input or reinitialize if already initialized
function initializeMachine() {
    const tapeInput = document.getElementById('tape-input').value.trim();

    if (!tapeInput) {
        alert("Please enter a valid tape input.");
        return;
    }

    // Convert the input string into an array of symbols and initialize the tape
    tape = tapeInput.split(''); // This converts the string to an array of characters

    // Fetch transitions
    transitions = getTransitionsFromInput();

    // Set the starting state based on the first transition row
    const firstRow = document.querySelector('#transition-body tr');
    if (firstRow) {
        const startingStateInput = firstRow.querySelector('.state');
        currentState = startingStateInput ? startingStateInput.value.trim() : 'q0';
    } else {
        currentState = 'q0'; // Default to q0 if no rows are present
    }

    currentPosition = 0; // Reset to the first position
    halted = false; // Reset halted state

    // Set accept/reject states from user input
    const userAcceptState = document.getElementById('accept-state').value.trim();
    const userRejectState = document.getElementById('reject-state').value.trim();
    acceptState = userAcceptState || 'q_accept';
    rejectState = userRejectState || 'q_reject';

    createTape(); // Re-render the tape UI
    alert('Tape has been initialized!');
}

document.getElementById('initialize-tape-button').addEventListener('click', initializeMachine);

// Get transitions from user input
function getTransitionsFromInput() {
    const transitionRows = document.querySelectorAll('#transition-body tr');
    const transitionArray = [];

    transitionRows.forEach(row => {
        const state = row.querySelector('.state').value.trim();
        const readSymbol = row.querySelector('.read').value.trim();
        const writeSymbol = row.querySelector('.write').value.trim() || '';  // Treat empty input as epsilon (empty string)
        const move = row.querySelector('.move').value.trim();
        const nextState = row.querySelector('.next-state').value.trim();

        if (state && readSymbol && move && nextState) {
            transitionArray.push({
                state: state,
                read: readSymbol,
                write: writeSymbol,  // Accept any character including letters
                move: move,
                nextState: nextState
            });
        }
    });

    return transitionArray;
}

// Add a new transition row to the user input form
function addTransition() {
    const transitionBody = document.getElementById('transition-body');
    const newRow = document.createElement('tr');

    // Create cells for the new transition row
    newRow.innerHTML = `
        <td><input type="text" class="state" placeholder="q0"></td>
        <td><input type="text" class="read" placeholder="0"></td>
        <td><input type="text" class="write" placeholder="1"></td>
        <td><input type="text" class="move" placeholder="R"></td>
        <td><input type="text" class="next-state" placeholder="q1"></td>
    `;

    // Append the new row to the transition table body
    transitionBody.appendChild(newRow);
}

// Start the Turing machine
function startMachine() {
    if (!checkInitialization()) return; // Ensure machine is properly initialized

    currentPosition = 0; // Ensure tape head starts at the leftmost position
    halted = false;
    runMachine();
}

// Run the machine step by step
function runMachine() {
    if (halted) return;

    setTimeout(() => {
        stepMachine();
        if (!halted) {
            runMachine();
        }
    }, 1000); // Delay of 1 second between steps
}

// Step through the machine (one transition)
function stepMachine() {
    const currentSymbol = tape[currentPosition] || ''; // Default to empty symbol
    const transition = transitions.find(t => t.state === currentState && t.read === currentSymbol);

    if (transition) {
        if (transition.write !== '') {
            tape[currentPosition] = transition.write || BLANK_SYMBOL;
        }
        // If the write symbol is empty (epsilon), we don't need to do anything, just move to the next state

        currentState = transition.nextState; // Move to the next state
        currentPosition += (transition.move === 'R' ? 1 : -1); // Move the tape head

        // Extend tape if needed
        if (currentPosition < 0) {
            extendTape('left');
        } else if (currentPosition >= tape.length) {
            extendTape('right');
        }

        // Halt conditions
        if (currentState === acceptState) {
            halted = true;
            alert("Machine has accepted the input!");
        } else if (currentState === rejectState) {
            halted = true;
            alert("Machine has rejected the input.");
        }

        createTape(); // Update the tape UI
    } else {
        halted = true;
        alert(`No transition found for state '${currentState}' and symbol '${currentSymbol}'. Machine halted.`);
    }
}


// Add custom predefined transitions
function addCustomTransitions() {
    transitions.push({
        state: "q0",
        read: "1",
        write: "X",
        move: "R",
        nextState: "q1"
    });
    transitions.push({
        state: "q_accept",
        read: "",
        write: "accept placeholder",
        move: "R",
        nextState: "done."
    });
}    

// Reset the Turing machine to its initial state
function resetMachine() {
    // Reset the tape, states, and transitions
    tape = []; // Clear the tape
    currentState = 'q0'; // Reset to the initial state
    currentPosition = 0; // Reset tape head position
    halted = false; // Reset halted state
    transitions = []; // Clear transitions

    // Clear the input fields and UI components
    document.getElementById('tape-input').value = ''; // Clear the tape input field
    document.getElementById('accept-state').value = ''; // Clear accept state input
    document.getElementById('reject-state').value = ''; // Clear reject state input
    const transitionBody = document.getElementById('transition-body');
    transitionBody.innerHTML = ''; // Clear the transition table

    // Clear the tape display
    const tapeContainer = document.getElementById('tape-container');
    tapeContainer.innerHTML = ''; // Remove all tape cells

    // Inform the user
    alert("Machine has been fully reset. Please reinitialize the tape and transitions.");
}
// Attach the reset function to the "Reset" button
document.getElementById('reset-button').addEventListener('click', resetMachine);
