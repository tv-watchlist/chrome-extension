import { Injectable } from '@angular/core';
import { Observable,combineLatest } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { TheTvDbAPI, X2J } from '../lib';
import { CommonService } from './common.service';

import { ShowModel, EpisodeModel, ShowEpisodeModel, SearchModel, Days } from '../models';

@Injectable()
export class TheTvDbService {
    private tvDb: TheTvDbAPI;
    constructor(private cmnSvc: CommonService) {
        this.tvDb = new TheTvDbAPI('18CBAC2B8DC75E6F');
    }

    ShowAndEpisodes(series_id: number): Observable<ShowEpisodeModel> {
        return combineLatest(this.tvDb.getSeries(series_id), this.tvDb.getEpisodes(series_id)).pipe(
            map( show_episodelist => {
                console.log('thetvdb show_episodelist',show_episodelist);
                const model = new ShowEpisodeModel();
                const _show = new ShowModel();
                const series = show_episodelist[0];
                const EpList = show_episodelist[1];

                _show.api_source = 'thetvdb';
                _show.show_id = 'thetvdb' + series.id;
                _show.api_id  =  {
                    thetvdb: series.id,
                    imdb: series.imdbId,
                    zap2it: series.zap2itId
                }
                _show.name = series.seriesName;
                _show.premiered = series.firstAired;
                _show.status = series.status;
                _show.genres = series.genre;
                _show.summary = series.overview;
                _show.runtime = Number.parseInt(series.runtime, 10);
                _show.airtime = series.airsTime;
                _show.channel = {
                    name:series.network
                };
                _show.schedule = {
                    days: <Days[]>series.airsDayOfWeek.split(','), 
                    time: series.airsTime 
                };
                _show.image = {
                    banner:[series.banner]
                }
                _show.url = '';

                //series.rating
                let episode_list = EpList.map(Ep => {
                    const episode = new EpisodeModel();
                    episode.show_id = _show.show_id;
                
                    episode.api_source = 'thetvdb';
                    episode.api_id = {thetvdb: Ep.id};
                    episode.name = Ep.episodeName;
                    episode.url = '';
                    episode.airdate = Ep.firstAired;
                    
                    episode.runtime = _show.runtime;
                    episode.season = Ep.airedSeason;
                    episode.number = Ep.airedEpisodeNumber || 0;
                    episode.summary = Ep.overview;
                    episode.counter = Ep.absoluteNumber;
                    episode.local_showtime = !!episode.airdate ? this.cmnSvc.ParseDate(episode.airdate , _show.airtime).getTime() : 0;

                    if(Ep.absoluteNumber !== null) {
                        episode.special = false;
                    }else{
                        episode.special = true;
                    }
                    return episode;
                });
                //Process Episodes
                let unknown_episode_list = episode_list.filter((item) => {
                    return item.local_showtime === 0;
                });
                let known_episode_list = episode_list.filter((item) => {
                    return item.local_showtime > 0;
                });
                known_episode_list.sort(this.cmnSvc.multipleDynamicSort(['local_showtime','season','number']));
                let init_season = known_episode_list.length > 0 ? known_episode_list[0].season : 1 ;
                let clean_episode_list = [];

                //move episode without datetime for same season on end.
                known_episode_list.forEach((ep, idx, episodeArray) => {
                    if(ep.season !== init_season && ep.season !== null) {
                        clean_episode_list = clean_episode_list.concat(
                            unknown_episode_list.filter((item, index) => item.number <= ep.number)
                        );
                        unknown_episode_list = unknown_episode_list.filter((item, index) => item.number > ep.number);
                        
                        init_season = ep.season;
                    }
                    clean_episode_list.push(ep);
                });
                clean_episode_list = clean_episode_list.concat(unknown_episode_list);

                let last_number = 0;
                let normal_counter = 0;
                let special_counter = 0;
                let today = new Date();
                clean_episode_list.forEach((episode, i) => {
                    //set episode_id
                    if(!episode.special) {
                        episode.counter = ++normal_counter;
                        episode.episode_id = _show.show_id + "_" + this.cmnSvc.ZeroPad(episode.season, 4) + "_" +  
                            this.cmnSvc.ZeroPad(episode.number, 4) + "_" +  this.cmnSvc.ZeroPad(episode.counter,4);
                        last_number = episode.number;
                    } else {
                        episode.counter = ++special_counter;
                        episode.episode_id = _show.show_id + "_" + this.cmnSvc.ZeroPad(episode.season, 4) + "_" + 
                        this.cmnSvc.ZeroPad(last_number, 4) + "_S" + this.cmnSvc.ZeroPad(episode.counter, 4);
                    }

                    //set previous_id
                    if(i > 0) {
                        episode.previous_id = clean_episode_list[i - 1].episode_id;
                    }
                });

                clean_episode_list.forEach((episode, i) => {
                    //set next_id
                    if(i <= clean_episode_list.length - 2) {
                        episode.next_id = clean_episode_list[i + 1].episode_id;
                    }

                    //set show previous_episode, next_episode
                    if (!episode.previous_episode && !!episode.local_showtime && 
                        episode.local_showtime >= today) {
                        if (i > 0) {
                            _show.previous_episode = clean_episode_list[i - 1];
                        }

                        _show.next_episode = episode;
                    }
                });

                if (clean_episode_list.length > 0) {
                    _show.first_episode = clean_episode_list[0];
                    _show.last_episode = clean_episode_list[clean_episode_list.length - 1];
                }
                _show.total_episodes = clean_episode_list.length;            
                model.show = _show;
                model.episode_list = clean_episode_list;
                return model;
            })
        );
    }

    searchSeries(name: string): Observable<SearchModel[]> {
        // slug(name, slug.defaults.modes['rfc3986'])
        return this.tvDb.searchSeries({name: name}).pipe(
            map(search_results => {
                var result: SearchModel[] = [];
                search_results.forEach(show => {
                    var model = new SearchModel();
                    model.api_source = 'thetvdb';
                    model.api_id.thetvdb = show.id;
                    model.show_id = 'thetvdb' + show.id;
                    model.channel = {
                        name : show.network,
                        image: null
                    };
                    model.premiered = show.firstAired;
                    model.name = show.seriesName;
                    model.status = show.status;
                    model.summary = show.overview;
                    
                    model.image = {
                        banner:!!show.banner? [show.banner]:[],
                        poster:[]
                    };

                    result.push(model);
                });
                return result;
            })
        );
    }

    getFanarts(series_id: number) {
        return this.tvDb.getFanart(series_id).pipe(map(images => {
            images.sort(this.cmnSvc.multipleDynamicSort(['-ratingsInfo.average', '-ratingsInfo.count']));
            return images;
        }));
    }

    getPosters(series_id: number) {
        return this.tvDb.getPoster(series_id).pipe(map(images => {
            images.sort(this.cmnSvc.multipleDynamicSort(['-ratingsInfo.average', '-ratingsInfo.count']));
            return images;
        }));
    }

    getBanner(series_id: number) {
        return this.tvDb.getBanner(series_id);
    }

    getUpdates(fromTimestamp: Date) {
        return this.tvDb.getUpdates(fromTimestamp.getTime() / 1000).pipe(map(hash => {
            for (const key in hash) {
                if (hash.hasOwnProperty(key)) {
                     hash[key] = hash[key] * 1000;
                }
            }
            return hash;
        }));
    }
}
