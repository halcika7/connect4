const express = require('express');
const path = require('path');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    handlePreflightRequest: (req, res) => {
        const headers = {
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Origin': req.headers.origin, //or the specific origin you want to give access to,
            'Access-Control-Allow-Credentials': true,
        };
        res.writeHead(200, headers);
        res.end();
    },
});

const player1 = { id: null, name: 0 };
const player2 = { id: null, name: 1 };

let player1Moves = [];
let player2Moves = [];

app.get('/', function (_, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use('/static', express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    if (!player1.id) {
        player1.id = socket.id;
    } else if (!player2.id) {
        player2.id = socket.id;
    }

    io.to(player1.id).emit('connected-client', {
        name: player1.name,
        player1Moves,
        player2Moves,
    });

    io.to(player2.id).emit('connected-client', {
        name: player2.name,
        player1Moves,
        player2Moves,
    });

    socket.on('move', (data) => {
        if (data.player === player1.name) {
            player1Moves.push({ ...data });
            io.to(player2.id).emit('moved', data);
            io.emit('current-move', player2.name);
        } else if (data.player === player2.name) {
            player2Moves.push({ ...data });
            io.to(player1.id).emit('moved', data);
            io.emit('current-move', player1.name);
        }
    });

    socket.on('restart', (player) => {
        player1Moves = [];
        player2Moves = [];

        if (player === player1.name) {
            io.to(player2.id).emit('reset');
        } else if (player === player2.name) {
            io.to(player1.id).emit('reset');
        }
    });

    socket.on('disconnect', function () {
        if (player1.id === socket.id) {
            player1.id = null;
        } else if (player2.id === socket.id) {
            player2.id = null;
        }
    });
});

server.listen(5000);
