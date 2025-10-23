let board = null;
const game = new Chess();
const statusEl = document.getElementById('status');
const newGameBtn = document.getElementById('newGameBtn');

function onDrop(source, target) {
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for simplicity
    });

    if (move === null) return 'snapback';

    updateStatus();
    window.setTimeout(makeAiMove, 250);
}

async function makeAiMove() {
    statusEl.textContent = 'Gemini is thinking...';

    const moveHistory = game.history({ verbose: true });

    try {
        const response = await fetch('http://localhost:3000/api/get-move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: moveHistory }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const aiMove = data.move;

        game.move(aiMove);
        board.position(game.fen());
        updateStatus();

    } catch (error) {
        console.error("Error fetching AI move:", error);
        statusEl.textContent = "Error! Could not get AI move.";
    }
}

function onSnapEnd() {
    board.position(game.fen());
}

function updateStatus() {
    let status = '';
    const moveColor = game.turn() === 'b' ? 'Black' : 'White';

    if (game.in_checkmate()) {
        status = `Game over, ${moveColor} is in checkmate.`;
    } else if (game.in_draw()) {
        status = 'Game over, drawn position.';
    } else {
        status = `${moveColor} to move.`;
        if (game.in_check()) {
            status += ` ${moveColor} is in check.`;
        }
    }
    statusEl.textContent = status;
}

const config = {
    draggable: true,
    position: 'start',
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};
board = Chessboard('myBoard', config);

newGameBtn.addEventListener('click', () => {
    game.reset();
    board.start();
    updateStatus();
});

updateStatus();