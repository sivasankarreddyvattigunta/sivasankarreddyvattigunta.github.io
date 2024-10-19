const totalSeats = 80;
const seatsPerRow = 7;
let seats = JSON.parse(localStorage.getItem('seats')) || Array(totalSeats).fill(true); // true means available, false means booked
let bookedCount = seats.filter(seat => !seat).length;

// Function to render seats
function renderSeats() {
    $('#seats-container').empty();
    seats.forEach((isAvailable, index) => {
        const seatClass = isAvailable ? 'available' : 'booked';
        $('#seats-container').append(`
            <div class="seat ${seatClass}">${index + 1}</div>
        `);
    });
    updateSeatCounts();
}

// Function to find and book seats with the minimum number of rows and nearest distance
function findOptimalSeats(numSeats) {
    let bestSeats = [];
    let bestScore = Number.NEGATIVE_INFINITY; // Start with a very low score
    
    for (let startRow = 0; startRow < Math.ceil(totalSeats / seatsPerRow); startRow++) {
        let possibleSeats = [];
        let rowsUsed = new Set(); // To track how many rows are used
        let rowDistance = 0; // Distance between rows
        let lastRow = -1;

        for (let seatIdx = startRow * seatsPerRow; seatIdx < totalSeats && possibleSeats.length < numSeats; seatIdx++) {
            let currentRow = Math.floor(seatIdx / seatsPerRow);

            if (seats[seatIdx]) {
                possibleSeats.push(seatIdx);

                if (currentRow !== lastRow) {
                    rowsUsed.add(currentRow);
                    if (lastRow !== -1) {
                        rowDistance += Math.abs(currentRow - lastRow);
                    }
                    lastRow = currentRow;
                }
            }

            if (possibleSeats.length === numSeats) {
                let rowCount = rowsUsed.size;
                let score = 10 * (10 - rowCount) - rowDistance; // Higher score for fewer rows and closer rows
                
                if (score > bestScore) {
                    bestScore = score;
                    bestSeats = possibleSeats.slice();
                }
                break;
            }
        }
    }

    return bestSeats;
}

// Main function to handle seat booking
function bookSeats(numSeats) {
    let bookedSeats = findOptimalSeats(numSeats);

    if (bookedSeats.length === numSeats) {
        bookedSeats.forEach(seatIndex => seats[seatIndex] = false);
        bookedCount += numSeats;
        localStorage.setItem('seats', JSON.stringify(seats)); // Save to localStorage
        renderSeats();
        $('#result').html(`Booked seats: ${bookedSeats.map(i => i + 1).join(', ')}`);
    } else {
        $('#result').html("Not enough seats available!");
    }
}

// Function to update the available and booked seats count
function updateSeatCounts() {
    const availableSeats = totalSeats - bookedCount;
    $('#availableSeats').text(availableSeats);
    $('#bookedSeats').text(bookedCount);
}

// Theme toggle function
function toggleTheme() {
    const currentTheme = $('html').attr('data-theme') === 'dark' ? 'light' : 'dark';
    $('html').attr('data-theme', currentTheme);
    $('#themeToggle').text(currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
}
function resetSeats() {
    localStorage.removeItem('seats');
    seats = Array(totalSeats).fill(true);
    bookedCount = 0;
    renderSeats();
    $('#result').html('');
}

$(document).ready(function () {
    renderSeats();

    $('#bookBtn').click(function () {
        const numSeats = parseInt($('#seats').val());
        if (numSeats > 0 && numSeats <= 7) {
            bookSeats(numSeats);
        } else {
            $('#result').html("You are allowed to book maximum 7 seats at a time.");
        }
    });
    $('#resetBtn').click(resetSeats);

    // Toggle theme on button click
    $('#themeToggle').click(toggleTheme);
});