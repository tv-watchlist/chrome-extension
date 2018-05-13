import { Observable } from 'rxjs/Observable';
import { AjaxResponse, AjaxError } from 'rxjs/observable/dom/AjaxObservable';
import 'rxjs/add/observable/dom/ajax';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/concat';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/empty';

export class TvMaze {
    constructor() {

    }

    private handleError(target: string, error: AjaxError) {
        console.error(`${target} failed!`, error); // log to console instead
        return Observable.throw(error.message || 'Server Error');
    }

    ShowSearch(showName: string): Observable<TvMazeSearch[]> {
        return Observable.ajax({
            method: 'GET',
            url: `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(showName)}`,
            headers: { 'Content-Type': 'application/json' }
        })
        .map((res: AjaxResponse) => {
            return res.response;
        })
        .catch((error: any) => this.handleError('tvmaze.ShowSearch', error));
    }

    LookupByTheTvdb(thetvdb_id): Observable<TvMazeShow> {
        return Observable.ajax({
            method: 'GET',
            url: `https://api.tvmaze.com/lookup/shows?thetvdb=${thetvdb_id}`,
            headers: { 'Content-Type': 'application/json' }
        })
        .map((res: AjaxResponse) => {
            return res.response;
        })
        .catch((error: any) => this.handleError('tvmaze.LookupByThetvdb', error));
    }

    getShow(tvmaze_id): Observable<TvMazeShow> {
        let shows: Observable<TvMazeShow> = Observable.ajax({
            method: 'GET',
            url: `http://api.tvmaze.com/shows/${tvmaze_id}`,
            headers: { 'Content-Type': 'application/json' }
        })
        .map((res: AjaxResponse) => {
            return res.response;
        })
        .catch((error: any) => this.handleError('tvmaze.ShowAndEpisode shows', error));
        return shows;
    }

    getEpisodes(tvmaze_id): Observable<TvMazeEpisode[]> {
        let epsisodes: Observable<TvMazeEpisode[]> = Observable.ajax({
            method: 'GET',
            url: `http://api.tvmaze.com/shows/${tvmaze_id}/episodes?specials=1`,
            headers: { 'Content-Type': 'application/json' }
        })
        .map((res: AjaxResponse) => {
            return res.response;
        })
        .catch((error: any) => this.handleError('tvmaze.ShowAndEpisode episodes', error));
        
        return epsisodes;
    }

    getUpdate(): Observable<{[Id: string]: number}>{
        return Observable.ajax({
            method: 'GET',
            url: `http://api.tvmaze.com/updates/shows`,
            headers: { 'Content-Type': 'application/json' }
        })
        .map((res: AjaxResponse) => {
            return res.response;
        })
        .catch((error: any) => this.handleError('tvmaze.Update', error));
    }
}

export interface TvMazeSearch {
    score: number;
    show: TvMazeShow;
}

export interface TvMazeShow { 
    id: number;
    url: string;
    name: string;
    type: string;
    language: string;
    genres: string[];
    status: string;
    runtime: number;
    premiered: string;
    officialSite: string;
    schedule: {
        time: string,
        days: string[]
    };
    rating: {
        average: number
    };
    weight: number;
    network: {
        id: number,
        name: string,
        country: {
            name: string,
            code: string,
            timezone: string
        }
    };
    webChannel: {
        id: number,
        name: string,
        country: {
            name: string,
            code: string,
            timezone: string
        }
    };
    externals: {
        tvrage: number,
        thetvdb: number,
        imdb: string
    };
    image: {
        medium: string,
        original: string
    };
    summary: string;
    updated: number;
    _links: {
        self: { href: string },
        previousepisode: { href: string }
    } 
}

export interface TvMazeEpisode {
    id: number;
    url: string;
    name: string;
    season: number;
    number: number;

    /**
     * 2013-06-24
     */
    airdate: string;

    /**
     * 22:00
     */
    airtime: string;

    /**
     * 2013-06-25T02:00:00+00:00
     */
    airstamp: string;
    runtime: number;
    image: {
        medium: string,
        original: string
    };
    summary: string;
    _links: {
        self:{
            href: string
        }
    }
}
