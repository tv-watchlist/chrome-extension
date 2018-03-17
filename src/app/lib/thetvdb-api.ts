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
import 'rxjs/add/observable/from';
import 'rxjs/add/observable/forkJoin';



export class TheTvDbAPI {
    // for examples look below url
    // https://github.com/edwellbrook/node-tvdb/blob/master/index.js
    private imagePrefix = 'https://thetvdb.com/banners/';
    private ApiVersion = 'v2.1.2';
    constructor(private apiKey: string) {}

    private parseJwt (token: string) {
        const base64Url: string = token.split('.')[1];
        const base64 = base64Url.replace('-', '+').replace('_', '/');
        return JSON.parse(window.atob(base64));
    }

    private AddHour(now: Date, counter: number) {
        const d1 = new Date(now);
        const d2 = new Date(d1);
        d2.setHours(d1.getHours() + counter);
        return d2;
    }

    private getToken() {
        const login = Observable.ajax({'method': 'POST',
                'url': 'https://api.thetvdb.com/login',
                'headers': { 'Content-Type': 'application/json',
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}` },
                'body': { apikey: this.apiKey }
            })
            .map((res: AjaxResponse) => {
                const token: string = res.response['token'];
                const jwt = this.parseJwt(token); // {exp: 1499300429, id: "TV WatchList", orig_iat: 1499214029}
                localStorage['TheTvDb_token'] = token;
                localStorage['TheTvDb_expiry'] = jwt.exp * 1000;
                return token;
            })
            .catch((error: any) => this.handleError(error));

        const refresh_token = Observable.ajax({'method': 'GET',
                'url': 'https://api.thetvdb.com/refresh_token',
                'headers': { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${localStorage['TheTvDb_token']}`,
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}` },
            })
            .map((res: AjaxResponse) => {
                const token: string = res.response['token'];
                const jwt = this.parseJwt(token); // {exp: 1499300429, id: "TV WatchList", orig_iat: 1499214029}
                localStorage['TheTvDb_token'] = token;
                localStorage['TheTvDb_expiry'] = jwt.exp * 1000;
                return token;
            })
            .catch((error: any) => this.handleError(error));

        const expiry = localStorage['TheTvDb_expiry'];
        if (!!expiry) {
            const expiryDate = new Date(expiry - 0);
            const now = new Date();
            const hrBefore = this.AddHour(new Date(), -1);
            if (now > expiryDate) {
                // call login
                return login;
            } else if (hrBefore >= expiryDate) {
                // call refresh before 1 hr expiry
                return refresh_token;
            } else {
                // return saved token
                return Observable.of(localStorage['TheTvDb_token']);
            }
        } else {
            return login;
        }
    }

    private handleError(error: AjaxError) {
        console.error('handleError', error); // log to console instead
        if (error.status === 401) {
            localStorage.removeItem('TheTvDb_token');
            localStorage.removeItem('TheTvDb_expiry');
        }
        return Observable.throw(error.message || 'Server Error');
    }

    private hasNextPage(response) {
        return response && response.links && response.links.next;
    }

    getUpdates(fromUnixTimestamp: number): Observable<{[id: string]: number}> { // , toUnixTimestamp: number
        const ob = this.getToken().mergeMap(token => Observable.ajax({'method': 'GET',
                         'url': `https://api.thetvdb.com/updated/query?fromTime=${fromUnixTimestamp}`,
                         'responseType': 'json',
                         'headers': { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${token}`,
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                             'Accept-Language': 'en' }
                         }))
                         .map((aRes: AjaxResponse) => aRes.response.data)
                         .catch((error: any) => this.handleError(error));

        return ob.map((updates: {id: string, lastUpdated: number}[]) => {
            const hash: {[id: string]: number} = {};
            updates.forEach(element => {
                hash[element.id] = element.lastUpdated;
            });
            return hash;
        });
    }

    getSeries(series_id: number): Observable<TheTvDbSeries> {
        const ob = this.getToken().mergeMap(token => Observable.ajax({'method': 'GET',
                         'url': `https://api.thetvdb.com/series/${series_id}`,
                         'responseType': 'json',
                         'headers': { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${token}`,
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                             'Accept-Language': 'en' }
                         }))
                         .map((aRes: AjaxResponse) => aRes.response.data)
                         .catch((error: any) => this.handleError(error));
        return ob.map(data => {
            data.banner = this.imagePrefix + data.banner;
            return data;
        });
    }

    searchSeries(query: {name?: string, imdbId?: string, zap2itId?: string}): Observable<TheTvDbSearch[]> {
        let url = 'https://api.thetvdb.com/search/series?';
        let concat = ''
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                url += `${concat}${key}=${encodeURIComponent(query[key])}`;
                concat = '&';
            }
        }
        const ob: Observable<TheTvDbSearch[]> = this.getToken().mergeMap(token => Observable.ajax({'method': 'GET',
                         'url': url,
                         'responseType': 'json',
                         'headers': { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${token}`,
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                             'Accept-Language': 'en' }
                         }))
                         .map((res: AjaxResponse) => res.response.data)
                         .catch((error: any) => this.handleError(error));

