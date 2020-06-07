import { Calculation } from './calculation.js';

export class Game {
    container = null;
    grid = null;
    button = null;
    move = 1;
    player = null;
    isGameOver = false;
    calculation = null;
    socket = null;

    constructor(socket) {
        this.container = document.querySelector('.container');
        this.paragraph = document.querySelector('.winner');
        this.calculation = new Calculation();
        this.socket = socket;
        this.createGrid();
    }

    setCurrentPlayerMove(player) {
        const p = document.querySelector('.current-player-move');
        p.textContent = `Player ${player} on the move`;
    }

    setPlayer(player) {
        if (this.player !== null) return;

        this.player = player;
        const h3 = document.querySelector('.player');
        h3.textContent = `Welcome player ${player}`;
    }

    lastEmprtyColumnFn(i) {
        const columns = document.querySelectorAll(`.column[data-col='${i}']`);
        let foundColumn = null;

        columns.forEach((col) => {
            if (col.classList.contains('empty')) {
                foundColumn = col;
            }
        });

        return foundColumn;
    }

    paintColumnHelper(column, player = null) {
        const win = this.calculation.calculate(player !== null ? player : this.player, column);

        if (win !== null) {
            this.isGameOver = true;
            this.paragraph.textContent = `Player ${player !== null ? player : this.player} won !!`;
            this.button = document.createElement('button');
            this.button.textContent = 'Restart game';

            this.button.addEventListener('click', () => {
                this.restart();
            });

            this.container.appendChild(this.button);
            return;
        }

        this.move++;
    }

    paintColumn(rowIndex, columnIndex, player) {
        const column = document.querySelector(
            `.column[data-col='${columnIndex}'][data-row='${rowIndex}']`
        );
        column.classList.remove('empty');
        column.classList.add(`player-${player}`);
        column.setAttribute('data-player', player);

        this.paintColumnHelper(column, player);
    }

    createElement(element, Class) {
        const elm = document.createElement(element);
        elm.classList.add(Class);
        return elm;
    }

    createRows(grid) {
        const rows = [];

        for (let i = 0; i < 6; i++) {
            const row = this.createElement('div', 'row');
            grid.appendChild(row);
            rows.push(row);
        }

        return rows;
    }

    createColumns(row, rowIndex) {
        for (let i = 0; i < 7; i++) {
            const column = this.createElement('div', 'column');
            column.classList.add('empty');
            column.setAttribute('data-col', i);
            column.setAttribute('data-row', rowIndex);
            row.appendChild(column);

            column.addEventListener('mouseenter', () => {
                if (this.isGameOver) return;

                const lastEmptyColumn = this.lastEmprtyColumnFn(i);
                lastEmptyColumn.classList.add('next');
            });

            column.addEventListener('mouseleave', () => {
                const lastEmptyColumn = this.lastEmprtyColumnFn(i);
                lastEmptyColumn.classList.remove('next');
            });

            column.addEventListener('click', () => {
                if (
                    this.isGameOver ||
                    (this.player === 0 && this.move % 2 === 0) ||
                    (this.player === 1 && this.move % 2 !== 0)
                ) {
                    return;
                }

                const lastEmptyColumn = this.lastEmprtyColumnFn(i);
                lastEmptyColumn.classList.remove('empty');
                lastEmptyColumn.classList.add(`player-${this.player}`);
                lastEmptyColumn.setAttribute('data-player', this.player);

                const selectedColumnRowIndex = parseInt(
                    lastEmptyColumn.getAttribute('data-row'),
                    10
                );

                this.socket.emit('move', {
                    player: this.player,
                    rowIndex: selectedColumnRowIndex,
                    columnIndex: i,
                });

                this.paintColumnHelper(lastEmptyColumn);
            });
        }
    }

    createGrid() {
        this.grid = this.createElement('div', 'grid');
        const rows = this.createRows(this.grid);

        this.setCurrentPlayerMove(0);

        this.createColumns(rows[0], 0);
        this.createColumns(rows[1], 1);
        this.createColumns(rows[2], 2);
        this.createColumns(rows[3], 3);
        this.createColumns(rows[4], 4);
        this.createColumns(rows[5], 5);

        this.container.appendChild(this.grid);
    }

    restart(withEmit = true) {
        if (withEmit) {
            this.socket.emit('restart', this.player);
        }
        this.container.removeChild(this.grid);
        this.container.removeChild(this.button);
        this.button = null;
        this.paragraph.textContent = '';
        this.move = 1;
        this.isGameOver = false;
        this.createGrid();
    }
}
