
import { throwError as observableThrowError, of as observableOf,  Observable, empty as observableEmpty, forkJoin } from 'rxjs';
import { map, mergeMap, flatMap, catchError } from 'rxjs/operators';
import { ajax as observableAjax, AjaxResponse, AjaxError } from 'rxjs/ajax';

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
        const login = observableAjax({'method': 'POST',
                'url': 'https://api.thetvdb.com/login',
                'headers': { 'Content-Type': 'application/json',
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}` },
                'body': { apikey: this.apiKey }
                }).pipe(
                    map((res: AjaxResponse) => {
                        const token: string = res.response['token'];
                        const jwt = this.parseJwt(token); // {exp: 1499300429, id: "TV WatchList", orig_iat: 1499214029}
                        localStorage['TheTvDb_token'] = token;
                        localStorage['TheTvDb_expiry'] = jwt.exp * 1000;
                        return token;
                    }),
                    catchError((error: any) => this.handleError(error))
                );

        const refresh_token = observableAjax({'method': 'GET',
                'url': 'https://api.thetvdb.com/refresh_token',
                'headers': { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${localStorage['TheTvDb_token']}`,
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}` },
                }).pipe(
                    map((res: AjaxResponse) => {
                        const token: string = res.response['token'];
                        const jwt = this.parseJwt(token); // {exp: 1499300429, id: "TV WatchList", orig_iat: 1499214029}
                        localStorage['TheTvDb_token'] = token;
                        localStorage['TheTvDb_expiry'] = jwt.exp * 1000;
                        return token;
                    }),
                    catchError((error: any) => this.handleError(error))
                );

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
                return observableOf(localStorage['TheTvDb_token']);
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
        return observableThrowError(error.message || 'Server Error');
    }

    private hasNextPage(response) {
        return response && response.links && response.links.next;
    }

    getUpdates(fromUnixTimestamp: number): Observable<{[id: string]: number}> { // , toUnixTimestamp: number
        return this.getToken()
        .pipe(
                mergeMap(token => observableAjax({'method': 'GET',
                         'url': `https://api.thetvdb.com/updated/query?fromTime=${fromUnixTimestamp}`,
                         'responseType': 'json',
                         'headers': { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${token}`,
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                             'Accept-Language': 'en' }
                        })
                        .pipe(
                            map((aRes: AjaxResponse) => aRes.response.data),
                            catchError((error: any) => this.handleError(error))
                        )
                ),
                map((updates: {id: string, lastUpdated: number}[]) => {
                    const hash: {[id: string]: number} = {};
                    updates.forEach(element => {
                        hash[element.id] = element.lastUpdated;
                    });
                    return hash;
                })      
        );
    }

    getSeries(series_id: number): Observable<TheTvDbSeries> {
        return this.getToken()
        .pipe(
                mergeMap(token => observableAjax({'method': 'GET',
                         'url': `https://api.thetvdb.com/series/${series_id}`,
                         'responseType': 'json',
                         'headers': { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${token}`,
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                             'Accept-Language': 'en' }
                        })
                        .pipe(
                            map((aRes: AjaxResponse) => aRes.response.data),
                            catchError((error: any) => this.handleError(error))
                        )
                ),       
                map(data => {
                    data.banner = this.imagePrefix + data.banner;
                    return data;
                })
        );
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
        return this.getToken()
        .pipe(
            mergeMap(token => observableAjax({'method': 'GET',
                         'url': url,
                         'responseType': 'json',
                         'headers': { 'Content-Type': 'application/json',
                             'Authorization': `Bearer ${token}`,
                             'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                             'Accept-Language': 'en' }
                         }).pipe(
                            map((res: AjaxResponse) => res.response.data),
                            catchError((error: any) => this.handleError(error))
                         )),
            map(searches => {
                searches.forEach(element => {
                    if(!!element.banner){
                        element.banner = this.imagePrefix + element.banner;
                    }
                });
                return searches;
            })
        );
    }

    getPagedEpisodes(series_id: number, page?: number): Observable<TheTvDbEpisode[]>  {
        let url = `https://api.thetvdb.com/series/${series_id}/episodes`;
        if (page !== null) {
            url += `?page=${page}`;
        } else {
            return observableEmpty();
        } //121361
        return this.getToken()
        .pipe(
            mergeMap(token => observableAjax({'method': 'GET',
                    'url': url,
                    'responseType': 'json',
                    'headers': { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                        'Accept-Language': 'en' }
                    }).pipe(
                        flatMap((res: AjaxResponse) => {
                            if (res.response && res.response.links && res.response.links.next) {
                                console.log('hasNextPage', res.response);
                                return forkJoin(observableOf(res.response.data), 
                                    this.getPagedEpisodes(series_id, res.response.links.next)).pipe(
                                        map(x => {
                                            let combined = x[0].concat(x[1]);
                                            return combined
                                        })  
                                    );
                            }
                            if(!!res.response.data) {
                                return observableOf(res.response.data);
                            }
                              
                            return [];
                        }),
                        catchError((error: any) => this.handleError(error))
            ))
        )
    }

    getEpisodes(series_id: number): Observable<TheTvDbEpisode[]> {
        return this.getPagedEpisodes(series_id, 1);
    }

    getFanart(series_id: number): Observable<TheTvDbImage[]>  {
        return this.getImage(`https://api.thetvdb.com/series/${series_id}/images/query?keyType=fanart`);
    }

    getPoster(series_id: number): Observable<TheTvDbImage[]>  {
        return this.getImage(`https://api.thetvdb.com/series/${series_id}/images/query?keyType=poster`);
    }

    private getImage(url: string){
        return this.getToken().pipe(
            mergeMap(token => observableAjax({'method': 'GET',
                         'url': url,
                         'responseType': 'json',
                         'headers': {'Content-Type': 'application/json',
                                     'Authorization': `Bearer ${token}`,
                                     'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                                     'Accept-Language': 'en'}
                         }).pipe(
                            map((res: AjaxResponse) => res.response.data),
                            catchError((error: any) => this.handleError(error))
                         )
            ),
            map(images => {
                images.forEach(element => {
                    if(!!element.fileName) {
                        element.fileName = this.imagePrefix + element.fileName;
                    }
                    if(!!element.thumbnail) {
                        element.thumbnail = this.imagePrefix + element.thumbnail;
                    }
                });
                return images;
            })
        );
    }

    getBanner(series_id: number): Observable<string>  {
        return this.getToken().pipe(
            mergeMap(token => observableAjax({'method': 'GET',
                         'url': `https://api.thetvdb.com/series/${series_id}/filter?keys=banner`,
                         'responseType': 'json',
                         'headers': {'Content-Type': 'application/json',
                                     'Authorization': `Bearer ${token}`,
                                     'Accept': `application/vnd.thetvdb.${this.ApiVersion}`,
                                     'Accept-Language': 'en'}
                         }).pipe(
                            map((res: AjaxResponse) => res.response.data),
                            catchError((error: any) => this.handleError(error))
                         )
            ),
            map(data => this.imagePrefix + data.banner)
        );
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