        return ob.map(searches => {
            searches.forEach(element => {
                if(!!element.banner){
                    element.banner = this.imagePrefix + element.banner;
                }
            });
            return searches;
        });
    }

    getPagedEpisodes(series_id: number, page?: number): Observable<TheTvDbEpisode[]>  {
        let url = `https://api.thetvdb.com/series/${series_id}/episodes`;
        if (page !== null) {
            url += `?page=${page}`;
        } else {
            return Observable.empty();
        } //121361
        return this.getToken().mergeMap(token => Observable.ajax({
            'method': 'GET',
            'url': url,
            'responseType': 'json',
            'headers': { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                'Accept-Language': 'en' }
            }))
            .flatMap((res: AjaxResponse) => {
                if (res.response && res.response.links && res.response.links.next) {
                    console.log('hasNextPage', res.response);
                    return Observable.forkJoin(Observable.of(res.response.data), 
                                            this.getPagedEpisodes(series_id, res.response.links.next)).map(x => {
                        let combined = x[0].concat(x[1]);
                        return combined
                    });
                }
                if(!!res.response.data) {
                    return Observable.of(res.response.data);
                }
                  
                return [];
            })
            .catch((error: any) => this.handleError(error));
    }

    getEpisodes(series_id: number): Observable<TheTvDbEpisode[]> {
        return this.getPagedEpisodes(series_id, 1);
    }

    getFanart(series_id: number): Observable<TheTvDbImage[]>  {
        const ob: Observable<TheTvDbImage[]> = this.getToken().mergeMap(token => Observable.ajax({'method': 'GET',
                         'url': `https://api.thetvdb.com/series/${series_id}/images/query?keyType=fanart`,
                         'responseType': 'json',
                         'headers': {'Content-Type': 'application/json',
                                     'Authorization': `Bearer ${token}`,
                                     'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                                     'Accept-Language': 'en'}
                         }))
                         .map((res: AjaxResponse) => res.response.data)
                         .catch((error: any) => this.handleError(error));
        return ob.map(images => {
            images.forEach(element => {
                if(!!element.fileName) {
                    element.fileName = this.imagePrefix + element.fileName;
                }
                if(!!element.thumbnail) {
                    element.thumbnail = this.imagePrefix + element.thumbnail;
                }
            });
            return images;
        });
    }

    getPoster(series_id: number): Observable<TheTvDbImage[]>  {
        const ob = this.getToken().mergeMap(token => Observable.ajax({'method': 'GET',
                         'url': `https://api.thetvdb.com/series/${series_id}/images/query?keyType=poster`,
                         'responseType': 'json',
                         'headers': {'Content-Type': 'application/json',
                                     'Authorization': `Bearer ${token}`,
                                     'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                                     'Accept-Language': 'en'}
                         }))
                         .map((res: AjaxResponse) => res.response.data)
                         .catch((error: any) => this.handleError(error));

        return ob.map(images => {
            images.forEach(element => {
                if(!!element.fileName) {
                    element.fileName = this.imagePrefix + element.fileName;
                }
                if(!!element.thumbnail) {
                    element.thumbnail = this.imagePrefix + element.thumbnail;
                }
            });
            return images;
        });
    }

    getBanner(series_id: number): Observable<string>  {
        const ob = this.getToken().mergeMap(token => Observable.ajax({'method': 'GET',
                         'url': `https://api.thetvdb.com/series/${series_id}/filter?keys=banner`,
                         'responseType': 'json',
                         'headers': {'Content-Type': 'application/json',
                                     'Authorization': `Bearer ${token}`,
                                     'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                                     'Accept-Language': 'en'}
                         }))
                         .map((res: AjaxResponse) => res.response.data)
                         .catch((error: any) => this.handleError(error));
        return ob.map(data => this.imagePrefix + data.banner);
    }
}

export interface TheTvDbSeries {
    added: string;
    airsDayOfWeek: string;
    airsTime: string;
    aliases: string[];
    banner: string;
    firstAired: string;
    genre: string[];
    id: number;
    imdbId: string;
    lastUpdated: number;
    network: string;
    networkId: string;
    overview: string;
    rating: string;
    runtime: string;
    seriesId: number;
    seriesName: string;
    siteRating: number;
    siteRatingCount: number;
    status: string;
    zap2itId: string;
}

export interface TheTvDbEpisode {
    absoluteNumber: number;
    airedEpisodeNumber: number;
    airedSeason: number;
    airedSeasonID: number;
    dvdEpisodeNumber: number;
    dvdSeason: number;
    episodeName: string;
    firstAired: string; // date
    id: number;
    language: { episodeName: string, overview: string };
    lastUpdated: number;
    overview: string;
}


export interface TheTvDbImage {
    fileName: string;
    id: number;
    keyType: string;
    languageId: number;
    ratingsInfo: {
    average: number;
    count: number
    }
    resolution: string;
    subKey: string;
    thumbnail: string
}

export interface TheTvDbSearch {
  aliases: string[];
  banner: string;
  firstAired: string;
  id: number;
  network: string;
  overview: string;
  seriesName: string;
  status: string
}