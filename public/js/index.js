import { Game } from './game.js';

const socket = io('https://connect4-halc.herokuapp.com/');

const game = new Game(socket);

socket.on('connected-client', function (data) {
    game.setPlayer(data.name);

    data.player1Moves.forEach(({ rowIndex, columnIndex, player }) => {
        game.paintColumn(rowIndex, columnIndex, player);
    });

    data.player2Moves.forEach(({ rowIndex, columnIndex, player }) => {
        game.paintColumn(rowIndex, columnIndex, player);
    });

    const numberOfMoves = data.player1Moves.length + data.player2Moves.length;

    if (numberOfMoves !== 0 && numberOfMoves % 2 === 0) {
        game.setCurrentPlayerMove(1);
    } else {
        game.setCurrentPlayerMove(0);
    }
});

socket.on('moved', ({ rowIndex, columnIndex, player }) => {
    game.paintColumn(rowIndex, columnIndex, player);
});

socket.on('reset', () => {
    game.restart(false);
});

socket.on('current-move', (playerName) => {
    game.setCurrentPlayerMove(playerName);
});
