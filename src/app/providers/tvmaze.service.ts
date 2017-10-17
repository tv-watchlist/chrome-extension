import { Injectable } from '@angular/core';

import { TvMaze } from '../lib/tvmaze-api';

@Injectable()
export class TvMazeService {
    tm: TvMaze;
    constructor() {
        this.tm = new TvMaze();
    }

    Search(showName: string) {
        return this.tm.ShowSearch(showName);
    }
}
