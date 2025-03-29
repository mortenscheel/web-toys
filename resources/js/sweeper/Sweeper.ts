import { shuffle } from '@/helpers';

export class Sweeper {
    tiles: Tile[];
    settings: Settings;
    status: GameStatus = GameStatus.RUNNING;
    constructor(settings: Settings) {
        this.tiles = [];
        this.settings = settings;
        this.initializeTiles();
    }
    getTile(x: number, y: number) {
        return this.tiles[y * this.settings.cols + x]
    }

    private initializeTiles() {
        for (let y = 0; y < this.settings.rows; y++) {
            for (let x = 0; x < this.settings.cols; x++) {
                this.tiles.push({
                    x,
                    y,
                    revealed: false,
                    flagged: false,
                    adjacentMines: 0,
                    isMine: false
                });
            }
        }
        // Mark mines
        const indices = Array(this.tiles.length).fill(0).map((_, index) => index);
        const shuffled = shuffle(indices);
        for (let i = 0; i < this.settings.mines; i++) {
            this.tiles[shuffled[i]].isMine = true;
        }
        // Calculate adjacentMines
        for (let y = 0; y < this.settings.rows; y++) {
            for (let x = 0; x < this.settings.cols; x++) {
                const tile = this.tiles[y * this.settings.cols + x];
                if (tile.isMine) {
                    continue;
                }
                tile.adjacentMines = this.getAdjacentTiles(x, y).filter(t => t.isMine).length;
            }
        }
    }

    private getAdjacentTiles(x: number, y: number) {
        const adjacent = [];
        for (let x2 = x - 1; x2 <= x + 1; x2++) {
            for (let y2 = y - 1; y2 <= y + 1; y2++) {
                if (x2 >= 0 && x2 < this.settings.cols && y2 >= 0 && y2 < this.settings.rows) {
                    adjacent.push(this.getTile(x2, y2));
                }
            }
        }
        return adjacent;
    }

    reveal(tile: Tile, initial: boolean = true) {
        const wasRevealed = tile.revealed;
        if (tile.flagged || this.status !== GameStatus.RUNNING || (!initial && tile.revealed)) {
            return;
        }
        if (tile.isMine) {
            this.status = GameStatus.LOST;
            this.tiles.forEach(t => t.revealed = true);
            return;
        }
        tile.revealed = true;
        if (tile.adjacentMines === 0 || (initial && wasRevealed)) {
            for (const adjacent of this.getAdjacentTiles(tile.x, tile.y)) {
                this.reveal(adjacent, false);
            }
        }
    }

    flag(tile: Tile) {
        if (tile.revealed || this.status !== GameStatus.RUNNING) {
            return;
        }
        tile.flagged = !tile.flagged;
        let won = true;
        for (const tile of this.tiles) {
            if (tile.flagged !== tile.isMine) {
                won = false;
                break;
            }
        }
        if (won) {
            this.status = GameStatus.WON;
            this.tiles.forEach(t => t.revealed = true);
        }
    }
}
export type Settings = {
    cols: number,
    rows: number,
    mines: number,
}
export type Tile = {
    x: number,
    y: number,
    revealed: boolean,
    flagged: boolean,
    adjacentMines: number,
    isMine: boolean,
}
export enum GameStatus {
    RUNNING = 'Running',
    WON = 'Won',
    LOST = 'Lost',
}
