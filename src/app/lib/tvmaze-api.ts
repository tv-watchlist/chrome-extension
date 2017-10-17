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

    private handleError(error:  AjaxError) {
        console.error('handleError', error); // log to console instead
        return Observable.throw(error.message || 'Server Error');
    }

    ShowSearch(showName:  string): Observable<TvMazeSearch[]> {
        return Observable.ajax({'method':  'GET',
                'url':  `https: //api.tvmaze.com/search/shows?q=${encodeURIComponent(showName)}`,
                'headers':  { 'Content-Type':  'application/json'}
            })
            .map((res:  AjaxResponse) => {
                return res.response;
            })
            .catch((error:  any) => this.handleError(error));
    }

}

export class TvMazeSearch {
    score:  number;
    show:  {
        id:  number,
        url:  string,
        name: string,
        type: string,
        language: string,
        genres: string[],
        status: string,
        runtime: number,
        premiered: string,
        officialSite: string,
        schedule: {
            time: string,
            days: string[]
        },
        rating: {
            average: number
        },
        weight: number,
        network: {
            id: number,
            name: string,
            country: {
                name: string,
                code: string,
                timezone: string
            }
        },
        webChannel: string,
        externals: {
            tvrage: number,
            thetvdb: number,
            imdb: string
        },
        image: {
            medium: string,
            original: string
        },
        summary: string,
        updated: number,
        _links: {
            self: {href: string},
            previousepisode: {href: string}
        }
    }
}
