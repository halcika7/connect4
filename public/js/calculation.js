export class Calculation {
    ROWS = 6;
    COLS = 7;

    getCell(i, j) {
        return document.querySelector(`.column[data-row='${i}'][data-col='${j}']`);
    }

    checkDirection(direction, data) {
        const { player, lastEmptyColumn } = data;
        const rowIndex = parseInt(lastEmptyColumn.getAttribute('data-row'));
        const columnIndex = parseInt(lastEmptyColumn.getAttribute('data-col'));

        let total = 0;
        let i = rowIndex + direction.i;
        let j = columnIndex + direction.j;
        let $next = this.getCell(i, j);

        if (!$next) return null;

        let dataPlayer = parseInt($next.getAttribute('data-player'), 10);

        while (i >= 0 && i < this.ROWS && j >= 0 && j < this.COLS && dataPlayer === player) {
            total++;
            i += direction.i;
            j += direction.j;
            $next = this.getCell(i, j);
            if ($next) {
                dataPlayer = parseInt($next.getAttribute('data-player'), 10);
            }
        }

        return total;
    }

    checkWin(directionA, directionB, data) {
        const total =
            1 + this.checkDirection(directionA, data) + this.checkDirection(directionB, data);
        if (total >= 4) {
            return data.player;
        } else {
            return null;
        }
    }

    calculate(player, lastEmptyColumn) {
        const vertical = this.checkWin(
            { i: -1, j: 0 },
            { i: 1, j: 0 },
            { player, lastEmptyColumn }
        );
        const horizontal = this.checkWin(
            { i: 0, j: -1 },
            { i: 0, j: 1 },
            { player, lastEmptyColumn }
        );
        const diagonalTLtoTR = this.checkWin(
            { i: 1, j: -1 },
            { i: 1, j: 1 },
            { player, lastEmptyColumn }
        );
        const diagonalTLtoBR = this.checkWin(
            { i: 1, j: 1 },
            { i: -1, j: -1 },
            { player, lastEmptyColumn }
        );

        if (
            vertical !== null ||
            horizontal !== null ||
            diagonalTLtoTR !== null ||
            diagonalTLtoBR !== null
        )
            return player;

        return null;
    }
}
